// Side panels — left rail nav, right column status/info/now-playing/tip
const CATEGORIES = [
  { num: "00", en: "ALL", zh: "全部作品", count: 12 },
  { num: "01", en: "VTUBER", zh: "虛擬偶像 / Live2D", count: 3 },
  { num: "02", en: "WEB", zh: "網頁互動 / 前後端", count: 4 },
  { num: "03", en: "PAYMENT", zh: "金流串接", count: 2 },
  { num: "04", en: "AI · BOT", zh: "自動化 / API", count: 2 },
  { num: "05", en: "ILLUST", zh: "插畫 / 視覺", count: 1 },
  { num: "06", en: "OTHERS", zh: "其他實驗", count: 0 },
];

function Rail({ active = "ALL", onSelect }) {
  return (
    <aside className="rail">
      <div className="rail-section">// Categories · 分類</div>
      <div className="nav-list">
        {CATEGORIES.map(n => (
          <div key={n.en}
            className={"nav-item " + (active === n.en ? "active" : "")}
            onClick={() => onSelect && onSelect(n.en)}>
            <span className="node"></span>
            <span className="num">{n.num}</span>
            <span className="label">
              <span className="en">{n.en} <span style={{ color: "var(--ink-3)", marginLeft: 6 }}>×{String(n.count).padStart(2, "0")}</span></span>
              <span className="zh">{n.zh}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="rail-footer">
        <div><span className="glyph">◆</span> filter by category</div>
        <div style={{ marginTop: 6 }}>cursor / drag to rotate</div>
      </div>
    </aside>
  );
}

function Clock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n) => String(n).padStart(2, "0");
  return <span className="clock">{pad(t.getHours())}:{pad(t.getMinutes())}:{pad(t.getSeconds())}</span>;
}

function SystemStatus({ activeWork }) {
  return (
    <div className="panel">
      <div className="panel-title">System Status</div>
      <div className="kv"><span className="k">MEMORY CORE</span><span className="v accent">STABLE</span></div>
      <div className="kv"><span className="k">CONNECTION</span><span className="v cyan">SECURE</span></div>
      <div className="kv"><span className="k">USER</span><span className="v">WUYAN</span></div>
      <div className="kv"><span className="k">LAST UPDATE</span><span className="v">2026/05/05</span></div>
      <div className="kv"><span className="k">FOCUS</span><span className="v accent">{activeWork?.title || "—"}</span></div>
    </div>
  );
}

function NowPlaying() {
  const [playing, setPlaying] = useState(true);
  return (
    <div className="panel">
      <div className="panel-title">Now Playing</div>
      <div className="np-row">
        <div className="np-info">
          <div className="np-title">Nebula Drift</div>
          <div className="np-by">by Wuyan</div>
        </div>
        <button className="np-btn" onClick={() => setPlaying(p => !p)}>
          {playing
            ? <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            : <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3 L21 12 L5 21 Z"/></svg>
          }
        </button>
      </div>
      <div className="np-bars" style={{ animationPlayState: playing ? "running" : "paused" }}>
        {Array.from({ length: 22 }).map((_, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.07}s`, animationPlayState: playing ? "running" : "paused" }}></span>
        ))}
      </div>
    </div>
  );
}

function TipCard() {
  return (
    <div className="panel">
      <div className="panel-title">TIP / 提示</div>
      <p className="tip">將游標移動到中央作品上，<br/>拖曳可旋轉。鍵盤 ← / → 也行。</p>
    </div>
  );
}

function Mascot() {
  return (
    <div className="mascot">
      <div className="bubble">&gt; 好奇的話<br/>&nbsp;&nbsp;就四處看看吧。</div>
      <svg width="64" height="58" viewBox="0 0 64 58" fill="none">
        <defs>
          <radialGradient id="cat-eye" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fcd34d" />
            <stop offset="100%" stopColor="#a78bfa" />
          </radialGradient>
        </defs>
        <path d="M14 10 L20 2 L24 12 Z" fill="#1a0f3a" stroke="#a78bfa" />
        <path d="M50 10 L44 2 L40 12 Z" fill="#1a0f3a" stroke="#a78bfa" />
        <ellipse cx="32" cy="28" rx="22" ry="22" fill="#1a0f3a" stroke="#a78bfa" />
        <path d="M14 50 Q32 60 50 50 L50 56 L14 56 Z" fill="#1a0f3a" stroke="#a78bfa" />
        <ellipse cx="24" cy="28" rx="3" ry="4" fill="url(#cat-eye)" />
        <ellipse cx="40" cy="28" rx="3" ry="4" fill="url(#cat-eye)" />
        <path d="M30 36 Q32 38 34 36" stroke="#a78bfa" fill="none" strokeWidth="1.2" />
        {/* whiskers */}
        <line x1="6" y1="32" x2="18" y2="32" stroke="#a78bfa" strokeOpacity="0.6" />
        <line x1="46" y1="32" x2="58" y2="32" stroke="#a78bfa" strokeOpacity="0.6" />
      </svg>
    </div>
  );
}

function RecentRail({ items, onSelect }) {
  return (
    <div className="recent-rail">
      <div className="recent-track">
        {[...items, ...items].map((w, i) => (
          <div key={i} className="mini-card" onClick={() => onSelect && onSelect(w)}>
            <div className="mini-thumb">
              <ThumbArt kind={w.art} color={w.color} />
              <div className="mini-tag" style={{ color: w.color, borderColor: w.color + "55" }}>{w.tag.split(" / ")[0]}</div>
            </div>
            <div className="mini-title">{w.titleZh}</div>
            <div className="mini-cat">{w.tag}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.Rail = Rail;
window.Clock = Clock;
window.SystemStatus = SystemStatus;
window.NowPlaying = NowPlaying;
window.TipCard = TipCard;
window.Mascot = Mascot;
window.RecentRail = RecentRail;
