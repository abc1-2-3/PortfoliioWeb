// Black hole stage base — concentric rings + orbiting particles
function StageBase({ active, accent = "#a78bfa" }) {
  return (
    <div className="stage-base" aria-hidden="true">
      <svg viewBox="0 0 720 220" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="bh-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="30%" stopColor={accent} stopOpacity="0.9" />
            <stop offset="80%" stopColor="#6d28d9" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={accent} stopOpacity="0" />
            <stop offset="50%" stopColor={accent} stopOpacity="0.9" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* outer flat ellipses (perspective platform) */}
        <g opacity="0.85">
          <ellipse cx="360" cy="110" rx="340" ry="60" fill="none" stroke={accent} strokeOpacity="0.18" strokeWidth="1" />
          <ellipse cx="360" cy="110" rx="280" ry="50" fill="none" stroke={accent} strokeOpacity="0.22" strokeWidth="1" />
          <ellipse cx="360" cy="110" rx="220" ry="40" fill="none" stroke={accent} strokeOpacity="0.3" strokeWidth="1" />
          <ellipse cx="360" cy="110" rx="160" ry="30" fill="none" stroke={accent} strokeOpacity="0.45" strokeWidth="1" />
          <ellipse cx="360" cy="110" rx="100" ry="20" fill="none" stroke={accent} strokeOpacity="0.7" strokeWidth="1.2" />
        </g>

        {/* spinning dashed ring */}
        <g className="ring-spin">
          <ellipse cx="360" cy="110" rx="240" ry="44" fill="none" stroke="url(#ring-grad)" strokeWidth="1.4" strokeDasharray="2 8" />
        </g>
        <g className="ring-spin-rev">
          <ellipse cx="360" cy="110" rx="180" ry="34" fill="none" stroke="url(#ring-grad)" strokeWidth="1" strokeDasharray="3 14" />
        </g>

        {/* tick marks around outer ring */}
        <g className="ring-spin">
          {Array.from({ length: 36 }).map((_, i) => {
            const a = (i / 36) * Math.PI * 2;
            const x1 = 360 + Math.cos(a) * 340;
            const y1 = 110 + Math.sin(a) * 60;
            const x2 = 360 + Math.cos(a) * 350;
            const y2 = 110 + Math.sin(a) * 62;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeOpacity="0.4" strokeWidth="1" />;
          })}
        </g>

        {/* orbiting dots */}
        <g className="ring-spin-rev">
          {Array.from({ length: 18 }).map((_, i) => {
            const a = (i / 18) * Math.PI * 2;
            const r = 220 + (i % 3) * 30;
            const ry = r * 0.18;
            const x = 360 + Math.cos(a) * r;
            const y = 110 + Math.sin(a) * ry;
            const isStar = i % 5 === 0;
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                {isStar ? (
                  <path d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z" fill="#fff" opacity="0.95" />
                ) : (
                  <circle r="1.5" fill={accent} opacity={0.6 + (i % 3) * 0.12} />
                )}
              </g>
            );
          })}
        </g>

        {/* radial light beams from core */}
        <g opacity="0.55">
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const x = 360 + Math.cos(a) * 100;
            const y = 110 + Math.sin(a) * 20;
            return (
              <line key={i} x1="360" y1="110" x2={x} y2={y}
                stroke={accent} strokeWidth="0.6" strokeOpacity="0.5" />
            );
          })}
        </g>

        {/* core glow */}
        <circle cx="360" cy="110" r="60" fill="url(#bh-core)" />
        <circle cx="360" cy="110" r="14" fill="#fff" opacity="0.95">
          <animate attributeName="opacity" values="0.95;0.6;0.95" dur="2.6s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

window.StageBase = StageBase;
