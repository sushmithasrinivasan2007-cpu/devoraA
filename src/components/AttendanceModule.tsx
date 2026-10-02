import React, { useState, useEffect, useMemo } from 'react';
import {
  Student, Role, Course, AcademicYear, Semester, Section, Subject,
  TeacherSubjectAssignment, AttendanceSession, AttendanceEntry, AttendanceSettings,
  StudentAttendanceOverview, AdminAttendanceOverview, Staff
} from '../types';
import { api } from '../services/api';
import {
  Users, CheckCircle, XCircle, Sparkles, Calendar, Save, TrendingDown,
  BookOpen, Layers, Settings, UserCheck, ShieldAlert, Plus, Edit3, Trash2,
  Filter, ArrowRight, Search, Award, AlertTriangle, Check, GraduationCap,
  Clock, ChevronRight, RefreshCw, Sliders, ChevronDown
} from 'lucide-react';

interface AttendanceModuleProps {
  students: Student[];
  currentRole: Role;
  loggedInName?: string;
  onRefresh: () => void;
  id?: string;
}

export const AttendanceModule: React.FC<AttendanceModuleProps> = ({
  students: initialStudents,
  currentRole,
  loggedInName = '',
  onRefresh,
  id = "attendance-module"
}) => {
  // Main Module Tab Navigation
  const [activeTab, setActiveTab] = useState<'roll-call' | 'config' | 'overview' | 'my-attendance' | 'teacher-history'>(
    currentRole === 'STUDENT' ? 'my-attendance' : 'roll-call'
  );

  // Dynamic Academic Dropdown States
  const [courses, setCourses] = useState<Course[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Staff[]>([]);
  const [assignments, setAssignments] = useState<TeacherSubjectAssignment[]>([]);
  const [settings, setSettings] = useState<AttendanceSettings>({
    threshold_percentage: 75,
    allow_teacher_edit: true,
    send_alert_on_low_attendance: true
  });

  // Selected Filter States for Roll Call & Analytics
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionName, setSessionName] = useState<string>('Regular Lecture');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Enrolled Students for selected criteria
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [attendanceEntries, setAttendanceEntries] = useState<Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; notes: string }>>({});
  const [existingSession, setExistingSession] = useState<AttendanceSession | null>(null);

  // UI Feedback States
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Admin Overview State
  const [adminOverview, setAdminOverview] = useState<AdminAttendanceOverview | null>(null);

  // Student Attendance State
  const [studentSummary, setStudentSummary] = useState<StudentAttendanceOverview | null>(null);

  // Teacher Specific States
  const [myTeacherAssignments, setMyTeacherAssignments] = useState<TeacherSubjectAssignment[]>([]);
  const [teacherRecentSessions, setTeacherRecentSessions] = useState<AttendanceSession[]>([]);

  // Config Sub-Tab State
  const [configSubTab, setConfigSubTab] = useState<'courses' | 'years' | 'semesters' | 'sections' | 'subjects' | 'students' | 'assignments' | 'settings' | 'promotion'>('courses');

  // Load All Academic Structures on Mount
  const loadAcademicStructures = async () => {
    setIsLoading(true);
    try {
      const [crsRes, ayRes, staffRes, asgRes, setRes] = await Promise.all([
        api.getCourses(),
        api.getAcademicYears(),
        api.getStaff(),
        api.getTeacherAssignments(),
        api.getAttendanceSettings()
      ]);

      setCourses(crsRes);
      setAcademicYears(ayRes);
      setTeachers(staffRes.filter(s => s.role_title === 'Teacher'));
      setAssignments(asgRes);
      setSettings(setRes);

      // Default course & year
      const defaultCourse = crsRes.find(c => c.code === 'BCA') || crsRes[0];
      const defaultYear = ayRes.find(y => y.is_current) || ayRes[0];

      if (defaultCourse) setSelectedCourseId(defaultCourse.id);
      if (defaultYear) setSelectedYearId(defaultYear.id);

      // If Teacher, load teacher assignments
      if (currentRole === 'TEACHER') {
        const teacherData = await api.getTeacherClasses(loggedInName);
        setMyTeacherAssignments(teacherData.assignments || []);
        setTeacherRecentSessions(teacherData.recent_sessions || []);
      }

      // If Student, load student attendance
      if (currentRole === 'STUDENT') {
        const summary = await api.getStudentAttendance(loggedInName);
        setStudentSummary(summary);
      }
    } catch (err) {
      console.error('Error loading academic structures:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAcademicStructures();
  }, [currentRole, loggedInName]);

  // Load Semesters when Course changes
  useEffect(() => {
    if (!selectedCourseId) {
      setSemesters([]);
      setSelectedSemesterId('');
      return;
    }
    api.getSemesters(selectedCourseId).then(list => {
      setSemesters(list);
      if (list.length > 0) {
        // Prefer 3rd Semester or first available
        const pref = list.find(s => s.number === 3) || list[0];
        setSelectedSemesterId(pref.id);
      } else {
        setSelectedSemesterId('');
      }
    });
  }, [selectedCourseId]);

  // Load Sections & Subjects when Semester changes
  useEffect(() => {
    if (!selectedCourseId || !selectedSemesterId) {
      setSections([]);
      setSubjects([]);
      setSelectedSectionId('');
      setSelectedSubjectId('');
      return;
    }

    Promise.all([
      api.getSections(selectedCourseId, selectedSemesterId),
      api.getSubjects(selectedCourseId, selectedSemesterId)
    ]).then(([secList, subList]) => {
      setSections(secList);
      setSubjects(subList);

      if (secList.length > 0) setSelectedSectionId(secList[0].id);
      else setSelectedSectionId('');

      if (subList.length > 0) setSelectedSubjectId(subList[0].id);
      else setSelectedSubjectId('');
    });
  }, [selectedCourseId, selectedSemesterId]);

  // Load Enrolled Students & Attendance Session Entries when Selection changes
  const fetchSessionAndStudents = async () => {
    if (!selectedCourseId || !selectedYearId || !selectedSemesterId || !selectedSectionId) {
      setEnrolledStudents([]);
      return;
    }

    try {
      const studentsList = await api.getEnrolledStudents({
        course_id: selectedCourseId,
        academic_year_id: selectedYearId,
        semester_id: selectedSemesterId,
        section_id: selectedSectionId
      });
      setEnrolledStudents(studentsList);

      // Fetch existing session if subject and date selected
      if (selectedSubjectId && selectedDate) {
        const sessionRes = await api.getAttendanceSession({
          course_id: selectedCourseId,
          academic_year_id: selectedYearId,
          semester_id: selectedSemesterId,
          section_id: selectedSectionId,
          subject_id: selectedSubjectId,
          date: selectedDate,
          session_name: sessionName
        });

        if (sessionRes.session) {
          setExistingSession(sessionRes.session);
          const map: Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; notes: string }> = {};
          sessionRes.entries.forEach(e => {
            map[e.student_id] = { status: e.status, notes: e.notes || '' };
          });
          // Fill default present for unrecorded students
          studentsList.forEach(s => {
            if (!map[s.id]) map[s.id] = { status: 'PRESENT', notes: '' };
          });
          setAttendanceEntries(map);
        } else {
          setExistingSession(null);
          const map: Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; notes: string }> = {};
          studentsList.forEach(s => {
            map[s.id] = { status: 'PRESENT', notes: '' };
          });
          setAttendanceEntries(map);
        }
      }
    } catch (err) {
      console.error('Failed to load session/students:', err);
    }
  };

  useEffect(() => {
    fetchSessionAndStudents();
  }, [selectedCourseId, selectedYearId, selectedSemesterId, selectedSectionId, selectedSubjectId, selectedDate, sessionName]);

  // Load Admin Overview when tab changes
  useEffect(() => {
    if (activeTab === 'overview') {
      api.getAdminAttendanceOverview({
        course_id: selectedCourseId,
        academic_year_id: selectedYearId,
        semester_id: selectedSemesterId,
        section_id: selectedSectionId
      }).then(setAdminOverview);
    }
  }, [activeTab, selectedCourseId, selectedYearId, selectedSemesterId, selectedSectionId]);

  // Roll Call Action Handlers
  const handleToggleStudentStatus = (studentId: string) => {
    setAttendanceEntries(prev => {
      const current = prev[studentId]?.status || 'PRESENT';
      const nextStatus = current === 'PRESENT' ? 'ABSENT' : 'PRESENT';
      return {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          status: nextStatus
        }
      };
    });
  };

  const handleMarkAll = (status: 'PRESENT' | 'ABSENT') => {
    const updated: Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; notes: string }> = {};
    enrolledStudents.forEach(stu => {
      updated[stu.id] = {
        status,
        notes: attendanceEntries[stu.id]?.notes || ''
      };
    });
    setAttendanceEntries(updated);
  };

  const handleSaveSession = async () => {
    if (!selectedCourseId || !selectedYearId || !selectedSemesterId || !selectedSectionId || !selectedSubjectId) {
      setErrorMessage('Please select Course, Academic Year, Semester, Section, and Subject before saving.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccessMessage('');

    try {
      const entriesArray = enrolledStudents.map(stu => ({
        student_id: stu.id,
        status: attendanceEntries[stu.id]?.status || 'PRESENT',
        notes: attendanceEntries[stu.id]?.notes || ''
      }));

      const res = await api.saveAttendanceSession({
        course_id: selectedCourseId,
        academic_year_id: selectedYearId,
        semester_id: selectedSemesterId,
        section_id: selectedSectionId,
        subject_id: selectedSubjectId,
        date: selectedDate,
        session_name: sessionName,
        recorded_by: loggedInName || 'Faculty',
        recorded_by_name: loggedInName || 'Faculty Member',
        entries: entriesArray,
        force_update: true
      });

      if (res.success) {
        setExistingSession(res.session);
        setSaveSuccessMessage(res.is_update ? 'Attendance Session Updated Successfully!' : 'Attendance Session Recorded Successfully!');
        setTimeout(() => setSaveSuccessMessage(''), 3000);
        onRefresh();
      } else {
        setErrorMessage(res.error || 'Failed to save attendance session.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while saving attendance.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered Roster by Search Query
  const filteredRoster = useMemo(() => {
    if (!searchQuery.trim()) return enrolledStudents;
    const q = searchQuery.toLowerCase();
    return enrolledStudents.filter(
      s => s.name.toLowerCase().includes(q) || (s.register_number && s.register_number.toLowerCase().includes(q)) || s.roll_number.toLowerCase().includes(q)
    );
  }, [enrolledStudents, searchQuery]);

  // Roll Call Statistics
  const presentCount = Object.values(attendanceEntries).filter(e => e.status === 'PRESENT').length;
  const absentCount = Object.values(attendanceEntries).filter(e => e.status === 'ABSENT').length;
  const totalCount = enrolledStudents.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 1000) / 10 : 0;

  // Selected names for header breadcrumb
  const currentCourse = courses.find(c => c.id === selectedCourseId);
  const currentYear = academicYears.find(y => y.id === selectedYearId);
  const currentSemester = semesters.find(s => s.id === selectedSemesterId);
  const currentSection = sections.find(s => s.id === selectedSectionId);
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);

  // -------------------------------------------------------------
  // CONFIG MANAGEMENT FORMS & STATES (ADMIN ONLY)
  // -------------------------------------------------------------
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newYearName, setNewYearName] = useState('');
  const [newSemName, setNewSemName] = useState('');
  const [newSemNumber, setNewSemNumber] = useState<number>(1);
  const [newSecName, setNewSecName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRegNo, setNewStudentRegNo] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');

  // Assign Teacher Form State
  const [asgTeacherId, setAsgTeacherId] = useState('');
  const [asgCourseId, setAsgCourseId] = useState('');
  const [asgYearId, setAsgYearId] = useState('');
  const [asgSemId, setAsgSemId] = useState('');
  const [asgSecId, setAsgSecId] = useState('');
  const [asgSubId, setAsgSubId] = useState('');

  // Student Promotion State
  const [promFromYear, setPromFromYear] = useState('');
  const [promFromSem, setPromFromSem] = useState('');
  const [promFromSec, setPromFromSec] = useState('');
  const [promToYear, setPromToYear] = useState('');
  const [promToSem, setPromToSem] = useState('');
  const [promToSec, setPromToSec] = useState('');
  const [promSelectedStudents, setPromSelectedStudents] = useState<string[]>([]);
  const [promResult, setPromResult] = useState<any>(null);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseName) return;
    await api.createCourse({ code: newCourseCode, name: newCourseName });
    setNewCourseCode('');
    setNewCourseName('');
    loadAcademicStructures();
  };

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearName) return;
    await api.createAcademicYear({ name: newYearName, start_date: '2026-06-01', end_date: '2027-05-31', is_current: false });
    setNewYearName('');
    loadAcademicStructures();
  };

  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !newSemName) return;
    await api.createSemester({ course_id: selectedCourseId, number: newSemNumber, name: newSemName });
    setNewSemName('');
    loadAcademicStructures();
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedSemesterId || !newSecName) return;
    await api.createSection({ course_id: selectedCourseId, semester_id: selectedSemesterId, name: newSecName });
    setNewSecName('');
    loadAcademicStructures();
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedSemesterId || !newSubCode || !newSubName) return;
    await api.createSubject({ code: newSubCode, name: newSubName, course_id: selectedCourseId, semester_id: selectedSemesterId });
    setNewSubCode('');
    setNewSubName('');
    loadAcademicStructures();
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !selectedCourseId || !selectedSemesterId || !selectedSectionId) return;
    await api.createStudent({
      name: newStudentName,
      register_number: newStudentRegNo || `REG${Date.now().toString().slice(-5)}`,
      roll_number: `${currentCourse?.code || 'STUD'}-${currentSection?.name || 'A'}-${Math.floor(Math.random() * 90 + 10)}`,
      email: newStudentEmail || `${newStudentName.toLowerCase().replace(/\s+/g, '.')}@student.devora.edu`,
      course_id: selectedCourseId,
      academic_year_id: selectedYearId,
      semester_id: selectedSemesterId,
      section: currentSection?.name || 'A',
      class_grade: String(currentSemester?.number || 3),
      guardian_name: 'Parent / Guardian',
      guardian_phone: '+15550991100',
      attendance_rate: 100
    });
    setNewStudentName('');
    setNewStudentRegNo('');
    setNewStudentEmail('');
    fetchSessionAndStudents();
  };

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTeacherId || !asgCourseId || !asgYearId || !asgSemId || !asgSecId || !asgSubId) return;
    await api.createTeacherAssignment({
      teacher_id: asgTeacherId,
      course_id: asgCourseId,
      academic_year_id: asgYearId,
      semester_id: asgSemId,
      section_id: asgSecId,
      subject_id: asgSubId
    });
    loadAcademicStructures();
  };

  const handleUpdateSettings = async () => {
    await api.updateAttendanceSettings(settings);
    setSaveSuccessMessage('Attendance Settings Saved!');
    setTimeout(() => setSaveSuccessMessage(''), 2500);
  };

  const handlePromoteStudentsSubmit = async () => {
    if (!promToYear || !promToSem || !promToSec || promSelectedStudents.length === 0) return;
    const res = await api.promoteStudents({
      from_year_id: promFromYear,
      from_semester_id: promFromSem,
      from_section_id: promFromSec,
      to_year_id: promToYear,
      to_semester_id: promToSem,
      to_section_id: promToSec,
      student_ids: promSelectedStudents
    });
    setPromResult(res);
    fetchSessionAndStudents();
  };

  return (
    <div id={id} className="space-y-6">
      {/* Top Header & Role Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6B1E2B] animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-widest text-[#6B1E2B] uppercase">
              DEVORA CAMPUS OPERATIONS // DYNAMIC ATTENDANCE ENGINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B2020] tracking-tight flex items-center gap-2">
            Attendance Operations Hub
            <span className="text-xs font-mono font-bold text-[#5F8F68] bg-[#5F8F68]/12 px-3 py-1 rounded-full border border-[#5F8F68]/25">
              Live DB Session
            </span>
          </h1>
          <p className="text-sm text-[#756565] font-medium mt-1">
            Database-driven roll call, dynamic academic structure config, RBAC isolation, and AI operational analytics.
          </p>
        </div>

        {/* Primary Role Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 p-1.5 rounded-2xl shadow-xs backdrop-blur-md">
          {(currentRole === 'ADMIN' || currentRole === 'TEACHER') && (
            <button
              type="button"
              onClick={() => setActiveTab('roll-call')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'roll-call'
                  ? 'bg-[#6B1E2B] text-[#FFF8EC] shadow-md shadow-[#6B1E2B]/20'
                  : 'text-[#756565] hover:text-[#2B2020] hover:bg-[#E8DDCA]/50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Roll Call</span>
            </button>
          )}

          {currentRole === 'ADMIN' && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('config')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'config'
                    ? 'bg-[#6B1E2B] text-[#FFF8EC] shadow-md shadow-[#6B1E2B]/20'
                    : 'text-[#756565] hover:text-[#2B2020] hover:bg-[#E8DDCA]/50'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Academic Config</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#6B1E2B] text-[#FFF8EC] shadow-md shadow-[#6B1E2B]/20'
                    : 'text-[#756565] hover:text-[#2B2020] hover:bg-[#E8DDCA]/50'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Analytics & Insights</span>
              </button>
            </>
          )}

          {currentRole === 'STUDENT' && (
            <button
              type="button"
              onClick={() => setActiveTab('my-attendance')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'my-attendance'
                  ? 'bg-[#6B1E2B] text-[#FFF8EC] shadow-md shadow-[#6B1E2B]/20'
                  : 'text-[#756565] hover:text-[#2B2020] hover:bg-[#E8DDCA]/50'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>My Attendance</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert Notifications */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-xl bg-[#5F8F68]/15 border border-[#5F8F68]/30 text-[#2B2020] font-mono text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#5F8F68]" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#B94A55]/15 border border-[#B94A55]/30 text-[#B94A55] font-mono text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-[#B94A55]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 1: ROLL CALL / MARK ATTENDANCE                                  */}
      {/* ==================================================================== */}
      {activeTab === 'roll-call' && (
        <div className="space-y-6">
          {/* DEPENDENT FILTER SELECTORS BAR */}
          <div className="p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#6B1E2B]/12 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                <Filter className="w-4 h-4 text-[#6B1E2B]" />
                <span>Dynamic Academic Hierarchy Filter</span>
              </div>
              <span className="text-[11px] font-mono text-[#756565]">
                Active Selection: <strong className="text-[#6B1E2B]">{currentCourse?.code || '—'}</strong> / <strong className="text-[#6B1E2B]">{currentSemester?.name || '—'}</strong> / <strong className="text-[#6B1E2B]">{currentSection?.name || '—'}</strong>
              </span>
            </div>

            {/* Quick Pills for Teachers */}
            {currentRole === 'TEACHER' && myTeacherAssignments.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold text-[#756565] uppercase">My Assigned Classes:</span>
                <div className="flex flex-wrap items-center gap-2">
                  {myTeacherAssignments.map(asg => (
                    <button
                      key={asg.id}
                      type="button"
                      onClick={() => {
                        setSelectedCourseId(asg.course_id);
                        setSelectedYearId(asg.academic_year_id);
                        setSelectedSemesterId(asg.semester_id);
                        setSelectedSectionId(asg.section_id);
                        setSelectedSubjectId(asg.subject_id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                        selectedSubjectId === asg.subject_id && selectedSectionId === asg.section_id
                          ? 'bg-[#6B1E2B] text-[#FFF8EC] border-[#6B1E2B]'
                          : 'bg-[#F3EBDD] text-[#2B2020] border-[#6B1E2B]/15 hover:border-[#6B1E2B]/40'
                      }`}
                    >
                      {asg.course_code} - {asg.semester_name} - {asg.section_name} ({asg.subject_name})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dropdown Selectors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* 1. Academic Year */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Academic Year</label>
                <select
                  value={selectedYearId}
                  onChange={(e) => setSelectedYearId(e.target.value)}
                  className="w-full bg-[#F3EBDD]/80 border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-semibold text-[#2B2020] outline-none focus:border-[#6B1E2B]"
                >
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>{y.name} {y.is_current ? '(Current)' : ''}</option>
                  ))}
                </select>
              </div>

              {/* 2. Course */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full bg-[#F3EBDD]/80 border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-bold text-[#6B1E2B] outline-none focus:border-[#6B1E2B]"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} – {c.name}</option>
                  ))}
                </select>
              </div>

              {/* 3. Semester */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Semester</label>
                <select
                  value={selectedSemesterId}
                  onChange={(e) => setSelectedSemesterId(e.target.value)}
                  className="w-full bg-[#F3EBDD]/80 border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-semibold text-[#2B2020] outline-none focus:border-[#6B1E2B]"
                >
                  {semesters.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* 4. Section */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Section</label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="w-full bg-[#F3EBDD]/80 border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-semibold text-[#2B2020] outline-none focus:border-[#6B1E2B]"
                >
                  {sections.map(sec => (
                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                  ))}
                </select>
              </div>

              {/* 5. Subject */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full bg-[#F3EBDD]/80 border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-bold text-[#2B2020] outline-none focus:border-[#6B1E2B]"
                >
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.code} – {sub.name}</option>
                  ))}
                </select>
              </div>

              {/* 6. Date */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#F3EBDD]/80 border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-semibold text-[#2B2020] outline-none focus:border-[#6B1E2B]"
                />
              </div>
            </div>
          </div>

          {/* KPI CARDS BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 shadow-sm backdrop-blur-md">
              <div className="text-[11px] font-mono uppercase text-[#756565] font-bold">Enrolled Roster</div>
              <div className="text-2xl font-bold font-mono text-[#2B2020] mt-1">{totalCount} Students</div>
              <div className="text-[11px] text-[#9A8989] font-medium truncate">{currentSection?.name || 'Class Roster'}</div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 shadow-sm backdrop-blur-md">
              <div className="text-[11px] font-mono uppercase text-[#756565] font-bold">Present Count</div>
              <div className="text-2xl font-bold font-mono text-[#5F8F68] mt-1">{presentCount}</div>
              <div className="text-[11px] text-[#9A8989] font-medium">Verified in session</div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 shadow-sm backdrop-blur-md">
              <div className="text-[11px] font-mono uppercase text-[#756565] font-bold">Absent Count</div>
              <div className="text-2xl font-bold font-mono text-[#B94A55] mt-1">{absentCount}</div>
              <div className="text-[11px] text-[#9A8989] font-medium">Flagged for follow-up</div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 shadow-sm backdrop-blur-md">
              <div className="text-[11px] font-mono uppercase text-[#756565] font-bold">Session Attendance</div>
              <div className={`text-2xl font-bold font-mono mt-1 ${attendanceRate >= settings.threshold_percentage ? 'text-[#6B1E2B]' : 'text-[#B94A55]'}`}>
                {attendanceRate}%
              </div>
              <div className="text-[11px] text-[#9A8989] font-medium">Threshold Benchmark: {settings.threshold_percentage}%</div>
            </div>
          </div>

          {/* DUPLICATE SESSION WARNING BANNER */}
          {existingSession && (
            <div className="p-4 rounded-2xl bg-[#C58A35]/12 border border-[#C58A35]/30 text-[#2B2020] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#C58A35] shrink-0" />
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#9E671E] uppercase">Existing Session Recorded</h4>
                  <p className="text-xs text-[#756565] mt-0.5">
                    An attendance session was recorded on <strong>{existingSession.date}</strong> by <strong>{existingSession.recorded_by_name}</strong>. Modifying will update the database entries.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ROSTER TABLE CARD */}
          <div className="rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 overflow-hidden shadow-sm backdrop-blur-md">
            {/* Table Header Controls */}
            <div className="p-4 border-b border-[#6B1E2B]/12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#E8DDCA]/40">
              <div className="flex items-center gap-3">
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#2B2020] font-bold">
                  {currentCourse?.code} {currentSemester?.name} ({currentSection?.name}) — {currentSubject?.name || 'Class Subject'}
                </h3>
              </div>

              {/* Search + Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#756565] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search student or roll..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl text-xs font-mono bg-[#FFF8EC] border border-[#6B1E2B]/20 text-[#2B2020] outline-none focus:border-[#6B1E2B]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleMarkAll('PRESENT')}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#5F8F68]/15 text-[#5F8F68] border border-[#5F8F68]/30 hover:bg-[#5F8F68]/25 transition-all cursor-pointer"
                >
                  Mark All Present
                </button>

                <button
                  type="button"
                  onClick={() => handleMarkAll('ABSENT')}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#B94A55]/15 text-[#B94A55] border border-[#B94A55]/30 hover:bg-[#B94A55]/25 transition-all cursor-pointer"
                >
                  Mark All Absent
                </button>

                <button
                  type="button"
                  onClick={handleSaveSession}
                  disabled={isSaving || enrolledStudents.length === 0}
                  className="px-4 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#6B1E2B] hover:bg-[#42121C] text-[#FFF8EC] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-[#6B1E2B]/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : existingSession ? 'Update Session' : 'Save Attendance'}</span>
                </button>
              </div>
            </div>

            {/* Roster List */}
            {filteredRoster.length === 0 ? (
              <div className="p-12 text-center space-y-3 font-mono">
                <Users className="w-10 h-10 text-[#756565]/40 mx-auto" />
                <p className="text-sm font-bold text-[#756565]">No students found for this course, semester, and section filter.</p>
                <p className="text-xs text-[#9A8989]">Use Academic Configuration to enroll or assign students to this class.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#6B1E2B]/10">
                {filteredRoster.map((stu) => {
                  const entry = attendanceEntries[stu.id] || { status: 'PRESENT', notes: '' };
                  const isPresent = entry.status === 'PRESENT';

                  return (
                    <div
                      key={stu.id}
                      className="p-4 hover:bg-[#E8DDCA]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-xs border ${
                          isPresent
                            ? 'bg-[#5F8F68]/15 text-[#5F8F68] border-[#5F8F68]/30'
                            : 'bg-[#B94A55]/15 text-[#B94A55] border-[#B94A55]/30'
                        }`}>
                          {stu.register_number ? stu.register_number.slice(-3) : stu.roll_number.split('-').pop()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#2B2020] flex items-center gap-2">
                            {stu.name}
                            <span className="text-xs font-mono text-[#6B1E2B] bg-[#6B1E2B]/8 px-2 py-0.5 rounded-md border border-[#6B1E2B]/15">
                              {stu.register_number || stu.roll_number}
                            </span>
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#756565] font-mono mt-1">
                            <span>Guardian: {stu.guardian_name}</span>
                            <span>Historical Avg: <strong className="text-[#2B2020]">{stu.attendance_rate}%</strong></span>
                            {stu.medical_notes && (
                              <span className="text-[#C58A35] bg-[#C58A35]/12 px-2 py-0.5 rounded-md border border-[#C58A35]/25 font-semibold">
                                {stu.medical_notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Toggle Buttons & Notes */}
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <input
                          type="text"
                          placeholder="Optional notes..."
                          value={entry.notes || ''}
                          onChange={(e) => {
                            const noteVal = e.target.value;
                            setAttendanceEntries(prev => ({
                              ...prev,
                              [stu.id]: { ...prev[stu.id], notes: noteVal }
                            }));
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-mono bg-[#FFF8EC] border border-[#6B1E2B]/15 text-[#2B2020] outline-none w-36 sm:w-48"
                        />

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleStudentStatus(stu.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isPresent
                                ? 'bg-[#5F8F68]/20 text-[#5F8F68] border border-[#5F8F68]/40 shadow-xs'
                                : 'bg-[#FFF8EC] text-[#9A8989] border border-[#6B1E2B]/15 hover:text-[#2B2020]'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStudentStatus(stu.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              !isPresent
                                ? 'bg-[#B94A55]/20 text-[#B94A55] border border-[#B94A55]/40 shadow-xs'
                                : 'bg-[#FFF8EC] text-[#9A8989] border border-[#6B1E2B]/15 hover:text-[#2B2020]'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: ACADEMIC CONFIGURATION (ADMIN ONLY)                          */}
      {/* ==================================================================== */}
      {activeTab === 'config' && currentRole === 'ADMIN' && (
        <div className="space-y-6">
          {/* Sub-Tab Navigation Bar */}
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md">
            {[
              { id: 'courses', label: '1. Courses' },
              { id: 'years', label: '2. Academic Years' },
              { id: 'semesters', label: '3. Semesters' },
              { id: 'sections', label: '4. Sections' },
              { id: 'subjects', label: '5. Subjects' },
              { id: 'students', label: '6. Students' },
              { id: 'assignments', label: '7. Teacher Assignments' },
              { id: 'settings', label: '8. Threshold Settings' },
              { id: 'promotion', label: '9. Student Promotion' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setConfigSubTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  configSubTab === tab.id
                    ? 'bg-[#6B1E2B] text-[#FFF8EC] shadow-sm'
                    : 'text-[#756565] hover:text-[#2B2020] hover:bg-[#E8DDCA]/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 1. COURSES CONFIG */}
          {configSubTab === 'courses' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md space-y-4">
                <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#6B1E2B]" />
                  <span>Add New Course</span>
                </h3>
                <form onSubmit={handleCreateCourse} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Course Code</label>
                    <input
                      type="text"
                      placeholder="e.g. BBA, B.Com, MCA"
                      value={newCourseCode}
                      onChange={(e) => setNewCourseCode(e.target.value)}
                      className="w-full bg-[#F3EBDD] border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#2B2020] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Course Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Bachelor of Business Administration"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      className="w-full bg-[#F3EBDD] border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#2B2020] outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#6B1E2B] text-[#FFF8EC] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#42121C] transition-all"
                  >
                    Save Course
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md space-y-4">
                <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                  Configured Courses ({courses.length})
                </h3>
                <div className="space-y-2">
                  {courses.map(crs => (
                    <div key={crs.id} className="p-3.5 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/10 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#2B2020]">{crs.code} – {crs.name}</h4>
                        <p className="text-[11px] font-mono text-[#756565]">{crs.description || `${crs.duration_years} Years Program`}</p>
                      </div>
                      <span className="text-[11px] font-mono text-[#5F8F68] bg-[#5F8F68]/15 px-2.5 py-0.5 rounded-full border border-[#5F8F68]/30 font-bold">
                        {crs.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. ACADEMIC YEARS CONFIG */}
          {configSubTab === 'years' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md space-y-4">
                <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#6B1E2B]" />
                  <span>Add Academic Year</span>
                </h3>
                <form onSubmit={handleCreateYear} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Academic Year Name</label>
                    <input
                      type="text"
                      placeholder="e.g. 2027-28"
                      value={newYearName}
                      onChange={(e) => setNewYearName(e.target.value)}
                      className="w-full bg-[#F3EBDD] border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#2B2020] outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#6B1E2B] text-[#FFF8EC] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#42121C] transition-all"
                  >
                    Save Academic Year
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md space-y-4">
                <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                  Configured Academic Years ({academicYears.length})
                </h3>
                <div className="space-y-2">
                  {academicYears.map(ay => (
                    <div key={ay.id} className="p-3.5 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/10 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#2B2020]">{ay.name}</h4>
                        <p className="text-[11px] font-mono text-[#756565]">{ay.start_date} to {ay.end_date}</p>
                      </div>
                      {ay.is_current ? (
                        <span className="text-[11px] font-mono text-[#6B1E2B] bg-[#6B1E2B]/15 px-2.5 py-0.5 rounded-full border border-[#6B1E2B]/30 font-bold">
                          Current Active Year
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-[#756565] bg-[#756565]/10 px-2.5 py-0.5 rounded-full">
                          Standard Year
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. SEMESTERS CONFIG */}
          {configSubTab === 'semesters' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md space-y-4">
                <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#6B1E2B]" />
                  <span>Add Semester</span>
                </h3>
                <form onSubmit={handleCreateSemester} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Select Course</label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full bg-[#F3EBDD] border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#2B2020] outline-none"
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.code} – {c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Semester Number</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={newSemNumber}
                      onChange={(e) => setNewSemNumber(Number(e.target.value))}
                      className="w-full bg-[#F3EBDD] border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#2B2020] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Semester Display Name</label>
                    <input
                      type="text"
                      placeholder="e.g. 1st Semester"
                      value={newSemName}
                      onChange={(e) => setNewSemName(e.target.value)}
                      className="w-full bg-[#F3EBDD] border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#2B2020] outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#6B1E2B] text-[#FFF8EC] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#42121C] transition-all"
                  >
                    Save Semester
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md space-y-4">
                <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                  Semesters for {currentCourse?.code || 'Course'} ({semesters.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {semesters.map(sem => (
                    <div key={sem.id} className="p-3.5 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/10 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#2B2020]">{sem.name}</h4>
                      <span className="text-[11px] font-mono text-[#5F8F68] bg-[#5F8F68]/15 px-2.5 py-0.5 rounded-full border border-[#5F8F68]/30 font-bold">
                        {sem.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. SECTIONS CONFIG */}
          {configSubTab === 'sections' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md space-y-4">
                <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#6B1E2B]" />
                  <span>Add Section</span>
                </h3>
                <form onSubmit={handleCreateSection} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Section Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Section 1st Neo, Section 1B1"
                      value={newSecName}
                      onChange={(e) => setNewSecName(e.target.value)}
                      className="w-full bg-[#F3EBDD] border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#2B2020] outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#6B1E2B] text-[#FFF8EC] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#42121C] transition-all"
                  >
                    Save Section
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md space-y-4">
                <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                  Configured Sections for {currentSemester?.name || 'Semester'} ({sections.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sections.map(sec => (
                    <div key={sec.id} className="p-3.5 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/10 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#2B2020]">{sec.name}</h4>
                      <span className="text-[11px] font-mono text-[#5F8F68] bg-[#5F8F68]/15 px-2.5 py-0.5 rounded-full font-bold">
                        {sec.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. SUBJECTS CONFIG */}
          {configSubTab === 'subjects' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md space-y-4">
                <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#6B1E2B]" />
                  <span>Add Subject</span>
                </h3>
                <form onSubmit={handleCreateSubject} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Subject Code</label>
                    <input
                      type="text"
                      placeholder="e.g. BCA301"
                      value={newSubCode}
                      onChange={(e) => setNewSubCode(e.target.value)}
                      className="w-full bg-[#F3EBDD] border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#2B2020] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Subject Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Python Programming"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      className="w-full bg-[#F3EBDD] border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#2B2020] outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#6B1E2B] text-[#FFF8EC] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#42121C] transition-all"
                  >
                    Save Subject
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md space-y-4">
                <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                  Subjects for {currentSemester?.name || 'Semester'} ({subjects.length})
                </h3>
                <div className="space-y-2">
                  {subjects.map(sub => (
                    <div key={sub.id} className="p-3.5 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/10 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#2B2020]">{sub.code} – {sub.name}</h4>
                        <p className="text-[11px] font-mono text-[#756565]">Credits: {sub.credits || 4} | Hours/Week: {sub.hours_per_week || 4}</p>
                      </div>
                      <span className="text-[11px] font-mono text-[#5F8F68] bg-[#5F8F68]/15 px-2.5 py-0.5 rounded-full font-bold">
                        {sub.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. STUDENTS CONFIG */}
          {configSubTab === 'students' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md space-y-4">
                <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#6B1E2B]" />
                  <span>Enroll New Student</span>
                </h3>
                <form onSubmit={handleCreateStudent} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Student Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alexander Vance"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="w-full bg-[#F3EBDD] border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#2B2020] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Register Number</label>
                    <input
                      type="text"
                      placeholder="e.g. BCA26025"
                      value={newStudentRegNo}
                      onChange={(e) => setNewStudentRegNo(e.target.value)}
                      className="w-full bg-[#F3EBDD] border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#2B2020] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Student Email</label>
                    <input
                      type="email"
                      placeholder="e.g. alex.v@student.devora.edu"
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                      className="w-full bg-[#F3EBDD] border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#2B2020] outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#6B1E2B] text-[#FFF8EC] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#42121C] transition-all"
                  >
                    Enroll Student
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md space-y-4">
                <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                  Enrolled Roster for {currentCourse?.code} {currentSemester?.name} ({currentSection?.name}) ({enrolledStudents.length})
                </h3>
                <div className="space-y-2">
                  {enrolledStudents.map(stu => (
                    <div key={stu.id} className="p-3 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/10 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#2B2020]">{stu.name} ({stu.register_number || stu.roll_number})</h4>
                        <p className="text-[11px] font-mono text-[#756565]">{stu.email} | Guardian: {stu.guardian_name}</p>
                      </div>
                      <span className="text-[11px] font-mono text-[#5F8F68] bg-[#5F8F68]/15 px-2.5 py-0.5 rounded-full font-bold">
                        {stu.attendance_rate}% Avg
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. TEACHER ASSIGNMENTS CONFIG */}
          {configSubTab === 'assignments' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md space-y-4">
                <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#6B1E2B]" />
                  <span>Assign Teacher to Class/Subject</span>
                </h3>
                <form onSubmit={handleAssignTeacher} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Teacher</label>
                    <select
                      value={asgTeacherId}
                      onChange={(e) => setAsgTeacherId(e.target.value)}
                      className="w-full bg-[#F3EBDD] border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#2B2020] outline-none"
                    >
                      <option value="">Select Teacher...</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Course</label>
                    <select
                      value={asgCourseId}
                      onChange={(e) => setAsgCourseId(e.target.value)}
                      className="w-full bg-[#F3EBDD] border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#2B2020] outline-none"
                    >
                      <option value="">Select Course...</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.code} – {c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Academic Year</label>
                    <select
                      value={asgYearId}
                      onChange={(e) => setAsgYearId(e.target.value)}
                      className="w-full bg-[#F3EBDD] border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#2B2020] outline-none"
                    >
                      <option value="">Select Academic Year...</option>
                      {academicYears.map(y => (
                        <option key={y.id} value={y.id}>{y.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Semester</label>
                    <select
                      value={asgSemId}
                      onChange={(e) => setAsgSemId(e.target.value)}
                      className="w-full bg-[#F3EBDD] border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#2B2020] outline-none"
                    >
                      <option value="">Select Semester...</option>
                      {semesters.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Section</label>
                    <select
                      value={asgSecId}
                      onChange={(e) => setAsgSecId(e.target.value)}
                      className="w-full bg-[#F3EBDD] border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#2B2020] outline-none"
                    >
                      <option value="">Select Section...</option>
                      {sections.map(sec => (
                        <option key={sec.id} value={sec.id}>{sec.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-mono font-bold text-[#756565] uppercase">Subject</label>
                    <select
                      value={asgSubId}
                      onChange={(e) => setAsgSubId(e.target.value)}
                      className="w-full bg-[#F3EBDD] border border-[#6B1E2B]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#2B2020] outline-none"
                    >
                      <option value="">Select Subject...</option>
                      {subjects.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.code} – {sub.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#6B1E2B] text-[#FFF8EC] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#42121C] transition-all"
                  >
                    Assign Faculty
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md space-y-4">
                <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                  Active Faculty Assignments ({assignments.length})
                </h3>
                <div className="space-y-2">
                  {assignments.map(asg => (
                    <div key={asg.id} className="p-3.5 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/10 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#2B2020]">{asg.teacher_name}</h4>
                        <p className="text-[11px] font-mono text-[#756565]">
                          {asg.course_code} | {asg.semester_name} | {asg.section_name} | <strong className="text-[#6B1E2B]">{asg.subject_name}</strong> ({asg.academic_year_name})
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await api.deleteTeacherAssignment(asg.id);
                          loadAcademicStructures();
                        }}
                        className="p-1.5 rounded-lg text-[#B94A55] hover:bg-[#B94A55]/10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 8. THRESHOLD SETTINGS CONFIG */}
          {configSubTab === 'settings' && (
            <div className="p-6 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md max-w-xl space-y-6">
              <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#6B1E2B]" />
                <span>Attendance System Settings</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono font-bold text-[#2B2020] block mb-1">
                    Attendance Alert Threshold Percentage (%):
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    step={0.5}
                    value={settings.threshold_percentage}
                    onChange={(e) => setSettings({ ...settings, threshold_percentage: Number(e.target.value) })}
                    className="w-full bg-[#F3EBDD] border border-[#6B1E2B]/20 rounded-xl px-4 py-2 text-sm font-mono font-bold text-[#6B1E2B] outline-none"
                  />
                  <p className="text-[11px] text-[#756565] mt-1">Students falling below this percentage will be flagged on the operations brief and trigger low attendance notifications.</p>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/10">
                  <div>
                    <h4 className="text-xs font-bold text-[#2B2020]">Allow Teacher Session Editing</h4>
                    <p className="text-[11px] font-mono text-[#756565]">Teachers can edit previously recorded attendance sessions.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allow_teacher_edit}
                    onChange={(e) => setSettings({ ...settings, allow_teacher_edit: e.target.checked })}
                    className="w-4 h-4 accent-[#6B1E2B] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/10">
                  <div>
                    <h4 className="text-xs font-bold text-[#2B2020]">Automated Low Attendance Alerts</h4>
                    <p className="text-[11px] font-mono text-[#756565]">Send notification & email alerts when attendance drops below threshold.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.send_alert_on_low_attendance}
                    onChange={(e) => setSettings({ ...settings, send_alert_on_low_attendance: e.target.checked })}
                    className="w-4 h-4 accent-[#6B1E2B] cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleUpdateSettings}
                  className="w-full py-3 rounded-xl bg-[#6B1E2B] text-[#FFF8EC] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#42121C] transition-all cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {/* 9. STUDENT PROMOTION */}
          {configSubTab === 'promotion' && (
            <div className="p-6 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md space-y-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#6B1E2B]" />
                <div>
                  <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                    Student Academic Promotion Wizard
                  </h3>
                  <p className="text-xs text-[#756565]">
                    Bulk promote students across academic years, semesters, and sections with mandatory preview verification.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SOURCE SELECTOR */}
                <div className="p-4 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/10 space-y-3">
                  <h4 className="text-xs font-mono font-bold text-[#6B1E2B] uppercase">Source Class (Current)</h4>
                  <div>
                    <label className="text-[11px] font-mono text-[#756565]">Academic Year</label>
                    <select
                      value={promFromYear}
                      onChange={(e) => setPromFromYear(e.target.value)}
                      className="w-full bg-[#FFF8EC] border border-[#6B1E2B]/20 rounded-xl px-3 py-1.5 text-xs font-mono"
                    >
                      <option value="">Select Source Year...</option>
                      {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-[#756565]">Semester</label>
                    <select
                      value={promFromSem}
                      onChange={(e) => setPromFromSem(e.target.value)}
                      className="w-full bg-[#FFF8EC] border border-[#6B1E2B]/20 rounded-xl px-3 py-1.5 text-xs font-mono"
                    >
                      <option value="">Select Source Semester...</option>
                      {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-[#756565]">Section</label>
                    <select
                      value={promFromSec}
                      onChange={(e) => setPromFromSec(e.target.value)}
                      className="w-full bg-[#FFF8EC] border border-[#6B1E2B]/20 rounded-xl px-3 py-1.5 text-xs font-mono"
                    >
                      <option value="">Select Source Section...</option>
                      {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* TARGET SELECTOR */}
                <div className="p-4 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/10 space-y-3">
                  <h4 className="text-xs font-mono font-bold text-[#5F8F68] uppercase">Target Class (Promotion)</h4>
                  <div>
                    <label className="text-[11px] font-mono text-[#756565]">Target Academic Year</label>
                    <select
                      value={promToYear}
                      onChange={(e) => setPromToYear(e.target.value)}
                      className="w-full bg-[#FFF8EC] border border-[#6B1E2B]/20 rounded-xl px-3 py-1.5 text-xs font-mono"
                    >
                      <option value="">Select Target Year...</option>
                      {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-[#756565]">Target Semester</label>
                    <select
                      value={promToSem}
                      onChange={(e) => setPromToSem(e.target.value)}
                      className="w-full bg-[#FFF8EC] border border-[#6B1E2B]/20 rounded-xl px-3 py-1.5 text-xs font-mono"
                    >
                      <option value="">Select Target Semester...</option>
                      {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-[#756565]">Target Section</label>
                    <select
                      value={promToSec}
                      onChange={(e) => setPromToSec(e.target.value)}
                      className="w-full bg-[#FFF8EC] border border-[#6B1E2B]/20 rounded-xl px-3 py-1.5 text-xs font-mono"
                    >
                      <option value="">Select Target Section...</option>
                      {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Student Selection Checklist */}
              <div className="space-y-3 border-t border-[#6B1E2B]/12 pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold text-[#2B2020] uppercase">
                    Select Students to Promote ({promSelectedStudents.length} Selected)
                  </h4>
                  <button
                    type="button"
                    onClick={() => setPromSelectedStudents(enrolledStudents.map(s => s.id))}
                    className="text-xs font-mono text-[#6B1E2B] font-bold cursor-pointer"
                  >
                    Select All Enrolled
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-2 bg-[#F3EBDD]/40 rounded-xl border border-[#6B1E2B]/10">
                  {enrolledStudents.map(s => (
                    <label key={s.id} className="flex items-center gap-2 text-xs font-mono bg-[#FFF8EC] p-2 rounded-lg border border-[#6B1E2B]/10 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={promSelectedStudents.includes(s.id)}
                        onChange={(e) => {
                          if (e.target.checked) setPromSelectedStudents([...promSelectedStudents, s.id]);
                          else setPromSelectedStudents(promSelectedStudents.filter(id => id !== s.id));
                        }}
                        className="accent-[#6B1E2B]"
                      />
                      <span className="truncate">{s.name} ({s.register_number || s.roll_number})</span>
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handlePromoteStudentsSubmit}
                  disabled={promSelectedStudents.length === 0 || !promToSem}
                  className="px-6 py-3 rounded-xl bg-[#6B1E2B] text-[#FFF8EC] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#42121C] transition-all cursor-pointer disabled:opacity-50"
                >
                  Confirm & Promote Students
                </button>

                {promResult && (
                  <div className="p-4 rounded-xl bg-[#5F8F68]/15 border border-[#5F8F68]/30 font-mono text-xs text-[#2B2020] font-bold">
                    Successfully promoted {promResult.promoted_count} students to target semester and section!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: ADMIN ATTENDANCE ANALYTICS & AI INSIGHTS                    */}
      {/* ==================================================================== */}
      {activeTab === 'overview' && currentRole === 'ADMIN' && adminOverview && (
        <div className="space-y-6">
          {/* AI INSIGHTS BANNER */}
          <div className="rounded-2xl bg-gradient-to-br from-[#FFF8EC] via-[#F8EFE0] to-[#FFF8EC] border border-[#6B1E2B]/20 p-6 shadow-sm backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Devora AI Attendance Operational Intelligence</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {adminOverview.ai_insights.map((insight, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#6B1E2B] mt-1.5 shrink-0" />
                  <p className="text-xs text-[#2B2020] font-medium leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* OVERVIEW KPI METRICS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 shadow-sm backdrop-blur-md">
              <div className="text-[11px] font-mono uppercase text-[#756565] font-bold">Total Enrolled</div>
              <div className="text-2xl font-bold font-mono text-[#2B2020] mt-1">{adminOverview.total_students} Students</div>
              <div className="text-[11px] text-[#9A8989] font-medium">Across all sections</div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 shadow-sm backdrop-blur-md">
              <div className="text-[11px] font-mono uppercase text-[#756565] font-bold">Overall Attendance</div>
              <div className="text-2xl font-bold font-mono text-[#5F8F68] mt-1">{adminOverview.overall_attendance}%</div>
              <div className="text-[11px] text-[#9A8989] font-medium">Campus Benchmark: {adminOverview.threshold}%</div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 shadow-sm backdrop-blur-md">
              <div className="text-[11px] font-mono uppercase text-[#756565] font-bold">Below Threshold</div>
              <div className="text-2xl font-bold font-mono text-[#B94A55] mt-1">{adminOverview.students_below_threshold_count} Students</div>
              <div className="text-[11px] text-[#9A8989] font-medium">Flagged for alert</div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 shadow-sm backdrop-blur-md">
              <div className="text-[11px] font-mono uppercase text-[#756565] font-bold">Sessions Conducted</div>
              <div className="text-2xl font-bold font-mono text-[#6B1E2B] mt-1">{adminOverview.sessions_today} Today</div>
              <div className="text-[11px] text-[#9A8989] font-medium">{adminOverview.missing_sessions_today} Pending Roll-Call</div>
            </div>
          </div>

          {/* SEMESTER BREAKDOWN CARDS */}
          <div className="p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md space-y-4">
            <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">
              Semester Attendance Percentage Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {adminOverview.semester_breakdown.map((s, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#2B2020]">{s.semester_name}</h4>
                    <p className="text-[11px] font-mono text-[#756565]">{s.total_students} Students | {s.absent_today} Absent Today</p>
                  </div>
                  <span className={`text-sm font-mono font-extrabold px-3 py-1 rounded-xl border ${
                    s.percentage >= adminOverview.threshold
                      ? 'bg-[#5F8F68]/15 text-[#5F8F68] border-[#5F8F68]/30'
                      : 'bg-[#B94A55]/15 text-[#B94A55] border-[#B94A55]/30'
                  }`}>
                    {s.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* FLAGGED LOW ATTENDANCE ROSTER */}
          <div className="p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold text-[#B94A55] uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Flagged Low Attendance Students (&lt; {adminOverview.threshold}% Threshold)</span>
              </h3>
              <span className="text-xs font-mono text-[#756565]">{adminOverview.low_attendance_students.length} Total Flagged</span>
            </div>

            <div className="divide-y divide-[#6B1E2B]/10">
              {adminOverview.low_attendance_students.map(stu => (
                <div key={stu.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#2B2020]">{stu.name} ({stu.register_number})</h4>
                    <p className="text-[11px] font-mono text-[#756565]">{stu.course} – {stu.semester} ({stu.section})</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#B94A55] bg-[#B94A55]/15 px-3 py-1 rounded-xl border border-[#B94A55]/30">
                    {stu.attendance_percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: STUDENT PERSONAL ATTENDANCE DASHBOARD                        */}
      {/* ==================================================================== */}
      {activeTab === 'my-attendance' && currentRole === 'STUDENT' && (
        <div className="space-y-6">
          {studentSummary ? (
            <>
              {/* Profile Overview Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#FFF8EC] via-[#F8EFE0] to-[#FFF8EC] border border-[#6B1E2B]/20 shadow-sm backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase text-[#756565]">Official Student Profile</span>
                  <h2 className="text-2xl font-extrabold text-[#2B2020] tracking-tight">{studentSummary.student_name}</h2>
                  <p className="text-xs font-mono text-[#6B1E2B] font-bold mt-1">
                    Reg No: {studentSummary.register_number} | {studentSummary.course_name} – {studentSummary.semester_name} ({studentSummary.section_name})
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FFF8EC] border border-[#6B1E2B]/15 text-center shrink-0">
                  <div className="text-[11px] font-mono uppercase text-[#756565] font-bold">Overall Attendance</div>
                  <div className={`text-3xl font-extrabold font-mono mt-1 ${
                    studentSummary.overall_percentage >= studentSummary.threshold ? 'text-[#5F8F68]' : 'text-[#B94A55]'
                  }`}>
                    {studentSummary.overall_percentage}%
                  </div>
                  <div className="text-[10px] font-mono text-[#9A8989]">Threshold: {studentSummary.threshold}%</div>
                </div>
              </div>

              {/* Threshold Warning Banner */}
              {studentSummary.is_below_threshold && (
                <div className="p-4 rounded-2xl bg-[#B94A55]/15 border border-[#B94A55]/30 text-[#B94A55] font-mono text-xs font-bold flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#B94A55] shrink-0" />
                  <span>
                    ATTENDANCE WARNING: Your overall attendance ({studentSummary.overall_percentage}%) is currently below the required {studentSummary.threshold}% threshold. Please contact your course coordinator.
                  </span>
                </div>
              )}

              {/* Subject-Wise Breakdown Cards */}
              <div className="p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md space-y-4">
                <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#6B1E2B]" />
                  <span>Subject-Wise Attendance Breakdown</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studentSummary.subject_breakdown.map((sub, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/12 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-[#6B1E2B] bg-[#6B1E2B]/10 px-2 py-0.5 rounded-md">
                          {sub.subject_code}
                        </span>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                          sub.status === 'GOOD' ? 'bg-[#5F8F68]/15 text-[#5F8F68]' : 'bg-[#B94A55]/15 text-[#B94A55]'
                        }`}>
                          {sub.percentage}%
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#2B2020] truncate">{sub.subject_name}</h4>
                      <div className="text-[11px] font-mono text-[#756565] flex items-center justify-between border-t border-[#6B1E2B]/10 pt-2">
                        <span>Present / Total:</span>
                        <strong className="text-[#2B2020]">{sub.present_classes} / {sub.total_classes}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Attendance History Table */}
              <div className="p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md space-y-4">
                <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#6B1E2B]" />
                  <span>Personal Attendance Audit History</span>
                </h3>

                <div className="divide-y divide-[#6B1E2B]/10">
                  {studentSummary.history.map((h, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#2B2020]">{h.subject_name} ({h.session_name})</h4>
                        <p className="text-[11px] font-mono text-[#756565]">{h.date} {h.notes ? `| Note: ${h.notes}` : ''}</p>
                      </div>
                      <span className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border ${
                        h.status === 'PRESENT'
                          ? 'bg-[#5F8F68]/15 text-[#5F8F68] border-[#5F8F68]/30'
                          : 'bg-[#B94A55]/15 text-[#B94A55] border-[#B94A55]/30'
                      }`}>
                        {h.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center font-mono text-[#756565]">
              Loading student attendance records...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
