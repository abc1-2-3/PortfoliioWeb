// Works data + thumbnail SVGs
const WORKS = [
  {
    id: "vtuber-model",
    tag: "VTUBER / LIVE2D",
    title: "VTUBER MODEL",
    titleZh: "自製 Live2D 模型",
    subtitle: "Full Body Live2D Showcase",
    art: "vtuber",
    color: "#a78bfa",
  },
  {
    id: "ecpay-web",
    tag: "WEB / PAYMENTS",
    title: "ECPAY GATEWAY",
    titleZh: "綠界金流串接",
    subtitle: "Donation & Checkout Integration",
    art: "ecpay",
    color: "#22d3ee",
  },
  {
    id: "auto-poster",
    tag: "AI / AUTOMATION",
    title: "AUTO POSTER",
    titleZh: "自動發文 API",
    subtitle: "Cross-platform Schedule Bot",
    art: "auto",
    color: "#d946ef",
  },
  {
    id: "portfolio",
    tag: "WEB / SYSTEM",
    title: "THIS ARCHIVE",
    titleZh: "本作品集網站",
    subtitle: "Personal Portfolio System",
    art: "portfolio",
    color: "#67e8f9",
  },
  {
    id: "interactive",
    tag: "WEB / INTERACTIVE",
    title: "INTERACTIVE WEB",
    titleZh: "網頁互動實驗",
    subtitle: "Motion · Particles · Shaders",
    art: "interactive",
    color: "#c4b5fd",
  },
  {
    id: "tweet-bot",
    tag: "AI / GENERATIVE",
    title: "TWEET BOT",
    titleZh: "AI 推文機器人",
    subtitle: "Content Generation Pipeline",
    art: "tweet",
    color: "#fcd34d",
  },
];

const RECENT = [
  ...WORKS,
  ...WORKS.map(w => ({ ...w, id: w.id + "-2" })),
];

// Thumbnail SVG renderers — abstract magical/tech illustrations
function ThumbArt({ kind, color = "#a78bfa" }) {
  switch (kind) {
    case "vtuber":
      return (
        <svg viewBox="0 0 200 280" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="vt-g" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor={color} stopOpacity="0.9" />
              <stop offset="60%" stopColor="#6d28d9" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0a0420" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="200" height="280" fill="#0a0420" />
          <circle cx="100" cy="120" r="140" fill="url(#vt-g)" />
          {/* silhouette: cat-eared figure */}
          <g fill="#1a0f3a" opacity="0.95">
            <path d="M70 80 L80 50 L92 78 Z" />
            <path d="M130 80 L120 50 L108 78 Z" />
            <ellipse cx="100" cy="110" rx="36" ry="42" />
            <path d="M64 150 Q100 130 136 150 L150 280 L50 280 Z" />
          </g>
          <g fill={color} opacity="0.95">
            <ellipse cx="88" cy="108" rx="3" ry="5" />
            <ellipse cx="112" cy="108" rx="3" ry="5" />
          </g>
          {/* sparkles */}
          {[[40,60],[160,80],[30,180],[170,160],[50,240],[150,230]].map(([x,y],i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" fill={color} opacity="0.8" />
            </g>
          ))}
        </svg>
      );
    case "ecpay":
      return (
        <svg viewBox="0 0 200 280" preserveAspectRatio="xMidYMid slice">
          <rect width="200" height="280" fill="#06141a" />
          <defs>
            <linearGradient id="ec-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0a0420" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="200" height="280" fill="url(#ec-g)" />
          {/* terminal window */}
          <rect x="28" y="60" width="144" height="160" rx="6" fill="#0d1f26" stroke={color} strokeOpacity="0.5" />
          <rect x="28" y="60" width="144" height="20" fill="#0a1820" />
          <circle cx="40" cy="70" r="3" fill="#ef4444" opacity="0.7" />
          <circle cx="52" cy="70" r="3" fill="#fcd34d" opacity="0.7" />
          <circle cx="64" cy="70" r="3" fill="#4ade80" opacity="0.7" />
          {/* code lines */}
          {[0,1,2,3,4,5,6].map(i => (
            <rect key={i} x={40} y={94 + i*16} width={Math.random()*70 + 40} height="3" fill={color} opacity={0.4 + (i%3)*0.2} rx="1.5" />
          ))}
          {/* $ symbol */}
          <text x="100" y="260" textAnchor="middle" fontSize="36" fill={color} fontFamily="monospace" opacity="0.9">$</text>
        </svg>
      );
    case "auto":
      return (
        <svg viewBox="0 0 200 280" preserveAspectRatio="xMidYMid slice">
          <rect width="200" height="280" fill="#180a25" />
          {/* network nodes */}
          <g stroke={color} strokeOpacity="0.4" strokeWidth="1" fill="none">
            <line x1="40" y1="80" x2="100" y2="140" />
            <line x1="160" y1="80" x2="100" y2="140" />
            <line x1="100" y1="140" x2="60" y2="220" />
            <line x1="100" y1="140" x2="140" y2="220" />
            <line x1="40" y1="80" x2="160" y2="80" />
          </g>
          {[[40,80],[160,80],[100,140],[60,220],[140,220]].map(([x,y],i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="14" fill="#0a0420" stroke={color} />
              <circle cx={x} cy={y} r="6" fill={color} opacity="0.8" />
              <circle cx={x} cy={y} r="14" fill="none" stroke={color} opacity="0.3">
                <animate attributeName="r" from="14" to="22" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          ))}
        </svg>
      );
    case "portfolio":
      return (
        <svg viewBox="0 0 200 280" preserveAspectRatio="xMidYMid slice">
          <rect width="200" height="280" fill="#04161c" />
          {/* monitor with cityscape */}
          <rect x="22" y="60" width="156" height="110" rx="4" fill="#0d1f26" stroke={color} strokeOpacity="0.6" />
          <rect x="30" y="68" width="140" height="94" fill="#020a0e" />
          {/* skyline */}
          <g fill={color} opacity="0.7">
            <rect x="32" y="120" width="14" height="42" />
            <rect x="48" y="100" width="10" height="62" />
            <rect x="60" y="115" width="16" height="47" />
            <rect x="78" y="90" width="12" height="72" />
            <rect x="92" y="108" width="14" height="54" />
            <rect x="108" y="95" width="10" height="67" />
            <rect x="120" y="118" width="14" height="44" />
            <rect x="136" y="105" width="10" height="57" />
            <rect x="148" y="115" width="14" height="47" />
          </g>
          {/* windows */}
          {Array.from({length: 30}).map((_,i) => (
            <rect key={i} x={34 + (i%9)*14} y={94 + Math.floor(i/9)*8} width="3" height="3" fill="#fcd34d" opacity={Math.random() > 0.5 ? 0.9 : 0.2} />
          ))}
          <rect x="80" y="170" width="40" height="6" fill="#0d1f26" />
          <rect x="60" y="176" width="80" height="4" fill="#0d1f26" />
          {/* laptop base hint of cat */}
          <ellipse cx="100" cy="220" rx="40" ry="6" fill={color} opacity="0.2" />
          <text x="100" y="250" textAnchor="middle" fontSize="9" fill={color} fontFamily="monospace" letterSpacing="2">DESK_OS</text>
        </svg>
      );
    case "interactive":
      return (
        <svg viewBox="0 0 200 280" preserveAspectRatio="xMidYMid slice">
          <rect width="200" height="280" fill="#0a0420" />
          {/* animated wave grid */}
          <g stroke={color} strokeOpacity="0.5" fill="none">
            {Array.from({length: 12}).map((_,i) => (
              <path key={i} d={`M0 ${60 + i*16} Q50 ${50 + i*16 + Math.sin(i)*8} 100 ${60+i*16} T200 ${60+i*16}`} strokeWidth="0.7" />
            ))}
          </g>
          <g fill={color}>
            {Array.from({length: 40}).map((_,i) => (
              <circle key={i} cx={Math.random()*200} cy={Math.random()*280} r={Math.random()*1.5+0.5} opacity={Math.random()*0.7+0.2} />
            ))}
          </g>
          <circle cx="100" cy="140" r="40" fill="none" stroke={color} strokeWidth="1" opacity="0.8" />
          <circle cx="100" cy="140" r="60" fill="none" stroke={color} strokeWidth="0.5" opacity="0.5" />
          <circle cx="100" cy="140" r="20" fill={color} opacity="0.3" />
        </svg>
      );
    case "tweet":
      return (
        <svg viewBox="0 0 200 280" preserveAspectRatio="xMidYMid slice">
          <rect width="200" height="280" fill="#1a1408" />
          {[60, 130, 200].map((y, i) => (
            <g key={i} opacity={1 - i*0.2}>
              <rect x="20" y={y} width="160" height="50" rx="6" fill="#0a0420" stroke={color} strokeOpacity="0.4" />
              <circle cx="38" cy={y+25} r="10" fill={color} opacity="0.6" />
              <rect x="56" y={y+12} width="60" height="3" fill={color} opacity="0.7" />
              <rect x="56" y={y+22} width="100" height="2" fill={color} opacity="0.4" />
              <rect x="56" y={y+30} width="80" height="2" fill={color} opacity="0.4" />
              <rect x="56" y={y+38} width="40" height="2" fill={color} opacity="0.3" />
            </g>
          ))}
          <text x="100" y="40" textAnchor="middle" fontSize="11" fill={color} fontFamily="monospace" letterSpacing="3">// AUTO_FEED</text>
        </svg>
      );
    default:
      return <svg viewBox="0 0 200 280"><rect width="200" height="280" fill="#0a0420" /></svg>;
  }
}

window.WORKS = WORKS;
window.RECENT = RECENT;
window.ThumbArt = ThumbArt;
