import React, { useRef, useEffect } from 'react';

const ConscientFeed = ({ consequences }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
    }
  }, [consequences.length]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'positive':
        return 'border-l-4 border-green-500 bg-green-950 bg-opacity-30 text-green-400';
      case 'warning':
        return 'border-l-4 border-amber-500 bg-amber-950 bg-opacity-30 text-amber-400';
      case 'critical':
        return 'border-l-4 border-red-500 bg-red-950 bg-opacity-30 text-red-400';
      default:
        return 'border-l-4 border-cyan-500 bg-cyan-950 bg-opacity-30 text-cyan-400';
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-3 bg-gradient-to-t from-[#080C14] to-transparent">
      <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Algorithm Conscience Feed</div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-1 scroll-smooth"
        style={{
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': {
            width: '4px'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0, 212, 255, 0.05)'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 212, 255, 0.2)'
          }
        }}
      >
        {consequences.length === 0 ? (
          <div className="text-xs text-cyan-500 opacity-50 italic">Waiting for first patient...</div>
        ) : (
          consequences.map((item, idx) => (
            <ConsequenceItem key={idx} item={item} severity={getSeverityColor(item.severity)} />
          ))
        )}
      </div>
    </div>
  );
};

const ConsequenceItem = ({ item, severity }) => {
  return (
    <div className={`${severity} p-2 rounded text-xs font-mono`}>
      <div className="flex items-start gap-2">
        <span className="text-cyan-500 opacity-70 min-w-fit">{item.timestamp.toLocaleTimeString('en-US')}</span>
        <span className="flex-1">{item.message}</span>
      </div>
    </div>
  );
};

export default ConscientFeed;