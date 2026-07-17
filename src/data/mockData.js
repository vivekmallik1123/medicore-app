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

// ─── LAB TESTS ────────────────────────────────────────────────────────────────
export const LAB_TESTS = [
  { id: 1, patient: 'Ramesh Patel',  token: 'T001', test: 'CBC (Complete Blood Count)', priority: 'Urgent',   status: 'SampleCollected', orderedBy: 'Dr. Suresh Mehta',  orderedAt: '09:15 AM' },
  { id: 2, patient: 'Priya Shah',    token: 'T002', test: 'Lipid Profile',               priority: 'Normal',   status: 'Processing',      orderedBy: 'Dr. Anita Patel',   orderedAt: '09:30 AM' },
  { id: 3, patient: 'Anjali Mehta',  token: 'T003', test: 'X-Ray (Knee)',                priority: 'Normal',   status: 'ReportReady',     orderedBy: 'Dr. Rajesh Kumar',  orderedAt: '09:45 AM' },
  { id: 4, patient: 'Vikram Desai',  token: 'T004', test: 'ECG',                         priority: 'Critical', status: 'Ordered',         orderedBy: 'Dr. Suresh Mehta',  orderedAt: '10:00 AM' },
  { id: 5, patient: 'Sunita Joshi',  token: 'T005', test: 'Urine Routine',               priority: 'Normal',   status: 'Processing',      orderedBy: 'Dr. Priya Nair',    orderedAt: '10:15 AM' },
]

// ─── MEDICINES ────────────────────────────────────────────────────────────────
export const MEDICINES = [
  { id: 1, name: 'Paracetamol',  dosage: '500mg', stock: 120, unit: 'tabs', status: 'OK',       category: 'Analgesic',    price: 2.5  },
  { id: 2, name: 'Amoxicillin',  dosage: '250mg', stock: 45,  unit: 'caps', status: 'Low',      category: 'Antibiotic',   price: 8.0  },
  { id: 3, name: 'Omeprazole',   dosage: '20mg',  stock: 200, unit: 'caps', status: 'OK',       category: 'Antacid',      price: 5.0  },
  { id: 4, name: 'Metformin',    dosage: '500mg', stock: 8,   unit: 'tabs', status: 'Critical', category: 'Antidiabetic', price: 3.0  },
  { id: 5, name: 'Amlodipine',   dosage: '5mg',   stock: 90,  unit: 'tabs', status: 'OK',       category: 'Antihypert.',  price: 6.5  },
]

// ─── BEDS ─────────────────────────────────────────────────────────────────────
export const BEDS = [
  { id: 'Bed1',  ward: 'Ward A', status: 'Occupied',    patient: 'Ramesh Patel',  days: 3 },
  { id: 'Bed2',  ward: 'Ward A', status: 'Occupied',    patient: 'Sunita Joshi',  days: 1 },
  { id: 'Bed3',  ward: 'Ward A', status: 'Empty',       patient: null,            days: 0 },
  { id: 'Bed4',  ward: 'Ward A', status: 'Cleaning',    patient: null,            days: 0 },
  { id: 'Bed5',  ward: 'Ward A', status: 'Empty',       patient: null,            days: 0 },
  { id: 'Bed6',  ward: 'Ward B', status: 'Occupied',    patient: 'Vikram Desai',  days: 5 },
  { id: 'Bed7',  ward: 'Ward B', status: 'Empty',       patient: null,            days: 0 },
  { id: 'Bed8',  ward: 'Ward B', status: 'Maintenance', patient: null,            days: 0 },
  { id: 'Bed9',  ward: 'Ward B', status: 'Empty',       patient: null,            days: 0 },
  { id: 'Bed10', ward: 'Ward B', status: 'Occupied',    patient: 'Kiran Rao',     days: 2 },
  { id: 'ICU1',  ward: 'ICU',    status: 'Critical',    patient: 'Arjun Singh',   days: 1 },
  { id: 'ICU2',  ward: 'ICU',    status: 'Empty',       patient: null,            days: 0 },
  { id: 'ICU3',  ward: 'ICU',    status: 'Empty',       patient: null,            days: 0 },
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
