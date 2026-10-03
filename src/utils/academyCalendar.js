/* ==========================================================================
   ACADEMY CALENDAR & 20-DAY SCHEDULE ENGINE
   GAFOOR DRIVING SCHOOL — PULIVENDULA, ANDHRA PRADESH
   
   Calendar is the single source of truth:
   - Skips Sundays (Day of week 0)
   - Skips Academy Holidays, Festival Holidays & Admin Closures
   - Generates exactly 20 valid training days
   - Calculates true course completion date
   - Handles progressive session postponement & sequential day shifting
   - Recalculates future uncompleted days when holidays change, preserving history
   ========================================================================== */

import { OFFICIAL_20_DAY_CURRICULUM, getCurriculumDay, getStageForDay } from './trainingCurriculum.js';

// Normal Academy Calendar: follows normal calendar every year.
// Only actual holidays scheduled by the administrator are added.
export const DEFAULT_ACADEMY_HOLIDAYS = [];

/**
 * Format Date to YYYY-MM-DD local string
 */
export function toDateStr(date) {
  if (typeof date === 'string') return date.slice(0, 10);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse YYYY-MM-DD safely into Date object at noon to avoid UTC midnight timezone drift
 */
export function parseDateStr(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

/**
 * Check if a date is a Sunday
 */
export function isSunday(date) {
  const d = typeof date === 'string' ? parseDateStr(date) : date;
  return d.getDay() === 0;
}

/**
 * Check if a date string is in the holidays list
 */
export function getHolidayForDate(dateStr, holidays = DEFAULT_ACADEMY_HOLIDAYS) {
  return holidays.find(h => h.date === dateStr) || null;
}

/**
 * Check if a date is a valid training day
 * (Neither a Sunday nor an Academy / Festival Holiday / Admin Closure)
 */
export function isValidTrainingDay(dateStr, holidays = DEFAULT_ACADEMY_HOLIDAYS) {
  if (isSunday(dateStr)) return false;
  if (getHolidayForDate(dateStr, holidays)) return false;
  return true;
}

/**
 * Get next valid training day strictly after the given date string
 */
export function getNextValidTrainingDay(afterDateStr, holidays = DEFAULT_ACADEMY_HOLIDAYS) {
  let curr = parseDateStr(afterDateStr);
  while (true) {
    curr.setDate(curr.getDate() + 1);
    const currStr = toDateStr(curr);
    if (isValidTrainingDay(currStr, holidays)) {
      return currStr;
    }
  }
}

/**
 * Core Algorithm: Generate exactly 20 valid training sessions starting from startDate
 * Skips Sundays and holidays until 20 valid days are found.
 */
export function generate20DaySchedule({
  studentId,
  studentName = 'Candidate',
  startDate,
  instructorId = 'TRN-1',
  instructorName = 'K. Srinivas Rao',
  transmission = 'manual',
  holidays = DEFAULT_ACADEMY_HOLIDAYS,
  timeSlot = '08:30 AM – 09:30 AM'
}) {
  const sessions = [];
  const skippedDates = []; // Track non-training dates for calendar clarity
  let curr = parseDateStr(startDate);
  let dayNum = 1;

  while (dayNum <= 20) {
    const dateStr = toDateStr(curr);

    if (isSunday(curr)) {
      skippedDates.push({ date: dateStr, reason: 'Sunday', type: 'sunday' });
    } else {
      const hol = getHolidayForDate(dateStr, holidays);
      if (hol) {
        skippedDates.push({ date: dateStr, reason: hol.name, type: hol.type || 'holiday' });
      } else {
        // Valid training day!
        const curriculum = getCurriculumDay(dayNum, transmission);
        const stage = getStageForDay(dayNum);

        const [startTime, endTime] = timeSlot.includes('–') 
          ? timeSlot.split('–').map(s => s.trim()) 
          : ['08:30 AM', '09:30 AM'];

        sessions.push({
          id: `SESS-${studentId}-D${String(dayNum).padStart(2, '0')}`,
          studentId,
          studentName,
          dayNumber: dayNum,
          date: dateStr,
          stage: stage.name,
          stageKey: stage.key,
          objective: curriculum.objective,
          skills: [...curriculum.skills],
          status: 'scheduled', // 'scheduled' | 'completed' | 'postponed'
          instructorId,
          instructorName,
          startTime: startTime || '08:30 AM',
          endTime: endTime || '09:30 AM',
          distance: `${curriculum.route.distanceKm} km`,
          duration: `${curriculum.route.durationMins} mins`,
          route: { ...curriculum.route },
          instructorNotes: '',
          completionTimestamp: null,
          postponementHistory: [],
          transmission
        });

        dayNum++;
      }
    }

    curr.setDate(curr.getDate() + 1);
  }

  const completionDate = sessions[sessions.length - 1].date;

  return {
    studentId,
    startDate,
    completionDate,
    transmission,
    timeSlot,
    sessions,
    skippedDates,
    postponements: []
  };
}

/**
 * Postpone a training session:
 * Example: October 8 -> Day 6. Student postpones.
 * 1. Mark October 8 as not completed / postponed.
 * 2. Move Day 6 to the next available training day.
 * 3. Shift subsequent training days (Days 7–20) forward sequentially.
 * 4. Preserve the correct Day 1–Day 20 sequence.
 * 5. Update the final completion date.
 * 6. Objective moves together with the training day.
 */
export function postponeSession(
  schedule,
  dayNumber,
  reason = 'Student requested postponement',
  holidays = DEFAULT_ACADEMY_HOLIDAYS
) {
  if (!schedule || !schedule.sessions) return schedule;

  const targetIdx = schedule.sessions.findIndex(s => s.dayNumber === dayNumber);
  if (targetIdx === -1) return schedule;

  const targetSession = schedule.sessions[targetIdx];
  if (targetSession.status === 'completed') {
    // Historical completed sessions cannot be postponed
    return schedule;
  }

  const oldDate = targetSession.date;

  // Record postponement event
  const postponementRecord = {
    dayNumber,
    objective: targetSession.objective,
    originalDate: oldDate,
    postponedAt: new Date().toISOString(),
    reason: reason || 'Postponed'
  };

  schedule.postponements = schedule.postponements || [];
  schedule.postponements.push(postponementRecord);

  // Add to skipped dates on schedule so the calendar marks old date as postponed
  schedule.skippedDates = schedule.skippedDates || [];
  schedule.skippedDates.push({
    date: oldDate,
    reason: `Postponed: Day ${dayNumber} (${reason})`,
    type: 'postponed'
  });

  // Calculate new starting training date for Day `dayNumber`:
  // It must be the next valid training day after oldDate!
  let nextDate = getNextValidTrainingDay(oldDate, holidays);

  // Re-assign dates for targetSession and all subsequent uncompleted sessions
  let curr = parseDateStr(nextDate);

  for (let i = targetIdx; i < schedule.sessions.length; i++) {
    const s = schedule.sessions[i];
    
    // Find next valid date
    while (true) {
      const dStr = toDateStr(curr);
      if (isValidTrainingDay(dStr, holidays)) {
        s.date = dStr;
        curr.setDate(curr.getDate() + 1);
        break;
      }
      curr.setDate(curr.getDate() + 1);
    }

    if (i === targetIdx) {
      s.postponementHistory = s.postponementHistory || [];
      s.postponementHistory.push(postponementRecord);
    }
  }

  // Update final completion date
  schedule.completionDate = schedule.sessions[schedule.sessions.length - 1].date;

  return schedule;
}

/**
 * Mark a training session as completed
 */
export function completeSession(
  schedule,
  dayNumber,
  { instructorNotes = '', customRoute = null, completionTime = null } = {}
) {
  if (!schedule || !schedule.sessions) return schedule;

  const session = schedule.sessions.find(s => s.dayNumber === dayNumber);
  if (!session) return schedule;

  session.status = 'completed';
  session.completionTimestamp = completionTime || new Date().toISOString();
  if (instructorNotes) session.instructorNotes = instructorNotes;
  if (customRoute) session.route = { ...session.route, ...customRoute };

  return schedule;
}

/**
 * Recalculate schedule when holidays are added or modified:
 * - Historical completed sessions are NEVER touched!
 * - Only future uncompleted sessions are shifted to respect new holiday closures.
 */
export function recalculateScheduleWithHolidays(schedule, holidays = DEFAULT_ACADEMY_HOLIDAYS) {
  if (!schedule || !schedule.sessions) return schedule;

  // Find the first uncompleted session
  const firstUncompletedIdx = schedule.sessions.findIndex(s => s.status !== 'completed');
  if (firstUncompletedIdx === -1) {
    // All sessions are completed, nothing to reschedule
    return schedule;
  }

  // Find anchor date: if there are completed sessions, start after the last completed session date.
  // Otherwise, start from schedule.startDate.
  let anchorDateStr = schedule.startDate;
  if (firstUncompletedIdx > 0) {
    anchorDateStr = schedule.sessions[firstUncompletedIdx - 1].date;
  }

  let curr = parseDateStr(anchorDateStr);
  if (firstUncompletedIdx > 0) {
    curr.setDate(curr.getDate() + 1); // step past last completed day
  }

  for (let i = firstUncompletedIdx; i < schedule.sessions.length; i++) {
    const s = schedule.sessions[i];
    while (true) {
      const dStr = toDateStr(curr);
      if (isValidTrainingDay(dStr, holidays)) {
        s.date = dStr;
        curr.setDate(curr.getDate() + 1);
        break;
      }
      curr.setDate(curr.getDate() + 1);
    }
  }

  schedule.completionDate = schedule.sessions[schedule.sessions.length - 1].date;
  return schedule;
}

/**
 * Helper to get all calendar days for a specific year and month (0-indexed month)
 * Returns matrix of 35 or 42 cells (Sundays to Saturdays) for complete month grid
 */
export function getMonthCalendarCells(year, month) {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const daysInMonth = lastDayOfMonth.getDate();

  const cells = [];

  // Previous month trailing days
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDate - i;
    const dateObj = new Date(year, month - 1, d, 12, 0, 0);
    cells.push({
      dateStr: toDateStr(dateObj),
      dayNumber: d,
      isCurrentMonth: false,
      isSunday: true // or check getDay()
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d, 12, 0, 0);
    cells.push({
      dateStr: toDateStr(dateObj),
      dayNumber: d,
      isCurrentMonth: true,
      isSunday: dateObj.getDay() === 0
    });
  }

  // Next month leading days to complete grid (multiples of 7)
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const dateObj = new Date(year, month + 1, d, 12, 0, 0);
      cells.push({
        dateStr: toDateStr(dateObj),
        dayNumber: d,
        isCurrentMonth: false,
        isSunday: dateObj.getDay() === 0
      });
    }
  }

  return cells;
}

/**
 * Format date display cleanly: e.g. "Friday, Oct 2, 2026"
 */
export function formatDateDisplay(dateStr, opts = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!dateStr) return '';
  const d = parseDateStr(dateStr);
  return d.toLocaleDateString('en-IN', opts);
}
