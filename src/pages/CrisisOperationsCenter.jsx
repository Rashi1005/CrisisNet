import React, { useState, useEffect, useRef } from 'react';
import CrisisMap from '../components/CrisisMap';
import AlgorithmSequencePanel from '../components/AlgorithmSequencePanel';
import ConscientFeed from '../components/ConscientFeed';
import LeftSidebar from '../components/LeftSidebar';
import CrisisHeader from '../components/CrisisHeader';
import AlgorithmDeathRace from '../components/AlgorithmDeathRace';

const CrisisOperationsCenter = ({ state, simulatorRef }) => {
  const [activeScreen, setActiveScreen] = useState('operations');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [consequenceLog, setConsequenceLog] = useState([]);
  const [surgeAlert, setSurgeAlert] = useState(false);

  // Generate consequences
  useEffect(() => {
    if (!state || !state.arrivalFeed || state.arrivalFeed.length === 0) return;

    const latestPatient = state.arrivalFeed[0];

    if (latestPatient.status === 'allocated') {
      const newConsequence = {
        timestamp: new Date(),
        type: 'allocation',
        message: `Knapsack allocated ${latestPatient.id} (${latestPatient.condition}, Age ${latestPatient.age}) — Score: ${latestPatient.survivalScore} — Efficiency gain +${(latestPatient.survivalScore * 0.8).toFixed(1)}%`,
        severity: latestPatient.survivalScore > 7 ? 'positive' : 'neutral',
        patientId: latestPatient.id
      };
      setConsequenceLog(prev => [newConsequence, ...prev].slice(0, 50));
    } else if (latestPatient.status === 'transferred') {
      const penalty = latestPatient.originalScore - latestPatient.survivalScore;
      const newConsequence = {
        timestamp: new Date(),
        type: 'transfer',
        message: `Dijkstra rerouted ${latestPatient.id} to hospital — arrival +${(penalty * 2).toFixed(0)}min — survival: ${latestPatient.originalScore} → ${latestPatient.survivalScore} (−${penalty.toFixed(1)}%)`,
        severity: penalty > 2 ? 'critical' : penalty > 1 ? 'warning' : 'neutral',
        patientId: latestPatient.id
      };
      setConsequenceLog(prev => [newConsequence, ...prev].slice(0, 50));
    } else if (latestPatient.status === 'deferred') {
      const newConsequence = {
        timestamp: new Date(),
        type: 'deferred',
        message: `${latestPatient.id} DEFERRED — all hospitals full — waiting list +4min — survival probability −12%`,
        severity: 'critical',
        patientId: latestPatient.id
      };
      setConsequenceLog(prev => [newConsequence, ...prev].slice(0, 50));
    }
  }, [state?.arrivalFeed?.[0]?.id]);

  // Surge alert
  useEffect(() => {
    if (!state || !state.hospitals) return;

    const hasAlert = state.hospitals.some(h => (h.icuUsed / h.icuTotal) > 0.85);
    setSurgeAlert(hasAlert);
  }, [state?.hospitals]);

  if (activeScreen === 'death-race') {
    return (
      <AlgorithmDeathRace
        state={state}
        simulatorRef={simulatorRef}
        onBack={() => setActiveScreen('operations')}
      />
    );
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#080C14] via-[#0A1220] to-[#080C14] overflow-hidden font-sans">
      {/* Scanline effect */}
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 2px)',
          backgroundSize: '100% 2px'
        }}
      />

      {/* Critical surge vignette flash */}
      {surgeAlert && (
        <div
          className="fixed inset-0 pointer-events-none z-30"
          style={{
            backgroundImage: 'radial-gradient(ellipse at center, transparent 0%, rgba(255, 59, 92, 0.15) 100%)',
            animation: 'surge-vignette 2s ease-in-out infinite'
          }}
        />
      )}

      {/* Header */}
      <CrisisHeader state={state} surgeAlert={surgeAlert} />

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-80px)] mt-20">
        {/* Left Sidebar */}
        <LeftSidebar
          isOpen={sidebarOpen}
          activeScreen={activeScreen}
          onScreenChange={setActiveScreen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Left Contextual Panel (40% if sidebar open, 35% always) */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'w-[35%]' : 'w-[40%]'} border-r border-cyan-500 border-opacity-10 bg-gradient-to-b from-[#0F1823] to-[#0A1220] flex flex-col overflow-hidden`}>
          <AlgorithmSequencePanel state={state} onDeathRaceClick={() => setActiveScreen('death-race')} />
        </div>

        {/* Main Crisis Map (Right 65%) */}
        <div className="flex-1 flex flex-col relative">
          <CrisisMap state={state} />

          {/* Conscience Feed (Bottom strip, overlays map) */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080C14] via-[#080C14] border-t border-cyan-500 border-opacity-20">
            <ConscientFeed consequences={consequenceLog} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes surge-vignette {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        @keyframes glow-pulse {
          0%, 100% { 
            box-shadow: 0 0 10px rgba(0, 212, 255, 0.3), 
                        inset 0 0 10px rgba(0, 212, 255, 0.1);
            border-color: rgba(0, 212, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.6), 
                        inset 0 0 15px rgba(0, 212, 255, 0.2);
            border-color: rgba(0, 212, 255, 0.6);
          }
        }
        @keyframes count-up {
          from { opacity: 0.7; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default CrisisOperationsCenter;