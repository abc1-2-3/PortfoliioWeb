// Webcam motion-capture demo — drives the real Live2D model via tracked params.
// Heuristic face tracker (no ML model dependency): downsample → motion delta
// centroid + skin-tone centroid → map to head angle, eye gaze, mouth open.
const WebcamDemo = () => {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);   // sampling canvas
  const modelRef = React.useRef(null);    // Live2DCanvas ref
  const [status, setStatus] = React.useState('idle');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [params, setParams] = React.useState({
    angleX: 0, angleY: 0, angleZ: 0,
    eyeOpen: 1, mouthOpen: 0, breath: 0.5,
  });
  const [smoothing, setSmoothing] = React.useState(0.15);
  const [mirror, setMirror] = React.useState(true);
  const lastFrame = React.useRef(null);
  const motionRef = React.useRef({ x: 32, y: 24, energy: 0 });
  const [modelMounted, setModelMounted] = React.useState(false);
  const [view, setView] = React.useState('upper');

  const changeView = (v) => {
    setView(v);
    modelRef.current?.setView(v);
  };

  const start = async () => {
    setStatus('requesting');
    setModelMounted(true);  // mount Live2D canvas only on first start
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus('live');
      }
    } catch (e) {
      setStatus(e.name === 'NotAllowedError' ? 'denied' : 'error');
      setErrorMsg(e.message || 'unknown error');
    }
  };

  const stop = () => {
    const v = videoRef.current;
    if (v && v.srcObject) {
      v.srcObject.getTracks().forEach(t => t.stop());
      v.srcObject = null;
    }
    modelRef.current?.clearAllParams();
    setStatus('idle');
  };

  React.useEffect(() => {
    if (status !== 'live') return;
    let raf, t = 0;
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    const W = 64, H = 48;
    c.width = W; c.height = H;

    const tick = () => {
      try {
        ctx.save();
        if (mirror) { ctx.translate(W, 0); ctx.scale(-1, 1); }
        ctx.drawImage(v, 0, 0, W, H);
        ctx.restore();

        const frame = ctx.getImageData(0, 0, W, H);

        let totalE = 0, sumX = 0, sumY = 0;
        if (lastFrame.current) {
          for (let i = 0; i < frame.data.length; i += 4) {
            const dr = Math.abs(frame.data[i] - lastFrame.current[i]);
            const dg = Math.abs(frame.data[i+1] - lastFrame.current[i+1]);
            const db = Math.abs(frame.data[i+2] - lastFrame.current[i+2]);
            const e = dr + dg + db;
            if (e > 30) {
              const px = (i / 4) % W;
              const py = Math.floor((i / 4) / W);
              sumX += px * e; sumY += py * e;
              totalE += e;
            }
          }
        }
        lastFrame.current = new Uint8ClampedArray(frame.data);

        // Skin-cluster centroid as fallback
        let faceX = 0, faceY = 0, faceN = 0;
        for (let py = 5; py < H - 5; py++) {
          for (let px = 5; px < W - 5; px++) {
            const i = (py * W + px) * 4;
            const r = frame.data[i], g = frame.data[i+1], b = frame.data[i+2];
            const lum = (r + g + b) / 3;
            const isSkin = lum > 60 && lum < 220 && r > b && r > g * 0.85;
            if (isSkin) { faceX += px; faceY += py; faceN++; }
          }
        }
        if (faceN > 10) { faceX /= faceN; faceY /= faceN; }
        else { faceX = W / 2; faceY = H / 2; }

        if (totalE > 1000) {
          motionRef.current.x = sumX / totalE;
          motionRef.current.y = sumY / totalE;
          motionRef.current.energy = totalE / (W * H);
        } else {
          motionRef.current.energy *= 0.9;
        }

        const useX = motionRef.current.energy > 0.5 ? motionRef.current.x : faceX;
        const useY = motionRef.current.energy > 0.5 ? motionRef.current.y : faceY;

        // mouth-open heuristic: darkness in lower-center
        let mouth = 0;
        const my = Math.floor(H * 0.7), mxStart = Math.floor(W * 0.42), mxEnd = Math.floor(W * 0.58);
        for (let px = mxStart; px < mxEnd; px++) {
          const i = (my * W + px) * 4;
          const lum = (frame.data[i] + frame.data[i+1] + frame.data[i+2]) / 3;
          mouth += (255 - lum);
        }
        mouth = Math.max(0, Math.min(1, (mouth / (mxEnd - mxStart) - 80) / 100));

        // map face position to angles. Center face → 0; edges → ±30/±25
        const targetAngleY = ((W / 2 - useX) / (W / 2)) * 30;  // horizontal head turn
        const targetAngleX = ((H / 2 - useY) / (H / 2)) * 25;  // vertical head tilt
        const targetAngleZ = Math.sin(t) * 4;                  // gentle Z sway

        t += 0.016;
        const breath = 0.5 + Math.sin(t * 1.5) * 0.5;
        const k = smoothing;

        setParams(p => {
          const next = {
            angleX: p.angleX + (targetAngleX - p.angleX) * k,
            angleY: p.angleY + (targetAngleY - p.angleY) * k,
            angleZ: p.angleZ + (targetAngleZ - p.angleZ) * 0.05,
            eyeOpen: 1 - Math.max(0, motionRef.current.energy * 0.3 - 0.4),
            mouthOpen: p.mouthOpen + (mouth - p.mouthOpen) * 0.3,
            breath,
          };

          // drive Live2D model
          const m = modelRef.current;
          if (m) {
            m.setParam('ParamAngleX', next.angleY);  // note: webcam X→model angleY (head turn left/right)
            m.setParam('ParamAngleY', next.angleX);
            m.setParam('ParamAngleZ', next.angleZ);
            m.setParam('ParamBodyAngleX', next.angleY * 0.3);
            m.setParam('ParamBodyAngleY', next.angleX * 0.3);
            m.setParam('ParamBodyAngleZ', next.angleZ * 0.5);
            m.setParam('ParamEyeBallX', (next.angleY / 30) * 0.8);
            m.setParam('ParamEyeBallY', (next.angleX / 25) * 0.6);
            m.setParam('ParamMouthOpenY', next.mouthOpen);
          }
          return next;
        });
      } catch (e) { /* video not ready, retry */ }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status, mirror, smoothing]);

  return (
    <section className="page" id="webcam" data-screen-label="06 Webcam">
      <div className="section-eyebrow"><span className="idx">06</span> <span>motion.capture</span></div>
      <h2 className="section-title">親手試試 · 動態捕捉<br/><span style={{ color: 'var(--ink-500)', fontSize: '0.5em', letterSpacing: '0.3em' }}>WEBCAM · DEMO</span></h2>
      <div className="section-subtitle">// 用你自己的鏡頭驅動真模型 · 資料不會離開瀏覽器</div>

      <div className="webcam-layout">
        {/* Camera feed */}
        <div className="webcam-feed">
          <video ref={videoRef} muted playsInline style={{ transform: mirror ? 'scaleX(-1)' : 'none' }}/>
          <canvas ref={canvasRef} style={{ display: 'none' }}/>

          {status !== 'live' && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 16, padding: 20, textAlign: 'center'
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'var(--neon-violet)', letterSpacing: '0.3em', marginBottom: 4
              }}>◇ CAMERA · STANDBY</div>
              {status === 'idle' && (
                <>
                  <p style={{
                    fontFamily: 'var(--font-serif)', fontSize: 14,
                    color: 'var(--ink-300)', maxWidth: 280, lineHeight: 1.7
                  }}>
                    點擊下方按鈕，授權瀏覽器使用你的鏡頭。<br/>
                    <span style={{ color: 'var(--ink-500)', fontSize: 12 }}>影像僅在本機處理。</span>
                  </p>
                  <button onClick={start} className="btn primary">▶ 啟動鏡頭</button>
                </>
              )}
              {status === 'requesting' && <p className="mono" style={{ color: 'var(--neon-amber)' }}>requesting permission...</p>}
              {status === 'denied' && (
                <>
                  <p style={{ color: 'var(--neon-rose)', fontFamily: 'var(--font-serif)' }}>
                    ⚠ 權限被拒絕，請在網址列重新允許後刷新。
                  </p>
                  <button onClick={start} className="btn">↺ 重試</button>
                </>
              )}
              {status === 'error' && (
                <>
                  <p style={{ color: 'var(--neon-rose)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>× {errorMsg}</p>
                  <button onClick={start} className="btn">↺ 重試</button>
                </>
              )}
            </div>
          )}

          {status === 'live' && (
            <>
              <div className="webcam-status live"><span className="dot"/> LIVE · TRACKING</div>
              <div className="scan"/>
              <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
                <button onClick={() => setMirror(m => !m)} className="btn" style={{ padding: '6px 10px', fontSize: 9 }}>
                  {mirror ? '◐ MIRROR' : '◑ DIRECT'}
                </button>
                <button onClick={stop} className="btn" style={{ padding: '6px 10px', fontSize: 9 }}>
                  ⊘ STOP
                </button>
              </div>

              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <g transform={`translate(${(motionRef.current.x / 64) * 100}%, ${(motionRef.current.y / 48) * 100}%)`}>
                  <circle r="40" fill="none" stroke="rgba(34,211,238,0.6)" strokeWidth="1" strokeDasharray="3 3"/>
                  <circle r="3" fill="rgba(34,211,238,0.9)"/>
                  <line x1="-50" y1="0" x2="-10" y2="0" stroke="rgba(34,211,238,0.6)"/>
                  <line x1="10" y1="0" x2="50" y2="0" stroke="rgba(34,211,238,0.6)"/>
                  <line x1="0" y1="-50" x2="0" y2="-10" stroke="rgba(34,211,238,0.6)"/>
                  <line x1="0" y1="10" x2="0" y2="50" stroke="rgba(34,211,238,0.6)"/>
                </g>
              </svg>
            </>
          )}
        </div>

        {/* Live model mirror */}
        <div className="webcam-output">
          <div style={{
            position: 'absolute', top: 12, left: 12, zIndex: 5,
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--neon-magenta)', letterSpacing: '0.2em',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--neon-magenta)',
              boxShadow: '0 0 8px var(--neon-magenta)',
              animation: status === 'live' ? 'pulse 1.4s infinite' : 'none'
            }}/>
            MODEL · MIRROR
          </div>

          {modelMounted ? (
            <>
              <Live2DCanvas ref={modelRef} fitScale={0.95} yOffset={0} initialView="upper"/>
              <div style={{
                position: 'absolute', top: 12, right: 12, zIndex: 6,
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
            </>
          ) : (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 12,
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--neon-violet)', letterSpacing: '0.25em',
              textAlign: 'center', pointerEvents: 'none'
            }}>
              <div style={{ fontSize: 32, opacity: 0.5 }}>◇</div>
              <div>MODEL · STANDBY</div>
              <div style={{ fontSize: 9, color: 'var(--ink-500)', maxWidth: 200, lineHeight: 1.6 }}>
                點擊左側「啟動鏡頭」後<br/>
                真模型才會被召喚至此
              </div>
            </div>
          )}

          <div style={{
            position: 'absolute', bottom: 12, left: 12, right: 12, zIndex: 5,
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: 'var(--ink-500)', letterSpacing: '0.1em',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4,
            pointerEvents: 'none'
          }}>
            <span>AngleX <span style={{ color: 'var(--neon-cyan)' }}>{params.angleX.toFixed(1)}</span></span>
            <span>AngleY <span style={{ color: 'var(--neon-cyan)' }}>{params.angleY.toFixed(1)}</span></span>
            <span>Mouth <span style={{ color: 'var(--neon-cyan)' }}>{params.mouthOpen.toFixed(2)}</span></span>
            <span>Energy <span style={{ color: 'var(--neon-cyan)' }}>{motionRef.current.energy.toFixed(2)}</span></span>
          </div>
        </div>
      </div>

      {/* Pipeline log + smoothing slider */}
      <div className="panel" style={{ marginTop: 24, padding: 0 }}>
        <div className="term-bar">
          <div className="dots"><span/><span/><span/></div>
          <div>tracking_pipeline.log</div>
          <div style={{ color: status === 'live' ? 'var(--neon-magenta)' : 'var(--ink-500)' }}>
            {status === 'live' ? '● RECORDING' : '○ standby'}
          </div>
        </div>
        <div style={{
          padding: 20, fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--ink-500)', letterSpacing: '0.05em', lineHeight: 1.9
        }}>
          <div><span style={{ color: 'var(--neon-violet)' }}>{'>'}</span> getUserMedia({'{'} video: 640×480 {'}'})</div>
          <div><span style={{ color: 'var(--neon-violet)' }}>{'>'}</span> downsample frame → 64×48</div>
          <div><span style={{ color: 'var(--neon-violet)' }}>{'>'}</span> motion delta centroid + skin-tone cluster</div>
          <div><span style={{ color: 'var(--neon-violet)' }}>{'>'}</span> map → ParamAngleX/Y/Z, ParamBodyAngle*, ParamEyeBall*, ParamMouthOpenY</div>
          <div><span style={{ color: 'var(--neon-cyan)' }}>{'>'}</span> drive <span style={{ color: 'var(--neon-magenta)' }}>wuyan.moc3</span>{' '}
            <span style={{ color: 'var(--ink-700)' }}>(pixi-live2d-display)</span>
          </div>

          <div style={{
            marginTop: 16, paddingTop: 16,
            borderTop: '1px solid var(--line-soft)',
            display: 'flex', alignItems: 'center', gap: 16
          }}>
            <span style={{ color: 'var(--neon-violet)', letterSpacing: '0.15em' }}>SMOOTHING</span>
            <input
              type="range" min="0.05" max="0.5" step="0.01"
              value={smoothing}
              onChange={e => setSmoothing(parseFloat(e.target.value))}
              style={{ flex: 1, WebkitAppearance: 'none', height: 2, background: 'var(--line-strong)' }}
            />
            <span style={{ color: 'var(--neon-cyan)', minWidth: 40 }}>{smoothing.toFixed(2)}</span>
          </div>

          <div style={{ marginTop: 12, color: 'var(--neon-amber)' }}>
            ※ 隱私聲明：影像僅在本機處理，不會上傳任何伺服器。
          </div>
        </div>
      </div>
    </section>
  );
};

window.WebcamDemo = WebcamDemo;
