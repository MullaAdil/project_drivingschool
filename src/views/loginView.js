/* ==========================================================================
   GAFOOR DRIVING SCHOOL — AUTHENTICATION PORTAL (PULIVENDULA)
   "Walk in & Drive out"
   Institutional access portal with Administrator, Instructor & Candidate login.
   ========================================================================== */

import { store } from '../store.js';
import { renderBrandLogo } from '../components/brandLogo.js';

export function renderLoginView(container, onLoginSuccess, onBack) {
  let selectedRole = 'admin';

  const template = `
    <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2.5rem 1.5rem; background: var(--cred-bg); position: relative; overflow: hidden;">
      <!-- Ambient Glow Behind Vault Card -->
      <div style="position: absolute; top: 15%; left: 50%; transform: translateX(-50%); width: 600px; height: 350px; background: radial-gradient(ellipse at center, rgba(243, 209, 130, 0.09) 0%, rgba(0, 245, 155, 0.04) 45%, transparent 70%); pointer-events: none; filter: blur(40px);"></div>

      <!-- Top Return to Website Pill -->
      <div style="margin-bottom: 1.5rem; position: relative; z-index: 2;">
        <button type="button" id="btn-back-home" class="btn-mnc btn-mnc-secondary btn-mnc-sm" style="border-radius: 9999px; padding: 0.45rem 1.15rem; font-size: 0.8rem;">
          ← Return to Public Showcase
        </button>
      </div>

      <div style="width: 100%; max-width: 480px; background: linear-gradient(180deg, rgba(22, 26, 36, 0.95) 0%, rgba(13, 16, 23, 0.98) 100%); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 28px; box-shadow: 0 32px 80px -16px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.18); padding: 2.75rem 2.25rem; position: relative; z-index: 2;">
        
        <div style="text-align: center; margin-bottom: 2rem;">
          <div style="margin-bottom: 1rem; display: flex; justify-content: center;">
            ${renderBrandLogo({ size: 'lg' })}
          </div>
          <div>
            <div class="mnc-brand-mark" style="font-size: 1.45rem; line-height: 1.15; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
              GAFOOR <span style="color: var(--primary-gold);">DRIVING SCHOOL</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--primary-gold); font-weight: 800; letter-spacing: 0.08em; margin-top: 0.35rem; text-transform: uppercase;">
              WALK IN &amp; DRIVE OUT · PULIVENDULA (AP RTO)
            </div>
          </div>
          <p style="font-size: 0.85rem; color: var(--slate-body); margin-top: 0.5rem; line-height: 1.5;">
            Institutional Access Vault &amp; Operations Suite
          </p>
        </div>

        <!-- Role Selector Segmented Pill Bar -->
        <div style="display: flex; background: rgba(255, 255, 255, 0.04); padding: 4px; border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 2rem;">
          <button type="button" class="dash-tab-btn active" data-role="admin" style="flex: 1; padding: 0.55rem 0.75rem; font-size: 0.825rem; border-radius: 9999px; border: none; cursor: pointer; transition: all 0.2s ease;">
            Administrator
          </button>
          <button type="button" class="dash-tab-btn" data-role="trainer" style="flex: 1; padding: 0.55rem 0.75rem; font-size: 0.825rem; border-radius: 9999px; border: none; cursor: pointer; transition: all 0.2s ease;">
            Instructor
          </button>
          <button type="button" class="dash-tab-btn" data-role="trainee" style="flex: 1; padding: 0.55rem 0.75rem; font-size: 0.825rem; border-radius: 9999px; border: none; cursor: pointer; transition: all 0.2s ease;">
            Candidate
          </button>
        </div>

        <form id="institutional-login-form">
          <div style="margin-bottom: 1.25rem;">
            <label for="login-email" id="email-label" style="display: block; font-size: 0.75rem; font-weight: 700; color: #8e9aa8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.45rem;">
              Administrator Email
            </label>
            <input type="email" class="mnc-input" id="login-email" required value="admin@gafoordriving.in" style="width: 100%; box-sizing: border-box;" />
          </div>

          <div style="margin-bottom: 1.75rem;">
            <label for="login-password" style="display: block; font-size: 0.75rem; font-weight: 700; color: #8e9aa8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.45rem;">
              Security Password
            </label>
            <input type="password" class="mnc-input" id="login-password" required value="••••••••••••" style="width: 100%; box-sizing: border-box;" />
          </div>

          <button type="submit" class="btn-mnc btn-mnc-primary" style="width: 100%; padding: 0.85rem; font-size: 0.95rem; font-weight: 800; border-radius: 9999px;">
            Sign In to Portal →
          </button>
        </form>

        <!-- Quick Fill Test Accounts -->
        <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.08);">
          <div style="font-size: 0.725rem; font-weight: 800; color: #8e9aa8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.75rem;">
            Quick Fill Demo Profiles:
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <button type="button" class="btn-quick-login" data-role-fill="admin" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 0.7rem 1rem; color: #ffffff; cursor: pointer; text-align: left; transition: all 0.2s ease;">
              <span style="font-weight: 700; font-size: 0.85rem;">Admin Console (HQ)</span>
              <span style="color: var(--primary-gold); font-size: 0.75rem; font-family: var(--font-mono);">admin@gafoordriving.in</span>
            </button>
            <button type="button" class="btn-quick-login" data-role-fill="trainer" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 0.7rem 1rem; color: #ffffff; cursor: pointer; text-align: left; transition: all 0.2s ease;">
              <span style="font-weight: 700; font-size: 0.85rem;">Trainer K. Srinivas Rao</span>
              <span style="color: var(--primary-green); font-size: 0.75rem; font-family: var(--font-mono);">srinivas.rao@gafoordriving.in</span>
            </button>
            <button type="button" class="btn-quick-login" data-role-fill="trainee" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 0.7rem 1rem; color: #ffffff; cursor: pointer; text-align: left; transition: all 0.2s ease;">
              <span style="font-weight: 700; font-size: 0.85rem;">Candidate Sai Kiran (Day 14)</span>
              <span style="color: #00d2ff; font-size: 0.75rem; font-family: var(--font-mono);">sai.kiran@gafoordriving.in</span>
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

  const btnBackHome = container.querySelector('#btn-back-home');
  if (btnBackHome && onBack) {
    btnBackHome.addEventListener('click', () => {
      onBack();
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    store.setRole(selectedRole);
    if (onLoginSuccess) onLoginSuccess(selectedRole);
  });
}
