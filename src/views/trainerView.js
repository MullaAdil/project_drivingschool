/* ==========================================================================
   GAFOOR DRIVING SCHOOL — TRAINER DISPATCH DASHBOARD (PULIVENDULA)
   Attendance & Slot Management:
   - One-tap attendance verification (Present / Absent / Late)
   - Synchronized in real-time with academy HQ & student portal
   - Dual-control vehicle tracking (Maruti Swift #AP-04-ED-4041)
   ========================================================================== */

import { store } from '../store.js';
import { renderBrandLogo } from '../components/brandLogo.js';

export function renderTrainerView(container, showToast) {
  function render() {
    const trainer = store.trainers[0]; // K. Srinivas Rao
    const schedule = store.schedule;
    const presentCount = schedule.filter(s => s.attendance === 'present').length;
    const totalCount = schedule.length;

    const template = `
      <div>
        <!-- Institutional Clean Page Banner with Official Logo -->
        <div class="clean-page-banner">
          <div class="banner-brand-left">
            ${renderBrandLogo({ size: 'banner' })}
            <div class="banner-title-block">
              <h2>GAFOOR <span>DRIVING SCHOOL</span></h2>
              <div class="banner-sub-meta">
                <span class="tagline-quote">"Walk in &amp; Drive out"</span>
                <span>•</span>
                <span>Senior Instructor Operations Desk</span>
                <span>•</span>
                <span>Pulivendula Academy Dispatch</span>
              </div>
            </div>
          </div>
          <div class="banner-pills-right">
            <span class="clean-gold-badge">★ Senior Master Faculty</span>
            <span class="clean-info-badge">Examiner: ${trainer.name}</span>
            <span class="kpi-pill kpi-pill-green">AP MVI Certified #AP-MVI-2024</span>
          </div>
        </div>

        <!-- Pulivendula Route & Fleet Inspection Advisory Strip -->
        <div class="route-advisory-box">
          <div class="route-advisory-left">
            <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: rgba(0, 245, 155, 0.1); border: 1px solid rgba(0, 245, 155, 0.28); display: flex; align-items: center; justify-content: center; font-size: 1.35rem; flex-shrink: 0;">
              🛡️
            </div>
            <div class="route-advisory-text">
              <h4>Dual-Control Vehicle &amp; Pulivendula Circuit Telemetry</h4>
              <p>Fleet Unit: <strong>${trainer.car}</strong> (Dual-Brake &amp; Sensor Calibration Cleared at 07:00 AM ✓) · JNTU Pulivendula Bypass &amp; Kadapa Road Tracks Active</p>
            </div>
          </div>
          <div style="display: flex; gap: 0.65rem; align-items: center; flex-wrap: wrap;">
            <span class="kpi-pill kpi-pill-green" style="font-size: 0.75rem;">Dual-Brake Tested OK</span>
            <span class="clean-gold-badge" style="font-size: 0.75rem;">Shilparamam Ground Track Clear</span>
          </div>
        </div>

        <div class="page-title-row">
          <div>
            <h1>Daily Instructor Schedule & Attendance Dispatch</h1>
            <p class="page-subtitle">Mark candidate arrival with one-tap verification and log real-time session debrief remarks.</p>
          </div>
          <div>
            <span class="kpi-pill kpi-pill-green" style="padding: 0.4rem 0.85rem; font-size: 0.8125rem;">
              Safety Vehicle: ${trainer.car}
            </span>
          </div>
        </div>

        <div class="kpi-row">
          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">Today's Slots</span>
              <span class="kpi-pill kpi-pill-blue">Active</span>
            </div>
            <div class="kpi-value">${totalCount} Appointments</div>
            <div class="kpi-sub">Shift: 07:30 AM – 05:30 PM</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">Checked-In Candidates</span>
              <span class="kpi-pill kpi-pill-green">${presentCount} Present</span>
            </div>
            <div class="kpi-value" style="color: var(--neem-green);">${presentCount} / ${totalCount} Checked In</div>
            <div class="kpi-sub">Synchronized with Head Office & Student Portal</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">Instructor Rating</span>
              <span class="kpi-pill kpi-pill-green">Top Grade</span>
            </div>
            <div class="kpi-value" style="color: var(--turmeric);">★ 4.96 / 5.0</div>
            <div class="kpi-sub">${trainer.name} · Senior Master</div>
          </div>
        </div>

        <!-- Today's Schedule Table -->
        <div class="product-table-box">
          <div class="product-toolbar">
            <div style="font-weight: 800; font-size: 1rem; color: var(--charcoal);">
              Today's Driving Schedule Roster
            </div>
            <div style="font-size: 0.8125rem; color: var(--terracotta); font-weight: 700;">
              1-Tap Attendance Verification Active
            </div>
          </div>

          <div style="overflow-x: auto;">
            <table class="mnc-table">
              <thead>
                <tr>
                  <th>Time Slot</th>
                  <th>Candidate Name</th>
                  <th>Syllabus Milestone</th>
                  <th>Dual-Control Unit</th>
                  <th>Attendance Verification (1-Tap)</th>
                  <th style="text-align: right;">Lesson Debrief</th>
                </tr>
              </thead>
              <tbody>
                ${schedule.map(slot => `
                  <tr>
                    <td style="font-weight: 800; color: var(--charcoal); min-width: 130px;">
                      ${slot.time}
                    </td>
                    <td>
                      <div style="font-weight: 700; color: var(--charcoal); font-size: 0.95rem;">${slot.studentName}</div>
                      <div style="font-size: 0.75rem; color: var(--slate-muted);">${slot.traineeId}</div>
                    </td>
                    <td style="font-size: 0.85rem;">${slot.topic}</td>
                    <td style="font-weight: 600; color: var(--charcoal); font-size: 0.825rem;">${slot.car}</td>
                    <td>
                      <div style="display: inline-flex; background: var(--bg-canvas); padding: 3px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); gap: 4px;">
                        <button type="button" class="btn-attendance btn-mnc-sm" data-slot-id="${slot.id}" data-status="present" style="border: none; padding: 0.35rem 0.75rem; font-size: 0.75rem; font-weight: 700; border-radius: var(--radius-sm); cursor: pointer; background: ${slot.attendance === 'present' ? 'var(--neem-green)' : 'transparent'}; color: ${slot.attendance === 'present' ? '#ffffff' : 'var(--slate-muted)'};">
                          Present
                        </button>
                        <button type="button" class="btn-attendance btn-mnc-sm" data-slot-id="${slot.id}" data-status="absent" style="border: none; padding: 0.35rem 0.75rem; font-size: 0.75rem; font-weight: 700; border-radius: var(--radius-sm); cursor: pointer; background: ${slot.attendance === 'absent' ? '#dc2626' : 'transparent'}; color: ${slot.attendance === 'absent' ? '#ffffff' : 'var(--slate-muted)'};">
                          Absent
                        </button>
                        <button type="button" class="btn-attendance btn-mnc-sm" data-slot-id="${slot.id}" data-status="late" style="border: none; padding: 0.35rem 0.75rem; font-size: 0.75rem; font-weight: 700; border-radius: var(--radius-sm); cursor: pointer; background: ${slot.attendance === 'late' ? 'var(--turmeric)' : 'transparent'}; color: ${slot.attendance === 'late' ? '#1c1917' : 'var(--slate-muted)'};">
                          Late
                        </button>
                      </div>
                    </td>
                    <td style="text-align: right;">
                      <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-session-debrief" data-student="${slot.studentName}" data-topic="${slot.topic}">
                        Log Remarks
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = template;

    // Attendance buttons
    container.querySelectorAll('.btn-attendance').forEach(btn => {
      btn.addEventListener('click', () => {
        const slotId = btn.dataset.slotId;
        const status = btn.dataset.status;
        const slot = store.schedule.find(s => s.id === slotId);
        store.updateAttendance(slotId, status);
        showToast(`Attendance updated: ${slot.studentName} → ${status.toUpperCase()}`, 'success');
        render();
      });
    });

    // Session debrief remarks
    container.querySelectorAll('.btn-session-debrief').forEach(btn => {
      btn.addEventListener('click', () => {
        const student = btn.dataset.student;
        const topic = btn.dataset.topic;
        openDebriefModal(student, topic);
      });
    });
  }

  function openDebriefModal(student, topic) {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="kpi-card" style="max-width: 480px; width: 100%; padding: 0; overflow: hidden; border: 1px solid var(--border-light);">
          <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; background: var(--bg-canvas);">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              ${renderBrandLogo({ size: 'sm' })}
              <div>
                <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--charcoal); margin: 0;">Driving Session Debrief Log</h3>
                <p style="font-size: 0.775rem; color: var(--slate-muted); margin: 0.15rem 0 0 0;">${student} · ${topic} · Pulivendula Circuit</p>
              </div>
            </div>
            <button type="button" id="btn-close-debrief" style="background: transparent; border: none; font-size: 1.25rem; cursor: pointer; color: var(--slate-muted);">✕</button>
          </div>

          <form id="form-debrief" style="padding: 1.5rem;">
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.35rem;">
                Clutch Control & Steering Proficiency
              </label>
              <select class="mnc-select" name="proficiency" style="width: 100%;">
                <option value="Excellent">Excellent — Biting point & progressive braking on target</option>
                <option value="Satisfactory">Satisfactory — Needs more practice in bumper-to-bumper city traffic</option>
                <option value="Needs Practice">Needs Practice — Half-clutch hill hold balance must be repeated</option>
              </select>
            </div>

            <div style="margin-bottom: 1.25rem;">
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.35rem;">
                Today's Logged Road Distance
              </label>
              <input type="text" class="mnc-input" name="distance" value="8.0 km (Daily Curriculum Target Completed)" readonly style="background: var(--bg-canvas);" />
            </div>

            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.35rem;">
                Instructor Field Notes
              </label>
              <textarea class="mnc-input" rows="3" name="notes" placeholder="Notes on reverse parking, gear synchronization..." style="width: 100%; resize: vertical;">Candidate demonstrated smooth clutch release and passed RTO 8-track maneuvers with zero sensor penalties.</textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--border-light);">
              <button type="button" class="btn-mnc btn-mnc-secondary" id="btn-cancel-debrief">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Save Remarks ✓</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-debrief').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-debrief').addEventListener('click', close);

    const form = modalRoot.querySelector('#form-debrief');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      close();
      showToast(`Session remarks saved successfully for ${student}!`, 'success');
    });
  }

  // Initial render
  render();
}
