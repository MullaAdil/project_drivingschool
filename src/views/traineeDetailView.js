/* ==========================================================================
   APEX DRIVE — CANDIDATE INSPECT DOSSIER (MODERN ENTERPRISE UI)
   - Full-bleed edge-to-edge layout fitting 100% viewport width
   - High-contrast obsidian & gold styling (zero light-bleed glitches)
   - Master Candidate KYC & Sarathi LLR telemetry
   - Assigned Certified Faculty & Safety Vehicle reassignment
   - 20-Day Practical Curriculum (8 km/day) milestone progression
   - Tuition ledger with instant UPI payment recording
   ========================================================================== */

import { store } from '../store.js';
import { renderBrandLogo } from '../components/brandLogo.js';
import { renderStudentAvatar } from '../components/studentAvatar.js';
import { triggerPhotoUpload } from '../components/photoCropModal.js';

export function renderTraineeDetailView(container, traineeId, showToast, onNavigate, initialService = 'profile') {
  const trainee = store.trainees.find(t => t.id === traineeId) || store.trainees[0];
  const trainers = store.trainers;
  let activeService = initialService || 'profile';

  function render() {
    const assignedTrainer = trainers.find(tr => tr.id === trainee.assignedTrainerId) || trainers[0];
    const invoice = store.payments.find(p => p.traineeId === trainee.id) || {
      id: 'INV-4011', amount: 7500, paid: 7000, balance: 500, dueDate: '2026-09-30', status: 'partial'
    };
    const curriculum = store.getCurriculum();
    const progressPercent = Math.min(100, Math.round((trainee.currentDay / 20) * 100));
    const kmDriven = trainee.currentDay * 8;
    const kmRemaining = Math.max(0, (20 - trainee.currentDay) * 8);

    let stageName = trainee.currentDay <= 2 ? 'Stage 1 · LLR Intake' :
                    trainee.currentDay <= 7 ? 'Stage 2 · Ground Practice' :
                    trainee.currentDay <= 15 ? 'Stage 3 · Town Driving' :
                    trainee.currentDay <= 19 ? 'Stage 4 · RTO 8-Track' : 'Stage 5 · Test Ready';

    const template = `
      <div class="student-details-container">

        <!-- Top Action Navigation Strip -->
        <div class="student-details-top-strip">
          <button type="button" class="student-btn-back" id="btn-back-roster">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Back to Students Directory
          </button>

          <div class="student-actions-row">
            <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm" id="btn-quick-step-day" title="Mark 1 day (+8 km practice logged)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              + 1 Day (+8 km)
            </button>
            <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm" id="btn-print-dossier">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Driving Record (PDF)
            </button>
            <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm" id="btn-edit-student">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Edit Student Details
            </button>
            <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm" id="btn-dossier-change-photo" style="border-color:rgba(255,255,255,0.25); color:#ffffff;" title="Upload or change student photo or logo">
              📷 ${trainee.profilePhotoData ? 'Change Photo' : 'Upload Photo / Logo'}
            </button>
            ${invoice.balance > 0 ? `
              <button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm" id="btn-record-payment">
                Receive Fee Payment
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Student Identity Hero Card -->
        <div class="student-hero-card">
          <div class="student-hero-left">
            <div style="width:72px; height:72px; border-radius:50%; overflow:hidden; background:#ffffff; border:1.5px solid rgba(255,255,255,0.3); box-shadow:0 4px 16px rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              ${trainee.profilePhotoData
                ? `<img src="${trainee.profilePhotoData}" alt="${trainee.name}" style="width:100%; height:100%; object-fit:cover; display:block; border-radius:50%;" />`
                : `<div style="width:100%; height:100%; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; font-size:1.6rem; font-weight:800; color:#ffffff;">${(trainee.avatar || trainee.name.substring(0, 2)).toUpperCase()}</div>`
              }
            </div>
            <div class="student-hero-name-block">
              <h1>${trainee.name}</h1>
              <div class="student-hero-badges">
                <span class="p-badge p-badge-gold" style="font-size:0.7rem;">${trainee.id}</span>
                <span class="p-badge ${invoice.balance === 0 ? 'p-badge-green' : 'p-badge-gold'}">
                  ${invoice.balance === 0 ? 'Fee Fully Paid ✓' : `₹${invoice.balance.toLocaleString('en-IN')} Due`}
                </span>
                <span class="p-badge p-badge-dim" style="color:#ffffff; border-color:rgba(255,255,255,0.2);">
                  ${stageName}
                </span>
              </div>
              <div class="student-hero-meta">
                <span>Package: <strong>${trainee.package}</strong></span>
                <span>•</span>
                <span>LLR Permit: <strong style="color:var(--primary-cyan); font-family:var(--font-mono);">${trainee.permitNumber || 'AP004/LLR/2026/8941'}</strong></span>
                <span>•</span>
                <span>Enrolled: <strong>${trainee.registeredDate}</strong></span>
              </div>
            </div>
          </div>

          <div class="student-hero-progress">
            <div style="display:flex; align-items:baseline; gap:0.4rem;">
              <span style="font-size:1.6rem; font-weight:900; color:#ffffff; font-family:var(--font-mono);">${progressPercent}%</span>
              <span style="font-size:0.8rem; color:var(--slate-muted); text-transform:uppercase; font-weight:700;">Completed</span>
            </div>
            <div style="width:180px; height:8px; background:rgba(255,255,255,0.08); border-radius:var(--radius-pill); overflow:hidden; border:1px solid rgba(255,255,255,0.06);">
              <div style="width:${progressPercent}%; height:100%; background:var(--neem-green); border-radius:var(--radius-pill); transition:width 0.3s ease;"></div>
            </div>
            <span style="font-size:0.75rem; color:var(--slate-muted);">Day ${trainee.currentDay} of 20 practical lessons (${kmDriven} km)</span>
          </div>
        </div>

        <!-- Bound Services Navigation Tabs Bar -->
        <div class="student-services-nav">
          <button type="button" class="student-service-tab ${activeService === 'profile' ? 'active' : ''}" data-service-tab="profile">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>1. Student Profile &amp; KYC</span>
          </button>
          <button type="button" class="student-service-tab ${activeService === 'course' ? 'active' : ''}" data-service-tab="course">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            <span>2. 20-Day Driving Course (${trainee.currentDay}/20)</span>
          </button>
          <button type="button" class="student-service-tab ${activeService === 'fees' ? 'active' : ''}" data-service-tab="fees">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            <span>3. Fees &amp; Receipts (${invoice.balance > 0 ? '₹' + invoice.balance.toLocaleString('en-IN') + ' Due' : 'Paid ✓'})</span>
          </button>
          <button type="button" class="student-service-tab ${activeService === 'instructor' ? 'active' : ''}" data-service-tab="instructor">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
            <span>4. Instructor &amp; Dual-Control Car</span>
          </button>
          <button type="button" class="student-service-tab ${activeService === 'rto' ? 'active' : ''}" data-service-tab="rto">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
            <span>5. Govt DL Test (RTO)</span>
          </button>
        </div>

        <!-- ============================================================ -->
        <!-- SERVICE 1: STUDENT PROFILE & KYC SUB-PAGE -->
        <!-- ============================================================ -->
        ${activeService === 'profile' ? `
          <div class="student-service-page">
            
            <!-- 4 Metric Cards Strip -->
            <div class="student-kpi-grid">
              <div class="student-kpi-card">
                <span class="student-kpi-val">${trainee.currentDay}<span style="font-size:1rem; color:var(--slate-muted);"> / 20</span></span>
                <span class="student-kpi-label">Classes Completed</span>
              </div>
              <div class="student-kpi-card">
                <span class="student-kpi-val" style="color:var(--primary-cyan);">${kmDriven}<span style="font-size:1rem; color:var(--slate-muted);"> km</span></span>
                <span class="student-kpi-label">Distance Driven (${kmRemaining} km remaining)</span>
              </div>
              <div class="student-kpi-card">
                <span class="student-kpi-val" style="color:${invoice.balance > 0 ? 'var(--primary-gold)' : 'var(--neem-green)'};">
                  ${invoice.balance > 0 ? '₹' + invoice.balance.toLocaleString('en-IN') : 'Cleared ✓'}
                </span>
                <span class="student-kpi-label">Pending Balance Fee</span>
              </div>
              <div class="student-kpi-card">
                <span class="student-kpi-val" style="color:${trainee.currentDay >= 18 ? 'var(--neem-green)' : '#ffffff'};">
                  ${trainee.currentDay >= 18 ? 'Ready for 8-Track' : `${20 - trainee.currentDay} Days to Test`}
                </span>
                <span class="student-kpi-label">Test Readiness</span>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(420px, 1fr)); gap:1.5rem;">
              
              <!-- Student Particulars Card -->
              <div class="student-card" style="margin-bottom:0;">
                <div class="student-card-header">
                  <span class="student-card-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary-gold)" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    Student Particulars &amp; Identity Record
                  </span>
                  <span class="p-badge p-badge-green" style="font-size:0.6rem;">Govt. Verified</span>
                </div>
                <div class="student-card-body">
                  <div class="student-data-table">
                    <div class="student-data-row">
                      <span class="student-data-key">Full Legal Name</span>
                      <span class="student-data-val">${trainee.name}</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Government LLR Permit</span>
                      <span class="student-data-val" style="color:var(--primary-cyan); font-family:var(--font-mono);">${trainee.permitNumber || 'AP004/LLR/2026/8941'}</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Primary Mobile</span>
                      <span class="student-data-val">${trainee.phone || '+91 98480 22334'}</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Email Address</span>
                      <span class="student-data-val">${trainee.email || 'student@gafoordriving.in'}</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Residential Address</span>
                      <span class="student-data-val">${trainee.address || 'Pulivendula, Andhra Pradesh'}</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Emergency Contact</span>
                      <span class="student-data-val">${trainee.emergencyContact || 'Guardian / Family Contact'}</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Emergency Phone</span>
                      <span class="student-data-val">${trainee.emergencyPhone || '+91 98480 11222'}</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Enrolled Package</span>
                      <span class="student-data-val" style="color:var(--primary-gold);">${trainee.package}</span>
                    </div>
                  </div>

                  <div style="margin-top:1.5rem; display:flex; gap:0.65rem; flex-wrap:wrap;">
                    <button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm" id="btn-edit-student-profile">
                      Edit Student Details
                    </button>
                    <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm" id="btn-print-dossier-profile">
                      Print Form 5 Record (PDF)
                    </button>
                  </div>
                </div>
              </div>

              <!-- Official Sarathi & RTO KYC Card -->
              <div class="student-card" style="margin-bottom:0;">
                <div class="student-card-header">
                  <span class="student-card-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary-cyan)" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
                    Parivahan Sarathi &amp; RTO Verification
                  </span>
                  <span class="p-badge p-badge-dim" style="font-size:0.6rem;">Pulivendula AP-04</span>
                </div>
                <div class="student-card-body">
                  <div class="student-data-table">
                    <div class="student-data-row">
                      <span class="student-data-key">Sarathi Application ID</span>
                      <span class="student-data-val" style="font-family:var(--font-mono); color:var(--primary-cyan);">AP2026/SARATHI/89412</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Govt. LLR Permit</span>
                      <span class="student-data-val" style="font-family:var(--font-mono); color:var(--neem-green);">${trainee.permitNumber || 'AP004/LLR/2026/8941'}</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">LLR Validity Status</span>
                      <span class="student-data-val" style="color:var(--neem-green);">✓ Active (Valid for 6 Months)</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Medical Fitness Form 1-A</span>
                      <span class="student-data-val" style="color:var(--neem-green);">✓ Certified by Regd. Doctor</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Aadhaar e-KYC</span>
                      <span class="student-data-val" style="color:var(--neem-green);">✓ Biometrically Verified</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Jurisdiction RTO Unit</span>
                      <span class="student-data-val">Pulivendula Track · Kadapa Dist</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Attendance Adherence</span>
                      <span class="student-data-val" style="color:var(--neem-green); font-weight:800;">${trainee.attendanceRate || '96%'} On-Time</span>
                    </div>
                  </div>

                  <div style="margin-top:1.5rem; padding:0.85rem; border-radius:var(--radius-sm); background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.14); font-size:0.8rem; color:#ffffff;">
                    ✓ Parivahan Sarathi clearance complete. Candidate authorized for dual-control road classes.
                  </div>
                </div>
              </div>

            </div>
          </div>
        ` : ''}

        <!-- ============================================================ -->
        <!-- SERVICE 2: 20-DAY PRACTICAL DRIVING COURSE SUB-PAGE -->
        <!-- ============================================================ -->
        ${activeService === 'course' ? `
          <div class="student-service-page">
            <div class="student-card">
              <div class="student-card-header">
                <div>
                  <span class="student-card-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary-cyan)" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    20-Day Practical Driving Course (8 km / Day · 160 km Total)
                  </span>
                  <div style="font-size:0.775rem; color:var(--slate-muted); margin-top:0.25rem;">
                    Standard Government Driving Syllabus · Pulivendula Daily Road Classes
                  </div>
                </div>

                <button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm" id="btn-advance-curriculum" style="white-space:nowrap;">
                  + Mark Next Day (+8 km)
                </button>
              </div>

              <div class="student-card-body">

                <!-- Phase indicators -->
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:0.85rem; margin-bottom:1.5rem;">
                  <div style="padding:0.85rem 1rem; border-radius:var(--radius-sm); border:1px solid var(--border-light); background:${trainee.currentDay >= 7 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)'};">
                    <div style="font-size:0.68rem; font-weight:800; color:var(--slate-muted); text-transform:uppercase;">Phase 1 · Days 1–7</div>
                    <div style="font-size:0.95rem; font-weight:800; color:#ffffff; margin-top:0.2rem;">Ground Practice &amp; ABC</div>
                    <div style="font-size:0.75rem; color:${trainee.currentDay >= 7 ? '#ffffff' : 'var(--slate-muted)'}; font-weight:700; margin-top:0.25rem;">
                      ${trainee.currentDay >= 7 ? '✓ Completed' : 'In Progress'}
                    </div>
                  </div>

                  <div style="padding:0.85rem 1rem; border-radius:var(--radius-sm); border:1px solid var(--border-light); background:${trainee.currentDay >= 15 ? 'rgba(255,255,255,0.06)' : trainee.currentDay >= 8 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)'};">
                    <div style="font-size:0.68rem; font-weight:800; color:var(--slate-muted); text-transform:uppercase;">Phase 2 · Days 8–15</div>
                    <div style="font-size:0.95rem; font-weight:800; color:#ffffff; margin-top:0.2rem;">Town Driving &amp; Flyover</div>
                    <div style="font-size:0.75rem; color:${trainee.currentDay >= 15 ? '#ffffff' : trainee.currentDay >= 8 ? '#ffffff' : 'var(--slate-muted)'}; font-weight:700; margin-top:0.25rem;">
                      ${trainee.currentDay >= 15 ? '✓ Completed' : trainee.currentDay >= 8 ? '● Active Lessons' : 'Upcoming'}
                    </div>
                  </div>

                  <div style="padding:0.85rem 1rem; border-radius:var(--radius-sm); border:1px solid var(--border-light); background:${trainee.currentDay >= 20 ? 'rgba(255,255,255,0.06)' : trainee.currentDay >= 16 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)'};">
                    <div style="font-size:0.68rem; font-weight:800; color:var(--slate-muted); text-transform:uppercase;">Phase 3 · Days 16–20</div>
                    <div style="font-size:0.95rem; font-weight:800; color:#ffffff; margin-top:0.2rem;">RTO 8-Track &amp; Test Mock</div>
                    <div style="font-size:0.75rem; color:${trainee.currentDay >= 20 ? '#ffffff' : trainee.currentDay >= 16 ? '#ffffff' : 'var(--slate-muted)'}; font-weight:700; margin-top:0.25rem;">
                      ${trainee.currentDay >= 20 ? '✓ Ready for DL' : trainee.currentDay >= 16 ? '● Active Track' : 'Upcoming'}
                    </div>
                  </div>
                </div>

                <!-- 20-Day Milestones Grid -->
                <div class="inspect-milestone-grid">
                  ${curriculum.map(c => {
                    const isCleared = c.day < trainee.currentDay;
                    const isToday = c.day === trainee.currentDay;
                    const statusClass = isCleared ? 'cleared' : isToday ? 'active-today' : 'upcoming';
                    const statusText = isCleared ? '✓ Completed' : isToday ? '● Today’s Lesson' : '○ Upcoming';
                    const statusColor = isCleared ? 'var(--neem-green)' : isToday ? 'var(--primary-gold)' : 'var(--slate-muted)';

                    return `
                      <div class="inspect-milestone-item ${statusClass}">
                        <div class="inspect-day-head">
                          <span class="inspect-day-num" style="color:${statusColor};">Day ${c.day}</span>
                          <span style="font-size:0.7rem; font-weight:800; color:${statusColor};">${statusText}</span>
                        </div>
                        <div class="inspect-day-title">${c.topic}</div>
                        <div class="inspect-day-footer">
                          <span>8 km practical driving</span>
                          <span style="font-family:var(--font-mono);">${c.day * 8} km cumulative</span>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>

              </div>
            </div>
          </div>
        ` : ''}

        <!-- ============================================================ -->
        <!-- SERVICE 3: FEES & PAYMENT RECEIPTS SUB-PAGE -->
        <!-- ============================================================ -->
        ${activeService === 'fees' ? `
          <div class="student-service-page">
            
            <!-- Fee Overview Strip -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1.25rem;">
              <div class="student-kpi-card">
                <span class="student-kpi-val">₹${invoice.amount.toLocaleString('en-IN')}</span>
                <span class="student-kpi-label">Total Course Fee</span>
              </div>
              <div class="student-kpi-card">
                <span class="student-kpi-val" style="color:var(--neem-green);">₹${invoice.paid.toLocaleString('en-IN')}</span>
                <span class="student-kpi-label">Total Paid Amount</span>
              </div>
              <div class="student-kpi-card">
                <span class="student-kpi-val" style="color:${invoice.balance > 0 ? 'var(--primary-gold)' : 'var(--neem-green)'};">
                  ${invoice.balance > 0 ? '₹' + invoice.balance.toLocaleString('en-IN') : 'Cleared ✓'}
                </span>
                <span class="student-kpi-label">Pending Balance Due</span>
              </div>
            </div>

            <!-- Fee Receipts Ledger Card -->
            <div class="student-card">
              <div class="student-card-header">
                <div>
                  <span class="student-card-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary-gold)" stroke-width="2.5"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                    Official Fee Receipts &amp; Installments Ledger
                  </span>
                  <div style="font-size:0.775rem; color:var(--slate-muted); margin-top:0.25rem;">
                    Gafoor Driving School · GST / Receipt Records
                  </div>
                </div>

                ${invoice.balance > 0 ? `
                  <button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm" id="btn-pay-now-card">
                    Receive Balance Fee (₹${invoice.balance.toLocaleString('en-IN')}) →
                  </button>
                ` : `
                  <span class="p-badge p-badge-green" style="font-size:0.7rem;">✓ Account Fully Settled</span>
                `}
              </div>

              <div class="student-card-body">
                <div class="p-table-wrap">
                  <table class="p-table">
                    <thead>
                      <tr>
                        <th>Receipt ID</th>
                        <th>Payment Date</th>
                        <th>Description</th>
                        <th>Payment Mode</th>
                        <th>Amount Paid</th>
                        <th style="text-align:right;">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="p-td-mono" style="color:var(--primary-gold); font-weight:700;">${invoice.id}</td>
                        <td class="p-td-muted">${trainee.registeredDate || '2026-09-01'}</td>
                        <td>
                          <div style="font-weight:700; color:#ffffff;">20-Day Driving Course Tuition</div>
                          <div class="p-td-sub">Initial Registration &amp; LLR Filing</div>
                        </td>
                        <td>
                          <span class="p-badge p-badge-dim" style="color:#ffffff; border-color:rgba(255,255,255,0.2);">PhonePe UPI</span>
                        </td>
                        <td style="font-family:var(--font-mono); font-weight:800; color:#ffffff; font-size:1rem;">
                          ₹${invoice.paid.toLocaleString('en-IN')}
                        </td>
                        <td style="text-align:right;">
                          <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm" id="btn-print-receipt-single">
                            Print Official Receipt (PDF)
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style="margin-top:1.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; padding:1rem 1.25rem; background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:var(--radius-sm);">
                  <div>
                    <span style="font-size:0.75rem; color:var(--slate-muted); text-transform:uppercase; font-weight:800;">Balance Due Date:</span>
                    <strong style="color:#ffffff; margin-left:0.5rem;">${invoice.dueDate}</strong>
                  </div>
                  <div style="font-size:0.8rem; color:var(--slate-muted);">
                    Accepted Methods: UPI (PhonePe, Google Pay), Cash at Pulivendula Desk, Net Banking.
                  </div>
                </div>
              </div>
            </div>

          </div>
        ` : ''}

        <!-- ============================================================ -->
        <!-- SERVICE 4: INSTRUCTOR & DUAL-CONTROL CAR SUB-PAGE -->
        <!-- ============================================================ -->
        ${activeService === 'instructor' ? `
          <div class="student-service-page">
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(420px, 1fr)); gap:1.5rem;">
              
              <!-- Assigned Instructor Profile -->
              <div class="student-card" style="margin-bottom:0;">
                <div class="student-card-header">
                  <span class="student-card-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary-gold)" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    Assigned Driving Instructor
                  </span>
                  <span class="p-badge p-badge-green" style="font-size:0.6rem;">Govt. Certified Instructor</span>
                </div>
                <div class="student-card-body">
                  <div style="display:flex; gap:1.15rem; align-items:center; margin-bottom:1.25rem;">
                    <div class="student-avatar-badge" style="width:56px; height:56px; font-size:1.35rem;">
                      ${assignedTrainer.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style="font-size:1.2rem; font-weight:800; color:#ffffff;">${assignedTrainer.name}</div>
                      <div style="font-size:0.825rem; color:var(--primary-gold); font-weight:700;">${assignedTrainer.role}</div>
                      <div style="font-size:0.8rem; color:var(--neem-green); font-weight:700; margin-top:0.25rem;">
                        ★ ${assignedTrainer.rating} Rating · Pulivendula Branch
                      </div>
                    </div>
                  </div>

                  <div class="student-data-table">
                    <div class="student-data-row">
                      <span class="student-data-key">Instructor Mobile</span>
                      <span class="student-data-val">${assignedTrainer.phone || '+91 94402 88192'}</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Active Students Batch</span>
                      <span class="student-data-val">${assignedTrainer.activeStudents} Enrolled Candidates</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Teaching Experience</span>
                      <span class="student-data-val">12+ Years Professional Driving Instruction</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Govt. Instructor License</span>
                      <span class="student-data-val" style="font-family:var(--font-mono); color:var(--primary-cyan);">AP04-INST-2015-88</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Assigned Vehicle & Controls -->
              <div class="student-card" style="margin-bottom:0;">
                <div class="student-card-header">
                  <span class="student-card-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--neem-green)" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                    Assigned Training Car &amp; Dual Controls
                  </span>
                  <span class="p-badge p-badge-green" style="font-size:0.6rem;">Dual-Control Safety OK</span>
                </div>
                <div class="student-card-body">
                  <div class="student-data-table" style="margin-bottom:1.5rem;">
                    <div class="student-data-row">
                      <span class="student-data-key">Training Vehicle</span>
                      <span class="student-data-val" style="color:#ffffff; font-weight:800;">${assignedTrainer.car}</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Dual-Control Mechanism</span>
                      <span class="student-data-val" style="color:var(--neem-green);">✓ Dual Clutch &amp; Dual Brake Active</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Speed Governor &amp; Mirror</span>
                      <span class="student-data-val">✓ RTO Certified Dual Mirrors &amp; Governor</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Daily Safety Audit</span>
                      <span class="student-data-val">Inspected &amp; Roadworthy (100%)</span>
                    </div>
                  </div>

                  <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); padding:1.15rem; border-radius:var(--radius-sm);">
                    <label class="p-label" style="margin-bottom:0.4rem; display:block;">Reassign to Another Instructor / Car</label>
                    <select class="mnc-select" id="select-reassign-trainer" style="width:100%; font-size:0.85rem;">
                      ${trainers.map(tr => `
                        <option value="${tr.id}" ${tr.id === trainee.assignedTrainerId ? 'selected' : ''}>
                          ${tr.name} (${tr.car})
                        </option>
                      `).join('')}
                    </select>
                    <div style="font-size:0.75rem; color:var(--slate-muted); margin-top:0.4rem;">
                      Selecting an instructor instantly updates student schedule and car allocation.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ` : ''}

        <!-- ============================================================ -->
        <!-- SERVICE 5: GOVT DL TEST & RTO BOOKING SUB-PAGE -->
        <!-- ============================================================ -->
        ${activeService === 'rto' ? `
          <div class="student-service-page">
            <div class="student-card">
              <div class="student-card-header">
                <div>
                  <span class="student-card-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--neem-green)" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
                    Government Driving License (DL) Test Readiness &amp; Booking
                  </span>
                  <div style="font-size:0.775rem; color:var(--slate-muted); margin-top:0.25rem;">
                    Pulivendula Automated RTO Track · Sarathi Parivahan Integration
                  </div>
                </div>

                <span class="p-badge ${trainee.currentDay >= 18 ? 'p-badge-green' : 'p-badge-dim'}" style="font-size:0.7rem;">
                  ${trainee.currentDay >= 18 ? 'Eligible for Test' : 'In Practicum'}
                </span>
              </div>

              <div class="student-card-body">
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:1.5rem; margin-bottom:1.5rem;">
                  <div class="student-data-table">
                    <div class="student-data-row">
                      <span class="student-data-key">Current Practicum Status</span>
                      <span class="student-data-val" style="color:var(--neem-green); font-weight:800;">Day ${trainee.currentDay} / 20 Completed</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Kilometers Requirement</span>
                      <span class="student-data-val">${kmDriven} km of 160 km (${trainee.currentDay >= 18 ? 'Target Met ✓' : `${kmRemaining} km remaining`})</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">8-Track &amp; Reverse H-Bay</span>
                      <span class="student-data-val" style="color:${trainee.currentDay >= 16 ? 'var(--neem-green)' : 'var(--primary-gold)'};">
                        ${trainee.currentDay >= 16 ? '✓ Mastered at Pulivendula Ground' : 'Scheduled in Days 16–19'}
                      </span>
                    </div>
                  </div>

                  <div class="student-data-table">
                    <div class="student-data-row">
                      <span class="student-data-key">RTO Testing Track Venue</span>
                      <span class="student-data-val">Pulivendula Automated Test Ground</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Accompanying Dual-Ctrl Car</span>
                      <span class="student-data-val">${assignedTrainer.car}</span>
                    </div>
                    <div class="student-data-row">
                      <span class="student-data-key">Form 5 Driving School Cert</span>
                      <span class="student-data-val" style="color:var(--neem-green);">✓ Ready for Issuance</span>
                    </div>
                  </div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; padding-top:1.25rem; border-top:1px solid rgba(255,255,255,0.08);">
                  <div>
                    <div style="font-size:0.95rem; font-weight:800; color:#ffffff;">
                      Official Sarathi DL Appointment Slot
                    </div>
                    <div style="font-size:0.8rem; color:var(--slate-muted); margin-top:0.2rem;">
                      ${trainee.currentDay >= 18
                        ? 'Student is eligible! Book a confirmed test slot with the Motor Vehicle Inspector (MVI).'
                        : `Student has completed Day ${trainee.currentDay} of 20. Official test appointment opens at Day 18.`}
                    </div>
                  </div>

                  <button type="button" class="btn-mnc ${trainee.currentDay >= 18 ? 'btn-mnc-primary' : 'btn-mnc-secondary'}" id="btn-schedule-rto-exam" style="white-space:nowrap;">
                    📅 Book Driving Test Appointment →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

      </div>
    `;

    container.innerHTML = template;
    attachEvents();
  }

  function attachEvents() {
    // Return to Roster
    const btnBack = container.querySelector('#btn-back-roster');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        onNavigate('trainees');
      });
    }

    // Advance 1 Day (+8 km)
    const btnQuickStep = container.querySelector('#btn-quick-step-day');
    if (btnQuickStep) {
      btnQuickStep.addEventListener('click', () => {
        const nextDay = Math.min(20, trainee.currentDay + 1);
        store.setTraineeTestDay(nextDay);
        store.updateTrainee(trainee.id, { currentDay: nextDay });
        showToast(`Advanced ${trainee.name} to Day ${nextDay} (+8 km road training logged)`, 'success');
        render();
      });
    }

    const btnAdvanceCurriculum = container.querySelector('#btn-advance-curriculum');
    if (btnAdvanceCurriculum) {
      btnAdvanceCurriculum.addEventListener('click', () => {
        const nextDay = Math.min(20, trainee.currentDay + 1);
        store.setTraineeTestDay(nextDay);
        store.updateTrainee(trainee.id, { currentDay: nextDay });
        showToast(`Advanced ${trainee.name} to Day ${nextDay} (+8 km road training logged)`, 'success');
        render();
      });
    }

    // Reassign Instructor Dropdown
    const select = container.querySelector('#select-reassign-trainer');
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

    // Photo / Logo Upload Button in Dossier
    const btnDossierPhoto = container.querySelector('#btn-dossier-change-photo');
    if (btnDossierPhoto) {
      btnDossierPhoto.addEventListener('click', () => {
        triggerPhotoUpload((dataUrl) => {
          store.updateTrainee(trainee.id, { profilePhotoData: dataUrl });
          showToast(`Updated photo / logo for ${trainee.name}!`, 'success');
          render();
        });
      });
    }

    // Record Payment Buttons
    const btnPay = container.querySelector('#btn-record-payment');
    if (btnPay) {
      btnPay.addEventListener('click', () => {
        const invoice = store.payments.find(p => p.traineeId === trainee.id);
        if (invoice) openPaymentModal(invoice.id, invoice.balance, trainee.name);
      });
    }

    const btnPayCard = container.querySelector('#btn-pay-now-card');
    if (btnPayCard) {
      btnPayCard.addEventListener('click', () => {
        const invoice = store.payments.find(p => p.traineeId === trainee.id);
        if (invoice) openPaymentModal(invoice.id, invoice.balance, trainee.name);
      });
    }

    // Print Dossier
    const btnPrint = container.querySelector('#btn-print-dossier');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        openPrintModal();
      });
    }

    // Bound Service Tab Switching
    container.querySelectorAll('[data-service-tab]').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        activeService = tabBtn.dataset.serviceTab;
        render();
      });
    });

    // Schedule RTO Exam
    const btnSchedule = container.querySelector('#btn-schedule-rto-exam');
    if (btnSchedule) {
      btnSchedule.addEventListener('click', () => {
        openScheduleExamModal();
      });
    }

    const btnEditProfile = container.querySelector('#btn-edit-student-profile');
    if (btnEditProfile) {
      btnEditProfile.addEventListener('click', () => {
        openEditModal();
      });
    }

    const btnPrintDossierProfile = container.querySelector('#btn-print-dossier-profile');
    if (btnPrintDossierProfile) {
      btnPrintDossierProfile.addEventListener('click', () => {
        openPrintModal();
      });
    }

    const btnPrintReceipt = container.querySelector('#btn-print-receipt-single');
    if (btnPrintReceipt) {
      btnPrintReceipt.addEventListener('click', () => {
        openPrintModal();
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
        <div class="mnc-modal" style="max-width: 620px;">
          <div style="padding: 1.25rem 1.75rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; background: var(--cred-surface);">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; margin: 0;">Edit Student Details</h3>
              <p style="font-size: 0.8rem; color: var(--slate-muted); margin: 0.2rem 0 0;">${trainee.name} · ${trainee.id} · Pulivendula RTO</p>
            </div>
            <button type="button" id="btn-close-edit-modal" style="background: transparent; border: none; font-size: 1.25rem; cursor: pointer; color: var(--slate-muted);">✕</button>
          </div>

          <form id="form-edit-trainee" style="padding: 1.75rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem;">
              <div>
                <label class="p-label" style="margin-bottom:0.35rem; display:block;">Full Legal Name (as on Aadhaar) *</label>
                <input type="text" class="mnc-input" name="name" value="${trainee.name}" required style="width:100%;" />
              </div>
              <div>
                <label class="p-label" style="margin-bottom:0.35rem; display:block;">Date of Joining (Admission Date) *</label>
                <input type="date" class="mnc-input" name="registeredDate" value="${trainee.registeredDate || new Date().toISOString().split('T')[0]}" required style="width:100%;" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem;">
              <div>
                <label class="p-label" style="margin-bottom:0.35rem; display:block;">Learner License (LLR) Number *</label>
                <input type="text" class="mnc-input" name="permitNumber" value="${trainee.permitNumber || 'AP004/LLR/2026/8941'}" required style="width:100%;" />
              </div>
              <div>
                <label class="p-label" style="margin-bottom:0.35rem; display:block;">Contact Mobile Number *</label>
                <input type="tel" class="mnc-input" name="phone" value="${trainee.phone}" required style="width:100%;" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem;">
              <div>
                <label class="p-label" style="margin-bottom:0.35rem; display:block;">Email Address</label>
                <input type="email" class="mnc-input" name="email" value="${trainee.email}" required style="width:100%;" />
              </div>
              <div>
                <label class="p-label" style="margin-bottom:0.35rem; display:block;">Residential Address (Pulivendula / AP)</label>
                <input type="text" class="mnc-input" name="address" value="${trainee.address || 'Pulivendula, Andhra Pradesh'}" style="width:100%;" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.75rem;">
              <div>
                <label class="p-label" style="margin-bottom:0.35rem; display:block;">Emergency Contact Name</label>
                <input type="text" class="mnc-input" name="emergencyContact" value="${trainee.emergencyContact || 'Guardian / Family Contact'}" style="width:100%;" />
              </div>
              <div>
                <label class="p-label" style="margin-bottom:0.35rem; display:block;">Emergency Phone Number</label>
                <input type="tel" class="mnc-input" name="emergencyPhone" value="${trainee.emergencyPhone || '+91 98480 11222'}" style="width:100%;" />
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1.25rem; border-top: 1px solid var(--border-light);">
              <button type="button" class="btn-mnc btn-mnc-secondary" id="btn-cancel-edit-modal">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Save Changes ✓</button>
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
        registeredDate: formData.get('registeredDate'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        permitNumber: formData.get('permitNumber'),
        address: formData.get('address'),
        emergencyContact: formData.get('emergencyContact'),
        emergencyPhone: formData.get('emergencyPhone')
      };

      store.updateTrainee(trainee.id, updated);
      close();
      showToast(`Updated student details for ${updated.name}`, 'success');
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
        <div class="mnc-modal" style="max-width: 440px;">
          <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; background: var(--cred-surface);">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; margin: 0;">Record Course Fee Payment</h3>
              <p style="font-size: 0.8rem; color: var(--slate-muted); margin: 0.2rem 0 0;">${student} · Invoice: ${invoiceId}</p>
            </div>
            <button type="button" id="btn-close-dossier-pay" style="background: transparent; border: none; font-size: 1.25rem; cursor: pointer; color: var(--slate-muted);">✕</button>
          </div>

          <form id="form-dossier-pay" style="padding: 1.75rem;">
            <div style="background:rgba(243,209,130,0.06); border:1px solid rgba(243,209,130,0.25); border-radius:var(--radius-sm); padding:1rem; margin-bottom:1.5rem; text-align:center;">
              <span style="font-size:0.75rem; font-weight:800; color:var(--primary-gold); text-transform:uppercase; letter-spacing:0.06em;">Pending Fee Balance</span>
              <div style="font-size:1.85rem; font-weight:900; color:#ffffff; font-family:var(--font-mono); margin-top:0.25rem;">₹${balance.toLocaleString('en-IN')}</div>
            </div>

            <div style="margin-bottom: 1.25rem;">
              <label class="p-label" style="margin-bottom:0.4rem; display:block;">Payment Amount (₹ INR) *</label>
              <input type="number" class="mnc-input" name="amount" required min="1" max="${balance}" value="${balance}" style="width:100%; font-size:1.1rem; font-weight:800;" />
            </div>

            <div style="margin-bottom: 1.5rem;">
              <label class="p-label" style="margin-bottom:0.4rem; display:block;">Payment Method</label>
              <select class="mnc-select" name="method" style="width:100%;">
                <option value="UPI (PhonePe QR)">PhonePe UPI QR</option>
                <option value="UPI (Google Pay)">Google Pay UPI</option>
                <option value="Cash at Academy Desk">Cash at Office Desk</option>
                <option value="Direct Bank Transfer">Direct Bank Transfer</option>
              </select>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1.25rem; border-top: 1px solid var(--border-light);">
              <button type="button" class="btn-mnc btn-mnc-secondary" id="btn-cancel-dossier-pay">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Confirm Fee Payment ✓</button>
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
        showToast(`Payment of ₹${amount} recorded for ${student}`, 'success');
        render();
      }
    });
  }

  // ====================================================
  // MODAL: SCHEDULE RTO EXAM
  // ====================================================
  function openScheduleExamModal() {
    const modalRoot = document.getElementById('modal-root');
    const defaultDate = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];

    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="mnc-modal" style="max-width: 500px;">
          <div style="padding: 1.25rem 1.75rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; background: var(--cred-surface);">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; margin: 0;">Book Government Driving License (DL) Test</h3>
              <p style="font-size: 0.8rem; color: var(--slate-muted); margin: 0.2rem 0 0;">${trainee.name} · Pulivendula RTO Track</p>
            </div>
            <button type="button" id="btn-close-exam-modal" style="background: transparent; border: none; font-size: 1.25rem; cursor: pointer; color: var(--slate-muted);">✕</button>
          </div>

          <form id="form-exam-slot" style="padding: 1.75rem;">
            <div style="margin-bottom: 1.25rem;">
              <label class="p-label" style="margin-bottom:0.35rem; display:block;">Driving Test Date</label>
              <input type="date" class="mnc-input" name="testDate" value="${defaultDate}" required style="width:100%;" />
            </div>

            <div style="margin-bottom: 1.25rem;">
              <label class="p-label" style="margin-bottom:0.35rem; display:block;">RTO Inspector Slot Time</label>
              <select class="mnc-select" name="slotTime" style="width:100%;">
                <option value="10:00 AM - 11:30 AM (Batch 1)">10:00 AM – 11:30 AM (Batch 1 · 8-Track)</option>
                <option value="11:30 AM - 01:00 PM (Batch 2)">11:30 AM – 01:00 PM (Batch 2 · H-Track & Road)</option>
                <option value="02:30 PM - 04:00 PM (Batch 3)">02:30 PM – 04:00 PM (Batch 3 · Final Assessment)</option>
              </select>
            </div>

            <div style="margin-bottom: 1.5rem;">
              <label class="p-label" style="margin-bottom:0.35rem; display:block;">Dual-Control Training Car Assigned</label>
              <input type="text" class="mnc-input" name="car" value="Maruti Suzuki Swift Dual-Ctrl (#AP-04-ED-4041)" readonly style="width:100%; background:rgba(255,255,255,0.03);" />
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1.25rem; border-top: 1px solid var(--border-light);">
              <button type="button" class="btn-mnc btn-mnc-secondary" id="btn-cancel-exam-modal">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Confirm Driving Test Booking ✓</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-exam-modal').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-exam-modal').addEventListener('click', close);

    const form = modalRoot.querySelector('#form-exam-slot');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const testDate = form.elements['testDate'].value;
      const slotTime = form.elements['slotTime'].value;
      close();
      showToast(`Driving test slot booked for ${trainee.name} on ${testDate} (${slotTime})`, 'success');
      render();
    });
  }

  // ====================================================
  // MODAL: PRINT CANDIDATE RECORD / FORM 5
  // ====================================================
  function openPrintModal() {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="mnc-modal" style="max-width: 650px;">
          <div style="padding: 1.25rem 1.75rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; background: var(--cred-surface);">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; margin: 0;">Government Driving Training Certificate &amp; Record</h3>
              <p style="font-size: 0.8rem; color: var(--slate-muted); margin: 0.2rem 0 0;">Form 5 - Driving Training Certificate · Pulivendula RTO</p>
            </div>
            <button type="button" id="btn-close-print-modal" style="background: transparent; border: none; font-size: 1.25rem; cursor: pointer; color: var(--slate-muted);">✕</button>
          </div>

          <div style="padding: 1.75rem; background: #ffffff; color: #0f172a; border-radius: 0 0 var(--radius-md) var(--radius-md);">
            <div style="text-align:center; border-bottom:2px solid #0f172a; padding-bottom:1rem; margin-bottom:1.25rem;">
              <h2 style="margin:0; font-size:1.35rem; font-weight:900; letter-spacing:-0.02em; color:#0f172a;">GAFOOR DRIVING SCHOOL</h2>
              <div style="font-size:0.75rem; font-weight:700; color:#475569; margin-top:0.25rem;">Govt. RTO License #AP-04-DS-2024 · Pulivendula, Kadapa Dist, AP</div>
              <div style="font-size:0.85rem; font-weight:800; color:#b45309; margin-top:0.35rem;">STUDENT DRIVING TRAINING RECORD &amp; ATTENDANCE LOG</div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; font-size:0.85rem; margin-bottom:1.25rem;">
              <div><strong>Student Name:</strong> ${trainee.name}</div>
              <div><strong>Registration ID:</strong> ${trainee.id}</div>
              <div><strong>Learner License (LLR):</strong> ${trainee.permitNumber || 'AP004/LLR/2026/8941'}</div>
              <div><strong>Contact Mobile:</strong> ${trainee.phone}</div>
              <div><strong>Training Course:</strong> ${trainee.package}</div>
              <div><strong>Enrollment Date:</strong> ${trainee.registeredDate}</div>
              <div><strong>Classes Completed:</strong> ${trainee.currentDay} of 20 Days</div>
              <div><strong>Distance Driven:</strong> ${trainee.currentDay * 8} km (8 km/day)</div>
            </div>

            <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:0.75rem; border-radius:4px; font-size:0.8rem; margin-bottom:1.25rem;">
              <strong>Driving Instructor Verification:</strong>
              <div>Driving Instructor: <em>${trainers.find(t=>t.id===trainee.assignedTrainerId)?.name || 'K. Srinivas Rao'}</em></div>
              <div>Dual-Control Training Car: <em>${trainers.find(t=>t.id===trainee.assignedTrainerId)?.car || 'Maruti Suzuki Swift #AP-04-ED-4041'}</em></div>
              <div>Evaluation: Satisfactory completion of 8-Track, H-Track, half-clutch gradient slope, and town practical driving.</div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:flex-end; padding-top:1.5rem; border-top:1px dashed #cbd5e1; font-size:0.78rem;">
              <div>
                <div>Student Signature: __________________</div>
                <div style="margin-top:0.25rem; color:#64748b;">Date: ${new Date().toLocaleDateString('en-IN')}</div>
              </div>
              <div style="text-align:right;">
                <div>Authorized Signatory (Gafoor Driving School)</div>
                <div style="font-weight:800; margin-top:0.25rem;">AP RTO Authorized Seal</div>
              </div>
            </div>
          </div>

          <div style="padding: 1.25rem 1.75rem; border-top: 1px solid var(--border-light); display: flex; justify-content: flex-end; gap: 0.75rem; background: var(--cred-surface);">
            <button type="button" class="btn-mnc btn-mnc-secondary" id="btn-dismiss-print">Close</button>
            <button type="button" class="btn-mnc btn-mnc-primary" onclick="window.print()">Print / Save as PDF 🖨</button>
          </div>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-print-modal').addEventListener('click', close);
    modalRoot.querySelector('#btn-dismiss-print').addEventListener('click', close);
  }

  // Initial render
  render();
}
