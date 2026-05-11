// Main app
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#a78bfa",
  "autoSpeed": 0.15,
  "depth": 380,
  "particles": 28,
  "cardVariant": "cage",
  "showMascot": true
}/*EDITMODE-END*/;

function Particles({ count }) {
  const items = Array.from({ length: count }).map((_, i) => {
    const left = Math.random() * 100;
    const dur = 12 + Math.random() * 18;
    const delay = -Math.random() * dur;
    const size = 1 + Math.random() * 2.5;
    const colors = ["#a78bfa", "#c4b5fd", "#67e8f9", "#d946ef"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return (
      <span key={i} className="particle"
        style={{
          left: `${left}%`,
          width: `${size}px`,
          height: `${size}px`,
          background: color,
          boxShadow: `0 0 8px ${color}`,
          animationDuration: `${dur}s`,
          animationDelay: `${delay}s`,
        }} />
    );
  });
  return <>{items}</>;
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeCat, setActiveCat] = useState("ALL");
  const activeWork = WORKS[activeIdx];

  return (
    <>
      <div className="scene-bg">
        <div className="nebula n1"></div>
        <div className="nebula n2"></div>
        <div className="nebula n3"></div>
        <Particles count={tweaks.particles} />
      </div>

      <div className="app">
        {/* TOP BAR */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="brand-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 3 L9 1 L11 6 Z M19 3 L15 1 L13 6 Z" fill="currentColor" />
                <circle cx="12" cy="13" r="8" />
                <circle cx="9" cy="12" r="1" fill="currentColor" />
                <circle cx="15" cy="12" r="1" fill="currentColor" />
              </svg>
            </div>
            <span>WUYAN'S ARCHIVE</span>
            <span style={{ color: "var(--ink-3)" }}>v2.0.1</span>
            <span style={{ color: "#4ade80" }}>● ONLINE</span>
          </div>
          <div className="topbar-title">
            <h1>ARCHIVE&nbsp;&nbsp;NAVIGATION</h1>
            <div className="sub">選擇一段記憶 · 進入不同的世界</div>
          </div>
          <div className="topbar-right">
            <span>SESSION 0423</span>
            <span className="status-dot"></span>
            <Clock />
          </div>
        </header>

        {/* MAIN GRID */}
        <main className="main">
          <Rail active={activeCat} onSelect={setActiveCat} />

          <section className="stage">
            <div className="stage-eyebrow">
              <div className="en">// SELECT A MEMORY · EXPLORE A WORLD</div>
            </div>
            <Carousel works={WORKS} autoSpeed={tweaks.autoSpeed} depth={tweaks.depth}
              variant={tweaks.cardVariant}
              onSelect={(w, i) => setActiveIdx(i)} />
            <StageBase active={activeWork} accent={tweaks.accent} />
          </section>

          <aside className="right-col">
            <SystemStatus activeWork={activeWork} />
            <NowPlaying />
            <TipCard />
          </aside>
        </main>

        {/* BOTTOM RECENT MEMORIES */}
        <footer>
          <div className="bottom">
            <div className="bottom-label">
              Recent Memories
              <span className="zh">最近的記憶</span>
            </div>
            <RecentRail items={RECENT} />
            <div className="bottom-label" style={{ textAlign: "right" }}>
              Memory Fragment
              <span className="zh">#0421 · #0422 · #0423</span>
            </div>
          </div>
          <div className="scroll-hint">
            SCROLL TO EXPLORE
            <span className="arrow">↓</span>
          </div>
        </footer>
      </div>

      {tweaks.showMascot && <Mascot />}

      <TweaksPanel title="Tweaks">
        <TweakSection title="Card style">
          <TweakRadio label="Frame" value={tweaks.cardVariant}
            options={[{ value: "cage", label: "華麗鳥籠" }, { value: "rune", label: "符文方塊" }]}
            onChange={v => setTweak("cardVariant", v)} />
        </TweakSection>
        <TweakSection title="Visual">
          <TweakColor label="Accent" value={tweaks.accent} onChange={v => setTweak("accent", v)} />
          <TweakSlider label="Particles" min={0} max={80} step={2}
            value={tweaks.particles} onChange={v => setTweak("particles", v)} />
        </TweakSection>
        <TweakSection title="Carousel">
          <TweakSlider label="Auto-rotate speed" min={0} max={0.6} step={0.05}
            value={tweaks.autoSpeed} onChange={v => setTweak("autoSpeed", v)} />
          <TweakSlider label="Depth" min={260} max={520} step={10}
            value={tweaks.depth} onChange={v => setTweak("depth", v)} />
        </TweakSection>
        <TweakSection title="Extras">
          <TweakToggle label="Show mascot" value={tweaks.showMascot} onChange={v => setTweak("showMascot", v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
