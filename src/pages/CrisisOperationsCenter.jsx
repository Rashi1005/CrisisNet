import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import CrisisMap from '../components/CrisisMap';
import HUDPanel from '../components/HUDPanel';
import AlgorithmCards from '../components/AlgorithmCards';
import StatsSection from '../components/StatsSection';
import DeathRace from '../components/DeathRace';
import ConscieneceFeed from '../components/ConscieneceFeed';
import CTA from '../components/CTA';

const CrisisOperationsCenter = ({ state, simulatorRef }) => {
  const [consequenceLog, setConsequenceLog] = useState([]);
  const [surgeAlert, setSurgeAlert]         = useState(false);

  // Build conscience log from arrival feed
  useEffect(() => {
    if (!state?.arrivalFeed?.[0]) return;
    const p = state.arrivalFeed[0];

    if (p.status === 'allocated') {
      setConsequenceLog(prev => [{
        timestamp: new Date(),
        type:      'allocation',
        message:   `Knapsack allocated ${p.id} (${p.condition}, Age ${p.age}) — Score: ${p.survivalScore} — Efficiency gain +${(p.survivalScore * 0.8).toFixed(1)}%`,
        severity:  p.survivalScore > 7 ? 'positive' : 'neutral',
      }, ...prev].slice(0, 60));
    } else if (p.status === 'transferred') {
      const penalty = (p.originalScore ?? p.survivalScore) - p.survivalScore;
      setConsequenceLog(prev => [{
        timestamp: new Date(),
        type:      'transfer',
        message:   `Dijkstra rerouted ${p.id} to hospital — arrival +${(Math.max(penalty, 0) * 2).toFixed(0)}min — survival: ${p.originalScore ?? p.survivalScore} → ${p.survivalScore} (−${Math.max(penalty, 0).toFixed(1)}%)`,
        severity:  penalty > 2 ? 'critical' : penalty > 1 ? 'warning' : 'neutral',
      }, ...prev].slice(0, 60));
    } else if (p.status === 'deferred') {
      setConsequenceLog(prev => [{
        timestamp: new Date(),
        type:      'deferred',
        message:   `${p.id} DEFERRED — all hospitals full — waiting list +4min — survival probability −12%`,
        severity:  'critical',
      }, ...prev].slice(0, 60));
    }
  }, [state?.arrivalFeed?.[0]?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Surge alert
  useEffect(() => {
    if (!state?.hospitals) return;
    setSurgeAlert(state.hospitals.some(h => h.icuTotal > 0 && (h.icuUsed / h.icuTotal) > 0.85));
  }, [state?.hospitals]);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Scanlines overlay */}
      <div className="cn-scanlines" />

      {/* Critical surge vignette */}
      {surgeAlert && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 95, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(ellipse at center, transparent 0%, rgba(255,45,78,0.1) 100%)',
            animation: 'surgeVignette 2.5s ease-in-out infinite',
          }}
        />
      )}

      {/* Fixed Navigation */}
      <Navigation state={state} simulatorRef={simulatorRef} />

      {/* Hero */}
      <Hero state={state} simulatorRef={simulatorRef} />

      {/* ── Operations ─────────────────────────────────────── */}
      <div className="cn-divider" />

      <section className="cn-section" id="operations">
        <div className="cn-section-header">
          <div className="cn-section-label">Live Operations</div>
          <h2 className="cn-section-title">Crisis Response Map</h2>
          <p className="cn-section-subtitle">
            Real-time Leaflet map of the Mumbai hospital network — 3 nodes, live patient routing and ambulance dispatch.
          </p>
        </div>

        {/* Map + HUD side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          <div className="cn-map-container" style={{ height: 540 }}>
            <CrisisMap state={state} />
          </div>
          <HUDPanel state={state} />
        </div>
      </section>

      {/* ── Algorithm Intelligence ──────────────────────────── */}
      <div className="cn-divider" />

      <section className="cn-section" id="algorithms">
        <div className="cn-section-header">
          <div className="cn-section-label">Intelligence Layer</div>
          <h2 className="cn-section-title">Algorithm Stack</h2>
          <p className="cn-section-subtitle">
            Three algorithms execute sequentially for every patient arrival — scoring, allocating, and routing.
          </p>
        </div>
        <AlgorithmCards state={state} />
      </section>

      {/* ── Statistics ─────────────────────────────────────── */}
      <div className="cn-divider" />

      <section className="cn-section" id="stats">
        <div className="cn-section-header">
          <div className="cn-section-label">System Metrics</div>
          <h2 className="cn-section-title">Live Statistics</h2>
        </div>
        <StatsSection state={state} />
      </section>

      {/* ── Death Race ─────────────────────────────────────── */}
      <div className="cn-divider" />

      <section className="cn-section" id="death-race">
        <div className="cn-section-header">
          <div className="cn-section-label">Algorithm Benchmarks</div>
          <h2 className="cn-section-title">Algorithm Death Race</h2>
          <p className="cn-section-subtitle">
            Same crisis. Three algorithms. One optimal winner — 4D Knapsack DP vs Greedy vs First-Come First-Served.
          </p>
        </div>
        <DeathRace state={state} />
      </section>

      {/* ── Conscience Feed ────────────────────────────────── */}
      <div className="cn-divider" />

      <section className="cn-section" id="feed">
        <div className="cn-section-header">
          <div className="cn-section-label">Ethical Accounting</div>
          <h2 className="cn-section-title">Algorithm Conscience Feed</h2>
          <p className="cn-section-subtitle">
            Every decision logged. Every deferred patient counted. The algorithm must answer for its choices.
          </p>
        </div>
        <ConscieneceFeed consequences={consequenceLog} />
      </section>

      {/* ── CTA + Footer ───────────────────────────────────── */}
      <div className="cn-divider" />
      <CTA />
    </div>
  );
};

export default CrisisOperationsCenter;