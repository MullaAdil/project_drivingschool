/* ==========================================================================
   GAME-STYLE LIVE GPS RIDE TRACKING & REAL-TIME 500M TELEMETRY HUD
   GAFOOR DRIVING SCHOOL — PULIVENDULA, ANDHRA PRADESH

   User Requirements:
   - NO zoom-in / zoom-out camera jumps; locked fixed game driving camera (zoom 18)
   - Dynamic real-time path drawing behind the vehicle as it drives
   - Continuous real-time distance counting (meter by meter & kilometer)
   - 16 Checkpoints every 500 meters (500m, 1000m, ... 8000m)
   - Dynamic 500m segment progress bar with countdown to next 500m milestone
   - Audio Chime on each 500m checkpoint reached (Web Audio API)
   - Real Device GPS Tracking (navigator.geolocation.watchPosition)
   - 1-Click Game Simulator mode (Play/Pause, 1x/2x/5x/10x, +500m jump)
   - Instant state logging to store and Supabase (+8.0 km logged)
   ========================================================================== */

import L from 'leaflet';
import { store } from '../store.js';

let activeLiveMap = null;
let activeWatchId = null;
let simulationTimer = null;
let elapsedTimer = null;

// Helper: Haversine distance in meters
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

// Web Audio API Milestone Chime (500m checkpoint celebration)
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

// Build fine-grained road points (500 steps for ultra-smooth game movement)
function buildGameTrack(basePath, startPoint, endPoint) {
  let rawPoints = basePath && basePath.length >= 2 ? basePath : [
    [startPoint?.lat || 14.4230, startPoint?.lng || 78.2285],
    [14.4255, 78.2315],
    [14.4290, 78.2360],
    [14.4330, 78.2395],
    [14.4380, 78.2430],
    [14.4410, 78.2480],
    [14.4360, 78.2520],
    [14.4310, 78.2550],
    [14.4260, 78.2510],
    [14.4210, 78.2450],
    [14.4170, 78.2400],
    [14.4140, 78.2340],
    [14.4180, 78.2290],
    [14.4210, 78.2260],
    [14.4230, 78.2285],
    [endPoint?.lat || 14.4312, endPoint?.lng || 78.2361]
  ];

  const TOTAL_STEPS = 500; // Ultra smooth game animation
  const TOTAL_METERS = 8000; // 8.0 km total course target
  const track = [];

  const segmentDists = [0];
  let accumulated = 0;
  for (let i = 0; i < rawPoints.length - 1; i++) {
    const d = haversineMeters(rawPoints[i], rawPoints[i + 1]);
    accumulated += d;
    segmentDists.push(accumulated);
  }

  for (let step = 0; step <= TOTAL_STEPS; step++) {
    const targetDist = (step / TOTAL_STEPS) * accumulated;
    let segIdx = 0;
    for (let i = 0; i < segmentDists.length - 1; i++) {
      if (targetDist >= segmentDists[i] && targetDist <= segmentDists[i + 1]) {
        segIdx = i;
        break;
      }
    }
    const segStartDist = segmentDists[segIdx];
    const segEndDist = segmentDists[segIdx + 1] || (segStartDist + 1);
    const segSpan = segEndDist - segStartDist;
    const factor = segSpan > 0 ? (targetDist - segStartDist) / segSpan : 0;

    const pA = rawPoints[segIdx];
    const pB = rawPoints[Math.min(segIdx + 1, rawPoints.length - 1)];

    const lat = pA[0] + (pB[0] - pA[0]) * factor;
    const lng = pA[1] + (pB[1] - pA[1]) * factor;
    const distanceMeters = Math.round((step / TOTAL_STEPS) * TOTAL_METERS);

    track.push({
      step,
      lat,
      lng,
      distanceMeters,
      distanceKm: (distanceMeters / 1000).toFixed(2)
    });
  }

  // 16 Checkpoints at exact 500m intervals (500m, 1000m, 1500m ... up to 8000m)
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
    const closest = track.reduce((prev, curr) => 
      Math.abs(curr.distanceMeters - targetM) < Math.abs(prev.distanceMeters - targetM) ? curr : prev
    );
    const meta = checkpointLabels[i - 1] || { title: `Checkpoint ${i}`, place: 'Pulivendula Sector' };

    checkpoints.push({
      id: i,
      name: `Checkpoint ${i}`,
      label: `${(targetM / 1000).toFixed(1)} km`,
      distanceMeters: targetM,
      distanceKm: (targetM / 1000).toFixed(1),
      title: meta.title,
      place: meta.place,
      lat: closest.lat,
      lng: closest.lng,
      cleared: false
    });
  }

  return { track, checkpoints };
}

/**
 * Main function to launch the Live Game-Style Ride Tracker Modal
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

  const { track, checkpoints } = buildGameTrack(
    session?.route?.path,
    session?.route?.startPoint,
    session?.route?.endPoint
  );

  // Runtime Tracking State
  let activeMode = 'simulator'; // default to simulator so it immediately moves like a game on launch
  let totalDistanceMeters = 0;
  let currentSpeedKmh = 32;
  let secondsElapsed = 0;
  let lastGpsPoint = null;
  let lastGpsTime = null;
  let isRideCompleted = false;

  // Simulator Runtime
  let simStep = 0;
  let isSimPlaying = true;
  let simSpeedMultiplier = 2; // default comfortable driving pace

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
        <!-- TOP ARCADE DRIVING COCKPIT HUD -->
        <header style="
          background: linear-gradient(180deg, rgba(9, 12, 16, 0.98) 0%, rgba(13, 16, 23, 0.95) 100%);
          backdrop-filter: blur(16px);
          border-bottom: 1.5px solid rgba(34, 197, 94, 0.35);
          padding: 0.65rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 1000;
          box-shadow: 0 4px 30px rgba(0,0,0,0.8);
          flex-wrap: wrap;
          gap: 0.75rem;
        ">
          <!-- Left: Driver Identity & Live Mode -->
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <div style="
              width: 46px;
              height: 46px;
              border-radius: 12px;
              background: #22c55e;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.5rem;
              box-shadow: 0 0 24px rgba(34, 197, 94, 0.6);
            ">🏎️</div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span id="gps-status-badge" style="
                  background: rgba(34, 197, 94, 0.2);
                  border: 1px solid #22c55e;
                  color: #22c55e;
                  font-size: 0.7rem;
                  font-weight: 800;
                  padding: 0.15rem 0.55rem;
                  border-radius: 9999px;
                  letter-spacing: 0.04em;
                  display: flex;
                  align-items: center;
                  gap: 0.35rem;
                ">
                  <span style="width:7px; height:7px; border-radius:50%; background:#22c55e; box-shadow:0 0 8px #22c55e; display:inline-block;"></span>
                  <span id="gps-status-text">GAME DRIVE ACTIVE · 500M TRACKING</span>
                </span>
                <span style="font-size: 1.05rem; font-weight: 900; color: #ffffff;">
                  Day ${dayNumber}: ${objective}
                </span>
              </div>
              <div style="font-size: 0.76rem; color: #a1a1aa; margin-top: 0.2rem;">
                👨‍🎓 <strong>${currentStudent.name}</strong> (Driver) · 👨‍🏫 <strong>${currentTrainer.name}</strong> (Dual-Control) · Fleet: <strong>${currentTrainer.car}</strong>
              </div>
            </div>
          </div>

          <!-- Center: Dynamic Game Telemetry & 500m Odometer -->
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
            <!-- Speedometer -->
            <div>
              <div style="font-size: 0.6rem; color: #71717a; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Speed</div>
              <div style="font-size: 1.45rem; font-weight: 900; color: #38bdf8; font-family: var(--font-mono); line-height: 1.1;">
                <span id="hud-speed">32</span> <span style="font-size: 0.78rem; color: #a1a1aa;">km/h</span>
              </div>
            </div>

            <div style="width: 1px; height: 32px; background: rgba(255,255,255,0.12);"></div>

            <!-- Total Distance Driven (Counts in Real Time) -->
            <div>
              <div style="font-size: 0.6rem; color: #71717a; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Distance Count</div>
              <div style="font-size: 1.45rem; font-weight: 900; color: #22c55e; font-family: var(--font-mono); line-height: 1.1;">
                <span id="hud-distance-km">0.00</span> <span style="font-size: 0.85rem; color: #ffffff;">km</span>
                <span id="hud-distance-meters" style="font-size: 0.75rem; color: #a1a1aa; margin-left: 0.35rem;">(0 m)</span>
              </div>
            </div>

            <div style="width: 1px; height: 32px; background: rgba(255,255,255,0.12);"></div>

            <!-- Next 500m Checkpoint Countdown -->
            <div>
              <div style="font-size: 0.6rem; color: #f59e0b; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Next 500m Milestone</div>
              <div style="font-size: 1.15rem; font-weight: 900; color: #fbbf24; font-family: var(--font-mono); line-height: 1.1;">
                <span id="hud-next-checkpoint-dist">500m left</span>
              </div>
            </div>

            <div style="width: 1px; height: 32px; background: rgba(255,255,255,0.12);"></div>

            <!-- Checkpoints Counter -->
            <div>
              <div style="font-size: 0.6rem; color: #71717a; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Checkpoints</div>
              <div style="font-size: 1.35rem; font-weight: 900; color: #ffffff; font-family: var(--font-mono); line-height: 1.1;">
                <span id="hud-checkpoints-cleared">0</span> <span style="font-size: 0.8rem; color: #71717a;">/ 16</span>
              </div>
            </div>

            <div style="width: 1px; height: 32px; background: rgba(255,255,255,0.12);"></div>

            <!-- Driving Time -->
            <div>
              <div style="font-size: 0.6rem; color: #71717a; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Time</div>
              <div style="font-size: 1.25rem; font-weight: 900; color: #ffffff; font-family: var(--font-mono); line-height: 1.1;">
                <span id="hud-elapsed-time">00:00</span>
              </div>
            </div>
          </div>

          <!-- Right: Mode Switcher & Close -->
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <!-- Real GPS vs Game Simulator Toggle -->
            <div style="
              display: flex;
              background: rgba(255, 255, 255, 0.06);
              border: 1px solid rgba(255, 255, 255, 0.14);
              border-radius: 8px;
              overflow: hidden;
            ">
              <button type="button" id="btn-mode-sim" style="
                background: #22c55e;
                color: #000000;
                border: none;
                padding: 0.45rem 0.85rem;
                font-size: 0.75rem;
                font-weight: 800;
                cursor: pointer;
                transition: all 0.2s ease;
              ">🎮 Game Drive</button>
              <button type="button" id="btn-mode-gps" style="
                background: transparent;
                color: #a1a1aa;
                border: none;
                padding: 0.45rem 0.85rem;
                font-size: 0.75rem;
                font-weight: 800;
                cursor: pointer;
                transition: all 0.2s ease;
              ">📡 Real GPS</button>
            </div>

            <!-- Close Modal -->
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

        <!-- MAIN FIXED GAME-VIEW MAP CONTAINER -->
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

          <!-- BOTTOM CORNER REAL-TIME GPS COORDINATES OVERLAY -->
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
              <span style="color:#71717a;">COORDS:</span>
              <strong id="gps-coords" style="color:#ffffff; font-family:var(--font-mono); margin-left:0.25rem;">14.42300, 78.22850</strong>
            </div>
            <div style="width:1px; height:14px; background:rgba(255,255,255,0.12);"></div>
            <div>
              <span style="color:#71717a;">CAMERA:</span>
              <strong style="color:#22c55e; font-family:var(--font-mono); margin-left:0.25rem;">Game Locked (No Zooming)</strong>
            </div>
            <div style="width:1px; height:14px; background:rgba(255,255,255,0.12);"></div>
            <div>
              <span style="color:#71717a;">PACE:</span>
              <strong style="color:#38bdf8; font-family:var(--font-mono); margin-left:0.25rem;">500m Increments</strong>
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
              Day ${dayNumber} training successfully completed! All 16 checkpoints (500m intervals) cleared under Instructor <strong>${currentTrainer.name}</strong>.
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

        <!-- BOTTOM ARCADE COCKPIT CONTROLS -->
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
          <!-- Left: Drive Simulation Controls -->
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <button type="button" id="btn-play-pause-sim" style="
              background: #ffffff;
              color: #000000;
              border: none;
              padding: 0.6rem 1.3rem;
              border-radius: 8px;
              font-size: 0.85rem;
              font-weight: 900;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.4rem;
            ">
              <span id="sim-play-icon">⏸</span>
              <span id="sim-play-text">Pause Drive</span>
            </button>

            <!-- Speed Multipliers -->
            <div style="
              display: flex;
              background: rgba(255, 255, 255, 0.06);
              border: 1px solid rgba(255, 255, 255, 0.12);
              border-radius: 8px;
              overflow: hidden;
            ">
              <button type="button" class="btn-speed-mult" data-speed="1" style="background:transparent; color:#a1a1aa; border:none; padding:0.55rem 0.75rem; font-size:0.75rem; font-weight:800; cursor:pointer;">1x</button>
              <button type="button" class="btn-speed-mult active" data-speed="2" style="background:#ffffff; color:#000000; border:none; padding:0.55rem 0.75rem; font-size:0.75rem; font-weight:800; cursor:pointer;">2x</button>
              <button type="button" class="btn-speed-mult" data-speed="5" style="background:transparent; color:#a1a1aa; border:none; padding:0.55rem 0.75rem; font-size:0.75rem; font-weight:800; cursor:pointer;">5x</button>
              <button type="button" class="btn-speed-mult" data-speed="10" style="background:transparent; color:#a1a1aa; border:none; padding:0.55rem 0.75rem; font-size:0.75rem; font-weight:800; cursor:pointer;">10x</button>
            </div>

            <!-- Quick +500m Checkpoint Advance -->
            <button type="button" id="btn-step-500m" style="
              background: rgba(245, 158, 11, 0.2);
              border: 1px solid rgba(245, 158, 11, 0.5);
              color: #fbbf24;
              padding: 0.6rem 1rem;
              border-radius: 8px;
              font-size: 0.8rem;
              font-weight: 800;
              cursor: pointer;
            " title="Jump forward 500 meters to test the checkpoint chime and badge">
              +500m Jump ⏩
            </button>
          </div>

          <!-- Right: Save & Log Button -->
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

  // Cleanup on close
  const closeModal = () => {
    if (activeWatchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(activeWatchId);
      activeWatchId = null;
    }
    if (simulationTimer) {
      clearInterval(simulationTimer);
      simulationTimer = null;
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

      // STRICT GAME CAMERA: No zoom controls, no scroll zoom, no double-click zoom!
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

      // Clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      const allCoords = track.map(t => [t.lat, t.lng]);
      const startPos = allCoords[0];

      // SET FIXED CLOSE-UP GAME VIEW DIRECTLY (NO ZOOM OUT / NO ZOOM IN JUMPS)
      map.setView(startPos, 18);

      // Base unvisited road casing
      L.polyline(allCoords, {
        color: '#0f172a',
        weight: 18,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Base asphalt pavement
      L.polyline(allCoords, {
        color: '#334155',
        weight: 14,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Center dashed road markings
      L.polyline(allCoords, {
        color: '#facc15',
        weight: 2.5,
        opacity: 0.8,
        dashArray: '8, 12'
      }).addTo(map);

      // DYNAMIC REAL-TIME TRAVELED PATH POLYLINE (Draws live behind the car as we go!)
      traveledCoords = [startPos];
      livePolyline = L.polyline(traveledCoords, {
        color: '#22c55e',
        weight: 8,
        opacity: 0.98,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Start Marker (Depot 0.0 km)
      const startIcon = L.divIcon({
        className: 'gamified-start-marker',
        html: `
          <div style="transform: translate(-50%, -100%); display:flex; flex-direction:column; align-items:center;">
            <div style="background:#16a34a; color:#ffffff; font-weight:900; font-size:11px; padding:3px 8px; border-radius:6px; white-space:nowrap; border:2px solid #ffffff; box-shadow:0 4px 12px rgba(0,0,0,0.4);">
              🏁 0.0 km START
            </div>
            <div style="width:2px; height:10px; background:#16a34a;"></div>
          </div>
        `,
        iconSize: [0, 0]
      });
      L.marker(startPos, { icon: startIcon }).addTo(map);

      // 16 Checkpoint Milestone Beacons (Every 500m)
      checkpoints.forEach(cp => {
        const cpIcon = L.divIcon({
          className: `gamified-cp-marker cp-marker-${cp.id}`,
          html: `
            <div id="cp-beacon-${cp.id}" style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: #ffffff;
              border: 2.5px solid #f59e0b;
              box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              transform: translate(-50%, -50%);
              cursor: pointer;
              transition: all 0.25s ease;
            ">
              <span style="font-size: 8px; font-weight: 900; color: #b45309; font-family: var(--font-mono); line-height: 1;">${cp.id}</span>
              <span style="font-size: 7px; font-weight: 800; color: #0f172a; line-height: 1;">${cp.label}</span>
            </div>
          `,
          iconSize: [0, 0]
        });

        const marker = L.marker([cp.lat, cp.lng], { icon: cpIcon }).addTo(map);
        marker.bindPopup(`<b>Checkpoint ${cp.id} (${cp.label})</b><br>${cp.title}`);
      });

      // Dual Rider Moving Vehicle Marker
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
            <!-- Heads-Up Rider Tag -->
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

            <!-- Yellow Training Car with Heading Rotation -->
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
              transition: transform 0.1s linear;
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

      carMarker = L.marker(startPos, { icon: carIcon }).addTo(map);

      // Invalidate sizes immediately without zooming
      map.invalidateSize();
      setTimeout(() => map.invalidateSize(), 200);

      // Driving Elapsed Timer
      elapsedTimer = setInterval(() => {
        if (isRideCompleted) return;
        secondsElapsed++;
        const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
        const secs = String(secondsElapsed % 60).padStart(2, '0');
        const timeElem = document.getElementById('hud-elapsed-time');
        if (timeElem) timeElem.textContent = `${mins}:${secs}`;
      }, 1000);

      // =========================================================
      // REAL-TIME DATA & PATH EXTENSION ENGINE
      // =========================================================
      function advanceRide(newTotalMeters, currentLat, currentLng, speedKmh = 30) {
        if (isRideCompleted) return;

        totalDistanceMeters = Math.min(8000, Math.max(totalDistanceMeters, newTotalMeters));
        const distKm = (totalDistanceMeters / 1000).toFixed(2);

        // 1. Update Odometer & Speed HUD in real-time
        const distKmElem = document.getElementById('hud-distance-km');
        if (distKmElem) distKmElem.textContent = distKm;

        const distMElem = document.getElementById('hud-distance-meters');
        if (distMElem) distMElem.textContent = `(${Math.round(totalDistanceMeters)} m)`;

        const speedElem = document.getElementById('hud-speed');
        if (speedElem) speedElem.textContent = Math.round(speedKmh);

        // 2. Extend real-time traveled path behind the car
        traveledCoords.push([currentLat, currentLng]);
        if (livePolyline) livePolyline.setLatLngs(traveledCoords);

        // 3. Move car marker
        if (carMarker) carMarker.setLatLng([currentLat, currentLng]);

        // 4. CAMERA LOCKED ON CAR (NO ZOOM IN / NO ZOOM OUT)
        // Pan directly to car coordinate, maintaining fixed zoom level 18
        if (map) {
          map.setView([currentLat, currentLng], 18, { animate: false });
        }

        // 5. Update GPS Coordinates readout
        const coordsElem = document.getElementById('gps-coords');
        if (coordsElem) coordsElem.textContent = `${currentLat.toFixed(5)}, ${currentLng.toFixed(5)}`;

        // 6. Checkpoint Verification (every 500m)
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

        // 8. 8.0 km Course Completed
        if (totalDistanceMeters >= 8000) {
          finishRide();
        }
      }

      function triggerCheckpointReached(cp) {
        // Celebratory chime
        playMilestoneChime();

        // Milestone ribbon glow
        const seg = document.getElementById(`prog-seg-${cp.id}`);
        if (seg) {
          seg.style.background = '#22c55e';
          seg.style.borderColor = '#22c55e';
          seg.style.color = '#000000';
          seg.innerHTML = `✓ ${cp.label}`;
        }

        // Beacon lighting on road
        const beacon = document.getElementById(`cp-beacon-${cp.id}`);
        if (beacon) {
          beacon.style.borderColor = '#ffffff';
          beacon.style.background = '#16a34a';
          beacon.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.9)';
          beacon.innerHTML = `<span style="font-size: 13px; font-weight: 900; color: #ffffff;">✓</span>`;
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

        if (simulationTimer) clearInterval(simulationTimer);
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
      // GAME DRIVE SIMULATOR ENGINE (CONTINUOUS SMOOTH DRIVE)
      // =========================================================
      function startSimulation() {
        if (isRideCompleted) return;
        isSimPlaying = true;
        const playIcon = document.getElementById('sim-play-icon');
        const playText = document.getElementById('sim-play-text');
        if (playIcon) playIcon.textContent = '⏸';
        if (playText) playText.textContent = 'Pause Drive';

        if (simulationTimer) clearInterval(simulationTimer);

        // Smooth interval for game drive
        const intervalMs = Math.max(35, Math.floor(120 / simSpeedMultiplier));

        simulationTimer = setInterval(() => {
          if (simStep >= track.length - 1) {
            finishRide();
            return;
          }

          simStep++;
          const pt = track[simStep];
          if (!pt) return;

          // Smooth heading rotation
          if (simStep < track.length - 1) {
            const nextPt = track[simStep + 1];
            const bearing = calculateBearing([pt.lat, pt.lng], [nextPt.lat, nextPt.lng]);
            const rotNode = document.getElementById('car-rotation-node');
            if (rotNode) rotNode.style.transform = `rotate(${bearing}deg)`;
          }

          const dynamicSpeed = 28 + Math.round((Math.sin(simStep / 8) + 1) * 6);
          advanceRide(pt.distanceMeters, pt.lat, pt.lng, dynamicSpeed);
        }, intervalMs);
      }

      function pauseSimulation() {
        isSimPlaying = false;
        const playIcon = document.getElementById('sim-play-icon');
        const playText = document.getElementById('sim-play-text');
        if (playIcon) playIcon.textContent = '▶';
        if (playText) playText.textContent = 'Resume Drive';

        if (simulationTimer) {
          clearInterval(simulationTimer);
          simulationTimer = null;
        }
      }

      // =========================================================
      // REAL DEVICE GPS ENGINE
      // =========================================================
      function startRealGps() {
        if (!navigator.geolocation) {
          alert('GPS not supported on this device. Continuing in Game Drive mode.');
          return;
        }

        if (activeWatchId !== null) {
          navigator.geolocation.clearWatch(activeWatchId);
          activeWatchId = null;
        }

        pauseSimulation();

        const statusBadge = document.getElementById('gps-status-badge');
        const statusText = document.getElementById('gps-status-text');
        if (statusBadge && statusText) {
          statusBadge.style.background = 'rgba(34, 197, 94, 0.2)';
          statusBadge.style.borderColor = '#22c55e';
          statusBadge.style.color = '#22c55e';
          statusText.textContent = 'REAL GPS TRACKING ACTIVE · 500M COUNT';
        }

        activeWatchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed } = position.coords;
            const now = Date.now();
            let stepMeters = 0;
            let speedKmh = speed ? (speed * 3.6) : 25;

            if (lastGpsPoint) {
              const dMeters = haversineMeters([lastGpsPoint.lat, lastGpsPoint.lng], [latitude, longitude]);
              if (dMeters >= 2.0) { // filter stationary drift
                stepMeters = dMeters;
                const dSec = (now - lastGpsTime) / 1000;
                if (!speed && dSec > 0) {
                  speedKmh = (dMeters / dSec) * 3.6;
                }
                const bearing = calculateBearing([lastGpsPoint.lat, lastGpsPoint.lng], [latitude, longitude]);
                const rotNode = document.getElementById('car-rotation-node');
                if (rotNode) rotNode.style.transform = `rotate(${bearing}deg)`;

                lastGpsPoint = { lat: latitude, lng: longitude };
                lastGpsTime = now;
              }
            } else {
              lastGpsPoint = { lat: latitude, lng: longitude };
              lastGpsTime = now;
            }

            advanceRide(totalDistanceMeters + stepMeters, latitude, longitude, speedKmh);
          },
          (err) => {
            console.warn('GPS signal issue:', err);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 12000
          }
        );
      }

      // Mode Switch: Game Simulator vs Real GPS
      const btnModeSim = modalRoot.querySelector('#btn-mode-sim');
      const btnModeGps = modalRoot.querySelector('#btn-mode-gps');

      btnModeSim.addEventListener('click', () => {
        activeMode = 'simulator';
        btnModeSim.style.background = '#22c55e';
        btnModeSim.style.color = '#000000';
        btnModeGps.style.background = 'transparent';
        btnModeGps.style.color = '#a1a1aa';

        if (activeWatchId !== null && navigator.geolocation) {
          navigator.geolocation.clearWatch(activeWatchId);
          activeWatchId = null;
        }

        const statusBadge = document.getElementById('gps-status-badge');
        const statusText = document.getElementById('gps-status-text');
        if (statusBadge && statusText) {
          statusBadge.style.background = 'rgba(34, 197, 94, 0.2)';
          statusBadge.style.borderColor = '#22c55e';
          statusBadge.style.color = '#22c55e';
          statusText.textContent = 'GAME DRIVE ACTIVE · 500M TRACKING';
        }

        startSimulation();
      });

      btnModeGps.addEventListener('click', () => {
        activeMode = 'gps';
        btnModeGps.style.background = '#22c55e';
        btnModeGps.style.color = '#000000';
        btnModeSim.style.background = 'transparent';
        btnModeSim.style.color = '#a1a1aa';
        startRealGps();
      });

      // Simulator Play / Pause
      const btnPlayPauseSim = modalRoot.querySelector('#btn-play-pause-sim');
      btnPlayPauseSim?.addEventListener('click', () => {
        if (isSimPlaying) {
          pauseSimulation();
        } else {
          startSimulation();
        }
      });

      // Speed Multipliers
      modalRoot.querySelectorAll('.btn-speed-mult').forEach(btn => {
        btn.addEventListener('click', () => {
          modalRoot.querySelectorAll('.btn-speed-mult').forEach(b => {
            b.classList.remove('active');
            b.style.background = 'transparent';
            b.style.color = '#a1a1aa';
          });
          btn.classList.add('active');
          btn.style.background = '#ffffff';
          btn.style.color = '#000000';
          simSpeedMultiplier = parseInt(btn.dataset.speed, 10);
          if (isSimPlaying) {
            startSimulation();
          }
        });
      });

      // Quick +500m Milestone Jump
      modalRoot.querySelector('#btn-step-500m')?.addEventListener('click', () => {
        const nextTargetM = Math.min(8000, totalDistanceMeters + 500);
        const closest = track.reduce((prev, curr) => 
          Math.abs(curr.distanceMeters - nextTargetM) < Math.abs(prev.distanceMeters - nextTargetM) ? curr : prev
        );
        simStep = closest.step;
        advanceRide(nextTargetM, closest.lat, closest.lng, 35);
      });

      // Save & Complete Ride Handler
      const handleSaveRide = () => {
        store.completeSession(currentStudent.id, dayNumber, {
          instructorNotes: `Day ${dayNumber} live 8.0 km ride completed with all 16 500m checkpoints logged.`
        });
        if (onRideCompleted) onRideCompleted();
        closeModal();
      };

      modalRoot.querySelector('#btn-complete-direct')?.addEventListener('click', handleSaveRide);
      modalRoot.querySelector('#btn-save-completed-ride')?.addEventListener('click', handleSaveRide);

      // Auto-start game drive immediately on launch!
      startSimulation();

    } catch (err) {
      console.error('Failed to initialize Game Ride Map:', err);
    }
  }, 100);
}

export const openLiveRideTrackingModal = openLiveRideMapModal;
