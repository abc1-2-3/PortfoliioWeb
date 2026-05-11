// Carousel — 3D rotating ring of work cards with cage / rune variants
const { useState, useEffect, useRef } = React;

// Cage frame: ornate gothic cage with curves, finial, gem nodes
function CageFrame() {
  return (
    <div className="cage-frame">
      <svg viewBox="0 0 280 420" preserveAspectRatio="none">
        <defs>
          <linearGradient id="cage-metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="40%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
        </defs>
        <g stroke="url(#cage-metal)" fill="none" strokeWidth="1.4" strokeLinecap="round">
          {/* outer rectangle */}
          <path d="M30 36 L30 384" />
          <path d="M250 36 L250 384" />
          <path d="M30 36 L250 36" opacity="0.7" />
          <path d="M30 384 L250 384" opacity="0.9" />
          {/* top arch finial */}
          <path d="M30 36 Q30 14 60 14 L220 14 Q250 14 250 36" />
          <path d="M140 14 L140 0 M134 6 L146 6" strokeWidth="1" />
          {/* curved buttresses left */}
          <path d="M30 80 Q12 130 30 180" opacity="0.85" />
          <path d="M30 220 Q12 270 30 330" opacity="0.85" />
          <path d="M250 80 Q268 130 250 180" opacity="0.85" />
          <path d="M250 220 Q268 270 250 330" opacity="0.85" />
          {/* horizontal trims */}
          <path d="M30 80 L250 80" opacity="0.5" strokeDasharray="2 4" />
          <path d="M30 340 L250 340" opacity="0.5" strokeDasharray="2 4" />
          {/* inner cage bars (vertical) */}
          <path d="M70 36 L70 384" opacity="0.18" strokeWidth="0.7" />
          <path d="M110 36 L110 384" opacity="0.18" strokeWidth="0.7" />
          <path d="M170 36 L170 384" opacity="0.18" strokeWidth="0.7" />
          <path d="M210 36 L210 384" opacity="0.18" strokeWidth="0.7" />
          {/* bottom decorative curve */}
          <path d="M60 384 Q140 405 220 384" opacity="0.7" />
          {/* base feet */}
          <path d="M30 384 L20 396 L40 396 L30 384" />
          <path d="M250 384 L240 396 L260 396 L250 384" />
        </g>
        {/* gem nodes */}
        <g>
          <circle className="cage-gem" cx="30" cy="36" r="4" />
          <circle className="cage-gem" cx="250" cy="36" r="4" />
          <circle className="cage-gem" cx="30" cy="384" r="4" />
          <circle className="cage-gem" cx="250" cy="384" r="4" />
          <circle className="cage-gem" cx="140" cy="14" r="3" />
          <circle className="cage-gem" cx="30" cy="200" r="2.5" opacity="0.7" />
          <circle className="cage-gem" cx="250" cy="200" r="2.5" opacity="0.7" />
        </g>
      </svg>
    </div>
  );
}

// Rune corner ornament
function RuneCorner({ pos }) {
  return (
    <svg className={`rune-corner ${pos}`} viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M0 8 L0 0 L8 0" />
      <path d="M2 4 L4 4 M4 2 L4 4" strokeOpacity="0.7" />
      <circle cx="2" cy="2" r="1" fill="currentColor" />
      <path d="M6 6 L10 10" strokeOpacity="0.6" strokeDasharray="1 2" />
    </svg>
  );
}

// Hover FX overlay — mist + electric arcs + sparks + snowflakes + bolts
function HoverFX({ accent, intensity = "full" }) {
  const sparks = Array.from({ length: 6 }).map((_, i) => {
    const a = (i / 6) * 360;
    return (
      <span key={i} className="fx-spark"
        style={{
          left: "50%", top: "50%",
          transform: `rotate(${a}deg) translateY(-160px)`,
          animationDelay: `${-i * 0.5}s`,
        }} />
    );
  });
  const snows = Array.from({ length: 8 }).map((_, i) => {
    const left = 5 + Math.random() * 90;
    const dur = 3 + Math.random() * 3;
    const delay = -Math.random() * dur;
    return (
      <span key={i} className="fx-snow"
        style={{ left: `${left}%`, top: "-10px", animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
        ❋
      </span>
    );
  });
  return (
    <div className="fx-layer" style={{ color: accent }}>
      <div className="fx-mist"></div>
      <div className="fx-arc" style={{ borderColor: accent + "aa" }}></div>
      <div className="fx-arc a2"></div>
      {sparks}
      {snows}
      <svg className="fx-bolt" viewBox="0 0 240 360" preserveAspectRatio="none">
        <path d="M20 20 L40 80 L25 130 L55 200 L35 280 L60 340" />
        <path d="M220 30 L200 90 L215 150 L185 220 L210 290 L190 340" />
        <path d="M120 20 L100 80 L130 140 L110 220 L140 300" />
      </svg>
    </div>
  );
}

function Carousel({ works, onSelect, autoSpeed = 0.15, depth = 380, variant = "cage" }) {
  const [angle, setAngle] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(0);
  const dragRef = useRef({ dragging: false, startX: 0, startAngle: 0 });

  const total = works.length;
  const step = 360 / total;

  useEffect(() => {
    let raf, last = performance.now();
    const tick = (now) => {
      const dt = now - last; last = now;
      if (!hovered && !dragRef.current.dragging) {
        setAngle(a => a + autoSpeed * (dt / 16));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hovered, autoSpeed]);

  useEffect(() => {
    const norm = ((-angle % 360) + 360) % 360;
    setActive(Math.round(norm / step) % total);
  }, [angle, step, total]);

  const onPointerDown = (e) => {
    dragRef.current = { dragging: true, startX: e.clientX, startAngle: angle };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragRef.current.dragging) return;
    setAngle(dragRef.current.startAngle + (e.clientX - dragRef.current.startX) * 0.4);
  };
  const onPointerUp = () => { dragRef.current.dragging = false; };

  const goPrev = () => setAngle(a => a - step);
  const goNext = () => setAngle(a => a + step);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  return (
    <>
      <div className="carousel-wrap"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ touchAction: "none" }}
      >
        <div className="carousel" style={{ transform: `translateZ(-${depth}px) rotateY(${angle}deg)` }}>
          {works.map((w, i) => {
            const cardAngle = i * step;
            const isActive = i === active;
            return (
              <div
                key={w.id}
                className={`card variant-${variant}`}
                style={{ transform: `rotateY(${cardAngle}deg) translateZ(${depth}px)` }}
                onClick={(e) => { e.stopPropagation(); onSelect && onSelect(w, i); }}
              >
                <div className="card-inner" style={isActive ? { borderColor: w.color, boxShadow: `0 0 0 1px ${w.color}55 inset, 0 20px 60px rgba(0,0,0,0.55), 0 0 60px ${w.color}80` } : {}}>
                  <div className="card-tag" style={{ color: w.color, borderColor: w.color + "88" }}>{w.tag}</div>
                  <div className="card-num">0{i + 1}</div>
                  <div className="card-thumb">
                    <div className="card-thumb-art">
                      <ThumbArt kind={w.art} color={w.color} />
                    </div>
                    <div className="thumb-overlay"></div>
                  </div>
                  <div className="card-meta">
                    <div className="card-title">{w.title}</div>
                    <div className="card-subtitle">{w.titleZh} · {w.subtitle}</div>
                  </div>
                </div>
                {variant === "cage" && <CageFrame />}
                {variant === "rune" && <>
                  <RuneCorner pos="tl" />
                  <RuneCorner pos="tr" />
                  <RuneCorner pos="bl" />
                  <RuneCorner pos="br" />
                </>}
                <HoverFX accent={w.color} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="carousel-ctrls">
        <button className="ctrl-btn" onClick={goPrev} aria-label="prev">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18 L9 12 L15 6"/></svg>
        </button>
        <span>{String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        <button className="ctrl-btn" onClick={goNext} aria-label="next">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6 L15 12 L9 18"/></svg>
        </button>
      </div>
    </>
  );
}

window.Carousel = Carousel;
