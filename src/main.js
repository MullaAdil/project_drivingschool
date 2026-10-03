/* ==========================================================================
   GAFOOR DRIVING SCHOOL — ENTERPRISE APPLICATION ORCHESTRATOR
   Core Structure:
   - 3 separate consoles fitting 100% of the viewport width without gaps:
     * Admin Console: Full Operations (Overview, Students, + Add Student, Ledger, Instructors, Fleet Rigs, RTO Exam Scheduler)
     * Trainer Console: Dedicated Services (Daily Road Roster, Assigned Candidates, Vehicle Rig Telemetry)
     * Trainee Console: Dedicated Services (20-Day Curriculum 8km/day, Tuition & UPI QR, Candidate LLR Dossier)
   - Master Candidate Inspection view with modern UI component styling
   - Zero light-leak glitches, deep obsidian & gold aesthetics
   ========================================================================== */

import { store } from './store.js';
import 'leaflet/dist/leaflet.css';
import { renderHomeWebsiteView } from './views/homeWebsiteView.js';
import { renderLoginView } from './views/loginView.js';
import { renderAdminView } from './views/adminView.js';
import { renderTraineeDetailView } from './views/traineeDetailView.js';
import { renderTrainerDetailView } from './views/trainerDetailView.js';
import { renderTrainerView } from './views/trainerView.js';
import { renderTraineeView } from './views/traineeView.js';
import { renderBrandLogo } from './components/brandLogo.js';
import { renderStudentAvatar } from './components/studentAvatar.js';

const appRoot = document.getElementById('app');

// State Route Definition
let currentRoute = {
  service: 'home', // 'home' | 'admin' | 'trainee-profile' | 'trainer-profile' | 'trainer' | 'trainee' | 'login'
  subService: 'hub', // for admin: 'hub' | 'trainees' | 'new-student' | 'billing' | 'trainers' | 'calendar' | 'rto-scheduler'
  traineeId: 'APX-9021',
  trainerId: 'TRN-1'
};

// Global Toast Manager
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: #0d0e12;
    color: #ffffff;
    padding: 0.85rem 1.35rem;
    border-radius: var(--radius-sm);
    box-shadow: 0 16px 36px rgba(0,0,0,0.85);
    font-size: 0.875rem;
    font-weight: 700;
    max-width: 440px;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.65rem;
    border-left: 4px solid #ffffff;
    border-top: 1px solid rgba(255,255,255,0.1);
    border-right: 1px solid rgba(255,255,255,0.1);
    border-bottom: 1px solid rgba(255,255,255,0.1);
    animation: modalFadeIn 0.2s ease-out;
  `;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.2s, transform 0.2s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 220);
  }, 3200);
}

let isSidebarOpen = localStorage.getItem('gds_sidebar_open') !== 'false';

function toggleSidebar() {
  isSidebarOpen = !isSidebarOpen;
  localStorage.setItem('gds_sidebar_open', isSidebarOpen ? 'true' : 'false');
  const layout = appRoot.querySelector('.console-layout');
  if (layout) {
    layout.classList.toggle('sidebar-closed', !isSidebarOpen);
  }
  // Update sidebar hamburger button (3 bars ↔ X)
  const sidebarHam = appRoot.querySelector('.console-sidebar-hamburger');
  if (sidebarHam) {
    sidebarHam.classList.toggle('is-open', isSidebarOpen);
  }
  // Update topbar toggle button
  const topbarBtn = appRoot.querySelector('#btn-topbar-toggle-sidebar');
  if (topbarBtn) {
    topbarBtn.classList.toggle('is-closed', !isSidebarOpen);
    topbarBtn.title = isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar';
  }
  // Legacy toggle btn (hidden but keep functional)
  const toggleBtn = appRoot.querySelector('#btn-toggle-sidebar');
  if (toggleBtn) {
    toggleBtn.title = isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar';
  }
}

export function navigateTo(service, subService = 'hub', targetId = null) {
  currentRoute = {
    service,
    subService,
    traineeId: service === 'trainee-profile' ? (targetId || currentRoute.traineeId) : currentRoute.traineeId,
    trainerId: service === 'trainer-profile' ? (targetId || currentRoute.trainerId) : currentRoute.trainerId
  };
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderPublicHeader(activeNav) {
  return `
    <header class="mnc-header">
      <div class="mnc-brand" id="brand-home" style="gap: 0.85rem; cursor: pointer;">
        ${renderBrandLogo({ size: 'header' })}
        <div style="display: flex; flex-direction: column;">
          <div class="mnc-brand-mark" style="font-size: 1.15rem; line-height: 1.15; font-weight: 800; color: #ffffff;">
            GAFOOR <span style="color: #a1a1aa;">DRIVING SCHOOL</span>
          </div>
          <span style="font-size: 0.65rem; color: #a1a1aa; font-weight: 800; letter-spacing: 0.06em;">WALK IN &amp; DRIVE OUT · PULIVENDULA</span>
        </div>
        <span class="mnc-brand-tag" style="font-size: 0.65rem;">Govt. Approved Driving Academy</span>
      </div>

      <!-- Navigation Links -->
      <nav class="mnc-nav-links">
        <button type="button" class="mnc-nav-item ${activeNav === 'home' ? 'active' : ''}" data-nav="home">
          Home &amp; Courses
        </button>
        <button type="button" class="mnc-nav-item ${activeNav === 'admin' ? 'active' : ''}" data-nav="admin">
          Admin Office
        </button>
        <button type="button" class="mnc-nav-item ${activeNav === 'trainer' ? 'active' : ''}" data-nav="trainer">
          Instructor Portal
        </button>
        <button type="button" class="mnc-nav-item ${activeNav === 'trainee' ? 'active' : ''}" data-nav="trainee">
          Student Portal
        </button>
      </nav>

      <div class="mnc-header-actions">
        <button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm" id="btn-auth-action">
          Sign In (Login)
        </button>
      </div>
    </header>
  `;
}

function renderSidebar(role, currentSub) {
  if (role === 'admin') {
    return `
      <aside class="console-sidebar">
        <div class="console-sidebar-top-section">
          <!-- Brand Header -->
          <div class="console-sidebar-header">
            <div class="console-sidebar-header-left" id="sidebar-brand-home" title="Gafoor Driving School · Pulivendula">
              ${renderBrandLogo({ size: 'admin' })}
              <div class="console-sidebar-brand-text">
                <div class="console-sidebar-brand-title">
                  GAFOOR <span>DRIVING</span>
                </div>
                <span class="console-sidebar-portal-tag">Admin Office</span>
              </div>
            </div>
            <!-- ✦ Premium Hamburger Toggle ON the sidebar -->
            <button type="button" class="console-sidebar-hamburger ${isSidebarOpen ? 'is-open' : ''}" id="btn-sidebar-close-header" title="Toggle Sidebar">
              <span class="sidebar-ham-bar"></span>
              <span class="sidebar-ham-bar"></span>
              <span class="sidebar-ham-bar"></span>
            </button>
          </div>

          <!-- Navigation Links -->
          <nav class="console-sidebar-nav">
            <div class="console-sidebar-section-title">Office Management</div>

            <button type="button" class="console-sidebar-item ${currentSub === 'hub' ? 'active' : ''}" data-console-nav="hub" title="Office Overview">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span>Office Overview</span>
            </button>

            <button type="button" class="console-sidebar-item ${currentSub === 'trainees' ? 'active' : ''}" data-console-nav="trainees" title="Students Directory">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <span>Students Directory</span>
            </button>

            <button type="button" class="console-sidebar-item item-highlight ${currentSub === 'new-student' ? 'active' : ''}" data-console-nav="new-student" title="Register New Student">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>+ Register Student</span>
            </button>

            <button type="button" class="console-sidebar-item ${currentSub === 'billing' ? 'active' : ''}" data-console-nav="billing" title="Fee Payments &amp; Receipts">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
              <span>Fee Payments &amp; Receipts</span>
            </button>

            <button type="button" class="console-sidebar-item ${currentSub === 'trainers' ? 'active' : ''}" data-console-nav="trainers" title="Driving Instructors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
              <span>Driving Instructors</span>
            </button>

            <button type="button" class="console-sidebar-item ${currentSub === 'calendar' || currentSub === 'calendar-manager' ? 'active' : ''}" data-console-nav="calendar" title="Academy Calendar & Course">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>Academy Calendar</span>
            </button>

            <button type="button" class="console-sidebar-item ${currentSub === 'rto-scheduler' ? 'active' : ''}" data-console-nav="rto-scheduler" title="Driving Tests (RTO)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
              <span>Driving Tests (RTO)</span>
            </button>


          </nav>
        </div>

        <!-- Sidebar Footer -->
        <div class="console-sidebar-footer">
          <button type="button" class="console-sidebar-btn-subtle" id="btn-sidebar-home" title="Back to Website">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span>← Back to Website</span>
          </button>
          <button type="button" class="console-sidebar-btn-signout" id="btn-sidebar-signout" title="Sign Out">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Sign Out</span>
          </button>
          <div class="console-sidebar-branch-info">Pulivendula · AP-04 RTO</div>
        </div>
      </aside>
    `;
  }

  if (role === 'trainer') {
    return `
      <aside class="console-sidebar">
        <div class="console-sidebar-top-section">
          <!-- Brand Header -->
          <div class="console-sidebar-header">
            <div class="console-sidebar-header-left" id="sidebar-brand-home" title="Gafoor Driving School · Pulivendula">
              ${renderBrandLogo({ size: 'admin' })}
              <div class="console-sidebar-brand-text">
                <div class="console-sidebar-brand-title">
                  GAFOOR <span>DRIVING</span>
                </div>
                <span class="console-sidebar-portal-tag">Instructor Portal</span>
              </div>
            </div>
            <!-- ✦ Premium Hamburger Toggle ON the sidebar -->
            <button type="button" class="console-sidebar-hamburger ${isSidebarOpen ? 'is-open' : ''}" id="btn-sidebar-close-header" title="Toggle Sidebar">
              <span class="sidebar-ham-bar"></span>
              <span class="sidebar-ham-bar"></span>
              <span class="sidebar-ham-bar"></span>
            </button>
          </div>

          <!-- Navigation Links -->
          <nav class="console-sidebar-nav">
            <div class="console-sidebar-section-title">Daily Operations</div>

            <button type="button" class="console-sidebar-item ${currentSub === 'schedule' ? 'active' : ''}" data-console-nav="schedule" title="Daily Attendance Register">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><polyline points="9 16 12 19 16 14"></polyline></svg>
              <span>Daily Attendance Register</span>
            </button>

            <button type="button" class="console-sidebar-item ${currentSub === 'candidates' ? 'active' : ''}" data-console-nav="candidates" title="Assigned Students">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <span>Assigned Students</span>
            </button>

            <button type="button" class="console-sidebar-item ${currentSub === 'vehicle' ? 'active' : ''}" data-console-nav="vehicle" title="Daily Car Safety Check">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span>Daily Car Safety Check</span>
            </button>
          </nav>
        </div>

        <!-- Sidebar Footer -->
        <div class="console-sidebar-footer">
          <button type="button" class="console-sidebar-btn-toggle" id="btn-toggle-sidebar" title="${isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="${isSidebarOpen ? '15 18 9 12 15 6' : '9 18 15 12 9 6'}"></polyline></svg>
            <span>${isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}</span>
          </button>
          <button type="button" class="console-sidebar-btn-subtle" id="btn-sidebar-home" title="Back to Website">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span>← Back to Website</span>
          </button>
          <button type="button" class="console-sidebar-btn-signout" id="btn-sidebar-signout" title="Sign Out">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Sign Out</span>
          </button>
          <div class="console-sidebar-branch-info">Pulivendula · AP-04 RTO</div>
        </div>
      </aside>
    `;
  }

  // Trainee Portal
  return `
    <aside class="console-sidebar">
      <div class="console-sidebar-top-section">
        <!-- Brand Header -->
        <div class="console-sidebar-header">
          <div class="console-sidebar-header-left" id="sidebar-brand-home" title="Gafoor Driving School · Pulivendula">
            ${renderBrandLogo({ size: 'admin' })}
            <div class="console-sidebar-brand-text">
              <div class="console-sidebar-brand-title">
                GAFOOR <span>DRIVING</span>
              </div>
              <span class="console-sidebar-portal-tag">Student Portal</span>
            </div>
          </div>
          <!-- ✦ Premium Hamburger Toggle ON the sidebar -->
          <button type="button" class="console-sidebar-hamburger ${isSidebarOpen ? 'is-open' : ''}" id="btn-sidebar-close-header" title="Toggle Sidebar">
            <span class="sidebar-ham-bar"></span>
            <span class="sidebar-ham-bar"></span>
            <span class="sidebar-ham-bar"></span>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="console-sidebar-nav">
          <div class="console-sidebar-section-title">My Driving Course</div>

          <button type="button" class="console-sidebar-item ${currentSub === 'curriculum' ? 'active' : ''}" data-console-nav="curriculum" title="20-Day Driving Course">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
            <span>20-Day Driving Course</span>
          </button>

          <button type="button" class="console-sidebar-item ${currentSub === 'billing' ? 'active' : ''}" data-console-nav="billing" title="Course Fees &amp; Receipts">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            <span>Course Fees &amp; Receipts</span>
          </button>

          <button type="button" class="console-sidebar-item ${currentSub === 'profile' ? 'active' : ''}" data-console-nav="profile" title="Student Profile &amp; LLR">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>Student Profile &amp; LLR</span>
          </button>
        </nav>
      </div>

      <!-- Sidebar Footer -->
      <div class="console-sidebar-footer">
        <button type="button" class="console-sidebar-btn-toggle" id="btn-toggle-sidebar" title="${isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="${isSidebarOpen ? '15 18 9 12 15 6' : '9 18 15 12 9 6'}"></polyline></svg>
          <span>${isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}</span>
        </button>
        <button type="button" class="console-sidebar-btn-subtle" id="btn-sidebar-home" title="Back to Website">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span>← Back to Website</span>
        </button>
        <button type="button" class="console-sidebar-btn-signout" id="btn-sidebar-signout" title="Sign Out">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span>Sign Out</span>
        </button>
        <div class="console-sidebar-branch-info">Pulivendula · AP-04 RTO</div>
      </div>
    </aside>
  `;
}

function getSubTitle(service, subService) {
  const titles = {
    'admin': {
      'hub': 'Administrative Office Overview',
      'trainees': 'Students Directory & Records',
      'new-student': 'Register New Student',
      'billing': 'Course Fee Payments & Receipts',
      'trainers': 'Driving Instructors Roster',
      'calendar': 'Academy Calendar & Course Management',
      'rto-scheduler': 'Government Driving License (DL) Tests'
    },
    'trainer': {
      'schedule': 'Daily Attendance Register',
      'candidates': 'Assigned Students Roster',
      'vehicle': 'Daily Car Safety Check'
    },
    'trainee': {
      'curriculum': '20-Day Practical Driving Course',
      'billing': 'Course Fee Payment & Receipts',
      'profile': 'Student Profile & Learner License (LLR)'
    },
    'trainee-profile': {
      'trainees': 'Student Profile Details',
      'profile': 'Student Particulars & KYC',
      'course': '20-Day Driving Course',
      'fees': 'Fee Ledger & Receipts',
      'instructor': 'Instructor & Car',
      'rto': 'Govt DL Test & RTO'
    },
    'trainer-profile': {
      'trainers': 'Instructor Profile & Credentials'
    }
  };
  return titles[service]?.[subService] || 'Console Management';
}

function getPortalTitle(service) {
  if (service === 'admin' || service === 'trainee-profile' || service === 'trainer-profile') return 'Admin Office';
  if (service === 'trainer') return 'Instructor Portal';
  return 'Student Portal';
}

function attachSidebarEvents(role) {
  const brandHome = document.getElementById('sidebar-brand-home');
  if (brandHome) {
    brandHome.addEventListener('click', () => {
      navigateTo('home');
    });
  }

  // Sidebar Close Button in Header
  const btnCloseHeader = document.getElementById('btn-sidebar-close-header');
  if (btnCloseHeader) {
    btnCloseHeader.addEventListener('click', () => {
      toggleSidebar();
    });
  }

  // Sidebar Toggle Button in Footer
  const btnToggle = document.getElementById('btn-toggle-sidebar');
  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      toggleSidebar();
    });
  }

  // Topbar Toggle Button
  const btnTopbarToggle = document.getElementById('btn-topbar-toggle-sidebar');
  if (btnTopbarToggle) {
    btnTopbarToggle.addEventListener('click', () => {
      toggleSidebar();
    });
  }

  appRoot.querySelectorAll('[data-console-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSub = btn.dataset.consoleNav;
      navigateTo(role, targetSub);
    });
  });

  const btnReturn = document.getElementById('btn-sidebar-home');
  if (btnReturn) {
    btnReturn.addEventListener('click', () => {
      navigateTo('home');
    });
  }

  const btnSignout = document.getElementById('btn-sidebar-signout');
  if (btnSignout) {
    btnSignout.addEventListener('click', () => {
      navigateTo('login');
    });
  }
}

function render() {
  const { service, subService, traineeId, trainerId } = currentRoute;

  // 1. SHOWCASE HOMEPAGE
  if (service === 'home') {
    appRoot.innerHTML = `
      ${renderPublicHeader('home')}
      <main id="home-canvas" class="console-canvas"></main>
    `;

    const canvas = document.getElementById('home-canvas');
    attachGlobalHeaderEvents();
    renderHomeWebsiteView(canvas, (navTarget, targetSub, targetId) => {
      navigateTo(navTarget, targetSub, targetId);
    });
    return;
  }

  // 2. LOGIN VIEW
  if (service === 'login') {
    appRoot.innerHTML = '';
    renderLoginView(appRoot, (role, entity) => {
      store.setRole(role);
      if (role === 'trainee' && entity) {
        store.setCurrentTrainee(entity.id);
        showToast(`Welcome back, ${entity.name}! (Code: ${entity.studentCode || entity.id})`, 'success');
        navigateTo('trainee', 'curriculum', entity.id);
        return;
      }
      if (role === 'trainer' && entity) {
        showToast(`Welcome back, Instructor ${entity.name}! (Code: ${entity.trainerCode || entity.id})`, 'success');
        navigateTo('trainer', 'schedule', entity.id);
        return;
      }
      showToast(`Signed in as ${role.toUpperCase()}`, 'success');
      if (role === 'admin') {
        navigateTo('admin', 'hub');
      } else if (role === 'trainer') {
        navigateTo('trainer', 'schedule');
      } else {
        navigateTo('trainee', 'curriculum');
      }
    }, () => {
      navigateTo('home');
    });
    return;
  }

  // 3. ADMIN OPERATIONS CONSOLE — TOP NAV BAR LAYOUT
  if (service === 'admin') {
    const activeSub = subService || 'hub';

    appRoot.innerHTML = `
      <div class="admin-layout">
        <header class="admin-topnav" id="admin-topnav">
          <div class="admin-topnav-brand" id="admin-brand-home">
            ${renderBrandLogo({ size: 'admin' })}
            <div class="admin-topnav-brand-text">
              <span class="admin-topnav-title">GAFOOR <span>DRIVING</span></span>
              <span class="admin-topnav-tag">Admin Office</span>
            </div>
          </div>

          <nav class="admin-topnav-links">
            <button type="button" class="admin-nav-btn ${activeSub === 'hub' ? 'active' : ''}" data-console-nav="hub">Overview</button>
            <button type="button" class="admin-nav-btn ${activeSub === 'trainees' ? 'active' : ''}" data-console-nav="trainees">Students</button>
            <button type="button" class="admin-nav-btn item-highlight ${activeSub === 'new-student' ? 'active' : ''}" data-console-nav="new-student">+ Register</button>
            <button type="button" class="admin-nav-btn ${activeSub === 'billing' ? 'active' : ''}" data-console-nav="billing">Payments</button>
            <button type="button" class="admin-nav-btn ${activeSub === 'trainers' ? 'active' : ''}" data-console-nav="trainers">Instructors</button>
            <button type="button" class="admin-nav-btn ${activeSub === 'calendar' || activeSub === 'calendar-manager' ? 'active' : ''}" data-console-nav="calendar">Calendar</button>
            <button type="button" class="admin-nav-btn ${activeSub === 'rto-scheduler' ? 'active' : ''}" data-console-nav="rto-scheduler">RTO Tests</button>
          </nav>

          <div class="admin-topnav-actions">
            <span class="admin-topnav-badge"><span class="admin-topnav-dot"></span>Pulivendula · AP-04</span>
            <button type="button" class="admin-topnav-btn-subtle" id="btn-admin-home">← Website</button>
            <button type="button" class="admin-topnav-btn-signout" id="btn-admin-signout">Sign Out</button>
          </div>
        </header>

        <div class="admin-canvas-body" id="admin-sub-canvas"></div>
      </div>
    `;

    // Attach nav events
    appRoot.querySelectorAll('[data-console-nav]').forEach(btn => {
      btn.addEventListener('click', () => navigateTo('admin', btn.dataset.consoleNav));
    });
    document.getElementById('admin-brand-home')?.addEventListener('click', () => navigateTo('home'));
    document.getElementById('btn-admin-home')?.addEventListener('click', () => navigateTo('home'));
    document.getElementById('btn-admin-signout')?.addEventListener('click', () => navigateTo('login'));

    const subCanvas = document.getElementById('admin-sub-canvas');
    renderAdminView(subCanvas, showToast, activeSub, (navTarget, targetId) => {
      if (navTarget === 'trainee-profile') {
        navigateTo('trainee-profile', 'trainees', targetId);
      } else if (navTarget === 'trainer-profile') {
        navigateTo('trainer-profile', 'trainers', targetId);
      } else {
        navigateTo('admin', navTarget);
      }
    });
    return;
  }

  // 4a. STUDENT PROFILE — TOP NAV LAYOUT
  if (service === 'trainee-profile') {
    const student = store.trainees.find(t => t.id === traineeId) || store.trainees[0];

    appRoot.innerHTML = `
      <div class="admin-layout">
        <header class="admin-topnav">
          <div class="admin-topnav-brand" id="admin-brand-home">
            ${renderBrandLogo({ size: 'admin' })}
            <div class="admin-topnav-brand-text">
              <span class="admin-topnav-title">GAFOOR <span>DRIVING</span></span>
              <span class="admin-topnav-tag">Admin Office</span>
            </div>
          </div>

          <nav class="admin-topnav-links">
            <button type="button" class="admin-nav-btn" data-console-nav-admin="hub">Overview</button>
            <button type="button" class="admin-nav-btn active" data-console-nav-admin="trainees">Students</button>
            <button type="button" class="admin-nav-btn item-highlight" data-console-nav-admin="new-student">+ Register</button>
            <button type="button" class="admin-nav-btn" data-console-nav-admin="billing">Payments</button>
            <button type="button" class="admin-nav-btn" data-console-nav-admin="trainers">Instructors</button>
            <button type="button" class="admin-nav-btn" data-console-nav-admin="calendar">Calendar</button>
            <button type="button" class="admin-nav-btn" data-console-nav-admin="rto-scheduler">RTO Tests</button>
          </nav>

          <div class="admin-topnav-actions">
            <span class="admin-topnav-badge"><span class="admin-topnav-dot"></span>Pulivendula · AP-04</span>
            <button type="button" class="admin-topnav-btn-subtle" id="btn-admin-home">← Website</button>
            <button type="button" class="admin-topnav-btn-signout" id="btn-admin-signout">Sign Out</button>
          </div>
        </header>

        <div class="admin-canvas-body" id="profile-canvas"></div>
      </div>
    `;

    appRoot.querySelectorAll('[data-console-nav-admin]').forEach(btn => {
      btn.addEventListener('click', () => navigateTo('admin', btn.dataset.consoleNavAdmin));
    });
    document.getElementById('admin-brand-home')?.addEventListener('click', () => navigateTo('home'));
    document.getElementById('btn-admin-home')?.addEventListener('click', () => navigateTo('home'));
    document.getElementById('btn-admin-signout')?.addEventListener('click', () => navigateTo('login'));

    const canvas = document.getElementById('profile-canvas');
    renderTraineeDetailView(canvas, traineeId, showToast, (navTarget) => {
      navigateTo('admin', navTarget);
    }, subService || 'profile');
    return;
  }

  // 4b. INSTRUCTOR PROFILE — TOP NAV LAYOUT
  if (service === 'trainer-profile') {
    const trainer = store.trainers.find(tr => tr.id === trainerId) || store.trainers[0];

    appRoot.innerHTML = `
      <div class="admin-layout">
        <header class="admin-topnav">
          <div class="admin-topnav-brand" id="admin-brand-home">
            ${renderBrandLogo({ size: 'admin' })}
            <div class="admin-topnav-brand-text">
              <span class="admin-topnav-title">GAFOOR <span>DRIVING</span></span>
              <span class="admin-topnav-tag">Admin Office</span>
            </div>
          </div>

          <nav class="admin-topnav-links">
            <button type="button" class="admin-nav-btn" data-console-nav-admin="hub">Overview</button>
            <button type="button" class="admin-nav-btn" data-console-nav-admin="trainees">Students</button>
            <button type="button" class="admin-nav-btn item-highlight" data-console-nav-admin="new-student">+ Register</button>
            <button type="button" class="admin-nav-btn" data-console-nav-admin="billing">Payments</button>
            <button type="button" class="admin-nav-btn active" data-console-nav-admin="trainers">Instructors</button>
            <button type="button" class="admin-nav-btn" data-console-nav-admin="calendar">Calendar</button>
            <button type="button" class="admin-nav-btn" data-console-nav-admin="rto-scheduler">RTO Tests</button>
          </nav>

          <div class="admin-topnav-actions">
            <span class="admin-topnav-badge"><span class="admin-topnav-dot"></span>Pulivendula · AP-04</span>
            <button type="button" class="admin-topnav-btn-subtle" id="btn-admin-home">← Website</button>
            <button type="button" class="admin-topnav-btn-signout" id="btn-admin-signout">Sign Out</button>
          </div>
        </header>

        <div class="admin-canvas-body" id="trainer-profile-canvas"></div>
      </div>
    `;

    appRoot.querySelectorAll('[data-console-nav-admin]').forEach(btn => {
      btn.addEventListener('click', () => navigateTo('admin', btn.dataset.consoleNavAdmin));
    });
    document.getElementById('admin-brand-home')?.addEventListener('click', () => navigateTo('home'));
    document.getElementById('btn-admin-home')?.addEventListener('click', () => navigateTo('home'));
    document.getElementById('btn-admin-signout')?.addEventListener('click', () => navigateTo('login'));

    const canvas = document.getElementById('trainer-profile-canvas');
    renderTrainerDetailView(canvas, trainerId, showToast, (navTarget, targetSubId) => {
      if (navTarget === 'trainee-profile') {
        navigateTo('trainee-profile', 'trainees', targetSubId);
      } else {
        navigateTo('admin', navTarget || 'trainers');
      }
    });
    return;
  }

  // 5. INSTRUCTOR PORTAL — TOP NAV BAR LAYOUT
  if (service === 'trainer') {
    const activeSub = subService || 'schedule';

    appRoot.innerHTML = `
      <div class="admin-layout">
        <header class="admin-topnav">
          <div class="admin-topnav-brand" id="portal-brand-home">
            ${renderBrandLogo({ size: 'admin' })}
            <div class="admin-topnav-brand-text">
              <span class="admin-topnav-title">GAFOOR <span>DRIVING</span></span>
              <span class="admin-topnav-tag">Instructor Portal</span>
            </div>
          </div>

          <nav class="admin-topnav-links">
            <button type="button" class="admin-nav-btn ${activeSub === 'schedule' ? 'active' : ''}" data-portal-nav="schedule">Attendance</button>
            <button type="button" class="admin-nav-btn ${activeSub === 'candidates' ? 'active' : ''}" data-portal-nav="candidates">My Students</button>
            <button type="button" class="admin-nav-btn ${activeSub === 'vehicle' ? 'active' : ''}" data-portal-nav="vehicle">Vehicle Check</button>
          </nav>

          <div class="admin-topnav-actions">
            <span class="admin-topnav-badge"><span class="admin-topnav-dot"></span>Pulivendula · AP-04</span>
            <button type="button" class="admin-topnav-btn-subtle" id="btn-portal-home">← Website</button>
            <button type="button" class="admin-topnav-btn-signout" id="btn-portal-signout">Sign Out</button>
          </div>
        </header>

        <div class="admin-canvas-body" id="trainer-canvas"></div>
      </div>
    `;

    appRoot.querySelectorAll('[data-portal-nav]').forEach(btn => {
      btn.addEventListener('click', () => navigateTo('trainer', btn.dataset.portalNav));
    });
    document.getElementById('portal-brand-home')?.addEventListener('click', () => navigateTo('home'));
    document.getElementById('btn-portal-home')?.addEventListener('click', () => navigateTo('home'));
    document.getElementById('btn-portal-signout')?.addEventListener('click', () => navigateTo('login'));

    const canvas = document.getElementById('trainer-canvas');
    renderTrainerView(canvas, showToast, activeSub, (targetSub) => {
      navigateTo('trainer', targetSub);
    });
    return;
  }

  // 6. STUDENT PORTAL — TOP NAV BAR LAYOUT
  if (service === 'trainee') {
    const activeSub = subService || 'curriculum';

    const currentTrainee = store.getCurrentTrainee();

    appRoot.innerHTML = `
      <div class="admin-layout">
        <header class="admin-topnav">
          <div class="admin-topnav-brand" id="portal-brand-home">
            ${renderBrandLogo({ size: 'admin' })}
            <div class="admin-topnav-brand-text">
              <span class="admin-topnav-title">GAFOOR <span>DRIVING</span></span>
              <span class="admin-topnav-tag">Student Portal</span>
            </div>
          </div>

          <nav class="admin-topnav-links">
            <button type="button" class="admin-nav-btn ${activeSub === 'curriculum' ? 'active' : ''}" data-portal-nav="curriculum">My Course</button>
            <button type="button" class="admin-nav-btn ${activeSub === 'billing' ? 'active' : ''}" data-portal-nav="billing">Fees &amp; Receipts</button>
            <button type="button" class="admin-nav-btn ${activeSub === 'profile' ? 'active' : ''}" data-portal-nav="profile">My Profile</button>
          </nav>

          <div class="admin-topnav-actions">
            ${currentTrainee ? `
              <div id="btn-topbar-student-profile" style="display:flex; align-items:center; gap:0.55rem; cursor:pointer; padding:0.2rem 0.55rem; border-radius:20px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15);" title="View My Profile">
                ${renderStudentAvatar(currentTrainee, 26)}
                <span style="font-size:0.75rem; font-weight:700; color:#ffffff;">${currentTrainee.name.split(' ')[0]}</span>
              </div>
            ` : ''}
            <span class="admin-topnav-badge"><span class="admin-topnav-dot"></span>Pulivendula · AP-04</span>
            <button type="button" class="admin-topnav-btn-subtle" id="btn-portal-home">← Website</button>
            <button type="button" class="admin-topnav-btn-signout" id="btn-portal-signout">Sign Out</button>
          </div>
        </header>

        <div class="admin-canvas-body" id="trainee-canvas"></div>
      </div>
    `;

    appRoot.querySelectorAll('[data-portal-nav]').forEach(btn => {
      btn.addEventListener('click', () => navigateTo('trainee', btn.dataset.portalNav));
    });
    document.getElementById('btn-topbar-student-profile')?.addEventListener('click', () => navigateTo('trainee', 'profile'));
    document.getElementById('portal-brand-home')?.addEventListener('click', () => navigateTo('home'));
    document.getElementById('btn-portal-home')?.addEventListener('click', () => navigateTo('home'));
    document.getElementById('btn-portal-signout')?.addEventListener('click', () => navigateTo('login'));

    const canvas = document.getElementById('trainee-canvas');
    renderTraineeView(canvas, showToast, activeSub, (targetSub) => {
      navigateTo('trainee', targetSub);
    });
    return;
  }
}

function attachGlobalHeaderEvents() {
  const brandHome = document.getElementById('brand-home');
  if (brandHome) {
    brandHome.addEventListener('click', () => {
      navigateTo('home');
    });
  }

  appRoot.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.nav;
      if (target === 'home') navigateTo('home');
      else if (target === 'admin') navigateTo('admin', 'hub');
      else if (target === 'trainer') navigateTo('trainer', 'schedule');
      else if (target === 'trainee') navigateTo('trainee', 'curriculum');
    });
  });

  const btnAuth = document.getElementById('btn-auth-action');
  if (btnAuth) {
    btnAuth.addEventListener('click', () => {
      navigateTo('login');
    });
  }
}

// Initial start on the Public MNC Showcase Landing Page
navigateTo('home');

