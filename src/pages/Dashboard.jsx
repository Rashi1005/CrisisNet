import React, { useState, useEffect, useRef } from 'react';
import HospitalCard from '../components/HospitalCard';
import ArrivalFeedRow from '../components/ArrivalFeedRow';
import StatCard from '../components/StatCard';
import TransferGraph from '../components/TransferGraph';
import KnapsackTable from '../components/KnapsackTable';
import BacktrackPanel from '../components/BacktrackPanel';
import AutoTriage from '../components/AutoTriage';
import CrisisSimulator from '../engine/simulator';

const Dashboard = () => {
  const [state, setState] = useState(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [showAutoTriage, setShowAutoTriage] = useState(false);
  const [activeHospitalIdx, setActiveHospitalIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('backtrack');
  const [currentTime, setCurrentTime] = useState(new Date());
  const simulatorRef = useRef(null);
  const feedEndRef = useRef(null);
  const [pulsingHospitals, setPulsingHospitals] = useState({});

  // Live clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize simulator
  useEffect(() => {
    const initSimulator = async () => {
      const simulator = new CrisisSimulator();
      await simulator.initialize();

      simulator.onUpdate(newState => {
        setState(newState);

        // Trigger pulse effect on newly updated hospitals
        if (newState.hospitals) {
          const newPulsing = {};
          newState.hospitals.forEach((h, idx) => {
            if (h.patients.length > 0) {
              newPulsing[idx] = true;
              setTimeout(() => {
                setPulsingHospitals(prev => {
                  const updated = { ...prev };
                  delete updated[idx];
                  return updated;
                });
              }, 1000);
            }
          });
          setPulsingHospitals(newPulsing);
        }
      });

      simulatorRef.current = simulator;
      setState(simulator.getState());
    };

    initSimulator();
  }, []);

  // Auto-scroll feed
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state?.arrivalFeed.length]);

  const handleStart = () => {
    if (simulatorRef.current) {
      simulatorRef.current.start(speedMultiplier);
    }
  };

  const handlePause = () => {
    if (simulatorRef.current) {
      simulatorRef.current.pause();
    }
  };

  const handleReset = () => {
    if (simulatorRef.current) {
      simulatorRef.current.reset();
      setState(simulatorRef.current.getState());
    }
  };

  const handleSpeedChange = e => {
    const newSpeed = parseFloat(e.target.value);
    setSpeedMultiplier(newSpeed);
    if (state?.isRunning && simulatorRef.current) {
      simulatorRef.current.speedMultiplier = newSpeed;
    }
  };

  const handleAddPatient = async patientData => {
    if (simulatorRef.current) {
      await simulatorRef.current.addPatientManual(patientData);
    }
  };

  if (!state) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4" />
          <p className="text-white">Initializing CrisisNet...</p>
        </div>
      </div>
    );
  }

  const currentHospital = state.hospitals[activeHospitalIdx];
  const distanceMatrix = [
    [0, 12, 28],
    [12, 0, 18],
    [28, 18, 0]
  ];

  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TOP BAR */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left */}
          <div>
            <h1 className="text-2xl font-black">CrisisNet</h1>
            <p className="text-xs text-gray-400">Algorithmic Triage Routing System</p>
          </div>

          {/* Center */}
          <div className="text-center">
            <p className="text-lg font-bold font-mono">{timeString}</p>
            <p className="text-xs text-gray-400">Mumbai Emergency Network</p>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  state.isRunning ? 'bg-teal-400 animate-pulse' : 'bg-red-400'
                }`}
              />
              <span className="text-sm font-semibold">
                {state.isRunning ? 'LIVE' : 'PAUSED'}
              </span>
            </div>
            <div className="text-xs bg-gray-700 px-3 py-1 rounded">
              Patients: {state.arrivalFeed.length}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT PANEL - HOSPITALS (30%) */}
          <div className="col-span-4 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Hospital Status</h2>
            {state.hospitals.map((hospital, idx) => (
              <div
                key={hospital.id}
                onClick={() => setActiveHospitalIdx(idx)}
                className={`cursor-pointer transition-all ${
                  activeHospitalIdx === idx ? 'ring-2 ring-teal-500' : ''
                }`}
              >
                <HospitalCard
                  hospital={hospital}
                  isPulsing={pulsingHospitals[idx]}
                />
              </div>
            ))}
          </div>

          {/* CENTER PANEL - ARRIVAL FEED (40%) */}
          <div className="col-span-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Live Arrival Feed</h2>
            <div className="bg-white rounded-lg border border-gray-200 h-96 overflow-y-auto p-4">
              {state.arrivalFeed.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Waiting for patient arrivals...</p>
                  <p className="text-xs text-gray-400 mt-2">Click "Start" to begin</p>
                </div>
              ) : (
                <>
                  {state.arrivalFeed.map((patient, idx) => (
                    <ArrivalFeedRow key={`${patient.id}-${idx}`} patient={patient} />
                  ))}
                  <div ref={feedEndRef} />
                </>
              )}
            </div>
          </div>

          {/* RIGHT PANEL - STATS (30%) */}
          <div className="col-span-4 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">System Metrics</h2>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                title="Lives Saved"
                value={state.stats.livesSaved}
                icon="💚"
                color="teal"
              />
              <StatCard
                title="Deferred"
                value={state.stats.patientsDeferred}
                icon="⚠️"
                color={state.stats.patientsDeferred > 0 ? 'red' : 'blue'}
              />
              <StatCard
                title="Transfers"
                value={state.stats.transfersMade}
                icon="🚑"
                color="blue"
              />
              <StatCard
                title="Efficiency"
                value={state.stats.efficiency}
                icon="📊"
                format="percentage"
                color="amber"
              />
            </div>

            {/* ALGORITHM INSPECTOR */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex gap-2 mb-4 border-b">
                {['backtrack', 'knapsack', 'transfer'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-2 text-xs font-semibold transition-colors ${
                      activeTab === tab
                        ? 'text-teal-600 border-b-2 border-teal-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab === 'backtrack'
                      ? 'Patients'
                      : tab === 'knapsack'
                      ? 'DP Table'
                      : 'Network'}
                  </button>
                ))}
              </div>

              <div>
                {activeTab === 'backtrack' && (
                  <BacktrackPanel hospital={currentHospital} />
                )}
                {activeTab === 'knapsack' && (
                  <KnapsackTable hospital={currentHospital} />
                )}
                {activeTab === 'transfer' && (
                  <TransferGraph
                    hospitals={state.hospitals}
                    distanceMatrix={distanceMatrix}
                  />
                )}
              </div>
            </div>

            {/* CONTROLS */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
              <div className="flex gap-2">
                {!state.isRunning ? (
                  <button
                    onClick={handleStart}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    ▶ Start
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    ⏸ Pause
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  🔄 Reset
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Speed: {speedMultiplier.toFixed(1)}×
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={speedMultiplier}
                  onChange={handleSpeedChange}
                  className="w-full"
                />
              </div>

              <button
                onClick={() => setShowAutoTriage(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                + Manual Patient
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AUTO TRIAGE MODAL */}
      {showAutoTriage && (
        <AutoTriage
          onPatientReady={handleAddPatient}
          onClose={() => setShowAutoTriage(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;