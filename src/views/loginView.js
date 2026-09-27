/* ==========================================================================
   GAFOOR DRIVING SCHOOL — AUTHENTICATION PORTAL (PULIVENDULA)
   "Walk in & Drive out"
   Institutional access portal with Administrator, Instructor & Candidate login.
   ========================================================================== */

import { store } from '../store.js';
import { renderBrandLogo } from '../components/brandLogo.js';

export function renderLoginView(container, onLoginSuccess) {
  let selectedRole = 'admin';

  const template = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem 1.5rem; background: radial-gradient(circle at 50% 15%, #f2faf5 0%, #faf7f2 70%);">
      <div style="width: 100%; max-width: 480px; background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-md); box-shadow: var(--shadow-modal); padding: 2.5rem 2.25rem;">
        
        <div style="text-align: center; margin-bottom: 2rem;">
          <div style="margin-bottom: 1rem; display: flex; justify-content: center;">
            ${renderBrandLogo({ size: 'lg' })}
          </div>
          <div>
            <div class="mnc-brand-mark" style="font-size: 1.35rem; line-height: 1.15; font-weight: 800; color: #1c1917;">
              GAFOOR <span style="color: var(--terracotta);">DRIVING SCHOOL</span>
            </div>
            <div style="font-size: 0.75rem; color: var(--turmeric); font-weight: 800; letter-spacing: 0.04em; margin-top: 0.25rem;">
              WALK IN & DRIVE OUT · PULIVENDULA (AP RTO)
            </div>
          </div>
          <p style="font-size: 0.825rem; color: var(--slate-muted); margin-top: 0.45rem;">
            Institutional Portal Access & Operations Suite
          </p>
        </div>

        <!-- Role Selector Tab Bar -->
        <div style="display: flex; background: var(--bg-offwhite); padding: 4px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); margin-bottom: 1.75rem;">
          <button type="button" class="dash-tab-btn active" data-role="admin" style="padding: 0.5rem; font-size: 0.8rem;">
            Administrator
          </button>
          <button type="button" class="dash-tab-btn" data-role="trainer" style="padding: 0.5rem; font-size: 0.8rem;">
            Instructor
          </button>
          <button type="button" class="dash-tab-btn" data-role="trainee" style="padding: 0.5rem; font-size: 0.8rem;">
            Candidate
          </button>
        </div>

        <form id="institutional-login-form">
          <div style="margin-bottom: 1.25rem;">
            <label for="login-email" id="email-label" style="display: block; font-size: 0.775rem; font-weight: 700; color: var(--charcoal); text-transform: uppercase; margin-bottom: 0.35rem;">
              Administrator Email
            </label>
            <input type="email" class="mnc-input" id="login-email" required value="admin@gafoordriving.in" />
          </div>

          <div style="margin-bottom: 1.5rem;">
            <label for="login-password" style="display: block; font-size: 0.775rem; font-weight: 700; color: var(--charcoal); text-transform: uppercase; margin-bottom: 0.35rem;">
              Security Password
            </label>
            <input type="password" class="mnc-input" id="login-password" required value="••••••••••••" />
          </div>

          <button type="submit" class="btn-mnc btn-mnc-primary" style="width: 100%; padding: 0.75rem; font-size: 0.95rem;">
            Sign In to Portal →
          </button>
        </form>

        <!-- Quick Fill Test Accounts -->
        <div style="margin-top: 1.75rem; padding-top: 1.25rem; border-top: 1px solid var(--border-light);">
          <div style="font-size: 0.725rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.6rem;">
            Quick Fill Test Accounts:
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.45rem;">
            <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-quick-login" data-role-fill="admin" style="justify-content: space-between;">
              <span style="font-weight: 700;">Admin Console (Pulivendula HQ)</span>
              <span style="color: var(--slate-muted); font-size: 0.775rem;">admin@gafoordriving.in</span>
            </button>
            <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-quick-login" data-role-fill="trainer" style="justify-content: space-between;">
              <span style="font-weight: 700;">Trainer K. Srinivas Rao</span>
              <span style="color: var(--slate-muted); font-size: 0.775rem;">srinivas.rao@gafoordriving.in</span>
            </button>
            <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-quick-login" data-role-fill="trainee" style="justify-content: space-between;">
              <span style="font-weight: 700;">Candidate Sai Kiran Varma (Day 14)</span>
              <span style="color: var(--slate-muted); font-size: 0.775rem;">sai.kiran@gafoordriving.in</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `;

  container.innerHTML = template;

  const emailInput = container.querySelector('#login-email');
  const emailLabel = container.querySelector('#email-label');
  const roleTabs = container.querySelectorAll('.dash-tab-btn');
  const form = container.querySelector('#institutional-login-form');

  function setRole(role) {
    selectedRole = role;
    roleTabs.forEach(t => t.classList.toggle('active', t.dataset.role === role));
    if (role === 'admin') {
      emailLabel.textContent = 'Administrator Email';
      emailInput.value = 'admin@gafoordriving.in';
    } else if (role === 'trainer') {
      emailLabel.textContent = 'Instructor Email';
      emailInput.value = 'srinivas.rao@gafoordriving.in';
    } else {
      emailLabel.textContent = 'Candidate Email';
      emailInput.value = 'sai.kiran@gafoordriving.in';
    }
  }

  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      setRole(tab.dataset.role);
    });
  });

  container.querySelectorAll('.btn-quick-login').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.roleFill;
      setRole(role);
      store.setRole(role);
      if (onLoginSuccess) onLoginSuccess(role);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    store.setRole(selectedRole);
    if (onLoginSuccess) onLoginSuccess(selectedRole);
  });
}
