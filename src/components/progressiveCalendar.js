/* ==========================================================================
   20-DAY PROGRESSIVE DRIVING TRAINING CALENDAR & DASHBOARD
   GAFOOR DRIVING SCHOOL — PULIVENDULA, ANDHRA PRADESH
   
   Adheres strictly to design constraints:
   - Premium, clean, and simple UI
   - No unnecessary colors
   - Green ONLY for completed training days
   - Upcoming days retain normal calendar appearance
   - Holidays & Sundays are grey
   - Seamless connection to Leaflet Driving Route Map
   - Real-time postponement, start date rescheduling, and completion tracking
   ========================================================================== */

import { store } from '../store.js';
import { CURRICULUM_STAGES, getStageForDay } from '../utils/trainingCurriculum.js';
import { 
  getMonthCalendarCells, 
  formatDateDisplay, 
  isSunday, 
  getHolidayForDate,
  toDateStr,
  parseDateStr 
} from '../utils/academyCalendar.js';
import { openRouteMapModal } from './drivingRouteMap.js';
import { openLiveRideMapModal } from './liveRideTrackingModal.js';
import { openPostponeModal } from './postponeModal.js';
import { openAdminHolidayModal } from './adminHolidayModal.js';

export function renderProgressiveCalendar(container, studentId, { showToast, canEdit = true, onUpdate = null, isTrainer = false } = {}) {
  let viewMode = 'calendar'; // 'calendar' | 'list'
  
  // Get student and schedule
  const student = store.trainees.find(t => t.id === studentId || t.studentCode === studentId) || store.getCurrentTrainee();
  let schedule = store.getStudentSchedule(student.id);

  // Default calendar month navigation: center around student's active or start date
  const anchorDateStr = student.currentDay <= 20 && schedule && schedule.sessions 
    ? (schedule.sessions.find(s => s.dayNumber === student.currentDay)?.date || schedule.startDate || '2026-10-01')
    : (schedule?.startDate || '2026-10-01');

  let currentYear = parseDateStr(anchorDateStr).getFullYear();
  let currentMonth = parseDateStr(anchorDateStr).getMonth(); // 0-indexed

  let selectedDayNumber = student.currentDay || 1;

  function render() {
    schedule = store.getStudentSchedule(student.id);
    const holidays = store.getHolidays();

    const startD = parseDateStr(schedule.startDate || '2026-10-01');
    const startYear = startD.getFullYear();
    const startMonth = startD.getMonth();

    // Student calendar starts ONLY from registration start date - cannot view prior months
    if (currentYear < startYear || (currentYear === startYear && currentMonth < startMonth)) {
      currentYear = startYear;
      currentMonth = startMonth;
    }
    const isAtStartMonth = (currentYear === startYear && currentMonth === startMonth);
    const canTrainerLog = isTrainer || store.getRole() === 'trainer';

    const completedSessions = schedule.sessions.filter(s => s.status === 'completed');
    const completedCount = completedSessions.length;
    const currentSession = schedule.sessions.find(s => s.dayNumber === student.currentDay) 
      || schedule.sessions.find(s => s.status !== 'completed') 
      || schedule.sessions[schedule.sessions.length - 1];

    const currentStage = getStageForDay(currentSession.dayNumber);

    // Selected session for bottom inspect drawer
    const activeSelectedSession = schedule.sessions.find(s => s.dayNumber === selectedDayNumber) || currentSession;

    // Calendar Cells for the current view month
    const calendarCells = getMonthCalendarCells(currentYear, currentMonth);
    const monthTitle = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    // Map sessions and skipped dates by date string for fast cell lookup
    const sessionByDate = {};
    schedule.sessions.forEach(s => {
      sessionByDate[s.date] = s;
    });

    const skippedByDate = {};
    if (schedule.skippedDates) {
      schedule.skippedDates.forEach(sk => {
        skippedByDate[sk.date] = sk;
      });
    }

    container.innerHTML = `
      <div class="progressive-calendar-container" style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%;">

        <!-- ============================================================ -->
        <!-- 9. TRAINING PROGRESS SECTION (STUDENT DASHBOARD SPEC) -->
        <!-- ============================================================ -->
        <div class="calendar-progress-card" style="
          background: #101319;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        ">
          <!-- TOP ROW: TITLE & ACTIVE TRAINING OBJECTIVE -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.65rem;">
                <h2 style="font-size: 1.35rem; font-weight: 800; color: #ffffff; margin: 0;">
                  20-Day Driving Course
                </h2>
                ${completedCount === 20 ? `
                  <span style="
                    background: rgba(34, 197, 94, 0.15);
                    border: 1px solid rgba(34, 197, 94, 0.4);
                    color: #22c55e;
                    padding: 0.2rem 0.65rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 800;
                  ">Course Completed ✓</span>
                ` : ''}
              </div>
              <div style="font-size: 0.85rem; color: #a1a1aa; margin-top: 0.35rem;">
                Start Date: <strong style="color: #ffffff; font-family: monospace;">${schedule.startDate}</strong>
                · Final Completion: <strong style="color: #ffffff; font-family: monospace;">${schedule.completionDate}</strong>
                · (${completedCount} of 20 Sessions Completed)
              </div>
            </div>

            <!-- Current Stage & Current Objective Pill Boxes -->
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
              <div style="
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 8px;
                padding: 0.6rem 0.95rem;
              ">
                <div style="font-size: 0.65rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Current Stage</div>
                <div style="font-size: 0.92rem; font-weight: 700; color: #ffffff; margin-top: 0.15rem;">
                  ${currentStage.name}
                </div>
              </div>

              <div style="
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 8px;
                padding: 0.6rem 0.95rem;
              ">
                <div style="font-size: 0.65rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Current Training</div>
                <div style="font-size: 0.92rem; font-weight: 700; color: #ffffff; margin-top: 0.15rem;">
                  Day ${currentSession.dayNumber} — ${currentSession.objective}
                </div>
              </div>

              <div style="
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 8px;
                padding: 0.6rem 0.95rem;
                text-align: right;
              ">
                <div style="font-size: 0.65rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Sessions Completed</div>
                <div style="font-size: 1.15rem; font-weight: 900; color: ${completedCount === 20 ? '#22c55e' : '#ffffff'}; font-family: monospace;">
                  ${completedCount} / 20
                </div>
              </div>
            </div>
          </div>

          <!-- 3 MAJOR PROGRESSIVE STAGES TRACKER -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
              <span style="font-size: 0.72rem; color: #71717a; text-transform: uppercase; font-weight: 800; letter-spacing: 0.04em;">
                Curriculum Progression (3 Stages)
              </span>
              <span style="font-size: 0.75rem; color: #a1a1aa; font-family: monospace;">
                ${Math.round((completedCount / 20) * 100)}% Overall Progress
              </span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem;">
              ${CURRICULUM_STAGES.map(stage => {
                const stageSessions = schedule.sessions.filter(s => s.dayNumber >= stage.dayRange[0] && s.dayNumber <= stage.dayRange[1]);
                const stageCompleted = stageSessions.filter(s => s.status === 'completed').length;
                const totalInStage = stageSessions.length;
                const isStageComplete = stageCompleted === totalInStage;
                const isStageActive = stageCompleted > 0 && !isStageComplete || (currentStage.key === stage.key);

                return `
                  <div style="
                    background: ${isStageComplete ? 'rgba(34, 197, 94, 0.06)' : 'rgba(255, 255, 255, 0.02)'};
                    border: 1px solid ${isStageComplete ? 'rgba(34, 197, 94, 0.3)' : isStageActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.06)'};
                    border-radius: 10px;
                    padding: 0.85rem 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                  ">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-size: 0.68rem; font-weight: 800; color: #71717a; text-transform: uppercase;">
                        ${stage.daysLabel}
                      </span>
                      <span style="
                        font-size: 0.7rem;
                        font-weight: 800;
                        color: ${isStageComplete ? '#22c55e' : '#a1a1aa'};
                      ">
                        ${isStageComplete ? 'Completed ✓' : `${stageCompleted} / ${totalInStage}`}
                      </span>
                    </div>

                    <div style="font-size: 0.88rem; font-weight: 700; color: #ffffff;">
                      ${stage.name}
                    </div>

                    <!-- Mini stage progress bar -->
                    <div style="
                      width: 100%;
                      height: 4px;
                      background: rgba(255, 255, 255, 0.08);
                      border-radius: 9999px;
                      overflow: hidden;
                      margin-top: 0.2rem;
                    ">
                      <div style="
                        width: ${(stageCompleted / totalInStage) * 100}%;
                        height: 100%;
                        background: ${isStageComplete ? '#22c55e' : '#ffffff'};
                        border-radius: 9999px;
                      "></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- ============================================================ -->
        <!-- CALENDAR CONTROLS & MONTH / YEAR HEADER -->
        <!-- ============================================================ -->
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        ">
          <!-- Clean Month & Year Selector -->
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <button type="button" id="btn-cal-prev-month" ${isAtStartMonth ? 'disabled' : ''} style="
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.12);
              color: ${isAtStartMonth ? '#52525b' : '#ffffff'};
              width: 36px;
              height: 36px;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: ${isAtStartMonth ? 'not-allowed' : 'pointer'};
              opacity: ${isAtStartMonth ? '0.35' : '1'};
              font-size: 1rem;
              font-weight: 700;
            " title="${isAtStartMonth ? 'Cannot view before course registration start date' : 'Previous month'}">‹</button>

            <!-- Month Dropdown -->
            <select id="select-cal-month" style="
              background: #141720;
              border: 1px solid rgba(255, 255, 255, 0.18);
              color: #ffffff;
              padding: 0.45rem 0.85rem;
              border-radius: 6px;
              font-size: 0.85rem;
              font-weight: 700;
              cursor: pointer;
            ">
              ${[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ].map((mName, idx) => `
                <option value="${idx}" ${idx === currentMonth ? 'selected' : ''}>${mName}</option>
              `).join('')}
            </select>

            <!-- Year Dropdown -->
            <select id="select-cal-year" style="
              background: #141720;
              border: 1px solid rgba(255, 255, 255, 0.18);
              color: #ffffff;
              padding: 0.45rem 0.85rem;
              border-radius: 6px;
              font-size: 0.85rem;
              font-weight: 700;
              cursor: pointer;
            ">
              ${[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => `
                <option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>
              `).join('')}
            </select>

            <button type="button" id="btn-cal-next-month" style="
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.12);
              color: #ffffff;
              width: 36px;
              height: 36px;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              font-size: 1rem;
              font-weight: 700;
            " title="Next month">›</button>

            <button type="button" id="btn-cal-today" style="
              background: transparent;
              border: 1px solid rgba(255, 255, 255, 0.1);
              color: #a1a1aa;
              padding: 0.45rem 0.75rem;
              border-radius: 6px;
              cursor: pointer;
              font-size: 0.75rem;
              font-weight: 700;
            ">Reset to Course Start</button>
          </div>

          <!-- View Mode Switcher -->
          <div style="
            display: flex;
            background: #141720;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            padding: 2px;
          ">
            <button type="button" id="btn-view-cal" style="
              background: ${viewMode === 'calendar' ? '#ffffff' : 'transparent'};
              color: ${viewMode === 'calendar' ? '#000000' : '#a1a1aa'};
              border: none;
              padding: 0.35rem 0.75rem;
              border-radius: 4px;
              font-size: 0.75rem;
              font-weight: 700;
              cursor: pointer;
            ">Calendar Grid</button>
            <button type="button" id="btn-view-list" style="
              background: ${viewMode === 'list' ? '#ffffff' : 'transparent'};
              color: ${viewMode === 'list' ? '#000000' : '#a1a1aa'};
              border: none;
              padding: 0.35rem 0.75rem;
              border-radius: 4px;
              font-size: 0.75rem;
              font-weight: 700;
              cursor: pointer;
            ">20-Day Sequence</button>
          </div>
        </div>

        <!-- ============================================================ -->
        <!-- VIEW 1: MONTHLY CALENDAR GRID -->
        <!-- ============================================================ -->
        ${viewMode === 'calendar' ? `
          <div class="calendar-grid-card" style="
            background: #101319;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 14px;
            overflow: hidden;
          ">
            <!-- Day of Week Headers -->
            <div style="
              display: grid;
              grid-template-columns: repeat(7, 1fr);
              background: #141720;
              border-bottom: 1px solid rgba(255, 255, 255, 0.08);
              text-align: center;
              font-size: 0.72rem;
              font-weight: 800;
              color: #71717a;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              padding: 0.75rem 0;
            ">
              <div>Sun (Closed)</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <!-- Month Days Matrix -->
            <div style="
              display: grid;
              grid-template-columns: repeat(7, 1fr);
              gap: 1px;
              background: rgba(255, 255, 255, 0.06);
            ">
              ${calendarCells.map(cell => {
                const isBeforeStart = cell.dateStr < schedule.startDate;
                if (isBeforeStart) {
                  return `
                    <div class="calendar-day-cell cell-before-start" data-date="${cell.dateStr}" style="
                      background: rgba(0, 0, 0, 0.45);
                      border: 1px dashed rgba(255, 255, 255, 0.04);
                      min-height: 104px;
                      padding: 0.65rem;
                      display: flex;
                      flex-direction: column;
                      justify-content: flex-start;
                      opacity: 0.22;
                      cursor: not-allowed;
                      user-select: none;
                    ">
                      <span style="font-size: 0.825rem; font-weight: 600; font-family: monospace; color: #52525b;">
                        ${cell.dayNumber}
                      </span>
                      <span style="font-size: 0.6rem; color: #52525b; text-transform: uppercase; margin-top: 0.35rem;">
                        Before Start
                      </span>
                    </div>
                  `;
                }

                const session = sessionByDate[cell.dateStr];
                const holiday = getHolidayForDate(cell.dateStr, holidays);
                const skipped = skippedByDate[cell.dateStr];
                const isSun = cell.isSunday;

                // Color rules per specification:
                // - Green ONLY for completed training days
                // - Upcoming days retain normal calendar appearance
                // - Holidays and Sundays are grey
                const isCompleted = session && session.status === 'completed';
                const isSelected = session && session.dayNumber === selectedDayNumber;
                const isGreyDay = isSun || holiday;
                const isPostponedDay = skipped && skipped.type === 'postponed' && !session;

                let cellBg = '#0d0f14';
                let cellBorder = 'none';

                if (!cell.isCurrentMonth) {
                  cellBg = '#090b0e';
                } else if (isCompleted) {
                  // GREEN ONLY FOR COMPLETED
                  cellBg = 'rgba(34, 197, 94, 0.08)';
                  cellBorder = '1px solid rgba(34, 197, 94, 0.35)';
                } else if (isGreyDay) {
                  // GREY FOR HOLIDAYS / SUNDAYS
                  cellBg = 'rgba(255, 255, 255, 0.02)';
                } else if (session) {
                  // NORMAL CALENDAR APPEARANCE FOR UPCOMING
                  cellBg = '#12151d';
                }

                return `
                  <div class="calendar-day-cell ${session ? 'has-session' : ''} ${isSelected ? 'selected-cell' : ''}" 
                    data-date="${cell.dateStr}"
                    data-day-number="${session ? session.dayNumber : ''}"
                    style="
                      background: ${cellBg};
                      border: ${cellBorder};
                      min-height: 104px;
                      padding: 0.65rem;
                      display: flex;
                      flex-direction: column;
                      justify-content: space-between;
                      opacity: ${cell.isCurrentMonth ? '1' : '0.35'};
                      cursor: ${session ? 'pointer' : 'default'};
                      position: relative;
                      transition: all 0.15s ease;
                      outline: ${isSelected ? '2px solid #ffffff' : 'none'};
                      outline-offset: -2px;
                    "
                  >
                    <!-- Top line: Date number & Badges -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                      <span style="
                        font-size: 0.85rem;
                        font-weight: 700;
                        font-family: monospace;
                        color: ${isCompleted ? '#22c55e' : cell.isCurrentMonth ? '#ffffff' : '#71717a'};
                      ">
                        ${cell.dayNumber}
                      </span>

                      ${session ? `
                        <span style="
                          font-size: 0.65rem;
                          font-weight: 800;
                          padding: 0.15rem 0.4rem;
                          border-radius: 4px;
                          background: ${isCompleted ? '#22c55e' : '#ffffff'};
                          color: #000000;
                          font-family: monospace;
                        ">
                          Day ${session.dayNumber}
                        </span>
                      ` : isSun ? `
                        <span style="font-size: 0.62rem; color: #71717a; text-transform: uppercase; font-weight: 700;">Sunday</span>
                      ` : holiday ? `
                        <span style="
                          font-size: 0.6rem;
                          color: #a1a1aa;
                          background: rgba(255, 255, 255, 0.06);
                          padding: 0.1rem 0.35rem;
                          border-radius: 3px;
                        ">Holiday</span>
                      ` : isPostponedDay ? `
                        <span style="
                          font-size: 0.6rem;
                          color: #f87171;
                          background: rgba(248, 113, 113, 0.1);
                          padding: 0.1rem 0.35rem;
                          border-radius: 3px;
                        ">Postponed</span>
                      ` : ''}
                    </div>

                    <!-- Middle: Session objective or Holiday label -->
                    <div style="margin: 0.4rem 0;">
                      ${session ? `
                        <div style="
                          font-size: 0.75rem;
                          font-weight: 700;
                          color: #ffffff;
                          line-height: 1.25;
                          overflow: hidden;
                          display: -webkit-box;
                          -webkit-line-clamp: 2;
                          -webkit-box-orient: vertical;
                        ">
                          ${session.objective}
                        </div>
                        <div style="font-size: 0.65rem; color: #71717a; margin-top: 0.2rem;">
                          ${session.distance || '8.0 km'}
                        </div>
                      ` : holiday ? `
                        <div style="font-size: 0.72rem; color: #71717a; line-height: 1.2;">
                          ${holiday.name}
                        </div>
                      ` : isSun ? `
                        <div style="font-size: 0.7rem; color: #52525b;">
                          Academy Closed
                        </div>
                      ` : isPostponedDay ? `
                        <div style="font-size: 0.68rem; color: #f87171;">
                          ${skipped.reason}
                        </div>
                      ` : ''}
                    </div>

                    <!-- Bottom Status Indicator -->
                    <div>
                      ${isCompleted ? `
                        <div style="
                          font-size: 0.65rem;
                          font-weight: 800;
                          color: #22c55e;
                          display: flex;
                          align-items: center;
                          gap: 0.25rem;
                        ">
                          <span>✓</span> Completed 🟢
                        </div>
                      ` : session ? `
                        <div style="font-size: 0.65rem; color: #a1a1aa; font-weight: 600;">
                          ${session.status === 'today' ? '● Today’s Session' : 'Scheduled'}
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Legend bar -->
            <div style="
              padding: 0.75rem 1.25rem;
              background: #141720;
              border-top: 1px solid rgba(255, 255, 255, 0.08);
              display: flex;
              align-items: center;
              justify-content: space-between;
              flex-wrap: wrap;
              gap: 0.75rem;
              font-size: 0.75rem;
            ">
              <div style="display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <span style="width: 12px; height: 12px; border-radius: 3px; background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; display: inline-block;"></span>
                  <span style="color: #ffffff; font-weight: 700;">Completed Driving Day (Green 🟢)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <span style="width: 12px; height: 12px; border-radius: 3px; background: #12151d; border: 1px solid rgba(255,255,255,0.15); display: inline-block;"></span>
                  <span style="color: #a1a1aa;">Upcoming Lesson (Normal Calendar)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <span style="width: 12px; height: 12px; border-radius: 3px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); display: inline-block;"></span>
                  <span style="color: #71717a;">Sundays &amp; Academy Holidays (Grey)</span>
                </div>
              </div>

              <div style="color: #71717a; font-size: 0.72rem;">
                Click any lesson date to inspect session details or view the driving route
              </div>
            </div>
          </div>
        ` : `
          <!-- ============================================================ -->
          <!-- VIEW 2: 20-DAY CURRICULUM SEQUENCE TABLE VIEW -->
          <!-- ============================================================ -->
          <div class="calendar-list-card" style="
            background: #101319;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 14px;
            overflow: hidden;
          ">
            <div style="padding: 1rem 1.25rem; background: #141720; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <div style="font-size: 0.95rem; font-weight: 800; color: #ffffff;">
                20-Day Progressive Driving Course Sequence
              </div>
              <div style="font-size: 0.78rem; color: #a1a1aa; margin-top: 0.2rem;">
                Every session is mapped to an actual training date skipping Sundays and Academy holidays.
              </div>
            </div>

            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.825rem;">
                <thead>
                  <tr style="background: rgba(255, 255, 255, 0.02); color: #71717a; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                    <th style="padding: 0.75rem 1rem;">Day #</th>
                    <th style="padding: 0.75rem 1rem;">Calendar Date</th>
                    <th style="padding: 0.75rem 1rem;">Curriculum Objective</th>
                    <th style="padding: 0.75rem 1rem;">Stage</th>
                    <th style="padding: 0.75rem 1rem;">Distance</th>
                    <th style="padding: 0.75rem 1rem;">Status</th>
                    <th style="padding: 0.75rem 1rem; text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${schedule.sessions.map(s => {
                    const isDone = s.status === 'completed';
                    return `
                      <tr style="
                        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                        background: ${isDone ? 'rgba(34, 197, 94, 0.04)' : 'transparent'};
                      ">
                        <td style="padding: 0.75rem 1rem; font-family: monospace; font-weight: 800; color: ${isDone ? '#22c55e' : '#ffffff'};">
                          Day ${s.dayNumber}
                        </td>
                        <td style="padding: 0.75rem 1rem; font-family: monospace; color: #a1a1aa;">
                          ${s.date} (${formatDateDisplay(s.date, { weekday: 'short', month: 'short', day: 'numeric' })})
                        </td>
                        <td style="padding: 0.75rem 1rem;">
                          <div style="font-weight: 700; color: #ffffff;">${s.objective}</div>
                          <div style="font-size: 0.72rem; color: #71717a; margin-top: 0.15rem;">${s.skills.slice(0, 3).join(', ')}...</div>
                        </td>
                        <td style="padding: 0.75rem 1rem;">
                          <span style="
                            font-size: 0.68rem;
                            font-weight: 700;
                            padding: 0.15rem 0.5rem;
                            border-radius: 4px;
                            background: rgba(255, 255, 255, 0.05);
                            color: #d4d4d8;
                          ">${s.stage}</span>
                        </td>
                        <td style="padding: 0.75rem 1rem; font-family: monospace; color: #a1a1aa;">
                          ${s.distance || '8.0 km'}
                        </td>
                        <td style="padding: 0.75rem 1rem;">
                          ${isDone ? `
                            <span style="color: #22c55e; font-weight: 800;">✓ Completed 🟢</span>
                          ` : `
                            <span style="color: #a1a1aa;">Upcoming</span>
                          `}
                        </td>
                        <td style="padding: 0.75rem 1rem; text-align: right;">
                          <button type="button" class="btn-select-session" data-day="${s.dayNumber}" style="
                            background: rgba(255, 255, 255, 0.06);
                            border: 1px solid rgba(255, 255, 255, 0.12);
                            color: #ffffff;
                            padding: 0.35rem 0.75rem;
                            border-radius: 5px;
                            font-size: 0.75rem;
                            font-weight: 700;
                            cursor: pointer;
                          ">Inspect Session →</button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `}

        <!-- ============================================================ -->
        <!-- SELECTED SESSION INSPECTION DRAWER & ACTIONS -->
        <!-- ============================================================ -->
        <div class="calendar-session-inspect-card" style="
          background: #101319;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        ">
          <!-- TOP HEADER OF INSPECTION -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.65rem;">
                <span style="
                  background: ${activeSelectedSession.status === 'completed' ? '#22c55e' : '#ffffff'};
                  color: #000000;
                  font-family: monospace;
                  font-weight: 900;
                  font-size: 0.85rem;
                  padding: 0.2rem 0.6rem;
                  border-radius: 5px;
                ">
                  DAY ${activeSelectedSession.dayNumber} of 20
                </span>

                <h3 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin: 0;">
                  ${activeSelectedSession.objective}
                </h3>

                ${activeSelectedSession.status === 'completed' ? `
                  <span style="
                    background: rgba(34, 197, 94, 0.15);
                    border: 1px solid rgba(34, 197, 94, 0.4);
                    color: #22c55e;
                    font-size: 0.75rem;
                    font-weight: 800;
                    padding: 0.2rem 0.6rem;
                    border-radius: 9999px;
                  ">Completed 🟢</span>
                ` : `
                  <span style="
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #a1a1aa;
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 0.2rem 0.6rem;
                    border-radius: 9999px;
                  ">Scheduled Training</span>
                `}
              </div>

              <div style="font-size: 0.85rem; color: #a1a1aa; margin-top: 0.4rem;">
                Scheduled: <strong style="color: #ffffff; font-family: monospace;">${activeSelectedSession.date} (${formatDateDisplay(activeSelectedSession.date)})</strong>
                · Stage: <strong style="color: #ffffff;">${activeSelectedSession.stage}</strong>
                · Instructor: <strong style="color: #ffffff;">${activeSelectedSession.instructorName}</strong>
                · Distance: <strong style="color: #ffffff; font-family: monospace;">${activeSelectedSession.distance || '8.0 km'}</strong>
              </div>
            </div>

            <!-- ACTION BUTTONS: ROUTE MAP, POSTPONE, COMPLETE -->
            <div style="display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;">
              
              <!-- 10. DRIVING ROUTE MAP BUTTON (ALWAYS AVAILABLE FOR COMPLETED DAYS) -->
              <button type="button" id="btn-inspect-route-map" style="
                background: ${activeSelectedSession.status === 'completed' ? '#22c55e' : '#ffffff'};
                color: #000000;
                border: none;
                padding: 0.55rem 1.15rem;
                border-radius: 8px;
                font-size: 0.825rem;
                font-weight: 800;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.45rem;
              ">
                <span>🗺️</span>
                <span>View Route Map</span>
              </button>

              <!-- START LIVE 8 KM RIDE BUTTON -->
              <button type="button" id="btn-start-live-ride" style="
                background: #22c55e;
                color: #000000;
                border: none;
                padding: 0.55rem 1.15rem;
                border-radius: 8px;
                font-size: 0.825rem;
                font-weight: 800;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.45rem;
                box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4);
              ">
                <span>🚀</span>
                <span>Start Live GPS Ride (500m Tracking)</span>
              </button>

              ${canTrainerLog && activeSelectedSession.status !== 'completed' ? `
                <!-- MARK COMPLETED BUTTON (TRAINER ONLY) -->
                <button type="button" id="btn-inspect-mark-completed" style="
                  background: rgba(34, 197, 94, 0.15);
                  border: 1px solid rgba(34, 197, 94, 0.4);
                  color: #22c55e;
                  padding: 0.55rem 1rem;
                  border-radius: 8px;
                  font-size: 0.825rem;
                  font-weight: 800;
                  cursor: pointer;
                ">
                  Log Ride Completed (+8 km) ✓
                </button>
              ` : activeSelectedSession.status !== 'completed' ? `
                <div style="display:inline-flex; align-items:center; gap:0.45rem; padding:0.45rem 0.85rem; border-radius:8px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); font-size:0.75rem; color:#94a3b8;">
                  <span style="color:#38bdf8;">🔒</span>
                  <span>Rides are logged by Trainer only</span>
                </div>
              ` : ''}

              ${canEdit && activeSelectedSession.status !== 'completed' ? `
                <!-- 7. POSTPONE LOGIC BUTTON -->
                <button type="button" id="btn-inspect-postpone" style="
                  background: rgba(255, 255, 255, 0.05);
                  border: 1px solid rgba(255, 255, 255, 0.15);
                  color: #ffffff;
                  padding: 0.55rem 1rem;
                  border-radius: 8px;
                  font-size: 0.825rem;
                  font-weight: 700;
                  cursor: pointer;
                ">
                  ⏱ Postpone Session
                </button>
              ` : ''}
            </div>
          </div>

          <!-- CURRICULUM SKILLS LIST FOR THIS DAY -->
          <div style="
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 10px;
            padding: 1rem;
          ">
            <div style="font-size: 0.72rem; color: #71717a; text-transform: uppercase; font-weight: 800; margin-bottom: 0.6rem;">
              Daily Training Syllabus &amp; Vehicle Control Objectives
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem;">
              ${activeSelectedSession.skills.map(skill => `
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 0.45rem;
                  font-size: 0.825rem;
                  color: #ffffff;
                ">
                  <span style="color: ${activeSelectedSession.status === 'completed' ? '#22c55e' : '#a1a1aa'}; font-weight: 800;">
                    ${activeSelectedSession.status === 'completed' ? '✓' : '•'}
                  </span>
                  <span>${skill}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- ROUTE & INSTRUCTOR DETAILS -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
            <!-- Driving Route summary -->
            <div style="
              background: rgba(255, 255, 255, 0.02);
              border: 1px solid rgba(255, 255, 255, 0.06);
              border-radius: 8px;
              padding: 0.85rem 1rem;
            ">
              <div style="font-size: 0.7rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Practice Route</div>
              <div style="font-size: 0.88rem; font-weight: 700; color: #ffffff; margin-top: 0.2rem;">
                ${activeSelectedSession.route?.title || 'Pulivendula Road Practical'}
              </div>
              <div style="font-size: 0.75rem; color: #a1a1aa; margin-top: 0.25rem;">
                Start: ${activeSelectedSession.route?.startPoint?.name || 'Academy Depot'} → Finish: ${activeSelectedSession.route?.endPoint?.name || 'Test Ground'}
              </div>
            </div>

            <!-- Instructor Notes -->
            <div style="
              background: rgba(255, 255, 255, 0.02);
              border: 1px solid rgba(255, 255, 255, 0.06);
              border-radius: 8px;
              padding: 0.85rem 1rem;
            ">
              <div style="font-size: 0.7rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Instructor Remarks</div>
              <div style="font-size: 0.825rem; color: #ffffff; margin-top: 0.25rem; font-style: italic;">
                "${activeSelectedSession.instructorNotes || (activeSelectedSession.status === 'completed' 
                  ? 'Objective achieved with good control and confidence.' 
                  : 'Scheduled session with ' + activeSelectedSession.instructorName)}"
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    // ------------------------------------------------------------
    // EVENT LISTENERS
    // ------------------------------------------------------------

    // Prev / Next Month
    container.querySelector('#btn-cal-prev-month')?.addEventListener('click', () => {
      if (isAtStartMonth) return;
      if (currentMonth === 0) {
        currentMonth = 11;
        currentYear--;
      } else {
        currentMonth--;
      }
      if (currentYear < startYear || (currentYear === startYear && currentMonth < startMonth)) {
        currentYear = startYear;
        currentMonth = startMonth;
      }
      render();
    });

    container.querySelector('#btn-cal-next-month')?.addEventListener('click', () => {
      if (currentMonth === 11) {
        currentMonth = 0;
        currentYear++;
      } else {
        currentMonth++;
      }
      render();
    });

    container.querySelector('#btn-cal-today')?.addEventListener('click', () => {
      currentYear = parseDateStr(schedule.startDate).getFullYear();
      currentMonth = parseDateStr(schedule.startDate).getMonth();
      render();
    });

    // View Switcher
    container.querySelector('#btn-view-cal')?.addEventListener('click', () => {
      viewMode = 'calendar';
      render();
    });
    container.querySelector('#btn-view-list')?.addEventListener('click', () => {
      viewMode = 'list';
      render();
    });

    // Click Calendar Cell
    container.querySelectorAll('.calendar-day-cell.has-session').forEach(cell => {
      cell.addEventListener('click', () => {
        const day = parseInt(cell.dataset.dayNumber, 10);
        if (day) {
          selectedDayNumber = day;
          render();
        }
      });
    });

    // Click Table Inspect Session
    container.querySelectorAll('.btn-select-session').forEach(btn => {
      btn.addEventListener('click', () => {
        const day = parseInt(btn.dataset.day, 10);
        if (day) {
          selectedDayNumber = day;
          render();
        }
      });
    });

    // Route Map Modal Click
    container.querySelector('#btn-inspect-route-map')?.addEventListener('click', () => {
      openRouteMapModal({
        session: activeSelectedSession,
        studentName: student.name,
        carInfo: student.car || 'Maruti Suzuki Swift Dual-Ctrl'
      });
    });

    // Start Live 8 km Ride Click
    container.querySelector('#btn-start-live-ride')?.addEventListener('click', () => {
      const trainer = store.trainers.find(t => t.id === student.assignedTrainerId) || store.trainers[0];
      openLiveRideMapModal({
        session: activeSelectedSession,
        student,
        trainer,
        canTrainerComplete: canTrainerLog,
        onRideCompleted: () => {
          showToast(`Day ${activeSelectedSession.dayNumber} 8.0 km ride recorded successfully! 🟢`, 'success');
          if (onUpdate) onUpdate();
          render();
        }
      });
    });

    // Postpone Session Click
    container.querySelector('#btn-inspect-postpone')?.addEventListener('click', () => {
      openPostponeModal({
        studentId: student.id,
        session: activeSelectedSession,
        onPostponed: () => {
          showToast(`Day ${activeSelectedSession.dayNumber} postponed. Sequence preserved and future dates shifted.`, 'info');
          if (onUpdate) onUpdate();
          render();
        }
      });
    });

    // Mark as Completed Click
    container.querySelector('#btn-inspect-mark-completed')?.addEventListener('click', () => {
      store.completeSession(student.id, activeSelectedSession.dayNumber, {
        instructorNotes: `Practical training completed for Day ${activeSelectedSession.dayNumber} (${activeSelectedSession.objective}). Student exhibited steady road mastery.`
      });
      showToast(`Day ${activeSelectedSession.dayNumber} marked as Completed 🟢`, 'success');
      if (onUpdate) onUpdate();
      render();
    });

    // Month Dropdown Change
    const selectMonth = container.querySelector('#select-cal-month');
    if (selectMonth) {
      selectMonth.addEventListener('change', (e) => {
        const newMonth = parseInt(e.target.value, 10);
        if (currentYear < startYear || (currentYear === startYear && newMonth < startMonth)) {
          currentYear = startYear;
          currentMonth = startMonth;
        } else {
          currentMonth = newMonth;
        }
        render();
      });
    }

    // Year Dropdown Change
    const selectYear = container.querySelector('#select-cal-year');
    if (selectYear) {
      selectYear.addEventListener('change', (e) => {
        const newYear = parseInt(e.target.value, 10);
        if (newYear < startYear || (newYear === startYear && currentMonth < startMonth)) {
          currentYear = startYear;
          currentMonth = startMonth;
        } else {
          currentYear = newYear;
        }
        render();
      });
    }
  }

  render();
}
