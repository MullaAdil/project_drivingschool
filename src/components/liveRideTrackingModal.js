/* ==========================================================================
   LIVE GPS RIDE TRACKING & 500M DISTANCE MEASUREMENT MODAL
   GAFOOR DRIVING SCHOOL — PULIVENDULA, ANDHRA PRADESH

   Features:
   - Real Device GPS Tracking (navigator.geolocation.watchPosition)
   - Real-time Distance Measurement with Haversine formula (Meters & Kilometers)
   - 16 Milestone Checkpoints every 500m (0.5 km, 1.0 km, ... up to 8.0 km)
   - Real-time Next 500m Countdown ("320m to Next 500m Checkpoint")
   - Audio Chime on 500m Checkpoint Crossing (Web Audio API)
   - Dual-Mode: [Live GPS Mode] & [Drive Simulator Mode] (for desktop/indoor testing)
   - Live Leaflet Map with smooth car marker, heading rotation, and traveled polyline
   - Dual-Rider HUD: Student Driver + Instructor Co-pilot
   - Instant Ride Logging (+8.0 km) with store & Supabase sync
   ========================================================================== */

import L from 'leaflet';
import { store } from '../store.js';

let activeLiveMap = null;
let activeWatchId = null;
let simulationTimer = null;

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

// Synthesize pleasant celebratory chime when 500m checkpoint is reached (No external asset needed)
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
    gain1.gain.setValueAtTime(0.18, now);
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
    gain2.gain.setValueAtTime(0.22, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.45);
  } catch (e) {
    // Non-blocking fallback
  }
}

// Generate an accurate 8.0 km (8000 m) smoothed polyline with 16 500m checkpoints & trees
function build8KmTrack(basePath, startPoint, endPoint) {
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

  const TOTAL_STEPS = 240;
  const TOTAL_METERS = 8000; // 8.0 km fixed
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

  // 16 Checkpoints at exact 500m intervals (500m, 1000m, ... 8000m)
  const checkpointLabels = [
    { title: 'Cockpit Drill & ABC Orientation', place: 'Depot Exit Corridor' },
    { title: 'Steering Centering Check', place: 'Bakarapuram Avenue' },
    { title: 'Smooth Upshift (Gear 2)', place: 'Residential Link' },
    { title: 'Pedestrian Zone Yield', place: 'Town North Bypass' },
    { title: '45° Turn Maneuver', place: 'Crossroad Sector' },
    { title: 'Mirror & Blindspot Sweep', place: 'Market Road East' },
    { title: 'Following Distance Buffer', place: 'RTC Approach Avenue' },
    { title: 'Clock Tower Roundabout (Halfway 🎯)', place: 'Central Traffic Circle' },
    { title: 'Speed Modulation Check', place: 'JNTU Ring Road Link' },
    { title: 'Lane Centering Control', place: 'Outer Ring Parkway' },
    { title: 'Controlled Downshift', place: 'Bypass Flyover Descent' },
    { title: 'Traffic Intersection Flow', place: 'Municipal Junction' },
    { title: 'Hill Incline Hold & Start', place: 'Ghat Elevation Road' },
    { title: 'Curbside Margin Precision', place: 'South Boulevard' },
    { title: 'RTO 8-Track Simulated Entry', place: 'Test Facility Approach' },
    { title: '8.0 km Finish Line & Docking 🏁', place: 'Academy Depot Arrival' }
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

  // Roadside trees for aesthetic driving environment
  const trees = [];
  const treeVarieties = [
    { type: 'oak', emoji: '🌳', name: 'Banyan Oak' },
    { type: 'pine', emoji: '🌲', name: 'Evergreen Pine' },
    { type: 'palm', emoji: '🌴', name: 'Canopy Palm' },
    { type: 'flower', emoji: '🌸', name: 'Gulmohar Tree' }
  ];

  for (let i = 6; i < track.length - 6; i += 7) {
    const p1 = track[i];
    const p2 = track[i + 1];
    const bearing = calculateBearing([p1.lat, p1.lng], [p2.lat, p2.lng]);
    const perpBearing = (bearing + (i % 2 === 0 ? 90 : -90)) * Math.PI / 180;
    const offsetMeters = 16 + (i % 8);
    const dLat = (offsetMeters * Math.cos(perpBearing)) / 111000;
    const dLng = (offsetMeters * Math.sin(perpBearing)) / (111000 * Math.cos(p1.lat * Math.PI / 180));

    const variety = treeVarieties[Math.floor(i / 7) % treeVarieties.length];
    trees.push({
      lat: p1.lat + dLat,
      lng: p1.lng + dLng,
      variety,
      size: 26 + (i % 8)
    });
  }

  return { track, checkpoints, trees };
}

/**
 * Main function to launch the Live GPS Ride Tracker Modal
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
  const stage = session?.stage || (dayNumber <= 10 ? 'Stage 1: Basic Driving' : dayNumber <= 15 ? 'Stage 2: Intermediate Driving' : 'Stage 3: Advanced Road Skills');

  const { track, checkpoints, trees } = build8KmTrack(
    session?.route?.path,
    session?.route?.startPoint,
    session?.route?.endPoint
  );

  // Runtime State
  let activeMode = 'gps'; // 'gps' | 'simulator'
  let totalDistanceMeters = 0;
  let currentSpeedKmh = 0;
  let lastGpsPoint = null;
  let lastGpsTime = null;
  let gpsAccuracyMeters = null;
  let traveledCoords = [];
  let isRideCompleted = false;

  // Simulator State
  let simStep = 0;
  let isSimPlaying = false;
  let simSpeedMultiplier = 2; // default
  let followCarMode = true;

  // Leaflet Map Handles
  let carMarker = null;
  let livePolyline = null;
  let checkpointMarkers = [];
  let resizeHandler = null;

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
        <!-- TOP GAMIFIED HUD HEADER -->
        <header style="
          background: linear-gradient(180deg, rgba(13, 16, 23, 0.98) 0%, rgba(13, 16, 23, 0.94) 100%);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0.65rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 1000;
          box-shadow: 0 4px 24px rgba(0,0,0,0.6);
          flex-wrap: wrap;
          gap: 0.75rem;
        ">
          <!-- Left: Title & Day Info -->
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
              box-shadow: 0 0 24px rgba(34, 197, 94, 0.5);
            ">🚗</div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span id="gps-status-badge" style="
                  background: rgba(34, 197, 94, 0.2);
                  border: 1px solid #22c55e;
                  color: #22c55e;
                  font-size: 0.7rem;
                  font-weight: 800;
                  padding: 0.2rem 0.6rem;
                  border-radius: 9999px;
                  letter-spacing: 0.04em;
                  display: flex;
                  align-items: center;
                  gap: 0.35rem;
                ">
                  <span class="live-dot" style="width:7px; height:7px; border-radius:50%; background:#22c55e; box-shadow:0 0 8px #22c55e; display:inline-block; animation:pulseDot 1.2s infinite ease-in-out;"></span>
                  <span id="gps-status-text">INITIALIZING GPS...</span>
                </span>
                <span style="font-size: 1.05rem; font-weight: 900; color: #ffffff;">
                  Day ${dayNumber}: ${objective}
                </span>
              </div>
              <div style="font-size: 0.75rem; color: #a1a1aa; margin-top: 0.2rem;">
                Target: 8.00 km (8000m) · 16 Checkpoints Every 500m · ${currentStudent.name} (${currentStudent.package || 'Driving Course'})
              </div>
            </div>
          </div>

          <!-- Center: Dynamic Distance & 500m Checkpoints Odometer HUD -->
          <div style="
            display: flex;
            align-items: center;
            gap: 1.25rem;
            background: rgba(0, 0, 0, 0.65);
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 12px;
            padding: 0.45rem 1.35rem;
          ">
            <div>
              <div style="font-size: 0.62rem; color: #71717a; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Distance Driven</div>
              <div style="font-size: 1.45rem; font-weight: 900; color: #22c55e; font-family: var(--font-mono); line-height: 1.1;">
                <span id="hud-distance-km">0.00</span> <span style="font-size: 0.85rem; color: #ffffff;">km</span>
                <span id="hud-distance-meters" style="font-size: 0.75rem; color: #a1a1aa; margin-left: 0.35rem;">(0 m)</span>
              </div>
            </div>
            <div style="width: 1px; height: 32px; background: rgba(255,255,255,0.12);"></div>
            <div>
              <div style="font-size: 0.62rem; color: #71717a; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">500m Milestones</div>
              <div style="font-size: 1.35rem; font-weight: 900; color: #ffffff; font-family: var(--font-mono); line-height: 1.1;">
                <span id="hud-checkpoints-cleared">0</span> <span style="font-size: 0.85rem; color: #71717a;">/ 16</span>
              </div>
            </div>
            <div style="width: 1px; height: 32px; background: rgba(255,255,255,0.12);"></div>
            <div>
              <div style="font-size: 0.62rem; color: #71717a; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Vehicle Speed</div>
              <div style="font-size: 1.35rem; font-weight: 900; color: #38bdf8; font-family: var(--font-mono); line-height: 1.1;">
                <span id="hud-speed">0</span> <span style="font-size: 0.8rem; color: #a1a1aa;">km/h</span>
              </div>
            </div>
            <div style="width: 1px; height: 32px; background: rgba(255,255,255,0.12);"></div>
            <div>
              <div style="font-size: 0.62rem; color: #f59e0b; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Next 500m Target</div>
              <div style="font-size: 1.1rem; font-weight: 900; color: #fbbf24; font-family: var(--font-mono); line-height: 1.1;">
                <span id="hud-next-checkpoint-dist">500m</span>
              </div>
            </div>
          </div>

          <!-- Right: Mode Switcher & Close -->
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <!-- Mode Switcher Pill (Live GPS vs Simulator) -->
            <div style="
              display: flex;
              background: rgba(255, 255, 255, 0.06);
              border: 1px solid rgba(255, 255, 255, 0.12);
              border-radius: 8px;
              overflow: hidden;
            ">
              <button type="button" id="btn-mode-gps" style="
                background: #22c55e;
                color: #000000;
                border: none;
                padding: 0.45rem 0.85rem;
                font-size: 0.75rem;
                font-weight: 800;
                cursor: pointer;
                transition: all 0.2s ease;
              ">📡 Real GPS</button>
              <button type="button" id="btn-mode-sim" style="
                background: transparent;
                color: #a1a1aa;
                border: none;
                padding: 0.45rem 0.85rem;
                font-size: 0.75rem;
                font-weight: 800;
                cursor: pointer;
                transition: all 0.2s ease;
              ">🎮 Simulator</button>
            </div>

            <!-- Follow Car Toggle -->
            <button type="button" id="btn-toggle-camera-mode" style="
              background: rgba(255, 255, 255, 0.08);
              border: 1px solid rgba(255, 255, 255, 0.16);
              color: #ffffff;
              padding: 0.45rem 0.85rem;
              border-radius: 8px;
              font-size: 0.78rem;
              font-weight: 700;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.4rem;
            ">
              <span id="cam-icon">🔍</span>
              <span id="cam-text">Follow Car</span>
            </button>

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

        <!-- 16-SEGMENT CHECKPOINT PROGRESS BAR (500M EACH) -->
        <div style="
          background: #11141c;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.4rem 1rem;
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
              transition: all 0.3s ease;
              cursor: pointer;
              white-space: nowrap;
            " title="${cp.label}: ${cp.title} (${cp.distanceMeters}m)">
              ${cp.label}
            </div>
          `).join('')}
        </div>

        <!-- MAIN INTERACTIVE MAP CONTAINER -->
        <div style="flex: 1; position: relative; overflow: hidden; height: 100%;">
          <div id="live-ride-leaflet-map" style="width: 100%; height: 100%; min-height: 480px; background: #0f172a;"></div>

          <!-- FLOATING GPS INFO HUD (LAT, LNG, ACCURACY) -->
          <div style="
            position: absolute;
            bottom: 16px;
            left: 16px;
            background: rgba(13, 16, 23, 0.88);
            border: 1px solid rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border-radius: 8px;
            padding: 0.5rem 0.85rem;
            font-size: 0.72rem;
            color: #a1a1aa;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 4px 16px rgba(0,0,0,0.5);
          ">
            <div>
              <span style="color:#71717a;">GPS FIX:</span>
              <strong id="gps-coords" style="color:#ffffff; font-family:var(--font-mono); margin-left:0.25rem;">14.42300, 78.22850</strong>
            </div>
            <div style="width:1px; height:16px; background:rgba(255,255,255,0.1);"></div>
            <div>
              <span style="color:#71717a;">ACCURACY:</span>
              <strong id="gps-accuracy" style="color:#22c55e; font-family:var(--font-mono); margin-left:0.25rem;">± 4m</strong>
            </div>
            <div style="width:1px; height:16px; background:rgba(255,255,255,0.1);"></div>
            <div>
              <span style="color:#71717a;">INTERVAL:</span>
              <strong style="color:#38bdf8; font-family:var(--font-mono); margin-left:0.25rem;">500m Steps</strong>
            </div>
          </div>

          <!-- FLOATING NOTIFICATION BANNER FOR 500M CHECKPOINTS -->
          <div id="checkpoint-toast-banner" style="
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-30px);
            opacity: 0;
            pointer-events: none;
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.98), rgba(16, 185, 129, 0.98));
            color: #000000;
            padding: 0.75rem 1.8rem;
            border-radius: 9999px;
            font-size: 0.95rem;
            font-weight: 900;
            box-shadow: 0 10px 35px rgba(34, 197, 94, 0.6);
            display: flex;
            align-items: center;
            gap: 0.65rem;
            transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            z-index: 1200;
          ">
            <span style="font-size:1.25rem;">🎯</span>
            <span id="checkpoint-toast-text">500m Checkpoint Cleared!</span>
          </div>

          <!-- FLOATING FINISH CEREMONY OVERLAY -->
          <div id="finish-ride-ceremony" style="
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(10px);
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1500;
            text-align: center;
            padding: 1.5rem;
          ">
            <div style="
              width: 86px;
              height: 86px;
              border-radius: 50%;
              background: #22c55e;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 3rem;
              box-shadow: 0 0 60px #22c55e;
              margin-bottom: 1.25rem;
            ">🏆</div>
            <h2 style="font-size: 2.2rem; font-weight: 900; color: #ffffff; margin: 0 0 0.5rem 0;">
              8.0 km Practical Ride Completed!
            </h2>
            <p style="font-size: 1.05rem; color: #a1a1aa; max-width: 540px; line-height: 1.5; margin: 0 0 1.5rem 0;">
              Day ${dayNumber} training successfully finished! All 16 checkpoints (every 500m) cleared under Instructor <strong>${currentTrainer.name}</strong>.
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
                <div style="font-size: 0.7rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Student Driver</div>
                <div style="font-size: 1.1rem; font-weight: 800; color: #ffffff;">${currentStudent.name}</div>
              </div>
            </div>

            <button type="button" id="btn-save-completed-ride" style="
              background: #22c55e;
              color: #000000;
              border: none;
              padding: 0.9rem 2.5rem;
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

        <!-- BOTTOM CONTROLS & RIDER COCKPIT BAR -->
        <footer style="
          background: #11141c;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 1000;
          flex-wrap: wrap;
          gap: 1rem;
        ">
          <!-- Left: Dual Rider Cards (Student + Trainer) -->
          <div style="display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap;">
            <!-- Student Driver Card -->
            <div style="
              display: flex;
              align-items: center;
              gap: 0.65rem;
              background: rgba(255, 255, 255, 0.04);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 8px;
              padding: 0.4rem 0.75rem;
            ">
              <div style="
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: #ffffff;
                color: #000000;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 900;
                font-size: 0.9rem;
              ">👨‍🎓</div>
              <div>
                <div style="font-size: 0.825rem; font-weight: 800; color: #ffffff;">${currentStudent.name}</div>
                <div style="font-size: 0.68rem; color: #a1a1aa;">Driver (Candidate) · Day ${dayNumber}/20</div>
              </div>
            </div>

            <div style="color: #52525b; font-weight: 900;">+</div>

            <!-- Trainer Co-pilot Card -->
            <div style="
              display: flex;
              align-items: center;
              gap: 0.65rem;
              background: rgba(255, 255, 255, 0.04);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 8px;
              padding: 0.4rem 0.75rem;
            ">
              <div style="
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: #22c55e;
                color: #000000;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 900;
                font-size: 0.9rem;
              ">👨‍🏫</div>
              <div>
                <div style="font-size: 0.825rem; font-weight: 800; color: #ffffff;">${currentTrainer.name}</div>
                <div style="font-size: 0.68rem; color: #22c55e;">Instructor · Dual-Control Car</div>
              </div>
            </div>
          </div>

          <!-- Center: Simulator / GPS Control Buttons -->
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <!-- Real GPS Refresh / Reconnect Button -->
            <button type="button" id="btn-gps-reconnect" style="
              background: rgba(34, 197, 94, 0.15);
              border: 1px solid rgba(34, 197, 94, 0.4);
              color: #22c55e;
              padding: 0.55rem 1rem;
              border-radius: 8px;
              font-size: 0.8rem;
              font-weight: 800;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.4rem;
            ">
              <span>🔄</span>
              <span>Re-sync GPS</span>
            </button>

            <!-- Simulator Controls (Visible in Simulator Mode) -->
            <div id="sim-controls-wrapper" style="display: none; align-items: center; gap: 0.45rem;">
              <button type="button" id="btn-play-pause-sim" style="
                background: #ffffff;
                color: #000000;
                border: none;
                padding: 0.55rem 1.15rem;
                border-radius: 8px;
                font-size: 0.85rem;
                font-weight: 800;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.4rem;
              ">
                <span id="sim-play-icon">▶</span>
                <span id="sim-play-text">Start Simulation</span>
              </button>

              <div style="
                display: flex;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                overflow: hidden;
              ">
                <button type="button" class="btn-speed-mult" data-speed="1" style="background:transparent; color:#a1a1aa; border:none; padding:0.5rem 0.65rem; font-size:0.75rem; font-weight:800; cursor:pointer;">1x</button>
                <button type="button" class="btn-speed-mult active" data-speed="2" style="background:#ffffff; color:#000000; border:none; padding:0.5rem 0.65rem; font-size:0.75rem; font-weight:800; cursor:pointer;">2x</button>
                <button type="button" class="btn-speed-mult" data-speed="5" style="background:transparent; color:#a1a1aa; border:none; padding:0.5rem 0.65rem; font-size:0.75rem; font-weight:800; cursor:pointer;">5x</button>
                <button type="button" class="btn-speed-mult" data-speed="10" style="background:transparent; color:#a1a1aa; border:none; padding:0.5rem 0.65rem; font-size:0.75rem; font-weight:800; cursor:pointer;">10x</button>
              </div>

              <!-- Quick +500m Test Step -->
              <button type="button" id="btn-step-500m" style="
                background: rgba(245, 158, 11, 0.18);
                border: 1px solid rgba(245, 158, 11, 0.4);
                color: #fbbf24;
                padding: 0.55rem 0.85rem;
                border-radius: 8px;
                font-size: 0.78rem;
                font-weight: 800;
                cursor: pointer;
              " title="Instantly advance by 500 meters to test checkpoint">
                +500m Checkpoint
              </button>

              <!-- Fast Finish -->
              <button type="button" id="btn-fast-finish" style="
                background: rgba(34, 197, 94, 0.15);
                border: 1px solid rgba(34, 197, 94, 0.4);
                color: #22c55e;
                padding: 0.55rem 0.85rem;
                border-radius: 8px;
                font-size: 0.78rem;
                font-weight: 800;
                cursor: pointer;
              ">
                ⏩ Finish 8km
              </button>
            </div>
          </div>

          <!-- Right: Save / Log Button -->
          <div>
            <button type="button" id="btn-complete-direct" style="
              background: #22c55e;
              border: none;
              color: #000000;
              padding: 0.6rem 1.4rem;
              border-radius: 8px;
              font-size: 0.85rem;
              font-weight: 900;
              cursor: pointer;
              box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4);
            ">
              Log Day ${dayNumber} Ride (8.0 km) ✓
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
    if (activeLiveMap) {
      activeLiveMap.remove();
      activeLiveMap = null;
    }
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }
    modalRoot.innerHTML = '';
  };

  modalRoot.querySelector('#btn-close-live-ride').addEventListener('click', closeModal);

  // Initialize Leaflet Map
  setTimeout(() => {
    try {
      const mapContainer = document.getElementById('live-ride-leaflet-map');
      if (!mapContainer) return;

      if (activeLiveMap) {
        activeLiveMap.remove();
        activeLiveMap = null;
      }

      const map = L.map(mapContainer, {
        zoomControl: true,
        attributionControl: false
      });
      activeLiveMap = map;

      // Reliable OpenStreetMap tiles with dark fallback
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      const allCoords = track.map(t => [t.lat, t.lng]);

      // Base Road Visual Layer (Wide dark asphalt)
      L.polyline(allCoords, {
        color: '#0f172a',
        weight: 16,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Inner Asphalt Pavement
      L.polyline(allCoords, {
        color: '#334155',
        weight: 12,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Road Center Dashed Line
      L.polyline(allCoords, {
        color: '#facc15',
        weight: 2.5,
        opacity: 0.9,
        dashArray: '8, 12',
        lineCap: 'butt'
      }).addTo(map);

      // Live Traveled Polyline (High-visibility Vibrant Emerald Green)
      traveledCoords = [allCoords[0]];
      livePolyline = L.polyline(traveledCoords, {
        color: '#16a34a',
        weight: 7,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Start Marker (Depot 0.0 km)
      const startPos = allCoords[0];
      const startIcon = L.divIcon({
        className: 'gamified-start-marker',
        html: `
          <div style="transform: translate(-50%, -100%); display:flex; flex-direction:column; align-items:center;">
            <div style="background:#16a34a; color:#ffffff; font-weight:900; font-size:11px; padding:3px 8px; border-radius:6px; white-space:nowrap; border:2px solid #ffffff; box-shadow:0 4px 12px rgba(0,0,0,0.4);">
              🏁 0.0 km DEPOT START
            </div>
            <div style="width:2px; height:10px; background:#16a34a;"></div>
          </div>
        `,
        iconSize: [0, 0]
      });
      L.marker(startPos, { icon: startIcon }).addTo(map);

      // Finish Marker (8.0 km Goal)
      const endPos = allCoords[allCoords.length - 1];
      const finishIcon = L.divIcon({
        className: 'gamified-finish-marker',
        html: `
          <div style="transform: translate(-50%, -100%); display:flex; flex-direction:column; align-items:center;">
            <div style="background:#0f172a; color:#facc15; font-weight:900; font-size:11px; padding:3px 8px; border-radius:6px; white-space:nowrap; border:2px solid #facc15; box-shadow:0 4px 12px rgba(0,0,0,0.4);">
              🏁 8.0 km FINISH
            </div>
            <div style="width:2px; height:10px; background:#0f172a;"></div>
          </div>
        `,
        iconSize: [0, 0]
      });
      L.marker(endPos, { icon: finishIcon }).addTo(map);

      // Roadside Trees
      trees.forEach(tree => {
        const treeIcon = L.divIcon({
          className: 'gamified-tree-marker',
          html: `<div style="font-size:${tree.size}px; line-height:1; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3)); transform:translate(-50%, -50%); pointer-events:none;">${tree.variety.emoji}</div>`,
          iconSize: [0, 0]
        });
        L.marker([tree.lat, tree.lng], { icon: treeIcon }).addTo(map);
      });

      // 16 Checkpoint Milestone Beacons (Every 500m)
      checkpointMarkers = checkpoints.map(cp => {
        const cpIcon = L.divIcon({
          className: `gamified-cp-marker cp-marker-${cp.id}`,
          html: `
            <div id="cp-beacon-${cp.id}" style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: #ffffff;
              border: 2.5px solid #f59e0b;
              box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              transform: translate(-50%, -50%);
              cursor: pointer;
              transition: all 0.3s ease;
            ">
              <span style="font-size: 8px; font-weight: 900; color: #b45309; font-family: var(--font-mono); line-height: 1;">${cp.id}</span>
              <span style="font-size: 7px; font-weight: 800; color: #0f172a; line-height: 1;">${cp.label}</span>
            </div>
          `,
          iconSize: [0, 0]
        });

        const marker = L.marker([cp.lat, cp.lng], { icon: cpIcon }).addTo(map);
        marker.bindPopup(`
          <div style="color:#0f172a; font-size:12px; padding:2px;">
            <b style="color:#b45309;">Checkpoint ${cp.id} (${cp.label})</b><br>
            <strong>${cp.title}</strong><br>
            <span style="color:#64748b;">${cp.place}</span>
          </div>
        `);
        return { cp, marker };
      });

      // Dual Rider Moving Training Car Marker
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
            <!-- Floating Heads-Up Dual Rider Tag -->
            <div style="
              background: #0f172a;
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
              box-shadow: 0 4px 12px rgba(0,0,0,0.5);
              margin-bottom: 3px;
            ">
              <span style="color: #38bdf8;">👨‍🎓 ${currentStudent.name.split(' ')[0]}</span>
              <span style="color: #64748b;">·</span>
              <span style="color: #4ade80;">👨‍🏫 ${currentTrainer.name.split(' ')[0]}</span>
            </div>

            <!-- Dual-Control Driving School Car -->
            <div id="car-rotation-node" style="
              width: 38px;
              height: 38px;
              background: #facc15;
              border: 2px solid #0f172a;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 16px rgba(0,0,0,0.5);
              transition: transform 0.2s ease;
            ">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="3" width="14" height="18" rx="4" fill="#0f172a" stroke="#ffffff" stroke-width="1"/>
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

      // Fit map to full 8.0 km track bounds
      const trackBounds = L.polyline(allCoords).getBounds();
      map.fitBounds(trackBounds, { padding: [50, 50] });

      // Invalidate sizes to ensure zero grey areas
      map.invalidateSize();
      setTimeout(() => {
        map.invalidateSize();
        if (followCarMode) {
          map.setView(startPos, 16);
        }
      }, 150);
      setTimeout(() => map.invalidateSize(), 400);

      resizeHandler = () => map.invalidateSize();
      window.addEventListener('resize', resizeHandler);

      // =========================================================
      // MILESTONE & HUD UPDATE CORE LOGIC
      // =========================================================
      function updateRideDistance(newTotalMeters, currentLat, currentLng, speedKmh = 0) {
        if (isRideCompleted) return;

        totalDistanceMeters = Math.min(8000, Math.max(totalDistanceMeters, newTotalMeters));
        const distKm = (totalDistanceMeters / 1000).toFixed(2);

        // Update Odometer
        const distKmElem = document.getElementById('hud-distance-km');
        if (distKmElem) distKmElem.textContent = distKm;

        const distMElem = document.getElementById('hud-distance-meters');
        if (distMElem) distMElem.textContent = `(${Math.round(totalDistanceMeters)} m)`;

        // Update Speed
        const speedElem = document.getElementById('hud-speed');
        if (speedElem) speedElem.textContent = Math.round(speedKmh);

        // Update Map Marker & Traveled Path
        if (carMarker) carMarker.setLatLng([currentLat, currentLng]);

        traveledCoords.push([currentLat, currentLng]);
        if (livePolyline) livePolyline.setLatLngs(traveledCoords);

        if (followCarMode && map) {
          map.panTo([currentLat, currentLng], { animate: true, duration: 0.25 });
        }

        // Update Coordinates HUD
        const coordsElem = document.getElementById('gps-coords');
        if (coordsElem) coordsElem.textContent = `${currentLat.toFixed(5)}, ${currentLng.toFixed(5)}`;

        // Check 16 Checkpoints (Every 500m)
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

        // Next 500m Target Countdown
        const nextCp = checkpoints.find(c => !c.cleared);
        const nextDistElem = document.getElementById('hud-next-checkpoint-dist');
        if (nextDistElem) {
          if (nextCp) {
            const remainingM = Math.max(0, Math.round(nextCp.distanceMeters - totalDistanceMeters));
            nextDistElem.textContent = `${remainingM}m to ${nextCp.label}`;
          } else {
            nextDistElem.textContent = 'Goal Reached! 🏁';
          }
        }

        // Trigger finish if 8000m reached
        if (totalDistanceMeters >= 8000) {
          finishRide();
        }
      }

      function triggerCheckpointReached(cp) {
        // Play Chime
        playMilestoneChime();

        // Milestone ribbon glow
        const seg = document.getElementById(`prog-seg-${cp.id}`);
        if (seg) {
          seg.style.background = '#22c55e';
          seg.style.borderColor = '#22c55e';
          seg.style.color = '#000000';
          seg.innerHTML = `✓ ${cp.label}`;
        }

        // Map beacon marker transition
        const beacon = document.getElementById(`cp-beacon-${cp.id}`);
        if (beacon) {
          beacon.style.borderColor = '#ffffff';
          beacon.style.background = '#16a34a';
          beacon.style.boxShadow = '0 0 18px rgba(22, 163, 74, 0.9)';
          beacon.innerHTML = `<span style="font-size: 13px; font-weight: 900; color: #ffffff;">✓</span>`;
        }

        // Toast celebration banner
        const banner = document.getElementById('checkpoint-toast-banner');
        const text = document.getElementById('checkpoint-toast-text');
        if (banner && text) {
          text.textContent = `Checkpoint ${cp.id}/16 Cleared (${cp.label}) · ${cp.title} (+500m)`;
          banner.style.opacity = '1';
          banner.style.transform = 'translateX(-50%) translateY(0)';
          setTimeout(() => {
            banner.style.opacity = '0';
            banner.style.transform = 'translateX(-50%) translateY(-30px)';
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

        // Complete all 16 checkpoints
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
      // REAL DEVICE GPS TRACKING ENGINE
      // =========================================================
      function startRealGpsTracking() {
        const statusBadge = document.getElementById('gps-status-badge');
        const statusText = document.getElementById('gps-status-text');

        if (!navigator.geolocation) {
          if (statusBadge && statusText) {
            statusBadge.style.background = 'rgba(239, 68, 68, 0.2)';
            statusBadge.style.borderColor = '#ef4444';
            statusBadge.style.color = '#ef4444';
            statusText.textContent = 'GPS NOT SUPPORTED — SWITCH TO SIMULATOR';
          }
          return;
        }

        if (activeWatchId !== null) {
          navigator.geolocation.clearWatch(activeWatchId);
          activeWatchId = null;
        }

        if (statusText) statusText.textContent = 'ACQUIRING SATELLITE FIX...';

        activeWatchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, accuracy, speed, heading } = position.coords;
            gpsAccuracyMeters = accuracy;

            // Update GPS accuracy pill
            const accElem = document.getElementById('gps-accuracy');
            if (accElem) accElem.textContent = `± ${Math.round(accuracy)}m`;

            if (statusBadge && statusText) {
              statusBadge.style.background = 'rgba(34, 197, 94, 0.2)';
              statusBadge.style.borderColor = '#22c55e';
              statusBadge.style.color = '#22c55e';
              statusText.textContent = `LIVE GPS ACTIVE (±${Math.round(accuracy)}m)`;
            }

            const now = Date.now();
            let stepDistanceMeters = 0;
            let calculatedSpeedKmh = speed ? (speed * 3.6) : 0;

            if (lastGpsPoint) {
              const dMeters = haversineMeters([lastGpsPoint.lat, lastGpsPoint.lng], [latitude, longitude]);
              // Ignore stationary jitter (< 2.5m)
              if (dMeters >= 2.5) {
                stepDistanceMeters = dMeters;
                const dSeconds = (now - lastGpsTime) / 1000;
                if (!speed && dSeconds > 0) {
                  calculatedSpeedKmh = (dMeters / dSeconds) * 3.6;
                }

                // Update Heading Rotation
                const bearing = calculateBearing([lastGpsPoint.lat, lastGpsPoint.lng], [latitude, longitude]);
                const rotNode = document.getElementById('car-rotation-node');
                if (rotNode) rotNode.style.transform = `rotate(${bearing}deg)`;

                lastGpsPoint = { lat: latitude, lng: longitude };
                lastGpsTime = now;
              }
            } else {
              lastGpsPoint = { lat: latitude, lng: longitude };
              lastGpsTime = now;
              // Center map on student's first GPS location
              if (map) map.setView([latitude, longitude], 17);
            }

            const newTotalMeters = totalDistanceMeters + stepDistanceMeters;
            updateRideDistance(newTotalMeters, latitude, longitude, calculatedSpeedKmh);
          },
          (error) => {
            console.warn('GPS Warning:', error);
            if (statusBadge && statusText) {
              statusBadge.style.background = 'rgba(245, 158, 11, 0.2)';
              statusBadge.style.borderColor = '#f59e0b';
              statusBadge.style.color = '#fbbf24';
              statusText.textContent = 'GPS WAITING / DENIED — TRY SIMULATOR';
            }
          },
          {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 15000
          }
        );
      }

      // =========================================================
      // DRIVE SIMULATOR ENGINE (FOR DESKTOP / INDOOR DEMO)
      // =========================================================
      function startSimulation() {
        if (isRideCompleted) return;
        isSimPlaying = true;
        const playIcon = document.getElementById('sim-play-icon');
        const playText = document.getElementById('sim-play-text');
        if (playIcon) playIcon.textContent = '⏸';
        if (playText) playText.textContent = 'Pause Simulation';

        if (simulationTimer) clearInterval(simulationTimer);

        const intervalMs = Math.max(40, Math.floor(180 / simSpeedMultiplier));

        simulationTimer = setInterval(() => {
          if (simStep >= track.length - 1) {
            finishRide();
            return;
          }

          simStep++;
          const pt = track[simStep];
          if (!pt) return;

          // Rotate heading
          if (simStep < track.length - 1) {
            const nextPt = track[simStep + 1];
            const bearing = calculateBearing([pt.lat, pt.lng], [nextPt.lat, nextPt.lng]);
            const rotNode = document.getElementById('car-rotation-node');
            if (rotNode) rotNode.style.transform = `rotate(${bearing}deg)`;
          }

          const simSpeed = 28 + Math.round((Math.sin(simStep / 6) + 1) * 6);
          updateRideDistance(pt.distanceMeters, pt.lat, pt.lng, simSpeed);
        }, intervalMs);
      }

      function pauseSimulation() {
        isSimPlaying = false;
        const playIcon = document.getElementById('sim-play-icon');
        const playText = document.getElementById('sim-play-text');
        if (playIcon) playIcon.textContent = '▶';
        if (playText) playText.textContent = 'Resume Simulation';

        if (simulationTimer) {
          clearInterval(simulationTimer);
          simulationTimer = null;
        }
      }

      // Mode Switch: Real GPS vs Simulator
      const btnModeGps = modalRoot.querySelector('#btn-mode-gps');
      const btnModeSim = modalRoot.querySelector('#btn-mode-sim');
      const simControlsWrapper = modalRoot.querySelector('#sim-controls-wrapper');
      const btnGpsReconnect = modalRoot.querySelector('#btn-gps-reconnect');

      btnModeGps.addEventListener('click', () => {
        activeMode = 'gps';
        btnModeGps.style.background = '#22c55e';
        btnModeGps.style.color = '#000000';
        btnModeSim.style.background = 'transparent';
        btnModeSim.style.color = '#a1a1aa';
        simControlsWrapper.style.display = 'none';
        btnGpsReconnect.style.display = 'flex';
        pauseSimulation();
        startRealGpsTracking();
      });

      btnModeSim.addEventListener('click', () => {
        activeMode = 'simulator';
        btnModeSim.style.background = '#ffffff';
        btnModeSim.style.color = '#000000';
        btnModeGps.style.background = 'transparent';
        btnModeGps.style.color = '#a1a1aa';
        simControlsWrapper.style.display = 'flex';
        btnGpsReconnect.style.display = 'none';

        if (activeWatchId !== null && navigator.geolocation) {
          navigator.geolocation.clearWatch(activeWatchId);
          activeWatchId = null;
        }

        const statusBadge = document.getElementById('gps-status-badge');
        const statusText = document.getElementById('gps-status-text');
        if (statusBadge && statusText) {
          statusBadge.style.background = 'rgba(56, 189, 248, 0.2)';
          statusBadge.style.borderColor = '#38bdf8';
          statusBadge.style.color = '#38bdf8';
          statusText.textContent = 'SIMULATOR DRIVE ACTIVE (500M INTERVALS)';
        }

        startSimulation();
      });

      // GPS Reconnect Click
      btnGpsReconnect.addEventListener('click', () => {
        startRealGpsTracking();
      });

      // Simulator Play/Pause
      const btnPlayPauseSim = modalRoot.querySelector('#btn-play-pause-sim');
      btnPlayPauseSim?.addEventListener('click', () => {
        if (isSimPlaying) {
          pauseSimulation();
        } else {
          startSimulation();
        }
      });

      // Simulator Speed Multipliers
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

      // +500m Checkpoint Step Button
      modalRoot.querySelector('#btn-step-500m')?.addEventListener('click', () => {
        const nextTargetM = Math.min(8000, totalDistanceMeters + 500);
        const closest = track.reduce((prev, curr) => 
          Math.abs(curr.distanceMeters - nextTargetM) < Math.abs(prev.distanceMeters - nextTargetM) ? curr : prev
        );
        simStep = closest.step;
        updateRideDistance(nextTargetM, closest.lat, closest.lng, 35);
      });

      // Fast-forward to finish
      modalRoot.querySelector('#btn-fast-finish')?.addEventListener('click', () => {
        const lastPt = track[track.length - 1];
        simStep = track.length - 1;
        updateRideDistance(8000, lastPt.lat, lastPt.lng, 40);
        finishRide();
      });

      // Camera Follow Toggle
      const btnToggleCam = modalRoot.querySelector('#btn-toggle-camera-mode');
      const camIcon = modalRoot.querySelector('#cam-icon');
      const camText = modalRoot.querySelector('#cam-text');

      btnToggleCam?.addEventListener('click', () => {
        followCarMode = !followCarMode;
        if (followCarMode) {
          camIcon.textContent = '🔍';
          camText.textContent = 'Follow Car';
          if (lastGpsPoint) {
            map.setView([lastGpsPoint.lat, lastGpsPoint.lng], 17);
          }
        } else {
          camIcon.textContent = '🗺️';
          camText.textContent = 'Full Route';
          map.fitBounds(L.polyline(allCoords).getBounds(), { padding: [50, 50] });
        }
      });

      // Save & Complete Ride Handler
      const handleSaveRide = () => {
        store.completeSession(currentStudent.id, dayNumber, {
          instructorNotes: `Day ${dayNumber} live 8.0 km ride completed with 16 500m checkpoints logged.`
        });
        if (onRideCompleted) onRideCompleted();
        closeModal();
      };

      modalRoot.querySelector('#btn-complete-direct')?.addEventListener('click', handleSaveRide);
      modalRoot.querySelector('#btn-save-completed-ride')?.addEventListener('click', handleSaveRide);

      // Initialize real GPS tracking immediately
      startRealGpsTracking();

    } catch (err) {
      console.error('Failed to initialize Live Ride GPS Map:', err);
    }
  }, 100);
}

export const openLiveRideTrackingModal = openLiveRideMapModal;
