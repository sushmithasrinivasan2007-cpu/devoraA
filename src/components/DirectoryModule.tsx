import React, { useState } from 'react';
import { Student, Staff, Role } from '../types';
import { api } from '../services/api';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  ShieldAlert, 
  UserPlus, 
  Trash2, 
  BookOpen, 
  Wrench, 
  Briefcase, 
  Cpu, 
  HeartPulse, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Building2,
  BadgeCheck,
  Key,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

interface DirectoryModuleProps {
  students: Student[];
  staff: Staff[];
  currentRole: Role;
  onRefresh: () => void;
  id?: string;
}

export const DirectoryModule: React.FC<DirectoryModuleProps> = ({
  students,
  staff,
  currentRole,
  onRefresh,
  id = "directory-module"
}) => {
  const [activeTab, setActiveTab] = useState<'STUDENTS' | 'STAFF'>('STUDENTS');
  const [staffRoleFilter, setStaffRoleFilter] = useState<'ALL' | 'TEACHER' | 'ADMINISTRATION' | 'FACILITIES' | 'IT_HEALTH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Student Modal state ──────────────────────────────────────────────────
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [stuName, setStuName] = useState('');
  const [stuRollNumber, setStuRollNumber] = useState('');
  const [stuClassGrade, setStuClassGrade] = useState('8');
  const [stuSection, setStuSection] = useState('A');
  const [stuGuardianName, setStuGuardianName] = useState('');
  const [stuGuardianPhone, setStuGuardianPhone] = useState('+15550');
  const [stuMedicalNotes, setStuMedicalNotes] = useState('');
  const [stuEmail, setStuEmail] = useState('');
  const [stuPassword, setStuPassword] = useState('student123');
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
  const [studentFeedback, setStudentFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // ── Teacher Modal state ──────────────────────────────────────────────────
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [tchName, setTchName] = useState('');
  const [tchEmail, setTchEmail] = useState('');
  const [tchPhone, setTchPhone] = useState('+1 555-');
  const [tchEmployeeId, setTchEmployeeId] = useState('');
  const [tchSubject, setTchSubject] = useState('');
  const [tchAssignedClasses, setTchAssignedClasses] = useState('');
  const [tchStatus, setTchStatus] = useState<'ACTIVE' | 'ON_LEAVE'>('ACTIVE');
  const [tchPassword, setTchPassword] = useState('teacher123');
  const [isSubmittingTeacher, setIsSubmittingTeacher] = useState(false);
  const [teacherFeedback, setTeacherFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // ── Support/Admin Staff Modal state ─────────────────────────────────────
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffRoleTitle, setStaffRoleTitle] = useState('Administration');
  const [staffDepartment, setStaffDepartment] = useState('Operations');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('+1 555-');
  const [staffEmployeeId, setStaffEmployeeId] = useState('');
  const [staffAssignedClasses, setStaffAssignedClasses] = useState('');
  const [staffStatus, setStaffStatus] = useState<'ACTIVE' | 'ON_LEAVE'>('ACTIVE');
  const [staffPassword, setStaffPassword] = useState('staff123');
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // ── Admin Change Password Modal state ──────────────────────────────────
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordTarget, setChangePasswordTarget] = useState<{
    type: 'student' | 'staff';
    id: string;
    name: string;
    email: string;
    currentPassword?: string;
  } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [notifyTargetEmail, setNotifyTargetEmail] = useState(true);
  const [isSubmittingPasswordChange, setIsSubmittingPasswordChange] = useState(false);
  const [changePasswordFeedback, setChangePasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleRoleTitleChange = (role: string) => {
    setStaffRoleTitle(role);
    if (role === 'Maintenance Lead') {
      setStaffDepartment('Facilities & Maintenance');
      setStaffEmployeeId(`EMP-MNT-${String(staff.length + 1).padStart(2, '0')}`);
    } else if (role === 'Administration') {
      setStaffDepartment('Operations');
      setStaffEmployeeId(`EMP-ADM-${String(staff.length + 1).padStart(2, '0')}`);
    } else if (role === 'IT Support') {
      setStaffDepartment('Information Technology');
      setStaffEmployeeId(`EMP-IT-${String(staff.length + 1).padStart(2, '0')}`);
    } else if (role === 'Campus Nurse') {
      setStaffDepartment('Health Services');
      setStaffEmployeeId(`EMP-MED-${String(staff.length + 1).padStart(2, '0')}`);
    }
  };

  const openAddTeacherModal = () => {
    setTchName('');
    setTchEmail('');
    setTchPhone('+1 555-');
    setTchPassword('teacher123');
    setTchStatus('ACTIVE');
    setTchSubject('');
    setTchAssignedClasses('Grade 8A, Grade 9B');
    const nextNum = staff.filter(s => s.role_title === 'Teacher').length + 1;
    setTchEmployeeId(`EMP-TCH-${String(nextNum).padStart(2, '0')}`);
    setTeacherFeedback(null);
    setShowAddTeacher(true);
  };

  const openAddStaffModal = () => {
    setStaffName('');
    setStaffEmail('');
    setStaffPhone('+1 555-');
    setStaffPassword('staff123');
    setStaffStatus('ACTIVE');
    setStaffRoleTitle('Administration');
    setStaffDepartment('Operations');
    const nextNum = staff.filter(s => s.role_title !== 'Teacher').length + 1;
    setStaffEmployeeId(`EMP-ADM-${String(nextNum).padStart(2, '0')}`);
    setStaffAssignedClasses('');
    setFeedback(null);
    setShowAddStaff(true);
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.class_grade.includes(searchQuery)
  );

  const filteredStaff = staff.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (staffRoleFilter === 'TEACHER') return s.role_title.toLowerCase() === 'teacher';
    if (staffRoleFilter === 'ADMINISTRATION') return s.role_title === 'Administration';
    if (staffRoleFilter === 'FACILITIES') return s.role_title === 'Maintenance Lead' || s.department.includes('Facilities');
    if (staffRoleFilter === 'IT_HEALTH') return s.role_title === 'IT Support' || s.role_title === 'Campus Nurse';
    return true;
  });

  const teacherCount = staff.filter(s => s.role_title.toLowerCase() === 'teacher').length;
  const adminStaffCount = staff.filter(s => s.role_title.toLowerCase() !== 'teacher').length;

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stuName || !stuRollNumber) return;
    setStudentFeedback(null);
    setIsSubmittingStudent(true);
    try {
      await api.createStudent({
        name: stuName,
        roll_number: stuRollNumber,
        class_grade: stuClassGrade,
        section: stuSection,
        guardian_name: stuGuardianName,
        guardian_phone: stuGuardianPhone,
        medical_notes: stuMedicalNotes,
        email: stuEmail.trim() || undefined,
        password: stuPassword.trim() || undefined
      });
      setStudentFeedback({
        type: 'success',
        message: `${stuName} enrolled! Credentials email dispatched to ${stuEmail || 'guardian email'}.`
      });
      setStuName(''); setStuRollNumber(''); setStuEmail(''); setStuPassword('student123'); setStuMedicalNotes('');
      onRefresh();
      setTimeout(() => { setShowAddStudent(false); setStudentFeedback(null); }, 1800);
    } catch (err: any) {
      setStudentFeedback({ type: 'error', message: err.message || 'Failed to enroll student.' });
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  const handleAddTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tchName || !tchEmail) {
      setTeacherFeedback({ type: 'error', message: 'Name and email are required.' });
      return;
    }
    setIsSubmittingTeacher(true);
    setTeacherFeedback(null);
    try {
      const created = await api.createStaff({
        name: tchName,
        role_title: 'Teacher',
        department: 'Academics',
        email: tchEmail,
        phone: tchPhone,
        employee_id: tchEmployeeId,
        assigned_classes: tchAssignedClasses ? tchAssignedClasses.split(',').map(s => s.trim()) : [],
        status: tchStatus,
        password: tchPassword.trim() || undefined,
        send_welcome_email: true
      });
      setTeacherFeedback({
        type: 'success',
        message: `Teacher ${created.name} registered! Login credentials emailed to ${created.email}.`
      });
      onRefresh();
      setTimeout(() => { setShowAddTeacher(false); setTeacherFeedback(null); }, 1800);
    } catch (err: any) {
      setTeacherFeedback({ type: 'error', message: err.message || 'Failed to register teacher.' });
    } finally {
      setIsSubmittingTeacher(false);
    }
  };

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail) {
      setFeedback({ type: 'error', message: 'Name and email are required.' });
      return;
    }
    setIsSubmittingStaff(true);
    setFeedback(null);
    try {
      const created = await api.createStaff({
        name: staffName,
        role_title: staffRoleTitle,
        department: staffDepartment,
        email: staffEmail,
        phone: staffPhone,
        employee_id: staffEmployeeId,
        assigned_classes: staffAssignedClasses ? staffAssignedClasses.split(',').map(s => s.trim()) : [],
        status: staffStatus,
        password: staffPassword.trim() || undefined,
        send_welcome_email: true
      });
      setFeedback({
        type: 'success',
        message: `${created.name} added to staff directory! Credentials emailed to ${created.email}.`
      });
      onRefresh();
      setTimeout(() => { setShowAddStaff(false); setFeedback(null); }, 1800);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to add staff member.' });
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the staff directory? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteStaff(id);
      onRefresh();
    } catch (err: any) {
      alert(`Error deleting staff: ${err.message}`);
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove student "${name}" from the campus directory? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteStudent(id);
      onRefresh();
    } catch (err: any) {
      alert(`Error deleting student: ${err.message}`);
    }
  };

  const openChangePasswordModal = (
    type: 'student' | 'staff',
    id: string,
    name: string,
    email: string,
    currentPassword?: string
  ) => {
    setChangePasswordTarget({ type, id, name, email, currentPassword });
    setNewPassword('');
    setShowNewPassword(false);
    setNotifyTargetEmail(true);
    setChangePasswordFeedback(null);
    setShowChangePasswordModal(true);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changePasswordTarget || !newPassword.trim()) return;

    if (newPassword.trim().length < 4) {
      setChangePasswordFeedback({ type: 'error', message: 'Password must be at least 4 characters long.' });
      return;
    }

    setIsSubmittingPasswordChange(true);
    setChangePasswordFeedback(null);
    try {
      if (changePasswordTarget.type === 'student') {
        const res = await api.updateStudentPassword(changePasswordTarget.id, newPassword.trim(), notifyTargetEmail);
        if (res.error) throw new Error(res.error);
        setChangePasswordFeedback({
          type: 'success',
          message: `Password updated for student ${changePasswordTarget.name}! ${notifyTargetEmail && changePasswordTarget.email ? 'Notification dispatched.' : ''}`
        });
      } else {
        const res = await api.updateStaffPassword(changePasswordTarget.id, newPassword.trim(), notifyTargetEmail);
        if (res.error) throw new Error(res.error);
        setChangePasswordFeedback({
          type: 'success',
          message: `Password updated for ${changePasswordTarget.name}! ${notifyTargetEmail && changePasswordTarget.email ? 'Notification dispatched.' : ''}`
        });
      }
      onRefresh();
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setChangePasswordFeedback(null);
      }, 1800);
    } catch (err: any) {
      setChangePasswordFeedback({ type: 'error', message: err.message || 'Failed to update password.' });
    } finally {
      setIsSubmittingPasswordChange(false);
    }
  };

  const getRoleIcon = (roleTitle: string) => {
    if (roleTitle === 'Teacher') return <GraduationCap className="w-4 h-4 text-[#6B1E2B]" />;
    if (roleTitle === 'Maintenance Lead') return <Wrench className="w-4 h-4 text-[#9E671E]" />;
    if (roleTitle === 'Administration') return <Briefcase className="w-4 h-4 text-[#3D6B46]" />;
    if (roleTitle === 'IT Support') return <Cpu className="w-4 h-4 text-[#2E5E82]" />;
    if (roleTitle === 'Campus Nurse') return <HeartPulse className="w-4 h-4 text-[#A83248]" />;
    return <UserCheck className="w-4 h-4 text-[#6B1E2B]" />;
  };

  return (
    <div id={id} className="space-y-6">
      {/* Top Controls & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2B2020] tracking-tight flex flex-wrap items-center gap-2.5">
            <span>Campus Staff &amp; Student Directory</span>
            <span className="text-xs font-mono font-bold text-[#6B1E2B] bg-[#6B1E2B]/10 px-2.5 py-0.5 rounded-full border border-[#6B1E2B]/20">
              {students.length} Students · {teacherCount} Teachers · {adminStaffCount} Staff
            </span>
          </h1>
          <p className="text-sm text-[#756565] mt-1 font-sans">
            Verified student records, guardian emergency contacts, faculty appointments, and administrative staff management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Students vs Staff Tab Switcher */}
          <div className="flex items-center bg-[#FFF8EC]/90 p-1 rounded-xl border border-[#6B1E2B]/15 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('STUDENTS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'STUDENTS' ? 'bg-[#6B1E2B] text-white shadow-sm' : 'text-[#756565] hover:text-[#2B2020]'
              }`}
            >
              Students ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('STAFF')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'STAFF' ? 'bg-[#6B1E2B] text-white shadow-sm' : 'text-[#756565] hover:text-[#2B2020]'
              }`}
            >
              Faculty &amp; Staff ({staff.length})
            </button>
          </div>

          {/* Action Buttons for Admin */}
          {currentRole === 'ADMIN' && (
            <div className="flex items-center gap-2">
              {activeTab === 'STUDENTS' ? (
                <button
                  type="button"
                  id="btn-add-student"
                  onClick={() => { setShowAddStudent(true); setStudentFeedback(null); }}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#6B1E2B] hover:bg-[#42121C] text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enroll Student</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="btn-add-teacher"
                    onClick={openAddTeacherModal}
                    className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-[#6B1E2B] hover:bg-[#42121C] text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg active:scale-95"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>+ Add Teacher</span>
                  </button>
                  <button
                    type="button"
                    id="btn-add-staff"
                    onClick={openAddStaffModal}
                    className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-[#FFF8EC] hover:bg-white text-[#6B1E2B] border border-[#6B1E2B]/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow active:scale-95"
                  >
                    <UserPlus className="w-4 h-4 text-[#6B1E2B]" />
                    <span>+ Add Staff</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Staff Category Filter Pills (When on Staff tab) */}
      {activeTab === 'STAFF' && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-[#6B1E2B]/10 pb-3">
          <span className="text-xs font-mono font-bold text-[#756565] uppercase tracking-wider mr-1">
            Filter:
          </span>
          {[
            { id: 'ALL', label: `All Staff (${staff.length})` },
            { id: 'TEACHER', label: `Teachers / Faculty (${teacherCount})` },
            { id: 'ADMINISTRATION', label: `Administration (${staff.filter(s => s.role_title === 'Administration').length})` },
            { id: 'FACILITIES', label: `Facilities & Mnt (${staff.filter(s => s.role_title === 'Maintenance Lead' || s.department.includes('Facilities')).length})` },
            { id: 'IT_HEALTH', label: `IT & Health (${staff.filter(s => s.role_title === 'IT Support' || s.role_title === 'Campus Nurse').length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStaffRoleFilter(tab.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                staffRoleFilter === tab.id
                  ? 'bg-[#6B1E2B] text-white shadow-xs'
                  : 'bg-[#FFF8EC]/90 text-[#756565] hover:text-[#2B2020] border border-[#6B1E2B]/15 hover:bg-[#F3EBDD]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#756565] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeTab === 'STUDENTS' ? 'students by name, roll no, or grade' : 'faculty & staff by name, role, dept, or ID'}...`}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/20 text-sm text-[#2B2020] placeholder:text-[#9A8989] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono shadow-sm transition-all"
        />
      </div>

      {/* Roster Cards Grid */}
      {activeTab === 'STUDENTS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-[#FFF8EC]/60 rounded-2xl border border-dashed border-[#6B1E2B]/20 text-[#756565] font-mono text-sm">
              No students found matching "{searchQuery}".
            </div>
          ) : (
            filteredStudents.map((stu) => (
              <div
                key={stu.id}
                className="p-5 rounded-2xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] hover:shadow-[0_8px_30px_-6px_rgba(107,30,43,0.12)] hover:border-[#6B1E2B]/30 transition-all space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#6B1E2B]/10 border border-[#6B1E2B]/20 flex items-center justify-center font-mono font-bold text-xs text-[#6B1E2B]">
                      {stu.class_grade}{stu.section}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2B2020]">{stu.name}</h3>
                      <div className="text-xs font-mono text-[#756565]">{stu.roll_number}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      stu.attendance_rate >= 80 ? 'text-[#3D6B46] bg-[#5F8F68]/15 border border-[#5F8F68]/30' : 'text-[#B94A55] bg-[#B94A55]/15 border border-[#B94A55]/30'
                    }`}>
                      {stu.attendance_rate}% Att.
                    </span>
                    {currentRole === 'ADMIN' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(stu.id, stu.name)}
                        className="p-1 text-[#756565] hover:text-[#B94A55] rounded hover:bg-[#B94A55]/10 transition-all cursor-pointer"
                        title="Remove Student"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-mono text-[#756565] bg-[#F3EBDD]/60 p-3.5 rounded-xl border border-[#6B1E2B]/10">
                  <div>Guardian: <strong className="text-[#2B2020]">{stu.guardian_name}</strong></div>
                  <div className="flex items-center gap-1.5 text-[#6B1E2B] font-semibold">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{stu.guardian_phone}</span>
                  </div>
                  {stu.email && (
                    <div className="flex items-center gap-1.5 text-[#2B2020]">
                      <Mail className="w-3.5 h-3.5 text-[#6B1E2B] shrink-0" />
                      <span className="truncate">{stu.email}</span>
                    </div>
                  )}
                  {stu.medical_notes && (
                    <div className="pt-1 text-[#9E671E] bg-[#C58A35]/10 p-2 rounded-lg border border-[#C58A35]/20 text-[11px] flex items-center gap-1.5 mt-1">
                      <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 text-[#C58A35]" />
                      <span>Medical: {stu.medical_notes}</span>
                    </div>
                  )}
                </div>

                {/* Admin Actions (Admin Only) */}
                {currentRole === 'ADMIN' && (
                  <div className="pt-2.5 border-t border-[#6B1E2B]/10 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#756565]">
                      <span>Password: <strong className="text-[#2B2020]">{stu.password ? '••••••••' : 'student123'}</strong></span>
                      <button
                        type="button"
                        onClick={() => openChangePasswordModal('student', stu.id, stu.name, stu.email || stu.guardian_phone, stu.password)}
                        className="text-[11px] font-mono font-bold text-[#6B1E2B] hover:underline flex items-center gap-1 cursor-pointer"
                        title="Change Student Password"
                      >
                        <Key className="w-3 h-3" />
                        <span>Change Password</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-dashed border-[#6B1E2B]/10">
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(stu.id, stu.name)}
                        className="w-full py-1.5 px-3 rounded-xl text-xs font-mono font-bold bg-[#B94A55]/10 hover:bg-[#B94A55] text-[#B94A55] hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                        title="Remove Student (Admin Only)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Student</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-[#FFF8EC]/60 rounded-2xl border border-dashed border-[#6B1E2B]/20 text-[#756565] font-mono text-sm space-y-3">
              <p>No faculty or staff found matching your criteria.</p>
              {currentRole === 'ADMIN' && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={openAddTeacherModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#6B1E2B] text-white hover:bg-[#42121C] cursor-pointer transition-all"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>+ Add Teacher</span>
                  </button>
                  <button
                    type="button"
                    onClick={openAddStaffModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#FFF8EC] text-[#6B1E2B] border border-[#6B1E2B]/30 hover:bg-white cursor-pointer transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Add Staff</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredStaff.map((st) => (
              <div
                key={st.id}
                className="p-5 rounded-2xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] hover:shadow-[0_8px_30px_-6px_rgba(107,30,43,0.12)] hover:border-[#6B1E2B]/30 transition-all space-y-3.5 relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      st.role_title === 'Teacher'
                        ? 'bg-[#6B1E2B]/10 border-[#6B1E2B]/20 text-[#6B1E2B]'
                        : st.role_title === 'Administration'
                        ? 'bg-[#3D6B46]/10 border-[#3D6B46]/20 text-[#3D6B46]'
                        : st.role_title === 'Maintenance Lead'
                        ? 'bg-[#C58A35]/15 border-[#C58A35]/30 text-[#9E671E]'
                        : 'bg-[#2E5E82]/10 border-[#2E5E82]/20 text-[#2E5E82]'
                    }`}>
                      {getRoleIcon(st.role_title)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-[#2B2020]">{st.name}</h3>
                        {st.status === 'ACTIVE' ? (
                          <span className="w-2 h-2 rounded-full bg-[#3D6B46] shrink-0" title="Active" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[#C58A35] shrink-0" title="On Leave" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-mono font-bold text-[#6B1E2B]">{st.role_title}</span>
                        <span className="text-[10px] font-mono text-[#756565] bg-black/5 px-1.5 py-0.2 rounded">
                          {st.employee_id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono font-bold text-[#756565] bg-[#F3EBDD] px-2 py-0.5 rounded-lg border border-[#6B1E2B]/15">
                      {st.department}
                    </span>
                    {currentRole === 'ADMIN' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteStaff(st.id, st.name)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#756565] hover:text-[#B94A55] rounded hover:bg-[#B94A55]/10 transition-all cursor-pointer"
                        title="Remove Staff Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-mono text-[#756565] bg-[#F3EBDD]/60 p-3.5 rounded-xl border border-[#6B1E2B]/10">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#6B1E2B] shrink-0" />
                    <a href={`mailto:${st.email}`} className="text-[#2B2020] hover:underline truncate">
                      {st.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#6B1E2B] shrink-0" />
                    <span className="text-[#2B2020]">{st.phone}</span>
                  </div>
                  {st.assigned_classes && st.assigned_classes.length > 0 && (
                    <div className="text-[11px] text-[#756565] pt-1.5 border-t border-[#6B1E2B]/10 flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-[#2B2020]">Classes:</span>
                      {st.assigned_classes.map((cls, idx) => (
                        <span key={idx} className="bg-white/80 px-2 py-0.5 rounded border border-[#6B1E2B]/15 font-mono text-[10px] text-[#6B1E2B] font-bold">
                          {cls}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Admin Actions (Admin Only) */}
                {currentRole === 'ADMIN' && (
                  <div className="pt-2.5 border-t border-[#6B1E2B]/10 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#756565]">
                      <span>Password: <strong className="text-[#2B2020]">{st.password ? '••••••••' : '••••••••'}</strong></span>
                      <button
                        type="button"
                        onClick={() => openChangePasswordModal('staff', st.id, st.name, st.email, st.password)}
                        className="text-[11px] font-mono font-bold text-[#6B1E2B] hover:underline flex items-center gap-1 cursor-pointer"
                        title="Change Staff Password"
                      >
                        <Key className="w-3 h-3" />
                        <span>Change Password</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-dashed border-[#6B1E2B]/10">
                      <button
                        type="button"
                        onClick={() => handleDeleteStaff(st.id, st.name)}
                        className="w-full py-1.5 px-3 rounded-xl text-xs font-mono font-bold bg-[#B94A55]/10 hover:bg-[#B94A55] text-[#B94A55] hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                        title={`Remove ${st.role_title === 'Teacher' ? 'Teacher' : 'Staff'} (Admin Only)`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove {st.role_title === 'Teacher' ? 'Teacher' : 'Staff Member'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD TEACHER MODAL (ADMIN ONLY)                                  */}
      {/* ============================================================== */}
      {showAddTeacher && (
        <div className="fixed inset-0 bg-[#2B2020]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#FFF8EC] border border-[#6B1E2B]/20 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#6B1E2B]/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#6B1E2B]/10 border border-[#6B1E2B]/20 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-[#6B1E2B]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#2B2020]">Add New Teacher</h2>
                  <p className="text-[11px] text-[#756565] font-mono">Faculty Registration · Credentials emailed on save</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowAddTeacher(false)}
                className="text-[#756565] hover:text-[#2B2020] w-8 h-8 rounded-lg hover:bg-[#6B1E2B]/10 flex items-center justify-center transition-colors cursor-pointer">
                ✕
              </button>
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#6B1E2B]/6 border border-[#6B1E2B]/15 text-[11px] font-mono text-[#6B1E2B]">
              <BadgeCheck className="w-4 h-4 mt-0.5 shrink-0" />
              <span>After saving, the teacher will receive a welcome email at their registered address containing their name, username, and password to log in to the Faculty Portal.</span>
            </div>

            {/* Form */}
            <form onSubmit={handleAddTeacherSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Full Name *</label>
                  <input type="text" required value={tchName} onChange={e => setTchName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Miller"
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]" />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Employee ID</label>
                  <input type="text" required value={tchEmployeeId} onChange={e => setTchEmployeeId(e.target.value)}
                    placeholder="EMP-TCH-09"
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Subject / Specialisation</label>
                <input type="text" value={tchSubject} onChange={e => setTchSubject(e.target.value)}
                  placeholder="e.g. Physics, Mathematics, Biology"
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Registered Email *</label>
                  <input type="email" required value={tchEmail} onChange={e => setTchEmail(e.target.value)}
                    placeholder="teacher@school.edu"
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]" />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Phone Number</label>
                  <input type="text" value={tchPhone} onChange={e => setTchPhone(e.target.value)}
                    placeholder="+1 555-019-2831"
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Assigned Classes (comma separated)</label>
                <input type="text" value={tchAssignedClasses} onChange={e => setTchAssignedClasses(e.target.value)}
                  placeholder="e.g. Grade 8A, Grade 9B, Physics 101"
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]" />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Portal Login Password *</label>
                <input type="text" required value={tchPassword} onChange={e => setTchPassword(e.target.value)}
                  placeholder="Initial login password"
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]" />
                <p className="text-[10px] text-[#756565] font-mono mt-1">This password is included in the welcome email and can be changed via Forgot Password.</p>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Employment Status</label>
                <div className="flex items-center gap-4 text-xs font-mono text-[#2B2020]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="tchStatus" checked={tchStatus === 'ACTIVE'} onChange={() => setTchStatus('ACTIVE')} className="accent-[#6B1E2B]" />
                    <span>Active</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="tchStatus" checked={tchStatus === 'ON_LEAVE'} onChange={() => setTchStatus('ON_LEAVE')} className="accent-[#6B1E2B]" />
                    <span>On Leave</span>
                  </label>
                </div>
              </div>

              {teacherFeedback && (
                <div className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                  teacherFeedback.type === 'success' ? 'bg-[#5F8F68]/15 border border-[#5F8F68]/30 text-[#3D6B46]' : 'bg-[#B94A55]/15 border border-[#B94A55]/30 text-[#B94A55]'
                }`}>
                  {teacherFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{teacherFeedback.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#6B1E2B]/10">
                <button type="button" onClick={() => setShowAddTeacher(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-[#756565] hover:text-[#2B2020] font-medium transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isSubmittingTeacher}
                  className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#6B1E2B] hover:bg-[#42121C] text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2">
                  {isSubmittingTeacher ? (
                    <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Saving & Sending Email...</span></>
                  ) : (
                    <><GraduationCap className="w-4 h-4" /><span>Save & Register Teacher</span></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD SUPPORT/ADMIN STAFF MODAL (ADMIN ONLY)                      */}
      {/* ============================================================== */}
      {showAddStaff && (
        <div className="fixed inset-0 bg-[#2B2020]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#FFF8EC] border border-[#6B1E2B]/20 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#6B1E2B]/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#6B1E2B]/10 border border-[#6B1E2B]/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#6B1E2B]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#2B2020]">Add Campus Staff</h2>
                  <p className="text-[11px] text-[#756565] font-mono">Support & Admin · Credentials emailed on save</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowAddStaff(false)}
                className="text-[#756565] hover:text-[#2B2020] w-8 h-8 rounded-lg hover:bg-[#6B1E2B]/10 flex items-center justify-center transition-colors cursor-pointer">
                ✕
              </button>
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#6B1E2B]/6 border border-[#6B1E2B]/15 text-[11px] font-mono text-[#6B1E2B]">
              <BadgeCheck className="w-4 h-4 mt-0.5 shrink-0" />
              <span>After saving, the staff member will receive a welcome email at their registered address containing their name, username, and password to access the portal.</span>
            </div>

            {/* Form */}
            <form onSubmit={handleAddStaffSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Full Name *</label>
                  <input type="text" required value={staffName} onChange={e => setStaffName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]" />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Employee ID</label>
                  <input type="text" required value={staffEmployeeId} onChange={e => setStaffEmployeeId(e.target.value)}
                    placeholder="EMP-ADM-04"
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Role Title *</label>
                  <select value={staffRoleTitle} onChange={e => handleRoleTitleChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all">
                    <option value="Administration">Administration</option>
                    <option value="Maintenance Lead">Maintenance Lead</option>
                    <option value="IT Support">IT Support</option>
                    <option value="Campus Nurse">Campus Nurse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Department *</label>
                  <select value={staffDepartment} onChange={e => setStaffDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all">
                    <option value="Operations">Operations</option>
                    <option value="Facilities & Maintenance">Facilities & Maintenance</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Health Services">Health Services</option>
                    <option value="Academics">Academics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Registered Email *</label>
                  <input type="email" required value={staffEmail} onChange={e => setStaffEmail(e.target.value)}
                    placeholder="staff@devora.edu"
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]" />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Phone Number</label>
                  <input type="text" value={staffPhone} onChange={e => setStaffPhone(e.target.value)}
                    placeholder="+1 555-019-2831"
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Scope of Work / Specialty</label>
                <input type="text" value={staffAssignedClasses} onChange={e => setStaffAssignedClasses(e.target.value)}
                  placeholder="e.g. Electrical Systems, Campus Network"
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]" />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Portal Login Password *</label>
                <input type="text" required value={staffPassword} onChange={e => setStaffPassword(e.target.value)}
                  placeholder="Initial login password"
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]" />
                <p className="text-[10px] text-[#756565] font-mono mt-1">This password is included in the welcome email. Can be changed via Forgot Password.</p>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Employment Status</label>
                <div className="flex items-center gap-4 text-xs font-mono text-[#2B2020]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="staffStatus" checked={staffStatus === 'ACTIVE'} onChange={() => setStaffStatus('ACTIVE')} className="accent-[#6B1E2B]" />
                    <span>Active Member</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="staffStatus" checked={staffStatus === 'ON_LEAVE'} onChange={() => setStaffStatus('ON_LEAVE')} className="accent-[#6B1E2B]" />
                    <span>On Leave</span>
                  </label>
                </div>
              </div>

              {feedback && (
                <div className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                  feedback.type === 'success' ? 'bg-[#5F8F68]/15 border border-[#5F8F68]/30 text-[#3D6B46]' : 'bg-[#B94A55]/15 border border-[#B94A55]/30 text-[#B94A55]'
                }`}>
                  {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{feedback.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#6B1E2B]/10">
                <button type="button" onClick={() => setShowAddStaff(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-[#756565] hover:text-[#2B2020] font-medium transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isSubmittingStaff}
                  className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#6B1E2B] hover:bg-[#42121C] text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2">
                  {isSubmittingStaff ? (
                    <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Saving & Sending Email...</span></>
                  ) : (
                    <><UserPlus className="w-4 h-4" /><span>Save & Register Staff</span></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ENROLL STUDENT MODAL                                            */}
      {/* ============================================================== */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-[#2B2020]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#FFF8EC] border border-[#6B1E2B]/20 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-[#6B1E2B]/10 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#6B1E2B]" />
                <h2 className="text-lg font-bold text-[#2B2020]">Enroll New Student</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStudent(false)}
                className="text-[#756565] hover:text-[#2B2020] font-mono text-sm w-8 h-8 rounded-lg hover:bg-[#6B1E2B]/10 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#6B1E2B]/6 border border-[#6B1E2B]/15 text-[11px] font-mono text-[#6B1E2B]">
              <BadgeCheck className="w-4 h-4 mt-0.5 shrink-0" />
              <span>After saving, the student will receive a welcome email at their registered address containing their name, username, and password to access the Student Portal.</span>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Student Full Name *</label>
                  <input type="text" required value={stuName} onChange={e => setStuName(e.target.value)}
                    placeholder="e.g. Liam Vance"
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]" />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Roll / Admission ID *</label>
                  <input type="text" required value={stuRollNumber} onChange={e => setStuRollNumber(e.target.value)}
                    placeholder="STU-8A-09"
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Class Grade *</label>
                  <input type="text" required value={stuClassGrade} onChange={e => setStuClassGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Section *</label>
                  <input type="text" required value={stuSection} onChange={e => setStuSection(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Student Login Email *</label>
                  <input type="email" required value={stuEmail} onChange={e => setStuEmail(e.target.value)}
                    placeholder="student@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]" />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Portal Password *</label>
                  <input type="text" required value={stuPassword} onChange={e => setStuPassword(e.target.value)}
                    placeholder="e.g. student123"
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Guardian Name</label>
                  <input type="text" value={stuGuardianName} onChange={e => setStuGuardianName(e.target.value)}
                    placeholder="Parent / Guardian"
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]" />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Guardian Mobile</label>
                  <input type="text" value={stuGuardianPhone} onChange={e => setStuGuardianPhone(e.target.value)}
                    placeholder="+1 555-000-0000"
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">Medical Notes / Special Instructions (Optional)</label>
                <input type="text" value={stuMedicalNotes} onChange={e => setStuMedicalNotes(e.target.value)}
                  placeholder="e.g. Carries emergency inhaler"
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]" />
              </div>

              {studentFeedback && (
                <div className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                  studentFeedback.type === 'success' ? 'bg-[#5F8F68]/15 border border-[#5F8F68]/30 text-[#3D6B46]' : 'bg-[#B94A55]/15 border border-[#B94A55]/30 text-[#B94A55]'
                }`}>
                  {studentFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{studentFeedback.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#6B1E2B]/10">
                <button type="button" onClick={() => setShowAddStudent(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-[#756565] hover:text-[#2B2020] font-medium transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isSubmittingStudent}
                  className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#6B1E2B] hover:bg-[#42121C] text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2">
                  {isSubmittingStudent ? (
                    <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Enrolling & Sending Email...</span></>
                  ) : (
                    <><GraduationCap className="w-4 h-4" /><span>Enroll Student</span></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CHANGE PASSWORD MODAL (ADMIN ONLY)                              */}
      {/* ============================================================== */}
      {showChangePasswordModal && changePasswordTarget && (
        <div className="fixed inset-0 bg-[#2B2020]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#FFF8EC] border border-[#6B1E2B]/20 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#6B1E2B]/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#6B1E2B]/10 border border-[#6B1E2B]/20 flex items-center justify-center">
                  <Key className="w-5 h-5 text-[#6B1E2B]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#2B2020]">
                    Change {changePasswordTarget.type === 'student' ? 'Student' : 'Staff'} Password
                  </h2>
                  <p className="text-[11px] text-[#756565] font-mono">
                    Admin Security Override · {changePasswordTarget.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowChangePasswordModal(false)}
                className="text-[#756565] hover:text-[#2B2020] w-8 h-8 rounded-lg hover:bg-[#6B1E2B]/10 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Target Info */}
            <div className="p-3 rounded-xl bg-[#F3EBDD]/70 border border-[#6B1E2B]/10 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-[#756565]">User Name:</span>
                <span className="font-bold text-[#2B2020]">{changePasswordTarget.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#756565]">Registered Email:</span>
                <span className="font-bold text-[#6B1E2B]">{changePasswordTarget.email || 'None registered'}</span>
              </div>
              {changePasswordTarget.type === 'student' && (
                <div className="text-[11px] text-[#756565] pt-1 border-t border-[#6B1E2B]/10">
                  Students do not have permission to change passwords. Only Admin can update this.
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 4 characters)"
                    className="w-full px-3 py-2.5 pr-10 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#756565] hover:text-[#2B2020] cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notify-target-cb"
                  checked={notifyTargetEmail}
                  onChange={e => setNotifyTargetEmail(e.target.checked)}
                  className="accent-[#6B1E2B] rounded cursor-pointer"
                />
                <label htmlFor="notify-target-cb" className="text-xs font-mono text-[#2B2020] cursor-pointer">
                  Send updated credentials to registered email
                </label>
              </div>

              {changePasswordFeedback && (
                <div className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                  changePasswordFeedback.type === 'success'
                    ? 'bg-[#5F8F68]/15 border border-[#5F8F68]/30 text-[#3D6B46]'
                    : 'bg-[#B94A55]/15 border border-[#B94A55]/30 text-[#B94A55]'
                }`}>
                  {changePasswordFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{changePasswordFeedback.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#6B1E2B]/10">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-[#756565] hover:text-[#2B2020] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPasswordChange || !newPassword.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#6B1E2B] hover:bg-[#42121C] text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingPasswordChange ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
