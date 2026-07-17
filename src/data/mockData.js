// ─── PATIENTS ────────────────────────────────────────────────────────────────
export const PATIENTS = [
  {
    id: 1, token: 'T001', uhid: 'PT-000001',
    name: 'Ramesh Patel', age: 45, gender: 'Male',
    dob: '1980-03-15',
    department: 'Cardiology', status: 'Waiting',
    contact: '9876543210', reason: 'Chest pain and shortness of breath',
    bloodGroup: 'B+', allergies: 'None',
    chronicConditions: ['Heart Disease', 'Hypertension'],
    referralSource: 'Doctor Referral',
    referringDoctor: 'Dr. Mehta (Family Physician)',
    emergencyContact: { name: 'Sita Patel', number: '9876500001' },
    lastVisit: { date: '12 May 2025', doctor: 'Dr. Suresh Mehta' },
  },
  {
    id: 2, token: 'T002', uhid: 'PT-000002',
    name: 'Priya Shah', age: 32, gender: 'Female',
    dob: '1993-07-22',
    department: 'General', status: 'Done',
    contact: '9123456789', reason: 'Fever and body ache for 3 days',
    bloodGroup: 'O+', allergies: 'Penicillin',
    chronicConditions: [],
    referralSource: 'Google Search',
    referringDoctor: '',
    emergencyContact: { name: 'Raj Shah', number: '9123400002' },
    lastVisit: { date: '03 Jan 2025', doctor: 'Dr. Anita Patel' },
  },
  {
    id: 3, token: 'T003', uhid: 'PT-000003',
    name: 'Anjali Mehta', age: 28, gender: 'Female',
    dob: '1997-11-05',
    department: 'Orthopedics', status: 'InConsultation',
    contact: '9988776655', reason: 'Knee pain after fall',
    bloodGroup: 'A+', allergies: 'None',
    chronicConditions: [],
    referralSource: 'Friend or Family',
    referringDoctor: '',
    emergencyContact: { name: 'Suresh Mehta', number: '9988700003' },
    lastVisit: { date: '18 Sep 2024', doctor: 'Dr. Rajesh Kumar' },
  },
  {
    id: 4, token: 'T004', uhid: 'PT-000004',
    name: 'Vikram Desai', age: 60, gender: 'Male',
    dob: '1965-01-30',
    department: 'Cardiology', status: 'Waiting',
    contact: '9765432109', reason: 'Routine diabetes and cardiac checkup',
    bloodGroup: 'AB+', allergies: 'Sulfa',
    chronicConditions: ['Diabetes', 'Heart Disease'],
    referralSource: 'Insurance Panel',
    referringDoctor: '',
    emergencyContact: { name: 'Meena Desai', number: '9765400004' },
    lastVisit: { date: '01 Apr 2025', doctor: 'Dr. Suresh Mehta' },
  },
  {
    id: 5, token: 'T005', uhid: 'PT-000005',
    name: 'Sunita Joshi', age: 38, gender: 'Female',
    dob: '1987-06-18',
    department: 'Gynecology', status: 'SentToOPD',
    contact: '9345678901', reason: 'Migraine and dizziness',
    bloodGroup: 'B-', allergies: 'None',
    chronicConditions: ['Thyroid'],
    referralSource: 'Facebook',
    referringDoctor: '',
    emergencyContact: { name: 'Anil Joshi', number: '9345600005' },
    lastVisit: { date: '20 Feb 2025', doctor: 'Dr. Priya Nair' },
  },
  {
    id: 6, token: 'T006', uhid: 'PT-000006',
    name: 'Kiran Rao', age: 52, gender: 'Male',
    dob: '1973-09-12',
    department: 'Neurology', status: 'OnHold',
    contact: '9012345678', reason: 'Persistent headache and vision blur',
    bloodGroup: 'O-', allergies: 'Aspirin',
    chronicConditions: ['Hypertension'],
    referralSource: 'Doctor Referral',
    referringDoctor: 'Dr. Sharma (Neurologist)',
    emergencyContact: { name: 'Lata Rao', number: '9012300006' },
    lastVisit: { date: '10 Mar 2025', doctor: 'Dr. Vikash Shah' },
  },
  {
    id: 7, token: 'T007', uhid: 'PT-000007',
    name: 'Deepak Sharma', age: 41, gender: 'Male',
    dob: '1984-04-25',
    department: 'General', status: 'Waiting',
    contact: '8876543210', reason: 'Skin rash and itching',
    bloodGroup: 'A-', allergies: 'None',
    chronicConditions: [],
    referralSource: 'Walk-in',
    referringDoctor: '',
    emergencyContact: { name: 'Rekha Sharma', number: '8876500007' },
    lastVisit: null,
  },
  {
    id: 8, token: 'T008', uhid: 'PT-000008',
    name: 'Meena Patel', age: 29, gender: 'Female',
    dob: '1996-12-03',
    department: 'Gynecology', status: 'Waiting',
    contact: '8765432109', reason: 'Routine prenatal checkup',
    bloodGroup: 'B+', allergies: 'None',
    chronicConditions: [],
    referralSource: 'Instagram',
    referringDoctor: '',
    emergencyContact: { name: 'Ravi Patel', number: '8765400008' },
    lastVisit: { date: '15 Jun 2025', doctor: 'Dr. Priya Nair' },
  },
  {
    id: 9, token: 'T009', uhid: 'PT-000009',
    name: 'Arjun Singh', age: 35, gender: 'Male',
    dob: '1990-08-14',
    department: 'Orthopedics', status: 'Waiting',
    contact: '8654321098', reason: 'Lower back pain, 2 weeks',
    bloodGroup: 'O+', allergies: 'None',
    chronicConditions: [],
    referralSource: 'Camp or Event',
    referringDoctor: '',
    emergencyContact: { name: 'Preet Singh', number: '8654300009' },
    lastVisit: null,
  },
  {
    id: 10, token: 'T010', uhid: 'PT-000010',
    name: 'Kavita Iyer', age: 48, gender: 'Female',
    dob: '1977-02-28',
    department: 'Cardiology', status: 'Waiting',
    contact: '8543210987', reason: 'Palpitations and fatigue',
    bloodGroup: 'AB-', allergies: 'Ibuprofen',
    chronicConditions: ['Hypertension', 'Thyroid'],
    referralSource: 'YouTube',
    referringDoctor: '',
    emergencyContact: { name: 'Suresh Iyer', number: '8543200010' },
    lastVisit: { date: '28 May 2025', doctor: 'Dr. Suresh Mehta' },
  },
]

// ─── DOCTORS ─────────────────────────────────────────────────────────────────
export const DOCTORS = [
  { id: 1, name: 'Dr. Suresh Mehta',  specialty: 'Cardiology',       status: 'Available',   room: 'Room 101', patients: 24, experience: '18 years' },
  { id: 2, name: 'Dr. Anita Patel',   specialty: 'General Medicine',  status: 'InConsult',   room: 'Room 102', patients: 31, experience: '12 years' },
  { id: 3, name: 'Dr. Rajesh Kumar',  specialty: 'Orthopedics',       status: 'Available',   room: 'Room 103', patients: 18, experience: '15 years' },
  { id: 4, name: 'Dr. Priya Nair',    specialty: 'Gynecology',        status: 'OnBreak',     room: 'Room 104', patients: 9,  experience: '10 years' },
  { id: 5, name: 'Dr. Vikash Shah',   specialty: 'Neurology',         status: 'Available',   room: 'Room 105', patients: 5,  experience: '20 years' },
]

// ─── APPOINTMENT TYPES ────────────────────────────────────────────────────────
export const APPOINTMENT_TYPES = ['OPD', 'Follow-up', 'Emergency']

// ─── REFERRAL SOURCES ─────────────────────────────────────────────────────────
export const REFERRAL_SOURCES = [
  'Google Search',
  'Facebook',
  'Instagram',
  'YouTube',
  'Doctor Referral',
  'Friend or Family',
  'Camp or Event',
  'Insurance Panel',
  'Walk-in',
  'Other',
]

// ─── CHRONIC CONDITIONS ───────────────────────────────────────────────────────
export const CHRONIC_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Heart Disease',
  'Asthma',
  'Thyroid',
  'Kidney Disease',
  'None of the above',
]

// ─── BLOOD GROUPS ─────────────────────────────────────────────────────────────
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown']

// ─── SYMPTOM TAGS ─────────────────────────────────────────────────────────────
export const SYMPTOM_TAGS = [
  'Fever', 'Cold & Cough', 'Headache', 'Body Pain', 'Stomach Pain',
  'Chest Pain', 'Back Pain', 'Knee Pain', 'Skin Issue',
  'Eye Problem', 'Diabetes Check', 'BP Check',
]

// ─── KPIs ─────────────────────────────────────────────────────────────────────
export const KPIS = {
  revenue:  { value: 124500, trend: '+12%', label: 'Today Revenue' },
  opd:      { value: 87, waiting: 23, inConsult: 12, label: 'OPD Patients' },
  beds:     { occupied: 54, total: 80, label: 'Beds Occupied' },
  staff:    { present: 42, total: 48, onLeave: 6, label: 'Staff Present' },
}

// ─── DEPARTMENTS ─────────────────────────────────────────────────────────────
export const DEPARTMENTS = [
  { name: 'Cardiology',       doctor: 'Dr. Suresh Mehta', patients: 24, revenue: 42000 },
  { name: 'Orthopedics',      doctor: 'Dr. Rajesh Kumar',  patients: 18, revenue: 28500 },
  { name: 'General Medicine', doctor: 'Dr. Anita Patel',   patients: 31, revenue: 31000 },
  { name: 'Gynecology',       doctor: 'Dr. Priya Nair',    patients: 9,  revenue: 18000 },
  { name: 'Neurology',        doctor: 'Dr. Vikash Shah',   patients: 5,  revenue: 5000  },
]

// ─── WEEKLY OPD ───────────────────────────────────────────────────────────────
export const WEEKLY_OPD = [
  { day: 'Mon', patients: 72 },
  { day: 'Tue', patients: 85 },
  { day: 'Wed', patients: 91 },
  { day: 'Thu', patients: 68 },
  { day: 'Fri', patients: 95 },
  { day: 'Sat', patients: 110 },
  { day: 'Sun', patients: 78 },
]

// ─── ALERTS ───────────────────────────────────────────────────────────────────
export const ALERTS = [
  { id: 1, type: 'danger',  message: 'ICU Bed 1 — Arjun Singh vitals critical',       timeAgo: '2 mins ago' },
  { id: 2, type: 'warning', message: 'Metformin 500mg stock critically low (8 units)', timeAgo: '10 mins ago' },
  { id: 3, type: 'warning', message: 'Bed 12 (Ward A) needs cleaning',                 timeAgo: '18 mins ago' },
  { id: 4, type: 'info',    message: 'Dr. Priya Nair OPD delayed — on break',          timeAgo: '25 mins ago' },
  { id: 5, type: 'success', message: 'Lab report ready — Anjali Mehta (X-Ray Knee)',   timeAgo: '42 mins ago' },
]

// ─── LAB TESTS (active queue) ────────────────────────────────────────────────
export const LAB_TESTS = [
  { id: 1, patient: 'Ramesh Patel',  token: 'T001', test: 'CBC (Complete Blood Count)', priority: 'Urgent',   status: 'SampleCollected', orderedBy: 'Dr. Suresh Mehta',  orderedAt: '09:15 AM', tatMinutes: 240, elapsedMinutes: 45  },
  { id: 2, patient: 'Priya Shah',    token: 'T002', test: 'Lipid Profile',               priority: 'Normal',   status: 'Processing',      orderedBy: 'Dr. Anita Patel',   orderedAt: '09:30 AM', tatMinutes: 360, elapsedMinutes: 190 },
  { id: 3, patient: 'Anjali Mehta',  token: 'T003', test: 'X-Ray (Knee)',                priority: 'Normal',   status: 'ReportReady',     orderedBy: 'Dr. Rajesh Kumar',  orderedAt: '09:45 AM', tatMinutes: 60,  elapsedMinutes: 55  },
  { id: 4, patient: 'Vikram Desai',  token: 'T004', test: 'ECG',                         priority: 'Critical', status: 'Ordered',         orderedBy: 'Dr. Suresh Mehta',  orderedAt: '10:00 AM', tatMinutes: 30,  elapsedMinutes: 10  },
  { id: 5, patient: 'Sunita Joshi',  token: 'T005', test: 'Urine Routine',               priority: 'Normal',   status: 'Processing',      orderedBy: 'Dr. Priya Nair',    orderedAt: '10:15 AM', tatMinutes: 180, elapsedMinutes: 100 },
]

// ─── LAB TEST MASTER (settings / catalog) ─────────────────────────────────────
export const LAB_TEST_MASTER = [
  { id: 1,  name: 'Complete Blood Count (CBC)',   category: 'Hematology',   price: 250, tat: '4 hrs',   tatValue: 4,  tatUnit: 'hours',   referenceRange: 'RBC: 4.5–5.5 M/µL, WBC: 4000–11000 /µL, Platelets: 150000–400000 /µL', specialInstructions: 'Fasting not required',          status: 'Active' },
  { id: 2,  name: 'Lipid Profile',                category: 'Biochemistry', price: 450, tat: '6 hrs',   tatValue: 6,  tatUnit: 'hours',   referenceRange: 'Total Cholesterol: <200 mg/dL, LDL: <100 mg/dL, HDL: >40 mg/dL',          specialInstructions: '12-hour fasting required',      status: 'Active' },
  { id: 3,  name: 'Blood Glucose Fasting',        category: 'Biochemistry', price: 150, tat: '2 hrs',   tatValue: 2,  tatUnit: 'hours',   referenceRange: '70–100 mg/dL',                                                            specialInstructions: '8-hour fasting required',       status: 'Active' },
  { id: 4,  name: 'Urine Routine',                category: 'Microbiology', price: 100, tat: '3 hrs',   tatValue: 3,  tatUnit: 'hours',   referenceRange: 'pH: 4.5–8.0, Protein: Negative, Glucose: Negative',                      specialInstructions: 'Mid-stream sample preferred',   status: 'Active' },
  { id: 5,  name: 'X-Ray Chest',                  category: 'Radiology',    price: 400, tat: '1 hr',    tatValue: 60, tatUnit: 'minutes', referenceRange: 'Report by Radiologist',                                                   specialInstructions: 'Remove metallic objects',       status: 'Active' },
  { id: 6,  name: 'ECG',                          category: 'Cardiology',   price: 200, tat: '30 mins', tatValue: 30, tatUnit: 'minutes', referenceRange: 'Normal Sinus Rhythm, HR: 60–100 bpm',                                     specialInstructions: 'Rest for 5 min before test',   status: 'Active' },
  { id: 7,  name: 'Thyroid Profile (T3 T4 TSH)',  category: 'Biochemistry', price: 600, tat: '8 hrs',   tatValue: 8,  tatUnit: 'hours',   referenceRange: 'TSH: 0.4–4.0 mIU/L, T3: 80–200 ng/dL, T4: 5.0–12.0 µg/dL',            specialInstructions: 'Morning sample preferred',     status: 'Active' },
  { id: 8,  name: 'Liver Function Test',          category: 'Biochemistry', price: 500, tat: '6 hrs',   tatValue: 6,  tatUnit: 'hours',   referenceRange: 'ALT: 7–56 U/L, AST: 10–40 U/L, Bilirubin Total: 0.2–1.2 mg/dL',        specialInstructions: 'Fasting preferred',             status: 'Active' },
  { id: 9,  name: 'Dengue NS1 Antigen',           category: 'Microbiology', price: 800, tat: '4 hrs',   tatValue: 4,  tatUnit: 'hours',   referenceRange: 'Negative',                                                                specialInstructions: 'Test within 5 days of fever onset', status: 'Active' },
  { id: 10, name: 'COVID RT-PCR',                 category: 'Microbiology', price: 500, tat: '6 hrs',   tatValue: 6,  tatUnit: 'hours',   referenceRange: 'Negative (Not Detected)',                                                  specialInstructions: 'Nasopharyngeal swab required', status: 'Active' },
]

// ─── MEDICINES ────────────────────────────────────────────────────────────────
export const MEDICINES = [
  { id: 1, name: 'Paracetamol',  dosage: '500mg', stock: 120, unit: 'tabs', status: 'OK',       category: 'Analgesic',    price: 2.5  },
  { id: 2, name: 'Amoxicillin',  dosage: '250mg', stock: 45,  unit: 'caps', status: 'Low',      category: 'Antibiotic',   price: 8.0  },
  { id: 3, name: 'Omeprazole',   dosage: '20mg',  stock: 200, unit: 'caps', status: 'OK',       category: 'Antacid',      price: 5.0  },
  { id: 4, name: 'Metformin',    dosage: '500mg', stock: 8,   unit: 'tabs', status: 'Critical', category: 'Antidiabetic', price: 3.0  },
  { id: 5, name: 'Amlodipine',   dosage: '5mg',   stock: 90,  unit: 'tabs', status: 'OK',       category: 'Antihypert.',  price: 6.5  },
]

// ─── WARDS ─────────────────────────────────────────────────────────────────────
export const WARDS = [
  { id: 1, name: 'Ward A', type: 'General',        beds: 5, active: true, notes: 'General male/female ward' },
  { id: 2, name: 'Ward B', type: 'General',        beds: 5, active: true, notes: 'General male/female ward' },
  { id: 3, name: 'ICU',    type: 'ICU',            beds: 3, active: true, notes: 'Intensive Care Unit'      },
]

// ─── BEDS ─────────────────────────────────────────────────────────────────────
export const BEDS = [
  { id: 'A1', ward: 'Ward A', status: 'Occupied',    patient: 'Ramesh Patel',  days: 3, uhid: 'PT-000001', admitDate: '06 Jul 2026', diagnosis: 'Acute Chest Pain',       doctor: 'Dr. Suresh Mehta',  discharge: '12 Jul 2026' },
  { id: 'A2', ward: 'Ward A', status: 'Occupied',    patient: 'Sunita Joshi',  days: 1, uhid: 'PT-000005', admitDate: '08 Jul 2026', diagnosis: 'Migraine — Observation', doctor: 'Dr. Priya Nair',    discharge: '10 Jul 2026' },
  { id: 'A3', ward: 'Ward A', status: 'Empty',       patient: null,            days: 0, uhid: null, admitDate: null, diagnosis: null, doctor: null, discharge: null },
  { id: 'A4', ward: 'Ward A', status: 'Cleaning',    patient: null,            days: 0, uhid: null, admitDate: null, diagnosis: null, doctor: null, discharge: null },
  { id: 'A5', ward: 'Ward A', status: 'Empty',       patient: null,            days: 0, uhid: null, admitDate: null, diagnosis: null, doctor: null, discharge: null },
  { id: 'B1', ward: 'Ward B', status: 'Occupied',    patient: 'Vikram Desai',  days: 5, uhid: 'PT-000004', admitDate: '04 Jul 2026', diagnosis: 'Diabetes Management',    doctor: 'Dr. Anita Patel',   discharge: '14 Jul 2026' },
  { id: 'B2', ward: 'Ward B', status: 'Empty',       patient: null,            days: 0, uhid: null, admitDate: null, diagnosis: null, doctor: null, discharge: null },
  { id: 'B3', ward: 'Ward B', status: 'Maintenance', patient: null,            days: 0, uhid: null, admitDate: null, diagnosis: null, doctor: null, discharge: null },
  { id: 'B4', ward: 'Ward B', status: 'Empty',       patient: null,            days: 0, uhid: null, admitDate: null, diagnosis: null, doctor: null, discharge: null },
  { id: 'B5', ward: 'Ward B', status: 'Occupied',    patient: 'Kiran Rao',     days: 2, uhid: 'PT-000006', admitDate: '07 Jul 2026', diagnosis: 'Lumbar Disc Herniation', doctor: 'Dr. Rajesh Kumar',  discharge: '15 Jul 2026' },
  { id: 'I1', ward: 'ICU',    status: 'Critical',    patient: 'Arjun Singh',   days: 1, uhid: 'PT-000009', admitDate: '08 Jul 2026', diagnosis: 'Post-op Monitoring',     doctor: 'Dr. Vikash Shah',   discharge: 'TBD' },
  { id: 'I2', ward: 'ICU',    status: 'Empty',       patient: null,            days: 0, uhid: null, admitDate: null, diagnosis: null, doctor: null, discharge: null },
  { id: 'I3', ward: 'ICU',    status: 'Empty',       patient: null,            days: 0, uhid: null, admitDate: null, diagnosis: null, doctor: null, discharge: null },
]

// ─── STAFF ────────────────────────────────────────────────────────────────────
export const STAFF = [
  { id: 1, name: 'Ravi Sharma',  role: 'Head Nurse',     department: 'ICU',        status: 'Present', shift: 'Morning' },
  { id: 2, name: 'Geeta Verma',  role: 'Staff Nurse',    department: 'Ward A',     status: 'Present', shift: 'Morning' },
  { id: 3, name: 'Sunil Patil',  role: 'Lab Technician', department: 'Laboratory', status: 'Present', shift: 'Morning' },
  { id: 4, name: 'Kavya Reddy',  role: 'Receptionist',   department: 'Reception',  status: 'Absent',  shift: 'Morning' },
  { id: 5, name: 'Mohan Das',    role: 'Pharmacist',     department: 'Pharmacy',   status: 'Present', shift: 'Morning' },
  { id: 6, name: 'Ananya Bose',  role: 'Staff Nurse',    department: 'Ward B',     status: 'Present', shift: 'Evening' },
]

// ─── MEDICINES (extended) ────────────────────────────────────────────────────
// (MEDICINES array above kept as-is; extended detail lives in MEDICINE_DETAIL)
export const MEDICINE_DETAIL = [
  {
    id: 1, name: 'Paracetamol', genericName: 'Acetaminophen', dosage: '500mg',
    category: 'Analgesic', stock: 120, unit: 'tabs', status: 'OK',
    reorderLevel: 50, reorderQty: 200, avgDailyUsage: 5, last7Days: 35,
    expiryDate: '2026-03-31', batchNo: 'PCM-2024-01',
    purchasePrice: 1.5, sellingPrice: 2.5,
    supplier: 'MedPlus Pharma', supplierContact: '9876543001', lastOrderDate: '01 Jun 2026',
    specialInstructions: 'Store below 25°C. Keep away from moisture.',
  },
  {
    id: 2, name: 'Amoxicillin', genericName: 'Amoxicillin Trihydrate', dosage: '250mg',
    category: 'Antibiotic', stock: 45, unit: 'caps', status: 'Low',
    reorderLevel: 100, reorderQty: 300, avgDailyUsage: 8, last7Days: 56,
    expiryDate: '2025-08-31', batchNo: 'AMX-2024-03',
    purchasePrice: 5.0, sellingPrice: 8.0,
    supplier: 'Cipla Distributors', supplierContact: '9876543003', lastOrderDate: '15 May 2026',
    specialInstructions: 'Complete the full course. Refrigerate after opening.',
  },
  {
    id: 3, name: 'Omeprazole', genericName: 'Omeprazole', dosage: '20mg',
    category: 'Antacid', stock: 200, unit: 'caps', status: 'OK',
    reorderLevel: 80, reorderQty: 250, avgDailyUsage: 4, last7Days: 28,
    expiryDate: '2027-01-31', batchNo: 'OMP-2025-01',
    purchasePrice: 3.0, sellingPrice: 5.0,
    supplier: 'Sun Pharma Distributors', supplierContact: '9876543002', lastOrderDate: '10 Apr 2026',
    specialInstructions: 'Take 30 minutes before meals.',
  },
  {
    id: 4, name: 'Metformin', genericName: 'Metformin Hydrochloride', dosage: '500mg',
    category: 'Antidiabetic', stock: 8, unit: 'tabs', status: 'Critical',
    reorderLevel: 50, reorderQty: 200, avgDailyUsage: 10, last7Days: 70,
    expiryDate: '2025-06-30', batchNo: 'MET-2024-02',
    purchasePrice: 1.8, sellingPrice: 3.0,
    supplier: 'Mankind Pharma', supplierContact: '9876543004', lastOrderDate: '01 Mar 2026',
    specialInstructions: 'Take with meals. Monitor blood glucose regularly.',
  },
  {
    id: 5, name: 'Amlodipine', genericName: 'Amlodipine Besylate', dosage: '5mg',
    category: 'Antihypert.', stock: 90, unit: 'tabs', status: 'OK',
    reorderLevel: 40, reorderQty: 150, avgDailyUsage: 3, last7Days: 21,
    expiryDate: '2026-11-30', batchNo: 'AML-2025-02',
    purchasePrice: 4.0, sellingPrice: 6.5,
    supplier: 'Abbott India', supplierContact: '9876543005', lastOrderDate: '20 May 2026',
    specialInstructions: 'Take at the same time each day. Do not crush.',
  },
]

// ─── SUPPLIERS ────────────────────────────────────────────────────────────────
export const SUPPLIERS = [
  { id: 1, name: 'MedPlus Pharma',         contact: '9876543001', city: 'Ahmedabad', speciality: 'General medicines',          lastOrderDate: '01 Jun 2026' },
  { id: 2, name: 'Sun Pharma Distributors', contact: '9876543002', city: 'Surat',     speciality: 'Branded medicines',           lastOrderDate: '10 Apr 2026' },
  { id: 3, name: 'Cipla Distributors',      contact: '9876543003', city: 'Ahmedabad', speciality: 'Antibiotics and cardiac',     lastOrderDate: '15 May 2026' },
  { id: 4, name: 'Mankind Pharma',          contact: '9876543004', city: 'Vadodara',  speciality: 'OTC medicines',               lastOrderDate: '01 Mar 2026' },
  { id: 5, name: 'Abbott India',            contact: '9876543005', city: 'Ahmedabad', speciality: 'Specialty drugs',             lastOrderDate: '20 May 2026' },
]

// ─── PURCHASE ORDERS ──────────────────────────────────────────────────────────
export const PURCHASE_ORDERS = [
  {
    id: 'PO-001', supplier: 'MedPlus Pharma', supplierContact: '9876543001',
    date: '01 Jul 2026', status: 'Received', amount: 12500,
    items: [
      { medicine: 'Paracetamol 500mg',  qty: 500, unit: 'tabs', rate: 1.5,  total: 750  },
      { medicine: 'Omeprazole 20mg',    qty: 200, unit: 'caps', rate: 3.0,  total: 600  },
      { medicine: 'Amlodipine 5mg',     qty: 150, unit: 'tabs', rate: 4.0,  total: 600  },
      { medicine: 'Cetirizine 10mg',    qty: 300, unit: 'tabs', rate: 2.0,  total: 600  },
      { medicine: 'Atorvastatin 10mg',  qty: 200, unit: 'tabs', rate: 8.0,  total: 1600 },
    ],
  },
  {
    id: 'PO-002', supplier: 'Sun Pharma Distributors', supplierContact: '9876543002',
    date: '08 Jul 2026', status: 'Received', amount: 8200,
    items: [
      { medicine: 'Metoprolol 25mg',    qty: 200, unit: 'tabs', rate: 6.0,  total: 1200 },
      { medicine: 'Losartan 50mg',      qty: 150, unit: 'tabs', rate: 9.0,  total: 1350 },
      { medicine: 'Rosuvastatin 10mg',  qty: 100, unit: 'tabs', rate: 12.0, total: 1200 },
    ],
  },
  {
    id: 'PO-003', supplier: 'Cipla Distributors', supplierContact: '9876543003',
    date: '14 Jul 2026', status: 'Pending', amount: 24300,
    items: [
      { medicine: 'Amoxicillin 250mg',  qty: 300, unit: 'caps', rate: 5.0,  total: 1500 },
      { medicine: 'Azithromycin 500mg', qty: 100, unit: 'tabs', rate: 18.0, total: 1800 },
      { medicine: 'Metformin 500mg',    qty: 200, unit: 'tabs', rate: 1.8,  total: 360  },
      { medicine: 'Glimepiride 2mg',    qty: 150, unit: 'tabs', rate: 7.0,  total: 1050 },
    ],
  },
]

// ─── BILLING STATUS TAGS ──────────────────────────────────────────────────────
// Visual mock: tracks pharmacy dispense state per invoice
export const BILLING_STATUS = {
  'INV-2025-001': 'READY_TO_COLLECT',      // already dispensed
  'INV-2025-002': 'READY_TO_COLLECT',
  'INV-2025-003': 'PRESCRIPTION_PENDING',  // Anjali — pharmacy not yet dispensed
  'INV-2025-004': 'PRESCRIPTION_PENDING',  // Vikram
  'INV-2025-005': 'PRESCRIPTION_PENDING',  // Sunita
}

// ─── BILLS ────────────────────────────────────────────────────────────────────
export const BILLS = [
  {
    id: 'INV-2025-001', patient: 'Ramesh Patel', token: 'T001', date: '09 Jul 2025',
    doctor: 'Dr. Suresh Mehta', department: 'Cardiology', status: 'Paid',
    items: [
      { description: 'OPD Consultation — Cardiology', category: 'Consultation', amount: 800 },
      { description: 'ECG',                           category: 'Lab Test',     amount: 350 },
      { description: 'Lipid Profile',                 category: 'Lab Test',     amount: 650 },
      { description: 'Atorvastatin 10mg (30 tabs)',   category: 'Medicine',     amount: 180 },
      { description: 'Aspirin 75mg (30 tabs)',        category: 'Medicine',     amount: 60  },
    ],
  },
  {
    id: 'INV-2025-002', patient: 'Priya Shah', token: 'T002', date: '09 Jul 2025',
    doctor: 'Dr. Anita Patel', department: 'General Medicine', status: 'Paid',
    items: [
      { description: 'OPD Consultation — General',  category: 'Consultation', amount: 500 },
      { description: 'CBC (Complete Blood Count)',   category: 'Lab Test',     amount: 300 },
      { description: 'Paracetamol 500mg (10 tabs)', category: 'Medicine',     amount: 35  },
      { description: 'Cetirizine 10mg (10 tabs)',   category: 'Medicine',     amount: 45  },
    ],
  },
  {
    id: 'INV-2025-003', patient: 'Anjali Mehta', token: 'T003', date: '09 Jul 2025',
    doctor: 'Dr. Rajesh Kumar', department: 'Orthopedics', status: 'Pending',
    items: [
      { description: 'OPD Consultation — Orthopedics', category: 'Consultation', amount: 700 },
      { description: 'X-Ray (Knee)',                   category: 'Lab Test',     amount: 450 },
      { description: 'Ibuprofen 400mg (15 tabs)',      category: 'Medicine',     amount: 75  },
      { description: 'Diclofenac Gel 30g',             category: 'Medicine',     amount: 120 },
    ],
  },
  {
    id: 'INV-2025-004', patient: 'Vikram Desai', token: 'T004', date: '09 Jul 2025',
    doctor: 'Dr. Suresh Mehta', department: 'Cardiology', status: 'Pending',
    items: [
      { description: 'OPD Consultation — Cardiology', category: 'Consultation', amount: 800 },
      { description: 'Blood Sugar (Fasting + PP)',    category: 'Lab Test',     amount: 200 },
      { description: 'HbA1c Test',                   category: 'Lab Test',     amount: 400 },
      { description: 'Metformin 500mg (30 tabs)',     category: 'Medicine',     amount: 90  },
    ],
  },
]
