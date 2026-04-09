import React, { useState, useEffect } from 'react';

const AnimatedCounter = ({ target, decimals = 0, color }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (target === display) return;
    const diff  = target - display;
    const steps = 24;
    const step  = diff / steps;
    let count   = 0;

    const id = setInterval(() => {
      count += 1;
      setDisplay(prev => {
        const next = prev + step;
        return count >= steps ? target : Math.round(next * Math.pow(10, decimals)) / Math.pow(10, decimals);
      });
    }, 30);

    return () => clearInterval(id);
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="cn-stat-value" style={{ color }}>
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display)}
    </div>
  );
};

const StatsSection = ({ state }) => {
  const stats     = state?.stats;

  const totalArrived   = stats?.totalArrived   ?? 0;
  const livesSaved     = stats?.livesSaved     ?? 0;
  const efficiency     = stats?.efficiency     ?? 0;
  const transfersMade  = stats?.transfersMade  ?? 0;
  const deferred       = stats?.patientsDeferred ?? 0;
  const bumped         = stats?.patientsBumped ?? 0;

  const STATS = [
    {
      label:    'Patients Processed',
      value:    totalArrived,
      decimals: 0,
      sub:      `${deferred} deferred`,
      color:    'var(--color-cyan)',
      suffix:   '',
    },
    {
      label:    'Lives Saved',
      value:    livesSaved,
      decimals: 1,
      sub:      'via knapsack DP',
      color:    'var(--color-green)',
      suffix:   '',
    },
    {
      label:    'System Efficiency',
      value:    efficiency,
      decimals: 0,
      sub:      'survival score ratio',
      color:    'var(--color-amber)',
      suffix:   '%',
    },
    {
      label:    'Transfers Made',
      value:    transfersMade,
      decimals: 0,
      sub:      `${bumped} patients bumped`,
      color:    'var(--color-purple)',
      suffix:   '',
    },
  ];

  return (
    <div className="cn-stats-grid">
      {STATS.map((s, i) => (
        <div className="cn-stat-counter" key={s.label}>
          <AnimatedCounter target={s.value} decimals={s.decimals} color={s.color} />
          {s.suffix && (
            <span style={{ fontSize: 24, fontWeight: 900, color: s.color, marginLeft: 2, verticalAlign: 'top', lineHeight: '1.1' }}>
              {s.suffix}
            </span>
          )}
          <div className="cn-stat-label">{s.label}</div>
          <div className="cn-stat-sublabel">{s.sub}</div>

          {/* Bottom accent line */}
          <div style={{
            position: 'absolute', bottom: 0, left: '20%', right: '20%',
            height: 2,
            background: `linear-gradient(to right, transparent, ${s.color}40, transparent)`,
          }} />
        </div>
      ))}
    </div>
  );
};

export default StatsSection;
