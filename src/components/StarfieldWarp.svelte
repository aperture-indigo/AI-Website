<script module>
  // Dependency-free Canvas 2D renderer shared with the plain-HTML site.
  export function mountStarfieldWarp(canvas, interactionTarget = canvas) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return () => {};
    const target = interactionTarget || canvas;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, height = 0, dpr = 1, focal = 1, stars = [];
    let frame = 0, previous = 0, visible = false, disposed = false, staticPainted = false;
    let randomState = 51019;
    const pointer = { x: 0, y: 0, inside: false };
    const vanishingPoint = { x: 0, y: 0 };
    function random() { randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0; return randomState / 4294967296; }
    function project(star, vx, vy) { return [vx + star.x / star.z * focal, vy + star.y / star.z * focal]; }
    function respawn(star) { star.x = random() * 2 - 1; star.y = random() * 2 - 1; star.z = .8 + random() * .2; }
    function clear() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#090a10'; ctx.fillRect(0, 0, width, height);
    }
    function initialize() {
      randomState = 51019;
      const count = Math.max(320, Math.min(750, Math.round(width * height / 300)));
      stars = Array.from({ length: count }, () => ({ x: random() * 2 - 1, y: random() * 2 - 1, z: .06 + random() * .94 }));
      vanishingPoint.x = width * .5; vanishingPoint.y = height * .5;
      canvas.dataset.stars = String(count);
    }
    function step(dt, steer = true) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Frame-rate-independent phosphor decay leaves short, soft speed trails.
      ctx.fillStyle = `rgba(9,10,16,${1 - Math.exp(-dt * 11)})`;
      ctx.fillRect(0, 0, width, height);
      const oldX = vanishingPoint.x, oldY = vanishingPoint.y;
      const targetX = steer && pointer.inside ? pointer.x : width * .5;
      const targetY = steer && pointer.inside ? pointer.y : height * .5;
      const ease = 1 - Math.exp(-dt * 3.2);
      vanishingPoint.x += (targetX - vanishingPoint.x) * ease;
      vanishingPoint.y += (targetY - vanishingPoint.y) * ease;
      const dim = new Path2D(), bright = new Path2D();
      for (const star of stars) {
        const before = project(star, oldX, oldY);
        // Near stars accelerate, while distant stars approach slowly.
        star.z -= dt * (.065 + .055 / Math.max(star.z, .06));
        if (star.z < .06) { respawn(star); continue; }
        const after = project(star, vanishingPoint.x, vanishingPoint.y);
        // Skip paths wholly beyond one edge; the canvas clips crossing paths.
        if ((before[0] < 0 && after[0] < 0) || (before[0] > width && after[0] > width)
          || (before[1] < 0 && after[1] < 0) || (before[1] > height && after[1] > height)) continue;
        const path = star.z < .42 ? bright : dim;
        path.moveTo(before[0], before[1]); path.lineTo(after[0], after[1]);
      }
      ctx.lineCap = 'round';
      ctx.lineWidth = .8; ctx.strokeStyle = 'rgba(112,86,215,.66)'; ctx.stroke(dim);
      ctx.lineWidth = 1.25; ctx.strokeStyle = 'rgba(190,176,255,.9)'; ctx.stroke(bright);
    }
    function staticFrame() {
      initialize(); clear();
      // Build real streaks synchronously without starting an animation loop.
      for (let i = 0; i < 12; i++) step(1 / 30, false);
      staticPainted = true;
    }
    function stop() {
      cancelAnimationFrame(frame); frame = 0; previous = 0;
      canvas.dataset.motion = motion.matches ? 'static' : 'paused';
    }
    function tick(now) {
      frame = 0;
      if (disposed || !visible || document.hidden) return;
      if (motion.matches) { sync(); return; }
      const dt = previous ? Math.min((now - previous) / 1000, .05) : 1 / 60;
      previous = now; step(dt); frame = requestAnimationFrame(tick);
    }
    function sync() {
      stop();
      if (disposed || !width || !height) return;
      if (motion.matches) { if (!staticPainted) staticFrame(); }
      else if (visible && !document.hidden) {
        canvas.dataset.motion = 'running'; frame = requestAnimationFrame(tick);
      }
    }
    function resize() {
      const bounds = canvas.getBoundingClientRect(), ratio = Math.min(devicePixelRatio || 1, 1.5);
      if (width === bounds.width && height === bounds.height && ratio === dpr) return;
      width = bounds.width; height = bounds.height; dpr = ratio;
      canvas.width = Math.max(1, Math.floor(width * dpr)); canvas.height = Math.max(1, Math.floor(height * dpr));
      if (!width || !height) { stop(); return; }
      focal = Math.min(width, height) * .26;
      pointer.inside = false; staticPainted = false;
      initialize(); clear();
      if (!motion.matches) { for (let i = 0; i < 6; i++) step(1 / 30, false); }
      sync();
    }
    function move(event) {
      if (motion.matches) return;
      const bounds = canvas.getBoundingClientRect();
      pointer.x = Math.max(0, Math.min(width, event.clientX - bounds.left));
      pointer.y = Math.max(0, Math.min(height, event.clientY - bounds.top)); pointer.inside = true;
    }
    function leave() { pointer.inside = false; }
    function preference() { leave(); staticPainted = false; sync(); }
    const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: 0 });
    const observer = new ResizeObserver(resize);
    intersection.observe(canvas); observer.observe(canvas);
    target.addEventListener('pointermove', move, { passive: true });
    target.addEventListener('pointerleave', leave, { passive: true });
    target.addEventListener('pointercancel', leave, { passive: true });
    motion.addEventListener('change', preference); document.addEventListener('visibilitychange', sync);
    window.addEventListener('resize', resize, { passive: true });
    resize();
    return () => {
      disposed = true; stop(); intersection.disconnect(); observer.disconnect();
      target.removeEventListener('pointermove', move); target.removeEventListener('pointerleave', leave);
      target.removeEventListener('pointercancel', leave); motion.removeEventListener('change', preference);
      document.removeEventListener('visibilitychange', sync); window.removeEventListener('resize', resize);
    };
  }
</script>

<script>
  import { onMount } from 'svelte';
  let { interactionTarget = null } = $props();
  let canvas = $state();
  onMount(() => mountStarfieldWarp(canvas, interactionTarget || canvas.parentElement));
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    pointer-events: none;
    background: #090a10;
  }
</style>
