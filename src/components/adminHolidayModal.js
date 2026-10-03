/* ==========================================================================
   ADMIN ACADEMY HOLIDAY & CLOSURE MANAGER MODAL
   GAFOOR DRIVING SCHOOL — PULIVENDULA, ANDHRA PRADESH
   
   Allows Admin to:
   - View all registered Festival & Academy Holidays & Special Closures
   - Add new holidays / closures with date, name, and type
   - Remove existing holidays
   - Automatically triggers schedule recalculation for all active students' future
     uncompleted days, strictly preserving completed historical sessions!
   ========================================================================== */

import { store } from '../store.js';
import { formatDateDisplay } from '../utils/academyCalendar.js';

export function openAdminHolidayModal(onSaved) {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  function renderModal() {
    const holidays = store.getHolidays();

    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay" id="holiday-modal-overlay">
        <div class="holiday-modal" style="
          background: #0d0f14;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 16px;
          width: 95vw;
          max-width: 680px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.9);
          animation: modalFadeIn 0.25s ease-out;
        ">
          <!-- HEADER -->
          <div style="
            padding: 1.15rem 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #12151d;
          ">
            <div>
              <div style="font-size: 1.15rem; font-weight: 800; color: #ffffff;">
                Academy Calendar &amp; Holiday Manager
              </div>
              <div style="font-size: 0.8rem; color: #a1a1aa; margin-top: 0.2rem;">
                Sundays are automatically skipped. Add festival holidays or special closure dates below.
              </div>
            </div>
            <button type="button" id="btn-close-holidays" style="
              background: rgba(255, 255, 255, 0.08);
              border: 1px solid rgba(255, 255, 255, 0.15);
              color: #ffffff;
              width: 34px;
              height: 34px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">✕</button>
          </div>

          <!-- BODY -->
          <div style="padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- ADD NEW HOLIDAY FORM -->
            <form id="form-add-holiday" style="
              background: rgba(255, 255, 255, 0.03);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 12px;
              padding: 1.25rem;
            ">
              <div style="font-size: 0.85rem; font-weight: 800; color: #ffffff; margin-bottom: 0.85rem;">
                + Add Academy / Festival Holiday or Closure
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 0.85rem;">
                <div>
                  <label style="display: block; font-size: 0.72rem; color: #a1a1aa; text-transform: uppercase; font-weight: 700; margin-bottom: 0.3rem;">
                    Closure Date *
                  </label>
                  <input type="date" id="holiday-date" required value="${new Date().toISOString().split('T')[0]}" style="
                    width: 100%;
                    padding: 0.55rem 0.75rem;
                    background: #141720;
                    border: 1px solid rgba(255, 255, 255, 0.14);
                    border-radius: 6px;
                    color: #ffffff;
                    font-size: 0.85rem;
                  ">
                </div>

                <div>
                  <label style="display: block; font-size: 0.72rem; color: #a1a1aa; text-transform: uppercase; font-weight: 700; margin-bottom: 0.3rem;">
                    Holiday Type *
                  </label>
                  <select id="holiday-type" style="
                    width: 100%;
                    padding: 0.55rem 0.75rem;
                    background: #141720;
                    border: 1px solid rgba(255, 255, 255, 0.14);
                    border-radius: 6px;
                    color: #ffffff;
                    font-size: 0.85rem;
                  ">
                    <option value="festival">Festival Holiday (Gazetted)</option>
                    <option value="academy">Academy Holiday</option>
                    <option value="closure">Special Closure / Fleet Maintenance</option>
                  </select>
                </div>
              </div>

              <div style="margin-bottom: 1rem;">
                <label style="display: block; font-size: 0.72rem; color: #a1a1aa; text-transform: uppercase; font-weight: 700; margin-bottom: 0.3rem;">
                  Holiday / Occasion Title *
                </label>
                <input type="text" id="holiday-name" required placeholder="e.g. Diwali / Fleet Service Day" style="
                  width: 100%;
                  padding: 0.55rem 0.75rem;
                  background: #141720;
                  border: 1px solid rgba(255, 255, 255, 0.14);
                  border-radius: 6px;
                  color: #ffffff;
                  font-size: 0.85rem;
                ">
              </div>

              <div style="display: flex; justify-content: flex-end;">
                <button type="submit" style="
                  background: #ffffff;
                  color: #000000;
                  border: none;
                  padding: 0.55rem 1.25rem;
                  border-radius: 6px;
                  font-size: 0.825rem;
                  font-weight: 800;
                  cursor: pointer;
                ">
                  Save Holiday &amp; Recalculate Schedules →
                </button>
              </div>
            </form>

            <!-- CURRENT HOLIDAYS LIST -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem;">
                <span style="font-size: 0.75rem; font-weight: 800; color: #71717a; text-transform: uppercase;">
                  Registered Non-Training Dates (${holidays.length})
                </span>
                <span style="font-size: 0.72rem; color: #71717a;">
                  Sundays are skipped automatically
                </span>
              </div>

              <div style="
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 8px;
                overflow: hidden;
              ">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.825rem;">
                  <thead>
                    <tr style="background: #141720; color: #71717a; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                      <th style="padding: 0.65rem 0.85rem;">Date</th>
                      <th style="padding: 0.65rem 0.85rem;">Occasion / Reason</th>
                      <th style="padding: 0.65rem 0.85rem;">Category</th>
                      <th style="padding: 0.65rem 0.85rem; text-align: right;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${holidays.map(h => `
                      <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.04);">
                        <td style="padding: 0.65rem 0.85rem; color: #ffffff; font-family: monospace; font-weight: 700;">
                          ${h.date}
                        </td>
                        <td style="padding: 0.65rem 0.85rem; color: #d4d4d8;">
                          ${h.name}
                        </td>
                        <td style="padding: 0.65rem 0.85rem;">
                          <span style="
                            padding: 0.15rem 0.45rem;
                            border-radius: 4px;
                            font-size: 0.65rem;
                            font-weight: 700;
                            text-transform: uppercase;
                            background: rgba(255, 255, 255, 0.06);
                            color: #a1a1aa;
                            border: 1px solid rgba(255, 255, 255, 0.1);
                          ">
                            ${h.type || 'Holiday'}
                          </span>
                        </td>
                        <td style="padding: 0.65rem 0.85rem; text-align: right;">
                          <button type="button" class="btn-del-holiday" data-id="${h.id}" style="
                            background: transparent;
                            border: none;
                            color: #f87171;
                            cursor: pointer;
                            font-size: 0.75rem;
                            font-weight: 700;
                          ">Delete</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- EXPLANATION CALLOUT -->
            <div style="
              padding: 0.85rem 1rem;
              background: rgba(255, 255, 255, 0.02);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 8px;
              font-size: 0.75rem;
              color: #a1a1aa;
              line-height: 1.4;
            ">
              <strong style="color: #ffffff;">Automatic Recalculation Rule:</strong>
              When a holiday is added or removed, all future uncompleted training days across all students are shifted automatically to the next available academy working days. Past completed sessions and GPS history remain untouched.
            </div>

          </div>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-holidays').addEventListener('click', close);
    modalRoot.querySelector('#holiday-modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'holiday-modal-overlay') close();
    });

    // Form submit
    modalRoot.querySelector('#form-add-holiday').addEventListener('submit', (e) => {
      e.preventDefault();
      const date = modalRoot.querySelector('#holiday-date').value;
      const type = modalRoot.querySelector('#holiday-type').value;
      const name = modalRoot.querySelector('#holiday-name').value;

      if (!date || !name) return;

      store.addHoliday({
        id: `HOL-${Date.now()}`,
        date,
        name,
        type,
        notes: 'Admin configured closure'
      });

      if (onSaved) onSaved();
      renderModal();
    });

    // Delete buttons
    modalRoot.querySelectorAll('.btn-del-holiday').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        store.deleteHoliday(id);
        if (onSaved) onSaved();
        renderModal();
      });
    });
  }

  renderModal();
}
