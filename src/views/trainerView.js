/* ==========================================================================
   GAFOOR DRIVING SCHOOL — TRAINER DISPATCH CONSOLE
   Full-page layout fitting 100% viewport width without spaces.
   Dedicated services bound as distinct pages:
   - Service 01: Daily Schedule & One-Tap Attendance
   - Service 02: My Assigned Candidates Directory
   - Service 03: Safety Vehicle Inspection & Dual-Brake Log
   ========================================================================== */

import { store } from '../store.js';
import { renderBrandLogo } from '../components/brandLogo.js';
import { renderStudentBoxAvatar, renderStudentAvatar } from '../components/studentAvatar.js';
import { openRouteMapModal } from '../components/drivingRouteMap.js';
import { openLiveRideMapModal } from '../components/liveRideTrackingModal.js';

export function renderTrainerView(container, showToast, subService = 'schedule', onNavigate) {
  function render() {
    const trainer      = store.trainers[0];
    const schedule     = store.schedule;
    const allTrainees  = store.trainees;
    const myTrainees   = allTrainees.filter(t => t.assignedTrainerId === trainer.id);

    const presentCount = schedule.filter(s => s.attendance === 'present').length;
    const absentCount  = schedule.filter(s => s.attendance === 'absent').length;
    const lateCount    = schedule.filter(s => s.attendance === 'late').length;
    const totalCount   = schedule.length;
    const totalKm      = myTrainees.reduce((a, t) => a + (t.currentDay * 8), 0);

    const currentSub = subService || 'schedule';

    const topbar = '';

    let contentHtml = '';

    // =========================================================
    // SERVICE 01: DAILY SCHEDULE & ONE-TAP ATTENDANCE
    // =========================================================
    if (currentSub === 'schedule') {
      contentHtml = `
        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">Daily Attendance Register</h1>
            <p class="portal-page-sub">Mark student attendance, write driving notes, and track 20-day course progress for ${new Date().toLocaleDateString('en-IN', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}.</p>
          </div>
          <div class="portal-page-header-meta">
            <span class="p-badge p-badge-dim">Training Car: ${trainer.car}</span>
            <span class="p-badge p-badge-dim">Shift: 07:30 AM – 05:30 PM</span>
            <span class="p-badge p-badge-green">★ 4.96 / 5.0</span>
          </div>
        </div>

        <div class="portal-stats-strip">
          <div class="portal-stat">
            <span class="portal-stat-value">${totalCount}</span>
            <span class="portal-stat-label">Today's Classes</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">${presentCount}</span>
            <span class="portal-stat-label">Present Today</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:#f87171;">${absentCount}</span>
            <span class="portal-stat-label">Absent</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--primary-gold);">${lateCount}</span>
            <span class="portal-stat-label">Late Arrivals</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${myTrainees.length}</span>
            <span class="portal-stat-label">Total Students</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${totalKm.toLocaleString('en-IN')} km</span>
            <span class="portal-stat-label">Total km Logged</span>
          </div>
        </div>

        <!-- INSTRUCTOR ACTIVE GPS RIDE DISPATCH COMMAND CARD -->
        <div class="trainer-gps-command-card" style="
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.14) 0%, rgba(15, 23, 42, 0.85) 100%);
          border: 1.5px solid rgba(34, 197, 94, 0.45);
          border-radius: 14px;
          padding: 1.25rem 1.6rem;
          margin-bottom: 1.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.25rem;
          flex-wrap: wrap;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        ">
          <div style="display:flex; align-items:center; gap:1.15rem;">
            <div style="
              width: 52px;
              height: 52px;
              border-radius: 14px;
              background: #22c55e;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.75rem;
              box-shadow: 0 4px 20px rgba(34, 197, 94, 0.45);
            ">🛰️</div>
            <div>
              <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.25rem; flex-wrap:wrap;">
                <span class="p-badge p-badge-green" style="font-size:0.72rem; font-weight:900; letter-spacing:0.04em;">
                  INSTRUCTOR GPS TELEMETRY COCKPIT
                </span>
                <span style="font-size:0.8rem; color:#a1a1aa; font-weight:700;">
                  Dual-Control Sensor · 500m Checkpoint Verification
                </span>
              </div>
              <h3 style="font-size:1.2rem; font-weight:900; color:#ffffff; margin:0 0 0.25rem 0;">
                Live Practical Ride &amp; Distance Tracking (8.0 km)
              </h3>
              <p style="font-size:0.825rem; color:#94a3b8; margin:0;">
                Select an active student candidate to launch live GPS tracking with 500m milestone logs and automatic curriculum sync.
              </p>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:0.85rem; flex-wrap:wrap;">
            <select id="trainer-quick-select-student" style="
              background: rgba(13, 16, 23, 0.95);
              border: 1px solid rgba(255, 255, 255, 0.25);
              color: #ffffff;
              padding: 0.75rem 1rem;
              border-radius: 8px;
              font-size: 0.85rem;
              font-weight: 700;
              cursor: pointer;
            ">
              ${myTrainees.filter(t => t.isActive).map(t => `
                <option value="${t.id}">${t.name} (Day ${t.currentDay || 1}/20 · 8km)</option>
              `).join('')}
            </select>

            <button type="button" class="btn-mnc btn-mnc-primary" id="btn-trainer-quick-start-gps" style="
              background: #22c55e;
              border-color: #22c55e;
              color: #000000;
              font-weight: 900;
              padding: 0.85rem 1.75rem;
              font-size: 0.95rem;
              border-radius: 10px;
              box-shadow: 0 6px 24px rgba(34, 197, 94, 0.5);
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            ">
              <span>🚀</span>
              <span>Start Ride (Live GPS) →</span>
            </button>
          </div>
        </div>

        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">Today's Practical Driving Classes — Mark Attendance</span>
            <span class="portal-section-meta">${totalCount} scheduled slots · ${presentCount} confirmed present</span>
          </div>
          <div class="p-table-wrap">
            <table class="p-table">
              <thead>
                <tr>
                  <th>Time Slot</th>
                  <th>Student Name</th>
                  <th>Day &amp; Progress</th>
                  <th>Today's Driving Lesson</th>
                  <th>Training Car</th>
                  <th>Attendance</th>
                  <th style="text-align:right;">Driving Notes</th>
                </tr>
              </thead>
              <tbody>
                ${schedule.map(slot => {
                  const trainee = allTrainees.find(t => t.id === slot.traineeId);
                  const pct = trainee ? Math.min(100, Math.round((trainee.currentDay/20)*100)) : 0;
                  return `
                    <tr class="${slot.attendance==='late'?'p-row-today':''}">
                      <td>
                        <div class="p-td-mono" style="font-size:0.9rem;">${slot.time}</div>
                        <div class="p-td-sub">${slot.duration || '60 min'}</div>
                      </td>
                      <td>
                        <div style="display:flex; align-items:center; gap:0.65rem;">
                          ${trainee ? renderStudentAvatar(trainee, 36) : ''}
                          <div>
                            <div class="p-td-name">${slot.studentName}</div>
                            <div class="p-td-sub">${slot.traineeId}</div>
                            <div class="p-td-sub">${trainee ? (trainee.phone || '') : ''}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="p-progress-wrap" style="margin-bottom:0.35rem;">
                          <div class="p-progress-track">
                            <div class="p-progress-fill" style="width:${pct}%;"></div>
                          </div>
                          <span class="p-progress-label">${pct}%</span>
                        </div>
                        <div class="p-td-sub">Day ${slot.day} of 20 · ${slot.day * 8} km</div>
                      </td>
                      <td>
                        <div style="font-size:0.875rem; font-weight:700; color:#ffffff;">${slot.topic}</div>
                        <div class="p-td-sub">8 km Daily Practical Lesson</div>
                      </td>
                      <td>
                        <div style="font-size:0.825rem; font-weight:600; color:var(--slate-body);">${slot.car || trainer.car}</div>
                        <span class="p-badge p-badge-dim" style="font-size:0.6rem; margin-top:0.25rem;">Dual-Control Car</span>
                      </td>
                      <td>
                        <div style="display:flex; gap:0.3rem; flex-wrap:wrap;">
                          <button type="button" class="btn-attendance ${slot.attendance==='present'?'present':''}" data-slot-id="${slot.id}" data-status="present" style="padding:0.35rem 0.65rem; border-radius:4px; font-size:0.75rem; font-weight:700; cursor:pointer; background:${slot.attendance==='present'?'#ffffff':'rgba(255,255,255,0.04)'}; border:1px solid ${slot.attendance==='present'?'#ffffff':'var(--border-light)'}; color:${slot.attendance==='present'?'#000000':'var(--slate-body)'};">
                            ✓ Present
                          </button>
                          <button type="button" class="btn-attendance ${slot.attendance==='late'?'late':''}" data-slot-id="${slot.id}" data-status="late" style="padding:0.35rem 0.65rem; border-radius:4px; font-size:0.75rem; font-weight:700; cursor:pointer; background:${slot.attendance==='late'?'rgba(255,255,255,0.12)':'rgba(255,255,255,0.04)'}; border:1px solid ${slot.attendance==='late'?'rgba(255,255,255,0.3)':'var(--border-light)'}; color:${slot.attendance==='late'?'#ffffff':'var(--slate-body)'};">
                            ⏱ Late
                          </button>
                          <button type="button" class="btn-attendance" data-slot-id="${slot.id}" data-status="absent" style="padding:0.35rem 0.65rem; border-radius:4px; font-size:0.75rem; font-weight:700; cursor:pointer; background:${slot.attendance==='absent'?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.03)'}; border:1px solid ${slot.attendance==='absent'?'rgba(255,255,255,0.2)':'var(--border-light)'}; color:${slot.attendance==='absent'?'#a1a1aa':'var(--slate-muted)'};">
                            ✕ Absent
                          </button>
                        </div>
                      </td>
                      <td style="text-align:right; white-space:nowrap;">
                        ${trainee && trainee.currentDay <= 20 && trainee.isActive ? `
                          <button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm btn-trainer-log-ride" data-trainee-id="${trainee.id}" style="margin-right:0.5rem; background:#22c55e; border-color:#22c55e; color:#000000; font-weight:800;">
                            🚀 Start Day ${trainee.currentDay} Ride (8 km Live Map)
                          </button>
                        ` : trainee && !trainee.isActive ? `
                          <span class="p-badge p-badge-green" style="font-size:0.65rem; margin-right:0.5rem;">Completed 🏁</span>
                        ` : ''}
                        <button type="button" class="p-link-btn btn-trainer-view-route" data-trainee-id="${slot.traineeId}" style="margin-right:0.6rem;">🗺️ Route Map</button>
                        <button type="button" class="p-link-btn btn-session-debrief" data-student="${slot.studentName}" data-topic="${slot.topic}">Driving Notes →</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // =========================================================
    // SERVICE 02: MY ASSIGNED STUDENTS DIRECTORY
    // =========================================================
    if (currentSub === 'candidates') {
      contentHtml = `
        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">My Assigned Students</h1>
            <p class="portal-page-sub">List of ${myTrainees.length} active students learning with Driving Instructor ${trainer.name}.</p>
          </div>
          <div class="portal-page-header-meta">
            <span class="p-badge p-badge-green">${myTrainees.length} Students Assigned</span>
            <span class="p-badge p-badge-dim">Training Car: ${trainer.car}</span>
          </div>
        </div>

        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">Students Driving Progress &amp; Lessons</span>
            <span class="portal-section-meta">${myTrainees.length} students assigned</span>
          </div>
          
          <div class="student-box-grid">
            ${myTrainees.map(t => {
              const pct = Math.min(100, Math.round((t.currentDay / 20) * 100));
              const initials = t.avatar || t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
              let stageName = t.currentDay <= 10 ? 'Stage 1 · Basic Driving' :
                              t.currentDay <= 15 ? 'Stage 2 · Intermediate Driving' :
                              'Stage 3 · Final Assessment & Parking';
              return `
                <div class="student-box-card">
                  <div>
                    <div class="student-box-header">
                      <div class="student-box-identity">
                        ${renderStudentBoxAvatar(t, 'background:#ffffff; border-color:#ffffff; color:#000000;')}
                        <div style="min-width:0;">
                          <div class="student-box-name">${t.name}</div>
                          <div class="student-box-meta-line">
                            <span class="p-badge p-badge-dim" style="font-size:0.62rem;">${t.id}</span>
                            <span style="font-family:var(--font-mono); color:#ffffff; font-size:0.72rem;">${t.permitNumber || 'AP004/LLR/2026/8941'}</span>
                          </div>
                        </div>
                      </div>

                      <span class="p-badge ${t.currentDay >= 18 ? 'p-badge-green' : 'p-badge-dim'}" style="font-size:0.65rem;">
                        ${t.currentDay >= 18 ? 'RTO Test Ready' : 'In Practicum'}
                      </span>
                    </div>

                    <div style="display:flex; align-items:center; gap:0.4rem; margin-top:0.75rem; flex-wrap:wrap;">
                      <span class="p-badge p-badge-dim" style="font-size:0.65rem; color:#ffffff; border-color:rgba(255,255,255,0.2);">
                        ${stageName}
                      </span>
                      <span style="font-size:0.72rem; color:var(--slate-muted);">•</span>
                      <span style="font-size:0.75rem; color:var(--slate-muted); font-weight:600;">${t.package.split('(')[0].trim()}</span>
                    </div>
                  </div>

                  <div class="student-box-body">
                    <div class="student-box-progress-wrap">
                      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem;">
                        <span style="font-weight:700; color:#ffffff;">Practical Course Progress</span>
                        <span style="font-weight:800; color:var(--neem-green); font-family:var(--font-mono);">${pct}% (Day ${t.currentDay}/20)</span>
                      </div>
                      <div class="student-box-progress-bar">
                        <div class="student-box-progress-fill" style="width:${pct}%;"></div>
                      </div>
                      <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--slate-muted);">
                        <span>${t.currentDay * 8} km logged</span>
                        <span>Target: 160 km</span>
                      </div>
                    </div>

                    <div class="student-box-info-grid">
                      <div class="student-box-info-item">
                        <span class="student-box-info-label">Attendance Rate</span>
                        <span class="student-box-info-val" style="color:var(--neem-green);">${t.attendanceRate || '100%'} On-Time</span>
                      </div>
                      <div class="student-box-info-item">
                        <span class="student-box-info-label">Student Phone</span>
                        <span class="student-box-info-val">📞 ${t.phone || '+91 98480 22334'}</span>
                      </div>
                    </div>
                  </div>

                  <div class="student-box-footer" style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                    <span style="font-size:0.72rem; color:var(--slate-muted);">Car: <strong>${trainer.car}</strong></span>
                    ${t.isActive && t.currentDay <= 20 ? `
                      <button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm btn-trainer-log-ride" data-trainee-id="${t.id}" style="background:#22c55e; border-color:#22c55e; color:#000000; font-weight:800; padding:0.35rem 0.75rem; font-size:0.75rem;">
                        🚀 Start Day ${t.currentDay} Ride (8 km Live Map)
                      </button>
                    ` : `
                      <span class="p-badge p-badge-green" style="font-size:0.65rem;">Course Completed 🏁</span>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // =========================================================
    // SERVICE 03: SAFETY VEHICLE INSPECTION & DUAL-BRAKE LOG
    // =========================================================
    if (currentSub === 'vehicle') {
      contentHtml = `
        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">Training Car Daily Safety Inspection</h1>
            <p class="portal-page-sub">Daily morning car safety inspection: dual-brake pedal verification, tires, mirrors, and safety check.</p>
          </div>
          <div class="portal-page-header-meta">
            <button type="button" class="btn-mnc btn-mnc-primary" id="btn-trainer-verify-brakes">Complete Morning Safety Check ✓</button>
          </div>
        </div>

        <div class="portal-stats-strip">
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">PASSED</span>
            <span class="portal-stat-label">Dual-Brake Check</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">8.0 km</span>
            <span class="portal-stat-label">Daily Lesson Distance</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">CHECKED</span>
            <span class="portal-stat-label">Tire &amp; Mirror Check</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">READY</span>
            <span class="portal-stat-label">Vehicle Readiness</span>
          </div>
        </div>

        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">Car Specifications &amp; Daily Checklist</span>
            <span class="portal-section-meta">${trainer.car}</span>
          </div>
          <div class="p-detail-grid">
            <div class="p-detail-cell">
              <div class="p-detail-key">Assigned Training Car</div>
              <div class="p-detail-value">${trainer.car}</div>
              <div class="p-detail-sub">Pulivendula Academy Training Car</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">Dual Controls</div>
              <div class="p-detail-value" style="color:var(--neem-green);">Dual-Brake Pedal Installed</div>
              <div class="p-detail-sub">Instructor emergency brake pedal active</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">Inspection Compliance</div>
              <div class="p-detail-value">AP RTO Verified</div>
              <div class="p-detail-sub">Safety inspection passed</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">Safety Equipment</div>
              <div class="p-detail-value">First Aid Kit &amp; Dual Mirrors</div>
              <div class="p-detail-sub">Instructor dual control verification</div>
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="portal-shell">
        ${contentHtml}
      </div>
    `;

    // Attach navigation events
    container.querySelectorAll('[data-trainer-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetSub = btn.dataset.trainerNav;
        if (onNavigate) {
          onNavigate(targetSub);
        } else {
          renderTrainerView(container, showToast, targetSub, onNavigate);
        }
      });
    });

    // Attendance buttons
    container.querySelectorAll('.btn-attendance').forEach(btn => {
      btn.addEventListener('click', () => {
        const slotId = btn.dataset.slotId;
        const status = btn.dataset.status;
        const slot   = store.schedule.find(s => s.id === slotId);
        store.updateAttendance(slotId, status);
        showToast(`${slot.studentName} marked ${status.toUpperCase()}`, 'success');
        render();
      });
    });

    // Instructor Quick Start GPS Ride from Command Card
    const btnQuickStartGps = container.querySelector('#btn-trainer-quick-start-gps');
    if (btnQuickStartGps) {
      btnQuickStartGps.addEventListener('click', () => {
        const select = container.querySelector('#trainer-quick-select-student');
        const selectedId = select ? select.value : (myTrainees[0]?.id);
        const trainee = allTrainees.find(t => t.id === selectedId) || myTrainees[0];
        if (!trainee) {
          showToast('No active student candidate found to start ride', 'warning');
          return;
        }
        const dayToComplete = trainee.currentDay || 1;
        const sched = store.getStudentSchedule(trainee.id);
        const session = sched?.sessions?.find(s => s.dayNumber === dayToComplete) || {
          dayNumber: dayToComplete,
          objective: 'Practical Road Driving Lesson (8.0 km)',
          date: new Date().toISOString().split('T')[0]
        };

        openLiveRideMapModal({
          session,
          student: trainee,
          trainer,
          canTrainerComplete: true,
          onRideCompleted: () => {
            showToast(`Day ${dayToComplete} 8.0 km ride completed for ${trainee.name} ✓`, 'success');
            render();
          }
        });
      });
    }

    // Trainer Start / Log Ride (Opens Live 8km Map from Table Rows)
    container.querySelectorAll('.btn-trainer-log-ride').forEach(btn => {
      btn.addEventListener('click', () => {
        const traineeId = btn.dataset.traineeId;
        const trainee = allTrainees.find(t => t.id === traineeId);
        if (!trainee) return;
        const dayToComplete = trainee.currentDay;
        const sched = store.getStudentSchedule(traineeId);
        const session = sched?.sessions?.find(s => s.dayNumber === dayToComplete) || {
          dayNumber: dayToComplete,
          objective: 'Practical Road Driving',
          date: '2026-10-01'
        };

        openLiveRideMapModal({
          session,
          student: trainee,
          trainer,
          canTrainerComplete: true,
          onRideCompleted: () => {
            showToast(`Day ${dayToComplete} 8.0 km ride completed for ${trainee.name} ✓`, 'success');
            render();
          }
        });
      });
    });

    // Route map buttons
    container.querySelectorAll('.btn-trainer-view-route').forEach(btn => {
      btn.addEventListener('click', () => {
        const traineeId = btn.dataset.traineeId;
        const trainee = allTrainees.find(t => t.id === traineeId);
        const sched = store.getStudentSchedule(traineeId);
        const dayNum = trainee?.currentDay || 1;
        const session = sched?.sessions?.find(s => s.dayNumber === dayNum) || sched?.sessions?.[0];
        if (session) {
          openRouteMapModal({
            session,
            studentName: trainee ? trainee.name : 'Student',
            carInfo: trainer.car
          });
        }
      });
    });

    // Debrief remarks
    container.querySelectorAll('.btn-session-debrief').forEach(btn => {
      btn.addEventListener('click', () => openDebriefModal(btn.dataset.student, btn.dataset.topic));
    });

    // Vehicle check button
    const btnVerifyBrakes = container.querySelector('#btn-trainer-verify-brakes');
    if (btnVerifyBrakes) {
      btnVerifyBrakes.addEventListener('click', () => {
        showToast('Morning Car Safety Check Completed: Dual-brake control & safety equipment verified ✓', 'success');
      });
    }
  }

  function openDebriefModal(student, topic) {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="p-modal">
          <div class="p-modal-header">
            <div>
              <div class="p-modal-title">Student Driving Notes &amp; Evaluation</div>
              <div class="p-modal-sub">${student} · ${topic}</div>
            </div>
            <button type="button" id="btn-close-debrief" class="p-modal-close">✕</button>
          </div>
          <form id="form-debrief" class="p-modal-body">
            <div class="p-form-row" style="margin-bottom:1.1rem;">
              <label class="p-label">Clutch Control &amp; Steering Assessment</label>
              <select class="mnc-select p-input" name="proficiency">
                <option value="Excellent">Excellent — Smooth clutch control &amp; braking</option>
                <option value="Good">Good — Smooth driving, needs minor practice in traffic</option>
                <option value="Satisfactory">Satisfactory — Needs more town road practice</option>
                <option value="Needs Practice">Needs Practice — Practice stopping and starting on slope</option>
              </select>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.1rem;">
              <div class="p-form-row">
                <label class="p-label">Distance Logged</label>
                <input type="text" class="mnc-input p-input" name="distance" value="8.0 km (Daily lesson completed)" readonly />
              </div>
              <div class="p-form-row">
                <label class="p-label">RTO 8-Track Score</label>
                <input type="text" class="mnc-input p-input" name="penalties" value="Passed without stopping" />
              </div>
            </div>
            <div class="p-form-row" style="margin-bottom:1.25rem;">
              <label class="p-label">Instructor Driving Notes</label>
              <textarea class="mnc-input p-input" rows="4" name="notes" placeholder="e.g. Smooth clutch release. Completed 8-track smoothly. Good road observation." style="resize:vertical;">Smooth clutch release. Completed 8-track smoothly.</textarea>
            </div>
            <div class="p-modal-footer">
              <button type="button" class="p-ghost-btn" id="btn-cancel-debrief">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Save Driving Notes →</button>
            </div>
          </form>
        </div>
      </div>
    `;
    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-debrief').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-debrief').addEventListener('click', close);
    modalRoot.querySelector('#form-debrief').addEventListener('submit', e => {
      e.preventDefault();
      close();
      showToast(`Driving notes saved for ${student}`, 'success');
    });
  }

  render();
}
