/* ==========================================================================
   GAFOOR DRIVING SCHOOL — ADMIN ACCOUNTS & CREDENTIALS CONSOLE
   Strictly Admin-Controlled Login & Credential Management System
   - Manage User (Student) and Trainer (Instructor) Accounts
   - Role-Based Authentication & Scrypt Password Security
   - Immediate Deactivation & Reactivation Enforcement
   - Dedicated Activity & Audit Log Trail
   ========================================================================== */

import { store } from '../store.js';
import { renderStudentBoxAvatar } from '../components/studentAvatar.js';

export async function renderAdminAccountsView(container, showToast, onNavigate) {
  let activeTab = 'users'; // 'users' | 'trainers' | 'audit'
  let searchQuery = '';
  let statusFilter = 'all'; // 'all' | 'Active' | 'Inactive'
  let accounts = [];
  let auditLogs = [];
  let isLoading = true;

  // Load initial data from backend API
  async function loadData() {
    isLoading = true;
    render();
    try {
      [accounts, auditLogs] = await Promise.all([
        store.getAccounts(),
        store.getAccountAuditLogs()
      ]);
    } catch (err) {
      console.warn('Error loading accounts data:', err);
    } finally {
      isLoading = false;
      render();
    }
  }

  function render() {
    const userAccounts = accounts.filter(a => (a.role || '').toUpperCase() === 'USER');
    const trainerAccounts = accounts.filter(a => (a.role || '').toUpperCase() === 'TRAINER');
    const totalAccounts = accounts.length;
    const activeUsers = userAccounts.filter(a => a.status === 'Active').length;
    const activeTrainers = trainerAccounts.filter(a => a.status === 'Active').length;
    const inactiveCount = accounts.filter(a => a.status === 'Inactive').length;

    // Filter current list
    const currentList = activeTab === 'users' ? userAccounts : (activeTab === 'trainers' ? trainerAccounts : []);
    const filteredList = currentList.filter(item => {
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        (item.name || '').toLowerCase().includes(q) ||
        (item.loginId || '').toLowerCase().includes(q) ||
        (item.targetId || '').toLowerCase().includes(q) ||
        (item.email || '').toLowerCase().includes(q) ||
        (item.phone || '').toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });

    container.innerHTML = `
      <div class="accounts-management-view" style="padding: 1.75rem 2.25rem; min-height: 100%; box-sizing: border-box; background: var(--cred-bg, #090a0f);">
        
        <!-- HEADER -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.35rem;">
              <span style="font-size: 1.5rem;">🔑</span>
              <h1 style="font-size: 1.75rem; font-weight: 900; color: #ffffff; letter-spacing: -0.02em; margin: 0;">
                User &amp; Trainer Accounts
              </h1>
              <span class="p-badge p-badge-gold" style="font-size: 0.7rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;">
                Admin Authorized
              </span>
            </div>
            <p style="font-size: 0.875rem; color: var(--slate-muted, #94a3b8); margin: 0; line-height: 1.5;">
              Centralized credential authority. Only administrators can issue, reset, and revoke login accounts for students and driving instructors.
            </p>
          </div>

          <!-- PRIMARY ACTION BUTTONS -->
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <button type="button" class="btn-mnc btn-mnc-primary" id="btn-open-create-user-modal" style="font-weight: 800; padding: 0.65rem 1.15rem; display: flex; align-items: center; gap: 0.45rem;">
              <span>+</span> Create User Account
            </button>
            <button type="button" class="btn-mnc btn-mnc-secondary" id="btn-open-create-trainer-modal" style="font-weight: 800; padding: 0.65rem 1.15rem; display: flex; align-items: center; gap: 0.45rem; border-color: rgba(243, 209, 130, 0.4);">
              <span>+</span> Create Trainer Account
            </button>
          </div>
        </div>

        <!-- STATS STRIP -->
        <div class="portal-stats-strip" style="margin-bottom: 2rem; background: rgba(15, 17, 23, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-md, 12px); padding: 1.25rem 1.75rem; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
          <div class="portal-stat">
            <span class="portal-stat-value" style="font-size: 1.65rem; font-weight: 900; color: #ffffff;">${totalAccounts}</span>
            <span class="portal-stat-label" style="font-size: 0.75rem; color: var(--slate-muted, #94a3b8); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Total Accounts</span>
          </div>
          <div class="portal-stat" style="border-left: 1px solid rgba(255,255,255,0.08); padding-left: 1.25rem;">
            <span class="portal-stat-value" style="font-size: 1.65rem; font-weight: 900; color: var(--neem-green, #10b981);">${activeUsers}</span>
            <span class="portal-stat-label" style="font-size: 0.75rem; color: var(--slate-muted, #94a3b8); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Active Students</span>
          </div>
          <div class="portal-stat" style="border-left: 1px solid rgba(255,255,255,0.08); padding-left: 1.25rem;">
            <span class="portal-stat-value" style="font-size: 1.65rem; font-weight: 900; color: var(--primary-gold, #f3d182);">${activeTrainers}</span>
            <span class="portal-stat-label" style="font-size: 0.75rem; color: var(--slate-muted, #94a3b8); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Active Instructors</span>
          </div>
          <div class="portal-stat" style="border-left: 1px solid rgba(255,255,255,0.08); padding-left: 1.25rem;">
            <span class="portal-stat-value" style="font-size: 1.65rem; font-weight: 900; color: ${inactiveCount > 0 ? '#ef4444' : 'var(--slate-muted, #94a3b8)'};">${inactiveCount}</span>
            <span class="portal-stat-label" style="font-size: 0.75rem; color: var(--slate-muted, #94a3b8); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Deactivated / Suspended</span>
          </div>
        </div>

        <!-- SUB-NAVIGATION TABS -->
        <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 1.75rem;">
          <button type="button" class="tab-btn-account ${activeTab === 'users' ? 'active' : ''}" data-account-tab="users" style="padding: 0.75rem 1.4rem; font-size: 0.875rem; font-weight: 800; background: none; border: none; border-bottom: 2px solid ${activeTab === 'users' ? 'var(--primary-gold, #f3d182)' : 'transparent'}; color: ${activeTab === 'users' ? '#ffffff' : 'var(--slate-muted, #94a3b8)'}; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
            <span>👤</span> Students / Users (${userAccounts.length})
          </button>
          <button type="button" class="tab-btn-account ${activeTab === 'trainers' ? 'active' : ''}" data-account-tab="trainers" style="padding: 0.75rem 1.4rem; font-size: 0.875rem; font-weight: 800; background: none; border: none; border-bottom: 2px solid ${activeTab === 'trainers' ? 'var(--primary-gold, #f3d182)' : 'transparent'}; color: ${activeTab === 'trainers' ? '#ffffff' : 'var(--slate-muted, #94a3b8)'}; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
            <span>👨‍🏫</span> Instructors / Trainers (${trainerAccounts.length})
          </button>
          <button type="button" class="tab-btn-account ${activeTab === 'audit' ? 'active' : ''}" data-account-tab="audit" style="padding: 0.75rem 1.4rem; font-size: 0.875rem; font-weight: 800; background: none; border: none; border-bottom: 2px solid ${activeTab === 'audit' ? 'var(--primary-gold, #f3d182)' : 'transparent'}; color: ${activeTab === 'audit' ? '#ffffff' : 'var(--slate-muted, #94a3b8)'}; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
            <span>📜</span> Account Activity &amp; Audit Log (${auditLogs.length})
          </button>
        </div>

        <!-- SEARCH & FILTER TOOLBAR (for Users & Trainers) -->
        ${activeTab !== 'audit' ? `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; gap: 1rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1; max-width: 550px;">
              <input 
                type="text" 
                class="mnc-input" 
                id="inp-account-search" 
                value="${searchQuery}" 
                placeholder="Search by name, login ID, code, phone, or email..." 
                style="width: 100%; padding: 0.65rem 1rem; font-size: 0.85rem;"
              />
            </div>

            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <label style="font-size: 0.78rem; font-weight: 700; color: var(--slate-muted, #94a3b8); text-transform: uppercase;">Status:</label>
              <select class="mnc-select" id="sel-account-status-filter" style="padding: 0.55rem 0.9rem; font-size: 0.825rem;">
                <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
                <option value="Active" ${statusFilter === 'Active' ? 'selected' : ''}>Active Only</option>
                <option value="Inactive" ${statusFilter === 'Inactive' ? 'selected' : ''}>Inactive Only</option>
              </select>
            </div>
          </div>
        ` : ''}

        <!-- MAIN CONTENT AREA -->
        ${isLoading ? `
          <div style="padding: 3rem; text-align: center; color: var(--slate-muted, #94a3b8);">
            <div class="btn-loading-spinner" style="margin: 0 auto 1rem; width: 28px; height: 28px; border-width: 3px;"></div>
            <div>Loading accounts securely from backend...</div>
          </div>
        ` : activeTab === 'audit' ? renderAuditTable(auditLogs) : renderAccountsTable(filteredList, activeTab)}

      </div>
    `;

    // Attach Event Listeners
    attachEvents();
  }

  function renderAccountsTable(list, type) {
    const isUser = type === 'users';
    const idLabel = isUser ? 'User ID' : 'Trainer ID';
    const nameLabel = isUser ? 'Student Name' : 'Trainer Name';

    if (list.length === 0) {
      return `
        <div style="background: rgba(15, 17, 23, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-md, 12px); padding: 3.5rem 1.5rem; text-align: center;">
          <div style="font-size: 2.25rem; margin-bottom: 0.75rem;">📂</div>
          <div style="font-size: 1rem; font-weight: 800; color: #ffffff; margin-bottom: 0.35rem;">
            No ${isUser ? 'User' : 'Trainer'} accounts found
          </div>
          <div style="font-size: 0.825rem; color: var(--slate-muted, #94a3b8); max-width: 440px; margin: 0 auto 1.5rem;">
            ${searchQuery || statusFilter !== 'all' ? 'No records match your active search filter.' : `Create an authorized ${isUser ? 'Student' : 'Instructor'} login account using the button below.`}
          </div>
          <button type="button" class="btn-mnc btn-mnc-primary" id="${isUser ? 'btn-empty-create-user' : 'btn-empty-create-trainer'}">
            + Create ${isUser ? 'User' : 'Trainer'} Account
          </button>
        </div>
      `;
    }

    return `
      <div class="p-table-wrap" style="background: rgba(15, 17, 23, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-md, 12px); overflow: hidden;">
        <table class="p-table" style="margin: 0; width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: rgba(255, 255, 255, 0.03); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <th style="padding: 1rem 1.25rem; font-weight: 800; color: var(--slate-muted, #94a3b8); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">${idLabel}</th>
              <th style="padding: 1rem 1.25rem; font-weight: 800; color: var(--slate-muted, #94a3b8); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">${nameLabel}</th>
              <th style="padding: 1rem 1.25rem; font-weight: 800; color: var(--slate-muted, #94a3b8); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Login ID</th>
              <th style="padding: 1rem 1.25rem; font-weight: 800; color: var(--slate-muted, #94a3b8); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Status</th>
              <th style="padding: 1rem 1.25rem; font-weight: 800; color: var(--slate-muted, #94a3b8); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Created Date</th>
              <th style="padding: 1rem 1.25rem; font-weight: 800; color: var(--slate-muted, #94a3b8); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(acc => {
              const isActive = acc.status === 'Active';
              const createdStr = acc.createdAt ? new Date(acc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent';
              const linkedCode = acc.targetId || acc.id;

              return `
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); transition: background 0.15s ease;">
                  <!-- 1. User/Trainer ID -->
                  <td style="padding: 1rem 1.25rem; font-family: var(--font-mono, monospace); font-weight: 700; color: #ffffff; white-space: nowrap;">
                    <span style="background: rgba(255, 255, 255, 0.06); padding: 0.2rem 0.55rem; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1);">
                      ${linkedCode}
                    </span>
                  </td>

                  <!-- 2. Name & Contact -->
                  <td style="padding: 1rem 1.25rem; white-space: nowrap;">
                    <div style="display: flex; align-items: center; gap: 0.65rem;">
                      <div style="font-weight: 800; color: #ffffff; font-size: 0.9rem;">
                        ${acc.name}
                      </div>
                    </div>
                    ${acc.email || acc.phone ? `
                      <div style="font-size: 0.725rem; color: var(--slate-muted, #94a3b8); margin-top: 0.15rem;">
                        ${[acc.email, acc.phone].filter(Boolean).join(' · ')}
                      </div>
                    ` : ''}
                  </td>

                  <!-- 3. Login ID -->
                  <td style="padding: 1rem 1.25rem; font-family: var(--font-mono, monospace); font-weight: 800; color: var(--primary-gold, #f3d182); white-space: nowrap;">
                    ${acc.loginId}
                  </td>

                  <!-- 4. Status Badge -->
                  <td style="padding: 1rem 1.25rem; white-space: nowrap;">
                    <span class="p-badge ${isActive ? 'p-badge-green' : ''}" style="${!isActive ? 'background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3);' : ''}; font-weight: 800; padding: 0.25rem 0.65rem; border-radius: 9999px;">
                      ● ${acc.status || 'Active'}
                    </span>
                  </td>

                  <!-- 5. Created Date -->
                  <td style="padding: 1rem 1.25rem; font-size: 0.825rem; color: var(--slate-muted, #94a3b8); white-space: nowrap;">
                    ${createdStr}
                  </td>

                  <!-- 6. Actions (View, Edit, Reset Password, Activate/Deactivate) -->
                  <td style="padding: 1rem 1.25rem; text-align: right; white-space: nowrap;">
                    <div style="display: inline-flex; align-items: center; gap: 0.45rem; justify-content: flex-end;">
                      <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-action-view" data-account-id="${acc.id}" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;" title="View details">
                        View
                      </button>
                      <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-action-edit" data-account-id="${acc.id}" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;" title="Edit Login ID and details">
                        Edit
                      </button>
                      <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-action-reset-pwd" data-account-id="${acc.id}" style="padding: 0.35rem 0.65rem; font-size: 0.75rem; color: var(--primary-gold, #f3d182); border-color: rgba(243, 209, 130, 0.3);" title="Reset password">
                        Reset Password
                      </button>
                      <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-action-toggle-status" data-account-id="${acc.id}" data-current-status="${acc.status}" style="padding: 0.35rem 0.65rem; font-size: 0.75rem; ${isActive ? 'color: #f87171; border-color: rgba(239, 68, 68, 0.3);' : 'color: #4ade80; border-color: rgba(74, 222, 128, 0.3);'}" title="${isActive ? 'Deactivate account immediately' : 'Activate account'}">
                        ${isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderAuditTable(logs) {
    if (logs.length === 0) {
      return `
        <div style="background: rgba(15, 17, 23, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-md, 12px); padding: 3rem 1.5rem; text-align: center; color: var(--slate-muted, #94a3b8);">
          No audit logs recorded yet.
        </div>
      `;
    }

    return `
      <div class="p-table-wrap" style="background: rgba(15, 17, 23, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-md, 12px); overflow: hidden;">
        <table class="p-table" style="margin: 0; width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: rgba(255, 255, 255, 0.03); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <th style="padding: 1rem 1.25rem; font-weight: 800; color: var(--slate-muted, #94a3b8); font-size: 0.75rem; text-transform: uppercase;">Timestamp</th>
              <th style="padding: 1rem 1.25rem; font-weight: 800; color: var(--slate-muted, #94a3b8); font-size: 0.75rem; text-transform: uppercase;">Admin User</th>
              <th style="padding: 1rem 1.25rem; font-weight: 800; color: var(--slate-muted, #94a3b8); font-size: 0.75rem; text-transform: uppercase;">Action Performed</th>
              <th style="padding: 1rem 1.25rem; font-weight: 800; color: var(--slate-muted, #94a3b8); font-size: 0.75rem; text-transform: uppercase;">Account Affected</th>
              <th style="padding: 1rem 1.25rem; font-weight: 800; color: var(--slate-muted, #94a3b8); font-size: 0.75rem; text-transform: uppercase;">Action Type</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(log => {
              const dtStr = log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN') : 'Recent';
              const badgeStyle = log.actionType === 'DEACTIVATE' ? 'background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3);' :
                                 log.actionType === 'RESET_PASSWORD' ? 'background: rgba(243,209,130,0.15); color: var(--primary-gold); border: 1px solid rgba(243,209,130,0.3);' :
                                 'background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3);';

              return `
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                  <td style="padding: 0.9rem 1.25rem; font-family: var(--font-mono, monospace); font-size: 0.78rem; color: var(--slate-muted, #94a3b8); white-space: nowrap;">
                    ${dtStr}
                  </td>
                  <td style="padding: 0.9rem 1.25rem; font-size: 0.85rem; font-weight: 700; color: #ffffff; white-space: nowrap;">
                    ${log.adminUser || 'Admin'}
                  </td>
                  <td style="padding: 0.9rem 1.25rem; font-size: 0.85rem; color: #ffffff;">
                    ${log.action}
                  </td>
                  <td style="padding: 0.9rem 1.25rem; font-size: 0.85rem; font-weight: 700; color: var(--primary-gold, #f3d182); white-space: nowrap;">
                    ${log.accountAffected || '—'}
                  </td>
                  <td style="padding: 0.9rem 1.25rem; white-space: nowrap;">
                    <span class="p-badge" style="${badgeStyle} font-size: 0.7rem; font-weight: 800; padding: 0.2rem 0.55rem; border-radius: 6px;">
                      ${log.actionType || 'INFO'}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function attachEvents() {
    // Tab switching
    container.querySelectorAll('.tab-btn-account').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.accountTab;
        render();
      });
    });

    // Search bar
    const inpSearch = container.querySelector('#inp-account-search');
    if (inpSearch) {
      inpSearch.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render();
      });
    }

    // Status filter
    const selFilter = container.querySelector('#sel-account-status-filter');
    if (selFilter) {
      selFilter.addEventListener('change', (e) => {
        statusFilter = e.target.value;
        render();
      });
    }

    // Create User modal triggers
    const btnCreateUser = container.querySelector('#btn-open-create-user-modal');
    if (btnCreateUser) {
      btnCreateUser.addEventListener('click', () => openCreateAccountModal('USER'));
    }
    const btnEmptyUser = container.querySelector('#btn-empty-create-user');
    if (btnEmptyUser) {
      btnEmptyUser.addEventListener('click', () => openCreateAccountModal('USER'));
    }

    // Create Trainer modal triggers
    const btnCreateTrainer = container.querySelector('#btn-open-create-trainer-modal');
    if (btnCreateTrainer) {
      btnCreateTrainer.addEventListener('click', () => openCreateAccountModal('TRAINER'));
    }
    const btnEmptyTrainer = container.querySelector('#btn-empty-create-trainer');
    if (btnEmptyTrainer) {
      btnEmptyTrainer.addEventListener('click', () => openCreateAccountModal('TRAINER'));
    }

    // Row Actions: View
    container.querySelectorAll('.btn-action-view').forEach(btn => {
      btn.addEventListener('click', () => {
        const acc = accounts.find(a => a.id === btn.dataset.accountId);
        if (acc) openViewAccountModal(acc);
      });
    });

    // Row Actions: Edit
    container.querySelectorAll('.btn-action-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const acc = accounts.find(a => a.id === btn.dataset.accountId);
        if (acc) openEditAccountModal(acc);
      });
    });

    // Row Actions: Reset Password
    container.querySelectorAll('.btn-action-reset-pwd').forEach(btn => {
      btn.addEventListener('click', () => {
        const acc = accounts.find(a => a.id === btn.dataset.accountId);
        if (acc) openResetPasswordModal(acc);
      });
    });

    // Row Actions: Activate / Deactivate
    container.querySelectorAll('.btn-action-toggle-status').forEach(btn => {
      btn.addEventListener('click', async () => {
        const accId = btn.dataset.accountId;
        const current = btn.dataset.currentStatus;
        const target = current === 'Active' ? 'Inactive' : 'Active';
        const verb = target === 'Active' ? 'activate' : 'deactivate';

        btn.disabled = true;
        btn.textContent = 'Updating...';

        const res = await store.updateAccountStatus(accId, target);
        if (res && res.success) {
          showToast(`Account successfully ${target === 'Active' ? 'activated' : 'deactivated'}.`, 'success');
          await loadData();
        } else {
          showToast(res.message || `Failed to ${verb} account.`, 'error');
          render();
        }
      });
    });
  }

  // ==========================================
  // MODAL: CREATE ACCOUNT (USER OR TRAINER)
  // ==========================================
  function openCreateAccountModal(role = 'USER') {
    const isUser = role === 'USER';
    let modalRoot = document.getElementById('modal-root');
    if (!modalRoot) {
      modalRoot = document.createElement('div');
      modalRoot.id = 'modal-root';
      document.body.appendChild(modalRoot);
    }
    modalRoot.style.position = 'relative';
    modalRoot.style.zIndex = '99999';

    // Source list from existing records
    const studentList = store.trainees || [];
    const trainerList = store.trainers || [];

    const defaultTarget = isUser ? studentList[0] : trainerList[0];
    const defaultName = defaultTarget ? defaultTarget.name : '';
    const defaultId = defaultTarget ? (isUser ? (defaultTarget.studentCode || defaultTarget.id) : (defaultTarget.trainerCode || defaultTarget.id)) : '';
    const defaultLogin = defaultTarget ? (isUser ? defaultTarget.name.toLowerCase().replace(/[^a-z0-9]/g, '') : defaultTarget.name.toLowerCase().split(' ')[0]) : '';
    const defaultPhone = defaultTarget ? defaultTarget.phone : '';
    const defaultEmail = defaultTarget ? defaultTarget.email : '';

    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay" style="z-index: 99999; position: fixed; inset: 0; background: rgba(4,5,8,0.85); backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center; padding: 1.5rem;">
        <div class="p-modal" style="max-width: 540px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; background: #0f1117; border: 1px solid rgba(255,255,255,0.12); border-radius: var(--radius-lg, 16px); box-shadow: 0 25px 60px rgba(0,0,0,0.95);">
          
          <!-- FIXED HEADER -->
          <div class="p-modal-header" style="padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); flex-shrink: 0; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div class="p-modal-title" style="font-size: 1.25rem; font-weight: 800; color: #ffffff;">
                + Create ${isUser ? 'User' : 'Trainer'} Account
              </div>
              <div class="p-modal-sub" style="font-size: 0.8rem; color: var(--slate-muted, #94a3b8); margin-top: 0.2rem;">
                Issue authenticated portal credentials linked to an existing ${isUser ? 'student' : 'instructor'} record
              </div>
            </div>
            <button type="button" id="btn-close-create-modal" class="p-modal-close" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #fff; font-size: 1rem; width: 34px; height: 34px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
          </div>

          <!-- FORM -->
          <form id="form-create-account" style="display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden;">
            <div class="p-modal-body" style="padding: 1.5rem; overflow-y: auto; flex: 1;">
              
              <!-- Error Banner -->
              <div id="create-modal-alert" style="display: none; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.35); color: #fca5a5; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.825rem; font-weight: 600; margin-bottom: 1.15rem;"></div>

              <!-- 1. Linked Record Selection -->
              <div class="p-form-row" style="margin-bottom: 1.15rem;">
                <label style="display: block; font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem;">
                  Link Existing ${isUser ? 'Student / Trainee' : 'Instructor / Trainer'} Record <span style="color: #ef4444;">*</span>
                </label>
                <select class="mnc-select" id="sel-create-linked-entity" style="width: 100%;" required>
                  ${isUser ? studentList.map((st, i) => `
                    <option value="${st.id}" data-name="${st.name}" data-code="${st.studentCode || st.id}" data-email="${st.email || ''}" data-phone="${st.phone || ''}" ${i === 0 ? 'selected' : ''}>
                      ${st.name} (${st.studentCode || st.id}) — ${st.package || 'Comprehensive Course'}
                    </option>
                  `).join('') : trainerList.map((tr, i) => `
                    <option value="${tr.id}" data-name="${tr.name}" data-code="${tr.trainerCode || tr.id}" data-email="${tr.email || ''}" data-phone="${tr.phone || ''}" ${i === 0 ? 'selected' : ''}>
                      ${tr.name} (${tr.trainerCode || tr.id}) — ${tr.car || 'Dual-Ctrl Rig'}
                    </option>
                  `).join('')}
                </select>
                <div style="font-size: 0.72rem; color: var(--slate-muted, #94a3b8); margin-top: 0.25rem;">
                  Prevents duplicate database profiles by linking credentials directly to the existing dossier.
                </div>
              </div>

              <!-- 2. Display Name & User ID / Student ID (Readonly preview) -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.15rem;">
                <div class="p-form-row">
                  <label style="display: block; font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem;">
                    ${isUser ? 'Student Name' : 'Trainer Name'}
                  </label>
                  <input type="text" class="mnc-input" id="inp-create-name" value="${defaultName}" readonly style="width: 100%; background: rgba(255,255,255,0.03); color: #cbd5e1;" />
                </div>
                <div class="p-form-row">
                  <label style="display: block; font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem;">
                    ${isUser ? 'User ID / Student ID' : 'Trainer ID'}
                  </label>
                  <input type="text" class="mnc-input" id="inp-create-target-id" value="${defaultId}" readonly style="width: 100%; background: rgba(255,255,255,0.03); font-family: var(--font-mono, monospace); color: #cbd5e1;" />
                </div>
              </div>

              <!-- 3. User Name / Login ID * -->
              <div class="p-form-row" style="margin-bottom: 1.15rem;">
                <label for="inp-create-login-id" style="display: block; font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem;">
                  ${isUser ? 'User Name / Login ID' : 'Trainer Login ID'} <span style="color: #ef4444;">*</span>
                </label>
                <input type="text" class="mnc-input" id="inp-create-login-id" name="loginId" value="${defaultLogin}" required placeholder="e.g. saikiran or SR-TG01" style="width: 100%; font-family: var(--font-mono, monospace); font-weight: 700;" />
                <div style="font-size: 0.72rem; color: var(--slate-muted, #94a3b8); margin-top: 0.25rem;">The credential username used for sign in. Must be unique.</div>
              </div>

              <!-- 4. Password & Confirm Password -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.15rem;">
                <div class="p-form-row">
                  <label for="inp-create-pwd" style="display: block; font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem;">
                    Password <span style="color: #ef4444;">*</span>
                  </label>
                  <input type="password" class="mnc-input" id="inp-create-pwd" name="password" required placeholder="Choose password" style="width: 100%;" />
                </div>
                <div class="p-form-row">
                  <label for="inp-create-confirm-pwd" style="display: block; font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem;">
                    Confirm Password <span style="color: #ef4444;">*</span>
                  </label>
                  <input type="password" class="mnc-input" id="inp-create-confirm-pwd" name="confirmPassword" required placeholder="Re-type password" style="width: 100%;" />
                </div>
              </div>

              <!-- 5. Email & Phone -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.15rem;">
                <div class="p-form-row">
                  <label for="inp-create-email" style="display: block; font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem;">
                    Email (Optional)
                  </label>
                  <input type="email" class="mnc-input" id="inp-create-email" name="email" value="${defaultEmail}" placeholder="e.g. user@gafoordriving.in" style="width: 100%;" />
                </div>
                <div class="p-form-row">
                  <label for="inp-create-phone" style="display: block; font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem;">
                    Phone Number (Optional)
                  </label>
                  <input type="tel" class="mnc-input" id="inp-create-phone" name="phone" value="${defaultPhone}" placeholder="e.g. +91 98480 22334" style="width: 100%;" />
                </div>
              </div>

              <!-- 6. Account Status -->
              <div class="p-form-row" style="margin-bottom: 0.5rem;">
                <label for="sel-create-status" style="display: block; font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem;">
                  Account Status <span style="color: #ef4444;">*</span>
                </label>
                <select class="mnc-select" id="sel-create-status" name="status" style="width: 100%;">
                  <option value="Active" selected>Active (Can log in immediately)</option>
                  <option value="Inactive">Inactive (Suspended / Prohibited from login)</option>
                </select>
              </div>

            </div>

            <!-- PINNED FOOTER -->
            <div class="p-modal-footer" style="padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.08); background: #13151b; display: flex; justify-content: flex-end; gap: 0.75rem; flex-shrink: 0;">
              <button type="button" class="p-ghost-btn" id="btn-cancel-create-modal" style="padding: 0.65rem 1.25rem; cursor: pointer;">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary" id="btn-submit-create-account" style="padding: 0.65rem 1.5rem; font-weight: 800; cursor: pointer;">
                Create Account
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-create-modal').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-create-modal').addEventListener('click', close);

    const selEntity = modalRoot.querySelector('#sel-create-linked-entity');
    const inpName = modalRoot.querySelector('#inp-create-name');
    const inpTargetId = modalRoot.querySelector('#inp-create-target-id');
    const inpLoginId = modalRoot.querySelector('#inp-create-login-id');
    const inpEmail = modalRoot.querySelector('#inp-create-email');
    const inpPhone = modalRoot.querySelector('#inp-create-phone');
    const alertBox = modalRoot.querySelector('#create-modal-alert');
    const form = modalRoot.querySelector('#form-create-account');
    const btnSubmit = modalRoot.querySelector('#btn-submit-create-account');

    selEntity.addEventListener('change', () => {
      const opt = selEntity.options[selEntity.selectedIndex];
      if (opt) {
        inpName.value = opt.dataset.name || '';
        inpTargetId.value = opt.dataset.code || opt.value;
        inpEmail.value = opt.dataset.email || '';
        inpPhone.value = opt.dataset.phone || '';
        const suggested = isUser ? opt.dataset.name.toLowerCase().replace(/[^a-z0-9]/g, '') : opt.dataset.name.toLowerCase().split(' ')[0];
        inpLoginId.value = suggested;
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertBox.style.display = 'none';

      const opt = selEntity.options[selEntity.selectedIndex];
      const targetId = opt ? (opt.dataset.code || opt.value) : '';
      const name = inpName.value.trim();
      const loginId = inpLoginId.value.trim();
      const password = modalRoot.querySelector('#inp-create-pwd').value.trim();
      const confirmPassword = modalRoot.querySelector('#inp-create-confirm-pwd').value.trim();
      const status = modalRoot.querySelector('#sel-create-status').value;
      const email = inpEmail.value.trim();
      const phone = inpPhone.value.trim();

      if (!loginId) {
        alertBox.textContent = 'User Name / Login ID is required.';
        alertBox.style.display = 'block';
        return;
      }
      if (!password) {
        alertBox.textContent = 'Password is required.';
        alertBox.style.display = 'block';
        return;
      }
      if (password !== confirmPassword) {
        alertBox.textContent = 'Passwords do not match.';
        alertBox.style.display = 'block';
        return;
      }

      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `<span class="btn-loading-spinner"></span> Creating...`;

      const res = await store.createAccount({
        role,
        targetId,
        name,
        loginId,
        password,
        confirmPassword,
        status,
        email,
        phone
      });

      if (res && res.success) {
        close();
        showToast(`✓ ${isUser ? 'User' : 'Trainer'} account for ${name} created successfully!`, 'success');
        await loadData();
      } else {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Create Account';
        alertBox.textContent = res.message || 'Failed to create account.';
        alertBox.style.display = 'block';
      }
    });
  }

  // ==========================================
  // MODAL: RESET PASSWORD
  // ==========================================
  function openResetPasswordModal(acc) {
    let modalRoot = document.getElementById('modal-root');
    if (!modalRoot) {
      modalRoot = document.createElement('div');
      modalRoot.id = 'modal-root';
      document.body.appendChild(modalRoot);
    }
    modalRoot.style.position = 'relative';
    modalRoot.style.zIndex = '99999';

    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay" style="z-index: 99999; position: fixed; inset: 0; background: rgba(4,5,8,0.85); backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center; padding: 1.5rem;">
        <div class="p-modal" style="max-width: 440px; width: 100%; background: #0f1117; border: 1px solid rgba(255,255,255,0.12); border-radius: var(--radius-lg, 16px); box-shadow: 0 25px 60px rgba(0,0,0,0.95); overflow: hidden;">
          
          <div class="p-modal-header" style="padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div class="p-modal-title" style="font-size: 1.25rem; font-weight: 800; color: #ffffff;">Reset Password</div>
              <div class="p-modal-sub" style="font-size: 0.8rem; color: var(--slate-muted, #94a3b8); margin-top: 0.2rem;">
                ${acc.name} · Login ID: <code style="color:var(--primary-gold);">${acc.loginId}</code>
              </div>
            </div>
            <button type="button" id="btn-close-reset-modal" class="p-modal-close" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #fff; font-size: 1rem; width: 34px; height: 34px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
          </div>

          <form id="form-reset-password" style="padding: 1.5rem;">
            <div id="reset-modal-alert" style="display: none; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.35); color: #fca5a5; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.825rem; font-weight: 600; margin-bottom: 1.15rem;"></div>

            <div class="p-form-row" style="margin-bottom: 1.15rem;">
              <label for="inp-reset-new-pwd" style="display: block; font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem;">
                New Password <span style="color: #ef4444;">*</span>
              </label>
              <input type="password" class="mnc-input" id="inp-reset-new-pwd" required placeholder="Enter new password" style="width: 100%; box-sizing: border-box;" />
            </div>

            <div class="p-form-row" style="margin-bottom: 1.5rem;">
              <label for="inp-reset-confirm-pwd" style="display: block; font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem;">
                Confirm New Password <span style="color: #ef4444;">*</span>
              </label>
              <input type="password" class="mnc-input" id="inp-reset-confirm-pwd" required placeholder="Re-type new password" style="width: 100%; box-sizing: border-box;" />
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
              <button type="button" class="p-ghost-btn" id="btn-cancel-reset-modal" style="padding: 0.65rem 1.25rem; cursor: pointer;">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary" id="btn-submit-reset-password" style="padding: 0.65rem 1.5rem; font-weight: 800; cursor: pointer;">
                Update Password
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-reset-modal').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-reset-modal').addEventListener('click', close);

    const form = modalRoot.querySelector('#form-reset-password');
    const alertBox = modalRoot.querySelector('#reset-modal-alert');
    const btnSubmit = modalRoot.querySelector('#btn-submit-reset-password');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertBox.style.display = 'none';

      const newPwd = modalRoot.querySelector('#inp-reset-new-pwd').value.trim();
      const confPwd = modalRoot.querySelector('#inp-reset-confirm-pwd').value.trim();

      if (!newPwd) {
        alertBox.textContent = 'Please enter a new password.';
        alertBox.style.display = 'block';
        return;
      }
      if (newPwd !== confPwd) {
        alertBox.textContent = 'Passwords do not match.';
        alertBox.style.display = 'block';
        return;
      }

      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Saving...';

      const res = await store.resetAccountPassword(acc.id, newPwd, confPwd);
      if (res && res.success) {
        close();
        showToast(`✓ Password for ${acc.name} updated successfully!`, 'success');
        await loadData();
      } else {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Update Password';
        alertBox.textContent = res.message || 'Failed to reset password.';
        alertBox.style.display = 'block';
      }
    });
  }

  // ==========================================
  // MODAL: EDIT ACCOUNT
  // ==========================================
  function openEditAccountModal(acc) {
    let modalRoot = document.getElementById('modal-root');
    if (!modalRoot) {
      modalRoot = document.createElement('div');
      modalRoot.id = 'modal-root';
      document.body.appendChild(modalRoot);
    }
    modalRoot.style.position = 'relative';
    modalRoot.style.zIndex = '99999';

    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay" style="z-index: 99999; position: fixed; inset: 0; background: rgba(4,5,8,0.85); backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center; padding: 1.5rem;">
        <div class="p-modal" style="max-width: 480px; width: 100%; background: #0f1117; border: 1px solid rgba(255,255,255,0.12); border-radius: var(--radius-lg, 16px); box-shadow: 0 25px 60px rgba(0,0,0,0.95); overflow: hidden;">
          
          <div class="p-modal-header" style="padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div class="p-modal-title" style="font-size: 1.25rem; font-weight: 800; color: #ffffff;">Edit Account Details</div>
              <div class="p-modal-sub" style="font-size: 0.8rem; color: var(--slate-muted, #94a3b8); margin-top: 0.2rem;">
                ${acc.name} (${acc.role})
              </div>
            </div>
            <button type="button" id="btn-close-edit-modal" class="p-modal-close" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #fff; font-size: 1rem; width: 34px; height: 34px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
          </div>

          <form id="form-edit-account" style="padding: 1.5rem;">
            <div id="edit-modal-alert" style="display: none; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.35); color: #fca5a5; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.825rem; font-weight: 600; margin-bottom: 1.15rem;"></div>

            <div class="p-form-row" style="margin-bottom: 1.15rem;">
              <label for="inp-edit-login-id" style="display: block; font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem;">
                Login ID <span style="color: #ef4444;">*</span>
              </label>
              <input type="text" class="mnc-input" id="inp-edit-login-id" value="${acc.loginId}" required style="width: 100%; box-sizing: border-box; font-family: var(--font-mono, monospace); font-weight: 700;" />
            </div>

            <div class="p-form-row" style="margin-bottom: 1.15rem;">
              <label for="sel-edit-status" style="display: block; font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem;">
                Account Status <span style="color: #ef4444;">*</span>
              </label>
              <select class="mnc-select" id="sel-edit-status" style="width: 100%; box-sizing: border-box;">
                <option value="Active" ${acc.status === 'Active' ? 'selected' : ''}>Active</option>
                <option value="Inactive" ${acc.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
              </select>
            </div>

            <div class="p-form-row" style="margin-bottom: 1.15rem;">
              <label for="inp-edit-email" style="display: block; font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem;">Email</label>
              <input type="email" class="mnc-input" id="inp-edit-email" value="${acc.email || ''}" style="width: 100%; box-sizing: border-box;" />
            </div>

            <div class="p-form-row" style="margin-bottom: 1.5rem;">
              <label for="inp-edit-phone" style="display: block; font-size: 0.825rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.35rem;">Phone Number</label>
              <input type="tel" class="mnc-input" id="inp-edit-phone" value="${acc.phone || ''}" style="width: 100%; box-sizing: border-box;" />
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
              <button type="button" class="p-ghost-btn" id="btn-cancel-edit-modal" style="padding: 0.65rem 1.25rem; cursor: pointer;">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary" id="btn-submit-edit-account" style="padding: 0.65rem 1.5rem; font-weight: 800; cursor: pointer;">
                Save Changes
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-edit-modal').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-edit-modal').addEventListener('click', close);

    const form = modalRoot.querySelector('#form-edit-account');
    const alertBox = modalRoot.querySelector('#edit-modal-alert');
    const btnSubmit = modalRoot.querySelector('#btn-submit-edit-account');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertBox.style.display = 'none';

      const loginId = modalRoot.querySelector('#inp-edit-login-id').value.trim();
      const status = modalRoot.querySelector('#sel-edit-status').value;
      const email = modalRoot.querySelector('#inp-edit-email').value.trim();
      const phone = modalRoot.querySelector('#inp-edit-phone').value.trim();

      if (!loginId) {
        alertBox.textContent = 'Login ID is required.';
        alertBox.style.display = 'block';
        return;
      }

      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Saving...';

      const res = await store.updateAccount(acc.id, { loginId, status, email, phone });
      if (res && res.success) {
        close();
        showToast('✓ Account updated successfully!', 'success');
        await loadData();
      } else {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Save Changes';
        alertBox.textContent = res.message || 'Failed to update account.';
        alertBox.style.display = 'block';
      }
    });
  }

  // ==========================================
  // MODAL: VIEW ACCOUNT DETAILS
  // ==========================================
  function openViewAccountModal(acc) {
    let modalRoot = document.getElementById('modal-root');
    if (!modalRoot) {
      modalRoot = document.createElement('div');
      modalRoot.id = 'modal-root';
      document.body.appendChild(modalRoot);
    }
    modalRoot.style.position = 'relative';
    modalRoot.style.zIndex = '99999';

    const isActive = acc.status === 'Active';
    const createdStr = acc.createdAt ? new Date(acc.createdAt).toLocaleString('en-IN') : 'Recent';
    const updatedStr = acc.updatedAt ? new Date(acc.updatedAt).toLocaleString('en-IN') : 'Recent';

    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay" style="z-index: 99999; position: fixed; inset: 0; background: rgba(4,5,8,0.85); backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center; padding: 1.5rem;">
        <div class="p-modal" style="max-width: 500px; width: 100%; background: #0f1117; border: 1px solid rgba(255,255,255,0.12); border-radius: var(--radius-lg, 16px); box-shadow: 0 25px 60px rgba(0,0,0,0.95); overflow: hidden;">
          
          <div class="p-modal-header" style="padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div class="p-modal-title" style="font-size: 1.25rem; font-weight: 800; color: #ffffff;">Account Profile</div>
              <div class="p-modal-sub" style="font-size: 0.8rem; color: var(--slate-muted, #94a3b8); margin-top: 0.2rem;">
                Official Institutional Access Credentials
              </div>
            </div>
            <button type="button" id="btn-close-view-modal" class="p-modal-close" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #fff; font-size: 1rem; width: 34px; height: 34px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
          </div>

          <div style="padding: 1.5rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
              <div>
                <div style="font-size: 1.15rem; font-weight: 800; color: #ffffff;">${acc.name}</div>
                <div style="font-size: 0.8rem; color: var(--primary-gold, #f3d182); font-family: var(--font-mono, monospace); margin-top: 0.2rem;">
                  ${acc.role} · ${acc.targetId}
                </div>
              </div>
              <span class="p-badge ${isActive ? 'p-badge-green' : ''}" style="${!isActive ? 'background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3);' : ''}; font-weight: 800; font-size: 0.8rem;">
                ● ${acc.status}
              </span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.85rem;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem;">
                <span style="color: var(--slate-muted, #94a3b8);">Login ID / Username:</span>
                <span style="font-family: var(--font-mono, monospace); font-weight: 700; color: #ffffff;">${acc.loginId}</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem;">
                <span style="color: var(--slate-muted, #94a3b8);">Security Status:</span>
                <span style="color: #4ade80; font-weight: 700;">Encrypted Scrypt Hash ✓ (Never Exposed)</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem;">
                <span style="color: var(--slate-muted, #94a3b8);">Email:</span>
                <span style="color: #ffffff;">${acc.email || 'None on record'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem;">
                <span style="color: var(--slate-muted, #94a3b8);">Phone:</span>
                <span style="color: #ffffff;">${acc.phone || 'None on record'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem;">
                <span style="color: var(--slate-muted, #94a3b8);">Account Created:</span>
                <span style="color: #ffffff;">${createdStr}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--slate-muted, #94a3b8);">Last Updated:</span>
                <span style="color: #ffffff;">${updatedStr}</span>
              </div>
            </div>

            <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
              <button type="button" class="btn-mnc btn-mnc-secondary" id="btn-view-close">Close</button>
            </div>
          </div>

        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-view-modal').addEventListener('click', close);
    modalRoot.querySelector('#btn-view-close').addEventListener('click', close);
  }

  // Initial load
  loadData();
}
