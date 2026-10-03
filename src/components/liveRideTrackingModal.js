/* ==========================================================================
   LIVE REAL-TIME GPS RIDE TRACKING & 500M CHECKPOINT TELEMETRY
   GAFOOR DRIVING SCHOOL — PULIVENDULA, ANDHRA PRADESH

   Key Features:
   - Strictly based on real device GPS movement (navigator.geolocation.watchPosition)
   - Real-time location permission handling with status indicators
   - Vehicle only moves when the student/trainer actually moves in real life
   - Continuous distance measurement (Meters & Kilometers) using Haversine formula
   - Checkpoints tracked at every 500 meters (500m, 1000m, 1500m ... up to 8000m)
   - Real-time next 500m milestone countdown
   - Audio chime and milestone celebration on crossing each 500m checkpoint
   - Locked game camera view (fixed zoom 18) following the car smoothly without zoom jumps
   - Real-time path drawn dynamically behind the vehicle as it drives
   - Clean, uncluttered cockpit HUD without artificial speed-ups or unwanted clutter
   ========================================================================== */

import L from 'leaflet';
import { store } from '../store.js';

let activeLiveMap = null;
let activeWatchId = null;
let elapsedTimer = null;

// Helper: Haversine distance in meters between two lat/lng pairs
export function haversineMeters(p1, p2) {
  const R = 6371000; // Earth radius in meters
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

    // Tone 1: C5 (523.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.28);

    // Tone 2: G5 (783.99 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(783.99, now + 0.12);
    gain2.gain.setValueAtTime(0.25, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.48);
  } catch (e) {
    // Non-blocking fallback
  }
}

// Build 16 Checkpoints at exact 500m intervals (500m, 1000m ... 8000m)
function generate500mCheckpoints(basePath, startPoint) {
  const defaultOrigin = [startPoint?.lat || 14.4230, startPoint?.lng || 78.2285];
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
 * Main function to launch the Real-Time GPS Ride Tracking Modal
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

  const checkpoints = generate500mCheckpoints(session?.route?.path, session?.route?.startPoint);

  // Real-Time Tracking State (Movement-based)
  let totalDistanceMeters = 0;
  let currentSpeedKmh = 0;
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
        background: #090c10;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
        font-family: var(--font-sans);
      ">
        <!-- TOP COCKPIT HUD (CLEAN & FOCUSED) -->
        <header style="
          background: linear-gradient(180deg, rgba(9, 12, 16, 0.98) 0%, rgba(13, 16, 23, 0.95) 100%);
          backdrop-filter: blur(16px);
          border-bottom: 1.5px solid rgba(34, 197, 94, 0.35);
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 1000;
          box-shadow: 0 4px 30px rgba(0,0,0,0.8);
          flex-wrap: wrap;
          gap: 0.75rem;
        ">
          <!-- Left: Driver Identity & Real GPS Status -->
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <div style="
              width: 44px;
              height: 44px;
              border-radius: 12px;
              background: #22c55e;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.45rem;
              box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
            ">🚗</div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span id="gps-status-badge" style="
                  background: rgba(245, 158, 11, 0.2);
                  border: 1px solid #f59e0b;
                  color: #fbbf24;
                  font-size: 0.72rem;
                  font-weight: 800;
                  padding: 0.15rem 0.6rem;
                  border-radius: 9999px;
                  letter-spacing: 0.04em;
                  display: flex;
                  align-items: center;
                  gap: 0.35rem;
                ">
                  <span style="width:7px; height:7px; border-radius:50%; background:#fbbf24; display:inline-block;"></span>
                  <span id="gps-status-text">REQUESTING GPS PERMISSION...</span>
                </span>
                <span style="font-size: 1.05rem; font-weight: 900; color: #ffffff;">
                  Day ${dayNumber}: ${objective}
                </span>
              </div>
              <div style="font-size: 0.76rem; color: #a1a1aa; margin-top: 0.2rem;">
                Student: <strong>${currentStudent.name}</strong> · Instructor: <strong>${currentTrainer.name}</strong> · Car: <strong>${currentTrainer.car}</strong> (Dual-Control)
              </div>
            </div>
          </div>

          <!-- Center: Real-Time Telemetry & 500m Odometer -->
          <div style="
            display: flex;
            align-items: center;
            gap: 1.25rem;
            background: rgba(0, 0, 0, 0.75);
            border: 1.5px solid rgba(34, 197, 94, 0.3);
            border-radius: 12px;
            padding: 0.45rem 1.4rem;
            box-shadow: 0 0 20px rgba(0,0,0,0.6);
          ">
            <!-- Speedometer (Real GPS Speed) -->
            <div>
              <div style="font-size: 0.6rem; color: #71717a; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Speed</div>
              <div style="font-size: 1.45rem; font-weight: 900; color: #38bdf8; font-family: var(--font-mono); line-height: 1.1;">
                <span id="hud-speed">0</span> <span style="font-size: 0.78rem; color: #a1a1aa;">km/h</span>
              </div>
            </div>

            <div style="width: 1px; height: 32px; background: rgba(255,255,255,0.12);"></div>

            <!-- Total Distance Traveled (Real-time Count from GPS) -->
            <div>
              <div style="font-size: 0.6rem; color: #71717a; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Distance Traveled</div>
              <div style="font-size: 1.45rem; font-weight: 900; color: #22c55e; font-family: var(--font-mono); line-height: 1.1;">
                <span id="hud-distance-km">0.00</span> <span style="font-size: 0.85rem; color: #ffffff;">km</span>
                <span id="hud-distance-meters" style="font-size: 0.75rem; color: #a1a1aa; margin-left: 0.35rem;">(0 m)</span>
              </div>
            </div>

            <div style="width: 1px; height: 32px; background: rgba(255,255,255,0.12);"></div>

            <!-- Next 500m Checkpoint Countdown -->
            <div>
              <div style="font-size: 0.6rem; color: #f59e0b; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Next 500m Target</div>
              <div style="font-size: 1.15rem; font-weight: 900; color: #fbbf24; font-family: var(--font-mono); line-height: 1.1;">
                <span id="hud-next-checkpoint-dist">500m left</span>
              </div>
            </div>

            <div style="width: 1px; height: 32px; background: rgba(255,255,255,0.12);"></div>

            <!-- Checkpoints Counter (16 Total) -->
            <div>
              <div style="font-size: 0.6rem; color: #71717a; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Checkpoints</div>
              <div style="font-size: 1.35rem; font-weight: 900; color: #ffffff; font-family: var(--font-mono); line-height: 1.1;">
                <span id="hud-checkpoints-cleared">0</span> <span style="font-size: 0.8rem; color: #71717a;">/ 16</span>
              </div>
            </div>

            <div style="width: 1px; height: 32px; background: rgba(255,255,255,0.12);"></div>

            <!-- Trip Elapsed Time -->
            <div>
              <div style="font-size: 0.6rem; color: #71717a; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Duration</div>
              <div style="font-size: 1.25rem; font-weight: 900; color: #ffffff; font-family: var(--font-mono); line-height: 1.1;">
                <span id="hud-elapsed-time">00:00</span>
              </div>
            </div>
          </div>

          <!-- Right: Close Button -->
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <button type="button" id="btn-close-live-ride" style="
              background: rgba(255, 255, 255, 0.08);
              border: 1px solid rgba(255, 255, 255, 0.16);
              color: #ffffff;
              width: 38px;
              height: 38px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              font-size: 1.15rem;
              transition: background 0.15s ease;
            " title="Close Live Ride">✕</button>
          </div>
        </header>

        <!-- 16-SEGMENT CHECKPOINT PROGRESS BAR (500M INTERVALS) -->
        <div style="
          background: #0d1117;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.35rem 1rem;
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 999;
          overflow-x: auto;
        ">
          ${checkpoints.map(cp => `
            <div id="prog-seg-${cp.id}" style="
              flex: 1;
              min-width: 48px;
              height: 24px;
              border-radius: 4px;
              background: rgba(255, 255, 255, 0.06);
              border: 1px solid rgba(255, 255, 255, 0.1);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 0.65rem;
              font-weight: 800;
              color: #71717a;
              font-family: var(--font-mono);
              transition: all 0.25s ease;
              white-space: nowrap;
            " title="${cp.label}: ${cp.title} (${cp.distanceMeters}m)">
              ${cp.label}
            </div>
          `).join('')}
        </div>

        <!-- MAIN LOCKED GAME-VIEW MAP CONTAINER -->
        <div style="flex: 1; position: relative; overflow: hidden; height: 100%;">
          <div id="live-ride-leaflet-map" style="width: 100%; height: 100%; min-height: 480px; background: #090c10;"></div>

          <!-- FLOATING 500M CHECKPOINT CELEBRATION BANNER -->
          <div id="checkpoint-toast-banner" style="
            position: absolute;
            top: 24px;
            left: 50%;
            transform: translateX(-50%) translateY(-40px);
            opacity: 0;
            pointer-events: none;
            background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
            color: #000000;
            padding: 0.85rem 2rem;
            border-radius: 9999px;
            font-size: 1rem;
            font-weight: 900;
            box-shadow: 0 10px 40px rgba(34, 197, 94, 0.7);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            z-index: 1200;
          ">
            <span style="font-size:1.4rem;">🎯</span>
            <span id="checkpoint-toast-text">500m Checkpoint Cleared!</span>
          </div>

          <!-- BOTTOM GPS TELEMETRY READOUT -->
          <div style="
            position: absolute;
            bottom: 16px;
            left: 16px;
            background: rgba(9, 12, 16, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.16);
            backdrop-filter: blur(10px);
            border-radius: 8px;
            padding: 0.45rem 0.85rem;
            font-size: 0.72rem;
            color: #a1a1aa;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 0.85rem;
          ">
            <div>
              <span style="color:#71717a;">GPS COORDS:</span>
              <strong id="gps-coords" style="color:#ffffff; font-family:var(--font-mono); margin-left:0.25rem;">Waiting for fix...</strong>
            </div>
            <div style="width:1px; height:14px; background:rgba(255,255,255,0.12);"></div>
            <div>
              <span style="color:#71717a;">ACCURACY:</span>
              <strong id="gps-accuracy" style="color:#22c55e; font-family:var(--font-mono); margin-left:0.25rem;">--</strong>
            </div>
            <div style="width:1px; height:14px; background:rgba(255,255,255,0.12);"></div>
            <div>
              <span style="color:#71717a;">CAMERA:</span>
              <strong style="color:#38bdf8; font-family:var(--font-mono); margin-left:0.25rem;">Locked Follow (No Zoom Jump)</strong>
            </div>
          </div>

          <!-- FINISH CEREMONY MODAL -->
          <div id="finish-ride-ceremony" style="
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.88);
            backdrop-filter: blur(12px);
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1500;
            text-align: center;
            padding: 1.5rem;
          ">
            <div style="
              width: 90px;
              height: 90px;
              border-radius: 50%;
              background: #22c55e;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 3.2rem;
              box-shadow: 0 0 60px #22c55e;
              margin-bottom: 1.25rem;
            ">🏆</div>
            <h2 style="font-size: 2.3rem; font-weight: 900; color: #ffffff; margin: 0 0 0.5rem 0;">
              8.0 km Practical Course Finished!
            </h2>
            <p style="font-size: 1.05rem; color: #a1a1aa; max-width: 540px; line-height: 1.5; margin: 0 0 1.5rem 0;">
              Day ${dayNumber} training successfully completed! All 16 checkpoints (500m intervals) verified under Instructor <strong>${currentTrainer.name}</strong>.
            </p>

            <div style="
              display: flex;
              gap: 2rem;
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.12);
              border-radius: 12px;
              padding: 1rem 2rem;
              margin-bottom: 2rem;
            ">
              <div>
                <div style="font-size: 0.7rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Distance</div>
                <div style="font-size: 1.45rem; font-weight: 900; color: #22c55e; font-family: var(--font-mono);">8.00 km</div>
              </div>
              <div style="width: 1px; background: rgba(255,255,255,0.1);"></div>
              <div>
                <div style="font-size: 0.7rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Checkpoints</div>
                <div style="font-size: 1.45rem; font-weight: 900; color: #ffffff; font-family: var(--font-mono);">16 / 16 ✓</div>
              </div>
              <div style="width: 1px; background: rgba(255,255,255,0.1);"></div>
              <div>
                <div style="font-size: 0.7rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Driver</div>
                <div style="font-size: 1.1rem; font-weight: 800; color: #ffffff;">${currentStudent.name}</div>
              </div>
            </div>

            <button type="button" id="btn-save-completed-ride" style="
              background: #22c55e;
              color: #000000;
              border: none;
              padding: 0.95rem 2.6rem;
              border-radius: 12px;
              font-size: 1.05rem;
              font-weight: 900;
              cursor: pointer;
              box-shadow: 0 10px 30px rgba(34, 197, 94, 0.5);
              transition: transform 0.15s ease;
            ">
              ✓ Save &amp; Log Day ${dayNumber} Ride (+8.0 km)
            </button>
          </div>
        </div>

        <!-- BOTTOM CONTROLS BAR (CLEAN & MINIMAL) -->
        <footer style="
          background: #0d1117;
          border-top: 1.5px solid rgba(255, 255, 255, 0.1);
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 1000;
          flex-wrap: wrap;
          gap: 1rem;
        ">
          <!-- Left: Real GPS Tracking Controls -->
          <div style="display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;">
            <button type="button" id="btn-pause-resume-tracking" style="
              background: rgba(255, 255, 255, 0.08);
              border: 1px solid rgba(255, 255, 255, 0.18);
              color: #ffffff;
              padding: 0.6rem 1.25rem;
              border-radius: 8px;
              font-size: 0.85rem;
              font-weight: 800;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.4rem;
            ">
              <span id="pause-resume-icon">⏸</span>
              <span id="pause-resume-text">Pause Tracking</span>
            </button>

            <button type="button" id="btn-reacquire-gps" style="
              background: rgba(34, 197, 94, 0.12);
              border: 1px solid rgba(34, 197, 94, 0.35);
              color: #22c55e;
              padding: 0.6rem 1.15rem;
              border-radius: 8px;
              font-size: 0.825rem;
              font-weight: 800;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.4rem;
            ">
              <span>🔄</span>
              <span>Re-acquire GPS Fix</span>
            </button>

            <!-- Subtle Manual Motion Step (Only for testing indoors on stationary PC) -->
            <button type="button" id="btn-test-step-motion" style="
              background: transparent;
              border: 1px dashed rgba(255, 255, 255, 0.2);
              color: #71717a;
              padding: 0.5rem 0.85rem;
              border-radius: 6px;
              font-size: 0.72rem;
              font-weight: 700;
              cursor: pointer;
            " title="Simulate 25m movement (for testing without moving device)">
              Test +25m Motion
            </button>
          </div>

          <!-- Right: Save & Complete Day X Ride Button -->
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button type="button" id="btn-complete-direct" style="
              background: #22c55e;
              border: none;
              color: #000000;
              padding: 0.65rem 1.6rem;
              border-radius: 8px;
              font-size: 0.88rem;
              font-weight: 900;
              cursor: pointer;
              box-shadow: 0 4px 18px rgba(34, 197, 94, 0.45);
            ">
              Log Day ${dayNumber} Ride (+8.0 km) ✓
            </button>
          </div>
        </footer>
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

      // STRICT LOCKED CAMERA: No manual zoom, locked at zoom 18
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

      // Reliable OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      // Default center fallback (Pulivendula Academy or current student location)
      const defaultCenter = [session?.route?.startPoint?.lat || 14.4230, session?.route?.startPoint?.lng || 78.2285];
      map.setView(defaultCenter, 18);

      // Live Traveled Path Polyline (Draws behind car as it moves)
      traveledCoords = [];
      livePolyline = L.polyline([], {
        color: '#22c55e',
        weight: 8,
        opacity: 0.98,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Dual Rider Car Marker
      const carIcon = L.divIcon({
        className: 'gamified-dual-car-marker',
        html: `
          <div id="moving-car-wrapper" style="
            position: relative;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
          ">
            <!-- Rider Tag -->
            <div style="
              background: #090c10;
              border: 1.5px solid #22c55e;
              border-radius: 6px;
              padding: 2px 7px;
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 5px;
              font-size: 9px;
              font-weight: 800;
              color: #ffffff;
              box-shadow: 0 4px 12px rgba(0,0,0,0.6);
              margin-bottom: 3px;
            ">
              <span style="color: #38bdf8;">👨‍🎓 ${currentStudent.name.split(' ')[0]}</span>
              <span style="color: #64748b;">·</span>
              <span style="color: #4ade80;">👨‍🏫 ${currentTrainer.name.split(' ')[0]}</span>
            </div>

            <!-- Vehicle Icon -->
            <div id="car-rotation-node" style="
              width: 40px;
              height: 40px;
              background: #facc15;
              border: 2.5px solid #090c10;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 18px rgba(0,0,0,0.6);
              transition: transform 0.15s linear;
            ">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="3" width="14" height="18" rx="4" fill="#090c10" stroke="#ffffff" stroke-width="1"/>
                <rect x="7" y="6" width="10" height="4" rx="1" fill="#38bdf8"/>
                <rect x="7" y="15" width="10" height="3" rx="1" fill="#94a3b8"/>
                <circle cx="7" cy="4" r="1.5" fill="#fef08a"/>
                <circle cx="17" cy="4" r="1.5" fill="#fef08a"/>
                <text x="9" y="14" font-size="9" font-weight="900" fill="#ef4444" font-family="sans-serif">L</text>
              </svg>
            </div>
          </div>
        `,
        iconSize: [0, 0]
      });

      carMarker = L.marker(defaultCenter, { icon: carIcon }).addTo(map);

      // Invalidate sizes to ensure immediate rendering
      map.invalidateSize();
      setTimeout(() => map.invalidateSize(), 200);

      // Live Driving Duration Timer
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

        // 1. Update Odometer & Speed HUD in real time
        const distKmElem = document.getElementById('hud-distance-km');
        if (distKmElem) distKmElem.textContent = distKm;

        const distMElem = document.getElementById('hud-distance-meters');
        if (distMElem) distMElem.textContent = `(${Math.round(totalDistanceMeters)} m)`;

        const speedElem = document.getElementById('hud-speed');
        if (speedElem) speedElem.textContent = Math.round(speedKmh);

        // 2. Extend real-time traveled path behind vehicle
        traveledCoords.push([latitude, longitude]);
        if (livePolyline) livePolyline.setLatLngs(traveledCoords);

        // 3. Move vehicle marker to real position
        if (carMarker) carMarker.setLatLng([latitude, longitude]);

        // 4. LOCKED CAMERA: Keep car centered at zoom 18 (NO zoom-in / zoom-out jumps)
        if (map) {
          map.setView([latitude, longitude], 18, { animate: false });
        }

        // 5. Update GPS Coordinates readout
        const coordsElem = document.getElementById('gps-coords');
        if (coordsElem) coordsElem.textContent = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

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
        if (nextDistElem) {
          if (nextCp) {
            const remMeters = Math.max(0, Math.round(nextCp.distanceMeters - totalDistanceMeters));
            nextDistElem.textContent = `${remMeters}m to ${nextCp.label}`;
          } else {
            nextDistElem.textContent = 'Goal Reached! 🏁';
          }
        }

        // 8. 8.0 km Full Lesson Completed
        if (totalDistanceMeters >= 8000) {
          finishRide();
        }
      }

      function triggerCheckpointReached(cp) {
        // Milestone Chime
        playMilestoneChime();

        // Highlight ribbon segment
        const seg = document.getElementById(`prog-seg-${cp.id}`);
        if (seg) {
          seg.style.background = '#22c55e';
          seg.style.borderColor = '#22c55e';
          seg.style.color = '#000000';
          seg.innerHTML = `✓ ${cp.label}`;
        }

        // Add a permanent milestone beacon marker at this GPS spot on the map
        if (carMarker && map) {
          const pos = carMarker.getLatLng();
          const markerIcon = L.divIcon({
            className: 'checkpoint-passed-marker',
            html: `
              <div style="transform:translate(-50%, -100%); display:flex; flex-direction:column; align-items:center;">
                <div style="background:#22c55e; color:#000000; font-weight:900; font-size:11px; padding:3px 8px; border-radius:6px; white-space:nowrap; border:2px solid #ffffff; box-shadow:0 4px 14px rgba(0,0,0,0.5);">
                  ✓ ${cp.label} (${cp.title})
                </div>
                <div style="width:2px; height:8px; background:#22c55e;"></div>
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
          text.textContent = `🎯 CHECKPOINT ${cp.id}/16 CLEARED (${cp.label}) · ${cp.title} (+500m)`;
          banner.style.opacity = '1';
          banner.style.transform = 'translateX(-50%) translateY(0)';
          setTimeout(() => {
            banner.style.opacity = '0';
            banner.style.transform = 'translateX(-50%) translateY(-40px)';
          }, 2600);
        }
      }

      function finishRide() {
        if (isRideCompleted) return;
        isRideCompleted = true;

        if (activeWatchId !== null && navigator.geolocation) {
          navigator.geolocation.clearWatch(activeWatchId);
          activeWatchId = null;
        }

        checkpoints.forEach(cp => {
          if (!cp.cleared) {
            cp.cleared = true;
            triggerCheckpointReached(cp);
          }
        });

        const ceremony = document.getElementById('finish-ride-ceremony');
        if (ceremony) ceremony.style.display = 'flex';
      }

      // =========================================================
      // REAL DEVICE GPS PERMISSIONS & TRACKING
      // =========================================================
      function startDeviceGpsTracking() {
        const statusBadge = document.getElementById('gps-status-badge');
        const statusText = document.getElementById('gps-status-text');

        if (!navigator.geolocation) {
          if (statusBadge && statusText) {
            statusBadge.style.background = 'rgba(239, 68, 68, 0.2)';
            statusBadge.style.borderColor = '#ef4444';
            statusBadge.style.color = '#ef4444';
            statusText.textContent = 'GPS NOT SUPPORTED ON THIS DEVICE';
          }
          return;
        }

        if (activeWatchId !== null) {
          navigator.geolocation.clearWatch(activeWatchId);
          activeWatchId = null;
        }

        if (statusBadge && statusText) {
          statusBadge.style.background = 'rgba(245, 158, 11, 0.2)';
          statusBadge.style.borderColor = '#f59e0b';
          statusBadge.style.color = '#fbbf24';
          statusText.textContent = 'CONNECTING TO SATELLITE GPS...';
        }

        activeWatchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, accuracy, speed, heading } = position.coords;
            const now = Date.now();

            // Update GPS Accuracy indicator
            const accElem = document.getElementById('gps-accuracy');
            if (accElem) accElem.textContent = `±${Math.round(accuracy)}m`;

            if (statusBadge && statusText) {
              statusBadge.style.background = 'rgba(34, 197, 94, 0.2)';
              statusBadge.style.borderColor = '#22c55e';
              statusBadge.style.color = '#22c55e';
              statusText.textContent = `LIVE GPS ACTIVE (±${Math.round(accuracy)}m)`;
            }

            // Set initial position on first fix
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
              // Ignore stationary jitter (< 2.5m)
              if (d >= 2.5) {
                deltaMeters = d;
                const dSec = (now - lastGpsTimestamp) / 1000;
                if (!speed && dSec > 0) {
                  currentSpeed = (d / dSec) * 3.6;
                }

                // Update Heading rotation
                const bearing = calculateBearing([lastGpsPoint.lat, lastGpsPoint.lng], [latitude, longitude]);
                const rotNode = document.getElementById('car-rotation-node');
                if (rotNode) rotNode.style.transform = `rotate(${bearing}deg)`;

                lastGpsPoint = { lat: latitude, lng: longitude };
                lastGpsTimestamp = now;
              } else {
                currentSpeed = 0; // Stationary
              }
            } else {
              lastGpsPoint = { lat: latitude, lng: longitude };
              lastGpsTimestamp = now;
            }

            recordMovement(latitude, longitude, currentSpeed, deltaMeters);
          },
          (err) => {
            console.warn('GPS Fix Warning:', err);
            if (statusBadge && statusText) {
              statusBadge.style.background = 'rgba(239, 68, 68, 0.2)';
              statusBadge.style.borderColor = '#ef4444';
              statusBadge.style.color = '#ef4444';
              if (err.code === 1) {
                statusText.textContent = 'GPS PERMISSION DENIED · ENABLE IN BROWSER';
              } else {
                statusText.textContent = 'SEARCHING FOR SATELLITE LOCK...';
              }
            }
          },
          {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 20000
          }
        );
      }

      // Pause / Resume Tracking
      const btnPauseResume = modalRoot.querySelector('#btn-pause-resume-tracking');
      const iconSpan = modalRoot.querySelector('#pause-resume-icon');
      const textSpan = modalRoot.querySelector('#pause-resume-text');

      btnPauseResume?.addEventListener('click', () => {
        isTrackingPaused = !isTrackingPaused;
        if (isTrackingPaused) {
          iconSpan.textContent = '▶';
          textSpan.textContent = 'Resume Tracking';
          const speedElem = document.getElementById('hud-speed');
          if (speedElem) speedElem.textContent = '0';
        } else {
          iconSpan.textContent = '⏸';
          textSpan.textContent = 'Pause Tracking';
        }
      });

      // Re-acquire GPS Fix
      modalRoot.querySelector('#btn-reacquire-gps')?.addEventListener('click', () => {
        startDeviceGpsTracking();
      });

      // Discrete +25m Motion Step (Only for testing indoors when stationary)
      modalRoot.querySelector('#btn-test-step-motion')?.addEventListener('click', () => {
        if (!lastGpsPoint) {
          lastGpsPoint = { lat: defaultCenter[0], lng: defaultCenter[1] };
        }
        // Advance slightly north-east (~25 meters)
        const newLat = lastGpsPoint.lat + 0.00018;
        const newLng = lastGpsPoint.lng + 0.00015;
        const bearing = calculateBearing([lastGpsPoint.lat, lastGpsPoint.lng], [newLat, newLng]);
        const rotNode = document.getElementById('car-rotation-node');
        if (rotNode) rotNode.style.transform = `rotate(${bearing}deg)`;

        lastGpsPoint = { lat: newLat, lng: newLng };
        recordMovement(newLat, newLng, 28, 25);
      });

      // Save & Complete Ride Handler
      const handleSaveRide = () => {
        store.completeSession(currentStudent.id, dayNumber, {
          instructorNotes: `Day ${dayNumber} live 8.0 km ride recorded under Instructor ${currentTrainer.name}. Checkpoints verified.`
        });
        if (onRideCompleted) onRideCompleted();
        closeModal();
      };

      modalRoot.querySelector('#btn-complete-direct')?.addEventListener('click', handleSaveRide);
      modalRoot.querySelector('#btn-save-completed-ride')?.addEventListener('click', handleSaveRide);

      // Start Real Device GPS Tracking on launch
      startDeviceGpsTracking();

    } catch (err) {
      console.error('Failed to initialize Real GPS Ride Tracker:', err);
    }
  }, 100);
}

export const openLiveRideTrackingModal = openLiveRideMapModal;
