// 主應用程式 — v3：浮動牌陣選擇 / 右欄僅放牌義 / 底部動作列 / 修正凱爾特重疊點擊
const { useState, useEffect } = React;

function SpreadDiagram({ id, color = "currentColor" }) {
  const stroke = color;
  if (id === "single") return (
    <svg viewBox="0 0 100 78"><rect x="42" y="14" width="16" height="50" rx="1.5" fill="none" stroke={stroke} strokeWidth="1"/></svg>
  );
  if (id === "trinity") return (
    <svg viewBox="0 0 140 78">
      <rect x="14" y="14" width="16" height="50" rx="1.5" fill="none" stroke={stroke} strokeWidth="1"/>
      <rect x="62" y="14" width="16" height="50" rx="1.5" fill="none" stroke={stroke} strokeWidth="1"/>
      <rect x="110" y="14" width="16" height="50" rx="1.5" fill="none" stroke={stroke} strokeWidth="1"/>
    </svg>
  );
  if (id === "core") return (
    <svg viewBox="0 0 180 78">
      <rect x="8"   y="14" width="16" height="50" rx="1.5" fill="none" stroke={stroke} strokeWidth="1"/>
      <rect x="56"  y="14" width="16" height="50" rx="1.5" fill="none" stroke={stroke} strokeWidth="1"/>
      <rect x="104" y="14" width="16" height="50" rx="1.5" fill="none" stroke={stroke} strokeWidth="1"/>
      <rect x="152" y="14" width="16" height="50" rx="1.5" fill="none" stroke={stroke} strokeWidth="1"/>
    </svg>
  );
  if (id === "celtic") return (
    <svg viewBox="0 0 200 100">
      <rect x="44" y="36" width="14" height="28" rx="1.2" fill="none" stroke={stroke} strokeWidth="0.9"/>
      <rect x="40" y="42" width="22" height="16" rx="1.2" fill="none" stroke={stroke} strokeWidth="0.9" transform="rotate(90 51 50)"/>
      <rect x="44" y="72" width="14" height="20" rx="1.2" fill="none" stroke={stroke} strokeWidth="0.9"/>
      <rect x="24" y="36" width="14" height="28" rx="1.2" fill="none" stroke={stroke} strokeWidth="0.9"/>
      <rect x="44" y="8"  width="14" height="20" rx="1.2" fill="none" stroke={stroke} strokeWidth="0.9"/>
      <rect x="68" y="36" width="14" height="28" rx="1.2" fill="none" stroke={stroke} strokeWidth="0.9"/>
      {[6, 30, 54, 78].map((y, i) => (
        <rect key={i} x="110" y={y} width="14" height="18" rx="1.2" fill="none" stroke={stroke} strokeWidth="0.9"/>
      ))}
    </svg>
  );
  return null;
}

function shuffleDeck() {
  const deck = ARCANA.map(c => ({ card: c, reversed: Math.random() < 0.28 }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function App() {
  const tweaks = window.useTweaks ? window.useTweaks(window.__TAROT_TWEAKS_DEFAULTS__) : [window.__TAROT_TWEAKS_DEFAULTS__, () => {}];
  const [t, setTweak] = tweaks;

  const [spreadId, setSpreadId] = useState("trinity");
  const [phase, setPhase] = useState("ready");       // ready | shuffle | reading
  const [draws, setDraws] = useState([]);
  const [activeIdx, setActiveIdx] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const spread = SPREADS[spreadId];
  const hasDraws = draws.length > 0;
  const flippedCount = draws.filter(d => d.flipped).length;
  const allFlipped = hasDraws && flippedCount === draws.length;

  function pickSpread(id) {
    setSpreadId(id);
    setDraws([]);
    setActiveIdx(null);
    setPhase("ready");
  }

  function startDraw() {
    setPhase("shuffle");
    setActiveIdx(null);
    setPanelOpen(false);
    const deck = shuffleDeck();
    const count = SPREADS[spreadId].count;
    const picked = deck.slice(0, count).map(d => ({ ...d, flipped: false }));
    setTimeout(() => {
      setDraws(picked);
      setPhase("reading");
    }, 2200);
  }

  function handleCardClick(idx) {
    setDraws(prev => prev.map((d, i) => i === idx ? { ...d, flipped: true } : d));
  }

  function handleCardDoubleClick(idx) {
    setDraws(prev => prev.map((d, i) => i === idx ? { ...d, flipped: true } : d));
    setActiveIdx(idx);
    setPanelOpen(true);
  }

  function flipAll() {
    setDraws(prev => prev.map(d => ({ ...d, flipped: true })));
  }

  function resetBoard() {
    setDraws([]);
    setActiveIdx(null);
    setPanelOpen(false);
    setPhase("ready");
  }

  const cardSize = spreadId === "celtic" ? 0.78 : 1.0;

  return (
    <>
      <div className="stage">
        <div className="stars" />
        <div className="stars-2" />
        {t.starsExtra && <div className="stars-3" />}
        {t.smoke && <div className="smoke" />}
        <div className="vignette" />
      </div>

      <div className="header">
        <div className="brand">
          <span className="brand-glyph">☾</span>
          <span>ARCANA · 塔羅占卜</span>
        </div>
        <div className="header-subtitle">凝神靜心，將問題置於心中</div>
      </div>

      <main className={
        "app-main"
        + (hasDraws ? (panelOpen ? " has-rail-open" : " has-rail-collapsed") : " no-rail")
      }>
        <Board
          spread={spread}
          draws={draws}
          phase={phase}
          activeIdx={activeIdx}
          onCardClick={handleCardClick}
          onCardDoubleClick={handleCardDoubleClick}
          onStartDraw={startDraw}
          cardSize={cardSize}
          flippedCount={flippedCount}
          allFlipped={allFlipped}
          onFlipAll={flipAll}
          onReset={resetBoard}
        />

        <SideRail
          activeDraw={activeIdx != null ? draws[activeIdx] : null}
          activePos={activeIdx != null ? spread.positions[activeIdx] : null}
          panelOpen={panelOpen}
          hasDraws={hasDraws}
          onTogglePanel={() => setPanelOpen(v => !v)}
        />
      </main>

      {/* 浮動牌陣選擇器：僅初始畫面顯示 */}
      {phase === "ready" && !hasDraws && (
        <SpreadPickerFloat
          spreadId={spreadId}
          spread={spread}
          onPick={pickSpread}
        />
      )}

      {phase === "shuffle" && <ShuffleOverlay />}

      {window.TweaksPanel && (
        <window.TweaksPanel title="氛圍與細節">
          <TweaksContent t={t} setTweak={setTweak} />
        </window.TweaksPanel>
      )}
    </>
  );
}

// ===== Board =====
function Board({ spread, draws, phase, activeIdx, onCardClick, onCardDoubleClick, onStartDraw, cardSize, flippedCount, allFlipped, onFlipAll, onReset }) {
  const isCeltic = spread.id === "celtic";
  const hasDraws = draws.length > 0;

  return (
    <div className="board-wrap">
      <div className="board-meta">
        <div className="board-meta-en">{spread.sub} · {spread.count} {spread.count === 1 ? "Card" : "Cards"}</div>
        <div className="board-meta-cn">{spread.name}</div>
        <div className="board-meta-orn">
          <span /><span className="orn-glyph">✦</span><span />
        </div>
      </div>

      <div
        className={"board" + (isCeltic ? " is-celtic" : "")}
        style={{ height: isCeltic ? 580 : 460 }}
      >
        {!hasDraws && spread.positions.map((pos, i) => (
          <div
            key={"slot-" + i}
            className={"slot-placeholder" + (pos.overlay ? " is-overlay" : "")}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: `${140 * cardSize}px`,
              height: `${228 * cardSize}px`,
              "--card-rot": `${pos.rot || 0}deg`,
              animationDelay: `${i * 80}ms`,
            }}
          >
            <div className="slot-inner" style={{ transform: `rotate(${pos.rot || 0}deg)` }}>
              <div className="slot-num">{i + 1}</div>
              <div className="slot-label" style={{ transform: pos.overlay ? `rotate(${-(pos.rot || 0)}deg)` : "none" }}>
                {pos.label}
              </div>
            </div>
          </div>
        ))}

        {hasDraws && draws.map((d, i) => {
          const pos = spread.positions[i];
          return (
            <window.TarotCard
              key={i + "-" + d.card.num}
              card={d.card}
              reversed={d.reversed}
              flipped={d.flipped}
              position={pos}
              label={pos.label}
              delay={i * 160}
              size={cardSize}
              focused={activeIdx === i}
              dimmed={activeIdx != null && activeIdx !== i}
              onFlip={() => onCardClick(i)}
              onDoubleFlip={() => onCardDoubleClick(i)}
            />
          );
        })}
      </div>

      {/* 中下方 開始抽牌 按鈕（僅空牌桌時顯示） */}
      {!hasDraws && phase !== "shuffle" && (
        <div className="board-cta">
          <button className="board-cta-btn" onClick={onStartDraw}>
            <span className="cta-rune">✦</span>
            <span>開始抽牌</span>
            <span className="cta-rune">✦</span>
          </button>
          <div className="board-cta-hint">點一下翻牌 ・ 點兩下查看牌義</div>
        </div>
      )}

      {/* 已抽牌後：底部動作列 */}
      {hasDraws && phase === "reading" && (
        <BottomBar
          flippedCount={flippedCount}
          total={draws.length}
          allFlipped={allFlipped}
          onFlipAll={onFlipAll}
          onRedraw={onStartDraw}
          onReset={onReset}
        />
      )}
    </div>
  );
}

// ===== Floating Spread Picker (top-right, initial only) =====
function SpreadPickerFloat({ spreadId, spread, onPick }) {
  const ids = ["single", "trinity", "core", "celtic"];
  return (
    <div className="spread-float">
      <div className="float-header">
        <div className="float-eyebrow">CHOOSE SPREAD</div>
        <div className="float-title">選擇牌陣</div>
        <div className="float-divider" />
      </div>
      <div className="float-list">
        {ids.map(id => {
          const s = SPREADS[id];
          const selected = id === spreadId;
          return (
            <button
              key={id}
              className={"float-pick" + (selected ? " is-selected" : "")}
              onClick={() => onPick(id)}
            >
              <div className="float-pick-radio"><span className="radio-dot" /></div>
              <div className="float-pick-info">
                <div className="float-pick-name">{s.name}</div>
                <div className="float-pick-sub">{s.sub} · {s.count} {s.count === 1 ? "Card" : "Cards"}</div>
              </div>
              <div className="float-pick-mini"><SpreadDiagram id={id} /></div>
            </button>
          );
        })}
      </div>
      <div className="float-desc">{spread.desc}</div>
    </div>
  );
}

// ===== Side Rail (right) — only card detail =====
function SideRail({ activeDraw, activePos, panelOpen, hasDraws, onTogglePanel }) {
  // 沒有牌可看時直接不渲染
  if (!hasDraws) return null;

  return (
    <aside className={"side-rail" + (panelOpen ? " is-open" : " is-collapsed")}>
      <button
        className="rail-toggle"
        onClick={onTogglePanel}
        title={panelOpen ? "收起" : "展開"}
      >
        <svg viewBox="0 0 24 24" width="14" height="14">
          <path
            d={panelOpen ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"}
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          />
        </svg>
      </button>

      {!panelOpen && (
        <div className="rail-collapsed-label">
          <div className="rail-collapsed-title">牌義解讀</div>
        </div>
      )}

      {panelOpen && (
        <div className="rail-content">
          <div className="rail-section-title">
            <span>牌義解讀</span>
            <span className="rail-section-divider" />
          </div>
          {activeDraw && activeDraw.flipped ? (
            <CardDetail draw={activeDraw} position={activePos} />
          ) : (
            <div className="rail-empty">
              <div className="rail-empty-glyph">✦</div>
              <div className="rail-empty-text">
                點兩下任一張卡牌<br/>查看牌義解讀
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

function CardDetail({ draw, position }) {
  const { card, reversed } = draw;
  return (
    <div className="card-detail">
      <div className="cd-position">{position.label}</div>
      <div className="cd-name">{card.name}</div>
      <div className="cd-en">{card.en} · {card.roman}</div>

      <div className={"cd-orientation" + (reversed ? " is-reversed" : "")}>
        {reversed ? "REVERSED · 逆位" : "UPRIGHT · 正位"}
      </div>
      <div className="cd-keyword">{card.keyword}</div>

      <div className="cd-body">
        <div className="cd-body-label">{reversed ? "Reversed Reading" : "Upright Reading"}</div>
        <div className="cd-body-text">{reversed ? card.reversed : card.upright}</div>
      </div>
    </div>
  );
}

// ===== Bottom Bar (reading state) =====
function BottomBar({ flippedCount, total, allFlipped, onFlipAll, onRedraw, onReset }) {
  return (
    <div className="bottom-bar">
      <div className="bar-status">
        <span className="bar-status-label">已翻開</span>
        <span className="bar-status-num">{flippedCount} / {total}</span>
      </div>
      {!allFlipped && (
        <button className="bar-btn bar-btn-ghost" onClick={onFlipAll}>一次翻開全部</button>
      )}
      <button className="bar-btn bar-btn-primary" onClick={onRedraw}>重新洗牌</button>
      <button className="bar-btn bar-btn-text" onClick={onReset}>清空牌桌</button>
    </div>
  );
}

function ShuffleOverlay() {
  return (
    <div className="shuffle-overlay">
      <div className="shuffle-stack">
        <div className="shuffle-card" />
        <div className="shuffle-card" />
        <div className="shuffle-card" />
        <div className="shuffle-card" />
        <div className="shuffle-card" />
      </div>
      <div className="shuffle-text">SHUFFLING THE DECK</div>
      <div className="shuffle-text-cn">凝心．洗牌．抽取訊息</div>
    </div>
  );
}

function TweaksContent({ t, setTweak }) {
  const { TweakSection, TweakToggle, TweakRadio } = window;
  return (
    <>
      <TweakSection title="氛圍">
        <TweakToggle label="額外星辰層" value={t.starsExtra} onChange={v => setTweak("starsExtra", v)} />
        <TweakToggle label="紫煙縈繞" value={t.smoke} onChange={v => setTweak("smoke", v)} />
      </TweakSection>
      <TweakSection title="色調">
        <TweakRadio
          label="主色調"
          value={t.mood}
          options={[
            { label: "深邃神秘", value: "deep" },
            { label: "靜謐冷峻", value: "cold" },
            { label: "古銅暖黃", value: "warm" },
          ]}
          onChange={v => { setTweak("mood", v); applyMood(v); }}
        />
      </TweakSection>
    </>
  );
}

function applyMood(mood) {
  const root = document.documentElement;
  if (mood === "cold") {
    root.style.setProperty("--bg-0", "#070a1f");
    root.style.setProperty("--bg-1", "#0d1330");
    root.style.setProperty("--bg-2", "#162247");
    root.style.setProperty("--gold", "#8ec3d8");
    root.style.setProperty("--gold-soft", "#6ea9c2");
    root.style.setProperty("--gold-glow", "rgba(142,195,216,0.45)");
  } else if (mood === "warm") {
    root.style.setProperty("--bg-0", "#1a1208");
    root.style.setProperty("--bg-1", "#2a1d10");
    root.style.setProperty("--bg-2", "#3a2814");
    root.style.setProperty("--gold", "#e6b97c");
    root.style.setProperty("--gold-soft", "#c89556");
    root.style.setProperty("--gold-glow", "rgba(230,185,124,0.55)");
  } else {
    root.style.setProperty("--bg-0", "#0b0820");
    root.style.setProperty("--bg-1", "#14102e");
    root.style.setProperty("--bg-2", "#1f1a44");
    root.style.setProperty("--gold", "#d6b06c");
    root.style.setProperty("--gold-soft", "#c89e58");
    root.style.setProperty("--gold-glow", "rgba(214,176,108,0.5)");
  }
}

setTimeout(() => {
  if (window.__TAROT_TWEAKS_DEFAULTS__?.mood) applyMood(window.__TAROT_TWEAKS_DEFAULTS__.mood);
}, 0);

window.App = App;
