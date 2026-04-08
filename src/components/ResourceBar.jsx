import React, { useState, useEffect } from 'react';

const ResourceBar = ({ label, used, total, animate = true }) => {
  const [displayUsed, setDisplayUsed] = useState(used);
  
  useEffect(() => {
    if (!animate) {
      setDisplayUsed(used);
      return;
    }

    const diff = used - displayUsed;
    if (diff === 0) return;

    const steps = 10;
    const stepValue = diff / steps;
    let current = 0;

    const interval = setInterval(() => {
      current++;
      setDisplayUsed(prev => {
        const newVal = displayUsed + stepValue * current;
        return current === steps ? used : newVal;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [used, displayUsed, animate]);

  const percentage = (displayUsed / total) * 100;
  let color = '#1D9E75'; // safe-teal

  if (percentage >= 85) {
    color = '#E24B4A'; // critical-red
  } else if (percentage >= 60) {
    color = '#EF9F27'; // triage-amber
  }

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs font-semibold mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-600">
          {Math.round(displayUsed)} / {total}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: percentage >= 85 ? '0 0 8px rgba(226, 75, 74, 0.4)' : 'none'
          }}
        />
      </div>
    </div>
  );
};

export default ResourceBar;