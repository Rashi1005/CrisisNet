import React, { useState, useEffect } from 'react';
import ResourceBar from './ResourceBar';

const getStatus = (used, total) => {
  const pct = (used / total) * 100;
  if (pct >= 85) return 'crit';
  if (pct >= 60) return 'warn';
  return 'ok';
};

const statusLabel = { ok: 'Normal', warn: 'Caution', crit: 'Critical' };
const statusColor = {
  ok:   'var(--color-green)',
  warn: 'var(--color-amber)',
  crit: 'var(--color-red)',
};

const ALGO_STATUS = [
  { key: 'knapsack', label: 'Knapsack DP',  emoji: '📐', color: 'var(--color-purple)' },
  { key: 'dijkstra', label: 'Dijkstra',      emoji: '🗺️', color: 'var(--color-cyan)'   },
  { key: 'huffman',  label: 'Huffman',       emoji: '🌲', color: 'var(--color-amber)'  },
];

const HUDPanel = ({ state }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hospitals    = state?.hospitals ?? [];
  const arrivalFeed  = state?.arrivalFeed ?? [];
  const latest       = arrivalFeed[0];
  const isRunning    = state?.isRunning ?? false;

  const totalPatients  = hospitals.reduce((s, h) => s + h.patients.length, 0);
  const totalICU       = hospitals.reduce((s, h) => s + h.icuUsed, 0);
  const totalICUCap    = hospitals.reduce((s, h) => s + h.icuTotal, 0);

  // Derive which algorithm fired last
  const lastAlgo =
    latest?.status === 'transferred' ? 'dijkstra'
    : latest?.status === 'allocated' ? 'knapsack'
    : null;

  return (
    <div className="cn-hud-panel">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="cn-hud-header">
        <div className="cn-hud-title">Hospital Network HUD</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="cn-badge cn-badge-cyan">{hospitals.length} Nodes</span>
          <span className="cn-badge cn-badge-green">{totalPatients} Pts</span>
          <span
            className="cn-badge"
            style={{
              background: `rgba(${totalICUCap > 0 && totalICU / totalICUCap > 0.85 ? '255,45,78' : '0,200,240'}, 0.1)`,
              border: `1px solid rgba(${totalICUCap > 0 && totalICU / totalICUCap > 0.85 ? '255,45,78' : '0,200,240'}, 0.25)`,
              color: totalICUCap > 0 && totalICU / totalICUCap > 0.85 ? 'var(--color-red)' : 'var(--color-cyan)',
            }}
          >
            ICU {totalICU}/{totalICUCap}
          </span>
        </div>
      </div>

      {/* ── Live Clock ─────────────────────────────────────── */}
      <div style={{
        padding: '10px 24px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          System Time
        </div>
        <div style={{
          fontFamily: 'Courier New, monospace',
          fontSize: 18,
          fontWeight: 800,
          color: isRunning ? 'var(--color-cyan)' : 'var(--text-muted)',
          letterSpacing: 2,
          textShadow: isRunning ? '0 0 12px var(--color-cyan-glow)' : 'none',
        }}>
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </div>
      </div>

      {/* ── Hospital Rows ──────────────────────────────────── */}
      {hospitals.map((h) => {
        const status    = getStatus(h.icuUsed, h.icuTotal);
        const fillColor = statusColor[status];
        return (
          <div key={h.id} className="cn-hospital-row">
            <div className={`cn-beacon status-${status}`}>
              <div className="cn-beacon-dot" />
              <div className="cn-beacon-ring" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{h.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {h.type}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: fillColor, letterSpacing: 1 }}>
                    {statusLabel[status].toUpperCase()}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {h.patients.length} patients
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <CapacityRow label="ICU"  used={h.icuUsed}  total={h.icuTotal}  color={fillColor} />
                <CapacityRow label="Vent" used={h.ventUsed} total={h.ventTotal} color={fillColor} />
              </div>
            </div>
          </div>
        );
      })}

      {hospitals.length === 0 && (
        <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          Awaiting hospital network data...
        </div>
      )}

      {/* ── Algorithm Status Indicators ───────────────────── */}
      <div style={{
        padding: '14px 24px',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
          Algorithm Status
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {ALGO_STATUS.map(algo => {
            const active = isRunning && lastAlgo === algo.key;
            return (
              <div key={algo.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: active ? algo.color : 'rgba(232,237,245,0.12)',
                  boxShadow: active ? `0 0 8px ${algo.color}` : 'none',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: active ? algo.color : 'var(--text-muted)', flex: 1, transition: 'color 0.3s ease' }}>
                  {algo.emoji} {algo.label}
                </span>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: active ? algo.color : 'var(--text-muted)' }}>
                  {active ? 'ACTIVE' : isRunning ? 'READY' : 'IDLE'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Latest Decision ────────────────────────────────── */}
      {latest && (
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(0,200,240,0.03)',
        }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 7 }}>
            Latest Decision
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>
              {latest.status === 'allocated' ? '✅' : latest.status === 'transferred' ? '🔄' : '⚠️'}
            </span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
                {latest.id} — {latest.condition}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                Score: {latest.survivalScore} · {latest.status?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CapacityRow = ({ label, used, total, color }) => {
  const pct = total > 0 ? (used / total) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-muted)', width: 26, flexShrink: 0 }}>
        {label}
      </div>
      <div className="cn-capacity-bar">
        <div
          className="cn-capacity-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', width: 42, textAlign: 'right', flexShrink: 0, fontFamily: 'monospace' }}>
        {used}/{total}
      </div>
    </div>
  );
};

export default HUDPanel;
