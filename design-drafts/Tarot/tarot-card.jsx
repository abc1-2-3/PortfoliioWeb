// 單張塔羅牌組件
const { useState, useEffect, useRef } = React;

function TarotCard({ card, reversed, flipped, onFlip, onDoubleFlip, position, label, delay, size = 1, focused, dimmed }) {
  const baseW = 140 * size;
  const baseH = 228 * size;

  const rot = position?.rot || 0;
  const overlay = position?.overlay;

  return (
    <div
      className={
        "tarot-card-slot" +
        (flipped ? " is-flipped" : "") +
        (focused ? " is-focused" : "") +
        (dimmed ? " is-dimmed" : "") +
        (overlay ? " is-overlay" : "")
      }
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${baseW}px`,
        height: `${baseH}px`,
        transitionDelay: `${delay}ms`,
        animationDelay: `${delay}ms`,
        "--card-rot": `${rot}deg`,
      }}
    >
      {/* Click handlers ON the inner so pointer hit-test follows the rotated shape.
          This is what makes the underneath card clickable when overlay is rotated 90°. */}
      <div
        className="tarot-card-inner"
        style={{ transform: `rotate(${rot}deg)` }}
        onClick={onFlip}
        onDoubleClick={onDoubleFlip}
      >
        {/* 卡背 */}
        <div className="tarot-card-face tarot-card-back">
          <div className="back-ornament">
            <svg viewBox="0 0 100 160" preserveAspectRatio="none">
              <defs>
                <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(214,176,108,0.35)" />
                  <stop offset="100%" stopColor="rgba(214,176,108,0)" />
                </radialGradient>
              </defs>
              <rect x="3" y="3" width="94" height="154" fill="none" stroke="rgba(214,176,108,0.55)" strokeWidth="0.6" />
              <rect x="6" y="6" width="88" height="148" fill="none" stroke="rgba(214,176,108,0.3)" strokeWidth="0.3" />
              <circle cx="50" cy="80" r="36" fill="url(#bg-glow)" />
              <circle cx="50" cy="80" r="28" fill="none" stroke="rgba(214,176,108,0.55)" strokeWidth="0.4" />
              <circle cx="50" cy="80" r="20" fill="none" stroke="rgba(214,176,108,0.4)" strokeWidth="0.3" />
              <g transform="translate(50 80)">
                {[0,45,90,135].map(deg => (
                  <line key={deg} x1="-22" y1="0" x2="22" y2="0" transform={`rotate(${deg})`} stroke="rgba(214,176,108,0.55)" strokeWidth="0.4" />
                ))}
                {[0,45,90,135].map(deg => (
                  <line key={"s"+deg} x1="-14" y1="0" x2="14" y2="0" transform={`rotate(${deg+22.5})`} stroke="rgba(214,176,108,0.35)" strokeWidth="0.25" />
                ))}
                <circle r="4" fill="rgba(214,176,108,0.9)" />
                <circle r="2" fill="rgba(24,18,42,1)" />
              </g>
              {[[12,16],[88,16],[12,144],[88,144]].map(([cx,cy],i)=>(
                <g key={i} transform={`translate(${cx} ${cy})`}>
                  <circle r="1.6" fill="rgba(214,176,108,0.7)" />
                  <circle r="3" fill="none" stroke="rgba(214,176,108,0.4)" strokeWidth="0.3" />
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* 卡面 */}
        <div className={"tarot-card-face tarot-card-front" + (reversed ? " is-reversed" : "")}>
          <div className="front-inner">
            <div className="front-frame">
              <span className="corner tl">{card?.roman}</span>
              <span className="corner br">{card?.roman}</span>
            </div>
            <div className="front-glyph">{card?.glyph}</div>
            <div className="front-name">
              <div className="name-cn">{card?.name}</div>
              <div className="name-en">{card?.en}</div>
            </div>
            {reversed && <div className="reversed-tag">逆位</div>}
          </div>
        </div>
      </div>

      {label && (
        <div className="card-label" style={{ transform: `translateX(-50%) rotate(${overlay ? -rot : 0}deg)` }}>
          {label}
        </div>
      )}
    </div>
  );
}

window.TarotCard = TarotCard;
