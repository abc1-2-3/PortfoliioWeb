// 全息撲克牌主程式

const { useState, useRef, useEffect, useMemo, useCallback } = React;

const ALL_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const ALL_SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];

const SUIT_LABELS = {
  spades: { name: '黑桃 Spades', symbol: '♠' },
  hearts: { name: '紅心 Hearts', symbol: '♥' },
  diamonds: { name: '方塊 Diamonds', symbol: '♦' },
  clubs: { name: '梅花 Clubs', symbol: '♣' },
};

function buildDeck(suitFilter = null) {
  const cards = [];
  const suits = suitFilter ? [suitFilter] : ALL_SUITS;
  for (const suit of suits) {
    for (const rank of ALL_RANKS) {
      cards.push({ rank, suit, id: `${rank}-${suit}` });
    }
  }
  if (!suitFilter) {
    cards.push({ joker: 'red', id: 'joker-red' });
    cards.push({ joker: 'black', id: 'joker-black' });
  }
  return cards;
}

// 持久化設定
const DEFAULTS = {
  holoHue: 280,
  holoIntensity: 1,
  holoScale: 1,
  noiseOpacity: 0.12,
  glowIntensity: 1,
  specularSize: 1,
  cardBg: '#fafaf7',
  redColor: '#c1272d',
  darkColor: '#1a1a1a',
  backDesign: 'lattice',
  backAccent: '#8b1538',
  selectedSuit: 'all',
  tiltMax: 22,
};

function useSettings() {
  const [s, setS] = useState(() => {
    try {
      const raw = localStorage.getItem('hc:settings');
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch { return DEFAULTS; }
  });
  useEffect(() => {
    try { localStorage.setItem('hc:settings', JSON.stringify(s)); } catch {}
  }, [s]);
  const set = (k, v) => setS((p) => ({ ...p, [k]: v }));
  return [s, set];
}

function App() {
  const [s, set] = useSettings();
  const [activeCard, setActiveCard] = useState({ rank: 'A', suit: 'spades' });
  const [showBack, setShowBack] = useState(false);
  const [mode, setMode] = useState('hero');

  const [faceImages, setFaceImages] = useState(() => {
    try { const r = localStorage.getItem('hc:faces'); return r ? JSON.parse(r) : {}; }
    catch { return {}; }
  });
  const [commonBackImage, setCommonBackImage] = useState(() => {
    try { return localStorage.getItem('hc:commonBack') || null; } catch { return null; }
  });

  useEffect(() => {
    try { localStorage.setItem('hc:faces', JSON.stringify(faceImages)); } catch {}
  }, [faceImages]);
  useEffect(() => {
    try {
      if (commonBackImage) localStorage.setItem('hc:commonBack', commonBackImage);
      else localStorage.removeItem('hc:commonBack');
    } catch {}
  }, [commonBackImage]);

  useEffect(() => {
    document.documentElement.style.setProperty('--card-red', s.redColor);
    document.documentElement.style.setProperty('--card-dark', s.darkColor);
  }, [s.redColor, s.darkColor]);

  const deck = useMemo(
    () => buildDeck(s.selectedSuit === 'all' ? null : s.selectedSuit),
    [s.selectedSuit]
  );

  const holoProps = {
    holoHue: s.holoHue,
    holoIntensity: s.holoIntensity,
    holoScale: s.holoScale,
    noiseOpacity: s.noiseOpacity,
    glowIntensity: s.glowIntensity,
    specularSize: s.specularSize,
    cardBg: s.cardBg,
    tiltMax: s.tiltMax,
    backDesign: s.backDesign,
    backAccent: s.backAccent,
    commonBackImage,
    faceImages,
  };

  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <div className={`app-root ${panelOpen ? 'with-panel' : ''}`}>
      <aside className={`side-panel ${panelOpen ? 'open' : 'closed'}`}>
        <div className="panel-head">
          <div className="brand">
            <span className="brand-mark">◆</span>
            <div className="brand-text">
              <span className="brand-zh">全息撲克牌</span>
              <span className="brand-en">Holo Deck Studio</span>
            </div>
          </div>
          <button className="panel-toggle" onClick={() => setPanelOpen(false)} aria-label="收合">×</button>
        </div>
        <div className="panel-body">
          <ControlsPanel
            s={s}
            set={set}
            faceImages={faceImages}
            setFaceImages={setFaceImages}
            commonBackImage={commonBackImage}
            setCommonBackImage={setCommonBackImage}
          />
        </div>
      </aside>

      {!panelOpen && (
        <button className="reveal-panel" onClick={() => setPanelOpen(true)} aria-label="展開控制">
          <span>◆</span><span>控制台 Controls</span>
        </button>
      )}

      <div className="main-col">
        <header className="topbar">
          <div className="mode-toggle">
            <button className={mode === 'hero' ? 'active' : ''} onClick={() => setMode('hero')}>
              單張預覽 <em>Single</em>
            </button>
            <button className={mode === 'deck' ? 'active' : ''} onClick={() => setMode('deck')}>
              全部牌組 <em>All Cards</em>
            </button>
          </div>
          <div className="actions">
            <button className="ghost" onClick={() => setShowBack((x) => !x)}>
              {showBack ? '翻回牌面 Show Front' : '翻到卡背 Show Back'}
            </button>
            <DownloadButton deck={buildDeck(null)} holoProps={holoProps} />
          </div>
        </header>

        <main className={`stage ${mode}`}>
          {mode === 'hero' ? (
            <HeroView card={activeCard} setCard={setActiveCard} showBack={showBack} holoProps={holoProps} />
          ) : (
            <DeckView
              deck={deck}
              holoProps={holoProps}
              onPick={(c) => { setActiveCard(c); setMode('hero'); setShowBack(false); }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// ============= 主舞台 =============

function HeroView({ card, setCard, showBack, holoProps }) {
  const idx = ALL_RANKS.indexOf(card.rank);
  const suitIdx = ALL_SUITS.indexOf(card.suit);

  const cycle = (dir) => {
    if (card.joker) { setCard({ rank: 'A', suit: 'spades' }); return; }
    let i = idx + dir, sx = suitIdx;
    if (i >= ALL_RANKS.length) { i = 0; sx = (sx + 1) % 4; }
    if (i < 0) { i = ALL_RANKS.length - 1; sx = (sx + 3) % 4; }
    setCard({ rank: ALL_RANKS[i], suit: ALL_SUITS[sx] });
  };

  const label = card.joker
    ? `${card.joker === 'red' ? '紅' : '黑'} 鬼牌`
    : `${SUIT_LABELS[card.suit].name} ${card.rank}`;

  return (
    <div className="hero">
      <button className="nav-arrow" onClick={() => cycle(-1)} aria-label="上一張">‹</button>
      <div className="hero-center">
        <HoloCard card={card} showBack={showBack} size="lg" {...holoProps} />
        <div className="card-label">{label}</div>
        <div className="hero-hint">滑鼠移動感受光澤 · 按住卡片可拖曳旋轉 — Move to shimmer · Drag to rotate</div>
      </div>
      <button className="nav-arrow" onClick={() => cycle(1)} aria-label="下一張">›</button>
    </div>
  );
}

function DeckView({ deck, holoProps, onPick }) {
  const grouped = useMemo(() => {
    const out = { spades: [], hearts: [], diamonds: [], clubs: [], joker: [] };
    for (const c of deck) {
      if (c.joker) out.joker.push(c);
      else out[c.suit].push(c);
    }
    return out;
  }, [deck]);

  const rows = [];
  for (const suit of ALL_SUITS) {
    if (grouped[suit].length === 0) continue;
    rows.push({ label: SUIT_LABELS[suit].name, suit, cards: grouped[suit] });
  }
  if (grouped.joker.length) rows.push({ label: '鬼牌 Jokers', suit: 'joker', cards: grouped.joker });

  return (
    <div className="deck-view">
      {rows.map((row) => (
        <div key={row.suit} className="deck-row">
          <div className="row-label">
            <span className="row-symbol" style={{
              color: row.suit === 'hearts' || row.suit === 'diamonds' ? 'var(--card-red)' : '#e8e6e1',
            }}>
              {row.suit === 'joker' ? '★' : SUIT_LABELS[row.suit].symbol}
            </span>
            <span>{row.label}</span>
            <span className="row-count">{row.cards.length} 張</span>
          </div>
          <div className="row-cards">
            {row.cards.map((c) => (
              <HoloCard
                key={c.id}
                card={c}
                size="sm"
                interactive
                enableDrag={false}
                onClick={() => onPick(c)}
                {...holoProps}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============= 控制器 =============

function Field({ label, value, children }) {
  return (
    <div className="ctl-field">
      <div className="ctl-label">
        <span>{label}</span>
        {value !== undefined && <span className="ctl-value">{value}</span>}
      </div>
      {children}
    </div>
  );
}

function Slider({ label, value, min, max, step = 1, unit = '', onChange, format }) {
  const display = format ? format(value) : `${typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(2)) : value}${unit}`;
  return (
    <Field label={label} value={display}>
      <input
        type="range"
        className="ctl-slider"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}

function ColorOptions({ label, value, options, onChange }) {
  return (
    <Field label={label}>
      <div className="swatch-row">
        {options.map((c) => (
          <button
            key={c}
            className={`swatch ${value === c ? 'active' : ''}`}
            style={{ background: c }}
            onClick={() => onChange(c)}
            title={c}
          />
        ))}
      </div>
    </Field>
  );
}

function SuitFilter({ value, onChange }) {
  const opts = [
    { v: 'all', label: '全部' },
    { v: 'spades', label: '♠', red: false },
    { v: 'hearts', label: '♥', red: true },
    { v: 'diamonds', label: '♦', red: true },
    { v: 'clubs', label: '♣', red: false },
  ];
  return (
    <Field label="顯示花色 Filter">
      <div className="seg-row">
        {opts.map((o) => (
          <button
            key={o.v}
            className={`seg ${value === o.v ? 'active' : ''}`}
            onClick={() => onChange(o.v)}
            style={o.red ? { color: '#e87080' } : {}}
          >
            {o.label}
          </button>
        ))}
      </div>
    </Field>
  );
}

function ControlsPanel({ s, set, faceImages, setFaceImages, commonBackImage, setCommonBackImage }) {
  return (
    <>
      <section className="ctl-section">
        <h3><span>光澤效果</span><em>Holo Foil</em></h3>
        <Slider label="主色相 Hue" value={s.holoHue} min={0} max={360} step={1} unit="°" onChange={(v) => set('holoHue', v)} />
        <Slider label="光澤強度 Intensity" value={s.holoIntensity} min={0} max={2} step={0.05} onChange={(v) => set('holoIntensity', v)} />
        <Slider label="紋路密度 Pattern" value={s.holoScale} min={0.3} max={3} step={0.1} onChange={(v) => set('holoScale', v)} />
        <Slider label="高光範圍 Specular" value={s.specularSize} min={0.3} max={2.5} step={0.1} onChange={(v) => set('specularSize', v)} />
        <Slider label="外發光 Glow" value={s.glowIntensity} min={0} max={2} step={0.05} onChange={(v) => set('glowIntensity', v)} />
        <Slider label="雜訊紋理 Noise" value={s.noiseOpacity} min={0} max={0.4} step={0.01} onChange={(v) => set('noiseOpacity', v)} />
        <Slider label="3D 視差角度 Tilt" value={s.tiltMax} min={0} max={40} step={1} unit="°" onChange={(v) => set('tiltMax', v)} />
      </section>

      <section className="ctl-section">
        <h3><span>顏色</span><em>Colors</em></h3>
        <ColorOptions label="卡片底色 Card BG" value={s.cardBg}
          options={['#fafaf7', '#f3ecd9', '#0f1115', '#1c1a2e', '#fff5e6']}
          onChange={(v) => set('cardBg', v)} />
        <ColorOptions label="紅色花色 Red Suit" value={s.redColor}
          options={['#c1272d', '#e84a5f', '#d4145a', '#b8002e']}
          onChange={(v) => set('redColor', v)} />
        <ColorOptions label="黑色花色 Dark Suit" value={s.darkColor}
          options={['#1a1a1a', '#0d1b2a', '#1c1f3a', '#2d1810']}
          onChange={(v) => set('darkColor', v)} />
      </section>

      <section className="ctl-section">
        <h3><span>花色 / 牌組</span><em>Suit / Deck</em></h3>
        <SuitFilter value={s.selectedSuit} onChange={(v) => set('selectedSuit', v)} />
      </section>

      <section className="ctl-section">
        <h3><span>卡背圖樣</span><em>Card Back</em></h3>
        <BackDesignPicker value={s.backDesign} accent={s.backAccent} onChange={(v) => set('backDesign', v)} />
        <ColorOptions label="卡背主色 Accent" value={s.backAccent}
          options={['#8b1538', '#1e3a5f', '#1f4d3a', '#3d1b5f', '#5c3a1f', '#2a2a2a']}
          onChange={(v) => set('backAccent', v)} />
      </section>

      <section className="ctl-section">
        <h3><span>圖片上傳</span><em>Image Upload</em></h3>
        <ImageUploader
          label="共同卡背圖 Custom Back"
          value={commonBackImage}
          onChange={setCommonBackImage}
          hint="覆蓋預設卡背 — overrides preset"
        />
        <div className="ctl-label" style={{ marginTop: 12 }}>
          <span>J / Q / K / 鬼牌 Face Cards</span>
          <span className="ctl-value">點擊上傳 · click to upload</span>
        </div>
        <FaceImageGrid faceImages={faceImages} setFaceImages={setFaceImages} />
      </section>
    </>
  );
}

function BackDesignPicker({ value, onChange, accent }) {
  const designs = [
    { id: 'lattice', name: '格紋 Lattice' },
    { id: 'diamond', name: '菱格 Diamond' },
    { id: 'rose', name: '玫瑰 Rose' },
    { id: 'waves', name: '波紋 Waves' },
    { id: 'stars', name: '星辰 Stars' },
    { id: 'grid', name: '網格 Grid' },
  ];
  return (
    <Field label="預設圖樣 Preset">
      <div className="back-grid">
        {designs.map((d) => (
          <button key={d.id}
            type="button"
            className={`back-thumb ${value === d.id ? 'active' : ''}`}
            onClick={() => onChange(d.id)}
            title={d.name}
          >
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <CardBack design={d.id} accent={accent} />
            </div>
            <span className="back-thumb-label">{d.name}</span>
          </button>
        ))}
      </div>
    </Field>
  );
}

function ImageUploader({ label, value, onChange, hint }) {
  const inputRef = useRef(null);
  const handleFile = (file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = (e) => onChange(e.target.result);
    r.readAsDataURL(file);
  };
  return (
    <div className="uploader">
      <div className="ctl-label"><span>{label}</span></div>
      <div className="uploader-drop"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
      >
        {value ? (
          <>
            <img src={value} alt="" />
            <button type="button" className="uploader-clear" onClick={(e) => { e.stopPropagation(); onChange(null); }}>×</button>
          </>
        ) : (
          <div className="uploader-empty">
            <div className="plus">＋</div>
            <div className="uploader-hint">{hint || '點擊或拖曳圖片'}</div>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => { handleFile(e.target.files[0]); e.target.value = ''; }} />
      </div>
    </div>
  );
}

function FaceImageGrid({ faceImages, setFaceImages }) {
  const faces = [];
  for (const suit of ALL_SUITS) {
    for (const rank of ['J', 'Q', 'K']) {
      faces.push({
        key: `${rank}-${suit}`,
        label: `${SUIT_LABELS[suit].symbol}${rank}`,
        red: suit === 'hearts' || suit === 'diamonds',
      });
    }
  }
  faces.push({ key: 'joker-red', label: '鬼紅', red: true });
  faces.push({ key: 'joker-black', label: '鬼黑', red: false });

  const inputRef = useRef(null);
  const [target, setTarget] = useState(null);

  const onPick = (key) => {
    setTarget(key);
    setTimeout(() => inputRef.current?.click(), 0);
  };

  const handleFile = (file) => {
    if (!file || !target) return;
    const r = new FileReader();
    r.onload = (e) => setFaceImages((p) => ({ ...p, [target]: e.target.result }));
    r.readAsDataURL(file);
  };

  return (
    <div className="face-grid">
      {faces.map((f) => (
        <button key={f.key}
          type="button"
          className={`face-slot ${faceImages[f.key] ? 'filled' : ''} ${f.red ? 'red' : ''}`}
          onClick={() => onPick(f.key)}
          onContextMenu={(e) => {
            e.preventDefault();
            if (faceImages[f.key]) setFaceImages((p) => { const x = { ...p }; delete x[f.key]; return x; });
          }}
          title={`${f.label}${faceImages[f.key] ? ' · 右鍵清除' : ''}`}
        >
          {faceImages[f.key] ? <img src={faceImages[f.key]} alt="" /> : <span>{f.label}</span>}
        </button>
      ))}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => { handleFile(e.target.files[0]); e.target.value = ''; }} />
    </div>
  );
}

// ============= 下載 =============

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if ([...document.scripts].some((sc) => sc.src === src)) { resolve(); return; }
    const sc = document.createElement('script');
    sc.src = src; sc.onload = resolve; sc.onerror = reject;
    document.head.appendChild(sc);
  });
}

function cardFilename(card) {
  if (card.back) return '卡背.png';
  if (card.joker) return `鬼牌-${card.joker === 'red' ? '紅' : '黑'}.png`;
  const suitName = SUIT_LABELS[card.suit].name;
  return `${suitName}-${card.rank}.png`;
}

function DownloadButton({ deck, holoProps }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDownload = async () => {
    if (busy) return;
    setBusy(true);
    setProgress(0);
    try {
      if (!window.html2canvas) await loadScript('https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js');
      if (!window.JSZip) await loadScript('https://unpkg.com/jszip@3.10.1/dist/jszip.min.js');

      const container = document.createElement('div');
      container.style.cssText = 'position:fixed; top:0; left:0; z-index:-9999; pointer-events:none; width:360px;';
      document.body.appendChild(container);

      const zip = new window.JSZip();
      const allCards = [...deck, { back: true, id: 'back' }];

      for (let i = 0; i < allCards.length; i++) {
        const card = allCards[i];
        const node = document.createElement('div');
        container.appendChild(node);
        const root = ReactDOM.createRoot(node);
        await new Promise((res) => {
          root.render(<ExportCard card={card} holoProps={holoProps} onReady={res} />);
        });
        await new Promise((r) => setTimeout(r, 120));
        const target = node.querySelector('.export-card');
        const canvas = await window.html2canvas(target, {
          backgroundColor: holoProps.cardBg, scale: 1.5, logging: false, useCORS: true,
        });
        const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
        zip.file(cardFilename(card), blob);
        root.unmount();
        container.removeChild(node);
        setProgress(((i + 1) / allCards.length) * 100);
      }

      document.body.removeChild(container);
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url; a.download = '全息撲克牌組.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('下載失敗：' + err.message);
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  return (
    <button className="download-btn" onClick={onDownload} disabled={busy}>
      {busy ? (
        <>
          <span className="dl-spinner" />
          匯出中 {Math.round(progress)}%
        </>
      ) : (
        <>
          <span>↓</span> 下載整副牌 Download
        </>
      )}
    </button>
  );
}

function ExportCard({ card, holoProps, onReady }) {
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => onReady && onReady()));
  }, []);

  const { cardBg, backDesign, backAccent, commonBackImage, faceImages } = holoProps;
  const isBack = !!card.back;

  return (
    <div
      className="export-card"
      style={{
        width: 360,
        height: 504,
        position: 'relative',
        borderRadius: '16px',
        background: cardBg,
        overflow: 'hidden',
        containerType: 'inline-size',
      }}
    >
      {isBack ? (
        <CardBack design={backDesign} accent={backAccent} commonImage={commonBackImage} />
      ) : (
        <CardContent
          card={card}
          faceImages={faceImages || {}}
          backDesign={backDesign}
          backAccent={backAccent}
          commonBackImage={commonBackImage}
        />
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
