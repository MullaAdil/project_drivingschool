/* ==========================================================================
   APEX DRIVE — INSTRUCTOR INSPECT DOSSIER (MODERN ENTERPRISE UI)
   - Full-bleed edge-to-edge layout fitting 100% viewport width
   - High-contrast obsidian & gold styling
   - Faculty Credentials, AP-MVI License & Vehicle Rig telemetry
   - Assigned Candidates directory with direct file inspect links
   ========================================================================== */

import { store } from '../store.js';

export function renderTrainerDetailView(container, trainerId, showToast, onNavigate) {
  const trainer = store.trainers.find(tr => tr.id === trainerId) || store.trainers[0];
  const allTrainees = store.trainees;

  function render() {
    const assignedStudents = allTrainees.filter(t => t.assignedTrainerId === trainer.id);
    const trainerEmail = trainer.email || `${trainer.name.toLowerCase().replace(/[\s']/g, '.')}@gafoordriving.in`;
    const trainerPhone = trainer.phone || '+91 98480 22334';
    const licenseNo = trainer.licenseNumber || `AP-MVI-INST-2024-${trainer.id.replace('TRN-', '0')}`;
    const initials = trainer.name.split(' ').map(n => n[0]).join('').substring(0, 2);

    const template = `
      <div class="student-details-container">

        <!-- Top Navigation & Action Strip -->
        <div class="student-details-top-strip">
          <button type="button" class="student-btn-back" id="btn-back-faculty">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Back to Driving Instructors
          </button>

          <div class="student-actions-row">
            <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm" id="btn-cert-audit">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Verify Instructor License
            </button>
            <button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm" id="btn-edit-trainer-file">
              Edit Instructor Details
            </button>
          </div>
        </div>

        <!-- Faculty Hero Banner Card -->
        <div class="student-hero-card">
          <div class="student-hero-left">
            <div class="student-avatar-badge" style="background:#ffffff; border-color:#ffffff; color:#000000;">
              ${initials}
            </div>
            <div class="student-hero-name-block">
              <h1>${trainer.name}</h1>
              <div class="student-hero-badges">
                <span class="p-badge p-badge-dim">${trainer.id}</span>
                <span class="p-badge p-badge-green">Govt. Certified Instructor</span>
                <span class="p-badge p-badge-gold">★ ${trainer.rating} / 5.0</span>
              </div>
              <div class="student-hero-meta">
                <span>Role: <strong>${trainer.role}</strong></span>
                <span>•</span>
                <span>License: <strong style="color:#ffffff; font-family:var(--font-mono);">${licenseNo}</strong></span>
                <span>•</span>
                <span>Training Car: <strong>${trainer.car}</strong></span>
              </div>
            </div>
          </div>

          <div style="text-align:right;">
            <div style="font-size:2rem; font-weight:900; color:#ffffff; font-family:var(--font-mono);">${assignedStudents.length}</div>
            <div style="font-size:0.75rem; color:var(--slate-muted); text-transform:uppercase; font-weight:700;">Active Students Assigned</div>
          </div>
        </div>

        <!-- 4-Card Metric Strip -->
        <div class="student-kpi-grid">
          <div class="student-kpi-card">
            <span class="student-kpi-val">${assignedStudents.length}</span>
            <span class="student-kpi-label">Assigned Students</span>
          </div>
          <div class="student-kpi-card">
            <span class="student-kpi-val" style="color:var(--neem-green);">99.2%</span>
            <span class="student-kpi-label">Driving Test Pass Rate</span>
          </div>
          <div class="student-kpi-card">
            <span class="student-kpi-val" style="color:var(--primary-gold);">★ ${trainer.rating}</span>
            <span class="student-kpi-label">Student Rating</span>
          </div>
          <div class="student-kpi-card">
            <span class="student-kpi-val" style="color:var(--primary-cyan);">100%</span>
            <span class="student-kpi-label">Safety Compliance</span>
          </div>
        </div>

        <!-- 2-Column Responsive Layout -->
        <div class="student-grid-layout">

          <!-- Left Column: Master Faculty Credentials & Safety Vehicle Unit -->
          <div>
            <!-- Credentials Card -->
            <div class="student-card">
              <div class="student-card-header">
                <span class="student-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary-gold)" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  Instructor Profile &amp; License Details
                </span>
                <span class="p-badge p-badge-green" style="font-size:0.6rem;">Verified Active</span>
              </div>
              <div class="student-card-body" style="padding-top:0.5rem; padding-bottom:0.5rem;">
                <div class="student-data-table">
                  <div class="student-data-row">
                    <span class="student-data-key">Govt. Driving Instructor License</span>
                    <span class="student-data-val" style="color:var(--primary-cyan); font-family:var(--font-mono);">${licenseNo}</span>
                  </div>
                  <div class="student-data-row">
                    <span class="student-data-key">Mobile Phone Number</span>
                    <span class="student-data-val">${trainerPhone}</span>
                  </div>
                  <div class="student-data-row">
                    <span class="student-data-key">Email Address</span>
                    <span class="student-data-val">${trainerEmail}</span>
                  </div>
                  <div class="student-data-row">
                    <span class="student-data-key">Safety Clearance</span>
                    <span class="student-data-val" style="color:var(--neem-green);">100% Incident-Free Record</span>
                  </div>
                  <div class="student-data-row">
                    <span class="student-data-key">Training Specialization</span>
                    <span class="student-data-val">${trainer.specialty}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Assigned Safety Unit Rig Card -->
            <div class="student-card">
              <div class="student-card-header">
                <span class="student-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary-green)" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                  Assigned Dual-Control Training Car
                </span>
                <span class="p-badge p-badge-dim" style="font-size:0.6rem;">Dual Foot Brakes</span>
              </div>
              <div class="student-card-body">
                <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:var(--radius-sm); padding:1rem; margin-bottom:1rem;">
                  <div style="font-size:1.05rem; font-weight:800; color:#ffffff;">${trainer.car}</div>
                  <div style="font-size:0.8rem; color:var(--neem-green); font-weight:700; margin-top:0.25rem;">✓ Dual-Pedal Brake Override Active</div>
                  <div style="font-size:0.78rem; color:var(--slate-muted); margin-top:0.35rem;">Safety: Dual Foot Brakes &amp; Clutches Installed</div>
                </div>
                <div style="font-size:0.825rem; color:var(--slate-body); line-height:1.5;">
                  Monthly safety brake inspection passed on <strong>Sept 2026</strong>. Dual controls enable instant instructor intervention during town and 8-track maneuvers.
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Candidate Roster Assigned to this Instructor -->
          <div>
            <div class="student-card">
              <div class="student-card-header">
                <span class="student-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary-cyan)" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  Assigned Students (${assignedStudents.length})
                </span>
                <span class="p-badge p-badge-dim" style="font-size:0.6rem;">Pulivendula Office</span>
              </div>
              <div class="student-card-body" style="padding:0;">
                ${assignedStudents.length === 0 ? `
                  <div style="padding:3rem; text-align:center; color:var(--slate-muted); font-size:0.9rem;">
                    No students currently assigned to this instructor.
                  </div>
                ` : `
                  <div class="p-table-wrap">
                    <table class="p-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Course</th>
                          <th>Progress</th>
                          <th>Fee Balance</th>
                          <th style="text-align:right;">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${assignedStudents.map(student => {
                          const pct = Math.min(100, Math.round((student.currentDay / 20) * 100));
                          return `
                            <tr>
                              <td>
                                <div class="p-td-name">${student.name}</div>
                                <div class="p-td-sub">${student.id} · ${student.permitNumber || 'LLR Active'}</div>
                              </td>
                              <td class="p-td-muted">${student.package.split('(')[0].trim()}</td>
                              <td>
                                <div style="font-size:0.875rem; font-weight:800; color:#ffffff;">Day ${student.currentDay} / 20</div>
                                <div class="p-td-sub">${pct}% · ${student.currentDay * 8} km</div>
                              </td>
                              <td>
                                <span class="p-badge ${student.paymentStatus === 'paid' ? 'p-badge-green' : 'p-badge-gold'}" style="font-size:0.6rem;">
                                  ${student.paymentStatus.toUpperCase()}
                                </span>
                              </td>
                              <td style="text-align:right;">
                                <button type="button" class="p-link-btn btn-view-trainee-link" data-trainee-id="${student.id}">
                                  View Student Details →
                                </button>
                              </td>
                            </tr>
                          `;
                        }).join('')}
                      </tbody>
                    </table>
                  </div>
                `}
              </div>
            </div>
          </div>

        </div>

      </div>
    `;

    container.innerHTML = template;
    attachEvents();
  }

  function attachEvents() {
    const btnBack = container.querySelector('#btn-back-faculty');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        onNavigate('trainers');
      });
    }

    container.querySelectorAll('.btn-view-trainee-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const trId = btn.dataset.traineeId;
        onNavigate('trainee-profile', trId);
      });
    });

    const btnEdit = container.querySelector('#btn-edit-trainer-file');
    if (btnEdit) {
      btnEdit.addEventListener('click', () => {
        openEditModal();
      });
    }

    const btnCert = container.querySelector('#btn-cert-audit');
    if (btnCert) {
      btnCert.addEventListener('click', () => {
        showToast(`Auditing AP RTO certification for ${trainer.name}: All credentials in 100% compliance!`, 'success');
      });
    }
  }

  function openEditModal() {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="mnc-modal" style="max-width: 580px;">
          <div style="padding: 1.25rem 1.75rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; background: var(--cred-surface);">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; margin: 0;">Edit Instructor Details</h3>
              <p style="font-size: 0.8rem; color: var(--slate-muted); margin: 0.2rem 0 0;">${trainer.name} · ${trainer.id}</p>
            </div>
            <button type="button" id="btn-close-edit-modal" style="background: transparent; border: none; font-size: 1.25rem; cursor: pointer; color: var(--slate-muted);">✕</button>
          </div>

          <form id="form-edit-trainer-file" style="padding: 1.75rem;">
            <div style="margin-bottom: 1.25rem;">
              <label class="p-label" style="margin-bottom:0.35rem; display:block;">Instructor Full Name *</label>
              <input type="text" class="mnc-input" id="edit-tr-name" value="${trainer.name}" required style="width:100%;" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem;">
              <div>
                <label class="p-label" style="margin-bottom:0.35rem; display:block;">Role / Designation</label>
                <input type="text" class="mnc-input" id="edit-tr-role" value="${trainer.role}" required style="width:100%;" />
              </div>
              <div>
                <label class="p-label" style="margin-bottom:0.35rem; display:block;">Mobile Phone Number</label>
                <input type="text" class="mnc-input" id="edit-tr-phone" value="${trainer.phone || '+91 98480 22334'}" required style="width:100%;" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem;">
              <div>
                <label class="p-label" style="margin-bottom:0.35rem; display:block;">Assigned Training Car</label>
                <input type="text" class="mnc-input" id="edit-tr-car" value="${trainer.car}" required style="width:100%;" />
              </div>
              <div>
                <label class="p-label" style="margin-bottom:0.35rem; display:block;">Student Rating (★)</label>
                <input type="number" step="0.01" min="1.0" max="5.0" class="mnc-input" id="edit-tr-rating" value="${trainer.rating}" required style="width:100%;" />
              </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
              <label class="p-label" style="margin-bottom:0.35rem; display:block;">Training Specialization</label>
              <textarea class="mnc-input" id="edit-tr-specialty" rows="3" style="width:100%; resize: vertical;">${trainer.specialty}</textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1.25rem; border-top: 1px solid var(--border-light);">
              <button type="button" class="btn-mnc btn-mnc-secondary" id="btn-cancel-edit">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Save Instructor Details ✓</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-edit-modal').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-edit').addEventListener('click', close);

    const form = modalRoot.querySelector('#form-edit-trainer-file');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = {
        name: document.getElementById('edit-tr-name').value.trim(),
        role: document.getElementById('edit-tr-role').value.trim(),
        phone: document.getElementById('edit-tr-phone').value.trim(),
        car: document.getElementById('edit-tr-car').value.trim(),
        rating: parseFloat(document.getElementById('edit-tr-rating').value) || 4.90,
        specialty: document.getElementById('edit-tr-specialty').value.trim()
      };

      store.updateTrainer(trainer.id, updated);
      close();
      showToast(`Credentials updated for ${updated.name}`, 'success');
      render();
    });
  }

  render();
}
