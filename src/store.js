/* ==========================================================================
   REACTIVE STATE STORE & MOCK DATA
   GAFOOR DRIVING SCHOOL — PULIVENDULA, ANDHRA PRADESH
   "Walk in & Drive out"
   Accredited by Andhra Pradesh Motor Vehicles Department (AP RTO Pulivendula / Kadapa)
   All copy, roles, and candidate records formatted in English words only.
   ========================================================================== */

import { extractInitials, getNextStudentSequence, generateStudentCode, generateTrainerCode, getNextTrainerSequence, normalizeCode } from './utils/studentCode.js';
import { 
  saveStudentToSupabase, 
  fetchStudentsFromSupabase, 
  updateStudentInSupabase,
  fetchSlotsFromSupabase,
  fetchBookingsFromSupabase,
  bookSlotInSupabase,
  cancelSlotBookingInSupabase,
  saveSlotToSupabase,
  updateTrainerAvailabilityInSupabase
} from './supabase.js';
import api from './api/client.js';

export const DEFAULT_BOOKABLE_SLOTS = [
  { idSuffix: '0800-0900', startTime: '08:00 AM', endTime: '09:00 AM', timeDisplay: '08:00 AM – 09:00 AM', start24: '08:00', end24: '09:00' },
  { idSuffix: '0915-1015', startTime: '09:15 AM', endTime: '10:15 AM', timeDisplay: '09:15 AM – 10:15 AM', start24: '09:15', end24: '10:15' },
  { idSuffix: '1030-1130', startTime: '10:30 AM', endTime: '11:30 AM', timeDisplay: '10:30 AM – 11:30 AM', start24: '10:30', end24: '11:30' },
  { idSuffix: '1300-1400', startTime: '01:00 PM', endTime: '02:00 PM', timeDisplay: '01:00 PM – 02:00 PM', start24: '13:00', end24: '14:00' },
  { idSuffix: '1415-1515', startTime: '02:15 PM', endTime: '03:15 PM', timeDisplay: '02:15 PM – 03:15 PM', start24: '14:15', end24: '15:15' },
  { idSuffix: '1530-1630', startTime: '03:30 PM', endTime: '04:30 PM', timeDisplay: '03:30 PM – 04:30 PM', start24: '15:30', end24: '16:30' }
];

export function getLocalTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatReadableDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const dt = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime24to12(timeStr) {
  if (!timeStr) return '';
  const clean = timeStr.trim();
  if (/^[0-9]{1,2}:[0-9]{2}\s*(AM|PM)$/i.test(clean)) {
    return clean.toUpperCase();
  }
  const parts = clean.split(':');
  if (parts.length < 2) return clean;
  let h = parseInt(parts[0], 10);
  const m = String(parseInt(parts[1], 10) || 0).padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${String(h).padStart(2, '0')}:${m} ${period}`;
}

export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim();
  const isPM = cleaned.toUpperCase().includes('PM');
  const isAM = cleaned.toUpperCase().includes('AM');
  const [hStr, mStr] = cleaned.replace(/[APMapm\s]/g, '').split(':');
  let h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
}

export function doIntervalsOverlap(startA, endA, startB, endB) {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA) || (sA + 60);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB) || (sB + 60);
  return Math.max(sA, sB) < Math.min(eA, eB);
}

function getOffsetDateStr(offsetDays = 0) {
  const baseDt = new Date();
  baseDt.setDate(baseDt.getDate() + offsetDays);
  const y = baseDt.getFullYear();
  const m = String(baseDt.getMonth() + 1).padStart(2, '0');
  const d = String(baseDt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function generateInitialSlotBookings() {
  const today = getOffsetDateStr(0);
  const tomorrow = getOffsetDateStr(1);
  const dayAfter = getOffsetDateStr(2);

  return [
    // Today (01 Oct): 08:00 AM – 09:00 AM completed ride for Sai Kiran Varma (SK- GS01)
    {
      id: `SB-${today.replace(/-/g, '')}-0800-SK`,
      slotId: `SLOT-${today}-0800-0900`,
      date: today,
      startTime: '08:00 AM',
      endTime: '09:00 AM',
      timeDisplay: '08:00 AM – 09:00 AM',
      traineeId: 'SK- GS01',
      traineeName: 'Sai Kiran Varma',
      trainerId: 'TRN-1',
      trainerName: 'K. Srinivas Rao',
      vehicle: 'Maruti Suzuki Swift Dual-Ctrl #AP-04-ED-4041',
      course: '20-Day Comprehensive Licensing Package',
      status: 'COMPLETED',
      attendance: 'present',
      notes: 'Ride Completed ✓ · AP RTO 8-track maneuvers verified',
      bookedAt: `${today}T06:00:00.000Z`
    },
    {
      id: `SB-${today.replace(/-/g, '')}-0800-01`,
      slotId: `SLOT-${today}-0800-0900`,
      date: today,
      startTime: '08:00 AM',
      endTime: '09:00 AM',
      timeDisplay: '08:00 AM – 09:00 AM',
      traineeId: 'LG- GS02',
      traineeName: 'Lavanya Goud',
      trainerId: 'TRN-1',
      trainerName: 'K. Srinivas Rao',
      vehicle: 'Maruti Suzuki Swift Dual-Ctrl #AP-04-ED-4041',
      course: 'Ladies Special Mentorship Package',
      status: 'COMPLETED',
      attendance: 'present',
      notes: 'Ride Completed ✓',
      bookedAt: `${today}T07:15:00.000Z`
    },
    {
      id: `SB-${today.replace(/-/g, '')}-0800-02`,
      slotId: `SLOT-${today}-0800-0900`,
      date: today,
      startTime: '08:00 AM',
      endTime: '09:00 AM',
      timeDisplay: '08:00 AM – 09:00 AM',
      traineeId: 'HC- GS03',
      traineeName: 'Harika Chowdary',
      trainerId: 'TRN-2',
      trainerName: 'Anitha Reddy',
      vehicle: 'Hyundai Grand i10 Dual-Ctrl #AP-04-AB-2020',
      course: '20-Day Comprehensive Licensing Package',
      status: 'COMPLETED',
      attendance: 'present',
      notes: 'Ride Completed ✓',
      bookedAt: `${today}T07:20:00.000Z`
    },
    {
      id: `SB-${today.replace(/-/g, '')}-0800-03`,
      slotId: `SLOT-${today}-0800-0900`,
      date: today,
      startTime: '08:00 AM',
      endTime: '09:00 AM',
      timeDisplay: '08:00 AM – 09:00 AM',
      traineeId: 'VK- GS04',
      traineeName: 'Vamshi Krishna',
      trainerId: 'TRN-2',
      trainerName: 'Anitha Reddy',
      vehicle: 'Hyundai Grand i10 Dual-Ctrl #AP-04-AB-2020',
      course: 'City Traffic & 8-Track Mastery',
      status: 'COMPLETED',
      attendance: 'present',
      notes: 'Ride Completed ✓',
      bookedAt: `${today}T07:25:00.000Z`
    },
    {
      id: `SB-${today.replace(/-/g, '')}-0800-04`,
      slotId: `SLOT-${today}-0800-0900`,
      date: today,
      startTime: '08:00 AM',
      endTime: '09:00 AM',
      timeDisplay: '08:00 AM – 09:00 AM',
      traineeId: 'SR- GS05',
      traineeName: 'Sneha Reddy',
      trainerId: 'TRN-3',
      trainerName: 'M. Venkataramana',
      vehicle: 'Tata Punch Dual-Ctrl #AP-04-CT-7072',
      course: '20-Day Comprehensive Licensing Package',
      status: 'COMPLETED',
      attendance: 'present',
      notes: 'Ride Completed ✓',
      bookedAt: `${today}T07:30:00.000Z`
    },
    {
      id: `SB-${today.replace(/-/g, '')}-0800-05`,
      slotId: `SLOT-${today}-0800-0900`,
      date: today,
      startTime: '08:00 AM',
      endTime: '09:00 AM',
      timeDisplay: '08:00 AM – 09:00 AM',
      traineeId: 'KR- GS06',
      traineeName: 'Karthik Raju',
      trainerId: 'TRN-3',
      trainerName: 'M. Venkataramana',
      vehicle: 'Tata Punch Dual-Ctrl #AP-04-CT-7072',
      course: 'City Traffic & 8-Track Mastery',
      status: 'COMPLETED',
      attendance: 'present',
      notes: 'Ride Completed ✓',
      bookedAt: `${today}T07:35:00.000Z`
    },

    // Tomorrow (02 Oct): 09:15 AM – 10:15 AM upcoming confirmed booking for Sai Kiran Varma (SK- GS01)
    {
      id: `SB-${tomorrow.replace(/-/g, '')}-0915-SK`,
      slotId: `SLOT-${tomorrow}-0915-1015`,
      date: tomorrow,
      startTime: '09:15 AM',
      endTime: '10:15 AM',
      timeDisplay: '09:15 AM – 10:15 AM',
      traineeId: 'SK- GS01',
      traineeName: 'Sai Kiran Varma',
      trainerId: 'TRN-1',
      trainerName: 'K. Srinivas Rao',
      vehicle: 'Maruti Suzuki Swift Dual-Ctrl #AP-04-ED-4041',
      course: '20-Day Comprehensive Licensing Package',
      status: 'CONFIRMED',
      notes: 'Upcoming Practical Road Lesson',
      bookedAt: `${today}T09:00:00.000Z`
    },

    // Day After Tomorrow (03 Oct): 01:00 PM – 02:00 PM is 8/8 FULL
    {
      id: `SB-${dayAfter.replace(/-/g, '')}-1300-01`,
      slotId: `SLOT-${dayAfter}-1300-1400`,
      date: dayAfter,
      startTime: '01:00 PM',
      endTime: '02:00 PM',
      timeDisplay: '01:00 PM – 02:00 PM',
      traineeId: 'LG- GS02',
      traineeName: 'Lavanya Goud',
      trainerId: 'TRN-1',
      trainerName: 'K. Srinivas Rao',
      vehicle: 'Maruti Suzuki Swift Dual-Ctrl #AP-04-ED-4041',
      course: 'Ladies Special Mentorship Package',
      status: 'CONFIRMED',
      bookedAt: `${today}T08:00:00.000Z`
    },
    {
      id: `SB-${dayAfter.replace(/-/g, '')}-1300-02`,
      slotId: `SLOT-${dayAfter}-1300-1400`,
      date: dayAfter,
      startTime: '01:00 PM',
      endTime: '02:00 PM',
      timeDisplay: '01:00 PM – 02:00 PM',
      traineeId: 'HC- GS03',
      traineeName: 'Harika Chowdary',
      trainerId: 'TRN-1',
      trainerName: 'K. Srinivas Rao',
      vehicle: 'Maruti Suzuki Swift Dual-Ctrl #AP-04-ED-4041',
      course: '20-Day Comprehensive Licensing Package',
      status: 'CONFIRMED',
      bookedAt: `${today}T08:05:00.000Z`
    },
    {
      id: `SB-${dayAfter.replace(/-/g, '')}-1300-03`,
      slotId: `SLOT-${dayAfter}-1300-1400`,
      date: dayAfter,
      startTime: '01:00 PM',
      endTime: '02:00 PM',
      timeDisplay: '01:00 PM – 02:00 PM',
      traineeId: 'VK- GS04',
      traineeName: 'Vamshi Krishna',
      trainerId: 'TRN-2',
      trainerName: 'Anitha Reddy',
      vehicle: 'Hyundai Grand i10 Dual-Ctrl #AP-04-AB-2020',
      course: 'City Traffic & 8-Track Mastery',
      status: 'CONFIRMED',
      bookedAt: `${today}T08:10:00.000Z`
    },
    {
      id: `SB-${dayAfter.replace(/-/g, '')}-1300-04`,
      slotId: `SLOT-${dayAfter}-1300-1400`,
      date: dayAfter,
      startTime: '01:00 PM',
      endTime: '02:00 PM',
      timeDisplay: '01:00 PM – 02:00 PM',
      traineeId: 'SR- GS05',
      traineeName: 'Sneha Reddy',
      trainerId: 'TRN-2',
      trainerName: 'Anitha Reddy',
      vehicle: 'Hyundai Grand i10 Dual-Ctrl #AP-04-AB-2020',
      course: '20-Day Comprehensive Licensing Package',
      status: 'CONFIRMED',
      bookedAt: `${today}T08:15:00.000Z`
    },
    {
      id: `SB-${dayAfter.replace(/-/g, '')}-1300-05`,
      slotId: `SLOT-${dayAfter}-1300-1400`,
      date: dayAfter,
      startTime: '01:00 PM',
      endTime: '02:00 PM',
      timeDisplay: '01:00 PM – 02:00 PM',
      traineeId: 'KR- GS06',
      traineeName: 'Karthik Raju',
      trainerId: 'TRN-3',
      trainerName: 'M. Venkataramana',
      vehicle: 'Tata Punch Dual-Ctrl #AP-04-CT-7072',
      course: 'City Traffic & 8-Track Mastery',
      status: 'CONFIRMED',
      bookedAt: `${today}T08:20:00.000Z`
    },
    {
      id: `SB-${dayAfter.replace(/-/g, '')}-1300-06`,
      slotId: `SLOT-${dayAfter}-1300-1400`,
      date: dayAfter,
      startTime: '01:00 PM',
      endTime: '02:00 PM',
      timeDisplay: '01:00 PM – 02:00 PM',
      traineeId: 'DB- GS07',
      traineeName: 'Divya Bharathi',
      trainerId: 'TRN-3',
      trainerName: 'M. Venkataramana',
      vehicle: 'Tata Punch Dual-Ctrl #AP-04-CT-7072',
      course: '20-Day Comprehensive Licensing Package',
      status: 'CONFIRMED',
      bookedAt: `${today}T08:25:00.000Z`
    },
    {
      id: `SB-${dayAfter.replace(/-/g, '')}-1300-07`,
      slotId: `SLOT-${dayAfter}-1300-1400`,
      date: dayAfter,
      startTime: '01:00 PM',
      endTime: '02:00 PM',
      timeDisplay: '01:00 PM – 02:00 PM',
      traineeId: 'MK- GS08',
      traineeName: 'Manoj Kumar',
      trainerId: 'TRN-4',
      trainerName: 'D. Ravi Kumar',
      vehicle: 'Maruti WagonR Dual-Ctrl #AP-04-KL-8088',
      course: 'City Traffic & 8-Track Mastery',
      status: 'CONFIRMED',
      bookedAt: `${today}T08:30:00.000Z`
    },
    {
      id: `SB-${dayAfter.replace(/-/g, '')}-1300-08`,
      slotId: `SLOT-${dayAfter}-1300-1400`,
      date: dayAfter,
      startTime: '01:00 PM',
      endTime: '02:00 PM',
      timeDisplay: '01:00 PM – 02:00 PM',
      traineeId: 'ST- GS09',
      traineeName: 'Sanjay Mohan',
      trainerId: 'TRN-4',
      trainerName: 'D. Ravi Kumar',
      vehicle: 'Maruti WagonR Dual-Ctrl #AP-04-KL-8088',
      course: 'City Traffic & 8-Track Mastery',
      status: 'CONFIRMED',
      bookedAt: `${today}T08:35:00.000Z`
    }
  ];
}

function ensureSampleStudentBookings(bookings = []) {
  const samples = generateInitialSlotBookings();
  samples.forEach(sample => {
    const exists = bookings.some(b => b.id === sample.id || (b.traineeId === sample.traineeId && b.date === sample.date && b.startTime === sample.startTime));
    if (!exists) {
      bookings.push(sample);
    }
  });
  return bookings;
}

import { OFFICIAL_20_DAY_CURRICULUM, getStageForDay } from './utils/trainingCurriculum.js';
import { 
  DEFAULT_ACADEMY_HOLIDAYS, 
  generate20DaySchedule, 
  postponeSession as calendarPostponeSession, 
  completeSession as calendarCompleteSession,
  recalculateScheduleWithHolidays,
  toDateStr,
  parseDateStr
} from './utils/academyCalendar.js';

const STORAGE_KEY = 'gafoor_driving_school_v1_pulivendula_state';

const INITIAL_TRAINERS = [
  { 
    id: 'TRN-1',
    trainerCode: 'SR-TG01',
    name: 'K. Srinivas Rao', 
    role: 'Senior Master Instructor (18+ Years Experience)', 
    specialty: 'Pulivendula RTO 8-Track & Half-Clutch Balance Mastery', 
    rating: 4.96, 
    activeStudents: 8, 
    car: 'Maruti Suzuki Swift Dual-Ctrl #AP-04-ED-4041',
    phone: '+91 98480 11223',
    email: 'srinivas.rao@gafoordriving.in',
    isFirstLogin: true,
    password: null
  },
  { 
    id: 'TRN-2',
    trainerCode: 'AR-TG02',
    name: 'Anitha Reddy', 
    role: 'Senior Lady Driving Specialist & Mentor', 
    specialty: 'Confidence Building & Pulivendula Town Traffic Navigation', 
    rating: 4.95, 
    activeStudents: 7, 
    car: 'Hyundai Grand i10 Dual-Ctrl #AP-04-AB-2020',
    phone: '+91 94401 22334',
    email: 'anitha.reddy@gafoordriving.in',
    isFirstLogin: true,
    password: null
  },
  { 
    id: 'TRN-3',
    trainerCode: 'VR-TG03',
    name: 'M. Venkataramana', 
    role: 'Kadapa Highway & Ghat Road Lead Trainer', 
    specialty: 'Pulivendula Ghat Incline, Night Driving & Highway Speed Control', 
    rating: 4.88, 
    activeStudents: 6, 
    car: 'Tata Punch Dual-Ctrl #AP-04-CT-7072',
    phone: '+91 98665 33445',
    email: 'm.venkat@gafoordriving.in',
    isFirstLogin: true,
    password: null
  },
  { 
    id: 'TRN-4',
    trainerCode: 'RK-TG04',
    name: 'D. Ravi Kumar', 
    role: 'AP RTO Ground Test Specialist', 
    specialty: 'H-Track, Reverse Bay Docking & Pulivendula Sensor Compliance', 
    rating: 4.92, 
    activeStudents: 7, 
    car: 'Maruti WagonR Dual-Ctrl #AP-04-KL-8088',
    phone: '+91 99890 55667',
    email: 'ravi.kumar@gafoordriving.in',
    isFirstLogin: true,
    password: null
  }
];

const INITIAL_TRAINEES = [
  {
    id: 'SK- GS01',
    studentCode: 'SK- GS01',
    name: 'Sai Kiran Varma',
    email: 'sai.kiran@gafoordriving.in',
    phone: '+91 98480 22334',
    permitNumber: 'AP004/LLR/2026/8941',
    address: 'Bakarapuram, Pulivendula, AP',
    emergencyContact: 'Suresh Varma (Father)',
    emergencyPhone: '+91 98480 99881',
    assignedTrainerId: 'TRN-1',
    currentDay: 14,
    totalDays: 20,
    category: 'highway',
    status: 'Active',
    registeredDate: '2026-08-12',
    package: '20-Day Comprehensive Licensing Package',
    avatar: 'SK',
    attendanceRate: '100%',
    paymentStatus: 'partial',
    isFirstLogin: true,
    password: null
  },
  {
    id: 'LG- GS02',
    studentCode: 'LG- GS02',
    name: 'Lavanya Goud',
    email: 'lavanya.goud@gafoordriving.in',
    phone: '+91 94401 55678',
    permitNumber: 'AP004/LLR/2026/4102',
    address: 'Kadapa Road, Pulivendula, AP',
    emergencyContact: 'Rajesh Goud (Husband)',
    emergencyPhone: '+91 94401 11220',
    assignedTrainerId: 'TRN-2',
    currentDay: 7,
    totalDays: 20,
    category: 'street',
    status: 'Active',
    registeredDate: '2026-08-25',
    package: 'Ladies Special Mentorship Package',
    avatar: 'LG',
    attendanceRate: '95%',
    paymentStatus: 'paid',
    isFirstLogin: true,
    password: null
  },
  {
    id: 'HC- GS03',
    studentCode: 'HC- GS03',
    name: 'Harika Chowdary',
    email: 'harika.c@gafoordriving.in',
    phone: '+91 98665 12090',
    permitNumber: 'AP004/LLR/2026/7788',
    address: 'JNTU Campus Road, Pulivendula, AP',
    emergencyContact: 'Srinivasa Rao (Father)',
    emergencyPhone: '+91 98665 99001',
    assignedTrainerId: 'TRN-2',
    currentDay: 20,
    totalDays: 20,
    category: 'test',
    status: 'Completed',
    isActive: false,
    registeredDate: '2026-08-01',
    actualCompletionDate: '2026-08-25',
    package: '20-Day Comprehensive Licensing Package',
    avatar: 'HC',
    attendanceRate: '100%',
    paymentStatus: 'paid',
    isFirstLogin: true,
    password: null
  },
  {
    id: 'VK- GS04',
    studentCode: 'VK- GS04',
    name: 'Vamshi Krishna',
    email: 'vamshi.k@gafoordriving.in',
    phone: '+91 99890 44321',
    permitNumber: 'AP004/LLR/2026/1209',
    address: 'Near RTC Bus Stand, Pulivendula, AP',
    emergencyContact: 'Venkateshwarlu (Brother)',
    emergencyPhone: '+91 99890 11990',
    assignedTrainerId: 'TRN-3',
    currentDay: 3,
    totalDays: 20,
    category: 'street',
    status: 'Active',
    isActive: true,
    registeredDate: '2026-09-05',
    package: 'City Traffic & 8-Track Mastery',
    avatar: 'VK',
    attendanceRate: '100%',
    paymentStatus: 'pending',
    isFirstLogin: true,
    password: null
  },
  {
    id: 'SR- GS05',
    studentCode: 'SR- GS05',
    name: 'Sneha Reddy',
    email: 'sneha.r@gafoordriving.in',
    phone: '+91 97012 33445',
    permitNumber: 'AP004/LLR/2026/6634',
    address: 'Shilparamam Ring Road, Pulivendula, AP',
    emergencyContact: 'Kishore Reddy (Father)',
    emergencyPhone: '+91 97012 88990',
    assignedTrainerId: 'TRN-1',
    currentDay: 11,
    totalDays: 20,
    category: 'highway',
    status: 'Active',
    isActive: true,
    registeredDate: '2026-08-18',
    package: '20-Day Comprehensive Licensing Package',
    avatar: 'SR',
    attendanceRate: '92%',
    paymentStatus: 'paid',
    isFirstLogin: true,
    password: null
  },
  {
    id: 'KR- GS06',
    studentCode: 'KR- GS06',
    name: 'Karthik Raju',
    email: 'karthik.raju@gafoordriving.in',
    phone: '+91 91210 77889',
    permitNumber: 'AP004/LLR/2026/3312',
    address: 'Bypass Road, Pulivendula, AP',
    emergencyContact: 'Ramakrishnam Raju (Uncle)',
    emergencyPhone: '+91 91210 22331',
    assignedTrainerId: 'TRN-4',
    currentDay: 9,
    totalDays: 20,
    category: 'street',
    status: 'Active',
    isActive: true,
    registeredDate: '2026-08-20',
    package: 'City Traffic & 8-Track Mastery',
    avatar: 'KR',
    attendanceRate: '88%',
    paymentStatus: 'partial',
    isFirstLogin: true,
    password: null
  },
  {
    id: 'DB- GS07',
    studentCode: 'DB- GS07',
    name: 'Divya Bharathi',
    email: 'divya.b@gafoordriving.in',
    phone: '+91 93901 88900',
    permitNumber: 'AP004/LLR/2026/5521',
    address: 'Main Bazaar Road, Pulivendula, AP',
    emergencyContact: 'Srinivas (Father)',
    emergencyPhone: '+91 93901 22110',
    assignedTrainerId: 'TRN-2',
    currentDay: 18,
    totalDays: 20,
    category: 'highway',
    status: 'Active',
    isActive: true,
    registeredDate: '2026-08-05',
    package: '20-Day Comprehensive Licensing Package',
    avatar: 'DB',
    attendanceRate: '96%',
    paymentStatus: 'overdue',
    isFirstLogin: true,
    password: null
  },
  {
    id: 'MK- GS08',
    studentCode: 'MK- GS08',
    name: 'Manoj Kumar',
    email: 'manoj.k@gafoordriving.in',
    phone: '+91 98499 11223',
    permitNumber: 'AP004/LLR/2026/9012',
    address: 'Vempalli Road, Pulivendula, AP',
    emergencyContact: 'Suryanarayana (Father)',
    emergencyPhone: '+91 98499 77881',
    assignedTrainerId: 'TRN-3',
    currentDay: 1,
    totalDays: 20,
    category: 'street',
    status: 'New Intake',
    isActive: true,
    registeredDate: '2026-10-02',
    package: 'City Traffic & 8-Track Mastery',
    avatar: 'MK',
    attendanceRate: '100%',
    paymentStatus: 'pending',
    isFirstLogin: true,
    password: null
  },
  {
    id: 'MA- GS09',
    studentCode: 'MA- GS09',
    name: 'Mulla Adil',
    email: 'mulla.adil@gafoordriving.in',
    phone: '+91 98480 33445',
    permitNumber: 'AP004/LLR/2026/1029',
    address: 'Near Old Bus Stand, Pulivendula, AP',
    emergencyContact: 'Bashir Ahmed (Father)',
    emergencyPhone: '+91 98480 11999',
    assignedTrainerId: 'TRN-1',
    currentDay: 20,
    totalDays: 20,
    category: 'test',
    status: 'Completed',
    isActive: false,
    registeredDate: '2026-10-02',
    actualCompletionDate: '2026-10-28',
    package: '20-Day Comprehensive Licensing Package',
    avatar: 'MA',
    attendanceRate: '100%',
    paymentStatus: 'paid',
    isFirstLogin: true,
    password: null
  },
  {
    id: 'PL- GS10',
    studentCode: 'PL- GS10',
    name: 'Prasanna Lakshmi',
    email: 'prasanna.l@gafoordriving.in',
    phone: '+91 94401 77665',
    permitNumber: 'AP004/LLR/2026/5012',
    address: 'Ring Road, Pulivendula, AP',
    emergencyContact: 'Venkataiah (Father)',
    emergencyPhone: '+91 94401 44332',
    assignedTrainerId: 'TRN-2',
    currentDay: 20,
    totalDays: 20,
    category: 'test',
    status: 'Completed',
    isActive: false,
    registeredDate: '2026-09-01',
    actualCompletionDate: '2026-09-26',
    package: 'Ladies Special Mentorship Package',
    avatar: 'PL',
    attendanceRate: '100%',
    paymentStatus: 'paid',
    isFirstLogin: true,
    password: null
  }
];

const INITIAL_PAYMENTS = [
  { id: 'INV-4011', traineeId: 'SK- GS01', traineeName: 'Sai Kiran Varma', package: '20-Day Comprehensive', amount: 7500, paid: 4500, balance: 3000, dueDate: '2026-09-22', status: 'partial', method: 'UPI (PhonePe QR)' },
  { id: 'INV-4012', traineeId: 'LG- GS02', traineeName: 'Lavanya Goud', package: 'Ladies Special Batch', amount: 8500, paid: 8500, balance: 0, dueDate: '2026-09-10', status: 'paid', method: 'Google Pay UPI' },
  { id: 'INV-4013', traineeId: 'HC- GS03', traineeName: 'Harika Chowdary', package: '20-Day Comprehensive', amount: 7500, paid: 7500, balance: 0, dueDate: '2026-08-20', status: 'paid', method: 'BHIM UPI Transfer' },
  { id: 'INV-4014', traineeId: 'VK- GS04', traineeName: 'Vamshi Krishna', package: 'City & Track Mastery', amount: 5500, paid: 0, balance: 5500, dueDate: '2026-09-20', status: 'pending', method: 'Pending UPI Verification' },
  { id: 'INV-4015', traineeId: 'SR- GS05', traineeName: 'Sneha Reddy', package: '20-Day Comprehensive', amount: 7500, paid: 7500, balance: 0, dueDate: '2026-08-28', status: 'paid', method: 'Paytm UPI' },
  { id: 'INV-4016', traineeId: 'KR- GS06', traineeName: 'Karthik Raju', package: 'City & Track Mastery', amount: 5500, paid: 2500, balance: 3000, dueDate: '2026-09-25', status: 'partial', method: 'Cash at Branch' },
  { id: 'INV-4017', traineeId: 'DB- GS07', traineeName: 'Divya Bharathi', package: '20-Day Comprehensive', amount: 7500, paid: 3500, balance: 4000, dueDate: '2026-09-02', status: 'overdue', method: 'Late Notice Sent' },
  { id: 'INV-4018', traineeId: 'MK- GS08', traineeName: 'Manoj Kumar', package: 'City & Track Mastery', amount: 5500, paid: 0, balance: 5500, dueDate: '2026-09-29', status: 'pending', method: 'Awaiting UPI Deposit' },
  { id: 'INV-4019', traineeId: 'MA- GS09', traineeName: 'Mulla Adil', package: '20-Day Comprehensive', amount: 11000, paid: 11000, balance: 0, dueDate: '2026-10-15', status: 'paid', method: 'Google Pay UPI' },
  { id: 'INV-4020', traineeId: 'PL- GS10', traineeName: 'Prasanna Lakshmi', package: 'Ladies Special Batch', amount: 8500, paid: 8500, balance: 0, dueDate: '2026-09-15', status: 'paid', method: 'PhonePe UPI' }
];

const INITIAL_SCHEDULE = [
  { id: 'SLOT-1', time: '07:30 AM – 09:00 AM', traineeId: 'LG- GS02', studentName: 'Lavanya Goud', topic: 'Day 7: Pulivendula RTO H-Track & Reverse Bay Docking', car: 'Hyundai Grand i10 Dual-Ctrl #AP-04-AB-2020', attendance: 'present' },
  { id: 'SLOT-2', time: '09:30 AM – 11:00 AM', traineeId: 'SK- GS01', studentName: 'Sai Kiran Varma', topic: 'Day 14: Pulivendula Bypass Incline & Half-Clutch Hold', car: 'Maruti Suzuki Swift Dual-Ctrl #AP-04-ED-4041', attendance: 'present' },
  { id: 'SLOT-3', time: '02:00 PM – 03:30 PM', traineeId: 'HC- GS03', studentName: 'Harika Chowdary', topic: 'Day 20: Official Pulivendula RTO Automated Driving Test Mock Exam', car: 'Hyundai Grand i10 Dual-Ctrl #AP-04-AB-2020', attendance: 'late' },
  { id: 'SLOT-4', time: '04:00 PM – 05:30 PM', traineeId: 'VK- GS04', studentName: 'Vamshi Krishna', topic: 'Day 3: Clutch Modulation, Biting Point & 3-Point Turn', car: 'Tata Punch Dual-Ctrl #AP-04-CT-7072', attendance: 'none' }
];

export const CURRICULUM_DAYS = OFFICIAL_20_DAY_CURRICULUM.map(c => ({
  day: c.day,
  category: c.stageKey === 'basic' ? 'street' : (c.stageKey === 'circles' || c.stageKey === 'gears') ? 'highway' : 'test',
  title: c.objective,
  topic: `Day ${c.day}: ${c.objective}`,
  desc: c.skills.join(' · '),
  details: c.skills.join(' · '),
  skills: c.skills,
  stage: c.stageName,
  stageKey: c.stageKey,
  distance: `${c.route.distanceKm} km`,
  route: c.route
}));

class Store {
  constructor() {
    this.listeners = [];
    this.loadState();
    // Auto-sync with backend REST API and Supabase
    this.syncWithServerSlots();
    this.syncWithSupabase();
  }

  loadState() {
    try {
      const cached = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (cached) {
        const parsed = JSON.parse(cached);
        this.currentRole = parsed.currentRole || 'admin';
        this.currentTraineeId = parsed.currentTraineeId || 'SK- GS01';
        this.trainers = parsed.trainers || INITIAL_TRAINERS;
        this.trainees = parsed.trainees || INITIAL_TRAINEES;
        this.payments = parsed.payments || INITIAL_PAYMENTS;
        this.schedule = parsed.schedule || INITIAL_SCHEDULE;
        this.traineeTestDay = parsed.traineeTestDay || 14;
        this.feedbackSubmitted = parsed.feedbackSubmitted || false;
        // Purge legacy dummy hardcoded holidays so calendar follows normal year calendar
        this.holidays = (parsed.holidays && Array.isArray(parsed.holidays))
          ? parsed.holidays.filter(h => !h.id || !/^HOL-(0[1-9]|1[0-3])$/.test(h.id))
          : [];
        this.studentSchedules = parsed.studentSchedules || {};

        // Slot Management System state
        this.slots = parsed.slots || [];
        this.slotBookings = ensureSampleStudentBookings((parsed.slotBookings && parsed.slotBookings.length > 0) ? parsed.slotBookings : generateInitialSlotBookings());
        this.trainerAvailability = parsed.trainerAvailability || {};
        this.slotAuditLogs = parsed.slotAuditLogs || [];
        this.deletedSlots = parsed.deletedSlots || [];
        this.bookingLock = false;

        // Ensure all trainees have studentCode and isFirstLogin flag, migrating legacy IDs
        this.trainees.forEach((t, i) => {
          if (!t.studentCode || t.studentCode.startsWith('APX-') || /-G\d+$/i.test(t.studentCode)) {
            const initials = extractInitials(t.name);
            const pad = String(i + 1).padStart(2, '0');
            t.studentCode = `${initials}- GS${pad}`;
            if (!t.id || t.id.startsWith('APX-')) t.id = t.studentCode;
          }
          if (t.isFirstLogin === undefined) t.isFirstLogin = !t.password;
        });

        // Ensure newly defined initial trainees (e.g. Mulla Adil, Prasanna Lakshmi) exist
        INITIAL_TRAINEES.forEach(initT => {
          const found = this.trainees.find(t => t.id === initT.id || t.studentCode === initT.studentCode);
          if (!found) {
            this.trainees.push(initT);
          } else if (initT.status === 'Completed' && initT.id === 'MA- GS09') {
            // Ensure canonical Mulla Adil graduate status is preserved
            found.currentDay = 20;
            found.status = 'Completed';
            found.isActive = false;
            found.actualCompletionDate = '2026-10-28';
            found.registeredDate = '2026-10-02';
          }
        });

        // Deduplicate any duplicate Mulla Adil entries from legacy test registrations
        const mullaMatches = this.trainees.filter(t => t.name.toLowerCase().trim() === 'mulla adil');
        if (mullaMatches.length > 1) {
          this.trainees = this.trainees.filter(t => {
            if (t.name.toLowerCase().trim() === 'mulla adil') {
              return t.id === 'MA- GS09' || t.studentCode === 'MA- GS09';
            }
            return true;
          });
        }

        INITIAL_PAYMENTS.forEach(initP => {
          if (!this.payments.find(p => p.id === initP.id)) {
            this.payments.push(initP);
          }
        });

        // Ensure all trainers have trainerCode and isFirstLogin flag, migrating legacy IDs
        this.trainers.forEach((tr, i) => {
          if (!tr.trainerCode || tr.trainerCode.startsWith('TRN-') || /-T\d+$/i.test(tr.trainerCode)) {
            const initials = extractInitials(tr.name);
            const pad = String(i + 1).padStart(2, '0');
            tr.trainerCode = `${initials}-TG${pad}`;
          }
          if (tr.isFirstLogin === undefined) tr.isFirstLogin = !tr.password;
        });

        this._initStudentSchedules();
        this._ensureEnrollments();
        this.saveState();
        return;
      }
    } catch (e) {
      console.warn('Failed to load cached store state, using defaults', e);
    }

    this.currentRole = 'admin';
    this.currentTraineeId = 'SK- GS01';
    this.trainers = INITIAL_TRAINERS;
    this.trainees = INITIAL_TRAINEES;
    this.payments = INITIAL_PAYMENTS;
    this.schedule = INITIAL_SCHEDULE;
    this.traineeTestDay = 14;
    this.feedbackSubmitted = false;
    this.holidays = [];
    this.studentSchedules = {};

    // Slot Management System state defaults
    this.slots = [];
    this.slotBookings = generateInitialSlotBookings();
    this.trainerAvailability = {};
    this.slotAuditLogs = [];
    this.deletedSlots = [];
    this.bookingLock = false;

    // Ensure all trainees have studentCode and isFirstLogin
    this.trainees.forEach((t, i) => {
      if (!t.studentCode) {
        const initials = extractInitials(t.name);
        const pad = String(i + 1).padStart(2, '0');
        t.studentCode = `${initials}- GS${pad}`;
      }
      if (t.isFirstLogin === undefined) t.isFirstLogin = !t.password;
    });

    // Ensure all trainers have trainerCode and isFirstLogin
    this.trainers.forEach((tr, i) => {
      if (!tr.trainerCode) {
        const initials = extractInitials(tr.name);
        const pad = String(i + 1).padStart(2, '0');
        tr.trainerCode = `${initials}-TG${pad}`;
      }
      if (tr.isFirstLogin === undefined) tr.isFirstLogin = !tr.password;
    });

    this._initStudentSchedules();
    this._ensureEnrollments();
    this.saveState();
  }

  // =========================================================================
  // SEPARATION OF STUDENT ACCOUNT DATA & COURSE ENROLLMENT DATA (Requirement 10)
  // =========================================================================
  _ensureEnrollments() {
    this.trainees.forEach(t => {
      const isCompleted = t.currentDay >= 20 || t.status === 'Completed';
      if (t.isActive === undefined) {
        t.isActive = !isCompleted;
      }
      if (isCompleted) {
        t.status = 'Completed';
        t.isActive = false;
        if (!t.actualCompletionDate) {
          const sched = this.studentSchedules ? this.studentSchedules[t.id] : null;
          t.actualCompletionDate = sched?.completionDate || '2026-10-28';
        }
      }
      const sched = this.studentSchedules ? this.studentSchedules[t.id] : null;
      const expDate = sched?.completionDate || '2026-10-28';
      t.expectedCompletionDate = expDate;

      if (!t.enrollments || t.enrollments.length === 0) {
        t.enrollments = [
          {
            enrollmentId: `ENR-${t.id}-01`,
            courseType: t.package || '20-Day Comprehensive Licensing Package',
            package: t.package || '20-Day Comprehensive Licensing Package',
            startDate: sched?.startDate || t.registeredDate || '2026-10-02',
            expectedCompletionDate: expDate,
            actualCompletionDate: t.actualCompletionDate || null,
            currentDay: t.currentDay,
            totalDays: 20,
            status: isCompleted ? 'completed' : 'active',
            isActive: !isCompleted,
            assignedTrainerId: t.assignedTrainerId || 'TRN-1',
            finalAssessmentStatus: isCompleted ? 'Passed RTO Practical Driving Exam ✓' : 'In Progress',
            attendanceRate: t.attendanceRate || '100%'
          }
        ];
      } else {
        const enr = t.enrollments[0];
        enr.currentDay = t.currentDay;
        enr.status = isCompleted ? 'completed' : 'active';
        enr.isActive = !isCompleted;
        enr.expectedCompletionDate = expDate;
        if (isCompleted && !enr.actualCompletionDate) {
          enr.actualCompletionDate = t.actualCompletionDate;
        }
        if (isCompleted) {
          enr.finalAssessmentStatus = 'Passed RTO Practical Driving Exam ✓';
        }
      }
    });
  }

  _initStudentSchedules() {
    this.studentSchedules = this.studentSchedules || {};
    this.holidays = this.holidays || [];

    this.trainees.forEach(t => {
      if (!this.studentSchedules[t.id]) {
        // Manoj Kumar & Mulla Adil start on Oct 2, 2026
        const sDate = (t.id === 'MK- GS08' || t.id === 'MA- GS09') ? '2026-10-02' : (t.registeredDate || '2026-09-01');
        const trainer = this.getTrainerById(t.assignedTrainerId) || this.trainers[0];
        const isAuto = t.package && t.package.toLowerCase().includes('auto');

        const sched = generate20DaySchedule({
          studentId: t.id,
          studentName: t.name,
          startDate: sDate,
          instructorId: trainer.id,
          instructorName: trainer.name,
          transmission: isAuto ? 'automatic' : 'manual',
          holidays: this.holidays
        });

        // Mark completed sessions for past days up to t.currentDay - 1
        const completedDaysTarget = t.currentDay >= 20 ? 20 : Math.max(0, (t.currentDay || 1) - 1);

        for (let d = 1; d <= completedDaysTarget; d++) {
          const sess = sched.sessions.find(s => s.dayNumber === d);
          if (sess) {
            sess.status = 'completed';
            sess.completionTimestamp = `${sess.date}T09:30:00.000Z`;
            sess.instructorNotes = `Completed Day ${d} training on ${sess.objective}. Excellent vehicle control, mirror check routine, and traffic awareness.`;
          }
        }

        if (t.currentDay >= 20 || t.status === 'Completed') {
          sched.sessions.forEach(s => {
            s.status = 'completed';
            s.completionTimestamp = `${s.date}T09:30:00.000Z`;
            s.instructorNotes = `Day ${s.dayNumber} assessment verified: ${s.objective}. Complete competence demonstrated.`;
          });
          t.status = 'Completed';
          t.isActive = false;
          t.actualCompletionDate = t.actualCompletionDate || sched.completionDate || '2026-10-28';
        }

        this.studentSchedules[t.id] = sched;
      }
    });
  }

  saveState() {
    if (typeof localStorage === 'undefined') return;
    try {
      const payload = {
        currentRole: this.currentRole,
        currentTraineeId: this.currentTraineeId,
        trainers: this.trainers,
        trainees: this.trainees,
        payments: this.payments,
        schedule: this.schedule,
        traineeTestDay: this.traineeTestDay,
        feedbackSubmitted: this.feedbackSubmitted,
        slots: this.slots,
        slotBookings: this.slotBookings,
        trainerAvailability: this.trainerAvailability,
        slotAuditLogs: this.slotAuditLogs,
        deletedSlots: this.deletedSlots || [],
        holidays: this.holidays,
        studentSchedules: this.studentSchedules
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(event, payload) {
    this.saveState();
    this.listeners.forEach(fn => fn(event, payload));
  }

  get role() {
    return this.currentRole || 'admin';
  }

  set role(val) {
    this.currentRole = val;
  }

  setRole(role) {
    this.currentRole = role;
    this.notify('ROLE_CHANGED', role);
  }

  getRole() {
    return this.currentRole;
  }

  getCurrentTrainee() {
    return this.trainees.find(t => t.id === this.currentTraineeId || t.studentCode === this.currentTraineeId) || this.trainees[0];
  }

  setCurrentTrainee(idOrCode) {
    const found = this.findTrainee(idOrCode);
    if (found) {
      this.currentTraineeId = found.id;
      this.saveState();
      this.notify('CURRENT_TRAINEE_CHANGED', found);
      return found;
    }
    return null;
  }

  findTrainee(identifier) {
    if (!identifier) return null;
    const norm = normalizeCode(identifier);
    const clean = identifier.trim().toLowerCase();
    return this.trainees.find(t => 
      (t.id && normalizeCode(t.id) === norm) ||
      (t.studentCode && normalizeCode(t.studentCode) === norm) ||
      (t.email && t.email.toLowerCase() === clean) ||
      (t.phone && t.phone.replace(/\s+/g, '') === clean.replace(/\s+/g, ''))
    ) || null;
  }

  setTraineePassword(traineeId, password) {
    const trainee = this.findTrainee(traineeId);
    if (!trainee) return false;
    trainee.password = password;
    trainee.isFirstLogin = false;
    this.saveState();
    this.notify('TRAINEE_UPDATED', trainee);
    updateStudentInSupabase(trainee.id, { password, isFirstLogin: false }).catch(() => {});
    return true;
  }

  findTrainer(identifier) {
    if (!identifier) return null;
    const norm = normalizeCode(identifier);
    const clean = identifier.trim().toLowerCase();
    return this.trainers.find(tr => 
      (tr.id && normalizeCode(tr.id) === norm) ||
      (tr.trainerCode && normalizeCode(tr.trainerCode) === norm) ||
      (tr.email && tr.email.toLowerCase() === clean) ||
      (tr.phone && tr.phone.replace(/\s+/g, '') === clean.replace(/\s+/g, ''))
    ) || null;
  }

  setTrainerPassword(trainerId, password) {
    const trainer = this.findTrainer(trainerId);
    if (!trainer) return false;
    trainer.password = password;
    trainer.isFirstLogin = false;
    this.saveState();
    this.notify('TRAINER_UPDATED', trainer);
    return true;
  }

  getAdminToken() {
    return (typeof localStorage !== 'undefined' && localStorage.getItem('gds_admin_token')) || null;
  }

  setAdminToken(token) {
    if (typeof localStorage !== 'undefined') {
      if (token) {
        localStorage.setItem('gds_admin_token', token);
      } else {
        localStorage.removeItem('gds_admin_token');
      }
    }
  }

  isAdminAuthenticated() {
    if (typeof localStorage === 'undefined' && typeof sessionStorage === 'undefined') return false;
    const token = localStorage.getItem('gds_admin_token');
    const isAuth = sessionStorage.getItem('gds_admin_authenticated') === 'true';
    return Boolean(token && isAuth);
  }

  async loginAdmin(username, password) {
    try {
      const res = await api.post('/auth/login', { username, password });
      if (res && res.success && res.token) {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('gds_admin_token', res.token);
          localStorage.setItem('gds_role', 'admin');
        }
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('gds_admin_authenticated', 'true');
        }
        this.setRole('admin');
        return { success: true, user: res.user };
      }
      return { success: false, message: (res && res.message) || 'Invalid username or password.' };
    } catch (err) {
      return { 
        success: false, 
        message: err.message || (err.status === 401 ? 'Invalid username or password.' : 'Failed to authenticate. Please try again.') 
      };
    }
  }

  logoutAdmin() {
    try {
      api.post('/auth/logout', {}).catch(() => {});
    } catch (_) {}
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('gds_admin_token');
      if (localStorage.getItem('gds_role') === 'admin') {
        localStorage.removeItem('gds_role');
      }
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('gds_admin_authenticated');
    }
    this.role = null;
  }

  isTrainerAuthenticated() {
    if (this.isAdminAuthenticated()) return true;
    if (typeof localStorage === 'undefined' && typeof sessionStorage === 'undefined') return false;
    const token = localStorage.getItem('gds_trainer_token');
    const isAuth = sessionStorage.getItem('gds_trainer_authenticated') === 'true';
    return Boolean(token && isAuth);
  }

  isUserAuthenticated() {
    if (this.isAdminAuthenticated()) return true;
    if (typeof localStorage === 'undefined' && typeof sessionStorage === 'undefined') return false;
    const token = localStorage.getItem('gds_user_token');
    const isAuth = sessionStorage.getItem('gds_user_authenticated') === 'true';
    return Boolean(token && isAuth);
  }

  async loginUniversal(username, password) {
    try {
      const res = await api.post('/auth/login', { username, password });
      if (res && res.success && res.token) {
        const role = (res.role || 'user').toLowerCase();
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('gds_auth_token', res.token);
          localStorage.setItem('gds_role', role);
        }
        if (role === 'admin') {
          if (typeof localStorage !== 'undefined') localStorage.setItem('gds_admin_token', res.token);
          if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('gds_admin_authenticated', 'true');
          this.setRole('admin');
        } else if (role === 'trainer') {
          if (typeof localStorage !== 'undefined') localStorage.setItem('gds_trainer_token', res.token);
          if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('gds_trainer_authenticated', 'true');
          this.setRole('trainer');
        } else {
          // user / trainee
          if (typeof localStorage !== 'undefined') localStorage.setItem('gds_user_token', res.token);
          if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('gds_user_authenticated', 'true');
          if (res.user && res.user.targetId) {
            this.setCurrentTrainee(res.user.targetId);
          }
          this.setRole('trainee');
        }
        return { success: true, role, user: res.user };
      }
      return { success: false, message: (res && res.message) || 'Invalid username or password.' };
    } catch (err) {
      return {
        success: false,
        message: err.message || (err.status === 403 ? 'Account is inactive. Please contact the administrator.' : 'Invalid username or password.')
      };
    }
  }

  logoutAll() {
    this.logoutAdmin();
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('gds_user_token');
      localStorage.removeItem('gds_trainer_token');
      localStorage.removeItem('gds_auth_token');
      localStorage.removeItem('gds_role');
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('gds_user_authenticated');
      sessionStorage.removeItem('gds_trainer_authenticated');
      sessionStorage.removeItem('gds_admin_authenticated');
    }
    this.role = null;
  }

  // Account Management API calls
  async getAccounts() {
    try {
      const res = await api.get('/accounts');
      if (res && res.success) {
        return res.accounts || [];
      }
      return [];
    } catch (err) {
      console.warn('Failed to fetch accounts:', err);
      return [];
    }
  }

  async createAccount(accountData) {
    try {
      const res = await api.post('/accounts/create', accountData);
      return res;
    } catch (err) {
      return { success: false, message: err.message || 'Failed to create account.' };
    }
  }

  async updateAccount(accountId, updateData) {
    try {
      const res = await api.put(`/accounts/${accountId}`, updateData);
      return res;
    } catch (err) {
      return { success: false, message: err.message || 'Failed to update account.' };
    }
  }

  async updateAccountStatus(accountId, status) {
    try {
      const res = await api.put(`/accounts/${accountId}/status`, { status });
      return res;
    } catch (err) {
      return { success: false, message: err.message || 'Failed to update account status.' };
    }
  }

  async resetAccountPassword(accountId, newPassword, confirmPassword) {
    try {
      const res = await api.put(`/accounts/${accountId}/reset-password`, { newPassword, confirmPassword });
      return res;
    } catch (err) {
      return { success: false, message: err.message || 'Failed to reset password.' };
    }
  }

  async getAccountAuditLogs() {
    try {
      const res = await api.get('/accounts/audit-logs');
      if (res && res.success) {
        return res.logs || [];
      }
      return [];
    } catch (err) {
      console.warn('Failed to fetch audit logs:', err);
      return [];
    }
  }

  verifyAdminLogin(username, password) {
    const clean = (username || '').trim().toLowerCase();
    const validUsers = ['admin@gafoordriving.in', 'admin', 'admin-hq', 'gafooradmin'];
    if (!validUsers.includes(clean)) {
      return { success: false, message: 'Invalid username or password.' };
    }
    const validPasswords = ['admin', 'admin123', 'Gafoor@2026', 'admin@123'];
    if (validPasswords.includes(password)) {
      this.setAdminToken('gds_admin_jwt_secret_token_2026');
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('gds_admin_authenticated', 'true');
      }
      this.setRole('admin');
      return { success: true };
    }
    return { success: false, message: 'Invalid username or password.' };
  }

  async syncWithServerSlots(dateStr = null) {
    try {
      const endpoint = dateStr ? `/slots?date=${encodeURIComponent(dateStr)}` : '/slots';
      const res = await api.get(endpoint);
      if (res && res.success && Array.isArray(res.slots)) {
        let changed = false;
        res.slots.forEach(serverSlot => {
          const idx = this.slots.findIndex(s => s.id === serverSlot.id || (s.date === serverSlot.date && s.startTime === serverSlot.startTime));
          if (idx >= 0) {
            this.slots[idx] = { ...this.slots[idx], ...serverSlot };
            changed = true;
          } else {
            this.slots.push(serverSlot);
            changed = true;
          }
        });
        if (changed) {
          this.saveState();
          this.notify('SLOTS_SYNCED', this.slots);
        }
      }
    } catch (err) {
      console.warn('Sync with server slots skipped or offline:', err);
    }
  }

  async syncWithSupabase() {
    try {
      const res = await fetchStudentsFromSupabase();
      if (res && res.success && res.data && res.data.length > 0) {
        let changed = false;
        res.data.forEach(remoteStudent => {
          const exists = this.trainees.find(t => t.id === remoteStudent.id || t.studentCode === remoteStudent.studentCode);
          if (!exists) {
            this.trainees.unshift(remoteStudent);
            changed = true;
          } else {
            Object.assign(exists, remoteStudent);
            changed = true;
          }
        });
        if (changed) {
          this.saveState();
          this.notify('SUPABASE_SYNC_COMPLETE', this.trainees);
        }
      }
    } catch (e) {
      console.warn('Sync with Supabase failed or skipped:', e);
    }
  }

  assignTrainer(traineeId, newTrainerId) {
    const trainee = this.trainees.find(t => t.id === traineeId || t.studentCode === traineeId);
    const trainer = this.trainers.find(tr => tr.id === newTrainerId);
    if (!trainee || !trainer) return false;

    trainee.assignedTrainerId = newTrainerId;
    this.notify('TRAINER_ASSIGNED', { trainee, trainer });
    updateStudentInSupabase(trainee.id, { assignedTrainerId: newTrainerId }).catch(() => {});
    return true;
  }

  addTrainer(data) {
    const seq = getNextTrainerSequence(this.trainers);
    const trainerCode = generateTrainerCode(data.name, seq);
    const newId = `TRN-${this.trainers.length + 1}`;
    const newTrainer = {
      id: newId,
      trainerCode: trainerCode,
      name: data.name,
      role: data.role || 'Certified Motor Driving Instructor',
      specialty: data.specialty || 'RTO Track & City Traffic Navigation',
      rating: parseFloat(data.rating) || 4.90,
      activeStudents: 0,
      car: data.car || 'Maruti Suzuki Swift Dual-Ctrl #AP-04-ED-9001',
      phone: data.phone || '+91 98480 00112',
      email: `${data.name.toLowerCase().replace(/\s+/g, '.')}@gafoordriving.in`,
      isFirstLogin: true,
      password: null
    };
    this.trainers.push(newTrainer);
    this.notify('TRAINER_ADDED', newTrainer);
    return newTrainer;
  }

  updateTrainer(trainerId, updatedData) {
    const trainer = this.trainers.find(tr => tr.id === trainerId);
    if (!trainer) return false;

    Object.assign(trainer, updatedData);
    this.notify('TRAINER_UPDATED', trainer);
    return true;
  }

  addTrainee(data) {
    // Generate unique student code in requested format: e.g. "Mulla adil" -> "MA-G01"
    const seq = getNextStudentSequence(this.trainees);
    const code = generateStudentCode(data.name, seq);
    const initials = extractInitials(data.name);
    const newId = code;

    const trainee = {
      id: newId,
      studentCode: code,
      name: data.name,
      surname: data.surname || '',
      firstName: data.firstName || '',
      gender: data.gender || '',
      dob: data.dob || '',
      email: data.email || `${data.name.toLowerCase().replace(/\s+/g, '.')}@gafoordriving.in`,
      phone: data.phone || '+91 98480 00000',
      alternatePhone: data.alternatePhone || '',
      permitNumber: data.permitNumber || `AP004/LLR/2026/${Math.floor(1000 + Math.random() * 9000)}`,
      address: data.address || 'Pulivendula, Andhra Pradesh',
      emergencyContact: data.emergencyContact || 'Guardian / Family Contact',
      emergencyPhone: data.emergencyPhone || '+91 98480 11222',
      assignedTrainerId: data.assignedTrainerId || 'TRN-1',
      currentDay: 1,
      totalDays: 20,
      category: 'street',
      status: 'Active',
      isActive: true,
      registeredDate: data.registeredDate || new Date().toISOString().split('T')[0],
      package: data.package || 'With Licence (₹11,000)',
      avatar: initials,
      profilePhotoData: data.profilePhotoData || '',
      attendanceRate: '100%',
      paymentStatus: data.paymentStatus || 'pending',
      hasSmartphone: data.hasSmartphone || 'yes',
      isFirstLogin: true,
      password: null
    };

    this.trainees.unshift(trainee);

    // Create payment ledger entry in ₹ INR
    const invoiceId = `INV-${4010 + this.payments.length + 1}`;
    const amount = trainee.package.includes('Without Licence') ? 7000 : 11000;
    const paid = trainee.paymentStatus === 'paid' ? amount : (trainee.paymentStatus === 'partial' ? 3500 : 0);
    this.payments.unshift({
      id: invoiceId,
      traineeId: trainee.id,
      traineeName: trainee.name,
      package: trainee.package,
      amount: amount,
      paid: paid,
      balance: amount - paid,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: trainee.paymentStatus,
      method: 'UPI (PhonePe / Google Pay QR)'
    });

    // Generate 20-day progressive schedule for new trainee
    const sched = generate20DaySchedule({
      studentId: trainee.id,
      studentName: trainee.name,
      startDate: trainee.registeredDate || toDateStr(new Date()),
      instructorId: trainee.assignedTrainerId || 'TRN-1',
      instructorName: this.getTrainerById(trainee.assignedTrainerId)?.name || 'K. Srinivas Rao',
      transmission: trainee.package && trainee.package.toLowerCase().includes('auto') ? 'automatic' : 'manual',
      holidays: this.holidays
    });
    this.studentSchedules = this.studentSchedules || {};
    this.studentSchedules[trainee.id] = sched;

    this.notify('TRAINEE_ADDED', trainee);

    // Push directly to Supabase cloud database (non-blocking)
    saveStudentToSupabase(trainee).then(res => {
      if (res && res.success) {
        console.log('✓ Successfully synced student to Supabase cloud DB:', trainee.studentCode);
      }
    }).catch(err => {
      console.warn('Supabase sync skipped/deferred:', err);
    });

    return trainee;
  }

  updateTrainee(traineeId, updatedFields) {
    const trainee = this.trainees.find(t => t.id === traineeId || t.studentCode === traineeId);
    if (!trainee) return false;

    Object.assign(trainee, updatedFields);
    this.notify('TRAINEE_UPDATED', trainee);

    // Sync field update with Supabase
    updateStudentInSupabase(trainee.id, updatedFields).catch(err => {
      console.warn('Supabase update warning:', err);
    });

    return true;
  }

  recordPayment(invoiceId, paidAddition) {
    const invoice = this.payments.find(p => p.id === invoiceId);
    if (!invoice) return false;

    const addition = parseFloat(paidAddition) || 0;
    invoice.paid = Math.min(invoice.amount, invoice.paid + addition);
    invoice.balance = invoice.amount - invoice.paid;
    if (invoice.balance === 0) {
      invoice.status = 'paid';
    } else {
      invoice.status = 'partial';
    }

    const trainee = this.trainees.find(t => t.id === invoice.traineeId);
    if (trainee) {
      trainee.paymentStatus = invoice.status;
    }

    this.notify('PAYMENT_RECORDED', invoice);
    return true;
  }

  updateAttendance(slotId, status) {
    const slot = this.schedule.find(s => s.id === slotId);
    if (!slot) return false;

    slot.attendance = status;
    this.notify('ATTENDANCE_UPDATED', slot);
    return true;
  }

  setTraineeTestDay(dayNumber) {
    this.traineeTestDay = parseInt(dayNumber, 10);
    const trainee = this.getCurrentTrainee();
    if (trainee) {
      trainee.currentDay = this.traineeTestDay;
      if (this.traineeTestDay <= 10) {
        trainee.category = 'street';
      } else if (this.traineeTestDay < 20) {
        trainee.category = 'highway';
      } else {
        trainee.category = 'test';
      }

      const sched = this.getStudentSchedule(trainee.id);
      if (sched) {
        sched.sessions.forEach(s => {
          if (s.dayNumber < this.traineeTestDay) {
            s.status = 'completed';
            if (!s.completionTimestamp) s.completionTimestamp = `${s.date}T09:30:00.000Z`;
            if (!s.instructorNotes) s.instructorNotes = `Completed Day ${s.dayNumber} training on ${s.objective}. Good vehicle control.`;
          } else if (s.dayNumber === this.traineeTestDay) {
            s.status = 'today';
          } else {
            s.status = 'scheduled';
          }
        });
        if (this.traineeTestDay >= 20) {
          const s20 = sched.sessions.find(s => s.dayNumber === 20);
          if (s20) {
            s20.status = 'completed';
            if (!s20.completionTimestamp) s20.completionTimestamp = `${s20.date}T09:30:00.000Z`;
            if (!s20.instructorNotes) s20.instructorNotes = `Official Pulivendula RTO automated driving test passed with distinction. Form 5 certified.`;
          }
          trainee.status = 'Completed';
          trainee.isActive = false;
          trainee.actualCompletionDate = s20?.date || sched.completionDate || toDateStr(new Date());
          if (trainee.enrollments && trainee.enrollments[0]) {
            trainee.enrollments[0].status = 'completed';
            trainee.enrollments[0].isActive = false;
            trainee.enrollments[0].actualCompletionDate = trainee.actualCompletionDate;
            trainee.enrollments[0].currentDay = 20;
            trainee.enrollments[0].finalAssessmentStatus = 'Passed RTO Practical Driving Exam ✓';
          }
        }
      }
    }
    this.saveState();
    this.notify('TRAINEE_DAY_CHANGED', this.traineeTestDay);
  }

  submitFeedback(feedbackData) {
    this.feedbackSubmitted = true;
    this.notify('FEEDBACK_SUBMITTED', feedbackData);
  }

  // ==========================================================================
  // DRIVING SLOT MANAGEMENT & ATOMIC BOOKING ENGINE
  // Dynamic Capacity = Available Trainers × 2 (Max 2 learners per trainer)
  // Only 6 default bookable slots per day (No gaps displayed)
  // ==========================================================================

  getTodayDateStr() {
    return getLocalTodayDate();
  }

  getAvailableTrainersForSlot(dateStr, startTime) {
    return this.trainers.filter(tr => {
      // Check full day unavailability
      if (this.trainerAvailability[dateStr] && this.trainerAvailability[dateStr][tr.id] === false) {
        return false;
      }
      // Check slot specific unavailability
      const slotKey = `${tr.id}_${startTime}`;
      if (this.trainerAvailability[dateStr] && this.trainerAvailability[dateStr][slotKey] === false) {
        return false;
      }
      return true;
    });
  }

  getSlotsForDate(dateStr) {
    if (!dateStr) dateStr = this.getTodayDateStr();

    this.deletedSlots = this.deletedSlots || [];

    // 1. Ensure default 6 bookable slots exist in this.slots for this date (unless deleted by Admin)
    DEFAULT_BOOKABLE_SLOTS.forEach(defSlot => {
      const slotId = `SLOT-${dateStr}-${defSlot.idSuffix}`;
      if (this.deletedSlots.includes(slotId) || this.deletedSlots.includes(`${dateStr}_${defSlot.startTime}`)) {
        return;
      }
      const exists = this.slots.find(s => s.id === slotId || (s.date === dateStr && s.startTime === defSlot.startTime));
      if (!exists) {
        const isCompletedSampleSlot = (dateStr === getOffsetDateStr(0) && defSlot.idSuffix === '0800-0900');
        const newSlot = {
          id: slotId,
          date: dateStr,
          startTime: defSlot.startTime,
          endTime: defSlot.endTime,
          timeDisplay: defSlot.timeDisplay,
          status: isCompletedSampleSlot ? 'Completed' : 'Available',
          isDefault: true,
          courseId: 'ALL',
          createdBy: 'SYSTEM'
        };
        this.slots.push(newSlot);
        saveSlotToSupabase(newSlot).catch(() => {});
      } else if (dateStr === getOffsetDateStr(0) && defSlot.idSuffix === '0800-0900') {
        exists.status = 'Completed';
      }
    });

    // 2. Fetch all slots for this date (defaults + any custom created by Admin)
    const dateSlots = this.slots.filter(s => s.date === dateStr);

    // Sort chronologically using robust time parser
    dateSlots.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    // 3. Enhance with dynamic capacity, confirmed bookings, and trainer allocations
    return dateSlots.map(slot => {
      const availableTrainers = this.getAvailableTrainersForSlot(dateStr, slot.startTime);

      // Dynamic Capacity: if slot has custom capacity set, use it; otherwise use availableTrainers * 2
      const totalCapacity = (typeof slot.capacity === 'number' && slot.capacity > 0)
        ? slot.capacity
        : (availableTrainers.length * 2);

      // Active bookings for this slot (both confirmed upcoming and completed sessions)
      const confirmedBookings = this.slotBookings.filter(b => 
        b.date === dateStr && 
        (b.slotId === slot.id || b.startTime === slot.startTime) && 
        (b.status === 'CONFIRMED' || b.status === 'COMPLETED')
      );

      const bookedCount = confirmedBookings.length;
      const availableSeats = Math.max(0, totalCapacity - bookedCount);

      // Determine dynamic status: Available, Full, Maintenance, Closed, Cancelled, Almost Full, Completed
      let calculatedStatus = slot.status || 'Available';
      const rawStatus = (slot.status || '').toLowerCase();
      const todayStr = getOffsetDateStr(0);
      const isSampleTodayCompleted = (dateStr === todayStr && (slot.startTime === '08:00 AM' || slot.id.includes('0800-0900')));
      const allBookingsCompleted = confirmedBookings.length > 0 && confirmedBookings.every(b => b.status === 'COMPLETED');

      if (rawStatus === 'completed' || isSampleTodayCompleted || allBookingsCompleted) {
        calculatedStatus = 'Completed';
      } else if (rawStatus === 'maintenance') {
        calculatedStatus = 'Maintenance';
      } else if (rawStatus === 'closed' || rawStatus === 'inactive') {
        calculatedStatus = 'Closed';
      } else if (rawStatus === 'cancelled') {
        calculatedStatus = 'Cancelled';
      } else if (rawStatus === 'full' || totalCapacity === 0 || availableSeats === 0) {
        calculatedStatus = 'Full';
      } else if (availableSeats === 1 && totalCapacity > 1) {
        calculatedStatus = 'Almost Full';
      } else {
        calculatedStatus = 'Available';
      }

      // Detailed breakdown per instructor
      const trainerAllocations = availableTrainers.map(tr => {
        const trainerBookings = confirmedBookings.filter(b => b.trainerId === tr.id);
        const trainerVehicle = slot.vehicleOverride || tr.car;
        return {
          trainer: tr,
          trainerId: tr.id,
          trainerName: tr.name,
          vehicle: trainerVehicle,
          bookings: trainerBookings,
          capacity: 2,
          booked: trainerBookings.length,
          availableSeats: Math.max(0, 2 - trainerBookings.length),
          status: trainerBookings.length >= 2 ? 'FULL' : 'AVAILABLE'
        };
      });

      return {
        ...slot,
        availableTrainersCount: availableTrainers.length,
        totalCapacity,
        bookedCount,
        availableSeats,
        calculatedStatus,
        bookings: confirmedBookings,
        trainerAllocations
      };
    });
  }

  /**
   * Atomic Driving Slot Booking
   * Concurrency-safe, enforces:
   * 1. Trainee eligibility
   * 2. No duplicate bookings
   * 3. No overlapping sessions
   * 4. Capacity = Available Trainers × 2
   * 5. Max 2 learners per trainer
   * 6. Vehicle conflict check
   */
  async bookSlot({
    date,
    startTime,
    endTime,
    timeDisplay,
    traineeId,
    preferredTrainerId = null,
    customVehicle = null,
    bookedBy = null
  }) {
    // 0. Mutex check
    if (this.bookingLock) {
      return { 
        success: false, 
        message: 'Another slot booking transaction is being processed. Please try again in a moment.' 
      };
    }
    this.bookingLock = true;

    try {
      if (!date) date = this.getTodayDateStr();

      // 1. Learner Validation
      const trainee = this.findTrainee(traineeId);
      if (!trainee) {
        return { success: false, message: 'Student record not found. Please verify your Student ID.' };
      }

      // Security check: Only Admin can manually assign other students
      if (this.role !== 'admin' && this.currentTraineeId && trainee.id !== this.currentTraineeId) {
        return { 
          success: false, 
          status: 403, 
          message: 'Forbidden (HTTP 403): Only ADMIN users can manually assign slots to other students.' 
        };
      }

      // Check slot status: Maintenance, Closed, Cancelled, Completed
      const existingSlot = this.slots.find(s => s.date === date && s.startTime === startTime);
      if (existingSlot) {
        const rawStatus = (existingSlot.status || '').toLowerCase();
        if (rawStatus === 'maintenance') {
          return { success: false, message: 'This driving slot is currently under Maintenance and unavailable for reservations.' };
        }
        if (rawStatus === 'closed' || rawStatus === 'inactive') {
          return { success: false, message: 'This driving slot is currently Closed for reservations.' };
        }
        if (rawStatus === 'cancelled') {
          return { success: false, message: 'This driving slot has been Cancelled.' };
        }
        if (rawStatus === 'completed') {
          return { success: false, message: 'This driving slot has already been completed and is closed for bookings.' };
        }
      }

      // 2. Duplicate Booking Check
      const existingSameSlot = this.slotBookings.find(b => 
        b.traineeId === trainee.id && 
        b.date === date && 
        b.startTime === startTime && 
        (b.status === 'CONFIRMED' || b.status === 'COMPLETED')
      );
      if (existingSameSlot) {
        return { 
          success: false, 
          message: existingSameSlot.status === 'COMPLETED'
            ? 'This driving session has already been completed.'
            : 'You already have a driving session booked for this time slot.' 
        };
      }

      // 3. Overlapping Booking Check for Learner
      const existingSameDay = this.slotBookings.filter(b => 
        b.traineeId === trainee.id && 
        b.date === date && 
        (b.status === 'CONFIRMED' || b.status === 'COMPLETED')
      );
      const hasOverlap = existingSameDay.some(b => 
        doIntervalsOverlap(startTime, endTime, b.startTime, b.endTime)
      );
      if (hasOverlap) {
        return { 
          success: false, 
          message: 'You already have a driving session during this time.' 
        };
      }

      // 4. Calculate Dynamic Slot Capacity (custom slot capacity takes precedence if set)
      const availableTrainers = this.getAvailableTrainersForSlot(date, startTime);
      if (availableTrainers.length === 0) {
        return { 
          success: false, 
          message: 'No instructors are available for this time slot.' 
        };
      }

      const totalCapacity = (existingSlot && typeof existingSlot.capacity === 'number' && existingSlot.capacity > 0)
        ? existingSlot.capacity
        : (availableTrainers.length * 2);

      const currentBookings = this.slotBookings.filter(b => 
        b.date === date && 
        b.startTime === startTime && 
        (b.status === 'CONFIRMED' || b.status === 'COMPLETED')
      );

      if (currentBookings.length >= totalCapacity) {
        return { 
          success: false, 
          message: 'Sorry, this slot is now full. Please select another available slot.' 
        };
      }

      // 5. Deterministic Trainer Allocation (Max 2 learners per trainer)
      let chosenTrainer = null;

      if (preferredTrainerId) {
        const pref = availableTrainers.find(t => t.id === preferredTrainerId);
        if (pref) {
          const prefCount = currentBookings.filter(b => b.trainerId === pref.id).length;
          const prefOverlap = this.slotBookings.some(b =>
            b.trainerId === pref.id &&
            b.date === date &&
            b.status === 'CONFIRMED' &&
            b.startTime !== startTime &&
            doIntervalsOverlap(startTime, endTime, b.startTime, b.endTime)
          );
          if (prefCount < 2 && !prefOverlap) {
            chosenTrainer = pref;
          }
        }
      }

      if (!chosenTrainer) {
        // Pick available trainer who has fewer than 2 learners, prioritizing the one with fewer learners
        const sortedTrainers = [...availableTrainers].sort((a, b) => {
          const countA = currentBookings.filter(bk => bk.trainerId === a.id).length;
          const countB = currentBookings.filter(bk => bk.trainerId === b.id).length;
          return countA - countB;
        });

        for (const tr of sortedTrainers) {
          // Check if trainer is already booked for overlapping time outside this exact slot
          const trainerConf = this.slotBookings.some(b =>
            b.trainerId === tr.id &&
            b.date === date &&
            b.status === 'CONFIRMED' &&
            b.startTime !== startTime &&
            doIntervalsOverlap(startTime, endTime, b.startTime, b.endTime)
          );
          if (trainerConf) continue;

          const count = currentBookings.filter(bk => bk.trainerId === tr.id).length;
          if (count < 2) {
            chosenTrainer = tr;
            break;
          }
        }
      }

      if (!chosenTrainer) {
        return { 
          success: false, 
          message: 'All available instructors for this slot have reached their maximum capacity of 2 learners.' 
        };
      }

      // 6. Vehicle Conflict Prevention
      const vehicle = customVehicle || chosenTrainer.car;
      // Ensure vehicle is not assigned simultaneously to an overlapping session under a DIFFERENT trainer
      const vehicleConflict = this.slotBookings.find(b => 
        b.vehicle === vehicle && 
        b.date === date &&
        b.trainerId !== chosenTrainer.id && 
        b.status === 'CONFIRMED' &&
        doIntervalsOverlap(startTime, endTime, b.startTime, b.endTime)
      );
      if (vehicleConflict) {
        return { 
          success: false, 
          message: `Vehicle conflict detected: ${vehicle} is already in use by instructor ${vehicleConflict.trainerName} during this time.` 
        };
      }

      // 7. Create Atomic Booking Record
      const bookingId = `SB-${date.replace(/-/g, '')}-${startTime.replace(/[^0-9]/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const slotId = `SLOT-${date}-${startTime.replace(/[^0-9]/g, '')}`;

      const newBooking = {
        id: bookingId,
        slotId: slotId,
        date: date,
        startTime: startTime,
        endTime: endTime || '',
        timeDisplay: timeDisplay || `${startTime} – ${endTime || ''}`,
        traineeId: trainee.id,
        traineeName: trainee.name,
        trainerId: chosenTrainer.id,
        trainerName: chosenTrainer.name,
        vehicle: vehicle,
        course: trainee.package || '20-Day Practical Driving Course',
        status: 'CONFIRMED',
        bookedAt: new Date().toISOString(),
        cancelledAt: null,
        notes: ''
      };

      this.slotBookings.push(newBooking);

      // 8. Add Audit History Entry
      this.slotAuditLogs.unshift({
        id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        slotId: slotId,
        bookingId: bookingId,
        action: 'BOOKING_CREATED',
        performedBy: bookedBy || `${trainee.name} (${trainee.studentCode || trainee.id})`,
        details: `${trainee.name} booked seat under Instructor ${chosenTrainer.name} · Car: ${vehicle}`,
        timestamp: new Date().toISOString()
      });

      // 9. Sync with Supabase asynchronously
      bookSlotInSupabase({
        bookingId,
        slotId,
        date,
        startTime,
        endTime,
        traineeId: trainee.id,
        traineeName: trainee.name,
        course: newBooking.course,
        bookedBy: bookedBy || trainee.name,
        preferredTrainerId: chosenTrainer.id
      }).catch(err => {
        console.warn('Supabase booking sync skipped/offline:', err);
      });

      this.saveState();
      this.notify('SLOT_BOOKED', newBooking);

      return {
        success: true,
        booking: newBooking,
        message: '✓ Driving slot booked successfully.'
      };
    } finally {
      this.bookingLock = false;
    }
  }

  /**
   * Cancel a Slot Booking
   * Frees instructor capacity dynamically for other learners.
   */
  cancelSlotBooking(bookingId, cancelledBy = 'Learner', reason = '') {
    const booking = this.slotBookings.find(b => b.id === bookingId);
    if (!booking) {
      return { success: false, message: 'Booking record not found.' };
    }

    // Security check: Students can only cancel their own reservations; Admin can cancel any booking
    if (this.role === 'trainee' && this.currentTraineeId && booking.traineeId !== this.currentTraineeId) {
      return { 
        success: false, 
        status: 403, 
        message: 'Forbidden (HTTP 403): You are not authorized to cancel another student\'s reservation.' 
      };
    }

    if (booking.status === 'CANCELLED') {
      return { success: false, message: 'This booking has already been cancelled.' };
    }

    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date().toISOString();
    if (reason) {
      booking.notes = (booking.notes ? booking.notes + ' | ' : '') + `Cancelled: ${reason}`;
    }

    // Add Audit Log
    this.slotAuditLogs.unshift({
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      slotId: booking.slotId,
      bookingId: booking.id,
      action: 'BOOKING_CANCELLED',
      performedBy: cancelledBy,
      details: `Booking for ${booking.traineeName} was cancelled by ${cancelledBy}. ${reason ? 'Reason: ' + reason : ''}`,
      timestamp: new Date().toISOString()
    });

    // Sync with Supabase
    cancelSlotBookingInSupabase(bookingId, cancelledBy, reason).catch(() => {});

    this.saveState();
    this.notify('SLOT_CANCELLED', { bookingId, booking });

    return { 
      success: true, 
      message: 'Booking cancelled successfully. Instructor capacity is now freed up.' 
    };
  }

  /**
   * Admin Move a Learner from one slot to another
   */
  async moveSlotBooking(bookingId, arg2, arg3, arg4, arg5, arg6) {
    if (this.role !== 'admin') {
      return { 
        success: false, 
        status: 403, 
        message: 'Forbidden (HTTP 403): Only ADMIN users can move student bookings between slots.' 
      };
    }

    const oldBooking = this.slotBookings.find(b => b.id === bookingId);
    if (!oldBooking) return { success: false, message: 'Original booking not found.' };

    let newDate = null;
    let newStartTime = null;
    let newEndTime = null;
    let newTimeDisplay = null;
    let preferredTrainerId = null;

    if (typeof arg2 === 'string' && (arg2.startsWith('SLOT-') || arg2.includes('-'))) {
      if (arg2.includes('202') && arg2.split('-').length === 3 && !arg2.startsWith('SLOT-')) {
        // arg2 is a date like '2026-09-30'
        newDate = arg2;
        newStartTime = arg3;
        newEndTime = arg4;
        newTimeDisplay = arg5;
        preferredTrainerId = arg6;
      } else {
        // arg2 is slotId like 'SLOT-2026-09-30-0800'
        newDate = arg3;
        newStartTime = arg4;
        newEndTime = arg5;
        newTimeDisplay = arg6;
      }
    } else {
      newDate = arg2;
      newStartTime = arg3;
      newEndTime = arg4;
      newTimeDisplay = arg5;
      preferredTrainerId = arg6;
    }

    if (!newDate) newDate = oldBooking.date;
    if (!newStartTime) newStartTime = oldBooking.startTime;
    if (!newEndTime) newEndTime = oldBooking.endTime;

    const traineeId = oldBooking.traineeId;

    // Temporarily mark old booking as PENDING_MOVE to prevent self-overlap false positives
    const originalStatus = oldBooking.status;
    oldBooking.status = 'PENDING_MOVE';

    // Attempt to book the new slot
    const bookRes = await this.bookSlot({
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      timeDisplay: newTimeDisplay,
      traineeId: traineeId,
      traineeName: oldBooking.traineeName,
      preferredTrainerId: preferredTrainerId,
      bookedBy: 'Admin (Slot Reassignment)'
    });

    if (!bookRes.success) {
      oldBooking.status = originalStatus; // restore status on failure
      return bookRes; // Returns failure reason (e.g. slot full, conflict)
    }

    // If new slot booked successfully, mark previous one as CANCELLED
    oldBooking.status = 'CANCELLED';
    oldBooking.cancelledAt = new Date().toISOString();
    oldBooking.notes = `Moved to ${newDate} (${newStartTime}) by Admin`;

    this.slotAuditLogs.unshift({
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      slotId: oldBooking.slotId,
      bookingId: oldBooking.id,
      action: 'LEARNER_MOVED',
      performedBy: 'Admin Office',
      details: `${oldBooking.traineeName} moved from ${oldBooking.date} ${oldBooking.startTime} to ${newDate} ${newStartTime}`,
      timestamp: new Date().toISOString()
    });

    cancelSlotBookingInSupabase(bookingId, 'Admin', `Moved to ${newDate} ${newStartTime}`).catch(() => {});

    this.saveState();
    this.notify('SLOT_MOVED', { oldBooking, newBooking: bookRes.booking });

    return {
      success: true,
      message: `Learner successfully moved to ${newDate} (${newStartTime}).`,
      booking: bookRes.booking
    };
  }

  /**
   * Admin Set Trainer Duty / Availability for a Date or Slot
   * Automatically updates dynamic slot capacity (Available Trainers × 2).
   */
  setTrainerSlotAvailability(trainerId, dateStr, slotTime = null, isAvailable = true, reason = '') {
    if (this.role !== 'admin') {
      return { 
        success: false, 
        status: 403, 
        message: 'Forbidden (HTTP 403): Only ADMIN users can set instructor availability or duty.' 
      };
    }

    if (typeof slotTime === 'boolean') {
      isAvailable = slotTime;
      slotTime = null;
    }

    if (!this.trainerAvailability[dateStr]) {
      this.trainerAvailability[dateStr] = {};
    }

    if (slotTime) {
      const key = `${trainerId}_${slotTime}`;
      this.trainerAvailability[dateStr][key] = isAvailable;
      updateTrainerAvailabilityInSupabase(trainerId, dateStr, slotTime, isAvailable, reason).catch(() => {});
    } else {
      this.trainerAvailability[dateStr][trainerId] = isAvailable;
      updateTrainerAvailabilityInSupabase(trainerId, dateStr, 'ALL_DAY', isAvailable, reason).catch(() => {});
    }

    const trainer = this.getTrainerById(trainerId);
    this.slotAuditLogs.unshift({
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      slotId: null,
      bookingId: null,
      action: 'TRAINER_AVAILABILITY_CHANGED',
      performedBy: 'Admin Office',
      details: `Instructor ${trainer ? trainer.name : trainerId} marked as ${isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'} on ${dateStr} ${slotTime ? `(${slotTime})` : '(Full Day)'}. ${reason ? 'Reason: ' + reason : ''}`,
      timestamp: new Date().toISOString()
    });

    this.saveState();
    this.notify('TRAINER_AVAILABILITY_CHANGED', { trainerId, dateStr, slotTime, isAvailable });
    return true;
  }

  /**
   * Admin Create Driving Slot (Standard or Custom)
   * Admin can specify name/title, date, start time, end time, max capacity, instructor, status, location, notes.
   */
  adminCreateCustomSlot(payload) {
    if (this.role !== 'admin') {
      return { 
        success: false, 
        status: 403, 
        message: 'Forbidden (HTTP 403): Only ADMIN users are authorized to create driving slots.' 
      };
    }

    const {
      id = null,
      name = '',
      title = '',
      date,
      startTime,
      endTime,
      timeDisplay = null,
      capacity = null,
      status = 'Available',
      trainerId = null,
      assignedTrainerId = null,
      courseId = 'ALL',
      course = null,
      location = '',
      branch = '',
      description = '',
      notes = '',
      vehicleOverride = null
    } = payload || {};

    if (!date || !startTime || !endTime) {
      return { success: false, message: 'Date, start time, and end time are required.' };
    }

    const slotName = (name || title || '').trim();
    const slotLocation = (location || branch || '').trim();
    const slotDesc = (description || notes || '').trim();
    const tid = trainerId || assignedTrainerId || null;
    const cid = courseId || course || 'ALL';

    const formattedStart = formatTime24to12(startTime);
    const formattedEnd = formatTime24to12(endTime);
    const cleanDisplay = timeDisplay || `${formattedStart} – ${formattedEnd}`;

    const slotId = id || `SLOT-${date}-${formattedStart.replace(/[^0-9]/g, '')}-${formattedEnd.replace(/[^0-9]/g, '')}${tid ? '-' + tid.replace(/[^a-zA-Z0-9]/g, '') : ''}`;
    const existingIdx = this.slots.findIndex(s => s.id === slotId || (s.date === date && (s.startTime === formattedStart || s.startTime === startTime) && (!tid || !s.assignedTrainerId || s.assignedTrainerId === tid)));

    const trainerObj = tid ? this.trainers.find(t => t.id === tid) : null;
    const resolvedVehicle = payload.vehicle || vehicleOverride || (trainerObj ? trainerObj.car : null);
    const resolvedTrainerName = payload.trainerName || (trainerObj ? trainerObj.name : null);

    const newSlot = {
      id: slotId,
      name: slotName,
      date,
      startTime: formattedStart,
      endTime: formattedEnd,
      timeDisplay: cleanDisplay,
      status: status || 'Available',
      capacity: (capacity !== null && capacity !== undefined && capacity !== '') ? parseInt(capacity, 10) : null,
      assignedTrainerId: tid,
      trainerId: tid,
      trainerName: resolvedTrainerName,
      location: slotLocation,
      description: slotDesc,
      isDefault: false,
      courseId: cid,
      course: payload.course || cid,
      vehicle: resolvedVehicle,
      vehicleOverride: resolvedVehicle,
      createdBy: 'ADMIN'
    };

    if (existingIdx >= 0) {
      this.slots[existingIdx] = { ...this.slots[existingIdx], ...newSlot };
    } else {
      this.slots.push(newSlot);
    }

    saveSlotToSupabase(newSlot).catch(() => {});

    this.slotAuditLogs.unshift({
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      slotId: slotId,
      bookingId: null,
      action: 'SLOT_CREATED',
      performedBy: 'Admin Office',
      details: `Admin created driving slot for ${date} (${newSlot.timeDisplay}) - ${newSlot.name ? newSlot.name + ' · ' : ''}Status: ${newSlot.status}${newSlot.capacity ? ', Capacity: ' + newSlot.capacity : ''}`,
      timestamp: new Date().toISOString()
    });

    this.saveState();
    this.notify('SLOT_CREATED', newSlot);

    return { success: true, slot: newSlot, message: 'Driving slot created successfully.' };
  }

  /**
   * Admin Edit Slot
   * Admin can change date, start time, end time, capacity, instructor, status, name, location, and description.
   */
  adminUpdateSlot(slotId, updateData) {
    if (this.role !== 'admin') {
      return { 
        success: false, 
        status: 403, 
        message: 'Forbidden (HTTP 403): Only ADMIN users are authorized to update driving slots.' 
      };
    }

    const { date, startTime, endTime, capacity, status, trainerId, assignedTrainerId, vehicleOverride, course, name, title, location, description } = updateData || {};

    const slot = this.slots.find(s => s.id === slotId);
    if (!slot) return { success: false, message: 'Slot not found.' };

    if (date) slot.date = date;
    if (startTime) slot.startTime = formatTime24to12(startTime);
    if (endTime) slot.endTime = formatTime24to12(endTime);
    if (startTime && endTime) slot.timeDisplay = `${slot.startTime} – ${slot.endTime}`;
    if (capacity !== undefined) slot.capacity = (capacity !== null && capacity !== '') ? parseInt(capacity, 10) : null;
    if (status) slot.status = status;
    if (name !== undefined || title !== undefined) slot.name = (name || title || '').trim();
    if (location !== undefined) slot.location = (location || '').trim();
    if (description !== undefined) slot.description = (description || '').trim();
    if (trainerId !== undefined || assignedTrainerId !== undefined) slot.assignedTrainerId = trainerId || assignedTrainerId || null;
    if (vehicleOverride !== undefined) slot.vehicleOverride = vehicleOverride;
    if (course) slot.course = course;

    // If status is set to Cancelled or Closed, cancel all active confirmed bookings in it
    if (status === 'Cancelled' || status === 'CANCELLED' || status === 'Closed') {
      const activeBookings = this.slotBookings.filter(b => 
        (b.slotId === slotId || (b.date === slot.date && b.startTime === slot.startTime)) && 
        b.status === 'CONFIRMED'
      );
      activeBookings.forEach(b => {
        b.status = 'CANCELLED';
        b.cancelledAt = new Date().toISOString();
        b.notes = `Slot was marked as ${status} by Administration`;
      });
    }

    this.slotAuditLogs.unshift({
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      slotId: slotId,
      bookingId: null,
      action: `SLOT_UPDATED`,
      performedBy: 'Admin Office',
      details: `Slot ${slot.timeDisplay || slotId} updated by Admin. Status: ${slot.status}${slot.capacity ? ', Capacity: ' + slot.capacity : ''}${slot.assignedTrainerId ? ', Trainer: ' + slot.assignedTrainerId : ''}`,
      timestamp: new Date().toISOString()
    });

    saveSlotToSupabase(slot).catch(() => {});
    api.put(`/slots/${encodeURIComponent(slotId)}`, slot).catch(err => {
      console.warn('Backend slot update sync:', err);
    });

    this.saveState();
    this.notify('SLOT_UPDATED', slot);

    return { success: true, slot, message: `Slot updated successfully.` };
  }

  /**
   * Admin Remove / Delete Slot
   * Admin can permanently delete a slot.
   * If slot has students assigned/booked, shows warning and requires explicit confirmation.
   */
  adminDeleteSlot(slotId, forceConfirm = false) {
    if (this.role !== 'admin') {
      return { 
        success: false, 
        status: 403, 
        message: 'Forbidden (HTTP 403): Only ADMIN users are authorized to delete driving slots.' 
      };
    }

    let idx = this.slots.findIndex(s => s.id === slotId);
    if (idx === -1) {
      // Materialize slots for date if not yet cached
      this.getSlotsForDate(this.getTodayDateStr());
      idx = this.slots.findIndex(s => s.id === slotId);
    }
    if (idx === -1) return { success: false, message: 'Slot not found.' };

    const slot = this.slots[idx];
    const activeBookings = this.slotBookings.filter(b => 
      (b.slotId === slotId || (b.date === slot.date && b.startTime === slot.startTime)) && 
      b.status === 'CONFIRMED'
    );

    if (activeBookings.length > 0 && !forceConfirm) {
      return { 
        success: false, 
        needsConfirmation: true, 
        bookedCount: activeBookings.length, 
        message: `This slot has ${activeBookings.length} student${activeBookings.length > 1 ? 's' : ''} assigned. Deleting this slot will affect their bookings.` 
      };
    }

    // Cancel affected bookings with notice
    if (activeBookings.length > 0) {
      activeBookings.forEach(b => {
        b.status = 'CANCELLED';
        b.cancelledAt = new Date().toISOString();
        b.notes = 'Slot was deleted by Administration';
      });
    }

    // Permanently record deletion so default slots don't reappear
    this.deletedSlots = this.deletedSlots || [];
    this.deletedSlots.push(slot.id);
    if (slot.date && slot.startTime) {
      this.deletedSlots.push(`${slot.date}_${slot.startTime}`);
    }

    // Permanently remove slot
    this.slots.splice(idx, 1);

    api.delete(`/slots/${encodeURIComponent(slot.id)}`).catch(err => {
      console.warn('Backend slot delete sync:', err);
    });

    this.slotAuditLogs.unshift({
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      slotId: slot.id,
      bookingId: null,
      action: 'SLOT_DELETED',
      performedBy: 'Admin Office',
      details: `Admin deleted driving slot for ${slot.date} (${slot.timeDisplay || slot.startTime}). Affected bookings: ${activeBookings.length}`,
      timestamp: new Date().toISOString()
    });

    this.saveState();
    this.notify('SLOT_DELETED', { slotId, affectedCount: activeBookings.length });

    return { 
      success: true, 
      message: `Driving slot permanently deleted. ${activeBookings.length > 0 ? `${activeBookings.length} student booking(s) cancelled.` : ''}`,
      affectedCount: activeBookings.length
    };
  }

  /**
   * Get confirmed bookings for a specific Learner
   */
  getLearnerConfirmedSlots(traineeId) {
    const norm = traineeId ? traineeId.trim() : '';
    return this.slotBookings
      .filter(b => (b.traineeId === norm || b.traineeId === this.currentTraineeId) && b.status === 'CONFIRMED')
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  }

  /**
   * Get all bookings (confirmed, completed, cancelled) for a specific Learner
   */
  getLearnerAllBookings(traineeId) {
    const norm = traineeId ? traineeId.trim() : '';
    return this.slotBookings
      .filter(b => (b.traineeId === norm || b.traineeId === this.currentTraineeId))
      .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));
  }

  /**
   * Get completed driving rides for a specific Learner
   */
  getLearnerCompletedRides(traineeId) {
    const norm = traineeId ? traineeId.trim() : '';
    return this.slotBookings
      .filter(b => (b.traineeId === norm || b.traineeId === this.currentTraineeId) && (b.status === 'COMPLETED' || b.attendance === 'present'))
      .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));
  }

  /**
   * Get assigned sessions for a specific Instructor
   */
  getTrainerAssignedSlots(trainerId, dateStr) {
    if (!dateStr) dateStr = this.getTodayDateStr();
    const trainerBookings = this.slotBookings.filter(b => 
      b.trainerId === trainerId && 
      b.date === dateStr && 
      b.status === 'CONFIRMED'
    );

    // Group by slot
    const groups = {};
    trainerBookings.forEach(bk => {
      const key = bk.startTime;
      if (!groups[key]) {
        groups[key] = {
          startTime: bk.startTime,
          endTime: bk.endTime,
          timeDisplay: bk.timeDisplay,
          vehicle: bk.vehicle,
          learners: []
        };
      }
      groups[key].learners.push(bk);
    });

    return Object.values(groups);
  }

  getSlotAuditLogs(slotId = null) {
    if (!slotId) return this.slotAuditLogs;
    return this.slotAuditLogs.filter(l => l.slotId === slotId);
  }

  getTrainerById(id) {
    return this.trainers.find(tr => tr.id === id);
  }

  getCurriculum() {
    return CURRICULUM_DAYS;
  }

  // ========================================================
  // CALENDAR-BASED 20-DAY SCHEDULE & HOLIDAYS MANAGEMENT
  // ========================================================

  getHolidays() {
    return this.holidays || DEFAULT_ACADEMY_HOLIDAYS;
  }

  addHoliday(holiday) {
    this.holidays = this.holidays || [...DEFAULT_ACADEMY_HOLIDAYS];
    this.holidays.push(holiday);
    this.recalculateAllSchedules();
    this.notify('HOLIDAY_ADDED', holiday);
    return holiday;
  }

  deleteHoliday(id) {
    this.holidays = (this.holidays || DEFAULT_ACADEMY_HOLIDAYS).filter(h => h.id !== id);
    this.recalculateAllSchedules();
    this.notify('HOLIDAY_DELETED', id);
    return true;
  }

  getStudentSchedule(studentId) {
    this._initStudentSchedules();
    if (this.studentSchedules && this.studentSchedules[studentId]) {
      return this.studentSchedules[studentId];
    }
    const trainee = this.trainees.find(t => t.id === studentId || t.studentCode === studentId);
    if (!trainee) return null;
    const trainer = this.getTrainerById(trainee.assignedTrainerId) || this.trainers[0];
    const sched = generate20DaySchedule({
      studentId: trainee.id,
      studentName: trainee.name,
      startDate: trainee.registeredDate || '2026-10-02',
      instructorId: trainer.id,
      instructorName: trainer.name,
      transmission: trainee.package && trainee.package.toLowerCase().includes('auto') ? 'automatic' : 'manual',
      holidays: this.holidays
    });
    this.studentSchedules[trainee.id] = sched;
    this.saveState();
    return sched;
  }

  updateStudentStartDate(studentId, newStartDate) {
    const sched = this.getStudentSchedule(studentId);
    const trainee = this.trainees.find(t => t.id === studentId || t.studentCode === studentId);
    if (!sched || !trainee) return false;

    const trainer = this.getTrainerById(trainee.assignedTrainerId) || this.trainers[0];
    const newSched = generate20DaySchedule({
      studentId: trainee.id,
      studentName: trainee.name,
      startDate: newStartDate,
      instructorId: trainer.id,
      instructorName: trainer.name,
      transmission: sched.transmission || 'manual',
      holidays: this.holidays
    });

    // Copy completed state from existing sessions
    sched.sessions.forEach(oldSess => {
      if (oldSess.status === 'completed') {
        const target = newSched.sessions.find(s => s.dayNumber === oldSess.dayNumber);
        if (target) {
          target.status = 'completed';
          target.completionTimestamp = oldSess.completionTimestamp;
          target.instructorNotes = oldSess.instructorNotes;
          if (oldSess.route) target.route = oldSess.route;
        }
      }
    });

    trainee.registeredDate = newStartDate;
    this.studentSchedules[trainee.id] = newSched;
    this.saveState();
    this.notify('SCHEDULE_UPDATED', newSched);
    return newSched;
  }

  postponeSession(studentId, dayNumber, reason) {
    const sched = this.getStudentSchedule(studentId);
    if (!sched) return false;

    calendarPostponeSession(sched, dayNumber, reason, this.holidays);
    this.saveState();
    this.notify('SESSION_POSTPONED', { studentId, dayNumber, sched });
    return sched;
  }

  completeSession(studentId, dayNumber, { instructorNotes = '', customRoute = null } = {}) {
    const sched = this.getStudentSchedule(studentId);
    const trainee = this.trainees.find(t => t.id === studentId || t.studentCode === studentId);
    if (!sched || !trainee) return false;

    calendarCompleteSession(sched, dayNumber, {
      instructorNotes: instructorNotes || `Day ${dayNumber} completed with high precision.`,
      customRoute,
      completionTime: new Date().toISOString()
    });

    trainee.currentDay = Math.min(20, dayNumber + 1);
    const sessionCompleted = sched.sessions.find(s => s.dayNumber === dayNumber);
    const sessDate = sessionCompleted?.date || toDateStr(new Date());

    if (dayNumber >= 20) {
      trainee.currentDay = 20;
      trainee.status = 'Completed';
      trainee.isActive = false;
      trainee.actualCompletionDate = sessDate;
      trainee.category = 'test';

      if (trainee.enrollments && trainee.enrollments[0]) {
        trainee.enrollments[0].status = 'completed';
        trainee.enrollments[0].isActive = false;
        trainee.enrollments[0].actualCompletionDate = sessDate;
        trainee.enrollments[0].currentDay = 20;
        trainee.enrollments[0].finalAssessmentStatus = 'Passed RTO Practical Driving Exam ✓';
      }
    } else if (trainee.currentDay <= 10) {
      trainee.category = 'street';
    } else if (trainee.currentDay <= 17) {
      trainee.category = 'highway';
    } else {
      trainee.category = 'test';
    }

    if (trainee.enrollments && trainee.enrollments[0]) {
      trainee.enrollments[0].currentDay = trainee.currentDay;
    }

    const completedCount = sched.sessions.filter(s => s.status === 'completed').length;
    trainee.attendanceRate = `${Math.min(100, Math.round((completedCount / dayNumber) * 100))}%`;

    this.saveState();
    this.notify('SESSION_COMPLETED', { studentId, dayNumber, sched, trainee });
    return sched;
  }

  // =========================================================================
  // PERMANENT STUDENT DELETION (Requirement 7)
  // =========================================================================
  deleteTrainee(studentId) {
    const idx = this.trainees.findIndex(t => t.id === studentId || t.studentCode === studentId);
    if (idx === -1) return false;

    const removed = this.trainees.splice(idx, 1)[0];

    // Remove from studentSchedules
    if (this.studentSchedules) {
      if (this.studentSchedules[removed.id]) delete this.studentSchedules[removed.id];
      if (removed.studentCode && this.studentSchedules[removed.studentCode]) delete this.studentSchedules[removed.studentCode];
    }

    // Remove associated payments
    this.payments = this.payments.filter(p => p.traineeId !== removed.id && p.traineeId !== removed.studentCode);

    // If active currentTrainee was removed, update pointer
    if (this.currentTraineeId === removed.id || this.currentTraineeId === removed.studentCode) {
      this.currentTraineeId = this.trainees.length > 0 ? this.trainees[0].id : null;
    }

    this.saveState();
    this.notify('TRAINEE_DELETED', removed);
    return true;
  }

  // Reactivate an inactive student (e.g. enrolling in a new package or refreshing)
  reactivateStudent(studentId, newPackage = null) {
    const trainee = this.trainees.find(t => t.id === studentId || t.studentCode === studentId);
    if (!trainee) return false;

    trainee.status = 'Active';
    trainee.isActive = true;
    if (newPackage) trainee.package = newPackage;

    if (trainee.enrollments && trainee.enrollments[0]) {
      trainee.enrollments[0].status = 'active';
      trainee.enrollments[0].isActive = true;
    }

    this.saveState();
    this.notify('TRAINEE_UPDATED', trainee);
    return true;
  }

  recalculateAllSchedules() {
    this.studentSchedules = this.studentSchedules || {};
    Object.keys(this.studentSchedules).forEach(sId => {
      const sched = this.studentSchedules[sId];
      if (sched) {
        recalculateScheduleWithHolidays(sched, this.holidays);
      }
    });
    this.saveState();
    this.notify('SCHEDULES_RECALCULATED', this.studentSchedules);
  }
}

export const store = new Store();
