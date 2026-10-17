import React, { useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  PartyPopper,
  AlertTriangle,
  Info,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Student } from '../types';

interface StudentCalendarModuleProps {
  student?: Student;
  loggedInName?: string;
}

interface CalendarEvent {
  date: string; // YYYY-MM-DD
  type: 'EVENT' | 'TEST' | 'HOLIDAY';
  title: string;
  description: string;
  time?: string;
  location?: string;
  subject?: string;
}

interface DayAttendance {
  date: string; // YYYY-MM-DD
  status: 'PRESENT' | 'ABSENT' | 'WEEKEND';
  classesCount?: number;
  absentReasons?: string;
}

export const StudentCalendarModule: React.FC<StudentCalendarModuleProps> = ({
  student,
  loggedInName = 'Aiden Sharma'
}) => {
  // Current month: October 2026
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 16)); // Oct 16, 2026
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-16');
  const [filterType, setFilterType] = useState<'ALL' | 'ATTENDANCE' | 'TESTS' | 'EVENTS' | 'HOLIDAYS'>('ALL');

  // Hardcoded calendar data aligned with October 2026 academic calendar
  const eventsList: CalendarEvent[] = [
    {
      date: '2026-10-02',
      type: 'HOLIDAY',
      title: 'Gandhi Jayanti',
      description: 'National public holiday in honor of Mahatma Gandhi.'
    },
    {
      date: '2026-10-05',
      type: 'EVENT',
      title: 'Devora AI Hackathon Kickoff',
      time: '10:00 AM - 04:00 PM',
      location: 'Turing Auditorium & Online',
      description: 'Annual campus hackathon on Autonomous Agent Development.'
    },
    {
      date: '2026-10-08',
      type: 'TEST',
      title: 'Data Structures Unit Test',
      subject: 'Data Structures & Algorithms',
      time: '09:30 AM - 11:30 AM',
      location: 'Hall B-204',
      description: 'Syllabus: Trees, Graphs, Hash Tables, and Dynamic Programming.'
    },
    {
      date: '2026-10-12',
      type: 'TEST',
      title: 'Database Systems Midterm',
      subject: 'Database Management Systems',
      time: '10:00 AM - 12:00 PM',
      location: 'Main Exam Hall',
      description: 'Syllabus: Relational Algebra, SQL Queries, Normalization, and ACID properties.'
    },
    {
      date: '2026-10-15',
      type: 'EVENT',
      title: 'Industry Guest Lecture on GenAI',
      time: '02:00 PM - 03:30 PM',
      location: 'Seminar Hall A',
      description: 'Keynote by DeepMind Research Scientist on modern agentic workflows.'
    },
    {
      date: '2026-10-20',
      type: 'HOLIDAY',
      title: 'Dussehra / Autumn Break',
      description: 'Campus closed for Autumn Festival.'
    },
    {
      date: '2026-10-21',
      type: 'HOLIDAY',
      title: 'Dussehra Holiday (Day 2)',
      description: 'Campus closed.'
    },
    {
      date: '2026-10-24',
      type: 'TEST',
      title: 'Python & AI Practical Lab Exam',
      subject: 'Applied Machine Learning',
      time: '01:30 PM - 04:30 PM',
      location: 'CS Lab 3',
      description: 'Hands-on practical implementation of NLP pipelines & scikit-learn models.'
    },
    {
      date: '2026-10-27',
      type: 'EVENT',
      title: 'Inter-College Sports Championship',
      time: '09:00 AM - 05:00 PM',
      location: 'University Sports Complex',
      description: 'Annual athletics, football, and badminton tournaments.'
    },
    {
      date: '2026-10-30',
      type: 'TEST',
      title: 'Computer Networks Assessment',
      subject: 'Computer Networks',
      time: '10:00 AM - 11:30 AM',
      location: 'Hall C-102',
      description: 'TCP/IP, Routing Protocols, OSI Model, and Socket Programming.'
    }
  ];

  // Specific attendance day status mapping for October 2026
  // Absents on Oct 6, Oct 14, Oct 23
  const attendanceMap: Record<string, DayAttendance> = {
    '2026-10-01': { date: '2026-10-01', status: 'PRESENT', classesCount: 4 },
    '2026-10-02': { date: '2026-10-02', status: 'WEEKEND', classesCount: 0 }, // Holiday
    '2026-10-05': { date: '2026-10-05', status: 'PRESENT', classesCount: 5 },
    '2026-10-06': { date: '2026-10-06', status: 'ABSENT', classesCount: 4, absentReasons: 'Medical Leave - Fever' },
    '2026-10-07': { date: '2026-10-07', status: 'PRESENT', classesCount: 4 },
    '2026-10-08': { date: '2026-10-08', status: 'PRESENT', classesCount: 5 },
    '2026-10-09': { date: '2026-10-09', status: 'PRESENT', classesCount: 4 },
    '2026-10-12': { date: '2026-10-12', status: 'PRESENT', classesCount: 5 },
    '2026-10-13': { date: '2026-10-13', status: 'PRESENT', classesCount: 4 },
    '2026-10-14': { date: '2026-10-14', status: 'ABSENT', classesCount: 4, absentReasons: 'Unexcused Absence' },
    '2026-10-15': { date: '2026-10-15', status: 'PRESENT', classesCount: 5 },
    '2026-10-16': { date: '2026-10-16', status: 'PRESENT', classesCount: 4 },
    '2026-10-19': { date: '2026-10-19', status: 'PRESENT', classesCount: 4 },
    '2026-10-20': { date: '2026-10-20', status: 'WEEKEND', classesCount: 0 }, // Holiday
    '2026-10-21': { date: '2026-10-21', status: 'WEEKEND', classesCount: 0 }, // Holiday
    '2026-10-22': { date: '2026-10-22', status: 'PRESENT', classesCount: 5 },
    '2026-10-23': { date: '2026-10-23', status: 'ABSENT', classesCount: 4, absentReasons: 'Personal Travel' },
    '2026-10-26': { date: '2026-10-26', status: 'PRESENT', classesCount: 4 },
    '2026-10-27': { date: '2026-10-27', status: 'PRESENT', classesCount: 4 },
    '2026-10-28': { date: '2026-10-28', status: 'PRESENT', classesCount: 5 },
    '2026-10-29': { date: '2026-10-29', status: 'PRESENT', classesCount: 4 },
    '2026-10-30': { date: '2026-10-30', status: 'PRESENT', classesCount: 4 }
  };

  // Top Attendance Metrics Calculations
  // Total classes conducted till date: 45
  // Total present: 42
  // Number of absents: 3
  // Total percentage: (42 / 45) * 100 = 93.3%
  const totalClasses = 45;
  const totalAbsents = 3;
  const totalPresent = totalClasses - totalAbsents; // 42
  const attendancePercentage = ((totalPresent / totalClasses) * 100).toFixed(1); // 93.3%

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Convert so Monday is 0, Sunday is 6
  const startingDayIndex = (firstDayOfWeek + 6) % 7;

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(2026, 9, 16));
    setSelectedDate('2026-10-16');
  };

  // Get selected day details
  const selectedEvents = eventsList.filter(e => e.date === selectedDate);
  const selectedAttendance = attendanceMap[selectedDate];

  const formatDateStr = (dayNum: number): string => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(dayNum).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* ============================================================== */}
      {/* 1. TOP STATS BAR: TOTAL PRESENT, CLASSES, ABSENTS & PERCENTAGE  */}
      {/* ============================================================== */}
      <div className="rounded-3xl bg-gradient-to-br from-[#FFF8EC]/95 via-[#F8EFE0]/85 to-[#FFF8EC]/95 border border-[#6B1E2B]/15 p-6 shadow-xl shadow-[#6B1E2B]/5 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 bg-[#6B1E2B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B1E2B] animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider text-[#6B1E2B] uppercase">
                Student Academic Calendar &amp; Attendance
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B2020] tracking-tight">
              Attendance &amp; Schedule Overview
            </h1>
            <p className="text-xs sm:text-sm text-[#756565] mt-0.5">
              Profile: <span className="font-bold text-[#2B2020]">{student?.name || loggedInName}</span> ({student?.roll_number || 'BCA-3B1-01'} · Grade {student?.class_grade || '3'} {student?.section || 'Section 3B1'})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToToday}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#FFF8EC] hover:bg-white text-[#6B1E2B] border border-[#6B1E2B]/20 shadow-xs cursor-pointer transition-all"
            >
              Today (Oct 16)
            </button>
          </div>
        </div>

        {/* 4 KPI METRICS AT TOP OF CALENDAR */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Classes */}
          <div className="p-4 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 backdrop-blur-md shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#756565] uppercase tracking-wider">
                Total Classes
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#6B1E2B]/10 flex items-center justify-center text-[#6B1E2B]">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#2B2020]">{totalClasses}</span>
              <span className="text-xs font-mono text-[#756565]">Conducted</span>
            </div>
            <p className="text-[11px] font-mono text-[#756565] border-t border-[#6B1E2B]/10 pt-1.5">
              Semester Academic Sessions
            </p>
          </div>

          {/* Total Present */}
          <div className="p-4 rounded-2xl bg-[#FFF8EC]/90 border border-[#5F8F68]/25 backdrop-blur-md shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#3D6B46] uppercase tracking-wider">
                Total Present
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#5F8F68]/15 flex items-center justify-center text-[#3D6B46]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#3D6B46]">{totalPresent}</span>
              <span className="text-xs font-mono text-[#5F8F68]">Classes Attended</span>
            </div>
            <p className="text-[11px] font-mono text-[#3D6B46] border-t border-[#5F8F68]/20 pt-1.5 font-semibold">
              ✓ Good Attendance Record
            </p>
          </div>

          {/* Number of Absents */}
          <div className="p-4 rounded-2xl bg-[#FFF8EC]/90 border border-[#B94A55]/25 backdrop-blur-md shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#B94A55] uppercase tracking-wider">
                Number of Absents
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#B94A55]/15 flex items-center justify-center text-[#B94A55]">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#B94A55]">{totalAbsents}</span>
              <span className="text-xs font-mono text-[#B94A55]">Days Missed</span>
            </div>
            <p className="text-[11px] font-mono text-[#756565] border-t border-[#B94A55]/20 pt-1.5">
              Within permissible leaves (&lt;6)
            </p>
          </div>

          {/* Total Percentage */}
          <div className="p-4 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 backdrop-blur-md shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider">
                Total Percentage
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#6B1E2B]/10 flex items-center justify-center text-[#6B1E2B]">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#6B1E2B]">
                {attendancePercentage}%
              </span>
              <span className="text-xs font-mono font-bold text-[#3D6B46]">Target &gt;75%</span>
            </div>
            <div className="w-full bg-[#E8DDCA] rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-[#5F8F68] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(Number(attendancePercentage), 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CALENDAR INTERACTION + AGENDA DETAILS                        */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Full Month Calendar (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-lg space-y-5">
          {/* Calendar Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#6B1E2B]/10 flex items-center justify-center text-[#6B1E2B]">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-[#2B2020] font-mono">
                {monthNames[month]} {year}
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'ATTENDANCE', label: 'Attendance' },
                { id: 'TESTS', label: 'Tests' },
                { id: 'EVENTS', label: 'Events' },
                { id: 'HOLIDAYS', label: 'Holidays' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    filterType === f.id
                      ? 'bg-[#6B1E2B] text-white shadow-xs'
                      : 'bg-[#F3EBDD]/70 text-[#756565] hover:bg-[#F3EBDD] hover:text-[#2B2020]'
                  }`}
                >
                  {f.label}
                </button>
              ))}

              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg bg-[#F3EBDD] hover:bg-[#E8DDCA] text-[#2B2020] transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg bg-[#F3EBDD] hover:bg-[#E8DDCA] text-[#2B2020] transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs font-bold text-[#756565] uppercase pb-2 border-b border-[#6B1E2B]/10">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span className="text-[#9A8989]">Sat</span>
            <span className="text-[#9A8989]">Sun</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots for starting offset */}
            {Array.from({ length: startingDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[85px] rounded-xl bg-black/2 p-2" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = formatDateStr(dayNum);
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === '2026-10-16';

              // Day data
              const att = attendanceMap[dateStr];
              const dayEvents = eventsList.filter(e => e.date === dateStr);
              const hasTest = dayEvents.some(e => e.type === 'TEST');
              const hasHoliday = dayEvents.some(e => e.type === 'HOLIDAY');
              const hasCampusEvent = dayEvents.some(e => e.type === 'EVENT');

              const isAbsent = att?.status === 'ABSENT';
              const isPresent = att?.status === 'PRESENT';

              // Filtering logic
              if (filterType === 'TESTS' && !hasTest) {
                // Dim non-matching
              }

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-[88px] rounded-2xl p-2 transition-all cursor-pointer flex flex-col justify-between border relative group ${
                    isSelected
                      ? 'bg-[#6B1E2B]/10 border-[#6B1E2B] shadow-md ring-2 ring-[#6B1E2B]/20'
                      : 'bg-[#FFF8EC]/90 border-[#6B1E2B]/10 hover:border-[#6B1E2B]/30 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold rounded-lg w-6 h-6 flex items-center justify-center ${
                        isToday
                          ? 'bg-[#6B1E2B] text-white shadow-xs'
                          : isSelected
                          ? 'text-[#6B1E2B] font-extrabold'
                          : 'text-[#2B2020]'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Attendance Pill */}
                    {isPresent && (
                      <span className="w-2 h-2 rounded-full bg-[#3D6B46]" title="Present" />
                    )}
                    {isAbsent && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-extrabold bg-[#B94A55] text-white uppercase" title="Absent">
                        Absent
                      </span>
                    )}
                  </div>

                  {/* Day Event Tags */}
                  <div className="space-y-1 mt-1">
                    {hasHoliday && (
                      <div className="text-[9px] font-mono font-bold bg-[#C58A35]/15 text-[#9E671E] border border-[#C58A35]/30 rounded px-1.5 py-0.5 truncate">
                        Holiday
                      </div>
                    )}
                    {hasTest && (
                      <div className="text-[9px] font-mono font-bold bg-[#6B1E2B]/15 text-[#6B1E2B] border border-[#6B1E2B]/25 rounded px-1.5 py-0.5 truncate">
                        Exam/Test
                      </div>
                    )}
                    {hasCampusEvent && (
                      <div className="text-[9px] font-mono font-bold bg-[#2E5E82]/15 text-[#2E5E82] border border-[#2E5E82]/25 rounded px-1.5 py-0.5 truncate">
                        Event
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[#6B1E2B]/10 text-xs font-mono text-[#756565]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3D6B46]" />
              <span>Present</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B94A55]" />
              <span>Absent ({totalAbsents} recorded)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B1E2B]" />
              <span>Upcoming Test / Exam</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C58A35]" />
              <span>Holiday / Campus Break</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E5E82]" />
              <span>Campus Event</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Selected Day Agenda & Highlights (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Selected Date Card */}
          <div className="p-5 rounded-3xl bg-[#FFF8EC]/90 backdrop-blur-md border border-white/60 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#6B1E2B]/10 pb-3">
              <div>
                <span className="text-[11px] font-mono text-[#756565] uppercase tracking-wider block">Selected Date</span>
                <h3 className="text-base font-bold text-[#2B2020] font-mono">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
              </div>
              <div className="p-2 rounded-xl bg-[#6B1E2B]/10 text-[#6B1E2B]">
                <CalendarIcon className="w-5 h-5" />
              </div>
            </div>

            {/* Attendance Status for selected date */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-[#756565] uppercase">Attendance Record</span>
              {selectedAttendance ? (
                selectedAttendance.status === 'PRESENT' ? (
                  <div className="p-3.5 rounded-xl bg-[#5F8F68]/15 border border-[#5F8F68]/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#3D6B46]" />
                      <span className="text-xs font-mono font-bold text-[#3D6B46]">Present</span>
                    </div>
                    <span className="text-xs font-mono text-[#3D6B46]">
                      {selectedAttendance.classesCount} Classes Attended
                    </span>
                  </div>
                ) : selectedAttendance.status === 'ABSENT' ? (
                  <div className="p-3.5 rounded-xl bg-[#B94A55]/15 border-2 border-[#B94A55]/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-[#B94A55]" />
                        <span className="text-xs font-mono font-extrabold text-[#B94A55]">Marked Absent</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-[#B94A55] text-white px-2 py-0.5 rounded uppercase">
                        Parent Notice
                      </span>
                    </div>
                    <p className="text-xs font-mono font-bold text-[#2B2020] pt-0.5">
                      Dear Parent, your ward {student?.name || loggedInName} was marked ABSENT on this day.
                    </p>
                    <p className="text-[11px] font-mono text-[#756565]">
                      {selectedAttendance.classesCount} class session(s) missed. {selectedAttendance.absentReasons ? `Reason: ${selectedAttendance.absentReasons}` : 'Unexcused absence recorded in attendance register.'}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#F3EBDD] text-xs font-mono text-[#756565]">
                    No regular classes scheduled on this date.
                  </div>
                )
              ) : (
                <div className="p-3 rounded-xl bg-[#F3EBDD] text-xs font-mono text-[#756565]">
                  Class attendance record pending or weekend.
                </div>
              )}
            </div>

            {/* Events / Tests on this date */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-[#756565] uppercase">Scheduled Items</span>
              {selectedEvents.length === 0 ? (
                <p className="text-xs font-mono text-[#9A8989] italic">
                  No tests or official holidays on this day.
                </p>
              ) : (
                selectedEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border space-y-1 ${
                      evt.type === 'TEST'
                        ? 'bg-[#6B1E2B]/8 border-[#6B1E2B]/25'
                        : evt.type === 'HOLIDAY'
                        ? 'bg-[#C58A35]/10 border-[#C58A35]/25'
                        : 'bg-[#2E5E82]/10 border-[#2E5E82]/25'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          evt.type === 'TEST'
                            ? 'bg-[#6B1E2B] text-white'
                            : evt.type === 'HOLIDAY'
                            ? 'bg-[#C58A35] text-white'
                            : 'bg-[#2E5E82] text-white'
                        }`}
                      >
                        {evt.type}
                      </span>
                      {evt.time && (
                        <span className="text-[11px] font-mono text-[#756565]">{evt.time}</span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-[#2B2020] mt-1">{evt.title}</h4>
                    {evt.subject && (
                      <p className="text-[11px] font-mono text-[#6B1E2B] font-semibold">{evt.subject}</p>
                    )}
                    <p className="text-[11px] text-[#756565] leading-relaxed">{evt.description}</p>
                    {evt.location && (
                      <p className="text-[10px] font-mono text-[#756565]">📍 {evt.location}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Schedule Highlights: Upcoming Tests */}
          <div className="p-5 rounded-3xl bg-[#FFF8EC]/90 backdrop-blur-md border border-white/60 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#6B1E2B]" />
                <h3 className="text-xs font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                  Upcoming Tests &amp; Exams
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#6B1E2B] font-bold">This Month</span>
            </div>

            <div className="space-y-2.5">
              {eventsList.filter(e => e.type === 'TEST').slice(0, 3).map((test, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#F3EBDD]/70 border border-[#6B1E2B]/10 hover:border-[#6B1E2B]/30 transition-all space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2B2020]">{test.title}</span>
                    <span className="text-[10px] font-mono font-bold text-[#6B1E2B] bg-[#6B1E2B]/10 px-2 py-0.5 rounded">
                      {test.date}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#756565] flex items-center justify-between">
                    <span>{test.subject}</span>
                    <span>{test.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
