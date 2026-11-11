/* IF You... — floating background made from the channel's shape library (line art, black/white/red).
   Calm drift, slow rotation, soft fade in/out, slight parallax on scroll. Honors prefers-reduced-motion. */
(function () {
  const cv = document.createElement("canvas");
  cv.id = "bg";
  cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const ctx = cv.getContext("2d");
  const RED = "193,18,31", WHITE = "232,232,232";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, DPR = 1, items = [], scrollY = 0;

  /* ---------- shape drawers: draw around (0,0), unit size s, time t ---------- */
  const TAU = Math.PI * 2;
  const circle = (r) => { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); };
  const S = {
    atom(s, t) { for (let i = 0; i < 3; i++) { ctx.save(); ctx.rotate(i * Math.PI / 3); ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.32, 0, 0, TAU); ctx.stroke(); const a = t * (0.9 + i * 0.2); ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.arc(Math.cos(a) * s, Math.sin(a) * s * 0.32, s * 0.05, 0, TAU); ctx.fill(); ctx.restore(); } circle(s * 0.1); },
    planet(s) { circle(s * 0.55); ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.22, -0.35, 0, TAU); ctx.stroke(); },
    orbits(s, t) { [0.35, 0.65, 1].forEach((k, i) => { circle(s * k); const a = t * (1.2 - i * 0.3) + i * 2; ctx.beginPath(); ctx.arc(Math.cos(a) * s * k, Math.sin(a) * s * k, s * 0.05, 0, TAU); ctx.fill(); }); },
    cube(s, t) { const p = []; for (let i = 0; i < 8; i++) { let x = i & 1 ? 1 : -1, y = i & 2 ? 1 : -1, z = i & 4 ? 1 : -1; const a = t * 0.6, b = t * 0.4; [x, z] = [x * Math.cos(a) - z * Math.sin(a), x * Math.sin(a) + z * Math.cos(a)]; [y, z] = [y * Math.cos(b) - z * Math.sin(b), y * Math.sin(b) + z * Math.cos(b)]; const k = 2.6 / (3.2 + z); p.push([x * s * 0.5 * k, y * s * 0.5 * k]); } for (let i = 0; i < 8; i++) for (const j of [1, 2, 4]) if (!(i & j)) { ctx.beginPath(); ctx.moveTo(...p[i]); ctx.lineTo(...p[i | j]); ctx.stroke(); } },
    pyramid(s, t) { const a = t * 0.5; const b = [0, 1, 2, 3].map((i) => [Math.cos(a + i * Math.PI / 2) * s * 0.8, s * 0.45 + Math.sin(a + i * Math.PI / 2) * s * 0.22]); const top = [0, -s * 0.8]; ctx.beginPath(); b.forEach((q, i) => (i ? ctx.lineTo(...q) : ctx.moveTo(...q))); ctx.closePath(); ctx.stroke(); b.forEach((q) => { ctx.beginPath(); ctx.moveTo(...q); ctx.lineTo(...top); ctx.stroke(); }); },
    dna(s, t) { for (let i = 0; i < 14; i++) { const y = -s + (i / 13) * s * 2, a = i * 0.55 + t; const x1 = Math.sin(a) * s * 0.35, x2 = -x1; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.globalAlpha *= 0.6; ctx.stroke(); ctx.globalAlpha /= 0.6; ctx.beginPath(); ctx.arc(x1, y, s * 0.035, 0, TAU); ctx.arc(x2, y, s * 0.035, 0, TAU); ctx.fill(); } },
    gear(s, t) { const n = 12; ctx.save(); ctx.rotate(t * 0.4); ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const a0 = i / (n * 2) * TAU, a1 = (i + 1) / (n * 2) * TAU, r = i % 2 ? s * 0.78 : s; ctx.lineTo(Math.cos(a0) * r, Math.sin(a0) * r); ctx.lineTo(Math.cos(a1) * r, Math.sin(a1) * r); } ctx.closePath(); ctx.stroke(); circle(s * 0.3); ctx.restore(); },
    hourglass(s, t) { ctx.beginPath(); ctx.moveTo(-s * 0.5, -s); ctx.lineTo(s * 0.5, -s); ctx.lineTo(-s * 0.5, s); ctx.lineTo(s * 0.5, s); ctx.closePath(); ctx.stroke(); const k = (t * 0.15) % 1; ctx.beginPath(); ctx.moveTo(0, -s * 0.05); ctx.lineTo(0, s * (0.2 + 0.7 * k)); ctx.stroke(); },
    eye(s, t) { ctx.beginPath(); ctx.moveTo(-s, 0); ctx.quadraticCurveTo(0, -s * 0.75, s, 0); ctx.quadraticCurveTo(0, s * 0.75, -s, 0); ctx.stroke(); circle(s * 0.3); ctx.beginPath(); ctx.arc(Math.sin(t * 0.7) * s * 0.08, 0, s * 0.12, 0, TAU); ctx.fill(); },
    infinity(s, t) { ctx.beginPath(); for (let i = 0; i <= 80; i++) { const a = i / 80 * TAU, d = 1 + Math.sin(a) ** 2; const x = s * Math.cos(a) / d, y = s * Math.sin(a) * Math.cos(a) / d; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); const a = t, d = 1 + Math.sin(a) ** 2; ctx.beginPath(); ctx.arc(s * Math.cos(a) / d, s * Math.sin(a) * Math.cos(a) / d, s * 0.06, 0, TAU); ctx.fill(); },
    radar(s, t) { [0.33, 0.66, 1].forEach((k) => circle(s * k)); const a = t * 0.8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s); ctx.stroke(); },
    compass(s, t) { circle(s); ctx.save(); ctx.rotate(Math.sin(t * 0.6) * 0.5); ctx.beginPath(); ctx.moveTo(0, -s * 0.8); ctx.lineTo(s * 0.12, 0); ctx.lineTo(0, s * 0.8); ctx.lineTo(-s * 0.12, 0); ctx.closePath(); ctx.stroke(); ctx.restore(); },
    wave(s, t) { ctx.beginPath(); for (let i = 0; i <= 60; i++) { const x = -s + i / 60 * s * 2; const y = Math.sin(i / 5 + t * 1.5) * s * 0.25 * Math.sin(i / 60 * Math.PI); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); },
    triangle(s, t) { ctx.save(); ctx.rotate(t * 0.2); ctx.beginPath(); for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * TAU / 3; ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s); } ctx.closePath(); ctx.stroke(); ctx.restore(); },
    blackhole(s, t) { for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(0, 0, s * (0.4 + i * 0.15), s * (0.12 + i * 0.045), Math.sin(t * 0.2) * 0.1, 0, TAU); ctx.stroke(); } ctx.beginPath(); ctx.arc(0, 0, s * 0.28, 0, TAU); ctx.fillStyle = "#0A0A0C"; ctx.fill(); ctx.stroke(); },
    neural(s, t) { const L = [[-1, [-0.6, 0, 0.6]], [0, [-0.9, -0.3, 0.3, 0.9]], [1, [-0.45, 0.45]]].map(([x, ys]) => ys.map((y) => [x * s * 0.85, y * s * 0.8]));
      for (let l = 0; l < 2; l++) for (const a of L[l]) for (const b of L[l + 1]) { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.globalAlpha *= 0.5; ctx.stroke(); ctx.globalAlpha /= 0.5; }
      L.flat().forEach((p, i) => { ctx.beginPath(); ctx.arc(p[0], p[1], s * (0.07 + 0.03 * Math.max(0, Math.sin(t * 2 + i))), 0, TAU); ctx.fill(); }); },
    tree(s, t) { const br = (x, y, a, len, d) => { if (d === 0) return; const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke(); const w = 0.45 + Math.sin(t * 0.5) * 0.05; br(x2, y2, a - w, len * 0.7, d - 1); br(x2, y2, a + w, len * 0.7, d - 1); }; br(0, s, -Math.PI / 2, s * 0.6, 6); },
    pendulum(s, t) { const a = Math.sin(t * 1.4) * 0.6; ctx.beginPath(); ctx.moveTo(-s * 0.4, -s); ctx.lineTo(s * 0.4, -s); ctx.stroke(); const x = Math.sin(a) * s * 1.6, y = -s + Math.cos(a) * s * 1.6; ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, s * 0.16, 0, TAU); ctx.stroke(); },
    scales(s, t) { const a = Math.sin(t * 0.7) * 0.18; ctx.beginPath(); ctx.moveTo(0, -s * 0.6); ctx.lineTo(0, s); ctx.moveTo(-s * 0.4, s); ctx.lineTo(s * 0.4, s); ctx.stroke(); const lx = -Math.cos(a) * s, ly = -s * 0.6 - Math.sin(a) * s, rx = Math.cos(a) * s, ry = -s * 0.6 + Math.sin(a) * s; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ry); ctx.stroke(); [[lx, ly], [rx, ry]].forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - s * 0.25, y + s * 0.45); ctx.lineTo(x + s * 0.25, y + s * 0.45); ctx.closePath(); ctx.stroke(); }); },
  };
  // one family of shapes per channel pillar, picked in rotation so every pillar is always on screen
  const PILLARS = [["blackhole", "planet", "orbits"], ["neural"], ["eye", "dna"], ["hourglass", "infinity"], ["tree", "wave"], ["atom", "pendulum"], ["pyramid", "compass"], ["scales"]];

  function spawn(i, fresh) {
    const big = Math.random() < 0.25;
    return {
      kind: (() => { const g = PILLARS[i % PILLARS.length]; return g[Math.floor(Math.random() * g.length)]; })(),
      x: Math.random() * W, y: Math.random() * H,
      s: (big ? 52 + Math.random() * 30 : 22 + Math.random() * 26) * (W < 600 ? 0.75 : 1),
      vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12 - 0.04,
      rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 0.0015,
      t0: Math.random() * 100, speed: 0.25 + Math.random() * 0.35,
      red: Math.random() < 0.18,
      depth: 0.3 + Math.random() * 0.7,
      life: 0, max: 1400 + Math.random() * 1600, fade: fresh ? 0 : 1,
    };
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const n = Math.round(Math.min(12, Math.max(8, (W * H) / 110000)));
    items = Array.from({ length: n }, (_, i) => Object.assign(spawn(i, false), { life: Math.random() * 1000 }));
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(50, now - last) / 16.67; last = now;
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < items.length; i++) {
      const p = items[i];
      if (!reduce) { p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.life += dt; }
      const edge = Math.min(1, p.life / 120, (p.max - p.life) / 120);
      if (p.life > p.max || p.x < -200 || p.x > W + 200 || p.y < -200 || p.y > H + 200) { items[i] = spawn(i, true); continue; }
      const a = Math.max(0, edge) * (p.red ? 0.42 : 0.12) * (0.6 + p.depth * 0.4);
      const col = p.red ? RED : WHITE;
      ctx.save();
      ctx.translate(p.x, p.y - scrollY * 0.08 * p.depth);
      ctx.rotate(p.rot);
      ctx.globalAlpha = a;
      ctx.strokeStyle = `rgb(${col})`; ctx.fillStyle = `rgb(${col})`;
      ctx.lineWidth = p.red ? 1.6 : 1.2;
      if (p.red) { ctx.shadowColor = `rgba(${RED},0.8)`; ctx.shadowBlur = 10; }
      S[p.kind](p.s * (0.8 + p.depth * 0.3), (now / 1000) * p.speed + p.t0);
      ctx.restore();
    }
    if (!reduce) requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("scroll", () => { scrollY = window.scrollY; if (reduce) frame(performance.now()); }, { passive: true });
  document.addEventListener("visibilitychange", () => { last = performance.now(); });
  resize();
  requestAnimationFrame(frame);
})();
