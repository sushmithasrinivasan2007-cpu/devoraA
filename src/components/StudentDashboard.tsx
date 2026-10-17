import React from 'react';
import {
  Users,
  CalendarCheck,
  Calendar,
  CalendarDays,
  Sun,
  Sunset,
  Moon,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Bell,
  Award,
  BarChart3,
  TrendingUp,
  XCircle,
  GraduationCap,
  AlertTriangle,
  Mail,
  Phone
} from 'lucide-react';
import { Student, Announcement, AIDailyBrief } from '../types';

interface StudentDashboardProps {
  brief: AIDailyBrief;
  loggedInName?: string;
  students: Student[];
  announcements: Announcement[];
  onNavigateTab?: (tab: string) => void;
}

function getGreeting(): { text: string; icon: React.ElementType; color: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'Good Morning', icon: Sun, color: '#C58A35' };
  if (hour >= 12 && hour < 17) return { text: 'Good Afternoon', icon: Sunset, color: '#B94A55' };
  return { text: 'Good Evening', icon: Moon, color: '#6B1E2B' };
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  brief,
  loggedInName,
  students,
  announcements,
  onNavigateTab
}) => {
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;
  const displayName = loggedInName || 'Student';

  // Find the particular logged-in student's profile ONLY
  const myProfile = students.find(
    s => s.name === loggedInName || s.email === loggedInName || s.roll_number === loggedInName
  ) || students[0];

  const studentAnnouncements = announcements.filter(
    a => a.target_audience === 'ALL' || a.target_audience === 'STUDENTS'
  );
  const urgentNotices = studentAnnouncements.filter(a => a.priority === 'URGENT');

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* ============================================================== */}
      {/* PARENT ABSENCE NOTIFICATION BANNER                             */}
      {/* ============================================================== */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#B94A55]/10 border-2 border-[#B94A55]/30 flex flex-col sm:flex-row sm:items-start gap-4 shadow-sm animate-in fade-in duration-200">
        <div className="w-10 h-10 rounded-2xl bg-[#B94A55] text-white flex items-center justify-center shrink-0 shadow-md">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#B94A55] bg-[#B94A55]/20 px-2.5 py-0.5 rounded-full border border-[#B94A55]/30">
              Parent Notice · Student Absence Recorded
            </span>
            <span className="text-[11px] font-mono text-[#756565]">
              Automated Campus Alert
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#2B2020]">
            Dear Parent / Guardian of {myProfile.name},
          </h3>
          <p className="text-xs text-[#4A3A3A] leading-relaxed font-sans">
            Your ward <strong className="text-[#2B2020]">{myProfile.name}</strong> (Roll No: <strong>{myProfile.roll_number}</strong> · Grade {myProfile.class_grade} Section {myProfile.section}) was recorded as <span className="text-[#B94A55] font-extrabold uppercase">ABSENT</span> on recent class sessions (3 days missed this term). Current cumulative attendance is <strong className="text-[#6B1E2B]">{myProfile.attendance_rate || '93.3'}%</strong>.
            Please submit a signed medical excuse note or contact the school administration if this absence was unexcused.
          </p>
          <div className="pt-2 border-t border-[#B94A55]/15 flex flex-wrap items-center gap-4 text-xs font-mono text-[#756565]">
            <span>Guardian: <strong className="text-[#2B2020]">{myProfile.guardian_name || 'Parent / Guardian'}</strong></span>
            <span>Registered Phone: <strong className="text-[#6B1E2B]">{myProfile.guardian_phone || '+1 555-098-1101'}</strong></span>
            {myProfile.guardian_email && (
              <span>Registered Email: <strong className="text-[#2B2020]">{myProfile.guardian_email}</strong></span>
            )}
          </div>
        </div>
      </div>

      {/* Greeting + Pillars Card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#FFF8EC]/95 via-[#F8EFE0]/85 to-[#FFF8EC]/95 border border-[#6B1E2B]/15 p-6 shadow-xl shadow-[#6B1E2B]/5 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-[#6B1E2B]/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-[#A85C68]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Greeting Banner */}
        <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#6B1E2B]/8 to-[#A85C68]/5 border border-[#6B1E2B]/15 backdrop-blur-md">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md"
            style={{ backgroundColor: `${greeting.color}18`, border: `1.5px solid ${greeting.color}30` }}
          >
            <GreetingIcon className="w-5 h-5" style={{ color: greeting.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#756565]">Student Portal</p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#2B2020] tracking-tight leading-tight">
              {greeting.text},{' '}
              <span style={{ color: greeting.color }}>{displayName}</span>! 👋
            </h2>
          </div>
          <div className="ml-auto shrink-0 hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#756565] bg-[#FFF8EC]/70 px-3 py-1.5 rounded-xl border border-[#6B1E2B]/12">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5F8F68] animate-pulse inline-block" />
            <span>Academic Session 2026-27</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6B1E2B] animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider text-[#6B1E2B] uppercase">
            DEVORA INTELLIGENCE // STUDENT PORTAL
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#2B2020] tracking-tight mb-1">
          Welcome Home — Your Academic Workspace
        </h2>
        <p className="text-sm text-[#756565] font-medium">
          Check your attendance calendar, subject marks &amp; test results, upcoming exams, and timetable notices.
        </p>

        {/* 4 Pillars: Attendance, Calendar & Events, Marks & Results, Timetable */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Pillar 1: My Attendance */}
          <div
            onClick={() => onNavigateTab?.('calendar')}
            className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 hover:border-[#6B1E2B]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group backdrop-blur-md space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-wider text-[#756565] uppercase">Attendance</span>
              <div className="p-1.5 rounded-lg bg-[#6B1E2B]/10 text-[#6B1E2B] group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#3D6B46]">
                93.3%
              </span>
              <span className="text-xs font-mono text-[#756565]">42 / 45 classes</span>
            </div>
            <div className="text-xs text-[#756565] border-t border-[#6B1E2B]/10 pt-2 flex items-center justify-between">
              <span className="font-semibold text-[#5F8F68]">Good Standing ✓</span>
              <span className="text-[10px] font-mono text-[#B94A55] font-bold">3 Absents</span>
            </div>
          </div>

          {/* Pillar 2: Academic Calendar */}
          <div
            onClick={() => onNavigateTab?.('calendar')}
            className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 hover:border-[#6B1E2B]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group backdrop-blur-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold tracking-wider text-[#756565] uppercase">Calendar &amp; Tests</span>
              <div className="p-1.5 rounded-lg bg-[#6B1E2B]/10 text-[#6B1E2B] group-hover:scale-110 transition-transform">
                <CalendarDays className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#2B2020] font-mono">3</span>
              <span className="text-xs text-[#756565] font-medium">Upcoming Tests</span>
            </div>
            <div className="mt-2 text-xs text-[#756565] border-t border-[#6B1E2B]/10 pt-2 flex items-center justify-between">
              <span className="text-[#6B1E2B] font-semibold">October 2026</span>
              <span className="text-[10px] font-mono text-[#C58A35] font-bold">2 Holidays</span>
            </div>
          </div>

          {/* Pillar 3: Marks & Results */}
          <div
            onClick={() => onNavigateTab?.('marks')}
            className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 hover:border-[#6B1E2B]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group backdrop-blur-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold tracking-wider text-[#756565] uppercase">Marks &amp; Results</span>
              <div className="p-1.5 rounded-lg bg-[#6B1E2B]/10 text-[#6B1E2B] group-hover:scale-110 transition-transform">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#2B2020] font-mono">89.3%</span>
              <span className="text-xs text-[#5F8F68] font-bold font-mono">Grade A+</span>
            </div>
            <div className="mt-2 text-xs text-[#756565] border-t border-[#6B1E2B]/10 pt-2 flex items-center justify-between">
              <span className="text-[#6B1E2B] font-semibold">Rank 3 · Section 3B1</span>
              <span className="text-[10px] font-mono text-[#756565]">View graph →</span>
            </div>
          </div>

          {/* Pillar 4: Class Notices */}
          <div
            onClick={() => onNavigateTab?.('timetable')}
            className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 hover:border-[#6B1E2B]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group backdrop-blur-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold tracking-wider text-[#756565] uppercase">Timetable &amp; Notices</span>
              <div className="p-1.5 rounded-lg bg-[#6B1E2B]/10 text-[#6B1E2B] group-hover:scale-110 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#2B2020] font-mono">{studentAnnouncements.length}</span>
              <span className="text-xs text-[#756565] font-medium">Notices</span>
            </div>
            <div className="mt-2 text-xs text-[#756565] border-t border-[#6B1E2B]/10 pt-2">
              {urgentNotices.length > 0 ? (
                <span className="text-[#B94A55] font-semibold block">{urgentNotices.length} Urgent Notice(s)</span>
              ) : (
                <span className="text-[#5F8F68] font-semibold block">All notices up to date</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Two Panels: Calendar Highlights & Academic Subject Marks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Upcoming Calendar Events & Tests */}
        <div className="p-5 rounded-3xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] hover:shadow-[0_8px_30px_-6px_rgba(107,30,43,0.12)] transition-all space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#6B1E2B]" />
              <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                Upcoming Tests &amp; Holidays
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab?.('calendar')}
              className="text-xs font-mono font-bold text-[#6B1E2B] hover:text-[#42121C] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Full Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              {
                title: 'Dussehra / Autumn Festival Holiday',
                date: 'Oct 20-21, 2026',
                type: 'HOLIDAY',
                tag: 'Campus Break'
              },
              {
                title: 'Python & AI Practical Lab Exam',
                date: 'Oct 24, 2026 · 01:30 PM',
                type: 'TEST',
                tag: 'Practical Assessment'
              },
              {
                title: 'Inter-College Sports Championship',
                date: 'Oct 27, 2026',
                type: 'EVENT',
                tag: 'Campus Event'
              },
              {
                title: 'Computer Networks Assessment',
                date: 'Oct 30, 2026 · 10:00 AM',
                type: 'TEST',
                tag: 'Written Test'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/10 hover:border-[#6B1E2B]/25 transition-all flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        item.type === 'TEST'
                          ? 'bg-[#6B1E2B] text-white'
                          : item.type === 'HOLIDAY'
                          ? 'bg-[#C58A35] text-white'
                          : 'bg-[#2E5E82] text-white'
                      }`}
                    >
                      {item.type}
                    </span>
                    <h4 className="text-xs font-bold text-[#2B2020] truncate">{item.title}</h4>
                  </div>
                  <div className="text-[11px] font-mono text-[#756565] pl-0.5">
                    {item.date} · {item.tag}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Recent Subject Scores & Marks Preview */}
        <div className="p-5 rounded-3xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] hover:shadow-[0_8px_30px_-6px_rgba(107,30,43,0.12)] transition-all space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#6B1E2B]" />
              <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                Subject Marks in Numbers
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab?.('marks')}
              className="text-xs font-mono font-bold text-[#6B1E2B] hover:text-[#42121C] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View Bar Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              { code: 'CS302', name: 'Python & Machine Learning', score: 96, max: 100, grade: 'O', status: 'Distinction' },
              { code: 'CS301', name: 'Data Structures & Algorithms', score: 92, max: 100, grade: 'A+', status: 'Distinction' },
              { code: 'CS304', name: 'Web Technologies & Frameworks', score: 90, max: 100, grade: 'A+', status: 'Distinction' },
              { code: 'MA301', name: 'Discrete Mathematics', score: 88, max: 100, grade: 'A+', status: 'Distinction' }
            ].map((sub, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/10 hover:border-[#6B1E2B]/25 transition-all flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#6B1E2B] bg-[#6B1E2B]/10 px-1.5 py-0.2 rounded">
                      {sub.code}
                    </span>
                    <h4 className="text-xs font-bold text-[#2B2020] truncate">{sub.name}</h4>
                  </div>
                  <div className="text-[11px] font-mono text-[#5F8F68] font-semibold pl-0.5">
                    {sub.grade} ({sub.status})
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-extrabold font-mono text-[#6B1E2B]">
                    {sub.score} <span className="text-[11px] text-[#756565]">/ {sub.max}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campus Announcements for Students */}
      {studentAnnouncements.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#6B1E2B]/6 to-[#A85C68]/4 border border-[#6B1E2B]/15 backdrop-blur-md shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#6B1E2B]" />
              <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">Campus Announcements</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab?.('timetable')}
              className="text-xs font-mono font-bold text-[#6B1E2B] hover:text-[#42121C] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {studentAnnouncements.slice(0, 3).map(a => (
              <div key={a.id} className="p-3.5 rounded-2xl bg-[#FFF8EC]/80 border border-[#6B1E2B]/12 space-y-1.5">
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase border ${
                  a.priority === 'URGENT'
                    ? 'bg-[#B94A55]/15 text-[#B94A55] border-[#B94A55]/30'
                    : 'bg-[#6B1E2B]/10 text-[#6B1E2B] border-[#6B1E2B]/20'
                }`}>
                  {a.priority}
                </span>
                <h4 className="text-xs font-bold text-[#2B2020] leading-snug">{a.title}</h4>
                <p className="text-[11px] text-[#756565] line-clamp-2 leading-relaxed">{a.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
