import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import CrisisMap from '../components/CrisisMap';
import HUDPanel from '../components/HUDPanel';
import AlgorithmCards from '../components/AlgorithmCards';
import StatsSection from '../components/StatsSection';
import DeathRace from '../components/DeathRace';
import ConscieneceFeed from '../components/ConscieneceFeed';
import AlgorithmDeathRace from '../components/AlgorithmDeathRace';
import CTA from '../components/CTA';

const CrisisOperationsCenter = ({ state, simulatorRef }) => {
  const [consequenceLog, setConsequenceLog] = useState([]);
  const [surgeAlert, setSurgeAlert]         = useState(false);
  const [showDeathRace, setShowDeathRace]   = useState(false);

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

      {/* Full-screen Death Race modal */}
      {showDeathRace && (
        <AlgorithmDeathRace
          state={state}
          simulatorRef={simulatorRef}
          onBack={() => setShowDeathRace(false)}
        />
      )}

      {/* Fixed Navigation */}
      <Navigation
        state={state}
        simulatorRef={simulatorRef}
        onDeathRace={() => setShowDeathRace(true)}
      />

      {/* Hero */}
      <Hero state={state} simulatorRef={simulatorRef} />

      {/* ── Operations ─────────────────────────────────────────── */}
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
          <button
            className="cn-btn-danger"
            style={{ marginTop: 20 }}
            onClick={() => setShowDeathRace(true)}
          >
            ⚡ Full-Screen Death Race
          </button>
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

      {/* ── Horizontal Conscience Strip ─────────────────────── */}
      <ConscienceStrip consequences={consequenceLog} />

      {/* ── CTA + Footer ───────────────────────────────────── */}
      <div className="cn-divider" />
      <CTA />
    </div>
  );
};

// ── Horizontal scrolling conscience strip ──────────────────────────────────
const STRIP_COLOR = {
  positive: { bg: 'rgba(31,208,112,0.07)', border: '#1FD070', text: '#90eac0', label: 'ALLOC' },
  neutral:  { bg: 'rgba(0,200,240,0.07)',  border: '#00C8F0', text: '#b0e8f0', label: 'ALLOC' },
  warning:  { bg: 'rgba(255,176,32,0.07)', border: '#FFB020', text: '#f0cc85', label: 'XFER'  },
  critical: { bg: 'rgba(255,45,78,0.07)',  border: '#FF2D4E', text: '#ff8fa0', label: 'DEFER' },
};

const ConscienceStrip = ({ consequences }) => {
  if (consequences.length === 0) return null;

  const items = consequences.slice(0, 12);

  return (
    <div style={{
      borderTop: '1px solid var(--border-subtle)',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(6,10,18,0.95)',
      padding: '12px var(--pad-desktop)',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, overflow: 'hidden' }}>
        {/* Static label */}
        <div style={{
          fontSize: 9, fontWeight: 900, letterSpacing: 2.5, textTransform: 'uppercase',
          color: 'var(--color-red)', background: 'rgba(255,45,78,0.1)',
          border: '1px solid rgba(255,45,78,0.3)', borderRadius: 4,
          padding: '4px 10px', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          ⚡ Conscience
        </div>

        {/* Scrolling strip */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <div style={{
            display: 'flex', gap: 10,
            animation: 'stripScroll 30s linear infinite',
            whiteSpace: 'nowrap',
          }}>
            {[...items, ...items].map((item, idx) => {
              const s = STRIP_COLOR[item.severity] ?? STRIP_COLOR.neutral;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: s.bg, border: `1px solid ${s.border}`,
                    borderLeft: `3px solid ${s.border}`,
                    borderRadius: 6, padding: '5px 12px',
                    fontSize: 11, color: s.text, flexShrink: 0, maxWidth: 380,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                  }}
                >
                  <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1.5, opacity: 0.7, flexShrink: 0 }}>
                    [{s.label}]
                  </span>
                  <span style={{ fontFamily: 'Courier New, monospace', fontSize: 9, color: 'rgba(232,237,245,0.4)', flexShrink: 0 }}>
                    {item.timestamp instanceof Date
                      ? item.timestamp.toLocaleTimeString('en-US', { hour12: false })
                      : '--:--:--'}
                  </span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.message}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes stripScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default CrisisOperationsCenter;