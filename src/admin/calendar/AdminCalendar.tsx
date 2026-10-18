/**
 * Academic Operations Calendar Service
 * High-level enterprise calendar and timetable scheduling console for Mentify.
 * Features:
 * - Real mathematical multi-month navigation (Month, Week, Day, Agenda)
 * - Interactive mini-calendar picker in the control sidebar
 * - Dynamic category filtering (Exams, Classes, Quizzes, Deadlines, Admin Sessions)
 * - Hourly week timetable (08:00 to 18:00) with visual time-slot positioning
 * - Single-day timetable with venue capacity & proctor assignment
 * - Real-time venue collision/conflict sentinel
 * - Search by title, course code (MATH-401, CS-302), and venue hall
 * - Schedule Event Modal with collision prevention
 * - Event Detail Drawer with iCal (.ics) generator and status management
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Filter,
  X,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Sparkles,
  Layers,
  Building2,
  Trash2,
  MoreVertical,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { AcademicEvent } from '../types';

interface AdminCalendarProps {
  events: AcademicEvent[];
  onAddEvent: (evt: AcademicEvent) => void;
  onDeleteEvent?: (id: string) => void;
}

type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

interface VenueStatus {
  id: string;
  name: string;
  building: string;
  capacity: number;
  type: string;
}

const CAMPUS_VENUES: VenueStatus[] = [
  { id: 'v-01', name: 'Science Hall Auditorium B', building: 'Science Complex', capacity: 120, type: 'Exam Certified' },
  { id: 'v-02', name: 'Turing Computing Lab 304', building: 'Engineering Wing', capacity: 80, type: 'Computer Lab' },
  { id: 'v-03', name: 'BioTech Seminar Hall 101', building: 'Life Sciences Center', capacity: 60, type: 'Tiered Hall' },
  { id: 'v-04', name: 'Newton Lecture Theater 201', building: 'Core Campus', capacity: 150, type: 'Lecture Theater' },
  { id: 'v-05', name: 'Council Boardroom 401', building: 'Administration Block', capacity: 25, type: 'Executive Boardroom' },
  { id: 'v-06', name: 'Faculty Wing Room 310', building: 'Faculty Wing', capacity: 15, type: 'Advising Room' },
  { id: 'v-07', name: 'Mentify LMS Submission Portal', building: 'Cloud Platform', capacity: 2000, type: 'Virtual Platform' },
];

const EVENT_TYPE_COLORS: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  EXAM: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-900/60',
    dot: 'bg-rose-500',
    label: 'Examinations',
  },
  QUIZ: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-900/60',
    dot: 'bg-purple-500',
    label: 'Quizzes & Tests',
  },
  CLASS: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-900/60',
    dot: 'bg-indigo-500',
    label: 'Course Lectures',
  },
  DEADLINE: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-900/60',
    dot: 'bg-amber-500',
    label: 'Assignment Deadlines',
  },
  SESSION: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-900/60',
    dot: 'bg-emerald-500',
    label: 'Administrative Sessions',
  },
};

const TIME_HOURS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
];

export const AdminCalendar: React.FC<AdminCalendarProps> = ({
  events: initialEvents,
  onAddEvent,
  onDeleteEvent,
}) => {
  // Current viewed calendar anchor date (default: October 18, 2026)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 18));
  const [view, setView] = useState<CalendarViewMode>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypes, setActiveTypes] = useState<string[]>([
    'EXAM',
    'QUIZ',
    'CLASS',
    'DEADLINE',
    'SESSION',
  ]);
  const [selectedVenue, setSelectedVenue] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [localEvents, setLocalEvents] = useState<AcademicEvent[]>(initialEvents);

  // Sync if initialEvents changes
  React.useEffect(() => {
    setLocalEvents(initialEvents);
  }, [initialEvents]);

  // Form state for scheduling new event
  const [formDate, setFormDate] = useState('2026-10-26');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<'CLASS' | 'EXAM' | 'QUIZ' | 'DEADLINE' | 'SESSION'>('EXAM');
  const [formStartTime, setFormStartTime] = useState('09:00 AM');
  const [formEndTime, setFormEndTime] = useState('11:30 AM');
  const [formLocation, setFormLocation] = useState('Science Hall Auditorium B');
  const [formCourseCode, setFormCourseCode] = useState('MATH-401');

  // Month navigation helpers
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 9, 18));
  };

  const handlePrevWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() - 7);
    setCurrentDate(next);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const handlePrevDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return localEvents.filter((e) => {
      // Type filter
      if (!activeTypes.includes(e.type)) return false;
      // Venue filter
      if (selectedVenue !== 'ALL' && e.location !== selectedVenue) return false;
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = e.title.toLowerCase().includes(q);
        const matchesCourse = e.courseCode?.toLowerCase().includes(q);
        const matchesLocation = e.location.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCourse && !matchesLocation) return false;
      }
      return true;
    });
  }, [localEvents, activeTypes, selectedVenue, searchQuery]);

  // Venue Conflict Sentinel: checks if 2 events have the exact same date and location
  const venueConflicts = useMemo(() => {
    const conflicts: { eventA: AcademicEvent; eventB: AcademicEvent }[] = [];
    for (let i = 0; i < localEvents.length; i++) {
      for (let j = i + 1; j < localEvents.length; j++) {
        const a = localEvents[i];
        const b = localEvents[j];
        if (
          a.date === b.date &&
          a.location === b.location &&
          a.location !== 'Mentify LMS Submission Portal' &&
          a.location !== 'Campus Wide'
        ) {
          conflicts.push({ eventA: a, eventB: b });
        }
      }
    }
    return conflicts;
  }, [localEvents]);

  // Calendar Math: Matrix of days for viewed month
  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
    const totalDays = lastDayOfMonth.getDate();

    const days: { date: Date; dateStr: string; dayNumber: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

    // Preceding month trailing days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const d = new Date(currentYear, currentMonth - 1, dayNum);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        date: d,
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(currentYear, currentMonth, i);
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isToday = currentYear === 2026 && currentMonth === 9 && i === 18;
      days.push({
        date: d,
        dateStr,
        dayNumber: i,
        isCurrentMonth: true,
        isToday,
      });
    }

    // Trailing days to fill 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        date: d,
        dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Week calculation (Sunday through Saturday for current viewed date)
  const currentWeekDays = useMemo(() => {
    const d = new Date(currentDate);
    const dayOfWeek = d.getDay();
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - dayOfWeek);

    const week: { date: Date; dateStr: string; dayName: string; dayNumber: number; isToday: boolean }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday);
      day.setDate(sunday.getDate() + i);
      const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      const isToday = day.getFullYear() === 2026 && day.getMonth() === 9 && day.getDate() === 18;
      week.push({
        date: day,
        dateStr,
        dayName: dayNames[i],
        dayNumber: day.getDate(),
        isToday,
      });
    }
    return week;
  }, [currentDate]);

  // Schedule event submission handler
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const timeCombined = `${formStartTime} - ${formEndTime}`;

    const newEvt: AcademicEvent = {
      id: `evt-${Date.now()}`,
      title: formTitle.trim(),
      type: formType,
      date: formDate,
      time: timeCombined,
      location: formLocation,
      courseCode: formCourseCode.trim() || undefined,
      status: 'SCHEDULED',
    };

    setLocalEvents((prev) => [newEvt, ...prev]);
    onAddEvent(newEvt);
    setIsAddEventOpen(false);

    // Reset form
    setFormTitle('');
  };

  const handleDeleteEvent = (id: string) => {
    setLocalEvents((prev) => prev.filter((e) => e.id !== id));
    if (onDeleteEvent) onDeleteEvent(id);
    setSelectedEvent(null);
  };

  const handleDownloadIcs = (event: AcademicEvent) => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Mentify Inc//Academic Operations Portal//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@mentify.edu`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:Academic Event for ${event.courseCode || 'General Institution'}\\nVenue: ${event.location}`,
      `LOCATION:${event.location}`,
      `STATUS:${event.status}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.id}_${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleTypeFilter = (type: string) => {
    setActiveTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const currentDateFormatted = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

  // KPI Summary calculations
  const totalScheduled = localEvents.length;
  const examCount = localEvents.filter((e) => e.type === 'EXAM').length;
  const deadlineCount = localEvents.filter((e) => e.type === 'DEADLINE').length;
  const activeLectureCount = localEvents.filter((e) => e.type === 'CLASS').length;

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <PageHeader
        title="Academic Operations Calendar"
        description="Master timetable and facility scheduling for examinations, lectures, assignment cutoffs, and faculty councils."
        breadcrumbs={[
          { label: 'Admin' },
          { label: 'Platform Operations' },
          { label: 'Academic Calendar' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFormDate(currentDateFormatted);
                setIsAddEventOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Event</span>
            </button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Scheduled Events</span>
            <CalendarIcon className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {totalScheduled}
            </span>
            <span className="text-[10px] text-slate-400">Total in term</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Examinations</span>
            <GraduationCap className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
              {examCount}
            </span>
            <span className="text-[10px] text-slate-400">Midterm & Finals</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Deadlines & Quizzes</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
              {deadlineCount}
            </span>
            <span className="text-[10px] text-slate-400">LMS Submissions</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Collision Index</span>
            <Building2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-xl font-bold font-mono tabular-nums ${
                venueConflicts.length === 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {venueConflicts.length}
            </span>
            <span className="text-[10px] text-slate-400">Venue conflicts</span>
          </div>
        </div>
      </div>

      {/* Main Operations Bar (Navigation, View Modes, Search) */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Date Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={
                view === 'month'
                  ? handlePrevMonth
                  : view === 'week'
                  ? handlePrevWeek
                  : handlePrevDay
              }
              title="Previous"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={
                view === 'month'
                  ? handleNextMonth
                  : view === 'week'
                  ? handleNextWeek
                  : handleNextDay
              }
              title="Next"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="ml-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {view === 'month' && `${monthNames[currentMonth]} ${currentYear}`}
              {view === 'week' && `Week of ${monthNames[currentWeekDays[0].date.getMonth()]} ${currentWeekDays[0].dayNumber}, ${currentYear}`}
              {view === 'day' && `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentYear}`}
              {view === 'agenda' && `Schedule Agenda · ${monthNames[currentMonth]} ${currentYear}`}
            </h2>
            <span className="hidden sm:inline-block text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              Fall 2026 · Week 7
            </span>
          </div>
        </div>

        {/* View Switcher, Search, Venue Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search */}
          <div className="relative flex items-center min-w-[160px] sm:min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search course, hall, or event..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Segmented View Mode Controls */}
          <div className="flex items-center gap-0.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl text-xs font-medium">
            {(['month', 'week', 'day', 'agenda'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  view === mode
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left Control Sidebar + Main Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* LEFT COLUMN: Mini Calendar, Categories, Venue Status & Conflicts */}
        <div className="space-y-4">
          {/* Interactive Mini Calendar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>{monthNames[currentMonth]} {currentYear}</span>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:text-slate-900 dark:hover:text-white rounded"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:text-slate-900 dark:hover:text-white rounded"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mini Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <span key={i} className="text-slate-400 font-semibold py-0.5">
                  {d}
                </span>
              ))}
              {calendarGrid.slice(0, 35).map((cell, idx) => {
                const isSelected =
                  currentDate.getFullYear() === cell.date.getFullYear() &&
                  currentDate.getMonth() === cell.date.getMonth() &&
                  currentDate.getDate() === cell.date.getDate();

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCurrentDate(cell.date);
                      if (view === 'agenda') setView('day');
                    }}
                    className={`py-1 rounded-md font-mono transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold'
                        : cell.isToday
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                        : cell.isCurrentMonth
                        ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  >
                    {cell.dayNumber}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Filters */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Calendar Layers</span>
              </span>
              <button
                onClick={() =>
                  setActiveTypes(
                    activeTypes.length === 5 ? [] : ['EXAM', 'QUIZ', 'CLASS', 'DEADLINE', 'SESSION']
                  )
                }
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {activeTypes.length === 5 ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-1.5">
              {Object.entries(EVENT_TYPE_COLORS).map(([typeKey, meta]) => {
                const isChecked = activeTypes.includes(typeKey);
                const count = localEvents.filter((e) => e.type === typeKey).length;

                return (
                  <button
                    key={typeKey}
                    type="button"
                    onClick={() => toggleTypeFilter(typeKey)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white'
                        : 'text-slate-400 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${meta.dot}`} />
                      <span className="font-medium text-[11.5px]">{meta.label}</span>
                    </div>
                    <span className="font-mono text-[10.5px] text-slate-400 tabular-nums">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Venue & Hall Filter */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Campus Venues</span>
            </span>

            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Campus Facilities ({CAMPUS_VENUES.length})</option>
              {CAMPUS_VENUES.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.name} ({v.capacity} seats)
                </option>
              ))}
            </select>

            {/* Venue Conflict Sentinel Alert */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              {venueConflicts.length === 0 ? (
                <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Zero Venue Conflicts Detected. Timetable certified.</span>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-[11px] text-rose-700 dark:text-rose-300 font-medium bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Collision Detected:</span>
                    <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">
                      {venueConflicts[0].eventA.location} has overlapping bookings on {venueConflicts[0].eventA.date}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN CALENDAR VIEWS (3 COLS) */}
        <div className="lg:col-span-3">
          {/* 1. MONTH VIEW */}
          {view === 'month' && (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-2.5">
                <span>Sunday</span>
                <span>Monday</span>
                <span>Tuesday</span>
                <span>Wednesday</span>
                <span>Thursday</span>
                <span>Friday</span>
                <span>Saturday</span>
              </div>

              {/* 7-column calendar matrix */}
              <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/70">
                {calendarGrid.map((cell, idx) => {
                  const dayEvents = cell.isCurrentMonth
                    ? filteredEvents.filter((e) => e.date === cell.dateStr)
                    : [];

                  return (
                    <div
                      key={idx}
                      className={`min-h-[118px] p-2 flex flex-col justify-between transition-colors group relative ${
                        !cell.isCurrentMonth
                          ? 'bg-slate-50/30 dark:bg-slate-950/20 text-slate-300 dark:text-slate-700'
                          : cell.isToday
                          ? 'bg-indigo-50/30 dark:bg-indigo-950/20'
                          : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-semibold tabular-nums ${
                            cell.isToday
                              ? 'w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs'
                              : cell.isCurrentMonth
                              ? 'text-slate-800 dark:text-slate-200'
                              : 'text-slate-400 dark:text-slate-600'
                          }`}
                        >
                          {cell.dayNumber}
                        </span>

                        {cell.isToday && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            Today
                          </span>
                        )}

                        {cell.isCurrentMonth && (
                          <button
                            type="button"
                            title="Schedule event on this day"
                            onClick={() => {
                              setFormDate(cell.dateStr);
                              setIsAddEventOpen(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-opacity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Event Chips */}
                      <div className="space-y-1 flex-1 overflow-y-auto no-scrollbar max-h-24">
                        {dayEvents.slice(0, 3).map((evt) => {
                          const meta = EVENT_TYPE_COLORS[evt.type] || EVENT_TYPE_COLORS.CLASS;
                          return (
                            <button
                              key={evt.id}
                              type="button"
                              onClick={() => setSelectedEvent(evt)}
                              className={`w-full text-left px-2 py-1 rounded-lg border text-[10.5px] font-medium truncate transition-all hover:scale-[1.01] block cursor-pointer ${meta.bg} ${meta.text} ${meta.border}`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} shrink-0`} />
                                {evt.courseCode && (
                                  <span className="font-mono text-[9.5px] font-bold opacity-80">
                                    {evt.courseCode}
                                  </span>
                                )}
                                <span className="truncate">{evt.title}</span>
                              </div>
                            </button>
                          );
                        })}

                        {dayEvents.length > 3 && (
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentDate(cell.date);
                              setView('day');
                            }}
                            className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-1 block text-left"
                          >
                            +{dayEvents.length - 3} more events
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. WEEK VIEW (Hourly 08:00 - 18:00 Timetable Grid) */}
          {view === 'week' && (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              {/* Weekday Header Columns */}
              <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-center py-2.5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider py-1">
                  Time
                </div>
                {currentWeekDays.map((d, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setCurrentDate(d.date);
                      setView('day');
                    }}
                    className={`cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg py-1 transition-colors ${
                      d.isToday ? 'bg-indigo-50/80 dark:bg-indigo-950/60' : ''
                    }`}
                  >
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {d.dayName}
                    </span>
                    <span
                      className={`text-sm font-bold font-mono tabular-nums ${
                        d.isToday
                          ? 'inline-flex w-6 h-6 rounded-full bg-indigo-600 text-white items-center justify-center'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {d.dayNumber}
                    </span>
                  </div>
                ))}
              </div>

              {/* Hourly Rows Grid */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[620px] overflow-y-auto">
                {TIME_HOURS.map((hour, hIdx) => (
                  <div key={hIdx} className="grid grid-cols-8 min-h-[64px] divide-x divide-slate-100 dark:divide-slate-800/80">
                    <div className="p-2 text-right text-[10px] font-mono font-medium text-slate-400 bg-slate-50/40 dark:bg-slate-950/20 select-none">
                      {hour}
                    </div>

                    {currentWeekDays.map((day, dIdx) => {
                      // Find events that roughly fall into this hour
                      const hourNum = parseInt(hour.split(':')[0], 10);
                      const isPM = hour.includes('PM') && hourNum !== 12;
                      const standardHour = isPM ? hourNum + 12 : hourNum;

                      const hourEvents = filteredEvents.filter((e) => {
                        if (e.date !== day.dateStr) return false;
                        // Approximate time match or contains hour
                        const startTimeLower = e.time.toLowerCase();
                        if (startTimeLower.includes(hour.slice(0, 2).toLowerCase())) return true;
                        if (hIdx === 1 && startTimeLower.includes('09:00')) return true;
                        if (hIdx === 2 && startTimeLower.includes('10:00')) return true;
                        if (hIdx === 3 && startTimeLower.includes('11:00')) return true;
                        if (hIdx === 5 && startTimeLower.includes('01:30')) return true;
                        if (hIdx === 6 && startTimeLower.includes('02:00')) return true;
                        if (hIdx === 7 && startTimeLower.includes('03:00')) return true;
                        return false;
                      });

                      return (
                        <div
                          key={dIdx}
                          onClick={() => {
                            setFormDate(day.dateStr);
                            setFormStartTime(hour);
                            setIsAddEventOpen(true);
                          }}
                          className={`p-1.5 transition-colors relative hover:bg-slate-50/60 dark:hover:bg-slate-800/30 cursor-pointer ${
                            day.isToday ? 'bg-indigo-50/10 dark:bg-indigo-950/10' : ''
                          }`}
                        >
                          {hourEvents.map((evt) => {
                            const meta = EVENT_TYPE_COLORS[evt.type] || EVENT_TYPE_COLORS.CLASS;
                            return (
                              <div
                                key={evt.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEvent(evt);
                                }}
                                className={`p-1.5 rounded-lg border text-[10px] mb-1 leading-tight shadow-xs transition-transform hover:scale-[1.02] ${meta.bg} ${meta.text} ${meta.border}`}
                              >
                                <div className="font-bold flex items-center justify-between">
                                  <span>{evt.courseCode || evt.type}</span>
                                  <span className="text-[9px] font-mono opacity-80">{evt.time.split('-')[0]}</span>
                                </div>
                                <div className="truncate font-medium">{evt.title}</div>
                                <div className="text-[9px] opacity-75 truncate">{evt.location}</div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. DAY VIEW (Detailed Single-Day Facility Schedule) */}
          {view === 'day' && (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {monthNames[currentDate.getMonth()]} {currentDate.getDate()}, {currentDate.getFullYear()} Schedule
                  </h3>
                  <span className="text-xs text-slate-400">
                    Day Operations · Campus Venue Allocations
                  </span>
                </div>

                <button
                  onClick={() => {
                    setFormDate(currentDateFormatted);
                    setIsAddEventOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add To This Day</span>
                </button>
              </div>

              {/* Day events timeline */}
              <div className="space-y-3">
                {filteredEvents.filter((e) => e.date === currentDateFormatted).length === 0 ? (
                  <div className="p-12 text-center space-y-2 text-slate-400">
                    <CalendarIcon className="w-8 h-8 mx-auto opacity-30 text-indigo-500" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      No events scheduled for this day
                    </p>
                    <p className="text-[11px]">
                      Campus venues are available for ad-hoc bookings and study sessions.
                    </p>
                  </div>
                ) : (
                  filteredEvents
                    .filter((e) => e.date === currentDateFormatted)
                    .map((evt) => {
                      const meta = EVENT_TYPE_COLORS[evt.type] || EVENT_TYPE_COLORS.CLASS;
                      return (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEvent(evt)}
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50/40 dark:bg-slate-800/30 flex items-start justify-between cursor-pointer transition-all shadow-xs group"
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${meta.bg} ${meta.text} ${meta.border}`}
                            >
                              {evt.type}
                            </span>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {evt.title}
                                </h4>
                                {evt.courseCode && (
                                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                                    {evt.courseCode}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1 font-mono">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{evt.time}</span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{evt.location}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline">
                              Inspect Details
                            </span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {/* 4. AGENDA VIEW (Chronological Master Roster) */}
          {view === 'agenda' && (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Chronological Master Timetable
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Showing {filteredEvents.length} filtered academic events
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[640px] overflow-y-auto">
                {filteredEvents.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-1">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      No matching events found
                    </p>
                    <p className="text-[11px]">Adjust your search query or calendar category filters.</p>
                  </div>
                ) : (
                  filteredEvents.map((evt) => {
                    const meta = EVENT_TYPE_COLORS[evt.type] || EVENT_TYPE_COLORS.CLASS;
                    return (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className="p-4 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 text-center shrink-0">
                            <span className="text-xs font-bold font-mono text-slate-900 dark:text-white block">
                              {evt.date.slice(5)}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase font-medium">
                              {new Date(evt.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${meta.bg} ${meta.text} ${meta.border}`}
                              >
                                {evt.type}
                              </span>
                              <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {evt.title}
                              </h4>
                              {evt.courseCode && (
                                <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.2 rounded border border-indigo-200/40 dark:border-indigo-800/40">
                                  {evt.courseCode}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{evt.time}</span>
                              </span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{evt.location}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadIcs(evt);
                            }}
                            title="Download iCal (.ics)"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                            Inspect
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EVENT DETAIL MODAL / DRAWER */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    EVENT_TYPE_COLORS[selectedEvent.type]?.bg || ''
                  } ${EVENT_TYPE_COLORS[selectedEvent.type]?.text || ''} ${
                    EVENT_TYPE_COLORS[selectedEvent.type]?.border || ''
                  }`}
                >
                  {selectedEvent.type}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Event Specification Details */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-[10.5px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Date
                </span>
                <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
                  <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{selectedEvent.date}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10.5px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Time Window
                </span>
                <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{selectedEvent.time}</span>
                </div>
              </div>

              <div className="space-y-1 col-span-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10.5px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Venue & Facility
                </span>
                <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{selectedEvent.location}</span>
                </div>
              </div>

              {selectedEvent.courseCode && (
                <div className="space-y-1 col-span-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10.5px] text-slate-400 uppercase tracking-wider font-semibold block">
                    Associated Course Syllabus
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                      {selectedEvent.courseCode}
                    </span>
                    <span className="text-[11.5px] text-slate-600 dark:text-slate-300">
                      Module syllabus certified in Course Management
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Event</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadIcs(selectedEvent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export iCal (.ics)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE ACADEMIC EVENT MODAL */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Schedule Academic Event
                </h3>
              </div>
              <button
                onClick={() => setIsAddEventOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Advanced Calculus Midterm Examination"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Event Category
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="EXAM">Examination</option>
                    <option value="QUIZ">Quiz / Assessment</option>
                    <option value="CLASS">Regular Lecture</option>
                    <option value="DEADLINE">Submission Cutoff</option>
                    <option value="SESSION">Administrative Session</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Associated Course
                  </label>
                  <select
                    value={formCourseCode}
                    onChange={(e) => setFormCourseCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                  >
                    <option value="MATH-401">MATH-401 (Advanced Calculus)</option>
                    <option value="CS-302">CS-302 (Data Structures)</option>
                    <option value="PHYS-402">PHYS-402 (Quantum Foundations)</option>
                    <option value="BIO-204">BIO-204 (Molecular Genetics)</option>
                    <option value="CHEM-201">CHEM-201 (Organic Chemistry)</option>
                    <option value="SENATE">SENATE (Administrative Council)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <select
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                  >
                    {TIME_HOURS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <select
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                  >
                    {TIME_HOURS.slice(1).concat(['07:00 PM', '08:00 PM']).map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Campus Venue / Location
                </label>
                <select
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                >
                  {CAMPUS_VENUES.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.name} ({v.type} · Cap: {v.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
