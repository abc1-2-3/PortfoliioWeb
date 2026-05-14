// Top nav
const TopNav = () => (
  <nav className="topnav">
    <div className="brand">✦ WUYAN · ARCHIVE</div>
    <div className="nav-links">
      <a href="#hero">封面</a>
      <a href="#profile">設定</a>
      <a href="#concept">理念</a>
      <a href="#drawing">繪製</a>
      <a href="#modeling">建模</a>
      <a href="#webcam">鏡頭</a>
      <a href="#channel">頻道</a>
    </div>
    <div className="crumb">
      portfolio <span className="sep">/</span> works <span className="sep">/</span>
      <span className="current">vtuber</span>
    </div>
  </nav>
);

// Footer
const FooterBar = () => (
  <footer>
    <div>◇ WUYAN · CONJURED 2025</div>
    <div style={{ display: 'flex', gap: 24 }}>
      <span>Clip Studio Paint</span>
      <span style={{ color: 'var(--ink-700)' }}>·</span>
      <span>Live2D Cubism</span>
      <span style={{ color: 'var(--ink-700)' }}>·</span>
      <span>OBS</span>
      <span style={{ color: 'var(--ink-700)' }}>·</span>
      <span style={{ color: 'var(--neon-violet)' }}>所有素材 © 吳言</span>
    </div>
  </footer>
);

// Tweaks panel — wrap defaults in EDITMODE markers so host can persist
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "scanlines": true,
  "ambient": "violet",
  "accentMix": "balanced",
  "displayFont": "cinzel",
  "particleDensity": 60
}/*EDITMODE-END*/;

const App = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // apply scanlines
  React.useEffect(() => {
    document.body.classList.toggle('scanlines', !!tweaks.scanlines);
  }, [tweaks.scanlines]);

  // apply ambient palette
  React.useEffect(() => {
    const root = document.documentElement;
    const presets = {
      violet:  { bgVoid: '#07041a', bgDeep: '#0d0726', neonViolet: '#a78bfa', neonMagenta: '#f0abfc', neonCyan: '#22d3ee', neonAmber: '#fde68a' },
      cyber:   { bgVoid: '#050510', bgDeep: '#0a0a1f', neonViolet: '#3a86ff', neonMagenta: '#ff006e', neonCyan: '#00ff9d', neonAmber: '#fde68a' },
      pastel:  { bgVoid: '#1a0b2e', bgDeep: '#241346', neonViolet: '#c4b5fd', neonMagenta: '#fbcfe8', neonCyan: '#a5f3fc', neonAmber: '#fef3c7' },
      ember:   { bgVoid: '#0d0508', bgDeep: '#1f0a14', neonViolet: '#fda4af', neonMagenta: '#fb7185', neonCyan: '#fde68a', neonAmber: '#fed7aa' },
    };
    const p = presets[tweaks.ambient] || presets.violet;
    root.style.setProperty('--bg-void', p.bgVoid);
    root.style.setProperty('--bg-deep', p.bgDeep);
    root.style.setProperty('--neon-violet', p.neonViolet);
    root.style.setProperty('--neon-magenta', p.neonMagenta);
    root.style.setProperty('--neon-cyan', p.neonCyan);
    root.style.setProperty('--neon-amber', p.neonAmber);
  }, [tweaks.ambient]);

  // display font swap
  React.useEffect(() => {
    const fonts = {
      cinzel: "'Cinzel', 'Noto Serif TC', serif",
      cormorant: "'Cormorant Garamond', 'Noto Serif TC', serif",
      serifTC: "'Noto Serif TC', serif",
    };
    document.documentElement.style.setProperty('--font-display', fonts[tweaks.displayFont] || fonts.cinzel);
  }, [tweaks.displayFont]);

  return (
    <>
      <TopNav/>

      {/* Floating particles for ambient flavor */}
      <ParticleField count={tweaks.particleDensity}/>

      <Hero/>
      <Profile/>
      <Concept/>
      <Drawing/>
      <Modeling/>
      <WebcamDemo/>
      <Channel/>

      <FooterBar/>

      <TweaksPanel title="Tweaks · 樣式調整">
        <TweakSection title="魔法配色 / Ambient">
          <TweakRadio
            label="主題"
            value={tweaks.ambient}
            onChange={v => setTweak('ambient', v)}
            options={[
              { value: 'violet', label: '紫夜' },
              { value: 'cyber', label: '霓虹' },
              { value: 'pastel', label: '柔光' },
              { value: 'ember', label: '炭花' },
            ]}
          />
        </TweakSection>

        <TweakSection title="字體 / Display Font">
          <TweakRadio
            label="標題字"
            value={tweaks.displayFont}
            onChange={v => setTweak('displayFont', v)}
            options={[
              { value: 'cinzel', label: 'Cinzel' },
              { value: 'cormorant', label: 'Cormorant' },
              { value: 'serifTC', label: '思源宋' },
            ]}
          />
        </TweakSection>

        <TweakSection title="氛圍效果 / FX">
          <TweakToggle
            label="掃描線 (CRT)"
            value={tweaks.scanlines}
            onChange={v => setTweak('scanlines', v)}
          />
          <TweakSlider
            label="星塵密度"
            value={tweaks.particleDensity}
            min={0} max={120} step={10}
            onChange={v => setTweak('particleDensity', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
};

// Ambient particles — "stardust"
const ParticleField = ({ count = 60 }) => {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      c.width = innerWidth * dpr;
      c.height = innerHeight * dpr;
      c.style.width = innerWidth + 'px';
      c.style.height = innerHeight + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      r: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      a: Math.random(),
      tw: Math.random() * 0.02 + 0.005,
    }));

    let raf;
    const tick = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      const colors = ['rgba(167,139,250,', 'rgba(240,171,252,', 'rgba(34,211,238,', 'rgba(253,230,138,'];
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        p.a += p.tw; if (p.a > 1) p.tw = -Math.abs(p.tw); if (p.a < 0) p.tw = Math.abs(p.tw);
        if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0;
        if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0;

        const col = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * dpr, 0, Math.PI * 2);
        ctx.fillStyle = col + (p.a * 0.7).toFixed(2) + ')';
        ctx.fill();

        // glow halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = col + (p.a * 0.07).toFixed(2) + ')';
        ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [count]);

  return <canvas ref={ref} style={{
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none'
  }}/>;
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
