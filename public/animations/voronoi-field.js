// Generated from src/components/VoronoiField.svelte.

  // Standalone Canvas 2D engine, also reused by the existing static site.
  export function mountVoronoiField(canvas, interactionTarget = canvas) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return () => {};
    const target = interactionTarget || canvas;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const spacing = 4;
    let width = 0, height = 0, dpr = 1, seeds = [];
    let visible = false, disposed = false, staticPainted = false;
    let frame = 0, previous = 0, lastPaint = 0, elapsed = 0;
    const pointer = { x: 0, y: 0, inside: false, selected: -1 };
    const wrap = (value, size) => ((value % size) + size) % size;
    const shortest = (delta, size) => delta - Math.round(delta / size) * size;

    function initializeSeeds(count) {
      // Deterministic initial layout keeps the reduced-motion image repeatable.
      let state = 17317;
      function random() { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; }
      seeds = Array.from({ length: count }, () => ({
        x: random() * width, y: random() * height,
        angle: random() * Math.PI * 2,
        speed: 2.4 + random() * 2.6,
        phase: random() * Math.PI * 2
      }));
      pointer.selected = -1;
      canvas.dataset.seeds = String(count);
    }

    function selectNearest() {
      let best = Infinity;
      pointer.selected = -1;
      seeds.forEach((seed, index) => {
        const dx = shortest(seed.x - pointer.x, width);
        const dy = shortest(seed.y - pointer.y, height);
        const distance = dx * dx + dy * dy;
        if (distance < best) { best = distance; pointer.selected = index; }
      });
    }

    function update(dt) {
      for (let i = 0; i < seeds.length; i++) {
        const seed = seeds[i];
        if (pointer.inside && pointer.selected === i) {
          const ease = 1 - Math.exp(-dt * 3.8);
          seed.x = wrap(seed.x + shortest(pointer.x - seed.x, width) * ease, width);
          seed.y = wrap(seed.y + shortest(pointer.y - seed.y, height) * ease, height);
        } else {
          const angle = seed.angle + Math.sin(elapsed * .16 + seed.phase) * .85;
          seed.x = wrap(seed.x + Math.cos(angle) * seed.speed * dt, width);
          seed.y = wrap(seed.y + Math.sin(angle) * seed.speed * dt, height);
        }
      }
    }

    function render() {
      if (disposed || !width || !height) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#0f1014'; ctx.fillRect(0, 0, width, height);
      const dim = new Path2D(), bright = new Path2D();
      // Every candidate dot sits on the same 4 CSS-pixel grid.
      for (let y = 2; y < height; y += spacing) {
        for (let x = 2; x < width; x += spacing) {
          let first = Infinity, second = Infinity;
          for (const seed of seeds) {
            let dx = Math.abs(x - seed.x), dy = Math.abs(y - seed.y);
            dx = Math.min(dx, width - dx); dy = Math.min(dy, height - dy);
            const distance = dx * dx + dy * dy;
            if (distance < first) { second = first; first = distance; }
            else if (distance < second) second = distance;
          }
          const difference = Math.sqrt(second) - Math.sqrt(first);
          if (difference > 3.5) continue;
          const path = difference < 1.5 ? bright : dim;
          const radius = difference < 1.5 ? 1.05 : .8;
          path.moveTo(x + radius, y); path.arc(x, y, radius, 0, Math.PI * 2);
        }
      }
      // Cell borders use exactly two batched brightness buckets.
      ctx.fillStyle = 'rgba(112,86,215,.48)'; ctx.fill(dim);
      ctx.fillStyle = 'rgba(160,139,255,.84)'; ctx.fill(bright);
      const centers = new Path2D();
      for (const seed of seeds) {
        // Duplicate at seams so a center dot also wraps continuously.
        for (const ox of [-width, 0, width]) for (const oy of [-height, 0, height]) {
          const x = seed.x + ox, y = seed.y + oy;
          if (x < -2 || x > width + 2 || y < -2 || y > height + 2) continue;
          centers.moveTo(x + 1.9, y); centers.arc(x, y, 1.9, 0, Math.PI * 2);
        }
      }
      ctx.fillStyle = '#d0c8ff'; ctx.fill(centers);
    }

    function stop() {
      cancelAnimationFrame(frame); frame = 0; previous = 0;
      canvas.dataset.motion = motion.matches ? 'static' : 'paused';
    }
    function tick(now) {
      frame = 0;
      if (disposed || !visible || document.hidden) return;
      if (motion.matches) { sync(); return; }
      const dt = previous ? Math.min((now - previous) / 1000, .06) : 0;
      previous = now; elapsed += dt; update(dt);
      if (now - lastPaint >= 1000 / 30) { render(); lastPaint = now; }
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      stop();
      if (disposed || !width || !height) return;
      if (motion.matches) {
        if (!staticPainted) { render(); staticPainted = true; }
      } else if (visible && !document.hidden) {
        canvas.dataset.motion = 'running'; frame = requestAnimationFrame(tick);
      }
    }
    function resize() {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      if (width === bounds.width && height === bounds.height && ratio === dpr) return;
      const oldWidth = width, oldHeight = height;
      width = bounds.width; height = bounds.height; dpr = ratio;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      if (!width || !height) { stop(); return; }
      const count = Math.max(18, Math.min(36, Math.round(width * height / 8000)));
      if (count !== seeds.length || !oldWidth || !oldHeight) initializeSeeds(count);
      else seeds.forEach(seed => { seed.x *= width / oldWidth; seed.y *= height / oldHeight; });
      pointer.inside = false; pointer.selected = -1;
      staticPainted = false;
      if (!motion.matches) render();
      sync();
    }
    function move(event) {
      if (motion.matches) return;
      const bounds = canvas.getBoundingClientRect();
      pointer.x = Math.max(0, Math.min(width, event.clientX - bounds.left));
      pointer.y = Math.max(0, Math.min(height, event.clientY - bounds.top));
      if (!pointer.inside) { pointer.inside = true; selectNearest(); }
    }
    function leave() { pointer.inside = false; pointer.selected = -1; }
    function preference() { leave(); staticPainted = false; sync(); }
    const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: 0 });
    const resizeObserver = new ResizeObserver(resize);
    intersection.observe(canvas); resizeObserver.observe(canvas);
    target.addEventListener('pointermove', move, { passive: true });
    target.addEventListener('pointerleave', leave, { passive: true });
    target.addEventListener('pointercancel', leave, { passive: true });
    motion.addEventListener('change', preference);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('resize', resize, { passive: true });
    resize();
    return () => {
      disposed = true; stop(); intersection.disconnect(); resizeObserver.disconnect();
      target.removeEventListener('pointermove', move); target.removeEventListener('pointerleave', leave);
      target.removeEventListener('pointercancel', leave); motion.removeEventListener('change', preference);
      document.removeEventListener('visibilitychange', sync); window.removeEventListener('resize', resize);
    };
  }
