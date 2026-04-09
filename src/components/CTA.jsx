import React from 'react';

const TRUST_ITEMS = [
  { label: 'AI-Powered',     icon: '🧠', desc: 'ONNX neural triage model' },
  { label: 'Optimal',        icon: '📐', desc: '4D Knapsack DP guarantees global optimum' },
  { label: 'Real-Time',      icon: '⚡', desc: 'Live Mumbai hospital network' },
  { label: 'Open Source',    icon: '💻', desc: 'Full source code on GitHub' },
];

const CTA = () => {
  return (
    <>
      {/* CTA Section */}
      <section className="cn-cta">
        <div className="cn-badge cn-badge-cyan" style={{ marginBottom: 28, display: 'inline-flex' }}>
          Ready to Deploy
        </div>

        <h2 className="cn-cta-title">
          Deploy CrisisNet in<br />Your Network
        </h2>

        <p className="cn-cta-subtitle">
          Bring AI-powered emergency triage and hospital routing to your city.
          Open source, production-ready, and built for real crises.
        </p>

        <div className="cn-hero-cta" style={{ marginBottom: 64 }}>
          <a
            className="cn-btn-primary"
            href="https://github.com/Rashi1005/CrisisNet"
            target="_blank"
            rel="noopener noreferrer"
          >
            ⬆ View on GitHub
          </a>
          <button
            className="cn-btn-ghost"
            onClick={() => document.getElementById('operations')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Live Demo ↑
          </button>
        </div>

        {/* Trust indicators */}
        <div
          style={{
            display: 'flex',
            gap: 32,
            justifyContent: 'center',
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {TRUST_ITEMS.map(item => (
            <div key={item.label} style={{ textAlign: 'center', maxWidth: 140 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="cn-footer">
        <div>
          <div className="cn-footer-logo">CrisisNet</div>
          <div className="cn-footer-copy" style={{ marginTop: 4 }}>
            Mumbai Emergency Operations System · v2.0
          </div>
        </div>

        <div className="cn-footer-copy" style={{ textAlign: 'center' }}>
          Built with React · Leaflet · ONNX Runtime · Vite
        </div>

        <div className="cn-footer-badges">
          <span className="cn-footer-badge">4D Knapsack DP</span>
          <span className="cn-footer-badge">Dijkstra Routing</span>
          <span className="cn-footer-badge">AutoTriage AI</span>
          <span className="cn-footer-badge">Open Source</span>
        </div>
      </footer>
    </>
  );
};

export default CTA;
