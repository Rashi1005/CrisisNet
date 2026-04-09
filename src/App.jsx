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
      <div className="w-screen h-screen bg-gradient-to-br from-[#080C14] via-[#0A1220] to-[#080C14] flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" style={{ borderTopColor: 'transparent' }} />
          <p className="text-cyan-400 font-mono text-lg font-bold">Initializing CrisisNet v2.0...</p>
          <p className="text-cyan-500 text-xs mt-2 opacity-70">Emergency Operations System</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden">
      <CrisisOperationsCenter state={state} simulatorRef={simulatorRef} />
    </div>
  );
}

export default App;