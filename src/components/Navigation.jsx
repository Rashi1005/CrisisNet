import React, { useState, useEffect } from 'react';

const Navigation = ({ state, simulatorRef, onDeathRace }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isRunning  = state?.isRunning ?? false;
  const livesSaved = state?.stats?.livesSaved ?? 0;
  const efficiency = state?.stats?.efficiency ?? 0;
  const patients   = state?.stats?.totalArrived ?? 0;

  const handleToggle = () => {
    if (!simulatorRef?.current) return;
    if (isRunning) {
      simulatorRef.current.pause();
    } else {
      simulatorRef.current.start(1);
    }
  };

  const handleReset = () => {
    if (!simulatorRef?.current) return;
    simulatorRef.current.reset();
  };

  return (
    <nav className="cn-nav">
      {/* Logo */}
      <div className="cn-nav-logo">
        CrisisNet
        <span>Emergency Ops v2.0</span>
      </div>

      {/* Live Status Pill */}
      <div className={`cn-nav-status ${isRunning ? '' : 'paused'}`}>
        <div className="cn-nav-status-dot" />
        {isRunning ? 'Live' : 'Paused'}
      </div>

      {/* Time */}
      <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-muted)', flexShrink: 0 }}>
        {time.toLocaleTimeString('en-US', { hour12: false })}
      </div>

      {/* Metrics */}
      <div className="cn-nav-metrics">
        <div className="cn-nav-metric">
          <div className="cn-nav-metric-label">Patients</div>
          <div className="cn-nav-metric-value" style={{ color: 'var(--color-cyan)' }}>{patients}</div>
        </div>
        <div className="cn-nav-metric">
          <div className="cn-nav-metric-label">Lives Saved</div>
          <div className="cn-nav-metric-value" style={{ color: 'var(--color-green)' }}>{livesSaved.toFixed(1)}</div>
        </div>
        <div className="cn-nav-metric">
          <div className="cn-nav-metric-label">Efficiency</div>
          <div className="cn-nav-metric-value" style={{ color: 'var(--color-amber)' }}>{efficiency}%</div>
        </div>
      </div>

      {/* Controls */}
      <div className="cn-nav-controls">
        {/* Death Race toggle */}
        {onDeathRace && (
          <button
            className="cn-btn-icon"
            onClick={onDeathRace}
            title="Algorithm Death Race"
            style={{ color: 'var(--color-red)', borderColor: 'rgba(255,45,78,0.3)', background: 'rgba(255,45,78,0.08)', fontSize: 14 }}
          >
            ⚡
          </button>
        )}
        <button
          className="cn-btn-icon"
          onClick={handleToggle}
          title={isRunning ? 'Pause simulation' : 'Start simulation'}
          style={isRunning
            ? { color: 'var(--color-amber)', borderColor: 'rgba(255,176,32,0.3)', background: 'rgba(255,176,32,0.08)' }
            : { color: 'var(--color-green)', borderColor: 'rgba(31,208,112,0.3)', background: 'rgba(31,208,112,0.08)' }
          }
        >
          {isRunning ? '⏸' : '▶'}
        </button>
        <button
          className="cn-btn-icon"
          onClick={handleReset}
          title="Reset simulation"
        >
          ↺
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
