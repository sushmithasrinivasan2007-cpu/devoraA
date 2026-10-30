import fs from 'fs';
import path from 'path';

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function pseudoUuid(prefix, id) {
  const hex = Buffer.from(prefix + '-' + String(id)).toString('hex').padEnd(32, '0').slice(0, 32);
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
}

function buildSeedSql() {
  const lines = [];
  lines.push(`-- ==========================================================`);
  lines.push(`-- DEVORA AI: COMPLETE MULTI-SECTOR SEED DATA FOR SUPABASE`);
  lines.push(`-- Generates authentic data for all 16 platform operational sectors`);
  lines.push(`-- ==========================================================\n`);

  // 1. Notification Preferences
  lines.push(`-- 1. NOTIFICATION PREFERENCES`);
  lines.push(`INSERT INTO public.notification_preferences (id, email_leave_updates, email_maintenance_urgent, email_emergency_alerts, email_attendance_low, email_request_resolved, sms_leave_updates, sms_maintenance_urgent, sms_emergency_alerts, sms_attendance_low, sms_request_resolved) VALUES`);
  lines.push(`('00000000-0000-0000-0000-000000000001', true, true, true, true, true, true, true, true, true, true)`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 2. Users Table
  lines.push(`-- 2. USERS (ADMIN, TEACHERS, STUDENTS)`);
  lines.push(`INSERT INTO public.users (id, name, email, role, phone, department, class_assigned) VALUES`);
  lines.push(`('10000000-0000-0000-0000-000000000001', 'Dr. Alistair Vance', 'director@devora.edu', 'ADMIN', '+15550192831', 'Operations', NULL),`);
  lines.push(`('10000000-0000-0000-0000-000000000002', 'Sarah Jenkins', 's.jenkins@devora.edu', 'TEACHER', '+15550192832', 'Academics', 'BCA 3B1'),`);
  lines.push(`('10000000-0000-0000-0000-000000000003', 'Rajesh Kumar', 'rajesh.k@devora.edu', 'ADMIN', '+15550192833', 'Facilities & Maintenance', NULL),`);
  lines.push(`('10000000-0000-0000-0000-000000000004', 'Elena Rostova', 'e.rostova@devora.edu', 'TEACHER', '+15550192834', 'Information Technology', NULL),`);
  lines.push(`('10000000-0000-0000-0000-000000000005', 'Marcus Chen', 'm.chen@devora.edu', 'TEACHER', '+15550192835', 'Academics', 'BCA 3B2'),`);
  lines.push(`('10000000-0000-0000-0000-000000000006', 'ABHISHEK R', 'abhishek.r.1@devora.edu', 'STUDENT', '+91 9810000000', 'BCA', NULL),`);
  lines.push(`('10000000-0000-0000-0000-000000000007', 'AJAY PRASAD', 'ajay.prasad.2@devora.edu', 'STUDENT', '+91 9810000001', 'BCA', NULL)`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 3. Staff Table
  lines.push(`-- 3. STAFF / FACULTY`);
  lines.push(`INSERT INTO public.staff (id, user_id, name, employee_id, role_title, department, email, phone, status) VALUES`);
  lines.push(`('11111111-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Dr. Alistair Vance', 'EMP-ADM-01', 'Campus Director', 'Operations', 'director@devora.edu', '+15550192831', 'ACTIVE'),`);
  lines.push(`('11111111-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Sarah Jenkins', 'EMP-TCH-08', 'Senior Faculty - Computer Applications', 'Academics', 's.jenkins@devora.edu', '+15550192832', 'ACTIVE'),`);
  lines.push(`('11111111-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Rajesh Kumar', 'EMP-MNT-04', 'Facilities & Operations Lead', 'Facilities & Maintenance', 'rajesh.k@devora.edu', '+15550192833', 'ACTIVE'),`);
  lines.push(`('11111111-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Elena Rostova', 'EMP-ITS-02', 'IT Support & Systems Engineer', 'Information Technology', 'e.rostova@devora.edu', '+15550192834', 'ACTIVE'),`);
  lines.push(`('11111111-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Marcus Chen', 'EMP-TCH-10', 'Associate Faculty - Systems', 'Academics', 'm.chen@devora.edu', '+15550192835', 'ACTIVE')`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 4. Courses
  lines.push(`-- 4. ACADEMIC COURSES`);
  lines.push(`INSERT INTO public.courses (id, code, name, description, duration_years, status) VALUES`);
  lines.push(`('aaaaaaaa-0000-0000-0000-000000000001', 'BCA', 'Bachelor of Computer Applications', '3-Year undergraduate computing program', 3, 'ACTIVE'),`);
  lines.push(`('aaaaaaaa-0000-0000-0000-000000000002', 'BBA', 'Bachelor of Business Administration', '3-Year management and leadership program', 3, 'ACTIVE'),`);
  lines.push(`('aaaaaaaa-0000-0000-0000-000000000003', 'B.Com', 'Bachelor of Commerce', '3-Year financial and accounting studies', 3, 'ACTIVE'),`);
  lines.push(`('aaaaaaaa-0000-0000-0000-000000000004', 'MCA', 'Master of Computer Applications', '2-Year postgraduate advanced computing', 2, 'ACTIVE')`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 5. Academic Years
  lines.push(`-- 5. ACADEMIC YEARS`);
  lines.push(`INSERT INTO public.academic_years (id, name, start_date, end_date, is_current, status) VALUES`);
  lines.push(`('bbbbbbbb-0000-0000-0000-000000000001', '2025-26', '2025-06-01', '2026-05-31', false, 'ACTIVE'),`);
  lines.push(`('bbbbbbbb-0000-0000-0000-000000000002', '2026-27', '2026-06-01', '2027-05-31', true, 'ACTIVE'),`);
  lines.push(`('bbbbbbbb-0000-0000-0000-000000000003', '2027-28', '2027-06-01', '2028-05-31', false, 'ACTIVE')`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 6. Semesters
  lines.push(`-- 6. SEMESTERS`);
  lines.push(`INSERT INTO public.semesters (id, course_id, number, name, status) VALUES`);
  lines.push(`('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 1, '1st Semester', 'ACTIVE'),`);
  lines.push(`('cccccccc-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 2, '2nd Semester', 'ACTIVE'),`);
  lines.push(`('cccccccc-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 3, '3rd Semester', 'ACTIVE'),`);
  lines.push(`('cccccccc-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 4, '4th Semester', 'ACTIVE'),`);
  lines.push(`('cccccccc-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', 5, '5th Semester', 'ACTIVE'),`);
  lines.push(`('cccccccc-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000001', 6, '6th Semester', 'ACTIVE')`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 7. Sections
  lines.push(`-- 7. SECTIONS`);
  lines.push(`INSERT INTO public.sections (id, course_id, semester_id, name, status) VALUES`);
  lines.push(`-- 1st Sem Sections`);
  lines.push(`('dddddddd-0000-0000-0001-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', '1st Neo', 'ACTIVE'),`);
  lines.push(`('dddddddd-0000-0000-0001-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', '1B1', 'ACTIVE'),`);
  lines.push(`('dddddddd-0000-0000-0001-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', '1B2', 'ACTIVE'),`);
  lines.push(`('dddddddd-0000-0000-0001-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', '1B3', 'ACTIVE'),`);
  lines.push(`-- 2nd Sem Sections`);
  lines.push(`('dddddddd-0000-0000-0002-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000002', '2nd Neo', 'ACTIVE'),`);
  lines.push(`('dddddddd-0000-0000-0002-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000002', '2B1', 'ACTIVE'),`);
  lines.push(`('dddddddd-0000-0000-0002-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000002', '2B2', 'ACTIVE'),`);
  lines.push(`('dddddddd-0000-0000-0002-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000002', '2B3', 'ACTIVE'),`);
  lines.push(`-- 3rd Sem Sections`);
  lines.push(`('dddddddd-0000-0000-0003-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000003', '3rd Neo', 'ACTIVE'),`);
  lines.push(`('dddddddd-0000-0000-0003-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000003', '3B1', 'ACTIVE'),`);
  lines.push(`('dddddddd-0000-0000-0003-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000003', '3B2', 'ACTIVE'),`);
  lines.push(`('dddddddd-0000-0000-0003-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000003', '3B3', 'ACTIVE'),`);
  lines.push(`-- 4th Sem Sections`);
  lines.push(`('dddddddd-0000-0000-0004-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000004', '4th Neo', 'ACTIVE'),`);
  lines.push(`('dddddddd-0000-0000-0004-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000004', '4B1', 'ACTIVE'),`);
  lines.push(`('dddddddd-0000-0000-0004-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000004', '4B2', 'ACTIVE'),`);
  lines.push(`('dddddddd-0000-0000-0004-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000004', '4B3', 'ACTIVE'),`);
  lines.push(`-- 5th Sem Sections`);
  lines.push(`('dddddddd-0000-0000-0005-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000005', '5th Neo', 'ACTIVE'),`);
  lines.push(`('dddddddd-0000-0000-0005-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000005', '5B1', 'ACTIVE'),`);
  lines.push(`('dddddddd-0000-0000-0005-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000005', '5B2', 'ACTIVE'),`);
  lines.push(`('dddddddd-0000-0000-0005-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000005', '5B3', 'ACTIVE'),`);
  lines.push(`-- 6th Sem Sections`);
  lines.push(`('dddddddd-0000-0000-0006-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000006', '6th Neo', 'ACTIVE'),`);
  lines.push(`('dddddddd-0000-0000-0006-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000006', '6B1', 'ACTIVE'),`);
  lines.push(`('dddddddd-0000-0000-0006-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000006', '6B2', 'ACTIVE'),`);
  lines.push(`('dddddddd-0000-0000-0006-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000006', '6B3', 'ACTIVE')`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 8. Classes
  lines.push(`-- 8. PHYSICAL CLASSROOMS / CLASSES`);
  lines.push(`INSERT INTO public.classes (id, class_grade, section, class_teacher_id, room_number, total_capacity) VALUES`);
  lines.push(`('12121212-0000-0000-0000-000000000001', '1', '1st Neo', '10000000-0000-0000-0000-000000000002', 'Room 101, Main Block', 60),`);
  lines.push(`('12121212-0000-0000-0000-000000000002', '1', '1B1', '10000000-0000-0000-0000-000000000005', 'Room 102, Main Block', 60),`);
  lines.push(`('12121212-0000-0000-0000-000000000003', '3', '3B1', '10000000-0000-0000-0000-000000000002', 'BCA Lab 1', 50),`);
  lines.push(`('12121212-0000-0000-0000-000000000004', '3', '3B2', '10000000-0000-0000-0000-000000000005', 'BCA Lab 2', 50)`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 9. Subjects
  lines.push(`-- 9. CURRICULUM SUBJECTS`);
  lines.push(`INSERT INTO public.subjects (id, code, name, course_id, semester_id, credits, hours_per_week, status) VALUES`);
  lines.push(`('eeeeeeee-0000-0000-0000-000000000001', 'BCA101', 'Programming in C', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', 4, 4, 'ACTIVE'),`);
  lines.push(`('eeeeeeee-0000-0000-0000-000000000002', 'BCA102', 'Digital Electronics & Logic', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', 4, 4, 'ACTIVE'),`);
  lines.push(`('eeeeeeee-0000-0000-0000-000000000003', 'BCA201', 'Data Structures in C', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000002', 4, 4, 'ACTIVE'),`);
  lines.push(`('eeeeeeee-0000-0000-0000-000000000004', 'BCA301', 'Python Programming', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000003', 4, 4, 'ACTIVE'),`);
  lines.push(`('eeeeeeee-0000-0000-0000-000000000005', 'BCA302', 'Database Management Systems (DBMS)', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000003', 4, 4, 'ACTIVE'),`);
  lines.push(`('eeeeeeee-0000-0000-0000-000000000006', 'BCA303', 'Operating Systems', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000003', 4, 4, 'ACTIVE'),`);
  lines.push(`('eeeeeeee-0000-0000-0000-000000000007', 'BCA501', 'Artificial Intelligence & ML', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000005', 4, 4, 'ACTIVE'),`);
  lines.push(`('eeeeeeee-0000-0000-0000-000000000008', 'BCA502', 'Cloud Computing & DevOps', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000005', 4, 4, 'ACTIVE')`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 10. Teacher Subject Assignments
  lines.push(`-- 10. TEACHER ALLOCATIONS & SUBJECT ASSIGNMENTS`);
  lines.push(`INSERT INTO public.teacher_subject_assignments (id, teacher_id, course_id, academic_year_id, semester_id, section_id, subject_id, status) VALUES`);
  lines.push(`('ffffffff-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000003', 'dddddddd-0000-0000-0003-000000000002', 'eeeeeeee-0000-0000-0000-000000000004', 'ACTIVE'),`);
  lines.push(`('ffffffff-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000003', 'dddddddd-0000-0000-0003-000000000003', 'eeeeeeee-0000-0000-0000-000000000005', 'ACTIVE'),`);
  lines.push(`('ffffffff-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0001-000000000001', 'eeeeeeee-0000-0000-0000-000000000001', 'ACTIVE')`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 11. Core Students
  lines.push(`-- 11. STUDENTS DIRECTORY`);
  lines.push(`INSERT INTO public.students (id, user_id, name, roll_number, admission_no, register_number, uucms_no, gender, dob, source_program, sl_no, class_grade, section, guardian_name, guardian_phone, attendance_rate, medical_notes, status, course_id, academic_year_id, semester_id, section_id) VALUES`);
  lines.push(`('22222222-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', 'ABHISHEK R', '494/2026-27', '494/2026-27', 'U11VU26S0094', 'U11VU26S0094', 'MALE', '2009-02-23', 'BCA', 1, '1', '1st Neo', 'Guardian of ABHISHEK R', '+91 9720000000', 75.0, 'Mild pollen allergy', 'ACTIVE', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0001-000000000001'),`);
  lines.push(`('22222222-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007', 'AJAY PRASAD', '405/2026-27', '405/2026-27', 'U11VU26S0078', 'U11VU26S0078', 'MALE', '2008-01-20', 'BCA', 2, '1', '1st Neo', 'Guardian of AJAY PRASAD', '+91 9720000001', 87.5, 'None', 'ACTIVE', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0001-000000000001'),`);
  lines.push(`('22222222-0000-0000-0000-000000000003', NULL, 'AKASH T N', '353/2026-27', '353/2026-27', 'U11VU26S0065', 'U11VU26S0065', 'MALE', '2008-09-14', 'BCA', 3, '1', '1st Neo', 'Guardian of AKASH T N', '+91 9720000002', 100.0, 'None', 'ACTIVE', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0001-000000000001'),`);
  lines.push(`('22222222-0000-0000-0000-000000000004', NULL, 'AKRAM PASHA', '172/2026-27', '172/2026-27', 'U11VU26S0032', 'U11VU26S0032', 'MALE', '2008-04-10', 'BCA', 4, '1', '1st Neo', 'Guardian of AKRAM PASHA', '+91 9720000003', 100.0, 'None', 'ACTIVE', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0001-000000000001'),`);
  lines.push(`('22222222-0000-0000-0000-000000000005', NULL, 'AKSHAYKUMAR N R', '395/2026-27', '395/2026-27', 'U11VU26S0075', 'U11VU26S0075', 'MALE', '2008-11-22', 'BCA', 5, '1', '1st Neo', 'Guardian of AKSHAYKUMAR N R', '+91 9720000004', 87.5, 'None', 'ACTIVE', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0001-000000000001')`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 12. Attendance Settings
  lines.push(`-- 12. ATTENDANCE CONFIGURATION & RULES`);
  lines.push(`INSERT INTO public.attendance_settings (id, threshold_percentage, allow_teacher_edit, send_alert_on_low_attendance) VALUES`);
  lines.push(`('99999999-0000-0000-0000-000000000001', 75.0, true, true)`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 13. Dynamic Attendance Sessions
  lines.push(`-- 13. ATTENDANCE SESSIONS`);
  lines.push(`INSERT INTO public.attendance_sessions (id, course_id, academic_year_id, semester_id, section_id, subject_id, date, session_name, recorded_by, created_at) VALUES`);
  lines.push(`('51515151-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0001-000000000001', 'eeeeeeee-0000-0000-0000-000000000001', CURRENT_DATE, 'Morning Lecture - Intro to C', '10000000-0000-0000-0000-000000000002', NOW() - INTERVAL '3 hours'),`);
  lines.push(`('51515151-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0001-000000000001', 'eeeeeeee-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '1 day', 'Digital Logic Workshop', '10000000-0000-0000-0000-000000000005', NOW() - INTERVAL '1 day')`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 14. Attendance Session Records
  lines.push(`-- 14. ATTENDANCE RECORDS PER SESSION`);
  lines.push(`INSERT INTO public.attendance_session_records (id, session_id, student_id, status, notes) VALUES`);
  lines.push(`('52525252-0000-0000-0000-000000000001', '51515151-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'PRESENT', 'Attentive'),`);
  lines.push(`('52525252-0000-0000-0000-000000000002', '51515151-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', 'PRESENT', 'On time'),`);
  lines.push(`('52525252-0000-0000-0000-000000000003', '51515151-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000003', 'PRESENT', NULL),`);
  lines.push(`('52525252-0000-0000-0000-000000000004', '51515151-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000004', 'ABSENT', 'Unexcused absence'),`);
  lines.push(`('52525252-0000-0000-0000-000000000005', '51515151-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000005', 'EXCUSED', 'Medical slip approved')`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 15. Daily Attendance Table
  lines.push(`-- 15. DAILY ATTENDANCE ROLL SUMMARY`);
  lines.push(`INSERT INTO public.attendance (id, student_id, class_grade, section, date, status, notes, recorded_by) VALUES`);
  lines.push(`('53535353-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', '1', '1st Neo', CURRENT_DATE, 'PRESENT', NULL, '10000000-0000-0000-0000-000000000002'),`);
  lines.push(`('53535353-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', '1', '1st Neo', CURRENT_DATE, 'PRESENT', NULL, '10000000-0000-0000-0000-000000000002'),`);
  lines.push(`('53535353-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000003', '1', '1st Neo', CURRENT_DATE, 'PRESENT', NULL, '10000000-0000-0000-0000-000000000002'),`);
  lines.push(`('53535353-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000004', '1', '1st Neo', CURRENT_DATE, 'ABSENT', 'Fever', '10000000-0000-0000-0000-000000000002'),`);
  lines.push(`('53535353-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000005', '1', '1st Neo', CURRENT_DATE, 'PRESENT', NULL, '10000000-0000-0000-0000-000000000002')`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 16. Maintenance Issues
  lines.push(`-- 16. CAMPUS FACILITIES & MAINTENANCE`);
  lines.push(`INSERT INTO public.maintenance_issues (id, reported_by_name, reported_by_role, title, description, location, category, priority, status, assigned_to_name, assigned_to_id, notes, sms_sent, created_at, resolved_at) VALUES`);
  lines.push(`('33333333-0000-0000-0000-000000000001', 'Sarah Jenkins', 'TEACHER', 'Projector not working in BCA Lab 1', 'The ceiling projector fails to power on and HDMI signal flickers constantly during lectures.', 'BCA Lab 1, West Wing 2nd Floor', 'Projector', 'MEDIUM', 'PENDING', 'Rajesh Kumar (Facilities)', '11111111-0000-0000-0000-000000000003', 'Replacement HDMI optical transmitter cable requested.', true, NOW() - INTERVAL '45 minutes', NULL),`);
  lines.push(`('33333333-0000-0000-0000-000000000002', 'Marcus Chen', 'TEACHER', 'Water pipe leakage in Science Lab 2', 'Continuous drip under main chemistry washbasin causing puddle hazard on floor.', 'Science Block B, Room 204', 'Water Leakage', 'HIGH', 'IN_PROGRESS', 'Rajesh Kumar (Facilities)', '11111111-0000-0000-0000-000000000003', 'Maintenance lead on site isolating shutoff valve.', true, NOW() - INTERVAL '3 hours', NULL),`);
  lines.push(`('33333333-0000-0000-0000-000000000003', 'Elena Rostova', 'TEACHER', 'Wi-Fi Access Point offline in Library 2nd Floor', 'Mesh repeater node 4 lost power, preventing students from digital reference access.', 'Central Library Mezzanine', 'Internet Problem', 'MEDIUM', 'RESOLVED', 'Elena Rostova (IT)', '11111111-0000-0000-0000-000000000004', 'Power adapter swapped and mesh controller re-synced.', false, NOW() - INTERVAL '1 day', NOW() - INTERVAL '6 hours')`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 17. Smart Requests
  lines.push(`-- 17. SMART REQUESTS & HELPDESK`);
  lines.push(`INSERT INTO public.requests (id, requester_id, requester_name, requester_role, request_type, title, description, location, ai_category, ai_priority, assigned_department, assigned_to, status, resolution_notes, created_at, updated_at) VALUES`);
  lines.push(`('44444444-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', 'ABHISHEK R', 'STUDENT', 'Bonafide request', 'Bonafide Certificate for National Science Olympiad registration', 'Admissions Office', 'Academic Certificate', 'MEDIUM', 'Student Services', 'Administration Desk', 'IN_PROGRESS', NULL, NOW() - INTERVAL '2 hours', NOW()),`);
  lines.push(`('44444444-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007', 'AJAY PRASAD', 'STUDENT', 'ID card request', 'Replacement ID Card - original lost during bus commute', 'Main Gate Office', 'Student Identity', 'LOW', 'Administration', 'Security Desk', 'RESOLVED', 'Replacement RFID ID card BCA-2026-002 issued to student.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 hours'),`);
  lines.push(`('44444444-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', 'Marcus Chen', 'TEACHER', 'Classroom issue', 'HDMI splitter replacement in Audio-Visual Room 1', 'AV Hall 1', 'Equipment', 'HIGH', 'Facilities & Maintenance', 'Rajesh Kumar', 'PENDING', NULL, NOW() - INTERVAL '5 hours', NOW())`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 18. Leave Requests
  lines.push(`-- 18. LEAVE REQUESTS & APPROVALS`);
  lines.push(`INSERT INTO public.leave_requests (id, applicant_id, applicant_name, applicant_role, applicant_phone, leave_type, start_date, end_date, days_count, reason, status, reviewer_notes, sms_dispatched, created_at) VALUES`);
  lines.push(`('55555555-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Sarah Jenkins', 'TEACHER', '+15550192832', 'Medical', CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '3 days', 2, 'Scheduled dental extraction and recovery.', 'PENDING', NULL, false, NOW() - INTERVAL '1 hour'),`);
  lines.push(`('55555555-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'ABHISHEK R', 'STUDENT', '+91 9810000000', 'Medical', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', 2, 'Respiratory recovery under physician advice.', 'APPROVED', 'Doctor note verified by school clinic.', true, NOW() - INTERVAL '4 hours')`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 19. Timetable Slots
  lines.push(`-- 19. TIMETABLE & CLASS SCHEDULES`);
  lines.push(`INSERT INTO public.timetable (id, class_grade, section, day_of_week, period, time_range, subject, teacher_name, room) VALUES`);
  lines.push(`('61616161-0000-0000-0000-000000000001', '1', '1st Neo', 'Monday', 1, '08:45 - 09:30', 'Programming in C (BCA101)', 'Sarah Jenkins', 'BCA Lab 1'),`);
  lines.push(`('61616161-0000-0000-0000-000000000002', '1', '1st Neo', 'Monday', 2, '09:35 - 10:20', 'Digital Electronics & Logic (BCA102)', 'Marcus Chen', 'Electronics Lab'),`);
  lines.push(`('61616161-0000-0000-0000-000000000003', '1', '1st Neo', 'Monday', 3, '10:35 - 11:20', 'Discrete Mathematics (BCA103)', 'Elena Rostova', 'Room 101'),`);
  lines.push(`('61616161-0000-0000-0000-000000000004', '1', '1st Neo', 'Monday', 4, '11:25 - 12:10', 'Communicative English', 'Dr. Alistair Vance', 'Seminar Hall 1'),`);
  lines.push(`('61616161-0000-0000-0000-000000000005', '1', '1st Neo', 'Monday', 5, '01:00 - 01:45', 'C Programming Lab Hands-on', 'Sarah Jenkins', 'BCA Lab 1'),`);
  lines.push(`('61616161-0000-0000-0000-000000000006', '1', '1st Neo', 'Tuesday', 1, '08:45 - 09:30', 'Digital Electronics & Logic (BCA102)', 'Marcus Chen', 'Electronics Lab'),`);
  lines.push(`('61616161-0000-0000-0000-000000000007', '1', '1st Neo', 'Tuesday', 2, '09:35 - 10:20', 'Programming in C (BCA101)', 'Sarah Jenkins', 'BCA Lab 1'),`);
  lines.push(`('61616161-0000-0000-0000-000000000008', '1', '1st Neo', 'Tuesday', 3, '10:35 - 11:20', 'Communicative English', 'Dr. Alistair Vance', 'Seminar Hall 1')`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 20. Announcements
  lines.push(`-- 20. ANNOUNCEMENTS & CIRCULARS`);
  lines.push(`INSERT INTO public.announcements (id, title, content, target_audience, priority, author_name, email_broadcast, sms_broadcast, created_at) VALUES`);
  lines.push(`('66666666-0000-0000-0000-000000000001', 'Annual Science & Robotics Exhibition Tomorrow', 'All class representatives must submit display project specs by 11:00 AM at the Multipurpose Auditorium.', 'ALL', 'URGENT', 'Dr. Alistair Vance', true, true, NOW() - INTERVAL '6 hours'),`);
  lines.push(`('66666666-0000-0000-0000-000000000002', 'Staff Faculty Meeting: Term 2 Operations Review', 'Mandatory 30-minute sync at 3:45 PM in the Conference Hall regarding digital attendance adoption.', 'TEACHERS', 'NORMAL', 'Principal Vance', false, false, NOW() - INTERVAL '1 day')`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 21. Notifications
  lines.push(`-- 21. NOTIFICATIONS`);
  lines.push(`INSERT INTO public.notifications (id, user_id, title, message, type, related_type, related_id, read, created_at) VALUES`);
  lines.push(`('77777777-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'New Campus Issue Reported', 'Sarah Jenkins reported: Projector not working in BCA Lab 1 (Assigned to Maintenance).', 'WARNING', 'MAINTENANCE', '33333333-0000-0000-0000-000000000001', false, NOW() - INTERVAL '45 minutes'),`);
  lines.push(`('77777777-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'Leave Request Approved', 'Leave for ABHISHEK R has been approved. Guardian SMS triggered.', 'SUCCESS', 'LEAVE', '55555555-0000-0000-0000-000000000002', false, NOW() - INTERVAL '4 hours'),`);
  lines.push(`('77777777-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Urgent Maintenance Alert', 'Water leakage in Science Lab 2 marked High Priority. Maintenance Lead Rajesh Kumar on site.', 'URGENT', 'MAINTENANCE', '33333333-0000-0000-0000-000000000002', true, NOW() - INTERVAL '3 hours')`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 22. Email Logs
  lines.push(`-- 22. COMMUNICATIONS & EMAIL GATEWAY RECORDS`);
  lines.push(`INSERT INTO public.email_logs (id, recipient_email, recipient_name, subject, message, template_id, status, trigger_event, response_payload, created_at) VALUES`);
  lines.push(`('88888888-0000-0000-0000-000000000001', 'rajesh.k@devora.edu', 'Rajesh Kumar (Facilities)', 'DEVORA ALERT: High Priority Issue: Water pipe leakage in Science Lab 2', 'A High Priority maintenance issue has been assigned: Water pipe leakage in Science Lab 2 (Science Block B, Room 204).', 'DEVORA_MNT_ALERT', 'DELIVERED', 'Maintenance Assignment', '{"smtpCode": 250, "accepted": ["rajesh.k@devora.edu"]}', NOW() - INTERVAL '3 hours'),`);
  lines.push(`('88888888-0000-0000-0000-000000000002', 'guardian.abhishek.r@example.com', 'Guardian of ABHISHEK R', 'Devora School: Leave Application Approved for ABHISHEK R', 'Medical leave request for ABHISHEK R (2 days) has been APPROVED. Clinic doctor verification completed.', 'DEVORA_LEAVE_APPROVED', 'DELIVERED', 'Leave Approval', '{"smtpCode": 250, "accepted": ["guardian.abhishek.r@example.com"]}', NOW() - INTERVAL '4 hours')`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 23. AI Insights
  lines.push(`-- 23. AI INSIGHTS & TRIAGE`);
  lines.push(`INSERT INTO public.ai_insights (id, insight_type, title, description, severity, created_at) VALUES`);
  lines.push(`('91919191-0000-0000-0000-000000000001', 'ATTENDANCE_ANOMALY', 'Attendance drop detected in BCA 1st Neo', 'Absence rate rose to 20% on Friday morning lecture. 1 pending sick leave ticket triaged.', 'WARNING', NOW() - INTERVAL '2 hours'),`);
  lines.push(`('91919191-0000-0000-0000-000000000002', 'FACILITY_URGENCY', 'Science Lab 2 plumbing leak requires expedited shutoff', 'Continuous water drip reported. Assigned to Facilities Lead Rajesh Kumar for priority remediation.', 'ACTION_REQUIRED', NOW() - INTERVAL '3 hours'),`);
  lines.push(`('91919191-0000-0000-0000-000000000003', 'OPERATIONS_NORMAL', 'Campus morning operations sync successful', 'All 24 sections scheduled. Timetables broadcast and notifications operational.', 'INFO', NOW() - INTERVAL '8 hours')`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  // 24. Audit Logs
  lines.push(`-- 24. AUDIT LOGS`);
  lines.push(`INSERT INTO public.audit_logs (id, user_name, user_role, action, details, ip_address, created_at) VALUES`);
  lines.push(`('92929292-0000-0000-0000-000000000001', 'Dr. Alistair Vance', 'ADMIN', 'SYSTEM_LOGIN', 'Administrative authentication successful via Devora AI Gateway', '127.0.0.1', NOW() - INTERVAL '10 hours'),`);
  lines.push(`('92929292-0000-0000-0000-000000000002', 'Sarah Jenkins', 'TEACHER', 'ATTENDANCE_RECORDED', 'Attendance marked for BCA 1st Neo: 4 Present, 1 Absent', '127.0.0.1', NOW() - INTERVAL '3 hours'),`);
  lines.push(`('92929292-0000-0000-0000-000000000003', 'Rajesh Kumar', 'ADMIN', 'MAINTENANCE_STATUS_UPDATE', 'Issue 33333333-0000-0000-0000-000000000002 updated to IN_PROGRESS', '127.0.0.1', NOW() - INTERVAL '2 hours')`);
  lines.push(`ON CONFLICT (id) DO NOTHING;\n`);

  return lines.join('\n');
}

// Write the complete seed file
const completeSeedSql = buildSeedSql();
fs.writeFileSync(path.join(process.cwd(), 'database', 'seed.sql'), completeSeedSql, 'utf8');
console.log('Successfully regenerated database/seed.sql with all 16 sectors!');

// Also write a bulk 765 student exporter
try {
  const campusState = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'database', 'campus_state.json'), 'utf8'));
  const bulkLines = [];
  bulkLines.push(`-- ==========================================================`);
  bulkLines.push(`-- DEVORA AI: BULK IMPORT FOR ALL 765 ADMITTED STUDENTS`);
  bulkLines.push(`-- Sourced from: BCA+DA & BCA, BCOM FINAL DATA 2026-27 ADMISSION(1).xlsx`);
  bulkLines.push(`-- ==========================================================\n`);

  const chunkSize = 100;
  for (let i = 0; i < campusState.students.length; i += chunkSize) {
    const chunk = campusState.students.slice(i, i + chunkSize);
    bulkLines.push(`INSERT INTO public.students (id, name, roll_number, admission_no, register_number, uucms_no, gender, dob, source_program, sl_no, class_grade, section, guardian_name, guardian_phone, attendance_rate, medical_notes, status, course_id, academic_year_id, semester_id, section_id) VALUES`);
    
    const rowStrings = chunk.map((s, idx) => {
      // Map to course uuid
      const courseId = 'aaaaaaaa-0000-0000-0000-000000000001'; // Default BCA
      const ayId = 'bbbbbbbb-0000-0000-0000-000000000002'; // 2026-27
      const semId = 'cccccccc-0000-0000-0000-000000000001'; // 1st Sem
      const secId = 'dddddddd-0000-0000-0001-000000000001'; // 1st Neo
      const stuUuid = pseudoUuid('stu', (i + idx + 1000));

      return `(${escapeSql(stuUuid)}, ${escapeSql(s.name)}, ${escapeSql(s.roll_number || s.admission_no)}, ${escapeSql(s.admission_no)}, ${escapeSql(s.register_number)}, ${escapeSql(s.uucms_no)}, ${escapeSql(s.gender)}, ${escapeSql(s.dob)}, ${escapeSql(s.source_program)}, ${s.sl_no || (i + idx + 1)}, ${escapeSql(s.class_grade || '1')}, ${escapeSql(s.section || '1st Neo')}, ${escapeSql(s.guardian_name || 'Guardian of ' + s.name)}, ${escapeSql(s.guardian_phone || '+91 9720000000')}, ${s.attendance_rate || 85.0}, 'None', ${escapeSql(s.status || 'ACTIVE')}, ${escapeSql(courseId)}, ${escapeSql(ayId)}, ${escapeSql(semId)}, ${escapeSql(secId)})`;
    });

    bulkLines.push(rowStrings.join(',\n'));
    bulkLines.push(`ON CONFLICT (roll_number) DO NOTHING;\n`);
  }

  fs.writeFileSync(path.join(process.cwd(), 'database', 'seed_all_765_students.sql'), bulkLines.join('\n'), 'utf8');
  console.log(`Successfully generated database/seed_all_765_students.sql with ${campusState.students.length} students!`);
} catch (e) {
  console.error('Error generating bulk students seed:', e);
}
