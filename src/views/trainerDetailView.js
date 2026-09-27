/* ==========================================================================
   APEX DRIVE — DEDICATED TRAINER SERVICE DOSSIER (MNC ENTERPRISE THEME)
   Full separate service record page for an individual instructor.
   - Master Instructor Credentials (State DOT License, Phone, Email, Safety Record)
   - Assigned Dual-Control Safety Fleet Vehicle & Dual-Brake Inspection Telemetry
   - Curricular Specialties (In-Street & Highway 8 km Mastery)
   - Roster of Assigned Candidates with direct file links
   - Working "Edit Trainer Credentials" Modal
   ========================================================================== */

import { store } from '../store.js';
import { renderBrandLogo } from '../components/brandLogo.js';

export function renderTrainerDetailView(container, trainerId, showToast, onNavigate) {
  const trainer = store.trainers.find(tr => tr.id === trainerId) || store.trainers[0];
  const allTrainees = store.trainees;

  function render() {
    const assignedStudents = allTrainees.filter(t => t.assignedTrainerId === trainer.id);
    const trainerEmail = trainer.email || `${trainer.name.toLowerCase().replace(/[\s']/g, '.')}@gafoordriving.in`;
    const trainerPhone = trainer.phone || '+91 98480 22334';
    const licenseNo = trainer.licenseNumber || `AP-MVI-INST-${Math.abs(trainer.name.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0) % 90000 + 10000)}`;

    const template = `
      <div>
        <!-- Institutional Clean Page Banner with Official Logo -->
        <div class="clean-page-banner" style="margin-bottom: 1.25rem;">
          <div class="banner-brand-left">
            ${renderBrandLogo({ size: 'md' })}
            <div class="banner-title-block">
              <h2>GAFOOR <span>DRIVING SCHOOL</span></h2>
              <div class="banner-sub-meta">
                <span class="tagline-quote">"Walk in &amp; Drive out"</span>
                <span>•</span>
                <span>Senior Faculty &amp; Fleet Dossier</span>
                <span>•</span>
                <span>Pulivendula Academy (#AP-04-DS-2024)</span>
              </div>
            </div>
          </div>
          <div class="banner-pills-right">
            <span class="clean-gold-badge">★ Senior Master Faculty</span>
            <span class="clean-info-badge">Examiner: ${trainer.name}</span>
            <span class="kpi-pill kpi-pill-green">AP MVI Certified ✓</span>
          </div>
        </div>

        <!-- Navigation Breadcrumb -->
        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; color: var(--slate-muted); margin-bottom: 1.25rem;">
          <a href="javascript:void(0)" id="breadcrumb-faculty" style="color: var(--electric-blue); font-weight: 700;">← Back to Faculty & Fleet Directory</a>
          <span>/</span>
          <span style="color: var(--navy-deep); font-weight: 700;">${trainer.name} (${trainer.id})</span>
        </div>

        <!-- Master Trainer Header Banner in Clean MNC Card -->
        <div class="kpi-card" style="padding: 2rem; margin-bottom: 1.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.25rem;">
            <div style="display: flex; align-items: center; gap: 1.25rem;">
              <div style="width: 58px; height: 58px; border-radius: var(--radius-sm); background: #ecfdf5; border: 1px solid var(--emerald-border); color: #059669; font-size: 1.35rem; font-weight: 800; display: flex; align-items: center; justify-content: center;">
                ${trainer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;">
                  <h1 style="font-size: 1.65rem; font-weight: 800; color: var(--navy-deep); letter-spacing: -0.02em;">${trainer.name}</h1>
                  <span class="col-badge" style="margin: 0;">${trainer.id}</span>
                  <span class="kpi-pill kpi-pill-green" style="font-size: 0.725rem;">STATE DOT CERTIFIED EXAMINER</span>
                  <span class="col-badge" style="margin: 0;">★ ${trainer.rating} / 5.0</span>
                </div>
                <p style="font-size: 0.875rem; color: var(--slate-muted); margin-top: 0.3rem;">
                  Faculty Designation: <strong style="color: var(--navy-deep);">${trainer.role}</strong> · Active Assigned Candidates: <strong style="color: var(--electric-blue);">${assignedStudents.length} Students</strong>
                </p>
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <button type="button" class="btn-mnc btn-mnc-secondary" id="btn-edit-trainer-file">
                Edit Trainer Credentials
              </button>
              <button type="button" class="btn-mnc btn-mnc-primary" id="btn-cert-verify">
                Audit Safety Certificate
              </button>
            </div>
          </div>
        </div>

        <!-- 2 Column Dossier Layout -->
        <div style="display: grid; grid-template-columns: 380px 1fr; gap: 1.75rem;">
          <!-- Left Column: Master Instructor Credentials & Safety Vehicle -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Instructor Master File Card -->
            <div class="kpi-card" style="padding: 1.5rem;">
              <div class="dossier-card-title" style="margin-bottom: 1.25rem;">
                <span style="font-size: 0.9rem; font-weight: 800; color: var(--navy-deep); text-transform: uppercase; letter-spacing: 0.05em;">Instructor License & KYC</span>
                <span class="col-badge" style="margin: 0; font-size: 0.65rem;">Active</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div>
                  <span class="dossier-label">State Examiner License No.</span>
                  <div class="dossier-value" style="font-weight: 700; color: var(--electric-blue);">${licenseNo}</div>
                </div>

                <div>
                  <span class="dossier-label">Direct Faculty Contact Phone</span>
                  <div class="dossier-value">${trainerPhone}</div>
                </div>

                <div>
                  <span class="dossier-label">Academy Institutional Email</span>
                  <div class="dossier-value">${trainerEmail}</div>
                </div>

                <div style="padding-top: 0.75rem; border-top: 1px solid var(--border-light);">
                  <span class="dossier-label">Background & Safety Clearance</span>
                  <div class="dossier-value" style="color: var(--emerald-green); font-weight: 700;">100% Incident-Free Record</div>
                  <div style="font-size: 0.775rem; color: var(--slate-muted); margin-top: 0.15rem;">Zero points on driving record · Verified State DOT Background Check</div>
                </div>

                <div style="padding-top: 0.75rem; border-top: 1px solid var(--border-light);">
                  <span class="dossier-label">DMV Student Pass Rate</span>
                  <div class="dossier-value" style="color: var(--navy-deep); font-weight: 700;">99.2% First-Attempt Success</div>
                </div>
              </div>
            </div>

            <!-- Assigned Dual-Control Vehicle Rig Card -->
            <div class="kpi-card" style="padding: 1.5rem;">
              <div class="dossier-card-title" style="margin-bottom: 1.25rem;">
                <span style="font-size: 0.9rem; font-weight: 800; color: var(--navy-deep); text-transform: uppercase; letter-spacing: 0.05em;">Assigned Dual-Control Safety Unit</span>
                <span class="col-badge" style="margin: 0; font-size: 0.65rem;">Rig #04</span>
              </div>

              <div style="background: var(--bg-offwhite); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1rem;">
                <div style="font-size: 1.05rem; font-weight: 800; color: var(--navy-deep);">${trainer.car}</div>
                <div style="font-size: 0.775rem; color: var(--emerald-green); font-weight: 700; margin-top: 0.2rem;">✓ Dual-Pedal Hydraulic Brake System Certified</div>
                <div style="font-size: 0.775rem; color: var(--slate-muted); margin-top: 0.35rem;">Telemetry: GPS Governor Geofenced · Cabin Dual HD Camera Active</div>
              </div>

              <div style="font-size: 0.8rem; color: var(--slate-muted); line-height: 1.5;">
                Monthly safety brake calibration passed on <strong>Sept 02, 2026</strong>. Equipped with instructor brake override and blind-spot monitoring radar.
              </div>
            </div>
          </div>

          <!-- Right Column: Curricular Focus & Supervised Candidates Roster -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Curricular Focus Card -->
            <div class="kpi-card" style="padding: 1.5rem;">
              <div class="dossier-card-title" style="margin-bottom: 1rem;">
                <span style="font-size: 0.9rem; font-weight: 800; color: var(--navy-deep); text-transform: uppercase; letter-spacing: 0.05em;">Instructional Specialty & Scope</span>
                <span class="col-badge" style="margin: 0; font-size: 0.65rem;">Curriculum</span>
              </div>

              <p style="font-size: 0.9rem; color: var(--slate-body); line-height: 1.55; margin-bottom: 1.25rem;">
                ${trainer.specialty}. Specialized in taking learner candidates through the transition from low-speed neighborhood streets to multi-lane interstate highway navigation (8 km daily loop modules).
              </p>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div style="background: var(--bg-offwhite); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 0.85rem;">
                  <div style="font-size: 0.725rem; font-weight: 800; color: var(--electric-blue); text-transform: uppercase; letter-spacing: 0.05em;">Module A (Days 1–10)</div>
                  <div style="font-size: 0.875rem; font-weight: 700; color: var(--navy-deep); margin-top: 0.2rem;">In-Street Technical Control</div>
                  <div style="font-size: 0.775rem; color: var(--slate-muted); margin-top: 0.2rem;">8 km daily city grid, clutch/brake pedal finesse & parallel parking.</div>
                </div>

                <div style="background: var(--bg-offwhite); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 0.85rem;">
                  <div style="font-size: 0.725rem; font-weight: 800; color: var(--electric-blue); text-transform: uppercase; letter-spacing: 0.05em;">Module B (Days 11–19)</div>
                  <div style="font-size: 0.875rem; font-weight: 700; color: var(--navy-deep); margin-top: 0.2rem;">Highway High-Speed Loop</div>
                  <div style="font-size: 0.775rem; color: var(--slate-muted); margin-top: 0.2rem;">8 km daily high-speed overtaking, on-ramp merging & emergency ABS braking.</div>
                </div>
              </div>
            </div>

            <!-- Assigned Trainees (Supervised Candidates) Service File Links -->
            <div class="kpi-card" style="padding: 1.5rem;">
              <div class="dossier-card-title" style="margin-bottom: 1.25rem;">
                <div>
                  <span style="font-size: 0.9rem; font-weight: 800; color: var(--navy-deep); text-transform: uppercase; letter-spacing: 0.05em;">Candidates Supervised by ${trainer.name}</span>
                  <div style="font-size: 0.775rem; color: var(--slate-muted); font-weight: 500; margin-top: 0.15rem;">Click any candidate to inspect their separate service dossier.</div>
                </div>
                <span class="col-badge" style="margin: 0;">${assignedStudents.length} Active Trainees</span>
              </div>

              ${assignedStudents.length === 0 ? `
                <div style="padding: 2rem; text-align: center; color: var(--slate-muted); font-size: 0.875rem;">
                  No active students currently assigned to this instructor.
                </div>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                  ${assignedStudents.map(student => `
                    <div class="student-service-tile" style="padding: 1rem 1.25rem;">
                      <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 36px; height: 36px; background: var(--bg-offwhite); border: 1px solid var(--border-dark); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--navy-deep); font-size: 0.85rem;">
                          ${student.avatar || student.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <strong style="font-size: 0.95rem; color: var(--navy-deep);">${student.name}</strong>
                            <span class="col-badge" style="font-size: 0.65rem; margin: 0;">${student.id}</span>
                            <span class="kpi-pill ${student.paymentStatus === 'paid' ? 'kpi-pill-green' : 'kpi-pill-orange'}" style="font-size: 0.65rem;">
                              ${student.paymentStatus.toUpperCase()}
                            </span>
                          </div>
                          <div style="font-size: 0.775rem; color: var(--slate-muted); margin-top: 0.15rem;">
                            Track: <strong>${student.package}</strong> · Day <strong>${student.currentDay}/20</strong>
                          </div>
                        </div>
                      </div>

                      <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-view-trainee-link" data-trainee-id="${student.id}">
                        Inspect Candidate File →
                      </button>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = template;
    attachEvents();
  }

  function attachEvents() {
    // Breadcrumb back to Faculty
    const breadcrumb = container.querySelector('#breadcrumb-faculty');
    if (breadcrumb) {
      breadcrumb.addEventListener('click', () => {
        onNavigate('trainers');
      });
    }

    // Inspect candidate file link
    container.querySelectorAll('.btn-view-trainee-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const trId = btn.dataset.traineeId;
        onNavigate('trainee-profile', trId);
      });
    });

    // Edit Trainer File Modal
    const btnEdit = container.querySelector('#btn-edit-trainer-file');
    if (btnEdit) {
      btnEdit.addEventListener('click', () => {
        openEditModal();
      });
    }

    // Audit Safety Certificate
    const btnCert = container.querySelector('#btn-cert-verify');
    if (btnCert) {
      btnCert.addEventListener('click', () => {
        showToast(`Auditing State DOT certification for ${trainer.name}: All credentials in compliance (Rating ★ ${trainer.rating})`, 'success');
      });
    }
  }

  function openEditModal() {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay" id="edit-trainer-modal-overlay">
        <div class="kpi-card" style="max-width: 580px; width: 100%; padding: 0; overflow: hidden; border: 1px solid var(--border-light);">
          <div style="padding: 1.5rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; background: var(--bg-offwhite);">
            <div>
              <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--navy-deep);">Edit Instructor Service Credentials</h3>
              <p style="font-size: 0.8rem; color: var(--slate-muted); margin-top: 0.15rem;">Update master certification and vehicle allocation for ${trainer.name}.</p>
            </div>
            <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm" id="btn-close-edit-modal">✕</button>
          </div>

          <form id="form-edit-trainer-file" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.2rem;">
            <div>
              <label class="mnc-label" style="font-weight: 700; color: var(--navy-deep);">Instructor Full Name *</label>
              <input type="text" class="mnc-input" id="edit-tr-name" value="${trainer.name}" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label class="mnc-label" style="font-weight: 700; color: var(--navy-deep);">Faculty Role / Title</label>
                <input type="text" class="mnc-input" id="edit-tr-role" value="${trainer.role}" required />
              </div>
              <div>
                <label class="mnc-label" style="font-weight: 700; color: var(--navy-deep);">Contact Phone</label>
                <input type="text" class="mnc-input" id="edit-tr-phone" value="${trainer.phone || '+1 (555) 789-0011'}" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label class="mnc-label" style="font-weight: 700; color: var(--navy-deep);">Assigned Safety Unit Vehicle</label>
                <input type="text" class="mnc-input" id="edit-tr-car" value="${trainer.car}" required />
              </div>
              <div>
                <label class="mnc-label" style="font-weight: 700; color: var(--navy-deep);">Performance Rating (DMV)</label>
                <input type="number" step="0.01" min="1.0" max="5.0" class="mnc-input" id="edit-tr-rating" value="${trainer.rating}" required />
              </div>
            </div>

            <div>
              <label class="mnc-label" style="font-weight: 700; color: var(--navy-deep);">Curricular Specialty Description</label>
              <textarea class="mnc-input" id="edit-tr-specialty" rows="3" style="resize: vertical;">${trainer.specialty}</textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--border-light);">
              <button type="button" class="btn-mnc btn-mnc-secondary" id="btn-cancel-edit">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Save Updated Credentials</button>
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
