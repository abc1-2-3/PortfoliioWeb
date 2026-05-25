// Card face renderer - classic playing card layout
const SUITS = {
  spades:   { symbol: '♠', color: 'dark',  name: '黑桃' },
  hearts:   { symbol: '♥', color: 'red',   name: '紅心' },
  diamonds: { symbol: '♦', color: 'red',   name: '方塊' },
  clubs:    { symbol: '♣', color: 'dark',  name: '梅花' },
};

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Pip positions for each rank (column-major). x,y in 0..1 within the pip area.
const PIP_LAYOUTS = {
  'A':  [[0.5, 0.5]],
  '2':  [[0.5, 0.12], [0.5, 0.88]],
  '3':  [[0.5, 0.12], [0.5, 0.5], [0.5, 0.88]],
  '4':  [[0.2, 0.12], [0.8, 0.12], [0.2, 0.88], [0.8, 0.88]],
  '5':  [[0.2, 0.12], [0.8, 0.12], [0.5, 0.5], [0.2, 0.88], [0.8, 0.88]],
  '6':  [[0.2, 0.12], [0.8, 0.12], [0.2, 0.5], [0.8, 0.5], [0.2, 0.88], [0.8, 0.88]],
  '7':  [[0.2, 0.12], [0.8, 0.12], [0.5, 0.28], [0.2, 0.5], [0.8, 0.5], [0.2, 0.88], [0.8, 0.88]],
  '8':  [[0.2, 0.12], [0.8, 0.12], [0.5, 0.28], [0.2, 0.5], [0.8, 0.5], [0.5, 0.72], [0.2, 0.88], [0.8, 0.88]],
  '9':  [[0.2, 0.12], [0.8, 0.12], [0.2, 0.36], [0.8, 0.36], [0.5, 0.5], [0.2, 0.64], [0.8, 0.64], [0.2, 0.88], [0.8, 0.88]],
  '10': [[0.2, 0.12], [0.8, 0.12], [0.5, 0.24], [0.2, 0.36], [0.8, 0.36], [0.2, 0.64], [0.8, 0.64], [0.5, 0.76], [0.2, 0.88], [0.8, 0.88]],
};

function PipSymbol({ suit, size = 1, flipped = false }) {
  const s = SUITS[suit];
  const color = s.color === 'red' ? 'var(--card-red)' : 'var(--card-dark)';
  return (
    <span
      className="pip"
      style={{
        color,
        fontSize: `${size}em`,
        transform: flipped ? 'rotate(180deg)' : 'none',
        display: 'inline-block',
        lineHeight: 1,
      }}
    >
      {s.symbol}
    </span>
  );
}

function CornerIndex({ rank, suit, position = 'tl' }) {
  const flip = position === 'br';
  const s = SUITS[suit];
  const color = s.color === 'red' ? 'var(--card-red)' : 'var(--card-dark)';
  const styleMap = {
    tl: { top: '4%', left: '5%', transform: 'none' },
    br: { bottom: '4%', right: '5%', transform: 'rotate(180deg)' },
  };
  return (
    <div
      className="corner-index"
      style={{
        position: 'absolute',
        ...styleMap[position],
        color,
        fontFamily: 'var(--card-rank-font)',
        fontWeight: 600,
        lineHeight: 0.85,
        textAlign: 'center',
        fontSize: 'clamp(14px, 11cqw, 56px)',
      }}
    >
      <div>{rank}</div>
      <div style={{ fontSize: '1.05em', marginTop: '4px' }}>{s.symbol}</div>
    </div>
  );
}

function PipLayout({ rank, suit }) {
  const layout = PIP_LAYOUTS[rank] || [];
  return (
    <div
      style={{
        position: 'absolute',
        inset: '18% 20%',
        pointerEvents: 'none',
      }}
    >
      {layout.map(([x, y], i) => {
        const flipped = y > 0.5;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: 'clamp(18px, 15cqw, 80px)',
            }}
          >
            <PipSymbol suit={suit} flipped={flipped} />
          </div>
        );
      })}
    </div>
  );
}

// Face card center: shows the rank letter ornately + uploaded image, or placeholder
function FaceCardCenter({ rank, suit, faceImage }) {
  const s = SUITS[suit];
  const accent = s.color === 'red' ? 'var(--card-red)' : 'var(--card-dark)';
  return (
    <div
      style={{
        position: 'absolute',
        inset: '12% 14%',
        borderRadius: '6px',
        overflow: 'hidden',
        background: faceImage
          ? `url(${faceImage}) center/cover no-repeat`
          : `repeating-linear-gradient(45deg, color-mix(in oklch, ${accent} 8%, transparent) 0 6px, transparent 6px 12px)`,
        border: `1.5px solid color-mix(in oklch, ${accent} 60%, transparent)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {!faceImage && (
        <div
          style={{
            color: accent,
            fontFamily: 'var(--card-rank-font)',
            fontSize: 'clamp(50px, 24cqw, 150px)',
            fontWeight: 700,
            opacity: 0.75,
            letterSpacing: '-0.04em',
          }}
        >
          {rank}
        </div>
      )}
    </div>
  );
}

function JokerCenter({ faceImage, variant = 'red' }) {
  const accent = variant === 'red' ? 'var(--card-red)' : 'var(--card-dark)';
  return (
    <div
      style={{
        position: 'absolute',
        inset: '10% 12%',
        borderRadius: '6px',
        overflow: 'hidden',
        background: faceImage
          ? `url(${faceImage}) center/cover no-repeat`
          : `repeating-linear-gradient(-45deg, color-mix(in oklch, ${accent} 10%, transparent) 0 6px, transparent 6px 14px)`,
        border: `1.5px solid color-mix(in oklch, ${accent} 60%, transparent)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {!faceImage && (
        <>
          <div
            style={{
              color: accent,
              fontFamily: 'var(--card-rank-font)',
              fontSize: 'clamp(20px, 14cqw, 80px)',
              fontWeight: 700,
              letterSpacing: '0.08em',
            }}
          >
            鬼牌
          </div>
          <div style={{ color: accent, fontSize: 'clamp(24px, 18cqw, 96px)' }}>★</div>
        </>
      )}
    </div>
  );
}

// Card back patterns — preset designs. Each design fills the entire face
// (inset: 0) and uses an inner border to suggest the card frame, so when
// the card rotates the pattern stays visible to the edge rather than
// revealing the card-bg color through a margin.
function CardBack({ design = 'lattice', accent = '#8b1538', commonImage = null }) {
  if (commonImage) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `url(${commonImage}) center/cover no-repeat`,
          boxShadow: `inset 0 0 0 6px color-mix(in oklch, ${accent} 60%, transparent)`,
        }}
      />
    );
  }
  const patterns = {
    lattice: (
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          repeating-linear-gradient(45deg, ${accent} 0 2px, transparent 2px 12px),
          repeating-linear-gradient(-45deg, ${accent} 0 2px, transparent 2px 12px),
          radial-gradient(circle at center, color-mix(in oklch, ${accent} 30%, #fff) 0%, ${accent} 70%)
        `,
        boxShadow: `
          inset 0 0 0 4px color-mix(in oklch, ${accent} 80%, #fff),
          inset 0 0 0 6px color-mix(in oklch, ${accent} 50%, #000),
          inset 0 0 0 10px color-mix(in oklch, ${accent} 80%, #fff)
        `,
      }} />
    ),
    diamond: (
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          repeating-conic-gradient(from 0deg at 50% 50%, ${accent} 0deg 10deg, color-mix(in oklch, ${accent} 50%, #000) 10deg 20deg),
          ${accent}
        `,
        boxShadow: `inset 0 0 0 6px color-mix(in oklch, ${accent} 60%, #000), inset 0 0 0 8px color-mix(in oklch, ${accent} 80%, #fff)`,
      }} />
    ),
    rose: (
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(circle at 25% 25%, color-mix(in oklch, ${accent} 30%, #fff) 0 8%, transparent 9%),
          radial-gradient(circle at 75% 25%, color-mix(in oklch, ${accent} 30%, #fff) 0 8%, transparent 9%),
          radial-gradient(circle at 25% 75%, color-mix(in oklch, ${accent} 30%, #fff) 0 8%, transparent 9%),
          radial-gradient(circle at 75% 75%, color-mix(in oklch, ${accent} 30%, #fff) 0 8%, transparent 9%),
          radial-gradient(circle at 50% 50%, color-mix(in oklch, ${accent} 50%, #fff) 0 12%, transparent 13%),
          ${accent}
        `,
        backgroundSize: '24px 24px, 24px 24px, 24px 24px, 24px 24px, 100% 100%, 100% 100%',
        boxShadow: `inset 0 0 0 6px color-mix(in oklch, ${accent} 70%, #fff)`,
      }} />
    ),
    waves: (
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          repeating-radial-gradient(circle at 50% 0%, transparent 0 14px, color-mix(in oklch, ${accent} 50%, #fff) 14px 16px),
          repeating-radial-gradient(circle at 50% 100%, transparent 0 14px, color-mix(in oklch, ${accent} 50%, #fff) 14px 16px),
          ${accent}
        `,
        boxShadow: `inset 0 0 0 6px color-mix(in oklch, ${accent} 80%, #fff)`,
      }} />
    ),
    stars: (
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(circle at 20% 20%, #fff 0 1.5px, transparent 2px),
          radial-gradient(circle at 60% 40%, #fff 0 1.5px, transparent 2px),
          radial-gradient(circle at 80% 80%, #fff 0 1.5px, transparent 2px),
          radial-gradient(circle at 30% 70%, #fff 0 1.5px, transparent 2px),
          radial-gradient(circle at 90% 30%, #fff 0 1.5px, transparent 2px),
          radial-gradient(circle at 10% 90%, #fff 0 1.5px, transparent 2px),
          radial-gradient(circle at 70% 10%, #fff 0 1.5px, transparent 2px),
          radial-gradient(ellipse at center, color-mix(in oklch, ${accent} 60%, #000) 0%, ${accent} 100%)
        `,
        backgroundSize: '40px 40px, 40px 40px, 40px 40px, 40px 40px, 40px 40px, 40px 40px, 40px 40px, 100% 100%',
        boxShadow: `inset 0 0 0 6px color-mix(in oklch, ${accent} 80%, #fff)`,
      }} />
    ),
    grid: (
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          linear-gradient(${accent} 1px, transparent 1px) 0 0 / 14px 14px,
          linear-gradient(90deg, ${accent} 1px, transparent 1px) 0 0 / 14px 14px,
          radial-gradient(circle at center, color-mix(in oklch, ${accent} 40%, #fff) 0%, color-mix(in oklch, ${accent} 80%, #000) 100%)
        `,
        boxShadow: `inset 0 0 0 4px ${accent}, inset 0 0 0 6px color-mix(in oklch, ${accent} 50%, #fff)`,
      }} />
    ),
  };
  return patterns[design] || patterns.lattice;
}

// The complete card face content (not the holo wrapper)
function CardContent({ card, faceImages, backDesign, backAccent, commonBackImage }) {
  // card: { rank, suit } or { joker: 'red' | 'black' } or { back: true }
  if (card.back) {
    return <CardBack design={backDesign} accent={backAccent} commonImage={commonBackImage} />;
  }
  if (card.joker) {
    const variant = card.joker;
    const img = faceImages[`joker-${variant}`];
    const accent = variant === 'red' ? 'var(--card-red)' : 'var(--card-dark)';
    return (
      <>
        <div style={{
          position: 'absolute', top: '4%', left: '5%',
          color: accent, fontFamily: 'var(--card-rank-font)',
          fontWeight: 700, fontSize: 'clamp(12px, 5.5cqw, 30px)',
          letterSpacing: '0.04em', lineHeight: 1,
        }}>
          鬼
        </div>
        <div style={{
          position: 'absolute', bottom: '4%', right: '5%',
          color: accent, fontFamily: 'var(--card-rank-font)',
          fontWeight: 700, fontSize: 'clamp(12px, 5.5cqw, 30px)',
          letterSpacing: '0.04em', lineHeight: 1, transform: 'rotate(180deg)',
        }}>
          鬼
        </div>
        <JokerCenter faceImage={img} variant={variant} />
      </>
    );
  }
  const { rank, suit } = card;
  const isFace = ['J', 'Q', 'K'].includes(rank);
  return (
    <>
      <CornerIndex rank={rank} suit={suit} position="tl" />
      <CornerIndex rank={rank} suit={suit} position="br" />
      {isFace ? (
        <FaceCardCenter rank={rank} suit={suit} faceImage={faceImages[`${rank}-${suit}`]} />
      ) : (
        <PipLayout rank={rank} suit={suit} />
      )}
    </>
  );
}

Object.assign(window, { SUITS, RANKS, CardContent, CardBack });
