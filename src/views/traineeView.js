/* ==========================================================================
   GAFOOR DRIVING SCHOOL — CANDIDATE PORTAL
   Full-page layout fitting 100% viewport width without spaces.
   Dedicated candidate services:
   - Service 01: 20-Day Practical Curriculum Roadmap (8 km/day)
   - Service 02: Tuition Account, Invoices & UPI QR Voucher Payment
   - Service 03: Candidate Master KYC, LLR Permit & RTO Readiness Dossier
   ========================================================================== */

import { store, formatReadableDate, getLocalTodayDate } from '../store.js';
import { renderBrandLogo } from '../components/brandLogo.js';
import { renderStudentAvatar } from '../components/studentAvatar.js';
import { triggerPhotoUpload } from '../components/photoCropModal.js';
import { renderProgressiveCalendar } from '../components/progressiveCalendar.js';
import { openLiveRideMapModal } from '../components/liveRideTrackingModal.js';

export function renderTraineeView(container, showToast, subService = 'curriculum', onNavigate) {
  let activeFilter = 'all';
  let selectedDate = store.getTodayDateStr();
  let traineeSlotTab = 'slots'; // 'slots' | 'my-rides'
  let traineeSlotViewMode = 'table'; // 'table' | 'cards'
  let traineeSlotStatusFilter = 'all'; // 'all' | 'available' | 'my-bookings' | 'completed' | 'full'
  let traineeSlotSearch = '';

  function formatSlotDateShort(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }

  function render() {
    const trainee  = store.getCurrentTrainee();
    const currentDay = trainee.currentDay || store.traineeTestDay;
    const progressPercent = Math.min(100, Math.round((currentDay / 20) * 100));
    const trainer  = store.trainers.find(t => t.id === trainee.assignedTrainerId) || store.trainers[0];
    const curriculum = store.getCurriculum();
    const invoice  = store.payments.find(p => p.traineeId === trainee.id) || store.payments[0];
    const kmDriven = currentDay * 8;
    const kmRemaining = Math.max(0, (20 - currentDay) * 8);

    const sched = store.getStudentSchedule(trainee.id);
    const todaySession = sched?.sessions?.find(s => s.dayNumber === currentDay) || {
      dayNumber: currentDay,
      objective: 'Practical Road Driving Lesson (8.0 km)',
      stage: currentDay <= 10 ? 'Stage 1 · Basic Driving' : currentDay <= 15 ? 'Stage 2 · Intermediate Driving' : 'Stage 3 · Advanced Road Skills'
    };

    const currentSub = subService || 'curriculum';

    const topbar = '';

    let contentHtml = '';

    // =========================================================
    // SERVICE 01: 20-DAY CURRICULUM ROADMAP (CALENDAR ENGINE)
    // =========================================================
    if (currentSub === 'curriculum') {
      contentHtml = `
        <div class="portal-page-header">
          <div style="display:flex; align-items:center; gap:1.15rem;">
            ${renderStudentAvatar(trainee, 54)}
            <div>
              <h1 class="portal-page-title">${trainee.name} — 20-Day Practical Driving Course</h1>
              <p class="portal-page-sub">${trainee.package} · LLR Permit: ${trainee.permitNumber || 'AP004/LLR/2026/8941'} · Instructor: ${trainer.name}</p>
            </div>
          </div>
          <div style="display:flex; gap:0.65rem; align-items:center; flex-wrap:wrap;">
            <button type="button" class="btn-mnc btn-mnc-primary" id="btn-student-start-gps-ride" style="background:#22c55e; border-color:#22c55e; color:#000000; font-weight:900; box-shadow:0 4px 18px rgba(34,197,94,0.45); display:flex; align-items:center; gap:0.45rem;">
              <span>🚀</span> <span>Start Ride (Live GPS)</span>
            </button>
            <button type="button" class="btn-mnc btn-mnc-secondary" id="btn-go-to-book-slot">Book Driving Slot →</button>
            <button type="button" class="btn-mnc btn-mnc-secondary" id="btn-show-qr-voucher">Pay Course Fee (UPI QR)</button>
          </div>
        </div>

        <!-- TODAY'S PRACTICAL RIDE & LIVE GPS TRACKER HERO CARD -->
        <div class="today-ride-hero-card" style="
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.14) 0%, rgba(15, 23, 42, 0.85) 100%);
          border: 1.5px solid rgba(34, 197, 94, 0.45);
          border-radius: 14px;
          padding: 1.25rem 1.6rem;
          margin-bottom: 1.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.25rem;
          flex-wrap: wrap;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        ">
          <div style="display:flex; align-items:center; gap:1.15rem;">
            <div style="
              width: 54px;
              height: 54px;
              border-radius: 14px;
              background: #22c55e;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.75rem;
              box-shadow: 0 4px 20px rgba(34, 197, 94, 0.45);
            ">🚗</div>
            <div>
              <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.25rem; flex-wrap:wrap;">
                <span class="p-badge p-badge-green" style="font-size:0.72rem; font-weight:900; letter-spacing:0.04em;">
                  DAY ${currentDay} PRACTICAL RIDE
                </span>
                <span style="font-size:0.8rem; color:#a1a1aa; font-weight:700;">
                  Target: 8.00 km (16 Checkpoints @ 500m Intervals)
                </span>
              </div>
              <h3 style="font-size:1.2rem; font-weight:900; color:#ffffff; margin:0 0 0.25rem 0;">
                ${todaySession.objective || 'Practical Road Driving Lesson'}
              </h3>
              <p style="font-size:0.825rem; color:#94a3b8; margin:0;">
                Instructor: <strong style="color:#ffffff;">${trainer.name}</strong> · Fleet Rig: <strong style="color:#ffffff;">${trainer.car}</strong> (Dual-Brake) · Sector: <strong style="color:#ffffff;">Pulivendula</strong>
              </p>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:0.85rem; flex-wrap:wrap;">
            <button type="button" class="btn-mnc btn-mnc-primary" id="btn-hero-start-gps-ride" style="
              background: #22c55e;
              border-color: #22c55e;
              color: #000000;
              font-weight: 900;
              padding: 0.85rem 1.85rem;
              font-size: 0.95rem;
              border-radius: 10px;
              box-shadow: 0 6px 24px rgba(34, 197, 94, 0.5);
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            ">
              <span>🚀</span>
              <span>Start Live GPS Ride (500m Tracking) →</span>
            </button>
          </div>
        </div>

        <!-- PROGRESSIVE CALENDAR MOUNT -->
        <div id="progressive-calendar-mount"></div>
      `;
    }

    // =========================================================
    // SERVICE 02: TUITION FEE STATEMENT & UPI PAYMENT
    // =========================================================
    if (currentSub === 'billing') {
      contentHtml = `
        <div class="portal-page-header">
          <div style="display:flex; align-items:center; gap:1.15rem;">
            ${renderStudentAvatar(trainee, 54)}
            <div>
              <h1 class="portal-page-title">Course Fee Payment &amp; Receipts</h1>
              <p class="portal-page-sub">Pay course fees conveniently using PhonePe, Google Pay, or Paytm UPI QR code.</p>
            </div>
          </div>
          <button type="button" class="btn-mnc btn-mnc-primary" id="btn-show-qr-voucher-billing">Show UPI QR Code →</button>
        </div>

        <div class="portal-stats-strip">
          <div class="portal-stat">
            <span class="portal-stat-value">₹${invoice.amount.toLocaleString('en-IN')}</span>
            <span class="portal-stat-label">Total Course Fee</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">₹${invoice.paid.toLocaleString('en-IN')}</span>
            <span class="portal-stat-label">Fee Paid</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:${invoice.balance > 0 ? 'var(--primary-gold)' : 'var(--neem-green)'};">
              ₹${invoice.balance.toLocaleString('en-IN')}
            </span>
            <span class="portal-stat-label">Balance Fee</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value">${invoice.status.toUpperCase()}</span>
            <span class="portal-stat-label">Fee Status</span>
          </div>
        </div>

        <div class="portal-section">
          <div class="portal-section-header">
            <span class="portal-section-title">Fee Receipt &amp; Statement</span>
            <span class="portal-section-meta">Receipt #${invoice.id}</span>
          </div>
          <div class="p-summary-row">
            <span class="p-summary-key">Course Package</span>
            <span class="p-summary-value">${trainee.package}</span>
          </div>
          <div class="p-summary-row">
            <span class="p-summary-key">Total Course Fee</span>
            <span class="p-summary-value" style="font-family:var(--font-mono);">₹${invoice.amount.toLocaleString('en-IN')}</span>
          </div>
          <div class="p-summary-row">
            <span class="p-summary-key">Amount Paid</span>
            <span class="p-summary-value" style="color:var(--neem-green); font-family:var(--font-mono);">₹${invoice.paid.toLocaleString('en-IN')}</span>
          </div>
          <div class="p-summary-row">
            <span class="p-summary-key">Balance Due</span>
            <span class="p-summary-value" style="color:${invoice.balance > 0 ? 'var(--primary-gold)' : 'var(--neem-green)'}; font-family:var(--font-mono);">₹${invoice.balance.toLocaleString('en-IN')}</span>
          </div>
          <div class="p-summary-row">
            <span class="p-summary-key">Due Date</span>
            <span class="p-summary-value">${invoice.dueDate || '2026-09-30'}</span>
          </div>
          <div class="p-summary-row">
            <span class="p-summary-key">Accepted Payment Modes</span>
            <span class="p-summary-value">PhonePe UPI / Google Pay / BHIM / Cash at Desk</span>
          </div>
          ${invoice.balance > 0 ? `
            <div style="margin-top:1.5rem;">
              <button type="button" class="btn-mnc btn-mnc-primary" id="btn-pay-now-action" style="padding:0.8rem 1.8rem;">
                Pay Balance of ₹${invoice.balance.toLocaleString('en-IN')} via UPI QR →
              </button>
            </div>
          ` : `
            <div style="margin-top:1.5rem; padding:1rem; border-radius:var(--radius-sm); background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.18); font-size:0.9rem; color:#ffffff; font-weight:800;">
              ✓ Your course fee is fully paid and cleared! No further payment is due.
            </div>
          `}
        </div>
      `;
    }

    // =========================================================
    // SERVICE 03: STUDENT PROFILE & LEARNER LICENSE
    // =========================================================
    if (currentSub === 'profile') {
      contentHtml = `
        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">Student Profile &amp; Learner License (LLR)</h1>
            <p class="portal-page-sub">Official Government Learner's Licence (LLR) details, instructor assignment, and contact records.</p>
          </div>
          <div class="portal-page-header-meta">
            <span class="p-badge p-badge-green">Govt. Verified</span>
            <span class="p-badge p-badge-dim">Pulivendula Academy</span>
          </div>
        </div>

        <div class="portal-section">
          <!-- Photo Hero Strip -->
          <div style="display:flex; align-items:center; gap:1.5rem; padding:1.25rem 0 1.5rem; border-bottom:1px solid rgba(255,255,255,0.07); margin-bottom:1.25rem; flex-wrap:wrap;">
            <div style="flex-shrink:0;">
              ${trainee.profilePhotoData
                ? `<div style="width:92px;height:92px;border-radius:50%;overflow:hidden;background:#ffffff;border:2px solid rgba(255,255,255,0.3);box-shadow:0 4px 16px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;"><img src="${trainee.profilePhotoData}" alt="${trainee.name}" style="width:100%;height:100%;object-fit:cover;display:block;" /></div>`
                : `<div style="width:92px;height:92px;border-radius:50%;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:800;color:#ffffff;">${(trainee.avatar||trainee.name.substring(0,2)).toUpperCase()}</div>`
              }
            </div>
            <div style="flex:1; min-width:240px;">
              <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
                <div>
                  <div style="font-size:1.35rem;font-weight:800;color:#ffffff;line-height:1.2;">${trainee.name}</div>
                  ${trainee.gender ? `<div style="font-size:0.8rem;color:var(--slate-muted);margin-top:0.2rem;">${trainee.gender}</div>` : ''}
                  <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.55rem;">
                    <span class="p-badge p-badge-gold" style="font-size:0.65rem;">${trainee.id}</span>
                    <span class="p-badge p-badge-green" style="font-size:0.65rem;">Govt. Verified ✓</span>
                    <span class="p-badge p-badge-dim" style="font-size:0.65rem;">${trainee.hasSmartphone === 'no' ? '📵 No Smartphone' : '📱 Has Smartphone'}</span>
                  </div>
                </div>
                <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm" id="btn-trainee-change-photo" style="font-size:0.78rem; padding:0.45rem 0.95rem; border-color:rgba(255,255,255,0.25); color:#ffffff;">
                  📷 ${trainee.profilePhotoData ? 'Change Photo / Logo' : 'Upload Photo / Logo'}
                </button>
              </div>
            </div>
          </div>
          <div class="portal-section-header" style="margin-top:0;">
            <span class="portal-section-title">Student Information &amp; Contact Details</span>
          </div>
          <div class="p-detail-grid">
            <div class="p-detail-cell">
              <div class="p-detail-key">Full Name</div>
              <div class="p-detail-value">${trainee.name}</div>
              <div class="p-detail-sub">As registered with RTO Parivahan</div>
            </div>
            ${trainee.surname ? `
            <div class="p-detail-cell">
              <div class="p-detail-key">Surname / Family Name</div>
              <div class="p-detail-value">${trainee.surname}</div>
              <div class="p-detail-sub">As on Aadhaar Card</div>
            </div>` : ''}
            <div class="p-detail-cell">
              <div class="p-detail-key">Student Admission ID</div>
              <div class="p-detail-value" style="font-family:var(--font-mono);">${trainee.id}</div>
              <div class="p-detail-sub">School registration number</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">Date of Joining (Admission)</div>
              <div class="p-detail-value" style="font-family:var(--font-mono);">${trainee.registeredDate || '2026-09-01'}</div>
              <div class="p-detail-sub">Official course enrollment date</div>
            </div>
            ${trainee.gender ? `
            <div class="p-detail-cell">
              <div class="p-detail-key">Gender</div>
              <div class="p-detail-value">${trainee.gender}</div>
              <div class="p-detail-sub">As declared at admission</div>
            </div>` : ''}
            <div class="p-detail-cell">
              <div class="p-detail-key">LLR Permit Number</div>
              <div class="p-detail-value" style="font-family:var(--font-mono); color:var(--primary-cyan);">${trainee.permitNumber || 'AP004/LLR/2026/8941'}</div>
              <div class="p-detail-sub">Learner's Licence — Govt. of Andhra Pradesh</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">Mobile Number</div>
              <div class="p-detail-value">${trainee.phone || '+91 98480 22334'}</div>
              <div class="p-detail-sub">Primary WhatsApp Contact</div>
            </div>
            ${trainee.alternatePhone ? `
            <div class="p-detail-cell">
              <div class="p-detail-key">Alternate Phone</div>
              <div class="p-detail-value">${trainee.alternatePhone}</div>
              <div class="p-detail-sub">Secondary / WhatsApp Alternate</div>
            </div>` : ''}
            <div class="p-detail-cell">
              <div class="p-detail-key">Assigned Driving Instructor</div>
              <div class="p-detail-value">${trainer.name}</div>
              <div class="p-detail-sub">${trainer.role} · ${trainer.car}</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">Emergency Contact</div>
              <div class="p-detail-value">${trainee.emergencyContact || 'Guardian / Family Contact'}</div>
              <div class="p-detail-sub">${trainee.emergencyPhone || '+91 98480 11222'}</div>
            </div>
            <div class="p-detail-cell">
              <div class="p-detail-key">Smartphone Status</div>
              <div class="p-detail-value" style="color:${trainee.hasSmartphone === 'no' ? 'var(--primary-gold)' : 'var(--neem-green)'};">
                ${trainee.hasSmartphone === 'no' ? '📵 Without Smartphone' : '📱 Has Smartphone'}
              </div>
              <div class="p-detail-sub">Used for UPI, WhatsApp &amp; LLR notifications</div>
            </div>
          </div>
        </div>
      `;
    }

    // =========================================================
    // SERVICE 04: PRACTICAL DRIVING SLOTS & RIDE STATUS
    // Visually follows the Admin Portal design (shell, stats strip,
    // quick dates, table & card dispatch views) with STRICTLY student-only
    // permissions: READ-ONLY slot viewing, booking available slots, and
    // viewing personal ride statuses (✓ RIDE COMPLETED, CONFIRMED, AVAILABLE, FULL).
    // NO admin management controls ([Edit], [Delete], [Assign], etc.)
    // =========================================================
    if (currentSub === 'slots') {
      const allSlotsOnDate = store.getSlotsForDate(selectedDate);
      const totalDayCapacity = allSlotsOnDate.reduce((acc, s) => acc + s.totalCapacity, 0);
      const totalAvailableDay = allSlotsOnDate.reduce((acc, s) => acc + s.availableSeats, 0);

      // Student's personal bookings across all dates
      const myAllBookings = store.getLearnerAllBookings ? store.getLearnerAllBookings(trainee.id) : store.slotBookings.filter(b => b.traineeId === trainee.id);
      const myActiveBookings = myAllBookings.filter(b => b.status === 'CONFIRMED');
      const myCompletedRides = myAllBookings.filter(b => b.status === 'COMPLETED' || b.attendance === 'present');

      // Filter slots for the selected date
      let filteredSlots = allSlotsOnDate.filter(slot => {
        const myBooking = slot.bookings.find(b => b.traineeId === trainee.id || (b.date === slot.date && b.startTime === slot.startTime && b.traineeId === trainee.id));
        const isCompleted = (myBooking && (myBooking.status === 'COMPLETED' || myBooking.attendance === 'present')) || slot.calculatedStatus === 'Completed' || slot.status === 'Completed';
        const isConfirmed = !isCompleted && myBooking && myBooking.status === 'CONFIRMED';
        const isFull = !isCompleted && !isConfirmed && (slot.calculatedStatus === 'Full' || slot.availableSeats <= 0);
        const isAvailable = !isCompleted && !isConfirmed && !isFull && slot.availableSeats > 0 && slot.calculatedStatus !== 'Cancelled' && slot.calculatedStatus !== 'Closed' && slot.calculatedStatus !== 'Maintenance';

        const fStatus = traineeSlotStatusFilter.toLowerCase();
        let matchStatus = true;
        if (fStatus === 'available') matchStatus = isAvailable;
        else if (fStatus === 'my-bookings') matchStatus = isConfirmed;
        else if (fStatus === 'completed') matchStatus = isCompleted;
        else if (fStatus === 'full') matchStatus = isFull;

        const q = traineeSlotSearch.toLowerCase().trim();
        const matchQuery = !q ||
          slot.timeDisplay.toLowerCase().includes(q) ||
          slot.startTime.toLowerCase().includes(q) ||
          (slot.vehicleOverride && slot.vehicleOverride.toLowerCase().includes(q)) ||
          slot.trainerAllocations.some(a => (a.trainerName && a.trainerName.toLowerCase().includes(q)) || (a.vehicle && a.vehicle.toLowerCase().includes(q)));

        return matchStatus && matchQuery;
      });

      const availableSlotsCount = allSlotsOnDate.filter(s => {
        const myBooking = s.bookings.find(b => b.traineeId === trainee.id);
        const isCompleted = (myBooking && (myBooking.status === 'COMPLETED' || myBooking.attendance === 'present')) || s.calculatedStatus === 'Completed' || s.status === 'Completed';
        const isConfirmed = !isCompleted && myBooking && myBooking.status === 'CONFIRMED';
        const isFull = s.calculatedStatus === 'Full' || s.availableSeats <= 0;
        return !isCompleted && !isConfirmed && !isFull && s.availableSeats > 0 && s.calculatedStatus !== 'Cancelled' && s.calculatedStatus !== 'Closed' && s.calculatedStatus !== 'Maintenance';
      }).length;

      // Quick dates (next 5 days)
      const quickDates = [];
      const baseDt = new Date();
      for (let i = 0; i < 5; i++) {
        const d = new Date(baseDt);
        d.setDate(d.getDate() + i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dtStr = `${y}-${m}-${day}`;
        const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
        quickDates.push({ dateStr: dtStr, label });
      }

      contentHtml = `
        <div class="portal-page-header">
          <div>
            <h1 class="portal-page-title">Practical Driving Slots</h1>
            <p class="portal-page-sub">Select an available practical driving slot to reserve your training session · Dual-control training cars with AP RTO certified instructors.</p>
          </div>
          <div style="display:flex; gap:0.65rem; align-items:center; flex-wrap:wrap;">
            <span class="p-badge p-badge-green" style="font-size:0.75rem;">● Student Portal · Booking &amp; Ride Status</span>
            <span class="p-badge p-badge-dim" style="font-size:0.75rem;">Candidate: ${trainee.name} (${trainee.studentCode || trainee.id})</span>
          </div>
        </div>

        <!-- STATS STRIP (Admin Portal Design Language) -->
        <div class="portal-stats-strip">
          <div class="portal-stat">
            <span class="portal-stat-value">${allSlotsOnDate.length}</span>
            <span class="portal-stat-label">Daily Slots</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:${totalAvailableDay > 0 ? 'var(--neem-green)' : '#f87171'};">${totalAvailableDay}</span>
            <span class="portal-stat-label">Available Seats Today</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--primary-cyan);">${myActiveBookings.length}</span>
            <span class="portal-stat-label">Upcoming Bookings</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--neem-green);">${myCompletedRides.length}</span>
            <span class="portal-stat-label">Completed Rides</span>
          </div>
          <div class="portal-stat-div"></div>
          <div class="portal-stat">
            <span class="portal-stat-value" style="color:var(--primary-gold);">${currentDay} / 20</span>
            <span class="portal-stat-label">Course Progress</span>
          </div>
        </div>

        <!-- SUB-TABS -->
        <div style="display:flex; gap:0.5rem; padding:0 2rem; border-bottom:1px solid var(--border-light); background:rgba(255,255,255,0.01);">
          <button type="button" class="p-tab-btn ${traineeSlotTab === 'slots' ? 'p-tab-active' : ''} btn-trainee-slot-tab" data-tab="slots" style="padding:0.75rem 1.25rem; font-weight:700; font-size:0.875rem; background:transparent; border:none; color:${traineeSlotTab==='slots'?'#ffffff':'var(--slate-muted)'}; border-bottom:2px solid ${traineeSlotTab==='slots'?'#ffffff':'transparent'}; cursor:pointer;">
            📅 Available Practical Driving Slots (${allSlotsOnDate.length})
          </button>
          <button type="button" class="p-tab-btn ${traineeSlotTab === 'my-rides' ? 'p-tab-active' : ''} btn-trainee-slot-tab" data-tab="my-rides" style="padding:0.75rem 1.25rem; font-weight:700; font-size:0.875rem; background:transparent; border:none; color:${traineeSlotTab==='my-rides'?'#ffffff':'var(--slate-muted)'}; border-bottom:2px solid ${traineeSlotTab==='my-rides'?'#ffffff':'transparent'}; cursor:pointer;">
            🚗 My Practical Rides &amp; Status (${myAllBookings.length})
          </button>
        </div>

        ${traineeSlotTab === 'slots' ? `
          <!-- DATE & FILTER BAR -->
          <div class="slot-date-nav">
            <span style="font-size:0.875rem; font-weight:800; color:#ffffff; margin-right:0.35rem;">Training Date:</span>
            ${quickDates.map(qd => `
              <button type="button" class="slot-quick-date-btn ${selectedDate === qd.dateStr ? 'active' : ''}" data-student-date="${qd.dateStr}">
                📅 ${qd.label}
              </button>
            `).join('')}
            <div style="display:flex; align-items:center; gap:0.45rem;">
              <input type="date" class="mnc-input" id="inp-student-slot-date" value="${selectedDate}" style="padding:0.4rem 0.65rem; font-size:0.8125rem; width:150px;" />
            </div>

            <div style="display:flex; align-items:center; gap:0.65rem; margin-left:auto; flex-wrap:wrap;">
              <select class="mnc-select" id="sel-student-slot-status" style="padding:0.4rem 0.65rem; font-size:0.8125rem;">
                <option value="all" ${traineeSlotStatusFilter==='all'?'selected':''}>All Slots</option>
                <option value="available" ${traineeSlotStatusFilter==='available'?'selected':''}>Available Only</option>
                <option value="my-bookings" ${traineeSlotStatusFilter==='my-bookings'?'selected':''}>My Bookings</option>
                <option value="completed" ${traineeSlotStatusFilter==='completed'?'selected':''}>Completed Rides</option>
                <option value="full" ${traineeSlotStatusFilter==='full'?'selected':''}>Full Slots</option>
              </select>
              <input type="text" class="mnc-input" id="inp-student-slot-search" placeholder="Search time, vehicle…" value="${traineeSlotSearch}" style="padding:0.4rem 0.65rem; font-size:0.8125rem; width:170px;" />
            </div>
          </div>

          <!-- SLOTS LIST & TABLE VIEW -->
          <div class="portal-section">
            <div class="portal-section-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
              <div>
                <span class="portal-section-title">Driving Slots — ${formatReadableDate(selectedDate)}</span>
                <span class="portal-section-meta">${availableSlotsCount} slot${availableSlotsCount === 1 ? '' : 's'} available for reservation</span>
              </div>
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <button type="button" class="btn-mnc ${traineeSlotViewMode === 'table' ? 'btn-mnc-primary' : 'btn-mnc-secondary'} btn-mnc-sm btn-trainee-view-mode" data-mode="table" style="font-size:0.75rem; padding:0.35rem 0.75rem;">
                  📋 Table View
                </button>
                <button type="button" class="btn-mnc ${traineeSlotViewMode === 'cards' ? 'btn-mnc-primary' : 'btn-mnc-secondary'} btn-mnc-sm btn-trainee-view-mode" data-mode="cards" style="font-size:0.75rem; padding:0.35rem 0.75rem;">
                  🗂 Detailed Cards
                </button>
              </div>
            </div>

            ${traineeSlotViewMode === 'table' ? `
              <!-- DEDICATED DRIVING SLOTS TABLE (STUDENT PORTAL READ-ONLY/BOOKING) -->
              <div class="p-table-wrap" style="background:rgba(18,20,26,0.85); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-md); overflow:hidden;">
                <table class="p-table" style="margin:0;">
                  <thead>
                    <tr style="background:rgba(255,255,255,0.03); border-bottom:1px solid rgba(255,255,255,0.08);">
                      <th style="padding:1rem 1.25rem; font-weight:800; color:var(--slate-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em;">Date</th>
                      <th style="padding:1rem 1.25rem; font-weight:800; color:var(--slate-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em;">Time</th>
                      <th style="padding:1rem 1.25rem; font-weight:800; color:var(--slate-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; text-align:center;">Capacity</th>
                      <th style="padding:1rem 1.25rem; font-weight:800; color:var(--slate-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em;">Status</th>
                      <th style="padding:1rem 1.25rem; font-weight:800; color:var(--slate-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; text-align:right;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredSlots.length === 0 ? `
                      <tr>
                        <td colspan="5" style="padding:2.5rem 1rem; text-align:center; color:var(--slate-muted);">
                          No driving slots found matching filters for this date.
                        </td>
                      </tr>
                    ` : filteredSlots.map(slot => {
                      const myBooking = slot.bookings.find(b => b.traineeId === trainee.id || (b.date === slot.date && b.startTime === slot.startTime && b.traineeId === trainee.id));
                      const isCompletedRide = (myBooking && (myBooking.status === 'COMPLETED' || myBooking.attendance === 'present')) || slot.calculatedStatus === 'Completed' || slot.status === 'Completed';
                      const isConfirmedBooking = !isCompletedRide && myBooking && myBooking.status === 'CONFIRMED';
                      const isFullSlot = !isCompletedRide && !isConfirmedBooking && (slot.calculatedStatus === 'Full' || slot.availableSeats <= 0);
                      const isCancelledSlot = !isCompletedRide && !isConfirmedBooking && slot.calculatedStatus === 'Cancelled';
                      const isClosedSlot = !isCompletedRide && !isConfirmedBooking && (slot.calculatedStatus === 'Closed' || slot.calculatedStatus === 'Inactive');
                      const isMaintSlot = !isCompletedRide && !isConfirmedBooking && slot.calculatedStatus === 'Maintenance';
                      const isAvailableSlot = !isCompletedRide && !isConfirmedBooking && !isFullSlot && !isCancelledSlot && !isClosedSlot && !isMaintSlot && slot.availableSeats > 0;

                      const shortDate = formatSlotDateShort(slot.date);

                      return `
                        <tr class="${isCompletedRide ? 'completed-ride-row' : ''}" style="border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.15s ease;">
                          <td style="padding:1rem 1.25rem; font-weight:700; color:#ffffff; white-space:nowrap;">
                            ${shortDate}
                            <div style="font-size:0.7rem; color:${isCompletedRide ? '#4ade80' : 'var(--slate-muted)'}; font-weight:${isCompletedRide ? '700' : 'normal'};">
                              ${isCompletedRide ? '✓ Completed Session' : slot.date}
                            </div>
                          </td>
                          <td style="padding:1rem 1.25rem; font-family:var(--font-mono); font-weight:700; color:#ffffff; white-space:nowrap;">
                            ${slot.timeDisplay || `${slot.startTime} – ${slot.endTime}`}
                            <div style="font-size:0.7rem; color:${isCompletedRide ? '#86efac' : 'var(--slate-muted)'}; font-family:var(--font-sans); font-weight:normal;">
                              ${isCompletedRide ? 'Practical Lesson Finished' : '1-hr Practical Session'}
                            </div>
                          </td>
                          <td style="padding:1rem 1.25rem; text-align:center;">
                            ${isCompletedRide ? `
                              <span style="font-family:var(--font-mono); font-weight:800; color:#4ade80;">${slot.bookedCount}/${slot.totalCapacity}</span>
                              <div style="font-size:0.7rem; color:#4ade80; font-weight:700;">✓ Completed</div>
                            ` : isFullSlot ? `
                              <span style="font-family:var(--font-mono); font-weight:800; color:#f87171;">${slot.totalCapacity}/${slot.totalCapacity}</span>
                              <div style="font-size:0.7rem; color:#f87171; font-weight:600;">8/8 FULL</div>
                            ` : `
                              <span style="font-family:var(--font-mono); font-weight:800; color:#4ade80;">${slot.bookedCount}/${slot.totalCapacity}</span>
                              <div style="font-size:0.7rem; color:var(--slate-muted);">${slot.availableSeats} available</div>
                            `}
                          </td>
                          <td style="padding:1rem 1.25rem; white-space:nowrap;">
                            ${isCompletedRide ? `
                              <span class="slot-status-pill status-pill-completed">
                                ✓ RIDE COMPLETED
                              </span>
                            ` : isConfirmedBooking ? `
                              <span class="slot-status-pill status-pill-confirmed">CONFIRMED</span>
                            ` : isFullSlot ? `
                              <span class="slot-status-pill status-pill-full">FULL</span>
                            ` : isMaintSlot ? `
                              <span class="slot-status-pill status-pill-maintenance">MAINTENANCE</span>
                            ` : isClosedSlot ? `
                              <span class="slot-status-pill status-pill-closed">CLOSED</span>
                            ` : isCancelledSlot ? `
                              <span class="slot-status-pill status-pill-cancelled">CANCELLED</span>
                            ` : `
                              <span class="slot-status-pill status-pill-available">AVAILABLE</span>
                            `}
                          </td>
                          <td style="padding:1rem 1.25rem; text-align:right; white-space:nowrap;">
                            ${isCompletedRide ? `
                              <div style="display:inline-flex; flex-direction:column; align-items:flex-end; gap:0.25rem;">
                                <span class="action-badge-completed">
                                  <span style="font-size:0.95rem;">✓</span> Ride Completed
                                </span>
                                <span style="font-size:0.68rem; color:#94a3b8; font-weight:600;">No further action required</span>
                              </div>
                            ` : isConfirmedBooking ? `
                              <div style="display:inline-flex; align-items:center; gap:0.45rem; justify-content:flex-end;">
                                <span class="action-badge-booked">BOOKED</span>
                                <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-trainee-cancel-slot" data-booking-id="${myBooking.id}" style="padding:0.3rem 0.6rem; font-size:0.72rem; color:#f87171; border-color:rgba(239,68,68,0.3);" title="Cancel reservation">Cancel</button>
                              </div>
                            ` : isAvailableSlot ? `
                              <button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm btn-trainee-book-slot" data-slot-id="${slot.id}" data-date="${slot.date}" data-start-time="${slot.startTime}" data-end-time="${slot.endTime}" data-time-display="${slot.timeDisplay || `${slot.startTime} – ${slot.endTime}`}" style="padding:0.4rem 1.15rem; font-size:0.75rem; font-weight:800; letter-spacing:0.04em;">
                                BOOK
                              </button>
                            ` : isFullSlot ? `
                              <span class="action-badge-full">FULL</span>
                            ` : `
                              <span class="p-badge p-badge-dim" style="font-size:0.75rem; padding:0.35rem 0.75rem;">UNAVAILABLE</span>
                            `}
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <!-- DETAILED CARDS VIEW -->
              <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:1.25rem;">
                ${filteredSlots.length === 0 ? `
                  <div style="grid-column:1/-1; padding:2.5rem 1rem; text-align:center; color:var(--slate-muted); background:rgba(18,20,26,0.6); border:1px solid rgba(255,255,255,0.06); border-radius:var(--radius-md);">
                    No driving slots found matching filters for this date.
                  </div>
                ` : filteredSlots.map(slot => {
                  const myBooking = slot.bookings.find(b => b.traineeId === trainee.id || (b.date === slot.date && b.startTime === slot.startTime && b.traineeId === trainee.id));
                  const isCompletedRide = (myBooking && (myBooking.status === 'COMPLETED' || myBooking.attendance === 'present')) || slot.calculatedStatus === 'Completed' || slot.status === 'Completed';
                  const isConfirmedBooking = !isCompletedRide && myBooking && myBooking.status === 'CONFIRMED';
                  const isFullSlot = !isCompletedRide && !isConfirmedBooking && (slot.calculatedStatus === 'Full' || slot.availableSeats <= 0);
                  const isAvailableSlot = !isCompletedRide && !isConfirmedBooking && !isFullSlot && slot.availableSeats > 0 && slot.calculatedStatus !== 'Cancelled' && slot.calculatedStatus !== 'Closed' && slot.calculatedStatus !== 'Maintenance';
                  const pct = slot.totalCapacity > 0 ? Math.min(100, Math.round((slot.bookedCount / slot.totalCapacity) * 100)) : 0;

                  return `
                    <div style="background:${isCompletedRide ? 'linear-gradient(180deg, rgba(34,197,94,0.12) 0%, rgba(18,20,26,0.96) 100%)' : 'rgba(18,20,26,0.85)'}; border:${isCompletedRide ? '1.5px solid rgba(34,197,94,0.55)' : isConfirmedBooking ? '1.5px solid rgba(59,130,246,0.45)' : '1px solid rgba(255,255,255,0.08)'}; border-radius:var(--radius-md); padding:1.25rem 1.4rem; display:flex; flex-direction:column; justify-content:space-between; gap:1rem; box-shadow:${isCompletedRide ? '0 4px 20px rgba(34,197,94,0.12)' : 'none'};">
                      <div>
                        ${isCompletedRide ? `
                          <!-- Prominent Completion Ribbon -->
                          <div style="background:rgba(34,197,94,0.16); border:1px solid rgba(34,197,94,0.35); border-radius:6px; padding:0.45rem 0.75rem; margin-bottom:0.85rem; display:flex; align-items:center; justify-content:space-between;">
                            <span style="color:#4ade80; font-weight:800; font-size:0.8rem; display:inline-flex; align-items:center; gap:0.4rem;">
                              <span style="font-size:1rem;">✓</span> PRACTICAL RIDE COMPLETED
                            </span>
                            <span style="font-size:0.68rem; color:#86efac; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">Session Closed</span>
                          </div>
                        ` : ''}

                        <!-- Header -->
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
                          <div>
                            <div style="font-size:1.15rem; font-weight:800; font-family:var(--font-mono); color:#ffffff;">${slot.timeDisplay || `${slot.startTime} – ${slot.endTime}`}</div>
                            <div style="font-size:0.75rem; color:${isCompletedRide ? '#4ade80' : 'var(--slate-muted)'};">${formatReadableDate(slot.date)} · ${isCompletedRide ? 'Practical Lesson Finished' : '1-hr Practical'}</div>
                          </div>
                          <div>
                            ${isCompletedRide ? `
                              <span class="slot-status-pill status-pill-completed">✓ RIDE COMPLETED</span>
                            ` : isConfirmedBooking ? `
                              <span class="slot-status-pill status-pill-confirmed">CONFIRMED</span>
                            ` : isFullSlot ? `
                              <span class="slot-status-pill status-pill-full">FULL</span>
                            ` : `
                              <span class="slot-status-pill status-pill-available">AVAILABLE</span>
                            `}
                          </div>
                        </div>

                        <!-- Capacity Strip -->
                        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:var(--radius-sm); padding:0.65rem 0.85rem; margin-bottom:0.75rem;">
                          <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:0.35rem;">
                            <span style="color:var(--slate-muted);">${isCompletedRide ? 'Session Capacity:' : 'Slot Capacity:'}</span>
                            <span style="font-family:var(--font-mono); font-weight:800; color:${isCompletedRide ? '#4ade80' : isFullSlot ? '#f87171' : '#4ade80'};">${slot.bookedCount} / ${slot.totalCapacity} Booked</span>
                          </div>
                          <div style="height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden;">
                            <div style="height:100%; width:${pct}%; background:${isCompletedRide ? '#4ade80' : pct>=100?'#f87171':pct>=75?'#fbbf24':'#4ade80'}; border-radius:3px;"></div>
                          </div>
                          <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--slate-muted); margin-top:0.3rem;">
                            <span>${isCompletedRide ? 'All seats completed' : `${slot.availableSeats} seat${slot.availableSeats === 1 ? '' : 's'} remaining`}</span>
                            <span>${slot.availableTrainersCount || 4} On-Duty Instructors</span>
                          </div>
                        </div>

                        <!-- Info details -->
                        <div style="font-size:0.75rem; color:var(--slate-body); display:flex; flex-direction:column; gap:0.25rem;">
                          <div>🚗 <strong>Vehicle:</strong> Dual-Control RTO Training Car</div>
                          <div>👨‍🏫 <strong>Instructor:</strong> Certified AP RTO Driving Instructor</div>
                          ${isCompletedRide && myBooking ? `<div style="color:#4ade80; font-weight:700;">✓ Completed by: ${myBooking.traineeName} (Notes: ${myBooking.notes || 'Attendance Verified ✓'})</div>` : isConfirmedBooking ? `<div style="color:var(--primary-cyan); font-weight:700;">✓ Reserved by: ${myBooking.traineeName} (Car: ${myBooking.vehicle ? myBooking.vehicle.split('#')[0] : 'Swift Dual-Ctrl'})</div>` : ''}
                        </div>
                      </div>

                      <!-- Footer Student Actions (STRICTLY NO ADMIN CONTROLS) -->
                      <div style="border-top:1px solid rgba(255,255,255,0.06); padding-top:0.85rem; display:flex; justify-content:space-between; align-items:center;">
                        ${isCompletedRide ? `
                          <div style="background:rgba(34,197,94,0.12); border:1px solid rgba(34,197,94,0.3); border-radius:8px; padding:0.6rem 0.9rem; width:100%; display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:0.45rem;">
                              <span style="color:#4ade80; font-size:1.1rem; font-weight:900;">✓</span>
                              <div>
                                <div style="color:#4ade80; font-weight:800; font-size:0.82rem; line-height:1.2;">Ride Completed</div>
                                <div style="font-size:0.7rem; color:#94a3b8;">Practical session logged &amp; verified</div>
                              </div>
                            </div>
                            <span style="font-size:0.72rem; color:#cbd5e1; background:rgba(255,255,255,0.06); padding:0.25rem 0.55rem; border-radius:4px; font-weight:600;">No Action Required</span>
                          </div>
                        ` : `
                          <div>
                            ${isConfirmedBooking ? `
                              <span class="action-badge-booked">BOOKED</span>
                            ` : isAvailableSlot ? `
                              <span style="color:var(--neem-green); font-size:0.75rem; font-weight:700;">● Available to Book</span>
                            ` : `
                              <span style="color:#f87171; font-size:0.75rem; font-weight:700;">● Full (No Seats)</span>
                            `}
                          </div>
                          <div>
                            ${isConfirmedBooking ? `
                              <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-trainee-cancel-slot" data-booking-id="${myBooking.id}" style="color:#f87171; border-color:rgba(239,68,68,0.3); font-size:0.75rem;">Cancel</button>
                            ` : isAvailableSlot ? `
                              <button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm btn-trainee-book-slot" data-slot-id="${slot.id}" data-date="${slot.date}" data-start-time="${slot.startTime}" data-end-time="${slot.endTime}" data-time-display="${slot.timeDisplay || `${slot.startTime} – ${slot.endTime}`}" style="font-size:0.75rem; padding:0.4rem 1.15rem; font-weight:800;">
                                BOOK
                              </button>
                            ` : `
                              <span class="action-badge-full">FULL</span>
                            `}
                          </div>
                        `}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        ` : `
          <!-- SUB-TAB 2: MY PRACTICAL RIDES & STATUS -->
          <div class="portal-section">
            <div class="portal-section-header">
              <div>
                <span class="portal-section-title">My Practical Driving Record &amp; Ride Status</span>
                <span class="portal-section-meta">${myAllBookings.length} total driving session${myAllBookings.length === 1 ? '' : 's'} recorded</span>
              </div>
            </div>

            <div class="p-table-wrap" style="background:rgba(18,20,26,0.85); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-md); overflow:hidden;">
              <table class="p-table" style="margin:0;">
                <thead>
                  <tr style="background:rgba(255,255,255,0.03); border-bottom:1px solid rgba(255,255,255,0.08);">
                    <th style="padding:1rem 1.25rem; font-weight:800; color:var(--slate-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em;">Date</th>
                    <th style="padding:1rem 1.25rem; font-weight:800; color:var(--slate-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em;">Time</th>
                    <th style="padding:1rem 1.25rem; font-weight:800; color:var(--slate-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em;">Instructor &amp; Car</th>
                    <th style="padding:1rem 1.25rem; font-weight:800; color:var(--slate-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em;">Status</th>
                    <th style="padding:1rem 1.25rem; font-weight:800; color:var(--slate-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; text-align:right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${myAllBookings.length === 0 ? `
                    <tr>
                      <td colspan="5" style="padding:2.5rem 1rem; text-align:center; color:var(--slate-muted);">
                        You have no driving sessions booked yet. Switch to "Available Practical Driving Slots" to reserve your slot!
                      </td>
                    </tr>
                  ` : myAllBookings.map(bk => {
                    const isComp = bk.status === 'COMPLETED' || bk.attendance === 'present';
                    const isConf = bk.status === 'CONFIRMED';
                    const isCanc = bk.status === 'CANCELLED';
                    const shortDate = formatSlotDateShort(bk.date);

                    return `
                      <tr class="${isComp ? 'completed-ride-row' : ''}" style="border-bottom:1px solid rgba(255,255,255,0.05); ${isComp ? 'background:rgba(34,197,94,0.06); border-left:4px solid #22c55e;' : ''}">
                        <td style="padding:1rem 1.25rem; font-weight:700; color:#ffffff; white-space:nowrap;">
                          ${shortDate}
                          <div style="font-size:0.7rem; color:${isComp ? '#4ade80' : 'var(--slate-muted)'}; font-weight:${isComp ? '700' : 'normal'};">
                            ${isComp ? '✓ Completed Session' : bk.date}
                          </div>
                        </td>
                        <td style="padding:1rem 1.25rem; font-family:var(--font-mono); font-weight:700; color:#ffffff; white-space:nowrap;">
                          ${bk.timeDisplay || bk.startTime}
                          <div style="font-size:0.7rem; color:${isComp ? '#86efac' : 'var(--slate-muted)'}; font-family:var(--font-sans); font-weight:normal;">
                            ${isComp ? 'Practical Lesson Finished' : '1-hr Practical Session'}
                          </div>
                        </td>
                        <td style="padding:1rem 1.25rem;">
                          <div style="font-size:0.85rem; font-weight:700; color:#ffffff;">Instructor: ${bk.trainerName || 'Assigned'}</div>
                          <div style="font-size:0.72rem; color:var(--slate-muted);">${bk.vehicle ? bk.vehicle.split('#')[0] : 'Dual-Control Rig'}</div>
                        </td>
                        <td style="padding:1rem 1.25rem; white-space:nowrap;">
                          ${isComp ? `
                            <span class="slot-status-pill status-pill-completed">✓ RIDE COMPLETED</span>
                          ` : isConf ? `
                            <span class="slot-status-pill status-pill-confirmed">CONFIRMED</span>
                          ` : isCanc ? `
                            <span class="slot-status-pill status-pill-cancelled">CANCELLED</span>
                          ` : `
                            <span class="slot-status-pill">${bk.status}</span>
                          `}
                        </td>
                        <td style="padding:1rem 1.25rem; text-align:right; white-space:nowrap;">
                          ${isComp ? `
                            <div style="display:inline-flex; flex-direction:column; align-items:flex-end; gap:0.25rem;">
                              <span class="action-badge-completed">
                                <span style="font-size:0.95rem;">✓</span> Ride Completed
                              </span>
                              <span style="font-size:0.68rem; color:#94a3b8; font-weight:600;">No further action required</span>
                            </div>
                          ` : isConf ? `
                            <div style="display:inline-flex; align-items:center; gap:0.45rem; justify-content:flex-end;">
                              <span class="action-badge-booked">BOOKED</span>
                              <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-trainee-cancel-slot" data-booking-id="${bk.id}" style="padding:0.3rem 0.6rem; font-size:0.72rem; color:#f87171; border-color:rgba(239,68,68,0.3);" title="Cancel reservation">Cancel</button>
                            </div>
                          ` : `
                            <span class="p-badge p-badge-dim" style="font-size:0.75rem; padding:0.35rem 0.75rem;">CANCELLED</span>
                          `}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `}
      `;
    }

    container.innerHTML = `
      <div class="portal-shell">
        ${contentHtml}
      </div>
    `;

    // Mount 20-Day Progressive Driving Training Calendar
    const calendarMount = container.querySelector('#progressive-calendar-mount');
    if (calendarMount) {
      renderProgressiveCalendar(calendarMount, trainee.id, {
        showToast,
        canEdit: false,
        isTrainer: false,
        onUpdate: () => render()
      });
    }

    // Launch Live GPS Ride Tracker for Candidate
    const launchStudentRide = () => {
      const dayToRide = trainee.currentDay || 1;
      const sched = store.getStudentSchedule(trainee.id);
      const session = sched?.sessions?.find(s => s.dayNumber === dayToRide) || {
        dayNumber: dayToRide,
        objective: 'Practical Road Driving Lesson (8.0 km)',
        stage: dayToRide <= 10 ? 'Stage 1 · Basic Driving' : dayToRide <= 15 ? 'Stage 2 · Intermediate Driving' : 'Stage 3 · Advanced Road Skills',
        date: new Date().toISOString().split('T')[0]
      };

      openLiveRideMapModal({
        session,
        student: trainee,
        trainer,
        canTrainerComplete: false,
        onRideCompleted: () => {
          showToast(`Day ${dayToRide} 8.0 km ride recorded successfully! 16 Checkpoints cleared ✓`, 'success');
          render();
        }
      });
    };

    container.querySelector('#btn-student-start-gps-ride')?.addEventListener('click', launchStudentRide);
    container.querySelector('#btn-hero-start-gps-ride')?.addEventListener('click', launchStudentRide);

    // Service Navigation Events
    container.querySelectorAll('[data-trainee-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetSub = btn.dataset.traineeNav;
        if (onNavigate) {
          onNavigate(targetSub);
        } else {
          renderTraineeView(container, showToast, targetSub, onNavigate);
        }
      });
    });

    const btnGoToBookSlot = container.querySelector('#btn-go-to-book-slot');
    if (btnGoToBookSlot) {
      btnGoToBookSlot.addEventListener('click', () => {
        if (onNavigate) {
          onNavigate('slots');
        } else {
          renderTraineeView(container, showToast, 'slots', onNavigate);
        }
      });
    }

    // Student Slot Sub-Tab Switcher
    container.querySelectorAll('.btn-trainee-slot-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        traineeSlotTab = btn.dataset.tab;
        render();
      });
    });

    // Student Quick Date Click
    container.querySelectorAll('[data-student-date]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedDate = btn.dataset.studentDate;
        render();
      });
    });

    // Student Custom Date Picker Change
    const inpStudentDate = container.querySelector('#inp-student-slot-date');
    if (inpStudentDate) {
      inpStudentDate.addEventListener('change', (e) => {
        if (e.target.value) {
          selectedDate = e.target.value;
          render();
        }
      });
    }

    // Student Slot Status Filter
    const selStudentStatus = container.querySelector('#sel-student-slot-status');
    if (selStudentStatus) {
      selStudentStatus.addEventListener('change', (e) => {
        traineeSlotStatusFilter = e.target.value;
        render();
      });
    }

    // Student Slot Search
    const inpStudentSearch = container.querySelector('#inp-student-slot-search');
    if (inpStudentSearch) {
      inpStudentSearch.addEventListener('input', (e) => {
        traineeSlotSearch = e.target.value;
        render();
      });
    }

    // Student View Mode Toggle (Table vs Cards)
    container.querySelectorAll('.btn-trainee-view-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        traineeSlotViewMode = btn.dataset.mode;
        render();
      });
    });

    // Student Book Slot Button
    container.querySelectorAll('.btn-trainee-book-slot').forEach(btn => {
      btn.addEventListener('click', () => {
        const slotId = btn.dataset.slotId;
        const slotDate = btn.dataset.date;
        const startTime = btn.dataset.startTime;
        const endTime = btn.dataset.endTime;
        const timeDisplay = btn.dataset.timeDisplay;
        openConfirmBookingModal({ id: slotId, startTime, endTime, timeDisplay }, slotDate);
      });
    });

    // Student Cancel Their Own Slot Booking
    container.querySelectorAll('.btn-trainee-cancel-slot').forEach(btn => {
      btn.addEventListener('click', () => {
        const bookingId = btn.dataset.bookingId;
        const conf = window.confirm('Are you sure you want to cancel your practical driving reservation? Your seat will be released for other learners.');
        if (conf) {
          const res = store.cancelSlotBooking(bookingId, trainee.name, 'Learner cancelled session');
          if (res.success) {
            showToast('✓ Booking cancelled successfully. Capacity updated.', 'success');
            render();
          } else {
            showToast(res.message || 'Could not cancel booking.', 'warning');
          }
        }
      });
    });

    // Day simulation buttons
    container.querySelectorAll('[data-test-day]').forEach(btn => {
      btn.addEventListener('click', () => {
        const day = parseInt(btn.dataset.testDay, 10);
        store.setTraineeTestDay(day);
        showToast(`Simulating Day ${day} curriculum status`, 'info');
        render();
      });
    });

    // Category filter buttons
    container.querySelectorAll('[data-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.cat;
        render();
      });
    });

    // UPI QR modals
    const attachQrBtn = (id) => {
      const el = container.querySelector(id);
      if (el) {
        el.addEventListener('click', () => {
          openQrVoucherModal(invoice.id, invoice.balance, trainee.name);
        });
      }
    };
    attachQrBtn('#btn-show-qr-voucher');
    attachQrBtn('#btn-show-qr-voucher-billing');
    attachQrBtn('#btn-pay-now-action');

    const btnChangePhoto = container.querySelector('#btn-trainee-change-photo');
    if (btnChangePhoto) {
      btnChangePhoto.addEventListener('click', () => {
        triggerPhotoUpload((dataUrl) => {
          store.updateTrainee(trainee.id, { profilePhotoData: dataUrl });
          showToast('Profile photo / logo updated successfully!', 'success');
          render();
        });
      });
    }
  }

  function openQrVoucherModal(invoiceId, balance, student) {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="p-modal" style="max-width: 440px;">
          <div class="p-modal-header">
            <div>
              <div class="p-modal-title">Official UPI Payment QR</div>
              <div class="p-modal-sub">Gafoor Driving School · Pulivendula</div>
            </div>
            <button type="button" id="btn-close-qr" class="p-modal-close">✕</button>
          </div>
          <div class="p-modal-body" style="text-align: center;">
            <div style="background: #ffffff; padding: 1.25rem; border-radius: 8px; display: inline-block; margin: 0 auto 1.25rem;">
              <svg width="180" height="180" viewBox="0 0 100 100" style="display:block;">
                <rect width="100" height="100" fill="#ffffff"/>
                <rect x="5" y="5" width="30" height="30" fill="#0f172a"/>
                <rect x="10" y="10" width="20" height="20" fill="#ffffff"/>
                <rect x="13" y="13" width="14" height="14" fill="#0f172a"/>
                <rect x="65" y="5" width="30" height="30" fill="#0f172a"/>
                <rect x="70" y="10" width="20" height="20" fill="#ffffff"/>
                <rect x="73" y="13" width="14" height="14" fill="#0f172a"/>
                <rect x="5" y="65" width="30" height="30" fill="#0f172a"/>
                <rect x="10" y="70" width="20" height="20" fill="#ffffff"/>
                <rect x="13" y="73" width="14" height="14" fill="#0f172a"/>
                <rect x="42" y="10" width="8" height="8" fill="#0f172a"/>
                <rect x="45" y="25" width="6" height="12" fill="#0f172a"/>
                <rect x="55" y="30" width="8" height="8" fill="#0f172a"/>
                <rect x="40" y="45" width="20" height="12" fill="#0f172a"/>
                <rect x="68" y="45" width="10" height="6" fill="#0f172a"/>
                <rect x="45" y="65" width="15" height="10" fill="#0f172a"/>
                <rect x="65" y="65" width="10" height="20" fill="#0f172a"/>
                <rect x="80" y="75" width="12" height="10" fill="#0f172a"/>
              </svg>
            </div>
            <div style="font-size: 0.95rem; font-weight: 800; color: #ffffff;">Scan with Any UPI App</div>
            <div style="font-size: 0.8rem; color: var(--slate-muted); margin-top: 0.25rem;">PhonePe · Google Pay · Paytm · BHIM</div>
            <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 900; color: var(--primary-gold); margin: 0.75rem 0;">
              ₹${balance.toLocaleString('en-IN')}
            </div>
            <div style="font-size: 0.75rem; color: var(--slate-muted);">VPA: <strong>gafoordrivingschool@sbi</strong></div>
          </div>
          <div class="p-modal-footer">
            <button type="button" class="p-ghost-btn" id="btn-cancel-qr">Close</button>
            <button type="button" class="btn-mnc btn-mnc-primary" id="btn-sim-pay">I Have Paid (Confirm) ✓</button>
          </div>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-qr').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-qr').addEventListener('click', close);
    modalRoot.querySelector('#btn-sim-pay').addEventListener('click', () => {
      store.recordPayment(invoiceId, balance);
      close();
      showToast(`Payment of ₹${balance.toLocaleString('en-IN')} confirmed! Thank you.`, 'success');
      render();
    });
  }

  function openCalendarPickerModal() {
    const modalRoot = document.getElementById('modal-root');
    const [selY, selM, selD] = selectedDate.split('-').map(Number);
    let viewYear = selY || new Date().getFullYear();
    let viewMonth = (selM ? selM - 1 : new Date().getMonth());

    function renderCal() {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

      const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      const todayStr = store.getTodayDateStr();

      let daysHtml = '';
      for (let i = 0; i < firstDayOfMonth; i++) {
        daysHtml += '<div style="aspect-ratio:1;"></div>';
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const mStr = String(viewMonth + 1).padStart(2, '0');
        const dStr = String(d).padStart(2, '0');
        const dtStr = `${viewYear}-${mStr}-${dStr}`;

        const isPast = dtStr < todayStr;
        const isSelected = dtStr === selectedDate;
        const isToday = dtStr === todayStr;

        let cls = 'sb-cal-day';
        if (isPast) cls += ' disabled';
        if (isSelected) cls += ' selected';
        if (isToday) cls += ' today';

        daysHtml += `
          <button type="button" class="${cls}" data-cal-day="${dtStr}" ${isPast ? 'disabled' : ''}>
            ${d}
          </button>
        `;
      }

      modalRoot.innerHTML = `
        <div class="sb-calendar-modal-overlay">
          <div class="sb-calendar-card">
            <div class="sb-cal-header">
              <button type="button" class="sb-cal-nav-btn" id="btn-cal-prev" title="Previous Month">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <div class="sb-cal-title">${monthNames[viewMonth]} ${viewYear}</div>
              <button type="button" class="sb-cal-nav-btn" id="btn-cal-next" title="Next Month">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>

            <div class="sb-cal-grid-weekdays">
              ${weekdays.map(w => `<div>${w}</div>`).join('')}
            </div>

            <div class="sb-cal-grid-days">
              ${daysHtml}
            </div>

            <div class="sb-cal-footer">
              <button type="button" id="btn-cal-close" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#cbd5e1; padding:0.5rem 1.25rem; border-radius:10px; font-weight:700; cursor:pointer; font-size:0.825rem;">
                Close
              </button>
            </div>
          </div>
        </div>
      `;

      modalRoot.querySelector('#btn-cal-close')?.addEventListener('click', () => {
        modalRoot.innerHTML = '';
      });

      modalRoot.querySelector('#btn-cal-prev')?.addEventListener('click', () => {
        viewMonth--;
        if (viewMonth < 0) {
          viewMonth = 11;
          viewYear--;
        }
        renderCal();
      });

      modalRoot.querySelector('#btn-cal-next')?.addEventListener('click', () => {
        viewMonth++;
        if (viewMonth > 11) {
          viewMonth = 0;
          viewYear++;
        }
        renderCal();
      });

      modalRoot.querySelectorAll('[data-cal-day]').forEach(btn => {
        btn.addEventListener('click', () => {
          const pickedDate = btn.dataset.calDay;
          if (pickedDate) {
            selectedDate = pickedDate;
            selectedSlotId = null;
            modalRoot.innerHTML = '';
            render();
            setTimeout(() => {
              const activeCard = container.querySelector(`[data-date-card="${pickedDate}"]`);
              if (activeCard) {
                activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              }
            }, 60);
          }
        });
      });
    }

    renderCal();
  }

  function openConfirmBookingModal(slotInfo, targetDateStr = null) {
    const modalRoot = document.getElementById('modal-root');
    const bookingDate = targetDateStr || selectedDate;
    const readableDate = formatReadableDate(bookingDate);

    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="p-modal" style="max-width: 460px;">
          <div class="p-modal-header">
            <div>
              <div class="p-modal-title">Confirm Driving Slot Booking</div>
              <div class="p-modal-sub">Gafoor Driving School · Practical Road Training</div>
            </div>
            <button type="button" id="btn-close-confirm-modal" class="p-modal-close">✕</button>
          </div>

          <div class="p-modal-body">
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-sm); padding:1rem 1.15rem; margin-bottom:1.15rem; display:flex; flex-direction:column; gap:0.5rem;">
              <div class="p-summary-row" style="padding:0.25rem 0;">
                <span class="p-summary-key">Training Date:</span>
                <span class="p-summary-value" style="color:#ffffff; font-weight:700;">${readableDate}</span>
              </div>
              <div class="p-summary-row" style="padding:0.25rem 0;">
                <span class="p-summary-key">Session Time:</span>
                <span class="p-summary-value" style="color:var(--primary-gold); font-weight:800; font-family:var(--font-mono);">${slotInfo.timeDisplay || `${slotInfo.startTime} - ${slotInfo.endTime}`}</span>
              </div>
              <div class="p-summary-row" style="padding:0.25rem 0;">
                <span class="p-summary-key">Candidate:</span>
                <span class="p-summary-value" style="color:#ffffff; font-weight:700;">${trainee.name} (${trainee.studentCode || trainee.id})</span>
              </div>
              <div class="p-summary-row" style="padding:0.25rem 0;">
                <span class="p-summary-key">Course Package:</span>
                <span class="p-summary-value" style="color:var(--slate-body);">${trainee.package}</span>
              </div>
            </div>

            <div style="font-size:0.75rem; color:var(--slate-muted); line-height:1.5;">
              ℹ️ <strong>Dual-Control Safety:</strong> Practical road training slot includes dedicated dual-control vehicle and certified AP RTO instructor assignment.
            </div>
          </div>

          <div class="p-modal-footer">
            <button type="button" class="p-ghost-btn" id="btn-cancel-slot-confirm">Cancel</button>
            <button type="button" class="btn-mnc btn-mnc-primary" id="btn-submit-confirm-booking">Confirm Booking ✓</button>
          </div>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-confirm-modal').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-slot-confirm').addEventListener('click', close);

    const btnSubmit = modalRoot.querySelector('#btn-submit-confirm-booking');
    btnSubmit.addEventListener('click', async () => {
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Securing Seat...';

      const res = await store.bookSlot({
        date: bookingDate,
        startTime: slotInfo.startTime,
        endTime: slotInfo.endTime,
        timeDisplay: slotInfo.timeDisplay,
        traineeId: trainee.id,
        bookedBy: `${trainee.name} (${trainee.studentCode || trainee.id})`
      });

      if (res.success) {
        close();
        selectedSlotId = null;
        showToast('✓ Practical driving slot reserved successfully!', 'success');
        render();
      } else {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Confirm Reservation';
        showToast(res.message || 'Booking failed.', 'warning');
        render();
      }
    });
  }

  render();
}
