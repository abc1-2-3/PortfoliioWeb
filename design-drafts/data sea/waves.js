// Waves canvas — line-based ocean with environmental controls
(function () {
  const canvas = document.getElementById('ocean');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);

  // Ripples from mouse
  const ripples = [];
  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (Math.random() < 0.45) {
      ripples.push({ x, y, t: 0, life: 1.6, amp: 18 + Math.random() * 14 });
    }
    if (ripples.length > 60) ripples.shift();
  });
  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect();
    ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: 0, life: 2.4, amp: 60 });
  });

  // Stars
  const stars = [];
  function buildStars() {
    stars.length = 0;
    const n = 220;
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random() * 0.55,
        r: Math.random() * 1.2 + 0.2,
        tw: Math.random() * Math.PI * 2,
        sp: 0.6 + Math.random() * 1.6,
      });
    }
  }
  buildStars();

  // Shooting stars
  const shooters = [];
  function maybeShoot() {
    if (Math.random() < 0.0025 && shooters.length < 2) {
      shooters.push({
        x: Math.random() * W * 0.7,
        y: Math.random() * H * 0.25 + 20,
        vx: 6 + Math.random() * 4,
        vy: 1.5 + Math.random() * 1.2,
        life: 1, age: 0,
      });
    }
  }

  // Data labels appearing on crests
  const labels = [];
  function spawnLabel() {
    if (labels.length > 14) return;
    labels.push({
      x: Math.random() * W,
      band: Math.floor(Math.random() * 8),
      v: (0.18 + Math.random() * 0.22).toFixed(2),
      age: 0, life: 4 + Math.random() * 2.5,
    });
  }

  let last = performance.now();
  let t = 0;

  function getParams() {
    return window.__DataSea?.params || {
      lunar: 0.72, wind: 1.38, freq: 2.45, density: 0.89, dayNight: 0,
    };
  }

  // Color helpers — palette shifts with day/night
  function bgGradient(dn) {
    // dn: 0 = night, 1 = day
    const g = ctx.createLinearGradient(0, 0, 0, H);
    if (dn < 0.5) {
      const k = dn * 2; // 0..1 within night→dawn
      g.addColorStop(0, mix('#05071a', '#1a1240', k));
      g.addColorStop(0.55, mix('#0a0e2e', '#3b2466', k));
      g.addColorStop(1, mix('#0a0a24', '#5a2a5e', k));
    } else {
      const k = (dn - 0.5) * 2;
      g.addColorStop(0, mix('#1a1240', '#1d4d8a', k));
      g.addColorStop(0.55, mix('#3b2466', '#4a8fc7', k));
      g.addColorStop(1, mix('#5a2a5e', '#a8c8dc', k));
    }
    return g;
  }

  function mix(a, b, k) {
    const ca = hexToRgb(a), cb = hexToRgb(b);
    const r = Math.round(ca.r + (cb.r - ca.r) * k);
    const g = Math.round(ca.g + (cb.g - ca.g) * k);
    const bb = Math.round(ca.b + (cb.b - ca.b) * k);
    return `rgb(${r},${g},${bb})`;
  }
  function hexToRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function drawStars(dn) {
    const alpha = Math.max(0, 1 - dn * 1.6);
    if (alpha <= 0) return;
    for (const s of stars) {
      const x = s.x * W, y = s.y * H * 0.7;
      const tw = 0.5 + 0.5 * Math.sin(s.tw + t * s.sp);
      ctx.globalAlpha = alpha * (0.3 + tw * 0.7);
      ctx.fillStyle = '#cfe6ff';
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawShooters(dn) {
    const alpha = Math.max(0, 1 - dn * 1.5);
    for (let i = shooters.length - 1; i >= 0; i--) {
      const s = shooters[i];
      s.age += 0.016; s.x += s.vx; s.y += s.vy;
      const k = s.age / 1.2;
      if (k >= 1) { shooters.splice(i, 1); continue; }
      const g = ctx.createLinearGradient(s.x, s.y, s.x - 80, s.y - 30);
      g.addColorStop(0, `rgba(220,235,255,${alpha * (1 - k)})`);
      g.addColorStop(1, 'rgba(220,235,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - 80, s.y - 30);
      ctx.stroke();
    }
  }

  function drawMoon(dn, lunar) {
    const cx = W * 0.62, cy = H * 0.18;
    const r = 46;
    // Sun emerges as dn -> 1
    const sunAlpha = Math.max(0, dn - 0.2) * 1.25;
    const moonAlpha = Math.max(0, 1 - dn * 1.4);

    // Glow
    if (moonAlpha > 0) {
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 5);
      grd.addColorStop(0, `rgba(180,200,255,${0.18 * moonAlpha * (0.6 + lunar * 0.6)})`);
      grd.addColorStop(1, 'rgba(180,200,255,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(cx, cy, r * 5, 0, Math.PI * 2); ctx.fill();

      // Moon body
      ctx.fillStyle = `rgba(220,225,240,${moonAlpha})`;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

      // Crescent shadow
      ctx.fillStyle = `rgba(8,10,28,${moonAlpha * 0.92})`;
      ctx.beginPath(); ctx.arc(cx + r * 0.35, cy - r * 0.05, r * 0.92, 0, Math.PI * 2); ctx.fill();

      // Craters
      ctx.fillStyle = `rgba(170,180,210,${moonAlpha * 0.5})`;
      [[-12, -8, 5], [-22, 10, 3], [-5, 16, 4]].forEach(c => {
        ctx.beginPath(); ctx.arc(cx + c[0], cy + c[1], c[2], 0, Math.PI * 2); ctx.fill();
      });
    }

    if (sunAlpha > 0) {
      const sx = W * 0.74, sy = H * 0.22;
      const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 6);
      grd.addColorStop(0, `rgba(255,220,170,${0.35 * sunAlpha})`);
      grd.addColorStop(1, 'rgba(255,220,170,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(sx, sy, r * 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,235,200,${sunAlpha})`;
      ctx.beginPath(); ctx.arc(sx, sy, r * 0.95, 0, Math.PI * 2); ctx.fill();
    }
  }

  function waveY(x, baseY, lineIdx, totalLines, p, time) {
    // Multi-layer noise
    const wind = p.wind, freq = p.freq, lunar = p.lunar;
    const depthK = lineIdx / totalLines; // 0 top, 1 bottom
    const amp = (10 + 36 * lunar + 18 * wind) * (0.4 + depthK * 1.2);
    const k1 = freq * 0.006;
    const k2 = freq * 0.011;
    const k3 = freq * 0.003;
    const phase = time * (0.6 + wind * 0.4);

    let y = baseY;
    y += Math.sin(x * k1 + phase + lineIdx * 0.5) * amp * 0.55;
    y += Math.sin(x * k2 - phase * 1.3 + lineIdx * 0.3) * amp * 0.3;
    y += Math.sin(x * k3 + phase * 0.5) * amp * 0.5;
    // Wind skew — pushes waves rightward
    y += Math.sin(x * 0.004 + phase * 0.8) * wind * 6;

    // Ripples
    for (const rp of ripples) {
      const dx = x - rp.x;
      const dy = baseY - rp.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      const k = rp.t / rp.life;
      if (k >= 1) continue;
      const radius = k * 380;
      const band = Math.exp(-Math.abs(d - radius) * 0.04);
      const decay = 1 - k;
      y += Math.sin((d - radius) * 0.08) * band * decay * rp.amp;
    }
    return y;
  }

  function drawWaves(p, dn) {
    const totalLines = Math.floor(36 * (0.55 + p.density * 0.6));
    const topY = H * 0.42;
    const bottomY = H * 0.98;
    const step = 6; // x sample step

    // Glow accumulation buffer via composite
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < totalLines; i++) {
      const k = i / (totalLines - 1);
      const baseY = topY + (bottomY - topY) * k;
      const depthK = k;

      // Hue: cyan→violet, slight day shift
      const cyan = [120, 200, 255];
      const violet = [170, 130, 255];
      const day = [220, 230, 255];
      const c1 = lerpColor(cyan, violet, depthK);
      const c2 = lerpColor(c1, day, dn * 0.5);

      const baseAlpha = 0.18 + 0.55 * Math.pow(1 - Math.abs(depthK - 0.5) * 1.4, 1.5);
      const lineW = 0.8 + depthK * 1.2;

      ctx.strokeStyle = `rgba(${c2[0]|0},${c2[1]|0},${c2[2]|0},${baseAlpha})`;
      ctx.lineWidth = lineW;
      ctx.beginPath();

      let prevY = 0;
      for (let x = -step; x <= W + step; x += step) {
        const y = waveY(x, baseY, i, totalLines, p, t);
        if (x === -step) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        prevY = y;
      }
      ctx.stroke();

      // Sparkle highlights on a subset of lines
      if (i % 3 === 0 && depthK > 0.15) {
        const count = Math.floor(8 + p.density * 14);
        for (let s = 0; s < count; s++) {
          const xx = (s / count) * W + Math.sin(t * 0.5 + i + s) * 30 + (t * 20 * p.wind) % (W / count);
          const yy = waveY(xx, baseY, i, totalLines, p, t);
          const sp = 0.5 + 0.5 * Math.sin(t * 3 + s * 1.7 + i);
          const alpha = baseAlpha * (0.6 + sp * 0.6);
          ctx.fillStyle = `rgba(180,220,255,${alpha})`;
          ctx.beginPath();
          ctx.arc(xx, yy, 0.8 + sp * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Brighter crest highlights — moonlight/sunlight reflection
      if (depthK > 0.25 && depthK < 0.85) {
        for (let x = 0; x < W; x += 4) {
          const y = waveY(x, baseY, i, totalLines, p, t);
          const yp = waveY(x - 4, baseY, i, totalLines, p, t);
          const slope = y - yp;
          if (Math.abs(slope) < 0.4) {
            const moonShimmer = Math.exp(-Math.pow((x - W * 0.62) / (W * 0.18), 2));
            const a = 0.06 + moonShimmer * 0.25 * p.lunar;
            ctx.fillStyle = `rgba(200,225,255,${a})`;
            ctx.fillRect(x, y - 0.6, 3, 1.2);
          }
        }
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function lerpColor(a, b, k) {
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  }

  function drawLabels(p) {
    ctx.font = '11px "JetBrains Mono", monospace';
    for (let i = labels.length - 1; i >= 0; i--) {
      const L = labels[i];
      L.age += 0.016;
      const k = L.age / L.life;
      if (k >= 1) { labels.splice(i, 1); continue; }
      const fade = k < 0.15 ? k / 0.15 : (k > 0.85 ? (1 - k) / 0.15 : 1);
      const baseY = H * 0.42 + (L.band / 8) * (H * 0.45);
      const y = waveY(L.x, baseY, L.band * 4, 36, p, t);
      ctx.strokeStyle = `rgba(160,200,255,${0.4 * fade})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(L.x, y);
      ctx.lineTo(L.x, y - 22);
      ctx.stroke();
      ctx.fillStyle = `rgba(200,225,255,${0.9 * fade})`;
      ctx.fillText(L.v, L.x - 10, y - 26);
      // anchor dot
      ctx.fillStyle = `rgba(180,220,255,${fade})`;
      ctx.beginPath(); ctx.arc(L.x, y, 1.6, 0, Math.PI * 2); ctx.fill();
    }
    if (Math.random() < 0.04) spawnLabel();
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;

    const p = getParams();
    // Auto day/night when not paused
    if (!p.paused) {
      // dayNight cycles slowly (0..1..0)
      window.__DataSea.params.dayNight = (Math.sin(t * 0.05 * p.cycleSpeed) + 1) / 2 * (p.autoDayNight ? 1 : 0) + (p.autoDayNight ? 0 : p.dayNight);
    }
    const dn = Math.max(0, Math.min(1, p.dayNight));

    // Background
    ctx.fillStyle = bgGradient(dn);
    ctx.fillRect(0, 0, W, H);

    drawStars(dn);
    maybeShoot();
    drawShooters(dn);
    drawMoon(dn, p.lunar);

    // Update ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i].t += dt;
      if (ripples[i].t > ripples[i].life) ripples.splice(i, 1);
    }

    drawWaves(p, dn);
    drawLabels(p);

    // Vignette
    const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(tick);
  }

  // Init
  resize();
  window.__DataSea = window.__DataSea || {};
  window.__DataSea.params = window.__DataSea.params || {
    lunar: 0.72, wind: 1.38, freq: 2.45, density: 0.89,
    dayNight: 0.0, autoDayNight: false, cycleSpeed: 1, paused: false,
  };
  requestAnimationFrame(tick);
})();
