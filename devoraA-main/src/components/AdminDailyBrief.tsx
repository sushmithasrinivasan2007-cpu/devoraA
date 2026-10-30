import React, { useState } from 'react';
import { AIDailyBrief } from '../types';
import { api } from '../services/api';
import { 
  Users, 
  AlertTriangle, 
  Wrench, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Sun, 
  Sunset, 
  Moon, 
  KeyRound, 
  UserPlus, 
  Lock, 
  GraduationCap, 
  Briefcase, 
  Check, 
  ShieldCheck 
} from 'lucide-react';

interface AdminDailyBriefProps {
  brief: AIDailyBrief;
  onNavigateTab?: (tab: string) => void;
  id?: string;
  loggedInName?: string;
  currentRole?: string;
  studentsCount?: number;
  staffCount?: number;
  onOpenAddStudent?: () => void;
  onOpenAddStaff?: () => void;
  onRefresh?: () => void;
}

function getGreeting(): { text: string; icon: React.ElementType; color: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'Good Morning', icon: Sun, color: '#C58A35' };
  if (hour >= 12 && hour < 17) return { text: 'Good Afternoon', icon: Sunset, color: '#B94A55' };
  return { text: 'Good Evening', icon: Moon, color: '#6B1E2B' };
}

export const AdminDailyBrief: React.FC<AdminDailyBriefProps> = ({
  brief,
  onNavigateTab,
  id = "admin-daily-brief",
  loggedInName,
  currentRole,
  studentsCount,
  staffCount,
  onOpenAddStudent,
  onOpenAddStaff,
  onRefresh
}) => {
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;
  const displayName = loggedInName || (currentRole === 'STUDENT' ? 'Student' : 'Admin');
  const roleLabel = currentRole === 'STUDENT' ? 'Student' : currentRole === 'TEACHER' ? 'Staff' : 'Admin';

  // Password Management State
  const [targetUsername, setTargetUsername] = useState('');
  const [targetRole, setTargetRole] = useState<'TEACHER' | 'STUDENT' | 'ADMIN'>('TEACHER');
  const [targetName, setTargetName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUsername || !newPassword) {
      setPasswordErrorMsg('Please provide both username/email and the new password.');
      return;
    }
    setIsSavingPassword(true);
    setPasswordSuccessMsg('');
    setPasswordErrorMsg('');

    try {
      await api.saveUserPassword({
        username: targetUsername.trim(),
        password: newPassword,
        role: targetRole,
        name: targetName.trim() || undefined
      });
      setPasswordSuccessMsg(`Password successfully updated for ${targetUsername} (${targetRole} portal).`);
      setNewPassword('');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setPasswordErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div
      id={id}
      className="rounded-2xl bg-gradient-to-br from-[#FFF8EC]/95 via-[#F8EFE0]/85 to-[#FFF8EC]/95 border border-[#6B1E2B]/15 p-6 shadow-xl shadow-[#6B1E2B]/5 relative overflow-hidden backdrop-blur-xl space-y-6"
    >
      {/* Decorative ambient subtle glow in Soft Maroon */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-[#6B1E2B]/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-[#A85C68]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Personalized Greeting Banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#6B1E2B]/8 to-[#A85C68]/5 border border-[#6B1E2B]/15 backdrop-blur-md">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md"
          style={{ backgroundColor: `${greeting.color}18`, border: `1.5px solid ${greeting.color}30` }}
        >
          <GreetingIcon className="w-5 h-5" style={{ color: greeting.color }} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#756565]">
            {roleLabel} Portal
          </p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#2B2020] tracking-tight leading-tight">
            {greeting.text},{' '}
            <span style={{ color: greeting.color }}>{displayName}</span>! 👋
          </h2>
        </div>
        <div className="ml-auto shrink-0 hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#756565] bg-[#FFF8EC]/70 px-3 py-1.5 rounded-xl border border-[#6B1E2B]/12">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5F8F68] animate-pulse inline-block" />
          <span>Live Campus Feed</span>
        </div>
      </div>

      {/* Header Statement */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#6B1E2B]/12 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#2B2020] tracking-tight">
            Home
          </h2>
          <p className="text-xs text-[#756565] font-mono mt-0.5">
            Operational Overview &amp; Campus Administrative Management
          </p>
        </div>
      </div>

      {/* 4 Operations Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. ATTENDANCE */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('attendance')}
          className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 hover:border-[#6B1E2B]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold tracking-wider text-[#756565] uppercase">
              Attendance
            </span>
            <div className="p-1.5 rounded-lg bg-[#6B1E2B]/10 text-[#6B1E2B] group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2B2020] font-mono">
              {brief.overall_attendance}%
            </span>
            <span className="text-xs text-[#756565] font-medium">Overall</span>
          </div>
          <div className="mt-2 text-xs text-[#756565] border-t border-[#6B1E2B]/10 pt-2">
            <span className="text-[#C58A35] font-semibold block">
              {brief.absent_count} students absent today
            </span>
            <span className="text-[11px] text-[#9A8989] line-clamp-1 mt-0.5">
              {brief.classes_needing_attention[0] || 'All classes within threshold'}
            </span>
          </div>
        </div>

        {/* 2. REQUESTS */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('requests')}
          className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 hover:border-[#6B1E2B]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold tracking-wider text-[#756565] uppercase">
              Requests
            </span>
            <div className="p-1.5 rounded-lg bg-[#6B1E2B]/10 text-[#6B1E2B] group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2B2020] font-mono">
              {brief.pending_requests_count}
            </span>
            <span className="text-xs text-[#756565] font-medium">Pending</span>
          </div>
          <div className="mt-2 text-xs text-[#756565] border-t border-[#6B1E2B]/10 pt-2">
            <span className="text-[#B94A55] font-semibold block">
              {brief.urgent_requests_count} High Priority
            </span>
            <span className="text-[11px] text-[#9A8989] mt-0.5 block">
              Bonafide &amp; ID card queues active
            </span>
          </div>
        </div>

        {/* 3. CAMPUS MAINTENANCE */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('maintenance')}
          className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 hover:border-[#6B1E2B]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold tracking-wider text-[#756565] uppercase">
              Campus Facilities
            </span>
            <div className="p-1.5 rounded-lg bg-[#6B1E2B]/10 text-[#6B1E2B] group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2B2020] font-mono">
              {brief.open_maintenance_count}
            </span>
            <span className="text-xs text-[#756565] font-medium">Open Issues</span>
          </div>
          <div className="mt-2 text-xs text-[#756565] border-t border-[#6B1E2B]/10 pt-2">
            <span className="text-[#C58A35] font-semibold block">
              {brief.urgent_maintenance_count} Urgent Action Items
            </span>
            <span className="text-[11px] text-[#9A8989] mt-0.5 block">
              Science Lab 2 &amp; BCA Lab 1
            </span>
          </div>
        </div>

        {/* 4. TODAY'S AGENDA */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('timetable')}
          className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 hover:border-[#6B1E2B]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold tracking-wider text-[#756565] uppercase">
              Today Schedule
            </span>
            <div className="p-1.5 rounded-lg bg-[#6B1E2B]/10 text-[#6B1E2B] group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2B2020] font-mono">
              3
            </span>
            <span className="text-xs text-[#756565] font-medium">Key Events</span>
          </div>
          <div className="mt-2 text-xs text-[#756565] border-t border-[#6B1E2B]/10 pt-2">
            <span className="text-[#5F8F68] font-semibold block">
              1 Pending Leave Approval
            </span>
            <span className="text-[11px] text-[#9A8989] mt-0.5 block">
              03:45 PM Staff Faculty Sync
            </span>
          </div>
        </div>
      </div>

      {/* ADMIN EXCLUSIVE: Staff & Student Administration + Create / Change Password */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left Column: Add Staff and Student in Admin Portal */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#6B1E2B]/10 pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#6B1E2B]" />
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#2B2020]">
                Staff &amp; Student Administration
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#6B1E2B] font-bold bg-[#6B1E2B]/10 px-2 py-0.5 rounded-full">
              Admin Roster Control
            </span>
          </div>

          <p className="text-xs text-[#756565] leading-relaxed">
            Directly register and configure new academic faculty members or enrolled students into the campus database.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Student Card */}
            <div className="p-4 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/12 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#756565] uppercase">Students</span>
                <GraduationCap className="w-4 h-4 text-[#6B1E2B]" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-[#2B2020]">
                {studentsCount || brief.total_students}
              </div>
              <p className="text-[10px] text-[#756565] font-mono">BCA 1st - 6th Semesters</p>
              <button
                type="button"
                id="btn-admin-add-student"
                onClick={() => {
                  if (onOpenAddStudent) {
                    onOpenAddStudent();
                  } else if (onNavigateTab) {
                    onNavigateTab('directory');
                  }
                }}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-[#6B1E2B] hover:bg-[#42121C] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Student</span>
              </button>
            </div>

            {/* Staff Card */}
            <div className="p-4 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/12 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#756565] uppercase">Faculty &amp; Staff</span>
                <Briefcase className="w-4 h-4 text-[#6B1E2B]" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-[#2B2020]">
                {staffCount || 5}
              </div>
              <p className="text-[10px] text-[#756565] font-mono">Academics &amp; Operations</p>
              <button
                type="button"
                id="btn-admin-add-staff"
                onClick={() => {
                  if (onOpenAddStaff) {
                    onOpenAddStaff();
                  } else if (onNavigateTab) {
                    onNavigateTab('directory');
                  }
                }}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-[#6B1E2B] hover:bg-[#42121C] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Staff</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('directory')}
              className="text-xs font-mono font-semibold text-[#6B1E2B] hover:text-[#42121C] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>View and manage entire verified directory roster</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Create or Change Password */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#6B1E2B]/10 pb-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#6B1E2B]" />
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#2B2020]">
                Create or Change Password
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#3D6B46] font-bold bg-[#5F8F68]/15 px-2 py-0.5 rounded-full border border-[#5F8F68]/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Admin Security</span>
            </span>
          </div>

          <p className="text-xs text-[#756565] leading-relaxed">
            Set or update authentication passwords for any campus staff, faculty, student, or administrative profile.
          </p>

          <form onSubmit={handleSavePassword} className="space-y-3">
            {/* Target Portal Selection */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                Target User Role / Portal
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['TEACHER', 'STUDENT', 'ADMIN'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTargetRole(r)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                      targetRole === r
                        ? 'bg-[#6B1E2B] border-[#6B1E2B] text-white shadow-xs'
                        : 'bg-[#F3EBDD]/70 border-[#6B1E2B]/15 text-[#756565] hover:text-[#2B2020]'
                    }`}
                  >
                    {r === 'TEACHER' ? 'Staff' : r === 'STUDENT' ? 'Student' : 'Admin'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                  Email / Username *
                </label>
                <input
                  type="text"
                  required
                  value={targetUsername}
                  onChange={e => setTargetUsername(e.target.value)}
                  placeholder={targetRole === 'TEACHER' ? 'teacher@devora.edu' : targetRole === 'STUDENT' ? 'student@devora.edu' : 'admin@devora.edu'}
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] placeholder:text-[#9A8989] font-mono text-xs focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={targetName}
                  onChange={e => setTargetName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] placeholder:text-[#9A8989] font-mono text-xs focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-mono font-bold text-[#6B1E2B] uppercase tracking-wider">
                  New Password *
                </label>
                <button
                  type="button"
                  onClick={() => setNewPassword(`devora${Math.floor(100 + Math.random() * 900)}`)}
                  className="text-[10px] font-mono text-[#6B1E2B] hover:underline cursor-pointer"
                >
                  ⚡ Auto-generate
                </button>
              </div>
              <input
                type="text"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter or generate new password"
                className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] placeholder:text-[#9A8989] font-mono text-xs focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none"
              />
            </div>

            {passwordSuccessMsg && (
              <div className="p-2.5 rounded-xl bg-[#5F8F68]/15 border border-[#5F8F68]/30 text-xs font-mono text-[#2F5234] flex items-center gap-2">
                <Check className="w-4 h-4 text-[#5F8F68] shrink-0" />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}

            {passwordErrorMsg && (
              <div className="p-2.5 rounded-xl bg-[#B94A55]/15 border border-[#B94A55]/30 text-xs font-mono text-[#B94A55]">
                {passwordErrorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSavingPassword}
              id="btn-save-password"
              className="w-full py-2.5 rounded-xl bg-[#6B1E2B] hover:bg-[#42121C] text-white text-xs font-mono font-bold transition-all shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSavingPassword ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Save or Change Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
