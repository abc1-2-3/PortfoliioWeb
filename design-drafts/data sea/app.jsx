// Dashboard chrome — sidebar, control panel, metrics
const { useState, useEffect, useRef, useMemo } = React;

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function fmtDate(d) {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()} / ${pad(d.getMonth() + 1)} / ${pad(d.getDate())}`;
}
function fmtTime(d) {
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function Slider({ label, sub, value, min, max, step, onChange, fmt }) {
  return (
    <div className="slider">
      <div className="slider-head">
        <div className="slider-label">
          <div className="zh">{label}</div>
          <div className="en">{sub}</div>
        </div>
        <div className="slider-value">{fmt ? fmt(value) : value}</div>
      </div>
      <div className="slider-track">
        <div className="slider-fill" style={{ width: `${((value - min) / (max - min)) * 100}%` }}></div>
        <input
          type="range" min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
        <div className="slider-thumb" style={{ left: `${((value - min) / (max - min)) * 100}%` }}></div>
      </div>
    </div>
  );
}

function Sparkline({ data, color = '#7da8ff', fill = true, height = 44 }) {
  const w = 180, h = height;
  if (!data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const span = Math.max(0.001, max - min);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 6) - 3;
    return [x, y];
  });
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const dFill = d + ` L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: h }}>
      <defs>
        <linearGradient id="spk-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={dFill} fill="url(#spk-fill)" />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.4" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={color} />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="6" fill={color} opacity="0.25" />
    </svg>
  );
}

function Bars({ data, color = '#a78bfa', height = 44 }) {
  const w = 180, h = height;
  const max = Math.max(...data);
  const bw = w / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: h }}>
      {data.map((v, i) => {
        const bh = (v / max) * (h - 4);
        return (
          <rect key={i}
            x={i * bw + 0.6} y={h - bh}
            width={bw - 1.2} height={bh}
            rx="0.8"
            fill={color} opacity={0.35 + (v / max) * 0.6} />
        );
      })}
    </svg>
  );
}

function MoonPhase({ phase }) {
  // phase: 0..1, 0 = new, 0.5 = full
  const r = 36;
  const offset = (phase - 0.5) * r * 2;
  return (
    <svg width="80" height="80" viewBox="-50 -50 100 100">
      <defs>
        <radialGradient id="mglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#cfd8ff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#cfd8ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="48" fill="url(#mglow)" />
      <circle r={r} fill="#d6dbef" />
      <circle r={r} cx={offset} fill="#0d1330" />
      <circle r="2" cx="-10" cy="-6" fill="#a8b2d0" opacity="0.5" />
      <circle r="1.4" cx="-18" cy="8" fill="#a8b2d0" opacity="0.4" />
      <circle r="1.6" cx="-4" cy="14" fill="#a8b2d0" opacity="0.45" />
    </svg>
  );
}

function Compass({ angle = 38 }) {
  return (
    <svg width="56" height="56" viewBox="-30 -30 60 60">
      <circle r="26" fill="none" stroke="rgba(180,200,255,0.25)" />
      <circle r="20" fill="none" stroke="rgba(180,200,255,0.15)" />
      {[0, 90, 180, 270].map((a, i) => (
        <line key={i}
          x1={Math.cos((a - 90) * Math.PI / 180) * 22}
          y1={Math.sin((a - 90) * Math.PI / 180) * 22}
          x2={Math.cos((a - 90) * Math.PI / 180) * 26}
          y2={Math.sin((a - 90) * Math.PI / 180) * 26}
          stroke="rgba(180,200,255,0.5)" />
      ))}
      <g transform={`rotate(${angle})`}>
        <path d="M0,-22 L4,0 L0,4 L-4,0 Z" fill="#a8c4ff" />
        <path d="M0,22 L3,0 L0,-2 L-3,0 Z" fill="rgba(160,180,220,0.4)" />
      </g>
      <text textAnchor="middle" y="-9" fill="rgba(200,220,255,0.7)" fontSize="7" fontFamily="JetBrains Mono">N</text>
    </svg>
  );
}

const SIDEBAR = [
  { zh: '總覽', en: 'OVERVIEW', icon: 'home', active: true },
  { zh: '數據探索', en: 'EXPLORE', icon: 'compass' },
  { zh: '模型分析', en: 'ANALYSIS', icon: 'chart' },
  { zh: '預測模擬', en: 'PREDICTION', icon: 'wave' },
  { zh: '系統設定', en: 'SETTINGS', icon: 'gear' },
];

function Icon({ name }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home': return (<svg {...common}><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" /></svg>);
    case 'compass': return (<svg {...common}><circle cx="12" cy="12" r="9" /><path d="M16 8l-2 6-6 2 2-6 6-2z" /></svg>);
    case 'chart': return (<svg {...common}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>);
    case 'wave': return (<svg {...common}><path d="M2 12c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 5-3" /><path d="M2 17c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 5-3" opacity="0.6" /></svg>);
    case 'gear': return (<svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>);
    case 'user': return (<svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" /></svg>);
    case 'bell': return (<svg {...common}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 21a2 2 0 0 0 4 0" /></svg>);
    case 'power': return (<svg {...common}><path d="M12 3v9" /><path d="M5.6 7a8 8 0 1 0 12.8 0" /></svg>);
    default: return null;
  }
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "lunar": 0.72,
  "wind": 1.38,
  "freq": 2.45,
  "density": 0.89,
  "autoDayNight": false,
  "dayNight": 0,
  "locked": false
}/*EDITMODE-END*/;

function App() {
  const [params, setParams] = useState({ ...TWEAK_DEFAULTS, cycleSpeed: 1, paused: false });
  const now = useNow();

  // Bridge to canvas global
  useEffect(() => {
    window.__DataSea = window.__DataSea || {};
    window.__DataSea.params = params;
  }, [params]);

  // Generate evolving sparkline data tied to wind/freq
  const [streamData, setStreamData] = useState(() => Array.from({ length: 36 }, (_, i) => 0.3 + Math.sin(i * 0.4) * 0.15 + Math.random() * 0.1));
  const [waveBars, setWaveBars] = useState(() => Array.from({ length: 28 }, () => 0.3 + Math.random() * 0.6));
  const [anomalyBars, setAnomalyBars] = useState(() => Array.from({ length: 20 }, () => 0.2 + Math.random() * 0.7));
  const [nodeBars, setNodeBars] = useState(() => Array.from({ length: 30 }, () => 0.3 + Math.random() * 0.6));
  const [lunarBars, setLunarBars] = useState(() => Array.from({ length: 14 }, (_, i) => 0.3 + Math.sin(i * 0.5) * 0.3 + Math.random() * 0.2));

  useEffect(() => {
    const id = setInterval(() => {
      setStreamData(prev => {
        const next = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        const target = 0.4 + params.wind * 0.18 + params.lunar * 0.12;
        const v = Math.max(0.05, Math.min(0.95, last + (target - last) * 0.15 + (Math.random() - 0.5) * 0.18));
        next.push(v);
        return next;
      });
      setWaveBars(prev => prev.map(v => Math.max(0.1, Math.min(1, v + (Math.random() - 0.5) * 0.2))));
      setAnomalyBars(prev => prev.map(v => Math.max(0.05, Math.min(1, v + (Math.random() - 0.5) * 0.25))));
      setNodeBars(prev => prev.map(v => Math.max(0.1, Math.min(1, v + (Math.random() - 0.5) * 0.15))));
      setLunarBars(prev => prev.map(v => Math.max(0.1, Math.min(1, v + (Math.random() - 0.5) * 0.18))));
    }, 700);
    return () => clearInterval(id);
  }, [params.wind, params.lunar]);

  const flowRate = useMemo(() => (1.4 + params.wind * 0.6 + params.density * 0.4 + Math.sin(Date.now() / 4000) * 0.1).toFixed(2), [params.wind, params.density, now]);
  const waveIntensity = useMemo(() => (0.4 + params.lunar * 0.4 + params.wind * 0.08).toFixed(2), [params.lunar, params.wind]);
  const nodeCount = useMemo(() => Math.round(6800 + params.density * 2400 + params.freq * 200), [params.density, params.freq]);
  const anomalies = useMemo(() => Math.max(0, Math.round(params.wind * 1.4 + params.freq * 0.4 - 1)), [params.wind, params.freq]);

  function update(key, val) {
    setParams(p => ({ ...p, [key]: val }));
  }

  function reset() {
    setParams(p => ({ ...p, ...TWEAK_DEFAULTS, cycleSpeed: 1, paused: false }));
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <svg viewBox="-30 -30 60 60" width="58" height="58">
              <defs>
                <radialGradient id="bm" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#a8c8ff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#5b8cff" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle r="22" fill="url(#bm)" />
              {Array.from({ length: 8 }).map((_, i) => (
                <line key={i}
                  x1={Math.cos(i * Math.PI / 4) * 4}
                  y1={Math.sin(i * Math.PI / 4) * 4}
                  x2={Math.cos(i * Math.PI / 4) * 24}
                  y2={Math.sin(i * Math.PI / 4) * 24}
                  stroke="#a8c8ff" strokeWidth="0.6" opacity="0.6" />
              ))}
              <polygon points="0,-14 12,0 0,14 -12,0" fill="none" stroke="#cfe0ff" strokeWidth="0.8" />
              <polygon points="0,-7 6,0 0,7 -6,0" fill="#cfe0ff" />
              <circle r="2" fill="#fff" />
            </svg>
          </div>
          <div className="brand-text">
            <div className="brand-name">DATA SEA</div>
            <div className="brand-sub">數據之海</div>
          </div>
        </div>

        <nav className="nav">
          {SIDEBAR.map((item, i) => (
            <a key={i} className={`nav-item ${item.active ? 'active' : ''}`} href="#">
              <Icon name={item.icon} />
              <div className="nav-text">
                <div className="nav-zh">{item.zh}</div>
                <div className="nav-en">{item.en}</div>
              </div>
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="icon-btn" title="user"><Icon name="user" /></button>
          <button className="icon-btn" title="alerts"><Icon name="bell" /><span className="dot"></span></button>
          <button className="icon-btn" title="power"><Icon name="power" /></button>
        </div>
      </aside>

      {/* Header overlay */}
      <header className="header">
        <div className="header-left">
          <h1 className="page-title">
            <span className="zh">總覽</span>
            <span className="en">OVERVIEW</span>
          </h1>
          <p className="page-subtitle">
            每一道波紋,都是數據的呼吸;<br />
            在無盡的運算中,尋找潛藏的規律。
          </p>
        </div>

        <div className="header-right">
          <div className="time-pill">
            <div className="time-row">
              <span className="date">{fmtDate(now)}</span>
              <span className="time">{fmtTime(now)}</span>
            </div>
            <div className="time-row sub">
              <span className="env">ENVIRONMENT</span>
              <button
                className={`lock-btn ${params.locked ? 'on' : ''}`}
                onClick={() => update('locked', !params.locked)}
              >
                <span className="dot"></span>
                {params.locked ? '已鎖定' : '穩定'}
              </button>
            </div>
            <div className="compass-wrap"><Compass angle={params.wind * 22} /></div>
          </div>
        </div>
      </header>

      {/* Right: lunar card + control panel */}
      <div className="right-stack">
        <section className="card lunar-card">
          <div className="card-head">
            <div>
              <div className="card-title-zh">月亮影響</div>
              <div className="card-title-en">LUNAR INFLUENCE</div>
            </div>
          </div>
          <div className="lunar-body">
            <MoonPhase phase={params.lunar} />
            <div className="lunar-num">
              <div className="big">{Math.round(params.lunar * 100)}<span>%</span></div>
              <div className="small">影響強度</div>
            </div>
          </div>
          <div className="lunar-bars">
            <Bars data={lunarBars} color="#a78bfa" height={36} />
          </div>
        </section>

        <section className="card panel-card">
          <div className="card-head">
            <div>
              <div className="card-title-zh">環境參數</div>
              <div className="card-title-en">ENVIRONMENT PARAMETERS</div>
            </div>
          </div>
          <div className="sliders">
            <Slider label="月亮影響" sub="LUNAR INFLUENCE"
              value={params.lunar} min={0} max={1} step={0.01}
              fmt={v => `${Math.round(v * 100)}%`}
              onChange={v => update('lunar', v)} />
            <Slider label="風速" sub="WIND SPEED"
              value={params.wind} min={0} max={3} step={0.01}
              fmt={v => `${v.toFixed(2)}x`}
              onChange={v => update('wind', v)} />
            <Slider label="波動頻率" sub="FREQUENCY"
              value={params.freq} min={0.5} max={5} step={0.01}
              fmt={v => `${v.toFixed(2)}x`}
              onChange={v => update('freq', v)} />
            <Slider label="數據密度" sub="DATA DENSITY"
              value={params.density} min={0.2} max={1} step={0.01}
              fmt={v => `${Math.round(v * 100)}%`}
              onChange={v => update('density', v)} />
          </div>

          <div className="day-night-row">
            <div className="dn-label">
              <span className="zh">日夜更替</span>
              <span className="en">DAY · NIGHT</span>
            </div>
            <div className="dn-controls">
              <button
                className={`pill-btn ${!params.autoDayNight && params.dayNight < 0.5 ? 'on' : ''}`}
                onClick={() => setParams(p => ({ ...p, autoDayNight: false, dayNight: 0 }))}
              >夜</button>
              <button
                className={`pill-btn ${!params.autoDayNight && params.dayNight >= 0.5 ? 'on' : ''}`}
                onClick={() => setParams(p => ({ ...p, autoDayNight: false, dayNight: 1 }))}
              >日</button>
              <button
                className={`pill-btn ${params.autoDayNight ? 'on' : ''}`}
                onClick={() => setParams(p => ({ ...p, autoDayNight: !p.autoDayNight }))}
              >自動</button>
            </div>
          </div>

          <button className="reset-btn" onClick={reset}>
            <span className="zh">重置參數</span>
            <span className="en">RESET</span>
          </button>
        </section>
      </div>

      {/* Bottom metrics row */}
      <footer className="metrics">
        <div className="metric">
          <div className="metric-head">
            <div>
              <div className="metric-zh">即時數據流</div>
              <div className="metric-en">REAL-TIME DATA STREAM</div>
            </div>
            <div className="metric-now">{streamData[streamData.length - 1].toFixed(2)}</div>
          </div>
          <div className="metric-chart"><Sparkline data={streamData} color="#7da8ff" /></div>
          <div className="metric-axis">
            <span>{fmtTime(new Date(now.getTime() - 8 * 60000)).slice(0,5)}</span>
            <span>{fmtTime(new Date(now.getTime() - 6 * 60000)).slice(0,5)}</span>
            <span>{fmtTime(new Date(now.getTime() - 4 * 60000)).slice(0,5)}</span>
            <span>{fmtTime(new Date(now.getTime() - 2 * 60000)).slice(0,5)}</span>
            <span>{fmtTime(now).slice(0,5)}</span>
          </div>
        </div>

        <div className="metric metric-stat">
          <div className="metric-head">
            <div>
              <div className="metric-zh">數據流速</div>
              <div className="metric-en">DATA FLOW RATE</div>
            </div>
          </div>
          <div className="big-stat">{flowRate}<span>TB/s</span></div>
          <div className="metric-chart small"><Sparkline data={streamData.slice(-16)} color="#7da8ff" height={28} /></div>
        </div>

        <div className="metric metric-stat">
          <div className="metric-head">
            <div>
              <div className="metric-zh">波動強度</div>
              <div className="metric-en">WAVE INTENSITY</div>
            </div>
          </div>
          <div className="big-stat">{waveIntensity}<span></span></div>
          <div className="metric-chart small"><Sparkline data={waveBars.slice(-16)} color="#a78bfa" height={28} /></div>
        </div>

        <div className="metric metric-stat">
          <div className="metric-head">
            <div>
              <div className="metric-zh">節點數量</div>
              <div className="metric-en">NODE COUNT</div>
            </div>
          </div>
          <div className="big-stat">{nodeCount.toLocaleString()}<span></span></div>
          <div className="metric-chart small"><Bars data={nodeBars} color="#a78bfa" height={28} /></div>
        </div>

        <div className="metric metric-stat">
          <div className="metric-head">
            <div>
              <div className="metric-zh">異常偵測</div>
              <div className="metric-en">ANOMALY DETECTION</div>
            </div>
          </div>
          <div className="big-stat">{anomalies}<span>件</span></div>
          <div className="metric-chart small"><Bars data={anomalyBars} color="#ff7da8" height={28} /></div>
        </div>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
