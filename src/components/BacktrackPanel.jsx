import React from 'react';

const BacktrackPanel = ({ hospital }) => {
  if (!hospital.backtrackPath || hospital.backtrackPath.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-gray-600 text-sm">No patients allocated</p>
      </div>
    );
  }

  const totalSurvival = hospital.backtrackPath.reduce(
    (sum, p) => sum + (p.score || 0),
    0
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="text-sm font-bold text-gray-900 mb-4">
        Allocated Patients ({hospital.backtrackPath.length})
      </h4>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {hospital.backtrackPath.map((item, idx) => (
          <div
            key={idx}
            className="border border-gray-200 bg-gray-50 p-3 rounded text-xs"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-gray-900">{item.id}</span>
              <span className="font-bold text-teal-600">{item.score} pts</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-gray-600">
              <div>
                <div className="text-gray-500 text-xs">ICU</div>
                <div className="font-semibold text-gray-900">
                  {item.resources.icu}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Vent</div>
                <div className="font-semibold text-gray-900">
                  {item.resources.vent}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Med</div>
                <div className="font-semibold text-gray-900">
                  {item.resources.med}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Spec</div>
                <div className="font-semibold text-gray-900">
                  {item.resources.specialist}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-semibold">Total Survival Score</span>
          <span className="text-2xl font-bold text-teal-600">
            {Math.round(totalSurvival * 10) / 10}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BacktrackPanel;