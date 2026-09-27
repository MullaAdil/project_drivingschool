/* ==========================================================================
   GAFOOR DRIVING SCHOOL — TRAINER DISPATCH PORTAL
   Redesigned: flat premium dark layout, no blocks, no animations
   ========================================================================== */

import { store } from '../store.js';
import { renderBrandLogo } from '../components/brandLogo.js';

export function renderTrainerView(container, showToast) {
  function render() {
    const trainer = store.trainers[0];
    const schedule = store.schedule;
    const presentCount = schedule.filter(s => s.attendance === 'present').length;
    const absentCount  = schedule.filter(s => s.attendance === 'absent').length;
    const totalCount   = schedule.length;

    const template = `
      <div class="portal-shell">

        <!-- PORTAL TOPBAR -->
        <div class="portal-topbar">
          <div class="portal-topbar-left">
            ${renderBrandLogo({ size: 'sm' })}
            <div class="portal-topbar-brand">
              <span class="portal-topbar-title">Gafoor Driving School</span>
              <span class="portal-topbar-sub">Instructor Dispatch · Pulivendula</span>
            </div>
          </div>
          <div class="portal-topbar-right">
            <span class="p-badge p-badge-green">AP-MVI-2024 Certified</span>
            <span class="p-badge p-badge-dim">${trainer.name}</span>
          </div>
        </div>

        <!-- PAGE HEADER -->
        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">Daily Dispatch Schedule</h1>
            <p class="portal-page-sub">Mark attendance and log session remarks for today's road sessions.</p>
          </div>
          <div class="portal-page-header-meta">
            <span class="p-badge p-badge-dim">Vehicle: ${trainer.car}</span>
            <span class="p-badge p-badge-dim">Shift: 07:30 AM – 05:30 PM</span>
          </div>
        </div>

        <!-- FLAT STATS STRIP -->
        <div class="portal-stats-strip">
          <div class="portal-stat">
            <span class="portal-stat-value">${totalCount}</span>
            <span class="portal-stat-label">Total Slots</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color: var(--neem-green);">${presentCount}</span>
            <span class="portal-stat-label">Present</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color: var(--primary-gold);">${absentCount}</span>
            <span class="portal-stat-label">Absent / Late</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color: var(--primary-gold);">★ 4.96</span>
            <span class="portal-stat-label">Instructor Rating</span>
          </div>
        </div>

        <!-- SCHEDULE TABLE -->
        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">Today's Roster</span>
            <span class="portal-section-meta">1-tap attendance verification</span>
          </div>

          <div class="p-table-wrap">
            <table class="p-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Candidate</th>
                  <th>Topic</th>
                  <th>Vehicle</th>
                  <th>Attendance</th>
                  <th style="text-align:right;">Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${schedule.map(slot => `
                  <tr>
                    <td class="p-td-mono">${slot.time}</td>
                    <td>
                      <div class="p-td-name">${slot.studentName}</div>
                      <div class="p-td-sub">${slot.traineeId}</div>
                    </td>
                    <td class="p-td-muted">${slot.topic}</td>
                    <td class="p-td-muted">${slot.car.split(' ')[0]}</td>
                    <td>
                      <div class="p-att-group">
                        <button type="button" class="p-att-btn btn-attendance ${slot.attendance === 'present' ? 'p-att-present' : ''}" data-slot-id="${slot.id}" data-status="present">Present</button>
                        <button type="button" class="p-att-btn btn-attendance ${slot.attendance === 'absent'  ? 'p-att-absent'  : ''}" data-slot-id="${slot.id}" data-status="absent">Absent</button>
                        <button type="button" class="p-att-btn btn-attendance ${slot.attendance === 'late'    ? 'p-att-late'    : ''}" data-slot-id="${slot.id}" data-status="late">Late</button>
                      </div>
                    </td>
                    <td style="text-align:right;">
                      <button type="button" class="p-link-btn btn-session-debrief" data-student="${slot.studentName}" data-topic="${slot.topic}">Log notes</button>
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

    container.querySelectorAll('.btn-attendance').forEach(btn => {
      btn.addEventListener('click', () => {
        const slotId = btn.dataset.slotId;
        const status = btn.dataset.status;
        const slot = store.schedule.find(s => s.id === slotId);
        store.updateAttendance(slotId, status);
        showToast(`${slot.studentName} → ${status.toUpperCase()}`, 'success');
        render();
      });
    });

    container.querySelectorAll('.btn-session-debrief').forEach(btn => {
      btn.addEventListener('click', () => openDebriefModal(btn.dataset.student, btn.dataset.topic));
    });
  }

  function openDebriefModal(student, topic) {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="p-modal">
          <div class="p-modal-header">
            <div>
              <div class="p-modal-title">Session Debrief</div>
              <div class="p-modal-sub">${student} · ${topic}</div>
            </div>
            <button type="button" id="btn-close-debrief" class="p-modal-close">✕</button>
          </div>
          <form id="form-debrief" class="p-modal-body">
            <div class="p-form-row">
              <label class="p-label">Clutch Control & Steering</label>
              <select class="mnc-select p-input" name="proficiency">
                <option value="Excellent">Excellent — Biting point & progressive braking on target</option>
                <option value="Satisfactory">Satisfactory — Needs more city traffic practice</option>
                <option value="Needs Practice">Needs Practice — Hill hold balance must be repeated</option>
              </select>
            </div>
            <div class="p-form-row">
              <label class="p-label">Distance Logged</label>
              <input type="text" class="mnc-input p-input" name="distance" value="8.0 km (Daily target completed)" readonly />
            </div>
            <div class="p-form-row">
              <label class="p-label">Field Notes</label>
              <textarea class="mnc-input p-input" rows="3" name="notes" style="resize:vertical;">Smooth clutch release. Passed RTO 8-track with zero sensor penalties.</textarea>
            </div>
            <div class="p-modal-footer">
              <button type="button" class="p-ghost-btn" id="btn-cancel-debrief">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Save Remarks</button>
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
      showToast(`Remarks saved for ${student}`, 'success');
    });
  }

  render();
}
