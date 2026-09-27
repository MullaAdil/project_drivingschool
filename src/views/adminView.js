/* ==========================================================================
   GAFOOR DRIVING SCHOOL — ADMIN CONSOLE
   Redesigned: flat premium dark layout, no animated blocks, no card grids everywhere
   ========================================================================== */

import { store } from '../store.js';
import { renderBrandLogo } from '../components/brandLogo.js';

export function renderAdminView(container, showToast, subService = 'hub', onNavigate) {
  let searchQuery = '';
  let activePackageFilter = 'all';
  let activePayFilter = 'all';
  let activeStageFilter = 'all';
  let lastPulsedTraineeId = null;

  function render() {
    const trainees = store.trainees;
    const trainers  = store.trainers;
    const payments  = store.payments;

    const totalInvoiced   = payments.reduce((a, p) => a + p.amount, 0);
    const totalCollected  = payments.reduce((a, p) => a + p.paid, 0);
    const totalOutstanding = payments.reduce((a, p) => a + p.balance, 0);
    const collectionRate  = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 100;

    const intakeCount = trainees.filter(t => t.currentDay <= 2).length;
    const groundCount = trainees.filter(t => t.currentDay >= 3 && t.currentDay <= 7).length;
    const cityCount   = trainees.filter(t => t.currentDay >= 8 && t.currentDay <= 15).length;
    const trackCount  = trainees.filter(t => t.currentDay >= 16 && t.currentDay <= 19).length;
    const examCount   = trainees.filter(t => t.currentDay >= 20).length;

    const topbar = `
      <div class="portal-topbar">
        <div class="portal-topbar-left">
          ${renderBrandLogo({ size: 'sm' })}
          <div class="portal-topbar-brand">
            <span class="portal-topbar-title">Gafoor Driving School</span>
            <span class="portal-topbar-sub">Admin Console · Pulivendula</span>
          </div>
        </div>
        <div class="portal-topbar-right">
          <span class="p-badge p-badge-green">AP-04-DS-2024</span>
          <span class="p-badge p-badge-dim">${trainees.length} Candidates</span>
        </div>
      </div>
    `;

    // Stage filter nav (replaces highway path)
    const stageNav = `
      <div class="portal-stage-nav">
        <button type="button" class="p-stage-btn ${activeStageFilter === 'all'    ? 'p-stage-active' : ''}" data-stage-target="all">All (${trainees.length})</button>
        <button type="button" class="p-stage-btn ${activeStageFilter === 'intake' ? 'p-stage-active' : ''}" data-stage-target="intake">LLR Intake (${intakeCount})</button>
        <button type="button" class="p-stage-btn ${activeStageFilter === 'ground' ? 'p-stage-active' : ''}" data-stage-target="ground">Ground & ABC (${groundCount})</button>
        <button type="button" class="p-stage-btn ${activeStageFilter === 'city'   ? 'p-stage-active' : ''}" data-stage-target="city">City & Flyover (${cityCount})</button>
        <button type="button" class="p-stage-btn ${activeStageFilter === 'track'  ? 'p-stage-active' : ''}" data-stage-target="track">RTO Track (${trackCount})</button>
        <button type="button" class="p-stage-btn ${activeStageFilter === 'exam'   ? 'p-stage-active' : ''}" data-stage-target="exam">DL Test (${examCount})</button>
      </div>
    `;

    let html = '';

    // =====================================================
    // HUB
    // =====================================================
    if (subService === 'hub') {
      html = `
        ${topbar}
        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">Operations Dashboard</h1>
            <p class="portal-page-sub">Gafoor Driving School — Pulivendula command hub.</p>
          </div>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button type="button" class="btn-mnc btn-mnc-primary btn-launch-sub" data-target="new-student" style="font-size:0.85rem; padding:0.55rem 1.1rem;">+ Add Student</button>
            <button type="button" class="p-ghost-btn" id="btn-export-rto-csv">Export CSV</button>
            <button type="button" class="p-ghost-btn btn-launch-sub" data-target="billing">Transactions</button>
          </div>
        </div>

        <div class="portal-stats-strip">
          <div class="portal-stat">
            <span class="portal-stat-value">${trainees.length}</span>
            <span class="portal-stat-label">Active Candidates</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">₹${totalCollected.toLocaleString('en-IN')}</span>
            <span class="portal-stat-label">Tuition Collected</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--primary-gold);">₹${totalOutstanding.toLocaleString('en-IN')}</span>
            <span class="portal-stat-label">Outstanding</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${collectionRate}%</span>
            <span class="portal-stat-label">Collection Rate</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${trainers.length}</span>
            <span class="portal-stat-label">Instructors</span>
          </div>
        </div>

        <!-- Navigation links (flat list instead of boxes) -->
        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">Workflow</span>
          </div>
          <div class="p-nav-list">
            <div class="p-nav-item">
              <div>
                <div class="p-nav-title">Student Registration</div>
                <div class="p-nav-sub">Register new candidate, assign LLR permit and course package</div>
              </div>
              <button type="button" class="p-link-btn btn-launch-sub" data-target="new-student">Open form →</button>
            </div>
            <div class="p-nav-item">
              <div>
                <div class="p-nav-title">Students Directory</div>
                <div class="p-nav-sub">${trainees.length} active candidates — progress, daily 8 km logging, dossiers</div>
              </div>
              <button type="button" class="p-link-btn btn-launch-sub" data-target="trainees">View list →</button>
            </div>
            <div class="p-nav-item">
              <div>
                <div class="p-nav-title">Instructors & Fleet</div>
                <div class="p-nav-sub">${trainers.length} certified faculty — dual-control vehicles, batch schedules</div>
              </div>
              <button type="button" class="p-link-btn btn-launch-sub" data-target="trainers">View →</button>
            </div>
            <div class="p-nav-item">
              <div>
                <div class="p-nav-title">Transactions & Money</div>
                <div class="p-nav-sub">Tuition ledger — cash/UPI collection, balance settlement</div>
              </div>
              <button type="button" class="p-link-btn btn-launch-sub" data-target="billing">Open →</button>
            </div>
          </div>
        </div>

        <!-- Today's dispatch quick view -->
        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">Today's Dispatch</span>
            <span class="portal-section-meta">First 3 slots</span>
          </div>
          <div class="p-table-wrap">
            <table class="p-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Candidate</th>
                  <th>Topic</th>
                  <th style="text-align:right;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${store.schedule.slice(0, 3).map(s => `
                  <tr>
                    <td class="p-td-mono">${s.time}</td>
                    <td class="p-td-name">${s.studentName}</td>
                    <td class="p-td-muted">${s.topic}</td>
                    <td style="text-align:right;"><span class="p-badge ${s.attendance === 'present' ? 'p-badge-green' : 'p-badge-dim'}">${s.attendance.toUpperCase()}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // =====================================================
    // STUDENTS DIRECTORY
    // =====================================================
    if (subService === 'trainees') {
      const filteredTrainees = trainees.filter(t => {
        const q = searchQuery.toLowerCase();
        const matchSearch = t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || (t.permitNumber || '').toLowerCase().includes(q);
        const matchPkg = activePackageFilter === 'all' ||
          (activePackageFilter === '20-day' && t.package.includes('20-Day')) ||
          (activePackageFilter === 'standard' && (t.package.includes('Standard') || t.package.includes('Beginner') || t.package.includes('City'))) ||
          (activePackageFilter === 'ladies' && t.package.includes('Ladies'));
        let matchStage = true;
        if (activeStageFilter === 'intake') matchStage = t.currentDay <= 2;
        else if (activeStageFilter === 'ground') matchStage = t.currentDay >= 3 && t.currentDay <= 7;
        else if (activeStageFilter === 'city') matchStage = t.currentDay >= 8 && t.currentDay <= 15;
        else if (activeStageFilter === 'track') matchStage = t.currentDay >= 16 && t.currentDay <= 19;
        else if (activeStageFilter === 'exam') matchStage = t.currentDay >= 20;
        return matchSearch && matchPkg && matchStage;
      });

      html = `
        ${topbar}
        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">Students Directory</h1>
            <p class="portal-page-sub">Candidate files with live progress tracking and dossiers.</p>
          </div>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button type="button" class="btn-mnc btn-mnc-primary" id="btn-goto-add-student" style="font-size:0.85rem; padding:0.55rem 1.1rem;">+ Add Student</button>
            <button type="button" class="p-ghost-btn" id="btn-export-rto-csv">Export CSV</button>
          </div>
        </div>

        <div class="portal-stats-strip" style="margin-bottom:0;">
          ${stageNav}
        </div>

        <div class="portal-section" style="padding-top:1rem;">
          <div class="portal-section-header">
            <div style="display:flex; gap:0.65rem; flex-wrap:wrap; align-items:center;">
              <input type="text" class="mnc-input" id="search-trainee" placeholder="Search name, ID, LLR…" value="${searchQuery}" style="width:220px; height:34px; font-size:0.825rem; padding:0 0.75rem;" />
              <button type="button" class="p-chip-btn ${activePackageFilter === 'all' ? 'p-chip-active' : ''}" data-pkg="all">All</button>
              <button type="button" class="p-chip-btn ${activePackageFilter === '20-day' ? 'p-chip-active' : ''}" data-pkg="20-day">20-Day</button>
              <button type="button" class="p-chip-btn ${activePackageFilter === 'standard' ? 'p-chip-active' : ''}" data-pkg="standard">Beginner</button>
              <button type="button" class="p-chip-btn ${activePackageFilter === 'ladies' ? 'p-chip-active' : ''}" data-pkg="ladies">Ladies</button>
            </div>
            <span class="portal-section-meta">${filteredTrainees.length} of ${trainees.length}</span>
          </div>

          <div class="p-table-wrap">
            <table class="p-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Package</th>
                  <th>Progress</th>
                  <th>Instructor</th>
                  <th>Fee</th>
                  <th style="text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTrainees.length === 0 ? `<tr><td colspan="6" style="text-align:center; color:var(--slate-muted); padding:2rem;">No candidates match the current filters.</td></tr>` :
                filteredTrainees.map(t => {
                  const tr = trainers.find(x => x.id === t.assignedTrainerId) || trainers[0];
                  const p  = payments.find(x => x.traineeId === t.id) || { amount: 7500, paid: 7500, balance: 0, status: 'paid' };
                  const pct = Math.min(100, Math.round((t.currentDay / 20) * 100));
                  const isPulsed = lastPulsedTraineeId === t.id;
                  return `
                    <tr class="${isPulsed ? 'p-row-pulsed' : ''}">
                      <td>
                        <div class="p-td-name">${t.name}</div>
                        <div class="p-td-sub">${t.id} · ${t.permitNumber || 'LLR Verified'}</div>
                      </td>
                      <td class="p-td-muted" style="font-size:0.8rem;">${t.package.split('(')[0].trim()}</td>
                      <td>
                        <div style="display:flex; align-items:center; gap:0.5rem;">
                          <div style="flex:1; height:4px; background:rgba(255,255,255,0.08); border-radius:2px; min-width:60px;">
                            <div style="width:${pct}%; height:100%; background:var(--neem-green); border-radius:2px;"></div>
                          </div>
                          <span style="font-size:0.75rem; color:var(--slate-muted); white-space:nowrap;">Day ${t.currentDay}/20</span>
                        </div>
                      </td>
                      <td class="p-td-muted" style="font-size:0.8rem;">${tr.name}</td>
                      <td>
                        <div style="font-size:0.875rem; font-weight:700; color:${p.balance > 0 ? 'var(--primary-gold)' : 'var(--neem-green)'};">
                          ${p.balance > 0 ? '₹' + p.balance.toLocaleString('en-IN') + ' due' : 'Paid ✓'}
                        </div>
                      </td>
                      <td style="text-align:right;">
                        <div style="display:flex; gap:0.4rem; justify-content:flex-end; flex-wrap:wrap;">
                          <button type="button" class="p-link-btn btn-open-dossier" data-trainee-id="${t.id}">Dossier</button>
                          <button type="button" class="p-link-btn btn-quick-step-day" data-trainee-id="${t.id}" data-current-day="${t.currentDay}" title="+1 Day (+8 km)">+Day</button>
                          ${t.currentDay >= 18 ? `<button type="button" class="p-link-btn btn-schedule-rto-slot" data-trainee-id="${t.id}" data-student="${t.name}" style="color:var(--neem-green);">RTO Slot</button>` : ''}
                        </div>
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

    // =====================================================
    // NEW STUDENT FORM
    // =====================================================
    if (subService === 'new-student') {
      html = `
        ${topbar}
        <div class="portal-page-header">
          <div>
            <button type="button" class="p-ghost-btn btn-launch-sub" data-target="trainees" style="margin-bottom:0.5rem; font-size:0.8rem;">← Back to Students</button>
            <h1 class="portal-page-title">Register New Student</h1>
            <p class="portal-page-sub">Fill candidate information, select course package, assign instructor and billing.</p>
          </div>
        </div>

        <form id="form-new-student-page">
          <div class="portal-section">
            <div class="portal-section-header"><span class="portal-section-title">1 · Candidate Profile</span></div>
            <div class="p-form-grid">
              <div class="p-form-row">
                <label class="p-label">Full Name *</label>
                <input type="text" class="mnc-input p-input" name="name" required placeholder="e.g. Divya Bharathi" />
              </div>
              <div class="p-form-row">
                <label class="p-label">Mobile (+91) *</label>
                <input type="tel" class="mnc-input p-input" name="phone" required placeholder="+91 98480 00000" />
              </div>
              <div class="p-form-row">
                <label class="p-label">Email</label>
                <input type="email" class="mnc-input p-input" name="email" placeholder="student@gmail.com" />
              </div>
              <div class="p-form-row">
                <label class="p-label">Branch</label>
                <select class="mnc-select p-input" name="branch">
                  <option value="Pulivendula - Kadapa Road">Pulivendula - Main Office (Kadapa Rd)</option>
                  <option value="Pulivendula - JNTU Bypass">Pulivendula - JNTU Bypass Ground</option>
                  <option value="Kadapa RTO Ground">Kadapa - District RTO Ground</option>
                </select>
              </div>
              <div class="p-form-row">
                <label class="p-label">Address</label>
                <input type="text" class="mnc-input p-input" name="address" placeholder="Street, Colony, Landmark" />
              </div>
              <div class="p-form-row">
                <label class="p-label">LLR Permit #</label>
                <input type="text" class="mnc-input p-input" name="permitNumber" value="TS009/LLR/2026/${Math.floor(1000 + Math.random() * 9000)}" />
              </div>
            </div>
          </div>

          <div class="portal-section">
            <div class="portal-section-header"><span class="portal-section-title">2 · Course & Instructor</span></div>
            <div class="p-form-grid">
              <div class="p-form-row" style="grid-column:1/-1;">
                <label class="p-label">Course Package</label>
                <select class="mnc-select p-input" name="package_choice">
                  <option value="Beginner Driving Course (₹5,500)">Beginner Course — ₹5,500 (20-Day, Ground ABC)</option>
                  <option value="RTO 8-Track &amp; City Mastery (₹7,500)" selected>RTO 8-Track & City — ₹7,500 (Full DL Syllabus)</option>
                  <option value="Ladies Special &amp; Doorstep Pickup (₹8,500)">Ladies Special — ₹8,500 (Senior Lady Mentor, Pickup)</option>
                </select>
              </div>
              <div class="p-form-row">
                <label class="p-label">Batch Timing</label>
                <select class="mnc-select p-input" name="slot">
                  <option value="06:00 AM - 07:00 AM">06:00 AM – 07:00 AM (Early Morning)</option>
                  <option value="07:00 AM - 08:00 AM">07:00 AM – 08:00 AM (Prime Batch)</option>
                  <option value="05:00 PM - 06:00 PM">05:00 PM – 06:00 PM (Evening)</option>
                </select>
              </div>
              <div class="p-form-row">
                <label class="p-label">Assigned Instructor</label>
                <select class="mnc-select p-input" name="assignedTrainerId">
                  ${trainers.map(tr => {
                    const c = trainees.filter(t => t.assignedTrainerId === tr.id).length;
                    return `<option value="${tr.id}">${tr.name} — ${tr.car.split(' ')[0]} (${c} students)</option>`;
                  }).join('')}
                </select>
              </div>
            </div>
          </div>

          <div class="portal-section">
            <div class="portal-section-header"><span class="portal-section-title">3 · Emergency & Billing</span></div>
            <div class="p-form-grid">
              <div class="p-form-row">
                <label class="p-label">Emergency Contact</label>
                <input type="text" class="mnc-input p-input" name="emergencyContact" placeholder="e.g. Srinivas Rao (Father)" />
              </div>
              <div class="p-form-row">
                <label class="p-label">Emergency Phone</label>
                <input type="tel" class="mnc-input p-input" name="emergencyPhone" placeholder="+91 98499 00000" />
              </div>
              <div class="p-form-row">
                <label class="p-label">Initial Payment</label>
                <select class="mnc-select p-input" name="paymentStatus">
                  <option value="partial" selected>Partial Deposit (₹3,500)</option>
                  <option value="paid">Full Payment (Settled)</option>
                  <option value="pending">Pending (Pay Later)</option>
                </select>
              </div>
              <div class="p-form-row">
                <label class="p-label">Payment Mode</label>
                <select class="mnc-select p-input" name="paymentMode">
                  <option value="UPI (PhonePe / Google Pay QR)">UPI QR (PhonePe / GPay)</option>
                  <option value="Cash Receipt">Cash at Desk</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:0.75rem; padding-top:1.5rem; border-top:1px solid var(--border-light);">
              <button type="button" class="p-ghost-btn btn-launch-sub" data-target="trainees">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Confirm Registration →</button>
            </div>
          </div>
        </form>
      `;
    }

    // =====================================================
    // TRANSACTIONS & MONEY
    // =====================================================
    if (subService === 'billing') {
      const filteredPayments = payments.filter(p => {
        const q = searchQuery.toLowerCase();
        const matchSearch = p.traineeName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.traineeId.toLowerCase().includes(q);
        const matchStatus = activePayFilter === 'all' || p.status === activePayFilter;
        return matchSearch && matchStatus;
      });

      html = `
        ${topbar}
        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">Transactions & Money</h1>
            <p class="portal-page-sub">Tuition ledger, UPI/cash collection, balance settlement.</p>
          </div>
          <button type="button" class="btn-mnc btn-mnc-primary" id="btn-quick-record-payment" style="font-size:0.85rem; padding:0.55rem 1.1rem;">+ Record Payment</button>
        </div>

        <div class="portal-stats-strip">
          <div class="portal-stat">
            <span class="portal-stat-value">₹${totalInvoiced.toLocaleString('en-IN')}</span>
            <span class="portal-stat-label">Total Invoiced</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">₹${totalCollected.toLocaleString('en-IN')}</span>
            <span class="portal-stat-label">Collected (${collectionRate}%)</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--primary-gold);">₹${totalOutstanding.toLocaleString('en-IN')}</span>
            <span class="portal-stat-label">Outstanding</span>
          </div>
        </div>

        <div class="portal-section">
          <div class="portal-section-header">
            <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
              <input type="text" class="mnc-input" id="search-payment" placeholder="Search student or invoice…" value="${searchQuery}" style="width:220px; height:34px; font-size:0.825rem; padding:0 0.75rem;" />
              <button type="button" class="p-chip-btn ${activePayFilter === 'all'     ? 'p-chip-active' : ''}" data-pay="all">All</button>
              <button type="button" class="p-chip-btn ${activePayFilter === 'paid'    ? 'p-chip-active' : ''}" data-pay="paid">Settled</button>
              <button type="button" class="p-chip-btn ${activePayFilter === 'partial' ? 'p-chip-active' : ''}" data-pay="partial">Partial</button>
              <button type="button" class="p-chip-btn ${activePayFilter === 'pending' ? 'p-chip-active' : ''}" data-pay="pending">Pending</button>
            </div>
            <span class="portal-section-meta">${filteredPayments.length} invoices</span>
          </div>

          <div class="p-table-wrap">
            <table class="p-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Candidate</th>
                  <th>Package</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th style="text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filteredPayments.map(p => `
                  <tr>
                    <td class="p-td-mono" style="font-size:0.8rem;">${p.id}</td>
                    <td>
                      <div class="p-td-name">${p.traineeName}</div>
                      <div class="p-td-sub">${p.traineeId}</div>
                    </td>
                    <td class="p-td-muted" style="font-size:0.78rem;">${p.package}</td>
                    <td class="p-td-mono">₹${p.amount.toLocaleString('en-IN')}</td>
                    <td style="color:var(--neem-green); font-weight:700; font-size:0.875rem;">₹${p.paid.toLocaleString('en-IN')}</td>
                    <td style="font-weight:700; color:${p.balance > 0 ? 'var(--primary-gold)' : 'var(--slate-muted)'}; font-size:0.875rem;">₹${p.balance.toLocaleString('en-IN')}</td>
                    <td><span class="p-badge ${p.status === 'paid' ? 'p-badge-green' : p.status === 'partial' ? 'p-badge-gold' : 'p-badge-dim'}">${p.status.toUpperCase()}</span></td>
                    <td style="text-align:right;">
                      <div style="display:flex; gap:0.4rem; justify-content:flex-end;">
                        <button type="button" class="p-link-btn btn-view-invoice-qr" data-invoice-id="${p.id}" data-student="${p.traineeName}" data-amount="${p.amount}" data-balance="${p.balance}" data-status="${p.status}">QR</button>
                        ${p.balance > 0 ? `<button type="button" class="p-link-btn btn-record-pay" data-invoice-id="${p.id}" data-balance="${p.balance}" data-student="${p.traineeName}" style="color:var(--neem-green);">Record</button>` : '<span style="font-size:0.75rem; color:var(--slate-muted);">Settled</span>'}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // =====================================================
    // INSTRUCTORS & FLEET
    // =====================================================
    if (subService === 'trainers') {
      html = `
        ${topbar}
        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">Instructors & Fleet</h1>
            <p class="portal-page-sub">RTO certified faculty and dual-control safety vehicles.</p>
          </div>
          <button type="button" class="btn-mnc btn-mnc-primary" id="btn-add-trainer" style="font-size:0.85rem; padding:0.55rem 1.1rem;">+ Add Instructor</button>
        </div>

        <div class="portal-stats-strip">
          <div class="portal-stat">
            <span class="portal-stat-value">${trainers.length}</span>
            <span class="portal-stat-label">Instructors</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">100%</span>
            <span class="portal-stat-label">RTO Certified</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">99.2%</span>
            <span class="portal-stat-label">DL Pass Rate</span>
          </div>
        </div>

        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">Faculty Directory</span>
          </div>
          <div class="p-table-wrap">
            <table class="p-table">
              <thead>
                <tr>
                  <th>Instructor</th>
                  <th>Role</th>
                  <th>Vehicle</th>
                  <th>Students</th>
                  <th style="text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${trainers.map(tr => {
                  const count = trainees.filter(t => t.assignedTrainerId === tr.id).length;
                  return `
                    <tr>
                      <td>
                        <div class="p-td-name">${tr.name}</div>
                        <div class="p-td-sub">${tr.id}</div>
                      </td>
                      <td class="p-td-muted">${tr.role}</td>
                      <td class="p-td-muted" style="font-size:0.8rem;">${tr.car}</td>
                      <td style="font-size:0.875rem; color:var(--charcoal);">${count} active</td>
                      <td style="text-align:right;">
                        <button type="button" class="p-link-btn btn-open-trainer-dossier" data-trainer-id="${tr.id}">Inspect →</button>
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

    container.innerHTML = `<div class="portal-shell">${html}</div>`;
    attachEvents();
    lastPulsedTraineeId = null;
  }

  function attachEvents() {
    container.querySelectorAll('.btn-launch-sub').forEach(btn => {
      btn.addEventListener('click', () => onNavigate(btn.dataset.target));
    });

    const btnGoAdd = container.querySelector('#btn-goto-add-student');
    if (btnGoAdd) btnGoAdd.addEventListener('click', () => onNavigate('new-student'));

    container.querySelectorAll('[data-stage-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = btn.dataset.stageTarget;
        if (t === 'all') activeStageFilter = 'all';
        else activeStageFilter = activeStageFilter === t ? 'all' : t;
        if (subService !== 'trainees') onNavigate('trainees');
        else render();
      });
    });

    const searchTrainee = container.querySelector('#search-trainee');
    if (searchTrainee) searchTrainee.addEventListener('input', e => { searchQuery = e.target.value; render(); });

    const searchPay = container.querySelector('#search-payment');
    if (searchPay) searchPay.addEventListener('input', e => { searchQuery = e.target.value; render(); });

    container.querySelectorAll('[data-pkg]').forEach(btn => {
      btn.addEventListener('click', () => { activePackageFilter = btn.dataset.pkg; render(); });
    });

    container.querySelectorAll('[data-pay]').forEach(btn => {
      btn.addEventListener('click', () => { activePayFilter = btn.dataset.pay; render(); });
    });

    container.querySelectorAll('.btn-open-dossier').forEach(btn => {
      btn.addEventListener('click', () => onNavigate('trainee-profile', btn.dataset.traineeId));
    });

    container.querySelectorAll('.btn-open-trainer-dossier').forEach(btn => {
      btn.addEventListener('click', () => onNavigate('trainer-profile', btn.dataset.trainerId));
    });

    container.querySelectorAll('.btn-quick-step-day').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.traineeId;
        const newDay = Math.min(20, parseInt(btn.dataset.currentDay, 10) + 1);
        store.updateTrainee(id, { currentDay: newDay, category: newDay <= 5 ? 'street' : newDay <= 15 ? 'highway' : 'test' });
        lastPulsedTraineeId = id;
        const t = store.trainees.find(x => x.id === id);
        showToast(`${t.name} → Day ${newDay} (+8 km)`, 'success');
        render();
      });
    });

    container.querySelectorAll('.btn-schedule-rto-slot').forEach(btn => {
      btn.addEventListener('click', () => openScheduleRtoModal(btn.dataset.traineeId, btn.dataset.student));
    });

    const btnExportCsv = container.querySelector('#btn-export-rto-csv');
    if (btnExportCsv) btnExportCsv.addEventListener('click', () => exportRtoAuditCsv(store.trainees, store.payments));

    const btnQuickPay = container.querySelector('#btn-quick-record-payment');
    if (btnQuickPay) {
      btnQuickPay.addEventListener('click', () => {
        const pending = store.payments.find(p => p.balance > 0);
        if (pending) openRecordPaymentModal(pending.id, pending.balance, pending.traineeName);
        else showToast('All accounts are fully settled!', 'info');
      });
    }

    container.querySelectorAll('.btn-record-pay').forEach(btn => {
      btn.addEventListener('click', () => openRecordPaymentModal(btn.dataset.invoiceId, parseFloat(btn.dataset.balance), btn.dataset.student));
    });

    container.querySelectorAll('.btn-view-invoice-qr').forEach(btn => {
      btn.addEventListener('click', () => {
        const balance = parseFloat(btn.dataset.balance);
        const amount  = parseFloat(btn.dataset.amount);
        openInvoiceQrModal(btn.dataset.invoiceId, btn.dataset.student, balance > 0 ? balance : amount);
      });
    });

    const btnAddTrainer = container.querySelector('#btn-add-trainer');
    if (btnAddTrainer) btnAddTrainer.addEventListener('click', openAddTrainerModal);

    const formNewStudent = container.querySelector('#form-new-student-page');
    if (formNewStudent) {
      formNewStudent.addEventListener('submit', e => {
        e.preventDefault();
        const f = formNewStudent.elements;
        store.addTrainee({
          name: f['name'].value.trim(),
          phone: f['phone'].value.trim(),
          email: f['email'].value.trim(),
          address: f['address'].value.trim() || f['branch'].value,
          package: f['package_choice'].value,
          permitNumber: f['permitNumber'].value.trim(),
          assignedTrainerId: f['assignedTrainerId'].value,
          emergencyContact: f['emergencyContact'].value.trim() || 'Parent / Guardian',
          emergencyPhone: f['emergencyPhone'].value.trim() || f['phone'].value.trim(),
          paymentStatus: f['paymentStatus'].value,
        });
        showToast(`Student "${f['name'].value.trim()}" registered!`, 'success');
        onNavigate('trainees');
      });
    }
  }

  // ---- Modals (flat dark style) ----
  function openScheduleRtoModal(traineeId, studentName) {
    const modalRoot = document.getElementById('modal-root');
    const defaultDate = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="p-modal">
          <div class="p-modal-header">
            <div>
              <div class="p-modal-title">Schedule RTO Test</div>
              <div class="p-modal-sub">${traineeId} · ${studentName}</div>
            </div>
            <button type="button" id="btn-close-rto-modal" class="p-modal-close">✕</button>
          </div>
          <form id="form-schedule-rto" class="p-modal-body">
            <div class="p-form-row">
              <label class="p-label">Test Date</label>
              <input type="date" class="mnc-input p-input" name="testDate" value="${defaultDate}" required />
            </div>
            <div class="p-form-row">
              <label class="p-label">Test Center</label>
              <select class="mnc-select p-input" name="testCenter">
                <option value="Pulivendula RTO ADTT">Pulivendula RTO (Automated Sensor Track)</option>
                <option value="Kadapa District RTO">Kadapa District RTO Ground</option>
              </select>
            </div>
            <div class="p-modal-footer">
              <button type="button" class="p-ghost-btn" id="btn-cancel-rto-modal">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Confirm Appointment →</button>
            </div>
          </form>
        </div>
      </div>
    `;
    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-rto-modal').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-rto-modal').addEventListener('click', close);
    modalRoot.querySelector('#form-schedule-rto').addEventListener('submit', e => {
      e.preventDefault();
      const date = e.target.elements['testDate'].value;
      const center = e.target.elements['testCenter'].value;
      store.updateTrainee(traineeId, { status: `Test on ${date}`, rtoSlot: `${date} at ${center}` });
      close();
      showToast(`RTO test scheduled for ${studentName} on ${date}`, 'success');
      render();
    });
  }

  function exportRtoAuditCsv(trainees, payments) {
    const headers = ['ID', 'Name', 'Phone', 'LLR', 'Package', 'Days', 'km', 'Invoiced', 'Paid', 'Balance', 'Status'];
    const rows = trainees.map(t => {
      const p = payments.find(x => x.traineeId === t.id) || { amount: 7500, paid: 7500, balance: 0, status: 'paid' };
      return [t.id, `"${t.name}"`, `"${t.phone}"`, `"${t.permitNumber}"`, `"${t.package}"`, t.currentDay, t.currentDay * 8, p.amount, p.paid, p.balance, `"${t.status}"`];
    });
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csv);
    a.download = `Gafoor_RTO_Audit_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast('RTO audit CSV exported', 'success');
  }

  function openRecordPaymentModal(invoiceId, balanceDue, studentName) {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="p-modal">
          <div class="p-modal-header">
            <div>
              <div class="p-modal-title">Record Payment</div>
              <div class="p-modal-sub">${invoiceId} · ${studentName}</div>
            </div>
            <button type="button" id="btn-close-pay-modal" class="p-modal-close">✕</button>
          </div>
          <form id="form-record-pay" class="p-modal-body">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:0.85rem 0; border-bottom:1px solid var(--border-light); margin-bottom:1rem;">
              <span style="font-size:0.8rem; color:var(--slate-muted);">Balance Due</span>
              <span style="font-size:1.25rem; font-weight:800; color:var(--primary-gold);">₹${balanceDue.toLocaleString('en-IN')}</span>
            </div>
            <div class="p-form-row">
              <label class="p-label">Amount Collected (₹) *</label>
              <input type="number" class="mnc-input p-input" name="paidAmount" required min="1" max="${balanceDue}" value="${balanceDue}" />
            </div>
            <div class="p-form-row">
              <label class="p-label">Payment Method</label>
              <select class="mnc-select p-input" name="method">
                <option value="UPI (PhonePe / Google Pay QR)">UPI (PhonePe / GPay)</option>
                <option value="Cash Receipt">Cash at Reception</option>
                <option value="Net Banking / IMPS">Net Banking / IMPS</option>
              </select>
            </div>
            <div class="p-modal-footer">
              <button type="button" class="p-ghost-btn" id="btn-cancel-pay-modal">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Confirm Payment →</button>
            </div>
          </form>
        </div>
      </div>
    `;
    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-pay-modal').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-pay-modal').addEventListener('click', close);
    modalRoot.querySelector('#form-record-pay').addEventListener('submit', e => {
      e.preventDefault();
      const amount = parseFloat(e.target.elements['paidAmount'].value);
      store.recordPayment(invoiceId, amount);
      close();
      showToast(`₹${amount.toLocaleString('en-IN')} recorded for ${studentName}`, 'success');
      render();
    });
  }

  function openInvoiceQrModal(invoiceId, studentName, amount) {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="p-modal" style="max-width:380px; text-align:center;">
          <div class="p-modal-header">
            <div>
              <div class="p-modal-title">UPI QR Voucher</div>
              <div class="p-modal-sub">${invoiceId} · ${studentName}</div>
            </div>
            <button type="button" id="btn-close-qr" class="p-modal-close">✕</button>
          </div>
          <div class="p-modal-body" style="text-align:center; padding:1.75rem;">
            <svg width="140" height="140" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom:0.75rem;">
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
              <rect x="16" y="68" width="12" height="10" fill="#1c1917"/>
              <rect x="120" y="68" width="16" height="8" fill="#1c1917"/>
            </svg>
            <div style="font-size:1.5rem; font-weight:800; color:#fff; margin-bottom:0.2rem;">₹${amount.toLocaleString('en-IN')}</div>
            <div style="font-size:0.8rem; color:var(--primary-gold); font-weight:700; margin-bottom:1rem;">gafoordrive@icici</div>
            <div style="display:flex; justify-content:center; gap:0.75rem;">
              <button type="button" class="p-ghost-btn" id="btn-close-qr-2">Close</button>
              <button type="button" class="btn-mnc btn-mnc-primary" id="btn-simulate-qr-paid">Simulate Pay ✓</button>
            </div>
          </div>
        </div>
      </div>
    `;
    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-qr').addEventListener('click', close);
    modalRoot.querySelector('#btn-close-qr-2').addEventListener('click', close);
    modalRoot.querySelector('#btn-simulate-qr-paid').addEventListener('click', () => {
      store.recordPayment(invoiceId, amount);
      close();
      showToast(`₹${amount.toLocaleString('en-IN')} settled via UPI ✓`, 'success');
      render();
    });
  }

  function openAddTrainerModal() {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="p-modal">
          <div class="p-modal-header">
            <div>
              <div class="p-modal-title">Add Instructor</div>
              <div class="p-modal-sub">Register trainer profile and assign vehicle</div>
            </div>
            <button type="button" id="btn-close-trn" class="p-modal-close">✕</button>
          </div>
          <form id="form-add-trainer" class="p-modal-body">
            <div class="p-form-row">
              <label class="p-label">Full Name *</label>
              <input type="text" class="mnc-input p-input" name="name" required placeholder="e.g. Suresh Varma" />
            </div>
            <div class="p-form-row">
              <label class="p-label">Mobile *</label>
              <input type="tel" class="mnc-input p-input" name="phone" required placeholder="+91 98480 55555" />
            </div>
            <div class="p-form-row">
              <label class="p-label">Designation</label>
              <input type="text" class="mnc-input p-input" name="role" value="Dual-Control Safety Instructor" />
            </div>
            <div class="p-form-row">
              <label class="p-label">Assigned Vehicle</label>
              <input type="text" class="mnc-input p-input" name="car" value="Maruti Swift Dual-Brake #AP-04-ED-${Math.floor(1000 + Math.random() * 9000)}" />
            </div>
            <div class="p-modal-footer">
              <button type="button" class="p-ghost-btn" id="btn-cancel-trn">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Register Instructor →</button>
            </div>
          </form>
        </div>
      </div>
    `;
    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-trn').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-trn').addEventListener('click', close);
    modalRoot.querySelector('#form-add-trainer').addEventListener('submit', e => {
      e.preventDefault();
      const f = e.target.elements;
      store.addTrainer({ name: f['name'].value.trim(), phone: f['phone'].value.trim(), role: f['role'].value.trim(), car: f['car'].value.trim() });
      close();
      showToast(`Instructor ${f['name'].value.trim()} registered`, 'success');
      render();
    });
  }

  render();
}
