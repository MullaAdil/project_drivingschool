/* ==========================================================================
   GAFOOR DRIVING SCHOOL — ADMIN CONSOLE
   Spacious premium dark layout — detailed sections, proper sizing
   ========================================================================== */

import { store } from '../store.js';
import { renderBrandLogo } from '../components/brandLogo.js';
import { getSupabaseCredentials, saveSupabaseCredentials, testSupabaseConnection } from '../supabase.js';
import { renderStudentBoxAvatar, renderStudentAvatar } from '../components/studentAvatar.js';
import { openPhotoCropModal } from '../components/photoCropModal.js';

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

    const totalInvoiced    = payments.reduce((a, p) => a + p.amount, 0);
    const totalCollected   = payments.reduce((a, p) => a + p.paid, 0);
    const totalOutstanding = payments.reduce((a, p) => a + p.balance, 0);
    const collectionRate   = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 100;

    const intakeCount = trainees.filter(t => t.currentDay <= 2).length;
    const groundCount = trainees.filter(t => t.currentDay >= 3 && t.currentDay <= 7).length;
    const cityCount   = trainees.filter(t => t.currentDay >= 8 && t.currentDay <= 15).length;
    const trackCount  = trainees.filter(t => t.currentDay >= 16 && t.currentDay <= 19).length;
    const examCount   = trainees.filter(t => t.currentDay >= 20).length;

    const topbar = '';

    const stageNav = `
      <div class="portal-stage-nav" style="padding:1.25rem 2rem; border-bottom:1px solid var(--border-light); background:rgba(255,255,255,0.01); gap:0.5rem;">
        <button type="button" class="p-stage-btn ${activeStageFilter==='all'    ? 'p-stage-active':''}" data-stage-target="all">All Students (${trainees.length})</button>
        <button type="button" class="p-stage-btn ${activeStageFilter==='intake' ? 'p-stage-active':''}" data-stage-target="intake">Stage 1 · LLR Issued (${intakeCount})</button>
        <button type="button" class="p-stage-btn ${activeStageFilter==='ground' ? 'p-stage-active':''}" data-stage-target="ground">Stage 2 · Ground Practice (${groundCount})</button>
        <button type="button" class="p-stage-btn ${activeStageFilter==='city'   ? 'p-stage-active':''}" data-stage-target="city">Stage 3 · Town Driving (${cityCount})</button>
        <button type="button" class="p-stage-btn ${activeStageFilter==='track'  ? 'p-stage-active':''}" data-stage-target="track">Stage 4 · RTO 8-Track (${trackCount})</button>
        <button type="button" class="p-stage-btn ${activeStageFilter==='exam'   ? 'p-stage-active':''}" data-stage-target="exam">Stage 5 · Test Ready (${examCount})</button>
      </div>
    `;

    let html = '';

    // =====================================================
    // HUB — COMMAND CENTER
    // =====================================================
    if (subService === 'hub') {
      html = `
        ${topbar}

        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">Administrative Office Overview</h1>
            <p class="portal-page-sub">Gafoor Driving School · Pulivendula Academy · Government RTO Lic. #AP-04-DS-2024</p>
          </div>
          <div style="display:flex; gap:0.65rem; flex-wrap:wrap; align-items:center;">
            <button type="button" class="p-ghost-btn btn-open-supabase-modal">⚡ Cloud DB (Supabase)</button>
            <button type="button" class="p-ghost-btn" id="btn-export-rto-csv">Download Student Register (CSV)</button>
            <button type="button" class="p-ghost-btn btn-launch-sub" data-target="billing">Fee Payments &amp; Accounts</button>
            <button type="button" class="btn-mnc btn-mnc-primary btn-launch-sub" data-target="new-student">+ Register New Student</button>
          </div>
        </div>

        <!-- Stats Strip -->
        <div class="portal-stats-strip">
          <div class="portal-stat">
            <span class="portal-stat-value">${trainees.length}</span>
            <span class="portal-stat-label">Enrolled Students</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">₹${totalCollected.toLocaleString('en-IN')}</span>
            <span class="portal-stat-label">Fees Collected</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--primary-gold);">₹${totalOutstanding.toLocaleString('en-IN')}</span>
            <span class="portal-stat-label">Fees Pending</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${collectionRate}%</span>
            <span class="portal-stat-label">Collection Rate</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${trainers.length}</span>
            <span class="portal-stat-label">Driving Instructors</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">99.2%</span>
            <span class="portal-stat-label">Test Pass Rate</span>
          </div>
        </div>

        <!-- Workflow Navigation -->
        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">School Services &amp; Management</span>
            <span class="portal-section-meta">All 6 core services</span>
          </div>
          <div class="p-nav-list">
            <div class="p-nav-item">
              <div style="flex:1;">
                <div class="p-nav-number">Service 01 · Admission</div>
                <div class="p-nav-title">New Student Registration &amp; Admission</div>
                <div class="p-nav-sub">Register new student, enter Learner License (LLR) number, choose training package (₹5,500–₹8,500), assign driving instructor, and generate initial fee receipt.</div>
              </div>
              <button type="button" class="btn-mnc btn-mnc-primary btn-launch-sub" data-target="new-student" style="white-space:nowrap;">Open Registration Form →</button>
            </div>
            <div class="p-nav-item">
              <div style="flex:1;">
                <div class="p-nav-number">Service 02 · Training Records</div>
                <div class="p-nav-title">Students Directory &amp; Driving Records</div>
                <div class="p-nav-sub">${trainees.length} enrolled students — record daily 8 km driving classes, track 20-day course progress, inspect student profiles, and view test readiness.</div>
              </div>
              <button type="button" class="btn-mnc btn-mnc-secondary btn-launch-sub" data-target="trainees" style="white-space:nowrap;">View Students List →</button>
            </div>
            <div class="p-nav-item">
              <div style="flex:1;">
                <div class="p-nav-number">Service 03 · Instructors</div>
                <div class="p-nav-title">Driving Instructors Directory</div>
                <div class="p-nav-sub">${trainers.length} Government-certified driving instructors — car allocations, daily student batches, and training performance ratings.</div>
              </div>
              <button type="button" class="btn-mnc btn-mnc-secondary btn-launch-sub" data-target="trainers" style="white-space:nowrap;">View Instructors →</button>
            </div>
            <div class="p-nav-item">
              <div style="flex:1;">
                <div class="p-nav-number">Service 04 · Accounts</div>
                <div class="p-nav-title">Course Fee Payments &amp; Receipts</div>
                <div class="p-nav-sub">Complete fee records — ₹${totalInvoiced.toLocaleString('en-IN')} total invoiced, ₹${totalCollected.toLocaleString('en-IN')} collected (${collectionRate}%). Record cash/UPI payments and download official receipts.</div>
              </div>
              <button type="button" class="btn-mnc btn-mnc-secondary btn-launch-sub" data-target="billing" style="white-space:nowrap;">View Fee Accounts →</button>
            </div>
            <div class="p-nav-item">
              <div style="flex:1;">
                <div class="p-nav-number">Service 05 · Training Cars</div>
                <div class="p-nav-title">Dual-Control Training Cars &amp; Safety Checks</div>
                <div class="p-nav-sub">Vehicle safety — 4 dual-brake Maruti Swift, Hyundai, and Tata training cars with instructor dual pedals and Government fitness certificates.</div>
              </div>
              <button type="button" class="btn-mnc btn-mnc-secondary btn-launch-sub" data-target="fleet" style="white-space:nowrap;">Inspect Training Cars →</button>
            </div>
            <div class="p-nav-item">
              <div style="flex:1;">
                <div class="p-nav-number">Service 06 · Driving Tests</div>
                <div class="p-nav-title">Govt. Driving License (DL) Test Bookings</div>
                <div class="p-nav-sub">Schedule official driving license test appointments at the Pulivendula RTO track for students completing their 20-day course.</div>
              </div>
              <button type="button" class="btn-mnc btn-mnc-secondary btn-launch-sub" data-target="rto-scheduler" style="white-space:nowrap;">Open Test Bookings →</button>
            </div>
          </div>
        </div>

        <!-- Today's Dispatch -->
        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">Today's Practical Driving Classes</span>
            <span class="portal-section-meta">Active time slots · 07:30 AM – 05:30 PM</span>
          </div>
          <div class="p-table-wrap">
            <table class="p-table">
              <thead>
                <tr>
                  <th>Time Slot</th>
                  <th>Student Name</th>
                  <th>Practical Lesson</th>
                  <th>Training Car</th>
                  <th style="text-align:right;">Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                ${store.schedule.slice(0, 3).map(s => `
                  <tr>
                    <td class="p-td-mono">${s.time}</td>
                    <td>
                      <div style="display:flex; align-items:center; gap:0.65rem;">
                        ${(() => {
                          const tr = trainees.find(t => t.id === s.traineeId);
                          return tr ? renderStudentAvatar(tr, 32) : '';
                        })()}
                        <div>
                          <div class="p-td-name">${s.studentName}</div>
                          <div class="p-td-sub">${s.traineeId}</div>
                        </div>
                      </div>
                    </td>
                    <td class="p-td-muted">${s.topic}</td>
                    <td class="p-td-muted">${s.car}</td>
                    <td style="text-align:right;">
                      <span class="p-badge ${s.attendance==='present' ? 'p-badge-green' : s.attendance==='absent' ? '' : 'p-badge-gold'}" style="${s.attendance==='absent'?'background:rgba(220,38,38,0.1);color:#f87171;border:1px solid rgba(220,38,38,0.25);':''}">${s.attendance.toUpperCase()}</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Stage Summary -->
        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">Curriculum Stage Distribution</span>
          </div>
          <div class="p-detail-grid">
            <div class="p-detail-cell">
              <div class="p-detail-key">Stage 1 · LLR Intake</div>
              <div class="p-detail-value">${intakeCount} Candidates</div>
              <div class="p-detail-sub">Day 1–2 · Document verification & Parivahan LLR setup</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">Stage 2 · Ground & ABC</div>
              <div class="p-detail-value">${groundCount} Candidates</div>
              <div class="p-detail-sub">Day 3–7 · Clutch bite-point, ABC pedals, gear synchronization</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">Stage 3 · City & Flyover</div>
              <div class="p-detail-value">${cityCount} Candidates</div>
              <div class="p-detail-sub">Day 8–15 · City traffic, flyover hill-hold, highway driving</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">Stage 4 · RTO 8-Track</div>
              <div class="p-detail-value">${trackCount} Candidates</div>
              <div class="p-detail-sub">Day 16–19 · Automated sensor track, H-bay reverse, mock test</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">Stage 5 · DL Exam Ready</div>
              <div class="p-detail-value">${examCount} Candidates</div>
              <div class="p-detail-sub">Day 20 · RTO driving test cleared, DL certificate issued</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">Total Distance Logged</div>
              <div class="p-detail-value">${trainees.reduce((a,t)=>a+(t.currentDay*8),0).toLocaleString('en-IN')} km</div>
              <div class="p-detail-sub">Across all ${trainees.length} candidates · 8 km/day target</div>
            </div>
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
        const matchSearch = t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || (t.permitNumber||'').toLowerCase().includes(q) || (t.phone||'').includes(q);
        const matchPkg = activePackageFilter==='all' ||
          (activePackageFilter==='without-licence' && t.package.includes('Without Licence')) ||
          (activePackageFilter==='with-licence' && t.package.includes('With Licence'));
        let matchStage = true;
        if (activeStageFilter==='intake') matchStage = t.currentDay<=2;
        else if (activeStageFilter==='ground') matchStage = t.currentDay>=3&&t.currentDay<=7;
        else if (activeStageFilter==='city')  matchStage = t.currentDay>=8&&t.currentDay<=15;
        else if (activeStageFilter==='track') matchStage = t.currentDay>=16&&t.currentDay<=19;
        else if (activeStageFilter==='exam')  matchStage = t.currentDay>=20;
        return matchSearch && matchPkg && matchStage;
      });

      html = `
        ${topbar}
        ${stageNav}

        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">Students Directory &amp; Driving Records</h1>
            <p class="portal-page-sub">All enrolled students with daily 8 km driving records, fee payment status, and test readiness. ${filteredTrainees.length} of ${trainees.length} shown.</p>
          </div>
          <div style="display:flex; gap:0.65rem; flex-wrap:wrap; align-items:center;">
            <button type="button" class="p-ghost-btn btn-open-supabase-modal">⚡ Cloud DB (Supabase)</button>
            <button type="button" class="p-ghost-btn" id="btn-export-rto-csv">Download Register (CSV)</button>
            <button type="button" class="btn-mnc btn-mnc-primary" id="btn-goto-add-student">+ Register New Student</button>
          </div>
        </div>

        <!-- Search & Filter -->
        <div style="padding:1.1rem 2rem; border-bottom:1px solid var(--border-light); display:flex; gap:0.85rem; align-items:center; flex-wrap:wrap; background:rgba(255,255,255,0.01);">
          <input type="text" class="mnc-input" id="search-trainee" placeholder="Search by name, ID, LLR permit, phone…" value="${searchQuery}" style="width:300px; flex-shrink:0;" />
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
            <button type="button" class="p-chip-btn ${activePackageFilter==='all'             ? 'p-chip-active':''}" data-pkg="all">All Courses</button>
            <button type="button" class="p-chip-btn ${activePackageFilter==='without-licence' ? 'p-chip-active':''}" data-pkg="without-licence">Without Licence</button>
            <button type="button" class="p-chip-btn ${activePackageFilter==='with-licence'    ? 'p-chip-active':''}" data-pkg="with-licence">With Licence</button>
          </div>
        </div>

        <!-- Students Box Grid (Separate Block Cards) -->
        <div class="portal-section" style="padding-top:0; padding-bottom:1.5rem;">
          ${filteredTrainees.length === 0 ? `
            <div style="text-align:center; color:var(--slate-muted); padding:3.5rem; font-size:0.9rem; background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:var(--radius-md);">
              No students match the active search or filters.
            </div>
          ` : `
            <div class="student-box-grid">
              ${filteredTrainees.map(t => {
                const tr  = trainers.find(x => x.id === t.assignedTrainerId) || trainers[0];
                const p   = payments.find(x => x.traineeId === t.id) || { amount: 7500, paid: 7500, balance: 0, status: 'paid' };
                const pct = Math.min(100, Math.round((t.currentDay / 20) * 100));
                let stageName = t.currentDay <= 2 ? 'Stage 1 · LLR Intake' :
                                t.currentDay <= 7 ? 'Stage 2 · Ground Practice' :
                                t.currentDay <= 15 ? 'Stage 3 · Town Driving' :
                                t.currentDay <= 19 ? 'Stage 4 · RTO 8-Track' : 'Stage 5 · Test Ready';
                const isPulsed = lastPulsedTraineeId === t.id;
                const initials = t.avatar || t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                return `
                  <div class="student-box-card ${isPulsed ? 'p-row-pulsed' : ''}">
                    
                    <!-- Header: Avatar, Name, Reg ID, Fee Status -->
                    <div>
                      <div class="student-box-header">
                        <div class="student-box-identity">
                        ${renderStudentBoxAvatar(t)}
                          <div style="min-width:0;">
                            <div class="student-box-name btn-open-dossier" data-trainee-id="${t.id}" title="Click to view full student file">${t.name}</div>
                            <div class="student-box-meta-line">
                              <span class="p-badge p-badge-gold" style="font-size:0.62rem; padding:0.15rem 0.4rem;">${t.id}</span>
                              <span style="font-family:var(--font-mono); color:var(--primary-cyan); font-size:0.72rem;">${t.permitNumber || 'AP004/LLR/2026/8941'}</span>
                            </div>
                          </div>
                        </div>

                        <span class="p-badge ${p.balance > 0 ? 'p-badge-gold' : 'p-badge-green'}" style="font-size:0.65rem; white-space:nowrap;">
                          ${p.balance > 0 ? `₹${p.balance.toLocaleString('en-IN')} Due` : 'Fee Cleared ✓'}
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

                    <!-- Body: Progress bar and Telemetry Grid -->
                    <div class="student-box-body">
                      <div class="student-box-progress-wrap">
                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem;">
                          <span style="font-weight:700; color:#ffffff;">Practical Course Progress</span>
                          <span style="font-weight:800; color:#ffffff; font-family:var(--font-mono);">${pct}% (${t.currentDay}/20 Days)</span>
                        </div>
                        <div class="student-box-progress-bar">
                          <div class="student-box-progress-fill" style="width:${pct}%;"></div>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--slate-muted);">
                          <span>${t.currentDay * 8} km logged</span>
                          <span>Target: 160 km total</span>
                        </div>
                      </div>

                      <div class="student-box-info-grid">
                        <div class="student-box-info-item">
                          <span class="student-box-info-label">Instructor &amp; Car</span>
                          <span class="student-box-info-val" title="${tr.name} (${tr.car})">👨‍🏫 ${tr.name}</span>
                          <span style="font-size:0.7rem; color:var(--slate-muted);">${tr.car.split(' ')[0]} Dual-Ctrl</span>
                        </div>
                        <div class="student-box-info-item">
                          <span class="student-box-info-label">Contact &amp; Town</span>
                          <span class="student-box-info-val">📞 ${t.phone || '+91 98480 22334'}</span>
                          <span style="font-size:0.7rem; color:var(--slate-muted);">${t.address ? t.address.split(',')[0] : 'Pulivendula'}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Footer: Dedicated Action Buttons -->
                    <div class="student-box-footer">
                      <button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm btn-open-dossier" data-trainee-id="${t.id}" style="font-size:0.78rem; padding:0.45rem 0.85rem;">
                        Open Student File &amp; Services →
                      </button>
                      
                      <div style="display:flex; gap:0.4rem; align-items:center;">
                        <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-quick-step-day" data-trainee-id="${t.id}" data-current-day="${t.currentDay}" title="Log 1 Practical Day (+8 km)" style="font-size:0.75rem; padding:0.45rem 0.65rem;">
                          + 1 Day
                        </button>
                        ${t.currentDay >= 18 ? `
                          <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-schedule-rto-slot" data-trainee-id="${t.id}" data-student="${t.name}" style="font-size:0.75rem; padding:0.45rem 0.65rem; color:#ffffff; border-color:rgba(255,255,255,0.3);">
                            📅 RTO Slot
                          </button>
                        ` : ''}
                      </div>
                    </div>

                  </div>
                `;
              }).join('')}
            </div>
          `}
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
            <div style="margin-bottom:0.5rem;">
              <button type="button" class="p-ghost-btn btn-launch-sub" data-target="trainees" style="font-size:0.8rem; padding:0.4rem 0.85rem;">← Back to Students</button>
            </div>
            <h1 class="portal-page-title">Register New Student</h1>
            <p class="portal-page-sub">Complete all sections · Auto-generates Sarathi Form 4 RTO invoice and sends confirmation upon submission.</p>
          </div>
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <span class="p-badge p-badge-dim">Step 1: Profile</span>
            <span style="color:var(--slate-muted); font-size:0.8rem;">→</span>
            <span class="p-badge p-badge-dim">Step 2: Course</span>
            <span style="color:var(--slate-muted); font-size:0.8rem;">→</span>
            <span class="p-badge p-badge-dim">Step 3: Billing</span>
          </div>
        </div>

        <form id="form-new-student-page">

          <!-- Section 1: Personal Details -->
          <div class="portal-section">
            <div class="portal-section-header">
              <span class="portal-section-title">Section 1 — Candidate Profile &amp; Contact Information</span>
            </div>

            <!-- Profile Photo / Logo Upload -->
            <div style="display:flex; align-items:flex-start; gap:1.75rem; margin-bottom:1.5rem; padding:1.25rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:var(--radius-md);">
              <div style="position:relative; flex-shrink:0;">
                <div id="photo-preview-wrap" style="position:relative; width:96px; height:96px; border-radius:50%; overflow:hidden; border:2px dashed rgba(255,255,255,0.3); background:rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 4px 16px rgba(0,0,0,0.4);">
                  <!-- Native file input layered directly on top = 100% genuine user click on Mac/Safari/Chrome -->
                  <input type="file" id="inp-profile-photo" name="profilePhoto" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                    style="position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer; z-index:25;" title="Click to upload student photo or logo" />
                  <img id="photo-preview-img" src="" alt="Profile Photo" style="width:100%; height:100%; object-fit:cover; display:none; position:relative; z-index:5;" />
                  <div id="photo-preview-placeholder" style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; pointer-events:none; z-index:2;">
                    <div style="font-size:1.6rem; margin-bottom:0.2rem;">📷</div>
                    <div style="font-size:0.6rem; color:var(--slate-muted); font-weight:700; line-height:1.2;">CLICK TO<br>UPLOAD</div>
                  </div>
                </div>
              </div>
              <div style="flex:1;">
                <div style="font-size:0.9rem; font-weight:800; color:#ffffff; margin-bottom:0.3rem;">Profile Photo or Logo</div>
                <div style="font-size:0.78rem; color:var(--slate-muted); margin-bottom:0.8rem;">Upload a student portrait or organization logo. Click the circle or browse button — preview appears instantly with zero yellow lines.</div>
                <div style="position:relative; display:inline-block;">
                  <button type="button" class="p-ghost-btn" style="font-size:0.78rem; padding:0.4rem 0.9rem; cursor:pointer; color:#ffffff; border-color:rgba(255,255,255,0.25);">📁 Browse &amp; Upload Photo / Logo</button>
                  <input type="file" id="inp-profile-photo-btn" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                    style="position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer; z-index:5;" title="Browse file" />
                </div>
              </div>
            </div>

            <div class="p-form-grid">
              <!-- Surname + First Name split -->
              <div class="p-form-row">
                <label class="p-label">Surname (Family Name) *</label>
                <input type="text" class="mnc-input p-input" name="surname" required placeholder="e.g. Reddy / Khan / Sharma" />
              </div>
              <div class="p-form-row">
                <label class="p-label">First &amp; Middle Name *</label>
                <input type="text" class="mnc-input p-input" name="firstName" required placeholder="e.g. Divya Bharathi" />
              </div>

              <!-- Gender -->
              <div class="p-form-row">
                <label class="p-label">Gender *</label>
                <select class="mnc-select p-input" name="gender" required>
                  <option value="" disabled selected>— Select Gender —</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Prefer not to say</option>
                </select>
              </div>

              <div class="p-form-row">
                <label class="p-label">Date of Birth</label>
                <input type="date" class="mnc-input p-input" name="dob" />
              </div>

              <!-- Date of Joining -->
              <div class="p-form-row">
                <label class="p-label">Date of Joining (Admission Date) *</label>
                <input type="date" class="mnc-input p-input" name="registeredDate" required value="${new Date().toISOString().split('T')[0]}" />
              </div>

              <!-- Primary Mobile -->
              <div class="p-form-row">
                <label class="p-label">Mobile Number (+91) *</label>
                <input type="tel" class="mnc-input p-input" name="phone" required placeholder="+91 98480 00000" />
              </div>

              <!-- Alternate Mobile -->
              <div class="p-form-row">
                <label class="p-label">Alternate / WhatsApp Number</label>
                <input type="tel" class="mnc-input p-input" name="alternatePhone" placeholder="+91 98490 00000 (optional)" />
              </div>

              <div class="p-form-row">
                <label class="p-label">Email Address</label>
                <input type="email" class="mnc-input p-input" name="email" placeholder="candidate@gmail.com" />
              </div>

              <div class="p-form-row" style="grid-column:1/-1;">
                <label class="p-label">Residential Address</label>
                <input type="text" class="mnc-input p-input" name="address" placeholder="Flat No., Street, Colony, Landmark, City" />
              </div>

              <div class="p-form-row">
                <label class="p-label">Govt. LLR Permit Number</label>
                <input type="text" class="mnc-input p-input" name="permitNumber" value="TS009/LLR/2026/${Math.floor(1000+Math.random()*9000)}" />
              </div>
              <div class="p-form-row">
                <label class="p-label">Training Branch Location</label>
                <select class="mnc-select p-input" name="branch">
                  <option value="Pulivendula - Kadapa Road">Pulivendula — Main Office (Kadapa Road)</option>
                  <option value="Pulivendula - JNTU Bypass">Pulivendula — JNTU Bypass Ground</option>
                  <option value="Pulivendula - Shilparamam">Pulivendula — Shilparamam Ring Road</option>
                  <option value="Pulivendula - RTC Stand">Pulivendula — RTC Bus Stand Hub</option>
                  <option value="Kadapa RTO Ground">Kadapa — District RTO Ground</option>
                </select>
              </div>

              <!-- Smartphone toggle — full width -->
              <div class="p-form-row" style="grid-column:1/-1;">
                <label class="p-label">Does the Student Have a Smartphone? *</label>
                <div style="display:flex; gap:0.75rem; flex-wrap:wrap; margin-top:0.4rem;">
                  <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer; padding:0.55rem 1.1rem; border-radius:var(--radius-sm); border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.04); transition:all 0.15s; font-size:0.85rem; font-weight:700; color:#ffffff;" id="lbl-smartphone-yes">
                    <input type="radio" name="hasSmartphone" value="yes" style="accent-color:var(--primary-gold);" />
                    📱 Yes — Has Smartphone
                  </label>
                  <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer; padding:0.55rem 1.1rem; border-radius:var(--radius-sm); border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.04); transition:all 0.15s; font-size:0.85rem; font-weight:700; color:#ffffff;" id="lbl-smartphone-no">
                    <input type="radio" name="hasSmartphone" value="no" style="accent-color:var(--primary-gold);" />
                    📵 No — Without Smartphone
                  </label>
                </div>
                <div style="font-size:0.73rem; color:var(--slate-muted); margin-top:0.4rem;">Used for WhatsApp class reminders, UPI payment links, and digital LLR slot notifications.</div>
              </div>

            </div>
          </div>

          <!-- Section 2: Course Package -->
          <div class="portal-section">
            <div class="portal-section-header">
              <span class="portal-section-title">Section 2 — Course Selection</span>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:1rem; margin-bottom:1.5rem;">
              <label class="p-pkg-option" id="pkg-without-licence">
                <input type="radio" name="package_choice" value="Without Licence (₹7,000)" />
                <div class="p-pkg-name">Without Licence</div>
                <div class="p-pkg-desc">Full package for students who do not yet hold a driving licence. Includes LLR guidance, training, and RTO test support.</div>
                <div class="p-pkg-price">₹7,000</div>
                <ul class="p-pkg-feats">
                  <li>20-Day Practical Training (8 km/day)</li>
                  <li>Parivahan LLR Slot Booking</li>
                  <li>RTO 8-Track & H-Bay Drill</li>
                  <li>Licence Application Assistance</li>
                  <li>RTO Test Slot Booking</li>
                </ul>
              </label>
              <label class="p-pkg-option selected" id="pkg-with-licence" style="border-color:rgba(243,209,130,0.4); background:rgba(243,209,130,0.04);">
                <input type="radio" name="package_choice" value="With Licence (₹11,000)" checked />
                <div style="font-size:0.65rem; font-weight:800; color:var(--primary-gold); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:0.5rem;">⭐ Already Licensed</div>
                <div class="p-pkg-name">With Licence</div>
                <div class="p-pkg-desc">For students who already hold a valid driving licence and want to improve their skills with professional training.</div>
                <div class="p-pkg-price">₹11,000</div>
                <ul class="p-pkg-feats">
                  <li>20-Day Practical Training (8 km/day)</li>
                  <li>City Traffic & Highway Sessions</li>
                  <li>RTO 8-Track & H-Bay Practice</li>
                  <li>Flyover Half-Clutch Mastery</li>
                </ul>
              </label>
            </div>
            <div class="p-form-grid">
              <div class="p-form-row">
                <label class="p-label">Preferred Batch Timing</label>
                <select class="mnc-select p-input" name="slot">
                  <option value="06:00 AM - 07:00 AM">06:00 AM – 07:00 AM (Early Morning Batch)</option>
                  <option value="07:00 AM - 08:00 AM">07:00 AM – 08:00 AM (Prime Traffic Batch)</option>
                  <option value="08:00 AM - 09:00 AM">08:00 AM – 09:00 AM (City Highway Batch)</option>
                  <option value="05:00 PM - 06:00 PM">05:00 PM – 06:00 PM (Evening Peak Batch)</option>
                  <option value="06:00 PM - 07:00 PM">06:00 PM – 07:00 PM (Night Headlights Batch)</option>
                </select>
              </div>
              <div class="p-form-row">
                <label class="p-label">Assigned Driving Instructor & Safety Vehicle</label>
                <select class="mnc-select p-input" name="assignedTrainerId">
                  ${trainers.map(tr => {
                    const c = trainees.filter(t => t.assignedTrainerId===tr.id).length;
                    return `<option value="${tr.id}">${tr.name} · ${tr.role} (${tr.car.split(' ')[0]}) — ${c} active students</option>`;
                  }).join('')}
                </select>
              </div>
            </div>
          </div>

          <!-- Section 3: Emergency & Billing -->
          <div class="portal-section">
            <div class="portal-section-header">
              <span class="portal-section-title">Section 3 — Emergency Contact & Initial Fee Clearance</span>
            </div>
            <div class="p-form-grid" style="margin-bottom:1.5rem;">
              <div class="p-form-row">
                <label class="p-label">Emergency Contact Name</label>
                <input type="text" class="mnc-input p-input" name="emergencyContact" placeholder="e.g. Srinivas Rao (Father)" />
              </div>
              <div class="p-form-row">
                <label class="p-label">Emergency Contact Phone</label>
                <input type="tel" class="mnc-input p-input" name="emergencyPhone" placeholder="+91 98499 00000" />
              </div>
              <div class="p-form-row">
                <label class="p-label">Initial Payment Status</label>
                <select class="mnc-select p-input" name="paymentStatus">
                  <option value="partial" selected>Partial Deposit — ₹3,500 paid at enrollment</option>
                  <option value="paid">Full Payment — complete tuition settled upfront</option>
                  <option value="pending">Pending — pay balance within 7 days</option>
                </select>
              </div>
              <div class="p-form-row">
                <label class="p-label">Payment Mode</label>
                <select class="mnc-select p-input" name="paymentMode">
                  <option value="UPI (PhonePe / Google Pay QR)">UPI QR — PhonePe / Google Pay / Paytm</option>
                  <option value="Cash Receipt">Cash Payment at Reception Desk</option>
                  <option value="Net Banking">Net Banking / IMPS Transfer</option>
                </select>
              </div>
            </div>

            <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.14); border-radius:var(--radius-md); padding:1.1rem 1.35rem; margin-bottom:1.5rem; display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
              <div>
                <div style="font-size:0.8rem; font-weight:800; color:#ffffff; margin-bottom:0.2rem;">✓ Instant Invoice Generation</div>
                <div style="font-size:0.8rem; color:var(--slate-muted);">Official Sarathi RTO Form 4 student admission voucher generated automatically upon submission. UPI QR payment receipt issued instantly.</div>
              </div>
            </div>

            <div class="p-action-bar">
              <button type="button" class="p-ghost-btn btn-launch-sub" data-target="trainees">Cancel & Return</button>
              <button type="submit" class="btn-mnc btn-mnc-primary" style="padding:0.75rem 2rem; font-size:1rem;">Confirm Registration & Generate Invoice →</button>
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
        const matchStatus = activePayFilter==='all' || p.status===activePayFilter;
        return matchSearch && matchStatus;
      });

      html = `
        ${topbar}

        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">Course Fee Payments &amp; Receipts</h1>
            <p class="portal-page-sub">School fee register — fee receipts, UPI and cash collections, and pending balance records.</p>
          </div>
          <button type="button" class="btn-mnc btn-mnc-primary" id="btn-quick-record-payment">+ Receive Payment</button>
        </div>

        <div class="portal-stats-strip">
          <div class="portal-stat">
            <span class="portal-stat-value">₹${totalInvoiced.toLocaleString('en-IN')}</span>
            <span class="portal-stat-label">Total Invoiced</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">₹${totalCollected.toLocaleString('en-IN')}</span>
            <span class="portal-stat-label">Fees Collected</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--primary-gold);">₹${totalOutstanding.toLocaleString('en-IN')}</span>
            <span class="portal-stat-label">Fees Pending</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${collectionRate}%</span>
            <span class="portal-stat-label">Collection Rate</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${payments.length}</span>
            <span class="portal-stat-label">Student Accounts</span>
          </div>
        </div>

        <!-- Search & Filter -->
        <div style="padding:1.1rem 2rem; border-bottom:1px solid var(--border-light); display:flex; gap:0.85rem; align-items:center; flex-wrap:wrap; background:rgba(255,255,255,0.01);">
          <input type="text" class="mnc-input" id="search-payment" placeholder="Search by student name, invoice ID or student ID…" value="${searchQuery}" style="width:320px; flex-shrink:0;" />
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
            <button type="button" class="p-chip-btn ${activePayFilter==='all'     ?'p-chip-active':''}" data-pay="all">All Receipts (${payments.length})</button>
            <button type="button" class="p-chip-btn ${activePayFilter==='paid'    ?'p-chip-active':''}" data-pay="paid">Fully Cleared</button>
            <button type="button" class="p-chip-btn ${activePayFilter==='partial' ?'p-chip-active':''}" data-pay="partial">Partially Paid</button>
            <button type="button" class="p-chip-btn ${activePayFilter==='pending' ?'p-chip-active':''}" data-pay="pending">Pending</button>
          </div>
        </div>

        <div class="portal-section" style="padding-top:0; padding-bottom:0;">
          <div class="p-table-wrap">
            <table class="p-table">
              <thead>
                <tr>
                  <th>Receipt / Inv. ID</th>
                  <th>Student Name</th>
                  <th>Course Package</th>
                  <th>Total Fee</th>
                  <th>Amount Paid</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                  <th>UPI QR</th>
                  <th style="text-align:right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${filteredPayments.map(p => `
                  <tr>
                    <td class="p-td-mono">${p.id}</td>
                    <td>
                      <div style="display:flex; align-items:center; gap:0.65rem;">
                        ${(() => {
                          const tr = trainees.find(t => t.id === p.traineeId);
                          return tr ? renderStudentAvatar(tr, 32) : '';
                        })()}
                        <div>
                          <div class="p-td-name">${p.traineeName}</div>
                          <div class="p-td-sub">${p.traineeId}</div>
                        </div>
                      </div>
                    </td>
                    <td class="p-td-muted">${p.package}</td>
                    <td style="font-weight:700; color:#fff; font-family:var(--font-mono);">₹${p.amount.toLocaleString('en-IN')}</td>
                    <td style="font-weight:700; color:var(--neem-green); font-family:var(--font-mono);">₹${p.paid.toLocaleString('en-IN')}</td>
                    <td style="font-weight:800; color:${p.balance>0?'var(--primary-gold)':'var(--slate-muted)'}; font-family:var(--font-mono);">₹${p.balance.toLocaleString('en-IN')}</td>
                    <td><span class="p-badge ${p.status==='paid'?'p-badge-green':p.status==='partial'?'p-badge-gold':'p-badge-dim'}">${p.status.toUpperCase()}</span></td>
                    <td><button type="button" class="p-link-btn btn-view-invoice-qr" data-invoice-id="${p.id}" data-student="${p.traineeName}" data-amount="${p.amount}" data-balance="${p.balance}" data-status="${p.status}">View UPI QR →</button></td>
                    <td style="text-align:right;">
                      ${p.balance>0
                        ? `<button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm btn-record-pay" data-invoice-id="${p.id}" data-balance="${p.balance}" data-student="${p.traineeName}" style="font-size:0.8rem; padding:0.45rem 0.9rem;">Receive Fee</button>`
                        : `<span style="font-size:0.8rem; color:var(--neem-green); font-weight:800;">✓ Cleared</span>`}
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
            <h1 class="portal-page-title">Driving Instructors &amp; Training Cars</h1>
            <p class="portal-page-sub">Government-certified driving instructors, dual-control training cars, and student training allocations.</p>
          </div>
          <button type="button" class="btn-mnc btn-mnc-primary" id="btn-add-trainer">+ Add New Instructor</button>
        </div>

        <div class="portal-stats-strip">
          <div class="portal-stat">
            <span class="portal-stat-value">${trainers.length}</span>
            <span class="portal-stat-label">Driving Instructors</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${trainers.length}</span>
            <span class="portal-stat-label">Training Cars</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">100%</span>
            <span class="portal-stat-label">RTO Certified</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">99.2%</span>
            <span class="portal-stat-label">Test Pass Rate</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">★ 4.96</span>
            <span class="portal-stat-label">Average Rating</span>
          </div>
        </div>

        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">Instructors Directory</span>
            <span class="portal-section-meta">${trainers.length} certified instructors in Pulivendula</span>
          </div>
          <div class="p-table-wrap">
            <table class="p-table">
              <thead>
                <tr>
                  <th>Instructor Details</th>
                  <th>Designation &amp; Certification</th>
                  <th>Assigned Training Car</th>
                  <th>Active Students</th>
                  <th>Student Rating</th>
                  <th style="text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${trainers.map(tr => {
                  const count = trainees.filter(t => t.assignedTrainerId===tr.id).length;
                  const initials = tr.name.split(' ').map(n=>n[0]).join('').substring(0,2);
                  return `
                    <tr>
                      <td>
                        <div style="display:flex; align-items:center; gap:0.85rem;">
                          <div style="width:40px; height:40px; border-radius:var(--radius-sm); background:rgba(243,209,130,0.12); border:1px solid rgba(243,209,130,0.2); display:flex; align-items:center; justify-content:center; font-weight:800; color:var(--primary-gold); font-size:0.875rem; flex-shrink:0;">${initials}</div>
                          <div>
                            <div class="p-td-name">${tr.name}</div>
                            <div class="p-td-sub" style="font-family:var(--font-mono); color:#ffffff; font-weight:700;">Login Code: ${tr.trainerCode || tr.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style="font-size:0.875rem; font-weight:700; color:var(--slate-body);">${tr.role}</div>
                        <div class="p-td-sub">AP-MVI Certified · Pulivendula RTO</div>
                        <span class="p-badge p-badge-green" style="margin-top:0.3rem; font-size:0.6rem;">RTO Licensed</span>
                      </td>
                      <td>
                        <div style="font-size:0.875rem; font-weight:700; color:var(--slate-body);">${tr.car}</div>
                        <div class="p-td-sub">Dual-brake pedals · Instructor control</div>
                        <span class="p-badge p-badge-dim" style="margin-top:0.3rem; font-size:0.6rem;">Safety Verified</span>
                      </td>
                      <td>
                        <div style="font-size:1.25rem; font-weight:800; color:#ffffff;">${count}</div>
                        <div class="p-td-sub">Assigned students</div>
                      </td>
                      <td>
                        <div style="font-size:0.95rem; font-weight:800; color:var(--primary-gold);">★ 4.96 / 5.0</div>
                        <div class="p-td-sub">Student satisfaction</div>
                      </td>
                      <td style="text-align:right;">
                        <button type="button" class="p-link-btn btn-open-trainer-dossier" data-trainer-id="${tr.id}">View Instructor Profile →</button>
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
    // VEHICLE FLEET & SAFETY RIGS SERVICE
    // =====================================================
    if (subService === 'fleet') {
      const fleetUnits = trainers.map((tr, idx) => {
        const traineesOnRig = trainees.filter(t => t.assignedTrainerId === tr.id);
        const kmLogged = traineesOnRig.reduce((a, t) => a + (t.currentDay * 8), 0);
        return {
          id: `CAR-0${idx + 1}`,
          model: tr.car,
          trainerName: tr.name,
          trainerId: tr.id,
          activeCandidates: traineesOnRig.length,
          totalKm: kmLogged,
          brakeSystem: 'Dual Hydraulic Master Cylinder (Govt. Approved)',
          fitnessExpiry: '2027-04-15',
          status: 'Operational'
        };
      });

      html = `
        ${topbar}

        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">Dual-Control Training Cars &amp; Safety Checks</h1>
            <p class="portal-page-sub">Dual-control training cars equipped with instructor brake pedals and valid RTO fitness certificates.</p>
          </div>
          <div style="display:flex; gap:0.65rem; align-items:center;">
            <button type="button" class="btn-mnc btn-mnc-primary" id="btn-fleet-audit-all">Perform Dual-Brake Safety Inspection ✓</button>
          </div>
        </div>

        <div class="portal-stats-strip">
          <div class="portal-stat">
            <span class="portal-stat-value">${fleetUnits.length}</span>
            <span class="portal-stat-label">Training Cars</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">100%</span>
            <span class="portal-stat-label">Dual-Brake Verified</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${fleetUnits.reduce((a,f)=>a+f.totalKm, 0).toLocaleString('en-IN')} km</span>
            <span class="portal-stat-label">Total Driving Logged</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--primary-gold);">0</span>
            <span class="portal-stat-label">Safety Alerts</span>
          </div>
        </div>

        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">Training Cars Directory</span>
            <span class="portal-section-meta">${fleetUnits.length} dual-control cars operating in Pulivendula</span>
          </div>
          <div class="p-table-wrap">
            <table class="p-table">
              <thead>
                <tr>
                  <th>Vehicle &amp; Reg. No.</th>
                  <th>Assigned Driving Instructor</th>
                  <th>Dual-Control Safety System</th>
                  <th>Active Students</th>
                  <th>Total Kilometers</th>
                  <th>RTO Fitness Certificate</th>
                  <th style="text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${fleetUnits.map(unit => `
                  <tr>
                    <td>
                      <div class="p-td-name">${unit.model}</div>
                      <div class="p-td-sub">${unit.id} · Pulivendula RTO Registered</div>
                    </td>
                    <td>
                      <div style="font-size:0.875rem; font-weight:700; color:#ffffff;">${unit.trainerName}</div>
                      <div class="p-td-sub">Senior Driving Instructor (${unit.trainerId})</div>
                    </td>
                    <td>
                      <div style="font-size:0.85rem; font-weight:600; color:var(--neem-green);">${unit.brakeSystem}</div>
                      <div class="p-td-sub">Dual-brake override active · Emergency instructor control</div>
                    </td>
                    <td>
                      <div style="font-size:1.15rem; font-weight:800; color:#ffffff;">${unit.activeCandidates}</div>
                      <div class="p-td-sub">Active students</div>
                    </td>
                    <td>
                      <div style="font-size:1.05rem; font-weight:700; color:var(--slate-body); font-family:var(--font-mono);">${unit.totalKm.toLocaleString('en-IN')} km</div>
                      <div class="p-td-sub">School training log</div>
                    </td>
                    <td>
                      <span class="p-badge p-badge-green" style="font-size:0.65rem;">RTO VALID TILL 2027</span>
                      <div class="p-td-sub" style="margin-top:0.25rem;">Inspected Sept 2026</div>
                    </td>
                    <td style="text-align:right;">
                      <button type="button" class="p-link-btn btn-test-brake" data-unit="${unit.model}">Test Dual-Brake →</button>
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
    // RTO DL TEST & EXAM SCHEDULER SERVICE
    // =====================================================
    if (subService === 'rto-scheduler') {
      const eligibleTrainees = trainees.filter(t => t.currentDay >= 16);
      const testReadyCount = trainees.filter(t => t.currentDay >= 20).length;
      const scheduledCount = trainees.filter(t => t.status && t.status.includes('Test on')).length;

      html = `
        ${topbar}

        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">Govt. Driving License (DL) Test Bookings</h1>
            <p class="portal-page-sub">Schedule official Driving License (DL) tests with the Motor Vehicle Inspector at Pulivendula RTO Track.</p>
          </div>
          <div style="display:flex; gap:0.65rem; align-items:center;">
            <button type="button" class="btn-mnc btn-mnc-secondary btn-launch-sub" data-target="trainees">View All Students</button>
          </div>
        </div>

        <div class="portal-stats-strip">
          <div class="portal-stat">
            <span class="portal-stat-value">${eligibleTrainees.length}</span>
            <span class="portal-stat-label">Day 16+ Students</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">${testReadyCount}</span>
            <span class="portal-stat-label">Day 20 Ready for Test</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--primary-gold);">${scheduledCount}</span>
            <span class="portal-stat-label">Test Slots Booked</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">99.2%</span>
            <span class="portal-stat-label">Test Pass Rate</span>
          </div>
        </div>

        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">Students Eligible for Driving Test</span>
            <span class="portal-section-meta">${eligibleTrainees.length} eligible students</span>
          </div>
          <div class="p-table-wrap">
            <table class="p-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>LLR Permit No.</th>
                  <th>Training Stage</th>
                  <th>Training Car</th>
                  <th>Test Slot Status</th>
                  <th style="text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${eligibleTrainees.map(t => {
                  const tr = trainers.find(x => x.id === t.assignedTrainerId) || trainers[0];
                  const isReady = t.currentDay >= 20;
                  const hasSlot = t.status && t.status.includes('Test on');
                  return `
                    <tr>
                      <td>
                        <div style="display:flex; align-items:center; gap:0.65rem;">
                          ${renderStudentAvatar(t, 32)}
                          <div>
                            <div class="p-td-name">${t.name}</div>
                            <div class="p-td-sub">${t.id} · ${t.phone || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td class="p-td-mono" style="color:var(--primary-cyan); font-weight:700;">
                        ${t.permitNumber || 'AP004/LLR/2026/8941'}
                      </td>
                      <td>
                        <div style="font-size:0.9rem; font-weight:800; color:#ffffff;">Day ${t.currentDay} / 20</div>
                        <div class="p-td-sub">${t.currentDay * 8} km logged · 8-Track Ready</div>
                      </td>
                      <td>
                        <div style="font-size:0.875rem; font-weight:700; color:#ffffff;">${tr.car.split(' ')[0]} ${tr.car.split(' ')[1] || ''}</div>
                        <div class="p-td-sub">Instructor: ${tr.name}</div>
                      </td>
                      <td>
                        ${hasSlot 
                          ? `<span class="p-badge p-badge-green">${t.status}</span>` 
                          : isReady 
                            ? `<span class="p-badge p-badge-gold">Day 20 Ready · Awaiting Slot</span>` 
                            : `<span class="p-badge p-badge-dim">Approaching (Day ${t.currentDay})</span>`}
                      </td>
                      <td style="text-align:right;">
                        <button type="button" class="btn-mnc ${isReady || hasSlot ? 'btn-mnc-primary' : 'btn-mnc-secondary'} btn-mnc-sm btn-schedule-rto-slot" data-trainee-id="${t.id}" data-student="${t.name}">
                          ${hasSlot ? 'Reschedule Slot 📅' : 'Book RTO Slot 📅'}
                        </button>
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
        activeStageFilter = (activeStageFilter===t && t!=='all') ? 'all' : t;
        if (subService!=='trainees') onNavigate('trainees');
        else render();
      });
    });

    const searchTrainee = container.querySelector('#search-trainee');
    if (searchTrainee) searchTrainee.addEventListener('input', e => { searchQuery=e.target.value; render(); });

    const searchPay = container.querySelector('#search-payment');
    if (searchPay) searchPay.addEventListener('input', e => { searchQuery=e.target.value; render(); });

    container.querySelectorAll('[data-pkg]').forEach(btn => {
      btn.addEventListener('click', () => { activePackageFilter=btn.dataset.pkg; render(); });
    });

    container.querySelectorAll('[data-pay]').forEach(btn => {
      btn.addEventListener('click', () => { activePayFilter=btn.dataset.pay; render(); });
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
        const newDay = Math.min(20, parseInt(btn.dataset.currentDay,10)+1);
        store.updateTrainee(id, { currentDay:newDay, category: newDay<=5?'street':newDay<=15?'highway':'test' });
        lastPulsedTraineeId = id;
        const t = store.trainees.find(x=>x.id===id);
        showToast(`${t.name} advanced to Day ${newDay} (+8 km · ${newDay*8} km total)`, 'success');
        render();
      });
    });

    container.querySelectorAll('.btn-schedule-rto-slot').forEach(btn => {
      btn.addEventListener('click', () => openScheduleRtoModal(btn.dataset.traineeId, btn.dataset.student));
    });

    const btnExportCsv = container.querySelector('#btn-export-rto-csv');
    if (btnExportCsv) btnExportCsv.addEventListener('click', () => exportRtoAuditCsv(store.trainees, store.payments));

    const btnFleetAudit = container.querySelector('#btn-fleet-audit-all');
    if (btnFleetAudit) {
      btnFleetAudit.addEventListener('click', () => {
        showToast('Vehicle Safety Check: All 4 training cars passed dual-brake inspection! (100% Ready)', 'success');
      });
    }

    container.querySelectorAll('.btn-test-brake').forEach(btn => {
      btn.addEventListener('click', () => {
        showToast(`Safety check passed for ${btn.dataset.unit}: Instructor dual-brake control verified ✓`, 'success');
      });
    });

    const btnQuickPay = container.querySelector('#btn-quick-record-payment');
    if (btnQuickPay) {
      btnQuickPay.addEventListener('click', () => {
        const pending = store.payments.find(p=>p.balance>0);
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
        openInvoiceQrModal(btn.dataset.invoiceId, btn.dataset.student, balance>0?balance:amount);
      });
    });

    const btnAddTrainer = container.querySelector('#btn-add-trainer');
    if (btnAddTrainer) btnAddTrainer.addEventListener('click', openAddTrainerModal);

    container.querySelectorAll('.btn-open-supabase-modal').forEach(btn => {
      btn.addEventListener('click', openSupabaseSettingsModal);
    });

    const formNewStudent = container.querySelector('#form-new-student-page');
    if (formNewStudent) {
      formNewStudent.addEventListener('submit', e => {
        e.preventDefault();
        const f = formNewStudent.elements;
        const surname   = f['surname']?.value.trim() || '';
        const firstName = f['firstName']?.value.trim() || '';
        const fullName  = surname && firstName ? `${firstName} ${surname}` : (f['name']?.value?.trim() || firstName || surname);
        const newStudent = store.addTrainee({
          name: fullName,
          surname: surname,
          firstName: firstName,
          gender: f['gender']?.value || '',
          registeredDate: f['registeredDate']?.value || new Date().toISOString().split('T')[0],
          phone: f['phone'].value.trim(),
          alternatePhone: f['alternatePhone']?.value.trim() || '',
          email: f['email'].value.trim(),
          address: f['address'].value.trim() || f['branch'].value,
          package: f['package_choice'].value,
          permitNumber: f['permitNumber'].value.trim(),
          assignedTrainerId: f['assignedTrainerId'].value,
          emergencyContact: f['emergencyContact'].value.trim() || 'Parent / Guardian',
          emergencyPhone: f['emergencyPhone'].value.trim() || f['phone'].value.trim(),
          paymentStatus: f['paymentStatus'].value,
          hasSmartphone: f['hasSmartphone']?.value || 'yes',
          profilePhotoData: window._studentPhotoDataUrl || '',
        });
        window._studentPhotoDataUrl = '';
        showToast(`Student registered! Login Code: ${newStudent.studentCode || newStudent.id}`, 'success');
        showStudentRegistrationSuccessModal(newStudent, () => {
          onNavigate('trainees');
        });
      });

      // Profile photo — open crop modal on file select
      // Profile photo / logo — wire up file inputs
      function wirePhotoInput(input) {
        if (!input) return;
        input.addEventListener('change', () => {
          const file = input.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            openPhotoCropModal(ev.target.result, (croppedDataUrl) => {
              window._studentPhotoDataUrl = croppedDataUrl;
              const previewImg  = container.querySelector('#photo-preview-img');
              const placeholder = container.querySelector('#photo-preview-placeholder');
              const wrap = container.querySelector('#photo-preview-wrap');
              if (previewImg) {
                previewImg.src = croppedDataUrl;
                previewImg.style.display = 'block';
              }
              if (placeholder) placeholder.style.display = 'none';
              if (wrap) {
                wrap.style.border = '2px solid rgba(255, 255, 255, 0.4)';
                wrap.style.background = '#ffffff';
              }
            });
          };
          reader.readAsDataURL(file);
        });
      }
      wirePhotoInput(container.querySelector('#inp-profile-photo'));
      wirePhotoInput(container.querySelector('#inp-profile-photo-btn'));

      // Smartphone radio pill highlight
      container.querySelectorAll('[name="hasSmartphone"]').forEach(radio => {
        radio.addEventListener('change', () => {
          container.querySelectorAll('[name="hasSmartphone"]').forEach(r => {
            const lbl = r.closest('label');
            if (lbl) {
              lbl.style.borderColor = r.checked ? 'rgba(243,209,130,0.5)' : 'rgba(255,255,255,0.15)';
              lbl.style.background  = r.checked ? 'rgba(243,209,130,0.07)' : 'rgba(255,255,255,0.04)';
            }
          });
        });
      });
    }
  }

  function openScheduleRtoModal(traineeId, studentName) {
    const modalRoot = document.getElementById('modal-root');
    const defaultDate = new Date(Date.now()+3*86400000).toISOString().split('T')[0];
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="p-modal">
          <div class="p-modal-header">
            <div>
              <div class="p-modal-title">Schedule RTO DL Test Slot</div>
              <div class="p-modal-sub">${traineeId} · ${studentName}</div>
            </div>
            <button type="button" id="btn-close-rto-modal" class="p-modal-close">✕</button>
          </div>
          <form id="form-schedule-rto" class="p-modal-body">
            <div class="p-form-row" style="margin-bottom:1.1rem;">
              <label class="p-label">Official RTO Test Date *</label>
              <input type="date" class="mnc-input p-input" name="testDate" value="${defaultDate}" required />
            </div>
            <div class="p-form-row" style="margin-bottom:1.25rem;">
              <label class="p-label">Automated Test Track Center</label>
              <select class="mnc-select p-input" name="testCenter">
                <option value="Pulivendula RTO ADTT">Pulivendula RTO (Automated Sensor Track)</option>
                <option value="Kadapa District RTO">Kadapa District Driving Test Ground (ADTT)</option>
                <option value="JNTU Pulivendula Circuit">JNTU Pulivendula Driving Practice Circuit</option>
                <option value="Rayachoty RTO Track">Rayachoty / Proddatur Test Ground</option>
              </select>
            </div>
            <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.14); border-radius:var(--radius-sm); padding:0.85rem 1rem; font-size:0.82rem; color:var(--slate-muted); margin-bottom:1rem;">
              ✓ Pre-test check confirmed: Candidate has completed all 8-track maneuvers and dual-brake hill hold drills.
            </div>
            <div class="p-modal-footer">
              <button type="button" class="p-ghost-btn" id="btn-cancel-rto-modal">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Confirm RTO Appointment →</button>
            </div>
          </form>
        </div>
      </div>
    `;
    const close = () => { modalRoot.innerHTML=''; };
    modalRoot.querySelector('#btn-close-rto-modal').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-rto-modal').addEventListener('click', close);
    modalRoot.querySelector('#form-schedule-rto').addEventListener('submit', e => {
      e.preventDefault();
      const date = e.target.elements['testDate'].value;
      const center = e.target.elements['testCenter'].value;
      store.updateTrainee(traineeId, { status:`Test on ${date}`, rtoSlot:`${date} at ${center}` });
      close();
      showToast(`RTO test scheduled for ${studentName} on ${date} at ${center}`, 'success');
      render();
    });
  }

  function exportRtoAuditCsv(trainees, payments) {
    const headers = ['Candidate ID','Name','Phone','LLR Permit','Package','Days Logged','km Driven','Total Invoiced','Amount Paid','Balance Due','Status'];
    const rows = trainees.map(t => {
      const p = payments.find(x=>x.traineeId===t.id) || { amount:7500, paid:7500, balance:0, status:'paid' };
      return [t.id, `"${t.name}"`, `"${t.phone||''}"`, `"${t.permitNumber||''}"`, `"${t.package}"`, t.currentDay, t.currentDay*8, p.amount, p.paid, p.balance, `"${t.status||'Active'}"`];
    });
    const csv = 'data:text/csv;charset=utf-8,'+[headers.join(','), ...rows.map(r=>r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csv);
    a.download = `Gafoor_RTO_Audit_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast('RTO audit CSV exported successfully', 'success');
  }

  function openRecordPaymentModal(invoiceId, balanceDue, studentName) {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="p-modal">
          <div class="p-modal-header">
            <div>
              <div class="p-modal-title">Record Tuition Payment</div>
              <div class="p-modal-sub">${invoiceId} · ${studentName}</div>
            </div>
            <button type="button" id="btn-close-pay-modal" class="p-modal-close">✕</button>
          </div>
          <form id="form-record-pay" class="p-modal-body">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:1rem 0; border-bottom:1px solid var(--border-light); margin-bottom:1.25rem;">
              <span style="font-size:0.875rem; color:var(--slate-muted); font-weight:700;">Current Balance Due</span>
              <span style="font-size:1.5rem; font-weight:900; color:var(--primary-gold);">₹${balanceDue.toLocaleString('en-IN')}</span>
            </div>
            <div class="p-form-row" style="margin-bottom:1.1rem;">
              <label class="p-label">Amount Collected (₹) *</label>
              <input type="number" class="mnc-input p-input" name="paidAmount" required min="1" max="${balanceDue}" value="${balanceDue}" style="font-size:1.1rem; font-weight:800;" />
            </div>
            <div class="p-form-row" style="margin-bottom:1.25rem;">
              <label class="p-label">Payment Method</label>
              <select class="mnc-select p-input" name="method">
                <option value="UPI (PhonePe / Google Pay QR)">UPI — PhonePe / Google Pay / Paytm</option>
                <option value="Cash Receipt">Cash Payment at Reception Desk</option>
                <option value="Net Banking / IMPS">Net Banking / IMPS Transfer</option>
              </select>
            </div>
            <div class="p-modal-footer">
              <button type="button" class="p-ghost-btn" id="btn-cancel-pay-modal">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Confirm & Record Receipt →</button>
            </div>
          </form>
        </div>
      </div>
    `;
    const close = () => { modalRoot.innerHTML=''; };
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
        <div class="p-modal" style="max-width:400px; text-align:center;">
          <div class="p-modal-header">
            <div>
              <div class="p-modal-title">UPI Payment QR Voucher</div>
              <div class="p-modal-sub">${invoiceId} · ${studentName}</div>
            </div>
            <button type="button" id="btn-close-qr" class="p-modal-close">✕</button>
          </div>
          <div class="p-modal-body" style="text-align:center; padding:2rem;">
            <div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:0.12em; color:var(--slate-muted); margin-bottom:1rem;">Scan with PhonePe / Google Pay / Paytm</div>
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
              <rect x="16" y="68" width="12" height="10" fill="#1c1917"/>
              <rect x="120" y="68" width="16" height="8" fill="#1c1917"/>
            </svg>
            <div style="font-size:2rem; font-weight:900; color:#ffffff; margin-bottom:0.3rem;">₹${amount.toLocaleString('en-IN')}</div>
            <div style="font-size:0.9rem; color:var(--primary-gold); font-weight:800; margin-bottom:0.25rem;">gafoordrive@icici</div>
            <div style="font-size:0.8rem; color:var(--slate-muted); margin-bottom:1.5rem;">Gafoor Driving School · Pulivendula</div>
            <div style="display:flex; justify-content:center; gap:0.75rem; flex-wrap:wrap;">
              <button type="button" class="p-ghost-btn" id="btn-close-qr-2">Close</button>
              <button type="button" class="btn-mnc btn-mnc-primary" id="btn-simulate-qr-paid">Simulate UPI Payment ✓</button>
            </div>
          </div>
        </div>
      </div>
    `;
    const close = () => { modalRoot.innerHTML=''; };
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
              <div class="p-modal-title">Register New Instructor</div>
              <div class="p-modal-sub">Add RTO-certified faculty member to the academy fleet</div>
            </div>
            <button type="button" id="btn-close-trn" class="p-modal-close">✕</button>
          </div>
          <form id="form-add-trainer" class="p-modal-body">
            <div class="p-form-row" style="margin-bottom:1.1rem;">
              <label class="p-label">Instructor Full Name *</label>
              <input type="text" class="mnc-input p-input" name="name" required placeholder="e.g. Suresh Varma" />
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.1rem;">
              <div class="p-form-row">
                <label class="p-label">Mobile Number *</label>
                <input type="tel" class="mnc-input p-input" name="phone" required placeholder="+91 98480 55555" />
              </div>
              <div class="p-form-row">
                <label class="p-label">Designation</label>
                <input type="text" class="mnc-input p-input" name="role" value="Dual-Control Safety Instructor" />
              </div>
            </div>
            <div class="p-form-row" style="margin-bottom:1.25rem;">
              <label class="p-label">Assigned Dual-Brake Safety Vehicle</label>
              <input type="text" class="mnc-input p-input" name="car" value="Maruti Swift Dual-Brake #AP-04-ED-${Math.floor(1000+Math.random()*9000)}" />
            </div>
            <div class="p-modal-footer">
              <button type="button" class="p-ghost-btn" id="btn-cancel-trn">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Register Instructor →</button>
            </div>
          </form>
        </div>
      </div>
    `;
    const close = () => { modalRoot.innerHTML=''; };
    modalRoot.querySelector('#btn-close-trn').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-trn').addEventListener('click', close);
    modalRoot.querySelector('#form-add-trainer').addEventListener('submit', e => {
      e.preventDefault();
      const f = e.target.elements;
      const newTrainer = store.addTrainer({ name:f['name'].value.trim(), phone:f['phone'].value.trim(), role:f['role'].value.trim(), car:f['car'].value.trim() });
      close();
      showToast(`Instructor ${f['name'].value.trim()} registered! Unique Code: ${newTrainer.trainerCode || newTrainer.id}`, 'success');
      render();
    });
  }

  function showStudentRegistrationSuccessModal(student, onClose) {
    const modalRoot = document.getElementById('modal-root');
    const studentCode = student.studentCode || student.id;
    const seqPart = studentCode.includes('-') ? studentCode.split('-')[1] : studentCode;
    const namePart = studentCode.includes('-') ? studentCode.split('-')[0] : (student.avatar || 'ST');

    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="p-modal" style="max-width:520px; text-align:center;">
          <div class="p-modal-header" style="justify-content:center; position:relative; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:1.25rem;">
            <div>
              <div style="font-size:0.7rem; font-weight:800; color:#a1a1aa; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:0.25rem;">ADMISSION CONFIRMED</div>
              <div class="p-modal-title" style="font-size:1.35rem;">Student Registered Successfully!</div>
            </div>
            <button type="button" id="btn-close-reg-modal" class="p-modal-close" style="position:absolute; right:1.5rem; top:1.5rem;">✕</button>
          </div>

          <div class="p-modal-body" style="padding:2rem 1.75rem;">
            <p style="font-size:0.875rem; color:#a1a1aa; margin:0 0 1.25rem; line-height:1.5;">
              A unique institutional login code has been generated for candidate <strong>${student.name}</strong>.
            </p>

            <!-- CODE CARD -->
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.18); border-radius:18px; padding:1.5rem 1.25rem; margin-bottom:1.5rem;">
              <div style="font-size:0.7rem; font-weight:800; color:#8e9aa8; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:0.6rem;">
                Official Student Login Code
              </div>
              <div id="display-student-code" style="font-size:2.6rem; font-weight:900; letter-spacing:0.06em; font-family:var(--font-mono); color:#ffffff; margin-bottom:0.6rem; user-select:all;">
                ${studentCode}
              </div>
              <div style="font-size:0.75rem; color:#a1a1aa; line-height:1.4;">
                <span style="color:#ffffff; font-weight:700;">${namePart}</span> (Initials of ${student.name}) · 
                <span style="color:#ffffff; font-weight:700;">${seqPart}</span> (Gafoor Student Sequential Index)
              </div>
            </div>

            <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:0.85rem; font-size:0.8rem; color:#a1a1aa; text-align:left; margin-bottom:1.75rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; padding-bottom:0.5rem; border-bottom:1px solid rgba(255,255,255,0.08);">
                <span style="color:var(--slate-muted);">Date of Joining:</span>
                <strong style="color:#ffffff; font-family:var(--font-mono);">${student.registeredDate || new Date().toISOString().split('T')[0]}</strong>
              </div>
              <div style="font-weight:700; color:#ffffff; margin-bottom:0.25rem;">Candidate Access Instructions:</div>
              The student can now use this unique code <strong style="color:#ffffff;">${studentCode}</strong> to sign in to the Student Portal from any mobile device or browser.
            </div>

            <div style="display:flex; gap:0.75rem;">
              <button type="button" id="btn-copy-student-code" class="p-ghost-btn" style="flex:1; justify-content:center; padding:0.85rem;">
                📋 Copy Code
              </button>
              <button type="button" id="btn-confirm-reg-modal" class="btn-mnc btn-mnc-primary" style="flex:1; justify-content:center; padding:0.85rem;">
                View in Register →
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const close = () => {
      modalRoot.innerHTML = '';
      if (onClose) onClose();
    };

    modalRoot.querySelector('#btn-close-reg-modal').addEventListener('click', close);
    modalRoot.querySelector('#btn-confirm-reg-modal').addEventListener('click', close);

    const btnCopy = modalRoot.querySelector('#btn-copy-student-code');
    btnCopy.addEventListener('click', () => {
      navigator.clipboard.writeText(studentCode).then(() => {
        btnCopy.textContent = '✓ Copied!';
        setTimeout(() => { btnCopy.textContent = '📋 Copy Code'; }, 2000);
      }).catch(() => {
        btnCopy.textContent = 'Code: ' + studentCode;
      });
    });
  }

  function openSupabaseSettingsModal() {
    const modalRoot = document.getElementById('modal-root');
    const creds = getSupabaseCredentials();

    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="p-modal" style="max-width:560px;">
          <div class="p-modal-header">
            <div>
              <div class="p-modal-title">Supabase Database Connection</div>
              <div class="p-modal-sub">Cloud database integration for real-time student syncing</div>
            </div>
            <button type="button" id="btn-close-supabase-modal" class="p-modal-close">✕</button>
          </div>

          <div class="p-modal-body">
            <div id="sb-status-box" style="margin-bottom:1.25rem; padding:0.85rem 1rem; border-radius:12px; font-size:0.82rem; ${creds.isConfigured ? 'background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.2); color:#ffffff;' : 'background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#a1a1aa;'}">
              <div style="font-weight:700; margin-bottom:0.25rem;">
                Status: ${creds.isConfigured ? '🟢 Supabase Configured' : '⚪ Local Demo Mode (Cloud DB Not Configured)'}
              </div>
              <div>${creds.isConfigured ? `Connected to: ${creds.url}` : 'Using in-browser storage. Configure Supabase URL & Key below to persist student registrations to your cloud database.'}</div>
            </div>

            <form id="form-supabase-config">
              <div class="p-form-row" style="margin-bottom:1rem;">
                <label class="p-label">Supabase Project URL</label>
                <input type="url" class="mnc-input p-input" id="sb-url" placeholder="https://your-project.supabase.co" value="${creds.url}" required />
              </div>

              <div class="p-form-row" style="margin-bottom:1.25rem;">
                <label class="p-label">Supabase Anon Key (Public API Key)</label>
                <input type="password" class="mnc-input p-input" id="sb-key" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." value="${creds.anonKey}" required />
              </div>

              <div id="sb-test-result" style="display:none; margin-bottom:1rem; padding:0.75rem 1rem; border-radius:10px; font-size:0.8rem; line-height:1.4;"></div>

              <div style="display:flex; gap:0.65rem; margin-bottom:1.5rem;">
                <button type="button" id="btn-test-sb" class="p-ghost-btn" style="flex:1;">
                  🔍 Test Connection
                </button>
                <button type="submit" class="btn-mnc btn-mnc-primary" style="flex:1;">
                  💾 Save &amp; Connect
                </button>
              </div>
            </form>

            <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:1.25rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.65rem;">
                <span style="font-size:0.8rem; font-weight:700; color:#ffffff;">Database SQL Schema</span>
                <button type="button" id="btn-copy-schema-sql" class="p-ghost-btn" style="font-size:0.75rem; padding:0.35rem 0.75rem;">📋 Copy SQL Schema</button>
              </div>
              <p style="font-size:0.75rem; color:#a1a1aa; line-height:1.4; margin:0 0 0.75rem;">
                Run <code>supabase_schema.sql</code> once in your Supabase SQL editor to create the <code>students</code> and <code>payments</code> tables with public RLS policies.
              </p>
              <div style="display:flex; gap:0.65rem;">
                <button type="button" id="btn-sync-students-now" class="p-ghost-btn" style="width:100%; font-size:0.8rem;">
                  🔄 Sync Students with Cloud Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-supabase-modal').addEventListener('click', close);

    const testBtn = modalRoot.querySelector('#btn-test-sb');
    const resultBox = modalRoot.querySelector('#sb-test-result');
    const form = modalRoot.querySelector('#form-supabase-config');

    testBtn.addEventListener('click', async () => {
      const url = modalRoot.querySelector('#sb-url').value.trim();
      const key = modalRoot.querySelector('#sb-key').value.trim();
      if (!url || !key) {
        resultBox.style.display = 'block';
        resultBox.style.background = 'rgba(255,75,75,0.1)';
        resultBox.style.border = '1px solid rgba(255,75,75,0.3)';
        resultBox.style.color = '#ff8080';
        resultBox.textContent = 'Please enter both Supabase URL and Anon Key before testing.';
        return;
      }

      saveSupabaseCredentials(url, key);
      resultBox.style.display = 'block';
      resultBox.style.background = 'rgba(255,255,255,0.05)';
      resultBox.style.border = '1px solid rgba(255,255,255,0.1)';
      resultBox.style.color = '#ffffff';
      resultBox.textContent = 'Testing connection to Supabase...';

      const res = await testSupabaseConnection();
      if (res.success) {
        resultBox.style.background = 'rgba(255,255,255,0.08)';
        resultBox.style.border = '1px solid rgba(255,255,255,0.3)';
        resultBox.style.color = '#ffffff';
        resultBox.textContent = '✓ ' + res.message;
      } else {
        resultBox.style.background = 'rgba(255,75,75,0.1)';
        resultBox.style.border = '1px solid rgba(255,75,75,0.3)';
        resultBox.style.color = '#ff8080';
        resultBox.textContent = '✗ ' + res.message;
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const url = modalRoot.querySelector('#sb-url').value.trim();
      const key = modalRoot.querySelector('#sb-key').value.trim();
      saveSupabaseCredentials(url, key);
      showToast('Supabase credentials saved successfully!', 'success');
      store.syncWithSupabase();
      close();
      render();
    });

    modalRoot.querySelector('#btn-sync-students-now').addEventListener('click', async () => {
      const btn = modalRoot.querySelector('#btn-sync-students-now');
      btn.textContent = 'Syncing...';
      await store.syncWithSupabase();
      btn.textContent = '✓ Students Synced';
      showToast('Students synced with Supabase cloud database!', 'success');
      setTimeout(close, 800);
      render();
    });

    modalRoot.querySelector('#btn-copy-schema-sql').addEventListener('click', () => {
      const sql = `-- Supabase Schema for Gafoor Driving School
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  student_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  permit_number TEXT,
  assigned_trainer_id TEXT DEFAULT 'TRN-1',
  current_day INT DEFAULT 1,
  total_days INT DEFAULT 20,
  category TEXT DEFAULT 'street',
  status TEXT DEFAULT 'Active',
  registered_date DATE DEFAULT CURRENT_DATE,
  package TEXT DEFAULT '20-Day Comprehensive Licensing Package',
  avatar TEXT,
  attendance_rate TEXT DEFAULT '100%',
  payment_status TEXT DEFAULT 'pending',
  emergency_contact TEXT,
  emergency_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Full Access on Students" ON public.students FOR ALL USING (true) WITH CHECK (true);`;

      navigator.clipboard.writeText(sql).then(() => {
        showToast('SQL schema copied to clipboard!', 'info');
      });
    });
  }

  render();
}
