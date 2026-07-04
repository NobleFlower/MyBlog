(function () {
  const canvas = document.createElement("canvas");
  canvas.id = "petals-canvas";
  Object.assign(canvas.style, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: 9999,
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let w, h;
  const particles = [];
  const fallingPetals = [];
  const FALLING_COUNT = 25;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  // ─── 鼠标粒子爆炸 ───────────────────────────
  function spawnBurst(x, y) {
    const count = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 2 + Math.random() * 3,
        alpha: 1,
        decay: 0.015 + Math.random() * 0.02,
        color: Math.random() > 0.5 ? "#f9a8d4" : "#fbcfe8",
      });
    }
  }

  // ─── 背景飘花 ───────────────────────────────
  for (let i = 0; i < FALLING_COUNT; i++) {
    fallingPetals.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 3 + Math.random() * 4,
      speed: 0.3 + Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 0.6,
      alpha: 0.4 + Math.random() * 0.3,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
    });
  }

  // ─── 节流：鼠标移动不要太频繁触发 ────────────
  let lastSpawn = 0;
  window.addEventListener("mousemove", (e) => {
    const now = Date.now();
    if (now - lastSpawn > 40) {       // 每40ms最多爆一次
      spawnBurst(e.clientX, e.clientY);
      lastSpawn = now;
    }
  });

  // ─── 主循环 ─────────────────────────────────
  function draw() {
    ctx.clearRect(0, 0, w, h);

    // 鼠标粒子
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03;        // 微重力
      p.alpha -= p.decay;
      p.r *= 0.98;         // 逐渐缩小

      if (p.alpha <= 0 || p.r < 0.3) {
        particles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // 背景飘花
    for (const p of fallingPetals) {
      p.y += p.speed;
      p.x += p.drift;
      p.rot += p.rotSpeed;

      if (p.y > h + 20) {
        p.y = -20;
        p.x = Math.random() * w;
      }
      if (p.x > w + 20) p.x = -20;
      if (p.x < -20) p.x = w + 20;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r, p.r * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#f9a8d4";
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(draw);
  }

  draw();
})();