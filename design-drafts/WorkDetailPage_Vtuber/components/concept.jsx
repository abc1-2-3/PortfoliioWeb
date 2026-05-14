// Concept / 創作思路
const Concept = () => {
  const cards = [
    {
      num: '01',
      title: '凋零的浪漫',
      en: 'WILTED ROMANCE',
      desc: '藍色玫瑰、骸骨、夜霧——我喜歡將「死亡」與「治癒」放在同一畫面。煉金術師既是花匠，也是骨骼的整理者。'
    },
    {
      num: '02',
      title: '低聲的善意',
      en: 'QUIET KINDNESS',
      desc: '角色不在中心發光，而是在窗台留下花瓣後悄悄離開。直播風格也想保留這種柔軟、低聲、像耳邊呢喃的距離感。'
    },
    {
      num: '03',
      title: '工具即詩',
      en: 'TOOLS AS POETRY',
      desc: 'Clip Studio Paint 的筆刷、Live2D 的參數、OBS 的訊號流，對我而言都是現代的咒語。將工程感與魔法感混合，是這次作品的核心語彙。'
    },
  ];

  return (
    <section className="page" id="concept" data-screen-label="03 Concept">
      <div className="section-eyebrow"><span className="idx">03</span> <span>creative.thesis</span></div>
      <h2 className="section-title">創作思路<br/><span style={{ color: 'var(--ink-500)', fontSize: '0.5em', letterSpacing: '0.3em' }}>DESIGN · THESIS</span></h2>
      <div className="section-subtitle">// 為什麼是這個角色 · 為什麼是這個樣子</div>

      <div className="concept-grid">
        {cards.map((c, i) => (
          <div className="concept-card" key={i}>
            <div className="num">{c.num}</div>
            <h4>{c.title}</h4>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.25em', color: 'var(--neon-violet)',
              marginBottom: 16
            }}>{c.en}</div>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

window.Concept = Concept;
