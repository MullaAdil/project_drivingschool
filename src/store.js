/* ==========================================================================
   REACTIVE STATE STORE & MOCK DATA
   GAFOOR DRIVING SCHOOL — PULIVENDULA, ANDHRA PRADESH
   "Walk in & Drive out"
   Accredited by Andhra Pradesh Motor Vehicles Department (AP RTO Pulivendula / Kadapa)
   All copy, roles, and candidate records formatted in English words only.
   ========================================================================== */

import { extractInitials, getNextStudentSequence, generateStudentCode, generateTrainerCode, getNextTrainerSequence, normalizeCode } from './utils/studentCode.js';
import { saveStudentToSupabase, fetchStudentsFromSupabase, updateStudentInSupabase } from './supabase.js';
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
    // Auto-sync with Supabase in background if configured
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

  verifyAdminLogin(username, password) {
    const clean = (username || '').trim().toLowerCase();
    const validUsers = ['admin@gafoordriving.in', 'admin', 'admin-hq'];
    if (!validUsers.includes(clean)) {
      return { success: false, message: 'Invalid Admin username. Only one master administrator account is authorized.' };
    }
    const validPasswords = ['admin', 'admin123', '••••••••••••'];
    if (validPasswords.includes(password)) {
      return { success: true };
    }
    return { success: false, message: 'Incorrect Administrator security password.' };
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
