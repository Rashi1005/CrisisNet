import React from 'react';
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

const HUDPanel = ({ state }) => {
  const hospitals = state?.hospitals ?? [];

  const totalPatients = hospitals.reduce((s, h) => s + h.patients.length, 0);
  const totalICU = hospitals.reduce((s, h) => s + h.icuUsed, 0);
  const totalICUCap = hospitals.reduce((s, h) => s + h.icuTotal, 0);

  return (
    <div className="cn-hud-panel">
      {/* Header */}
      <div className="cn-hud-header">
        <div className="cn-hud-title">Hospital Network HUD</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="cn-badge cn-badge-cyan">{hospitals.length} Nodes</span>
          <span className="cn-badge cn-badge-green">{totalPatients} Patients</span>
          <span
            className="cn-badge"
            style={{
              background: `rgba(${totalICU / totalICUCap > 0.85 ? '255,45,78' : '0,200,240'}, 0.1)`,
              border: `1px solid rgba(${totalICU / totalICUCap > 0.85 ? '255,45,78' : '0,200,240'}, 0.25)`,
              color: totalICU / totalICUCap > 0.85 ? 'var(--color-red)' : 'var(--color-cyan)',
            }}
          >
            ICU {totalICU}/{totalICUCap}
          </span>
        </div>
      </div>

      {/* Hospital Rows */}
      {hospitals.map((h) => {
        const status = getStatus(h.icuUsed, h.icuTotal);
        const pct = Math.round((h.icuUsed / h.icuTotal) * 100);
        const fillColor = statusColor[status];

        return (
          <div key={h.id} className="cn-hospital-row">
            {/* Beacon */}
            <div className={`cn-beacon status-${status}`}>
              <div className="cn-beacon-dot" />
              <div className="cn-beacon-ring" />
            </div>

            {/* Hospital Info */}
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

              {/* Capacity bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <CapacityRow label="ICU" used={h.icuUsed} total={h.icuTotal} color={fillColor} />
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
