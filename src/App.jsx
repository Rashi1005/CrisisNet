import React, { useState, useEffect, useRef } from 'react';
import CrisisOperationsCenter from './pages/CrisisOperationsCenter';
import CrisisSimulator from './engine/simulator';

function App() {
  const [state, setState] = useState(null);
  const simulatorRef = useRef(null);

  useEffect(() => {
    const initSimulator = async () => {
      const simulator = new CrisisSimulator();
      await simulator.initialize();

      simulator.onUpdate(newState => {
        setState(newState);
      });

      simulatorRef.current = simulator;
      setState(simulator.getState());
    };

    initSimulator();
  }, []);

  if (!state) {
    return (
      <div className="cn-loading">
        <div className="cn-loading-spinner" />
        <p style={{ color: 'var(--color-cyan)', fontFamily: 'monospace', fontWeight: 700, fontSize: 16 }}>
          Initializing CrisisNet v2.0...
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }}>
          Emergency Operations System
        </p>
      </div>
    );
  }

  return <CrisisOperationsCenter state={state} simulatorRef={simulatorRef} />;
}

export default App;