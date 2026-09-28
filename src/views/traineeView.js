/* ==========================================================================
   GAFOOR DRIVING SCHOOL — CANDIDATE PORTAL
   Full-page layout fitting 100% viewport width without spaces.
   Dedicated candidate services:
   - Service 01: 20-Day Practical Curriculum Roadmap (8 km/day)
   - Service 02: Tuition Account, Invoices & UPI QR Voucher Payment
   - Service 03: Candidate Master KYC, LLR Permit & RTO Readiness Dossier
   ========================================================================== */

import { store } from '../store.js';
import { renderBrandLogo } from '../components/brandLogo.js';

export function renderTraineeView(container, showToast, subService = 'curriculum', onNavigate) {
  let activeFilter = 'all';

  function render() {
    const trainee  = store.getCurrentTrainee();
    const currentDay = trainee.currentDay || store.traineeTestDay;
    const progressPercent = Math.min(100, Math.round((currentDay / 20) * 100));
    const trainer  = store.trainers.find(t => t.id === trainee.assignedTrainerId) || store.trainers[0];
    const curriculum = store.getCurriculum();
    const invoice  = store.payments.find(p => p.traineeId === trainee.id) || store.payments[0];
    const kmDriven = currentDay * 8;
    const kmRemaining = Math.max(0, (20 - currentDay) * 8);

    const currentSub = subService || 'curriculum';

    const filteredCurriculum = curriculum.filter(item =>
      activeFilter === 'all' ? true : item.category === activeFilter
    );

    const topbar = '';

    let contentHtml = '';

    // =========================================================
    // SERVICE 01: 20-DAY CURRICULUM ROADMAP (8 KM/DAY)
    // =========================================================
    if (currentSub === 'curriculum') {
      contentHtml = `
        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">${trainee.name} — 20-Day Practical Driving Course</h1>
            <p class="portal-page-sub">${trainee.package} · LLR Permit: ${trainee.permitNumber || 'AP004/LLR/2026/8941'} · Instructor: ${trainer.name}</p>
          </div>
          <div style="display:flex; gap:0.65rem; align-items:center;">
            <button type="button" class="btn-mnc btn-mnc-primary" id="btn-show-qr-voucher">Pay Course Fee (UPI QR) →</button>
          </div>
        </div>

        <!-- STATS STRIP -->
        <div class="portal-stats-strip">
          <div class="portal-stat">
            <span class="portal-stat-value">${currentDay}<span style="font-size:1rem; color:var(--slate-muted);"> / 20</span></span>
            <span class="portal-stat-label">Days Completed</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--primary-cyan);">${kmDriven} km</span>
            <span class="portal-stat-label">Distance Driven</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${kmRemaining} km</span>
            <span class="portal-stat-label">Remaining</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${progressPercent}%</span>
            <span class="portal-stat-label">Course Progress</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:${invoice.balance > 0 ? 'var(--primary-gold)' : 'var(--neem-green)'};">
              ${invoice.balance > 0 ? '₹' + invoice.balance.toLocaleString('en-IN') : 'Cleared ✓'}
            </span>
            <span class="portal-stat-label">Fee Balance</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">${trainee.attendanceRate || '96%'}</span>
            <span class="portal-stat-label">Attendance Rate</span>
          </div>
        </div>

        <!-- PROGRESS BAR -->
        <div class="portal-progress-bar-wrap">
          <div class="portal-progress-bar" style="width:${progressPercent}%;"></div>
        </div>

        <!-- CURRICULUM TABLE -->
        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">20-Day Practical Driving Lessons (8 km per day)</span>
            <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
              <span style="font-size:0.75rem; color:var(--slate-muted);">Check day status:</span>
              <button type="button" class="p-chip-btn ${currentDay === 7  ? 'p-chip-active':''}" data-test-day="7">Day 7</button>
              <button type="button" class="p-chip-btn ${currentDay === 14 ? 'p-chip-active':''}" data-test-day="14">Day 14</button>
              <button type="button" class="p-chip-btn ${currentDay === 20 ? 'p-chip-active':''}" data-test-day="20">Day 20 (RTO)</button>
            </div>
          </div>

          <!-- Category filter buttons -->
          <div class="portal-filter-bar">
            <button type="button" class="p-filter-btn ${activeFilter==='all'     ?'p-filter-active':''}" data-cat="all">All 20 Days</button>
            <button type="button" class="p-filter-btn ${activeFilter==='street'  ?'p-filter-active':''}" data-cat="street">Ground &amp; Town (Days 1–10)</button>
            <button type="button" class="p-filter-btn ${activeFilter==='highway' ?'p-filter-active':''}" data-cat="highway">Highway &amp; Flyover (Days 11–19)</button>
            <button type="button" class="p-filter-btn ${activeFilter==='test'    ?'p-filter-active':''}" data-cat="test">RTO 8-Track Test (Day 20)</button>
          </div>

          <div class="p-table-wrap">
            <table class="p-table">
              <thead>
                <tr>
                  <th>Course Day</th>
                  <th>Practical Driving Lesson</th>
                  <th>Stage</th>
                  <th>Daily Distance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredCurriculum.map(item => {
                  const isDone  = item.day < currentDay;
                  const isToday = item.day === currentDay;
                  return `
                    <tr class="${isDone?'p-row-done':isToday?'p-row-today':''}">
                      <td class="p-td-mono" style="font-size:0.875rem; font-weight:800; color:${isDone?'var(--neem-green)':isToday?'var(--primary-gold)':'#ffffff'};">
                        Day ${item.day}
                      </td>
                      <td>
                        <div class="p-td-name" style="${isDone?'opacity:0.75;':''}">
                          ${isDone?'<span style="color:var(--neem-green); margin-right:0.35rem;">✓</span>':isToday?'<span style="color:var(--primary-gold); margin-right:0.35rem;">●</span>':''}${item.topic}
                        </div>
                        <div class="p-td-sub">${item.details || 'Standard RTO Practical Syllabus'}</div>
                      </td>
                      <td>
                        <span class="p-badge p-badge-dim" style="font-size:0.62rem;">${item.category.toUpperCase()}</span>
                      </td>
                      <td class="p-td-muted">
                        ${item.distance || '8 km'}
                      </td>
                      <td>
                        <span class="${isDone?'p-status-done':isToday?'p-status-today':'p-status-upcoming'}">
                          ${isDone ? '✓ Completed' : isToday ? '● Today’s Lesson' : 'Upcoming'}
                        </span>
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
    // SERVICE 02: TUITION FEE STATEMENT & UPI PAYMENT
    // =========================================================
    if (currentSub === 'billing') {
      contentHtml = `
        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">Course Fee Payment &amp; Receipts</h1>
            <p class="portal-page-sub">Pay course fees conveniently using PhonePe, Google Pay, or Paytm UPI QR code.</p>
          </div>
          <button type="button" class="btn-mnc btn-mnc-primary" id="btn-show-qr-voucher-billing">Show UPI QR Code →</button>
        </div>

        <div class="portal-stats-strip">
          <div class="portal-stat">
            <span class="portal-stat-value">₹${invoice.amount.toLocaleString('en-IN')}</span>
            <span class="portal-stat-label">Total Course Fee</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">₹${invoice.paid.toLocaleString('en-IN')}</span>
            <span class="portal-stat-label">Fee Paid</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:${invoice.balance > 0 ? 'var(--primary-gold)' : 'var(--neem-green)'};">
              ₹${invoice.balance.toLocaleString('en-IN')}
            </span>
            <span class="portal-stat-label">Balance Fee</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${invoice.status.toUpperCase()}</span>
            <span class="portal-stat-label">Fee Status</span>
          </div>
        </div>

        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">Fee Receipt &amp; Statement</span>
            <span class="portal-section-meta">Receipt #${invoice.id}</span>
          </div>
          <div class="p-summary-row">
            <span class="p-summary-key">Course Package</span>
            <span class="p-summary-value">${trainee.package}</span>
          </div>
          <div class="p-summary-row">
            <span class="p-summary-key">Total Course Fee</span>
            <span class="p-summary-value" style="font-family:var(--font-mono);">₹${invoice.amount.toLocaleString('en-IN')}</span>
          </div>
          <div class="p-summary-row">
            <span class="p-summary-key">Amount Paid</span>
            <span class="p-summary-value" style="color:var(--neem-green); font-family:var(--font-mono);">₹${invoice.paid.toLocaleString('en-IN')}</span>
          </div>
          <div class="p-summary-row">
            <span class="p-summary-key">Balance Due</span>
            <span class="p-summary-value" style="color:${invoice.balance > 0 ? 'var(--primary-gold)' : 'var(--neem-green)'}; font-family:var(--font-mono);">₹${invoice.balance.toLocaleString('en-IN')}</span>
          </div>
          <div class="p-summary-row">
            <span class="p-summary-key">Due Date</span>
            <span class="p-summary-value">${invoice.dueDate || '2026-09-30'}</span>
          </div>
          <div class="p-summary-row">
            <span class="p-summary-key">Accepted Payment Modes</span>
            <span class="p-summary-value">PhonePe UPI / Google Pay / BHIM / Cash at Desk</span>
          </div>
          ${invoice.balance > 0 ? `
            <div style="margin-top:1.5rem;">
              <button type="button" class="btn-mnc btn-mnc-primary" id="btn-pay-now-action" style="padding:0.8rem 1.8rem;">
                Pay Balance of ₹${invoice.balance.toLocaleString('en-IN')} via UPI QR →
              </button>
            </div>
          ` : `
            <div style="margin-top:1.5rem; padding:1rem; border-radius:var(--radius-sm); background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.18); font-size:0.9rem; color:#ffffff; font-weight:800;">
              ✓ Your course fee is fully paid and cleared! No further payment is due.
            </div>
          `}
        </div>
      `;
    }

    // =========================================================
    // SERVICE 03: STUDENT PROFILE & LEARNER LICENSE
    // =========================================================
    if (currentSub === 'profile') {
      contentHtml = `
        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">Student Profile &amp; Learner License (LLR)</h1>
            <p class="portal-page-sub">Official Government Learner's Licence (LLR) details, instructor assignment, and contact records.</p>
          </div>
          <div class="portal-page-header-meta">
            <span class="p-badge p-badge-green">Govt. Verified</span>
            <span class="p-badge p-badge-dim">Pulivendula Academy</span>
          </div>
        </div>

        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">Student Information &amp; Contact Details</span>
          </div>
          <div class="p-detail-grid">
            <div class="p-detail-cell">
              <div class="p-detail-key">Full Name</div>
              <div class="p-detail-value">${trainee.name}</div>
              <div class="p-detail-sub">As registered with RTO Parivahan</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">Student Admission ID</div>
              <div class="p-detail-value" style="font-family:var(--font-mono);">${trainee.id}</div>
              <div class="p-detail-sub">School registration number</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">LLR Permit Number</div>
              <div class="p-detail-value" style="font-family:var(--font-mono); color:var(--primary-cyan);">${trainee.permitNumber || 'AP004/LLR/2026/8941'}</div>
              <div class="p-detail-sub">Learner's Licence — Govt. of Andhra Pradesh</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">Mobile Number</div>
              <div class="p-detail-value">${trainee.phone || '+91 98480 22334'}</div>
              <div class="p-detail-sub">Primary WhatsApp Contact</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">Assigned Driving Instructor</div>
              <div class="p-detail-value">${trainer.name}</div>
              <div class="p-detail-sub">${trainer.role} · ${trainer.car}</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">Emergency Contact</div>
              <div class="p-detail-value">${trainee.emergencyContact || 'Guardian / Family Contact'}</div>
              <div class="p-detail-sub">${trainee.emergencyPhone || '+91 98480 11222'}</div>
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

    // Service Navigation Events
    container.querySelectorAll('[data-trainee-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetSub = btn.dataset.traineeNav;
        if (onNavigate) {
          onNavigate(targetSub);
        } else {
          renderTraineeView(container, showToast, targetSub, onNavigate);
        }
      });
    });

    // Day simulation buttons
    container.querySelectorAll('[data-test-day]').forEach(btn => {
      btn.addEventListener('click', () => {
        const day = parseInt(btn.dataset.testDay, 10);
        store.setTraineeTestDay(day);
        showToast(`Simulating Day ${day} curriculum status`, 'info');
        render();
      });
    });

    // Category filter buttons
    container.querySelectorAll('[data-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.cat;
        render();
      });
    });

    // UPI QR modals
    const attachQrBtn = (id) => {
      const el = container.querySelector(id);
      if (el) {
        el.addEventListener('click', () => {
          openQrVoucherModal(invoice.id, invoice.balance, trainee.name);
        });
      }
    };
    attachQrBtn('#btn-show-qr-voucher');
    attachQrBtn('#btn-show-qr-voucher-billing');
    attachQrBtn('#btn-pay-now-action');
  }

  function openQrVoucherModal(invoiceId, balance, student) {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="p-modal" style="max-width: 440px;">
          <div class="p-modal-header">
            <div>
              <div class="p-modal-title">Official UPI Payment QR</div>
              <div class="p-modal-sub">Gafoor Driving School · Pulivendula</div>
            </div>
            <button type="button" id="btn-close-qr" class="p-modal-close">✕</button>
          </div>
          <div class="p-modal-body" style="text-align: center;">
            <div style="background: #ffffff; padding: 1.25rem; border-radius: 8px; display: inline-block; margin: 0 auto 1.25rem;">
              <svg width="180" height="180" viewBox="0 0 100 100" style="display:block;">
                <rect width="100" height="100" fill="#ffffff"/>
                <rect x="5" y="5" width="30" height="30" fill="#0f172a"/>
                <rect x="10" y="10" width="20" height="20" fill="#ffffff"/>
                <rect x="13" y="13" width="14" height="14" fill="#0f172a"/>
                <rect x="65" y="5" width="30" height="30" fill="#0f172a"/>
                <rect x="70" y="10" width="20" height="20" fill="#ffffff"/>
                <rect x="73" y="13" width="14" height="14" fill="#0f172a"/>
                <rect x="5" y="65" width="30" height="30" fill="#0f172a"/>
                <rect x="10" y="70" width="20" height="20" fill="#ffffff"/>
                <rect x="13" y="73" width="14" height="14" fill="#0f172a"/>
                <rect x="42" y="10" width="8" height="8" fill="#0f172a"/>
                <rect x="45" y="25" width="6" height="12" fill="#0f172a"/>
                <rect x="55" y="30" width="8" height="8" fill="#0f172a"/>
                <rect x="40" y="45" width="20" height="12" fill="#0f172a"/>
                <rect x="68" y="45" width="10" height="6" fill="#0f172a"/>
                <rect x="45" y="65" width="15" height="10" fill="#0f172a"/>
                <rect x="65" y="65" width="10" height="20" fill="#0f172a"/>
                <rect x="80" y="75" width="12" height="10" fill="#0f172a"/>
              </svg>
            </div>
            <div style="font-size: 0.95rem; font-weight: 800; color: #ffffff;">Scan with Any UPI App</div>
            <div style="font-size: 0.8rem; color: var(--slate-muted); margin-top: 0.25rem;">PhonePe · Google Pay · Paytm · BHIM</div>
            <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 900; color: var(--primary-gold); margin: 0.75rem 0;">
              ₹${balance.toLocaleString('en-IN')}
            </div>
            <div style="font-size: 0.75rem; color: var(--slate-muted);">VPA: <strong>gafoordrivingschool@sbi</strong></div>
          </div>
          <div class="p-modal-footer">
            <button type="button" class="p-ghost-btn" id="btn-cancel-qr">Close</button>
            <button type="button" class="btn-mnc btn-mnc-primary" id="btn-sim-pay">I Have Paid (Confirm) ✓</button>
          </div>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-qr').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-qr').addEventListener('click', close);
    modalRoot.querySelector('#btn-sim-pay').addEventListener('click', () => {
      store.recordPayment(invoiceId, balance);
      close();
      showToast(`Payment of ₹${balance.toLocaleString('en-IN')} confirmed! Thank you.`, 'success');
      render();
    });
  }

  render();
}
