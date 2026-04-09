import React from 'react';

const LeftSidebar = ({ isOpen, activeScreen, onScreenChange, onToggle }) => {
  const screens = [
    { id: 'operations', icon: '🎯', label: 'Operations', color: 'cyan' },
    { id: 'death-race', icon: '⚡', label: 'Death Race', color: 'red' },
    { id: 'map-heatmap', icon: '🔥', label: 'Heatmap', color: 'orange' }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="w-16 border-r border-cyan-500 border-opacity-10 bg-gradient-to-b from-[#0F1823] to-[#0A1220] flex items-center justify-center hover:bg-cyan-500 hover:bg-opacity-10 transition-all duration-300 group"
      >
        <span className="text-2xl group-hover:text-cyan-400 transition-colors">☰</span>
      </button>
    );
  }

  return (
    <div className="w-20 border-r border-cyan-500 border-opacity-10 bg-gradient-to-b from-[#0F1823] to-[#0A1220] flex flex-col items-center py-4 space-y-4">
      {/* Close button */}
      <button
        onClick={onToggle}
        className="text-xl hover:text-cyan-400 transition-colors"
      >
        ✕
      </button>

      {/* Screen nav */}
      <div className="flex-1 flex flex-col gap-2">
        {screens.map(screen => (
          <button
            key={screen.id}
            onClick={() => onScreenChange(screen.id)}
            className={`w-14 h-14 rounded-lg flex items-center justify-center text-xl transition-all duration-300 ${
              activeScreen === screen.id
                ? `bg-${screen.color}-500 bg-opacity-20 border-2 border-${screen.color}-500 text-${screen.color}-400`
                : `text-cyan-300 hover:bg-cyan-500 hover:bg-opacity-10 border border-cyan-500 border-opacity-20`
            }`}
            title={screen.label}
          >
            {screen.icon}
          </button>
        ))}
      </div>

      {/* Bottom indicators */}
      <div className="space-y-2 text-xs text-cyan-500 opacity-50 text-center">
        <div>v2.0</div>
        <div>NASA</div>
        <div>MODE</div>
      </div>
    </div>
  );
};

export default LeftSidebar;