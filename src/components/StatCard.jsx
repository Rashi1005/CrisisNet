import React, { useState, useEffect } from 'react';

const AnimatedNumber = ({ value, format = 'number' }) => {
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
        return current === steps ? value : Math.round(newVal);
      });
    }, 30);

    return () => clearInterval(interval);
  }, [value, displayValue]);

  if (format === 'percentage') {
    return <>{displayValue}%</>;
  }
  return <>{Math.round(displayValue)}</>;
};

const StatCard = ({ title, value, icon, color = 'teal', format = 'number' }) => {
  const colorClasses = {
    teal: 'bg-teal-50 border-teal-200',
    red: 'bg-red-50 border-red-200',
    blue: 'bg-blue-50 border-blue-200',
    amber: 'bg-amber-50 border-amber-200'
  };

  const textColors = {
    teal: 'text-teal-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    amber: 'text-amber-600'
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">{title}</p>
          <p className={`text-3xl font-bold ${textColors[color]}`}>
            <AnimatedNumber value={value} format={format} />
          </p>
        </div>
        <div className={`text-2xl ${textColors[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

export default StatCard;