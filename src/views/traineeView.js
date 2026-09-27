/* ==========================================================================
   MANA DRIVING SCHOOL — TRAINEE PORTAL (ENGLISH ONLY)
   Features:
   - 20-Day syllabus progression (8 km/day)
   - Real-time Road Category breakdown (In-Street / Highway / RTO Test)
   - Indian UPI QR Code Tuition Payment (PhonePe / GPay / Paytm)
   - Day 20 Graduation Feedback & Certificate of Competency
   ========================================================================== */

import { store } from '../store.js';
import { renderBrandLogo } from '../components/brandLogo.js';

export function renderTraineeView(container, showToast) {
  let activeFilter = 'all';

  function render() {
    const trainee = store.trainees.find(t => t.id === 'APX-9021') || store.trainees[0];
    const currentDay = store.traineeTestDay;
    const progressPercent = Math.round((currentDay / 20) * 100);
    const trainer = store.trainers.find(t => t.id === trainee.assignedTrainerId) || store.trainers[0];
    const curriculum = store.getCurriculum();
    const invoice = store.payments.find(p => p.traineeId === trainee.id) || store.payments[0];

    const filteredCurriculum = curriculum.filter(item => {
      if (activeFilter === 'all') return true;
      return item.category === activeFilter;
    });

    const isDay20 = currentDay >= 20;

    const template = `
      <div>
        <!-- Institutional Clean Page Banner with Official Logo -->
        <div class="clean-page-banner">
          <div class="banner-brand-left">
            ${renderBrandLogo({ size: 'banner' })}
            <div class="banner-title-block">
              <h2>GAFOOR <span>DRIVING SCHOOL</span></h2>
              <div class="banner-sub-meta">
                <span class="tagline-quote">"Walk in &amp; Drive out"</span>
                <span>•</span>
                <span>Pulivendula Candidate Portal</span>
                <span>•</span>
                <span>AP Transport Dept Lic. #AP-04-DS-2024</span>
              </div>
            </div>
          </div>
          <div class="banner-pills-right">
            <span class="clean-gold-badge">★ Govt. Recognized Institution</span>
            <span class="clean-info-badge">Candidate ID: ${trainee.id}</span>
            <span class="kpi-pill kpi-pill-green">Active Trainee ✓</span>
          </div>
        </div>

        <!-- Clean Operational Telemetry Strip -->
        <div class="clean-telemetry-strip">
          <div class="clean-telemetry-card">
            <div class="telemetry-icon-box">📅</div>
            <div class="telemetry-info">
              <div class="telemetry-label">Curriculum Track</div>
              <div class="telemetry-val">Day ${currentDay} of 20</div>
              <div class="telemetry-sub">${progressPercent}% Completed</div>
            </div>
          </div>
          <div class="clean-telemetry-card">
            <div class="telemetry-icon-box">🛣️</div>
            <div class="telemetry-info">
              <div class="telemetry-label">Road Distance</div>
              <div class="telemetry-val">${currentDay * 8} km Logged</div>
              <div class="telemetry-sub">8 km/day Pulivendula Circuit</div>
            </div>
          </div>
          <div class="clean-telemetry-card">
            <div class="telemetry-icon-box">🚗</div>
            <div class="telemetry-info">
              <div class="telemetry-label">Assigned Examiner</div>
              <div class="telemetry-val">${trainer.name}</div>
              <div class="telemetry-sub">${trainer.car} (Dual-Brake)</div>
            </div>
          </div>
          <div class="clean-telemetry-card">
            <div class="telemetry-icon-box">💳</div>
            <div class="telemetry-info">
              <div class="telemetry-label">Tuition Status</div>
              <div class="telemetry-val" style="color: ${invoice.balance === 0 ? 'var(--neem-green)' : 'var(--terracotta)'};">
                ${invoice.balance === 0 ? 'Fully Paid ✓' : `₹${invoice.balance.toLocaleString('en-IN')} Due`}
              </div>
              <div class="telemetry-sub">UPI: gafoordrive@icici</div>
            </div>
          </div>
        </div>

        <!-- Page Title Row -->
        <div class="page-title-row">
          <div>
            <h1>Candidate Learning & Progress Portal</h1>
            <p class="page-subtitle">Track your 20-day practical driving curriculum (8 km/day), pay tuition via UPI QR voucher, and review examiner debrief notes.</p>
          </div>

          <!-- Simulation Chips for Stage Testing -->
          <div class="chips-bar" style="align-items: center;">
            <span style="font-size: 0.775rem; color: var(--slate-muted); font-weight: 700;">Milestone Simulator:</span>
            <button type="button" class="chip-btn ${currentDay === 7 ? 'active' : ''}" data-test-day="7">Day 7 (8-Track & Reverse)</button>
            <button type="button" class="chip-btn ${currentDay === 14 ? 'active' : ''}" data-test-day="14">Day 14 (Highway & Flyover)</button>
            <button type="button" class="chip-btn ${currentDay === 20 ? 'active' : ''}" data-test-day="20">Day 20 (RTO Exam)</button>
          </div>
        </div>

        <!-- Student Hero Summary Banner -->
        <div class="kpi-card" style="padding: 2rem; margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.25rem;">
            <div style="display: flex; align-items: center; gap: 1.25rem;">
              <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--terracotta-light); color: var(--terracotta); font-size: 1.35rem; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 1px solid var(--terracotta-border);">
                ${trainee.avatar || 'SK'}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;">
                  <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--charcoal);">${trainee.name}</h2>
                  <span style="font-size: 0.75rem; font-weight: 800; color: var(--terracotta); background: var(--terracotta-light); padding: 0.2rem 0.55rem; border-radius: var(--radius-pill); border: 1px solid var(--terracotta-border);">
                    ${trainee.id}
                  </span>
                  <span class="kpi-pill ${invoice.balance === 0 ? 'kpi-pill-green' : 'kpi-pill-orange'}">
                    ${invoice.balance === 0 ? 'Fully Paid ✓' : `₹${invoice.balance.toLocaleString('en-IN')} Balance Due`}
                  </span>
                </div>
                <p style="font-size: 0.85rem; color: var(--slate-muted); margin-top: 0.25rem;">
                  Course: <strong style="color: var(--charcoal);">${trainee.package}</strong> · Assigned Examiner: <strong style="color: var(--charcoal);">${trainer.name}</strong> (${trainer.car})
                </p>
              </div>
            </div>

            <!-- Trainee Payments Section: Scan QR to Pay -->
            <div>
              <button type="button" class="btn-mnc btn-mnc-primary" id="btn-show-qr-voucher">
                Pay Tuition via UPI QR ⊞
              </button>
            </div>
          </div>

          <!-- 20-Day Progress Bar -->
          <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border-light);">
            <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; font-weight: 700; margin-bottom: 0.4rem;">
              <span style="color: var(--terracotta);">
                20-Day Practical Progression: Day ${currentDay} of 20 Completed · Total Distance Logged: ${currentDay * 8} km
              </span>
              <span style="color: var(--charcoal);">${progressPercent}% Completed</span>
            </div>
            <div style="width: 100%; height: 8px; background: var(--bg-canvas); border-radius: var(--radius-pill); overflow: hidden; border: 1px solid var(--border-light);">
              <div style="width: ${progressPercent}%; height: 100%; background: var(--terracotta); border-radius: var(--radius-pill); transition: width 0.4s ease;"></div>
            </div>
          </div>
        </div>

        <!-- 20-DAY LEARNING PROGRAM & CATEGORY COVERED EACH DAY (8 KM EACH) -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--charcoal);">20-Day Practical Curriculum</h2>
            <p style="font-size: 0.85rem; color: var(--slate-muted);">
              Daily driving road tracks: Ground & In-Street (8 km/day) · Flyover & Highway (8 km/day) · RTO Mock Test (8 km)
            </p>
          </div>

          <div class="chips-bar">
            <button type="button" class="chip-btn ${activeFilter === 'all' ? 'active' : ''}" data-cat="all">All 20 Days</button>
            <button type="button" class="chip-btn ${activeFilter === 'street' ? 'active' : ''}" data-cat="street">Ground & City (8 km)</button>
            <button type="button" class="chip-btn ${activeFilter === 'highway' ? 'active' : ''}" data-cat="highway">Highway & Flyover (8 km)</button>
            <button type="button" class="chip-btn ${activeFilter === 'test' ? 'active' : ''}" data-cat="test">RTO Driving Test (8 km)</button>
          </div>
        </div>

        <!-- 20 Milestone Cards Grid -->
        <div class="timeline-grid-moment">
          ${filteredCurriculum.map(item => {
            const isDone = item.day < currentDay;
            const isToday = item.day === currentDay;

            let cardStateClass = isDone ? 'card-completed' : (isToday ? 'card-today' : 'card-locked');
            let chipClass = item.category === 'street' ? 'chip-street' : (item.category === 'highway' ? 'chip-highway' : 'chip-test');
            let categoryText = item.category === 'street' ? 'In-Street Module (8 km)' : (item.category === 'highway' ? 'Highway Module (8 km)' : 'RTO Test Module (8 km)');

            return `
              <div class="road-card ${cardStateClass}">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-size: 0.85rem; font-weight: 800; color: var(--charcoal);">Day ${item.day}</span>
                    ${isDone ? '<span class="kpi-pill kpi-pill-green">Completed ✓</span>' : ''}
                    ${isToday ? '<span class="kpi-pill kpi-pill-blue">Today\'s Session</span>' : ''}
                    ${item.day > currentDay ? '<span class="kpi-pill kpi-pill-purple">Upcoming</span>' : ''}
                  </div>
                  <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--charcoal); line-height: 1.35;">${item.title || item.topic}</h4>
                  <p style="font-size: 0.775rem; color: var(--slate-muted); margin-top: 0.35rem; line-height: 1.4;">${item.desc || item.notes}</p>
                </div>

                <div style="margin-top: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
                  <span class="category-chip ${chipClass}">${categoryText}</span>
                  <span style="font-size: 0.75rem; font-weight: 700; color: var(--slate-muted);">8 km Target</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- FINAL FEEDBACK SECTION (SHOWN AFTER THE 20 DAYS) -->
        <div class="kpi-card" style="padding: 2.25rem; margin-top: 2rem;">
          ${!isDay20 ? `
            <div style="text-align: center; padding: 2rem 1rem;">
              <span class="kpi-pill kpi-pill-purple" style="font-size: 0.8125rem; padding: 0.35rem 0.85rem;">
                Day 20 RTO Graduation Review
              </span>
              <h3 style="font-size: 1.45rem; font-weight: 800; color: var(--charcoal); margin-top: 0.85rem;">
                Feedback unlocks upon completion of Day 20
              </h3>
              <p style="font-size: 0.875rem; color: var(--slate-muted); max-width: 520px; margin: 0.5rem auto 1.5rem; line-height: 1.6;">
                This official driver appraisal review will automatically open after completing <strong>Day 20: RTO Licensure Examination</strong>. You are currently on <strong>Day ${currentDay}</strong>.
              </p>
              <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm" id="btn-unlock-day20-now">
                Simulate: Fast-Forward to Day 20 Completion (Unlock)
              </button>
            </div>
          ` : `
            ${store.feedbackSubmitted ? `
              <div style="text-align: center; padding: 2rem 1rem;">
                <span class="kpi-pill kpi-pill-green" style="font-size: 0.8125rem; padding: 0.35rem 0.85rem;">
                  Graduation Confirmed ✓
                </span>
                <h3 style="font-size: 1.5rem; font-weight: 800; color: var(--charcoal); margin-top: 0.85rem;">
                  Driving Course Successfully Completed!
                </h3>
                <p style="font-size: 0.875rem; color: var(--slate-muted); max-width: 500px; margin: 0.35rem auto 1.5rem; line-height: 1.5;">
                  Your feedback has been recorded. RTO Driving Competency Certificate and DL test paperwork are cleared.
                </p>
                <button type="button" class="btn-mnc btn-mnc-primary" id="btn-open-cert-modal" style="display: inline-flex; align-items: center; gap: 0.5rem;">
                  <img src="/logo.png" style="width: 20px; height: 20px; border-radius: 50%;" />
                  View & Download Official Certificate (PDF) 🎓
                </button>
              </div>
            ` : `
              <div>
                <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; margin-bottom: 1.5rem;">
                  <span class="kpi-pill kpi-pill-green">Day 20 Completed</span>
                  <h3 style="font-size: 1.45rem; font-weight: 800; color: var(--charcoal); margin-top: 0.4rem;">
                    Final Day: Driver Experience Review & Rating
                  </h3>
                  <p style="font-size: 0.85rem; color: var(--slate-muted);">
                    Share your experience on instructor ${trainer.name}'s coaching, clutch mastery, and RTO track preparation.
                  </p>
                </div>

                <form id="form-day20-feedback">
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
                    <div>
                      <label style="display: block; font-size: 0.775rem; font-weight: 700; color: var(--charcoal); margin-bottom: 0.4rem;">
                        Clutch & Hill-Hold Confidence
                      </label>
                      <select class="mnc-select" name="clutchConfidence" style="width: 100%;">
                        <option value="5">★★★★★ Completely Confident (5/5)</option>
                        <option value="4">★★★★☆ Good (4/5)</option>
                        <option value="3">★★★☆☆ Moderate (3/5)</option>
                      </select>
                    </div>

                    <div>
                      <label style="display: block; font-size: 0.775rem; font-weight: 700; color: var(--charcoal); margin-bottom: 0.4rem;">
                        RTO '8' & 'H' Track Readiness
                      </label>
                      <select class="mnc-select" name="trackReadiness" style="width: 100%;">
                        <option value="5">★★★★★ 100% Ready to Clear Test (5/5)</option>
                        <option value="4">★★★★☆ Good Control (4/5)</option>
                        <option value="3">★★★☆☆ Needs Minor Practice (3/5)</option>
                      </select>
                    </div>

                    <div>
                      <label style="display: block; font-size: 0.775rem; font-weight: 700; color: var(--charcoal); margin-bottom: 0.4rem;">
                        Instructor Patience & Coaching Quality
                      </label>
                      <select class="mnc-select" name="trainerRating" style="width: 100%;">
                        <option value="5">★★★★★ Outstanding (5 Stars)</option>
                        <option value="4">★★★★☆ Very Good (4 Stars)</option>
                        <option value="3">★★★☆☆ Satisfactory (3 Stars)</option>
                      </select>
                    </div>
                  </div>

                  <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-size: 0.775rem; font-weight: 700; color: var(--charcoal); margin-bottom: 0.4rem;">
                      Your Feedback & Notes for Instructor
                    </label>
                    <textarea class="mnc-input" rows="3" name="comments" placeholder="Describe your experience..." style="width: 100%; resize: vertical;"></textarea>
                  </div>

                  <div style="display: flex; justify-content: flex-end;">
                    <button type="submit" class="btn-mnc btn-mnc-primary">
                      Submit Feedback & Graduate →
                    </button>
                  </div>
                </form>
              </div>
            `}
          `}
        </div>
      </div>
    `;

    container.innerHTML = template;
    attachEvents();
  }

  function attachEvents() {
    // Filter chips
    container.querySelectorAll('[data-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.cat;
        render();
      });
    });

    // Test Day Simulation Chips
    container.querySelectorAll('[data-test-day]').forEach(btn => {
      btn.addEventListener('click', () => {
        const day = btn.dataset.testDay;
        store.setTraineeTestDay(day);
        render();
      });
    });

    // Unlock day 20 helper button
    const btnUnlock = container.querySelector('#btn-unlock-day20-now');
    if (btnUnlock) {
      btnUnlock.addEventListener('click', () => {
        store.setTraineeTestDay(20);
        render();
      });
    }

    // Certificate Modal Trigger
    const btnOpenCert = container.querySelector('#btn-open-cert-modal');
    if (btnOpenCert) {
      btnOpenCert.addEventListener('click', () => {
        const trainee = store.trainees.find(t => t.id === 'APX-9021') || store.trainees[0];
        const trainer = store.trainers.find(t => t.id === trainee.assignedTrainerId) || store.trainers[0];
        openCertificateModal(trainee, trainer);
      });
    }

    // QR Payment Modal Trigger
    const btnShowQR = container.querySelector('#btn-show-qr-voucher');
    if (btnShowQR) {
      btnShowQR.addEventListener('click', () => {
        openQRModal();
      });
    }

    // Day 20 Feedback Form
    const feedbackForm = container.querySelector('#form-day20-feedback');
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        store.submitFeedback({
          clutchConfidence: feedbackForm.elements['clutchConfidence'].value,
          trackReadiness: feedbackForm.elements['trackReadiness'].value,
          trainerRating: feedbackForm.elements['trainerRating'].value,
          comments: feedbackForm.elements['comments'].value
        });
        showToast('Thank you! Your Day 20 graduation feedback has been recorded.', 'success');
        render();
      });
    }
  }

  // ====================================================
  // MODAL: OFFICIAL CERTIFICATE OF DRIVING COMPETENCY
  // ====================================================
  function openCertificateModal(trainee, trainer) {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="official-certificate-modal">
          <div style="position: absolute; top: 1.25rem; right: 1.25rem; z-index: 10;">
            <button type="button" id="btn-close-cert" style="background: rgba(0,0,0,0.06); border: none; width: 34px; height: 34px; border-radius: 50%; font-size: 1.1rem; cursor: pointer; color: var(--charcoal); display: flex; align-items: center; justify-content: center;">✕</button>
          </div>

          <div class="certificate-border-inner">
            <div class="certificate-header">
              <div class="certificate-seal">
                <img src="/logo.png" alt="Gafoor Driving School Logo Badge" />
              </div>
              <h2 class="certificate-title">GAFOOR DRIVING SCHOOL</h2>
              <div class="certificate-subtitle">"WALK IN &amp; DRIVE OUT" · PULIVENDULA (AP-04)</div>
              <div style="font-size: 0.75rem; color: #475569; font-weight: 700; margin-top: 0.35rem; letter-spacing: 0.08em;">
                GOVERNMENT OF ANDHRA PRADESH · MOTOR VEHICLES DEPARTMENT RECOGNIZED ACADEMY (#AP-04-DS-2024)
              </div>
            </div>

            <div style="width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #c6923b, transparent); margin: 0.75rem 0 1.25rem 0;"></div>

            <div style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--slate-muted); font-weight: 800;">
              Official Certificate of Driving Competency
            </div>

            <div class="certificate-body">
              This is to officially certify that candidate
              <br />
              <span class="certificate-student-name">${trainee.name}</span>
              <br />
              Candidate Registration ID: <strong>${trainee.id}</strong> · LLR Permit No: <strong>${trainee.permitNumber || 'AP-04-LLR-2024-998'}</strong>
              <br />
              has successfully completed the comprehensive <strong>20-Day Practical Driving &amp; Highway Maneuvering Program</strong> (Total Logged Distance: <strong>160.0 km</strong>), demonstrating mastery of clutch bite-point control, dual-brake safety, hill-start recovery, and RTO 8-track &amp; H-reversing protocols at the <strong>Pulivendula Academy Circuit</strong>.
            </div>

            <div style="display: flex; justify-content: center; gap: 0.85rem; flex-wrap: wrap; margin: 1.25rem 0;">
              <span class="kpi-pill kpi-pill-green" style="font-size: 0.75rem; padding: 0.3rem 0.85rem;">RTO Form 5 Cleared ✓</span>
              <span class="kpi-pill kpi-pill-blue" style="font-size: 0.75rem; padding: 0.3rem 0.85rem;">Zero-Stall Driving Score: 99.4%</span>
              <span class="clean-gold-badge" style="font-size: 0.75rem;">Academy Seal Verified</span>
            </div>

            <div class="certificate-signatures">
              <div class="sig-block">
                <div class="sig-line">${trainer.name}</div>
                <div class="sig-title">Senior Master Examiner</div>
                <div style="font-size: 0.65rem; color: var(--slate-muted); margin-top: 0.2rem;">AP-MVI-CERTIFIED</div>
              </div>

              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <img src="/logo.png" style="width: 48px; height: 48px; border-radius: 50%; opacity: 0.9; filter: drop-shadow(0 2px 4px rgba(198,146,59,0.3));" />
                <span style="font-size: 0.625rem; font-weight: 800; color: #c6923b; margin-top: 0.25rem; letter-spacing: 0.05em;">SEAL OF EXCELLENCE</span>
              </div>

              <div class="sig-block">
                <div class="sig-line">M. A. Gafoor</div>
                <div class="sig-title">Director of Academy</div>
                <div style="font-size: 0.65rem; color: var(--slate-muted); margin-top: 0.2rem;">GAFOOR DRIVING SCHOOL · PULIVENDULA</div>
              </div>
            </div>

            <div style="margin-top: 1.75rem; display: flex; justify-content: center; gap: 0.85rem;">
              <button type="button" class="btn-mnc btn-mnc-secondary" id="btn-close-cert-2">Close</button>
              <button type="button" class="btn-mnc btn-mnc-primary" id="btn-print-cert">
                Print / Save Official PDF ⎙
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-cert').addEventListener('click', close);
    modalRoot.querySelector('#btn-close-cert-2').addEventListener('click', close);

    const btnPrint = modalRoot.querySelector('#btn-print-cert');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }
  }

  // ====================================================
  // MODAL: TRAINEE PAYMENTS PAGE (SCAN UPI QR TO PAY)
  // ====================================================
  function openQRModal() {
    const modalRoot = document.getElementById('modal-root');
    const trainee = store.trainees.find(t => t.id === 'APX-9021') || store.trainees[0];
    const invoice = store.payments.find(p => p.traineeId === trainee.id) || store.payments[0];

    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="kpi-card" style="max-width: 440px; width: 100%; padding: 0; overflow: hidden; border: 1px solid var(--border-light); text-align: center;">
          <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; background: var(--bg-canvas);">
            <div style="text-align: left;">
              <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--charcoal);">Mobile UPI QR Payment</h3>
              <p style="font-size: 0.8rem; color: var(--slate-muted);">${trainee.name} · Invoice ${invoice.id}</p>
            </div>
            <button type="button" id="btn-close-qr" style="background: transparent; border: none; font-size: 1.25rem; cursor: pointer; color: var(--slate-muted);">✕</button>
          </div>

          <div style="padding: 2rem 1.5rem;">
            <div class="upi-qr-box" style="margin-bottom: 1.25rem;">
              <div style="display: flex; justify-content: center; margin-bottom: 0.75rem;">
                <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Corners -->
                  <rect x="10" y="10" width="46" height="46" rx="6" fill="#1c1917"/>
                  <rect x="18" y="18" width="30" height="30" rx="3" fill="#ffffff"/>
                  <rect x="24" y="24" width="18" height="18" rx="2" fill="#0c5836"/>

                  <rect x="124" y="10" width="46" height="46" rx="6" fill="#1c1917"/>
                  <rect x="132" y="18" width="30" height="30" rx="3" fill="#ffffff"/>
                  <rect x="138" y="24" width="18" height="18" rx="2" fill="#0c5836"/>

                  <rect x="10" y="124" width="46" height="46" rx="6" fill="#1c1917"/>
                  <rect x="18" y="132" width="30" height="30" rx="3" fill="#ffffff"/>
                  <rect x="24" y="138" width="18" height="18" rx="2" fill="#0c5836"/>

                  <!-- Center Logo Badge -->
                  <rect x="74" y="74" width="32" height="32" rx="6" fill="#0c5836"/>
                  <text x="90" y="95" font-size="16" fill="#c6923b" text-anchor="middle" font-weight="900">G</text>

                  <!-- Data Matrix Blocks -->
                  <rect x="68" y="16" width="10" height="10" fill="#1c1917"/>
                  <rect x="86" y="16" width="12" height="8" fill="#1c1917"/>
                  <rect x="104" y="22" width="8" height="14" fill="#1c1917"/>
                  <rect x="16" y="68" width="12" height="10" fill="#1c1917"/>
                  <rect x="36" y="74" width="14" height="12" fill="#1c1917"/>
                  <rect x="120" y="68" width="16" height="8" fill="#1c1917"/>
                  <rect x="144" y="74" width="18" height="14" fill="#1c1917"/>
                  <rect x="68" y="118" width="14" height="12" fill="#1c1917"/>
                  <rect x="90" y="124" width="18" height="10" fill="#1c1917"/>
                  <rect x="120" y="118" width="12" height="16" fill="#1c1917"/>
                  <rect x="142" y="130" width="16" height="14" fill="#1c1917"/>
                  <rect x="68" y="148" width="16" height="14" fill="#1c1917"/>
                  <rect x="94" y="146" width="14" height="16" fill="#1c1917"/>
                  <rect x="122" y="148" width="18" height="12" fill="#1c1917"/>
                </svg>
              </div>

              <div style="font-size: 1.6rem; font-weight: 800; color: var(--charcoal);">
                ₹${(invoice.balance > 0 ? invoice.balance : invoice.amount).toLocaleString('en-IN')}
              </div>
              <div style="font-size: 0.825rem; color: var(--slate-muted); margin-top: 0.25rem;">
                ${invoice.balance > 0 ? 'Outstanding Tuition Balance' : 'Tuition Fully Settled ✓'}
              </div>
              <div style="font-size: 0.775rem; color: var(--terracotta); font-weight: 700; margin-top: 0.35rem;">
                UPI ID: gafoordrive@icici
              </div>
            </div>

            <div style="margin-top: 1rem; padding: 0.75rem; background: var(--bg-canvas); border-radius: var(--radius-sm); border: 1px solid var(--border-light); font-size: 0.8rem; color: var(--slate-muted); text-align: left;">
              <div>Candidate ID: <strong style="color: var(--charcoal);">${trainee.id}</strong></div>
              <div>Institution: <strong>Gafoor Driving School · Pulivendula · RTO Lic. #AP-04-DS-2024</strong></div>
              <div>Supported: <strong>PhonePe, Google Pay, Paytm, BHIM UPI</strong></div>
            </div>

            <div style="margin-top: 1.5rem; display: flex; justify-content: center; gap: 0.75rem;">
              <button type="button" class="btn-mnc btn-mnc-secondary" id="btn-close-qr-2">Close</button>
              ${invoice.balance > 0 ? `
                <button type="button" class="btn-mnc btn-mnc-primary" id="btn-sim-qr-pay">
                  Simulate: Complete Instant UPI Payment ✓
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-qr').addEventListener('click', close);
    modalRoot.querySelector('#btn-close-qr-2').addEventListener('click', close);

    const btnSim = modalRoot.querySelector('#btn-sim-qr-pay');
    if (btnSim) {
      btnSim.addEventListener('click', () => {
        store.recordPayment(invoice.id, invoice.balance);
        close();
        showToast('Tuition fee cleared via UPI! Status updated to PAID ✓', 'success');
        render();
      });
    }
  }

  // Initial render
  render();
}
