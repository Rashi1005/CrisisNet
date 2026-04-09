import React, { useRef, useEffect } from 'react';

const TYPE_LABELS = {
  allocation: 'ALLOC',
  transfer:   'XFER',
  deferred:   'DEFER',
};

const ConscieneceFeed = ({ consequences }) => {
  const listRef = useRef(null);

  // Auto-scroll to top when new item added
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [consequences.length]);

  return (
    <div className="cn-feed-container">
      {/* Header */}
      <div className="cn-feed-header">
        <div className="cn-hud-title">Conscience Feed</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="cn-badge cn-badge-cyan">{consequences.length} entries</span>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--color-green)',
            boxShadow: '0 0 6px var(--color-green-glow)',
            display: 'inline-block',
            animation: consequences.length ? 'beaconPulse 2s ease-in-out infinite' : 'none',
          }} />
        </div>
      </div>

      {/* Feed list */}
      <div className="cn-feed" ref={listRef}>
        {consequences.length === 0 ? (
          <div className="cn-feed-empty">
            Waiting for first patient arrival...
          </div>
        ) : (
          consequences.map((item, idx) => (
            <FeedItem key={idx} item={item} />
          ))
        )}
      </div>
    </div>
  );
};

const FeedItem = ({ item }) => {
  const cls = item.severity === 'positive'
    ? 'positive'
    : item.severity === 'warning'
    ? 'warning'
    : item.severity === 'critical'
    ? 'critical'
    : 'neutral';

  const typeLabel = TYPE_LABELS[item.type] ?? item.type?.toUpperCase();

  return (
    <div className={`cn-feed-item ${cls}`}>
      {/* Timestamp */}
      <span className="cn-feed-time">
        {item.timestamp instanceof Date
          ? item.timestamp.toLocaleTimeString('en-US', { hour12: false })
          : '--:--:--'}
      </span>

      {/* Type tag */}
      <span style={{
        fontSize: 9, fontWeight: 900, letterSpacing: 1.5,
        flexShrink: 0, opacity: 0.7, paddingTop: 1,
      }}>
        [{typeLabel}]
      </span>

      {/* Message */}
      <span style={{ flex: 1 }}>{item.message}</span>
    </div>
  );
};

export default ConscieneceFeed;
