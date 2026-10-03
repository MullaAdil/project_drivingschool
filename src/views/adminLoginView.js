/* ==========================================================================
   GAFOOR DRIVING SCHOOL — ADMIN LOGIN VIEW
   Dedicated institutional security gate for Administrative Operations.
   Protects all Admin console pages (/admin, /admin/slots, etc.).
   ========================================================================== */

import { store } from '../store.js';
import { renderBrandLogo } from '../components/brandLogo.js';

export function renderAdminLoginView(container, onLoginSuccess, onBack) {
  container.innerHTML = `
    <div class="admin-login-wrapper" style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1.5rem; background: var(--cred-bg, #090a0f); position: relative; overflow-x: hidden;">
      
      <!-- Ambient Glow Behind Card -->
      <div style="position: absolute; top: 25%; left: 50%; transform: translateX(-50%); width: 700px; height: 380px; background: radial-gradient(ellipse at center, rgba(243, 209, 130, 0.06) 0%, transparent 70%); pointer-events: none; filter: blur(60px);"></div>

      <!-- Admin Login Card -->
      <div class="admin-login-card" style="width: 100%; max-width: 440px; background: #0f1117; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: var(--radius-lg, 16px); padding: 2.5rem 2rem; box-shadow: 0 30px 70px rgba(0, 0, 0, 0.95); position: relative; z-index: 2;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 2rem;">
          <div style="display: flex; justify-content: center; margin-bottom: 1rem;">
            ${renderBrandLogo({ size: 'md' })}
          </div>
          <h1 style="font-size: 1.65rem; font-weight: 900; color: #ffffff; letter-spacing: 0.04em; margin: 0 0 0.35rem; text-transform: uppercase;">
            ADMIN LOGIN
          </h1>
          <p style="font-size: 0.8125rem; color: var(--slate-muted, #94a3b8); margin: 0; line-height: 1.45;">
            Gafoor Driving School · Administrator Portal
          </p>
        </div>

        <!-- Alert Error Box -->
        <div id="admin-login-alert" style="display: none; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; padding: 0.8rem 1rem; border-radius: var(--radius-sm, 8px); font-size: 0.85rem; font-weight: 600; margin-bottom: 1.5rem; text-align: center; align-items: center; justify-content: center; gap: 0.5rem;">
          <span style="font-size: 1rem;">⚠️</span>
          <span id="admin-login-alert-text">Invalid username or password.</span>
        </div>

        <!-- Form -->
        <form id="admin-login-form" novalidate>
          
          <!-- Username / Email Field -->
          <div class="p-form-row" style="margin-bottom: 1.25rem;">
            <label for="admin-login-username" style="display: block; font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.45rem;">
              Username / Email
            </label>
            <input 
              type="text" 
              id="admin-login-username" 
              name="username" 
              class="mnc-input p-input" 
              placeholder="e.g. admin or admin@gafoordriving.in" 
              required 
              autocomplete="username"
              style="width: 100%; padding: 0.8rem 1rem; font-size: 0.9rem; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: var(--radius-sm, 8px); color: #ffffff;"
            />
          </div>

          <!-- Password Field with Show/Hide Toggle -->
          <div class="p-form-row" style="margin-bottom: 1.75rem;">
            <label for="admin-login-password" style="display: block; font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.45rem;">
              Password
            </label>
            <div style="position: relative; display: flex; align-items: center;">
              <input 
                type="password" 
                id="admin-login-password" 
                name="password" 
                class="mnc-input p-input" 
                placeholder="Enter password" 
                required 
                autocomplete="current-password"
                style="width: 100%; padding: 0.8rem 2.85rem 0.8rem 1rem; font-size: 0.9rem; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: var(--radius-sm, 8px); color: #ffffff;"
              />
              <button 
                type="button" 
                id="btn-toggle-password" 
                title="Show / Hide password" 
                style="position: absolute; right: 0.75rem; background: none; border: none; color: var(--slate-muted, #94a3b8); cursor: pointer; font-size: 1.15rem; display: flex; align-items: center; justify-content: center; padding: 0.3rem; border-radius: 4px; transition: color 0.15s ease;"
              >
                👁
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            id="btn-admin-login-submit" 
            class="btn-mnc btn-mnc-primary" 
            style="width: 100%; padding: 0.85rem; font-size: 0.95rem; font-weight: 800; border-radius: var(--radius-sm, 8px); cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 0.5rem; background: var(--primary-gold, #f3d182); color: #000000; border: none; box-shadow: 0 4px 14px rgba(243, 209, 130, 0.25);"
          >
            Login
          </button>
        </form>

        <!-- Back to Website Link -->
        <div style="margin-top: 1.5rem; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 1.25rem;">
          <button type="button" id="btn-admin-login-back" style="color: var(--slate-muted, #94a3b8); font-size: 0.825rem; background: none; border: none; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='var(--slate-muted, #94a3b8)'">
            ← Return to Website
          </button>
        </div>

      </div>

      <!-- Quick Hint for testing -->
      <div style="margin-top: 1.25rem; font-size: 0.75rem; color: rgba(255,255,255,0.3); text-align: center; font-family: var(--font-mono, monospace);">
        Admin Credentials: <span style="color: rgba(243,209,130,0.7);">admin / admin</span> or <span style="color: rgba(243,209,130,0.7);">admin123</span>
      </div>

    </div>
  `;

  const form = container.querySelector('#admin-login-form');
  const inpUsername = container.querySelector('#admin-login-username');
  const inpPassword = container.querySelector('#admin-login-password');
  const btnTogglePwd = container.querySelector('#btn-toggle-password');
  const btnSubmit = container.querySelector('#btn-admin-login-submit');
  const alertBox = container.querySelector('#admin-login-alert');
  const alertText = container.querySelector('#admin-login-alert-text');
  const btnBack = container.querySelector('#btn-admin-login-back');

  // Focus username input on load
  setTimeout(() => {
    if (inpUsername) inpUsername.focus();
  }, 100);

  // Toggle Password visibility
  let isPasswordVisible = false;
  btnTogglePwd.addEventListener('click', () => {
    isPasswordVisible = !isPasswordVisible;
    inpPassword.type = isPasswordVisible ? 'text' : 'password';
    btnTogglePwd.textContent = isPasswordVisible ? '👁‍🗨' : '👁';
    btnTogglePwd.title = isPasswordVisible ? 'Hide password' : 'Show password';
    btnTogglePwd.style.color = isPasswordVisible ? '#f3d182' : 'var(--slate-muted, #94a3b8)';
  });

  // Clear error alert on user input
  const clearError = () => {
    if (alertBox) alertBox.style.display = 'none';
    inpUsername.style.borderColor = 'rgba(255, 255, 255, 0.15)';
    inpPassword.style.borderColor = 'rgba(255, 255, 255, 0.15)';
  };
  inpUsername.addEventListener('input', clearError);
  inpPassword.addEventListener('input', clearError);

  // Back to website
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      if (onBack) onBack();
    });
  }

  // Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const username = (inpUsername.value || '').trim();
    const password = (inpPassword.value || '').trim();

    if (!username) {
      if (alertBox && alertText) {
        alertText.textContent = 'Please enter your username or email.';
        alertBox.style.display = 'flex';
      }
      inpUsername.style.borderColor = '#ef4444';
      inpUsername.focus();
      return;
    }

    if (!password) {
      if (alertBox && alertText) {
        alertText.textContent = 'Please enter your password.';
        alertBox.style.display = 'flex';
      }
      inpPassword.style.borderColor = '#ef4444';
      inpPassword.focus();
      return;
    }

    // Set loading state
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<span class="btn-loading-spinner" style="display:inline-block; width:16px; height:16px; border:2px solid #000; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:6px;"></span> Logging in...`;

    try {
      // Authenticate via backend API / store
      const res = await store.loginAdmin(username, password);

      if (res && res.success) {
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }
      } else {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Login';
        if (alertBox && alertText) {
          alertText.textContent = 'Invalid username or password.';
          alertBox.style.display = 'flex';
        }
        inpPassword.value = '';
        inpPassword.style.borderColor = '#ef4444';
        inpPassword.focus();
      }
    } catch (err) {
      console.error('Admin Login Error:', err);
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Login';
      if (alertBox && alertText) {
        alertText.textContent = 'Invalid username or password.';
        alertBox.style.display = 'flex';
      }
      inpPassword.value = '';
      inpPassword.style.borderColor = '#ef4444';
      inpPassword.focus();
    }
  });
}
