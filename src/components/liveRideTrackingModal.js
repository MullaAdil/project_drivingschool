/* ==========================================================================
   ROAD-ONLY LIVE MOVEMENT TRACKING & 500M TELEMETRY MODAL
   GAFOOR DRIVING SCHOOL — PULIVENDULA, ANDHRA PRADESH

   Features:
   - Live GPS Geolocation: Anchors map and road corridor directly at the user's
     actual live coordinates
   - STRICT MOVEMENT-ONLY TRACKING: Zero automatic movement. The vehicle ONLY moves
     when actual physical movement is detected by the device GPS (or manual test move)
   - When stationary (parked / stopped), speed is 0 km/h and distance stays frozen
   - "Road-Only" navigation view: clean dark terrain, wide multi-layer asphalt highway,
     high-contrast center dashed divider, outer white shoulders, zero clutter
   - 16 Milestone checkpoints at exact 500m intervals (500m, 1000m ... 8000m)
   - Real-time countdown to next 500m milestone target
   - Web Audio chime & celebration toast on every 500m checkpoint passed
   - Dynamic real-time glowing path drawn directly on the road behind the vehicle
   - Directional navigation puck with forward headlights rotating with road curves
   - Real device GPS hardware watch (`watchPosition`)
   - Minimalist floating HUD island & luxury dark obsidian/gold completion screen
   ========================================================================== */

import L from 'leaflet';
import { store } from '../store.js';

let activeLiveMap = null;
let activeWatchId = null;
let durationTimer = null;

// Helper: Haversine distance in meters between two lat/lng points
export function haversineMeters(p1, p2) {
  const R = 6371000;
  const dLat = (p2[0] - p1[0]) * Math.PI / 180;
  const dLng = (p2[1] - p1[1]) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Helper: Calculate bearing angle (degrees 0-360) between two coordinates
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
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(783.99, now + 0.1);
    gain2.gain.setValueAtTime(0.22, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.42);
  } catch (e) {
    // Non-blocking
  }
}

// Compute exact point and bearing along road coordinates for any distance in meters
function getPointAtMeters(roadCoords, distanceMeters, totalCourseMeters = 8000) {
  if (!roadCoords || roadCoords.length < 2) {
    return { lat: 14.4230, lng: 78.2285, bearing: 0 };
  }

  const segmentDists = [0];
  let accumulated = 0;
  for (let i = 0; i < roadCoords.length - 1; i++) {
    accumulated += haversineMeters(roadCoords[i], roadCoords[i + 1]);
    segmentDists.push(accumulated);
  }

  const targetDist = (Math.max(0, Math.min(distanceMeters, totalCourseMeters)) / totalCourseMeters) * accumulated;

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

  const pA = roadCoords[segIdx];
  const pB = roadCoords[Math.min(segIdx + 1, roadCoords.length - 1)];

  const lat = pA[0] + (pB[0] - pA[0]) * factor;
  const lng = pA[1] + (pB[1] - pA[1]) * factor;
  const bearing = calculateBearing(pA, pB);

  return { lat, lng, bearing };
}

// Build 8.0 km road corridor anchored directly at the origin (Live GPS or depot)
function buildRoadCorridorFromOrigin(originLat, originLng, existingRoute = null) {
  let rawPoints = null;

  if (existingRoute && existingRoute.length >= 2) {
    rawPoints = existingRoute;
  } else {
    // Realistic 8.0 km road driving loop starting from the user's actual live coordinates
    const deltaOffsets = [
      [0, 0],
      [0.0022, 0.0028],
      [0.0055, 0.0068],
      [0.0092, 0.0102],
      [0.0135, 0.0138],
      [0.0168, 0.0182],
      [0.0125, 0.0218],
      [0.0078, 0.0245],
      [0.0032, 0.0212],
      [-0.0018, 0.0158],
      [-0.0055, 0.0108],
      [-0.0082, 0.0052],
      [-0.0048, 0.0006],
      [-0.0018, -0.0022],
      [0.0000, 0.0000],
      [0.0035, 0.0045]
    ];
    rawPoints = deltaOffsets.map(([dLat, dLng]) => [originLat + dLat, originLng + dLng]);
  }

  // 16 Checkpoints at exact 500m intervals (500m, 1000m ... 8000m)
  const checkpointLabels = [
    { title: 'Cockpit ABC Drill', place: 'Starting Corridor' },
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
    const targetMeters = i * 500;
    const pt = getPointAtMeters(rawPoints, targetMeters, 8000);
    const meta = checkpointLabels[i - 1] || { title: `Checkpoint ${i}`, place: 'Course Sector' };

    checkpoints.push({
      id: i,
      name: `Checkpoint ${i}`,
      label: `${(targetMeters / 1000).toFixed(1)} km`,
      distanceMeters: targetMeters,
      distanceKm: (targetMeters / 1000).toFixed(1),
      title: meta.title,
      place: meta.place,
      lat: pt.lat,
      lng: pt.lng,
      bearing: pt.bearing,
      cleared: false
    });
  }

  return { rawPoints, checkpoints };
}

/**
 * Main function to launch the Road-Only Movement Tracking Modal
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

  // Fallback origin: Pulivendula Depot
  const DEFAULT_LAT = session?.route?.startPoint?.lat || 14.4230;
  const DEFAULT_LNG = session?.route?.startPoint?.lng || 78.2285;

  // Real-Time Movement State (STRICTLY PHYSICAL MOVEMENT ONLY)
  let totalDistanceMeters = 0;
  let secondsElapsed = 0;
  let isTrackingPaused = false;
  let isRideCompleted = false;

  let lastGpsPoint = null;
  let lastGpsTimestamp = null;

  // Leaflet handles
  let mapInstance = null;
  let carMarker = null;
  let livePolyline = null;
  let traveledCoords = [];
  let allRoadCoords = [];
  let checkpoints = [];

  modalRoot.innerHTML = `
    <div class="mnc-modal-overlay" id="live-ride-overlay" style="padding:0; align-items:stretch; justify-content:stretch; z-index:9999;">
      <div class="live-ride-viewport" style="
        width: 100vw;
        height: 100vh;
        max-width: 100vw;
        max-height: 100vh;
        background: #060911;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
        font-family: var(--font-sans);
      ">
        <!-- FULLSCREEN ROAD-ONLY HIGHWAY MAP -->
        <div id="live-ride-leaflet-map" style="position: absolute; inset: 0; width: 100%; height: 100%; background: #060911; z-index: 1;"></div>

        <!-- TOP MINIMAL FLOATING COCKPIT ISLAND (PREMIUM HUD) -->
        <div style="
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 32px);
          max-width: 960px;
          background: rgba(10, 14, 22, 0.92);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          padding: 0.85rem 1.4rem;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.75);
          z-index: 1000;
        ">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
            <!-- Left: Session Title & GPS Status -->
            <div>
              <div style="display: flex; align-items: center; gap: 0.45rem;">
                <span id="gps-status-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; display: inline-block; box-shadow: 0 0 10px #f59e0b;"></span>
                <span id="gps-status-text" style="font-size: 0.68rem; font-weight: 800; color: #f59e0b; letter-spacing: 0.05em; text-transform: uppercase;">
                  ACQUIRING LIVE GPS LOCATION...
                </span>
              </div>
              <h2 style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin: 0.15rem 0 0 0; letter-spacing: -0.01em;">
                Day ${dayNumber} · ${objective}
              </h2>
              <div style="font-size: 0.72rem; color: #71717a; margin-top: 0.15rem;">
                Driver: <strong style="color:#ffffff;">${currentStudent.name}</strong> · Instructor: <strong style="color:#ffffff;">${currentTrainer.name}</strong> · ${currentTrainer.car}
              </div>
            </div>

            <!-- Center: Essential Telemetry Metrics -->
            <div style="display: flex; align-items: center; gap: 1.25rem;">
              <!-- Speed (0 km/h when not moving!) -->
              <div style="text-align: center;">
                <div style="font-size: 0.58rem; color: #71717a; text-transform: uppercase; font-weight: 700;">Speed</div>
                <div style="font-size: 1.5rem; font-weight: 900; color: #ffffff; font-family: var(--font-mono); line-height: 1.1;">
                  <span id="hud-speed">0</span> <span style="font-size: 0.68rem; color: #71717a;">km/h</span>
                </div>
              </div>

              <div style="width: 1px; height: 26px; background: rgba(255,255,255,0.08);"></div>

              <!-- Distance Driven -->
              <div style="text-align: center;">
                <div style="font-size: 0.58rem; color: #71717a; text-transform: uppercase; font-weight: 700;">Distance</div>
                <div style="font-size: 1.5rem; font-weight: 900; color: #22c55e; font-family: var(--font-mono); line-height: 1.1;">
                  <span id="hud-distance-km">0.00</span> <span style="font-size: 0.75rem; color: #71717a;">/ 8.00 km</span>
                </div>
              </div>

              <div style="width: 1px; height: 26px; background: rgba(255,255,255,0.08);"></div>

              <!-- Next Checkpoint (500m increments) -->
              <div style="text-align: center;">
                <div style="font-size: 0.58rem; color: #d4af37; text-transform: uppercase; font-weight: 700;">Next 500m Target</div>
                <div style="font-size: 1.15rem; font-weight: 800; color: #f59e0b; font-family: var(--font-mono); line-height: 1.1;">
                  <span id="hud-next-checkpoint-dist">500m</span>
                </div>
              </div>

              <div style="width: 1px; height: 26px; background: rgba(255,255,255,0.08);"></div>

              <!-- Checkpoints (0/16) -->
              <div style="text-align: center;">
                <div style="font-size: 0.58rem; color: #71717a; text-transform: uppercase; font-weight: 700;">Checkpoints</div>
                <div style="font-size: 1.15rem; font-weight: 800; color: #ffffff; font-family: var(--font-mono); line-height: 1.1;">
                  <span id="hud-checkpoints-cleared">0</span> <span style="font-size: 0.7rem; color: #71717a;">/ 16</span>
                </div>
              </div>

              <div style="width: 1px; height: 26px; background: rgba(255,255,255,0.08);"></div>

              <!-- Time Elapsed -->
              <div style="text-align: center;">
                <div style="font-size: 0.58rem; color: #71717a; text-transform: uppercase; font-weight: 700;">Duration</div>
                <div style="font-size: 1.15rem; font-weight: 800; color: #ffffff; font-family: var(--font-mono); line-height: 1.1;">
                  <span id="hud-elapsed-time">00:00</span>
                </div>
              </div>
            </div>

            <!-- Right: Close Button -->
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

          <!-- Ultra-Sleek 3px Road Progression Bar -->
          <div style="margin-top: 0.75rem;">
            <div style="width: 100%; height: 3px; background: rgba(255, 255, 255, 0.08); border-radius: 9999px; overflow: hidden;">
              <div id="hud-progress-fill" style="width: 0%; height: 100%; background: linear-gradient(90deg, #22c55e 0%, #38bdf8 100%); transition: width 0.25s ease;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.35rem; font-size: 0.65rem; color: #71717a; font-family: var(--font-mono);">
              <span>0.0 km</span>
              <span id="hud-current-cp-name">Course Target: 8.0 km (16 Checkpoints @ 500m Intervals)</span>
              <span>8.0 km</span>
            </div>
          </div>
        </div>

        <!-- 500M MILESTONE BANNER POPUP -->
        <div id="checkpoint-toast-banner" style="
          position: absolute;
          top: 130px;
          left: 50%;
          transform: translateX(-50%) translateY(-20px);
          opacity: 0;
          pointer-events: none;
          background: rgba(14, 18, 26, 0.95);
          backdrop-filter: blur(16px);
          border: 1px solid #22c55e;
          color: #ffffff;
          padding: 0.65rem 1.6rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 800;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          gap: 0.6rem;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 1200;
        ">
          <span style="color:#22c55e; font-size:1.1rem;">✓</span>
          <span id="checkpoint-toast-text">Checkpoint Cleared!</span>
        </div>

        <!-- FLOATING BOTTOM CONTROL ISLAND -->
        <div style="
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(10, 14, 22, 0.92);
          backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 0.55rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.75);
          z-index: 1000;
          flex-wrap: wrap;
        ">
          <!-- Manual Test Move Button (Only moves when clicked!) -->
          <button type="button" id="btn-manual-test-move" style="
            background: rgba(56, 189, 248, 0.12);
            border: 1px solid rgba(56, 189, 248, 0.35);
            color: #38bdf8;
            padding: 0.55rem 1rem;
            border-radius: 10px;
            font-size: 0.8rem;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.4rem;
          " title="Manually step 50m forward for testing without driving">
            <span>🚗</span>
            <span>Test Move (+50m)</span>
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
          ">
            🔄 Re-sync GPS
          </button>

          <div style="width: 1px; height: 24px; background: rgba(255,255,255,0.1);"></div>

          <!-- Complete & Log Button (Signature Gold) -->
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

        <!-- LUXURY OBSIDIAN & GOLD FINISH MODAL -->
        <div id="finish-ride-ceremony" style="
          position: absolute;
          inset: 0;
          background: rgba(5, 7, 12, 0.95);
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
          ">
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
              ✦ GAFOOR DRIVING SCHOOL · RTO ACCREDITED
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

            <!-- Sign-off Strip -->
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
    if (durationTimer) {
      clearInterval(durationTimer);
      durationTimer = null;
    }
    if (activeLiveMap) {
      activeLiveMap.remove();
      activeLiveMap = null;
    }
    modalRoot.innerHTML = '';
  };

  modalRoot.querySelector('#btn-close-live-ride').addEventListener('click', closeModal);

  // =========================================================
  // MOVEMENT TELEMETRY HANDLER
  // Only called when ACTUAL movement happens!
  // =========================================================
  function recordMovementStep(latitude, longitude, bearing = 0, speedKmh = 0, deltaMeters = 0) {
    if (isRideCompleted || isTrackingPaused) return;

    totalDistanceMeters = Math.min(8000, totalDistanceMeters + deltaMeters);
    const distKm = (totalDistanceMeters / 1000).toFixed(2);

    // 1. Update Odometer & Speed HUD
    const distKmElem = document.getElementById('hud-distance-km');
    if (distKmElem) distKmElem.textContent = distKm;

    const speedElem = document.getElementById('hud-speed');
    if (speedElem) speedElem.textContent = Math.round(speedKmh);

    // 2. Extend real-time traveled path on the road
    traveledCoords.push([latitude, longitude]);
    if (livePolyline) livePolyline.setLatLngs(traveledCoords);

    // 3. Move vehicle marker & rotate heading
    if (carMarker) carMarker.setLatLng([latitude, longitude]);
    const rotNode = document.getElementById('car-rotation-node');
    if (rotNode) rotNode.style.transform = `rotate(${bearing}deg)`;

    // 4. LOCKED CAMERA: Keep car centered at zoom 18 (NO zoom jumps)
    if (mapInstance) {
      mapInstance.setView([latitude, longitude], 18, { animate: false });
    }

    // 5. Update 3px Progress Line
    const progressPct = Math.min(100, (totalDistanceMeters / 8000) * 100);
    const fillElem = document.getElementById('hud-progress-fill');
    if (fillElem) fillElem.style.width = `${progressPct.toFixed(1)}%`;

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
        if (cpNameElem) cpNameElem.textContent = `Next Checkpoint: ${nextCp.label} (${nextCp.title}) · ${remMeters}m remaining`;
      } else {
        nextDistElem.textContent = '8.0 km ✓';
        if (cpNameElem) cpNameElem.textContent = 'All 16 checkpoints completed!';
      }
    }

    // 8. 8.0 km Course Finished
    if (totalDistanceMeters >= 8000) {
      finishRide();
    }
  }

  function triggerCheckpointReached(cp) {
    playMilestoneChime();

    // Update road marker beacon to glowing green checkmark
    const node = document.getElementById(`road-cp-${cp.id}`);
    const icon = document.getElementById(`cp-icon-${cp.id}`);
    if (node) {
      node.style.borderColor = '#22c55e';
      node.style.color = '#ffffff';
      node.style.background = 'rgba(22, 101, 52, 0.9)';
      node.style.boxShadow = '0 0 16px rgba(34, 197, 94, 0.8)';
      if (icon) icon.textContent = '✓';
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
  // INITIALIZE MAP & ROAD CORRIDOR AT LIVE COORDINATES
  // =========================================================
  function initRoadWithLiveCoordinates(originLat, originLng, accuracy = null) {
    try {
      const mapContainer = document.getElementById('live-ride-leaflet-map');
      if (!mapContainer) return;

      if (activeLiveMap) {
        activeLiveMap.remove();
        activeLiveMap = null;
      }

      // Build road corridor and 16 checkpoints starting right at the user's live position
      const corridor = buildRoadCorridorFromOrigin(originLat, originLng, session?.route?.path);
      allRoadCoords = corridor.rawPoints;
      checkpoints = corridor.checkpoints;

      // Update status dot & label
      const statusDot = document.getElementById('gps-status-dot');
      const statusText = document.getElementById('gps-status-text');
      if (statusDot && statusText) {
        statusDot.style.background = '#22c55e';
        statusDot.style.boxShadow = '0 0 10px #22c55e';
        statusText.style.color = '#22c55e';
        statusText.textContent = accuracy 
          ? `LIVE GPS ACTIVE (±${Math.round(accuracy)}m) · STATIONARY`
          : 'LIVE GPS READY · WAITING FOR MOVEMENT';
      }

      // Edge-to-edge locked driving camera (fixed zoom 18, zero zoom jumps)
      mapInstance = L.map(mapContainer, {
        zoomControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
        attributionControl: false
      });
      activeLiveMap = mapInstance;

      // Dark background tile layer with muted road-focused styling
      const roadTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: ''
      });
      roadTileLayer.on('tileerror', () => {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          subdomains: ['a', 'b', 'c']
        }).addTo(mapInstance);
      });
      roadTileLayer.addTo(mapInstance);

      // Deeply mute background tiles to make the ROAD highway the sole focus
      const tilePane = mapInstance.getPane('tilePane');
      if (tilePane) {
        tilePane.style.filter = 'brightness(0.22) contrast(1.25) grayscale(0.85)';
        tilePane.style.opacity = '0.5';
      }

      const startPos = [originLat, originLng];
      lastGpsPoint = { lat: originLat, lng: originLng };
      lastGpsTimestamp = Date.now();

      // Lock camera directly on live origin position at zoom 18
      mapInstance.setView(startPos, 18);

      // =========================================================
      // DEDICATED DRIVING ROAD HIGHWAY VISUAL CORRIDOR
      // =========================================================
      // 1. Wide Road Foundation / Embankment
      L.polyline(allRoadCoords, {
        color: '#080d1a',
        weight: 52,
        opacity: 0.98,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstance);

      // 2. Road Curb Stones & Shoulder Margin
      L.polyline(allRoadCoords, {
        color: '#1e293b',
        weight: 44,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstance);

      // 3. Dark Asphalt Road Pavement
      L.polyline(allRoadCoords, {
        color: '#0f172a',
        weight: 36,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstance);

      // 4. Solid White Shoulder Boundary Edge Lines
      L.polyline(allRoadCoords, {
        color: 'rgba(148, 163, 184, 0.35)',
        weight: 32,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstance);

      // 5. Inner Asphalt Driving Surface
      L.polyline(allRoadCoords, {
        color: '#090e17',
        weight: 30,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstance);

      // 6. Center Dashed Highway Divider Line (Yellow)
      L.polyline(allRoadCoords, {
        color: '#facc15',
        weight: 3,
        opacity: 0.95,
        dashArray: '12, 16',
        lineCap: 'butt'
      }).addTo(mapInstance);

      // 7. Dynamic Traveled Path Polyline (Draws neon green directly on the road as movement occurs)
      traveledCoords = [startPos];
      livePolyline = L.polyline(traveledCoords, {
        color: '#22c55e',
        weight: 12,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstance);

      // 8. Road Start Marker (0.0 km)
      const startIcon = L.divIcon({
        className: 'road-start-marker',
        html: `
          <div style="transform:translate(-50%, -100%); display:flex; flex-direction:column; align-items:center;">
            <div style="background:#16a34a; color:#ffffff; font-weight:900; font-size:10px; padding:3px 10px; border-radius:9999px; white-space:nowrap; border:1.5px solid #ffffff; box-shadow:0 4px 14px rgba(0,0,0,0.6);">
              🏁 START · LIVE GPS (0.0 km)
            </div>
            <div style="width:2px; height:8px; background:#16a34a;"></div>
          </div>
        `,
        iconSize: [0, 0]
      });
      L.marker(startPos, { icon: startIcon }).addTo(mapInstance);

      // 9. 16 Checkpoint Milestone Markers along the road (500m intervals)
      checkpoints.forEach(cp => {
        const cpIcon = L.divIcon({
          className: `road-cp-marker cp-${cp.id}`,
          html: `
            <div id="road-cp-${cp.id}" style="
              transform: translate(-50%, -50%);
              display: flex;
              align-items: center;
              gap: 4px;
              background: rgba(15, 23, 42, 0.95);
              border: 1.5px solid #f59e0b;
              border-radius: 9999px;
              padding: 2px 7px;
              box-shadow: 0 4px 14px rgba(0, 0, 0, 0.8);
              color: #f59e0b;
              font-size: 9px;
              font-weight: 800;
              font-family: var(--font-mono);
              white-space: nowrap;
              transition: all 0.3s ease;
            ">
              <span id="cp-icon-${cp.id}" style="font-size: 8px;">🚩</span>
              <span>${cp.label}</span>
            </div>
          `,
          iconSize: [0, 0]
        });
        L.marker([cp.lat, cp.lng], { icon: cpIcon }).addTo(mapInstance);
      });

      // 10. Finish Marker (8.0 km Goal)
      const finishPt = getPointAtMeters(allRoadCoords, 8000, 8000);
      const finishIcon = L.divIcon({
        className: 'road-finish-marker',
        html: `
          <div style="transform:translate(-50%, -100%); display:flex; flex-direction:column; align-items:center;">
            <div style="background:#090d16; color:#facc15; font-weight:900; font-size:10px; padding:3px 10px; border-radius:9999px; white-space:nowrap; border:1.5px solid #facc15; box-shadow:0 4px 14px rgba(0,0,0,0.6);">
              🏁 FINISH (8.0 km)
            </div>
            <div style="width:2px; height:8px; background:#090d16;"></div>
          </div>
        `,
        iconSize: [0, 0]
      });
      L.marker([finishPt.lat, finishPt.lng], { icon: finishIcon }).addTo(mapInstance);

      // 11. Sleek Navigation Puck (Vehicle Marker with forward headlights)
      const puckIcon = L.divIcon({
        className: 'sleek-nav-puck-marker',
        html: `
          <div id="moving-puck-wrapper" style="
            position: relative;
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
          ">
            <!-- Pulsing accuracy circle -->
            <div style="
              position: absolute;
              width: 54px;
              height: 54px;
              border-radius: 50%;
              background: rgba(34, 197, 94, 0.15);
              border: 1.5px solid rgba(34, 197, 94, 0.35);
            "></div>

            <!-- Rotating Vehicle Node with Headlights -->
            <div id="car-rotation-node" style="
              position: relative;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: transform 0.15s ease-out;
            ">
              <!-- Forward Headlight Beam Cone onto Road -->
              <div style="
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 14px solid transparent;
                border-right: 14px solid transparent;
                border-top: 30px solid rgba(250, 204, 21, 0.28);
                filter: blur(2px);
              "></div>

              <!-- Vehicle Cockpit Puck -->
              <div style="
                width: 28px;
                height: 28px;
                background: #090d16;
                border: 2.5px solid #22c55e;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 14px rgba(0,0,0,0.8), 0 0 12px rgba(34,197,94,0.5);
              ">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <polygon points="12,2 22,21 12,17 2,21" fill="#22c55e" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        `,
        iconSize: [0, 0]
      });

      carMarker = L.marker(startPos, { icon: puckIcon }).addTo(mapInstance);

      mapInstance.invalidateSize();
      setTimeout(() => mapInstance?.invalidateSize(), 200);

      // Duration Timer (Counts lesson duration)
      if (!durationTimer) {
        durationTimer = setInterval(() => {
          if (isRideCompleted || isTrackingPaused) return;
          secondsElapsed++;
          const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
          const secs = String(secondsElapsed % 60).padStart(2, '0');
          const timeElem = document.getElementById('hud-elapsed-time');
          if (timeElem) timeElem.textContent = `${mins}:${secs}`;
        }, 1000);
      }

      // =========================================================
      // LIVE GPS HARDWARE WATCH (STRICT PHYSICAL MOVEMENT ONLY)
      // Zero auto-movement. Only updates when delta >= 2.5 meters!
      // =========================================================
      if (navigator.geolocation && activeWatchId === null) {
        activeWatchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed, heading, accuracy: fixAcc } = position.coords;
            const now = Date.now();

            const dot = document.getElementById('gps-status-dot');
            const txt = document.getElementById('gps-status-text');

            if (lastGpsPoint) {
              const delta = haversineMeters([lastGpsPoint.lat, lastGpsPoint.lng], [latitude, longitude]);
              
              if (delta >= 2.5) {
                // Physical movement confirmed!
                const dSec = (now - lastGpsTimestamp) / 1000;
                const spd = (speed != null && speed > 0) 
                  ? (speed * 3.6) 
                  : (dSec > 0 ? (delta / dSec) * 3.6 : 25);
                const brng = (heading != null && !isNaN(heading)) 
                  ? heading 
                  : calculateBearing([lastGpsPoint.lat, lastGpsPoint.lng], [latitude, longitude]);

                if (dot && txt) {
                  dot.style.background = '#22c55e';
                  txt.style.color = '#22c55e';
                  txt.textContent = `LIVE GPS ACTIVE · MOVING (${Math.round(spd)} km/h)`;
                }

                recordMovementStep(latitude, longitude, brng, spd, delta);
                lastGpsPoint = { lat: latitude, lng: longitude };
                lastGpsTimestamp = now;
              } else {
                // Stationary (sitting still / parked at light)
                // Speed = 0 km/h, distance remains frozen
                const speedElem = document.getElementById('hud-speed');
                if (speedElem) speedElem.textContent = '0';

                if (dot && txt) {
                  dot.style.background = '#22c55e';
                  txt.style.color = '#22c55e';
                  txt.textContent = `LIVE GPS ACTIVE (±${Math.round(fixAcc || 5)}m) · STATIONARY`;
                }
              }
            } else {
              lastGpsPoint = { lat: latitude, lng: longitude };
              lastGpsTimestamp = now;
            }
          },
          (err) => {
            console.warn('GPS hardware watch status:', err.message);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 15000
          }
        );
      }

    } catch (err) {
      console.error('Failed to initialize Road-Only Tracking Map:', err);
    }
  }

  // =========================================================
  // REQUEST USER LIVE GPS LOCATION IMMEDIATELY
  // =========================================================
  let locationInitialized = false;

  const handleLiveLocationFound = (lat, lng, accuracy) => {
    if (locationInitialized) return;
    locationInitialized = true;
    initRoadWithLiveCoordinates(lat, lng, accuracy);
  };

  const handleLocationFallback = () => {
    if (locationInitialized) return;
    locationInitialized = true;
    initRoadWithLiveCoordinates(DEFAULT_LAT, DEFAULT_LNG, null);
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleLiveLocationFound(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
      },
      (err) => {
        console.warn('Live location permission or timeout, falling back:', err.message);
        handleLocationFallback();
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 0
      }
    );

    // Timeout safety fallback so user never gets stuck waiting
    setTimeout(() => {
      if (!locationInitialized) {
        handleLocationFallback();
      }
    }, 4000);
  } else {
    handleLocationFallback();
  }

  // Manual Test Move Button: advances 50m forward along the road ONLY when clicked!
  modalRoot.querySelector('#btn-manual-test-move')?.addEventListener('click', () => {
    if (isRideCompleted || isTrackingPaused || !allRoadCoords.length) return;
    const testDelta = 50;
    const nextMeters = Math.min(8000, totalDistanceMeters + testDelta);
    const pt = getPointAtMeters(allRoadCoords, nextMeters, 8000);
    recordMovementStep(pt.lat, pt.lng, pt.bearing, 32, testDelta);

    // Reset speed to 0 after 1 second if no further clicks
    setTimeout(() => {
      const speedElem = document.getElementById('hud-speed');
      if (speedElem) speedElem.textContent = '0';
    }, 1200);
  });

  // Re-sync GPS
  modalRoot.querySelector('#btn-reacquire-gps')?.addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          lastGpsPoint = { lat: latitude, lng: longitude };
          lastGpsTimestamp = Date.now();

          if (carMarker) carMarker.setLatLng([latitude, longitude]);
          if (mapInstance) mapInstance.setView([latitude, longitude], 18, { animate: false });

          const statusDot = document.getElementById('gps-status-dot');
          const statusText = document.getElementById('gps-status-text');
          if (statusDot && statusText) {
            statusDot.style.background = '#22c55e';
            statusText.textContent = `GPS Fix Acquired (±${Math.round(accuracy)}m)`;
          }
        },
        (err) => {
          alert('GPS location could not be refreshed: ' + err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  });

  // Save & Complete Ride Handler
  const handleSaveRide = () => {
    store.completeSession(currentStudent.id, dayNumber, {
      instructorNotes: `Day ${dayNumber} practical 8.0 km driving course completed under Instructor ${currentTrainer.name}. Checkpoints verified.`
    });
    if (onRideCompleted) onRideCompleted();
    closeModal();
  };

  modalRoot.querySelector('#btn-complete-direct')?.addEventListener('click', handleSaveRide);
  modalRoot.querySelector('#btn-save-completed-ride')?.addEventListener('click', handleSaveRide);
}

export const openLiveRideTrackingModal = openLiveRideMapModal;
