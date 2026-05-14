// Modeling — Live2D Cubism with real model (ref-based)
const Modeling = () => {
  const canvasRef = React.useRef(null);
  const [, force] = React.useReducer(x => x + 1, 0);
  const [openParts, setOpenParts] = React.useState({
    Head: true, Hair: true, Body: false, Face: true, Accessory: false, Effect: false
  });
  const toggle = (k) => setOpenParts(s => ({ ...s, [k]: !s[k] }));

  const tree = [
    { name: 'Head 頭部', key: 'Head', children: [
      'ArtMesh_Head_Front', 'ArtMesh_Head_Side', 'ArtMesh_Neck',
      'Deformer_HeadAngle', 'Deformer_BodyAngleX'
    ]},
    { name: 'Face 臉部', key: 'Face', children: [
      'ArtMesh_LeftEye', 'ArtMesh_RightEye',
      'ArtMesh_LeftBrow', 'ArtMesh_RightBrow',
      'ArtMesh_Mouth', 'ArtMesh_Cheek',
      'ArtMesh_Eyelash_L', 'ArtMesh_Eyelash_R'
    ]},
    { name: 'Hair 頭髮', key: 'Hair', children: [
      'ArtMesh_FrontHair', 'ArtMesh_SideHair_L', 'ArtMesh_SideHair_R',
      'ArtMesh_BackHair_L', 'ArtMesh_BackHair_R', 'ArtMesh_AhogeHair',
      'Deformer_HairPhysics_Front', 'Deformer_HairPhysics_Side'
    ]},
    { name: 'Body 身體', key: 'Body', children: [
      'ArtMesh_Torso', 'ArtMesh_Coat',
      'ArtMesh_LeftArm_Upper', 'ArtMesh_LeftArm_Lower', 'ArtMesh_LeftHand',
      'ArtMesh_RightArm_Upper', 'ArtMesh_RightArm_Lower', 'ArtMesh_RightHand',
      'ArtMesh_Skirt', 'ArtMesh_Tie'
    ]},
    { name: 'Accessory 配件', key: 'Accessory', children: [
      'ArtMesh_BlueRoseRing', 'ArtMesh_BoneFawnSkull',
      'ArtMesh_CrystalEarring_L', 'ArtMesh_CrystalEarring_R',
      'ArtMesh_BoneCap', 'ArtMesh_CatEar_L', 'ArtMesh_CatEar_R',
      'ArtMesh_GameController'
    ]},
    { name: 'Effect 特效', key: 'Effect', children: [
      'ArtMesh_Snowflakes', 'ArtMesh_Petals', 'ArtMesh_StarSparkle',
      'ArtMesh_TearDrops', 'ArtMesh_LoadingRing', 'ArtMesh_PhysicsFormula'
    ]},
  ];

  return (
    <section className="page" id="modeling" data-screen-label="05 Modeling">
      <div className="section-eyebrow"><span className="idx">05</span> <span>live2d.rigging</span></div>
      <h2 className="section-title">建模過程<br/><span style={{ color: 'var(--ink-500)', fontSize: '0.5em', letterSpacing: '0.3em' }}>LIVE2D · CUBISM</span></h2>
      <div className="section-subtitle">// 真模型 · 拖拉旋轉 · 14 個自製表情 · 即時參數綁定</div>

      <div className="modeling-layout">
        {/* LEFT — sticky model column */}
        <div className="modeling-sticky">
          <ModelLiveStage canvasRef={canvasRef} onActiveChange={force}/>
        </div>

        {/* RIGHT — scrolling content */}
        <div className="modeling-right-stack">
          {/* Object tree */}
          <div className="layer-tree">
            <div className="layer-tree-header">
              <span>OBJECT TREE · 物 件 樹</span>
              <span style={{ color: 'var(--neon-amber)' }}>wuyan.cmo3</span>
            </div>
            {tree.map(g => (
              <React.Fragment key={g.key}>
                <div className="layer folder" onClick={() => toggle(g.key)} style={{ cursor: 'pointer' }}>
                  <span className="icon folder-i"/>
                  <span>{g.name}</span>
                  <span className="visibility">{openParts[g.key] ? '▾' : '▸'}</span>
                </div>
                {openParts[g.key] && g.children.map((c, i) => (
                  <div className="layer" key={i}>
                    <span className="indent"/>
                    <span className="icon"/>
                    <span style={{ fontSize: 10 }}>{c}</span>
                  </div>
                ))}
              </React.Fragment>
            ))}

            <div style={{
              padding: '10px 14px', borderTop: '1px solid var(--line-soft)',
              fontSize: 10, color: 'var(--ink-500)', letterSpacing: '0.1em',
              position: 'sticky', bottom: 0,
              background: 'var(--bg-deep)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>ArtMesh</span><span style={{ color: 'var(--neon-cyan)' }}>180+</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Parameter</span><span style={{ color: 'var(--neon-cyan)' }}>200+</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Expression</span><span style={{ color: 'var(--neon-cyan)' }}>14</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Texture</span><span style={{ color: 'var(--neon-cyan)' }}>3 × 4096²</span>
              </div>
            </div>
          </div>

          {/* Physics triggers */}
          <div className="panel">
            <div className="term-bar">
              <div className="dots"><span/><span/><span/></div>
              <div>physics.trigger · 觸 發 物 理 擾 動</div>
              <div style={{ color: 'var(--neon-cyan)' }}>● PHYSICS3.JSON</div>
            </div>
            <PhysicsTriggers canvasRef={canvasRef}/>
          </div>

          {/* Param sliders */}
          <div className="panel">
            <div className="term-bar">
              <div className="dots"><span/><span/><span/></div>
              <div>parameters · 即 時 控 制</div>
              <div style={{ color: 'var(--neon-cyan)' }}>● LIVE BINDING</div>
            </div>
            <ParamSliders canvasRef={canvasRef}/>
          </div>
        </div>
      </div>
    </section>
  );
};

const ModelLiveStage = ({ canvasRef, onActiveChange }) => {
  const stageRef = React.useRef(null);
  const [pointerPos, setPointerPos] = React.useState({ x: 0, y: 0, active: false });
  const [active, setActive] = React.useState(null);
  const [ready, setReady] = React.useState(false);
  const [view, setView] = React.useState('full');

  const changeView = (v) => {
    setView(v);
    canvasRef.current?.setView(v);
  };

  const handleMove = (e) => {
    if (!stageRef.current || !canvasRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    const c = canvasRef.current;
    c.setParam('ParamAngleX', nx * 60);
    c.setParam('ParamAngleY', -ny * 50);
    c.setParam('ParamAngleZ', nx * 20);
    c.setParam('ParamBodyAngleX', nx * 10);
    c.setParam('ParamBodyAngleY', -ny * 10);
    c.setParam('ParamEyeBallX', nx * 1.4);
    c.setParam('ParamEyeBallY', -ny * 1.2);
    setPointerPos({ x: e.clientX - r.left, y: e.clientY - r.top, active: true });
  };
  const handleLeave = () => {
    const c = canvasRef.current;
    if (c) {
      ['ParamAngleX','ParamAngleY','ParamAngleZ','ParamBodyAngleX','ParamBodyAngleY','ParamEyeBallX','ParamEyeBallY']
        .forEach(p => c.clearParam(p));
    }
    setPointerPos(p => ({ ...p, active: false }));
  };

  const toggleExpr = (name) => {
    if (!canvasRef.current) return;
    const next = active === name ? null : name;
    canvasRef.current.setExpression(next);
    setActive(next);
    onActiveChange && onActiveChange();
  };

  return (
    <div>
      <div
        ref={stageRef}
        className="live2d-stage"
        style={{ aspectRatio: '4/5', cursor: 'crosshair', position: 'relative' }}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        <div className="stage-grid"/>
        <div className="stage-axis"/>
        <div className="stage-axis v"/>

        <Live2DCanvas
          ref={canvasRef}
          yOffset={0}
          fitScale={0.95}
          initialView="full"
          onReady={() => setReady(true)}
          style={{ position: 'relative', zIndex: 2 }}
        />

        {/* View chips */}
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 4,
          display: 'flex', gap: 4
        }}>
          {[
            { v: 'full',  l: '全身' },
            { v: 'upper', l: '上半身' },
            { v: 'face',  l: '臉部' },
          ].map(o => (
            <button
              key={o.v}
              onClick={() => changeView(o.v)}
              style={{
                padding: '6px 10px',
                fontFamily: 'var(--font-mono)', fontSize: 9,
                letterSpacing: '0.2em',
                background: view === o.v ? 'rgba(240,171,252,0.2)' : 'rgba(7,4,26,0.6)',
                border: `1px solid ${view === o.v ? 'var(--neon-magenta)' : 'var(--line-soft)'}`,
                color: view === o.v ? 'var(--neon-magenta)' : 'var(--ink-300)',
                cursor: 'pointer', transition: 'all 0.15s'
              }}
            >
              {o.l}
            </button>
          ))}
        </div>

        {/* HUD */}
        <div style={{
          position: 'absolute', top: 12, left: 12, zIndex: 3,
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: 'var(--neon-cyan)', letterSpacing: '0.15em',
          display: 'flex', alignItems: 'center', gap: 8,
          pointerEvents: 'none'
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: ready ? 'var(--neon-cyan)' : 'var(--neon-amber)',
            boxShadow: `0 0 8px currentColor`,
            animation: ready ? 'pulse 2s infinite' : 'none'
          }}/>
          {ready ? 'LIVE2D · CUBISM 4' : 'LOADING'}
        </div>

        <div style={{
          position: 'absolute', top: 44, right: 12, zIndex: 3,
          fontFamily: 'var(--font-mono)', fontSize: 9,
          color: 'var(--ink-500)', letterSpacing: '0.1em',
          textAlign: 'right', pointerEvents: 'none'
        }}>
          ◇ 移動滑鼠<br/>模型會跟著看你
        </div>

        <div style={{
          position: 'absolute', bottom: 12, left: 12, right: 12, zIndex: 3,
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)', fontSize: 9,
          color: 'var(--ink-500)', letterSpacing: '0.1em',
          pointerEvents: 'none'
        }}>
          <span>texture · 4096² × 3</span>
          <span>{pointerPos.active ? `tracking · ${Math.round(pointerPos.x)},${Math.round(pointerPos.y)}` : 'idle'}</span>
        </div>
      </div>

      {/* Expression picker */}
      <div style={{ marginTop: 16 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: '0.25em', color: 'var(--neon-violet)',
          marginBottom: 10, display: 'flex', justifyContent: 'space-between'
        }}>
          <span>◇ EXPRESSIONS · 表 情 · 14</span>
          <span style={{ color: 'var(--ink-500)' }}>active: {active || 'none'}</span>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6
        }}>
          {LIVE2D_EXPRESSIONS.map(e => (
            <button
              key={e.name}
              onClick={() => toggleExpr(e.name)}
              style={{
                padding: '10px 6px',
                background: active === e.name ? 'rgba(240,171,252,0.2)' : 'rgba(13,7,38,0.6)',
                border: `1px solid ${active === e.name ? 'var(--neon-magenta)' : 'var(--line-soft)'}`,
                color: active === e.name ? 'var(--neon-magenta)' : 'var(--ink-300)',
                fontFamily: 'var(--font-serif)', fontSize: 11,
                cursor: 'pointer', transition: 'all 0.2s',
                textAlign: 'center'
              }}
              onMouseEnter={ev => {
                if (active !== e.name) {
                  ev.currentTarget.style.borderColor = 'var(--neon-violet)';
                  ev.currentTarget.style.color = 'var(--ink-100)';
                }
              }}
              onMouseLeave={ev => {
                if (active !== e.name) {
                  ev.currentTarget.style.borderColor = 'var(--line-soft)';
                  ev.currentTarget.style.color = 'var(--ink-300)';
                }
              }}
              title={e.cn}
            >
              <div style={{ fontSize: 14, marginBottom: 2 }}>{e.label}</div>
              <div style={{ fontSize: 9, opacity: 0.7, letterSpacing: '0.05em' }}>{e.cn}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

window.Modeling = Modeling;

// Physics trigger panel — pulse parameters to disturb the real model;
// Live2D's built-in physics3.json then propagates the disturbance through
// hair, accessories, clothing.
const PhysicsTriggers = ({ canvasRef }) => {
  const [active, setActive] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const tickRef = React.useRef(null);

  const stopAll = () => {
    if (tickRef.current) {
      cancelAnimationFrame(tickRef.current);
      tickRef.current = null;
    }
    const c = canvasRef.current;
    if (c) {
      ['ParamAngleX','ParamAngleY','ParamAngleZ','ParamBodyAngleX','ParamBodyAngleY','ParamBodyAngleZ']
        .forEach(p => c.clearParam(p));
    }
    setActive(null);
    setBusy(false);
  };

  const run = (id, duration, fn) => {
    const c = canvasRef.current;
    if (!c) return;
    stopAll();
    setActive(id);
    setBusy(true);
    const start = performance.now();
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      if (t > duration) {
        stopAll();
        return;
      }
      fn(t, c);
      tickRef.current = requestAnimationFrame(tick);
    };
    tickRef.current = requestAnimationFrame(tick);
  };

  React.useEffect(() => () => stopAll(), []); // cleanup on unmount

  const triggers = [
    {
      id: 'breeze', label: '微風', icon: '✦', desc: '柔和的左右擺動',
      duration: 6,
      fn: (t, c) => {
        const sway = Math.sin(t * 1.4) * 18 + Math.sin(t * 2.7) * 6;
        c.setParam('ParamAngleZ', sway);
        c.setParam('ParamBodyAngleZ', sway * 0.4);
      }
    },
    {
      id: 'shake', label: '震動', icon: '◈', desc: '快速抖動 · 全身',
      duration: 1.5,
      fn: (t, c) => {
        const decay = Math.max(0, 1 - t / 1.5);
        c.setParam('ParamAngleX', (Math.random() - 0.5) * 30 * decay);
        c.setParam('ParamAngleY', (Math.random() - 0.5) * 25 * decay);
        c.setParam('ParamAngleZ', (Math.random() - 0.5) * 20 * decay);
        c.setParam('ParamBodyAngleX', (Math.random() - 0.5) * 8 * decay);
      }
    },
    {
      id: 'spin', label: '旋風', icon: '⟁', desc: '頭部畫圈 · 看物理回彈',
      duration: 5,
      fn: (t, c) => {
        const r = 28;
        c.setParam('ParamAngleX', Math.cos(t * 2) * r);
        c.setParam('ParamAngleY', Math.sin(t * 2) * r * 0.7);
        c.setParam('ParamAngleZ', Math.sin(t * 2 + Math.PI / 2) * 15);
        c.setParam('ParamBodyAngleZ', Math.sin(t * 2) * 8);
      }
    },
    {
      id: 'jump', label: '跳躍', icon: '↟', desc: '上下彈跳 · 頭髮飄起',
      duration: 2.5,
      fn: (t, c) => {
        // Two bounces with decay; we drive body Y via angle (no Y param; use body angles)
        const phase = t * Math.PI * 2 / 0.7;
        const decay = Math.max(0, 1 - t / 2.5);
        const bounce = Math.abs(Math.sin(phase)) * 25 * decay;
        c.setParam('ParamAngleX', -bounce * 0.5);  // tilt back on jump
        c.setParam('ParamBodyAngleX', -bounce * 0.3);
        c.setParam('ParamAngleZ', Math.sin(phase * 1.2) * 8 * decay);
      }
    },
    {
      id: 'nod', label: '點頭', icon: '✓', desc: '快速點頭 · 答應',
      duration: 2,
      fn: (t, c) => {
        const decay = Math.max(0, 1 - t / 2);
        const nod = Math.sin(t * 8) * 22 * decay;
        c.setParam('ParamAngleX', -Math.abs(nod) * 0.7 + nod * 0.3);
        c.setParam('ParamBodyAngleY', nod * 0.2);
      }
    },
    {
      id: 'tilt', label: '歪頭', icon: '◐', desc: '可愛地歪頭',
      duration: 3,
      fn: (t, c) => {
        // Hold + slow release
        const target = 22;
        const v = t < 0.5
          ? (t / 0.5) * target
          : t < 2.5 ? target
          : target * (1 - (t - 2.5) / 0.5);
        c.setParam('ParamAngleZ', v);
        c.setParam('ParamAngleY', v * 0.3);
      }
    },
  ];

  return (
    <div>
      <div style={{
        padding: '14px 16px',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
        borderBottom: '1px solid var(--line-soft)'
      }}>
        {triggers.map(t => (
          <button
            key={t.id}
            disabled={busy && active !== t.id}
            onClick={() => run(t.id, t.duration, t.fn)}
            style={{
              padding: '14px 8px',
              fontFamily: 'var(--font-serif)', fontSize: 13,
              background: active === t.id ? 'rgba(240,171,252,0.15)' : 'rgba(13,7,38,0.5)',
              border: `1px solid ${active === t.id ? 'var(--neon-magenta)' : 'var(--line-soft)'}`,
              color: active === t.id ? 'var(--neon-magenta)' : (busy ? 'var(--ink-700)' : 'var(--ink-100)'),
              cursor: busy && active !== t.id ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              textAlign: 'center',
              opacity: busy && active !== t.id ? 0.4 : 1
            }}
            onMouseEnter={ev => {
              if (active !== t.id && !busy) {
                ev.currentTarget.style.borderColor = 'var(--neon-violet)';
              }
            }}
            onMouseLeave={ev => {
              if (active !== t.id) {
                ev.currentTarget.style.borderColor = 'var(--line-soft)';
              }
            }}
          >
            <div style={{ fontSize: 18, color: 'var(--neon-violet)', marginBottom: 6 }}>{t.icon}</div>
            <div style={{ marginBottom: 2 }}>{t.label}</div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9,
              color: 'var(--ink-500)', letterSpacing: '0.05em',
              opacity: active === t.id ? 1 : 0.7
            }}>{t.desc}</div>
          </button>
        ))}
      </div>
      <div style={{
        padding: '12px 20px',
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: 'var(--ink-500)', letterSpacing: '0.1em',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span>
          ※ 觸發後脈衝送入 <span style={{ color: 'var(--neon-magenta)' }}>ParamAngle*</span> /{' '}
          <span style={{ color: 'var(--neon-magenta)' }}>BodyAngle*</span>，
          由 Cubism 內建物理運算傳遞至頭髮、配件、衣物
        </span>
        <button onClick={stopAll} className="btn" style={{ padding: '6px 14px', fontSize: 10 }} disabled={!busy}>
          ⊘ 停 止
        </button>
      </div>
    </div>
  );
};

const ParamSliders = ({ canvasRef }) => {
  const params = [
    { id: 'ParamAngleX',    label: '角度 X',  range: [-30, 30],  step: 1,    init: 0 },
    { id: 'ParamAngleY',    label: '角度 Y',  range: [-30, 30],  step: 1,    init: 0 },
    { id: 'ParamAngleZ',    label: '角度 Z',  range: [-30, 30],  step: 1,    init: 0 },
    { id: 'ParamEyeBallX',  label: '眼珠 X',  range: [-1, 1],    step: 0.05, init: 0 },
    { id: 'ParamEyeBallY',  label: '眼珠 Y',  range: [-1, 1],    step: 0.05, init: 0 },
    { id: 'ParamMouthOpenY',label: '張嘴',    range: [0, 1],     step: 0.05, init: 0 },
    { id: 'ParamMouthForm', label: '嘴型',    range: [-1, 1],    step: 0.05, init: 0 },
    { id: 'ParamCheek',     label: '臉頰泛紅',range: [0, 1],     step: 0.05, init: 0 },
    { id: 'ParamBodyAngleX',label: '身體 X',  range: [-10, 10],  step: 1,    init: 0 },
    { id: 'ParamBodyAngleZ',label: '身體 Z',  range: [-10, 10],  step: 1,    init: 0 },
  ];
  const [vals, setVals] = React.useState(
    Object.fromEntries(params.map(p => [p.id, p.init]))
  );

  const handleChange = (id, v) => {
    setVals(s => ({ ...s, [id]: v }));
    canvasRef.current?.setParam(id, v);
  };

  const reset = () => {
    setVals(Object.fromEntries(params.map(p => [p.id, p.init])));
    params.forEach(p => canvasRef.current?.clearParam(p.id));
  };

  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
        fontFamily: 'var(--font-mono)', fontSize: 11
      }}>
        {params.map((p, i) => (
          <div key={p.id} style={{
            padding: 14,
            borderRight: i % 2 !== 1 ? '1px solid var(--line-soft)' : 'none',
            borderBottom: i < params.length - 2 ? '1px solid var(--line-soft)' : 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'baseline' }}>
              <div>
                <div style={{ color: 'var(--neon-magenta)', fontSize: 11 }}>{p.id}</div>
                <div style={{ color: 'var(--ink-300)', fontSize: 10, fontFamily: 'var(--font-serif)' }}>{p.label}</div>
              </div>
              <span style={{ color: 'var(--neon-cyan)', fontSize: 11 }}>
                {Number(vals[p.id]).toFixed(p.step < 1 ? 2 : 0)}
              </span>
            </div>
            <input
              type="range"
              min={p.range[0]} max={p.range[1]} step={p.step}
              value={vals[p.id]}
              onChange={e => handleChange(p.id, parseFloat(e.target.value))}
              style={{
                width: '100%', WebkitAppearance: 'none',
                height: 2, background: 'var(--line-strong)',
                outline: 'none', cursor: 'pointer'
              }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginTop: 4, color: 'var(--ink-700)', fontSize: 9
            }}>
              <span>{p.range[0]}</span><span>{p.range[1]}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{
        padding: 14, borderTop: '1px solid var(--line-soft)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: 'var(--ink-500)', letterSpacing: '0.1em'
        }}>
          ※ 拖動滑桿即時驅動真模型 · 與滑鼠追蹤共存（最後輸入優先）
        </div>
        <button onClick={reset} className="btn" style={{ padding: '6px 14px', fontSize: 10 }}>
          ↺ 重置全部
        </button>
      </div>
    </div>
  );
};

window.Modeling = Modeling;
