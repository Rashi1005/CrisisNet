import React, { useState, useEffect } from 'react';

const StatCard = ({ title, value, icon, color = 'cyan', format = 'number' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value === displayValue) return;

    const diff = value - displayValue;
    const steps = 20;
    const stepValue = diff / steps;
    let current = 0;

    const interval = setInterval(() => {
      current++;
      setDisplayValue(prev => {
        const newVal = displayValue + stepValue * current;
        return current === steps ? value : Math.round(newVal * 10) / 10;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [value, displayValue]);

  const colorMap = {
    cyan: { bg: 'bg-cyan-900 bg-opacity-30', border: 'border-cyan-400', text: 'text-cyan-400' },
    green: { bg: 'bg-green-900 bg-opacity-30', border: 'border-green-400', text: 'text-green-400' },
    red: { bg: 'bg-red-900 bg-opacity-30', border: 'border-red-400', text: 'text-red-400' },
    blue: { bg: 'bg-blue-900 bg-opacity-30', border: 'border-blue-400', text: 'text-blue-400' },
    amber: { bg: 'bg-amber-900 bg-opacity-30', border: 'border-amber-400', text: 'text-amber-400' }
  };

  const c = colorMap[color] || colorMap.cyan;

  return (
    <div className={`${c.bg} border-2 ${c.border} border-opacity-30 rounded p-3 transition-all hover:border-opacity-50`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-bold text-cyan-300 uppercase">{title}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={`text-2xl font-bold font-mono ${c.text}`}>
        {format === 'percentage' ? `${Math.round(displayValue)}%` : Math.round(displayValue * 10) / 10}
      </p>
    </div>
  );
};

export default StatCard;