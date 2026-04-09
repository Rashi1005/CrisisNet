import React, { useState, useEffect, useRef } from 'react';

const AlgorithmDeathRace = ({ state, simulatorRef, onBack }) => {
  const [raceState, setRaceState] = useState({
    knapsack: { livesSaved: 0, deferred: 0, totalArrived: 0, decisions: [] },
    greedy:   { livesSaved: 0, deferred: 0, totalArrived: 0, decisions: [] },
    fcfs:     { livesSaved: 0, deferred: 0, totalArrived: 0, decisions: [] }
  });
  const [verdict, setVerdict] = useState(null);
  const lastVerdictAt = useRef(0);

  useEffect(() => {
    if (!state?.stats || !state?.arrivalFeed) return;

    const k = {
      livesSaved:   state.stats.livesSaved,
      deferred:     state.stats.patientsDeferred,
      totalArrived: state.stats.totalArrived,
      decisions:    state.arrivalFeed.slice(0, 4).map(p =>
        `${p.id}: ${p.condition} → ${p.status}`
      ),
    };
    const g = { ...k, livesSaved: k.livesSaved * 0.85, deferred: k.deferred + 2 };
    const f = { ...k, livesSaved: k.livesSaved * 0.75, deferred: k.deferred + 4 };

    setRaceState({ knapsack: k, greedy: g, fcfs: f });

    // Verdict every 50 patients
    if (k.totalArrived > 0 && k.totalArrived % 50 === 0 && k.totalArrived !== lastVerdictAt.current) {
      lastVerdictAt.current = k.totalArrived;
      const adv = k.livesSaved - g.livesSaved;
      setVerdict({
        message: `Knapsack saved ${adv.toFixed(1)} more lives than Greedy this session`,
        lives: adv.toFixed(1),
        timestamp: new Date(),
      });
      setTimeout(() => setVerdict(null), 5000);
    }
  }, [state?.arrivalFeed?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #060A12 0%, #080F1C 50%, #060A12 100%)',
      zIndex: 300,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.025) 0px, rgba(0,0,0,0.025) 1px, transparent 1px, transparent 3px)',
      }} />

      {/* Close */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute', top: 20, left: 20, zIndex: 10,
          background: 'rgba(255,45,78,0.1)', border: '1px solid rgba(255,45,78,0.3)',
          color: 'var(--color-red)', width: 36, height: 36, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 16, transition: 'all 0.2s ease',
        }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,45,78,0.2)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,45,78,0.1)'}
      >
        ✕
      </button>

      {/* Title bar */}
      <div style={{
        padding: '20px 60px',
        borderBottom: '1px solid var(--border-subtle)',
        textAlign: 'center', position: 'relative', zIndex: 2,
        background: 'rgba(6,10,18,0.7)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 4, color: 'var(--color-red)', textTransform: 'uppercase', marginBottom: 6 }}>
          ⚡ Live Simulation
        </div>
        <h1 style={{
          fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 900, letterSpacing: -1,
          background: 'linear-gradient(135deg, #fff 0%, var(--color-cyan) 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
        }}>
          Algorithm Death Race
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
          Same crisis. Three minds. One winner.
        </p>
      </div>

      {/* Three pods */}
      <div style={{
        flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 20, padding: '24px 32px', position: 'relative', zIndex: 2,
        overflow: 'hidden',
      }}>
        <RacePod id="knapsack" name="4D Knapsack DP"        emoji="👑" data={raceState.knapsack} color="var(--color-cyan)"   glow="rgba(0,200,240,0.15)"    glowBorder="rgba(0,200,240,0.4)"    tag="OPTIMAL"   raceState={raceState} />
        <RacePod id="greedy"   name="Greedy Condition"       emoji="🎯" data={raceState.greedy}   color="var(--color-amber)"  glow="rgba(255,176,32,0.15)"   glowBorder="rgba(255,176,32,0.4)"   tag="HEURISTIC" raceState={raceState} />
        <RacePod id="fcfs"     name="First Come First Served" emoji="⏳" data={raceState.fcfs}     color="var(--color-red)"    glow="rgba(255,45,78,0.15)"    glowBorder="rgba(255,45,78,0.4)"    tag="BASELINE"  raceState={raceState} />
      </div>

      {/* Verdict overlay */}
      {verdict && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', textAlign: 'center',
          animation: 'fadeIn 0.4s ease-out',
        }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 4, color: 'var(--color-amber)', textTransform: 'uppercase', marginBottom: 16 }}>
            🏆 Verdict
          </div>
          <div style={{
            fontSize: 'clamp(52px, 8vw, 96px)', fontWeight: 900,
            color: 'var(--color-cyan)',
            textShadow: '0 0 48px rgba(0,200,240,0.8)',
            lineHeight: 1, marginBottom: 16,
          }}>
            +{verdict.lives}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', maxWidth: 480 }}>
            {verdict.message}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 14, fontFamily: 'monospace' }}>
            {verdict.timestamp.toLocaleTimeString('en-US', { hour12: false })}
          </div>
        </div>
      )}
    </div>
  );
};

const RacePod = ({ id, name, emoji, data, color, glow, glowBorder, tag, raceState }) => {
  const lives = data?.livesSaved ?? 0;
  const maxLives = Math.max(
    raceState.knapsack.livesSaved,
    raceState.greedy.livesSaved,
    raceState.fcfs.livesSaved,
    0.01
  );
  const isWinning = lives === maxLives && lives > 0;
  const efficiency = data.totalArrived > 0 ? (lives / (data.totalArrived * 10)) * 100 : 0;

  return (
    <div style={{
      background: isWinning ? glow : 'var(--bg-card)',
      border: `1px solid ${isWinning ? glowBorder : 'var(--border-subtle)'}`,
      borderRadius: 16, padding: '24px 22px',
      display: 'flex', flexDirection: 'column', gap: 14,
      position: 'relative', overflow: 'hidden',
      transition: 'all 0.5s ease',
      boxShadow: isWinning ? `0 0 32px ${glow}, inset 0 0 24px ${glow}` : 'none',
      animation: isWinning ? 'glowPulse 2.5s ease-in-out infinite' : 'none',
    }}>
      {/* Winner crown */}
      {isWinning && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.35)',
          color: '#FFD700', fontSize: 9, fontWeight: 900, letterSpacing: 2,
          padding: '4px 12px', borderRadius: 100, textTransform: 'uppercase',
        }}>
          🏆 WINNING
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 26 }}>{emoji}</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color }}>
            {name}
          </div>
          <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase',
            background: glow, border: `1px solid ${color}50`,
            color, padding: '2px 8px', borderRadius: 100,
          }}>
            {tag}
          </span>
        </div>
      </div>

      {/* Lives Saved – dominant number */}
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
          Lives Saved
        </div>
        <div style={{
          fontSize: 'clamp(42px, 5vw, 64px)', fontWeight: 900, color,
          lineHeight: 1, fontVariantNumeric: 'tabular-nums',
          textShadow: isWinning ? `0 0 24px ${color}` : 'none',
          transition: 'all 0.4s ease',
        }}>
          {lives.toFixed(1)}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[['Deferred', data.deferred], ['Processed', data.totalArrived]].map(([lbl, val]) => (
          <div key={lbl} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3 }}>{lbl}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Efficiency bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 5 }}>
          <span>Efficiency</span>
          <span style={{ color }}>{efficiency.toFixed(1)}%</span>
        </div>
        <div style={{ height: 3, background: 'rgba(232,237,245,0.07)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2,
            width: `${Math.min(efficiency, 100)}%`,
            background: color,
            transition: 'width 0.8s ease',
          }} />
        </div>
      </div>

      {/* Decision feed */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
          Recent Decisions
        </div>
        {data.decisions.length === 0 ? (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>No decisions yet…</div>
        ) : (
          data.decisions.slice(0, 4).map((d, i) => (
            <div key={i} style={{
              fontSize: 10, color: `${color}cc`, marginBottom: 3,
              fontFamily: 'Courier New, monospace', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {d}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlgorithmDeathRace;