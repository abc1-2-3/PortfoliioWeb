// Drawing process — left: image-slot viewer (placeholders ready for real screenshots),
// right: info panel + 4-step pipeline.
const Drawing = () => {
  const [activeStage, setActiveStage] = React.useState(0);

  const stages = [
    {
      label: 'stage_01',
      title: '原稿繪製',
      en: 'ILLUSTRATION',
      desc: '從草稿、線稿到完稿一氣呵成。色彩、光影、特效都在這個階段定調。',
      parts: ['草稿 SKETCH', '線稿 LINEART', '平塗 FLAT', '上色 RENDER', '光影 EFFECT'],
      density: '主視覺 · 約 18 hrs'
    },
    {
      label: 'stage_02',
      title: '結構拆件',
      en: 'PART SEPARATION',
      desc: '為了讓 Live2D 能動，必須拆成數百個獨立部件 — 每一綹頭髮、眼皮、嘴唇都要分開命名，並補繪被遮住的後方。',
      parts: ['Head / Face', 'Hair × 多層', 'Body / Arms', 'Accessories', '補繪遮蓋'],
      density: 'PSD 圖層 · 約 12 hrs'
    },
    {
      label: 'stage_03',
      title: '建模綁定',
      en: 'RIGGING',
      desc: '匯入 PSD → 為每個部件加變形器 → 設定 200+ 參數 → 用 physics3.json 描述頭髮、配件的物理擺動。',
      parts: ['Deformer', 'Parameter', 'Physics', 'Expression × 14'],
      density: 'Live2D Cubism · 約 60 hrs'
    },
  ];

  const cur = stages[activeStage];

  return (
    <section className="page" id="drawing" data-screen-label="04 Drawing">
      <div className="section-eyebrow"><span className="idx">04</span> <span>illustration.process</span></div>
      <h2 className="section-title">繪製過程<br/><span style={{ color: 'var(--ink-500)', fontSize: '0.5em', letterSpacing: '0.3em' }}>CLIP STUDIO PAINT → LIVE2D</span></h2>
      <div className="section-subtitle">// 從原稿到模型 · 三個製作階段 · 完整過程截圖整理中</div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 360px',
        gap: 32, alignItems: 'start'
      }}>
        {/* LEFT — image placeholder + tabs */}
        <div>
          <div style={{
            position: 'relative',
            aspectRatio: '1/1',
            border: '1px solid var(--line-strong)',
            background:
              'linear-gradient(135deg, rgba(167,139,250,0.05), rgba(34,211,238,0.05)), ' +
              'repeating-linear-gradient(45deg, rgba(167,139,250,0.04) 0 2px, transparent 2px 14px)',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--neon-violet)', letterSpacing: '0.2em',
              textAlign: 'center', lineHeight: 1.8
            }}>
              <div style={{ fontSize: 32, opacity: 0.5, marginBottom: 8 }}>◇</div>
              {cur.title} 圖佔位<br/>
              <span style={{ opacity: 0.6, fontSize: 9 }}>{cur.label}.png</span>
              <div style={{
                marginTop: 16,
                fontFamily: 'var(--font-serif)', fontSize: 11,
                color: 'var(--ink-500)', fontStyle: 'italic',
                letterSpacing: 'normal'
              }}>
                等待上傳真實過程圖
              </div>
            </div>

            {/* HUD overlay */}
            <div style={{
              position: 'absolute', top: 12, left: 12,
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'var(--neon-cyan)', letterSpacing: '0.2em',
              background: 'rgba(7,4,26,0.7)', padding: '6px 10px',
              border: '1px solid var(--line-soft)',
              pointerEvents: 'none'
            }}>
              {cur.label}.png
            </div>

            <div style={{
              position: 'absolute', bottom: 12, left: 12, right: 12,
              display: 'flex', justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)', fontSize: 9,
              color: 'var(--ink-500)', letterSpacing: '0.15em',
              pointerEvents: 'none'
            }}>
              <span>stage · {activeStage + 1} / {stages.length}</span>
              <span>{cur.density}</span>
            </div>
          </div>

          {/* Stage tabs */}
          <div style={{
            display: 'grid', gridTemplateColumns: `repeat(${stages.length}, 1fr)`,
            gap: 8, marginTop: 12
          }}>
            {stages.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveStage(i)}
                style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  background: activeStage === i ? 'rgba(167,139,250,0.1)' : 'rgba(13,7,38,0.5)',
                  border: `1px solid ${activeStage === i ? 'var(--neon-violet)' : 'var(--line-soft)'}`,
                  color: 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={ev => {
                  if (activeStage !== i) ev.currentTarget.style.borderColor = 'var(--neon-violet)';
                }}
                onMouseLeave={ev => {
                  if (activeStage !== i) ev.currentTarget.style.borderColor = 'var(--line-soft)';
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9,
                  letterSpacing: '0.25em',
                  color: activeStage === i ? 'var(--neon-magenta)' : 'var(--ink-500)',
                  marginBottom: 6
                }}>
                  {s.label.toUpperCase()}
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 16,
                  color: 'var(--ink-100)', marginBottom: 4
                }}>
                  {s.title}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9,
                  color: 'var(--ink-500)', letterSpacing: '0.1em'
                }}>
                  {s.density}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT — info panel + pipeline */}
        <div>
          <div className="panel crt bracketed" style={{ padding: 0 }}>
            <div className="term-bar">
              <div className="dots"><span/><span/><span/></div>
              <div>stage.info</div>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: '0.25em', color: 'var(--neon-violet)', marginBottom: 6
              }}>
                {cur.en}
              </div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 22,
                color: 'var(--ink-100)', marginBottom: 14
              }}>
                {cur.title}
              </div>
              <p style={{
                fontFamily: 'var(--font-serif)', fontSize: 13,
                color: 'var(--ink-300)', lineHeight: 1.8, margin: 0
              }}>
                {cur.desc}
              </p>

              <div style={{
                marginTop: 20, paddingTop: 16,
                borderTop: '1px solid var(--line-soft)',
                fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: '0.2em', color: 'var(--neon-violet)', marginBottom: 10
              }}>
                ◇ KEY STEPS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {cur.parts.map((p, i) => (
                  <span key={i} className="chip" style={{
                    borderColor: 'var(--line-strong)',
                    color: 'var(--ink-100)'
                  }}>{p}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Pipeline */}
          <div style={{ marginTop: 16, padding: 20, border: '1px solid var(--line-soft)' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.25em', color: 'var(--neon-violet)', marginBottom: 12
            }}>◇ PIPELINE</div>
            {[
              { step: '01', tool: 'Clip Studio Paint', task: '原稿繪製 + 拆件分層' },
              { step: '02', tool: 'PSD Export',        task: '依拆件命名分組' },
              { step: '03', tool: 'Live2D Cubism',     task: '匯入 → 變形器 → 動畫' },
              { step: '04', tool: 'Texture Atlas',     task: '打包至 4096² × 3 張' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'baseline', gap: 14,
                padding: '8px 0',
                borderBottom: i < 3 ? '1px dashed rgba(167,139,250,0.15)' : 'none'
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  color: 'var(--neon-magenta)', letterSpacing: '0.2em'
                }}>{s.step}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 13,
                    color: 'var(--ink-100)'
                  }}>{s.tool}</div>
                  <div style={{
                    fontFamily: 'var(--font-serif)', fontSize: 11,
                    color: 'var(--ink-500)'
                  }}>{s.task}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 16, padding: '12px 16px',
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--ink-500)', letterSpacing: '0.1em',
            lineHeight: 1.7,
            border: '1px dashed var(--line-strong)',
            background: 'rgba(167,139,250,0.04)'
          }}>
            <span style={{ color: 'var(--neon-amber)' }}>※</span> 上方為佔位框 — 完整繪製過程圖整理好後可直接放進去。
          </div>
        </div>
      </div>
    </section>
  );
};

window.Drawing = Drawing;
