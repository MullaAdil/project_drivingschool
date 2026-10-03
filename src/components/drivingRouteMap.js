/* ==========================================================================
   DRIVING ROUTE MAP COMPONENT
   GAFOOR DRIVING SCHOOL — PULIVENDULA, ANDHRA PRADESH
   
   Clean, realistic practical driving route viewer:
   - Interactive map centered on Pulivendula driving sectors
   - Route path connecting Start and Finish points
   - Daily practice distance fixed at 8.0 km
   - Straightforward, normal headings and student lesson details
   ========================================================================== */

import L from 'leaflet';
import { openLiveRideMapModal } from './liveRideTrackingModal.js';

let activeMapInstance = null;

export function openRouteMapModal({ session, studentName = 'Student', carInfo = 'Training Car' }) {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  const route = session.route || {
    title: `Day ${session.dayNumber} Practical Route`,
    startPoint: { name: 'Gafoor Driving Academy Depot, Pulivendula', lat: 14.4230, lng: 78.2285 },
    endPoint: { name: 'Bakarapuram Training Field', lat: 14.4312, lng: 78.2361 },
    distanceKm: 8.0,
    durationMins: 60,
    waypoints: [],
    path: [[14.4230, 78.2285], [14.4312, 78.2361]]
  };

  const pathCoords = route.path && route.path.length > 0 ? route.path : [
    [route.startPoint.lat, route.startPoint.lng],
    [route.endPoint.lat, route.endPoint.lng]
  ];

  modalRoot.innerHTML = `
    <div class="mnc-modal-overlay" id="route-map-overlay">
      <div class="route-map-modal" style="
        background: #0d0f14;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 16px;
        width: 95vw;
        max-width: 1040px;
        max-height: 92vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.9);
        animation: modalFadeIn 0.25s ease-out;
      ">
        <!-- MODAL HEADER -->
        <div style="
          padding: 1.15rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #12151d;
        ">
          <div>
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <span style="
                display: inline-block;
                padding: 0.2rem 0.6rem;
                background: ${session.status === 'completed' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.08)'};
                border: 1px solid ${session.status === 'completed' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.15)'};
                color: ${session.status === 'completed' ? '#22c55e' : '#ffffff'};
                border-radius: 9999px;
                font-size: 0.72rem;
                font-weight: 800;
                letter-spacing: 0.04em;
              ">${session.status === 'completed' ? 'COMPLETED 🟢' : 'SCHEDULED'}</span>
              <span style="font-size: 1.1rem; font-weight: 800; color: #ffffff;">
                Day ${session.dayNumber}: ${session.objective}
              </span>
            </div>
            <div style="font-size: 0.8rem; color: #a1a1aa; margin-top: 0.25rem;">
              ${route.title || 'Pulivendula Practice Route'} · Student: ${studentName} · Instructor: ${session.instructorName || 'K. Srinivas Rao'} (${session.date})
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button type="button" id="btn-open-live-simulator" style="
              background: #22c55e;
              color: #000000;
              border: none;
              padding: 0.45rem 1rem;
              border-radius: 8px;
              font-size: 0.8rem;
              font-weight: 800;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.4rem;
              box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4);
            ">
              <span>🚀</span>
              <span>Start Live 8 km Ride</span>
            </button>
            <button type="button" id="btn-close-map-modal" style="
              background: rgba(255, 255, 255, 0.08);
              border: 1px solid rgba(255, 255, 255, 0.15);
              color: #ffffff;
              width: 34px;
              height: 34px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              font-size: 1.1rem;
            ">✕</button>
          </div>
        </div>

        <!-- SESSION INFORMATION STRIP -->
        <div style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1px;
          background: rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        ">
          <div style="background: #141720; padding: 0.75rem 1rem;">
            <div style="font-size: 0.68rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Practice Distance</div>
            <div style="font-size: 1.25rem; font-weight: 900; color: #22c55e; font-family: monospace;">8.0 km</div>
          </div>
          <div style="background: #141720; padding: 0.75rem 1rem;">
            <div style="font-size: 0.68rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Class Duration</div>
            <div style="font-size: 1.25rem; font-weight: 900; color: #ffffff; font-family: monospace;">60 mins</div>
          </div>
          <div style="background: #141720; padding: 0.75rem 1rem;">
            <div style="font-size: 0.68rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Training Stage</div>
            <div style="font-size: 1rem; font-weight: 800; color: #ffffff; margin-top: 0.2rem;">${session.stage || 'Stage 1: Basic Driving'}</div>
          </div>
          <div style="background: #141720; padding: 0.75rem 1rem;">
            <div style="font-size: 0.68rem; color: #71717a; text-transform: uppercase; font-weight: 800;">Session Status</div>
            <div style="font-size: 1rem; font-weight: 800; color: ${session.status === 'completed' ? '#22c55e' : '#ffffff'}; margin-top: 0.2rem;">
              ${session.status === 'completed' ? 'Completed 🟢' : 'Scheduled'}
            </div>
          </div>
        </div>

        <!-- MAIN BODY: MAP & ROUTE DETAILS SPLIT -->
        <div style="display: flex; flex: 1; min-height: 420px; overflow: hidden; position: relative;">
          <!-- LEAFLET MAP CONTAINER -->
          <div id="interactive-route-map" style="
            flex: 1;
            height: 100%;
            min-height: 420px;
            background: #090b0e;
            position: relative;
          "></div>

          <!-- SIDEBAR: DETAILS -->
          <div style="
            width: 320px;
            background: #101319;
            border-left: 1px solid rgba(255, 255, 255, 0.1);
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            overflow-y: auto;
          ">
            <!-- Starting Point Card -->
            <div style="
              padding: 0.85rem;
              background: rgba(255, 255, 255, 0.03);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 8px;
            ">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
                <span style="
                  width: 10px;
                  height: 10px;
                  border-radius: 50%;
                  background: #22c55e;
                  box-shadow: 0 0 10px #22c55e;
                  display: inline-block;
                "></span>
                <span style="font-size: 0.7rem; font-weight: 800; color: #22c55e; text-transform: uppercase;">Starting Point</span>
              </div>
              <div style="font-size: 0.88rem; font-weight: 700; color: #ffffff;">${route.startPoint.name}</div>
              <div style="font-size: 0.75rem; color: #71717a; margin-top: 0.2rem;">
                Time: ${session.startTime || '08:30 AM'}
              </div>
            </div>

            <!-- Ending Point Card -->
            <div style="
              padding: 0.85rem;
              background: rgba(255, 255, 255, 0.03);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 8px;
            ">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
                <span style="
                  width: 10px;
                  height: 10px;
                  border-radius: 50%;
                  background: #ffffff;
                  box-shadow: 0 0 10px rgba(255,255,255,0.8);
                  display: inline-block;
                "></span>
                <span style="font-size: 0.7rem; font-weight: 800; color: #ffffff; text-transform: uppercase;">Ending Point</span>
              </div>
              <div style="font-size: 0.88rem; font-weight: 700; color: #ffffff;">${route.endPoint.name}</div>
              <div style="font-size: 0.75rem; color: #71717a; margin-top: 0.2rem;">
                Time: ${session.endTime || '09:30 AM'}
              </div>
            </div>

            <!-- Practical Driving Skills -->
            <div>
              <div style="font-size: 0.7rem; font-weight: 800; color: #71717a; text-transform: uppercase; margin-bottom: 0.6rem;">
                Skills Practiced
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.45rem;">
                ${(session.skills || [
                  'Vehicle controls and steering',
                  'Smooth braking and acceleration',
                  'Lane discipline and mirrors check'
                ]).map((skill) => `
                  <div style="
                    display: flex;
                    align-items: flex-start;
                    gap: 0.5rem;
                    font-size: 0.78rem;
                    color: #d4d4d8;
                    padding: 0.35rem 0.5rem;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 6px;
                  ">
                    <span style="color: #22c55e; font-weight: 800;">✓</span>
                    <span>${skill}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Instructor Notes -->
            <div style="
              margin-top: auto;
              padding: 0.85rem;
              background: rgba(34, 197, 94, 0.05);
              border: 1px solid rgba(34, 197, 94, 0.2);
              border-radius: 8px;
            ">
              <div style="font-size: 0.68rem; font-weight: 800; color: #22c55e; text-transform: uppercase; margin-bottom: 0.25rem;">
                Instructor Remarks
              </div>
              <p style="font-size: 0.8rem; color: #ffffff; line-height: 1.4; margin: 0;">
                "${session.instructorNotes || (session.status === 'completed' ? 'Good vehicle control and mirror checks maintained during the lesson.' : 'Scheduled driving lesson.')}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Cleanup helper
  const closeModal = () => {
    if (activeMapInstance) {
      activeMapInstance.remove();
      activeMapInstance = null;
    }
    modalRoot.innerHTML = '';
  };

  modalRoot.querySelector('#btn-close-map-modal').addEventListener('click', closeModal);
  modalRoot.querySelector('#route-map-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'route-map-overlay') closeModal();
  });

  const btnLiveSim = modalRoot.querySelector('#btn-open-live-simulator');
  if (btnLiveSim) {
    btnLiveSim.addEventListener('click', () => {
      closeModal();
      openLiveRideMapModal({
        session,
        student: { name: studentName },
        trainer: { name: session.instructorName || 'K. Srinivas Rao', car: carInfo },
        canTrainerComplete: true
      });
    });
  }

  // Initialize Leaflet Map after DOM injection
  setTimeout(() => {
    try {
      const mapContainer = document.getElementById('interactive-route-map');
      if (!mapContainer) return;

      if (activeMapInstance) {
        activeMapInstance.remove();
        activeMapInstance = null;
      }

      const map = L.map(mapContainer, {
        zoomControl: true,
        attributionControl: false
      });
      activeMapInstance = map;

      // Bright, vibrant CartoDB Voyager tile layer (streets, parks & terrain clearly visible)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
      }).addTo(map);

      // Start custom icon
      const startIcon = L.divIcon({
        className: 'custom-start-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #16a34a;
            border: 3px solid #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(0,0,0,0.4);
            color: #ffffff;
            font-size: 13px;
            font-weight: 900;
          ">A</div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      // End custom icon
      const endIcon = L.divIcon({
        className: 'custom-end-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #dc2626;
            border: 3px solid #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(0,0,0,0.4);
            color: #ffffff;
            font-size: 13px;
            font-weight: 900;
          ">B</div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      // Road Casing (High Contrast)
      L.polyline(pathCoords, {
        color: '#0f172a',
        weight: 9,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Main Road Line (Vibrant Green)
      const polyline = L.polyline(pathCoords, {
        color: '#22c55e',
        weight: 5,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Start Marker
      const startMarker = L.marker([route.startPoint.lat, route.startPoint.lng], { icon: startIcon }).addTo(map);
      startMarker.bindPopup(`<b>Start Point (0.0 km)</b><br>${route.startPoint.name}<br>Departure: ${session.startTime || '08:30 AM'}`);

      // End Marker
      const endMarker = L.marker([route.endPoint.lat, route.endPoint.lng], { icon: endIcon }).addTo(map);
      endMarker.bindPopup(`<b>Destination (8.0 km)</b><br>${route.endPoint.name}<br>Arrival: ${session.endTime || '09:30 AM'}`);

      // Fit map to polyline bounds with padding
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

      // Force Leaflet recalculation so no grey/black map occurs
      map.invalidateSize();
      setTimeout(() => map.invalidateSize(), 150);
      setTimeout(() => map.invalidateSize(), 400);

    } catch (err) {
      console.error('Failed to initialize Leaflet map:', err);
      const mapContainer = document.getElementById('interactive-route-map');
      if (mapContainer) {
        mapContainer.innerHTML = `
          <div style="display:flex; align-items:center; justify-content:center; height:100%; color:#a1a1aa; flex-direction:column; gap:0.75rem;">
            <div style="font-size:1.1rem; color:#ffffff; font-weight:700;">8.0 km Practical Route</div>
            <div>${route.startPoint.name} → ${route.endPoint.name}</div>
          </div>
        `;
      }
    }
  }, 100);
}
