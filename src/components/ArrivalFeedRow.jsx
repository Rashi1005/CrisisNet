import React, { useEffect, useState } from 'react';

const ConditionBadge = ({ condition }) => {
  const styles = {
    Critical: 'bg-red-100 text-red-700 border-red-300',
    Severe: 'bg-amber-100 text-amber-700 border-amber-300',
    Moderate: 'bg-teal-100 text-teal-700 border-teal-300'
  };

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full border ${
        styles[condition] || styles.Moderate
      }`}
    >
      {condition}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    allocated: 'bg-teal-50 text-teal-700 border-l-4 border-teal-500',
    transferred: 'bg-blue-50 text-blue-700 border-l-4 border-blue-500',
    deferred: 'bg-gray-50 text-gray-700 border-l-4 border-gray-400',
    bumped: 'bg-red-50 text-red-700 border-l-4 border-red-500'
  };

  const labels = {
    allocated: 'ALLOCATED',
    transferred: 'TRANSFERRED',
    deferred: 'DEFERRED',
    bumped: 'BUMPED'
  };

  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-bold rounded ${
        styles[status] || styles.deferred
      }`}
    >
      {labels[status] || status}
    </span>
  );
};

const ArrivalFeedRow = ({ patient }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const timeStr = patient.timestamp
    ? patient.timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    : '--:--:--';

  return (
    <div
      className={`transform transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-bold text-gray-900 text-lg">{patient.id}</span>
              <span className="text-xs text-gray-500">{timeStr}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">
                Age: {patient.age}
              </span>
              <ConditionBadge condition={patient.condition} />
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-teal-600">
              {patient.survivalScore}
            </div>
            <div className="text-xs text-gray-500">
              Confidence: {patient.confidence}%
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <StatusBadge status={patient.status} />
          {patient.transferPath && (
            <span className="text-xs text-blue-600 font-mono">
              {patient.transferPath}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArrivalFeedRow;