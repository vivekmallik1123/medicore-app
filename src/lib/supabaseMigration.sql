-- =============================================================================
-- MediCore - Supabase Database Schema + Row Level Security
-- VERSION 2 - includes all CodeRabbit security fixes
-- Run this entire file in the Supabase SQL Editor (Dashboard -> SQL Editor)
-- IF NOT EXISTS / OR REPLACE guards make it safe to re-run without data loss.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. PRIVATE SCHEMA (Fix 3)
-- Helper functions live here so they are NOT reachable via the public
-- PostgREST API surface. Only internal Postgres (RLS policies, triggers)
-- can call them.
-- ---------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS private;

-- ---------------------------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------------------------

-- hospitals
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
-- Fix 7: UNIQUE constraint on (hospital_id, mobile_number) enforces no
-- duplicate mobile numbers within the same hospital at the database level.
-- This is the authoritative enforcement; the app-side check is for UX only.
CREATE TABLE IF NOT EXISTS patients (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id      uuid NOT NULL REFERENCES hospitals(id) ON DELETE RESTRICT,
  patient_type     text CHECK (patient_type IN ('new','returning')),
  full_name        text NOT NULL,
  mobile_number    text NOT NULL,
  date_of_birth    date NOT NULL,
  gender           text,
  address          text,
  symptom_tags     jsonb,
  referral_source  text,
  is_emergency     boolean NOT NULL DEFAULT false,
  registered_by    uuid REFERENCES staff_profiles(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT patients_hospital_mobile_unique UNIQUE (hospital_id, mobile_number)
);

-- audit_logs
-- Immutable append-only log. No UPDATE or DELETE policies are ever created.
CREATE TABLE IF NOT EXISTS audit_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id  uuid REFERENCES hospitals(id) ON DELETE SET NULL,
  staff_id     uuid REFERENCES staff_profiles(id) ON DELETE SET NULL,
  action       text NOT NULL,
  target_table text,
  target_id    uuid,
  details      jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 2. ENABLE ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

ALTER TABLE hospitals      ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients       ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs     ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 3. PRIVATE HELPER FUNCTIONS (Fix 3)
-- These live in the private schema and are NOT callable via the public API.
-- search_path is fixed to prevent search_path injection attacks.
-- EXECUTE is revoked from public and anon so external callers cannot invoke
-- them directly - only internal Postgres (RLS, triggers) can use them.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION private.get_my_hospital_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT hospital_id FROM public.staff_profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION private.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role FROM public.staff_profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION private.get_my_is_active()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT is_active FROM public.staff_profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION private.get_hospital_is_active(p_hospital_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT is_active FROM public.hospitals WHERE id = p_hospital_id;
$$;

-- Revoke EXECUTE from PUBLIC and anon — these functions must NOT be
-- callable via the PostgREST API or by unauthenticated clients.
REVOKE EXECUTE ON FUNCTION private.get_my_hospital_id()          FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.get_my_role()                 FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.get_my_is_active()            FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.get_hospital_is_active(uuid)  FROM PUBLIC, anon;

-- Grant EXECUTE to authenticated only.
-- These functions are called during RLS policy evaluation for logged-in
-- users, who connect as the 'authenticated' role. Without this GRANT,
-- every authenticated query that hits an RLS policy using these helpers
-- fails with "permission denied for function" (403).
-- anon and PUBLIC remain revoked above.
GRANT EXECUTE ON FUNCTION private.get_my_hospital_id()          TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_my_role()                 TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_my_is_active()            TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_hospital_is_active(uuid)  TO authenticated;

-- ---------------------------------------------------------------------------
-- 4. RLS POLICIES - hospitals
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "super_admin_hospitals_all"  ON hospitals;
DROP POLICY IF EXISTS "staff_hospitals_select_own" ON hospitals;

-- Super Admin: full access
CREATE POLICY "super_admin_hospitals_all"
  ON hospitals FOR ALL
  USING  (private.get_my_role() = 'super_admin')
  WITH CHECK (private.get_my_role() = 'super_admin');

-- Hospital staff: SELECT own hospital only, and only if their account is active
-- Fix 2: both the staff account AND the hospital must be active
CREATE POLICY "staff_hospitals_select_own"
  ON hospitals FOR SELECT
  USING (
    private.get_my_role() != 'super_admin'
    AND id = private.get_my_hospital_id()
    AND private.get_my_is_active() = true
    AND is_active = true
  );

-- ---------------------------------------------------------------------------
-- 5. RLS POLICIES - staff_profiles
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "super_admin_staff_all"             ON staff_profiles;
DROP POLICY IF EXISTS "hospital_admin_staff_own_hospital" ON staff_profiles;
DROP POLICY IF EXISTS "staff_select_own_profile"          ON staff_profiles;
DROP POLICY IF EXISTS "staff_update_own_profile"          ON staff_profiles;

-- Super Admin: full access
CREATE POLICY "super_admin_staff_all"
  ON staff_profiles FOR ALL
  USING  (private.get_my_role() = 'super_admin')
  WITH CHECK (private.get_my_role() = 'super_admin');

-- Hospital Admin: SELECT staff in their own hospital
CREATE POLICY "hospital_admin_staff_select"
  ON staff_profiles FOR SELECT
  USING (
    private.get_my_role() = 'hospital_admin'
    AND hospital_id = private.get_my_hospital_id()
    AND private.get_my_is_active() = true
  );

-- Fix 1: Regular staff can SELECT their own row only.
-- They CANNOT UPDATE role, hospital_id, is_active, or module_permissions
-- via direct table access. Those fields are protected by the RPC below.
CREATE POLICY "staff_select_own_profile"
  ON staff_profiles FOR SELECT
  USING (
    private.get_my_role() NOT IN ('super_admin','hospital_admin')
    AND id = auth.uid()
    AND private.get_my_is_active() = true
  );

-- Fix 1: Staff can UPDATE only their own row, and only the safe self-service
-- column (full_name). Authorization fields (role, hospital_id, is_active,
-- module_permissions) must be changed via the update_staff_authorization RPC.
--
-- IMPORTANT: RLS WITH CHECK controls which ROWS can be updated, not which
-- COLUMNS. Without column-level privileges, a crafted UPDATE payload could
-- still set role/hospital_id/is_active/module_permissions directly.
-- We therefore revoke table-level UPDATE from 'authenticated' and grant
-- UPDATE only on the safe column. The update_staff_authorization RPC runs
-- as SECURITY DEFINER and is unaffected by this revoke.
REVOKE UPDATE ON staff_profiles FROM authenticated;
GRANT  UPDATE (full_name) ON staff_profiles TO authenticated;

CREATE POLICY "staff_update_own_safe_fields"
  ON staff_profiles FOR UPDATE
  USING (
    private.get_my_role() NOT IN ('super_admin','hospital_admin')
    AND id = auth.uid()
    AND private.get_my_is_active() = true
  )
  WITH CHECK (
    private.get_my_role() NOT IN ('super_admin','hospital_admin')
    AND id = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- 6. SECURITY DEFINER RPC - update_staff_authorization (Fix 1)
-- The ONLY way to change role, hospital_id, is_active, or
-- module_permissions on a staff_profiles row.
-- Validates server-side that the caller is super_admin or hospital_admin.
-- Regular staff cannot call this successfully.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_staff_authorization(
  p_target_staff_id    uuid,
  p_role               text    DEFAULT NULL,
  p_hospital_id        uuid    DEFAULT NULL,
  p_is_active          boolean DEFAULT NULL,
  p_module_permissions jsonb   DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_role     text;
  v_caller_hospital uuid;
  v_target_hospital uuid;
BEGIN
  -- Identify the caller
  SELECT role, hospital_id
    INTO v_caller_role, v_caller_hospital
    FROM public.staff_profiles
   WHERE id = auth.uid();

  -- Only super_admin and hospital_admin may call this function
  IF v_caller_role NOT IN ('super_admin', 'hospital_admin') THEN
    RAISE EXCEPTION 'Permission denied: only super_admin or hospital_admin can modify authorization fields';
  END IF;

  -- hospital_admin can only modify staff within their own hospital
  IF v_caller_role = 'hospital_admin' THEN
    SELECT hospital_id INTO v_target_hospital
      FROM public.staff_profiles
     WHERE id = p_target_staff_id;

    IF v_target_hospital IS DISTINCT FROM v_caller_hospital THEN
      RAISE EXCEPTION 'Permission denied: hospital_admin can only modify staff in their own hospital';
    END IF;

    -- hospital_admin cannot promote anyone to super_admin
    IF p_role = 'super_admin' THEN
      RAISE EXCEPTION 'Permission denied: hospital_admin cannot assign the super_admin role';
    END IF;
  END IF;

  -- Apply only the fields that were explicitly passed (non-NULL)
  UPDATE public.staff_profiles
     SET role               = COALESCE(p_role,               role),
         hospital_id        = COALESCE(p_hospital_id,        hospital_id),
         is_active          = COALESCE(p_is_active,          is_active),
         module_permissions = COALESCE(p_module_permissions, module_permissions)
   WHERE id = p_target_staff_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- 7. RLS POLICIES - patients (Fix 2: require is_active checks)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "super_admin_patients_all"           ON patients;
DROP POLICY IF EXISTS "staff_patients_own_hospital_select" ON patients;
DROP POLICY IF EXISTS "staff_patients_own_hospital_insert" ON patients;
DROP POLICY IF EXISTS "staff_patients_own_hospital_update" ON patients;

-- Super Admin: full access
CREATE POLICY "super_admin_patients_all"
  ON patients FOR ALL
  USING  (private.get_my_role() = 'super_admin')
  WITH CHECK (private.get_my_role() = 'super_admin');

-- Staff: own hospital only; both the staff account AND hospital must be active
CREATE POLICY "staff_patients_own_hospital_select"
  ON patients FOR SELECT
  USING (
    private.get_my_role() != 'super_admin'
    AND hospital_id = private.get_my_hospital_id()
    AND private.get_my_is_active() = true
    AND private.get_hospital_is_active(hospital_id) = true
  );

CREATE POLICY "staff_patients_own_hospital_insert"
  ON patients FOR INSERT
  WITH CHECK (
    private.get_my_role() != 'super_admin'
    AND hospital_id = private.get_my_hospital_id()
    AND private.get_my_is_active() = true
    AND private.get_hospital_is_active(hospital_id) = true
  );

CREATE POLICY "staff_patients_own_hospital_update"
  ON patients FOR UPDATE
  USING (
    private.get_my_role() != 'super_admin'
    AND hospital_id = private.get_my_hospital_id()
    AND private.get_my_is_active() = true
    AND private.get_hospital_is_active(hospital_id) = true
  )
  WITH CHECK (
    private.get_my_role() != 'super_admin'
    AND hospital_id = private.get_my_hospital_id()
    AND private.get_my_is_active() = true
    AND private.get_hospital_is_active(hospital_id) = true
  );

-- ---------------------------------------------------------------------------
-- 8. RLS POLICIES - audit_logs
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "super_admin_audit_select"    ON audit_logs;
DROP POLICY IF EXISTS "hospital_admin_audit_select" ON audit_logs;
DROP POLICY IF EXISTS "staff_audit_insert"          ON audit_logs;

CREATE POLICY "super_admin_audit_select"
  ON audit_logs FOR SELECT
  USING (private.get_my_role() = 'super_admin');

CREATE POLICY "hospital_admin_audit_select"
  ON audit_logs FOR SELECT
  USING (
    private.get_my_role() = 'hospital_admin'
    AND hospital_id = private.get_my_hospital_id()
    AND private.get_my_is_active() = true
  );

-- NOTE: audit_logs INSERT is now handled exclusively by the Postgres trigger
-- below (Fix 8). No direct INSERT policy is needed from the client.
-- No UPDATE or DELETE policies exist - logs are permanently immutable.

-- ---------------------------------------------------------------------------
-- 9. AUDIT LOG TRIGGER (Fix 8)
-- Fires AFTER INSERT and AFTER UPDATE on patients.
-- Writes the audit_logs row in the SAME transaction as the patient save,
-- guaranteeing atomicity: if either fails, both roll back.
-- Runs as SECURITY DEFINER so it can always write to audit_logs
-- regardless of the calling user's RLS permissions.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION private.audit_patient_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      hospital_id, staff_id, action, target_table, target_id, details
    ) VALUES (
      NEW.hospital_id,
      NEW.registered_by,
      'created_patient',
      'patients',
      NEW.id,
      jsonb_build_object(
        'patient_name', NEW.full_name,
        'mobile',       NEW.mobile_number,
        'patient_type', NEW.patient_type,
        'is_emergency', NEW.is_emergency
      )
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (
      hospital_id, staff_id, action, target_table, target_id, details
    ) VALUES (
      NEW.hospital_id,
      auth.uid(),
      'updated_patient',
      'patients',
      NEW.id,
      jsonb_build_object(
        'patient_name', NEW.full_name,
        'mobile',       NEW.mobile_number,
        'is_emergency', NEW.is_emergency
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION private.audit_patient_changes() FROM PUBLIC, anon;

-- Attach the trigger to the patients table
DROP TRIGGER IF EXISTS trg_audit_patient_changes ON patients;
CREATE TRIGGER trg_audit_patient_changes
  AFTER INSERT OR UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION private.audit_patient_changes();

-- ---------------------------------------------------------------------------
-- 10. SCHEMA AMENDMENTS
-- Safe to re-run: ADD COLUMN IF NOT EXISTS is idempotent.
-- ---------------------------------------------------------------------------

-- Add referring_doctor_name to patients.
-- Populated when referral_source = 'Doctor Referral'.
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS referring_doctor_name text;

-- Add specialty to staff_profiles.
-- Used for doctor staff members to indicate their department/specialty.
ALTER TABLE staff_profiles
  ADD COLUMN IF NOT EXISTS specialty text;

-- ---------------------------------------------------------------------------
-- 11. VISITS TABLE (Phase 2 — OPD Doctor module)
-- One row per patient visit/appointment. Created by Reception when a
-- patient is registered; updated by the doctor during consultation.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS visits (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id          uuid NOT NULL REFERENCES hospitals(id) ON DELETE RESTRICT,
  patient_id           uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id            uuid REFERENCES staff_profiles(id) ON DELETE SET NULL,
  department           text,
  appointment_type     text CHECK (appointment_type IN ('OPD Consultation','Follow-up','Emergency')),
  time_slot            text,
  token                text,
  status               text NOT NULL DEFAULT 'Waiting'
                         CHECK (status IN ('Waiting','InConsultation','Done','OnHold','SentToOPD')),
  vitals               jsonb,
  presenting_complaint text,
  diagnosis            text,
  notes                text,
  prescriptions        jsonb,
  lab_tests_ordered    jsonb,
  registered_by        uuid REFERENCES staff_profiles(id) ON DELETE SET NULL,
  created_at           timestamptz NOT NULL DEFAULT now(),
  completed_at         timestamptz
);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 12. RLS POLICIES - visits
-- Same pattern as patients: super_admin full access; staff limited to
-- own hospital with both is_active checks.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "super_admin_visits_all"           ON visits;
DROP POLICY IF EXISTS "staff_visits_own_hospital_select" ON visits;
DROP POLICY IF EXISTS "staff_visits_own_hospital_insert" ON visits;
DROP POLICY IF EXISTS "staff_visits_own_hospital_update" ON visits;

CREATE POLICY "super_admin_visits_all"
  ON visits FOR ALL
  USING  (private.get_my_role() = 'super_admin')
  WITH CHECK (private.get_my_role() = 'super_admin');

CREATE POLICY "staff_visits_own_hospital_select"
  ON visits FOR SELECT
  USING (
    private.get_my_role() != 'super_admin'
    AND hospital_id = private.get_my_hospital_id()
    AND private.get_my_is_active() = true
    AND private.get_hospital_is_active(hospital_id) = true
  );

CREATE POLICY "staff_visits_own_hospital_insert"
  ON visits FOR INSERT
  WITH CHECK (
    private.get_my_role() != 'super_admin'
    AND hospital_id = private.get_my_hospital_id()
    AND private.get_my_is_active() = true
    AND private.get_hospital_is_active(hospital_id) = true
  );

CREATE POLICY "staff_visits_own_hospital_update"
  ON visits FOR UPDATE
  USING (
    private.get_my_role() != 'super_admin'
    AND hospital_id = private.get_my_hospital_id()
    AND private.get_my_is_active() = true
    AND private.get_hospital_is_active(hospital_id) = true
  )
  WITH CHECK (
    private.get_my_role() != 'super_admin'
    AND hospital_id = private.get_my_hospital_id()
    AND private.get_my_is_active() = true
    AND private.get_hospital_is_active(hospital_id) = true
  );

-- ---------------------------------------------------------------------------
-- 13. AUDIT TRIGGER - visits (same pattern as patients trigger)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION private.audit_visit_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      hospital_id, staff_id, action, target_table, target_id, details
    ) VALUES (
      NEW.hospital_id,
      NEW.registered_by,
      'created_visit',
      'visits',
      NEW.id,
      jsonb_build_object(
        'patient_id',       NEW.patient_id,
        'doctor_id',        NEW.doctor_id,
        'department',       NEW.department,
        'appointment_type', NEW.appointment_type,
        'token',            NEW.token
      )
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (
      hospital_id, staff_id, action, target_table, target_id, details
    ) VALUES (
      NEW.hospital_id,
      auth.uid(),
      'updated_visit',
      'visits',
      NEW.id,
      jsonb_build_object(
        'patient_id', NEW.patient_id,
        'status',     NEW.status,
        'diagnosis',  NEW.diagnosis
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION private.audit_visit_changes() FROM PUBLIC, anon;

DROP TRIGGER IF EXISTS trg_audit_visit_changes ON visits;
CREATE TRIGGER trg_audit_visit_changes
  AFTER INSERT OR UPDATE ON visits
  FOR EACH ROW
  EXECUTE FUNCTION private.audit_visit_changes();

-- ---------------------------------------------------------------------------
-- 14. MANUAL STEPS - Create your Super Admin account
-- ---------------------------------------------------------------------------
-- After running this SQL:
-- 1. Go to Supabase Dashboard -> Authentication -> Users -> "Add user"
-- 2. Create your account with your email + a strong password
-- 3. Copy the UUID shown for that user
-- 4. Run the INSERT below, replacing <YOUR_AUTH_UUID>
--
-- INSERT INTO staff_profiles (id, hospital_id, full_name, email, role)
-- VALUES (
--   '<YOUR_AUTH_UUID>',
--   NULL,
--   'Your Full Name',
--   'your@email.com',
--   'super_admin'
-- );
