/* ==========================================================================
   SESSION POSTPONEMENT MODAL COMPONENT
   GAFOOR DRIVING SCHOOL — PULIVENDULA, ANDHRA PRADESH
   
   Allows student / trainer / admin to postpone a training session:
   - Preserves progressive Day 1–Day 20 sequence
   - Moves training day & curriculum objective to next valid academy date
   - Shifts all subsequent sessions forward sequentially
   - Recalculates course completion date automatically
   ========================================================================== */

import { store } from '../store.js';
import { formatDateDisplay, getNextValidTrainingDay } from '../utils/academyCalendar.js';

export function openPostponeModal({ studentId, session, onPostponed }) {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  const holidays = store.getHolidays();
  const nextProjectedDate = getNextValidTrainingDay(session.date, holidays);

  modalRoot.innerHTML = `
    <div class="mnc-modal-overlay" id="postpone-modal-overlay">
      <div class="postpone-modal" style="
        background: #0d0f14;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 16px;
        width: 95vw;
        max-width: 520px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.9);
        animation: modalFadeIn 0.25s ease-out;
        overflow: hidden;
      ">
        <div style="
          padding: 1.15rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: #12151d;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <div>
            <div style="font-size: 1.1rem; font-weight: 800; color: #ffffff;">
              Postpone Training Session
            </div>
            <div style="font-size: 0.8rem; color: #a1a1aa; margin-top: 0.15rem;">
              Day ${session.dayNumber} — ${session.objective}
            </div>
          </div>
          <button type="button" id="btn-close-postpone" style="
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #ffffff;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">✕</button>
        </div>

        <form id="form-confirm-postpone" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- Shift summary box -->
          <div style="
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            padding: 1rem;
          ">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem;">
              <span style="font-size: 0.72rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Original Scheduled Date</span>
              <span style="font-size: 0.85rem; font-family: monospace; font-weight: 700; color: #f87171;">
                ${session.date} (${formatDateDisplay(session.date, { weekday: 'short', month: 'short', day: 'numeric' })})
              </span>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem;">
              <span style="font-size: 0.72rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Next Available Training Day</span>
              <span style="font-size: 0.85rem; font-family: monospace; font-weight: 700; color: #22c55e;">
                ${nextProjectedDate} (${formatDateDisplay(nextProjectedDate, { weekday: 'short', month: 'short', day: 'numeric' })})
              </span>
            </div>

            <div style="font-size: 0.75rem; color: #a1a1aa; line-height: 1.4; border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 0.65rem;">
              The curriculum objective <strong>"Day ${session.dayNumber}: ${session.objective}"</strong> will move to ${nextProjectedDate}. Subsequent training days will automatically shift forward to preserve the progressive 20-day sequence.
            </div>
          </div>

          <!-- Reason input -->
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.4rem;">
              Reason for Postponement *
            </label>
            <input type="text" id="postpone-reason" required placeholder="e.g. Student illness / Exam conflict / Emergency" value="Personal schedule conflict" style="
              width: 100%;
              padding: 0.65rem 0.85rem;
              background: #141720;
              border: 1px solid rgba(255, 255, 255, 0.15);
              border-radius: 8px;
              color: #ffffff;
              font-size: 0.85rem;
            ">
          </div>

          <!-- Buttons -->
          <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem;">
            <button type="button" id="btn-cancel-postpone" style="
              background: transparent;
              border: 1px solid rgba(255, 255, 255, 0.15);
              color: #ffffff;
              padding: 0.6rem 1.15rem;
              border-radius: 8px;
              font-size: 0.825rem;
              font-weight: 700;
              cursor: pointer;
            ">Cancel</button>

            <button type="submit" style="
              background: #ffffff;
              border: none;
              color: #000000;
              padding: 0.6rem 1.35rem;
              border-radius: 8px;
              font-size: 0.825rem;
              font-weight: 800;
              cursor: pointer;
            ">Confirm Postponement →</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const close = () => { modalRoot.innerHTML = ''; };
  modalRoot.querySelector('#btn-close-postpone').addEventListener('click', close);
  modalRoot.querySelector('#btn-cancel-postpone').addEventListener('click', close);
  modalRoot.querySelector('#postpone-modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'postpone-modal-overlay') close();
  });

  modalRoot.querySelector('#form-confirm-postpone').addEventListener('submit', (e) => {
    e.preventDefault();
    const reason = modalRoot.querySelector('#postpone-reason').value;
    store.postponeSession(studentId, session.dayNumber, reason);
    close();
    if (onPostponed) onPostponed();
  });
}
