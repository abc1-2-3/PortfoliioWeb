// Hero section
const Hero = () => {
  const [time, setTime] = React.useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toTimeString().slice(0, 8);
  const dateStr = time.toISOString().slice(0, 10);

  return (
    <section className="hero" id="hero" data-screen-label="01 Hero">
      <div className="hero-bg"/>

      {/* Floating rune ring */}
      <div className="hero-runes">
        <RuneRing size={420}/>
      </div>

      <div className="hero-content">
        <div>
          <div className="hero-meta">
            <span>CASE.04 / VTUBER</span>
            <span>{dateStr}</span>
            <span className="mono">{timeStr}</span>
          </div>

          <h1>
            <span className="name-cn">吳言</span>
            <span className="name-en">W U Y A N · 煉 金 術 師</span>
          </h1>

          <p className="hero-tag">
            「凋零的<span className="accent">藍玫瑰</span>落於村莊邊界，<br/>
            獸骨與符咒在月色中低語——<br/>
            為失眠的旅人，沖一壺溫暖的茶。」
          </p>

          <div className="hero-actions">
            <a href="#profile" className="btn primary">
              <span>▶</span> 進入檔案
            </a>
            <a href="#webcam" className="btn">
              開啟鏡頭 demo
            </a>
          </div>
        </div>

        <div className="hero-spec">
          <div className="panel crt bracketed" style={{ padding: 0 }}>
            <div className="term-bar">
              <div className="dots"><span/><span/><span/></div>
              <div>character_card.dat</div>
              <div>v1.0</div>
            </div>
            <div style={{ padding: 24 }}>
              <div className="spec-label">CODENAME</div>
              <div className="spec-value">吳言 · WUYAN</div>

              <div className="spec-label">CLASS</div>
              <div className="spec-value">Alchemist / 煉金術師</div>

              <div className="spec-label">RIG</div>
              <div className="spec-value">Live2D Cubism · Custom Model</div>

              <div className="spec-label">PLATFORM</div>
              <div className="spec-value">YouTube · @吳言-o9q</div>

              <div style={{
                marginTop: 24, paddingTop: 16,
                borderTop: '1px solid var(--line-soft)',
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: 'var(--ink-500)', letterSpacing: '0.15em',
                lineHeight: 1.8
              }}>
                {'> conjuring rune.'}<br/>
                {'> initializing model...'}<br/>
                <span style={{ color: 'var(--neon-cyan)' }}>{'> ready_'}</span>
                <span className="cursor-blink">█</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <div style={{
        position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.3em',
        color: 'var(--ink-500)', textAlign: 'center', textTransform: 'uppercase'
      }}>
        scroll · 向下捲動<br/>
        <span style={{ display: 'inline-block', marginTop: 8, color: 'var(--neon-violet)' }}>▼</span>
      </div>

      <style>{`
        .cursor-blink { animation: blink 1s steps(2) infinite; }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </section>
  );
};

window.Hero = Hero;
