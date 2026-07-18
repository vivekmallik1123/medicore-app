-- =============================================================================
-- MediCore — Supabase Database Schema + Row Level Security
-- Run this entire file in the Supabase SQL Editor (Dashboard → SQL Editor)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------------------------

-- hospitals
-- Stores each hospital that uses MediCore.
-- enabled_modules controls which feature modules a hospital can access.
CREATE TABLE IF NOT EXISTS hospitals (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  address          text,
  contact_number   text,
  enabled_modules  jsonb NOT NULL DEFAULT '["reception","opd","lab","pharmacy","ipd","billing","hr"]'::jsonb,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- staff_profiles
-- One row per staff member. Linked to auth.users via id.
-- Super Admin has hospital_id = NULL.
CREATE TABLE IF NOT EXISTS staff_profiles (
  id                 uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_id        uuid REFERENCES hospitals(id) ON DELETE SET NULL,
  full_name          text NOT NULL,
  email              text NOT NULL,
  role               text NOT NULL CHECK (role IN (
                       'super_admin','hospital_admin','doctor',
                       'receptionist','lab_tech','pharmacist',
                       'billing_staff','ipd_nurse'
                     )),
  module_permissions jsonb,
  is_active          boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- patients
-- Core patient registry. hospital_id is mandatory — every patient
-- belongs to exactly one hospital. RLS ensures cross-hospital isolation.
CREATE TABLE IF NOT EXISTS patients (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id      uuid NOT NULL REFERENCES hospitals(id) ON DELETE RESTRICT,
  patient_type     text CHECK (patient_type IN ('new','returning')),
  full_name        text NOT NULL,
  mobile_number    text NOT NULL,
  date_of_birth    date NOT NULL,
  gender           text,
  address          text,
  symptom_tags     jsonb,   -- array of strings e.g. ["Fever","Headache"]
  referral_source  text,
  is_emergency     boolean NOT NULL DEFAULT false,
  registered_by    uuid REFERENCES staff_profiles(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- audit_logs
-- Immutable append-only log of staff actions.
-- RLS prevents UPDATE and DELETE so logs cannot be tampered with.
CREATE TABLE IF NOT EXISTS audit_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id  uuid REFERENCES hospitals(id) ON DELETE SET NULL,
  staff_id     uuid REFERENCES staff_profiles(id) ON DELETE SET NULL,
  action       text NOT NULL,   -- e.g. "created_patient"
  target_table text,
  target_id    uuid,
  details      jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 2. ENABLE ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

ALTER TABLE hospitals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients      ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs    ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 3. HELPER FUNCTION
-- Returns the hospital_id of the currently authenticated staff member.
-- Used inside RLS policies to avoid repeating the sub-select.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_my_hospital_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT hospital_id FROM staff_profiles WHERE id = auth.uid();
$$;

-- Helper: returns the role of the current user
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM staff_profiles WHERE id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- 4. RLS POLICIES — hospitals
-- ---------------------------------------------------------------------------

-- Super Admin: full access
CREATE POLICY "super_admin_hospitals_all"
  ON hospitals FOR ALL
  USING (get_my_role() = 'super_admin')
  WITH CHECK (get_my_role() = 'super_admin');

-- Hospital staff: can only SELECT their own hospital row
CREATE POLICY "staff_hospitals_select_own"
  ON hospitals FOR SELECT
  USING (
    get_my_role() != 'super_admin'
    AND id = get_my_hospital_id()
  );

-- ---------------------------------------------------------------------------
-- 5. RLS POLICIES — staff_profiles
-- ---------------------------------------------------------------------------

-- Super Admin: full access to all staff rows
CREATE POLICY "super_admin_staff_all"
  ON staff_profiles FOR ALL
  USING (get_my_role() = 'super_admin')
  WITH CHECK (get_my_role() = 'super_admin');

-- Hospital Admin: full access to staff in their own hospital
CREATE POLICY "hospital_admin_staff_own_hospital"
  ON staff_profiles FOR ALL
  USING (
    get_my_role() = 'hospital_admin'
    AND hospital_id = get_my_hospital_id()
  )
  WITH CHECK (
    get_my_role() = 'hospital_admin'
    AND hospital_id = get_my_hospital_id()
  );

-- Regular staff: can SELECT and UPDATE only their own row
CREATE POLICY "staff_select_own_profile"
  ON staff_profiles FOR SELECT
  USING (
    get_my_role() NOT IN ('super_admin','hospital_admin')
    AND id = auth.uid()
  );

CREATE POLICY "staff_update_own_profile"
  ON staff_profiles FOR UPDATE
  USING (
    get_my_role() NOT IN ('super_admin','hospital_admin')
    AND id = auth.uid()
  )
  WITH CHECK (
    get_my_role() NOT IN ('super_admin','hospital_admin')
    AND id = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- 6. RLS POLICIES — patients
-- This is the most critical policy. Hospital A staff must NEVER see
-- Hospital B patients under any circumstance.
-- ---------------------------------------------------------------------------

-- Super Admin: full access
CREATE POLICY "super_admin_patients_all"
  ON patients FOR ALL
  USING (get_my_role() = 'super_admin')
  WITH CHECK (get_my_role() = 'super_admin');

-- All other staff: can only access patients in their own hospital
CREATE POLICY "staff_patients_own_hospital_select"
  ON patients FOR SELECT
  USING (
    get_my_role() != 'super_admin'
    AND hospital_id = get_my_hospital_id()
  );

CREATE POLICY "staff_patients_own_hospital_insert"
  ON patients FOR INSERT
  WITH CHECK (
    get_my_role() != 'super_admin'
    AND hospital_id = get_my_hospital_id()
  );

CREATE POLICY "staff_patients_own_hospital_update"
  ON patients FOR UPDATE
  USING (
    get_my_role() != 'super_admin'
    AND hospital_id = get_my_hospital_id()
  )
  WITH CHECK (
    get_my_role() != 'super_admin'
    AND hospital_id = get_my_hospital_id()
  );

-- ---------------------------------------------------------------------------
-- 7. RLS POLICIES — audit_logs
-- Logs are append-only. No UPDATE or DELETE is permitted for anyone.
-- ---------------------------------------------------------------------------

-- Super Admin: can SELECT all logs
CREATE POLICY "super_admin_audit_select"
  ON audit_logs FOR SELECT
  USING (get_my_role() = 'super_admin');

-- Hospital Admin: can SELECT logs for their own hospital
CREATE POLICY "hospital_admin_audit_select"
  ON audit_logs FOR SELECT
  USING (
    get_my_role() = 'hospital_admin'
    AND hospital_id = get_my_hospital_id()
  );

-- All staff: can INSERT their own audit entries
CREATE POLICY "staff_audit_insert"
  ON audit_logs FOR INSERT
  WITH CHECK (
    staff_id = auth.uid()
    AND hospital_id = get_my_hospital_id()
  );

-- NOTE: No UPDATE or DELETE policies are created for audit_logs.
-- This means no authenticated user can modify or delete log entries.

-- ---------------------------------------------------------------------------
-- 8. MANUAL STEP — Create your Super Admin account
-- ---------------------------------------------------------------------------
-- After running this SQL:
-- 1. Go to Supabase Dashboard → Authentication → Users → "Add user"
-- 2. Create your account with your email + a strong password
-- 3. Copy the UUID shown for that user
-- 4. Run the INSERT below, replacing <YOUR_AUTH_UUID> and <YOUR_HOSPITAL_ID>
--    (if you have no hospital yet, leave hospital_id as NULL for Super Admin)
--
-- INSERT INTO staff_profiles (id, hospital_id, full_name, email, role)
-- VALUES (
--   '<YOUR_AUTH_UUID>',
--   NULL,
--   'Your Full Name',
--   'your@email.com',
--   'super_admin'
-- );
