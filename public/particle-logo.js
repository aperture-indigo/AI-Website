(function () {
  const stages = document.querySelectorAll(".particle-logo");

  if (!stages.length) {
    return;
  }

  class ParticleLogo {
    constructor(stage) {
      this.stage = stage;
      this.canvas = stage.querySelector("canvas");
      this.context = this.canvas.getContext("2d");
      this.text = stage.dataset.text || "AI";
      this.particles = [];
      this.mouse = { x: 0, y: 0, active: false };
      this.dispersed = false;
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.frame = 0;

      this.handlePointerMove = this.handlePointerMove.bind(this);
      this.handlePointerEnter = this.handlePointerEnter.bind(this);
      this.handlePointerLeave = this.handlePointerLeave.bind(this);
      this.resize = this.resize.bind(this);
      this.animate = this.animate.bind(this);

      this.resizeObserver = new ResizeObserver(this.resize);
      this.resizeObserver.observe(this.stage);

      this.stage.addEventListener("pointermove", this.handlePointerMove);
      this.stage.addEventListener("pointerenter", this.handlePointerEnter);
      this.stage.addEventListener("pointerleave", this.handlePointerLeave);
    }

    resize() {
      const bounds = this.stage.getBoundingClientRect();
      this.width = Math.max(220, Math.round(bounds.width));
      this.height = Math.max(220, Math.round(bounds.height));
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.createParticles();
    }

    createParticles() {
      const sampleCanvas = document.createElement("canvas");
      const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
      const sampleScale = 2;
      const sampleWidth = Math.round(this.width * sampleScale);
      const sampleHeight = Math.round(this.height * sampleScale);
      const fontSize = Math.round(sampleHeight * 0.46);

      sampleCanvas.width = sampleWidth;
      sampleCanvas.height = sampleHeight;
      sampleContext.clearRect(0, 0, sampleWidth, sampleHeight);
      sampleContext.fillStyle = "#fff";
      sampleContext.textAlign = "center";
      sampleContext.textBaseline = "middle";
      sampleContext.font = `900 ${fontSize}px Ailerons, Manrope, sans-serif`;
      sampleContext.fillText(this.text, sampleWidth / 2, sampleHeight / 2 + fontSize * 0.04);

      const image = sampleContext.getImageData(0, 0, sampleWidth, sampleHeight).data;
      const targets = [];
      const step = Math.max(6, Math.round(sampleWidth / 64));

      for (let y = 0; y < sampleHeight; y += step) {
        for (let x = 0; x < sampleWidth; x += step) {
          const alpha = image[(y * sampleWidth + x) * 4 + 3];

          if (alpha > 80) {
            targets.push({
              x: x / sampleScale,
              y: y / sampleScale
            });
          }
        }
      }

      const previous = this.particles;
      this.particles = targets.map((target, index) => {
        const oldParticle = previous[index];
        const angle = Math.random() * Math.PI * 2;
        const radius = this.width * (0.045 + Math.random() * 0.08);
        const shear = (Math.random() - 0.5) * this.width * 0.04;

        return {
          x: oldParticle ? oldParticle.x : target.x,
          y: oldParticle ? oldParticle.y : target.y,
          vx: 0,
          vy: 0,
          tx: target.x,
          ty: target.y,
          scatterX: target.x + Math.cos(angle) * radius + shear,
          scatterY: target.y + Math.sin(angle) * radius,
          size: 1.2 + Math.random() * 1.7,
          hueShift: Math.random(),
          driftPhase: Math.random() * Math.PI * 2,
          driftSpeed: 0.012 + Math.random() * 0.018,
          driftRadius: 3 + Math.random() * 7
        };
      });
    }

    handlePointerEnter() {
      this.mouse.active = true;
    }

    handlePointerMove(event) {
      const bounds = this.canvas.getBoundingClientRect();
      this.mouse.x = event.clientX - bounds.left;
      this.mouse.y = event.clientY - bounds.top;
      this.dispersed = this.isPointerNearLogo();
    }

    handlePointerLeave() {
      this.dispersed = false;
      this.mouse.active = false;
    }

    isPointerNearLogo() {
      const hitRadius = Math.max(18, this.width * 0.055);

      for (const particle of this.particles) {
        const dx = particle.tx - this.mouse.x;
        const dy = particle.ty - this.mouse.y;

        if (dx * dx + dy * dy < hitRadius * hitRadius) {
          return true;
        }
      }

      return false;
    }

    animate() {
      const ctx = this.context;
      this.frame += 1;
      ctx.clearRect(0, 0, this.width, this.height);

      const pulse = 0.55 + Math.sin(this.frame * 0.018) * 0.18;
      const gradient = ctx.createRadialGradient(
        this.width / 2,
        this.height / 2,
        0,
        this.width / 2,
        this.height / 2,
        this.width * 0.52
      );
      gradient.addColorStop(0, `rgba(124, 107, 255, ${0.1 + pulse * 0.08})`);
      gradient.addColorStop(0.7, "rgba(79, 70, 200, 0.08)");
      gradient.addColorStop(1, "rgba(53, 45, 143, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.width, this.height);

      for (const particle of this.particles) {
        let targetX = this.dispersed ? particle.scatterX : particle.tx;
        let targetY = this.dispersed ? particle.scatterY : particle.ty;

        if (this.dispersed) {
          const drift = this.frame * particle.driftSpeed + particle.driftPhase;
          targetX += Math.cos(drift) * particle.driftRadius;
          targetY += Math.sin(drift * 0.76) * particle.driftRadius * 0.72;
        }

        if (this.mouse.active) {
          const dx = particle.x - this.mouse.x;
          const dy = particle.y - this.mouse.y;
          const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = Math.max(0, 58 - distance) / 58;
          targetX += (dx / distance) * force * 26;
          targetY += (dy / distance) * force * 26;
        }

        particle.vx += (targetX - particle.x) * 0.045;
        particle.vy += (targetY - particle.y) * 0.045;
        particle.vx *= 0.78;
        particle.vy *= 0.78;
        particle.x += particle.vx;
        particle.y += particle.vy;

        const floatPulse = this.dispersed
          ? 0.88 + Math.sin(this.frame * particle.driftSpeed * 1.8 + particle.driftPhase) * 0.18
          : 1;
        const glow = this.dispersed ? 0.78 + particle.hueShift * 0.16 : 0.96;
        const indigo = 246 + particle.hueShift * 28;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${indigo}, 92%, 72%, ${glow})`;
        ctx.shadowColor = particle.hueShift > 0.5 ? "#b497ff" : "#7c6bff";
        ctx.shadowBlur = this.dispersed ? 14 + particle.hueShift * 8 : 14;
        ctx.arc(particle.x, particle.y, particle.size * floatPulse, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      requestAnimationFrame(this.animate);
    }

    start() {
      this.resize();
      this.animate();
    }
  }

  const startLogos = () => {
    stages.forEach((stage) => {
      new ParticleLogo(stage).start();
    });
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(startLogos);
  } else {
    window.addEventListener("load", startLogos, { once: true });
  }
})();
