/* ==========================================================================
   GAMIFIED LIVE RIDE TRACKING MAP COMPONENT (8.0 KM)
   GAFOOR DRIVING SCHOOL — PULIVENDULA, ANDHRA PRADESH

   Features:
   - Fullscreen gamified interactive driving map
   - Creative terrain environment with roadside trees (Oak, Pine, Palm, Blossom)
   - 16 Checkpoints every 500 meters (0.5 km to 8.0 km) with live milestone banners
   - Live moving dual-control car with both Student (driver) and Trainer (instructor)
   - Smooth camera auto-follow zoom and full 8 km overview toggle
   - Interactive driving controls (Play, Pause, 1x/2x/5x/10x speeds, Fast-Forward)
   - Full 8.0 km completion ceremony with instant progress save into store
   ========================================================================== */

import L from 'leaflet';
import { store } from '../store.js';

let activeLiveMap = null;
let animationTimer = null;

// Helper: Haversine distance in meters
function haversineMeters(p1, p2) {
  const R = 6371000;
  const dLat = (p2[0] - p1[0]) * Math.PI / 180;
  const dLng = (p2[1] - p1[1]) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Calculate bearing angle between two coordinates
function calculateBearing(start, end) {
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

// Generate an accurate 8.0 km (8000 m) smoothed polyline with 16 500m checkpoints & trees
function build8KmTrack(basePath, startPoint, endPoint) {
  // Pulivendula default coordinates fallback if path is short
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

  // Resample into 240 fine-grained road points
  const TOTAL_STEPS = 240;
  const TOTAL_METERS = 8000; // 8.0 km fixed
  const track = [];

  // Calculate cumulative distance along raw points
  const segmentDists = [0];
  let accumulated = 0;
  for (let i = 0; i < rawPoints.length - 1; i++) {
    const d = haversineMeters(rawPoints[i], rawPoints[i + 1]);
    accumulated += d;
    segmentDists.push(accumulated);
  }

  for (let step = 0; step <= TOTAL_STEPS; step++) {
    const targetDist = (step / TOTAL_STEPS) * accumulated;
    // Find segment
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
    const distanceMeters = (step / TOTAL_STEPS) * TOTAL_METERS;

    track.push({
      step,
      lat,
      lng,
      distanceMeters,
      distanceKm: (distanceMeters / 1000).toFixed(2)
    });
  }

  // Generate the 16 Checkpoints at exact 500m intervals (0.5 km to 8.0 km)
  const checkpoints = [];
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

  for (let i = 1; i <= 16; i++) {
    const targetM = i * 500;
    // Find closest step in track
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

  // Generate roadside trees along the route at left & right offsets
  const trees = [];
  const treeVarieties = [
    { type: 'oak', emoji: '🌳', name: 'Banyan Oak', color: '#16a34a' },
    { type: 'pine', emoji: '🌲', name: 'Evergreen Pine', color: '#15803d' },
    { type: 'palm', emoji: '🌴', name: 'Canopy Palm', color: '#22c55e' },
    { type: 'flower', emoji: '🌸', name: 'Gulmohar Tree', color: '#f43f5e' }
  ];

  for (let i = 6; i < track.length - 6; i += 7) {
    const p1 = track[i];
    const p2 = track[i + 1];
    const bearing = calculateBearing([p1.lat, p1.lng], [p2.lat, p2.lng]);
    const perpBearing = (bearing + (i % 2 === 0 ? 90 : -90)) * Math.PI / 180;
    const offsetMeters = 16 + (i % 8); // 16 to 24 meters off road center
    const dLat = (offsetMeters * Math.cos(perpBearing)) / 111000;
    const dLng = (offsetMeters * Math.sin(perpBearing)) / (111000 * Math.cos(p1.lat * Math.PI / 180));

    const variety = treeVarieties[(i / 7) % treeVarieties.length];
    trees.push({
      lat: p1.lat + dLat,
      lng: p1.lng + dLng,
      variety,
      size: 26 + (i % 8)
    });
  }

  return { track, checkpoints, trees };
}

export function openLiveRideMapModal({
  session,
  student,
  trainer,
  canTrainerComplete = true,
  onRideCompleted = null
}) {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  const currentStudent = student || store.getCurrentTrainee();
  const currentTrainer = trainer || store.trainers.find(t => t.id === currentStudent.assignedTrainerId) || store.trainers[0];
  const dayNumber = session?.dayNumber || currentStudent.currentDay || 1;
  const objective = session?.objective || 'Practical Driving Lesson';
  const stage = session?.stage || (dayNumber <= 10 ? 'Stage 1: Basic Driving' : dayNumber <= 15 ? 'Stage 2: Intermediate Driving' : 'Stage 3: Final Assessment & Parking');

  const { track, checkpoints, trees } = build8KmTrack(
    session?.route?.path,
    session?.route?.startPoint,
    session?.route?.endPoint
  );

  let currentStep = 0;
  let isPlaying = false;
  let speedMultiplier = 2; // default comfortable speed for demo
  let followCarMode = true;
  let carMarker = null;
  let livePolyline = null;
  let checkpointMarkers = [];
  let isCompleted = false;

  modalRoot.innerHTML = `
    <div class="mnc-modal-overlay" id="live-ride-overlay" style="padding:0; align-items:stretch; justify-content:stretch;">
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
          background: linear-gradient(180deg, rgba(13, 16, 23, 0.98) 0%, rgba(13, 16, 23, 0.92) 100%);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 1000;
          box-shadow: 0 4px 24px rgba(0,0,0,0.6);
        ">
          <!-- Left: Ride & Stage Badges -->
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <div style="
              width: 42px;
              height: 42px;
              border-radius: 10px;
              background: #22c55e;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.35rem;
              box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
            ">🚗</div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="
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
                "><span style="width:6px; height:6px; border-radius:50%; background:#22c55e; box-shadow:0 0 6px #22c55e; display:inline-block;"></span>LIVE 8 KM RIDE</span>
                <span style="font-size: 1.05rem; font-weight: 900; color: #ffffff;">
                  Day ${dayNumber}: ${objective}
                </span>
              </div>
              <div style="font-size: 0.78rem; color: #a1a1aa; margin-top: 0.15rem;">
                ${stage} · Pulivendula Sector · 16 Checkpoints (Every 500m)
              </div>
            </div>
          </div>

          <!-- Center: Dynamic Odometer & Metrics HUD -->
          <div style="
            display: flex;
            align-items: center;
            gap: 1.5rem;
            background: rgba(0, 0, 0, 0.45);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 0.4rem 1.25rem;
          ">
            <div>
              <div style="font-size: 0.62rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Distance Driven</div>
              <div style="font-size: 1.4rem; font-weight: 900; color: #22c55e; font-family: var(--font-mono); line-height: 1.1;">
                <span id="hud-distance-km">0.00</span> <span style="font-size: 0.85rem; color: #ffffff;">/ 8.00 km</span>
              </div>
            </div>
            <div style="width: 1px; height: 32px; background: rgba(255,255,255,0.1);"></div>
            <div>
              <div style="font-size: 0.62rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Checkpoints (500m)</div>
              <div style="font-size: 1.25rem; font-weight: 900; color: #ffffff; font-family: var(--font-mono); line-height: 1.1;">
                <span id="hud-checkpoints-cleared">0</span> <span style="font-size: 0.85rem; color: #71717a;">/ 16</span>
              </div>
            </div>
            <div style="width: 1px; height: 32px; background: rgba(255,255,255,0.1);"></div>
            <div>
              <div style="font-size: 0.62rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Vehicle Speed</div>
              <div style="font-size: 1.25rem; font-weight: 900; color: #38bdf8; font-family: var(--font-mono); line-height: 1.1;">
                <span id="hud-speed">30</span> <span style="font-size: 0.8rem; color: #a1a1aa;">km/h</span>
              </div>
            </div>
          </div>

          <!-- Right: Interactive View Toggles & Close -->
          <div style="display: flex; align-items: center; gap: 0.65rem;">
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
              <span id="cam-text">Follow Car Zoom</span>
            </button>

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
            ">✕</button>
          </div>
        </header>

        <!-- 16-SEGMENT CHECKPOINT PROGRESS BAR -->
        <div style="
          background: #11141c;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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
              min-width: 44px;
              height: 22px;
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
            " title="${cp.label}: ${cp.title}">
              ${cp.label}
            </div>
          `).join('')}
        </div>

        <!-- MAIN INTERACTIVE MAP CONTAINER -->
        <div style="flex: 1; position: relative; overflow: hidden; height: 100%;">
          <div id="live-ride-leaflet-map" style="width: 100%; height: 100%; min-height: 480px; background: #f1f5f9;"></div>

          <!-- FLOATING NOTIFICATION BANNER FOR 500M CHECKPOINTS -->
          <div id="checkpoint-toast-banner" style="
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-30px);
            opacity: 0;
            pointer-events: none;
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(16, 185, 129, 0.95));
            color: #000000;
            padding: 0.65rem 1.5rem;
            border-radius: 9999px;
            font-size: 0.9rem;
            font-weight: 900;
            box-shadow: 0 10px 30px rgba(34, 197, 94, 0.5);
            display: flex;
            align-items: center;
            gap: 0.6rem;
            transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            z-index: 1200;
          ">
            <span>🚩</span>
            <span id="checkpoint-toast-text">Checkpoint Reached!</span>
          </div>

          <!-- FLOATING FINISH CEREMONY OVERLAY -->
          <div id="finish-ride-ceremony" style="
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.78);
            backdrop-filter: blur(8px);
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1500;
            text-align: center;
            padding: 1.5rem;
            animation: modalFadeIn 0.3s ease-out;
          ">
            <div style="
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: #22c55e;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 2.75rem;
              box-shadow: 0 0 50px #22c55e;
              margin-bottom: 1.25rem;
              animation: bounceIn 0.5s ease-out;
            ">🏆</div>
            <h2 style="font-size: 2rem; font-weight: 900; color: #ffffff; margin: 0 0 0.4rem 0;">
              8.0 km Practical Ride Completed!
            </h2>
            <p style="font-size: 1rem; color: #a1a1aa; max-width: 520px; line-height: 1.5; margin: 0 0 1.5rem 0;">
              Day ${dayNumber} training completed successfully under Instructor <strong>${currentTrainer.name}</strong>. All 16 checkpoints (500m intervals) verified!
            </p>

            <div style="
              display: flex;
              gap: 1.5rem;
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.12);
              border-radius: 12px;
              padding: 1rem 1.75rem;
              margin-bottom: 1.75rem;
            ">
              <div>
                <div style="font-size: 0.7rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Distance</div>
                <div style="font-size: 1.35rem; font-weight: 900; color: #22c55e; font-family: var(--font-mono);">8.00 km</div>
              </div>
              <div style="width: 1px; background: rgba(255,255,255,0.1);"></div>
              <div>
                <div style="font-size: 0.7rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Checkpoints</div>
                <div style="font-size: 1.35rem; font-weight: 900; color: #ffffff; font-family: var(--font-mono);">16 / 16 ✓</div>
              </div>
              <div style="width: 1px; background: rgba(255,255,255,0.1);"></div>
              <div>
                <div style="font-size: 0.7rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Student Driver</div>
                <div style="font-size: 1rem; font-weight: 800; color: #ffffff;">${currentStudent.name}</div>
              </div>
            </div>

            <button type="button" id="btn-save-completed-ride" style="
              background: #22c55e;
              color: #000000;
              border: none;
              padding: 0.85rem 2.2rem;
              border-radius: 10px;
              font-size: 1rem;
              font-weight: 900;
              cursor: pointer;
              box-shadow: 0 10px 30px rgba(34, 197, 94, 0.5);
              transition: transform 0.15s ease;
            ">
              ✓ Save &amp; Log Day ${dayNumber} Ride (+8 km)
            </button>
          </div>
        </div>

        <!-- BOTTOM CONTROLS & RIDER COCKPIT BAR -->
        <footer style="
          background: #11141c;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0.85rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 1000;
          flex-wrap: wrap;
          gap: 1rem;
        ">
          <!-- Left: Dual Rider Cards (Student + Trainer) -->
          <div style="display: flex; align-items: center; gap: 1rem;">
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
                font-size: 0.85rem;
              ">👨‍🎓</div>
              <div>
                <div style="font-size: 0.825rem; font-weight: 800; color: #ffffff;">${currentStudent.name}</div>
                <div style="font-size: 0.68rem; color: #a1a1aa;">Driver (Student) · Day ${dayNumber}/20</div>
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
                font-size: 0.85rem;
              ">👨‍🏫</div>
              <div>
                <div style="font-size: 0.825rem; font-weight: 800; color: #ffffff;">${currentTrainer.name}</div>
                <div style="font-size: 0.68rem; color: #22c55e;">Instructor · Dual-Controls Active</div>
              </div>
            </div>
          </div>

          <!-- Center: Driving Simulation Controls -->
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <button type="button" id="btn-play-pause-ride" style="
              background: #ffffff;
              color: #000000;
              border: none;
              padding: 0.55rem 1.25rem;
              border-radius: 8px;
              font-size: 0.85rem;
              font-weight: 800;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.4rem;
            ">
              <span id="play-pause-icon">▶</span>
              <span id="play-pause-text">Start Ride</span>
            </button>

            <!-- Speed Toggles -->
            <div style="
              display: flex;
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 8px;
              overflow: hidden;
            ">
              <button type="button" class="btn-speed-mult" data-speed="1" style="
                background: transparent;
                color: #a1a1aa;
                border: none;
                padding: 0.5rem 0.75rem;
                font-size: 0.75rem;
                font-weight: 800;
                cursor: pointer;
              ">1x</button>
              <button type="button" class="btn-speed-mult active" data-speed="2" style="
                background: #ffffff;
                color: #000000;
                border: none;
                padding: 0.5rem 0.75rem;
                font-size: 0.75rem;
                font-weight: 800;
                cursor: pointer;
              ">2x</button>
              <button type="button" class="btn-speed-mult" data-speed="5" style="
                background: transparent;
                color: #a1a1aa;
                border: none;
                padding: 0.5rem 0.75rem;
                font-size: 0.75rem;
                font-weight: 800;
                cursor: pointer;
              ">5x</button>
              <button type="button" class="btn-speed-mult" data-speed="10" style="
                background: transparent;
                color: #a1a1aa;
                border: none;
                padding: 0.5rem 0.75rem;
                font-size: 0.75rem;
                font-weight: 800;
                cursor: pointer;
              ">10x</button>
            </div>

            <!-- Fast-Forward to Finish -->
            <button type="button" id="btn-fast-forward-finish" style="
              background: rgba(34, 197, 94, 0.15);
              border: 1px solid rgba(34, 197, 94, 0.4);
              color: #22c55e;
              padding: 0.55rem 1rem;
              border-radius: 8px;
              font-size: 0.78rem;
              font-weight: 800;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.35rem;
            " title="Instantly complete 8.0 km ride">
              <span>⏩</span>
              <span>Fast Finish</span>
            </button>
          </div>

          <!-- Right: Direct Completion Trigger -->
          <div>
            <button type="button" id="btn-complete-direct" style="
              background: rgba(255, 255, 255, 0.08);
              border: 1px solid rgba(255, 255, 255, 0.18);
              color: #ffffff;
              padding: 0.55rem 1.15rem;
              border-radius: 8px;
              font-size: 0.8rem;
              font-weight: 800;
              cursor: pointer;
            ">
              Log 8 km Ride ✓
            </button>
          </div>
        </footer>
      </div>
    </div>
  `;

  let resizeHandler = null;

  // Cleanup helper
  const closeModal = () => {
    if (animationTimer) {
      clearInterval(animationTimer);
      animationTimer = null;
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

  // Initialize Leaflet Map after DOM injection
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

      // High-visibility crisp CartoDB Voyager tiles with OpenStreetMap fallback
      const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap &copy; CARTO'
      });
      tileLayer.on('tileerror', () => {
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);
      });
      tileLayer.addTo(map);

      const allCoords = track.map(t => [t.lat, t.lng]);

      // 1. BASE ROAD CASING (Wide deep navy-black road boundary)
      L.polyline(allCoords, {
        color: '#0f172a',
        weight: 18,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // 2. INNER ROAD PAVEMENT (Solid Slate Asphalt)
      L.polyline(allCoords, {
        color: '#334155',
        weight: 14,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // 3. ROAD CENTER DASHED LINE (Bright highway yellow dashes)
      L.polyline(allCoords, {
        color: '#facc15',
        weight: 3,
        opacity: 0.95,
        dashArray: '10, 14',
        lineCap: 'butt'
      }).addTo(map);

      // 4. LIVE TRAVELED PATH POLYLINE (High-visibility Vibrant Emerald Green)
      livePolyline = L.polyline([allCoords[0]], {
        color: '#16a34a',
        weight: 8,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // 5. START POINT ARCH (DEPOT)
      const startPos = allCoords[0];
      const startIcon = L.divIcon({
        className: 'gamified-start-marker',
        html: `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -100%);
          ">
            <div style="
              background: #16a34a;
              color: #ffffff;
              font-weight: 900;
              font-size: 11px;
              padding: 4px 10px;
              border-radius: 6px;
              white-space: nowrap;
              box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
              border: 2px solid #ffffff;
            ">🏁 START: DEPOT (0.0 km)</div>
            <div style="width: 2px; height: 12px; background: #16a34a;"></div>
          </div>
        `,
        iconSize: [0, 0]
      });
      L.marker(startPos, { icon: startIcon }).addTo(map);

      // 6. FINISH POINT GATE (8.0 KM)
      const endPos = allCoords[allCoords.length - 1];
      const finishIcon = L.divIcon({
        className: 'gamified-finish-marker',
        html: `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -100%);
          ">
            <div style="
              background: #0f172a;
              color: #facc15;
              font-weight: 900;
              font-size: 11px;
              padding: 4px 10px;
              border-radius: 6px;
              white-space: nowrap;
              box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
              border: 2px solid #facc15;
            ">🏁 8.0 KM FINISH LINE</div>
            <div style="width: 2px; height: 12px; background: #0f172a;"></div>
          </div>
        `,
        iconSize: [0, 0]
      });
      L.marker(endPos, { icon: finishIcon }).addTo(map);

      // 7. ROADSIDE TREES & CREATIVE ENVIRONMENT
      trees.forEach(tree => {
        const treeIcon = L.divIcon({
          className: 'gamified-tree-marker',
          html: `
            <div style="
              font-size: ${tree.size}px;
              line-height: 1;
              filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));
              transform: translate(-50%, -50%);
              user-select: none;
              pointer-events: none;
            ">${tree.variety.emoji}</div>
          `,
          iconSize: [0, 0]
        });
        L.marker([tree.lat, tree.lng], { icon: treeIcon }).addTo(map);
      });

      // 8. 16 CHECKPOINT MILESTONE BEACONS (EVERY 500M)
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
              box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
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
          <div style="color: #0f172a; font-size: 12px; padding: 2px;">
            <b style="color: #b45309;">${cp.name} (${cp.label})</b><br>
            <strong>${cp.title}</strong><br>
            <span style="color: #64748b;">${cp.place}</span>
          </div>
        `);
        return { cp, marker };
      });

      // 9. DUAL RIDER CAR MARKER (STUDENT + TRAINER)
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
              padding: 3px 8px;
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 10px;
              font-weight: 800;
              color: #ffffff;
              box-shadow: 0 4px 14px rgba(0,0,0,0.4);
              margin-bottom: 4px;
            ">
              <span style="color: #38bdf8;">👨‍🎓 ${currentStudent.name.split(' ')[0]}</span>
              <span style="color: #94a3b8;">·</span>
              <span style="color: #4ade80;">👨‍🏫 ${currentTrainer.name.split(' ')[0]}</span>
            </div>

            <!-- Moving High-Visibility Yellow Dual-Control Training Car SVG -->
            <div id="car-rotation-node" style="
              width: 40px;
              height: 40px;
              background: #facc15;
              border: 2.5px solid #0f172a;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 16px rgba(0,0,0,0.4);
              transition: transform 0.15s ease;
            ">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="3" width="14" height="18" rx="4" fill="#0f172a" stroke="#ffffff" stroke-width="1"/>
                <!-- Front Windshield -->
                <rect x="7" y="6" width="10" height="4" rx="1" fill="#38bdf8"/>
                <!-- Rear Windshield -->
                <rect x="7" y="15" width="10" height="3" rx="1" fill="#94a3b8"/>
                <!-- Headlights -->
                <circle cx="7" cy="4" r="1.5" fill="#fef08a"/>
                <circle cx="17" cy="4" r="1.5" fill="#fef08a"/>
                <!-- Driving School 'L' symbol on roof -->
                <text x="9" y="14" font-size="9" font-weight="900" fill="#ef4444" font-family="sans-serif">L</text>
              </svg>
            </div>
          </div>
        `,
        iconSize: [0, 0]
      });

      carMarker = L.marker(startPos, { icon: carIcon }).addTo(map);

      // Fit entire 8 km track so the user immediately sees the whole route with trees and checkpoints
      const trackBounds = L.polyline(allCoords).getBounds();
      map.fitBounds(trackBounds, { padding: [50, 50] });

      // Force Leaflet recalculation so no grey/black map occurs
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

      // CAMERA MODE TOGGLE
      const btnToggleCam = modalRoot.querySelector('#btn-toggle-camera-mode');
      const camIcon = modalRoot.querySelector('#cam-icon');
      const camText = modalRoot.querySelector('#cam-text');

      btnToggleCam.addEventListener('click', () => {
        followCarMode = !followCarMode;
        if (followCarMode) {
          camIcon.textContent = '🔍';
          camText.textContent = 'Follow Car Zoom';
          const currPt = track[currentStep] || track[0];
          map.setView([currPt.lat, currPt.lng], 17);
        } else {
          camIcon.textContent = '🗺️';
          camText.textContent = '8 km Track Overview';
          map.fitBounds(L.polyline(allCoords).getBounds(), { padding: [50, 50] });
        }
      });

      // PLAY / PAUSE BUTTON
      const btnPlayPause = modalRoot.querySelector('#btn-play-pause-ride');
      const playPauseIcon = modalRoot.querySelector('#play-pause-icon');
      const playPauseText = modalRoot.querySelector('#play-pause-text');

      const startSimulation = () => {
        if (isCompleted) return;
        isPlaying = true;
        playPauseIcon.textContent = '⏸';
        playPauseText.textContent = 'Pause Ride';

        if (animationTimer) clearInterval(animationTimer);

        const intervalMs = Math.max(40, Math.floor(200 / speedMultiplier));

        animationTimer = setInterval(() => {
          if (currentStep >= track.length - 1) {
            finishRide();
            return;
          }

          currentStep++;
          advanceToStep(currentStep);
        }, intervalMs);
      };

      const pauseSimulation = () => {
        isPlaying = false;
        playPauseIcon.textContent = '▶';
        playPauseText.textContent = 'Resume Ride';
        if (animationTimer) {
          clearInterval(animationTimer);
          animationTimer = null;
        }
      };

      btnPlayPause.addEventListener('click', () => {
        if (isPlaying) {
          pauseSimulation();
        } else {
          startSimulation();
        }
      });

      // SPEED MULTIPLIER BUTTONS
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
          speedMultiplier = parseInt(btn.dataset.speed, 10);
          if (isPlaying) {
            startSimulation(); // restart with new interval
          }
        });
      });

      // FAST-FORWARD TO FINISH
      modalRoot.querySelector('#btn-fast-forward-finish').addEventListener('click', () => {
        currentStep = track.length - 1;
        advanceToStep(currentStep);
        finishRide();
      });

      // DIRECT COMPLETION BUTTON
      const handleCompleteRide = () => {
        store.completeSession(currentStudent.id, dayNumber, {
          instructorNotes: `Day ${dayNumber} live 8.0 km ride successfully completed under Instructor ${currentTrainer.name}.`
        });
        if (onRideCompleted) onRideCompleted();
        closeModal();
      };

      modalRoot.querySelector('#btn-complete-direct').addEventListener('click', handleCompleteRide);
      modalRoot.querySelector('#btn-save-completed-ride').addEventListener('click', handleCompleteRide);

      // STEP ADVANCE FUNCTION
      function advanceToStep(stepIdx) {
        const pt = track[stepIdx];
        if (!pt) return;

        // 1. Move Car Marker
        carMarker.setLatLng([pt.lat, pt.lng]);

        // 2. Rotate Car Heading
        if (stepIdx < track.length - 1) {
          const nextPt = track[stepIdx + 1];
          const bearing = calculateBearing([pt.lat, pt.lng], [nextPt.lat, nextPt.lng]);
          const rotNode = document.getElementById('car-rotation-node');
          if (rotNode) {
            rotNode.style.transform = `rotate(${bearing}deg)`;
          }
        }

        // 3. Update Traveled Path
        const coveredCoords = track.slice(0, stepIdx + 1).map(t => [t.lat, t.lng]);
        livePolyline.setLatLngs(coveredCoords);

        // 4. Update Odometer & Speed HUD
        const distKmElem = document.getElementById('hud-distance-km');
        if (distKmElem) distKmElem.textContent = pt.distanceKm;

        const speedElem = document.getElementById('hud-speed');
        if (speedElem) {
          const simulatedSpeed = 26 + Math.round((Math.sin(stepIdx / 5) + 1) * 4);
          speedElem.textContent = simulatedSpeed;
        }

        // 5. Follow Car Camera if active
        if (followCarMode) {
          map.panTo([pt.lat, pt.lng], { animate: true, duration: 0.15 });
        }

        // 6. Checkpoint Crossing Detection (500m intervals)
        let clearedCount = 0;
        checkpoints.forEach(cp => {
          if (pt.distanceMeters >= cp.distanceMeters) {
            clearedCount++;
            if (!cp.cleared) {
              cp.cleared = true;
              triggerCheckpointReached(cp);
            }
          }
        });

        const cpCountElem = document.getElementById('hud-checkpoints-cleared');
        if (cpCountElem) cpCountElem.textContent = clearedCount;
      }

      // TRIGGER CHECKPOINT CLEARED
      function triggerCheckpointReached(cp) {
        // Milestone segment glow
        const seg = document.getElementById(`prog-seg-${cp.id}`);
        if (seg) {
          seg.style.background = '#22c55e';
          seg.style.borderColor = '#22c55e';
          seg.style.color = '#000000';
          seg.innerHTML = `✓ ${cp.label}`;
        }

        // Map marker beacon transition
        const beacon = document.getElementById(`cp-beacon-${cp.id}`);
        if (beacon) {
          beacon.style.borderColor = '#ffffff';
          beacon.style.background = '#16a34a';
          beacon.style.boxShadow = '0 0 16px rgba(22, 163, 74, 0.8)';
          beacon.innerHTML = `
            <span style="font-size: 13px; font-weight: 900; color: #ffffff;">✓</span>
          `;
        }

        // Floating toast banner
        const banner = document.getElementById('checkpoint-toast-banner');
        const text = document.getElementById('checkpoint-toast-text');
        if (banner && text) {
          text.textContent = `Checkpoint ${cp.id}/16 (${cp.label}) Cleared! · ${cp.title}`;
          banner.style.opacity = '1';
          banner.style.transform = 'translateX(-50%) translateY(0)';
          setTimeout(() => {
            banner.style.opacity = '0';
            banner.style.transform = 'translateX(-50%) translateY(-30px)';
          }, 2400);
        }
      }

      // FINISH RIDE FUNCTION
      function finishRide() {
        if (isCompleted) return;
        isCompleted = true;
        pauseSimulation();

        // Ensure 8.00 km is shown
        const distKmElem = document.getElementById('hud-distance-km');
        if (distKmElem) distKmElem.textContent = '8.00';

        const cpCountElem = document.getElementById('hud-checkpoints-cleared');
        if (cpCountElem) cpCountElem.textContent = '16';

        // Clear all 16 checkpoints
        checkpoints.forEach(cp => {
          cp.cleared = true;
          triggerCheckpointReached(cp);
        });

        // Show Ceremony Modal
        const ceremony = document.getElementById('finish-ride-ceremony');
        if (ceremony) {
          ceremony.style.display = 'flex';
        }
      }

      // AUTO-START SIMULATION ON LAUNCH
      setTimeout(() => {
        startSimulation();
      }, 400);

    } catch (err) {
      console.error('Failed to initialize Gamified Live Map:', err);
    }
  }, 100);
}

export const openLiveRideTrackingModal = openLiveRideMapModal;
