import React, { useState, useEffect } from 'react';

const ResourceBar = ({ label, used, total, animate = true }) => {
  const [displayUsed, setDisplayUsed] = useState(used);
  const [prevUsed, setPrevUsed] = useState(used);

  useEffect(() => {
    if (!animate) {
      setDisplayUsed(used);
      return;
    }

    const diff = used - displayUsed;
    if (diff === 0) return;

    const steps = 15;
    const stepValue = diff / steps;
    let current = 0;

    const interval = setInterval(() => {
      current++;
      setDisplayUsed(prev => {
        const newVal = displayUsed + stepValue * current;
        return current === steps ? used : newVal;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [used, displayUsed, animate]);

  // Trigger animation on value change
  useEffect(() => {
    if (used !== prevUsed) {
      setPrevUsed(used);
    }
  }, [used, prevUsed]);

  const percentage = (displayUsed / total) * 100;
  let color = '#1D9E75'; // safe-teal

  if (percentage >= 85) {
    color = '#FF3B3B'; // critical-red
  } else if (percentage >= 60) {
    color = '#FFB800'; // triage-amber
  }

  return (
    <div className="mb-0">
      <div className="flex justify-between text-xs font-semibold mb-1">
        <span className="text-cyan-300">{label}</span>
        <span className="text-cyan-400">
          {Math.round(displayUsed)} / {total}
        </span>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-cyan-400 border-opacity-20 relative">
        <div
          className="h-full transition-all duration-300 flex items-center justify-end pr-1"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: percentage >= 85 ? `inset 0 0 8px ${color}` : 'none'
          }}
        >
          {percentage > 40 && (
            <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#050D1A' }}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceBar;