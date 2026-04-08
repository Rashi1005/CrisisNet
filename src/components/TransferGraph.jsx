import React, { useMemo } from 'react';

const TransferGraph = ({ hospitals, distanceMatrix, activeTransferPath }) => {
  const hospitalPositions = useMemo(() => {
    return [
      { x: 150, y: 100, name: 'City Hospital' },
      { x: 350, y: 150, name: 'District Hospital' },
      { x: 250, y: 300, name: 'Rural Clinic' }
    ];
  }, []);

  const getPathKey = (from, to) => `${from}-${to}`;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="text-sm font-bold text-gray-900 mb-4">Hospital Network</h4>

      <svg width="100%" height="400" viewBox="0 0 500 400" className="border border-gray-200 rounded">
        {/* Draw edges */}
        {hospitalPositions.map((start, i) =>
          hospitalPositions.map((end, j) => {
            if (i >= j) return null;

            const isActive =
              activeTransferPath && activeTransferPath.includes(i) && activeTransferPath.includes(j);

            return (
              <g key={`edge-${i}-${j}`}>
                {/* Edge line */}
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={isActive ? '#378ADD' : '#E5E7EB'}
                  strokeWidth={isActive ? 3 : 2}
                  className="transition-all duration-300"
                />

                {/* Distance label */}
                <text
                  x={(start.x + end.x) / 2}
                  y={(start.y + end.y) / 2 - 10}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#666"
                  fontWeight="600"
                >
                  {distanceMatrix[i][j]} km
                </text>
              </g>
            );
          })
        )}

        {/* Draw hospital nodes */}
        {hospitalPositions.map((pos, idx) => {
          const hospital = hospitals[idx];
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

          let fillColor = '#1D9E75'; // teal
          if (efficiency >= 85) fillColor = '#E24B4A'; // red
          else if (efficiency >= 60) fillColor = '#EF9F27'; // amber

          return (
            <g key={`node-${idx}`}>
              {/* Circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={40}
                fill="white"
                stroke={fillColor}
                strokeWidth="3"
                className="transition-all duration-300"
              />

              {/* Hospital name */}
              <text
                x={pos.x}
                y={pos.y - 10}
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="#111827"
              >
                {pos.name}
              </text>

              {/* Efficiency percentage */}
              <text
                x={pos.x}
                y={pos.y + 15}
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill={fillColor}
              >
                {efficiency}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-teal-600" />
          <span className="text-gray-700">0-60%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-600" />
          <span className="text-gray-700">60-85%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-600" />
          <span className="text-gray-700">85-100%</span>
        </div>
      </div>
    </div>
  );
};

export default TransferGraph;