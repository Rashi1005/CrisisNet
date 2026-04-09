import React, { useEffect, useRef } from 'react';

const TICKER_ITEMS = [
  '🚨 CRITICAL SURGE — City Hospital ICU approaching capacity',
  '🚑 Dijkstra rerouting active — 3 transfers in progress',
  '⚡ Knapsack DP solver processing batch allocation — 12 patients queued',
  '🏥 District Hospital: 68% ICU utilisation — CAUTION threshold',
  '💡 AutoTriage neural model: 94% confidence on last 10 predictions',
  '📡 Mumbai Hospital Network — All nodes online',
  '⚠ Rural Clinic nearing ventilator limit — Diverting critical cases',
  '✅ Knapsack outperforming Greedy by 18.4% this session',
];

const Hero = ({ state, simulatorRef }) => {
  const tickerRef = useRef(null);

  const isRunning  = state?.isRunning  ?? false;
  const livesSaved = state?.stats?.livesSaved ?? 0;
  const efficiency = state?.stats?.efficiency ?? 0;
  const patients   = state?.stats?.totalArrived ?? 0;
  const hospitals  = state?.hospitals?.length ?? 3;

  const handleStart = () => {
    if (!simulatorRef?.current) return;
    if (!isRunning) {
      simulatorRef.current.start(1);
    }
  };

  const handleScrollToOps = () => {
    document.getElementById('operations')?.scrollIntoView({ behavior: 'smooth' });
  };

  const tickerText = TICKER_ITEMS.join('   ·   ');

  return (
    <section className="cn-hero">
      {/* Emergency Ticker */}
      <div className="cn-ticker">
        <div className="cn-ticker-label">⚡ Alert</div>
        <div className="cn-ticker-track">
          <div className="cn-ticker-content" ref={tickerRef}>
            {tickerText}
          </div>
        </div>
      </div>

      {/* Hero Body */}
      <div className="cn-hero-body">
        {/* Badge */}
        <div className="cn-hero-badge cn-fade-in">
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--color-green)',
            boxShadow: '0 0 8px var(--color-green-glow)',
            display: 'inline-block',
            animation: 'beaconPulse 2s ease-in-out infinite'
          }} />
          Live Emergency Operations — Mumbai
        </div>

        {/* Title */}
        <h1 className="cn-hero-title cn-fade-in cn-delay-1">
          Mumbai Crisis<br />Response Network
        </h1>

        {/* Subtitle */}
        <p className="cn-hero-subtitle cn-fade-in cn-delay-2">
          AI-powered triage allocation using 4D Knapsack dynamic programming
          and Dijkstra survival routing — optimising every second, every life.
        </p>

        {/* Live Stats */}
        <div className="cn-hero-stats cn-fade-in cn-delay-3">
          <div className="cn-hero-stat">
            <div className="cn-hero-stat-value" style={{ color: 'var(--color-cyan)' }}>{patients}</div>
            <div className="cn-hero-stat-label">Patients</div>
          </div>
          <div className="cn-hero-stat">
            <div className="cn-hero-stat-value" style={{ color: 'var(--color-green)' }}>{livesSaved.toFixed(1)}</div>
            <div className="cn-hero-stat-label">Lives Saved</div>
          </div>
          <div className="cn-hero-stat">
            <div className="cn-hero-stat-value" style={{ color: 'var(--color-amber)' }}>{efficiency}%</div>
            <div className="cn-hero-stat-label">Efficiency</div>
          </div>
          <div className="cn-hero-stat">
            <div className="cn-hero-stat-value" style={{ color: 'var(--color-purple)' }}>{hospitals}</div>
            <div className="cn-hero-stat-label">Hospitals</div>
          </div>
        </div>

        {/* CTAs */}
        <div className="cn-hero-cta cn-fade-in cn-delay-4">
          <button className="cn-btn-primary" onClick={handleStart}>
            {isRunning ? '▶ Running' : '▶ Launch Simulation'}
          </button>
          <button className="cn-btn-ghost" onClick={handleScrollToOps}>
            View Operations ↓
          </button>
        </div>
      </div>

      {/* Subtle grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage:
          'linear-gradient(rgba(0,200,240,0.03) 1px, transparent 1px), ' +
          'linear-gradient(90deg, rgba(0,200,240,0.03) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)'
      }} />
    </section>
  );
};

export default Hero;
