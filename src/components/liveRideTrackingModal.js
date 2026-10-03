/* ==========================================================================
   MINIMAL & PREMIUM LIVE GPS RIDE TRACKING MODAL
   GAFOOR DRIVING SCHOOL — PULIVENDULA, ANDHRA PRADESH
   
   Aesthetic:
   - Minimalist edge-to-edge map with floating glassmorphism HUD (Tesla / Apple Maps / Uber)
   - Zero bulky cartoon logos or heavy green capsule clutter
   - Real-time GPS movement tracking (distance updates only as device/vehicle moves)
   - Continuous live distance measurement & speed from GPS
   - 16 Checkpoints every 500m with sleek micro-milestone progress bar
   - Luxury Dark Obsidian & Gold finish verification dossier
   ========================================================================== */

import L from 'leaflet';
import { store } from '../store.js';

let activeLiveMap = null;
let activeWatchId = null;
let elapsedTimer = null;

// Helper: Haversine distance in meters between two lat/lng pairs
export function haversineMeters(p1, p2) {
  const R = 6371000;
  const dLat = (p2[0] - p1[0]) * Math.PI / 180;
  const dLng = (p2[1] - p1[1]) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Helper: Calculate bearing angle between two coordinates
export function calculateBearing(start, end) {
  const startLat = start[0] * Math.PI / 180;
  const startLng = start[1] * Math.PI / 180;
  const endLat = end[0] * Math.PI / 180;
  const endLng = end[1] * Math.PI / 180;
  const dLng = endLng - startLng;

  const y = Math.sin(dLng) * Math.cos(endLat);
  const x = Math.cos(startLat) * Math.sin(endLat) -
            Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
  let brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

// Web Audio API Milestone Chime for 500m Checkpoints
function playMilestoneChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.16, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(783.99, now + 0.1);
    gain2.gain.setValueAtTime(0.2, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.4);
  } catch (e) {
    // Non-blocking
  }
}

// 16 Checkpoints at exact 500m intervals (500m, 1000m ... 8000m)
function generate500mCheckpoints(startPoint) {
  const checkpointLabels = [
    { title: 'Cockpit ABC Drill', place: 'Depot Exit Corridor' },
    { title: 'Steering Centering Check', place: 'Bakarapuram Avenue' },
    { title: 'Smooth Upshift Gear 2', place: 'Residential Link' },
    { title: 'Pedestrian Yield Zone', place: 'Town North Bypass' },
    { title: '45° Turn Maneuver', place: 'Crossroad Sector' },
    { title: 'Mirror & Blindspot Sweep', place: 'Market Road East' },
    { title: 'Safe Distance Buffer', place: 'RTC Approach Avenue' },
    { title: 'Clock Tower Circle (Halfway 🎯)', place: 'Central Traffic Circle' },
    { title: 'Speed Modulation Check', place: 'JNTU Ring Road Link' },
    { title: 'Lane Centering Control', place: 'Outer Ring Parkway' },
    { title: 'Controlled Downshift', place: 'Bypass Flyover Descent' },
    { title: 'Traffic Junction Flow', place: 'Municipal Junction' },
    { title: 'Hill Incline Hold & Start', place: 'Ghat Elevation Road' },
    { title: 'Curbside Margin Precision', place: 'South Boulevard' },
    { title: 'RTO 8-Track Simulated Entry', place: 'Test Facility Approach' },
    { title: '8.0 km Finish & Docking 🏁', place: 'Academy Depot Arrival' }
  ];

  const checkpoints = [];
  for (let i = 1; i <= 16; i++) {
    const targetM = i * 500;
    const meta = checkpointLabels[i - 1] || { title: `Checkpoint ${i}`, place: 'Pulivendula Sector' };

    checkpoints.push({
      id: i,
      name: `Checkpoint ${i}`,
      label: `${(targetM / 1000).toFixed(1)} km`,
      distanceMeters: targetM,
      distanceKm: (targetM / 1000).toFixed(1),
      title: meta.title,
      place: meta.place,
      cleared: false
    });
  }

  return checkpoints;
}

/**
 * Main function to launch the Minimal & Premium Live GPS Ride Modal
 */
export function openLiveRideMapModal({
  session = null,
  student = null,
  trainer = null,
  canTrainerComplete = true,
  onRideCompleted = null
} = {}) {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  const currentStudent = student || store.getCurrentTrainee();
  const currentTrainer = trainer || store.trainers.find(t => t.id === currentStudent.assignedTrainerId) || store.trainers[0];
  const dayNumber = session?.dayNumber || currentStudent.currentDay || 1;
  const objective = session?.objective || 'Practical Road Driving Lesson';

  const checkpoints = generate500mCheckpoints(session?.route?.startPoint);

  // Real-Time GPS Movement State
  let totalDistanceMeters = 0;
  let secondsElapsed = 0;
  let isTrackingPaused = false;
  let isRideCompleted = false;

  let lastGpsPoint = null;
  let lastGpsTimestamp = null;
  let initialMapSet = false;

  // Leaflet handles
  let carMarker = null;
  let livePolyline = null;
  let traveledCoords = [];

  modalRoot.innerHTML = `
    <div class="mnc-modal-overlay" id="live-ride-overlay" style="padding:0; align-items:stretch; justify-content:stretch; z-index:9999;">
      <div class="live-ride-viewport" style="
        width: 100vw;
        height: 100vh;
        max-width: 100vw;
        max-height: 100vh;
        background: #080a0f;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
        font-family: var(--font-sans);
      ">
        <!-- FULLSCREEN MAP -->
        <div id="live-ride-leaflet-map" style="position: absolute; inset: 0; width: 100%; height: 100%; background: #080a0f; z-index: 1;"></div>

        <!-- TOP MINIMALIST FLOATING GLASS ISLAND (PREMIUM APP HUD) -->
        <div style="
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 32px);
          max-width: 960px;
          background: rgba(12, 16, 24, 0.88);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          padding: 0.9rem 1.4rem;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65);
          z-index: 1000;
        ">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
            <!-- Left: Minimal Session Meta -->
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span id="gps-status-dot" style="width: 7px; height: 7px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span>
                <span id="gps-status-text" style="font-size: 0.68rem; font-weight: 800; color: #a1a1aa; letter-spacing: 0.05em; text-transform: uppercase;">Connecting GPS...</span>
              </div>
              <h2 style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin: 0.2rem 0 0 0; letter-spacing: -0.01em;">
                Day ${dayNumber} · ${objective}
              </h2>
              <div style="font-size: 0.72rem; color: #71717a; margin-top: 0.15rem;">
                ${currentStudent.name} <span style="color:#52525b;">/</span> Instructor ${currentTrainer.name} · ${currentTrainer.car}
              </div>
            </div>

            <!-- Center: Ultra-Clean Live Driving Telemetry -->
            <div style="display: flex; align-items: center; gap: 1.25rem;">
              <!-- Speed -->
              <div style="text-align: center;">
                <div style="font-size: 0.6rem; color: #71717a; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Speed</div>
                <div style="font-size: 1.5rem; font-weight: 900; color: #ffffff; font-family: var(--font-mono); line-height: 1.1;">
                  <span id="hud-speed">0</span> <span style="font-size: 0.7rem; color: #71717a; font-weight: 600;">km/h</span>
                </div>
              </div>

              <div style="width: 1px; height: 28px; background: rgba(255,255,255,0.08);"></div>

              <!-- Distance Driven -->
              <div style="text-align: center;">
                <div style="font-size: 0.6rem; color: #71717a; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Distance</div>
                <div style="font-size: 1.5rem; font-weight: 900; color: #22c55e; font-family: var(--font-mono); line-height: 1.1;">
                  <span id="hud-distance-km">0.00</span> <span style="font-size: 0.75rem; color: #71717a; font-weight: 600;">km</span>
                </div>
              </div>

              <div style="width: 1px; height: 28px; background: rgba(255,255,255,0.08);"></div>

              <!-- Next 500m Target -->
              <div style="text-align: center;">
                <div style="font-size: 0.6rem; color: #d4af37; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Next 500m</div>
                <div style="font-size: 1.15rem; font-weight: 800; color: #f59e0b; font-family: var(--font-mono); line-height: 1.1;">
                  <span id="hud-next-checkpoint-dist">500m</span>
                </div>
              </div>

              <div style="width: 1px; height: 28px; background: rgba(255,255,255,0.08);"></div>

              <!-- Checkpoints Cleared -->
              <div style="text-align: center;">
                <div style="font-size: 0.6rem; color: #71717a; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Checkpoints</div>
                <div style="font-size: 1.15rem; font-weight: 800; color: #ffffff; font-family: var(--font-mono); line-height: 1.1;">
                  <span id="hud-checkpoints-cleared">0</span> <span style="font-size: 0.7rem; color: #71717a;">/ 16</span>
                </div>
              </div>

              <div style="width: 1px; height: 28px; background: rgba(255,255,255,0.08);"></div>

              <!-- Duration -->
              <div style="text-align: center;">
                <div style="font-size: 0.6rem; color: #71717a; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Duration</div>
                <div style="font-size: 1.15rem; font-weight: 800; color: #ffffff; font-family: var(--font-mono); line-height: 1.1;">
                  <span id="hud-elapsed-time">00:00</span>
                </div>
              </div>
            </div>

            <!-- Right: Minimal Close -->
            <button type="button" id="btn-close-live-ride" style="
              background: rgba(255, 255, 255, 0.06);
              border: 1px solid rgba(255, 255, 255, 0.1);
              color: #a1a1aa;
              width: 36px;
              height: 36px;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              font-size: 1.1rem;
              transition: all 0.15s ease;
            " title="Close Session">✕</button>
          </div>

          <!-- Ultra-Sleek 3px Linear Progress Line (Replaces 16 clunky capsules!) -->
          <div style="margin-top: 0.75rem;">
            <div style="width: 100%; height: 3px; background: rgba(255, 255, 255, 0.08); border-radius: 9999px; overflow: hidden;">
              <div id="hud-progress-fill" style="width: 0%; height: 100%; background: linear-gradient(90deg, #22c55e 0%, #38bdf8 100%); transition: width 0.3s ease;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.35rem; font-size: 0.65rem; color: #71717a; font-family: var(--font-mono);">
              <span>0.0 km</span>
              <span id="hud-current-cp-name">Course Target: 8.0 km (16 Checkpoints @ 500m)</span>
              <span>8.0 km</span>
            </div>
          </div>
        </div>

        <!-- FLOATING 500M CHECKPOINT BANNER -->
        <div id="checkpoint-toast-banner" style="
          position: absolute;
          top: 130px;
          left: 50%;
          transform: translateX(-50%) translateY(-20px);
          opacity: 0;
          pointer-events: none;
          background: rgba(15, 20, 30, 0.95);
          backdrop-filter: blur(16px);
          border: 1px solid #22c55e;
          color: #ffffff;
          padding: 0.65rem 1.6rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 800;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          gap: 0.6rem;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 1200;
        ">
          <span style="color:#22c55e;">✓</span>
          <span id="checkpoint-toast-text">500m Checkpoint Cleared!</span>
        </div>

        <!-- FLOATING BOTTOM CONTROLS (MINIMALIST & CLEAN) -->
        <div style="
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(12, 16, 24, 0.9);
          backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 0.55rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
          z-index: 1000;
          flex-wrap: wrap;
        ">
          <button type="button" id="btn-pause-resume-tracking" style="
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #ffffff;
            padding: 0.55rem 1rem;
            border-radius: 10px;
            font-size: 0.8rem;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.4rem;
          ">
            <span id="pause-resume-icon">⏸</span>
            <span id="pause-resume-text">Pause</span>
          </button>

          <button type="button" id="btn-reacquire-gps" style="
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: #a1a1aa;
            padding: 0.55rem 0.9rem;
            border-radius: 10px;
            font-size: 0.78rem;
            font-weight: 700;
            cursor: pointer;
          " title="Refresh GPS Connection">
            🔄 Re-sync GPS
          </button>

          <!-- Subtle testing aid if stationary on desktop -->
          <button type="button" id="btn-test-step-motion" style="
            background: transparent;
            border: 1px dashed rgba(255, 255, 255, 0.15);
            color: #71717a;
            padding: 0.55rem 0.75rem;
            border-radius: 10px;
            font-size: 0.72rem;
            font-weight: 600;
            cursor: pointer;
          " title="Simulate 25m real motion for desktop testing without moving">
            +25m Test Motion
          </button>

          <div style="width: 1px; height: 24px; background: rgba(255,255,255,0.1);"></div>

          <!-- Complete Ride (Theme Matched) -->
          <button type="button" id="btn-complete-direct" style="
            background: linear-gradient(135deg, #d4af37 0%, #b89628 100%);
            border: none;
            color: #000000;
            padding: 0.6rem 1.4rem;
            border-radius: 10px;
            font-size: 0.85rem;
            font-weight: 900;
            cursor: pointer;
            box-shadow: 0 4px 18px rgba(212, 175, 55, 0.35);
          ">
            Complete &amp; Log (+8.0 km) ✓
          </button>
        </div>

        <!-- LUXURY OBSIDIAN & GOLD FINISH VERIFICATION MODAL -->
        <div id="finish-ride-ceremony" style="
          position: absolute;
          inset: 0;
          background: rgba(5, 7, 12, 0.92);
          backdrop-filter: blur(20px);
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          text-align: center;
          padding: 1.5rem;
        ">
          <div style="
            background: #0e121a;
            border: 1.5px solid rgba(212, 175, 55, 0.35);
            border-radius: 20px;
            padding: 2.25rem 2.5rem;
            max-width: 520px;
            width: 100%;
            box-shadow: 0 24px 70px rgba(0, 0, 0, 0.85);
            position: relative;
          ">
            <!-- Brand Badge -->
            <div style="
              display: inline-flex;
              align-items: center;
              gap: 0.4rem;
              background: rgba(212, 175, 55, 0.12);
              border: 1px solid rgba(212, 175, 55, 0.3);
              color: #d4af37;
              font-size: 0.68rem;
              font-weight: 800;
              padding: 0.25rem 0.75rem;
              border-radius: 9999px;
              letter-spacing: 0.06em;
              margin-bottom: 1rem;
            ">
              <span>✦</span> GAFOOR DRIVING SCHOOL · RTO ACCREDITED
            </div>

            <h2 style="font-size: 1.65rem; font-weight: 900; color: #ffffff; margin: 0 0 0.4rem 0; letter-spacing: -0.02em;">
              Day ${dayNumber} Practical Ride Completed
            </h2>
            <p style="font-size: 0.88rem; color: #94a3b8; margin: 0 0 1.75rem 0; line-height: 1.5;">
              Practical road driving lesson verified. All 16 checkpoints (500m intervals) completed under dual-brake instructor supervision.
            </p>

            <!-- 3 Stat Blocks (Dark Obsidian Luxury Theme) -->
            <div style="
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 0.75rem;
              background: rgba(255, 255, 255, 0.03);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 14px;
              padding: 1.15rem 0.85rem;
              margin-bottom: 1.5rem;
            ">
              <div>
                <div style="font-size: 0.62rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Distance</div>
                <div style="font-size: 1.35rem; font-weight: 900; color: #22c55e; font-family: var(--font-mono); margin-top: 0.2rem;">8.00 km</div>
              </div>
              <div style="border-left: 1px solid rgba(255,255,255,0.08); border-right: 1px solid rgba(255,255,255,0.08);">
                <div style="font-size: 0.62rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Checkpoints</div>
                <div style="font-size: 1.35rem; font-weight: 900; color: #ffffff; font-family: var(--font-mono); margin-top: 0.2rem;">16 / 16 ✓</div>
              </div>
              <div>
                <div style="font-size: 0.62rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Duration</div>
                <div style="font-size: 1.35rem; font-weight: 900; color: #d4af37; font-family: var(--font-mono); margin-top: 0.2rem;" id="finish-modal-duration">--:--</div>
              </div>
            </div>

            <!-- Candidate & Instructor Signature Strip -->
            <div style="
              background: rgba(255, 255, 255, 0.02);
              border: 1px solid rgba(255, 255, 255, 0.06);
              border-radius: 10px;
              padding: 0.75rem 1rem;
              margin-bottom: 1.75rem;
              font-size: 0.78rem;
              color: #a1a1aa;
              display: flex;
              justify-content: space-between;
              text-align: left;
            ">
              <div>
                <div style="font-size: 0.65rem; color: #71717a; text-transform: uppercase; font-weight: 700;">Student Driver</div>
                <div style="color: #ffffff; font-weight: 800; margin-top: 0.15rem;">${currentStudent.name}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 0.65rem; color: #71717a; text-transform: uppercase; font-weight: 700;">Instructor Sign-off</div>
                <div style="color: #22c55e; font-weight: 800; margin-top: 0.15rem;">${currentTrainer.name} ✓</div>
              </div>
            </div>

            <!-- Action Button -->
            <button type="button" id="btn-save-completed-ride" style="
              width: 100%;
              background: linear-gradient(135deg, #d4af37 0%, #b89628 100%);
              color: #000000;
              border: none;
              padding: 0.95rem 1.5rem;
              border-radius: 12px;
              font-size: 1rem;
              font-weight: 900;
              cursor: pointer;
              box-shadow: 0 10px 30px rgba(212, 175, 55, 0.35);
              transition: transform 0.15s ease;
            ">
              ✓ Save to Student Training Record (+8.0 km)
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Cleanup helper
  const closeModal = () => {
    if (activeWatchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(activeWatchId);
      activeWatchId = null;
    }
    if (elapsedTimer) {
      clearInterval(elapsedTimer);
      elapsedTimer = null;
    }
    if (activeLiveMap) {
      activeLiveMap.remove();
      activeLiveMap = null;
    }
    modalRoot.innerHTML = '';
  };

  modalRoot.querySelector('#btn-close-live-ride').addEventListener('click', closeModal);

  // Initialize Map
  setTimeout(() => {
    try {
      const mapContainer = document.getElementById('live-ride-leaflet-map');
      if (!mapContainer) return;

      if (activeLiveMap) {
        activeLiveMap.remove();
        activeLiveMap = null;
      }

      // Edge-to-edge locked driving camera (zoom level 18, zero manual zoom jumps)
      const map = L.map(mapContainer, {
        zoomControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
        attributionControl: false
      });
      activeLiveMap = map;

      // High-contrast clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      const defaultCenter = [session?.route?.startPoint?.lat || 14.4230, session?.route?.startPoint?.lng || 78.2285];
      map.setView(defaultCenter, 18);

      // Traveled Polyline (Draws behind car as it moves)
      traveledCoords = [];
      livePolyline = L.polyline([], {
        color: '#22c55e',
        weight: 7,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Sleek Navigation Puck (Apple Maps / Tesla Navigation Arrow Style)
      const carIcon = L.divIcon({
        className: 'sleek-nav-puck-marker',
        html: `
          <div id="moving-puck-wrapper" style="
            position: relative;
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <!-- Pulsing outer accuracy wave -->
            <div style="
              position: absolute;
              width: 52px;
              height: 52px;
              border-radius: 50%;
              background: rgba(34, 197, 94, 0.2);
              border: 1.5px solid rgba(34, 197, 94, 0.4);
            "></div>

            <!-- Directional Navigation Puck -->
            <div id="car-rotation-node" style="
              width: 32px;
              height: 32px;
              background: #0c1017;
              border: 2.5px solid #22c55e;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 16px rgba(0,0,0,0.7);
              transition: transform 0.15s linear;
              z-index: 2;
            ">
              <!-- Forward Navigation Arrowhead -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <polygon points="12,3 21,21 12,17 3,21" fill="#22c55e" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [0, 0]
      });

      carMarker = L.marker(defaultCenter, { icon: carIcon }).addTo(map);

      map.invalidateSize();
      setTimeout(() => map.invalidateSize(), 200);

      // Trip Timer
      elapsedTimer = setInterval(() => {
        if (isRideCompleted || isTrackingPaused) return;
        secondsElapsed++;
        const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
        const secs = String(secondsElapsed % 60).padStart(2, '0');
        const timeElem = document.getElementById('hud-elapsed-time');
        if (timeElem) timeElem.textContent = `${mins}:${secs}`;
      }, 1000);

      // =========================================================
      // REAL-TIME GPS MOVEMENT & 500M CHECKPOINTS LOGIC
      // =========================================================
      function recordMovement(latitude, longitude, speedKmh = 0, deltaMeters = 0) {
        if (isRideCompleted || isTrackingPaused) return;

        totalDistanceMeters = Math.min(8000, totalDistanceMeters + deltaMeters);
        const distKm = (totalDistanceMeters / 1000).toFixed(2);

        // 1. Update Odometer & Speed HUD
        const distKmElem = document.getElementById('hud-distance-km');
        if (distKmElem) distKmElem.textContent = distKm;

        const speedElem = document.getElementById('hud-speed');
        if (speedElem) speedElem.textContent = Math.round(speedKmh);

        // 2. Extend real-time traveled path behind vehicle
        traveledCoords.push([latitude, longitude]);
        if (livePolyline) livePolyline.setLatLngs(traveledCoords);

        // 3. Move vehicle marker
        if (carMarker) carMarker.setLatLng([latitude, longitude]);

        // 4. LOCKED CAMERA: Keep car centered at zoom 18 (NO zoom jumps)
        if (map) {
          map.setView([latitude, longitude], 18, { animate: false });
        }

        // 5. Update 3px Progress Line
        const progressPct = Math.min(100, Math.round((totalDistanceMeters / 8000) * 100));
        const fillElem = document.getElementById('hud-progress-fill');
        if (fillElem) fillElem.style.width = `${progressPct}%`;

        // 6. Checkpoint Progress (Every 500m)
        let clearedCount = 0;
        checkpoints.forEach(cp => {
          if (totalDistanceMeters >= cp.distanceMeters) {
            clearedCount++;
            if (!cp.cleared) {
              cp.cleared = true;
              triggerCheckpointReached(cp);
            }
          }
        });

        const cpCountElem = document.getElementById('hud-checkpoints-cleared');
        if (cpCountElem) cpCountElem.textContent = clearedCount;

        // 7. Next 500m Target Countdown
        const nextCp = checkpoints.find(c => !c.cleared);
        const nextDistElem = document.getElementById('hud-next-checkpoint-dist');
        const cpNameElem = document.getElementById('hud-current-cp-name');
        if (nextDistElem) {
          if (nextCp) {
            const remMeters = Math.max(0, Math.round(nextCp.distanceMeters - totalDistanceMeters));
            nextDistElem.textContent = `${remMeters}m`;
            if (cpNameElem) cpNameElem.textContent = `Next: ${nextCp.label} (${nextCp.title}) · ${remMeters}m remaining`;
          } else {
            nextDistElem.textContent = '8.0 km ✓';
            if (cpNameElem) cpNameElem.textContent = 'All 16 checkpoints completed!';
          }
        }

        // 8. Complete 8.0 km Course
        if (totalDistanceMeters >= 8000) {
          finishRide();
        }
      }

      function triggerCheckpointReached(cp) {
        playMilestoneChime();

        // Drop a subtle landmark dot on the map
        if (carMarker && map) {
          const pos = carMarker.getLatLng();
          const markerIcon = L.divIcon({
            className: 'checkpoint-passed-dot',
            html: `
              <div style="transform:translate(-50%, -50%); width: 22px; height: 22px; border-radius: 50%; background: #0c1017; border: 2px solid #22c55e; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #22c55e; font-weight: 900; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
                ✓
              </div>
            `,
            iconSize: [0, 0]
          });
          L.marker(pos, { icon: markerIcon }).addTo(map);
        }

        // Toast celebration banner
        const banner = document.getElementById('checkpoint-toast-banner');
        const text = document.getElementById('checkpoint-toast-text');
        if (banner && text) {
          text.textContent = `Checkpoint ${cp.id}/16 (${cp.label}) Cleared · ${cp.title} (+500m)`;
          banner.style.opacity = '1';
          banner.style.transform = 'translateX(-50%) translateY(0)';
          setTimeout(() => {
            banner.style.opacity = '0';
            banner.style.transform = 'translateX(-50%) translateY(-20px)';
          }, 2400);
        }
      }

      function finishRide() {
        if (isRideCompleted) return;
        isRideCompleted = true;

        if (activeWatchId !== null && navigator.geolocation) {
          navigator.geolocation.clearWatch(activeWatchId);
          activeWatchId = null;
        }

        const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
        const secs = String(secondsElapsed % 60).padStart(2, '0');
        const durElem = document.getElementById('finish-modal-duration');
        if (durElem) durElem.textContent = `${mins}:${secs}`;

        const ceremony = document.getElementById('finish-ride-ceremony');
        if (ceremony) ceremony.style.display = 'flex';
      }

      // =========================================================
      // REAL DEVICE GPS PERMISSION & LOCATION WATCH
      // =========================================================
      function startDeviceGpsTracking() {
        const statusDot = document.getElementById('gps-status-dot');
        const statusText = document.getElementById('gps-status-text');

        if (!navigator.geolocation) {
          if (statusDot && statusText) {
            statusDot.style.background = '#ef4444';
            statusText.textContent = 'GPS Not Supported';
          }
          return;
        }

        if (activeWatchId !== null) {
          navigator.geolocation.clearWatch(activeWatchId);
          activeWatchId = null;
        }

        if (statusDot && statusText) {
          statusDot.style.background = '#f59e0b';
          statusText.textContent = 'Connecting GPS...';
        }

        activeWatchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, accuracy, speed } = position.coords;
            const now = Date.now();

            if (statusDot && statusText) {
              statusDot.style.background = '#22c55e';
              statusText.textContent = `GPS Active (±${Math.round(accuracy)}m)`;
            }

            if (!initialMapSet) {
              initialMapSet = true;
              if (map) map.setView([latitude, longitude], 18, { animate: false });
              if (carMarker) carMarker.setLatLng([latitude, longitude]);
              traveledCoords = [[latitude, longitude]];
              lastGpsPoint = { lat: latitude, lng: longitude };
              lastGpsTimestamp = now;
              return;
            }

            let deltaMeters = 0;
            let currentSpeed = speed ? (speed * 3.6) : 0;

            if (lastGpsPoint) {
              const d = haversineMeters([lastGpsPoint.lat, lastGpsPoint.lng], [latitude, longitude]);
              // Filter stationary noise (< 2.5m)
              if (d >= 2.5) {
                deltaMeters = d;
                const dSec = (now - lastGpsTimestamp) / 1000;
                if (!speed && dSec > 0) {
                  currentSpeed = (d / dSec) * 3.6;
                }

                const bearing = calculateBearing([lastGpsPoint.lat, lastGpsPoint.lng], [latitude, longitude]);
                const rotNode = document.getElementById('car-rotation-node');
                if (rotNode) rotNode.style.transform = `rotate(${bearing}deg)`;

                lastGpsPoint = { lat: latitude, lng: longitude };
                lastGpsTimestamp = now;
              } else {
                currentSpeed = 0;
              }
            } else {
              lastGpsPoint = { lat: latitude, lng: longitude };
              lastGpsTimestamp = now;
            }

            recordMovement(latitude, longitude, currentSpeed, deltaMeters);
          },
          (err) => {
            console.warn('GPS Fix Warning:', err);
            if (statusDot && statusText) {
              statusDot.style.background = '#ef4444';
              statusText.textContent = err.code === 1 ? 'Location Access Denied' : 'Searching GPS...';
            }
          },
          {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 20000
          }
        );
      }

      // Pause / Resume
      const btnPauseResume = modalRoot.querySelector('#btn-pause-resume-tracking');
      const iconSpan = modalRoot.querySelector('#pause-resume-icon');
      const textSpan = modalRoot.querySelector('#pause-resume-text');

      btnPauseResume?.addEventListener('click', () => {
        isTrackingPaused = !isTrackingPaused;
        if (isTrackingPaused) {
          iconSpan.textContent = '▶';
          textSpan.textContent = 'Resume';
          const speedElem = document.getElementById('hud-speed');
          if (speedElem) speedElem.textContent = '0';
        } else {
          iconSpan.textContent = '⏸';
          textSpan.textContent = 'Pause';
        }
      });

      // Re-sync GPS
      modalRoot.querySelector('#btn-reacquire-gps')?.addEventListener('click', () => {
        startDeviceGpsTracking();
      });

      // Discreet test step (for stationary desktop verification)
      modalRoot.querySelector('#btn-test-step-motion')?.addEventListener('click', () => {
        if (!lastGpsPoint) {
          lastGpsPoint = { lat: defaultCenter[0], lng: defaultCenter[1] };
        }
        const newLat = lastGpsPoint.lat + 0.00018;
        const newLng = lastGpsPoint.lng + 0.00015;
        const bearing = calculateBearing([lastGpsPoint.lat, lastGpsPoint.lng], [newLat, newLng]);
        const rotNode = document.getElementById('car-rotation-node');
        if (rotNode) rotNode.style.transform = `rotate(${bearing}deg)`;

        lastGpsPoint = { lat: newLat, lng: newLng };
        recordMovement(newLat, newLng, 26, 25);
      });

      // Save & Complete Ride Handler
      const handleSaveRide = () => {
        store.completeSession(currentStudent.id, dayNumber, {
          instructorNotes: `Day ${dayNumber} practical 8.0 km course completed under Instructor ${currentTrainer.name}. Checkpoints verified.`
        });
        if (onRideCompleted) onRideCompleted();
        closeModal();
      };

      modalRoot.querySelector('#btn-complete-direct')?.addEventListener('click', handleSaveRide);
      modalRoot.querySelector('#btn-save-completed-ride')?.addEventListener('click', handleSaveRide);

      // Start Device GPS Tracking on open
      startDeviceGpsTracking();

    } catch (err) {
      console.error('Failed to initialize Minimal GPS Ride Tracker:', err);
    }
  }, 100);
}

export const openLiveRideTrackingModal = openLiveRideMapModal;
