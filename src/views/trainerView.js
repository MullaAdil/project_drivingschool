/* ==========================================================================
   GAFOOR DRIVING SCHOOL — TRAINER DISPATCH CONSOLE
   Full-page layout fitting 100% viewport width without spaces.
   Dedicated services bound as distinct pages:
   - Service 01: Daily Schedule & One-Tap Attendance
   - Service 02: My Assigned Candidates Directory
   - Service 03: Safety Vehicle Inspection & Dual-Brake Log
   ========================================================================== */

import { store, formatReadableDate, getLocalTodayDate } from '../store.js';
import { renderBrandLogo } from '../components/brandLogo.js';
import { renderStudentBoxAvatar, renderStudentAvatar } from '../components/studentAvatar.js';

export function renderTrainerView(container, showToast, subService = 'schedule', onNavigate) {
  let selectedDate = store.getTodayDateStr();

  function render() {
    const trainer      = store.trainers[0];
    const allTrainees  = store.trainees;
    const myTrainees   = allTrainees.filter(t => t.assignedTrainerId === trainer.id);

    // Active slots for selected date assigned to this trainer
    const daySlots = store.getSlotsForDate(selectedDate);
    const myAssignedSessions = [];
    daySlots.forEach(slot => {
      const myAlloc = slot.trainerAllocations.find(a => a.trainerId === trainer.id);
      if (myAlloc) {
        myAssignedSessions.push({
          slot,
          alloc: myAlloc,
          bookings: myAlloc.bookings
        });
      }
    });

    const presentCount = store.slotBookings.filter(b => b.trainerId === trainer.id && b.date === selectedDate && b.status === 'CONFIRMED' && b.attendance === 'present').length;
    const totalCount   = myAssignedSessions.reduce((acc, s) => acc + s.bookings.length, 0);
    const totalKm      = myTrainees.reduce((a, t) => a + (t.currentDay * 8), 0);

    const currentSub = subService || 'schedule';

    const topbar = '';

    let contentHtml = '';

    // =========================================================
    // SERVICE 01: DAILY SCHEDULE & ONE-TAP ATTENDANCE
    // Trainer sees ONLY their own assigned sessions and candidates (Max 2 per slot)
    // =========================================================
    if (currentSub === 'schedule' || currentSub === 'slots') {
      // Generate next 4 quick dates
      const quickDates = [];
      const baseDt = new Date();
      for (let i = 0; i < 4; i++) {
        const d = new Date(baseDt);
        d.setDate(d.getDate() + i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dtStr = `${y}-${m}-${day}`;
        const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
        quickDates.push({ dateStr: dtStr, label });
      }

      contentHtml = `
        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">My Driving Slots &amp; Attendance Register</h1>
            <p class="portal-page-sub">Instructor ${trainer.name} · View assigned driving sessions, mark candidate attendance, and record training debriefs.</p>
          </div>
          <div class="portal-page-header-meta">
            <span class="p-badge p-badge-dim">Assigned Car: ${trainer.car.split('Dual-Ctrl')[0]}</span>
            <span class="p-badge p-badge-dim">Max 2 Learners / Slot</span>
            <span class="p-badge p-badge-green">★ ${trainer.rating} / 5.0</span>
          </div>
        </div>

        <!-- DATE SELECTOR STRIP -->
        <div class="slot-date-nav">
          <span style="font-size:0.875rem; font-weight:800; color:#ffffff; margin-right:0.35rem;">Roster Date:</span>
          ${quickDates.map(qd => `
            <button type="button" class="slot-quick-date-btn ${selectedDate === qd.dateStr ? 'active' : ''}" data-trainer-date="${qd.dateStr}">
              📅 ${qd.label}
            </button>
          `).join('')}
          <div style="display:flex; align-items:center; gap:0.45rem; margin-left:auto;">
            <label style="font-size:0.75rem; color:var(--slate-muted); font-weight:700;">Custom Date:</label>
            <input type="date" class="mnc-input" id="inp-trainer-custom-date" value="${selectedDate}" style="padding:0.4rem 0.65rem; font-size:0.8125rem; width:150px;" />
          </div>
        </div>

        <!-- STATS STRIP -->
        <div class="portal-stats-strip">
          <div class="portal-stat">
            <span class="portal-stat-value">${myAssignedSessions.length}</span>
            <span class="portal-stat-label">Active Slots Today</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">${totalCount}</span>
            <span class="portal-stat-label">Booked Learners</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${myAssignedSessions.length * 2}</span>
            <span class="portal-stat-label">Total Seat Capacity</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">${presentCount}</span>
            <span class="portal-stat-label">Marked Present</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${myTrainees.length}</span>
            <span class="portal-stat-label">Assigned Students</span>
          </div>
        </div>

        <!-- PERMISSIONS ADVISORY -->
        <div style="padding:0.75rem 2rem; background:rgba(255,255,255,0.02); border-bottom:1px solid var(--border-light); font-size:0.75rem; color:var(--slate-muted); display:flex; align-items:center; justify-content:space-between;">
          <span>🔒 Instructor Access: You see only your assigned training slots. Maximum 2 candidates per slot. Master scheduling &amp; allocations are managed by Administration.</span>
          <span class="p-badge p-badge-dim" style="font-size:0.65rem;">Date: ${formatReadableDate(selectedDate)}</span>
        </div>

        <!-- ASSIGNED SLOTS LIST -->
        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">My Assigned Road Sessions (${formatReadableDate(selectedDate)})</span>
            <span class="portal-section-meta">${myAssignedSessions.length} slots · ${totalCount} assigned learners</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:1.25rem;">
            ${myAssignedSessions.map(({ slot, alloc, bookings }) => {
              const isFull = alloc.status === 'FULL';
              const isAlmost = bookings.length === 1;
              return `
                <div style="background:rgba(18,20,26,0.85); border:1px solid rgba(255,255,255,0.1); border-radius:var(--radius-md); padding:1.25rem 1.5rem;">
                  <!-- Slot Header -->
                  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.07); padding-bottom:0.85rem; margin-bottom:1rem; flex-wrap:wrap; gap:0.65rem;">
                    <div>
                      <div style="font-size:1.1rem; font-weight:800; color:#ffffff; font-family:var(--font-mono);">${slot.timeDisplay}</div>
                      <div style="font-size:0.75rem; color:var(--slate-muted); margin-top:0.2rem;">
                        🚗 Training Vehicle: <strong style="color:var(--slate-body);">${alloc.vehicle}</strong>
                      </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                      <div style="text-align:right;">
                        <span style="font-size:0.8125rem; font-weight:800; color:${isFull ? '#f87171' : '#ffffff'}; font-family:var(--font-mono);">
                          Capacity: ${alloc.booked}/${alloc.capacity}
                        </span>
                        <div style="font-size:0.7rem; color:var(--slate-muted);">${alloc.availableSeats} seat${alloc.availableSeats !== 1 ? 's' : ''} available</div>
                      </div>
                      <span class="slot-status-pill ${isFull ? 'status-pill-full' : isAlmost ? 'status-pill-almost' : 'status-pill-available'}">
                        ${alloc.status}
                      </span>
                    </div>
                  </div>

                  <!-- Assigned Learners (Max 2) -->
                  <div>
                    <div style="font-size:0.75rem; font-weight:800; color:var(--slate-muted); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:0.75rem;">
                      Assigned Learners (${bookings.length} / 2 Maximum)
                    </div>

                    ${bookings.length === 0 ? `
                      <div style="padding:1.25rem; border-radius:4px; background:rgba(255,255,255,0.02); border:1px dashed rgba(255,255,255,0.1); text-align:center; font-size:0.825rem; color:var(--slate-muted);">
                        No candidates booked yet for this session (2 seats open).
                      </div>
                    ` : `
                      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:1rem;">
                        ${bookings.map((bk, idx) => {
                          const trainee = allTrainees.find(t => t.id === bk.traineeId) || { name: bk.traineeName, id: bk.traineeId, currentDay: 7, phone: '+91 98480 00000' };
                          const attStatus = bk.attendance || 'scheduled';
                          return `
                            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-sm); padding:1rem; display:flex; flex-direction:column; justify-content:space-between;">
                              <div>
                                <div style="display:flex; align-items:center; gap:0.65rem; margin-bottom:0.65rem;">
                                  <div style="width:24px; height:24px; border-radius:50%; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800; color:#ffffff;">
                                    ${idx + 1}
                                  </div>
                                  <div>
                                    <div style="font-size:0.95rem; font-weight:800; color:#ffffff;">${bk.traineeName}</div>
                                    <div style="font-size:0.75rem; color:var(--slate-muted);">${bk.traineeId} · ${trainee.phone || ''}</div>
                                  </div>
                                </div>
                                <div style="font-size:0.75rem; color:var(--slate-body); margin-bottom:0.85rem;">
                                  Course Day ${trainee.currentDay || 1} of 20 · ${bk.course}
                                </div>
                              </div>

                              <div style="display:flex; align-items:center; justify-content:space-between; gap:0.4rem; padding-top:0.65rem; border-top:1px solid rgba(255,255,255,0.05); flex-wrap:wrap;">
                                <div style="display:flex; gap:0.25rem;">
                                  <button type="button" class="btn-attendance-action ${attStatus === 'present' ? 'active-present' : ''}" data-booking-id="${bk.id}" data-status="present" style="padding:0.3rem 0.55rem; border-radius:4px; font-size:0.72rem; font-weight:700; cursor:pointer; background:${attStatus==='present'?'#ffffff':'rgba(255,255,255,0.04)'}; color:${attStatus==='present'?'#000000':'var(--slate-body)'}; border:1px solid ${attStatus==='present'?'#ffffff':'var(--border-light)'};">
                                    ✓ Present
                                  </button>
                                  <button type="button" class="btn-attendance-action ${attStatus === 'late' ? 'active-late' : ''}" data-booking-id="${bk.id}" data-status="late" style="padding:0.3rem 0.55rem; border-radius:4px; font-size:0.72rem; font-weight:700; cursor:pointer; background:${attStatus==='late'?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.04)'}; color:#ffffff; border:1px solid ${attStatus==='late'?'#ffffff':'var(--border-light)'};">
                                    ⏱ Late
                                  </button>
                                  <button type="button" class="btn-attendance-action ${attStatus === 'absent' ? 'active-absent' : ''}" data-booking-id="${bk.id}" data-status="absent" style="padding:0.3rem 0.55rem; border-radius:4px; font-size:0.72rem; font-weight:700; cursor:pointer; background:${attStatus==='absent'?'rgba(239,68,68,0.2)':'rgba(255,255,255,0.04)'}; color:${attStatus==='absent'?'#f87171':'var(--slate-muted)'}; border:1px solid ${attStatus==='absent'?'rgba(239,68,68,0.4)':'var(--border-light)'};">
                                    ✕ Absent
                                  </button>
                                </div>
                                <button type="button" class="p-link-btn btn-session-debrief" data-student="${bk.traineeName}" data-topic="Day ${trainee.currentDay}: On-road Practice" style="font-size:0.75rem;">
                                  Notes →
                                </button>
                              </div>
                            </div>
                          `;
                        }).join('')}
                      </div>
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
              let stageName = t.currentDay <= 2 ? 'Stage 1 · LLR Intake' :
                              t.currentDay <= 7 ? 'Stage 2 · Ground Practice' :
                              t.currentDay <= 15 ? 'Stage 3 · Town Driving' :
                              t.currentDay <= 19 ? 'Stage 4 · RTO 8-Track' : 'Stage 5 · Test Ready';
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

                  <div class="student-box-footer">
                    <span style="font-size:0.72rem; color:var(--slate-muted);">Assigned Car: <strong>${trainer.car}</strong></span>
                    <span class="p-badge p-badge-green" style="font-size:0.62rem;">Dual-Control OK</span>
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
            <span class="portal-stat-label">Dual-Brake Status</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${totalKm.toLocaleString('en-IN')} km</span>
            <span class="portal-stat-label">Total Distance Logged</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--primary-cyan);">45.2 PSI</span>
            <span class="portal-stat-label">Brake Master Pressure</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">100%</span>
            <span class="portal-stat-label">Speed Governor Active</span>
          </div>
        </div>

        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">Car Safety Specifications &amp; Inspection Checklist</span>
            <span class="portal-section-meta">${trainer.car}</span>
          </div>
          <div class="p-detail-grid">
            <div class="p-detail-cell">
              <div class="p-detail-key">Assigned Training Car</div>
              <div class="p-detail-value">${trainer.car}</div>
              <div class="p-detail-sub">Pulivendula Academy Training Fleet</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">Dual Controls</div>
              <div class="p-detail-value" style="color:var(--neem-green);">Dual-Pedal Hydraulic Override</div>
              <div class="p-detail-sub">Instructor emergency brake pedal active</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">RTO Inspection Compliance</div>
              <div class="p-detail-value">AP RTO Verified (Valid 2027)</div>
              <div class="p-detail-sub">Safety inspection passed Sept 2026</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">Safety Equipment</div>
              <div class="p-detail-value">Speed Governor (40 km/h)</div>
              <div class="p-detail-sub">Instructor dual control &amp; first aid kit</div>
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

    // Quick Date Buttons for Trainer Roster
    container.querySelectorAll('[data-trainer-date]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedDate = btn.dataset.trainerDate;
        render();
      });
    });

    const inpTrainerDate = container.querySelector('#inp-trainer-custom-date');
    if (inpTrainerDate) {
      inpTrainerDate.addEventListener('change', (e) => {
        if (e.target.value) {
          selectedDate = e.target.value;
          render();
        }
      });
    }

    // Attendance buttons for slot bookings
    container.querySelectorAll('.btn-attendance-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const bookingId = btn.dataset.bookingId;
        const status = btn.dataset.status;
        const booking = store.slotBookings.find(b => b.id === bookingId);
        if (booking) {
          booking.attendance = status;
          store.saveState();
          showToast(`${booking.traineeName} marked ${status.toUpperCase()}`, 'success');
          render();
        }
      });
    });

    // Legacy attendance buttons
    container.querySelectorAll('.btn-attendance').forEach(btn => {
      btn.addEventListener('click', () => {
        const slotId = btn.dataset.slotId;
        const status = btn.dataset.status;
        const slot   = store.schedule.find(s => s.id === slotId);
        if (slot) {
          store.updateAttendance(slotId, status);
          showToast(`${slot.studentName} marked ${status.toUpperCase()}`, 'success');
          render();
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
