// Generated from src/components/ContourField.svelte.

  // The canvas engine is exported so the existing static site can reuse it.
  // No drawing libraries, WebGL, shaders, or third-party dependencies.
  export function mountContourField(canvas, interactionTarget = canvas) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return () => {};
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const target = interactionTarget || canvas;
    let width = 0, height = 0, pixelRatio = 1;
    let frame = 0, elapsed = 0, previous = 0, lastPaint = 0;
    let visible = false, disposed = false, staticPainted = false;
    let pointer = { x: 0, y: 0, active: false, strength: 0 };
    let values = new Float32Array(0), columns = 0, rows = 0;
    const gridSize = 9;
    const colors = ['rgba(112,86,215,.54)', 'rgba(139,117,247,.74)', 'rgba(191,183,255,.96)'];

    function scalar(x, y, time) {
      const scale = Math.min(width, height);
      const u = (x - width * .5) / scale * 3.6;
      const v = (y - height * .5) / scale * 3.6;
      let field = Math.sin(u * 1.65 + time * .17)
        + .76 * Math.cos(v * 1.85 - time * .13)
        + .48 * Math.sin(u * 1.2 + v * 1.5 + time * .11)
        + .2 * (u * u - v * v);
      if (pointer.strength > .001) {
        const dx = (x - pointer.x) / scale;
        const dy = (y - pointer.y) / scale;
        field += pointer.strength * 1.8 * Math.exp(-(dx * dx + dy * dy) / (2 * .17 * .17));
      }
      return field;
    }

    function render(time) {
      if (disposed || !width || !height) return;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.fillStyle = '#090a10';
      ctx.fillRect(0, 0, width, height);
      for (let y = 0; y <= rows; y++) {
        for (let x = 0; x <= columns; x++) {
          values[y * (columns + 1) + x] = scalar(x * gridSize, y * gridSize, time);
        }
      }
      const scan = motion.matches ? width * .68 : ((time * 25 + width * .18) % (width + 80)) - 40;
      const paths = colors.map(() => new Path2D());
      function dottedSegment(a, b) {
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const distance = Math.hypot(dx, dy);
        const count = Math.max(1, Math.round(distance / 4.5));
        for (let i = 0; i < count; i++) {
          const f = (i + .5) / count;
          const x = a[0] + dx * f, y = a[1] + dy * f;
          const d = scan - x;
          const band = Math.abs(d) < 13 ? 2 : (d > 0 && d < 68 ? 1 : 0);
          const radius = band === 2 ? 1.15 : .85;
          paths[band].moveTo(x + radius, y);
          paths[band].arc(x, y, radius, 0, Math.PI * 2);
        }
      }
      // Marching squares extracts actual constant-value contours of the field.
      for (let level = -2.8; level <= 3.2; level += .4) {
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < columns; x++) {
            const index = y * (columns + 1) + x;
            const samples = [values[index], values[index + 1], values[index + columns + 2], values[index + columns + 1]];
            if (samples.every(v => v >= level) || samples.every(v => v < level)) continue;
            const px = x * gridSize, py = y * gridSize;
            const corners = [[px, py], [px + gridSize, py], [px + gridSize, py + gridSize], [px, py + gridSize]];
            const hits = [];
            for (let edge = 0; edge < 4; edge++) {
              const next = (edge + 1) % 4;
              if ((samples[edge] < level) === (samples[next] < level)) continue;
              const f = (level - samples[edge]) / (samples[next] - samples[edge]);
              hits.push([corners[edge][0] + (corners[next][0] - corners[edge][0]) * f,
                corners[edge][1] + (corners[next][1] - corners[edge][1]) * f]);
            }
            if (hits.length === 2) dottedSegment(hits[0], hits[1]);
            else if (hits.length === 4) {
              const centerAbove = samples.reduce((a, b) => a + b, 0) / 4 >= level;
              if (centerAbove === (samples[0] >= level)) {
                dottedSegment(hits[0], hits[1]); dottedSegment(hits[2], hits[3]);
              } else {
                dottedSegment(hits[0], hits[3]); dottedSegment(hits[1], hits[2]);
              }
            }
          }
        }
      }
      paths.forEach((path, index) => { ctx.fillStyle = colors[index]; ctx.fill(path); });
      const glow = ctx.createLinearGradient(scan - 32, 0, scan + 10, 0);
      glow.addColorStop(0, 'rgba(110,85,225,0)');
      glow.addColorStop(.8, 'rgba(135,110,250,.08)');
      glow.addColorStop(1, 'rgba(135,110,250,0)');
      ctx.fillStyle = glow; ctx.fillRect(scan - 32, 0, 42, height);
      ctx.fillStyle = 'rgba(170,150,255,.4)'; ctx.fillRect(scan, 0, .8, height);
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
      previous = now; elapsed += dt;
      pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * (1 - Math.exp(-dt * 7));
      if (now - lastPaint >= 1000 / 30) { render(elapsed); lastPaint = now; }
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      stop();
      if (disposed || !width || !height) return;
      if (motion.matches) {
        pointer.strength = 0;
        if (!staticPainted) { render(0); staticPainted = true; }
      } else if (visible && !document.hidden) {
        canvas.dataset.motion = 'running'; frame = requestAnimationFrame(tick);
      }
    }
    function resize() {
      const bounds = canvas.getBoundingClientRect();
      const nextRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      if (width === bounds.width && height === bounds.height && pixelRatio === nextRatio) return;
      width = bounds.width; height = bounds.height; pixelRatio = nextRatio;
      canvas.width = Math.max(1, Math.floor(width * pixelRatio));
      canvas.height = Math.max(1, Math.floor(height * pixelRatio));
      columns = Math.ceil(width / gridSize); rows = Math.ceil(height / gridSize);
      values = new Float32Array((columns + 1) * (rows + 1));
      staticPainted = false;
      if (!motion.matches) render(elapsed);
      sync();
    }
    function move(event) {
      if (motion.matches) return;
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left; pointer.y = event.clientY - bounds.top;
      pointer.active = true;
    }
    function leave() { pointer.active = false; }
    function preference() { staticPainted = false; sync(); }
    const intersection = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting; sync();
    }, { threshold: 0 });
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
