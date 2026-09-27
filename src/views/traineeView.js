/* ==========================================================================
   GAFOOR DRIVING SCHOOL — TRAINEE PORTAL
   Redesigned: flat premium dark layout, no animated blocks
   ========================================================================== */

import { store } from '../store.js';
import { renderBrandLogo } from '../components/brandLogo.js';

export function renderTraineeView(container, showToast) {
  let activeFilter = 'all';

  function render() {
    const trainee = store.trainees.find(t => t.id === 'APX-9021') || store.trainees[0];
    const currentDay = store.traineeTestDay;
    const progressPercent = Math.round((currentDay / 20) * 100);
    const trainer = store.trainers.find(t => t.id === trainee.assignedTrainerId) || store.trainers[0];
    const curriculum = store.getCurriculum();
    const invoice = store.payments.find(p => p.traineeId === trainee.id) || store.payments[0];
    const isDay20 = currentDay >= 20;

    const filteredCurriculum = curriculum.filter(item =>
      activeFilter === 'all' ? true : item.category === activeFilter
    );

    const template = `
      <div class="portal-shell">

        <!-- PORTAL TOPBAR -->
        <div class="portal-topbar">
          <div class="portal-topbar-left">
            ${renderBrandLogo({ size: 'sm' })}
            <div class="portal-topbar-brand">
              <span class="portal-topbar-title">Gafoor Driving School</span>
              <span class="portal-topbar-sub">Candidate Portal · Pulivendula</span>
            </div>
          </div>
          <div class="portal-topbar-right">
            <span class="p-badge p-badge-dim">${trainee.id}</span>
            <span class="p-badge ${invoice.balance === 0 ? 'p-badge-green' : 'p-badge-gold'}">${invoice.balance === 0 ? 'Fully Paid ✓' : '₹' + invoice.balance.toLocaleString('en-IN') + ' Due'}</span>
          </div>
        </div>

        <!-- PAGE HEADER -->
        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">${trainee.name}</h1>
            <p class="portal-page-sub">${trainee.package} · Instructor: ${trainer.name} · ${trainer.car}</p>
          </div>
          <button type="button" class="btn-mnc btn-mnc-primary" id="btn-show-qr-voucher" style="font-size:0.85rem; padding:0.55rem 1.25rem;">Pay via UPI →</button>
        </div>

        <!-- FLAT STATS STRIP -->
        <div class="portal-stats-strip">
          <div class="portal-stat">
            <span class="portal-stat-value">${currentDay}<span style="font-size:1rem; color:var(--slate-muted);">/20</span></span>
            <span class="portal-stat-label">Days Completed</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${currentDay * 8} km</span>
            <span class="portal-stat-label">Total Distance</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${progressPercent}%</span>
            <span class="portal-stat-label">Progress</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:${invoice.balance > 0 ? 'var(--primary-gold)' : 'var(--neem-green)'};">
              ${invoice.balance > 0 ? '₹' + invoice.balance.toLocaleString('en-IN') : 'Cleared'}
            </span>
            <span class="portal-stat-label">Fee Balance</span>
          </div>
        </div>

        <!-- PROGRESS BAR -->
        <div class="portal-progress-bar-wrap">
          <div class="portal-progress-bar" style="width:${progressPercent}%;"></div>
        </div>

        <!-- SIMULATOR STRIP -->
        <div class="portal-section" style="padding-bottom:0;">
          <div class="portal-section-header">
            <span class="portal-section-title">Curriculum — 20-Day Program</span>
            <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
              <span style="font-size:0.72rem; color:var(--slate-muted);">Simulate:</span>
              <button type="button" class="p-chip-btn ${currentDay === 7  ? 'p-chip-active' : ''}" data-test-day="7">Day 7</button>
              <button type="button" class="p-chip-btn ${currentDay === 14 ? 'p-chip-active' : ''}" data-test-day="14">Day 14</button>
              <button type="button" class="p-chip-btn ${currentDay === 20 ? 'p-chip-active' : ''}" data-test-day="20">Day 20 (RTO)</button>
            </div>
          </div>

          <div class="portal-filter-bar">
            <button type="button" class="p-filter-btn ${activeFilter === 'all'     ? 'p-filter-active' : ''}" data-cat="all">All Days</button>
            <button type="button" class="p-filter-btn ${activeFilter === 'street'  ? 'p-filter-active' : ''}" data-cat="street">Ground & City</button>
            <button type="button" class="p-filter-btn ${activeFilter === 'highway' ? 'p-filter-active' : ''}" data-cat="highway">Highway & Flyover</button>
            <button type="button" class="p-filter-btn ${activeFilter === 'test'    ? 'p-filter-active' : ''}" data-cat="test">RTO Test</button>
          </div>
        </div>

        <!-- CURRICULUM TABLE -->
        <div class="portal-section">
          <div class="p-table-wrap">
            <table class="p-table">
              <thead>
                <tr>
                  <th style="width:60px;">Day</th>
                  <th>Topic</th>
                  <th>Module</th>
                  <th style="width:80px; text-align:center;">Distance</th>
                  <th style="width:110px; text-align:right;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredCurriculum.map(item => {
                  const isDone  = item.day < currentDay;
                  const isToday = item.day === currentDay;
                  const moduleLabel = item.category === 'street' ? 'Ground & City' : item.category === 'highway' ? 'Highway & Flyover' : 'RTO Test';
                  const statusHtml  = isDone
                    ? '<span class="p-status-done">Done</span>'
                    : isToday
                      ? '<span class="p-status-today">Today</span>'
                      : '<span class="p-status-upcoming">Upcoming</span>';
                  return `
                    <tr class="${isDone ? 'p-row-done' : isToday ? 'p-row-today' : ''}">
                      <td class="p-td-mono" style="color:var(--slate-muted);">Day ${item.day}</td>
                      <td>
                        <div class="p-td-name" style="font-size:0.875rem;">${item.title || item.topic}</div>
                        <div class="p-td-sub">${item.desc || item.notes || ''}</div>
                      </td>
                      <td class="p-td-muted">${moduleLabel}</td>
                      <td style="text-align:center; font-size:0.8rem; color:var(--slate-muted);">8 km</td>
                      <td style="text-align:right;">${statusHtml}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- DAY 20 GRADUATION / FEEDBACK -->
        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">Graduation Review</span>
          </div>
          ${!isDay20 ? `
            <div class="p-info-row">
              <p class="p-td-muted">Feedback unlocks after Day 20 completion. You are on Day ${currentDay}.</p>
              <button type="button" class="p-link-btn" id="btn-unlock-day20-now">Simulate Day 20 →</button>
            </div>
          ` : store.feedbackSubmitted ? `
            <div class="p-info-row">
              <span class="p-status-done">Graduation Confirmed ✓</span>
              <button type="button" class="btn-mnc btn-mnc-primary" id="btn-open-cert-modal" style="font-size:0.8rem; padding:0.45rem 1rem;">View Certificate →</button>
            </div>
          ` : `
            <form id="form-day20-feedback" class="p-form-grid">
              <div class="p-form-row">
                <label class="p-label">Clutch & Hill-Hold Confidence</label>
                <select class="mnc-select p-input" name="clutchConfidence">
                  <option value="5">★★★★★ Completely Confident</option>
                  <option value="4">★★★★☆ Good</option>
                  <option value="3">★★★☆☆ Moderate</option>
                </select>
              </div>
              <div class="p-form-row">
                <label class="p-label">RTO 8 & H Track Readiness</label>
                <select class="mnc-select p-input" name="trackReadiness">
                  <option value="5">★★★★★ 100% Ready</option>
                  <option value="4">★★★★☆ Good Control</option>
                  <option value="3">★★★☆☆ Needs Minor Practice</option>
                </select>
              </div>
              <div class="p-form-row">
                <label class="p-label">Instructor Rating</label>
                <select class="mnc-select p-input" name="trainerRating">
                  <option value="5">★★★★★ Outstanding</option>
                  <option value="4">★★★★☆ Very Good</option>
                  <option value="3">★★★☆☆ Satisfactory</option>
                </select>
              </div>
              <div class="p-form-row" style="grid-column:1/-1;">
                <label class="p-label">Your Feedback</label>
                <textarea class="mnc-input p-input" rows="3" name="comments" placeholder="Describe your experience..." style="resize:vertical;"></textarea>
              </div>
              <div style="grid-column:1/-1; display:flex; justify-content:flex-end;">
                <button type="submit" class="btn-mnc btn-mnc-primary">Submit Feedback & Graduate →</button>
              </div>
            </form>
          `}
        </div>

      </div>
    `;

    container.innerHTML = template;
    attachEvents();
  }

  function attachEvents() {
    container.querySelectorAll('[data-cat]').forEach(btn => {
      btn.addEventListener('click', () => { activeFilter = btn.dataset.cat; render(); });
    });

    container.querySelectorAll('[data-test-day]').forEach(btn => {
      btn.addEventListener('click', () => { store.setTraineeTestDay(btn.dataset.testDay); render(); });
    });

    const btnUnlock = container.querySelector('#btn-unlock-day20-now');
    if (btnUnlock) btnUnlock.addEventListener('click', () => { store.setTraineeTestDay(20); render(); });

    const btnOpenCert = container.querySelector('#btn-open-cert-modal');
    if (btnOpenCert) {
      btnOpenCert.addEventListener('click', () => {
        const trainee = store.trainees.find(t => t.id === 'APX-9021') || store.trainees[0];
        const trainer = store.trainers.find(t => t.id === trainee.assignedTrainerId) || store.trainers[0];
        openCertificateModal(trainee, trainer);
      });
    }

    const btnShowQR = container.querySelector('#btn-show-qr-voucher');
    if (btnShowQR) btnShowQR.addEventListener('click', openQRModal);

    const feedbackForm = container.querySelector('#form-day20-feedback');
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', e => {
        e.preventDefault();
        store.submitFeedback({
          clutchConfidence: feedbackForm.elements['clutchConfidence'].value,
          trackReadiness:   feedbackForm.elements['trackReadiness'].value,
          trainerRating:    feedbackForm.elements['trainerRating'].value,
          comments:         feedbackForm.elements['comments'].value,
        });
        showToast('Feedback recorded. Congratulations on completing the course!', 'success');
        render();
      });
    }
  }

  function openCertificateModal(trainee, trainer) {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="p-modal" style="max-width:620px; text-align:center;">
          <div class="p-modal-header">
            <div class="p-modal-title">Certificate of Driving Competency</div>
            <button type="button" id="btn-close-cert" class="p-modal-close">✕</button>
          </div>
          <div class="p-modal-body" style="text-align:center; padding:2rem 2.5rem;">
            <div style="margin-bottom:1rem;">${renderBrandLogo({ size: 'lg' })}</div>
            <div style="font-size:0.7rem; font-weight:800; letter-spacing:0.15em; color:var(--slate-muted); margin-bottom:0.5rem;">GAFOOR DRIVING SCHOOL · PULIVENDULA · AP-04-DS-2024</div>
            <div style="width:100%; height:1px; background:rgba(243,209,130,0.25); margin:1rem 0;"></div>
            <p style="font-size:0.825rem; color:var(--slate-body); line-height:1.7; margin-bottom:0.75rem;">
              This certifies that <strong style="color:#fff;">${trainee.name}</strong> (ID: ${trainee.id}) has successfully completed the
              <strong style="color:#fff;">20-Day Practical Driving Program</strong> — 160 km total distance, RTO 8-Track & H-Track cleared.
            </p>
            <div style="display:flex; justify-content:center; gap:0.65rem; flex-wrap:wrap; margin-bottom:1.5rem;">
              <span class="p-badge p-badge-green">RTO Form 5 Cleared ✓</span>
              <span class="p-badge p-badge-gold">Academy Seal Verified</span>
            </div>
            <div style="display:flex; justify-content:space-around; border-top:1px solid var(--border-light); padding-top:1.25rem; margin-bottom:1.5rem;">
              <div>
                <div style="font-size:0.875rem; font-weight:700; color:#fff;">${trainer.name}</div>
                <div style="font-size:0.7rem; color:var(--slate-muted);">Senior Master Examiner</div>
              </div>
              <div>
                <div style="font-size:0.875rem; font-weight:700; color:#fff;">M. A. Gafoor</div>
                <div style="font-size:0.7rem; color:var(--slate-muted);">Director, Gafoor Driving School</div>
              </div>
            </div>
            <div style="display:flex; justify-content:center; gap:0.75rem;">
              <button type="button" class="p-ghost-btn" id="btn-close-cert-2">Close</button>
              <button type="button" class="btn-mnc btn-mnc-primary" id="btn-print-cert">Print / Save PDF ⎙</button>
            </div>
          </div>
        </div>
      </div>
    `;
    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-cert').addEventListener('click', close);
    modalRoot.querySelector('#btn-close-cert-2').addEventListener('click', close);
    modalRoot.querySelector('#btn-print-cert').addEventListener('click', () => window.print());
  }

  function openQRModal() {
    const modalRoot = document.getElementById('modal-root');
    const trainee = store.trainees.find(t => t.id === 'APX-9021') || store.trainees[0];
    const invoice = store.payments.find(p => p.traineeId === trainee.id) || store.payments[0];

    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="p-modal" style="max-width:400px; text-align:center;">
          <div class="p-modal-header">
            <div>
              <div class="p-modal-title">UPI Payment</div>
              <div class="p-modal-sub">${trainee.name} · ${invoice.id}</div>
            </div>
            <button type="button" id="btn-close-qr" class="p-modal-close">✕</button>
          </div>
          <div class="p-modal-body" style="text-align:center; padding:1.75rem;">
            <svg width="160" height="160" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom:1rem;">
              <rect x="10" y="10" width="46" height="46" rx="6" fill="#1c1917"/>
              <rect x="18" y="18" width="30" height="30" rx="3" fill="#ffffff"/>
              <rect x="24" y="24" width="18" height="18" rx="2" fill="#0c5836"/>
              <rect x="124" y="10" width="46" height="46" rx="6" fill="#1c1917"/>
              <rect x="132" y="18" width="30" height="30" rx="3" fill="#ffffff"/>
              <rect x="138" y="24" width="18" height="18" rx="2" fill="#0c5836"/>
              <rect x="10" y="124" width="46" height="46" rx="6" fill="#1c1917"/>
              <rect x="18" y="132" width="30" height="30" rx="3" fill="#ffffff"/>
              <rect x="24" y="138" width="18" height="18" rx="2" fill="#0c5836"/>
              <rect x="74" y="74" width="32" height="32" rx="6" fill="#0c5836"/>
              <text x="90" y="95" font-size="16" fill="#c6923b" text-anchor="middle" font-weight="900">G</text>
              <rect x="68" y="16" width="10" height="10" fill="#1c1917"/>
              <rect x="86" y="16" width="12" height="8" fill="#1c1917"/>
              <rect x="104" y="22" width="8" height="14" fill="#1c1917"/>
              <rect x="16" y="68" width="12" height="10" fill="#1c1917"/>
              <rect x="36" y="74" width="14" height="12" fill="#1c1917"/>
              <rect x="120" y="68" width="16" height="8" fill="#1c1917"/>
              <rect x="144" y="74" width="18" height="14" fill="#1c1917"/>
              <rect x="68" y="118" width="14" height="12" fill="#1c1917"/>
              <rect x="90" y="124" width="18" height="10" fill="#1c1917"/>
              <rect x="120" y="118" width="12" height="16" fill="#1c1917"/>
              <rect x="142" y="130" width="16" height="14" fill="#1c1917"/>
            </svg>
            <div style="font-size:1.6rem; font-weight:800; color:#fff; margin-bottom:0.25rem;">₹${(invoice.balance > 0 ? invoice.balance : invoice.amount).toLocaleString('en-IN')}</div>
            <div style="font-size:0.8rem; color:var(--primary-gold); font-weight:700; margin-bottom:0.25rem;">gafoordrive@icici</div>
            <div style="font-size:0.75rem; color:var(--slate-muted); margin-bottom:1.5rem;">${invoice.balance > 0 ? 'Outstanding balance' : 'Fully settled ✓'} · PhonePe / GPay / Paytm</div>
            <div style="display:flex; justify-content:center; gap:0.75rem;">
              <button type="button" class="p-ghost-btn" id="btn-close-qr-2">Close</button>
              ${invoice.balance > 0 ? `<button type="button" class="btn-mnc btn-mnc-primary" id="btn-sim-qr-pay">Simulate Pay ✓</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-qr').addEventListener('click', close);
    modalRoot.querySelector('#btn-close-qr-2').addEventListener('click', close);
    const btnSim = modalRoot.querySelector('#btn-sim-qr-pay');
    if (btnSim) {
      btnSim.addEventListener('click', () => {
        store.recordPayment(invoice.id, invoice.balance);
        close();
        showToast('Payment cleared via UPI ✓', 'success');
        render();
      });
    }
  }

  render();
}
