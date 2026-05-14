// Profile / 角色設定表
const Profile = () => {
  const stats = [
    { label: 'NAME', value: '吳言 / WUYAN', cn: '本名留白' },
    { label: 'CLASS', value: 'Alchemist', cn: '煉金術師' },
    { label: 'RACE', value: '？？？', cn: '半人半獸 (TBD)' },
    { label: 'BIRTH', value: '— / —', cn: '生辰未定' },
    { label: 'HEIGHT', value: '— cm', cn: '身高待定' },
    { label: 'CV', value: '吳言本人', cn: 'self-voiced' },
    { label: 'WEAPON', value: '玻璃藥瓶', cn: '玫瑰萃取液' },
    { label: 'FAMILIAR', value: '骸骨幼鹿', cn: 'Bone Fawn' },
  ];

  return (
    <section className="page" id="profile" data-screen-label="02 Profile">
      <div className="section-eyebrow">
        <span className="idx">02</span> <span>character.profile</span>
      </div>
      <h2 className="section-title">角色設定<br/><span style={{ color: 'var(--ink-500)', fontSize: '0.5em', letterSpacing: '0.3em' }}>CHARACTER · DOSSIER</span></h2>
      <div className="section-subtitle">// dossier loaded · 8 entries</div>

      <div className="profile-grid">
        <div>
          <div className="profile-portrait">
            <div className="placeholder-label">
              ◇ 角色立繪佔位<br/>
              <span style={{ opacity: 0.6, fontSize: 9 }}>character_full_body.psd</span>
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="chip">藍玫瑰</span>
            <span className="chip">煉金術</span>
            <span className="chip">獸骨</span>
            <span className="chip">茶香</span>
            <span className="chip">月夜</span>
          </div>
        </div>

        <div>
          <div className="profile-stats">
            {stats.map((s, i) => (
              <div className="stat" key={i}>
                <div className="stat-label">{s.label}</div>
                <div className={`stat-value ${s.value.length > 10 ? 'small' : ''}`}>{s.value}</div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: 12,
                  color: 'var(--ink-500)', marginTop: 4
                }}>{s.cn}</div>
              </div>
            ))}
          </div>

          <div className="story-block">
            <div className="quote-mark">⟁ STORY · 故 事</div>
            <p style={{ margin: 0 }}>
              在世界的<span style={{ color: 'var(--neon-magenta)' }}>邊陲森林</span>之中，
              有一位採藥的煉金術師——<span style={{ color: 'var(--neon-amber)' }}>吳言</span>。
              她培育著只在月光下盛開的<span style={{ color: 'var(--rune-blue)' }}>藍玫瑰</span>，
              身旁總跟著她最初救下的<span style={{ color: 'var(--ink-100)' }}>骸骨幼鹿</span>。
            </p>
            <p style={{ margin: '14px 0 0 0' }}>
              每當村莊有人因夢魘而難眠，她便悄悄在窗台留下一片<span style={{ color: 'var(--neon-violet)' }}>花瓣</span>——
              用熱水沖開，便能釀出一杯安魂的茶。
            </p>
            <p style={{ margin: '14px 0 0 0', color: 'var(--ink-500)', fontStyle: 'italic', fontSize: 13 }}>
              ※ 故事為初稿，世界觀仍在編織中。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

window.Profile = Profile;
