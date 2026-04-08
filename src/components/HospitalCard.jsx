import React, { useState, useEffect } from 'react';
import ResourceBar from './ResourceBar';

const HospitalCard = ({ hospital, isPulsing = false }) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (isPulsing) {
      setPulse(true);
      const timeout = setTimeout(() => setPulse(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [isPulsing]);

  const efficiency = Math.round(
    ((hospital.icuUsed +
      hospital.ventUsed +
      hospital.medUsed / 10 +
      hospital.specialistUsed) /
      (hospital.icuTotal +
        hospital.ventTotal +
        hospital.medTotal / 10 +
        hospital.specialistTotal)) *
      100
  );

  return (
    <div
      className={`bg-white rounded-lg border-2 transition-all duration-300 p-4 ${
        pulse ? 'border-teal-500 shadow-lg' : 'border-gray-200'
      }`}
      style={
        pulse
          ? {
              animation: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1)'
            }
          : {}
      }
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(29, 158, 117, 0.7); }
          50% { box-shadow: 0 0 0 10px rgba(29, 158, 117, 0); }
        }
      `}</style>

      <div className="mb-3">
        <h3 className="text-lg font-bold text-gray-900">{hospital.name}</h3>
        <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-700 rounded inline-block">
          {hospital.type}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <ResourceBar
          label="ICU Beds"
          used={hospital.icuUsed}
          total={hospital.icuTotal}
        />
        <ResourceBar
          label="Ventilators"
          used={hospital.ventUsed}
          total={hospital.ventTotal}
        />
        <ResourceBar
          label="Medicines (units)"
          used={hospital.medUsed}
          total={hospital.medTotal}
        />
        <ResourceBar
          label="Specialist Hours"
          used={hospital.specialistUsed}
          total={hospital.specialistTotal}
        />
      </div>

      <div className="pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 text-sm">
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-xs text-gray-600">Patients</div>
          <div className="text-lg font-bold text-gray-900">
            {hospital.patients.length}
          </div>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-xs text-gray-600">Efficiency</div>
          <div className="text-lg font-bold text-teal-600">{efficiency}%</div>
        </div>
      </div>
    </div>
  );
};

export default HospitalCard;