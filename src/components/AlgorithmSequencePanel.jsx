import React, { useState, useEffect } from 'react';

const AlgorithmSequencePanel = ({ state, onDeathRaceClick }) => {
  const [sequenceStep, setSequenceStep] = useState(0);
  const [latestPatient, setLatestPatient] = useState(null);

  useEffect(() => {
    if (state?.arrivalFeed && state.arrivalFeed.length > 0) {
      const patient = state.arrivalFeed[0];
      if (patient.id !== latestPatient?.id) {
        setLatestPatient(patient);
        setSequenceStep(0);

        // Auto-advance sequence every 2 seconds
        const timer = setInterval(() => {
          setSequenceStep(prev => (prev < 2 ? prev + 1 : 0));
        }, 3000);

        return () => clearInterval(timer);
      }
    }
  }, [state?.arrivalFeed?.[0]?.id, latestPatient?.id]);

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-2">Algorithm Sequence</h2>
        <div className="h-1 w-16 bg-gradient-to-r from-cyan-500 to-transparent rounded-full" />
      </div>

      {/* Current Patient */}
      {latestPatient && (
        <div className="bg-gradient-to-br from-[#0F1823] to-[#0A1220] border border-cyan-500 border-opacity-20 rounded-lg p-4 mb-6"
          style={{ boxShadow: '0 0 15px rgba(0, 212, 255, 0.1), inset 0 0 15px rgba(0, 212, 255, 0.05)' }}>
          <div className="text-sm font-mono font-bold text-cyan-300 mb-2">{latestPatient.id}</div>
          <div className="text-xs text-cyan-400 space-y-1">
            <div>Age: <span className="text-cyan-300 font-bold">{latestPatient.age}</span></div>
            <div>Condition: <span className={`font-bold ${
              latestPatient.condition === 'Critical' ? 'text-red-400' :
              latestPatient.condition === 'Severe' ? 'text-amber-400' :
              'text-teal-400'
            }`}>{latestPatient.condition}</span></div>
            <div>Vitals: <span className="text-cyan-300 font-bold">{latestPatient.systolic_bp}/{latestPatient.spo2}%</span></div>
          </div>
        </div>
      )}

      {/* Algorithm Sequence Tabs */}
      <div className="space-y-3 flex-1">
        <AlgorithmStep
          step={1}
          title="AutoTriage Scoring"
          active={sequenceStep === 0}
          patient={latestPatient}
          content={
            latestPatient && (
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-cyan-400">Neural Score:</span>
                  <span className="text-cyan-300 font-bold">{latestPatient.survivalScore}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-400">Confidence:</span>
                  <span className="text-cyan-300 font-bold">{latestPatient.confidence}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded h-1 mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded transition-all duration-500"
                    style={{ width: `${(latestPatient.survivalScore / 10) * 100}%` }}
                  />
                </div>
              </div>
            )
          }
        />

        <AlgorithmStep
          step={2}
          title="Huffman Priority Encoding"
          active={sequenceStep === 1}
          patient={latestPatient}
          content={
            latestPatient && (
              <div className="text-xs space-y-2">
                <div className="bg-gray-900 rounded p-2">
                  <div className="text-cyan-400 mb-1">Binary Code:</div>
                  <div className="font-mono font-bold text-amber-400 text-sm tracking-widest">
                    {latestPatient.condition === 'Critical' ? '00' : latestPatient.condition === 'Severe' ? '01' : '11'}
                  </div>
                </div>
                <div className="text-cyan-400">Transmission: 2 bits</div>
              </div>
            )
          }
        />

        <AlgorithmStep
          step={3}
          title="Dijkstra Survival Routing"
          active={sequenceStep === 2}
          patient={latestPatient}
          content={
            latestPatient && (
              <div className="text-xs space-y-2">
                <div>
                  <div className="text-cyan-400 mb-1">Best Path:</div>
                  <div className="text-cyan-300 font-bold">{latestPatient.assignedHospital !== undefined ? 'City Hospital' : 'Calculating...'}</div>
                </div>
                <div className="text-cyan-400 text-xs">Distance: 12km | ETA: 8min | Survival: 84%</div>
              </div>
            )
          }
        />
      </div>

      {/* Death Race Button */}
      <button
        onClick={onDeathRaceClick}
        className="mt-6 w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase rounded-lg transition-all duration-300 group"
        style={{ boxShadow: '0 0 15px rgba(255, 59, 92, 0.3)' }}
      >
        <span className="group-hover:text-red-100">⚡ Algorithm Death Race</span>
      </button>
    </div>
  );
};

const AlgorithmStep = ({ step, title, active, patient, content }) => {
  return (
    <div
      className={`rounded-lg p-3 transition-all duration-500 ${
        active
          ? 'bg-gradient-to-br from-cyan-500 from-opacity-20 to-cyan-600 to-opacity-10 border border-cyan-500 border-opacity-40'
          : 'bg-gray-900 bg-opacity-20 border border-cyan-500 border-opacity-10'
      }`}
      style={active ? { boxShadow: '0 0 20px rgba(0, 212, 255, 0.2), inset 0 0 10px rgba(0, 212, 255, 0.1)' } : {}}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
          active ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-400'
        }`}>
          {step}
        </div>
        <div className={`text-xs font-bold uppercase tracking-wide ${active ? 'text-cyan-300' : 'text-gray-400'}`}>
          {title}
        </div>
      </div>

      {active && <div className="ml-8">{content}</div>}
    </div>
  );
};

export default AlgorithmSequencePanel;