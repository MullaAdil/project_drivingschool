/* ==========================================================================
   GAFOOR DRIVING SCHOOL — ADMIN CONSOLE
   Spacious premium dark layout — detailed sections, proper sizing
   ========================================================================== */

import { store, formatReadableDate, getLocalTodayDate, DEFAULT_BOOKABLE_SLOTS, formatTime24to12, timeToMinutes } from '../store.js';
import { renderBrandLogo } from '../components/brandLogo.js';
import { getSupabaseCredentials, saveSupabaseCredentials, testSupabaseConnection } from '../supabase.js';
import { renderStudentBoxAvatar, renderStudentAvatar } from '../components/studentAvatar.js';
import { openPhotoCropModal } from '../components/photoCropModal.js';
import api from '../api/client.js';
import { renderAdminAccountsView } from './adminAccountsView.js';
import { renderProgressiveCalendar } from '../components/progressiveCalendar.js';
import { openAdminHolidayModal } from '../components/adminHolidayModal.js';
import { formatDateDisplay } from '../utils/academyCalendar.js';
import { openRouteMapModal } from '../components/drivingRouteMap.js';

export function renderAdminView(container, showToast, subService = 'hub', onNavigate) {
  if (subService === 'accounts' || subService === 'user-accounts' || subService === 'trainer-accounts') {
    renderAdminAccountsView(container, showToast, onNavigate);
    return;
  }

  let searchQuery = '';
  let activePackageFilter = 'all';
  let activePayFilter = 'all';
  let activeStageFilter = 'all';
  let activeInstructorFilter = 'all';
  let studentCategoryTab = 'active'; // 'active' | 'inactive'
  let studentViewMode = 'table'; // 'table' | 'cards'
  let lastPulsedTraineeId = null;
  let adminSlotDate = store.getTodayDateStr();
  let adminSlotStatusFilter = 'all';
  let adminSlotTrainerFilter = 'all';
  let adminSlotVehicleFilter = 'all';
  let adminSlotCourseFilter = 'all';
  let adminSlotActiveTab = 'slots'; // 'slots' | 'duty' | 'audit'
  let adminSlotViewMode = 'table'; // 'table' | 'cards'

  function formatSlotDate(dtStr) {
    if (!dtStr) return '';
    const parts = dtStr.split('-');
    if (parts.length < 3) return dtStr;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dObj = new Date(y, m, d);
    return dObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  function formatTime12to24(timeStr) {
    if (!timeStr) return '';
    const clean = timeStr.trim();
    const isPM = clean.toUpperCase().includes('PM');
    const isAM = clean.toUpperCase().includes('AM');
    const [hStr, mStr] = clean.replace(/[APMapm\s]/g, '').split(':');
    let h = parseInt(hStr, 10) || 0;
    const m = String(parseInt(mStr, 10) || 0).padStart(2, '0');
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
  }

  function render() {
    const trainees = store.trainees;
    const trainers  = store.trainers;
    const payments  = store.payments;
    const activeTraineesAll = trainees.filter(t => t.isActive !== false && t.currentDay < 20 && t.status !== 'Completed');
    const inactiveTraineesAll = trainees.filter(t => t.isActive === false || t.currentDay >= 20 || t.status === 'Completed');

    const totalInvoiced    = payments.reduce((a, p) => a + p.amount, 0);
    const totalCollected   = payments.reduce((a, p) => a + p.paid, 0);
    const totalOutstanding = payments.reduce((a, p) => a + p.balance, 0);
    const collectionRate   = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 100;

    const stage1Count = trainees.filter(t => t.currentDay <= 10).length;
    const stage2Count = trainees.filter(t => t.currentDay >= 11 && t.currentDay <= 15).length;
    const stage3Count = trainees.filter(t => t.currentDay >= 16).length;

    const topbar = '';

    const stageNav = `
      <div class="portal-stage-nav" style="padding:1.25rem 2rem; border-bottom:1px solid var(--border-light); background:rgba(255,255,255,0.01); gap:0.5rem;">
        <button type="button" class="p-stage-btn ${activeStageFilter==='all'    ? 'p-stage-active':''}" data-stage-target="all">All Students (${trainees.length})</button>
        <button type="button" class="p-stage-btn ${activeStageFilter==='stage1' ? 'p-stage-active':''}" data-stage-target="stage1">Stage 1 · Basic Driving (${stage1Count})</button>
        <button type="button" class="p-stage-btn ${activeStageFilter==='stage2' ? 'p-stage-active':''}" data-stage-target="stage2">Stage 2 · Intermediate (${stage2Count})</button>
        <button type="button" class="p-stage-btn ${activeStageFilter==='stage3' ? 'p-stage-active':''}" data-stage-target="stage3">Stage 3 · Final Assessment (${stage3Count})</button>
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
                <div class="p-nav-number">Service 05 · Academy Calendar</div>
                <div class="p-nav-title">20-Day Course &amp; Academy Calendar Service</div>
                <div class="p-nav-sub">Master academy calendar — mark holidays, auto-skip Sundays, and view every student's 20-day progressive training timeline.</div>
              </div>
              <button type="button" class="btn-mnc btn-mnc-secondary btn-launch-sub" data-target="calendar" style="white-space:nowrap;">Open Academy Calendar →</button>
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
            <span class="portal-section-title">20-Day Course Progression (3 Stages)</span>
          </div>
          <div class="p-detail-grid">
            <div class="p-detail-cell">
              <div class="p-detail-key">Stage 1 · Basic Driving</div>
              <div class="p-detail-value">${stage1Count} Candidates</div>
              <div class="p-detail-sub">Days 1–10 · Vehicle orientation, clutch control & simple driving</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">Stage 2 · Intermediate Driving</div>
              <div class="p-detail-value">${stage2Count} Candidates</div>
              <div class="p-detail-sub">Days 11–15 · Town traffic, gear shifting & road navigation</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">Stage 3 · Final Assessment & Parking</div>
              <div class="p-detail-value">${stage3Count} Candidates</div>
              <div class="p-detail-sub">Days 16–20 · RTO track manoeuvres, complex parking & final assessment</div>
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
    // STUDENTS DIRECTORY & MANAGEMENT (ACTIVE / INACTIVE)
    // =====================================================
    if (subService === 'trainees') {
      const q = searchQuery.toLowerCase().trim();

      const filteredActive = activeTraineesAll.filter(t => {
        const matchSearch = !q || t.name.toLowerCase().includes(q) || (t.studentCode || t.id).toLowerCase().includes(q) || (t.permitNumber||'').toLowerCase().includes(q) || (t.phone||'').includes(q);
        const matchPkg = activePackageFilter === 'all' ||
          (activePackageFilter === 'without-licence' && (t.package || '').includes('Without Licence')) ||
          (activePackageFilter === 'with-licence' && (t.package || '').includes('With Licence'));
        let matchStage = true;
        if (activeStageFilter === 'stage1') matchStage = t.currentDay <= 10;
        else if (activeStageFilter === 'stage2') matchStage = t.currentDay >= 11 && t.currentDay <= 15;
        else if (activeStageFilter === 'stage3') matchStage = t.currentDay >= 16;
        const matchInst = activeInstructorFilter === 'all' || t.assignedTrainerId === activeInstructorFilter;
        return matchSearch && matchPkg && matchStage && matchInst;
      });

      const filteredInactive = inactiveTraineesAll.filter(t => {
        const matchSearch = !q || t.name.toLowerCase().includes(q) || (t.studentCode || t.id).toLowerCase().includes(q) || (t.permitNumber||'').toLowerCase().includes(q) || (t.phone||'').includes(q);
        const matchPkg = activePackageFilter === 'all' ||
          (activePackageFilter === 'without-licence' && (t.package || '').includes('Without Licence')) ||
          (activePackageFilter === 'with-licence' && (t.package || '').includes('With Licence'));
        const matchInst = activeInstructorFilter === 'all' || t.assignedTrainerId === activeInstructorFilter;
        return matchSearch && matchPkg && matchInst;
      });

      const displayList = studentCategoryTab === 'active' ? filteredActive : filteredInactive;

      html = `
        ${topbar}

        <!-- Top Header Banner -->
        <div class="portal-page-header">
          <div>
            <div style="display:flex; align-items:center; gap:0.65rem; margin-bottom:0.25rem;">
              <h1 class="portal-page-title" style="margin:0;">Students Directory &amp; Course Management</h1>
              <span class="p-badge p-badge-gold" style="font-size:0.75rem;">${trainees.length} Total Enrolled</span>
            </div>
            <p class="portal-page-sub">
              ${studentCategoryTab === 'active' 
                ? `Active Students: Candidates currently undergoing 20-day progressive driving training. ${filteredActive.length} of ${activeTraineesAll.length} shown.`
                : `Inactive Students: Candidates who completed Day 20 or graduated. Complete 20-day history, GPS routes, and notes are preserved. ${filteredInactive.length} of ${inactiveTraineesAll.length} shown.`
              }
            </p>
          </div>
          <div style="display:flex; gap:0.65rem; flex-wrap:wrap; align-items:center;">
            <button type="button" class="p-ghost-btn btn-open-supabase-modal">⚡ Cloud DB (Supabase)</button>
            <button type="button" class="p-ghost-btn" id="btn-export-rto-csv">Download Register (CSV)</button>
            <button type="button" class="btn-mnc btn-mnc-primary" id="btn-goto-add-student">+ Register New Student</button>
          </div>
        </div>

        <!-- 1. TWO STUDENT CATEGORIES TABS BAR (Active vs Inactive) -->
        <div class="student-category-tabs-bar">
          <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
            <button type="button" class="btn-category-tab ${studentCategoryTab === 'active' ? 'active' : ''}" data-cat-tab="active">
              <span class="status-indicator-dot active"></span>
              Active Students
              <span class="tab-badge">${activeTraineesAll.length}</span>
            </button>
            <button type="button" class="btn-category-tab ${studentCategoryTab === 'inactive' ? 'active' : ''}" data-cat-tab="inactive">
              <span class="status-indicator-dot inactive"></span>
              Inactive Students
              <span class="tab-badge">${inactiveTraineesAll.length}</span>
            </button>
          </div>

          <!-- View Mode Toggle & Quick Info -->
          <div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap;">
            <div class="view-mode-toggle">
              <button type="button" class="btn-view-toggle ${studentViewMode === 'table' ? 'active' : ''}" data-view-mode="table" title="Table View">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                Table View
              </button>
              <button type="button" class="btn-view-toggle ${studentViewMode === 'cards' ? 'active' : ''}" data-view-mode="cards" title="Cards View">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                Cards View
              </button>
            </div>
          </div>
        </div>

        <!-- 6. SEARCH AND FILTERING BAR -->
        <div style="padding:1rem 2rem; border-bottom:1px solid var(--border-light); display:flex; gap:0.85rem; align-items:center; flex-wrap:wrap; background:rgba(255,255,255,0.01);">
          <div style="position:relative; width:300px; flex-shrink:0;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--slate-muted)" stroke-width="2.5" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); pointer-events:none;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" class="mnc-input" id="search-trainee" placeholder="Search by name, ID, phone, LLR…" value="${searchQuery}" style="width:100%; padding-left:2.2rem; font-size:0.85rem;" />
          </div>

          ${studentCategoryTab === 'active' ? `
            <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
              <button type="button" class="p-chip-btn ${activeStageFilter==='all' ? 'p-chip-active':''}" data-stage-target="all">All Stages</button>
              <button type="button" class="p-chip-btn ${activeStageFilter==='stage1' ? 'p-chip-active':''}" data-stage-target="stage1">Stage 1 · Basic (Days 1–10)</button>
              <button type="button" class="p-chip-btn ${activeStageFilter==='stage2' ? 'p-chip-active':''}" data-stage-target="stage2">Stage 2 · Intermediate (Days 11–15)</button>
              <button type="button" class="p-chip-btn ${activeStageFilter==='stage3' ? 'p-chip-active':''}" data-stage-target="stage3">Stage 3 · Final Test (Days 16–20)</button>
            </div>
          ` : `
            <div style="display:flex; gap:0.4rem; align-items:center; flex-wrap:wrap;">
              <span class="p-badge p-badge-green" style="font-size:0.75rem;">Course: Completed 🏁</span>
              <span class="p-badge p-badge-dim" style="font-size:0.75rem; color:#ffffff;">Training: 20 / 20 Days</span>
              <span class="p-badge p-badge-gold" style="font-size:0.75rem;">Passed RTO DL Test 🟢</span>
            </div>
          `}

          <!-- Instructor Dropdown Filter -->
          <div style="margin-left:auto; display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
            <select id="select-instructor-filter" class="mnc-select" style="font-size:0.8rem; padding:0.45rem 1.6rem 0.45rem 0.75rem;">
              <option value="all" ${activeInstructorFilter === 'all' ? 'selected' : ''}>All Instructors</option>
              ${trainers.map(tr => `
                <option value="${tr.id}" ${activeInstructorFilter === tr.id ? 'selected' : ''}>👨‍🏫 ${tr.name}</option>
              `).join('')}
            </select>

            <!-- Package Dropdown Filter -->
            <select id="select-package-filter" class="mnc-select" style="font-size:0.8rem; padding:0.45rem 1.6rem 0.45rem 0.75rem;">
              <option value="all" ${activePackageFilter === 'all' ? 'selected' : ''}>All Courses</option>
              <option value="with-licence" ${activePackageFilter === 'with-licence' ? 'selected' : ''}>With Licence (₹11,000)</option>
              <option value="without-licence" ${activePackageFilter === 'without-licence' ? 'selected' : ''}>Without Licence (₹7,000)</option>
            </select>
          </div>
        </div>

        <!-- CONTENT AREA: TABLE VIEW VS CARDS VIEW -->
        ${displayList.length === 0 ? `
          <div style="margin: 2.5rem 2rem; text-align:center; color:var(--slate-muted); padding:3.5rem; font-size:0.9rem; background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:var(--radius-md);">
            No ${studentCategoryTab === 'active' ? 'active' : 'inactive'} students match the search criteria.
          </div>
        ` : studentViewMode === 'table' ? `
          <!-- ========================================== -->
          <!-- 9. ADMIN DASHBOARD LAYOUT: TABLE VIEW      -->
          <!-- ========================================== -->
          <div class="student-data-table-wrap">
            <table class="student-data-table">
              <thead>
                ${studentCategoryTab === 'active' ? `
                  <tr>
                    <th>Student</th>
                    <th>Progress</th>
                    <th>Stage</th>
                    <th>Today's Status</th>
                    <th>Start Date</th>
                    <th>Expected Completion</th>
                    <th>Instructor</th>
                    <th style="text-align:right;">Actions</th>
                  </tr>
                ` : `
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Start Date</th>
                    <th>Completion Date</th>
                    <th>Total Training</th>
                    <th>Instructor</th>
                    <th>Final Assessment</th>
                    <th style="text-align:right;">Actions</th>
                  </tr>
                `}
              </thead>
              <tbody>
                ${displayList.map(t => {
                  const tr = trainers.find(x => x.id === t.assignedTrainerId) || trainers[0];
                  const sched = store.getStudentSchedule(t.id);
                  const p = payments.find(x => x.traineeId === t.id) || { amount: 7500, paid: 7500, balance: 0, status: 'paid' };
                  const pct = Math.min(100, Math.round((t.currentDay / 20) * 100));
                  
                  let stageName = t.currentDay <= 10 ? 'Stage 1 · Basic Driving' :
                                  t.currentDay <= 15 ? 'Stage 2 · Intermediate Driving' : 'Stage 3 · Final Assessment & Parking';

                  const startDateDisplay = sched?.startDate ? formatDateDisplay(sched.startDate) : (t.registeredDate || 'Oct 2, 2026');
                  const expCompDateDisplay = sched?.completionDate ? formatDateDisplay(sched.completionDate) : 'Oct 28, 2026';
                  const actualCompDateDisplay = t.actualCompletionDate ? formatDateDisplay(t.actualCompletionDate) : expCompDateDisplay;

                  if (studentCategoryTab === 'active') {
                    // Active Table Row
                    return `
                      <tr>
                        <!-- Student Column -->
                        <td>
                          <div style="display:flex; align-items:center; gap:0.75rem;">
                            ${renderStudentBoxAvatar(t)}
                            <div>
                              <div class="student-table-name btn-open-dossier" data-trainee-id="${t.id}" title="Click to open full profile">${t.name}</div>
                              <div style="display:flex; align-items:center; gap:0.4rem; margin-top:0.15rem;">
                                <span class="p-badge p-badge-gold" style="font-size:0.62rem; padding:0.1rem 0.35rem;">${t.studentCode || t.id}</span>
                                <span style="font-size:0.75rem; color:#94a3b8;">📞 ${t.phone || '+91 98480 22334'}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <!-- Progress Column -->
                        <td style="min-width:180px;">
                          <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:0.25rem;">
                            <strong style="color:#ffffff;">Day ${t.currentDay} / 20</strong>
                            <span style="color:#38bdf8; font-weight:800;">${pct}%</span>
                          </div>
                          <div style="width:100%; height:6px; background:rgba(255,255,255,0.08); border-radius:999px; overflow:hidden;">
                            <div style="width:${pct}%; height:100%; background:var(--neem-green); border-radius:999px;"></div>
                          </div>
                          <span style="font-size:0.7rem; color:var(--slate-muted); display:block; margin-top:0.2rem;">
                            ${t.currentDay * 8} km logged · 160 km target
                          </span>
                        </td>

                        <!-- Stage Column -->
                        <td>
                          <span class="p-badge p-badge-dim" style="font-size:0.72rem; color:#ffffff; border-color:rgba(255,255,255,0.25);">
                            ${stageName}
                          </span>
                        </td>

                        <!-- Today's Training Status -->
                        <td>
                          <span class="p-badge p-badge-green" style="font-size:0.72rem;">
                            🟢 Scheduled
                          </span>
                        </td>

                        <!-- Course Start Date -->
                        <td style="white-space:nowrap; font-size:0.82rem; color:#e2e8f0;">
                          ${startDateDisplay}
                        </td>

                        <!-- Expected Completion Date -->
                        <td style="white-space:nowrap; font-size:0.82rem; font-weight:700; color:var(--primary-gold);">
                          ${expCompDateDisplay}
                        </td>

                        <!-- Assigned Instructor -->
                        <td>
                          <div style="font-size:0.82rem; font-weight:700; color:#ffffff;">👨‍🏫 ${tr.name}</div>
                          <div style="font-size:0.7rem; color:var(--slate-muted);">${tr.car.split('#')[0].trim()}</div>
                        </td>

                        <!-- Actions Column -->
                        <td style="text-align:right; white-space:nowrap;">
                          <button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm btn-open-dossier" data-trainee-id="${t.id}" style="font-size:0.78rem; padding:0.45rem 0.85rem;">
                            Open Details →
                          </button>
                        </td>
                      </tr>
                    `;
                  } else {
                    // Inactive Table Row (Completed / Alumni)
                    return `
                      <tr>
                        <!-- Student Column -->
                        <td>
                          <div style="display:flex; align-items:center; gap:0.75rem;">
                            ${renderStudentBoxAvatar(t)}
                            <div>
                              <div class="student-table-name btn-open-dossier" data-trainee-id="${t.id}" title="Click to open full profile">${t.name}</div>
                              <div style="display:flex; align-items:center; gap:0.4rem; margin-top:0.15rem;">
                                <span class="p-badge p-badge-gold" style="font-size:0.62rem; padding:0.1rem 0.35rem;">${t.studentCode || t.id}</span>
                                <span style="font-size:0.75rem; color:#94a3b8;">📞 ${t.phone || '+91 98480 22334'}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <!-- Course Column -->
                        <td>
                          <div style="font-weight:700; color:#ffffff; font-size:0.82rem;">${t.package.split('(')[0].trim()}</div>
                          <span class="p-badge p-badge-dim" style="font-size:0.65rem; color:#22c55e; border-color:rgba(34,197,94,0.4); margin-top:0.2rem;">
                            Course: Completed 🏁
                          </span>
                        </td>

                        <!-- Start Date -->
                        <td style="white-space:nowrap; font-size:0.82rem; color:#e2e8f0;">
                          ${startDateDisplay}
                        </td>

                        <!-- Course Completion Date -->
                        <td style="white-space:nowrap; font-size:0.82rem; font-weight:800; color:#22c55e;">
                          ${actualCompDateDisplay}
                        </td>

                        <!-- Total Training Days -->
                        <td style="white-space:nowrap;">
                          <div style="font-weight:800; color:#ffffff; font-size:0.85rem;">20 / 20 Days</div>
                          <span style="font-size:0.7rem; color:var(--slate-muted);">160 km · 100% Attendance</span>
                        </td>

                        <!-- Assigned Instructor -->
                        <td>
                          <div style="font-size:0.82rem; font-weight:700; color:#ffffff;">👨‍🏫 ${tr.name}</div>
                          <div style="font-size:0.7rem; color:var(--slate-muted);">${tr.car.split('#')[0].trim()}</div>
                        </td>

                        <!-- Final Assessment Status -->
                        <td>
                          <span class="p-badge p-badge-green" style="font-size:0.72rem;">
                            Passed RTO DL Test 🟢
                          </span>
                        </td>

                        <!-- Actions Column -->
                        <td style="text-align:right; white-space:nowrap;">
                          <div style="display:inline-flex; gap:0.4rem; align-items:center;">
                            <button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm btn-open-dossier" data-trainee-id="${t.id}" style="font-size:0.78rem; padding:0.45rem 0.85rem;">
                              Open Student Details →
                            </button>
                            <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-view-inactive-routes" data-trainee-id="${t.id}" data-student="${t.name}" title="View Driving Routes on Map" style="font-size:0.75rem; padding:0.45rem 0.65rem;">
                              Routes 🗺️
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <!-- ========================================== -->
          <!-- CARDS VIEW (SEPARATE DOSSIER BOX CARDS)    -->
          <!-- ========================================== -->
          <div class="portal-section" style="padding-top:1.5rem; padding-bottom:1.5rem;">
            <div class="student-box-grid">
              ${displayList.map(t => {
                const tr = trainers.find(x => x.id === t.assignedTrainerId) || trainers[0];
                const sched = store.getStudentSchedule(t.id);
                const p = payments.find(x => x.traineeId === t.id) || { amount: 7500, paid: 7500, balance: 0, status: 'paid' };
                const pct = Math.min(100, Math.round((t.currentDay / 20) * 100));
                
                let stageName = t.currentDay <= 2 ? 'Stage 1 · Basic Driving' :
                                t.currentDay <= 7 ? 'Stage 2 · Traffic Circles' :
                                t.currentDay <= 15 ? 'Stage 3 · Speed & Gears' :
                                t.currentDay <= 19 ? 'Stage 4 · Complex Parking' : 'Stage 5 · Final Assessment';

                const isPulsed = lastPulsedTraineeId === t.id;
                const startDateDisplay = sched?.startDate ? formatDateDisplay(sched.startDate) : (t.registeredDate || 'Oct 2, 2026');
                const expCompDateDisplay = sched?.completionDate ? formatDateDisplay(sched.completionDate) : 'Oct 28, 2026';
                const actualCompDateDisplay = t.actualCompletionDate ? formatDateDisplay(t.actualCompletionDate) : expCompDateDisplay;

                return `
                  <div class="student-box-card ${isPulsed ? 'p-row-pulsed' : ''}">
                    <!-- Card Header -->
                    <div>
                      <div class="student-box-header">
                        <div class="student-box-identity">
                          ${renderStudentBoxAvatar(t)}
                          <div style="min-width:0;">
                            <div class="student-box-name btn-open-dossier" data-trainee-id="${t.id}" title="Click to view full student profile">${t.name}</div>
                            <div class="student-box-meta-line">
                              <span class="p-badge p-badge-gold" style="font-size:0.62rem; padding:0.15rem 0.4rem;">${t.studentCode || t.id}</span>
                              <span style="font-family:var(--font-mono); color:var(--primary-cyan); font-size:0.72rem;">${t.permitNumber || 'AP004/LLR/2026/8941'}</span>
                            </div>
                          </div>
                        </div>

                        ${studentCategoryTab === 'active' ? `
                          <span class="p-badge ${p.balance > 0 ? 'p-badge-gold' : 'p-badge-green'}" style="font-size:0.65rem; white-space:nowrap;">
                            ${p.balance > 0 ? `₹${p.balance.toLocaleString('en-IN')} Due` : 'Fee Cleared ✓'}
                          </span>
                        ` : `
                          <span class="p-badge p-badge-green" style="font-size:0.65rem; white-space:nowrap;">
                            Course: Completed 🏁
                          </span>
                        `}
                      </div>

                      <div style="display:flex; align-items:center; gap:0.4rem; margin-top:0.75rem; flex-wrap:wrap;">
                        <span class="p-badge p-badge-dim" style="font-size:0.65rem; color:#ffffff; border-color:rgba(255,255,255,0.2);">
                          ${studentCategoryTab === 'active' ? stageName : 'Passed RTO DL Test 🟢'}
                        </span>
                        <span style="font-size:0.72rem; color:var(--slate-muted);">•</span>
                        <span style="font-size:0.75rem; color:var(--slate-muted); font-weight:600;">${t.package.split('(')[0].trim()}</span>
                      </div>
                    </div>

                    <!-- Card Body -->
                    <div class="student-box-body">
                      <div class="student-box-progress-wrap">
                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem;">
                          <span style="font-weight:700; color:#ffffff;">
                            ${studentCategoryTab === 'active' ? 'Course Progress' : 'Course Status: Completed'}
                          </span>
                          <span style="font-weight:800; color:#ffffff; font-family:var(--font-mono);">
                            ${studentCategoryTab === 'active' ? `Day ${t.currentDay} / 20 (${pct}%)` : '20 / 20 (100%)'}
                          </span>
                        </div>
                        <div class="student-box-progress-bar">
                          <div class="student-box-progress-fill" style="width:${studentCategoryTab === 'active' ? pct : 100}%;"></div>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--slate-muted);">
                          <span>${studentCategoryTab === 'active' ? `Start: ${startDateDisplay}` : `Start: ${startDateDisplay}`}</span>
                          <span style="color:${studentCategoryTab === 'active' ? 'var(--primary-gold)' : '#22c55e'}; font-weight:700;">
                            ${studentCategoryTab === 'active' ? `Expected: ${expCompDateDisplay}` : `Completed: ${actualCompDateDisplay}`}
                          </span>
                        </div>
                      </div>

                      <div class="student-box-info-grid">
                        <div class="student-box-info-item">
                          <span class="student-box-info-label">Instructor &amp; Car</span>
                          <span class="student-box-info-val" title="${tr.name}">👨‍🏫 ${tr.name}</span>
                          <span style="font-size:0.7rem; color:var(--slate-muted);">${tr.car.split(' ')[0]} Dual-Ctrl</span>
                        </div>
                        <div class="student-box-info-item">
                          <span class="student-box-info-label">Contact &amp; Location</span>
                          <span class="student-box-info-val">📞 ${t.phone || '+91 98480 22334'}</span>
                          <span style="font-size:0.7rem; color:var(--slate-muted);">${t.address ? t.address.split(',')[0] : 'Pulivendula'}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Card Footer Actions -->
                    <div class="student-box-footer">
                      <button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm btn-open-dossier" data-trainee-id="${t.id}" style="font-size:0.78rem; padding:0.45rem 0.85rem;">
                        Open Student Details →
                      </button>
                      
                      <div style="display:flex; gap:0.4rem; align-items:center;">
                        ${studentCategoryTab === 'active' ? `
                          <span style="font-size:0.72rem; color:var(--slate-muted);">✓ Instructor logs rides</span>
                        ` : `
                          <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-view-inactive-routes" data-trainee-id="${t.id}" data-student="${t.name}" title="Inspect Day 20 Route Map" style="font-size:0.75rem; padding:0.45rem 0.65rem;">
                            Routes 🗺️
                          </button>
                        `}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `}
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

    // =====================================================
    // DRIVING SLOT MANAGEMENT & DAILY DISPATCH
    // Admin full slot management:
    // - Create, edit, delete, activate, deactivate, cancel slots
    // - Assign instructors & vehicles
    // - Dynamic capacity = Available Trainers × 2
    // - Detailed trainer & learner allocation (max 2 learners per trainer)
    // - Move learners & cancel bookings
    // - Instructor duty & audit logs
    // =====================================================
    if (subService === 'slots') {
      const allSlotsOnDate = store.getSlotsForDate(adminSlotDate);
      const totalDayCapacity = allSlotsOnDate.reduce((acc, s) => acc + s.totalCapacity, 0);
      const totalBookedDay = allSlotsOnDate.reduce((acc, s) => acc + s.bookedCount, 0);
      const totalAvailableDay = allSlotsOnDate.reduce((acc, s) => acc + s.availableSeats, 0);
      const fullSlotsCount = allSlotsOnDate.filter(s => s.calculatedStatus === 'FULL').length;
      const cancelledSlotsCount = allSlotsOnDate.filter(s => s.status === 'CANCELLED').length;
      const onDutyTrainers = store.trainers.filter(tr => {
        if (store.trainerAvailability[adminSlotDate] && store.trainerAvailability[adminSlotDate][tr.id] === false) return false;
        return true;
      });

      // Filter slots by status, trainer, vehicle, and course
      let filteredSlots = allSlotsOnDate.filter(slot => {
        const sStatus = (slot.calculatedStatus || slot.status || '').toLowerCase();
        const fStatus = adminSlotStatusFilter.toLowerCase();
        const matchStatus = adminSlotStatusFilter === 'all' || 
          sStatus === fStatus || 
          (fStatus === 'closed' && sStatus === 'inactive') ||
          (fStatus === 'available' && sStatus === 'almost full');
        const matchTrainer = adminSlotTrainerFilter === 'all' || 
          (slot.assignedTrainerId === adminSlotTrainerFilter) ||
          slot.trainerAllocations.some(a => a.trainerId === adminSlotTrainerFilter);
        const matchVehicle = adminSlotVehicleFilter === 'all' || 
          (slot.vehicleOverride && slot.vehicleOverride.toLowerCase().includes(adminSlotVehicleFilter.toLowerCase())) ||
          slot.trainerAllocations.some(a => a.vehicle && a.vehicle.toLowerCase().includes(adminSlotVehicleFilter.toLowerCase()));
        const matchCourse = adminSlotCourseFilter === 'all' || 
          (slot.course && slot.course.toLowerCase().includes(adminSlotCourseFilter.toLowerCase())) || 
          slot.bookings.some(b => b.course && b.course.toLowerCase().includes(adminSlotCourseFilter.toLowerCase()));
        const q = searchQuery.toLowerCase().trim();
        const matchQuery = !q || 
          slot.timeDisplay.toLowerCase().includes(q) || 
          slot.bookings.some(b => b.traineeName.toLowerCase().includes(q) || b.traineeId.toLowerCase().includes(q) || (b.vehicle && b.vehicle.toLowerCase().includes(q)));
        return matchStatus && matchTrainer && matchVehicle && matchCourse && matchQuery;
      });

      // Quick dates
      const quickDates = [];
      const baseDt = new Date();
      for (let i = 0; i < 4; i++) {
        const d = new Date(baseDt);
        d.setDate(d.getDate() + i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dtStr = `${y}-${m}-${day}`;
        const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
        quickDates.push({ dateStr: dtStr, label });
      }

      html = `
        ${topbar}

        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">Driving Slot Management</h1>
            <p class="portal-page-sub">Configure driving slots, monitor real-time trainer capacity (Available Trainers × 2), and manage candidate reservations.</p>
          </div>
          <div style="display:flex; gap:0.65rem; align-items:center; flex-wrap:wrap;">
            <button type="button" class="btn-mnc btn-mnc-primary" id="btn-admin-add-slot" data-action="open-add-slot" onclick="window.openAddSlotModal ? window.openAddSlotModal() : null" style="font-weight:800; cursor:pointer;">+ Add Slot</button>
            <button type="button" class="p-ghost-btn btn-admin-tab-switch" data-tab="duty">👨‍🏫 Instructor Duty (${onDutyTrainers.length}/${trainers.length})</button>
            <button type="button" class="p-ghost-btn btn-admin-tab-switch" data-tab="audit">📜 Booking Audit Trail</button>
          </div>
        </div>

        <!-- STATS STRIP -->
        <div class="portal-stats-strip">
          <div class="portal-stat">
            <span class="portal-stat-value">${allSlotsOnDate.length}</span>
            <span class="portal-stat-label">Daily Slots</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${totalDayCapacity}</span>
            <span class="portal-stat-label">Total Day Capacity</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">${totalBookedDay}</span>
            <span class="portal-stat-label">Active Bookings</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:${totalAvailableDay > 0 ? '#ffffff' : '#f87171'};">${totalAvailableDay}</span>
            <span class="portal-stat-label">Available Seats</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:#f59e0b;">${fullSlotsCount}</span>
            <span class="portal-stat-label">Full Slots</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">${onDutyTrainers.length} / ${trainers.length}</span>
            <span class="portal-stat-label">Instructors on Duty</span>
          </div>
        </div>

        <!-- SUB-TABS -->
        <div style="display:flex; gap:0.5rem; padding:0 2rem; border-bottom:1px solid var(--border-light); background:rgba(255,255,255,0.01);">
          <button type="button" class="p-tab-btn ${adminSlotActiveTab === 'slots' ? 'p-tab-active' : ''} btn-admin-tab-switch" data-tab="slots" style="padding:0.75rem 1.25rem; font-weight:700; font-size:0.875rem; background:transparent; border:none; color:${adminSlotActiveTab==='slots'?'#ffffff':'var(--slate-muted)'}; border-bottom:2px solid ${adminSlotActiveTab==='slots'?'#ffffff':'transparent'}; cursor:pointer;">
            📅 Daily Slots &amp; Allocations (${allSlotsOnDate.length})
          </button>
          <button type="button" class="p-tab-btn ${adminSlotActiveTab === 'duty' ? 'p-tab-active' : ''} btn-admin-tab-switch" data-tab="duty" style="padding:0.75rem 1.25rem; font-weight:700; font-size:0.875rem; background:transparent; border:none; color:${adminSlotActiveTab==='duty'?'#ffffff':'var(--slate-muted)'}; border-bottom:2px solid ${adminSlotActiveTab==='duty'?'#ffffff':'transparent'}; cursor:pointer;">
            👨‍🏫 Instructor Duty &amp; Dynamic Capacity
          </button>
          <button type="button" class="p-tab-btn ${adminSlotActiveTab === 'audit' ? 'p-tab-active' : ''} btn-admin-tab-switch" data-tab="audit" style="padding:0.75rem 1.25rem; font-weight:700; font-size:0.875rem; background:transparent; border:none; color:${adminSlotActiveTab==='audit'?'#ffffff':'var(--slate-muted)'}; border-bottom:2px solid ${adminSlotActiveTab==='audit'?'#ffffff':'transparent'}; cursor:pointer;">
            📜 Booking History &amp; Audit Trail (${store.slotAuditLogs.length})
          </button>
        </div>

        ${adminSlotActiveTab === 'slots' ? `
          <!-- DATE & FILTER BAR -->
          <div class="slot-date-nav">
            <span style="font-size:0.875rem; font-weight:800; color:#ffffff; margin-right:0.35rem;">Training Date:</span>
            ${quickDates.map(qd => `
              <button type="button" class="slot-quick-date-btn ${adminSlotDate === qd.dateStr ? 'active' : ''}" data-admin-date="${qd.dateStr}">
                📅 ${qd.label}
              </button>
            `).join('')}
            <div style="display:flex; align-items:center; gap:0.45rem;">
              <input type="date" class="mnc-input" id="inp-admin-slot-date" value="${adminSlotDate}" style="padding:0.4rem 0.65rem; font-size:0.8125rem; width:150px;" />
            </div>

            <!-- FILTERS -->
            <div style="display:flex; align-items:center; gap:0.65rem; margin-left:auto; flex-wrap:wrap;">
              <select class="mnc-select" id="sel-admin-slot-status" style="padding:0.4rem 0.65rem; font-size:0.8125rem;">
                <option value="all" ${adminSlotStatusFilter==='all'?'selected':''}>All Statuses</option>
                <option value="Available" ${adminSlotStatusFilter.toLowerCase()==='available'?'selected':''}>Available</option>
                <option value="Full" ${adminSlotStatusFilter.toLowerCase()==='full'?'selected':''}>Full</option>
                <option value="Maintenance" ${adminSlotStatusFilter.toLowerCase()==='maintenance'?'selected':''}>Maintenance</option>
                <option value="Closed" ${adminSlotStatusFilter.toLowerCase()==='closed'?'selected':''}>Closed</option>
                <option value="Cancelled" ${adminSlotStatusFilter.toLowerCase()==='cancelled'?'selected':''}>Cancelled</option>
              </select>

              <select class="mnc-select" id="sel-admin-slot-trainer" style="padding:0.4rem 0.65rem; font-size:0.8125rem;">
                <option value="all" ${adminSlotTrainerFilter==='all'?'selected':''}>All Instructors</option>
                ${trainers.map(tr => `
                  <option value="${tr.id}" ${adminSlotTrainerFilter===tr.id?'selected':''}>${tr.name}</option>
                `).join('')}
              </select>

              <select class="mnc-select" id="sel-admin-slot-vehicle" style="padding:0.4rem 0.65rem; font-size:0.8125rem;">
                <option value="all" ${adminSlotVehicleFilter==='all'?'selected':''}>All Vehicles</option>
                <option value="Swift" ${adminSlotVehicleFilter==='Swift'?'selected':''}>Swift Dual-Brake</option>
                <option value="Dzire" ${adminSlotVehicleFilter==='Dzire'?'selected':''}>Dzire Dual-Brake</option>
                <option value="Baleno" ${adminSlotVehicleFilter==='Baleno'?'selected':''}>Baleno Dual-Brake</option>
                <option value="i20" ${adminSlotVehicleFilter==='i20'?'selected':''}>i20 Dual-Control</option>
              </select>

              <select class="mnc-select" id="sel-admin-slot-course" style="padding:0.4rem 0.65rem; font-size:0.8125rem;">
                <option value="all" ${adminSlotCourseFilter==='all'?'selected':''}>All Courses</option>
                <option value="Comprehensive" ${adminSlotCourseFilter==='Comprehensive'?'selected':''}>20-Day Comprehensive</option>
                <option value="8-Track" ${adminSlotCourseFilter==='8-Track'?'selected':''}>RTO 8-Track Drills</option>
                <option value="Refresher" ${adminSlotCourseFilter==='Refresher'?'selected':''}>VIP Express Refresher</option>
              </select>

              <input type="text" class="mnc-input" id="inp-admin-slot-search" placeholder="Search learner, vehicle…" value="${searchQuery}" style="padding:0.4rem 0.65rem; font-size:0.8125rem; width:170px;" />
            </div>
          </div>

          <!-- SLOTS LIST & TABLE VIEW -->
          <div class="portal-section">
            <div class="portal-section-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
              <div>
                <span class="portal-section-title">Driving Slots — ${formatReadableDate(adminSlotDate)}</span>
                <span class="portal-section-meta">${filteredSlots.length} slots matching filter</span>
              </div>
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <button type="button" class="btn-mnc ${adminSlotViewMode === 'table' ? 'btn-mnc-primary' : 'btn-mnc-secondary'} btn-mnc-sm btn-admin-view-mode" data-mode="table" style="font-size:0.75rem; padding:0.35rem 0.75rem;">
                  📋 Table View
                </button>
                <button type="button" class="btn-mnc ${adminSlotViewMode === 'cards' ? 'btn-mnc-primary' : 'btn-mnc-secondary'} btn-mnc-sm btn-admin-view-mode" data-mode="cards" style="font-size:0.75rem; padding:0.35rem 0.75rem;">
                  🗂 Detailed Cards
                </button>
              </div>
            </div>

            ${adminSlotViewMode === 'table' ? `
              <!-- DEDICATED DRIVING SLOTS TABLE (ADMIN EXCLUSIVE) -->
              <div class="p-table-wrap" style="background:rgba(18,20,26,0.85); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-md); overflow:hidden;">
                <table class="p-table" style="margin:0;">
                  <thead>
                    <tr style="background:rgba(255,255,255,0.03); border-bottom:1px solid rgba(255,255,255,0.08);">
                      <th style="padding:1rem 1.25rem; font-weight:800; color:var(--slate-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em;">Date</th>
                      <th style="padding:1rem 1.25rem; font-weight:800; color:var(--slate-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em;">Time</th>
                      <th style="padding:1rem 1.25rem; font-weight:800; color:var(--slate-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; text-align:center;">Capacity</th>
                      <th style="padding:1rem 1.25rem; font-weight:800; color:var(--slate-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; text-align:center;">Booked</th>
                      <th style="padding:1rem 1.25rem; font-weight:800; color:var(--slate-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em;">Trainer / Instructor</th>
                      <th style="padding:1rem 1.25rem; font-weight:800; color:var(--slate-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em;">Status</th>
                      <th style="padding:1rem 1.25rem; font-weight:800; color:var(--slate-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; text-align:right;">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredSlots.length === 0 ? `
                      <tr>
                        <td colspan="7" style="padding:2.5rem 1rem; text-align:center; color:var(--slate-muted);">
                          No driving slots found matching filters. Click <strong style="cursor:pointer; color:var(--primary-gold);" id="btn-empty-add-slot" data-action="open-add-slot" onclick="window.openAddSlotModal ? window.openAddSlotModal() : null">+ Add Slot</strong> to create one.
                        </td>
                      </tr>
                    ` : filteredSlots.map(slot => {
                      const sStat = (slot.calculatedStatus || slot.status || '').toLowerCase();
                      const isMaintenance = sStat === 'maintenance';
                      const isClosed = sStat === 'closed' || sStat === 'inactive';
                      const isCancelled = sStat === 'cancelled';
                      const isCompleted = sStat === 'completed';
                      const isFull = sStat === 'full';
                      const isAlmost = sStat === 'almost full';

                      const statusPillClass = isCompleted ? 'status-pill-completed' :
                                              isMaintenance ? 'status-pill-maintenance' :
                                              isClosed ? 'status-pill-closed' :
                                              isCancelled ? 'status-pill-cancelled' :
                                              isFull ? 'status-pill-full' :
                                              isAlmost ? 'status-pill-almost' : 'status-pill-available';

                      const shortDate = formatSlotDate(slot.date);
                      const displayDate = slot.date ? slot.date.split('-').reverse().join('-') : '';

                      const assignedTrainer = store.trainers.find(t => t.id === slot.assignedTrainerId || t.id === slot.trainerId);
                      const trainerDisplay = assignedTrainer
                        ? assignedTrainer.name
                        : (slot.trainerName || (slot.trainerAllocations && slot.trainerAllocations.length > 0
                            ? slot.trainerAllocations.map(a => a.trainerName).join(', ')
                            : 'All Available Instructors'));
                      const vehicleDisplay = slot.vehicleOverride || slot.vehicle || (assignedTrainer ? assignedTrainer.car : '');

                      return `
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.15s ease;">
                          <td style="padding:1rem 1.25rem; font-weight:700; color:#ffffff; white-space:nowrap;">
                            ${displayDate || slot.date}
                            <div style="font-size:0.7rem; color:var(--slate-muted); font-weight:normal;">${shortDate}</div>
                          </td>
                          <td style="padding:1rem 1.25rem; font-family:var(--font-mono); font-weight:700; color:#ffffff; white-space:nowrap;">
                            ${slot.name ? `<div style="font-family:var(--font-sans); font-size:0.875rem; font-weight:700; color:#ffffff; margin-bottom:0.2rem;">${slot.name}</div>` : ''}
                            <div>
                              ${slot.timeDisplay || `${slot.startTime} – ${slot.endTime}`}
                              ${slot.isDefault ? '' : '<span class="p-badge p-badge-gold" style="margin-left:0.4rem; font-size:0.6rem;">Custom</span>'}
                            </div>
                            ${slot.location ? `<div style="font-family:var(--font-sans); font-size:0.72rem; color:var(--slate-muted); font-weight:normal; margin-top:0.15rem;">📍 ${slot.location}</div>` : ''}
                          </td>
                          <td style="padding:1rem 1.25rem; text-align:center; font-family:var(--font-mono); font-weight:800; color:#ffffff;">
                            ${slot.totalCapacity}
                          </td>
                          <td style="padding:1rem 1.25rem; text-align:center;">
                            <span style="font-family:var(--font-mono); font-weight:800; color:${isCompleted ? '#94a3b8' : isFull ? '#f87171' : isAlmost ? '#fbbf24' : '#4ade80'};">
                              ${slot.bookedCount}/${slot.totalCapacity}
                            </span>
                            <div style="font-size:0.7rem; color:var(--slate-muted);">${isCompleted ? 'Completed' : `${slot.availableSeats} free`}</div>
                          </td>
                          <td style="padding:1rem 1.25rem; white-space:nowrap;">
                            <div style="font-weight:700; color:#ffffff;">${trainerDisplay}</div>
                            ${vehicleDisplay ? `<div style="font-size:0.72rem; color:var(--slate-muted); margin-top:0.15rem;">🚗 ${vehicleDisplay}</div>` : ''}
                          </td>
                          <td style="padding:1rem 1.25rem; white-space:nowrap;">
                            <span class="slot-status-pill ${statusPillClass}">
                              ${(slot.calculatedStatus || slot.status || 'Available').toUpperCase()}
                            </span>
                          </td>
                          <td style="padding:1rem 1.25rem; text-align:right; white-space:nowrap;">
                            <div style="display:inline-flex; align-items:center; gap:0.5rem; justify-content:flex-end;">
                              <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-admin-edit-slot" data-slot-id="${slot.id}" style="padding:0.35rem 0.75rem; font-size:0.75rem;" title="Edit date, time, capacity, instructor, status">
                                Edit
                              </button>
                              <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-admin-delete-slot" data-slot-id="${slot.id}" style="padding:0.35rem 0.75rem; font-size:0.75rem; color:#f87171; border-color:rgba(239,68,68,0.3);" title="Permanently delete slot">
                                Delete
                              </button>
                              ${!isCancelled && !isClosed && !isMaintenance && !isCompleted && slot.availableSeats > 0 ? `
                                <button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm btn-admin-quick-book" data-slot-id="${slot.id}" data-start-time="${slot.startTime}" data-end-time="${slot.endTime}" data-time-display="${slot.timeDisplay}" style="padding:0.35rem 0.75rem; font-size:0.75rem;" title="Manually assign student to slot">
                                  + Assign
                                </button>
                              ` : ''}
                            </div>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <!-- DETAILED DISPATCH CARDS -->
              <div style="display:flex; flex-direction:column; gap:1.25rem;">
                ${filteredSlots.map(slot => {
                  const sStat = (slot.calculatedStatus || slot.status || '').toLowerCase();
                  const isMaintenance = sStat === 'maintenance';
                  const isClosed = sStat === 'closed' || sStat === 'inactive';
                  const isCancelled = sStat === 'cancelled';
                  const isFull = sStat === 'full';
                  const isAlmost = sStat === 'almost full';

                  const statusPillClass = isMaintenance ? 'status-pill-maintenance' :
                                          isClosed ? 'status-pill-closed' :
                                          isCancelled ? 'status-pill-cancelled' :
                                          isFull ? 'status-pill-full' :
                                          isAlmost ? 'status-pill-almost' : 'status-pill-available';

                  return `
                    <div style="background:rgba(18,20,26,0.85); border:1px solid ${isCancelled ? 'rgba(239,68,68,0.3)' : (isClosed || isMaintenance) ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.1)'}; border-radius:var(--radius-md); padding:1.4rem;">
                      <!-- SLOT TOP HEADER -->
                      <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid rgba(255,255,255,0.07); padding-bottom:0.95rem; margin-bottom:1rem; flex-wrap:wrap; gap:0.75rem;">
                        <div>
                          <div style="display:flex; align-items:center; gap:0.65rem;">
                            <div style="font-family:var(--font-mono); font-size:1.2rem; font-weight:800; color:#ffffff;">
                              ${slot.name ? `<div style="font-family:var(--font-sans); font-size:1rem; font-weight:700; color:var(--primary-gold); margin-bottom:0.25rem;">${slot.name}</div>` : ''}
                              ${slot.timeDisplay}
                            </div>
                            <span class="slot-status-pill ${statusPillClass}">
                              ${slot.calculatedStatus}
                            </span>
                            ${slot.isDefault ? '<span class="p-badge p-badge-dim" style="font-size:0.65rem;">Standard Slot</span>' : '<span class="p-badge p-badge-gold" style="font-size:0.65rem;">Custom Slot</span>'}
                          </div>
                          <div style="font-size:0.75rem; color:var(--slate-muted); margin-top:0.25rem;">
                            Date: <strong>${formatSlotDate(slot.date)}</strong> (${slot.date}) · Capacity: <strong style="color:#ffffff;">${slot.totalCapacity} Seats</strong> ${slot.capacity ? '(Admin Custom)' : '(Trainers × 2)'}
                            ${slot.location ? ` · 📍 <strong>${slot.location}</strong>` : ''}
                          </div>
                        </div>

                        <!-- Capacity Pill & Slot Actions -->
                        <div style="display:flex; align-items:center; gap:0.65rem; flex-wrap:wrap;">
                          <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-sm); padding:0.4rem 0.75rem; text-align:right;">
                            <span style="font-size:0.875rem; font-weight:800; font-family:var(--font-mono); color:${isFull ? '#f87171' : isAlmost ? '#fbbf24' : '#4ade80'};">
                              ${slot.bookedCount} / ${slot.totalCapacity} Booked
                            </span>
                            <div style="font-size:0.7rem; color:var(--slate-muted);">${slot.availableSeats} seat${slot.availableSeats !== 1 ? 's' : ''} available</div>
                          </div>

                          ${!isCancelled && !isClosed && !isMaintenance && slot.availableSeats > 0 ? `
                            <button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm btn-admin-quick-book" data-slot-id="${slot.id}" data-start-time="${slot.startTime}" data-end-time="${slot.endTime}" data-time-display="${slot.timeDisplay}" style="font-size:0.75rem; padding:0.45rem 0.85rem;">
                              + Assign Student
                            </button>
                          ` : ''}

                          <button type="button" class="p-ghost-btn btn-admin-edit-slot" data-slot-id="${slot.id}" style="font-size:0.75rem; padding:0.45rem 0.75rem;">
                            Edit
                          </button>

                          <button type="button" class="p-ghost-btn btn-admin-delete-slot" data-slot-id="${slot.id}" style="font-size:0.75rem; padding:0.45rem 0.75rem; color:#f87171; border-color:rgba(239,68,68,0.3);">
                            Delete
                          </button>
                        </div>
                      </div>

                      <!-- INSTRUCTOR & LEARNER ALLOCATION BREAKDOWN (MAX 2 LEARNERS PER INSTRUCTOR) -->
                      <div style="margin-top:0.75rem;">
                        <div style="font-size:0.75rem; font-weight:800; color:var(--slate-muted); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:0.75rem;">
                          Instructor Allocations (Formula: 1 Trainer = Max 2 Learners)
                        </div>

                        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:1rem;">
                          ${slot.trainerAllocations.map(alloc => `
                            <div style="background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.06); border-radius:var(--radius-sm); padding:1rem;">
                              <!-- Trainer Header -->
                              <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:0.5rem; margin-bottom:0.65rem;">
                                <div>
                                  <strong style="font-size:0.875rem; color:#ffffff;">${alloc.trainerName}</strong>
                                  <div style="font-size:0.72rem; color:var(--slate-muted);">${alloc.vehicle}</div>
                                </div>
                                <span style="font-size:0.75rem; font-family:var(--font-mono); font-weight:800; color:${alloc.status === 'FULL' ? '#f87171' : 'var(--neem-green)'};">
                                  ${alloc.booked} / ${alloc.capacity} ${alloc.status}
                                </span>
                              </div>

                              <!-- Assigned Learners -->
                              <div style="display:flex; flex-direction:column; gap:0.5rem;">
                                ${alloc.bookings.length === 0 ? `
                                  <div style="font-size:0.75rem; color:var(--slate-muted); padding:0.45rem; background:rgba(255,255,255,0.015); border-radius:4px; text-align:center;">
                                    No learners assigned yet (2 open seats)
                                  </div>
                                ` : alloc.bookings.map((bk, i) => `
                                  <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:0.45rem 0.65rem;">
                                    <div>
                                      <div style="font-size:0.8125rem; font-weight:700; color:#ffffff;">
                                        ${i + 1}. ${bk.traineeName} <span style="font-size:0.7rem; color:var(--slate-muted);">(${bk.traineeId})</span>
                                      </div>
                                      <div style="font-size:0.68rem; color:var(--slate-body);">${bk.course}</div>
                                    </div>
                                    <div style="display:flex; gap:0.35rem;">
                                      <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-admin-move-learner" data-booking-id="${bk.id}" style="font-size:0.68rem; padding:0.25rem 0.5rem;" title="Move to another slot">
                                        Move ⇄
                                      </button>
                                      <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-admin-cancel-booking" data-booking-id="${bk.id}" style="font-size:0.68rem; padding:0.25rem 0.5rem; color:#f87171; border-color:rgba(239,68,68,0.3);" title="Cancel booking">
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                `).join('')}

                                ${alloc.availableSeats === 1 ? `
                                  <div style="font-size:0.72rem; color:var(--slate-muted); padding:0.35rem 0.65rem; border:1px dashed rgba(255,255,255,0.1); border-radius:4px; text-align:center;">
                                    + 1 Open Seat for this Instructor
                                  </div>
                                ` : ''}
                              </div>
                            </div>
                          `).join('')}
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
          </div>
        ` : adminSlotActiveTab === 'duty' ? `
          <!-- INSTRUCTOR DUTY & DYNAMIC CAPACITY TAB -->
          <div class="portal-section">
            <div class="portal-section-header">
              <span class="portal-section-title">Instructor Duty &amp; Availability for ${formatReadableDate(adminSlotDate)}</span>
              <span class="portal-section-meta">Changes automatically update slot capacities (Trainers × 2)</span>
            </div>

            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:var(--radius-sm); padding:1rem 1.25rem; margin-bottom:1.5rem; font-size:0.8125rem; color:var(--slate-body); line-height:1.5;">
              💡 <strong>Dynamic Capacity Rule:</strong> Each available instructor handles a maximum of 2 learners per slot. 
              If 4 instructors are available, capacity = <strong>8 learners</strong>. 
              If 1 instructor takes leave, capacity automatically drops to <strong>6 learners</strong>. No manual capacity adjustments needed.
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:1.25rem;">
              ${trainers.map(tr => {
                const isOffDay = store.trainerAvailability[adminSlotDate] && store.trainerAvailability[adminSlotDate][tr.id] === false;
                const activeBookingsOnDate = store.slotBookings.filter(b => b.trainerId === tr.id && b.date === adminSlotDate && b.status === 'CONFIRMED').length;

                return `
                  <div style="background:rgba(18,20,26,0.85); border:1px solid rgba(255,255,255,0.1); border-radius:var(--radius-md); padding:1.25rem;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.85rem;">
                      <div>
                        <div style="font-size:1.05rem; font-weight:800; color:#ffffff;">${tr.name}</div>
                        <div style="font-size:0.75rem; color:var(--slate-muted);">${tr.role}</div>
                        <div style="font-size:0.75rem; color:var(--slate-body); margin-top:0.25rem;">🚗 ${tr.car}</div>
                      </div>
                      <span class="p-badge ${isOffDay ? 'p-badge-dim' : 'p-badge-green'}">
                        ${isOffDay ? 'Off Duty / Leave' : 'On Duty ✓'}
                      </span>
                    </div>

                    <div style="font-size:0.8125rem; color:var(--slate-body); margin-bottom:1rem;">
                      Active Candidate Bookings Today: <strong>${activeBookingsOnDate}</strong>
                    </div>

                    <div style="display:flex; gap:0.5rem;">
                      <button type="button" class="btn-mnc ${isOffDay ? 'btn-mnc-primary' : 'btn-mnc-secondary'} btn-mnc-sm btn-admin-toggle-trainer-duty" data-trainer-id="${tr.id}" data-date="${adminSlotDate}" data-available="${isOffDay ? 'true' : 'false'}" style="width:100%;">
                        ${isOffDay ? 'Mark On Duty' : 'Mark Off Duty (Leave)'}
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : `
          <!-- BOOKING HISTORY & AUDIT TRAIL TAB -->
          <div class="portal-section">
            <div class="portal-section-header">
              <span class="portal-section-title">Driving Slot Audit Trail &amp; History Log</span>
              <span class="portal-section-meta">${store.slotAuditLogs.length} logged events</span>
            </div>

            <div class="p-table-wrap">
              <table class="p-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Performed By</th>
                    <th>Event Details</th>
                  </tr>
                </thead>
                <tbody>
                  ${store.slotAuditLogs.slice(0, 50).map(log => `
                    <tr>
                      <td class="p-td-mono" style="font-size:0.78rem; white-space:nowrap;">
                        ${log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN') : 'Recent'}
                      </td>
                      <td>
                        <span class="p-badge ${log.action.includes('CANCEL') ? '' : log.action.includes('MOVE') ? 'p-badge-gold' : 'p-badge-green'}" style="${log.action.includes('CANCEL') ? 'background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.3);' : ''}">
                          ${log.action}
                        </span>
                      </td>
                      <td style="font-weight:700; color:#ffffff;">${log.performedBy}</td>
                      <td class="p-td-muted" style="font-size:0.825rem;">${log.details}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `}
      `;
    }

    // =====================================================
    // ACADEMY CALENDAR & 20-DAY PROGRESSIVE TRAINING SERVICE
    // =====================================================
    // ACADEMY CALENDAR — HOLIDAY SCHEDULER SERVICE
    // =====================================================
    if (subService === 'calendar' || subService === 'calendar-manager') {
      const holidays = store.getHolidays();
      const todayStr = new Date().toISOString().split('T')[0];

      html = `
        ${topbar}

        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">Academy Calendar — Holiday Scheduler</h1>
            <p class="portal-page-sub">Schedule academy holidays, festival closures, or emergency non-training days. When marked, every active student's 20-day course automatically recalculates and shifts forward by 1 valid training day.</p>
          </div>
          <div style="display:flex; gap:0.65rem; align-items:center; flex-wrap:wrap;">
            <button type="button" class="btn-mnc btn-mnc-primary" id="btn-admin-mark-today-holiday" style="display:flex; align-items:center; gap:0.4rem;">
              🌴 Mark Today as Holiday
            </button>
            <button type="button" class="btn-mnc btn-mnc-secondary btn-launch-sub" data-target="trainees">
              View Students Directory →
            </button>
          </div>
        </div>

        <!-- STATS STRIP -->
        <div class="portal-stats-strip">
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">${holidays.length}</span>
            <span class="portal-stat-label">Scheduled Holidays</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:#ffffff;">52</span>
            <span class="portal-stat-label">Sundays Auto-Closed</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${activeTraineesAll.length}</span>
            <span class="portal-stat-label">Active Student Courses Synced</span>
          </div>
        </div>

        <!-- QUICK ADD HOLIDAY FORM CARD -->
        <div class="portal-section" style="background:#101319; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem 1.5rem; margin-bottom:1.5rem;">
          <div style="font-size:0.95rem; font-weight:800; color:#ffffff; margin-bottom:0.25rem;">
            + Schedule New Academy Holiday
          </div>
          <p style="font-size:0.78rem; color:#a1a1aa; margin-bottom:1rem;">
            Select a date to declare the academy closed. All enrolled students will skip this date on their progressive calendars.
          </p>
          <form id="form-admin-quick-add-holiday" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)) 180px; gap:0.85rem; align-items:end;">
            <div>
              <label class="p-label" style="font-size:0.75rem; color:#94a3b8; font-weight:700; margin-bottom:0.35rem; display:block;">Holiday Date</label>
              <input type="date" id="input-admin-holiday-date" required value="${todayStr}" class="mnc-input" style="width:100%; padding:0.5rem 0.75rem; font-size:0.85rem;" />
            </div>
            <div>
              <label class="p-label" style="font-size:0.75rem; color:#94a3b8; font-weight:700; margin-bottom:0.35rem; display:block;">Holiday / Occasion Name</label>
              <input type="text" id="input-admin-holiday-name" required placeholder="e.g. Dussehra / Ayudha Puja Festival" class="mnc-input" style="width:100%; padding:0.5rem 0.75rem; font-size:0.85rem;" />
            </div>
            <div>
              <label class="p-label" style="font-size:0.75rem; color:#94a3b8; font-weight:700; margin-bottom:0.35rem; display:block;">Category</label>
              <select id="select-admin-holiday-type" class="mnc-select" style="width:100%; padding:0.5rem 0.75rem; font-size:0.85rem;">
                <option value="festival">Festival Holiday</option>
                <option value="closure">Academy Closure</option>
                <option value="government">Government / Public Holiday</option>
                <option value="weather">Weather / Emergency Closure</option>
              </select>
            </div>
            <div>
              <button type="submit" class="btn-mnc btn-mnc-primary" style="width:100%; padding:0.55rem 0.75rem; font-size:0.825rem; font-weight:700; white-space:nowrap;">
                + Save Holiday
              </button>
            </div>
          </form>
        </div>

        <!-- SCHEDULED HOLIDAYS TABLE -->
        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">Registered Academy Holidays (${holidays.length})</span>
            <span class="portal-section-meta">All active student schedules automatically skip these dates</span>
          </div>

          <div class="p-table-wrap">
            <table class="p-table">
              <thead>
                <tr>
                  <th>Holiday Date</th>
                  <th>Occasion / Reason</th>
                  <th>Category</th>
                  <th>Schedule Impact</th>
                  <th style="text-align:right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${holidays.length === 0 ? `
                  <tr>
                    <td colspan="5" style="text-align:center; padding:2rem; color:#71717a;">
                      No custom holidays scheduled. Click "Mark Today as Holiday" or use the form above to add a holiday.
                    </td>
                  </tr>
                ` : holidays.map(h => {
                  const dObj = new Date(h.date + 'T00:00:00');
                  const weekday = dObj.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                  const isToday = h.date === todayStr;
                  return `
                    <tr style="${isToday ? 'background:rgba(234,179,8,0.06);' : ''}">
                      <td style="font-family:monospace; font-weight:700; color:#ffffff;">
                        ${weekday}
                        ${isToday ? '<span class="p-badge p-badge-gold" style="font-size:0.6rem; margin-left:0.4rem;">Today</span>' : ''}
                      </td>
                      <td>
                        <div style="font-weight:700; color:#ffffff;">${h.name}</div>
                        ${h.notes ? `<div class="p-td-sub">${h.notes}</div>` : ''}
                      </td>
                      <td>
                        <span class="p-badge p-badge-dim" style="font-size:0.65rem; text-transform:uppercase;">
                          ${h.type || 'Holiday'}
                        </span>
                      </td>
                      <td>
                        <div style="font-size:0.75rem; color:#22c55e; font-weight:600;">
                          ✓ Auto-Skipped for all ${activeTraineesAll.length} students
                        </div>
                      </td>
                      <td style="text-align:right;">
                        <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-delete-holiday" data-holiday-id="${h.id}" data-holiday-name="${h.name}" style="border-color:rgba(239,68,68,0.3); color:#f87171;">
                          Delete 🗑
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- SUNDAYS POLICY CARD -->
        <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:1rem 1.25rem; display:flex; align-items:center; gap:0.75rem; margin-top:1.25rem;">
          <span style="font-size:1.25rem;">📌</span>
          <div style="font-size:0.78rem; color:#94a3b8; line-height:1.4;">
            <strong style="color:#ffffff;">Sunday Policy:</strong> Gafoor Driving School is closed every Sunday. The 20-day progressive training algorithm automatically skips all Sundays without requiring manual entries.
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

    // Holiday Scheduler Form
    const formAddHoliday = container.querySelector('#form-admin-quick-add-holiday');
    if (formAddHoliday) {
      formAddHoliday.addEventListener('submit', (e) => {
        e.preventDefault();
        const date = container.querySelector('#input-admin-holiday-date')?.value;
        const name = container.querySelector('#input-admin-holiday-name')?.value.trim();
        const type = container.querySelector('#select-admin-holiday-type')?.value || 'closure';

        if (!date || !name) return;

        const holidays = store.getHolidays();
        if (holidays.some(h => h.date === date)) {
          showToast(`A holiday is already scheduled for ${date}`, 'warning');
          return;
        }

        store.addHoliday({
          id: 'HOL-' + Date.now(),
          date,
          name,
          type,
          notes: 'Added via Admin Holiday Scheduler'
        });

        showToast(`✓ Scheduled "${name}" on ${date}. All active student courses shifted forward!`, 'success');
        render();
      });
    }

    // Delete Holiday
    container.querySelectorAll('.btn-delete-holiday').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.holidayId;
        const name = btn.dataset.holidayName;
        if (window.confirm(`Delete scheduled holiday "${name}"? Active student courses will automatically adjust.`)) {
          store.deleteHoliday(id);
          showToast(`Deleted holiday "${name}". Student courses restored.`, 'info');
          render();
        }
      });
    });

    const btnGoAdd = container.querySelector('#btn-goto-add-student');
    if (btnGoAdd) btnGoAdd.addEventListener('click', () => onNavigate('new-student'));

    // Category Tabs (Active vs Inactive)
    container.querySelectorAll('.btn-category-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        studentCategoryTab = btn.dataset.catTab;
        render();
      });
    });

    // View Mode Toggle (Table vs Cards)
    container.querySelectorAll('.btn-view-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        studentViewMode = btn.dataset.viewMode;
        render();
      });
    });

    // Instructor Filter Dropdown
    const selInst = container.querySelector('#select-instructor-filter');
    if (selInst) {
      selInst.addEventListener('change', e => {
        activeInstructorFilter = e.target.value;
        render();
      });
    }

    // Package Filter Dropdown
    const selPkg = container.querySelector('#select-package-filter');
    if (selPkg) {
      selPkg.addEventListener('change', e => {
        activePackageFilter = e.target.value;
        render();
      });
    }

    // Route Map inspection for inactive/completed students
    container.querySelectorAll('.btn-view-inactive-routes').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.traineeId;
        const sched = store.getStudentSchedule(id);
        const s = sched?.sessions.find(x => x.dayNumber === 20) || sched?.sessions[11] || sched?.sessions[0];
        if (s) {
          openRouteMapModal({ session: s, studentName: btn.dataset.student });
        }
      });
    });

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

    const btnMarkTodayHoliday = container.querySelector('#btn-admin-mark-today-holiday');
    if (btnMarkTodayHoliday) {
      btnMarkTodayHoliday.addEventListener('click', () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const holidays = store.getHolidays();
        const existing = holidays.find(h => h.date === todayStr);
        if (existing) {
          showToast(`Today (${todayStr}) is already marked as holiday: "${existing.name}"`, 'info');
          return;
        }
        const reason = window.prompt(`Mark Today (${todayStr}) as Academy Holiday?\nEnter holiday reason / title:`, 'Academy Holiday');
        if (reason === null) return;
        store.addHoliday({
          id: 'HOL-' + Date.now(),
          date: todayStr,
          name: reason.trim() || 'Academy Holiday (Admin Declared)',
          type: 'closure',
          notes: 'Marked by administrator on Academy Calendar'
        });
        showToast(`✓ Marked today (${todayStr}) as Academy Holiday. All student schedules automatically adjusted!`, 'success');
        render();
      });
    }

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

    // ==========================================
    // SLOT MANAGEMENT EVENT HANDLERS
    // ==========================================
    if (subService === 'slots') {
      // Tab switches
      container.querySelectorAll('.btn-admin-tab-switch').forEach(btn => {
        btn.addEventListener('click', () => {
          adminSlotActiveTab = btn.dataset.tab;
          render();
        });
      });

      // Quick date buttons
      container.querySelectorAll('[data-admin-date]').forEach(btn => {
        btn.addEventListener('click', () => {
          adminSlotDate = btn.dataset.adminDate;
          render();
        });
      });

      // Date input picker
      const dateInp = container.querySelector('#inp-admin-slot-date');
      if (dateInp) {
        dateInp.addEventListener('change', (e) => {
          adminSlotDate = e.target.value;
          render();
        });
      }

      // Filter: Status
      const statusSel = container.querySelector('#sel-admin-slot-status');
      if (statusSel) {
        statusSel.addEventListener('change', (e) => {
          adminSlotStatusFilter = e.target.value;
          render();
        });
      }

      // Filter: Trainer
      const trainerSel = container.querySelector('#sel-admin-slot-trainer');
      if (trainerSel) {
        trainerSel.addEventListener('change', (e) => {
          adminSlotTrainerFilter = e.target.value;
          render();
        });
      }

      // Filter: Vehicle
      const vehicleSel = container.querySelector('#sel-admin-slot-vehicle');
      if (vehicleSel) {
        vehicleSel.addEventListener('change', (e) => {
          adminSlotVehicleFilter = e.target.value;
          render();
        });
      }

      // Filter: Course
      const courseSel = container.querySelector('#sel-admin-slot-course');
      if (courseSel) {
        courseSel.addEventListener('change', (e) => {
          adminSlotCourseFilter = e.target.value;
          render();
        });
      }

      // Filter: Search
      const searchSlotInp = container.querySelector('#inp-admin-slot-search');
      if (searchSlotInp) {
        searchSlotInp.addEventListener('input', (e) => {
          searchQuery = e.target.value;
          render();
        });
      }

      // Toggle Trainer Duty
      container.querySelectorAll('.btn-admin-toggle-trainer-duty').forEach(btn => {
        btn.addEventListener('click', () => {
          const trId = btn.dataset.trainerId;
          const dt = btn.dataset.date;
          const makeAvail = btn.dataset.available === 'true';
          store.setTrainerSlotAvailability(trId, dt, makeAvail);
          const trObj = store.trainers.find(t => t.id === trId);
          showToast(`${trObj ? trObj.name : trId} is now marked ${makeAvail ? 'On Duty ✓ (Slot Capacity Increased)' : 'Off Duty (Slot Capacity Adjusted)'}`, 'info');
          render();
        });
      });

      // Toggle Slot Active / Inactive
      container.querySelectorAll('.btn-admin-toggle-active').forEach(btn => {
        btn.addEventListener('click', () => {
          const slotId = btn.dataset.slotId;
          const newStatus = btn.dataset.status;
          store.adminUpdateSlot(slotId, { status: newStatus });
          showToast(`Slot marked as ${newStatus}`, 'info');
          render();
        });
      });

      // Cancel Slot
      container.querySelectorAll('.btn-admin-cancel-slot').forEach(btn => {
        btn.addEventListener('click', () => {
          const slotId = btn.dataset.slotId;
          if (confirm('Cancel this entire slot? Active candidate bookings in this slot will be marked as cancelled.')) {
            store.adminUpdateSlot(slotId, { status: 'CANCELLED' });
            showToast('Slot cancelled and candidates notified', 'warning');
            render();
          }
        });
      });

      // Cancel Single Booking
      container.querySelectorAll('.btn-admin-cancel-booking').forEach(btn => {
        btn.addEventListener('click', () => {
          const bkId = btn.dataset.bookingId;
          if (confirm('Cancel this candidate booking? Trainer seat will become available again.')) {
            const res = store.cancelSlotBooking(bkId, 'Admin cancelled candidate booking');
            if (res.success) {
              showToast('Candidate booking cancelled · Seat released', 'success');
              render();
            } else {
              showToast(res.message || 'Could not cancel booking', 'error');
            }
          }
        });
      });

      // Move Learner
      container.querySelectorAll('.btn-admin-move-learner').forEach(btn => {
        btn.addEventListener('click', () => {
          openMoveLearnerModal(btn.dataset.bookingId);
        });
      });

      // View Mode Toggle (Table vs Cards)
      container.querySelectorAll('.btn-admin-view-mode').forEach(btn => {
        btn.addEventListener('click', () => {
          adminSlotViewMode = btn.dataset.mode;
          render();
        });
      });

      // Quick Book / Assign Learner
      container.querySelectorAll('.btn-admin-quick-book').forEach(btn => {
        btn.addEventListener('click', () => {
          openAdminBookLearnerModal(btn.dataset.slotId, btn.dataset.startTime, btn.dataset.endTime, btn.dataset.timeDisplay);
        });
      });

      // Edit Slot
      container.querySelectorAll('.btn-admin-edit-slot').forEach(btn => {
        btn.addEventListener('click', () => {
          openEditSlotModal(btn.dataset.slotId);
        });
      });

      // Delete Slot (Confirmation dialog)
      container.querySelectorAll('.btn-admin-delete-slot').forEach(btn => {
        btn.addEventListener('click', () => {
          openDeleteSlotModal(btn.dataset.slotId);
        });
      });

      // Add Slot - Expose globally and bind directly
      window.openAddSlotModal = openAddSlotModal;
      const btnAddSlot = container.querySelector('#btn-admin-add-slot');
      if (btnAddSlot) {
        btnAddSlot.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openAddSlotModal();
        });
      }
      const btnAddEmpty = container.querySelector('#btn-empty-add-slot');
      if (btnAddEmpty) {
        btnAddEmpty.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openAddSlotModal();
        });
      }
      const btnAddCustom = container.querySelector('#btn-admin-add-custom-slot');
      if (btnAddCustom) {
        btnAddCustom.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openAddSlotModal();
        });
      }
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

  // ==========================================
  // ==========================================
  // SLOT MANAGEMENT MODALS (ADMIN ONLY)
  // ==========================================
  function openAddSlotModal() {
    let modalRoot = document.getElementById('modal-root');
    if (!modalRoot) {
      modalRoot = document.createElement('div');
      modalRoot.id = 'modal-root';
      document.body.appendChild(modalRoot);
    }
    modalRoot.style.position = 'relative';
    modalRoot.style.zIndex = '99999';

    const defaultDate = adminSlotDate || store.getTodayDateStr();
    
    // Choose an initial default time slot that doesn't conflict with existing default slots
    let defaultStart = '07:00';
    let defaultEnd = '08:00';
    try {
      const existingSlots = store.getSlotsForDate ? store.getSlotsForDate(defaultDate) : [];
      const candidateTimes = [
        { start: '07:00', end: '08:00' },
        { start: '16:30', end: '17:30' },
        { start: '17:30', end: '18:30' },
        { start: '11:45', end: '12:45' },
        { start: '06:30', end: '07:30' }
      ];
      for (const c of candidateTimes) {
        const c12 = formatTime24to12(c.start);
        const match = existingSlots.some(s => s.startTime === c12 || s.startTime === c.start);
        if (!match) {
          defaultStart = c.start;
          defaultEnd = c.end;
          break;
        }
      }
    } catch (_) {}

    const trainers = store.trainers || [];
    const fleetVehicles = Array.from(new Set(trainers.map(tr => tr.car).filter(Boolean)));
    if (fleetVehicles.length === 0) {
      fleetVehicles.push(
        'Maruti Suzuki Swift Dual-Ctrl #AP-04-ED-4041',
        'Hyundai Grand i10 Dual-Ctrl #AP-04-AB-2020',
        'Tata Punch Dual-Ctrl #AP-04-CT-7072',
        'Maruti WagonR Dual-Ctrl #AP-04-KL-8088'
      );
    }

    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay" style="z-index: 99999; position: fixed; inset: 0; background: rgba(4,5,8,0.85); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center; padding: 1.5rem;">
        <div class="p-modal" style="max-width: 520px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; background: #0f1117; border: 1px solid rgba(255,255,255,0.12); border-radius: var(--radius-lg); box-shadow: 0 25px 60px rgba(0,0,0,0.95);">
          
          <!-- FIXED HEADER -->
          <div class="p-modal-header" style="padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); flex-shrink: 0; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div class="p-modal-title" id="modal-add-slot-title" style="font-size: 1.25rem; font-weight: 800; color: #ffffff;">Add New Slot</div>
              <div class="p-modal-sub" style="font-size: 0.8rem; color: var(--slate-muted); margin-top: 0.2rem;">Configure a practical driving slot with instructor and capacity</div>
            </div>
            <button type="button" id="btn-close-add-slot" class="p-modal-close" title="Close" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #fff; font-size: 1rem; width: 34px; height: 34px; border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
          </div>

          <!-- FORM WITH SCROLLABLE BODY AND FIXED FOOTER -->
          <form id="form-add-slot" style="display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden;" novalidate>
            <div class="p-modal-body" style="padding: 1.5rem; overflow-y: auto; flex: 1;">
              <!-- Global error banner for API / conflict issues -->
              <div id="slot-modal-alert" class="modal-alert-error" style="display: none; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); color: #fca5a5; padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.85rem; font-weight: 500; margin-bottom: 1.15rem; align-items: flex-start; gap: 0.5rem;"></div>

              <!-- 1. Date * -->
              <div class="p-form-row" style="margin-bottom: 1.15rem;">
                <label class="p-label" for="inp-slot-date" style="font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem; display: block;">
                  Date <span style="color: #ef4444;">*</span>
                </label>
                <input type="date" class="mnc-input p-input" id="inp-slot-date" name="slotDate" value="${defaultDate}" required style="width: 100%;" />
                <div class="field-error-msg" id="err-slotDate" style="display: none; color: #f87171; font-size: 0.75rem; margin-top: 0.25rem;"></div>
              </div>

              <!-- 2. Time Slot * -->
              <div class="p-form-row" style="margin-bottom: 1.15rem;">
                <label class="p-label" for="inp-slot-time-select" style="font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem; display: block;">
                  Time Slot <span style="color: #ef4444;">*</span>
                </label>
                <select class="mnc-select p-input" id="inp-slot-time-select" name="timeSlotSelect" style="width: 100%;">
                  <option value="06:00 - 07:00">06:00 AM - 07:00 AM</option>
                  <option value="07:00 - 08:00" ${defaultStart === '07:00' ? 'selected' : ''}>07:00 AM - 08:00 AM</option>
                  <option value="08:00 - 09:00" ${defaultStart === '08:00' ? 'selected' : ''}>08:00 AM - 09:00 AM</option>
                  <option value="09:00 - 10:00" ${defaultStart === '09:00' ? 'selected' : ''}>09:00 AM - 10:00 AM</option>
                  <option value="10:00 - 11:00" ${defaultStart === '10:00' ? 'selected' : ''}>10:00 AM - 11:00 AM</option>
                  <option value="11:00 - 12:00" ${defaultStart === '11:00' ? 'selected' : ''}>11:00 AM - 12:00 PM</option>
                  <option value="12:00 - 13:00" ${defaultStart === '12:00' ? 'selected' : ''}>12:00 PM - 01:00 PM</option>
                  <option value="14:00 - 15:00" ${defaultStart === '14:00' ? 'selected' : ''}>02:00 PM - 03:00 PM</option>
                  <option value="15:00 - 16:00" ${defaultStart === '15:00' ? 'selected' : ''}>03:00 PM - 04:00 PM</option>
                  <option value="16:00 - 17:00" ${defaultStart === '16:00' ? 'selected' : ''}>04:00 PM - 05:00 PM</option>
                  <option value="17:00 - 18:00" ${defaultStart === '17:00' ? 'selected' : ''}>05:00 PM - 06:00 PM</option>
                  <option value="custom">Custom Time...</option>
                </select>
                <div class="field-error-msg" id="err-timeSlot" style="display: none; color: #f87171; font-size: 0.75rem; margin-top: 0.25rem;"></div>
              </div>

              <!-- Custom Start & End Time Inputs (shown when custom is selected) -->
              <div id="custom-time-inputs-row" style="display: none; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.15rem;">
                <div class="p-form-row">
                  <label class="p-label" for="inp-slot-start" style="font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem; display: block;">
                    Start Time <span style="color: #ef4444;">*</span>
                  </label>
                  <input type="time" class="mnc-input p-input" id="inp-slot-start" name="startTime" value="${defaultStart}" required style="width: 100%;" />
                  <div class="field-error-msg" id="err-startTime" style="display: none; color: #f87171; font-size: 0.75rem; margin-top: 0.25rem;"></div>
                </div>
                <div class="p-form-row">
                  <label class="p-label" for="inp-slot-end" style="font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem; display: block;">
                    End Time <span style="color: #ef4444;">*</span>
                  </label>
                  <input type="time" class="mnc-input p-input" id="inp-slot-end" name="endTime" value="${defaultEnd}" required style="width: 100%;" />
                  <div class="field-error-msg" id="err-endTime" style="display: none; color: #f87171; font-size: 0.75rem; margin-top: 0.25rem;"></div>
                </div>
              </div>

              <!-- 3. Capacity * -->
              <div class="p-form-row" style="margin-bottom: 1.15rem;">
                <label class="p-label" for="inp-slot-capacity" style="font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem; display: block;">
                  Capacity <span style="color: #ef4444;">*</span>
                </label>
                <select class="mnc-select p-input" id="inp-slot-capacity" name="capacity" required style="width: 100%;">
                  <option value="1">1</option>
                  <option value="2" selected>2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                </select>
                <div class="field-error-msg" id="err-capacity" style="display: none; color: #f87171; font-size: 0.75rem; margin-top: 0.25rem;"></div>
              </div>

              <!-- 4. Trainer Name * -->
              <div class="p-form-row" style="margin-bottom: 1.15rem;">
                <label class="p-label" for="inp-slot-trainer" style="font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem; display: block;">
                  Trainer Name <span style="color: #ef4444;">*</span>
                </label>
                <select class="mnc-select p-input" id="inp-slot-trainer" name="trainerId" required style="width: 100%;">
                  ${trainers.map((tr, idx) => `
                    <option value="${tr.id}" data-car="${tr.car || ''}" ${idx === 0 ? 'selected' : ''}>${tr.name} (${tr.trainerCode || tr.id})</option>
                  `).join('')}
                </select>
                <div class="field-error-msg" id="err-trainerId" style="display: none; color: #f87171; font-size: 0.75rem; margin-top: 0.25rem;"></div>
              </div>

              <!-- 5. Status * -->
              <div class="p-form-row" style="margin-bottom: 1.15rem;">
                <label class="p-label" for="inp-slot-status" style="font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem; display: block;">
                  Status <span style="color: #ef4444;">*</span>
                </label>
                <select class="mnc-select p-input" id="inp-slot-status" name="status" style="width: 100%;">
                  <option value="Available" selected>Available</option>
                  <option value="Almost Full">Almost Full</option>
                  <option value="Full">Full</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <div class="field-error-msg" id="err-status" style="display: none; color: #f87171; font-size: 0.75rem; margin-top: 0.25rem;"></div>
              </div>

              <!-- Hidden defaults for vehicle and course -->
              <input type="hidden" id="inp-slot-vehicle" name="vehicle" value="${fleetVehicles[0] || 'Maruti Suzuki Swift Dual-Ctrl'}" />
              <input type="hidden" id="inp-slot-course" name="course" value="20-Day Comprehensive Licensing Package" />
              <input type="hidden" id="inp-slot-location" name="location" value="Pulivendula RTO Track Ground" />
              <input type="hidden" id="inp-slot-name" name="name" value="" />
              <input type="hidden" id="inp-slot-desc" name="description" value="" />
            </div>

            <!-- PINNED MODAL FOOTER (ALWAYS VISIBLE AT BOTTOM) -->
            <div class="p-modal-footer" style="padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.08); background: #13151b; display: flex; justify-content: flex-end; gap: 0.75rem; flex-shrink: 0; margin-top: 0;">
              <button type="button" class="p-ghost-btn" id="btn-cancel-add-slot" style="padding: 0.65rem 1.25rem; cursor: pointer;">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary" id="btn-submit-add-slot" style="padding: 0.65rem 1.5rem; font-weight: 800; cursor: pointer; background: var(--primary-gold); color: #000; border: none; border-radius: var(--radius-sm); box-shadow: 0 4px 14px rgba(243, 209, 130, 0.3);">
                Add Slot
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { 
      modalRoot.innerHTML = '';
      document.removeEventListener('keydown', handleEsc);
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleEsc);

    modalRoot.querySelector('#btn-close-add-slot').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-add-slot').addEventListener('click', close);

    const overlay = modalRoot.querySelector('.mnc-modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
      });
    }

    const form = modalRoot.querySelector('#form-add-slot');
    const btnSubmit = modalRoot.querySelector('#btn-submit-add-slot');
    const alertBox = modalRoot.querySelector('#slot-modal-alert');

    // Auto-sync vehicle when trainer changes
    const selTrainer = form.querySelector('#inp-slot-trainer');
    const selVehicle = form.querySelector('#inp-slot-vehicle');
    if (selTrainer && selVehicle) {
      selTrainer.addEventListener('change', () => {
        const selectedOpt = selTrainer.options[selTrainer.selectedIndex];
        const car = selectedOpt ? selectedOpt.dataset.car : '';
        if (car) {
          selVehicle.value = car;
        }
      });
    }

    // Auto-sync start and end time when Time Slot dropdown changes
    const selTimeSlot = form.querySelector('#inp-slot-time-select');
    const inpStart = form.querySelector('#inp-slot-start');
    const inpEnd = form.querySelector('#inp-slot-end');
    const customTimeRow = form.querySelector('#custom-time-inputs-row');
    if (selTimeSlot) {
      selTimeSlot.addEventListener('change', () => {
        if (selTimeSlot.value === 'custom') {
          if (customTimeRow) customTimeRow.style.display = 'grid';
        } else {
          const parts = selTimeSlot.value.split(' - ');
          if (parts.length === 2) {
            if (inpStart) inpStart.value = parts[0].trim();
            if (inpEnd) inpEnd.value = parts[1].trim();
          }
          if (customTimeRow) customTimeRow.style.display = 'none';
        }
      });
    }

    // Inline field validation error helper
    const clearErrors = () => {
      if (alertBox) { alertBox.style.display = 'none'; alertBox.innerHTML = ''; }
      modalRoot.querySelectorAll('.field-error-msg').forEach(el => {
        el.style.display = 'none';
        el.innerHTML = '';
      });
      modalRoot.querySelectorAll('.p-input').forEach(el => {
        el.classList.remove('is-invalid');
      });
    };

    const showFieldError = (fieldName, message) => {
      const errEl = modalRoot.querySelector(`#err-${fieldName}`);
      const inpEl = modalRoot.querySelector(`[name="${fieldName}"]`);
      if (errEl) {
        errEl.innerHTML = `⚠️ ${message}`;
        errEl.style.display = 'flex';
      }
      if (inpEl) {
        inpEl.classList.add('is-invalid');
      }
    };

    const showGlobalError = (message) => {
      if (alertBox) {
        alertBox.innerHTML = `<span>⚠️</span> <div>${message}</div>`;
        alertBox.style.display = 'flex';
        alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };

    // Live validation clean-up on user typing / changing values
    const fieldInputs = form.querySelectorAll('input, select, textarea');
    fieldInputs.forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('is-invalid');
        const errEl = modalRoot.querySelector(`#err-${input.name}`);
        if (errEl) {
          errEl.style.display = 'none';
          errEl.innerHTML = '';
        }
        if (alertBox) alertBox.style.display = 'none';
      });
      input.addEventListener('change', () => {
        input.classList.remove('is-invalid');
        const errEl = modalRoot.querySelector(`#err-${input.name}`);
        if (errEl) {
          errEl.style.display = 'none';
          errEl.innerHTML = '';
        }
      });
    });

    // Form submission handler with complete API lifecycle
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const f = form.elements;
      const name = (f['name']?.value || '').trim();
      const date = (f['slotDate']?.value || '').trim();
      const startTime = (f['startTime']?.value || '').trim();
      const endTime = (f['endTime']?.value || '').trim();
      const capacityVal = (f['capacity']?.value || '').trim();
      const status = f['status']?.value || 'Available';
      const location = (f['location']?.value || '').trim();
      const trainerId = f['trainerId']?.value || null;
      const vehicle = (f['vehicle']?.value || '').trim();
      const course = f['course']?.value || '20-Day Comprehensive Licensing Package';
      const description = (f['description']?.value || '').trim();

      // ==========================================
      // FRONTEND VALIDATION
      // ==========================================
      let hasError = false;
      let firstInvalidEl = null;

      const markInvalid = (fieldName, message) => {
        showFieldError(fieldName, message);
        hasError = true;
        if (!firstInvalidEl) {
          firstInvalidEl = modalRoot.querySelector(`[name="${fieldName}"]`);
        }
      };

      // 1. Date validation
      if (!date) {
        markInvalid('slotDate', 'Training date is required.');
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        markInvalid('slotDate', 'Date must be a valid calendar date in YYYY-MM-DD format.');
      }

      // 2. Start time validation
      if (!startTime) {
        markInvalid('startTime', 'Start time is required.');
      }

      // 3. End time validation
      if (!endTime) {
        markInvalid('endTime', 'End time is required.');
      }

      // 4. Chronological sequence check
      if (startTime && endTime) {
        const startMin = timeToMinutes(startTime);
        const endMin = timeToMinutes(endTime);

        if (startMin >= endMin) {
          markInvalid('endTime', 'End time must be after start time.');
        } else if (endMin - startMin < 30) {
          markInvalid('endTime', 'Slot duration must be at least 30 minutes.');
        } else if (endMin - startMin > 240) {
          markInvalid('endTime', 'Slot duration cannot exceed 4 hours.');
        }
      }

      // 5. Capacity validation
      let capacity = null;
      if (capacityVal === '') {
        markInvalid('capacity', 'Slot capacity is required.');
      } else {
        capacity = parseInt(capacityVal, 10);
        if (isNaN(capacity) || capacity < 1) {
          markInvalid('capacity', 'Capacity must be greater than 0.');
        } else if (capacity > 50) {
          markInvalid('capacity', 'Capacity cannot exceed 50 learners per slot.');
        }
      }

      // 6. Trainer validation
      if (!trainerId) {
        markInvalid('trainerId', 'Please select a Trainer / Instructor.');
      }

      // 7. Vehicle validation
      if (!vehicle) {
        markInvalid('vehicle', 'Please select a Vehicle.');
      }

      // 8. Course validation
      if (!course) {
        markInvalid('course', 'Please select a Course.');
      }

      if (hasError) {
        if (firstInvalidEl) firstInvalidEl.focus();
        return;
      }

      // ==========================================
      // LOADING STATE
      // ==========================================
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `<span class="btn-loading-spinner"></span> Creating...`;

      // ==========================================
      // API REQUEST & ERROR HANDLING
      // ==========================================
      try {
        const selectedTrainer = trainers.find(t => t.id === trainerId);
        const slotPayload = {
          name: name || `${formatTime24to12(startTime)} Practical Driving Session`,
          title: name || `${formatTime24to12(startTime)} Practical Driving Session`,
          date,
          startTime: formatTime24to12(startTime),
          endTime: formatTime24to12(endTime),
          capacity,
          status,
          location: location || 'Pulivendula RTO Track Ground',
          branch: location || 'Pulivendula RTO Track Ground',
          trainerId,
          assignedTrainerId: trainerId,
          trainerName: selectedTrainer ? selectedTrainer.name : '',
          vehicle,
          vehicleOverride: vehicle,
          courseId: course,
          course,
          description,
          notes: description
        };

        const res = await api.post('/slots', slotPayload);

        if (res && res.success && res.slot) {
          // Immediately update store memory and localStorage
          store.adminCreateCustomSlot(res.slot);

          // Success notification
          showToast('Slot created successfully.', 'success');

          // Align active date and close modal
          adminSlotDate = date;
          close();

          // Instantly refresh UI without page reload
          render();
        } else {
          throw new Error(res.message || 'Unable to create slot. Please try again.');
        }
      } catch (err) {
        console.error('Add Slot Error:', err);
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `+ Create Slot`;

        if (err.status === 409 || (err.message && err.message.toLowerCase().includes('already exists'))) {
          showGlobalError('A slot already exists for this date and time period.');
          showFieldError('startTime', 'A slot already exists for this date and time period.');
        } else if (err.status === 401 || err.status === 403) {
          showGlobalError(`Authentication Error (HTTP ${err.status || 403}): Only authorized administrators can create driving slots.`);
        } else if (err.errors && Object.keys(err.errors).length > 0) {
          Object.entries(err.errors).forEach(([field, msg]) => {
            const mappedField = field === 'date' ? 'slotDate' : field;
            showFieldError(mappedField, msg);
          });
          showGlobalError('Please fix the highlighted field validation errors.');
        } else if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          Object.entries(err.fieldErrors).forEach(([field, msg]) => {
            const mappedField = field === 'date' ? 'slotDate' : field;
            showFieldError(mappedField, msg);
          });
          showGlobalError('Please fix the highlighted field validation errors.');
        } else {
          showGlobalError(err.message || 'Unable to create slot. Please try again.');
        }
      }
    });
  }

  function openAddCustomSlotModal() {
    openAddSlotModal();
  }

  function openEditSlotModal(slotId) {
    const modalRoot = document.getElementById('modal-root');
    const trainers = store.trainers || [];
    const slot = store.slots.find(s => s.id === slotId) ||
                 store.getSlotsForDate(adminSlotDate).find(s => s.id === slotId) || {
      id: slotId,
      name: '',
      date: adminSlotDate,
      startTime: slotId.replace('slot-', ''),
      endTime: '',
      status: 'Available',
      capacity: null,
      assignedTrainerId: null,
      location: '',
      description: '',
      course: '20-Day Comprehensive Licensing Package'
    };

    const currentStatus = slot.status || slot.calculatedStatus || 'Available';
    const rawStart24 = formatTime12to24(slot.startTime) || '08:00';
    const rawEnd24 = formatTime12to24(slot.endTime) || '09:00';

    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="p-modal" style="max-width:580px; width: 100%;">
          <div class="p-modal-header">
            <div>
              <div class="p-modal-title">Edit Driving Slot</div>
              <div class="p-modal-sub">Slot ID: ${slot.id} · ${formatReadableDate(slot.date || adminSlotDate)}</div>
            </div>
            <button type="button" id="btn-close-edit-slot" class="p-modal-close">✕</button>
          </div>
          <form id="form-edit-slot" class="p-modal-body" style="padding: 1.5rem;" novalidate>
            <div id="edit-slot-alert" class="modal-alert-error" style="display: none;"></div>

            <div class="p-form-row" style="margin-bottom:1rem;">
              <label class="p-label">Slot Name / Title</label>
              <input type="text" class="mnc-input p-input" name="name" value="${slot.name || ''}" placeholder="e.g. Morning Highway Session" style="width: 100%;" />
            </div>

            <div class="p-form-row" style="margin-bottom:1rem;">
              <label class="p-label">Training Date *</label>
              <input type="date" class="mnc-input p-input" name="slotDate" value="${slot.date || adminSlotDate}" required style="width: 100%;" />
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
              <div class="p-form-row">
                <label class="p-label">Start Time *</label>
                <input type="time" class="mnc-input p-input" name="startTime" value="${rawStart24}" required style="width: 100%;" />
              </div>
              <div class="p-form-row">
                <label class="p-label">End Time *</label>
                <input type="time" class="mnc-input p-input" name="endTime" value="${rawEnd24}" required style="width: 100%;" />
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
              <div class="p-form-row">
                <label class="p-label">Maximum Capacity</label>
                <input type="number" class="mnc-input p-input" name="capacity" min="1" max="50" value="${slot.capacity !== null && slot.capacity !== undefined ? slot.capacity : ''}" placeholder="e.g. 2" style="width: 100%;" />
              </div>
              <div class="p-form-row">
                <label class="p-label">Slot Status *</label>
                <select class="mnc-select p-input" name="status" style="width: 100%;">
                  <option value="Available" ${currentStatus.toLowerCase() === 'available' ? 'selected' : ''}>Available</option>
                  <option value="Almost Full" ${currentStatus.toLowerCase() === 'almost full' ? 'selected' : ''}>Almost Full</option>
                  <option value="Full" ${currentStatus.toLowerCase() === 'full' ? 'selected' : ''}>Full</option>
                  <option value="Completed" ${currentStatus.toLowerCase() === 'completed' ? 'selected' : ''}>Completed</option>
                  <option value="Cancelled" ${currentStatus.toLowerCase() === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                  <option value="Maintenance" ${currentStatus.toLowerCase() === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                  <option value="Closed" ${currentStatus.toLowerCase() === 'closed' || currentStatus.toLowerCase() === 'inactive' ? 'selected' : ''}>Closed</option>
                </select>
              </div>
            </div>

            <div class="p-form-row" style="margin-bottom:1rem;">
              <label class="p-label">Location / Branch</label>
              <input type="text" class="mnc-input p-input" name="location" value="${slot.location || ''}" placeholder="e.g. Pulivendula RTO Track Ground" style="width: 100%;" />
            </div>

            <div class="p-form-row" style="margin-bottom:1rem;">
              <label class="p-label">Assigned Instructor</label>
              <select class="mnc-select p-input" name="trainerId" style="width: 100%;">
                <option value="" ${!slot.assignedTrainerId ? 'selected' : ''}>All Available Instructors (Dynamic)</option>
                ${trainers.map(tr => `
                  <option value="${tr.id}" ${slot.assignedTrainerId === tr.id ? 'selected' : ''}>${tr.name} (${tr.car})</option>
                `).join('')}
              </select>
            </div>

            <div class="p-form-row" style="margin-bottom:1.5rem;">
              <label class="p-label">Description / Notes</label>
              <textarea class="mnc-input p-input" name="description" rows="2" placeholder="Optional notes..." style="width: 100%;">${slot.description || ''}</textarea>
            </div>

            <div class="p-modal-footer">
              <button type="button" class="p-ghost-btn" id="btn-cancel-edit-slot">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary" id="btn-submit-edit-slot">Save Changes →</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-edit-slot').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-edit-slot').addEventListener('click', close);

    modalRoot.querySelector('#form-edit-slot').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target.elements;
      const name = (f['name']?.value || '').trim();
      const date = f['slotDate'].value;
      const startTime = f['startTime'].value;
      const endTime = f['endTime'].value;
      const capacity = f['capacity'].value ? parseInt(f['capacity'].value, 10) : null;
      const status = f['status'].value;
      const location = (f['location']?.value || '').trim();
      const trainerId = f['trainerId'].value || null;
      const description = (f['description']?.value || '').trim();

      const startMin = timeToMinutes(startTime);
      const endMin = timeToMinutes(endTime);
      if (startMin >= endMin) {
        showToast('Start time must be before end time', 'error');
        return;
      }

      const res = store.adminUpdateSlot(slotId, { 
        name, 
        date, 
        startTime, 
        endTime, 
        capacity, 
        status, 
        location, 
        trainerId, 
        description 
      });

      if (res && res.success) {
        showToast('Slot updated successfully', 'success');
        adminSlotDate = date;
        close();
        render();
      } else {
        showToast((res && res.message) || 'Failed to update slot', 'error');
      }
    });
  }

  function openDeleteSlotModal(slotId) {
    const modalRoot = document.getElementById('modal-root');
    const slot = store.slots.find(s => s.id === slotId) ||
                 store.getSlotsForDate(adminSlotDate).find(s => s.id === slotId) || {
      id: slotId,
      date: adminSlotDate,
      startTime: '',
      endTime: '',
      timeDisplay: 'Selected Slot'
    };

    const activeBookings = store.slotBookings.filter(b => 
      (b.slotId === slot.id || (b.date === slot.date && b.startTime === slot.startTime)) && 
      b.status === 'CONFIRMED'
    );

    const hasBookings = activeBookings.length > 0;

    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="p-modal" style="max-width:500px;">
          <div class="p-modal-header">
            <div>
              <div class="p-modal-title" style="color:#f87171;">Delete Driving Slot?</div>
              <div class="p-modal-sub">Permanently remove this slot from the schedule</div>
            </div>
            <button type="button" id="btn-close-delete-slot" class="p-modal-close">✕</button>
          </div>
          <div class="p-modal-body">
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-sm); padding:1rem 1.25rem; margin-bottom:1rem;">
              <div style="font-size:1.15rem; font-weight:800; color:#ffffff;">
                ${formatReadableDate(slot.date)}
              </div>
              <div style="font-size:1rem; font-family:var(--font-mono); color:var(--primary-gold); margin-top:0.35rem; font-weight:700;">
                ${slot.timeDisplay || `${slot.startTime} - ${slot.endTime}`}
              </div>
              <div style="font-size:0.75rem; color:var(--slate-muted); margin-top:0.35rem;">
                Capacity: <strong>${slot.totalCapacity || slot.capacity || 8}</strong> · Status: <strong>${slot.calculatedStatus || slot.status || 'Available'}</strong>
              </div>
            </div>

            ${hasBookings ? `
              <div style="background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.35); border-radius:var(--radius-sm); padding:1rem; margin-bottom:1.25rem;">
                <div style="font-weight:800; font-size:0.9rem; color:#f87171; display:flex; align-items:center; gap:0.4rem; margin-bottom:0.4rem;">
                  <span>⚠️</span> Active Bookings Warning
                </div>
                <div style="font-size:0.875rem; color:#fca5a5; line-height:1.5;">
                  This slot has <strong>${activeBookings.length} student${activeBookings.length > 1 ? 's' : ''} assigned</strong>. Deleting this slot will affect their bookings.
                </div>
                <div style="margin-top:0.65rem; font-size:0.78rem; color:var(--slate-body); max-height:80px; overflow-y:auto;">
                  Students: ${activeBookings.map(b => `${b.traineeName} (${b.traineeId})`).join(', ')}
                </div>
              </div>

              <label style="display:flex; align-items:flex-start; gap:0.65rem; font-size:0.8125rem; color:#ffffff; cursor:pointer; margin-bottom:1.25rem; user-select:none;">
                <input type="checkbox" id="chk-confirm-delete-slot" style="margin-top:0.2rem; cursor:pointer; width:16px; height:16px;" />
                <span>I understand and explicitly confirm permanent deletion of this driving slot and cancellation of all ${activeBookings.length} student booking(s).</span>
              </label>
            ` : `
              <p style="font-size:0.875rem; color:var(--slate-body); line-height:1.5; margin-bottom:1.25rem;">
                Are you sure you want to permanently delete this driving slot? This action cannot be undone.
              </p>
            `}

            <div class="p-modal-footer">
              <button type="button" class="p-ghost-btn" id="btn-cancel-delete-slot">Cancel</button>
              <button type="button" class="btn-mnc" id="btn-confirm-delete-slot" ${hasBookings ? 'disabled' : ''} style="background:#dc2626; color:#ffffff; border-color:#ef4444; ${hasBookings ? 'opacity:0.5; cursor:not-allowed;' : ''}">
                Delete Slot
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-delete-slot').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-delete-slot').addEventListener('click', close);

    const chkConfirm = modalRoot.querySelector('#chk-confirm-delete-slot');
    const btnConfirm = modalRoot.querySelector('#btn-confirm-delete-slot');

    if (chkConfirm) {
      chkConfirm.addEventListener('change', (e) => {
        if (e.target.checked) {
          btnConfirm.removeAttribute('disabled');
          btnConfirm.style.opacity = '1';
          btnConfirm.style.cursor = 'pointer';
        } else {
          btnConfirm.setAttribute('disabled', 'true');
          btnConfirm.style.opacity = '0.5';
          btnConfirm.style.cursor = 'not-allowed';
        }
      });
    }

    btnConfirm.addEventListener('click', () => {
      const res = store.adminDeleteSlot(slotId, true);
      if (res.success) {
        showToast(res.message || 'Driving slot permanently deleted', 'success');
        close();
        render();
      } else {
        showToast(res.message || 'Could not delete slot', 'error');
      }
    });
  }

  function openMoveLearnerModal(bookingId) {
    const modalRoot = document.getElementById('modal-root');
    const booking = store.slotBookings.find(b => b.id === bookingId);
    if (!booking) {
      showToast('Booking not found', 'error');
      return;
    }

    const availableSlotsToday = store.getSlotsForDate(booking.date || adminSlotDate).filter(s => s.status !== 'CANCELLED' && s.status !== 'INACTIVE' && s.availableSeats > 0 && s.startTime !== booking.startTime);

    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="p-modal" style="max-width:540px;">
          <div class="p-modal-header">
            <div>
              <div class="p-modal-title">Move Learner Reservation</div>
              <div class="p-modal-sub">Transfer candidate to another slot without losing booking history</div>
            </div>
            <button type="button" id="btn-close-move-modal" class="p-modal-close">✕</button>
          </div>
          <form id="form-move-learner" class="p-modal-body">
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-sm); padding:1rem; margin-bottom:1.25rem;">
              <div style="font-size:0.75rem; color:var(--slate-muted); text-transform:uppercase; font-weight:800; margin-bottom:0.35rem;">Current Reservation</div>
              <div style="font-size:1.05rem; font-weight:800; color:#ffffff; margin-bottom:0.25rem;">${booking.traineeName} <span style="font-size:0.8rem; color:var(--slate-muted);">(${booking.traineeId})</span></div>
              <div style="font-size:0.8125rem; color:var(--slate-body);">
                Date: <strong>${formatReadableDate(booking.date)}</strong> · Time: <strong>${booking.startTime} - ${booking.endTime}</strong>
              </div>
              <div style="font-size:0.8125rem; color:var(--slate-body); margin-top:0.2rem;">
                Trainer: <strong>${booking.trainerName || 'Assigned Instructor'}</strong> · Vehicle: <strong>${booking.vehicleName || 'Swift Dual-Brake'}</strong>
              </div>
            </div>

            <div class="p-form-row" style="margin-bottom:1rem;">
              <label class="p-label">Target Date *</label>
              <input type="date" class="mnc-input p-input" id="inp-move-target-date" name="targetDate" value="${booking.date || adminSlotDate}" required />
            </div>

            <div class="p-form-row" style="margin-bottom:1.25rem;">
              <label class="p-label">Target Driving Slot *</label>
              <select class="mnc-select p-input" id="sel-move-target-slot" name="targetSlot" required>
                ${availableSlotsToday.length === 0 ? '<option value="">No other slots with open seats on this date</option>' : ''}
                ${availableSlotsToday.map(s => `
                  <option value="${s.id}|${s.startTime}|${s.endTime}">
                    ${s.timeDisplay} (${s.availableSeats} seat${s.availableSeats !== 1 ? 's' : ''} free · ${s.availableTrainersCount} trainers)
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="p-modal-footer">
              <button type="button" class="p-ghost-btn" id="btn-cancel-move-modal">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Move Learner Now →</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-move-modal').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-move-modal').addEventListener('click', close);

    const dateInput = modalRoot.querySelector('#inp-move-target-date');
    const slotSelect = modalRoot.querySelector('#sel-move-target-slot');

    dateInput.addEventListener('change', () => {
      const dt = dateInput.value;
      const slots = store.getSlotsForDate(dt).filter(s => s.status !== 'CANCELLED' && s.status !== 'INACTIVE' && s.availableSeats > 0 && !(dt === booking.date && s.startTime === booking.startTime));
      if (slots.length === 0) {
        slotSelect.innerHTML = '<option value="">No available slots on this date</option>';
      } else {
        slotSelect.innerHTML = slots.map(s => `
          <option value="${s.id}|${s.startTime}|${s.endTime}">
            ${s.timeDisplay} (${s.availableSeats} seat${s.availableSeats !== 1 ? 's' : ''} free · ${s.availableTrainersCount} trainers)
          </option>
        `).join('');
      }
    });

    modalRoot.querySelector('#form-move-learner').addEventListener('submit', (e) => {
      e.preventDefault();
      const val = slotSelect.value;
      if (!val) {
        showToast('Please select a valid target slot', 'error');
        return;
      }
      const [tSlotId, tStartTime, tEndTime] = val.split('|');
      const targetDate = dateInput.value;

      const res = store.moveSlotBooking(bookingId, tSlotId, targetDate, tStartTime, tEndTime);
      if (res.success) {
        showToast(`Learner moved to ${tStartTime} - ${tEndTime} (${targetDate})`, 'success');
        close();
        render();
      } else {
        showToast(res.message || 'Failed to move booking', 'error');
      }
    });
  }

  function openAdminBookLearnerModal(slotId, startTime, endTime, timeDisplay) {
    const modalRoot = document.getElementById('modal-root');
    const activeTrainees = store.trainees.filter(t => t.status !== 'Completed');
    const onDutyTrainers = store.trainers.filter(tr => {
      const isOffDay = store.trainerAvailability[adminSlotDate] && store.trainerAvailability[adminSlotDate][tr.id] === false;
      return !isOffDay;
    });

    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="p-modal" style="max-width:540px;">
          <div class="p-modal-header">
            <div>
              <div class="p-modal-title">Manual Student Allocation</div>
              <div class="p-modal-sub">${timeDisplay} · ${formatReadableDate(adminSlotDate)}</div>
            </div>
            <button type="button" id="btn-close-admin-book" class="p-modal-close">✕</button>
          </div>
          <form id="form-admin-book" class="p-modal-body">
            <div class="p-form-row" style="margin-bottom:1rem;">
              <label class="p-label">Select Candidate / Learner *</label>
              <select class="mnc-select p-input" name="traineeId" required>
                ${activeTrainees.map(t => `
                  <option value="${t.id}">${t.name} (${t.studentCode || t.id}) — Day ${t.currentDay} (${t.package})</option>
                `).join('')}
              </select>
            </div>

            <div class="p-form-row" style="margin-bottom:1rem;">
              <label class="p-label">Assigned Instructor Preference</label>
              <select class="mnc-select p-input" name="trainerId">
                <option value="">⚡ Auto-assign to available instructor (Next open capacity)</option>
                ${onDutyTrainers.map(tr => `
                  <option value="${tr.id}">${tr.name} (${tr.car})</option>
                `).join('')}
              </select>
            </div>

            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-sm); padding:0.85rem 1rem; font-size:0.8rem; color:var(--slate-muted); line-height:1.45; margin-bottom:1.25rem;">
              ✓ <strong>Enforced Business Rules:</strong> Prevents exceeding max 2 candidates per trainer, double-booking candidate across overlapping hours, and conflicting vehicle sessions.
            </div>

            <div class="p-modal-footer">
              <button type="button" class="p-ghost-btn" id="btn-cancel-admin-book">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Confirm Reservation →</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-admin-book').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-admin-book').addEventListener('click', close);

    modalRoot.querySelector('#form-admin-book').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target.elements;
      const traineeId = f['traineeId'].value;
      const trainerId = f['trainerId'].value || null;
      const t = store.trainees.find(x => x.id === traineeId);

      const res = await store.bookSlot({
        slotId,
        date: adminSlotDate,
        startTime,
        endTime,
        timeDisplay,
        traineeId,
        traineeName: t ? t.name : traineeId,
        preferredTrainerId: trainerId,
        course: t ? t.package : '20-Day Comprehensive Licensing Package',
        bookedBy: 'Admin'
      });

      if (res && res.success) {
        showToast(`Student assigned to slot! Instructor: ${res.booking ? res.booking.trainerName : 'Assigned'}`, 'success');
        close();
        render();
      } else {
        showToast((res && res.message) || 'Failed to assign student to slot', 'error');
      }
    });
  }

  window.openAddSlotModal = openAddSlotModal;

  // Global document-level click listener for any + Add Slot button
  if (!window._adminAddSlotListenerAttached) {
    window._adminAddSlotListenerAttached = true;
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-admin-add-slot, #btn-empty-add-slot, [data-action="open-add-slot"]');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.openAddSlotModal === 'function') {
          window.openAddSlotModal();
        }
      }
    });
  }

  render();
}
