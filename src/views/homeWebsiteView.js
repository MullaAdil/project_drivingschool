/* ==========================================================================
   GAFOOR DRIVING SCHOOL — LANDING PAGE & SHOWCASE (PULIVENDULA)
   "Walk in & Drive out"
   Govt. Accredited Indian Driving Academy:
   - Emerald Green (#0c5836) and Metallic Gold (#c6923b) Brand Identity
   - AP RTO Govt. Accreditation (#AP-04-DS-2024 / AP-39)
   - Pulivendula Automated 8-Track & H-Track Training Circuit
   - 3-Column Course Architecture in ₹ INR (₹5,500 – ₹8,500)
   - Certified Driving Faculty & Localized Pulivendula Testimonials
   - Indian UPI QR Modal (PhonePe / Google Pay / Paytm)
   - Live Dashboard Suite Previews (Admin / Trainer / Trainee)
   ========================================================================== */

import { store } from '../store.js';
import { showToast } from '../main.js';
import { renderBrandLogo } from '../components/brandLogo.js';

export function renderHomeWebsiteView(container, onNavigate) {
  let activeTab = 'admin'; // 'admin' | 'trainer' | 'trainee'
  let activeTrackGuide = 'track8'; // 'track8' | 'trackH' | 'flyover' | 'traffic'

  function render() {
    const trainees = store.trainees;
    const trainers = store.trainers;
    const payments = store.payments;
    const schedule = store.schedule;

    const totalInvoiced = payments.reduce((acc, p) => acc + p.amount, 0);
    const totalCollected = payments.reduce((acc, p) => acc + p.paid, 0);
    const collectionRate = Math.round((totalCollected / totalInvoiced) * 100);

    const template = `
      <div class="natu-page-wrapper">


        <!-- HERO SECTION -->
        <section class="mnc-hero" style="text-align: center;">
          <!-- CLEAN CENTERED BRAND HERO -->
          <div class="hero-brand-center">
            <!-- Logo Showcase -->
            <div class="hero-logo-wrap">
              ${renderBrandLogo({ size: 'lg', className: 'hero-brand-logo' })}
            </div>

            <!-- AP RTO Accreditation Pill Badge -->
            <div class="hero-rto-badge">
              <span class="hero-rto-dot"></span>
              Walk in &amp; Drive out · AP RTO Accredited
            </div>

            <!-- Grand Hero Headline -->
            <h1 class="mnc-hero-headline">
              Walk in &amp; Drive out at<br>
              <span class="hero-brand-name">Gafoor Driving School</span>
            </h1>

            <!-- Curriculum meta -->
            <p class="hero-curriculum-meta">
              20-Day Practical Training · Maruti Swift Fleet · Pulivendula
            </p>
          </div>

          <p class="mnc-hero-sub" style="font-size: 1.15rem; line-height: 1.65; color: var(--slate-body); max-width: 720px; margin: 0 auto 1.75rem;">
            Pulivendula’s premier motor driving academy. 20-day practical on-road training (8 km/day), dual-control Maruti Swift fleet, certified lady mentors, and 100% 1st-attempt clearance for RTO 8-Track & H-Track test.
          </p>

          <div class="mnc-cta-group" style="justify-content: center;">
            <button type="button" class="btn-mnc btn-mnc-primary" id="hero-btn-book" style="padding: 0.8rem 1.85rem; font-size: 0.95rem;">
              Book a Course (From ₹7,000) →
            </button>
            <button type="button" class="btn-mnc btn-mnc-secondary" id="hero-btn-track-scroll" style="padding: 0.8rem 1.85rem; font-size: 0.95rem;">
              Explore RTO Track Guide ↓
            </button>
            <button type="button" class="btn-mnc btn-cred-gold" id="hero-btn-upi-modal" style="padding: 0.8rem 1.65rem; font-size: 0.95rem;">
              Pay via UPI QR ⊞
            </button>
          </div>

          <!-- Subtle Muggu Accent -->
          <div class="muggu-divider">
            <span class="muggu-symbol">✦ ❖ ✦</span>
          </div>
        </section>

        <!-- TRUST INDICATORS & STATISTICS RIBBON -->
        <section class="mnc-trust-strip">
          <div class="mnc-stats-grid">
            <div class="mnc-stat-item">
              <span class="mnc-stat-number stat-gold">15,000+</span>
              <span class="mnc-stat-label">Licensed Drivers Trained</span>
            </div>
            <div class="mnc-stat-item">
              <span class="mnc-stat-number stat-green">99.2%</span>
              <span class="mnc-stat-label">1st-Attempt RTO DL Pass Rate</span>
            </div>
            <div class="mnc-stat-item">
              <span class="mnc-stat-number stat-cyan">20 Days</span>
              <span class="mnc-stat-label">8 km/Day Real Road Practice</span>
            </div>
            <div class="mnc-stat-item">
              <span class="mnc-stat-number">4.96 ★</span>
              <span class="mnc-stat-label">Verified Google Student Rating</span>
            </div>
          </div>

          <div class="mnc-accreditations-row" style="margin-top: 2rem;">
            <div class="mnc-accred-item">
              <span>★ RTO Approved Dual-Control Vehicles</span>
            </div>
            <div class="mnc-accred-item">
              <span>★ Dedicated Lady Instructors for Women</span>
            </div>
            <div class="mnc-accred-item">
              <span>★ Flyover Half-Clutch Hill Hold Drill</span>
            </div>
            <div class="mnc-accred-item">
              <span>★ Govt. Parivahan LLR & DL Assistance</span>
            </div>
          </div>
        </section>

        <!-- INTERACTIVE RTO 8 & H TRACK SIMULATION STUDIO -->
        <section class="mnc-section-services" id="rto-track-section">
          <div class="mnc-section-container">
            <div class="mnc-section-header">
              <span class="mnc-section-tag">
                Official RTO Track Preparation
              </span>
              <h2 class="mnc-section-title">
                Interactive RTO 8 & H Track Simulation Studio
              </h2>
              <p class="mnc-section-desc">
                Master every sensor-equipped automated driving test track (ADTT) in Pulivendula & Andhra Pradesh with zero pole penalty points.
              </p>
            </div>

            <!-- RTO Track Interactive Component -->
            <div class="rto-track-studio">
              <div class="track-tabs-bar">
                <button type="button" class="track-tab-item ${activeTrackGuide === 'track8' ? 'active' : ''}" data-track="track8">
                  1. RTO '8' Track Maneuver
                </button>
                <button type="button" class="track-tab-item ${activeTrackGuide === 'trackH' ? 'active' : ''}" data-track="trackH">
                  2. RTO 'H' Track & Reverse Bay
                </button>
                <button type="button" class="track-tab-item ${activeTrackGuide === 'flyover' ? 'active' : ''}" data-track="flyover">
                  3. Flyover Half-Clutch Hill Hold
                </button>
                <button type="button" class="track-tab-item ${activeTrackGuide === 'traffic' ? 'active' : ''}" data-track="traffic">
                  4. Bumper-to-Bumper City Crawl
                </button>
              </div>

              ${renderTrackGuideContent(activeTrackGuide)}
            </div>
          </div>
        </section>

        <!-- SERVICES / COURSE ARCHITECTURE (2-COLUMN STRUCTURE IN ₹ INR) -->
        <section class="mnc-section-services" id="services-grid-section">
          <div class="mnc-section-container">
            <div class="mnc-section-header">
              <span class="mnc-section-tag">Curriculum Architecture</span>
              <h2 class="mnc-section-title">
                Two Transparent Course Tracks
              </h2>
              <p class="mnc-section-desc">
                All-inclusive fees with zero hidden charges. Dual-control Maruti Swift training on real roads. Choose the track that fits you.
              </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2.5rem; width: 100%; align-items: start;">

              <!-- CARD 1: WITHOUT LICENCE — CYAN THEME -->
              <div style="background: linear-gradient(180deg, rgba(0,229,255,0.06) 0%, rgba(13,16,23,0.97) 100%); border: 1.5px solid rgba(0,229,255,0.25); border-radius: var(--radius-card); padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">

                <div>
                  <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem;">
                    <span style="font-size:0.65rem; font-weight:800; text-transform:uppercase; letter-spacing:0.12em; color:var(--primary-cyan); background:rgba(0,229,255,0.1); border:1px solid rgba(0,229,255,0.25); border-radius:var(--radius-pill); padding:3px 12px;">Basic Track</span>
                    <span style="font-size:0.7rem; color:var(--slate-muted); font-weight:600;">Training Only</span>
                  </div>
                  <h3 style="font-size:1.6rem; font-weight:800; color:#fff; margin:0 0 0.4rem;">Without Licence</h3>
                  <p style="font-size:0.875rem; color:var(--slate-body); line-height:1.55; margin:0;">Just the driving training — for students who already hold a valid driving licence and want professional road practice.</p>
                </div>

                <div style="border-top:1px solid rgba(0,229,255,0.15); border-bottom:1px solid rgba(0,229,255,0.15); padding:1rem 0; display:flex; align-items:baseline; gap:0.5rem;">
                  <span style="font-size:2.4rem; font-weight:900; font-family:var(--font-mono); color:var(--primary-cyan); letter-spacing:-0.02em;">&#8377;7,000</span>
                  <span style="font-size:0.8rem; color:var(--slate-muted);">all-inclusive &middot; no hidden fees</span>
                </div>

                <div>
                  <div style="font-size:0.7rem; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:var(--slate-muted); margin-bottom:0.85rem;">What&apos;s Included</div>
                  <div style="display:flex; flex-direction:column; gap:0.6rem;">
                    <div style="display:flex; align-items:flex-start; gap:0.75rem;">
                      <span style="color:var(--primary-cyan); font-size:0.9rem; flex-shrink:0; margin-top:1px;">&#10003;</span>
                      <div><div style="font-size:0.85rem; font-weight:700; color:#fff;">20-Day Practical Training</div><div style="font-size:0.78rem; color:var(--slate-muted);">8 km/day &middot; 160 km total on real roads</div></div>
                    </div>
                    <div style="display:flex; align-items:flex-start; gap:0.75rem;">
                      <span style="color:var(--primary-cyan); font-size:0.9rem; flex-shrink:0; margin-top:1px;">&#10003;</span>
                      <div><div style="font-size:0.85rem; font-weight:700; color:#fff;">City Traffic &amp; Highway Sessions</div><div style="font-size:0.78rem; color:var(--slate-muted);">Real intersections, flyovers, and national highway driving</div></div>
                    </div>
                    <div style="display:flex; align-items:flex-start; gap:0.75rem;">
                      <span style="color:var(--primary-cyan); font-size:0.9rem; flex-shrink:0; margin-top:1px;">&#10003;</span>
                      <div><div style="font-size:0.85rem; font-weight:700; color:#fff;">RTO 8-Track &amp; H-Bay Practice</div><div style="font-size:0.78rem; color:var(--slate-muted);">Sensor track drills &mdash; zero pole-touching penalty training</div></div>
                    </div>
                    <div style="display:flex; align-items:flex-start; gap:0.75rem;">
                      <span style="color:var(--primary-cyan); font-size:0.9rem; flex-shrink:0; margin-top:1px;">&#10003;</span>
                      <div><div style="font-size:0.85rem; font-weight:700; color:#fff;">Flyover Half-Clutch Mastery</div><div style="font-size:0.78rem; color:var(--slate-muted);">Hill-hold without rollback on steep bridges &amp; gradients</div></div>
                    </div>
                    <div style="display:flex; align-items:flex-start; gap:0.75rem;">
                      <span style="color:var(--primary-cyan); font-size:0.9rem; flex-shrink:0; margin-top:1px;">&#10003;</span>
                      <div><div style="font-size:0.85rem; font-weight:700; color:#fff;">Dual-Control Safety Vehicle</div><div style="font-size:0.78rem; color:var(--slate-muted);">Maruti Swift with trainer co-pedals &mdash; 100% safety record</div></div>
                    </div>
                    <div style="margin-top:0.3rem; border-top:1px dashed rgba(255,255,255,0.07); padding-top:0.6rem; display:flex; flex-direction:column; gap:0.45rem;">
                      <div style="display:flex; align-items:center; gap:0.75rem; opacity:0.4;">
                        <span style="color:#ff6b6b; font-size:0.85rem; flex-shrink:0;">&#10007;</span>
                        <div style="font-size:0.8rem; color:var(--slate-muted); text-decoration:line-through;">Parivahan LLR Slot Booking</div>
                      </div>
                      <div style="display:flex; align-items:center; gap:0.75rem; opacity:0.4;">
                        <span style="color:#ff6b6b; font-size:0.85rem; flex-shrink:0;">&#10007;</span>
                        <div style="font-size:0.8rem; color:var(--slate-muted); text-decoration:line-through;">Licence Application &amp; RTO Documentation</div>
                      </div>
                      <div style="display:flex; align-items:center; gap:0.75rem; opacity:0.4;">
                        <span style="color:#ff6b6b; font-size:0.85rem; flex-shrink:0;">&#10007;</span>
                        <div style="font-size:0.8rem; color:var(--slate-muted); text-decoration:line-through;">RTO Test Slot Booking</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style="background:rgba(0,229,255,0.05); border:1px solid rgba(0,229,255,0.15); border-radius:var(--radius-md); padding:0.85rem 1rem;">
                  <div style="font-size:0.7rem; font-weight:800; color:var(--primary-cyan); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:0.3rem;">Best For</div>
                  <div style="font-size:0.82rem; color:var(--slate-body);">Students who already have a driving licence and want to build real road confidence and skills.</div>
                </div>

                <button type="button" class="btn-mnc btn-mnc-secondary btn-action-program" data-tier="Without Licence (&#8377;7,000)" style="width:100%;">
                  Enroll &mdash; Without Licence &rarr;
                </button>
              </div>

              <!-- CARD 2: WITH LICENCE — GOLD THEME -->
              <div style="background: linear-gradient(180deg, rgba(243,209,130,0.07) 0%, rgba(13,16,23,0.97) 100%); border: 1.5px solid rgba(243,209,130,0.35); border-radius: var(--radius-card); padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; box-shadow: 0 0 40px rgba(243,209,130,0.08);">

                <div>
                  <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem;">
                    <span style="font-size:0.65rem; font-weight:800; text-transform:uppercase; letter-spacing:0.12em; color:var(--primary-gold); background:rgba(243,209,130,0.1); border:1px solid rgba(243,209,130,0.3); border-radius:var(--radius-pill); padding:3px 12px;">Full Package</span>
                    <span style="font-size:0.7rem; color:var(--primary-gold); font-weight:700;">&#9733; Training + Licence</span>
                  </div>
                  <h3 style="font-size:1.6rem; font-weight:800; color:#fff; margin:0 0 0.4rem;">With Licence</h3>
                  <p style="font-size:0.875rem; color:var(--slate-body); line-height:1.55; margin:0;">Complete end-to-end package &mdash; driving training AND full licence processing from LLR to the final RTO driving test.</p>
                </div>

                <div style="border-top:1px solid rgba(243,209,130,0.2); border-bottom:1px solid rgba(243,209,130,0.2); padding:1rem 0; display:flex; align-items:baseline; gap:0.5rem;">
                  <span style="font-size:2.4rem; font-weight:900; font-family:var(--font-mono); color:var(--primary-gold); letter-spacing:-0.02em;">&#8377;11,000</span>
                  <span style="font-size:0.8rem; color:var(--slate-muted);">all-inclusive &middot; no hidden fees</span>
                </div>

                <div>
                  <div style="font-size:0.7rem; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:var(--slate-muted); margin-bottom:0.85rem;">What&apos;s Included</div>
                  <div style="display:flex; flex-direction:column; gap:0.6rem;">
                    <div style="display:flex; align-items:flex-start; gap:0.75rem;">
                      <span style="color:var(--primary-gold); font-size:0.9rem; flex-shrink:0; margin-top:1px;">&#10003;</span>
                      <div><div style="font-size:0.85rem; font-weight:700; color:#fff;">20-Day Practical Training</div><div style="font-size:0.78rem; color:var(--slate-muted);">8 km/day &middot; 160 km total on real roads</div></div>
                    </div>
                    <div style="display:flex; align-items:flex-start; gap:0.75rem;">
                      <span style="color:var(--primary-gold); font-size:0.9rem; flex-shrink:0; margin-top:1px;">&#10003;</span>
                      <div><div style="font-size:0.85rem; font-weight:700; color:#fff;">City Traffic &amp; Highway Sessions</div><div style="font-size:0.78rem; color:var(--slate-muted);">Real intersections, flyovers, and national highway driving</div></div>
                    </div>
                    <div style="display:flex; align-items:flex-start; gap:0.75rem;">
                      <span style="color:var(--primary-gold); font-size:0.9rem; flex-shrink:0; margin-top:1px;">&#10003;</span>
                      <div><div style="font-size:0.85rem; font-weight:700; color:#fff;">RTO 8-Track &amp; H-Bay Practice</div><div style="font-size:0.78rem; color:var(--slate-muted);">Sensor track drills &mdash; zero pole-touching penalty training</div></div>
                    </div>
                    <div style="display:flex; align-items:flex-start; gap:0.75rem;">
                      <span style="color:var(--primary-gold); font-size:0.9rem; flex-shrink:0; margin-top:1px;">&#10003;</span>
                      <div><div style="font-size:0.85rem; font-weight:700; color:#fff;">Flyover Half-Clutch Mastery</div><div style="font-size:0.78rem; color:var(--slate-muted);">Hill-hold without rollback on steep bridges &amp; gradients</div></div>
                    </div>
                    <div style="display:flex; align-items:flex-start; gap:0.75rem;">
                      <span style="color:var(--primary-gold); font-size:0.9rem; flex-shrink:0; margin-top:1px;">&#10003;</span>
                      <div><div style="font-size:0.85rem; font-weight:700; color:#fff;">Dual-Control Safety Vehicle</div><div style="font-size:0.78rem; color:var(--slate-muted);">Maruti Swift with trainer co-pedals &mdash; 100% safety record</div></div>
                    </div>
                    <div style="margin-top:0.3rem; border-top:1px dashed rgba(243,209,130,0.2); padding-top:0.6rem; display:flex; flex-direction:column; gap:0.5rem;">
                      <div style="display:flex; align-items:flex-start; gap:0.75rem;">
                        <span style="color:var(--primary-gold); font-size:0.9rem; flex-shrink:0; margin-top:1px;">&#10003;</span>
                        <div><div style="font-size:0.85rem; font-weight:700; color:var(--primary-gold);">Parivahan LLR Slot Booking</div><div style="font-size:0.78rem; color:var(--slate-muted);">Govt. learner licence online slot + online test prep</div></div>
                      </div>
                      <div style="display:flex; align-items:flex-start; gap:0.75rem;">
                        <span style="color:var(--primary-gold); font-size:0.9rem; flex-shrink:0; margin-top:1px;">&#10003;</span>
                        <div><div style="font-size:0.85rem; font-weight:700; color:var(--primary-gold);">Licence Application &amp; RTO Documentation</div><div style="font-size:0.78rem; color:var(--slate-muted);">End-to-end form filling, DL application &amp; document guidance</div></div>
                      </div>
                      <div style="display:flex; align-items:flex-start; gap:0.75rem;">
                        <span style="color:var(--primary-gold); font-size:0.9rem; flex-shrink:0; margin-top:1px;">&#10003;</span>
                        <div><div style="font-size:0.85rem; font-weight:700; color:var(--primary-gold);">RTO Test Slot Booking</div><div style="font-size:0.78rem; color:var(--slate-muted);">Official Pulivendula RTO track test appointment scheduling</div></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style="background:rgba(243,209,130,0.06); border:1px solid rgba(243,209,130,0.2); border-radius:var(--radius-md); padding:0.85rem 1rem;">
                  <div style="font-size:0.7rem; font-weight:800; color:var(--primary-gold); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:0.3rem;">Best For</div>
                  <div style="font-size:0.82rem; color:var(--slate-body);">First-time drivers who need everything &mdash; training, learner licence, and the final driving licence, all in one package.</div>
                </div>

                <button type="button" class="btn-mnc btn-mnc-primary btn-action-program" data-tier="With Licence (&#8377;11,000)" style="width:100%; background:linear-gradient(135deg,#f3d182,#e0aa3e); color:#08090c;">
                  Enroll &mdash; With Licence &rarr;
                </button>
              </div>

            </div>
          </div>
        </section>

        <!-- FLEET SPOTLIGHT SECTION (AUTHENTIC TRAINING CARS) -->

        <section class="mnc-fleet-spotlight">
          <div class="mnc-section-container">
            <div class="fleet-banner">
              <div>
                <span class="track-badge-rto">
                  State Dual-Control Vehicle Fleet
                </span>
                <h2>
                  100% Dual-Control Dual-Pedal Safety Fleet
                </h2>
                <p>
                  Every vehicle is fitted with passenger-side co-driver dual pedals (brake &amp; clutch) certified under State Transport Department guidelines for fail-safe learner control.
                </p>

                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                  <button type="button" class="btn-mnc btn-mnc-primary" id="btn-fleet-book">
                    Book a 1-on-1 Trial Drive
                  </button>
                  <button type="button" class="btn-mnc btn-cred-gold" id="btn-open-upi-mini">
                    Pay Fees via UPI QR ⊞
                  </button>
                </div>
              </div>

              <div class="fleet-stats-mini">
                <div class="fleet-stat-card">
                  <span class="num" style="color: var(--primary-cyan);">Swift &amp; Punch</span>
                  <span class="desc">Maruti Swift, WagonR, Grand i10 &amp; Tata Punch AC units</span>
                </div>
                <div class="fleet-stat-card">
                  <span class="num" style="color: var(--primary-green);">100% Safety</span>
                  <span class="desc">Zero accident safety record with secondary trainer brake pedals</span>
                </div>
                <div class="fleet-stat-card">
                  <span class="num" style="color: var(--primary-gold);">RTO Track</span>
                  <span class="desc">Practiced on actual automated RTO sensor ground circuits</span>
                </div>
                <div class="fleet-stat-card">
                  <span class="num" style="color: #ffffff;">Ladies Wing</span>
                  <span class="desc">Exclusive lady mentor wing with comfortable doorstep service</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- AUTHENTIC TESTIMONIALS -->
        <section class="mnc-section-services" style="padding: 5rem 2rem;">
          <div class="mnc-section-container">
            <div class="mnc-section-header">
              <span class="mnc-section-tag">
                Verified Student Reviews
              </span>
              <h2 class="mnc-section-title">
                Real Stories from Drivers in Pulivendula & Kadapa District
              </h2>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.75rem; margin-top: 2.5rem;">
              <!-- Review 1 -->
              <div style="background: linear-gradient(180deg, rgba(22, 26, 36, 0.75) 0%, rgba(13, 16, 23, 0.95) 100%); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-card); padding: 2rem; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 20px 48px -12px rgba(0, 0, 0, 0.7);">
                <div style="display: flex; align-items: center; gap: 0.85rem; margin-bottom: 1.25rem;">
                  <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #f3d182, #e0aa3e); color: #08090c; display: flex; align-items: center; justify-content: center; font-weight: 800; font-family: var(--font-display);">
                    RB
                  </div>
                  <div>
                    <h4 style="font-size: 0.95rem; font-weight: 800; color: #ffffff; margin: 0;">Ramesh Babu</h4>
                    <span style="font-size: 0.75rem; color: var(--slate-body);">Bakarapuram, Pulivendula · Software Engineer</span>
                  </div>
                </div>
                <div style="color: var(--primary-gold); font-size: 0.9rem; margin-bottom: 0.75rem; letter-spacing: 0.08em;">★★★★★</div>
                <p style="font-size: 0.875rem; color: #cbd5e1; line-height: 1.65; margin: 0;">
                  "Gafoor Driving School made learning so simple! Master Srinivas explained clutch balance and the RTO 8-track maneuvers patiently. Cleared my AP RTO test on the first attempt with zero penalty!"
                </p>
              </div>

              <!-- Review 2 -->
              <div style="background: linear-gradient(180deg, rgba(22, 26, 36, 0.75) 0%, rgba(13, 16, 23, 0.95) 100%); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-card); padding: 2rem; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 20px 48px -12px rgba(0, 0, 0, 0.7);">
                <div style="display: flex; align-items: center; gap: 0.85rem; margin-bottom: 1.25rem;">
                  <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #00f59b, #059669); color: #08090c; display: flex; align-items: center; justify-content: center; font-weight: 800; font-family: var(--font-display);">
                    SR
                  </div>
                  <div>
                    <h4 style="font-size: 0.95rem; font-weight: 800; color: #ffffff; margin: 0;">Sravani Reddy</h4>
                    <span style="font-size: 0.75rem; color: var(--slate-body);">Kadapa Road, Pulivendula · Teacher & Homemaker</span>
                  </div>
                </div>
                <div style="color: var(--primary-gold); font-size: 0.9rem; margin-bottom: 0.75rem; letter-spacing: 0.08em;">★★★★★</div>
                <p style="font-size: 0.875rem; color: #cbd5e1; line-height: 1.65; margin: 0;">
                  "Lady instructor Anitha Reddy gave me immense confidence. Truly 'Walk in &amp; Drive out'! With convenient doorstep pickup in Pulivendula, I can now navigate town traffic and ring roads effortlessly."
                </p>
              </div>

              <!-- Review 3 -->
              <div style="background: linear-gradient(180deg, rgba(22, 26, 36, 0.75) 0%, rgba(13, 16, 23, 0.95) 100%); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-card); padding: 2rem; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 20px 48px -12px rgba(0, 0, 0, 0.7);">
                <div style="display: flex; align-items: center; gap: 0.85rem; margin-bottom: 1.25rem;">
                  <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #00d2ff, #0284c7); color: #08090c; display: flex; align-items: center; justify-content: center; font-weight: 800; font-family: var(--font-display);">
                    KR
                  </div>
                  <div>
                    <h4 style="font-size: 0.95rem; font-weight: 800; color: #ffffff; margin: 0;">Koteswara Rao</h4>
                    <span style="font-size: 0.75rem; color: var(--slate-body);">Shilparamam Road, Pulivendula · Business Owner</span>
                  </div>
                </div>
                <div style="color: var(--primary-gold); font-size: 0.9rem; margin-bottom: 0.75rem; letter-spacing: 0.08em;">★★★★★</div>
                <p style="font-size: 0.875rem; color: #cbd5e1; line-height: 1.65; margin: 0;">
                  "Trained my son with solid practical fundamentals on the Pulivendula bypass circuit. The reverse bay and H-track instructions were crystal clear. Honest fee in ₹ with full transparency!"
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- DASHBOARD PREVIEW SECTION: TABBED INTERFACE (ADMIN / TRAINER / TRAINEE) -->
        <section class="mnc-section-dashboard" id="dashboard-preview-section">
          <div class="mnc-section-container">
            <div class="mnc-section-header">
              <span class="mnc-section-tag">Academy Cloud Platform</span>
              <h2 class="mnc-section-title">
                Integrated Management Platform
              </h2>
              <p class="mnc-section-desc">
                Experience the real-time control software powering our driving school. Preview Admin, Trainer, and Trainee workspaces below.
              </p>
            </div>

            <!-- Tabbed Selector -->
            <div class="dashboard-tab-bar">
              <button type="button" class="dash-tab-btn ${activeTab === 'admin' ? 'active' : ''}" data-tab="admin">
                Admin Console
              </button>
              <button type="button" class="dash-tab-btn ${activeTab === 'trainer' ? 'active' : ''}" data-tab="trainer">
                Trainer Dispatch
              </button>
              <button type="button" class="dash-tab-btn ${activeTab === 'trainee' ? 'active' : ''}" data-tab="trainee">
                Trainee Portal
              </button>
            </div>

            <!-- Live Dashboard Window Preview -->
            <div class="dashboard-window">
              <div class="dashboard-window-top">
                <div class="window-dots">
                  <div class="window-dot" style="background: #ef4444;"></div>
                  <div class="window-dot" style="background: #f59e0b;"></div>
                  <div class="window-dot" style="background: #10b981;"></div>
                </div>
                <div class="window-title">
                  Gafoor Driving School Cloud v2.6 · 
                  ${activeTab === 'admin' ? 'Administrative Operations' : (activeTab === 'trainer' ? 'Instructor Schedule & Attendance' : 'Student Driving Course Dashboard')}
                </div>
                <div style="font-size: 0.75rem; color: var(--slate-muted); font-weight: 700;">
                  Pulivendula RTO Track System
                </div>
              </div>

              <div class="dashboard-window-body">
                ${activeTab === 'admin' ? renderAdminPreview(trainees, trainers, totalCollected, collectionRate) : ''}
                ${activeTab === 'trainer' ? renderTrainerPreview(schedule) : ''}
                ${activeTab === 'trainee' ? renderTraineePreview(trainees[0]) : ''}
              </div>
            </div>
          </div>
        </section>

        <!-- INSTITUTIONAL FOOTER -->
        <footer class="mnc-footer">
          <div class="mnc-footer-grid">
            <div>
              <div style="display: flex; align-items: center; gap: 0.85rem; margin-bottom: 0.75rem;">
                ${renderBrandLogo({ size: 'md' })}
                <div>
                  <div style="font-size: 1.2rem; font-weight: 800; color: #ffffff;">GAFOOR DRIVING SCHOOL</div>
                  <div style="font-size: 0.75rem; color: var(--turmeric); font-weight: 700;">Walk in & Drive out · Pulivendula</div>
                </div>
              </div>
              <p style="font-size: 0.85rem; color: #a8a29e; line-height: 1.6; max-width: 340px;">
                Andhra Pradesh Transport Department Accredited Motor Driving School. License #AP-04-DS-2024. Cultivating confident, disciplined motorists in Pulivendula and across AP.
              </p>
            </div>

            <div>
              <h4 style="color: #ffffff; margin-bottom: 1rem; font-size: 0.95rem;">Training Tiers</h4>
              <ul class="mnc-footer-links">
                <li><a href="#services-grid-section" style="color: #cbd5e1;">Beginner Course (₹5,500)</a></li>
                <li><a href="#services-grid-section" style="color: #cbd5e1;">RTO 8-Track Special (₹7,500)</a></li>
                <li><a href="#services-grid-section" style="color: #cbd5e1;">Ladies Special Batch (₹8,500)</a></li>
                <li><a href="#rto-track-section" style="color: #cbd5e1;">H-Track Parking Mastery</a></li>
              </ul>
            </div>

            <div>
              <h4 style="color: #ffffff; margin-bottom: 1rem; font-size: 0.95rem;">Branches & Contact</h4>
              <ul class="mnc-footer-links">
                <li style="color: #cbd5e1;">📍 Pulivendula: Kadapa Road (Main Office)</li>
                <li style="color: #cbd5e1;">📍 Pulivendula: JNTU Bypass Ground</li>
                <li style="color: #cbd5e1;">📍 Pulivendula: Shilparamam Ring Road</li>
                <li style="color: #cbd5e1;">📍 Pulivendula: RTC Bus Stand Hub</li>
                <li style="color: #cbd5e1;">📍 Kadapa: District RTO Driving Ground</li>
              </ul>
            </div>

            <div>
              <h4 style="color: #ffffff; margin-bottom: 1rem; font-size: 0.95rem;">UPI & Payments</h4>
              <p style="font-size: 0.8rem; color: #a8a29e; line-height: 1.5; margin-bottom: 0.75rem;">
                Instant tuition settlement via PhonePe, GPay, Paytm & BHIM UPI.
              </p>
              <div class="upi-chip" style="background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); color: #f7f3eb; display: inline-block;">
                UPI ID: <strong>gafoordrive@upi</strong>
              </div>
            </div>
          </div>

          <div class="mnc-footer-bottom" style="border-top-color: rgba(255,255,255,0.1); color: #a8a29e;">
            <div>
              © 2026 Gafoor Driving School, Pulivendula. All rights reserved. AP RTO Accredited Driving Academy.
            </div>
            <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
              <span>Pulivendula Sensor Track</span>
              <span>Maruti Swift Dual-Brake Fleet</span>
              <span>AP Transport Parivahan Partner</span>
            </div>
          </div>
        </footer>
      </div>
    `;

    container.innerHTML = template;
    attachEvents();
  }

  // --- Sub-renderer for Track Simulation Guide ---
  function renderTrackGuideContent(trackId) {
    if (trackId === 'track8') {
      return `
        <div class="track-display-grid">
          <div class="track-visual-diagram">
            <svg class="track-svg-art" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
              <!-- Figure 8 Track Road Background -->
              <path d="M 80,90 A 45,45 0 1,0 160,90 A 45,45 0 1,1 240,90 A 45,45 0 1,1 160,90 A 45,45 0 1,0 80,90 Z" fill="none" stroke="#3f3f46" stroke-width="36" stroke-linejoin="round"/>
              <path d="M 80,90 A 45,45 0 1,0 160,90 A 45,45 0 1,1 240,90 A 45,45 0 1,1 160,90 A 45,45 0 1,0 80,90 Z" fill="none" stroke="#22c55e" stroke-width="4" stroke-dasharray="8 6"/>
              <!-- Boundary Poles -->
              <circle cx="80" cy="90" r="16" fill="#1c1917" stroke="#e4e4e7" stroke-width="2"/>
              <circle cx="240" cy="90" r="16" fill="#1c1917" stroke="#e4e4e7" stroke-width="2"/>
              <text x="80" y="94" font-size="10" fill="#ffffff" text-anchor="middle" font-weight="bold">L-POLE</text>
              <text x="240" y="94" font-size="10" fill="#ffffff" text-anchor="middle" font-weight="bold">R-POLE</text>
              <!-- Car Marker -->
              <rect x="150" y="78" width="22" height="14" rx="3" fill="#b44a28" stroke="#ffffff" stroke-width="1.5"/>
              <circle cx="154" cy="80" r="2" fill="#ffffff"/>
              <circle cx="168" cy="80" r="2" fill="#ffffff"/>
              <text x="160" y="160" font-size="11" fill="#fde68a" text-anchor="middle" font-weight="bold">RTO Automated Track '8' — Entry ➔ Loop ➔ Exit</text>
            </svg>
          </div>

          <div class="track-info-panel">
            <span class="track-badge-rto">✓ MVI Examiner Key Criteria</span>
            <h3>Mastering the RTO Automated 8-Track</h3>
            <p style="font-size: 0.875rem; color: var(--slate-muted); line-height: 1.55;">
              Automated Driving Test Tracks (ADTT) utilize laser barrier sensors. Avoid any boundary line breach with our 3-step turning rhythm:
            </p>

            <ul class="track-steps-list">
              <li class="track-step-item">
                <span class="track-step-num">1</span>
                <div>
                  <strong>Lock in 1st Gear at 10-12 km/h:</strong>
                  <span>Maintain steady creeping without sudden throttling or abrupt clutch release.</span>
                </div>
              </li>
              <li class="track-step-item">
                <span class="track-step-num">2</span>
                <div>
                  <strong>Hand-Over-Hand Steering Lock:</strong>
                  <span>Smooth progressive steering rotation keeping the hood aligned to center.</span>
                </div>
              </li>
              <li class="track-step-item">
                <span class="track-step-num">3</span>
                <div>
                  <strong>Inner Pole Reference:</strong>
                  <span>Maintain 2 feet equidistant clearance from the pivot island pole.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      `;
    } else if (trackId === 'trackH') {
      return `
        <div class="track-display-grid">
          <div class="track-visual-diagram">
            <svg class="track-svg-art" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
              <!-- H Track Layout -->
              <rect x="60" y="30" width="30" height="120" fill="#3f3f46"/>
              <rect x="230" y="30" width="30" height="120" fill="#3f3f46"/>
              <rect x="90" y="75" width="140" height="30" fill="#3f3f46"/>
              <!-- Parking Bay -->
              <rect x="135" y="75" width="50" height="30" fill="#b44a28" opacity="0.35" stroke="#fde68a" stroke-dasharray="4 3"/>
              <!-- Sensor lines -->
              <line x1="60" y1="30" x2="60" y2="150" stroke="#ef4444" stroke-width="2"/>
              <line x1="260" y1="30" x2="260" y2="150" stroke="#ef4444" stroke-width="2"/>
              <text x="160" y="94" font-size="10" fill="#ffffff" text-anchor="middle" font-weight="bold">REVERSE BAY</text>
              <rect x="145" y="80" width="20" height="14" rx="2" fill="#b44a28" stroke="#ffffff"/>
              <text x="160" y="165" font-size="11" fill="#fde68a" text-anchor="middle" font-weight="bold">RTO 'H' Track: Forward ➔ Reverse Parallel Dock</text>
            </svg>
          </div>

          <div class="track-info-panel">
            <span class="track-badge-rto">✓ Reverse Bay Alignment</span>
            <h3>RTO 'H' Track & Reverse Docking</h3>
            <p style="font-size: 0.875rem; color: var(--slate-muted); line-height: 1.55;">
              The H-Track tests spatial reverse orientation and perpendicular bay docking. Our instructors make mirror reference points second nature.
            </p>

            <ul class="track-steps-list">
              <li class="track-step-item">
                <span class="track-step-num">1</span>
                <div>
                  <strong>45-Degree Pivot Point:</strong>
                  <span>Align rear wheel to the entrance pole line before applying full steering lock.</span>
                </div>
              </li>
              <li class="track-step-item">
                <span class="track-step-num">2</span>
                <div>
                  <strong>Dual Mirror Glance Rhythm:</strong>
                  <span>Alternate mirror checks to keep vehicle centered between sensor poles.</span>
                </div>
              </li>
              <li class="track-step-item">
                <span class="track-step-num">3</span>
                <div>
                  <strong>Inside Bay Stop:</strong>
                  <span>Halt cleanly inside the white box with wheels straightened.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      `;
    } else if (trackId === 'flyover') {
      return `
        <div class="track-display-grid">
          <div class="track-visual-diagram">
            <svg class="track-svg-art" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
              <!-- Incline Slope -->
              <polygon points="40,150 280,60 280,150" fill="#3f3f46"/>
              <line x1="40" y1="150" x2="280" y2="60" stroke="#22c55e" stroke-width="4"/>
              <!-- Stop Line on Slope -->
              <line x1="160" y1="105" x2="190" y2="105" stroke="#ef4444" stroke-width="4"/>
              <!-- Car on Slope -->
              <g transform="translate(145, 95) rotate(-20.5)">
                <rect x="0" y="0" width="28" height="15" rx="3" fill="#b44a28" stroke="#ffffff"/>
                <circle cx="5" cy="15" r="3" fill="#1c1917"/>
                <circle cx="23" cy="15" r="3" fill="#1c1917"/>
              </g>
              <text x="160" y="165" font-size="11" fill="#fde68a" text-anchor="middle" font-weight="bold">Gradient Incline Stop & Go (Zero Rollback)</text>
            </svg>
          </div>

          <div class="track-info-panel">
            <span class="track-badge-rto">✓ Hill Hold Mastery</span>
            <h3>Flyover Half-Clutch Stop & Go</h3>
            <p style="font-size: 0.875rem; color: var(--slate-muted); line-height: 1.55;">
              Stopping mid-incline on steep city flyovers without rolling back 1 inch is the hallmark of a confident driver:
            </p>

            <ul class="track-steps-list">
              <li class="track-step-item">
                <span class="track-step-num">1</span>
                <div>
                  <strong>Apply Handbrake Firmly:</strong>
                  <span>Engage the handbrake on incline stop to relieve foot pressure.</span>
                </div>
              </li>
              <li class="track-step-item">
                <span class="track-step-num">2</span>
                <div>
                  <strong>Clutch Biting Point Discovery:</strong>
                  <span>Ease clutch until engine rpm drops slightly and front raises.</span>
                </div>
              </li>
              <li class="track-step-item">
                <span class="track-step-num">3</span>
                <div>
                  <strong>Release Handbrake & Glide:</strong>
                  <span>Gently apply throttle and release handbrake for a smooth forward surge with zero rollback.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="track-display-grid">
          <div class="track-visual-diagram">
            <svg class="track-svg-art" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
              <!-- Street Lane -->
              <rect x="20" y="20" width="280" height="140" fill="#3f3f46"/>
              <line x1="20" y1="90" x2="300" y2="90" stroke="#fde68a" stroke-width="2" stroke-dasharray="8 6"/>
              <!-- Traffic Vehicles (Autos, Buses, Cars) -->
              <rect x="40" y="45" width="38" height="20" rx="3" fill="#166534" stroke="#ffffff"/>
              <text x="59" y="58" font-size="8" fill="#ffffff" text-anchor="middle">RTC BUS</text>
              <rect x="110" y="48" width="18" height="14" rx="2" fill="#eab308" stroke="#000"/>
              <text x="119" y="58" font-size="7" fill="#000" text-anchor="middle">AUTO</text>
              <rect x="150" y="105" width="26" height="16" rx="3" fill="#b44a28" stroke="#ffffff"/>
              <text x="163" y="116" font-size="8" fill="#ffffff" text-anchor="middle">SWIFT</text>
              <text x="160" y="165" font-size="11" fill="#fde68a" text-anchor="middle" font-weight="bold">Bumper-to-Bumper City Navigation & Micro-Steering</text>
            </svg>
          </div>

          <div class="track-info-panel">
            <span class="track-badge-rto">✓ Traffic Mastery</span>
            <h3>Heavy City Traffic Clutch Crawling</h3>
            <p style="font-size: 0.875rem; color: var(--slate-muted); line-height: 1.55;">
              Navigate dense Indian urban traffic with auto-rickshaws, city buses, and motorbikes without engine choking.
            </p>

            <ul class="track-steps-list">
              <li class="track-step-item">
                <span class="track-step-num">1</span>
                <div>
                  <strong>Pedal Feathering:</strong>
                  <span>Micro-crawl in 1st gear using precise clutch friction without gas pedal.</span>
                </div>
              </li>
              <li class="track-step-item">
                <span class="track-step-num">2</span>
                <div>
                  <strong>Tire-to-Tarmac Spacing:</strong>
                  <span>Always stop where you can see the bottom of the tires of the vehicle in front.</span>
                </div>
              </li>
              <li class="track-step-item">
                <span class="track-step-num">3</span>
                <div>
                  <strong>360° Mirror Vigilance:</strong>
                  <span>Active scanning for two-wheelers slipping through traffic gaps.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      `;
    }
  }

  // --- Sub-renderer for Admin Tab in Preview ---
  function renderAdminPreview(trainees, trainers, totalCollected, collectionRate) {
    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--charcoal);">Students Directory</h3>
            <p style="font-size: 0.85rem; color: var(--slate-muted);">View student records, assign instructors, and verify course fee payments.</p>
          </div>
          <button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm" id="btn-launch-full-admin">
            Open Admin Office →
          </button>
        </div>

        <div class="kpi-row" style="margin-bottom: 1.5rem;">
          <div class="kpi-card" style="padding: 1rem 1.25rem;">
            <div class="kpi-top">
              <span class="kpi-label">Active Students</span>
              <span class="kpi-pill kpi-pill-blue">${trainees.length} Enrolled</span>
            </div>
            <div class="kpi-value" style="font-size: 1.5rem;">${trainees.length} Students</div>
          </div>

          <div class="kpi-card" style="padding: 1rem 1.25rem;">
            <div class="kpi-top">
              <span class="kpi-label">Instructors</span>
              <span class="kpi-pill kpi-pill-green">100% Active</span>
            </div>
            <div class="kpi-value" style="font-size: 1.5rem;">${trainers.length} Instructors</div>
          </div>

          <div class="kpi-card" style="padding: 1rem 1.25rem;">
            <div class="kpi-top">
              <span class="kpi-label">Fees Collected</span>
              <span class="kpi-pill kpi-pill-blue">${collectionRate}%</span>
            </div>
            <div class="kpi-value" style="font-size: 1.5rem;">₹${totalCollected.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div style="overflow-x: auto; border: 1px solid var(--border-light); border-radius: var(--radius-sm);">
          <table class="mnc-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student Name</th>
                <th>Enrolled Track</th>
                <th>Instructor</th>
                <th>Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${trainees.slice(0, 4).map(t => {
                const tr = trainers.find(item => item.id === t.assignedTrainerId) || trainers[0];
                return `
                  <tr>
                    <td style="font-weight: 800; color: var(--charcoal);">${t.id}</td>
                    <td style="font-weight: 700; color: var(--charcoal);">${t.name}</td>
                    <td style="font-size: 0.8125rem;">${t.package}</td>
                    <td style="font-size: 0.8125rem; color: var(--terracotta); font-weight: 600;">${tr.name}</td>
                    <td>
                      <span class="kpi-pill ${t.paymentStatus === 'paid' ? 'kpi-pill-green' : 'kpi-pill-orange'}">
                        ${t.paymentStatus === 'paid' ? 'PAID ✓' : (t.paymentStatus === 'partial' ? 'PARTIAL (₹)' : 'PENDING')}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <button type="button" class="btn-mnc btn-mnc-secondary btn-mnc-sm btn-preview-dossier" data-trainee-id="${t.id}">
                        Access Dossier →
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- Sub-renderer for Trainer Tab in Preview ---
  function renderTrainerPreview(schedule) {
    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--charcoal);">Today's Practical Driving Schedule</h3>
            <p style="font-size: 0.85rem; color: var(--slate-muted);">K. Srinivas Rao · Senior Head Trainer (Maruti Swift Dual-Ctrl #AP-04-ED-4041)</p>
          </div>
          <button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm" id="btn-launch-full-trainer">
            Launch Trainer Suite →
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${schedule.map(slot => `
            <div style="background: var(--bg-offwhite); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
              <div style="display: flex; gap: 1.25rem; align-items: center;">
                <div style="font-size: 1.1rem; font-weight: 800; color: var(--charcoal); min-width: 130px;">
                  ${slot.time}
                </div>
                <div>
                  <div style="font-weight: 800; color: var(--charcoal); font-size: 1rem;">${slot.studentName}</div>
                  <div style="font-size: 0.8rem; color: var(--slate-muted);">${slot.topic} · ${slot.car}</div>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 0.75rem; font-weight: 700; color: var(--slate-muted); text-transform: uppercase; margin-right: 0.5rem;">Attendance:</span>
                <button type="button" class="btn-mnc btn-mnc-sm btn-quick-att" data-slot-id="${slot.id}" data-att="present" style="background: ${slot.attendance === 'present' ? 'var(--neem-green)' : '#ffffff'}; color: ${slot.attendance === 'present' ? '#ffffff' : 'var(--slate-body)'}; border: 1px solid ${slot.attendance === 'present' ? 'var(--neem-green)' : 'var(--border-dark)'};">
                  Present
                </button>
                <button type="button" class="btn-mnc btn-mnc-sm btn-quick-att" data-slot-id="${slot.id}" data-att="absent" style="background: ${slot.attendance === 'absent' ? '#dc2626' : '#ffffff'}; color: ${slot.attendance === 'absent' ? '#ffffff' : 'var(--slate-body)'}; border: 1px solid ${slot.attendance === 'absent' ? '#dc2626' : 'var(--border-dark)'};">
                  Absent
                </button>
                <button type="button" class="btn-mnc btn-mnc-sm btn-quick-att" data-slot-id="${slot.id}" data-att="late" style="background: ${slot.attendance === 'late' ? 'var(--turmeric)' : '#ffffff'}; color: ${slot.attendance === 'late' ? '#1c1917' : 'var(--slate-body)'}; border: 1px solid ${slot.attendance === 'late' ? 'var(--turmeric)' : 'var(--border-dark)'};">
                  Late
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --- Sub-renderer for Trainee Tab in Preview ---
  function renderTraineePreview(trainee) {
    const progressPercent = Math.round((trainee.currentDay / 20) * 100);
    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--charcoal);">Student Milestone Workspace</h3>
            <p style="font-size: 0.85rem; color: var(--slate-muted);">${trainee.name} · ${trainee.id} · ${trainee.package}</p>
          </div>
          <button type="button" class="btn-mnc btn-mnc-primary btn-mnc-sm" id="btn-launch-full-trainee">
            Open Student Portal →
          </button>
        </div>

        <div class="kpi-card" style="padding: 1.5rem; margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.875rem; font-weight: 700; margin-bottom: 0.5rem;">
            <span style="color: var(--terracotta);">Daily Driving Progress: Day ${trainee.currentDay} of 20 Completed (${trainee.currentDay * 8} km Total)</span>
            <span style="color: var(--charcoal);">${progressPercent}% Completed</span>
          </div>
          <div style="width: 100%; height: 8px; background: var(--bg-subtle); border-radius: var(--radius-pill); overflow: hidden; border: 1px solid var(--border-light); margin-bottom: 1rem;">
            <div style="width: ${progressPercent}%; height: 100%; background: var(--terracotta); border-radius: var(--radius-pill);"></div>
          </div>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <span class="kpi-pill kpi-pill-green">✓ Days 1-10: Ground & Basic Street (Cleared)</span>
            <span class="kpi-pill kpi-pill-blue">● Days 11-19: Flyover & Highway (Active)</span>
            <span class="kpi-pill kpi-pill-purple">Day 20: Official RTO Test</span>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <button type="button" class="btn-mnc btn-mnc-secondary" id="btn-preview-upi-qr">
            Open Course Fee UPI QR Code ⊞
          </button>
          <button type="button" class="btn-mnc btn-mnc-secondary" onclick="alert('Day 20 evaluation form unlocks after completing the practical road syllabus.')">
            Submit Day 20 Appraisal Form
          </button>
        </div>
      </div>
    `;
  }

  function attachEvents() {
    // Interactive Circular Road Click (Turbo Flow toggle)
    const roadWrapper = container.querySelector('#hero-road-interactive-circle');
    const roadChipText = container.querySelector('#hero-road-chip .road-chip-text');
    if (roadWrapper) {
      let isTurbo = document.body.classList.contains('turbo-mode-active');
      if (isTurbo) {
        roadWrapper.classList.add('turbo-mode');
        if (roadChipText) roadChipText.textContent = '⚡ TURBO RTO TEST FLOW ACTIVE';
      }

      roadWrapper.addEventListener('click', () => {
        isTurbo = !isTurbo;
        roadWrapper.classList.toggle('turbo-mode', isTurbo);
        document.body.classList.toggle('turbo-mode-active', isTurbo);
        if (roadChipText) {
          roadChipText.textContent = isTurbo
            ? '⚡ TURBO RTO TEST FLOW ACTIVE'
            : 'AP RTO CIRCUIT TRACK';
        }
        if (typeof showToast === 'function') {
          showToast(
            isTurbo
              ? '⚡ Turbo Road Flow Active! Rapid RTO circuit test speed synced to all pages.'
              : '🛣️ Standard RTO circuit flow speed resumed across website.',
            isTurbo ? 'success' : 'info'
          );
        }
      });
    }

    // Hero Book Button
    const btnBook = container.querySelector('#hero-btn-book');
    if (btnBook) {
      btnBook.addEventListener('click', () => {
        openBookingModal();
      });
    }

    // Scroll to Track Guide
    const btnTrackScroll = container.querySelector('#hero-btn-track-scroll');
    if (btnTrackScroll) {
      btnTrackScroll.addEventListener('click', () => {
        const sec = document.getElementById('rto-track-section');
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Open UPI Modal from hero
    const btnUpiModal = container.querySelector('#hero-btn-upi-modal');
    if (btnUpiModal) {
      btnUpiModal.addEventListener('click', () => {
        openUpiQrModal(7500, 'RTO 8-Track & City Mastery');
      });
    }

    // Track Guide selection tabs
    container.querySelectorAll('[data-track]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTrackGuide = btn.dataset.track;
        render();
      });
    });

    // Program selection buttons
    container.querySelectorAll('.btn-action-program').forEach(btn => {
      btn.addEventListener('click', () => {
        openBookingModal(btn.dataset.tier);
      });
    });

    // Fleet Trial drive button
    const btnFleet = container.querySelector('#btn-fleet-book');
    if (btnFleet) {
      btnFleet.addEventListener('click', () => {
        openBookingModal('RTO 8-Track & City Mastery (₹7,500)');
      });
    }

    // Fleet open UPI
    const btnFleetUpi = container.querySelector('#btn-open-upi-mini');
    if (btnFleetUpi) {
      btnFleetUpi.addEventListener('click', () => {
        openUpiQrModal(7500, 'RTO 8-Track & City Mastery');
      });
    }

    // Dashboard tab switching
    container.querySelectorAll('[data-tab]').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        activeTab = tabBtn.dataset.tab;
        render();
      });
    });

    // Launch full service flows
    const btnAdmin = container.querySelector('#btn-launch-full-admin');
    if (btnAdmin) {
      btnAdmin.addEventListener('click', () => {
        onNavigate('admin', 'trainees');
      });
    }

    const btnTrainer = container.querySelector('#btn-launch-full-trainer');
    if (btnTrainer) {
      btnTrainer.addEventListener('click', () => {
        onNavigate('trainer');
      });
    }

    const btnTrainee = container.querySelector('#btn-launch-full-trainee');
    if (btnTrainee) {
      btnTrainee.addEventListener('click', () => {
        onNavigate('trainee');
      });
    }

    // Trainee preview click dossier
    container.querySelectorAll('.btn-preview-dossier').forEach(btn => {
      btn.addEventListener('click', () => {
        onNavigate('trainee-profile', btn.dataset.traineeId);
      });
    });

    // Quick attendance mark in preview
    container.querySelectorAll('.btn-quick-att').forEach(btn => {
      btn.addEventListener('click', () => {
        const slotId = btn.dataset.slotId;
        const att = btn.dataset.att;
        store.updateAttendance(slotId, att);
        render();
      });
    });

    // Trainee preview open QR
    const btnPreviewUpi = container.querySelector('#btn-preview-upi-qr');
    if (btnPreviewUpi) {
      btnPreviewUpi.addEventListener('click', () => {
        openUpiQrModal(3000, 'Tuition Balance Settlement');
      });
    }
  }

  // --- Modal: Book a Course in ₹ INR ---
  function openBookingModal(initialTier = 'RTO 8-Track & City Mastery (₹7,500)') {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="mnc-modal" style="max-width: 520px;">
          <div style="padding: 1.35rem 1.75rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.03);">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              ${renderBrandLogo({ size: 'sm' })}
              <div>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.01em;">Enroll in Gafoor Driving School</h3>
                <p style="font-size: 0.78rem; color: var(--slate-body); margin: 0.2rem 0 0;">Pulivendula · Certified 1-on-1 dual-control Maruti Swift training.</p>
              </div>
            </div>
            <button type="button" id="btn-close-book" style="background: transparent; border: none; font-size: 1.25rem; cursor: pointer; color: var(--slate-body); line-height: 1;">✕</button>
          </div>

          <form id="form-booking" style="padding: 1.75rem;">
            <div style="margin-bottom: 1.2rem;">
              <label style="display: block; font-size: 0.725rem; font-weight: 800; color: #8e9aa8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.4rem;">
                Student Full Name
              </label>
              <input type="text" class="mnc-input" name="name" required placeholder="e.g. Sai Kiran" style="width: 100%; box-sizing: border-box;" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.2rem;">
              <div>
                <label style="display: block; font-size: 0.725rem; font-weight: 800; color: #8e9aa8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.4rem;">
                  Contact Phone
                </label>
                <input type="tel" class="mnc-input" name="phone" required placeholder="+91 98480 00000" style="width: 100%; box-sizing: border-box;" />
              </div>
              <div>
                <label style="display: block; font-size: 0.725rem; font-weight: 800; color: #8e9aa8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.4rem;">
                  Preferred Branch (Pulivendula)
                </label>
                <select class="mnc-select" name="branch" style="width: 100%; box-sizing: border-box;">
                  <option value="Pulivendula - Kadapa Road">Pulivendula - Main Office (Kadapa Rd)</option>
                  <option value="Pulivendula - JNTU Bypass">Pulivendula - JNTU Bypass Ground</option>
                  <option value="Pulivendula - Shilparamam">Pulivendula - Shilparamam Ring Road</option>
                  <option value="Pulivendula - RTC Stand">Pulivendula - RTC Bus Stand Hub</option>
                  <option value="Kadapa RTO Ground">Kadapa - District RTO Ground</option>
                </select>
              </div>
            </div>

            <div style="margin-bottom: 1.35rem;">
              <label style="display: block; font-size: 0.725rem; font-weight: 800; color: #8e9aa8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.4rem;">
                Select Program Package
              </label>
              <select class="mnc-select" name="track" style="width: 100%; box-sizing: border-box;">
                <option value="Beginner Driving Course (₹5,500)" ${initialTier.includes('5,500') || initialTier.includes('Beginner') ? 'selected' : ''}>
                  Beginner Driving Course (₹5,500) · 20 Days Ground &amp; Street
                </option>
                <option value="RTO 8-Track & City Mastery (₹7,500)" ${initialTier.includes('7,500') || initialTier.includes('RTO') ? 'selected' : ''}>
                  RTO 8-Track &amp; City Mastery (₹7,500) · Full DL Prep (Most Popular)
                </option>
                <option value="Ladies Special & Doorstep Pickup (₹8,500)" ${initialTier.includes('8,500') || initialTier.includes('Ladies') || initialTier.includes('Women') ? 'selected' : ''}>
                  Ladies Special &amp; Doorstep Pickup (₹8,500) · Senior Lady Mentor
                </option>
              </select>
            </div>

            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-sm); padding: 0.85rem 1.15rem; margin-bottom: 1.5rem; font-size: 0.8rem; color: #cbd5e1; display: flex; align-items: center; justify-content: space-between;">
              <span>Payment Mode: <strong style="color: #ffffff;">PhonePe / GPay UPI QR / Cash</strong></span>
              <span style="color: var(--primary-green); font-weight: 800;">₹0 Registration Fee</span>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1.25rem; border-top: 1px solid rgba(255, 255, 255, 0.08);">
              <button type="button" class="btn-mnc btn-mnc-secondary" id="btn-cancel-book">Cancel</button>
              <button type="submit" class="btn-mnc btn-mnc-primary">Confirm Enrollment Reservation →</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-book').addEventListener('click', close);
    modalRoot.querySelector('#btn-cancel-book').addEventListener('click', close);

    const form = modalRoot.querySelector('#form-booking');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.elements['name'].value;
      const phone = form.elements['phone'].value;
      const branch = form.elements['branch'].value;
      const track = form.elements['track'].value;
      
      // Add trainee to store (generates unique code: e.g. MA-G01)
      const trainee = store.addTrainee({
        name,
        phone,
        address: `${branch}, Pulivendula, AP`,
        package: track,
        paymentStatus: 'pending'
      });

      close();
      openRegistrationSuccessModal(trainee, () => {
        openUpiQrModal(track.includes('7,500') ? 7500 : (track.includes('8,500') ? 8500 : 5500), track, name);
      });
      render();
    });
  }

  // --- Modal: Unique Student Registration Code ---
  function openRegistrationSuccessModal(trainee, onProceed) {
    const modalRoot = document.getElementById('modal-root');
    const studentCode = trainee.studentCode || trainee.id;
    const seqPart = studentCode.includes('-') ? studentCode.split('-')[1] : studentCode;
    const namePart = studentCode.includes('-') ? studentCode.split('-')[0] : (trainee.avatar || 'ST');

    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="p-modal" style="max-width:500px; text-align:center;">
          <div class="p-modal-header" style="justify-content:center; position:relative; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:1.25rem;">
            <div>
              <div style="font-size:0.7rem; font-weight:800; color:#a1a1aa; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:0.25rem;">ADMISSION CONFIRMED</div>
              <div class="p-modal-title" style="font-size:1.35rem;">Welcome to Gafoor Driving School!</div>
            </div>
            <button type="button" id="btn-close-home-reg" class="p-modal-close" style="position:absolute; right:1.5rem; top:1.5rem;">✕</button>
          </div>

          <div class="p-modal-body" style="padding:2rem 1.75rem;">
            <p style="font-size:0.875rem; color:#a1a1aa; margin:0 0 1.25rem; line-height:1.5;">
              Registration confirmed for <strong>${trainee.name}</strong>. Here is your official unique login code:
            </p>

            <!-- CODE CARD -->
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.18); border-radius:18px; padding:1.5rem 1.25rem; margin-bottom:1.5rem;">
              <div style="font-size:0.7rem; font-weight:800; color:#8e9aa8; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:0.6rem;">
                Your Student Login Code
              </div>
              <div id="home-student-code" style="font-size:2.6rem; font-weight:900; letter-spacing:0.06em; font-family:var(--font-mono); color:#ffffff; margin-bottom:0.6rem; user-select:all;">
                ${studentCode}
              </div>
              <div style="font-size:0.75rem; color:#a1a1aa; line-height:1.4;">
                <span style="color:#ffffff; font-weight:700;">${namePart}</span> (Initials of ${trainee.name}) · 
                <span style="color:#ffffff; font-weight:700;">${seqPart}</span> (Gafoor Student Sequential Index)
              </div>
            </div>

            <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:0.85rem; font-size:0.8rem; color:#a1a1aa; text-align:left; margin-bottom:1.75rem;">
              <div style="font-weight:700; color:#ffffff; margin-bottom:0.25rem;">Candidate Access Note:</div>
              Please note or screenshot this code. You can use <strong>${studentCode}</strong> anytime to sign in to the Student Portal to track your 20-day driving classes and RTO exam status.
            </div>

            <div style="display:flex; gap:0.75rem;">
              <button type="button" id="btn-copy-home-code" class="p-ghost-btn" style="flex:1; justify-content:center; padding:0.85rem;">
                📋 Copy Code
              </button>
              <button type="button" id="btn-proceed-upi" class="btn-mnc btn-mnc-primary" style="flex:1; justify-content:center; padding:0.85rem;">
                Pay Fee (UPI) →
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-home-reg').addEventListener('click', close);

    const btnCopy = modalRoot.querySelector('#btn-copy-home-code');
    btnCopy.addEventListener('click', () => {
      navigator.clipboard.writeText(studentCode).then(() => {
        btnCopy.textContent = '✓ Copied!';
        setTimeout(() => { btnCopy.textContent = '📋 Copy Code'; }, 2000);
      }).catch(() => {
        btnCopy.textContent = 'Code: ' + studentCode;
      });
    });

    modalRoot.querySelector('#btn-proceed-upi').addEventListener('click', () => {
      close();
      if (onProceed) onProceed();
    });
  }

  // --- Modal: Indian UPI QR Payment (PhonePe / GPay / Paytm) ---
  function openUpiQrModal(amount = 7500, packageName = 'RTO 8-Track Course', studentName = 'Student') {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="mnc-modal-overlay">
        <div class="mnc-modal" style="max-width: 440px;">
          <div style="padding: 1.35rem 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.03);">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              ${renderBrandLogo({ size: 'sm' })}
              <div>
                <h3 style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.01em;">Gafoor Driving School UPI Payment</h3>
                <p style="font-size: 0.75rem; color: var(--slate-body); margin: 0.2rem 0 0;">${packageName} · ${studentName}</p>
              </div>
            </div>
            <button type="button" id="btn-close-upi" style="background: transparent; border: none; font-size: 1.25rem; cursor: pointer; color: var(--slate-body); line-height: 1;">✕</button>
          </div>

          <div style="padding: 1.75rem 1.5rem; text-align: center;">
            <div class="upi-qr-box">
              <div style="font-size: 0.725rem; font-weight: 800; color: var(--primary-gold); text-transform: uppercase; margin-bottom: 0.75rem; letter-spacing: 0.08em;">
                SCAN WITH ANY UPI APP TO PAY
              </div>

              <!-- High-Fidelity SVG UPI QR Representation -->
              <div style="display: inline-block; background: #ffffff; padding: 14px; border-radius: 14px; border: 1px solid rgba(243, 209, 130, 0.4); box-shadow: 0 0 28px rgba(243, 209, 130, 0.2);">
                <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Corner Square 1 -->
                  <rect x="10" y="10" width="46" height="46" rx="6" fill="#1c1917"/>
                  <rect x="18" y="18" width="30" height="30" rx="3" fill="#ffffff"/>
                  <rect x="24" y="24" width="18" height="18" rx="2" fill="#0c5836"/>

                  <!-- Corner Square 2 -->
                  <rect x="124" y="10" width="46" height="46" rx="6" fill="#1c1917"/>
                  <rect x="132" y="18" width="30" height="30" rx="3" fill="#ffffff"/>
                  <rect x="138" y="24" width="18" height="18" rx="2" fill="#0c5836"/>

                  <!-- Corner Square 3 -->
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

              <div style="font-size: 2rem; font-weight: 900; color: #ffffff; margin-top: 1rem; font-family: var(--font-mono); letter-spacing: -0.02em;">
                ₹${amount.toLocaleString('en-IN')}
              </div>
              <div style="font-size: 0.825rem; color: var(--slate-body); margin-top: 0.3rem;">
                UPI ID: <strong style="color: var(--primary-gold); font-family: var(--font-mono);">gafoordrive@icici</strong>
              </div>

              <div class="upi-logos-row" style="margin-top: 1rem;">
                <span class="upi-chip">PhonePe</span>
                <span class="upi-chip">Google Pay</span>
                <span class="upi-chip">Paytm</span>
                <span class="upi-chip">BHIM UPI</span>
              </div>
            </div>

            <p style="font-size: 0.825rem; color: var(--slate-body); margin-top: 1.25rem; line-height: 1.55;">
              Scan with any mobile UPI banking app or simulate instant payment verification below.
            </p>

            <div style="display: flex; gap: 0.75rem; justify-content: center; margin-top: 1.5rem;">
              <button type="button" class="btn-mnc btn-mnc-secondary" id="btn-close-upi-2">Close</button>
              <button type="button" class="btn-mnc btn-cred-gold" id="btn-sim-upi-pay">
                Simulate UPI Success ✓
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-upi').addEventListener('click', close);
    modalRoot.querySelector('#btn-close-upi-2').addEventListener('click', close);

    const btnSim = modalRoot.querySelector('#btn-sim-upi-pay');
    if (btnSim) {
      btnSim.addEventListener('click', () => {
        close();
        alert(`Payment of ₹${amount.toLocaleString('en-IN')} received via UPI! Welcome to Gafoor Driving School, Pulivendula.`);
        render();
      });
    }
  }

  // Initial render
  render();
}
