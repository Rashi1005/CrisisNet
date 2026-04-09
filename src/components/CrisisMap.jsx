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

const CrisisMap = ({ state }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const hospitalsRef = useRef({});
  const ambulancesRef = useRef({});
  const patientsRef = useRef({});
  const routesRef = useRef({});
  const [showHeatmap, setShowHeatmap] = useState(false);

  const hospitals = [
    { id: 0, name: 'City Hospital', lat: 19.0760, lng: 72.8777 },
    { id: 1, name: 'District Hospital', lat: 19.1136, lng: 72.8697 },
    { id: 2, name: 'Rural Clinic', lat: 19.1724, lng: 72.9478 }
  ];

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return;

    const mapContainer = mapContainerRef.current;
    if (!mapContainer) return;

    const map = L.map(mapContainer).setView([19.0900, 72.8850], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
      className: 'leaflet-tiles-dark'
    }).addTo(map);

    // Style tiles
    const style = document.createElement('style');
    style.innerHTML = `
      .leaflet-tiles-dark {
        filter: invert(1) hue-rotate(180deg) brightness(0.95) contrast(1.1);
      }
    `;
    document.head.appendChild(style);

    mapRef.current = map;

    // Add hospital markers
    hospitals.forEach(hospital => {
      const marker = L.marker([hospital.lat, hospital.lng], {
        icon: L.divIcon({
          className: 'hospital-marker',
          html: `
            <div style="
              width: 60px;
              height: 60px;
              border-radius: 50%;
              background: radial-gradient(circle at 30% 30%, rgba(0, 212, 255, 0.4), rgba(0, 212, 255, 0.1));
              border: 2px solid #00D4FF;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
              box-shadow: 0 0 20px rgba(0, 212, 255, 0.5), inset 0 0 20px rgba(0, 212, 255, 0.2);
              animation: hospital-pulse 2s ease-in-out infinite;
            ">🏥</div>
          `,
          iconSize: [60, 60],
          iconAnchor: [30, 30],
          popupAnchor: [0, -30]
        })
      });

      marker.addTo(map);
      hospitalsRef.current[hospital.id] = marker;

      marker.on('click', () => {
        if (state && state.hospitals && state.hospitals[hospital.id]) {
          const h = state.hospitals[hospital.id];
          const icuPercent = Math.round((h.icuUsed / h.icuTotal) * 100);

          marker.setPopupContent(`
            <div style="
              background: linear-gradient(to bottom, #0F1823, #0A1220);
              border: 1px solid #00D4FF;
              border-radius: 8px;
              padding: 12px;
              font-family: monospace;
              font-size: 12px;
              color: #00D4FF;
              min-width: 220px;
              box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
            ">
              <div style="font-weight: bold; font-size: 14px; margin-bottom: 10px;">${h.name}</div>
              
              <div style="margin-bottom: 6px;">
                <div style="display: flex; justify-between; margin-bottom: 2px; font-size: 11px;">
                  <span>ICU: ${h.icuUsed}/${h.icuTotal}</span>
                  <span>${icuPercent}%</span>
                </div>
                <div style="width: 100%; height: 4px; background: #1a2a3a; border-radius: 2px; overflow: hidden;">
                  <div style="
                    width: ${icuPercent}%;
                    height: 100%;
                    background: ${icuPercent >= 85 ? '#FF3B5C' : icuPercent >= 60 ? '#FFB347' : '#00D4FF'};
                  "></div>
                </div>
              </div>

              <div style="border-top: 1px solid rgba(0, 212, 255, 0.2); padding-top: 8px; margin-top: 8px; font-size: 11px;">
                <div>Patients: <strong>${h.patients.length}</strong></div>
                <div>Status: <strong>${icuPercent >= 85 ? 'CRITICAL' : icuPercent >= 60 ? 'CAUTION' : 'NORMAL'}</strong></div>
              </div>
            </div>
          `).openPopup();
        }
      });
    });

    return () => {
      // Cleanup
    };
  }, []);

  // Update hospital markers based on capacity
  useEffect(() => {
    if (!mapRef.current || !state?.hospitals) return;

    state.hospitals.forEach((hospital, idx) => {
      const efficiency = (hospital.icuUsed / hospital.icuTotal) * 100;
      let pulseColor = '#00D4FF';
      let pulseIntensity = 'hospital-pulse-normal';

      if (efficiency >= 85) {
        pulseColor = '#FF3B5C';
        pulseIntensity = 'hospital-pulse-critical';
      } else if (efficiency >= 60) {
        pulseColor = '#FFB347';
        pulseIntensity = 'hospital-pulse-warning';
      }

      const marker = hospitalsRef.current[idx];
      if (marker) {
        marker.setIcon(
          L.divIcon({
            className: `hospital-marker ${pulseIntensity}`,
            html: `
              <div style="
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: radial-gradient(circle at 30% 30%, rgba(${pulseColor === '#FF3B5C' ? '255, 59, 92' : pulseColor === '#FFB347' ? '255, 179, 71' : '0, 212, 255'}, 0.4), rgba(${pulseColor === '#FF3B5C' ? '255, 59, 92' : pulseColor === '#FFB347' ? '255, 179, 71' : '0, 212, 255'}, 0.1));
                border: 2px solid ${pulseColor};
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                box-shadow: 0 0 20px ${pulseColor}80, inset 0 0 20px ${pulseColor}30;
                animation: ${pulseIntensity} ${efficiency >= 85 ? '0.5s' : efficiency >= 60 ? '1s' : '2s'} ease-in-out infinite;
              ">🏥</div>
            `,
            iconSize: [60, 60],
            iconAnchor: [30, 30],
            popupAnchor: [0, -30]
          })
        );
      }
    });
  }, [state?.hospitals]);

  // Animate patient arrivals
  useEffect(() => {
    if (!mapRef.current || !state?.arrivalFeed) return;

    state.arrivalFeed.forEach((patient, idx) => {
      if (patient.status === 'allocated' || patient.status === 'transferred') {
        // Add arriving patient marker
        const randomLat = 19.0 + Math.random() * 0.15;
        const randomLng = 72.8 + Math.random() * 0.2;

        if (!patientsRef.current[patient.id]) {
          const marker = L.marker([randomLat, randomLng], {
            icon: L.divIcon({
              className: 'patient-marker',
              html: `<div style="font-size: 14px; animation: patient-pulse 1s ease-in-out infinite;">🚑</div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })
          });

          marker.addTo(mapRef.current);
          patientsRef.current[patient.id] = marker;

          // Remove after 3 seconds
          setTimeout(() => {
            if (marker) mapRef.current.removeLayer(marker);
            delete patientsRef.current[patient.id];
          }, 3000);
        }
      } else if (patient.status === 'deferred') {
        // Show deferred patient (frozen red dot)
        const randomLat = 19.0 + Math.random() * 0.15;
        const randomLng = 72.8 + Math.random() * 0.2;

        if (!patientsRef.current[patient.id]) {
          const marker = L.marker([randomLat, randomLng], {
            icon: L.divIcon({
              className: 'deferred-marker',
              html: `<div style="
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #FF3B5C;
                box-shadow: 0 0 10px #FF3B5C;
                animation: deferred-pulse 1.5s ease-in-out infinite;
              "></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })
          });

          marker.bindPopup(`${patient.id} - WAITING - Survival: ${patient.survivalScore}`);
          marker.addTo(mapRef.current);
          patientsRef.current[patient.id] = marker;
        }
      }
    });
  }, [state?.arrivalFeed?.length]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Heatmap Toggle */}
      <button
        onClick={() => setShowHeatmap(!showHeatmap)}
        className="absolute top-4 right-4 z-40 px-3 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white text-xs font-bold rounded transition-all duration-300"
        style={{ boxShadow: '0 0 15px rgba(0, 212, 255, 0.3)' }}
      >
        {showHeatmap ? '🔥 Heatmap: ON' : '🔥 Heatmap: OFF'}
      </button>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-40 bg-gradient-to-br from-[#0F1823] to-[#0A1220] border border-cyan-500 border-opacity-20 rounded-lg p-3 text-xs text-cyan-300 font-mono space-y-1" style={{ boxShadow: '0 0 15px rgba(0, 212, 255, 0.1)' }}>
        <div className="font-bold text-cyan-400 mb-2">Legend</div>
        <div>🟢 Green = Normal (0-60%)</div>
        <div>🟡 Amber = Caution (60-85%)</div>
        <div>🔴 Red = Critical (85-100%)</div>
        <div>🚑 Ambulance = Patient Transfer</div>
        <div>🔴 Red Dot = Deferred Patient</div>
      </div>

      <style>{`
        @keyframes hospital-pulse-normal {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes hospital-pulse-warning {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes hospital-pulse-critical {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes patient-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes deferred-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 10px #FF3B5C; }
          50% { opacity: 0.5; box-shadow: 0 0 20px #FF3B5C; }
        }
        .leaflet-container {
          background: #080C14;
        }
        .leaflet-control-attribution {
          background: rgba(8, 12, 20, 0.8) !important;
          color: #00D4FF !important;
          font-size: 10px !important;
        }
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }
        .leaflet-popup-tip {
          background: transparent !important;
        }
      `}</style>
    </div>
  );
};

export default CrisisMap;