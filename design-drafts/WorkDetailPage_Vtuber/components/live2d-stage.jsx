// Live2D real-model canvas — self-contained, ref-based API.
// Each <Live2DCanvas ref={r}/> owns its own PIXI app + model instance.
// Parent calls r.current.setParam(id, value), .setExpression(name), .clearParam(id), etc.

const MODEL_PATH = 'assets/live2d/wuyan.model3.json';

const EXPRESSIONS = [
  { name: 'xinxin',     label: '✦', cn: '閃閃眼' },
  { name: 'crycry',     label: '⟁', cn: '哭哭' },
  { name: 'fuwafuwa',   label: '☁', cn: '軟軟' },
  { name: 'petal',      label: '✿', cn: '花瓣' },
  { name: 'loading',    label: '◌', cn: '讀取' },
  { name: 'dazweye',    label: '◉', cn: '呆滯' },
  { name: '芙莉蓮表情', label: '☾', cn: '芙莉蓮' },
  { name: '貓耳',       label: '◑', cn: '貓耳' },
  { name: '骨頭帽子',   label: '✟', cn: '骨頭帽' },
  { name: '藍色頭髮',   label: '✦', cn: '藍髮' },
  { name: '臉黑',       label: '▮', cn: '臉黑' },
  { name: '數學思考',   label: 'Σ', cn: '思考' },
  { name: '手把切換',   label: '◈', cn: '手把' },
  { name: '脫外套',     label: '⌬', cn: '脫外套' },
];

const Live2DCanvas = React.forwardRef(({
  yOffset = 0,
  fitScale = 0.95,
  initialView = 'full',
  onReady,
  style,
}, ref) => {
  const containerRef = React.useRef(null);
  const [status, setStatus] = React.useState('idle'); // idle|loading|ready|error
  const [error, setError] = React.useState(null);
  const overridesRef = React.useRef({});
  const modelRef = React.useRef(null);
  const appRef = React.useRef(null);
  const fitRef = React.useRef(null);
  const viewRef = React.useRef(initialView);  // 'full' | 'upper' | 'face'
  const [activeExpression, setActiveExpression] = React.useState(null);

  // View presets — multiplier on fit scale + Y offset as fraction of canvas height.
  // Negative yFrac moves model UP (PIXI Y axis points down).
  const VIEW_PRESETS = {
    full:  { scale: 1.00, yFrac: 0.00 },
    upper: { scale: 2.20, yFrac: 0.50 },
    face:  { scale: 4.20, yFrac: 1.45 },
  };

  // imperative API for parent
  React.useImperativeHandle(ref, () => ({
    setParam: (id, v) => { overridesRef.current[id] = v; },
    clearParam: (id) => { delete overridesRef.current[id]; },
    clearAllParams: () => { overridesRef.current = {}; },
    setExpression: (name) => {
      const m = modelRef.current;
      if (!m) return;
      try {
        if (name) {
          m.expression(name);
          setActiveExpression(name);
        } else {
          m.internalModel.motionManager.expressionManager?.resetExpression();
          setActiveExpression(null);
        }
      } catch (e) { console.warn('expression failed', e); }
    },
    getActiveExpression: () => activeExpression,
    playMotion: (group = 'Idle') => {
      try { modelRef.current?.motion(group); } catch (e) {}
    },
    refit: () => fitRef.current && fitRef.current(),
    setView: (preset) => {
      if (VIEW_PRESETS[preset]) {
        viewRef.current = preset;
        fitRef.current && fitRef.current();
      }
    },
    getView: () => viewRef.current,
    getModel: () => modelRef.current,
    getStatus: () => status,
  }), [activeExpression, status]);

  React.useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let pollId;
    let ro;

    const mount = async () => {
      const el = containerRef.current;
      if (!el || cancelled) return;
      const w = el.clientWidth, h = el.clientHeight;
      if (w < 20 || h < 20) {
        pollId = setTimeout(mount, 100);
        return;
      }
      if (!window.PIXI || !window.PIXI.live2d) {
        setStatus('error');
        setError('Live2D SDK 未載入');
        return;
      }
      setStatus('loading');
      try {
        const PIXI = window.PIXI;
        const { Live2DModel } = PIXI.live2d;
        Live2DModel.registerTicker(PIXI.Ticker);

        const app = new PIXI.Application({
          width: w, height: h,
          backgroundAlpha: 0, antialias: true, autoDensity: true,
          resolution: window.devicePixelRatio || 1,
          preserveDrawingBuffer: true,
        });
        el.appendChild(app.view);
        app.view.style.width = '100%';
        app.view.style.height = '100%';
        app.view.style.display = 'block';
        appRef.current = app;

        const m = await Live2DModel.from(MODEL_PATH, { autoInteract: false });
        if (cancelled) { app.destroy(true); return; }
        app.stage.addChild(m);
        modelRef.current = m;

        const fit = () => {
          const W = app.renderer.width / app.renderer.resolution;
          const H = app.renderer.height / app.renderer.resolution;
          const bw = m.internalModel.width || m.width || 1;
          const bh = m.internalModel.height || m.height || 1;
          const baseS = Math.min(W / bw, H / bh) * fitScale;
          const view = VIEW_PRESETS[viewRef.current] || VIEW_PRESETS.full;
          m.scale.set(baseS * view.scale);
          m.anchor.set(0.5, 0.5);
          m.x = W / 2;
          m.y = H / 2 + yOffset + H * view.yFrac;
          m.alpha = 1;
          m.visible = true;
        };
        fitRef.current = fit;
        fit();
        setTimeout(fit, 200);
        setTimeout(fit, 600);

        ro = new ResizeObserver(() => {
          const cw = el.clientWidth, ch = el.clientHeight;
          if (cw && ch) {
            app.renderer.resize(cw, ch);
            fit();
          }
        });
        ro.observe(el);

        app.ticker.add(() => {
          const core = m.internalModel?.coreModel;
          if (core) {
            const o = overridesRef.current;
            for (const id in o) {
              try { core.setParameterValueById(id, o[id]); } catch (e) {}
            }
          }
          // Explicit render — PIXI's default render loop isn't kicking in here
          app.renderer.render(app.stage);
        });
        if (!app.ticker.started) app.ticker.start();

        setStatus('ready');
        if (onReady) onReady();
      } catch (e) {
        console.error('Live2D load error:', e);
        setStatus('error');
        setError(e.message || String(e));
      }
    };
    mount();

    return () => {
      cancelled = true;
      if (pollId) clearTimeout(pollId);
      if (ro) ro.disconnect();
      if (appRef.current) {
        try { appRef.current.destroy(true, { children: true }); } catch (e) {}
        appRef.current = null;
      }
      modelRef.current = null;
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div ref={containerRef} style={{
      position: 'relative', width: '100%', height: '100%',
      overflow: 'hidden', ...style
    }}>
      {status === 'loading' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 12,
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--neon-violet)', letterSpacing: '0.25em',
          pointerEvents: 'none', zIndex: 1
        }}>
          <div style={{ animation: 'rune-spin 2s linear infinite', fontSize: 24 }}>◇</div>
          <div>CONJURING MODEL · 召 喚 中</div>
          <div style={{ fontSize: 9, color: 'var(--ink-500)' }}>loading wuyan.moc3 + 3 textures</div>
        </div>
      )}
      {status === 'error' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20,
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--neon-rose)',
          textAlign: 'center', zIndex: 1
        }}>
          ⚠ Live2D 載入失敗<br/>
          <span style={{ fontSize: 9, color: 'var(--ink-500)', marginTop: 8 }}>{error}</span>
        </div>
      )}
    </div>
  );
});

window.Live2DCanvas = Live2DCanvas;
window.LIVE2D_EXPRESSIONS = EXPRESSIONS;
