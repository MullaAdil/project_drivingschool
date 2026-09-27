/* ==========================================================================
   MANA DRIVING SCHOOL — ADMIN ENTERPRISE CONSOLE
   Path-Linked Horizontal Architecture & Creative Telemetry
   - Highway Path Linking: Visual road connectors between operational stages
   - Horizontal Dossier Cards: Wide format with live km meters & road tracks
   - Rich Functional Suite:
     * Interactive Stage Filter along the highway pathway
     * Quick +1 Day (+8 km) road progression stepper
     * Official RTO Test Slot Scheduler modal
     * Export RTO Compliance CSV Audit report
     * Dedicated Separate "Add Student" page with horizontal step layout
     * Unified "Transactions & Money" Service with instant payment recording
   ========================================================================== */

import { store } from '../store.js';
import { renderBrandLogo } from '../components/brandLogo.js';

export function renderAdminView(container, showToast, subService = 'hub', onNavigate) {
  let searchQuery = '';
  let activePackageFilter = 'all';
  let activePayFilter = 'all';
  let activeStageFilter = 'all'; // 'all' | 'intake' | 'ground' | 'city' | 'track' | 'exam'
  let viewLayout = 'horizontal-cards'; // 'horizontal-cards' | 'table'
  let lastPulsedTraineeId = null;

  function render() {
    const trainees = store.trainees;
    const trainers = store.trainers;
    const payments = store.payments;

    // Filter trainees based on search, package, and highway stage
    const filteredTrainees = trainees.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (t.permitNumber && t.permitNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPackage = activePackageFilter === 'all' || 
                             (activePackageFilter === '20-day' && t.package.includes('20-Day')) ||
                             (activePackageFilter === 'standard' && (t.package.includes('Standard') || t.package.includes('Beginner') || t.package.includes('City'))) ||
                             (activePackageFilter === 'ladies' && t.package.includes('Ladies'));

      let matchesStage = true;
      if (activeStageFilter === 'intake') matchesStage = t.currentDay <= 2;
      else if (activeStageFilter === 'ground') matchesStage = t.currentDay >= 3 && t.currentDay <= 7;
      else if (activeStageFilter === 'city') matchesStage = t.currentDay >= 8 && t.currentDay <= 15;
      else if (activeStageFilter === 'track') matchesStage = t.currentDay >= 16 && t.currentDay <= 19;
      else if (activeStageFilter === 'exam') matchesStage = t.currentDay >= 20;

      return matchesSearch && matchesPackage && matchesStage;
    });

    // Financial calculations
    const totalInvoiced = payments.reduce((acc, p) => acc + p.amount, 0);
    const totalCollected = payments.reduce((acc, p) => acc + p.paid, 0);
    const totalOutstanding = payments.reduce((acc, p) => acc + p.balance, 0);
    const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 100;

    // Highway Stage Counts
    const intakeCount = trainees.filter(t => t.currentDay <= 2).length;
    const groundCount = trainees.filter(t => t.currentDay >= 3 && t.currentDay <= 7).length;
    const cityCount = trainees.filter(t => t.currentDay >= 8 && t.currentDay <= 15).length;
    const trackCount = trainees.filter(t => t.currentDay >= 16 && t.currentDay <= 19).length;
    const examCount = trainees.filter(t => t.currentDay >= 20).length;

    let html = '';

    // ====================================================
    // HIGHWAY PATH LINKING COMPONENT (REUSABLE PATH BANNER)
    // ====================================================
    const renderHighwayPath = (currentActive = activeStageFilter) => `
      <div class="admin-highway-path-container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; flex-wrap: wrap; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--terracotta);"></span>
            <span style="font-size: 0.775rem; font-weight: 800; text-transform: uppercase; color: var(--charcoal); letter-spacing: 0.05em;">
              RTO Licensing Highway Flow (Click Stage to Filter)
            </span>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            ${currentActive !== 'all' ? `
              <button type="button" class="btn-admin-subtle btn-reset-stage" style="padding: 0.2rem 0.55rem; font-size: 0.7rem; color: var(--terracotta); border-color: var(--terracotta-border);">
                Clear Stage Filter (Show All)
              </button>
            ` : ''}
            <span style="font-size: 0.725rem; color: var(--slate-muted); font-weight: 600;">
              Total Enrolled: <strong>${trainees.length} Students</strong>
            </span>
          </div>
        </div>

        <div class="road-path-strip">
          <div class="road-path-connector-line"></div>

          <!-- Step 1: Intake -->
          <button type="button" class="road-path-step ${currentActive === 'intake' ? 'active' : ''}" data-stage-target="intake">
            <div class="road-path-marker">01</div>
            <div class="road-path-label">LLR Intake</div>
            <div class="road-path-sub">${intakeCount} Students (Day 1-2)</div>
          </button>

          <!-- Step 2: Ground & ABC -->
          <button type="button" class="road-path-step ${currentActive === 'ground' ? 'active' : ''}" data-stage-target="ground">
            <div class="road-path-marker">02</div>
            <div class="road-path-label">Ground & ABC</div>
            <div class="road-path-sub">${groundCount} Students (Day 3-7)</div>
          </button>

          <!-- Step 3: City & Flyover -->
          <button type="button" class="road-path-step ${currentActive === 'city' ? 'active' : ''}" data-stage-target="city">
            <div class="road-path-marker">03</div>
            <div class="road-path-label">City & Flyovers</div>
            <div class="road-path-sub">${cityCount} Students (Day 8-15)</div>
          </button>

          <!-- Step 4: RTO 8 & H Track -->
          <button type="button" class="road-path-step ${currentActive === 'track' ? 'active' : ''}" data-stage-target="track">
            <div class="road-path-marker">04</div>
            <div class="road-path-label">RTO 8 & H Track</div>
            <div class="road-path-sub">${trackCount} Students (Day 16-19)</div>
          </button>

          <!-- Step 5: Test Exam -->
          <button type="button" class="road-path-step ${currentActive === 'exam' ? 'active' : ''}" data-stage-target="exam">
            <div class="road-path-marker">05</div>
            <div class="road-path-label">DL Test Exam</div>
            <div class="road-path-sub">${examCount} Students (Day 20)</div>
          </button>
        </div>
      </div>
    `;

    // Institutional Clean Page Banner (Gafoor Driving School Logo & Pulivendula Details)
    const renderAdminCleanBanner = (subtitle = "Pulivendula Academy Headquarters", badge = "Central Operations Hub") => `
      <div class="clean-page-banner">
        <div class="banner-brand-left">
          ${renderBrandLogo({ size: 'banner' })}
          <div class="banner-title-block">
            <h2>GAFOOR <span>DRIVING SCHOOL</span></h2>
            <div class="banner-sub-meta">
              <span class="tagline-quote">"Walk in &amp; Drive out"</span>
              <span>•</span>
              <span>${subtitle}</span>
              <span>•</span>
              <span>AP Transport Dept Lic. #AP-04-DS-2024</span>
            </div>
          </div>
        </div>
        <div class="banner-pills-right">
          <span class="clean-gold-badge">★ Govt. Recognized Academy</span>
          <span class="clean-info-badge">${badge}</span>
          <span class="kpi-pill kpi-pill-green">AP-04 Sarathi Cleared ✓</span>
        </div>
      </div>
    `;

    // ====================================================
    // SUB-SERVICE 1: OVERVIEW / COMMAND CENTER (HUB)
    // ====================================================
    if (subService === 'hub') {
      html = `
        <!-- Institutional Clean Header Banner with Official Logo -->
        ${renderAdminCleanBanner('Pulivendula Central Command Hub · Operations Architecture', 'Central Operations Desk')}

        <!-- Page Title & Top Actions Bar (Horizontal) -->
        <div class="page-title-row" style="margin-bottom: 1.5rem;">
          <div>
            <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--charcoal); letter-spacing: -0.025em;">Operations Command Center</h1>
            <p class="page-subtitle" style="color: var(--slate-muted); font-size: 0.9rem;">Gafoor Driving School — Pulivendula Operations Architecture. Connected service pipelines and real-time academy telemetry.</p>
          </div>
          <div style="display: flex; gap: 0.65rem; align-items: center; flex-wrap: wrap;">
            <button type="button" class="btn-mnc btn-mnc-primary" id="btn-goto-add-student">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              + Add New Student
            </button>
            <button type="button" class="btn-admin-subtle" id="btn-export-rto-csv">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export RTO Audit CSV
            </button>
            <button type="button" class="btn-admin-subtle btn-launch-sub" data-target="billing">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
              Transactions & Money
            </button>
          </div>
        </div>

        <!-- Horizontal Highway Path Linking -->
        ${renderHighwayPath()}

        <!-- Horizontal Streamlined KPI Strip (Frosted Liquid Glass) -->
        <div class="glass-panel" style="padding: 1.35rem 1.75rem; margin-bottom: 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; align-items: center;">
          <div style="border-right: 1px solid var(--border-light); padding-right: 1rem;">
            <span style="font-size: 0.725rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase;">Active Candidates</span>
            <div style="font-size: 1.85rem; font-weight: 800; color: var(--charcoal); line-height: 1.2; margin-top: 0.2rem;">${trainees.length} Students</div>
            <span style="font-size: 0.75rem; color: var(--neem-green); font-weight: 700;">100% RTO Sarathi Compliant</span>
          </div>

          <div style="border-right: 1px solid var(--border-light); padding-right: 1rem;">
            <span style="font-size: 0.725rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase;">Tuition Collected</span>
            <div style="font-size: 1.85rem; font-weight: 800; color: var(--charcoal); line-height: 1.2; margin-top: 0.2rem;">₹${totalCollected.toLocaleString('en-IN')}</div>
            <span style="font-size: 0.75rem; color: var(--slate-muted); font-weight: 600;">${collectionRate}% of ₹${totalInvoiced.toLocaleString('en-IN')}</span>
          </div>

          <div style="border-right: 1px solid var(--border-light); padding-right: 1rem;">
            <span style="font-size: 0.725rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase;">Outstanding Due</span>
            <div style="font-size: 1.85rem; font-weight: 800; color: var(--terracotta); line-height: 1.2; margin-top: 0.2rem;">₹${totalOutstanding.toLocaleString('en-IN')}</div>
            <span style="font-size: 0.75rem; color: var(--terracotta); font-weight: 700;">Awaiting settlement</span>
          </div>

          <div>
            <span style="font-size: 0.725rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase;">Safety Fleet</span>
            <div style="font-size: 1.85rem; font-weight: 800; color: var(--charcoal); line-height: 1.2; margin-top: 0.2rem;">${trainers.length} Dual-Ctrl Units</div>
            <span style="font-size: 0.75rem; color: var(--neem-green); font-weight: 700;">Zero Mechanical Defects</span>
          </div>
        </div>

        <!-- 4 Path-Linked Operational Service Boxes -->
        <div style="margin-bottom: 1rem;">
          <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--charcoal); margin-bottom: 0.35rem;">Operational Workflow Highway</h3>
          <p style="font-size: 0.8rem; color: var(--slate-muted); margin-bottom: 1.25rem;">Connected services linking candidate intake, daily dispatch, safety fleet, and revenue clearinghouse.</p>
        </div>

        <div class="linked-workflow-grid">
          <!-- Linked Box 1: Add Student Intake -->
          <div class="linked-step-box">
            <div class="linked-step-connector">➔</div>
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <span style="font-size: 0.7rem; font-weight: 800; color: var(--terracotta); text-transform: uppercase;">STAGE 1 · INTAKE</span>
                <span class="kpi-pill kpi-pill-orange">New Intake</span>
              </div>
              <h4 style="font-size: 1.15rem; font-weight: 800; color: var(--charcoal); margin-bottom: 0.4rem;">Add Student (Registration)</h4>
              <p style="font-size: 0.825rem; color: var(--slate-muted); line-height: 1.5; margin-bottom: 1.25rem;">
                Dedicated separate intake workspace. Register personal data, assign LLR license number, and select course package.
              </p>
            </div>
            <button type="button" class="btn-mnc btn-mnc-primary btn-launch-sub" data-target="new-student" style="width: 100%;">
              Open Add Student Form →
            </button>
          </div>

          <!-- Linked Box 2: Students Directory -->
          <div class="linked-step-box">
            <div class="linked-step-connector">➔</div>
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <span style="font-size: 0.7rem; font-weight: 800; color: var(--slate-muted); text-transform: uppercase;">STAGE 2 · PROGRESS</span>
                <span class="kpi-pill kpi-pill-blue">${trainees.length} Active</span>
              </div>
              <h4 style="font-size: 1.15rem; font-weight: 800; color: var(--charcoal); margin-bottom: 0.4rem;">Students Directory</h4>
              <p style="font-size: 0.825rem; color: var(--slate-muted); line-height: 1.5; margin-bottom: 1.25rem;">
                Manage candidates, log daily 8 km practice, view automated 8-track status, and inspect confidential dossiers.
              </p>
            </div>
            <button type="button" class="btn-mnc btn-mnc-secondary btn-launch-sub" data-target="trainees" style="width: 100%;">
              View Students List →
            </button>
          </div>

          <!-- Linked Box 3: Instructors & Fleet -->
          <div class="linked-step-box">
            <div class="linked-step-connector">➔</div>
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <span style="font-size: 0.7rem; font-weight: 800; color: var(--slate-muted); text-transform: uppercase;">STAGE 3 · DISPATCH</span>
                <span class="kpi-pill kpi-pill-green">${trainers.length} Faculty</span>
              </div>
              <h4 style="font-size: 1.15rem; font-weight: 800; color: var(--charcoal); margin-bottom: 0.4rem;">Instructors & Fleet</h4>
              <p style="font-size: 0.825rem; color: var(--slate-muted); line-height: 1.5; margin-bottom: 1.25rem;">
                Faculty credentialing, assigned dual-pedal vehicles, batch schedules, and trainer student load distribution.
              </p>
            </div>
            <button type="button" class="btn-mnc btn-mnc-secondary btn-launch-sub" data-target="trainers" style="width: 100%;">
              View Instructors →
            </button>
          </div>

          <!-- Linked Box 4: Transactions & Money -->
          <div class="linked-step-box">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <span style="font-size: 0.7rem; font-weight: 800; color: var(--slate-muted); text-transform: uppercase;">STAGE 4 · SETTLEMENT</span>
                <span class="kpi-pill kpi-pill-green">Treasury</span>
              </div>
              <h4 style="font-size: 1.15rem; font-weight: 800; color: var(--charcoal); margin-bottom: 0.4rem;">Transactions & Money</h4>
              <p style="font-size: 0.825rem; color: var(--slate-muted); line-height: 1.5; margin-bottom: 1.25rem;">
                Unified financial clearinghouse. Collect offline cash, reconcile bank deposits, and generate instant UPI QR vouchers.
              </p>
            </div>
            <button type="button" class="btn-mnc btn-mnc-secondary btn-launch-sub" data-target="billing" style="width: 100%;">
              Open Transactions & Money →
            </button>
          </div>
        </div>

        <!-- Today's Driving Dispatch Ticker (Frosted Liquid Glass) -->
        <div class="glass-panel" style="padding: 1.5rem 1.75rem; margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--charcoal);">Today's Road Practice Dispatch Schedule</h4>
              <p style="font-size: 0.775rem; color: var(--slate-muted);">Live batch assignments, safety vehicles, and curriculum modules</p>
            </div>
            <span class="kpi-pill kpi-pill-green" style="font-size: 0.75rem;">● Live Active Dispatch</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem;">
            ${store.schedule.slice(0, 3).map(slot => `
              <div style="background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.9); border-radius: var(--radius-sm); padding: 1rem 1.15rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03); transition: transform 0.22s var(--ease-liquid);">
                <div>
                  <div style="font-size: 0.75rem; font-weight: 800; color: var(--terracotta);">${slot.time}</div>
                  <div style="font-size: 0.95rem; font-weight: 700; color: var(--charcoal); margin: 0.15rem 0;">${slot.studentName}</div>
                  <div style="font-size: 0.75rem; color: var(--slate-muted);">${slot.topic}</div>
                </div>
                <div style="text-align: right;">
                  <span class="kpi-pill ${slot.attendance === 'present' ? 'kpi-pill-green' : 'kpi-pill-orange'}">${slot.attendance.toUpperCase()}</span>
                  <div style="font-size: 0.7rem; color: var(--slate-muted); margin-top: 0.35rem;">${slot.car.split(' ')[0]}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // ====================================================
    // SUB-SERVICE 2: STUDENTS DIRECTORY (TRAINEES)
    // ====================================================
    if (subService === 'trainees') {
      html = `
        <!-- Institutional Clean Header Banner with Official Logo -->
        ${renderAdminCleanBanner('Active Candidates Directory & Progress Dossiers', 'Candidate Directory')}

        <div class="page-title-row" style="margin-bottom: 1.25rem;">
          <div>
            <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--charcoal); letter-spacing: -0.025em;">Students Directory</h1>
            <p class="page-subtitle" style="color: var(--slate-muted); font-size: 0.9rem;">Candidate files with live road practice progress, curriculum tracking, and confidential dossiers.</p>
          </div>
          <div style="display: flex; gap: 0.65rem; align-items: center;">
            <button type="button" class="btn-mnc btn-mnc-primary" id="btn-goto-add-student">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              + Add New Student
            </button>
            <button type="button" class="btn-admin-subtle" id="btn-export-rto-csv">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export CSV
            </button>
          </div>
        </div>

        <!-- Highway Path Filter Linked Component -->
        ${renderHighwayPath(activeStageFilter)}

        <!-- Horizontal Filter & Search Toolbar (Frosted Liquid Glass) -->
        <div class="product-toolbar glass-panel" style="padding: 0.85rem 1.25rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div style="display: flex; gap: 0.75rem; align-items: center; flex: 1; min-width: 260px;">
            <input type="text" class="mnc-input" id="search-trainee" placeholder="Search candidate by name, ID or LLR permit #..." value="${searchQuery}" style="width: 100%; max-width: 380px;" />
          </div>

          <div class="chips-bar">
            <button type="button" class="chip-btn ${activePackageFilter === 'all' ? 'active' : ''}" data-pkg="all">All Packages</button>
            <button type="button" class="chip-btn ${activePackageFilter === '20-day' ? 'active' : ''}" data-pkg="20-day">20-Day Course</button>
            <button type="button" class="chip-btn ${activePackageFilter === 'standard' ? 'active' : ''}" data-pkg="standard">Beginner Track</button>
            <button type="button" class="chip-btn ${activePackageFilter === 'ladies' ? 'active' : ''}" data-pkg="ladies">Ladies Special</button>
          </div>
        </div>

        <!-- Horizontal Student Cards Stream -->
        <div style="display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 2rem;">
          ${filteredTrainees.length === 0 ? `
            <div class="glass-panel" style="border: 1px dashed var(--border-dark); padding: 3rem; text-align: center; color: var(--slate-muted);">
              No candidates found matching the active filters or search query.
            </div>
          ` : filteredTrainees.map(t => {
            const tr = trainers.find(item => item.id === t.assignedTrainerId) || trainers[0];
            const kmDone = t.currentDay * 8;
            const progressPercent = Math.min(100, Math.round((t.currentDay / 20) * 100));
            const payment = payments.find(p => p.traineeId === t.id) || { amount: 7500, paid: 7500, balance: 0, status: 'paid' };
            const isPulsed = lastPulsedTraineeId === t.id;

            let stageBadge = 'IN-STREET MODULE';
            let stagePillClass = 'kpi-pill-blue';
            if (t.currentDay <= 5) {
              stageBadge = 'GROUND & ABC CONTROLS';
              stagePillClass = 'kpi-pill-blue';
            } else if (t.currentDay <= 15) {
              stageBadge = 'CITY TRAFFIC & FLYOVER';
              stagePillClass = 'kpi-pill-orange';
            } else if (t.currentDay < 20) {
              stageBadge = 'RTO 8-TRACK & ADTT SIM';
              stagePillClass = 'kpi-pill-purple';
            } else {
              stageBadge = 'RTO TEST PASSED & READY';
              stagePillClass = 'kpi-pill-green';
            }

            return `
              <div class="student-horizontal-card ${isPulsed ? 'liquid-pulse-active' : ''}" id="trainee-card-${t.id}">
                <!-- Col 1: Identity -->
                <div style="display: flex; align-items: center; gap: 0.85rem;">
                  <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--terracotta-light); color: var(--terracotta); border: 1px solid var(--terracotta-border); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; flex-shrink: 0; box-shadow: inset 0 1px 2px rgba(255,255,255,0.8), 0 2px 8px rgba(180, 74, 40, 0.12);">
                    ${t.avatar || 'ST'}
                  </div>
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                      <span style="font-weight: 800; color: var(--charcoal); font-size: 0.95rem;">${t.name}</span>
                    </div>
                    <div style="font-size: 0.725rem; color: var(--slate-muted); margin-top: 0.15rem;">
                      <strong>${t.id}</strong> · <span style="color: var(--terracotta); font-weight: 700;">${t.permitNumber || 'LLR Verified'}</span>
                    </div>
                    <div style="font-size: 0.675rem; color: var(--slate-muted); margin-top: 0.2rem;">
                      ${t.address ? t.address.split(',')[0] : 'Pulivendula'}
                    </div>
                  </div>
                </div>

                <!-- Col 2: Highway Road Telemetry & Progress -->
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem;">
                    <span style="font-weight: 800; color: var(--charcoal);">
                      Day ${t.currentDay} of 20 · <span style="color: var(--terracotta);">${kmDone} km Practice</span>
                    </span>
                    <span class="kpi-pill ${stagePillClass}" style="font-size: 0.65rem;">${stageBadge}</span>
                  </div>

                  <div class="mini-highway-track">
                    <div class="mini-highway-progress" style="width: ${progressPercent}%;"></div>
                  </div>

                  <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--slate-muted);">
                    <span>${t.package.split('(')[0]}</span>
                    <span>Attendance: <strong style="color: var(--neem-green);">${t.attendanceRate || '96%'}</strong></span>
                  </div>
                </div>

                <!-- Col 3: Faculty & Safety Vehicle -->
                <div>
                  <div style="font-size: 0.725rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase;">Assigned Instructor</div>
                  <div style="font-weight: 700; color: var(--charcoal); font-size: 0.85rem; margin-top: 0.15rem;">${tr.name}</div>
                  <div style="font-size: 0.725rem; color: var(--slate-muted); margin-top: 0.15rem;">
                    🚗 ${tr.car.split(' ')[0]} ${tr.car.split('#')[1] ? '#' + tr.car.split('#')[1] : 'Dual-Brake'}
                  </div>
                </div>

                <!-- Col 4: Tuition Clearance & Payment -->
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.725rem;">
                    <span style="color: var(--slate-muted); font-weight: 700;">Fee Balance:</span>
                    <span class="kpi-pill ${payment.status === 'paid' ? 'kpi-pill-green' : (payment.status === 'partial' ? 'kpi-pill-orange' : 'kpi-pill-blue')}" style="font-size: 0.65rem;">
                      ${payment.status.toUpperCase()}
                    </span>
                  </div>
                  <div style="font-size: 1.05rem; font-weight: 800; color: ${payment.balance > 0 ? 'var(--terracotta)' : 'var(--neem-green)'}; margin: 0.2rem 0;">
                    ${payment.balance > 0 ? `₹${payment.balance.toLocaleString('en-IN')} Due` : `₹${payment.amount.toLocaleString('en-IN')} Paid ✓`}
                  </div>
                  <div style="font-size: 0.675rem; color: var(--slate-muted);">
                    Paid: ₹${payment.paid.toLocaleString('en-IN')} / ₹${payment.amount.toLocaleString('en-IN')}
                  </div>
                </div>

                <!-- Col 5: Actions -->
                <div style="display: flex; flex-direction: column; gap: 0.35rem; align-items: stretch;">
                  <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-open-dossier" data-trainee-id="${t.id}" style="font-size: 0.775rem; padding: 0.35rem 0.5rem; text-align: center;">
                    Inspect Dossier →
                  </button>

                  <button type="button" class="btn-admin-subtle btn-quick-step-day" data-trainee-id="${t.id}" data-current-day="${t.currentDay}" style="font-size: 0.725rem; padding: 0.25rem 0.5rem; justify-content: center;" title="Advance student road syllabus by 1 day (+8 km logged)">
                    +1 Day (+8 km)
                  </button>

                  ${t.currentDay >= 18 ? `
                    <button type="button" class="btn-admin-subtle btn-schedule-rto-slot" data-trainee-id="${t.id}" data-student="${t.name}" style="font-size: 0.7rem; padding: 0.25rem 0.4rem; color: var(--neem-green); border-color: var(--neem-border); justify-content: center;">
                      📅 Schedule RTO Test
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // ====================================================
    // SUB-SERVICE 3: ADD NEW STUDENT (DEDICATED SEPARATE PAGE - HORIZONTAL FORM)
    // ====================================================
    if (subService === 'new-student') {
      html = `
        <!-- Institutional Clean Header Banner with Official Logo -->
        ${renderAdminCleanBanner('Candidate Intake & RTO Form 5 Setup', 'Enrollment Desk')}

        <div class="page-title-row" style="margin-bottom: 1.5rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
              <button type="button" class="btn-admin-subtle btn-launch-sub" data-target="trainees" style="padding: 0.25rem 0.65rem; font-size: 0.75rem;">
                ← Back to Students
              </button>
              <span style="color: var(--slate-muted); font-size: 0.75rem;">/</span>
              <span style="color: var(--terracotta); font-weight: 700; font-size: 0.75rem; text-transform: uppercase;">Enrollment Highway</span>
            </div>
            <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--charcoal); letter-spacing: -0.025em;">Register New Student</h1>
            <p class="page-subtitle" style="color: var(--slate-muted); font-size: 0.9rem;">Fill candidate information horizontally, select curriculum track, assign instructor, and setup automated tuition billing.</p>
          </div>
        </div>

        <!-- Horizontal Stepper Breadcrumb Header (Frosted Liquid Glass) -->
        <div class="glass-panel" style="padding: 1.1rem 1.6rem; margin-bottom: 1.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <span style="width: 24px; height: 24px; border-radius: 50%; background: var(--terracotta); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800;">1</span>
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--charcoal);">Candidate Profile</span>
          </div>
          <span style="color: var(--border-dark);">➔</span>

          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <span style="width: 24px; height: 24px; border-radius: 50%; background: var(--terracotta); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800;">2</span>
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--charcoal);">Course & Track</span>
          </div>
          <span style="color: var(--border-dark);">➔</span>

          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <span style="width: 24px; height: 24px; border-radius: 50%; background: var(--terracotta); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800;">3</span>
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--charcoal);">Instructor & Car</span>
          </div>
          <span style="color: var(--border-dark);">➔</span>

          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <span style="width: 24px; height: 24px; border-radius: 50%; background: var(--neem-green); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800;">4</span>
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--charcoal);">Tuition & Invoice</span>
          </div>
        </div>

        <form id="form-new-student-page">
          <!-- Horizontal Card 1: Personal & License Details -->
          <div class="glass-panel" style="padding: 1.85rem; margin-bottom: 1.5rem;">
            <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
              <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--charcoal);">1. Candidate Profile & Contact Information</h3>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 1.25rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                  Full Name *
                </label>
                <input type="text" class="mnc-input" name="name" required placeholder="e.g. Divya Bharathi" style="width: 100%;" />
              </div>

              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                  Mobile Phone (+91) *
                </label>
                <input type="tel" class="mnc-input" name="phone" required placeholder="+91 98480 00000" style="width: 100%;" />
              </div>

              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                  Email Address
                </label>
                <input type="email" class="mnc-input" name="email" placeholder="student@gmail.com" style="width: 100%;" />
              </div>

              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                  Training Branch
                </label>
                <select class="mnc-select" name="branch" style="width: 100%;">
                  <option value="Pulivendula - Kadapa Road">Pulivendula - Main Office (Kadapa Rd)</option>
                  <option value="Pulivendula - JNTU Bypass">Pulivendula - JNTU Bypass Ground</option>
                  <option value="Pulivendula - Shilparamam">Pulivendula - Shilparamam Ring Road</option>
                  <option value="Pulivendula - RTC Stand">Pulivendula - RTC Bus Stand Hub</option>
                  <option value="Kadapa RTO Ground">Kadapa - District RTO Ground</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.25rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                  Residential Address
                </label>
                <input type="text" class="mnc-input" name="address" placeholder="Flat No., Street, Colony, Landmark" style="width: 100%;" />
              </div>

              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                  Govt. LLR Permit #
                </label>
                <input type="text" class="mnc-input" name="permitNumber" value="TS009/LLR/2026/${Math.floor(1000 + Math.random() * 9000)}" style="width: 100%;" />
              </div>
            </div>
          </div>

          <!-- Horizontal Card 2: Interactive Course Package Selection -->
          <div class="glass-panel" style="padding: 1.85rem; margin-bottom: 1.5rem;">
            <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
              <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--charcoal);">2. Program Package & Practical Time Slot</h3>
            </div>

            <!-- Horizontal Package Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
              <label style="border: 2px solid var(--border-light); border-radius: var(--radius-md); padding: 1.35rem; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); transition: all 0.25s var(--ease-liquid);" class="pkg-radio-card">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-weight: 800; color: var(--charcoal); font-size: 1.05rem;">Beginner Course</span>
                    <input type="radio" name="package_choice" value="Beginner Driving Course (₹5,500)" />
                  </div>
                  <p style="font-size: 0.8rem; color: var(--slate-muted); margin-bottom: 1rem;">Foundational training for first-time drivers.</p>
                  <ul style="font-size: 0.75rem; color: var(--slate-body); list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.35rem;">
                    <li>✓ 20-Day Program (8 km/day)</li>
                    <li>✓ Ground ABC Pedal Controls</li>
                    <li>✓ Parivahan LLR Support</li>
                  </ul>
                </div>
                <div style="font-size: 1.35rem; font-weight: 900; color: var(--terracotta); margin-top: 1rem;">₹5,500</div>
              </label>

              <label style="border: 2px solid var(--terracotta); border-radius: var(--radius-md); padding: 1.35rem; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; background: rgba(253, 243, 238, 0.88); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); box-shadow: 0 4px 16px rgba(180, 74, 40, 0.12); transition: all 0.25s var(--ease-liquid);" class="pkg-radio-card">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-weight: 800; color: var(--charcoal); font-size: 1.05rem;">RTO 8-Track & City</span>
                    <input type="radio" name="package_choice" value="RTO 8-Track & City Mastery (₹7,500)" checked />
                  </div>
                  <p style="font-size: 0.8rem; color: var(--slate-muted); margin-bottom: 1rem;">Complete DL syllabus with automated sensor track.</p>
                  <ul style="font-size: 0.75rem; color: var(--slate-body); list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.35rem;">
                    <li>✓ Full 20-Day DL Package (160 km)</li>
                    <li>✓ Automated 8-Track & H-Bay Mock</li>
                    <li>✓ Flyover Half-Clutch Hill Hold</li>
                  </ul>
                </div>
                <div style="font-size: 1.35rem; font-weight: 900; color: var(--terracotta); margin-top: 1rem;">₹7,500</div>
              </label>

              <label style="border: 2px solid var(--border-light); border-radius: var(--radius-md); padding: 1.35rem; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); transition: all 0.25s var(--ease-liquid);" class="pkg-radio-card">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-weight: 800; color: var(--charcoal); font-size: 1.05rem;">Ladies Special</span>
                    <input type="radio" name="package_choice" value="Ladies Special & Doorstep Pickup (₹8,500)" />
                  </div>
                  <p style="font-size: 0.8rem; color: var(--slate-muted); margin-bottom: 1rem;">Dedicated senior lady instructor & doorstep car pickup.</p>
                  <ul style="font-size: 0.75rem; color: var(--slate-body); list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.35rem;">
                    <li>✓ Senior Lady Mentor</li>
                    <li>✓ Doorstep Pickup & Drop</li>
                    <li>✓ Flexible Batch Timing</li>
                  </ul>
                </div>
                <div style="font-size: 1.35rem; font-weight: 900; color: var(--terracotta); margin-top: 1rem;">₹8,500</div>
              </label>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                  Preferred Batch Timing
                </label>
                <select class="mnc-select" name="slot" style="width: 100%;">
                  <option value="06:00 AM - 07:00 AM">06:00 AM – 07:00 AM (Early Morning Batch)</option>
                  <option value="07:00 AM - 08:00 AM">07:00 AM – 08:00 AM (Prime Traffic Batch)</option>
                  <option value="08:00 AM - 09:00 AM">08:00 AM – 09:00 AM (City Highway Batch)</option>
                  <option value="05:00 PM - 06:00 PM">05:00 PM – 06:00 PM (Sunset / Peak Traffic)</option>
                  <option value="06:00 PM - 07:00 PM">06:00 PM – 07:00 PM (Night Headlights Batch)</option>
                </select>
              </div>

              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                  Assigned Driving Faculty & Car
                </label>
                <select class="mnc-select" name="assignedTrainerId" style="width: 100%;">
                  ${trainers.map(tr => {
                    const c = trainees.filter(t => t.assignedTrainerId === tr.id).length;
                    return `<option value="${tr.id}">${tr.name} · ${tr.role} (${tr.car.split(' ')[0]}) — ${c} active students</option>`;
                  }).join('')}
                </select>
              </div>
            </div>
          </div>

          <!-- Horizontal Card 3: Emergency & Tuition Billing -->
          <div class="glass-panel" style="padding: 1.85rem; margin-bottom: 2rem;">
            <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
              <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--charcoal);">3. Emergency Contact & Initial Fee Clearance</h3>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 1.25rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                  Emergency Contact Name
                </label>
                <input type="text" class="mnc-input" name="emergencyContact" placeholder="e.g. Srinivas Rao (Father)" style="width: 100%;" />
              </div>

              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                  Emergency Phone
                </label>
                <input type="tel" class="mnc-input" name="emergencyPhone" placeholder="+91 98499 00000" style="width: 100%;" />
              </div>

              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                  Initial Payment Status
                </label>
                <select class="mnc-select" name="paymentStatus" style="width: 100%;">
                  <option value="partial" selected>Partial Deposit (₹3,500 Paid Now)</option>
                  <option value="paid">Full Payment (₹7,500 Settled in Full)</option>
                  <option value="pending">Pending (Pay Balance Later)</option>
                </select>
              </div>

              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                  Payment Mode
                </label>
                <select class="mnc-select" name="paymentMode" style="width: 100%;">
                  <option value="UPI (PhonePe / Google Pay QR)">UPI QR (PhonePe / GPay)</option>
                  <option value="Cash Receipt">Cash Payment at Desk</option>
                  <option value="Net Banking">Net Banking / Transfer</option>
                </select>
              </div>
            </div>

            <div style="background: var(--bg-offwhite); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 0.85rem 1.25rem; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.825rem; color: var(--slate-body);">
                Official Sarathi Form 4 RTO student admission voucher and invoice generated automatically upon submission.
              </span>
              <span style="font-weight: 800; color: var(--neem-green); font-size: 0.825rem;">Instant Invoice Clearance</span>
            </div>
          </div>

          <!-- Bottom Action Buttons (Horizontal) -->
          <div style="display: flex; justify-content: flex-end; gap: 1rem; align-items: center;">
            <button type="button" class="btn-admin-subtle btn-launch-sub" data-target="trainees" style="padding: 0.75rem 1.75rem; font-size: 0.9rem;">
              Cancel & Return
            </button>
            <button type="submit" class="btn-mnc btn-mnc-primary" style="padding: 0.75rem 2.25rem; font-size: 0.95rem;">
              Confirm Registration & Generate Invoice →
            </button>
          </div>
        </form>
      `;
    }

    // ====================================================
    // SUB-SERVICE 4: TRANSACTIONS & MONEY (UNIFIED SERVICE)
    // ====================================================
    if (subService === 'billing') {
      const filteredPayments = payments.filter(p => {
        const matchesSearch = p.traineeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.traineeId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = activePayFilter === 'all' || p.status === activePayFilter;
        return matchesSearch && matchesStatus;
      });

      html = `
        <!-- Institutional Clean Header Banner with Official Logo -->
        ${renderAdminCleanBanner('Academy Treasury & Instant UPI Reconciliation', 'Accounts & Audit')}

        <div class="page-title-row" style="margin-bottom: 1.5rem;">
          <div>
            <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--charcoal); letter-spacing: -0.025em;">Transactions & Money Service</h1>
            <p class="page-subtitle" style="color: var(--slate-muted); font-size: 0.9rem;">Unified treasury ledger, cash/UPI tuition collection, and balance settlement clearinghouse.</p>
          </div>
          <div style="display: flex; gap: 0.65rem;">
            <button type="button" class="btn-mnc btn-mnc-primary" id="btn-quick-record-payment">
              + Record Payment
            </button>
          </div>
        </div>

        <!-- Horizontal Money Metric Strip (Frosted Liquid Glass) -->
        <div class="glass-panel" style="padding: 1.35rem 1.75rem; margin-bottom: 1.75rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; align-items: center;">
          <div style="border-right: 1px solid var(--border-light); padding-right: 1rem;">
            <span style="font-size: 0.725rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase;">Total Invoiced</span>
            <div style="font-size: 1.85rem; font-weight: 800; color: var(--charcoal); line-height: 1.2; margin-top: 0.2rem;">₹${totalInvoiced.toLocaleString('en-IN')}</div>
            <span style="font-size: 0.75rem; color: var(--slate-muted);">${payments.length} candidate accounts</span>
          </div>

          <div style="border-right: 1px solid var(--border-light); padding-right: 1rem;">
            <span style="font-size: 0.725rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase;">Realized Revenue</span>
            <div style="font-size: 1.85rem; font-weight: 800; color: var(--neem-green); line-height: 1.2; margin-top: 0.2rem;">₹${totalCollected.toLocaleString('en-IN')}</div>
            <span style="font-size: 0.75rem; color: var(--neem-green); font-weight: 700;">${collectionRate}% cleared</span>
          </div>

          <div style="border-right: 1px solid var(--border-light); padding-right: 1rem;">
            <span style="font-size: 0.725rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase;">Outstanding Due</span>
            <div style="font-size: 1.85rem; font-weight: 800; color: var(--terracotta); line-height: 1.2; margin-top: 0.2rem;">₹${totalOutstanding.toLocaleString('en-IN')}</div>
            <span style="font-size: 0.75rem; color: var(--terracotta); font-weight: 700;">Awaiting tuition clearance</span>
          </div>

          <div>
            <span style="font-size: 0.725rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase;">Payment Clearinghouse</span>
            <div style="font-size: 1.85rem; font-weight: 800; color: var(--charcoal); line-height: 1.2; margin-top: 0.2rem;">Instant UPI</div>
            <span style="font-size: 0.75rem; color: var(--neem-green); font-weight: 700;">PhonePe / GPay / Paytm Active</span>
          </div>
        </div>

        <!-- Filter & Search Toolbar (Frosted Liquid Glass) -->
        <div class="product-toolbar glass-panel" style="padding: 0.85rem 1.25rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div style="display: flex; gap: 0.75rem; align-items: center; flex: 1; min-width: 260px;">
            <input type="text" class="mnc-input" id="search-payment" placeholder="Search by student name or invoice # (e.g. INV-4011)..." value="${searchQuery}" style="width: 100%; max-width: 380px;" />
          </div>

          <div class="chips-bar">
            <button type="button" class="chip-btn ${activePayFilter === 'all' ? 'active' : ''}" data-pay="all">All Invoices (${payments.length})</button>
            <button type="button" class="chip-btn ${activePayFilter === 'paid' ? 'active' : ''}" data-pay="paid">Fully Settled</button>
            <button type="button" class="chip-btn ${activePayFilter === 'partial' ? 'active' : ''}" data-pay="partial">Partial Deposits</button>
            <button type="button" class="chip-btn ${activePayFilter === 'pending' ? 'active' : ''}" data-pay="pending">Pending</button>
          </div>
        </div>

        <!-- Horizontal Transactions Table (Frosted Liquid Glass) -->
        <div class="glass-panel" style="overflow: hidden;">
          <div style="overflow-x: auto;">
            <table class="mnc-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Candidate</th>
                  <th>Track Package</th>
                  <th>Total Fee (₹)</th>
                  <th>Paid So Far (₹)</th>
                  <th>Balance Due (₹)</th>
                  <th>Status</th>
                  <th>UPI QR Voucher</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${filteredPayments.map(p => `
                  <tr>
                    <td style="font-weight: 800; color: var(--charcoal); font-size: 0.85rem;">${p.id}</td>
                    <td>
                      <div style="font-weight: 700; color: var(--charcoal);">${p.traineeName}</div>
                      <div style="font-size: 0.75rem; color: var(--slate-muted);">${p.traineeId}</div>
                    </td>
                    <td style="font-size: 0.8125rem;">${p.package}</td>
                    <td style="font-weight: 800; color: var(--charcoal);">₹${p.amount.toLocaleString('en-IN')}</td>
                    <td style="color: var(--neem-green); font-weight: 800;">₹${p.paid.toLocaleString('en-IN')}</td>
                    <td style="font-weight: 800; color: ${p.balance > 0 ? 'var(--terracotta)' : 'var(--slate-muted)'};">
                      ₹${p.balance.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span class="kpi-pill ${p.status === 'paid' ? 'kpi-pill-green' : (p.status === 'partial' ? 'kpi-pill-orange' : 'kpi-pill-blue')}">
                        ${p.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-view-invoice-qr" data-invoice-id="${p.id}" data-student="${p.traineeName}" data-amount="${p.amount}" data-balance="${p.balance}" data-status="${p.status}">
                        Scan QR ⊞
                      </button>
                    </td>
                    <td style="text-align: right;">
                      ${p.balance > 0 ? `
                        <button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm btn-record-pay" data-invoice-id="${p.id}" data-balance="${p.balance}" data-student="${p.traineeName}">
                          Record Payment
                        </button>
                      ` : `
                        <span style="font-size: 0.775rem; color: var(--neem-green); font-weight: 800;">✓ Fully Settled</span>
                      `}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ====================================================
    // SUB-SERVICE 5: INSTRUCTORS & FLEET (TRAINERS)
    // ====================================================
    if (subService === 'trainers') {
      html = `
        <!-- Institutional Clean Header Banner with Official Logo -->
        ${renderAdminCleanBanner('Senior Faculty Fleet & Dual-Brake Safety', 'Instructor Fleet')}

        <div class="page-title-row" style="margin-bottom: 1.5rem;">
          <div>
            <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--charcoal); letter-spacing: -0.025em;">Instructors & Vehicle Fleet</h1>
            <p class="page-subtitle" style="color: var(--slate-muted); font-size: 0.9rem;">RTO accredited master faculty, dual-control safety vehicles, and candidate training load distribution.</p>
          </div>
          <div>
            <button type="button" class="btn-mnc btn-mnc-primary" id="btn-add-trainer">
              + Add Instructor
            </button>
          </div>
        </div>

        <!-- Horizontal Fleet Metrics (Frosted Liquid Glass) -->
        <div class="glass-panel" style="padding: 1.35rem 1.75rem; margin-bottom: 1.75rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; align-items: center;">
          <div style="border-right: 1px solid var(--border-light); padding-right: 1rem;">
            <span style="font-size: 0.725rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase;">Master Faculty</span>
            <div style="font-size: 1.85rem; font-weight: 800; color: var(--charcoal); line-height: 1.2; margin-top: 0.2rem;">${trainers.length} Trainers</div>
            <span style="font-size: 0.75rem; color: var(--neem-green); font-weight: 700;">100% RTO Certified</span>
          </div>

          <div style="border-right: 1px solid var(--border-light); padding-right: 1rem;">
            <span style="font-size: 0.725rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase;">Dual-Brake Cars</span>
            <div style="font-size: 1.85rem; font-weight: 800; color: var(--charcoal); line-height: 1.2; margin-top: 0.2rem;">${trainers.length} Units</div>
            <span style="font-size: 0.75rem; color: var(--neem-green); font-weight: 700;">Secondary Pedal Safety Checked</span>
          </div>

          <div>
            <span style="font-size: 0.725rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase;">Student Pass Rate</span>
            <div style="font-size: 1.85rem; font-weight: 800; color: var(--charcoal); line-height: 1.2; margin-top: 0.2rem;">99.2%</div>
            <span style="font-size: 0.75rem; color: var(--slate-muted);">First-attempt RTO DL test pass</span>
          </div>
        </div>

        <!-- Horizontal Instructor Cards -->
        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          ${trainers.map(tr => {
            const assignedCount = trainees.filter(t => t.assignedTrainerId === tr.id).length;
            return `
              <div class="glass-panel" style="padding: 1.35rem 1.65rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.25rem;">
                <div style="display: flex; align-items: center; gap: 1.25rem;">
                  <div style="width: 48px; height: 48px; background: var(--terracotta-light); border: 1px solid var(--terracotta-border); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--terracotta); font-size: 1.15rem;">
                    ${tr.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;">
                      <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--charcoal);">${tr.name}</h3>
                      <span class="col-badge" style="margin: 0; font-size: 0.65rem;">${tr.id}</span>
                      <span class="kpi-pill kpi-pill-green" style="font-size: 0.65rem;">RTO LICENSED</span>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--slate-muted); margin-top: 0.25rem; display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap;">
                      <span>Role: <strong style="color: var(--charcoal);">${tr.role}</strong></span>
                      <span>Assigned Vehicle: <strong style="color: var(--terracotta);">${tr.car}</strong></span>
                      <span>Active Trainees: <strong style="color: var(--charcoal);">${assignedCount} Students</strong></span>
                    </div>
                  </div>
                </div>

                <div style="display: flex; gap: 0.5rem;">
                  <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-open-trainer-dossier" data-trainer-id="${tr.id}">
                    Inspect Faculty File →
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    container.innerHTML = `<div class="admin-sub-view-enter">${html}</div>`;
    attachEvents();
    lastPulsedTraineeId = null;
  }

  function attachEvents() {
    // Navigation Launchers
    container.querySelectorAll('.btn-launch-sub').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        onNavigate(target);
      });
    });

    const btnGoAdd = container.querySelector('#btn-goto-add-student');
    if (btnGoAdd) {
      btnGoAdd.addEventListener('click', () => {
        onNavigate('new-student');
      });
    }

    // Highway Stage Filter Buttons
    container.querySelectorAll('[data-stage-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetStage = btn.dataset.stageTarget;
        if (subService !== 'trainees') {
          activeStageFilter = targetStage;
          onNavigate('trainees');
        } else {
          activeStageFilter = activeStageFilter === targetStage ? 'all' : targetStage;
          render();
        }
      });
    });

    const btnResetStage = container.querySelector('.btn-reset-stage');
    if (btnResetStage) {
      btnResetStage.addEventListener('click', () => {
        activeStageFilter = 'all';
        render();
      });
    }

    // Search inputs
    const searchTrainee = container.querySelector('#search-trainee');
    if (searchTrainee) {
      searchTrainee.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render();
      });
    }

    const searchPayment = container.querySelector('#search-payment');
    if (searchPayment) {
      searchPayment.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render();
      });
    }

    // Filters
    container.querySelectorAll('[data-pkg]').forEach(btn => {
      btn.addEventListener('click', () => {
        activePackageFilter = btn.dataset.pkg;
        render();
      });
    });

    container.querySelectorAll('[data-pay]').forEach(btn => {
      btn.addEventListener('click', () => {
        activePayFilter = btn.dataset.pay;
        render();
      });
    });

    // Student Dossier Navigation
    container.querySelectorAll('.btn-open-dossier').forEach(btn => {
      btn.addEventListener('click', () => {
        const traineeId = btn.dataset.traineeId;
        onNavigate('trainee-profile', traineeId);
      });
    });

    // Trainer Dossier Navigation
    container.querySelectorAll('.btn-open-trainer-dossier').forEach(btn => {
      btn.addEventListener('click', () => {
        const trainerId = btn.dataset.trainerId;
        onNavigate('trainer-profile', trainerId);
      });
    });

    // Functionality 1: Quick +1 Day (+8 km) Progress Stepper
    container.querySelectorAll('.btn-quick-step-day').forEach(btn => {
      btn.addEventListener('click', () => {
        const traineeId = btn.dataset.traineeId;
        const currentDay = parseInt(btn.dataset.currentDay, 10);
        const newDay = Math.min(20, currentDay + 1);
        
        let newCat = 'street';
        if (newDay > 5 && newDay <= 15) newCat = 'highway';
        else if (newDay > 15) newCat = 'test';

        store.updateTrainee(traineeId, {
          currentDay: newDay,
          category: newCat
        });

        lastPulsedTraineeId = traineeId;
        const trainee = store.trainees.find(t => t.id === traineeId);
        showToast(`${trainee.name} advanced to Day ${newDay} (+8 km logged, ${newDay * 8} km total)!`, 'success');
        render();
      });
    });

    // Functionality 2: RTO Test Slot Scheduler
    container.querySelectorAll('.btn-schedule-rto-slot').forEach(btn => {
      btn.addEventListener('click', () => {
        const traineeId = btn.dataset.traineeId;
        const studentName = btn.dataset.student;
        openScheduleRtoModal(traineeId, studentName);
      });
    });

    // Functionality 3: Export RTO Audit CSV
    const btnExportCsv = container.querySelector('#btn-export-rto-csv');
    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', () => {
        exportRtoAuditCsv(store.trainees, store.payments);
      });
    }

    // Functionality 4: Quick Record Payment
    const btnQuickRecord = container.querySelector('#btn-quick-record-payment');
    if (btnQuickRecord) {
      btnQuickRecord.addEventListener('click', () => {
        const pendingPayment = store.payments.find(p => p.balance > 0) || store.payments[0];
        if (pendingPayment) {
          openRecordPaymentModal(pendingPayment.id, pendingPayment.balance, pendingPayment.traineeName);
        } else {
          showToast('All candidate tuition accounts are settled!', 'info');
        }
      });
    }

    // Table Record Pay Buttons
    container.querySelectorAll('.btn-record-pay').forEach(btn => {
      btn.addEventListener('click', () => {
        const invoiceId = btn.dataset.invoiceId;
        const balance = parseFloat(btn.dataset.balance);
        const student = btn.dataset.student;
        openRecordPaymentModal(invoiceId, balance, student);
      });
    });

    // Table View QR Buttons
    container.querySelectorAll('.btn-view-invoice-qr').forEach(btn => {
      btn.addEventListener('click', () => {
        const invoiceId = btn.dataset.invoiceId;
        const student = btn.dataset.student;
        const balance = parseFloat(btn.dataset.balance);
        const amount = parseFloat(btn.dataset.amount);
        openInvoiceQrModal(invoiceId, student, balance > 0 ? balance : amount);
      });
    });

    // Add Trainer Button
    const btnAddTrainer = container.querySelector('#btn-add-trainer');
    if (btnAddTrainer) {
      btnAddTrainer.addEventListener('click', () => {
        openAddTrainerModal();
      });
    }

    // Add Student Form Submission
    const formNewStudent = container.querySelector('#form-new-student-page');
    if (formNewStudent) {
      formNewStudent.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = formNewStudent.elements['name'].value.trim();
        const phone = formNewStudent.elements['phone'].value.trim();
        const email = formNewStudent.elements['email'].value.trim();
        const branch = formNewStudent.elements['branch'].value;
        const address = formNewStudent.elements['address'].value.trim() || `${branch}, Pulivendula, AP`;
        const packageChoice = formNewStudent.elements['package_choice'].value;
        const permitNumber = formNewStudent.elements['permitNumber'].value.trim();
        const assignedTrainerId = formNewStudent.elements['assignedTrainerId'].value;
        const emergencyContact = formNewStudent.elements['emergencyContact'].value.trim() || 'Parent / Guardian';
        const emergencyPhone = formNewStudent.elements['emergencyPhone'].value.trim() || phone;
        const paymentStatus = formNewStudent.elements['paymentStatus'].value;

        store.addTrainee({
          name,
          phone,
          email,
          address,
          package: packageChoice,
          permitNumber,
          assignedTrainerId,
          emergencyContact,
          emergencyPhone,
          paymentStatus
        });

        showToast(`Student "${name}" registered and invoice generated!`, 'success');
        onNavigate('trainees');
      });
    }
  }

  // --- Modal: Schedule RTO ADTT Test Date ---
  function openScheduleRtoModal(traineeId, studentName) {
    const modalRoot = document.getElementById('modal-root');
    const defaultDate = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="mnc-modal" style="max-width: 460px;">
          <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; background: rgba(247, 243, 235, 0.65); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--charcoal);">Schedule RTO DL Test Slot</h3>
              <p style="font-size: 0.775rem; color: var(--slate-muted);">${traineeId} · ${studentName}</p>
            </div>
            <button type="button" id="btn-close-rto-modal" style="background: transparent; border: none; font-size: 1.25rem; cursor: pointer; color: var(--slate-muted);">✕</button>
          </div>

          <form id="form-schedule-rto" style="padding: 1.5rem;">
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                Official RTO Test Date
              </label>
              <input type="date" class="mnc-input" name="testDate" value="${defaultDate}" required style="width: 100%;" />
            </div>

            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                Automated Test Track Center
              </label>
              <select class="mnc-select" name="testCenter" style="width: 100%;">
                <option value="Pulivendula RTO ADTT">Pulivendula RTO Track (Automated Sensor Track)</option>
                <option value="Kadapa District RTO">Kadapa District Driving Test Ground (ADTT Track)</option>
                <option value="JNTU Pulivendula Circuit">JNTU Pulivendula Driving Practice Circuit</option>
                <option value="Rayachoty RTO Track">Rayachoty / Proddatur Test Ground</option>
              </select>
            </div>

            <div style="background: var(--bg-offwhite); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 0.85rem; font-size: 0.8rem; color: var(--slate-body); margin-bottom: 1.25rem;">
              ✓ Pre-test check: Candidate has completed all 8-track maneuvers and dual-brake hill hold drills.
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--border-light);">
              <button type="button" class="btn-admin-subtle" id="btn-cancel-rto-modal">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Confirm RTO Appointment →</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-rto-modal').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-rto-modal').addEventListener('click', close);

    const form = modalRoot.querySelector('#form-schedule-rto');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const date = form.elements['testDate'].value;
      const center = form.elements['testCenter'].value;

      store.updateTrainee(traineeId, {
        status: `Test on ${date}`,
        rtoSlot: `${date} at ${center}`
      });

      close();
      showToast(`RTO DL Test scheduled for ${studentName} on ${date}!`, 'success');
      render();
    });
  }

  // --- Function: Export RTO Audit CSV ---
  function exportRtoAuditCsv(trainees, payments) {
    const headers = ['Candidate ID', 'Name', 'Phone', 'LLR Permit Number', 'Branch', 'Course Package', 'Days Logged', 'Km Completed', 'Attendance', 'Fee Invoiced', 'Fee Paid', 'Balance Due', 'Status'];
    const rows = trainees.map(t => {
      const p = payments.find(pay => pay.traineeId === t.id) || { amount: 7500, paid: 7500, balance: 0, status: 'paid' };
      return [
        t.id,
        `"${t.name}"`,
        `"${t.phone}"`,
        `"${t.permitNumber}"`,
        `"${t.address ? t.address.split(',')[0] : 'Pulivendula'}"`,
        `"${t.package}"`,
        t.currentDay,
        t.currentDay * 8,
        `"${t.attendanceRate || '96%'}"`,
        p.amount,
        p.paid,
        p.balance,
        `"${t.status}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Gafoor_Driving_School_Pulivendula_RTO_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Official RTO Compliance Audit CSV exported successfully!', 'success');
  }

  // --- Modal: Record Cash / UPI Payment ---
  function openRecordPaymentModal(invoiceId, balanceDue, studentName) {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="mnc-modal" style="max-width: 460px;">
          <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; background: rgba(247, 243, 235, 0.65); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--charcoal);">Record Tuition Payment</h3>
              <p style="font-size: 0.775rem; color: var(--slate-muted);">${invoiceId} · ${studentName}</p>
            </div>
            <button type="button" id="btn-close-pay-modal" style="background: transparent; border: none; font-size: 1.25rem; cursor: pointer; color: var(--slate-muted);">✕</button>
          </div>

          <form id="form-record-pay" style="padding: 1.5rem;">
            <div style="background: rgba(253, 243, 238, 0.75); border: 1px solid var(--terracotta-border); border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 2px 8px rgba(180, 74, 40, 0.08);">
              <span style="font-size: 0.85rem; color: var(--slate-muted); font-weight: 600;">Current Balance Due:</span>
              <span style="font-size: 1.25rem; font-weight: 900; color: var(--terracotta);">₹${balanceDue.toLocaleString('en-IN')}</span>
            </div>

            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                Payment Amount Collected (₹) *
              </label>
              <input type="number" class="mnc-input" name="paidAmount" required min="1" max="${balanceDue}" value="${balanceDue}" style="width: 100%; font-size: 1.1rem; font-weight: 800;" />
            </div>

            <div style="margin-bottom: 1.25rem;">
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                Payment Method
              </label>
              <select class="mnc-select" name="method" style="width: 100%;">
                <option value="UPI (PhonePe / Google Pay QR)">UPI (PhonePe / Google Pay QR)</option>
                <option value="Cash Receipt">Cash Payment at Reception</option>
                <option value="Net Banking / IMPS">Net Banking / IMPS</option>
              </select>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--border-light);">
              <button type="button" class="btn-admin-subtle" id="btn-cancel-pay-modal">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Confirm & Record Receipt →</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-pay-modal').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-pay-modal').addEventListener('click', close);

    const form = modalRoot.querySelector('#form-record-pay');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = parseFloat(form.elements['paidAmount'].value);
      store.recordPayment(invoiceId, amount);
      close();
      showToast(`Payment of ₹${amount.toLocaleString('en-IN')} successfully recorded!`, 'success');
      render();
    });
  }

  // --- Modal: View Invoice UPI QR ---
  function openInvoiceQrModal(invoiceId, studentName, amount) {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="mnc-modal" style="max-width: 420px;">
          <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; background: rgba(247, 243, 235, 0.65); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              ${renderBrandLogo({ size: 'sm' })}
              <div>
                <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--charcoal); margin: 0;">Gafoor Driving School Tuition Fee Voucher</h3>
                <p style="font-size: 0.75rem; color: var(--slate-muted); margin: 0;">${invoiceId} · ${studentName} · Pulivendula</p>
              </div>
            </div>
            <button type="button" id="btn-close-qr" style="background: transparent; border: none; font-size: 1.25rem; cursor: pointer; color: var(--slate-muted);">✕</button>
          </div>

          <div style="padding: 1.5rem; text-align: center;">
            <div class="upi-qr-box">
              <div style="font-size: 0.725rem; font-weight: 800; color: var(--terracotta); text-transform: uppercase; margin-bottom: 0.4rem; letter-spacing: 0.05em;">
                SCAN WITH PHONEPE / GPAY / PAYTM
              </div>

              <!-- SVG UPI QR Representation (Liquid Glass Backing) -->
              <div style="display: inline-block; background: rgba(255, 255, 255, 0.95); padding: 12px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.9); box-shadow: 0 8px 24px rgba(0,0,0,0.06); backdrop-filter: blur(10px);">
                <svg width="160" height="160" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                  <rect x="68" y="148" width="16" height="14" fill="#1c1917"/>
                </svg>
              </div>

              <div style="font-size: 1.4rem; font-weight: 900; color: var(--charcoal); margin-top: 0.65rem;">
                ₹${amount.toLocaleString('en-IN')}
              </div>
              <div style="font-size: 0.775rem; color: var(--slate-muted); margin-top: 0.2rem;">
                UPI ID: <strong style="color: var(--charcoal);">gafoordrive@icici</strong>
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem; justify-content: center; margin-top: 1.25rem;">
              <button type="button" class="btn-admin-subtle" id="btn-close-qr-2">Close</button>
              <button type="button" class="btn-mnc btn-mnc-primary" id="btn-simulate-qr-paid">
                Simulate Payment Received ✓
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-qr').addEventListener('click', close);
    modalRoot.querySelector('#btn-close-qr-2').addEventListener('click', close);

    const btnSim = modalRoot.querySelector('#btn-simulate-qr-paid');
    if (btnSim) {
      btnSim.addEventListener('click', () => {
        store.recordPayment(invoiceId, amount);
        close();
        showToast(`UPI settlement of ₹${amount.toLocaleString('en-IN')} confirmed!`, 'success');
        render();
      });
    }
  }

  // --- Modal: Add New Trainer ---
  function openAddTrainerModal() {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="mnc-modal" style="max-width: 480px;">
          <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; background: rgba(247, 243, 235, 0.65); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--charcoal);">Add Certified Instructor</h3>
              <p style="font-size: 0.75rem; color: var(--slate-muted);">Register trainer profile and assign safety vehicle</p>
            </div>
            <button type="button" id="btn-close-trn" style="background: transparent; border: none; font-size: 1.25rem; cursor: pointer; color: var(--slate-muted);">✕</button>
          </div>

          <form id="form-add-trainer" style="padding: 1.5rem;">
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                Instructor Full Name *
              </label>
              <input type="text" class="mnc-input" name="name" required placeholder="e.g. Suresh Varma" style="width: 100%;" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                  Mobile Phone *
                </label>
                <input type="tel" class="mnc-input" name="phone" required placeholder="+91 98480 55555" style="width: 100%;" />
              </div>
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                  Designation
                </label>
                <input type="text" class="mnc-input" name="role" value="Dual-Control Safety Instructor" style="width: 100%;" />
              </div>
            </div>

            <div style="margin-bottom: 1.25rem;">
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                Assigned Dual-Brake Vehicle
              </label>
              <input type="text" class="mnc-input" name="car" value="Maruti Swift Dual-Brake #AP-04-ED-${Math.floor(1000 + Math.random() * 9000)}" style="width: 100%;" />
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--border-light);">
              <button type="button" class="btn-admin-subtle" id="btn-cancel-trn">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Register Instructor →</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-trn').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-trn').addEventListener('click', close);

    const form = modalRoot.querySelector('#form-add-trainer');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.elements['name'].value.trim();
      const phone = form.elements['phone'].value.trim();
      const role = form.elements['role'].value.trim();
      const car = form.elements['car'].value.trim();

      store.addTrainer({ name, phone, role, car });
      close();
      showToast(`Instructor ${name} registered!`, 'success');
      render();
    });
  }

  // Initial render
  render();
}
