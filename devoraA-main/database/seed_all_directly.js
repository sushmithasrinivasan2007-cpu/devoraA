import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const url = 'https://lbozyemtotpucyojbftr.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxib3p5ZW10b3RwdWN5b2piZnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNzQ4MTMsImV4cCI6MjEwODY1MDgxM30.jFgtEG_JUGI8RWh5AtUY6aK1yZj6N0q-XS16QCcBaag';

const supabase = createClient(url, key);

function pseudoUuid(prefix, id) {
  const hex = Buffer.from(prefix + '-' + String(id)).toString('hex').padEnd(32, '0').slice(0, 32);
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
}

async function seedTable(tableName, rows, onConflict = 'id') {
  if (!rows || rows.length === 0) return;
  console.log(`Seeding ${tableName} (${rows.length} rows)...`);
  
  const chunkSize = 100;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from(tableName).upsert(chunk, { onConflict });
    if (error) {
      console.error(`Error inserting into ${tableName} (chunk ${i}-${i + chunk.length}):`, error);
      throw error;
    }
  }
  console.log(`✓ ${tableName} seeded successfully.`);
}

async function run() {
  console.log('--- STARTING COMPREHENSIVE MULTI-SECTOR DATA INJECTION TO SUPABASE ---\n');

  // 1. Notification Preferences
  await seedTable('notification_preferences', [{
    id: '00000000-0000-0000-0000-000000000001',
    email_leave_updates: true,
    email_maintenance_urgent: true,
    email_emergency_alerts: true,
    email_attendance_low: true,
    email_request_resolved: true,
    sms_leave_updates: true,
    sms_maintenance_urgent: true,
    sms_emergency_alerts: true,
    sms_attendance_low: true,
    sms_request_resolved: true
  }]);

  // 2. Users Table
  await seedTable('users', [
    { id: '10000000-0000-0000-0000-000000000001', name: 'Dr. Alistair Vance', email: 'director@devora.edu', role: 'ADMIN', phone: '+15550192831', department: 'Operations' },
    { id: '10000000-0000-0000-0000-000000000002', name: 'Sarah Jenkins', email: 's.jenkins@devora.edu', role: 'TEACHER', phone: '+15550192832', department: 'Academics', class_assigned: 'BCA 3B1' },
    { id: '10000000-0000-0000-0000-000000000003', name: 'Rajesh Kumar', email: 'rajesh.k@devora.edu', role: 'ADMIN', phone: '+15550192833', department: 'Facilities & Maintenance' },
    { id: '10000000-0000-0000-0000-000000000004', name: 'Elena Rostova', email: 'e.rostova@devora.edu', role: 'TEACHER', phone: '+15550192834', department: 'Information Technology' },
    { id: '10000000-0000-0000-0000-000000000005', name: 'Marcus Chen', email: 'm.chen@devora.edu', role: 'TEACHER', phone: '+15550192835', department: 'Academics', class_assigned: 'BCA 3B2' },
    { id: '10000000-0000-0000-0000-000000000006', name: 'ABHISHEK R', email: 'abhishek.r.1@devora.edu', role: 'STUDENT', phone: '+91 9810000000', department: 'BCA' },
    { id: '10000000-0000-0000-0000-000000000007', name: 'AJAY PRASAD', email: 'ajay.prasad.2@devora.edu', role: 'STUDENT', phone: '+91 9810000001', department: 'BCA' }
  ]);

  // 3. Staff Table
  await seedTable('staff', [
    { id: '11111111-0000-0000-0000-000000000001', user_id: '10000000-0000-0000-0000-000000000001', name: 'Dr. Alistair Vance', employee_id: 'EMP-ADM-01', role_title: 'Campus Director', department: 'Operations', email: 'director@devora.edu', phone: '+15550192831', status: 'ACTIVE' },
    { id: '11111111-0000-0000-0000-000000000002', user_id: '10000000-0000-0000-0000-000000000002', name: 'Sarah Jenkins', employee_id: 'EMP-TCH-08', role_title: 'Senior Faculty - Computer Applications', department: 'Academics', email: 's.jenkins@devora.edu', phone: '+15550192832', status: 'ACTIVE' },
    { id: '11111111-0000-0000-0000-000000000003', user_id: '10000000-0000-0000-0000-000000000003', name: 'Rajesh Kumar', employee_id: 'EMP-MNT-04', role_title: 'Facilities & Operations Lead', department: 'Facilities & Maintenance', email: 'rajesh.k@devora.edu', phone: '+15550192833', status: 'ACTIVE' },
    { id: '11111111-0000-0000-0000-000000000004', user_id: '10000000-0000-0000-0000-000000000004', name: 'Elena Rostova', employee_id: 'EMP-ITS-02', role_title: 'IT Support & Systems Engineer', department: 'Information Technology', email: 'e.rostova@devora.edu', phone: '+15550192834', status: 'ACTIVE' },
    { id: '11111111-0000-0000-0000-000000000005', user_id: '10000000-0000-0000-0000-000000000005', name: 'Marcus Chen', employee_id: 'EMP-TCH-10', role_title: 'Associate Faculty - Systems', department: 'Academics', email: 'm.chen@devora.edu', phone: '+15550192835', status: 'ACTIVE' }
  ]);

  // 4. Courses
  await seedTable('courses', [
    { id: 'aaaaaaaa-0000-0000-0000-000000000001', code: 'BCA', name: 'Bachelor of Computer Applications', description: '3-Year undergraduate computing program', duration_years: 3, status: 'ACTIVE' },
    { id: 'aaaaaaaa-0000-0000-0000-000000000002', code: 'BBA', name: 'Bachelor of Business Administration', description: '3-Year management and leadership program', duration_years: 3, status: 'ACTIVE' },
    { id: 'aaaaaaaa-0000-0000-0000-000000000003', code: 'B.Com', name: 'Bachelor of Commerce', description: '3-Year financial and accounting studies', duration_years: 3, status: 'ACTIVE' },
    { id: 'aaaaaaaa-0000-0000-0000-000000000004', code: 'MCA', name: 'Master of Computer Applications', description: '2-Year postgraduate advanced computing', duration_years: 2, status: 'ACTIVE' }
  ]);

  // 5. Academic Years
  await seedTable('academic_years', [
    { id: 'bbbbbbbb-0000-0000-0000-000000000001', name: '2025-26', start_date: '2025-06-01', end_date: '2026-05-31', is_current: false, status: 'ACTIVE' },
    { id: 'bbbbbbbb-0000-0000-0000-000000000002', name: '2026-27', start_date: '2026-06-01', end_date: '2027-05-31', is_current: true, status: 'ACTIVE' },
    { id: 'bbbbbbbb-0000-0000-0000-000000000003', name: '2027-28', start_date: '2027-06-01', end_date: '2028-05-31', is_current: false, status: 'ACTIVE' }
  ]);

  // 6. Semesters (1st to 6th)
  await seedTable('semesters', [
    { id: 'cccccccc-0000-0000-0000-000000000001', course_id: 'aaaaaaaa-0000-0000-0000-000000000001', number: 1, name: '1st Semester', status: 'ACTIVE' },
    { id: 'cccccccc-0000-0000-0000-000000000002', course_id: 'aaaaaaaa-0000-0000-0000-000000000001', number: 2, name: '2nd Semester', status: 'ACTIVE' },
    { id: 'cccccccc-0000-0000-0000-000000000003', course_id: 'aaaaaaaa-0000-0000-0000-000000000001', number: 3, name: '3rd Semester', status: 'ACTIVE' },
    { id: 'cccccccc-0000-0000-0000-000000000004', course_id: 'aaaaaaaa-0000-0000-0000-000000000001', number: 4, name: '4th Semester', status: 'ACTIVE' },
    { id: 'cccccccc-0000-0000-0000-000000000005', course_id: 'aaaaaaaa-0000-0000-0000-000000000001', number: 5, name: '5th Semester', status: 'ACTIVE' },
    { id: 'cccccccc-0000-0000-0000-000000000006', course_id: 'aaaaaaaa-0000-0000-0000-000000000001', number: 6, name: '6th Semester', status: 'ACTIVE' }
  ]);

  // 7. Sections (24 sections)
  const sections = [];
  const semList = [
    { num: 1, semId: 'cccccccc-0000-0000-0000-000000000001', prefix: '1' },
    { num: 2, semId: 'cccccccc-0000-0000-0000-000000000002', prefix: '2' },
    { num: 3, semId: 'cccccccc-0000-0000-0000-000000000003', prefix: '3' },
    { num: 4, semId: 'cccccccc-0000-0000-0000-000000000004', prefix: '4' },
    { num: 5, semId: 'cccccccc-0000-0000-0000-000000000005', prefix: '5' },
    { num: 6, semId: 'cccccccc-0000-0000-0000-000000000006', prefix: '6' }
  ];
  semList.forEach(s => {
    const semPad = String(s.num).padStart(4, '0');
    sections.push(
      { id: `dddddddd-0000-0000-${semPad}-000000000001`, course_id: 'aaaaaaaa-0000-0000-0000-000000000001', semester_id: s.semId, name: `${s.prefix}st Neo`, status: 'ACTIVE' },
      { id: `dddddddd-0000-0000-${semPad}-000000000002`, course_id: 'aaaaaaaa-0000-0000-0000-000000000001', semester_id: s.semId, name: `${s.prefix}B1`, status: 'ACTIVE' },
      { id: `dddddddd-0000-0000-${semPad}-000000000003`, course_id: 'aaaaaaaa-0000-0000-0000-000000000001', semester_id: s.semId, name: `${s.prefix}B2`, status: 'ACTIVE' },
      { id: `dddddddd-0000-0000-${semPad}-000000000004`, course_id: 'aaaaaaaa-0000-0000-0000-000000000001', semester_id: s.semId, name: `${s.prefix}B3`, status: 'ACTIVE' }
    );
  });
  await seedTable('sections', sections);

  // 8. Physical Classes
  await seedTable('classes', [
    { id: '12121212-0000-0000-0000-000000000001', class_grade: '1', section: '1st Neo', class_teacher_id: '10000000-0000-0000-0000-000000000002', room_number: 'Room 101, Main Block', total_capacity: 60 },
    { id: '12121212-0000-0000-0000-000000000002', class_grade: '1', section: '1B1', class_teacher_id: '10000000-0000-0000-0000-000000000005', room_number: 'Room 102, Main Block', total_capacity: 60 },
    { id: '12121212-0000-0000-0000-000000000003', class_grade: '3', section: '3B1', class_teacher_id: '10000000-0000-0000-0000-000000000002', room_number: 'BCA Lab 1', total_capacity: 50 },
    { id: '12121212-0000-0000-0000-000000000004', class_grade: '3', section: '3B2', class_teacher_id: '10000000-0000-0000-0000-000000000005', room_number: 'BCA Lab 2', total_capacity: 50 }
  ]);

  // 9. Curriculum Subjects
  await seedTable('subjects', [
    { id: 'eeeeeeee-0000-0000-0000-000000000001', code: 'BCA101', name: 'Programming in C', course_id: 'aaaaaaaa-0000-0000-0000-000000000001', semester_id: 'cccccccc-0000-0000-0000-000000000001', credits: 4, hours_per_week: 4, status: 'ACTIVE' },
    { id: 'eeeeeeee-0000-0000-0000-000000000002', code: 'BCA102', name: 'Digital Electronics & Logic', course_id: 'aaaaaaaa-0000-0000-0000-000000000001', semester_id: 'cccccccc-0000-0000-0000-000000000001', credits: 4, hours_per_week: 4, status: 'ACTIVE' },
    { id: 'eeeeeeee-0000-0000-0000-000000000003', code: 'BCA201', name: 'Data Structures in C', course_id: 'aaaaaaaa-0000-0000-0000-000000000001', semester_id: 'cccccccc-0000-0000-0000-000000000002', credits: 4, hours_per_week: 4, status: 'ACTIVE' },
    { id: 'eeeeeeee-0000-0000-0000-000000000004', code: 'BCA301', name: 'Python Programming', course_id: 'aaaaaaaa-0000-0000-0000-000000000001', semester_id: 'cccccccc-0000-0000-0000-000000000003', credits: 4, hours_per_week: 4, status: 'ACTIVE' },
    { id: 'eeeeeeee-0000-0000-0000-000000000005', code: 'BCA302', name: 'Database Management Systems (DBMS)', course_id: 'aaaaaaaa-0000-0000-0000-000000000001', semester_id: 'cccccccc-0000-0000-0000-000000000003', credits: 4, hours_per_week: 4, status: 'ACTIVE' },
    { id: 'eeeeeeee-0000-0000-0000-000000000006', code: 'BCA303', name: 'Operating Systems', course_id: 'aaaaaaaa-0000-0000-0000-000000000001', semester_id: 'cccccccc-0000-0000-0000-000000000003', credits: 4, hours_per_week: 4, status: 'ACTIVE' },
    { id: 'eeeeeeee-0000-0000-0000-000000000007', code: 'BCA501', name: 'Artificial Intelligence & ML', course_id: 'aaaaaaaa-0000-0000-0000-000000000001', semester_id: 'cccccccc-0000-0000-0000-000000000005', credits: 4, hours_per_week: 4, status: 'ACTIVE' },
    { id: 'eeeeeeee-0000-0000-0000-000000000008', code: 'BCA502', name: 'Cloud Computing & DevOps', course_id: 'aaaaaaaa-0000-0000-0000-000000000001', semester_id: 'cccccccc-0000-0000-0000-000000000005', credits: 4, hours_per_week: 4, status: 'ACTIVE' }
  ]);

  // 10. Teacher Assignments
  await seedTable('teacher_subject_assignments', [
    { id: 'ffffffff-0000-0000-0000-000000000001', teacher_id: '11111111-0000-0000-0000-000000000002', course_id: 'aaaaaaaa-0000-0000-0000-000000000001', academic_year_id: 'bbbbbbbb-0000-0000-0000-000000000002', semester_id: 'cccccccc-0000-0000-0000-000000000003', section_id: 'dddddddd-0000-0000-0003-000000000002', subject_id: 'eeeeeeee-0000-0000-0000-000000000004', status: 'ACTIVE' },
    { id: 'ffffffff-0000-0000-0000-000000000002', teacher_id: '11111111-0000-0000-0000-000000000005', course_id: 'aaaaaaaa-0000-0000-0000-000000000001', academic_year_id: 'bbbbbbbb-0000-0000-0000-000000000002', semester_id: 'cccccccc-0000-0000-0000-000000000003', section_id: 'dddddddd-0000-0000-0003-000000000003', subject_id: 'eeeeeeee-0000-0000-0000-000000000005', status: 'ACTIVE' },
    { id: 'ffffffff-0000-0000-0000-000000000003', teacher_id: '11111111-0000-0000-0000-000000000004', course_id: 'aaaaaaaa-0000-0000-0000-000000000001', academic_year_id: 'bbbbbbbb-0000-0000-0000-000000000002', semester_id: 'cccccccc-0000-0000-0000-000000000001', section_id: 'dddddddd-0000-0000-0001-000000000001', subject_id: 'eeeeeeee-0000-0000-0000-000000000001', status: 'ACTIVE' }
  ]);

  // 11. Attendance Settings
  await seedTable('attendance_settings', [{
    id: '99999999-0000-0000-0000-000000000001',
    threshold_percentage: 75.0,
    allow_teacher_edit: true,
    send_alert_on_low_attendance: true
  }]);

  // 12. Students Directory (All 765 Students!)
  const campusState = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'database', 'campus_state.json'), 'utf8'));
  const studentRows = campusState.students.map((s, idx) => {
    const rawSection = s.section || '1st Neo';
    const cleanSection = rawSection.replace(/^Section\s+/i, '').trim().slice(0, 10);
    const progCode = (s.source_program || 'BCA').replace(/[^a-zA-Z0-9]/g, '');
    const uniqueRoll = `${progCode}-${s.roll_number || s.admission_no || (idx + 1)}`;

    return {
      id: pseudoUuid('stu', (idx + 1000)),
      name: String(s.name).slice(0, 255),
      roll_number: uniqueRoll.slice(0, 50),
      admission_no: s.admission_no ? String(s.admission_no).slice(0, 50) : null,
      register_number: s.register_number ? String(s.register_number).slice(0, 50) : null,
      uucms_no: s.uucms_no ? String(s.uucms_no).slice(0, 50) : null,
      gender: String(s.gender || 'MALE').slice(0, 20),
      dob: s.dob ? String(s.dob).slice(0, 50) : null,
      source_program: String(s.source_program || 'BCA').slice(0, 50),
      sl_no: s.sl_no || (idx + 1),
      class_grade: String(s.class_grade || '1').slice(0, 20),
      section: cleanSection,
      guardian_name: String(s.guardian_name || `Guardian of ${s.name}`).slice(0, 255),
      guardian_phone: String(s.guardian_phone || '+91 9720000000').slice(0, 20),
      attendance_rate: s.attendance_rate || 85.0,
      medical_notes: 'None',
      status: s.status || 'ACTIVE',
      course_id: 'aaaaaaaa-0000-0000-0000-000000000001',
      academic_year_id: 'bbbbbbbb-0000-0000-0000-000000000002',
      semester_id: 'cccccccc-0000-0000-0000-000000000001',
      section_id: 'dddddddd-0000-0000-0001-000000000001'
    };
  });
  await seedTable('students', studentRows, 'id');

  // 13. Dynamic Attendance Sessions
  await seedTable('attendance_sessions', [
    {
      id: '51515151-0000-0000-0000-000000000001',
      course_id: 'aaaaaaaa-0000-0000-0000-000000000001',
      academic_year_id: 'bbbbbbbb-0000-0000-0000-000000000002',
      semester_id: 'cccccccc-0000-0000-0000-000000000001',
      section_id: 'dddddddd-0000-0000-0001-000000000001',
      subject_id: 'eeeeeeee-0000-0000-0000-000000000001',
      date: new Date().toISOString().split('T')[0],
      session_name: 'Morning Lecture - Intro to C',
      recorded_by: '10000000-0000-0000-0000-000000000002'
    },
    {
      id: '51515151-0000-0000-0000-000000000002',
      course_id: 'aaaaaaaa-0000-0000-0000-000000000001',
      academic_year_id: 'bbbbbbbb-0000-0000-0000-000000000002',
      semester_id: 'cccccccc-0000-0000-0000-000000000001',
      section_id: 'dddddddd-0000-0000-0001-000000000001',
      subject_id: 'eeeeeeee-0000-0000-0000-000000000002',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      session_name: 'Digital Logic Workshop',
      recorded_by: '10000000-0000-0000-0000-000000000005'
    }
  ]);

  // 14. Attendance Session Records
  const first5Students = studentRows.slice(0, 5);
  const sessionRecords = first5Students.map((st, i) => ({
    id: pseudoUuid('rec', i),
    session_id: '51515151-0000-0000-0000-000000000001',
    student_id: st.id,
    status: i === 3 ? 'ABSENT' : (i === 4 ? 'EXCUSED' : 'PRESENT'),
    notes: i === 3 ? 'Unexcused absence' : (i === 4 ? 'Medical slip approved' : 'Attentive')
  }));
  await seedTable('attendance_session_records', sessionRecords);

  // 15. Daily Attendance Roll
  const todayStr = new Date().toISOString().split('T')[0];
  const dailyRoll = first5Students.map((st, i) => ({
    id: pseudoUuid('att-roll', i),
    student_id: st.id,
    class_grade: '1',
    section: '1st Neo',
    date: todayStr,
    status: i === 3 ? 'ABSENT' : 'PRESENT',
    notes: i === 3 ? 'Fever' : null,
    recorded_by: '10000000-0000-0000-0000-000000000002'
  }));
  await seedTable('attendance', dailyRoll);

  // 16. Campus Facilities & Maintenance
  await seedTable('maintenance_issues', [
    {
      id: '33333333-0000-0000-0000-000000000001',
      reported_by_name: 'Sarah Jenkins',
      reported_by_role: 'TEACHER',
      title: 'Projector not working in BCA Lab 1',
      description: 'The ceiling projector fails to power on and HDMI signal flickers constantly during lectures.',
      location: 'BCA Lab 1, West Wing 2nd Floor',
      category: 'Projector',
      priority: 'MEDIUM',
      status: 'PENDING',
      assigned_to_name: 'Rajesh Kumar (Facilities)',
      assigned_to_id: '11111111-0000-0000-0000-000000000003',
      notes: 'Replacement HDMI optical transmitter cable requested.',
      sms_sent: true
    },
    {
      id: '33333333-0000-0000-0000-000000000002',
      reported_by_name: 'Marcus Chen',
      reported_by_role: 'TEACHER',
      title: 'Water pipe leakage in Science Lab 2',
      description: 'Continuous drip under main chemistry washbasin causing puddle hazard on floor.',
      location: 'Science Block B, Room 204',
      category: 'Water Leakage',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assigned_to_name: 'Rajesh Kumar (Facilities)',
      assigned_to_id: '11111111-0000-0000-0000-000000000003',
      notes: 'Maintenance lead on site isolating shutoff valve.',
      sms_sent: true
    },
    {
      id: '33333333-0000-0000-0000-000000000003',
      reported_by_name: 'Elena Rostova',
      reported_by_role: 'TEACHER',
      title: 'Wi-Fi Access Point offline in Library 2nd Floor',
      description: 'Mesh repeater node 4 lost power, preventing students from digital reference access.',
      location: 'Central Library Mezzanine',
      category: 'Internet Problem',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      assigned_to_name: 'Elena Rostova (IT)',
      assigned_to_id: '11111111-0000-0000-0000-000000000004',
      notes: 'Power adapter swapped and mesh controller re-synced.',
      sms_sent: false
    }
  ]);

  // 17. Smart Requests
  await seedTable('requests', [
    {
      id: '44444444-0000-0000-0000-000000000001',
      requester_id: '10000000-0000-0000-0000-000000000006',
      requester_name: 'ABHISHEK R',
      requester_role: 'STUDENT',
      request_type: 'Bonafide request',
      title: 'Bonafide Certificate for National Science Olympiad registration',
      description: 'Need certified bonafide document by end of week for exam registration.',
      location: 'Admissions Office',
      ai_category: 'Academic Certificate',
      ai_priority: 'MEDIUM',
      assigned_department: 'Student Services',
      assigned_to: 'Administration Desk',
      status: 'IN_PROGRESS'
    },
    {
      id: '44444444-0000-0000-0000-000000000002',
      requester_id: '10000000-0000-0000-0000-000000000007',
      requester_name: 'AJAY PRASAD',
      requester_role: 'STUDENT',
      request_type: 'ID card request',
      title: 'Replacement ID Card - original lost during bus commute',
      description: 'Lost ID badge yesterday on Route 4 bus.',
      location: 'Main Gate Office',
      ai_category: 'Student Identity',
      ai_priority: 'LOW',
      assigned_department: 'Administration',
      assigned_to: 'Security Desk',
      status: 'RESOLVED',
      resolution_notes: 'Replacement RFID ID card BCA-2026-002 issued to student.'
    },
    {
      id: '44444444-0000-0000-0000-000000000003',
      requester_id: '10000000-0000-0000-0000-000000000005',
      requester_name: 'Marcus Chen',
      requester_role: 'TEACHER',
      request_type: 'Classroom issue',
      title: 'HDMI splitter replacement in Audio-Visual Room 1',
      description: 'Splitter port 2 does not transmit audio to surround speakers.',
      location: 'AV Hall 1',
      ai_category: 'Equipment',
      ai_priority: 'HIGH',
      assigned_department: 'Facilities & Maintenance',
      assigned_to: 'Rajesh Kumar',
      status: 'PENDING'
    }
  ]);

  // 18. Leave Requests
  await seedTable('leave_requests', [
    {
      id: '55555555-0000-0000-0000-000000000001',
      applicant_id: '10000000-0000-0000-0000-000000000002',
      applicant_name: 'Sarah Jenkins',
      applicant_role: 'TEACHER',
      applicant_phone: '+15550192832',
      leave_type: 'Medical',
      start_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      days_count: 2,
      reason: 'Scheduled dental extraction and recovery.',
      status: 'PENDING',
      sms_dispatched: false
    },
    {
      id: '55555555-0000-0000-0000-000000000002',
      applicant_id: '10000000-0000-0000-0000-000000000006',
      applicant_name: 'ABHISHEK R',
      applicant_role: 'STUDENT',
      applicant_phone: '+91 9810000000',
      leave_type: 'Medical',
      start_date: todayStr,
      end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      days_count: 2,
      reason: 'Respiratory recovery under physician advice.',
      status: 'APPROVED',
      reviewer_notes: 'Doctor note verified by school clinic.',
      sms_dispatched: true
    }
  ]);

  // 19. Timetable Slots
  await seedTable('timetable', [
    { id: '61616161-0000-0000-0000-000000000001', class_grade: '1', section: '1st Neo', day_of_week: 'Monday', period: 1, time_range: '08:45 - 09:30', subject: 'Programming in C (BCA101)', teacher_name: 'Sarah Jenkins', room: 'BCA Lab 1' },
    { id: '61616161-0000-0000-0000-000000000002', class_grade: '1', section: '1st Neo', day_of_week: 'Monday', period: 2, time_range: '09:35 - 10:20', subject: 'Digital Electronics & Logic (BCA102)', teacher_name: 'Marcus Chen', room: 'Electronics Lab' },
    { id: '61616161-0000-0000-0000-000000000003', class_grade: '1', section: '1st Neo', day_of_week: 'Monday', period: 3, time_range: '10:35 - 11:20', subject: 'Discrete Mathematics (BCA103)', teacher_name: 'Elena Rostova', room: 'Room 101' },
    { id: '61616161-0000-0000-0000-000000000004', class_grade: '1', section: '1st Neo', day_of_week: 'Monday', period: 4, time_range: '11:25 - 12:10', subject: 'Communicative English', teacher_name: 'Dr. Alistair Vance', room: 'Seminar Hall 1' },
    { id: '61616161-0000-0000-0000-000000000005', class_grade: '1', section: '1st Neo', day_of_week: 'Monday', period: 5, time_range: '01:00 - 01:45', subject: 'C Programming Lab Hands-on', teacher_name: 'Sarah Jenkins', room: 'BCA Lab 1' },
    { id: '61616161-0000-0000-0000-000000000006', class_grade: '1', section: '1st Neo', day_of_week: 'Tuesday', period: 1, time_range: '08:45 - 09:30', subject: 'Digital Electronics & Logic (BCA102)', teacher_name: 'Marcus Chen', room: 'Electronics Lab' },
    { id: '61616161-0000-0000-0000-000000000007', class_grade: '1', section: '1st Neo', day_of_week: 'Tuesday', period: 2, time_range: '09:35 - 10:20', subject: 'Programming in C (BCA101)', teacher_name: 'Sarah Jenkins', room: 'BCA Lab 1' },
    { id: '61616161-0000-0000-0000-000000000008', class_grade: '1', section: '1st Neo', day_of_week: 'Tuesday', period: 3, time_range: '10:35 - 11:20', subject: 'Communicative English', teacher_name: 'Dr. Alistair Vance', room: 'Seminar Hall 1' }
  ]);

  // 20. Announcements
  await seedTable('announcements', [
    {
      id: '66666666-0000-0000-0000-000000000001',
      title: 'Annual Science & Robotics Exhibition Tomorrow',
      content: 'All class representatives must submit display project specs by 11:00 AM at the Multipurpose Auditorium.',
      target_audience: 'ALL',
      priority: 'URGENT',
      author_name: 'Dr. Alistair Vance',
      email_broadcast: true,
      sms_broadcast: true
    },
    {
      id: '66666666-0000-0000-0000-000000000002',
      title: 'Staff Faculty Meeting: Term 2 Operations Review',
      content: 'Mandatory 30-minute sync at 3:45 PM in the Conference Hall regarding digital attendance adoption.',
      target_audience: 'TEACHERS',
      priority: 'NORMAL',
      author_name: 'Principal Vance',
      email_broadcast: false,
      sms_broadcast: false
    }
  ]);

  // 21. Notifications
  await seedTable('notifications', [
    {
      id: '77777777-0000-0000-0000-000000000001',
      user_id: '10000000-0000-0000-0000-000000000001',
      title: 'New Campus Issue Reported',
      message: 'Sarah Jenkins reported: Projector not working in BCA Lab 1 (Assigned to Maintenance).',
      type: 'WARNING',
      related_type: 'MAINTENANCE',
      related_id: '33333333-0000-0000-0000-000000000001',
      read: false
    },
    {
      id: '77777777-0000-0000-0000-000000000002',
      user_id: '10000000-0000-0000-0000-000000000006',
      title: 'Leave Request Approved',
      message: 'Leave for ABHISHEK R has been approved. Guardian SMS triggered.',
      type: 'SUCCESS',
      related_type: 'LEAVE',
      related_id: '55555555-0000-0000-0000-000000000002',
      read: false
    },
    {
      id: '77777777-0000-0000-0000-000000000003',
      user_id: '10000000-0000-0000-0000-000000000003',
      title: 'Urgent Maintenance Alert',
      message: 'Water leakage in Science Lab 2 marked High Priority. Maintenance Lead Rajesh Kumar on site.',
      type: 'URGENT',
      related_type: 'MAINTENANCE',
      related_id: '33333333-0000-0000-0000-000000000002',
      read: true
    }
  ]);

  // 22. Email Logs
  await seedTable('email_logs', [
    {
      id: '88888888-0000-0000-0000-000000000001',
      recipient_email: 'rajesh.k@devora.edu',
      recipient_name: 'Rajesh Kumar (Facilities)',
      recipient_phone: '+15550192833',
      subject: 'DEVORA ALERT: High Priority Issue: Water pipe leakage in Science Lab 2',
      message: 'A High Priority maintenance issue has been assigned: Water pipe leakage in Science Lab 2 (Science Block B, Room 204).',
      template_id: 'DEVORA_MNT_ALERT',
      status: 'DELIVERED',
      trigger_event: 'Maintenance Assignment',
      response_payload: '{"smtpCode": 250, "accepted": ["rajesh.k@devora.edu"]}'
    },
    {
      id: '88888888-0000-0000-0000-000000000002',
      recipient_email: 'guardian.abhishek.r@example.com',
      recipient_name: 'Guardian of ABHISHEK R',
      recipient_phone: '+91 9720000000',
      subject: 'Devora School: Leave Application Approved for ABHISHEK R',
      message: 'Medical leave request for ABHISHEK R (2 days) has been APPROVED. Clinic doctor verification completed.',
      template_id: 'DEVORA_LEAVE_APPROVED',
      status: 'DELIVERED',
      trigger_event: 'Leave Approval',
      response_payload: '{"smtpCode": 250, "accepted": ["guardian.abhishek.r@example.com"]}'
    }
  ]);

  // 23. AI Insights
  await seedTable('ai_insights', [
    {
      id: '91919191-0000-0000-0000-000000000001',
      insight_type: 'ATTENDANCE_ANOMALY',
      title: 'Attendance drop detected in BCA 1st Neo',
      description: 'Absence rate rose to 20% on Friday morning lecture. 1 pending sick leave ticket triaged.',
      severity: 'WARNING'
    },
    {
      id: '91919191-0000-0000-0000-000000000002',
      insight_type: 'FACILITY_URGENCY',
      title: 'Science Lab 2 plumbing leak requires expedited shutoff',
      description: 'Continuous water drip reported. Assigned to Facilities Lead Rajesh Kumar for priority remediation.',
      severity: 'ACTION_REQUIRED'
    },
    {
      id: '91919191-0000-0000-0000-000000000003',
      insight_type: 'OPERATIONS_NORMAL',
      title: 'Campus morning operations sync successful',
      description: 'All 24 sections scheduled. Timetables broadcast and notifications operational.',
      severity: 'INFO'
    }
  ]);

  // 24. Audit Logs
  await seedTable('audit_logs', [
    {
      id: '92929292-0000-0000-0000-000000000001',
      user_name: 'Dr. Alistair Vance',
      user_role: 'ADMIN',
      action: 'SYSTEM_LOGIN',
      details: 'Administrative authentication successful via Devora AI Gateway',
      ip_address: '127.0.0.1'
    },
    {
      id: '92929292-0000-0000-0000-000000000002',
      user_name: 'Sarah Jenkins',
      user_role: 'TEACHER',
      action: 'ATTENDANCE_RECORDED',
      details: 'Attendance marked for BCA 1st Neo: 4 Present, 1 Absent',
      ip_address: '127.0.0.1'
    },
    {
      id: '92929292-0000-0000-0000-000000000003',
      user_name: 'Rajesh Kumar',
      user_role: 'ADMIN',
      action: 'MAINTENANCE_STATUS_UPDATE',
      details: 'Issue 33333333-0000-0000-0000-000000000002 updated to IN_PROGRESS',
      ip_address: '127.0.0.1'
    }
  ]);

  console.log('\n--- ALL 24 TABLES AND DATA SECTORS INSERTED INTO SUPABASE SUCCESSFULLY! ---');
}

run().catch(err => {
  console.error('Fatal error during seed:', err);
  process.exit(1);
});
