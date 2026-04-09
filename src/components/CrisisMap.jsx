import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

L.Marker.mergeOptions({
  icon: L.icon({
    iconUrl,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  })
});

const HOSPITAL_COORDS = [
  { id: 0, name: 'City Hospital',     lat: 19.0760, lng: 72.8777 },
  { id: 1, name: 'District Hospital', lat: 19.1136, lng: 72.8697 },
  { id: 2, name: 'Rural Clinic',      lat: 19.1724, lng: 72.9478 }
];

const CrisisMap = ({ state }) => {
  const mapContainerRef = useRef(null);
  const mapRef          = useRef(null);
  const hospitalsRef    = useRef({});
  const patientsRef     = useRef({});
  const routesRef       = useRef([]);
  const sonarLayersRef  = useRef([]);
  const lastTransferRef = useRef(null);

  // ── Initialize map once ─────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current) return;
    const mapContainer = mapContainerRef.current;
    if (!mapContainer) return;

    const map = L.map(mapContainer, { zoomControl: false }).setView([19.105, 72.895], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
      className: 'leaflet-tiles-dark'
    }).addTo(map);

    mapRef.current = map;

    // Draw static network edges (faint background lines)
    const edgeCoords = [
      [HOSPITAL_COORDS[0], HOSPITAL_COORDS[1]],
      [HOSPITAL_COORDS[1], HOSPITAL_COORDS[2]],
      [HOSPITAL_COORDS[0], HOSPITAL_COORDS[2]],
    ];
    edgeCoords.forEach(([a, b]) => {
      L.polyline([[a.lat, a.lng], [b.lat, b.lng]], {
        color: 'rgba(0,200,240,0.12)',
        weight: 1.5,
        dashArray: '4 8',
      }).addTo(map);
    });

    // Add hospital beacons
    HOSPITAL_COORDS.forEach(h => {
      const marker = L.marker([h.lat, h.lng], {
        icon: buildHospitalIcon('#00C8F0', 2)
      });
      marker.addTo(map);
      hospitalsRef.current[h.id] = marker;
    });

    return () => {
      // cleanup handled by React
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update hospital beacons based on ICU load ────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !state?.hospitals) return;
    state.hospitals.forEach((h, idx) => {
      const pct = h.icuTotal > 0 ? (h.icuUsed / h.icuTotal) * 100 : 0;
      const color = pct >= 85 ? '#FF2D4E' : pct >= 60 ? '#FFB020' : '#1FD070';
      const speed = pct >= 85 ? 0.5 : pct >= 60 ? 1 : 2;
      const marker = hospitalsRef.current[idx];
      if (marker) marker.setIcon(buildHospitalIcon(color, speed));
    });
  }, [state?.hospitals]);

  // ── Animate patient arrivals + Dijkstra route flashes ────────────────────
  useEffect(() => {
    if (!mapRef.current || !state?.arrivalFeed?.length) return;
    const map = mapRef.current;
    const patient = state.arrivalFeed[0];
    if (!patient || patientsRef.current[patient.id]) return;

    const hostIdx = patient.assignedHospital ?? 0;
    const dest    = HOSPITAL_COORDS[hostIdx] ?? HOSPITAL_COORDS[0];

    // Random origin near Mumbai outskirts
    const originLat = 19.02 + Math.random() * 0.14;
    const originLng = 72.82 + Math.random() * 0.14;

    if (patient.status === 'deferred') {
      // Red frozen dot with pulsing SONAR ring
      const dot = L.marker([originLat, originLng], {
        icon: L.divIcon({
          className: '',
          html: `<div style="width:14px;height:14px;border-radius:50%;background:#FF2D4E;box-shadow:0 0 12px #FF2D4E;"></div>`,
          iconSize: [14, 14], iconAnchor: [7, 7]
        })
      }).addTo(map);
      patientsRef.current[patient.id] = dot;
      addSonarRipple(map, originLat, originLng, '#FF2D4E', sonarLayersRef);
      setTimeout(() => {
        if (dot && map) { try { map.removeLayer(dot); } catch (_e) { /* layer already removed */ } }
        delete patientsRef.current[patient.id];
      }, 6000);
      return;
    }

    // Cyan SONAR ripple at origin
    addSonarRipple(map, originLat, originLng, '#00C8F0', sonarLayersRef);

    // Animate ambulance along the route
    const ambulance = L.marker([originLat, originLng], {
      icon: L.divIcon({
        className: '',
        html: `<div style="font-size:18px;line-height:1;filter:drop-shadow(0 0 6px #00C8F0);">🚑</div>`,
        iconSize: [22, 22], iconAnchor: [11, 11]
      })
    }).addTo(map);
    patientsRef.current[patient.id] = ambulance;

    // Draw glowing Dijkstra route
    if (patient.status === 'transferred') {
      const via = patient.transferPath
        ? HOSPITAL_COORDS.find(h => patient.transferPath.includes(h.name))
        : null;
      const waypoints = via
        ? [[originLat, originLng], [via.lat, via.lng], [dest.lat, dest.lng]]
        : [[originLat, originLng], [dest.lat, dest.lng]];

      const glow = L.polyline(waypoints, {
        color: '#00C8F0', weight: 4, opacity: 0.9,
        dashArray: null,
      }).addTo(map);
      const glow2 = L.polyline(waypoints, {
        color: '#ffffff', weight: 1.5, opacity: 0.5,
        dashArray: null,
      }).addTo(map);
      routesRef.current.push(glow, glow2);
      setTimeout(() => {
        try { map.removeLayer(glow); map.removeLayer(glow2); } catch (_e) { /* layer already removed */ }
      }, 4000);
      lastTransferRef.current = { from: [originLat, originLng], to: [dest.lat, dest.lng] };
    }

    // Slide ambulance toward destination
    const steps = 30;
    let step = 0;
    const dLat = (dest.lat - originLat) / steps;
    const dLng = (dest.lng - originLng) / steps;
    const anim = setInterval(() => {
      step++;
      const lat = originLat + dLat * step;
      const lng = originLng + dLng * step;
      try { ambulance.setLatLng([lat, lng]); } catch (_e) { /* layer already removed */ }
      if (step >= steps) {
        clearInterval(anim);
        setTimeout(() => {
          try { map.removeLayer(ambulance); } catch (_e) { /* layer already removed */ }
          delete patientsRef.current[patient.id];
        }, 600);
      }
    }, 60);
  }, [state?.arrivalFeed?.[0]?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Legend overlay */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12, zIndex: 40,
        background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(0,200,240,0.2)', borderRadius: 10,
        padding: '10px 14px', fontSize: 11, fontFamily: 'monospace',
        color: 'rgba(0,200,240,0.85)', lineHeight: 1.8,
        boxShadow: '0 0 16px rgba(0,200,240,0.08)',
      }}>
        <div style={{ fontWeight: 800, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Legend</div>
        <div>🟢 <span style={{ color: '#1FD070' }}>Normal</span> — 0–60% ICU</div>
        <div>🟡 <span style={{ color: '#FFB020' }}>Caution</span> — 60–85% ICU</div>
        <div>🔴 <span style={{ color: '#FF2D4E' }}>Critical</span> — 85–100% ICU</div>
        <div>🚑 Ambulance — Active transfer</div>
        <div style={{ color: '#FF2D4E' }}>● Deferred — Waiting list</div>
        <div style={{ color: '#00C8F0' }}>— Dijkstra optimal route</div>
      </div>

      <style>{`
        .leaflet-tiles-dark {
          filter: invert(1) hue-rotate(180deg) brightness(0.9) contrast(1.15) saturate(0.85);
        }
        .leaflet-container { background: #060A12; }
        .leaflet-control-attribution {
          background: rgba(6,10,18,0.8) !important;
          color: rgba(0,200,240,0.5) !important;
          font-size: 9px !important;
        }
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }
        .leaflet-popup-tip { background: transparent !important; }
        @keyframes sonar-ring {
          0%   { transform: scale(0.3); opacity: 0.9; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        @keyframes hbeacon {
          0%, 100% { transform: scale(1);    opacity: 1; }
          50%       { transform: scale(1.18); opacity: 0.75; }
        }
      `}</style>
    </div>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────

function buildHospitalIcon(color, animSpeedSecs) {
  const rgb = hexToRgb(color);
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:56px;height:56px;">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:radial-gradient(circle at 35% 35%, ${color}55, ${color}18);
          border:2px solid ${color};
          display:flex;align-items:center;justify-content:center;
          font-size:24px;
          box-shadow:0 0 18px ${color}80, inset 0 0 14px ${color}30;
          animation: hbeacon ${animSpeedSecs}s ease-in-out infinite;
        ">🏥</div>
        <div style="
          position:absolute;inset:-6px;border-radius:50%;
          border:1.5px solid ${color};
          opacity:0;
          animation: sonar-ring ${animSpeedSecs * 1.5}s ease-out infinite;
        "></div>
      </div>`,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
    popupAnchor: [0, -28],
  });
}

function addSonarRipple(map, lat, lng, color, layersRef) {
  const marker = L.marker([lat, lng], {
    icon: L.divIcon({
      className: '',
      html: `<div style="
        width:20px;height:20px;border-radius:50%;
        border:2px solid ${color};
        animation:sonar-ring 1.5s ease-out forwards;
        opacity:0.9;
      "></div>`,
      iconSize: [20, 20], iconAnchor: [10, 10]
    })
  }).addTo(map);
  layersRef.current.push(marker);
  setTimeout(() => {
    try { map.removeLayer(marker); } catch (_e) { /* layer already removed */ }
    layersRef.current = layersRef.current.filter(l => l !== marker);
  }, 1600);
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export default CrisisMap;