import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Calendar,
  Download,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  FileSpreadsheet,
  ListFilter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { Student } from '../types';

interface StudentMarksModuleProps {
  student?: Student;
  loggedInName?: string;
}

interface SubjectScore {
  code: string;
  name: string;
  instructor: string;
  internalMarks: number; // out of 30
  examMarks: number;     // out of 70
  totalMarks: number;    // out of 100
  maxMarks: number;
  classAverage: number;
  grade: string;
  status: 'DISTINCTION' | 'FIRST_CLASS' | 'PASS';
}

interface TestResult {
  id: string;
  title: string;
  date: string;
  type: 'MIDTERM' | 'UNIT_TEST' | 'LAB_PRACTICAL';
  totalScored: number;
  maxTotal: number;
  percentage: number;
  grade: string;
  status: string;
  subjects: {
    name: string;
    score: number;
    max: number;
  }[];
}

export const StudentMarksModule: React.FC<StudentMarksModuleProps> = ({
  student,
  loggedInName = 'Aiden Sharma'
}) => {
  const [selectedView, setSelectedView] = useState<'ALL' | 'SUBJECTS' | 'TESTS'>('ALL');

  // Subject Marks in Numbers
  const subjectsData: SubjectScore[] = [
    {
      code: 'CS301',
      name: 'Data Structures & Algorithms',
      instructor: 'Dr. Rajesh Kumar',
      internalMarks: 28,
      examMarks: 64,
      totalMarks: 92,
      maxMarks: 100,
      classAverage: 76,
      grade: 'A+',
      status: 'DISTINCTION'
    },
    {
      code: 'CS302',
      name: 'Python & Machine Learning',
      instructor: 'Dr. Sarah Miller',
      internalMarks: 29,
      examMarks: 67,
      totalMarks: 96,
      maxMarks: 100,
      classAverage: 81,
      grade: 'O (Outstanding)',
      status: 'DISTINCTION'
    },
    {
      code: 'CS303',
      name: 'Database Management Systems',
      instructor: 'Prof. Marcus Chen',
      internalMarks: 26,
      examMarks: 60,
      totalMarks: 86,
      maxMarks: 100,
      classAverage: 74,
      grade: 'A',
      status: 'FIRST_CLASS'
    },
    {
      code: 'CS304',
      name: 'Web Technologies & Frameworks',
      instructor: 'Sarah Jenkins',
      internalMarks: 27,
      examMarks: 63,
      totalMarks: 90,
      maxMarks: 100,
      classAverage: 77,
      grade: 'A+',
      status: 'DISTINCTION'
    },
    {
      code: 'CS305',
      name: 'Computer Networks',
      instructor: 'Dr. Elena Rostova',
      internalMarks: 25,
      examMarks: 59,
      totalMarks: 84,
      maxMarks: 100,
      classAverage: 72,
      grade: 'A',
      status: 'FIRST_CLASS'
    },
    {
      code: 'MA301',
      name: 'Discrete Mathematics',
      instructor: 'Dr. Alistair Vance',
      internalMarks: 26,
      examMarks: 62,
      totalMarks: 88,
      maxMarks: 100,
      classAverage: 69,
      grade: 'A+',
      status: 'DISTINCTION'
    }
  ];

  // Data for the Bar Graph
  const chartData = subjectsData.map(s => ({
    name: s.name.length > 18 ? s.name.substring(0, 16) + '...' : s.name,
    fullName: s.name,
    studentMarks: s.totalMarks,
    classAverage: s.classAverage,
    passingMarks: 40
  }));

  // Periodic Test Results Data
  const testResults: TestResult[] = [
    {
      id: 'test-midterm',
      title: 'Midterm Examinations 2026',
      date: 'October 12, 2026',
      type: 'MIDTERM',
      totalScored: 536,
      maxTotal: 600,
      percentage: 89.3,
      grade: 'A+',
      status: 'Passed with Distinction · Rank 3',
      subjects: [
        { name: 'Data Structures & Algorithms', score: 92, max: 100 },
        { name: 'Python & Machine Learning', score: 96, max: 100 },
        { name: 'Database Management Systems', score: 86, max: 100 },
        { name: 'Web Technologies & Frameworks', score: 90, max: 100 },
        { name: 'Computer Networks', score: 84, max: 100 },
        { name: 'Discrete Mathematics', score: 88, max: 100 }
      ]
    },
    {
      id: 'test-unit-1',
      title: 'Continuous Assessment — Unit Test 1',
      date: 'September 18, 2026',
      type: 'UNIT_TEST',
      totalScored: 182,
      maxTotal: 200,
      percentage: 91.0,
      grade: 'A+',
      status: 'Cleared · Top 5% in Class',
      subjects: [
        { name: 'Data Structures (Units 1 & 2)', score: 46, max: 50 },
        { name: 'Database Systems (Relational Model)', score: 44, max: 50 },
        { name: 'Python Foundations & OOP', score: 48, max: 50 },
        { name: 'Computer Networks (OSI Architecture)', score: 44, max: 50 }
      ]
    },
    {
      id: 'test-unit-2',
      title: 'Continuous Assessment — Unit Test 2',
      date: 'October 08, 2026',
      type: 'UNIT_TEST',
      totalScored: 176,
      maxTotal: 200,
      percentage: 88.0,
      grade: 'A',
      status: 'Cleared · Above Class Average',
      subjects: [
        { name: 'Algorithms (Sorting & Graphs)', score: 45, max: 50 },
        { name: 'SQL & Normalization', score: 42, max: 50 },
        { name: 'Machine Learning Classification', score: 47, max: 50 },
        { name: 'Routing Protocols & IP', score: 42, max: 50 }
      ]
    },
    {
      id: 'test-lab',
      title: 'Practical Lab & Project Assessment',
      date: 'October 14, 2026',
      type: 'LAB_PRACTICAL',
      totalScored: 96,
      maxTotal: 100,
      percentage: 96.0,
      grade: 'O',
      status: 'Outstanding Performance in AI Lab',
      subjects: [
        { name: 'Python Agent Lab Practical', score: 48, max: 50 },
        { name: 'Database Schema Design & Query Demo', score: 48, max: 50 }
      ]
    }
  ];

  // Overall calculations
  const totalScored = subjectsData.reduce((acc, curr) => acc + curr.totalMarks, 0);
  const totalMax = subjectsData.reduce((acc, curr) => acc + curr.maxMarks, 0);
  const overallPercentage = ((totalScored / totalMax) * 100).toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & PERFORMANCE SUMMARY CARDS                       */}
      {/* ============================================================== */}
      <div className="rounded-3xl bg-gradient-to-br from-[#FFF8EC]/95 via-[#F8EFE0]/85 to-[#FFF8EC]/95 border border-[#6B1E2B]/15 p-6 shadow-xl shadow-[#6B1E2B]/5 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 bg-[#6B1E2B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B1E2B] animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider text-[#6B1E2B] uppercase">
                Student Academic Performance &amp; Evaluation
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B2020] tracking-tight">
              Marks &amp; Test Results
            </h1>
            <p className="text-xs sm:text-sm text-[#756565] mt-0.5">
              Student: <span className="font-bold text-[#2B2020]">{student?.name || loggedInName}</span> ({student?.roll_number || 'BCA-3B1-01'} · Semester 3)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-[#6B1E2B] hover:bg-[#42121C] text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print / Download Report</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Overall Percentage */}
          <div className="p-4 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 backdrop-blur-md shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider">
                Overall Aggregate
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#6B1E2B]/10 flex items-center justify-center text-[#6B1E2B]">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#6B1E2B]">{overallPercentage}%</span>
              <span className="text-xs font-mono text-[#5F8F68] font-semibold">Grade A+</span>
            </div>
            <p className="text-[11px] font-mono text-[#756565] border-t border-[#6B1E2B]/10 pt-1.5">
              Passed with Distinction
            </p>
          </div>

          {/* Total Marks in Number */}
          <div className="p-4 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 backdrop-blur-md shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#756565] uppercase tracking-wider">
                Total Marks Scored
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#6B1E2B]/10 flex items-center justify-center text-[#6B1E2B]">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#2B2020]">{totalScored}</span>
              <span className="text-xs font-mono text-[#756565]">/ {totalMax}</span>
            </div>
            <p className="text-[11px] font-mono text-[#756565] border-t border-[#6B1E2B]/10 pt-1.5">
              Across 6 Core Subjects
            </p>
          </div>

          {/* Highest Subject Score */}
          <div className="p-4 rounded-2xl bg-[#FFF8EC]/90 border border-[#5F8F68]/25 backdrop-blur-md shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#3D6B46] uppercase tracking-wider">
                Highest Subject Score
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#5F8F68]/15 flex items-center justify-center text-[#3D6B46]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#3D6B46]">96</span>
              <span className="text-xs font-mono text-[#3D6B46]">/ 100</span>
            </div>
            <p className="text-[11px] font-mono text-[#3D6B46] border-t border-[#5F8F68]/20 pt-1.5 truncate">
              Python &amp; Machine Learning
            </p>
          </div>

          {/* Class Standing */}
          <div className="p-4 rounded-2xl bg-[#FFF8EC]/90 border border-[#C58A35]/25 backdrop-blur-md shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#9E671E] uppercase tracking-wider">
                Class Standing
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#C58A35]/15 flex items-center justify-center text-[#9E671E]">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#9E671E]">Rank 3</span>
              <span className="text-xs font-mono text-[#756565]">Top 5%</span>
            </div>
            <p className="text-[11px] font-mono text-[#756565] border-t border-[#C58A35]/20 pt-1.5">
              Section 3B1 (60 Students)
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. BAR GRAPH: SUBJECT MARKS VS CLASS AVERAGE                    */}
      {/* ============================================================== */}
      <div className="p-6 rounded-3xl bg-[#FFF8EC]/90 backdrop-blur-md border border-white/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6B1E2B]/10 flex items-center justify-center text-[#6B1E2B]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2B2020] font-mono">
                Subject Marks Visual Analysis (Bar Graph)
              </h2>
              <p className="text-xs text-[#756565] font-mono">
                Comparative analysis of your score vs class average across all subjects
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#6B1E2B]" />
              <span className="font-bold text-[#6B1E2B]">Your Marks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#C58A35]" />
              <span className="text-[#756565]">Class Average</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-red-400" />
              <span className="text-[#756565]">Passing Line (40)</span>
            </div>
          </div>
        </div>

        {/* Recharts Bar Graph */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#6B1E2B" opacity={0.1} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#756565', fontSize: 11, fontFamily: 'monospace' }}
                interval={0}
                angle={-10}
                textAnchor="end"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#756565', fontSize: 11, fontFamily: 'monospace' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 bg-[#FFF8EC] border border-[#6B1E2B]/30 rounded-xl shadow-xl font-mono text-xs space-y-1">
                        <p className="font-bold text-[#2B2020] text-sm">{data.fullName}</p>
                        <p className="text-[#6B1E2B] font-extrabold">
                          Your Score: {data.studentMarks} / 100
                        </p>
                        <p className="text-[#C58A35]">
                          Class Average: {data.classAverage} / 100
                        </p>
                        <p className="text-[#3D6B46] text-[11px] font-semibold">
                          +{data.studentMarks - data.classAverage} marks above average
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={40} stroke="#B94A55" strokeDasharray="4 4" label={{ value: 'Passing (40)', fill: '#B94A55', fontSize: 10 }} />
              <Bar dataKey="studentMarks" fill="#6B1E2B" radius={[6, 6, 0, 0]} name="Your Score" />
              <Bar dataKey="classAverage" fill="#C58A35" radius={[6, 6, 0, 0]} name="Class Average" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. SUBJECT-WISE MARKS IN NUMBERS                               */}
      {/* ============================================================== */}
      <div className="p-6 rounded-3xl bg-[#FFF8EC]/90 backdrop-blur-md border border-white/60 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-[#6B1E2B]/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#6B1E2B]/10 flex items-center justify-center text-[#6B1E2B]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2B2020] font-mono">
                Subject-Wise Marks in Numbers
              </h3>
              <p className="text-xs text-[#756565] font-mono">
                Full breakdown with internal assessments and term exam scores
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#6B1E2B] bg-[#6B1E2B]/10 px-2.5 py-1 rounded-lg">
            Total 6 Subjects
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectsData.map(sub => (
            <div
              key={sub.code}
              className="p-4 rounded-2xl bg-[#FFF8EC] border border-[#6B1E2B]/15 hover:border-[#6B1E2B]/35 hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#6B1E2B] bg-[#6B1E2B]/10 px-2 py-0.5 rounded">
                    {sub.code}
                  </span>
                  <h4 className="text-sm font-bold text-[#2B2020] mt-1 line-clamp-1">{sub.name}</h4>
                  <p className="text-[11px] font-mono text-[#756565]">{sub.instructor}</p>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  sub.status === 'DISTINCTION'
                    ? 'bg-[#5F8F68]/15 text-[#3D6B46] border border-[#5F8F68]/30'
                    : 'bg-[#C58A35]/15 text-[#9E671E] border border-[#C58A35]/30'
                }`}>
                  {sub.grade}
                </span>
              </div>

              {/* Big Number Marks */}
              <div className="p-3 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/10 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#756565] uppercase block">Total Scored</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold font-mono text-[#6B1E2B]">{sub.totalMarks}</span>
                    <span className="text-xs font-mono text-[#756565]">/ {sub.maxMarks}</span>
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono text-[#756565] space-y-0.5">
                  <div>Internal: <strong className="text-[#2B2020]">{sub.internalMarks}</strong>/30</div>
                  <div>Final: <strong className="text-[#2B2020]">{sub.examMarks}</strong>/70</div>
                </div>
              </div>

              {/* Progress Bar & Class Average */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-[#756565]">
                  <span>Progress</span>
                  <span className="font-bold text-[#2B2020]">{sub.totalMarks}%</span>
                </div>
                <div className="w-full bg-[#E8DDCA] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#6B1E2B] h-1.5 rounded-full"
                    style={{ width: `${sub.totalMarks}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-[#756565] pt-0.5 flex justify-between">
                  <span>Class Avg: {sub.classAverage}</span>
                  <span className="text-[#3D6B46] font-semibold">
                    +{sub.totalMarks - sub.classAverage} above avg
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. RESULTS OF TESTS (CONTINUOUS & TERM ASSESSMENTS)            */}
      {/* ============================================================== */}
      <div className="p-6 rounded-3xl bg-[#FFF8EC]/90 backdrop-blur-md border border-white/60 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-[#6B1E2B]/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#6B1E2B]/10 flex items-center justify-center text-[#6B1E2B]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2B2020] font-mono">
                Results of Tests &amp; Continuous Assessments
              </h3>
              <p className="text-xs text-[#756565] font-mono">
                Scores and marks obtained in periodic examinations and unit tests
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#3D6B46] bg-[#5F8F68]/15 border border-[#5F8F68]/30 px-3 py-1 rounded-lg">
            100% Pass Rate
          </span>
        </div>

        <div className="space-y-4">
          {testResults.map(t => (
            <div
              key={t.id}
              className="p-5 rounded-2xl bg-[#FFF8EC] border border-[#6B1E2B]/15 hover:border-[#6B1E2B]/35 shadow-xs transition-all space-y-3"
            >
              {/* Test Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#6B1E2B]/10 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase bg-[#6B1E2B] text-white">
                      {t.type.replace('_', ' ')}
                    </span>
                    <h4 className="text-sm font-bold text-[#2B2020]">{t.title}</h4>
                  </div>
                  <p className="text-xs font-mono text-[#756565] mt-0.5">Conducted: {t.date}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#756565] uppercase block">Total Scored</span>
                    <span className="text-lg font-extrabold font-mono text-[#6B1E2B]">
                      {t.totalScored} <span className="text-xs text-[#756565]">/ {t.maxTotal}</span>
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-[#5F8F68]/15 border border-[#5F8F68]/30 text-center font-mono">
                    <span className="text-xs font-bold text-[#3D6B46] block">{t.percentage}%</span>
                    <span className="text-[10px] text-[#3D6B46] font-semibold">{t.grade}</span>
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#6B1E2B] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5F8F68]" />
                <span>{t.status}</span>
              </div>

              {/* Subject Breakdown in this Test */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                {t.subjects.map((s, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#F3EBDD]/50 border border-[#6B1E2B]/10 text-center space-y-0.5">
                    <span className="text-[10px] font-mono text-[#756565] line-clamp-1" title={s.name}>
                      {s.name}
                    </span>
                    <div className="text-xs font-bold font-mono text-[#2B2020]">
                      <span className="text-[#6B1E2B]">{s.score}</span> / {s.max}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
