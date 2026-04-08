import React, { useState, useMemo } from 'react';

const KnapsackTable = ({ hospital }) => {
  const [selectedSlice, setSelectedSlice] = useState('w3-0');

  const dpSlice = useMemo(() => {
    if (!hospital.dpTable) return null;

    // Extract a 2D view of the DP table
    // Let's show a simplified version: patients (rows) vs ICU beds (columns)
    const n = hospital.dpTable.length - 1;
    const W1 = hospital.dpTable[0].length - 1;

    const slice = Array(Math.min(n + 1, 20))
      .fill(null)
      .map(() => Array(Math.min(W1 + 1, 15)).fill(0));

    for (let i = 0; i < Math.min(n + 1, 20); i++) {
      for (let w1 = 0; w1 < Math.min(W1 + 1, 15); w1++) {
        try {
          if (
            hospital.dpTable[i][w1][0] &&
            hospital.dpTable[i][w1][0][0] &&
            hospital.dpTable[i][w1][0][0][0]
          ) {
            slice[i][w1] = hospital.dpTable[i][w1][0][0][0].score || 0;
          }
        } catch (e) {
          slice[i][w1] = 0;
        }
      }
    }

    return slice;
  }, [hospital.dpTable]);

  if (!dpSlice) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-gray-600 text-sm">No DP table available</p>
      </div>
    );
  }

  const getColor = value => {
    if (value === 0) return 'bg-gray-50';
    if (value <= 2) return 'bg-blue-100';
    if (value <= 5) return 'bg-teal-100';
    if (value <= 8) return 'bg-teal-200';
    return 'bg-teal-400';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="text-sm font-bold text-gray-900 mb-4">
        DP Table: Survival Scores (Patients × ICU Beds)
      </h4>

      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-100 px-2 py-1 font-semibold text-gray-700 w-12">
                P
              </th>
              {Array.from({ length: dpSlice[0].length }).map((_, i) => (
                <th
                  key={`col-${i}`}
                  className="border border-gray-300 bg-gray-100 px-1 py-1 font-semibold text-gray-700 w-10"
                >
                  {i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dpSlice.map((row, i) => (
              <tr key={`row-${i}`}>
                <td className="border border-gray-300 bg-gray-100 px-2 py-1 font-semibold text-gray-700">
                  {i}
                </td>
                {row.map((value, j) => (
                  <td
                    key={`cell-${i}-${j}`}
                    className={`border border-gray-300 px-1 py-1 text-center font-semibold text-gray-900 ${getColor(
                      value
                    )}`}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Green = high survival potential | Blue = low potential
      </p>
    </div>
  );
};

export default KnapsackTable;