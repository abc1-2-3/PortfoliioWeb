// HoloCard — true 2-sided 3D card with iridescent foil layers on each face.

const { useState, useRef, useEffect, useCallback, useMemo } = React;

const SIZE_MAP = {
  lg: { w: 360, h: 504 },
  md: { w: 220, h: 308 },
  sm: { w: 140, h: 196 },
  xs: { w: 96, h: 134 },
};

// Single foil face: card content + 5 holo layers stacked above it.
// Listens to pointer events to update its own pointer/hover state.
function HoloFace({
  children, faceRef,
  holoHue, holoIntensity, holoScale, noiseOpacity, specularSize, cardBg,
  flatMode, isBack, interactive,
  onPointerEnter, onPointerLeave, onHoverPointer,
}) {
  const localRef = useRef(null);
  const ref = faceRef || localRef;
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5 });
  const [hovering, setHovering] = useState(false);

  const onMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const np = { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
    setPointer(np);
    onHoverPointer && onHoverPointer(np);
  };

  const px = pointer.x * 100;
  const py = pointer.y * 100;
  const conicAngle = (pointer.x * 360 + pointer.y * 180) % 360;
  const holoSat = 0.18 * holoIntensity;

  return (
    <div
      ref={ref}
      className={`holo-face ${isBack ? 'back' : 'front'}`}
      onPointerMove={interactive ? onMove : undefined}
      onPointerEnter={interactive ? () => { setHovering(true); onPointerEnter && onPointerEnter(); } : undefined}
      onPointerLeave={interactive ? () => { setHovering(false); onPointerLeave && onPointerLeave(); } : undefined}
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '16px',
        background: cardBg,
        overflow: 'hidden',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: isBack ? 'rotateY(180deg)' : 'none',
        containerType: 'inline-size',
        boxShadow: `
          0 1px 0 rgba(255,255,255,0.5) inset,
          0 0 0 1px rgba(0,0,0,0.08)
        `,
      }}
    >
      {/* Base content */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        {children}
      </div>

      {/* Iridescent conic */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: `conic-gradient(from ${conicAngle}deg at ${px}% ${py}%,
            oklch(0.75 ${holoSat} ${holoHue}) 0deg,
            oklch(0.78 ${holoSat} ${(holoHue + 60) % 360}) 60deg,
            oklch(0.80 ${holoSat} ${(holoHue + 120) % 360}) 120deg,
            oklch(0.75 ${holoSat} ${(holoHue + 180) % 360}) 180deg,
            oklch(0.78 ${holoSat} ${(holoHue + 240) % 360}) 240deg,
            oklch(0.80 ${holoSat} ${(holoHue + 300) % 360}) 300deg,
            oklch(0.75 ${holoSat} ${holoHue}) 360deg)`,
          mixBlendMode: 'color-dodge',
          opacity: (hovering ? 0.65 : 0.25) * holoIntensity,
          transition: 'opacity 0.35s',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
      {/* Shifting stripes */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: `repeating-linear-gradient(${pointer.x * 180}deg,
            oklch(0.95 0.15 ${holoHue}) 0px,
            oklch(0.95 0.15 ${(holoHue + 90) % 360}) 2px,
            oklch(0.95 0.15 ${(holoHue + 180) % 360}) 4px,
            oklch(0.95 0.15 ${(holoHue + 270) % 360}) 6px,
            transparent 8px,
            transparent 12px)`,
          mixBlendMode: 'overlay',
          opacity: (hovering ? 0.55 : 0.15) * holoIntensity * holoScale,
          transition: 'opacity 0.35s',
          pointerEvents: 'none',
          backgroundSize: `${100 * holoScale}% ${100 * holoScale}%`,
          zIndex: 3,
        }}
      />
      {/* Soft specular */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at ${px}% ${py}%,
            rgba(255,255,255,${0.75 * holoIntensity}) 0%,
            rgba(255,255,255,${0.15 * holoIntensity}) ${15 * specularSize}%,
            transparent ${40 * specularSize}%)`,
          mixBlendMode: 'soft-light',
          opacity: hovering ? 1 : 0.6,
          transition: 'opacity 0.35s',
          pointerEvents: 'none',
          zIndex: 4,
        }}
      />
      {/* Bright core */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at ${px}% ${py}%,
            rgba(255,255,255,0.95) 0%,
            transparent ${10 * specularSize}%)`,
          mixBlendMode: 'overlay',
          opacity: hovering ? 0.9 : 0.3,
          transition: 'opacity 0.35s',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />
      {/* Noise */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
          opacity: noiseOpacity,
          pointerEvents: 'none',
          zIndex: 6,
        }}
      />
      {/* Edge sheen */}
      <div
        style={{
          position: 'absolute', inset: 0,
          borderRadius: '16px',
          boxShadow: `
            inset 0 0 0 1px rgba(255,255,255,0.4),
            inset 0 0 20px rgba(255,255,255,0.15)
          `,
          pointerEvents: 'none',
          zIndex: 7,
        }}
      />
    </div>
  );
}

function HoloCard({
  card,
  faceImages,
  backDesign,
  backAccent,
  commonBackImage,
  showBack = false,
  holoHue = 280,
  holoIntensity = 1,
  holoScale = 1,
  noiseOpacity = 0.12,
  glowIntensity = 1,
  specularSize = 1,
  cardBg = '#fafaf7',
  tiltMax = 22,
  size = 'lg',
  interactive = true,
  onClick,
  enableDrag = true,
  flatMode = false,
  exportSide = null,
}) {
  const wrapperRef = useRef(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [hoverPointer, setHoverPointer] = useState({ x: 0.5, y: 0.5 });
  const dragState = useRef(null);
  const didDrag = useRef(false);

  // We rely on a normal CSS `transition: transform` for the flip
  // animation. Visibility, though, can't be transitioned — so a rAF
  // loop reads the wrapper's computed transform matrix every frame and
  // toggles each face's visibility from the LIVE forward-normal
  // (m33 = cos(rx)*cos(ry)). This way the swap is always in sync with
  // what the user is actually seeing, regardless of whether the
  // rotation is being driven by drag (instant) or by a button click
  // (animated by the CSS transition).
  useEffect(() => {
    if (exportSide) {
      if (frontRef.current) frontRef.current.style.visibility = exportSide === 'front' ? 'visible' : 'hidden';
      if (backRef.current) backRef.current.style.visibility = exportSide === 'back' ? 'visible' : 'hidden';
      return;
    }
    let raf;
    const tick = () => {
      const wrap = wrapperRef.current;
      const front = frontRef.current;
      const back = backRef.current;
      if (wrap && front && back) {
        const m = new DOMMatrix(getComputedStyle(wrap).transform);
        const facing = m.m33; // forward-normal z after rotateX*rotateY
        const showFront = facing >= 0;
        front.style.visibility = showFront ? 'visible' : 'hidden';
        back.style.visibility = showFront ? 'hidden' : 'visible';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [exportSide]);

  useEffect(() => {
    if (!enableDrag) return;
    const onMove = (e) => {
      if (!dragState.current) return;
      e.preventDefault();
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      if (Math.abs(dx) + Math.abs(dy) > 4) didDrag.current = true;
      setDrag({
        x: dragState.current.baseX - dy * 0.8,
        y: dragState.current.baseY + dx * 0.8,
      });
    };
    const onUp = () => {
      dragState.current = null;
      document.body.style.cursor = '';
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [enableDrag]);

  const onPointerDown = (e) => {
    if (!enableDrag || flatMode) return;
    didDrag.current = false;
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: drag.x,
      baseY: drag.y,
    };
    document.body.style.cursor = 'grabbing';
  };

  const handleClick = (e) => {
    if (didDrag.current) return;
    onClick && onClick(e);
  };

  // Final rotation: drag + click flip + hover tilt
  const hoverTiltX = hovering && !dragState.current && !flatMode ? (0.5 - hoverPointer.y) * tiltMax : 0;
  const hoverTiltY = hovering && !dragState.current && !flatMode ? (hoverPointer.x - 0.5) * tiltMax : 0;
  const tiltX = flatMode ? 0 : drag.x + hoverTiltX;
  const tiltY = flatMode ? 0 : drag.y + hoverTiltY + (showBack ? 180 : 0);

  const { w, h } = SIZE_MAP[size] || SIZE_MAP.lg;

  // Glow underneath - uses front face pointer for now
  const gx = hoverPointer.x * 100;
  const gy = hoverPointer.y * 100;
  const holoSat = 0.18 * holoIntensity;

  return (
    <div
      style={{
        width: w,
        height: h,
        perspective: '1400px',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* External glow */}
      {!flatMode && (
        <div
          style={{
            position: 'absolute',
            inset: '-12%',
            borderRadius: '24px',
            background: `radial-gradient(ellipse at ${gx}% ${gy}%,
              oklch(0.72 ${holoSat} ${holoHue}) 0%,
              oklch(0.65 ${holoSat * 0.8} ${(holoHue + 60) % 360}) 30%,
              transparent 65%)`,
            filter: 'blur(40px)',
            opacity: (hovering ? 0.85 : 0.35) * glowIntensity,
            transition: 'opacity 0.35s',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      <div
        ref={wrapperRef}
        onPointerDown={onPointerDown}
        onClick={handleClick}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) ${hovering && !dragState.current ? 'scale(1.03)' : 'scale(1)'}`,
          transition: dragState.current
            ? 'none'
            : `transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
          cursor: enableDrag && !flatMode ? 'grab' : (onClick ? 'pointer' : 'default'),
          zIndex: 1,
          filter: !flatMode ? `drop-shadow(0 ${hovering ? 30 : 18}px ${hovering ? 40 : 30}px rgba(0,0,0,0.45))` : 'none',
        }}
      >
        {/* Front face */}
        {exportSide !== 'back' && <HoloFace
          faceRef={frontRef}
          isBack={false}
          interactive={interactive}
          flatMode={flatMode}
          holoHue={holoHue}
          holoIntensity={holoIntensity}
          holoScale={holoScale}
          noiseOpacity={noiseOpacity}
          specularSize={specularSize}
          cardBg={cardBg}
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          onHoverPointer={setHoverPointer}
        >
          <CardContent
            card={card}
            faceImages={faceImages}
            backDesign={backDesign}
            backAccent={backAccent}
            commonBackImage={commonBackImage}
          />
        </HoloFace>}

        {/* Back face — actual card back */}
        {exportSide !== 'front' && <HoloFace
          faceRef={backRef}
          isBack={true}
          interactive={interactive}
          flatMode={flatMode}
          holoHue={holoHue}
          holoIntensity={holoIntensity}
          holoScale={holoScale}
          noiseOpacity={noiseOpacity}
          specularSize={specularSize}
          cardBg={cardBg}
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          onHoverPointer={setHoverPointer}
        >
          <CardBack design={backDesign} accent={backAccent} commonImage={commonBackImage} />
        </HoloFace>}
      </div>
    </div>
  );
}

window.HoloCard = HoloCard;
