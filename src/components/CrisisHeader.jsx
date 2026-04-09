import React, { useState, useEffect } from 'react';

const CrisisHeader = ({ state, surgeAlert }) => {
  const [time, setTime] = useState(new Date());
  const [patientCount, setPatientCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (state?.arrivalFeed) {
      setPatientCount(state.arrivalFeed.length);
    }
  }, [state?.arrivalFeed?.length]);

  const totalLivesSaved = state?.stats?.livesSaved || 0;
  const efficiency = state?.stats?.efficiency || 0;

  return (
    <div className="fixed top-0 left-0 right-0 h-20 bg-gradient-to-r from-[#0A0F1A] via-[#0F1823] to-[#0A0F1A] border-b border-cyan-500 border-opacity-20 z-50 flex items-center px-6">
      {/* Logo + Title */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="text-3xl font-black text-cyan-400" style={{ textShadow: '0 0 10px rgba(0, 212, 255, 0.5)' }}>
          CrisisNet
        </div>
        <div className="flex flex-col text-xs">
          <div className="text-cyan-300 font-bold">EMERGENCY OPERATIONS</div>
          <div className="text-cyan-500 opacity-70">Mumbai Hospital Network</div>
        </div>
      </div>

      {/* Center: Live Metrics */}
      <div className="flex-1 flex justify-center gap-12 px-12">
        <MetricBadge label="PATIENTS" value={patientCount} unit="" color="cyan" />
        <MetricBadge label="LIVES SAVED" value={totalLivesSaved.toFixed(1)} unit="pts" color="green" />
        <MetricBadge label="EFFICIENCY" value={efficiency} unit="%" color="amber" />
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${state?.isRunning ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} style={{
            boxShadow: state?.isRunning ? '0 0 10px rgba(34, 197, 94, 0.8)' : '0 0 10px rgba(255, 59, 92, 0.8)'
          }} />
          <div className="text-xs font-bold text-cyan-300">
            {state?.isRunning ? 'LIVE' : 'PAUSED'}
          </div>
        </div>
      </div>

      {/* Right: Time + Alerts */}
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-sm font-mono text-cyan-300">{time.toLocaleTimeString('en-US')}</div>
          <div className="text-xs text-cyan-500 opacity-70">{time.toLocaleDateString('en-US')}</div>
        </div>

        {surgeAlert && (
          <div
            className="px-4 py-2 rounded border-2 border-red-500 bg-red-950 bg-opacity-40 text-xs font-bold text-red-400 animate-pulse"
            style={{ boxShadow: '0 0 15px rgba(255, 59, 92, 0.6)' }}
          >
            ⚠ SURGE ALERT
          </div>
        )}

        <div className="w-1 h-10 bg-gradient-to-b from-cyan-500 to-transparent opacity-30" />

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <div className="text-xs text-cyan-300">SYSTEMS OK</div>
        </div>
      </div>
    </div>
  );
};

const MetricBadge = ({ label, value, unit, color }) => {
  const colorMap = {
    cyan: 'text-cyan-400 text-cyan-500',
    green: 'text-green-400 text-green-500',
    amber: 'text-amber-400 text-amber-500'
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`text-xs font-bold ${colorMap[color]}`}>{label}</div>
      <div className={`text-2xl font-black ${colorMap[color]}`}>{value}{unit}</div>
    </div>
  );
};

export default CrisisHeader;