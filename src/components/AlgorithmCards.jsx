import React, { useState, useEffect } from 'react';

const ALGORITHMS = [
  {
    step: 1,
    badge: 'Neural AI',
    title: 'AutoTriage Scoring',
    description:
      'ONNX neural network assesses patient vitals — age, systolic BP, SpO₂, heart rate, temperature and condition — to produce a survival score between 1 and 10 with confidence.',
    complexity: 'O(1) inference',
    method: 'Multi-label classification',
    inputs: 'Vitals × 6',
    color: 'var(--color-cyan)',
    liveKey: 'triage',
  },
  {
    step: 2,
    badge: '4D Knapsack DP',
    title: 'Resource Allocation',
    description:
      '4-dimensional dynamic programming maximises total survival score across ICU beds, ventilators, medicines and specialist hours — guaranteeing the globally optimal patient set.',
    complexity: 'O(n · W⁴)',
    method: 'Bottom-up DP',
    inputs: 'Patients × Resources',
    color: 'var(--color-purple)',
    liveKey: 'knapsack',
  },
  {
    step: 3,
    badge: 'Graph Routing',
    title: 'Dijkstra Survival Routing',
    description:
      'Shortest-path algorithm reroutes overflow patients to the nearest under-capacity hospital, with edge weights adjusted for transfer time to preserve the survival score.',
    complexity: 'O((V + E) log V)',
    method: 'Priority-queue Dijkstra',
    inputs: 'Hospital graph',
    color: 'var(--color-amber)',
    liveKey: 'dijkstra',
  },
];

const AlgorithmCards = ({ state }) => {
  const [activeStep, setActiveStep] = useState(0);

  // Cycle active step based on latest patient
  useEffect(() => {
    if (!state?.arrivalFeed?.length) return;
    const cycle = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 3);
    }, 3200);
    return () => clearInterval(cycle);
  }, [state?.arrivalFeed?.length]);

  const latest = state?.arrivalFeed?.[0];
  const stats  = state?.stats;

  const liveData = {
    triage: {
      'Neural Score': latest ? `${latest.survivalScore}/10` : '—',
      'Confidence':   latest ? `${latest.confidence}%` : '—',
      'Condition':    latest?.condition ?? '—',
    },
    knapsack: {
      'Lives Saved':  stats ? stats.livesSaved.toFixed(1) : '—',
      'Bumped':       stats ? stats.patientsBumped : '—',
      'Efficiency':   stats ? `${stats.efficiency}%` : '—',
    },
    dijkstra: {
      'Transfers':    stats ? stats.transfersMade : '—',
      'Deferred':     stats ? stats.patientsDeferred : '—',
      'Assigned':     latest?.assignedHospital !== null && latest?.assignedHospital !== undefined
                        ? `Hospital #${latest.assignedHospital + 1}` : '—',
    },
  };

  return (
    <div className="cn-grid-3">
      {ALGORITHMS.map((algo, i) => (
        <div
          key={algo.step}
          className={`cn-algo-card ${activeStep === i ? 'active' : ''}`}
          style={activeStep === i ? { borderColor: `${algo.color}40` } : {}}
        >
          {/* Large background step number */}
          <div className="cn-algo-step-num" style={{ color: `${algo.color}0a` }}>
            {algo.step}
          </div>

          {/* Badge */}
          <div
            className="cn-algo-badge"
            style={{ background: `${algo.color}12`, borderColor: `${algo.color}30`, color: algo.color }}
          >
            {algo.badge}
          </div>

          {/* Title + Description */}
          <div className="cn-algo-title">{algo.title}</div>
          <div className="cn-algo-description">{algo.description}</div>

          {/* Meta */}
          <div className="cn-algo-meta">
            <div className="cn-algo-meta-item">
              <div className="cn-algo-meta-label">Complexity</div>
              <div className="cn-algo-meta-value" style={{ color: algo.color }}>{algo.complexity}</div>
            </div>
            <div className="cn-algo-meta-item">
              <div className="cn-algo-meta-label">Method</div>
              <div className="cn-algo-meta-value" style={{ color: algo.color }}>{algo.method}</div>
            </div>
          </div>

          {/* Live Data */}
          <div className="cn-algo-live">
            {Object.entries(liveData[algo.liveKey]).map(([label, val]) => (
              <div className="cn-algo-live-row" key={label}>
                <span className="cn-algo-live-label">{label}</span>
                <span className="cn-algo-live-value" style={{ color: algo.color }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Active indicator */}
          {activeStep === i && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: 3,
              background: `linear-gradient(to right, transparent, ${algo.color}, transparent)`,
              borderRadius: '0 0 16px 16px',
              animation: 'fadeIn 0.3s ease-out'
            }} />
          )}
        </div>
      ))}
    </div>
  );
};

export default AlgorithmCards;
