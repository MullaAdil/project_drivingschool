/* ==========================================================================
   GAFOOR DRIVING SCHOOL — SECURE AUTHENTICATION VAULT
   Admin-Controlled Credential Login Engine
   - Unified login: Username/Login ID + Password
   - Backend-driven role determination (ADMIN, TRAINER, USER)
   - Zero public registration or self-account creation
   - Instant inactive account prevention
   - Password show/hide toggle
   ========================================================================== */

import { store } from '../store.js';
import { renderBrandLogo } from '../components/brandLogo.js';

export function renderLoginView(container, onLoginSuccess, onBack) {
  const template = `
    <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1.5rem; background: var(--cred-bg); position: relative; overflow-x: hidden;">
      
      <!-- Ambient Glow Behind Vault Card -->
      <div style="position: absolute; top: 20%; left: 50%; transform: translateX(-50%); width: 850px; height: 440px; background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.05) 0%, transparent 70%); pointer-events: none; filter: blur(55px);"></div>

      <!-- Top Return to Website Pill -->
      <div style="margin-bottom: 1.5rem; position: relative; z-index: 2;">
        <button type="button" id="btn-back-home" class="btn-mnc btn-mnc-secondary btn-mnc-sm" style="border-radius: 9999px; padding: 0.5rem 1.25rem; font-size: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          Return to Public Showcase
        </button>
      </div>

      <!-- Widescreen Horizontal Vault Container -->
      <div class="login-vault-horizontal" style="max-width: 960px; width: 100%; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1); background: #0c0d12; box-shadow: 0 25px 60px rgba(0,0,0,0.85); display: grid; grid-template-columns: 1.05fr 1fr;">
        
        <!-- LEFT PANEL: Brand, Institutional Authority & Mode Guidance -->
        <div class="login-vault-left" style="background: rgba(255, 255, 255, 0.02); border-right: 1px solid rgba(255, 255, 255, 0.08); padding: 3rem 2.5rem; display: flex; flex-direction: column; justify-content: space-between;">
          
          <div>
            <!-- Brand Badge -->
            <div style="display: flex; align-items: center; gap: 0.9rem; margin-bottom: 1.5rem;">
              ${renderBrandLogo({ size: 'md' })}
              <div>
                <div class="mnc-brand-mark" style="font-size: 1.25rem; line-height: 1.15; font-weight: 900; color: #ffffff; letter-spacing: -0.02em;">
                  GAFOOR <span style="color: #a1a1aa;">DRIVING SCHOOL</span>
                </div>
                <div style="font-size: 0.68rem; color: #ffffff; font-weight: 800; letter-spacing: 0.08em; margin-top: 0.25rem; text-transform: uppercase;">
                  WALK IN &amp; DRIVE OUT · PULIVENDULA (AP RTO)
                </div>
              </div>
            </div>

            <p style="font-size: 0.85rem; color: var(--slate-body); line-height: 1.5; margin: 0 0 1.75rem;">
              Institutional Access Vault &amp; Digital Fleet Operations Suite. Secure access for academy administration, instructors, and enrolled students.
            </p>

            <!-- Role Guidance & Security Notice Card -->
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 1.35rem 1.25rem; margin-bottom: 1.5rem;">
              <div style="font-size: 0.72rem; font-weight: 800; color: var(--primary-gold); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.4rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Admin-Controlled Credentials
              </div>
              <div style="font-size: 1.02rem; font-weight: 800; color: #ffffff; margin-bottom: 0.5rem;">
                Single Unified Sign In
              </div>
              <div style="font-size: 0.8rem; color: #a1a1aa; line-height: 1.55;">
                Account credentials for students and instructors are created and managed exclusively by the Academy Administration. Self-registration is strictly disallowed.
              </div>
              <div style="margin-top: 0.85rem; padding-top: 0.85rem; border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.75rem; color: #cbd5e1;">
                <div style="display: flex; align-items: center; gap: 0.45rem;">
                  <span style="color: #4ade80;">✓</span> Backend Role-Based Authorization
                </div>
                <div style="display: flex; align-items: center; gap: 0.45rem;">
                  <span style="color: #4ade80;">✓</span> Scrypt Cryptographic Key Hashing
                </div>
                <div style="display: flex; align-items: center; gap: 0.45rem;">
                  <span style="color: #4ade80;">✓</span> Full Administrative Audit Logging
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Status & Quick Fill Accounts -->
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.75rem; color: #a1a1aa; font-family: var(--font-mono); margin-bottom: 1rem;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 8px #4ade80;"></span>
              Credential Auth System Active
            </div>

            <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 1rem;">
              <div style="font-size: 0.7rem; font-weight: 800; color: #8e9aa8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.55rem;">
                Quick Fill Test Credentials:
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.45rem;">
                <button type="button" class="btn-quick-fill" data-login="admin" data-pwd="admin123" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 10px; padding: 0.55rem 0.85rem; color: #ffffff; cursor: pointer; text-align: left; transition: all 0.2s ease;">
                  <span style="font-weight: 700; font-size: 0.8rem; color: #f1f5f9;">Master Admin (HQ)</span>
                  <span style="color: #a1a1aa; font-size: 0.72rem; font-family: var(--font-mono);">admin / admin123</span>
                </button>
                <button type="button" class="btn-quick-fill" data-login="srinivas" data-pwd="Trainer@123" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 10px; padding: 0.55rem 0.85rem; color: #ffffff; cursor: pointer; text-align: left; transition: all 0.2s ease;">
                  <span style="font-weight: 700; font-size: 0.8rem; color: #f1f5f9;">Instructor Srinivas</span>
                  <span style="color: #a1a1aa; font-size: 0.72rem; font-family: var(--font-mono);">srinivas / Trainer@123</span>
                </button>
                <button type="button" class="btn-quick-fill" data-login="saikiran" data-pwd="Student@123" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 10px; padding: 0.55rem 0.85rem; color: #ffffff; cursor: pointer; text-align: left; transition: all 0.2s ease;">
                  <span style="font-weight: 700; font-size: 0.8rem; color: #f1f5f9;">Student Sai Kiran</span>
                  <span style="color: #a1a1aa; font-size: 0.72rem; font-family: var(--font-mono);">saikiran / Student@123</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT PANEL: Authentication Vault Form -->
        <div class="login-vault-right" style="padding: 3rem 2.75rem; display: flex; flex-direction: column; justify-content: center;">
          
          <div style="margin-bottom: 2rem;">
            <div style="font-size: 0.75rem; font-weight: 800; color: var(--primary-gold); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.35rem;">
              Secure Portal Authentication
            </div>
            <h2 style="font-size: 1.6rem; font-weight: 800; color: #ffffff; margin: 0 0 0.5rem; letter-spacing: -0.02em;">
              Sign In to Your Account
            </h2>
            <p style="font-size: 0.85rem; color: #8e9aa8; margin: 0; line-height: 1.45;">
              Enter your Login ID and Password. The system will securely verify your account role and dispatch you to your assigned portal.
            </p>
          </div>

          <!-- Alert Notification Box -->
          <div id="login-alert-box" style="display: none; border-radius: 12px; padding: 0.85rem 1.15rem; margin-bottom: 1.5rem; font-size: 0.825rem; line-height: 1.45;"></div>

          <!-- Form Area -->
          <form id="vault-auth-form">
            <!-- Login ID Field -->
            <div style="margin-bottom: 1.35rem;">
              <label for="input-login-id" style="display: block; font-size: 0.75rem; font-weight: 700; color: #8e9aa8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.45rem;">
                User Name / Login ID *
              </label>
              <input 
                type="text" 
                class="mnc-input" 
                id="input-login-id" 
                required 
                placeholder="Enter your Login ID (e.g. saikiran, srinivas, admin)" 
                autocomplete="username"
                style="width: 100%; box-sizing: border-box; font-family: var(--font-mono); font-weight: 700; font-size: 0.95rem; padding: 0.75rem 1rem;" 
              />
            </div>

            <!-- Password Field with Show/Hide Eye Toggle -->
            <div style="margin-bottom: 1.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.45rem;">
                <label for="input-login-pwd" style="font-size: 0.75rem; font-weight: 700; color: #8e9aa8; text-transform: uppercase; letter-spacing: 0.05em;">
                  Password *
                </label>
              </div>
              <div style="position: relative; display: flex; align-items: center;">
                <input 
                  type="password" 
                  class="mnc-input" 
                  id="input-login-pwd" 
                  required 
                  placeholder="Enter your security password" 
                  autocomplete="current-password"
                  style="width: 100%; box-sizing: border-box; font-size: 0.95rem; padding: 0.75rem 3rem 0.75rem 1rem;" 
                />
                <button 
                  type="button" 
                  id="btn-toggle-pwd" 
                  title="Show / Hide Password" 
                  style="position: absolute; right: 10px; background: none; border: none; color: #8e9aa8; cursor: pointer; padding: 4px 8px; font-size: 1rem; display: flex; align-items: center; justify-content: center; transition: color 0.2s;"
                >
                  👁
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <div style="margin-top: 1.75rem;">
              <button 
                type="submit" 
                id="btn-submit-auth" 
                class="btn-mnc btn-mnc-primary" 
                style="width: 100%; padding: 0.9rem; font-size: 0.95rem; font-weight: 800; border-radius: 9999px; letter-spacing: 0.02em;"
              >
                Sign In to Portal →
              </button>
            </div>
          </form>

          <!-- Security Notice at Footer -->
          <div style="text-align: center; margin-top: 1.75rem; padding-top: 1.25rem; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 0.75rem; color: #64748b; line-height: 1.45;">
            🔒 Accounts are provisioned and managed exclusively by the Admin Office.<br>
            If you forgot your password or need access, please contact the academy administration.
          </div>

        </div>

      </div>
    </div>
  `;

  container.innerHTML = template;

  const alertBox = container.querySelector('#login-alert-box');
  const submitBtn = container.querySelector('#btn-submit-auth');
  const form = container.querySelector('#vault-auth-form');
  const inputLoginId = container.querySelector('#input-login-id');
  const inputLoginPwd = container.querySelector('#input-login-pwd');
  const btnTogglePwd = container.querySelector('#btn-toggle-pwd');

  function hideAlert() {
    alertBox.style.display = 'none';
    alertBox.textContent = '';
  }

  function showAlert(msg, type = 'error') {
    alertBox.style.display = 'block';
    if (type === 'error') {
      alertBox.style.background = 'rgba(239, 68, 68, 0.12)';
      alertBox.style.border = '1px solid rgba(239, 68, 68, 0.35)';
      alertBox.style.color = '#fca5a5';
    } else {
      alertBox.style.background = 'rgba(34, 197, 94, 0.12)';
      alertBox.style.border = '1px solid rgba(34, 197, 94, 0.35)';
      alertBox.style.color = '#86efac';
    }
    alertBox.textContent = msg;
  }

  // Password Visibility Toggle
  if (btnTogglePwd) {
    btnTogglePwd.addEventListener('click', () => {
      if (inputLoginPwd.type === 'password') {
        inputLoginPwd.type = 'text';
        btnTogglePwd.textContent = '🙈';
        btnTogglePwd.style.color = '#ffffff';
      } else {
        inputLoginPwd.type = 'password';
        btnTogglePwd.textContent = '👁';
        btnTogglePwd.style.color = '#8e9aa8';
      }
    });
  }

  // Quick Fill Helper Buttons
  container.querySelectorAll('.btn-quick-fill').forEach(btn => {
    btn.addEventListener('click', () => {
      inputLoginId.value = btn.dataset.login || '';
      inputLoginPwd.value = btn.dataset.pwd || '';
      hideAlert();
      inputLoginPwd.focus();
    });
  });

  const btnBackHome = container.querySelector('#btn-back-home');
  if (btnBackHome && onBack) {
    btnBackHome.addEventListener('click', onBack);
  }

  // Form Submission — Role-driven from backend response
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const username = inputLoginId.value.trim();
    const password = inputLoginPwd.value;

    if (!username || !password) {
      showAlert('Please enter both your Login ID and Password.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying Credentials...';

    try {
      const res = await store.loginUniversal(username, password);
      
      if (!res.success) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In to Portal →';
        showAlert(res.message || 'Invalid username or password.');
        return;
      }

      // Successful authentication
      submitBtn.textContent = 'Authenticated! Redirecting...';
      const role = (res.role || 'user').toLowerCase();

      if (onLoginSuccess) {
        onLoginSuccess(role, res.user);
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In to Portal →';
      showAlert(err.message || 'An unexpected error occurred during login. Please try again.');
    }
  });
}
