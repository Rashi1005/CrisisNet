import React, { useState, useEffect, useRef } from 'react';

const AlgorithmDeathRace = ({ state, simulatorRef, onBack }) => {
  const [raceState, setRaceState] = useState({
    knapsack: { livesSaved: 0, deferred: 0, totalArrived: 0, decisions: [] },
    greedy: { livesSaved: 0, deferred: 0, totalArrived: 0, decisions: [] },
    fcfs: { livesSaved: 0, deferred: 0, totalArrived: 0, decisions: [] }
  });

  const [verdict, setVerdict] = useState(null);
  const verdictTimeRef = useRef(0);

  useEffect(() => {
    // Simulate race data
    if (!state?.arrivalFeed) return;

    // Simple simulation
    const k = { livesSaved: state.stats.livesSaved, deferred: state.stats.patientsDeferred, totalArrived: state.arrivalFeed.length };
    const g = { livesSaved: k.livesSaved * 0.85, deferred: k.deferred + 2, totalArrived: k.totalArrived };
    const f = { livesSaved: k.livesSaved * 0.75, deferred: k.deferred + 4, totalArrived: k.totalArrived };

    setRaceState({
      knapsack: { ...k, decisions: [] },
      greedy: { ...g, decisions: [] },
      fcfs: { ...f, decisions: [] }
    });

    // Show verdict every 50 patients
    if (k.totalArrived > 0 && k.totalArrived % 50 === 0) {
      const knapsackAdv = k.livesSaved - g.livesSaved;
      setVerdict({
        message: `Knapsack saved ${knapsackAdv.toFixed(1)} more lives than Greedy`,
        lives: Math.round(knapsackAdv),
        timestamp: new Date()
      });

      verdictTimeRef.current = 0;
    }
  }, [state?.arrivalFeed?.length]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#080C14] via-[#0A1220] to-[#080C14] z-50 flex flex-col overflow-hidden">
      {/* Close button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 z-50 text-cyan-400 hover:text-cyan-300 text-2xl transition-colors"
      >
        ✕
      </button>

      {/* Title */}
      <div className="text-center py-6 border-b border-cyan-500 border-opacity-10">
        <h1 className="text-3xl font-black text-cyan-400" style={{ textShadow: '0 0 20px rgba(0, 212, 255, 0.5)' }}>
          ALGORITHM DEATH RACE
        </h1>
        <p className="text-xs text-cyan-500 mt-2">Same crisis. Three minds. One winner.</p>
      </div>

      {/* Three Pods */}
      <div className="flex-1 grid grid-cols-3 gap-4 p-6">
        <RacePod
          name="4D KNAPSACK (DP)"
          emoji="👑"
          data={raceState.knapsack}
          color="cyan"
          isWinning={raceState.knapsack.livesSaved > Math.max(raceState.greedy.livesSaved, raceState.fcfs.livesSaved)}
        />
        <RacePod
          name="GREEDY CONDITION"
          emoji="🎯"
          data={raceState.greedy}
          color="amber"
          isWinning={raceState.greedy.livesSaved > Math.max(raceState.knapsack.livesSaved, raceState.fcfs.livesSaved)}
        />
        <RacePod
          name="FIRST COME FIRST SERVED"
          emoji="⏳"
          data={raceState.fcfs}
          color="red"
          isWinning={raceState.fcfs.livesSaved > Math.max(raceState.knapsack.livesSaved, raceState.greedy.livesSaved)}
        />
      </div>

      {/* Verdict */}
      {verdict && (
        <VerdictPanel verdict={verdict} />
      )}

      {/* Scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 2px)',
          backgroundSize: '100% 2px'
        }}
      />
    </div>
  );
};

const RacePod = ({ name, emoji, data, color, isWinning }) => {
  const colorMap = {
    cyan: { bg: 'from-cyan-900 to-cyan-950', border: 'border-cyan-500', text: 'text-cyan-400', glow: 'rgba(0, 212, 255, 0.2)' },
    amber: { bg: 'from-amber-900 to-amber-950', border: 'border-amber-500', text: 'text-amber-400', glow: 'rgba(255, 179, 71, 0.2)' },
    red: { bg: 'from-red-900 to-red-950', border: 'border-red-500', text: 'text-red-400', glow: 'rgba(255, 59, 92, 0.2)' }
  };

  const c = colorMap[color];

  return (
    <div
      className={`rounded-lg border-2 ${c.border} ${isWinning ? 'border-opacity-100' : 'border-opacity-30'} bg-gradient-to-br ${c.bg} p-6 flex flex-col transition-all duration-500 relative overflow-hidden`}
      style={{
        boxShadow: isWinning
          ? `0 0 30px ${c.glow}, inset 0 0 30px ${c.glow}`
          : `0 0 10px ${c.glow}, inset 0 0 10px ${c.glow}`,
        animation: isWinning ? 'pod-pulse 1s ease-in-out infinite' : 'none'
      }}
    >
      {isWinning && (
        <div className="absolute top-2 right-2 text-2xl animate-bounce">👑</div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <span className="text-3xl">{emoji}</span>
        <h2 className={`text-sm font-black uppercase tracking-wider ${c.text}`}>{name}</h2>
      </div>

      {/* Lives Saved - DOMINANT */}
      <div className="text-center mb-6">
        <div className={`text-xs font-bold ${c.text} opacity-70 mb-1`}>LIVES SAVED</div>
        <div className={`text-5xl font-black ${c.text}`} style={{ textShadow: `0 0 20px ${c.glow}` }}>
          {data.livesSaved.toFixed(1)}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div className="bg-black bg-opacity-40 p-2 rounded">
          <div className={`${c.text} opacity-70`}>Deferred</div>
          <div className={`font-bold ${c.text}`}>{data.deferred}</div>
        </div>
        <div className="bg-black bg-opacity-40 p-2 rounded">
          <div className={`${c.text} opacity-70`}>Processed</div>
          <div className={`font-bold ${c.text}`}>{data.totalArrived}</div>
        </div>
      </div>

      {/* Efficiency Bar */}
      <div className="mb-4">
        <div className={`text-xs ${c.text} opacity-70 mb-1`}>Efficiency</div>
        <div className="w-full h-2 bg-black bg-opacity-50 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500`}
            style={{
              width: `${data.totalArrived > 0 ? (data.livesSaved / (data.totalArrived * 10)) * 100 : 0}%`,
              background: color === 'cyan' ? 'rgba(0, 212, 255, 0.8)' : color === 'amber' ? 'rgba(255, 179, 71, 0.8)' : 'rgba(255, 59, 92, 0.8)'
            }}
          />
        </div>
      </div>

      {/* Decision Feed */}
      <div className="flex-1 text-xs space-y-1 overflow-y-auto max-h-40">
        {data.decisions.length === 0 ? (
          <div className={`${c.text} opacity-30`}>No decisions yet...</div>
        ) : (
          data.decisions.slice(0, 5).map((d, i) => (
            <div key={i} className={`${c.text} opacity-70 text-xs`}>
              {d}
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes pod-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
};

const VerdictPanel = ({ verdict }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 bg-black bg-opacity-70 animate-fadeIn">
      <div className="text-center">
        <div className="text-6xl font-black text-cyan-400 mb-4" style={{ textShadow: '0 0 30px rgba(0, 212, 255, 0.8)' }}>
          {verdict.lives} LIVES
        </div>
        <div className="text-2xl text-cyan-300 mb-2">{verdict.message}</div>
        <div className="text-xs text-cyan-500 opacity-70">{verdict.timestamp.toLocaleTimeString('en-US')}</div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AlgorithmDeathRace;