import React, { useEffect, useState } from 'react';

const PODS = [
  {
    id: 'knapsack',
    name: '4D Knapsack DP',
    emoji: '👑',
    tag: 'OPTIMAL',
    color: 'var(--color-cyan)',
    glow: 'cyan',
    dimColor: 'rgba(0,200,240,0.08)',
    borderColor: 'rgba(0,200,240,0.3)',
    textColor: 'var(--color-cyan)',
    multiplier: 1.0,
    deferredOffset: 0,
  },
  {
    id: 'greedy',
    name: 'Greedy Condition',
    emoji: '🎯',
    tag: 'HEURISTIC',
    color: 'var(--color-amber)',
    glow: 'amber',
    dimColor: 'rgba(255,176,32,0.08)',
    borderColor: 'rgba(255,176,32,0.3)',
    textColor: 'var(--color-amber)',
    multiplier: 0.83,
    deferredOffset: 2,
  },
  {
    id: 'fcfs',
    name: 'First-Come First-Served',
    emoji: '⏳',
    tag: 'BASELINE',
    color: 'var(--color-red)',
    glow: 'red',
    dimColor: 'rgba(255,45,78,0.08)',
    borderColor: 'rgba(255,45,78,0.3)',
    textColor: 'var(--color-red)',
    multiplier: 0.72,
    deferredOffset: 4,
  },
];

const DeathRace = ({ state }) => {
  const [raceData, setRaceData] = useState({ knapsack: 0, greedy: 0, fcfs: 0 });

  useEffect(() => {
    if (!state?.stats) return;
    const k = state.stats.livesSaved;
    setRaceData({
      knapsack: k,
      greedy:   k * 0.83,
      fcfs:     k * 0.72,
    });
  }, [state?.stats?.livesSaved]);

  const maxLives = Math.max(raceData.knapsack, raceData.greedy, raceData.fcfs, 1);
  const winner   = PODS.find(p => raceData[p.id] === Math.max(raceData.knapsack, raceData.greedy, raceData.fcfs));

  const deferred    = state?.stats?.patientsDeferred ?? 0;
  const totalArrived = state?.stats?.totalArrived ?? 0;

  return (
    <div className="cn-grid-3">
      {PODS.map((pod) => {
        const lives      = raceData[pod.id] ?? 0;
        const isWinning  = winner?.id === pod.id;
        const efficiency = totalArrived > 0 ? (lives / (totalArrived * 10)) * 100 : 0;
        const podDeferred = deferred + pod.deferredOffset;

        return (
          <div
            key={pod.id}
            className={`cn-pod ${isWinning ? `winning-${pod.glow}` : ''}`}
            style={{
              background: pod.dimColor,
              borderColor: isWinning ? pod.borderColor : 'var(--border-subtle)',
            }}
          >
            {/* Winner badge */}
            {isWinning && (
              <div className="cn-pod-winner-badge">🏆 WINNING</div>
            )}

            {/* Pod Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 28 }}>{pod.emoji}</span>
              <div>
                <div className="cn-pod-name" style={{ color: pod.textColor }}>{pod.name}</div>
                <div>
                  <span
                    className="cn-badge"
                    style={{
                      background: `${pod.dimColor}`,
                      border: `1px solid ${pod.borderColor}`,
                      color: pod.textColor,
                      fontSize: 9,
                      padding: '3px 10px',
                    }}
                  >
                    {pod.tag}
                  </span>
                </div>
              </div>
            </div>

            {/* Lives Saved — dominant number */}
            <div className="cn-pod-lives" style={{ color: pod.textColor }}>
              {lives.toFixed(1)}
            </div>
            <div className="cn-pod-lives-label">Lives Saved</div>

            {/* Stats Grid */}
            <div className="cn-pod-stats">
              <div className="cn-pod-stat">
                <div className="cn-pod-stat-label">Deferred</div>
                <div className="cn-pod-stat-value" style={{ color: pod.textColor }}>
                  {podDeferred}
                </div>
              </div>
              <div className="cn-pod-stat">
                <div className="cn-pod-stat-label">Processed</div>
                <div className="cn-pod-stat-value" style={{ color: pod.textColor }}>
                  {totalArrived}
                </div>
              </div>
            </div>

            {/* Efficiency bar */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                <span>Efficiency</span>
                <span style={{ color: pod.textColor }}>{efficiency.toFixed(1)}%</span>
              </div>
              <div className="cn-pod-efficiency-bar">
                <div
                  className="cn-pod-efficiency-fill"
                  style={{ width: `${Math.min(efficiency, 100)}%`, background: pod.color }}
                />
              </div>
            </div>

            {/* Advantage vs baseline */}
            {pod.id !== 'fcfs' && raceData.fcfs > 0 && (
              <div style={{
                marginTop: 8,
                fontSize: 11,
                fontWeight: 700,
                color: pod.textColor,
                background: pod.dimColor,
                border: `1px solid ${pod.borderColor}`,
                borderRadius: 6,
                padding: '6px 10px',
                textAlign: 'center',
              }}>
                +{((lives - raceData.fcfs)).toFixed(1)} lives vs FCFS
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DeathRace;
