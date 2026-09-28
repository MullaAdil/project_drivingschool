/* ==========================================================================
   GAFOOR DRIVING SCHOOL — AUTHENTICATION PORTAL (PULIVENDULA)
   Horizontal Widescreen CRED Luxury Layout
   - Single Master Admin access
   - First-time Student Password Generation via Unique Code (e.g. MA-G01)
   - Subsequent Student Login with Unique Code + Password
   - Trainer Unique Code Login (assigned by Admin) with first-time password setup
   ========================================================================== */

import { store } from '../store.js';
import { renderBrandLogo } from '../components/brandLogo.js';

export function renderLoginView(container, onLoginSuccess, onBack) {
  let selectedRole = 'admin'; // 'admin' | 'trainer' | 'trainee'
  let studentMode = 'login'; // 'login' | 'first-time'
  let trainerMode = 'login'; // 'login' | 'first-time'

  const template = `
    <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1.5rem; background: var(--cred-bg); position: relative; overflow-x: hidden;">
      
      <!-- Ambient Glow Behind Vault Card -->
      <div style="position: absolute; top: 20%; left: 50%; transform: translateX(-50%); width: 850px; height: 440px; background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.05) 0%, transparent 70%); pointer-events: none; filter: blur(55px);"></div>

      <!-- Top Return to Website Pill -->
      <div style="margin-bottom: 1.5rem; position: relative; z-index: 2;">
        <button type="button" id="btn-back-home" class="btn-mnc btn-mnc-secondary btn-mnc-sm" style="border-radius: 9999px; padding: 0.5rem 1.25rem; font-size: 0.8rem;">
          ← Return to Public Showcase
        </button>
      </div>

      <!-- Widescreen Horizontal Vault Container -->
      <div class="login-vault-horizontal">
        
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

            <p style="font-size: 0.85rem; color: var(--slate-body); line-height: 1.5; margin: 0 0 2rem;">
              Institutional Access Vault &amp; Digital Fleet Operations Suite. Secure access for academy administration, instructors, and enrolled students.
            </p>

            <!-- Dynamic Role Guidance Card -->
            <div id="left-guidance-card" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 18px; padding: 1.35rem 1.25rem; margin-bottom: 1.5rem;">
              <!-- Populated dynamically via updateGuidance() -->
            </div>
          </div>

          <!-- Bottom Status & Quick Fill Accounts -->
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.75rem; color: #a1a1aa; font-family: var(--font-mono); margin-bottom: 1.25rem;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff; box-shadow: 0 0 8px #ffffff;"></span>
              Cloud Database Active · Supabase
            </div>

            <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 1.15rem;">
              <div style="font-size: 0.7rem; font-weight: 800; color: #8e9aa8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.65rem;">
                Quick Fill Profiles:
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.45rem;">
                <button type="button" class="btn-quick-login" data-role-fill="admin" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 10px; padding: 0.55rem 0.85rem; color: #ffffff; cursor: pointer; text-align: left; transition: all 0.2s ease;">
                  <span style="font-weight: 700; font-size: 0.8rem;">Master Admin (HQ)</span>
                  <span style="color: #a1a1aa; font-size: 0.72rem; font-family: var(--font-mono);">admin@gafoordriving.in</span>
                </button>
                <button type="button" class="btn-quick-login" data-role-fill="trainer" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 10px; padding: 0.55rem 0.85rem; color: #ffffff; cursor: pointer; text-align: left; transition: all 0.2s ease;">
                  <span style="font-weight: 700; font-size: 0.8rem;" id="quick-trainer-name">Trainer Srinivas</span>
                  <span style="color: #a1a1aa; font-size: 0.72rem; font-family: var(--font-mono);" id="quick-trainer-code">SR-T01</span>
                </button>
                <button type="button" class="btn-quick-login" data-role-fill="trainee" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 10px; padding: 0.55rem 0.85rem; color: #ffffff; cursor: pointer; text-align: left; transition: all 0.2s ease;">
                  <span style="font-weight: 700; font-size: 0.8rem;" id="quick-student-name">Student Mulla adil</span>
                  <span style="color: #a1a1aa; font-size: 0.72rem; font-family: var(--font-mono);" id="quick-student-code">MA-G01</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT PANEL: Authentication Vault Form -->
        <div class="login-vault-right" style="padding: 3rem 2.75rem; display: flex; flex-direction: column; justify-content: center;">
          
          <!-- Segmented Role Selector -->
          <div style="display: flex; background: rgba(255, 255, 255, 0.04); padding: 4px; border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 2rem;">
            <button type="button" class="dash-tab-btn active" data-role="admin" style="flex: 1; padding: 0.55rem 0.75rem; font-size: 0.825rem; border-radius: 9999px; border: none; cursor: pointer; transition: all 0.2s ease;">
              Administrator (1)
            </button>
            <button type="button" class="dash-tab-btn" data-role="trainer" style="flex: 1; padding: 0.55rem 0.75rem; font-size: 0.825rem; border-radius: 9999px; border: none; cursor: pointer; transition: all 0.2s ease;">
              Instructor (Code)
            </button>
            <button type="button" class="dash-tab-btn" data-role="trainee" style="flex: 1; padding: 0.55rem 0.75rem; font-size: 0.825rem; border-radius: 9999px; border: none; cursor: pointer; transition: all 0.2s ease;">
              Student (Code)
            </button>
          </div>

          <!-- Alert Notification Box -->
          <div id="login-alert-box" style="display: none; border-radius: 12px; padding: 0.85rem 1.15rem; margin-bottom: 1.5rem; font-size: 0.825rem; line-height: 1.45;"></div>

          <!-- Form Area -->
          <form id="vault-auth-form">
            <div id="form-fields-container">
              <!-- Dynamically populated based on active role and mode -->
            </div>

            <div style="margin-top: 1.75rem;">
              <button type="submit" id="btn-submit-auth" class="btn-mnc btn-mnc-primary" style="width: 100%; padding: 0.9rem; font-size: 0.95rem; font-weight: 800; border-radius: 9999px;">
                Sign In to Portal →
              </button>
            </div>
          </form>

          <!-- Secondary Mode Switcher Link -->
          <div id="mode-switcher-container" style="text-align: center; margin-top: 1.25rem;"></div>

        </div>

      </div>
    </div>
  `;

  container.innerHTML = template;

  const guidanceBox = container.querySelector('#left-guidance-card');
  const alertBox = container.querySelector('#login-alert-box');
  const fieldsContainer = container.querySelector('#form-fields-container');
  const modeSwitcher = container.querySelector('#mode-switcher-container');
  const submitBtn = container.querySelector('#btn-submit-auth');
  const roleTabs = container.querySelectorAll('.dash-tab-btn');
  const form = container.querySelector('#vault-auth-form');

  // Update quick fill values from store
  const sampleStudent = store.findTrainee('MA-G01') || store.trainees[0];
  if (sampleStudent) {
    container.querySelector('#quick-student-name').textContent = `Student ${sampleStudent.name}`;
    container.querySelector('#quick-student-code').textContent = sampleStudent.studentCode || sampleStudent.id;
  }
  const sampleTrainer = store.trainers[0];
  if (sampleTrainer) {
    container.querySelector('#quick-trainer-name').textContent = sampleTrainer.name;
    container.querySelector('#quick-trainer-code').textContent = sampleTrainer.trainerCode || sampleTrainer.id;
  }

  function hideAlert() {
    alertBox.style.display = 'none';
    alertBox.textContent = '';
  }

  function showAlert(msg, type = 'error') {
    alertBox.style.display = 'block';
    if (type === 'error') {
      alertBox.style.background = 'rgba(255, 75, 75, 0.1)';
      alertBox.style.border = '1px solid rgba(255, 75, 75, 0.3)';
      alertBox.style.color = '#ff9999';
    } else {
      alertBox.style.background = 'rgba(255, 255, 255, 0.08)';
      alertBox.style.border = '1px solid rgba(255, 255, 255, 0.25)';
      alertBox.style.color = '#ffffff';
    }
    alertBox.textContent = msg;
  }

  function updateGuidance() {
    if (selectedRole === 'admin') {
      guidanceBox.innerHTML = `
        <div style="font-size:0.75rem; font-weight:800; color:#8e9aa8; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.4rem;">
          Headquarters Command
        </div>
        <div style="font-size:1.05rem; font-weight:800; color:#ffffff; margin-bottom:0.5rem;">
          Single Administrator Master Access
        </div>
        <div style="font-size:0.8rem; color:#a1a1aa; line-height:1.5;">
          There is strictly <strong>one master administrator authority</strong> for Gafoor Driving School HQ with central authorization to manage admissions, billing ledgers, and RTO test appointments.
        </div>
      `;
    } else if (selectedRole === 'trainer') {
      guidanceBox.innerHTML = `
        <div style="font-size:0.75rem; font-weight:800; color:#8e9aa8; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.4rem;">
          Instructor Portal
        </div>
        <div style="font-size:1.05rem; font-weight:800; color:#ffffff; margin-bottom:0.5rem;">
          Unique Trainer Code Access
        </div>
        <div style="font-size:0.8rem; color:#a1a1aa; line-height:1.5;">
          • <strong>Unique Code Given by Admin:</strong> Enter your instructor code (e.g. <code>SR-T01</code> or <code>TRN-01</code>).<br>
          • <strong>First-Time Login:</strong> Activate your account and generate your private password.<br>
          • <strong>Returning Sessions:</strong> Enter your unique code and password.
        </div>
      `;
    } else {
      guidanceBox.innerHTML = `
        <div style="font-size:0.75rem; font-weight:800; color:#8e9aa8; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.4rem;">
          Student Console
        </div>
        <div style="font-size:1.05rem; font-weight:800; color:#ffffff; margin-bottom:0.5rem;">
          Candidate Unique Code &amp; Password
        </div>
        <div style="font-size:0.8rem; color:#a1a1aa; line-height:1.5;">
          • <strong>Unique Student ID:</strong> Generated on admission (e.g. <code>MA-G01</code>).<br>
          • <strong>First-Time Login:</strong> You will be prompted to generate your personal password.<br>
          • <strong>From Next Time:</strong> Simply sign in using your unique code and password.
        </div>
      `;
    }
  }

  function renderFormFields() {
    hideAlert();
    updateGuidance();

    if (selectedRole === 'admin') {
      modeSwitcher.innerHTML = '';
      submitBtn.textContent = 'Sign In to Master Admin Console →';
      fieldsContainer.innerHTML = `
        <div style="margin-bottom: 1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.45rem;">
            <label for="input-admin-id" style="font-size:0.75rem; font-weight:700; color:#8e9aa8; text-transform:uppercase; letter-spacing:0.05em;">
              Administrator Email / ID
            </label>
            <span style="font-size:0.7rem; color:#ffffff; font-weight:800; background:rgba(255,255,255,0.08); padding:0.15rem 0.5rem; border-radius:9999px;">
              Single Master Admin
            </span>
          </div>
          <input type="text" class="mnc-input" id="input-admin-id" required value="admin@gafoordriving.in" style="width:100%; box-sizing:border-box;" />
        </div>

        <div style="margin-bottom: 0.5rem;">
          <label for="input-admin-pwd" style="display:block; font-size:0.75rem; font-weight:700; color:#8e9aa8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.45rem;">
            Master Security Password
          </label>
          <input type="password" class="mnc-input" id="input-admin-pwd" required value="admin123" placeholder="Enter administrator password" style="width:100%; box-sizing:border-box;" />
        </div>
      `;
      return;
    }

    if (selectedRole === 'trainee') {
      const defaultStudent = store.findTrainee('MA-G01') || store.trainees[0];
      const defaultCode = defaultStudent ? (defaultStudent.studentCode || defaultStudent.id) : 'MA-G01';

      if (studentMode === 'first-time') {
        submitBtn.textContent = 'Generate Password & Activate Account →';
        modeSwitcher.innerHTML = `
          <button type="button" id="btn-toggle-student-mode" style="background:none; border:none; color:#a1a1aa; font-size:0.8rem; cursor:pointer; text-decoration:underline;">
            Already have a password? Sign in with Code &amp; Password
          </button>
        `;
        fieldsContainer.innerHTML = `
          <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.15); border-radius:12px; padding:0.75rem 1rem; margin-bottom:1.25rem; font-size:0.8rem; color:#ffffff;">
            ⚡ <strong>First-Time Student Activation:</strong> Enter your unique student code (e.g. <code>MA-G01</code>) and create your secret password.
          </div>

          <div style="margin-bottom: 1.15rem;">
            <label for="input-trainee-code" style="display:block; font-size:0.75rem; font-weight:700; color:#8e9aa8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.45rem;">
              Your Unique Student Code *
            </label>
            <input type="text" class="mnc-input" id="input-trainee-code" required value="${defaultCode}" placeholder="e.g. MA-G01" style="width:100%; box-sizing:border-box; font-family:var(--font-mono); font-weight:700;" />
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:0.5rem;">
            <div>
              <label for="input-new-pwd" style="display:block; font-size:0.75rem; font-weight:700; color:#8e9aa8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.45rem;">
                Create Password *
              </label>
              <input type="password" class="mnc-input" id="input-new-pwd" required placeholder="Choose a password" style="width:100%; box-sizing:border-box;" />
            </div>
            <div>
              <label for="input-confirm-pwd" style="display:block; font-size:0.75rem; font-weight:700; color:#8e9aa8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.45rem;">
                Confirm Password *
              </label>
              <input type="password" class="mnc-input" id="input-confirm-pwd" required placeholder="Re-type password" style="width:100%; box-sizing:border-box;" />
            </div>
          </div>
        `;
      } else {
        // Returning student login (Unique Code + Password)
        submitBtn.textContent = 'Sign In to Student Portal →';
        modeSwitcher.innerHTML = `
          <button type="button" id="btn-toggle-student-mode" style="background:none; border:none; color:#a1a1aa; font-size:0.8rem; cursor:pointer; text-decoration:underline;">
            First time logging in? Click here to generate your password
          </button>
        `;
        fieldsContainer.innerHTML = `
          <div style="margin-bottom: 1.15rem;">
            <label for="input-trainee-code" style="display:block; font-size:0.75rem; font-weight:700; color:#8e9aa8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.45rem;">
              Unique Student Code (e.g. MA-G01) *
            </label>
            <input type="text" class="mnc-input" id="input-trainee-code" required value="${defaultCode}" placeholder="e.g. MA-G01 or email" style="width:100%; box-sizing:border-box; font-family:var(--font-mono); font-weight:700;" />
          </div>

          <div style="margin-bottom: 0.5rem;">
            <label for="input-trainee-pwd" style="display:block; font-size:0.75rem; font-weight:700; color:#8e9aa8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.45rem;">
              Security Password *
            </label>
            <input type="password" class="mnc-input" id="input-trainee-pwd" required placeholder="Enter your student password" style="width:100%; box-sizing:border-box;" />
          </div>
        `;
      }

      const toggleBtn = container.querySelector('#btn-toggle-student-mode');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          studentMode = studentMode === 'login' ? 'first-time' : 'login';
          renderFormFields();
        });
      }
      return;
    }

    if (selectedRole === 'trainer') {
      const defaultTrainer = store.trainers[0];
      const defaultCode = defaultTrainer ? (defaultTrainer.trainerCode || defaultTrainer.id) : 'SR-T01';

      if (trainerMode === 'first-time') {
        submitBtn.textContent = 'Generate Instructor Password & Activate →';
        modeSwitcher.innerHTML = `
          <button type="button" id="btn-toggle-trainer-mode" style="background:none; border:none; color:#a1a1aa; font-size:0.8rem; cursor:pointer; text-decoration:underline;">
            Already have an instructor password? Sign in
          </button>
        `;
        fieldsContainer.innerHTML = `
          <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.15); border-radius:12px; padding:0.75rem 1rem; margin-bottom:1.25rem; font-size:0.8rem; color:#ffffff;">
            ⚡ <strong>First-Time Instructor Activation:</strong> Enter the unique trainer code given by admin and set your password.
          </div>

          <div style="margin-bottom: 1.15rem;">
            <label for="input-trainer-code" style="display:block; font-size:0.75rem; font-weight:700; color:#8e9aa8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.45rem;">
              Assigned Instructor Code (Given by Admin) *
            </label>
            <input type="text" class="mnc-input" id="input-trainer-code" required value="${defaultCode}" placeholder="e.g. SR-T01 or TRN-01" style="width:100%; box-sizing:border-box; font-family:var(--font-mono); font-weight:700;" />
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:0.5rem;">
            <div>
              <label for="input-new-trainer-pwd" style="display:block; font-size:0.75rem; font-weight:700; color:#8e9aa8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.45rem;">
                Create Password *
              </label>
              <input type="password" class="mnc-input" id="input-new-trainer-pwd" required placeholder="Choose a password" style="width:100%; box-sizing:border-box;" />
            </div>
            <div>
              <label for="input-confirm-trainer-pwd" style="display:block; font-size:0.75rem; font-weight:700; color:#8e9aa8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.45rem;">
                Confirm Password *
              </label>
              <input type="password" class="mnc-input" id="input-confirm-trainer-pwd" required placeholder="Re-type password" style="width:100%; box-sizing:border-box;" />
            </div>
          </div>
        `;
      } else {
        submitBtn.textContent = 'Sign In to Instructor Portal →';
        modeSwitcher.innerHTML = `
          <button type="button" id="btn-toggle-trainer-mode" style="background:none; border:none; color:#a1a1aa; font-size:0.8rem; cursor:pointer; text-decoration:underline;">
            First time logging in with your trainer code? Click here
          </button>
        `;
        fieldsContainer.innerHTML = `
          <div style="margin-bottom: 1.15rem;">
            <label for="input-trainer-code" style="display:block; font-size:0.75rem; font-weight:700; color:#8e9aa8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.45rem;">
              Instructor Unique Code (Given by Admin) *
            </label>
            <input type="text" class="mnc-input" id="input-trainer-code" required value="${defaultCode}" placeholder="e.g. SR-T01 or TRN-01" style="width:100%; box-sizing:border-box; font-family:var(--font-mono); font-weight:700;" />
          </div>

          <div style="margin-bottom: 0.5rem;">
            <label for="input-trainer-pwd" style="display:block; font-size:0.75rem; font-weight:700; color:#8e9aa8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.45rem;">
              Security Password *
            </label>
            <input type="password" class="mnc-input" id="input-trainer-pwd" required placeholder="Enter instructor password" style="width:100%; box-sizing:border-box;" />
          </div>
        `;
      }

      const toggleBtn = container.querySelector('#btn-toggle-trainer-mode');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          trainerMode = trainerMode === 'login' ? 'first-time' : 'login';
          renderFormFields();
        });
      }
    }
  }

  function setRole(role) {
    selectedRole = role;
    roleTabs.forEach(t => t.classList.toggle('active', t.dataset.role === role));
    renderFormFields();
  }

  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      setRole(tab.dataset.role);
    });
  });

  // Quick Login Buttons
  container.querySelectorAll('.btn-quick-login').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.roleFill;
      setRole(role);

      if (role === 'admin') {
        store.setRole('admin');
        if (onLoginSuccess) onLoginSuccess('admin');
      } else if (role === 'trainer') {
        const tr = store.trainers[0];
        store.setRole('trainer');
        if (onLoginSuccess) onLoginSuccess('trainer', tr);
      } else {
        const student = store.findTrainee('MA-G01') || store.trainees[0];
        store.setRole('trainee');
        if (student) store.setCurrentTrainee(student.id);
        if (onLoginSuccess) onLoginSuccess('trainee', student);
      }
    });
  });

  const btnBackHome = container.querySelector('#btn-back-home');
  if (btnBackHome && onBack) {
    btnBackHome.addEventListener('click', onBack);
  }

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert();

    // 1. ADMIN AUTHENTICATION
    if (selectedRole === 'admin') {
      const username = container.querySelector('#input-admin-id').value;
      const pwd = container.querySelector('#input-admin-pwd').value;
      const res = store.verifyAdminLogin(username, pwd);
      if (!res.success) {
        showAlert(res.message);
        return;
      }
      store.setRole('admin');
      if (onLoginSuccess) onLoginSuccess('admin');
      return;
    }

    // 2. STUDENT AUTHENTICATION
    if (selectedRole === 'trainee') {
      const code = container.querySelector('#input-trainee-code').value.trim();
      const student = store.findTrainee(code);

      if (!student) {
        showAlert(`Student code "${code}" not found. Please verify your unique code (e.g. MA-G01) or register as a new student.`);
        return;
      }

      // Check if student has no password yet (First-time login auto-detection)
      if (!student.password && studentMode !== 'first-time') {
        studentMode = 'first-time';
        renderFormFields();
        container.querySelector('#input-trainee-code').value = code;
        showAlert(`Welcome, ${student.name}! This is your first time logging in with code ${student.studentCode || student.id}. Please generate your password below.`, 'info');
        return;
      }

      if (studentMode === 'first-time') {
        const newPwd = container.querySelector('#input-new-pwd').value;
        const confirmPwd = container.querySelector('#input-confirm-pwd').value;

        if (!newPwd || newPwd.length < 3) {
          showAlert('Password must be at least 3 characters.');
          return;
        }
        if (newPwd !== confirmPwd) {
          showAlert('Passwords do not match. Please re-enter.');
          return;
        }

        // Save password for student
        store.setTraineePassword(student.id, newPwd);
        store.setRole('trainee');
        store.setCurrentTrainee(student.id);
        if (onLoginSuccess) onLoginSuccess('trainee', student);
        return;
      }

      // Returning Student Login with Password
      const enteredPwd = container.querySelector('#input-trainee-pwd').value;
      if (student.password && student.password !== enteredPwd) {
        showAlert(`Incorrect password for student code ${student.studentCode || student.id}. Please try again.`);
        return;
      }

      store.setRole('trainee');
      store.setCurrentTrainee(student.id);
      if (onLoginSuccess) onLoginSuccess('trainee', student);
      return;
    }

    // 3. INSTRUCTOR AUTHENTICATION
    if (selectedRole === 'trainer') {
      const code = container.querySelector('#input-trainer-code').value.trim();
      const trainer = store.findTrainer(code);

      if (!trainer) {
        showAlert(`Instructor code "${code}" not found. Please verify the unique code assigned to you by the administrator.`);
        return;
      }

      // Check if trainer has no password yet (First-time login auto-detection)
      if (!trainer.password && trainerMode !== 'first-time') {
        trainerMode = 'first-time';
        renderFormFields();
        container.querySelector('#input-trainer-code').value = code;
        showAlert(`Welcome, ${trainer.name}! This is your first time logging in with trainer code ${trainer.trainerCode || trainer.id}. Please create your password below.`, 'info');
        return;
      }

      if (trainerMode === 'first-time') {
        const newPwd = container.querySelector('#input-new-trainer-pwd').value;
        const confirmPwd = container.querySelector('#input-confirm-trainer-pwd').value;

        if (!newPwd || newPwd.length < 3) {
          showAlert('Password must be at least 3 characters.');
          return;
        }
        if (newPwd !== confirmPwd) {
          showAlert('Passwords do not match. Please re-enter.');
          return;
        }

        // Save password for trainer
        store.setTrainerPassword(trainer.id, newPwd);
        store.setRole('trainer');
        if (onLoginSuccess) onLoginSuccess('trainer', trainer);
        return;
      }

      // Returning Trainer Login with Password
      const enteredPwd = container.querySelector('#input-trainer-pwd').value;
      if (trainer.password && trainer.password !== enteredPwd) {
        showAlert(`Incorrect password for instructor ${trainer.trainerCode || trainer.id}. Please try again.`);
        return;
      }

      store.setRole('trainer');
      if (onLoginSuccess) onLoginSuccess('trainer', trainer);
    }
  });

  // Initial render of fields
  renderFormFields();
}
