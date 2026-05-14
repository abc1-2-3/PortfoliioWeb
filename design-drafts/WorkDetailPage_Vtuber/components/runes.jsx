// Decorative rune ring SVG used in hero & accents
const RuneRing = ({ size = 320, reverse = false }) => {
  const runes = ['✦', '◇', '☾', '✧', '◈', '⟁', '✺', '◊', '☆', '◯', '⬢', '✶'];
  const cx = size / 2, cy = size / 2;
  const r1 = size * 0.46;
  const r2 = size * 0.38;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="rune-glow">
          <stop offset="0%" stopColor="rgba(167,139,250,0.3)"/>
          <stop offset="100%" stopColor="rgba(167,139,250,0)"/>
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r={size * 0.5} fill="url(#rune-glow)"/>

      <g className={`rune-ring ${reverse ? 'reverse' : ''}`} style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <circle cx={cx} cy={cy} r={r1} fill="none" stroke="rgba(167,139,250,0.4)" strokeWidth="1" strokeDasharray="2 6"/>
        <circle cx={cx} cy={cy} r={r1 - 8} fill="none" stroke="rgba(240,171,252,0.2)" strokeWidth="0.5"/>
        {runes.map((rune, i) => {
          const angle = (i / runes.length) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * r1;
          const y = cy + Math.sin(angle) * r1;
          return (
            <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                  fill="rgba(240,171,252,0.7)" fontSize="14" fontFamily="Cinzel Decorative">
              {rune}
            </text>
          );
        })}
      </g>

      <g className="rune-ring reverse" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <circle cx={cx} cy={cy} r={r2} fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth="0.5"/>
        {[...Array(24)].map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const x1 = cx + Math.cos(angle) * (r2 - 4);
          const y1 = cy + Math.sin(angle) * (r2 - 4);
          const x2 = cx + Math.cos(angle) * (r2 + 4);
          const y2 = cy + Math.sin(angle) * (r2 + 4);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(34,211,238,0.3)" strokeWidth="0.5"/>;
        })}
      </g>

      {/* central pentagram */}
      <g style={{ transformOrigin: `${cx}px ${cy}px` }} opacity="0.5">
        <polygon
          points={[0, 1, 2, 3, 4].map(i => {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
            return `${cx + Math.cos(a) * 40},${cy + Math.sin(a) * 40}`;
          }).join(' ')}
          fill="none" stroke="rgba(240,171,252,0.5)" strokeWidth="0.5"
        />
      </g>
    </svg>
  );
};

const RuneCorner = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" style={{ opacity: 0.6 }}>
    <path d="M 0 30 L 30 0 M 0 20 L 20 0" stroke="rgba(167,139,250,0.5)" strokeWidth="0.5" fill="none"/>
    <circle cx="6" cy="6" r="2" fill="none" stroke="rgba(240,171,252,0.7)" strokeWidth="0.5"/>
    <text x="14" y="14" fill="rgba(240,171,252,0.7)" fontSize="8" fontFamily="Cinzel Decorative">✦</text>
  </svg>
);

window.RuneRing = RuneRing;
window.RuneCorner = RuneCorner;
