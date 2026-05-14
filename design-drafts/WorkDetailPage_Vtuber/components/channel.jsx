// Channel & streams
const Channel = () => {
  const streams = [
    { title: '初登場 · 自我介紹', date: '2024.07', dur: '12:48', tag: 'DEBUT' },
    { title: '深夜雜談 · 藥草配方', date: '2024.08', dur: '1:42:18', tag: 'TALK' },
    { title: 'ASMR · 玻璃瓶與冰塊', date: '2024.09', dur: '38:02', tag: 'ASMR' },
    { title: '繪圖回放 · 自畫像', date: '2024.10', dur: '2:30:45', tag: 'ART' },
    { title: '遊戲 · 月夜旅人', date: '2024.11', dur: '3:12:00', tag: 'GAME' },
    { title: '歌回 · 月光下的茶會', date: '2024.12', dur: '45:20', tag: 'SING' },
  ];

  return (
    <section className="page" id="channel" data-screen-label="07 Channel">
      <div className="section-eyebrow"><span className="idx">07</span> <span>broadcast.signal</span></div>
      <h2 className="section-title">頻道與直播<br/><span style={{ color: 'var(--ink-500)', fontSize: '0.5em', letterSpacing: '0.3em' }}>BROADCAST · SIGNAL</span></h2>
      <div className="section-subtitle">// 月光下的廣播站 · YouTube channel</div>

      <div className="channel-card">
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 32, alignItems: 'center' }}>
          {/* avatar placeholder */}
          <div style={{
            width: 160, height: 160, borderRadius: '50%',
            border: '2px solid var(--neon-magenta)',
            background: 'radial-gradient(circle, rgba(240,171,252,0.2), rgba(167,139,250,0.05))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 0 40px rgba(240,171,252,0.3), inset 0 0 30px rgba(240,171,252,0.1)'
          }}>
            <div style={{
              fontFamily: 'var(--font-rune)', fontSize: 48,
              color: 'var(--neon-magenta)', textShadow: '0 0 20px var(--neon-magenta)'
            }}>吳</div>
            <svg style={{ position: 'absolute', inset: -12, animation: 'rune-spin 30s linear infinite' }}>
              <circle cx="50%" cy="50%" r="50%" fill="none" stroke="rgba(167,139,250,0.4)" strokeDasharray="4 8"/>
            </svg>
          </div>

          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.3em', color: 'var(--neon-violet)', marginBottom: 8
            }}>
              ▶ YOUTUBE · @吳言-o9q
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--ink-100)',
              marginBottom: 8, fontWeight: 500
            }}>
              吳言<span style={{ color: 'var(--neon-magenta)' }}> wuyan</span> ★ Vtuber
            </div>
            <div style={{
              fontFamily: 'var(--font-serif)', fontSize: 14,
              color: 'var(--ink-300)', lineHeight: 1.7, fontStyle: 'italic'
            }}>
              「為失眠的旅人沖一壺茶 — 雜談、ASMR、繪圖回放、深夜歌回。」
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
              <span className="chip">雜 談</span>
              <span className="chip">ASMR</span>
              <span className="chip">繪 圖</span>
              <span className="chip">歌 回</span>
              <span className="chip">遊 戲</span>
            </div>
          </div>

          <a href="https://www.youtube.com/@%E5%90%B3%E8%A8%80-o9q" target="_blank" rel="noopener" className="btn primary">
            ▶ 前往頻道
          </a>
        </div>
      </div>

      {/* schedule strip */}
      <div style={{
        marginTop: 32, padding: 24,
        border: '1px solid var(--line-soft)',
        background: 'rgba(13, 7, 38, 0.4)',
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0,
        fontFamily: 'var(--font-mono)', fontSize: 10
      }}>
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d, i) => {
          const events = [null, '雜談 · 22:00', null, 'ASMR · 23:00', null, '歌回 · 21:00', '繪圖 · 20:00'];
          return (
            <div key={d} style={{
              padding: '12px 16px',
              borderRight: i !== 6 ? '1px solid var(--line-soft)' : 'none',
              minHeight: 80
            }}>
              <div style={{ color: 'var(--neon-violet)', letterSpacing: '0.2em', marginBottom: 8 }}>{d}</div>
              {events[i] ? (
                <div style={{ color: 'var(--ink-100)', fontSize: 11, fontFamily: 'var(--font-serif)' }}>
                  {events[i]}
                </div>
              ) : (
                <div style={{ color: 'var(--ink-700)', fontSize: 10 }}>—</div>
              )}
            </div>
          );
        })}
      </div>

      {/* highlight grid */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        letterSpacing: '0.25em', color: 'var(--neon-violet)',
        marginTop: 56, marginBottom: 16
      }}>
        ◇ HIGHLIGHTS · 精 華
      </div>
      <div className="channel-grid">
        {streams.map((s, i) => (
          <div className="stream-card" key={i}>
            <div className="duration">{s.dur}</div>
            <div style={{
              position: 'absolute', top: 12, left: 12,
              fontFamily: 'var(--font-mono)', fontSize: 9,
              color: 'var(--neon-cyan)', letterSpacing: '0.2em'
            }}>
              {s.tag} · {s.date}
            </div>
            <div className="placeholder-label" style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap'
            }}>
              ◇ 縮圖佔位
            </div>
            <div className="label">{s.title}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

window.Channel = Channel;
