/* ==========================================================================
   APEX DRIVE — DEDICATED TRAINEE PROFILE DOSSIER (MNC ENTERPRISE)
   Full separate record page for an individual student.
   - Master Student KYC (Permit No, Address, Emergency Contacts)
   - Assigned Certified Faculty with live re-assignment
   - Curricular Milestone Progression & Driving Hours
   - Personal Billing & Payment Statement
   - Live "Edit Student Details" & "Record Payment" Modals
   ========================================================================== */

import { store } from '../store.js';
import { renderBrandLogo } from '../components/brandLogo.js';

export function renderTraineeDetailView(container, traineeId, showToast, onNavigate) {
  const trainee = store.trainees.find(t => t.id === traineeId) || store.trainees[0];
  const trainers = store.trainers;

  function render() {
    const assignedTrainer = trainers.find(tr => tr.id === trainee.assignedTrainerId) || trainers[0];
    const invoice = store.payments.find(p => p.traineeId === trainee.id) || {
      id: 'INV-4011', amount: 1250, paid: 750, balance: 500, dueDate: '2026-09-22', status: 'partial'
    };
    const curriculum = store.getCurriculum();

    const progressPercent = Math.round((trainee.currentDay / 20) * 100);

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
                <span>Candidate Master Dossier</span>
                <span>•</span>
                <span>Pulivendula (#AP-04-DS-2024)</span>
              </div>
            </div>
          </div>
          <div class="banner-pills-right">
            <span class="clean-gold-badge">★ Govt. Approved</span>
            <span class="clean-info-badge">Candidate: ${trainee.id}</span>
            <span class="kpi-pill kpi-pill-green">Verified Student ✓</span>
          </div>
        </div>

        <!-- Navigation Breadcrumb -->
        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; color: var(--slate-muted); margin-bottom: 1.25rem;">
          <a href="javascript:void(0)" id="breadcrumb-roster" style="color: var(--electric-blue); font-weight: 700;">← Back to Trainees Directory</a>
          <span>/</span>
          <span style="color: var(--navy-deep); font-weight: 700;">${trainee.name} (${trainee.id})</span>
        </div>

        <!-- Trainee Header Hero Banner -->
        <div class="kpi-card" style="padding: 2rem; margin-bottom: 1.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.25rem;">
            <div style="display: flex; align-items: center; gap: 1.25rem;">
              <div style="width: 58px; height: 58px; border-radius: 50%; background: var(--electric-blue-light); color: var(--electric-blue); font-size: 1.35rem; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 1px solid var(--electric-blue-border);">
                ${trainee.avatar || trainee.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;">
                  <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--charcoal);">${trainee.name}</h1>
                  <span style="font-size: 0.75rem; font-weight: 800; color: var(--terracotta); background: var(--terracotta-light); padding: 0.2rem 0.55rem; border-radius: var(--radius-pill); border: 1px solid var(--terracotta-border);">
                    ${trainee.id}
                  </span>
                  <span class="kpi-pill ${invoice.balance === 0 ? 'kpi-pill-green' : 'kpi-pill-orange'}">
                    ${invoice.balance === 0 ? 'Fully Settled ✓' : `₹${invoice.balance.toLocaleString('en-IN')} Balance Due`}
                  </span>
                </div>
                <p style="font-size: 0.875rem; color: var(--slate-muted); margin-top: 0.25rem;">
                  Course: <strong style="color: var(--charcoal);">${trainee.package}</strong> · Enrolled: <strong>${trainee.registeredDate}</strong>
                </p>
              </div>
            </div>

            <div style="display: flex; gap: 0.65rem; flex-wrap: wrap;">
              <button type="button" class="btn-mnc btn-mnc-secondary" id="btn-edit-student">
                Edit Candidate KYC
              </button>
              ${invoice.balance > 0 ? `
                <button type="button" class="btn-mnc btn-mnc-primary" id="btn-pay-now">
                  Record Payment
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Curricular Milestone Progression Bar -->
          <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border-light);">
            <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; font-weight: 700; margin-bottom: 0.4rem;">
              <span style="color: var(--electric-blue);">Curricular Progression: Day ${trainee.currentDay} of 20 Completed</span>
              <span style="color: var(--navy-deep);">${progressPercent}% Completed</span>
            </div>
            <div style="width: 100%; height: 8px; background: var(--bg-subtle); border-radius: var(--radius-pill); overflow: hidden; border: 1px solid var(--border-light);">
              <div style="width: ${progressPercent}%; height: 100%; background: var(--electric-blue); border-radius: var(--radius-pill); transition: width 0.4s ease;"></div>
            </div>
          </div>
        </div>

        <!-- 2 Column Dossier Content -->
        <div style="display: grid; grid-template-columns: 360px 1fr; gap: 1.75rem;">
          <!-- Left Column: Master KYC Details & Assigned Faculty -->
          <div>
            <!-- Master KYC Card -->
            <div class="kpi-card" style="margin-bottom: 1.5rem; padding: 1.5rem;">
              <div class="dossier-card-title">
                <span>Master Student KYC</span>
                <span class="kpi-pill kpi-pill-green">Verified</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div>
                  <span class="dossier-label">Learner Permit No.</span>
                  <div class="dossier-value" style="color: var(--electric-blue);">${trainee.permitNumber || 'DL-9948201'}</div>
                </div>
                <div>
                  <span class="dossier-label">Contact Email</span>
                  <div class="dossier-value">${trainee.email}</div>
                </div>
                <div>
                  <span class="dossier-label">Phone Number</span>
                  <div class="dossier-value">${trainee.phone}</div>
                </div>
                <div>
                  <span class="dossier-label">Residential Address</span>
                  <div class="dossier-value">${trainee.address || '742 Evergreen Way, Metro District'}</div>
                </div>
                <div style="padding-top: 0.75rem; border-top: 1px solid var(--border-light);">
                  <span class="dossier-label">Emergency Contact</span>
                  <div class="dossier-value">${trainee.emergencyContact || 'Evelyn Chen (Mother)'}</div>
                  <div style="font-size: 0.8rem; color: var(--slate-muted);">${trainee.emergencyPhone || '+1 (555) 912-4411'}</div>
                </div>
                <div style="padding-top: 0.75rem; border-top: 1px solid var(--border-light);">
                  <span class="dossier-label">Attendance Rate</span>
                  <div class="dossier-value" style="color: var(--emerald-green);">${trainee.attendanceRate || '100%'} (Zero unexcused absences)</div>
                </div>
              </div>
            </div>

            <!-- Assigned Faculty Card with live reassignment -->
            <div class="kpi-card" style="padding: 1.5rem;">
              <div class="dossier-card-title">
                <span>Assigned Flight / Road Faculty</span>
              </div>

              <div style="background: var(--bg-offwhite); border-radius: var(--radius-sm); border: 1px solid var(--border-light); padding: 1rem; margin-bottom: 1.25rem;">
                <div style="font-size: 1.05rem; font-weight: 800; color: var(--navy-deep);">${assignedTrainer.name}</div>
                <div style="font-size: 0.8rem; color: var(--electric-blue); font-weight: 700; margin-top: 0.15rem;">${assignedTrainer.role}</div>
                <div style="font-size: 0.8rem; color: var(--slate-muted); margin-top: 0.4rem;">Safety Unit: <strong>${assignedTrainer.car}</strong></div>
                <div style="font-size: 0.8rem; color: var(--emerald-green); font-weight: 700; margin-top: 0.2rem;">Certified Examiner Rating: ★ ${assignedTrainer.rating}</div>
              </div>

              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.35rem;">
                  Reassign Certified Instructor
                </label>
                <select class="mnc-select" id="select-reassign" style="width: 100%;">
                  ${trainers.map(tr => `
                    <option value="${tr.id}" ${tr.id === trainee.assignedTrainerId ? 'selected' : ''}>
                      ${tr.name} (${tr.car.split(' ')[0]})
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>
          </div>

          <!-- Right Column: Curricular Progression & Financial Statements -->
          <div>
            <!-- Curricular Milestones Breakdown -->
            <div class="kpi-card" style="margin-bottom: 1.5rem; padding: 1.5rem;">
              <div class="dossier-card-title">
                <span>20-Day Curricular Syllabus Telemetry</span>
                <span class="kpi-pill kpi-pill-blue">Active Track</span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: var(--bg-offwhite); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                  <div style="font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase;">In-Street Phase</div>
                  <div style="font-size: 1.35rem; font-weight: 800; color: var(--navy-deep); margin-top: 0.25rem;">Days 1–10</div>
                  <div style="font-size: 0.75rem; color: var(--emerald-green); font-weight: 700;">✓ Completed</div>
                </div>

                <div style="background: var(--bg-offwhite); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                  <div style="font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase;">Highway Phase</div>
                  <div style="font-size: 1.35rem; font-weight: 800; color: var(--electric-blue); margin-top: 0.25rem;">Days 11–19</div>
                  <div style="font-size: 0.75rem; color: var(--electric-blue); font-weight: 700;">● Active (Day ${trainee.currentDay})</div>
                </div>

                <div style="background: var(--bg-offwhite); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                  <div style="font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase;">Road Test Phase</div>
                  <div style="font-size: 1.35rem; font-weight: 800; color: var(--navy-deep); margin-top: 0.25rem;">Day 20</div>
                  <div style="font-size: 0.75rem; color: var(--slate-muted); font-weight: 700;">Scheduled Next</div>
                </div>
              </div>

              <!-- Curricular Milestones List -->
              <div style="max-height: 280px; overflow-y: auto; border: 1px solid var(--border-light); border-radius: var(--radius-sm);">
                ${curriculum.slice(0, 10).map(c => `
                  <div style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; background: ${c.day <= trainee.currentDay ? '#fafdfc' : '#ffffff'};">
                    <div>
                      <span style="font-weight: 800; font-size: 0.8rem; color: ${c.day <= trainee.currentDay ? 'var(--emerald-green)' : 'var(--slate-muted)'}; margin-right: 0.5rem;">
                        Day ${c.day}
                      </span>
                      <span style="font-weight: 700; font-size: 0.85rem; color: var(--navy-deep);">${c.topic}</span>
                    </div>
                    <span style="font-size: 0.75rem; font-weight: 700; color: ${c.day <= trainee.currentDay ? 'var(--emerald-green)' : 'var(--slate-muted)'};">
                      ${c.day <= trainee.currentDay ? '✓ Cleared' : 'Pending'}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Financial Statement Card -->
            <div class="kpi-card" style="padding: 1.5rem;">
              <div class="dossier-card-title">
                <span>Tuition Account & Billing Statement</span>
                <span class="kpi-pill ${invoice.balance === 0 ? 'kpi-pill-green' : 'kpi-pill-orange'}">
                  ${invoice.status.toUpperCase()}
                </span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 1.25rem;">
                <div>
                  <span class="dossier-label">Total Course Fee</span>
                  <div style="font-size: 1.35rem; font-weight: 800; color: var(--charcoal);">₹${invoice.amount.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span class="dossier-label">Collected / Paid</span>
                  <div style="font-size: 1.35rem; font-weight: 800; color: var(--neem-green);">₹${invoice.paid.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span class="dossier-label">Balance Due</span>
                  <div style="font-size: 1.35rem; font-weight: 800; color: ${invoice.balance > 0 ? 'var(--turmeric)' : 'var(--slate-muted)'};">
                    ₹${invoice.balance.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div style="font-size: 0.8rem; color: var(--slate-muted); padding-top: 0.75rem; border-top: 1px solid var(--border-light); display: flex; justify-content: space-between;">
                <span>Invoice ID: <strong>${invoice.id}</strong> · Due Date: <strong>${invoice.dueDate}</strong></span>
                <span>Supported Methods: <strong>PhonePe / Google Pay / UPI QR</strong></span>
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
    // Return to Roster
    const btnBack = container.querySelector('#breadcrumb-roster');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        onNavigate('trainees');
      });
    }

    // Reassign Instructor Dropdown
    const select = container.querySelector('#select-reassign');
    if (select) {
      select.addEventListener('change', (e) => {
        const newTrainerId = e.target.value;
        const success = store.assignTrainer(trainee.id, newTrainerId);
        if (success) {
          const trainer = store.trainers.find(tr => tr.id === newTrainerId);
          showToast(`Instructor updated to ${trainer.name}`, 'success');
          render();
        }
      });
    }

    // Edit Student Details Button
    const btnEdit = container.querySelector('#btn-edit-student');
    if (btnEdit) {
      btnEdit.addEventListener('click', () => {
        openEditModal();
      });
    }

    // Record Payment
    const btnPay = container.querySelector('#btn-pay-now');
    if (btnPay) {
      btnPay.addEventListener('click', () => {
        const invoice = store.payments.find(p => p.traineeId === trainee.id);
        if (invoice) {
          openPaymentModal(invoice.id, invoice.balance, trainee.name);
        }
      });
    }
  }

  // ====================================================
  // MODAL: EDIT STUDENT RECORD
  // ====================================================
  function openEditModal() {
    const modalRoot = document.getElementById('modal-root');

    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="mnc-modal" style="max-width: 580px;">
          <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; background: var(--bg-offwhite);">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--navy-deep);">Edit Student Record</h3>
              <p style="font-size: 0.8rem; color: var(--slate-muted);">${trainee.name} · ${trainee.id}</p>
            </div>
            <button type="button" id="btn-close-edit-modal" style="background: transparent; border: none; font-size: 1.25rem; cursor: pointer; color: var(--slate-muted);">✕</button>
          </div>

          <form id="form-edit-trainee" style="padding: 1.5rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.35rem;">Full Legal Name</label>
                <input type="text" class="mnc-input" name="name" value="${trainee.name}" required />
              </div>
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.35rem;">Email Address</label>
                <input type="email" class="mnc-input" name="email" value="${trainee.email}" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.35rem;">Phone Number</label>
                <input type="tel" class="mnc-input" name="phone" value="${trainee.phone}" required />
              </div>
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.35rem;">Permit Number</label>
                <input type="text" class="mnc-input" name="permitNumber" value="${trainee.permitNumber || 'DL-9948201'}" required />
              </div>
            </div>

            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.35rem;">Residential Address</label>
              <input type="text" class="mnc-input" name="address" value="${trainee.address || '742 Evergreen Way, Metro District'}" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.35rem;">Emergency Contact</label>
                <input type="text" class="mnc-input" name="emergencyContact" value="${trainee.emergencyContact || 'Evelyn Chen (Mother)'}" />
              </div>
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.35rem;">Emergency Phone</label>
                <input type="tel" class="mnc-input" name="emergencyPhone" value="${trainee.emergencyPhone || '+1 (555) 912-4411'}" />
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--border-light);">
              <button type="button" class="btn-mnc btn-mnc-secondary" id="btn-cancel-edit-modal">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-edit-modal').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-edit-modal').addEventListener('click', close);

    const form = modalRoot.querySelector('#form-edit-trainee');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const updated = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        permitNumber: formData.get('permitNumber'),
        address: formData.get('address'),
        emergencyContact: formData.get('emergencyContact'),
        emergencyPhone: formData.get('emergencyPhone')
      };

      store.updateTrainee(trainee.id, updated);
      close();
      showToast(`Updated profile details for ${updated.name}`, 'success');
      render();
    });
  }

  // ====================================================
  // MODAL: RECORD PAYMENT
  // ====================================================
  function openPaymentModal(invoiceId, balance, student) {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="mnc-modal" style="max-width: 420px;">
          <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; background: var(--bg-offwhite);">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--navy-deep);">Record Payment Settlement</h3>
              <p style="font-size: 0.8rem; color: var(--slate-muted);">${student} · ${invoiceId}</p>
            </div>
            <button type="button" id="btn-close-dossier-pay" style="background: transparent; border: none; font-size: 1.25rem; cursor: pointer; color: var(--slate-muted);">✕</button>
          </div>

          <form id="form-dossier-pay" style="padding: 1.5rem;">
            <div style="margin-bottom: 1.25rem;">
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.35rem;">Outstanding Balance Due</label>
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--charcoal);">₹${balance.toLocaleString('en-IN')}</div>
            </div>

            <div style="margin-bottom: 1.25rem;">
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.35rem;">Settlement Amount (₹ INR) *</label>
              <input type="number" class="mnc-input" name="amount" required min="1" max="${balance}" value="${balance}" />
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--border-light);">
              <button type="button" class="btn-mnc btn-mnc-secondary" id="btn-cancel-dossier-pay">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Confirm Settlement ✓</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-dossier-pay').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-dossier-pay').addEventListener('click', close);

    const form = modalRoot.querySelector('#form-dossier-pay');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = form.elements['amount'].value;
      const success = store.recordPayment(invoiceId, amount);
      close();
      if (success) {
        showToast(`Settlement of ₹${amount} recorded for ${student}`, 'success');
        render();
      }
    });
  }

  // Initial render
  render();
}
