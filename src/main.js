/* ==========================================================================
   APEX DRIVE — ENTERPRISE APPLICATION ORCHESTRATOR
   Core Structure:
   - 3 separate logins, 3 separate dashboards:
     * Admin Dashboard = Full Control (add/edit Trainees & Trainers, Payments QR & status)
     * Trainer Dashboard = Attendance only (marks arrival at scheduled time slot)
     * Trainee Dashboard = View 20-day program (8 km/day) + pay via QR + see feedback
   - Single login page with role selection (Admin / Trainer / Trainee)
   - MNC Enterprise Showcase Landing Page
   ========================================================================== */

import { store } from './store.js';
import { renderHomeWebsiteView } from './views/homeWebsiteView.js';
import { renderLoginView } from './views/loginView.js';
import { renderAdminView } from './views/adminView.js';
import { renderTraineeDetailView } from './views/traineeDetailView.js';
import { renderTrainerDetailView } from './views/trainerDetailView.js';
import { renderTrainerView } from './views/trainerView.js';
import { renderTraineeView } from './views/traineeView.js';
import { renderBrandLogo } from './components/brandLogo.js';

const appRoot = document.getElementById('app');

// State Route Definition
let currentRoute = {
  service: 'home', // 'home' | 'admin' | 'trainee-profile' | 'trainer-profile' | 'trainer' | 'trainee' | 'login'
  subService: 'trainees', // for admin: 'trainees' | 'billing' | 'trainers'
  traineeId: 'APX-9021',
  trainerId: 'TRN-1'
};

// Global Toast Manager (Natu Telugu Warm Style)
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: var(--charcoal);
    color: #ffffff;
    padding: 0.75rem 1.25rem;
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-modal);
    font-size: 0.875rem;
    font-weight: 600;
    max-width: 440px;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-left: 4px solid ${type === 'success' ? 'var(--neem-green)' : 'var(--terracotta)'};
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

export function navigateTo(service, subService = 'trainees', targetId = null) {
  currentRoute = {
    service,
    subService,
    traineeId: service === 'trainee-profile' ? (targetId || currentRoute.traineeId) : currentRoute.traineeId,
    trainerId: service === 'trainer-profile' ? (targetId || currentRoute.trainerId) : currentRoute.trainerId
  };
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderHeader(activeNav) {
  let roleBadge = 'RTO ACADEMY';
  let navItems = '';

  if (activeNav === 'admin' || currentRoute.service === 'admin' || currentRoute.service === 'trainee-profile' || currentRoute.service === 'trainer-profile') {
    roleBadge = 'ADMINISTRATOR';
    navItems = `
      <button type="button" class="mnc-nav-item ${currentRoute.subService === 'trainees' && currentRoute.service === 'admin' ? 'active' : ''}" data-nav="admin-trainees">
        Candidates Service
      </button>
      <button type="button" class="mnc-nav-item ${currentRoute.subService === 'billing' ? 'active' : ''}" data-nav="admin-billing">
        Payments Service
      </button>
      <button type="button" class="mnc-nav-item ${currentRoute.subService === 'trainers' && currentRoute.service === 'admin' ? 'active' : ''}" data-nav="admin-trainers">
        Trainers Service
      </button>
      <button type="button" class="mnc-nav-item" data-nav="home">
        Public Website
      </button>
    `;
  } else if (activeNav === 'trainer') {
    roleBadge = 'INSTRUCTOR DISPATCH';
    navItems = `
      <button type="button" class="mnc-nav-item active" data-nav="trainer">
        Daily Schedule & Attendance
      </button>
      <button type="button" class="mnc-nav-item" data-nav="home">
        Public Website
      </button>
    `;
  } else if (activeNav === 'trainee') {
    roleBadge = 'CANDIDATE PORTAL';
    navItems = `
      <button type="button" class="mnc-nav-item active" data-nav="trainee">
        20-Day Course & Curriculum (8 km/day)
      </button>
      <button type="button" class="mnc-nav-item" data-nav="home">
        Public Website
      </button>
    `;
  } else {
    // Showcase home
    roleBadge = 'RTO ACADEMY';
    navItems = `
      <button type="button" class="mnc-nav-item active" data-nav="home">
        Home & Courses
      </button>
      <button type="button" class="mnc-nav-item" data-nav="admin">
        Admin Console
      </button>
      <button type="button" class="mnc-nav-item" data-nav="trainer">
        Trainer Dispatch
      </button>
      <button type="button" class="mnc-nav-item" data-nav="trainee">
        Candidate Portal
      </button>
    `;
  }

  return `
    <header class="mnc-header">
      <div class="mnc-brand" id="brand-home" style="gap: 0.85rem; cursor: pointer;">
        ${renderBrandLogo({ size: 'header' })}
        <div style="display: flex; flex-direction: column;">
          <div class="mnc-brand-mark" style="font-size: 1.15rem; line-height: 1.15; font-weight: 800; color: #ffffff;">
            GAFOOR <span style="color: var(--primary-gold);">DRIVING SCHOOL</span>
          </div>
          <span style="font-size: 0.65rem; color: var(--primary-gold); font-weight: 800; letter-spacing: 0.06em;">WALK IN &amp; DRIVE OUT · PULIVENDULA (AP RTO)</span>
        </div>
        <span class="mnc-brand-tag" style="font-size: 0.65rem;">${roleBadge}</span>
      </div>

      <!-- Navigation Links -->
      <nav class="mnc-nav-links">
        ${navItems}
      </nav>

      <div class="mnc-header-actions">
        <button type="button" class="btn-mnc ${activeNav === 'home' ? 'btn-mnc-primary' : 'btn-mnc-secondary'} btn-mnc-sm" id="btn-auth-action">
          ${activeNav === 'home' ? 'Portal Login (Sign In)' : 'Switch Role / Sign Out'}
        </button>
      </div>
    </header>
  `;
}

function renderAdminHeader() {
  const currentSub = currentRoute.subService || 'hub';
  return `
    <header class="admin-app-header">
      <div class="admin-nav-bar">
        <div class="admin-brand" id="admin-brand-home" style="gap: 0.75rem;">
          ${renderBrandLogo({ size: 'admin' })}
          <div style="display: flex; flex-direction: column;">
            <div class="admin-brand-title">
              GAFOOR <span>DRIVING SCHOOL</span>
            </div>
            <span class="admin-brand-sub">PULIVENDULA · ADMIN CONSOLE</span>
          </div>
        </div>

        <!-- Clean, Minimal Menu Bar -->
        <nav class="admin-service-tabs">
          <button type="button" class="admin-service-tab ${currentSub === 'hub' ? 'active' : ''}" data-admin-nav="hub">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Overview
          </button>
          <button type="button" class="admin-service-tab ${currentSub === 'trainees' ? 'active' : ''}" data-admin-nav="trainees">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Students
          </button>
          <button type="button" class="admin-service-tab admin-tab-add ${currentSub === 'new-student' ? 'active' : ''}" data-admin-nav="new-student">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Student
          </button>
          <button type="button" class="admin-service-tab ${currentSub === 'billing' ? 'active' : ''}" data-admin-nav="billing">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            Transactions & Money
          </button>
          <button type="button" class="admin-service-tab ${currentSub === 'trainers' ? 'active' : ''}" data-admin-nav="trainers">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
            Instructors & Fleet
          </button>
        </nav>

        <div class="admin-header-actions">
          <button type="button" class="btn-admin-subtle" id="btn-return-public">
            ← Website
          </button>
          <button type="button" class="btn-admin-signout" id="btn-admin-signout">
            Sign Out
          </button>
        </div>
      </div>
    </header>
  `;
}

function render() {
  const { service, subService, traineeId, trainerId } = currentRoute;

  // 1. SHOWCASE HOMEPAGE (THE TOP-TIER MNC WEBSITE)
  if (service === 'home') {
    appRoot.innerHTML = `
      ${renderHeader('home')}
      <main id="home-canvas"></main>
    `;

    const canvas = document.getElementById('home-canvas');
    attachGlobalHeaderEvents();
    renderHomeWebsiteView(canvas, (navTarget, targetSub, targetId) => {
      navigateTo(navTarget, targetSub, targetId);
    });
    return;
  }

  // 2. LOGIN VIEW (SINGLE LOGIN PAGE WITH ROLE SELECTION: ADMIN / TRAINER / TRAINEE)
  if (service === 'login') {
    appRoot.innerHTML = '';
    renderLoginView(appRoot, (role) => {
      store.setRole(role);
      showToast(`Signed in as ${role.toUpperCase()}`, 'success');
      if (role === 'admin') {
        navigateTo('admin', 'hub');
      } else if (role === 'trainer') {
        navigateTo('trainer');
      } else {
        navigateTo('trainee');
      }
    }, () => {
      navigateTo('home');
    });
    return;
  }

  // 3. ADMIN OPERATIONS SUITE (SEPARATE DEDICATED APPLICATION WITH SERVICES)
  if (service === 'admin') {
    appRoot.innerHTML = `
      <div class="admin-app-shell">
        <div class="liquid-bg-canvas" aria-hidden="true">
          <div class="liquid-orb liquid-orb-1"></div>
          <div class="liquid-orb liquid-orb-2"></div>
          <div class="liquid-orb liquid-orb-3"></div>
        </div>
        ${renderAdminHeader()}
        <main class="product-container" id="admin-canvas" style="padding-top: 2rem; padding-bottom: 4rem; position: relative; z-index: 1;">
          <div id="admin-sub-canvas" class="admin-sub-view-enter"></div>
        </main>
      </div>
    `;

    attachAdminHeaderEvents();

    const subCanvas = document.getElementById('admin-sub-canvas');
    renderAdminView(subCanvas, showToast, subService || 'hub', (navTarget, targetId) => {
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

  // 4a. DEDICATED TRAINEE PROFILE DOSSIER (ACCESS STUDENT SEPARATELY)
  if (service === 'trainee-profile') {
    appRoot.innerHTML = `
      <div class="admin-app-shell">
        <div class="liquid-bg-canvas" aria-hidden="true">
          <div class="liquid-orb liquid-orb-1"></div>
          <div class="liquid-orb liquid-orb-2"></div>
          <div class="liquid-orb liquid-orb-3"></div>
        </div>
        ${renderAdminHeader()}
        <main class="product-container" id="profile-canvas" style="padding-top: 2rem; padding-bottom: 4rem; position: relative; z-index: 1;"></main>
      </div>
    `;

    attachAdminHeaderEvents();
    const canvas = document.getElementById('profile-canvas');
    renderTraineeDetailView(canvas, traineeId, showToast, (navTarget) => {
      navigateTo('admin', navTarget);
    });
    return;
  }

  // 4b. DEDICATED TRAINER DOSSIER (ACCESS TRAINER SEPARATELY)
  if (service === 'trainer-profile') {
    appRoot.innerHTML = `
      <div class="admin-app-shell">
        <div class="liquid-bg-canvas" aria-hidden="true">
          <div class="liquid-orb liquid-orb-1"></div>
          <div class="liquid-orb liquid-orb-2"></div>
          <div class="liquid-orb liquid-orb-3"></div>
        </div>
        ${renderAdminHeader()}
        <main class="product-container" id="trainer-profile-canvas" style="padding-top: 2rem; padding-bottom: 4rem; position: relative; z-index: 1;"></main>
      </div>
    `;

    attachAdminHeaderEvents();
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

  // 5. TRAINER DISPATCH (ATTENDANCE ONLY)
  if (service === 'trainer') {
    appRoot.innerHTML = `
      ${renderHeader('trainer')}
      <main class="product-container" id="trainer-canvas"></main>
    `;

    attachGlobalHeaderEvents();
    const canvas = document.getElementById('trainer-canvas');
    renderTrainerView(canvas, showToast);
    return;
  }

  // 6. TRAINEE STUDENT PORTAL (VIEW PROGRESS + PAY + SEE FEEDBACK)
  if (service === 'trainee') {
    appRoot.innerHTML = `
      ${renderHeader('trainee')}
      <main class="product-container" id="trainee-canvas"></main>
    `;

    attachGlobalHeaderEvents();
    const canvas = document.getElementById('trainee-canvas');
    renderTraineeView(canvas, showToast);
    return;
  }
}

function attachAdminHeaderEvents() {
  const brandHome = document.getElementById('admin-brand-home');
  if (brandHome) {
    brandHome.addEventListener('click', () => {
      navigateTo('admin', 'hub');
    });
  }

  appRoot.querySelectorAll('[data-admin-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSub = btn.dataset.adminNav;
      navigateTo('admin', targetSub);
    });
  });

  const btnReturn = document.getElementById('btn-return-public');
  if (btnReturn) {
    btnReturn.addEventListener('click', () => {
      navigateTo('home');
    });
  }

  const btnSignout = document.getElementById('btn-admin-signout');
  if (btnSignout) {
    btnSignout.addEventListener('click', () => {
      navigateTo('login');
    });
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
      else if (target === 'admin-trainees') navigateTo('admin', 'trainees');
      else if (target === 'admin-billing') navigateTo('admin', 'billing');
      else if (target === 'admin-trainers') navigateTo('admin', 'trainers');
      else if (target === 'trainer') navigateTo('trainer');
      else if (target === 'trainee') navigateTo('trainee');
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
