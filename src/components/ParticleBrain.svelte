<script module>
  export function mountParticleBrain(canvas, interactionTarget = canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};
    const target = interactionTarget || canvas;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, height = 0, dpr = 1, visible = false, disposed = false;
    let frame = 0, previous = 0, elapsed = 0, lastDraw = 0, energy = 0, staticPainted = false;
    let hovering = false, focused = false;
    let seed = 1731;
    const random = () => { seed = (Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296; };
    const particles = [];
    function point(x,y,z,fold=1) {
      particles.push({x,y,z,fold,size:.65+random()*.45,brightness:.8+random()*.2});
    }
    // Broad frontal lobes, a long rounded cortex, and a narrow medial fissure.
    // Continuous winding grooves give the surface legible gyri at small sizes.
    for (const side of [-1,1]) {
      for(let i=0;i<4600;i++) {
        const sy=1-2*(i+.5)/4600, angle=i*2.399963229728653;
        const ring=Math.sqrt(1-sy*sy), sx=Math.abs(Math.cos(angle)*ring), sz=Math.sin(angle)*ring;
        const phase=sy*18+Math.sin(sz*6+sx*3)*1.65+Math.sin(sz*11-sx*4)*.35;
        const groove=Math.exp(-Math.pow(Math.sin(phase)*3.6,2));
        const crossGroove=Math.exp(-Math.pow(Math.sin(sz*15+Math.sin(sy*7)*1.4+sx*3)*5,2));
        const lateral=Math.exp(-Math.pow((sy-.22-sz*.13)*18,2))*Math.min(1,sx*3);
        const relief=1-.075*groove-.025*crossGroove-.075*lateral;
        const frontal=1+.075*Math.exp(-Math.pow((sz+.45)*2,2));
        const temporal=1+.09*Math.exp(-Math.pow((sy-.38)*4,2));
        const x=side*(.025+sx*.66*frontal*temporal)*relief;
        const y=(sy*.64-.14+Math.max(0,sz)*.035)*relief;
        const z=sz*.92*relief;
        point(x,y,z,Math.max(.12,1-.78*groove-.2*crossGroove-.65*lateral));
      }
    }
    // Compact posterior cerebellum with finer, horizontal folia.
    for(let i=0;i<1050;i++) {
      const y=1-2*(i+.5)/1050,a=i*2.3999632297,r=Math.sqrt(1-y*y);
      const fold=.5+.5*Math.sin(y*43),relief=.96+.04*fold;
      point(Math.cos(a)*r*.36*relief,.48+y*.22,.46+Math.sin(a)*r*.32,.3+fold*.6);
    }
    // A short, tapered brainstem, nestled beneath the cortex.
    for(let i=0;i<380;i++) {
      const t=random(),a=random()*Math.PI*2,r=.105*(1-t*.52);
      point(Math.cos(a)*r,.46+t*.4,.18+Math.sin(a)*r+t*.14,.65);
    }
    function render(time) {
      if(!width||!height||disposed)return;
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
      const pulse=.5+.5*Math.sin(time*3.5);
      const scale=Math.min(width*.46,height*.38)*(1+energy*.075);
      const ay=time*.24+.70,ax=-.20;
      const cy=Math.cos(ay),sy=Math.sin(ay),cx=Math.cos(ax),sx=Math.sin(ax);
      const floatY=Math.sin(time*.65)*height*.008;
      const project=p=>{
        const x=p.x*cy+p.z*sy,z0=-p.x*sy+p.z*cy;
        const y=p.y*cx-z0*sx,z=p.y*sx+z0*cx;
        const factor=3.8/(3.8-z*.3);
        return {x:width*.5+x*scale*factor,y:height*.47+y*scale*factor+floatY,z,p};
      };
      const projected=particles.map(project).sort((a,b)=>a.z-b.z);
      for(const item of projected) {
        const {p,z}=item;
        const depth=Math.max(0,Math.min(1,(z+.95)/1.9));
        const front=z>0?1:.12;
        const alpha=Math.min(.97,(.25+depth*.65)*p.brightness*(.12+p.fold*.88)*front*(1+energy*(.2+pulse*.18)));
        const bright=depth>.62;
        ctx.fillStyle=bright?`rgba(204,197,255,${alpha})`:`rgba(124,112,215,${alpha})`;
        const size=p.size*(.8+depth*.45);
        ctx.fillRect(item.x-size*.5,item.y-size*.5,size,size);
      }
      // A stylized translucent view of the small, deep central pineal gland.
      const gland=project({x:0,y:.06,z:.17});
      const radius=scale*.035*(1+energy*.24),halo=radius*5;
      const glow=ctx.createRadialGradient(gland.x,gland.y,0,gland.x,gland.y,halo);
      glow.addColorStop(0,`rgba(60,190,191,${.24+energy*(.08+pulse*.06)})`);
      glow.addColorStop(.35,'rgba(60,190,191,.09)');glow.addColorStop(1,'rgba(60,190,191,0)');
      ctx.fillStyle=glow;ctx.fillRect(gland.x-halo,gland.y-halo,halo*2,halo*2);
      for(let i=0;i<45;i++) {
        const y=1-2*(i+.5)/45,a=i*2.3999632297,r=Math.sqrt(1-y*y);
        ctx.fillStyle=`rgba(${i%3?'60,190,191':'172,251,237'},${.5+energy*.2})`;
        ctx.fillRect(gland.x+Math.cos(a)*r*radius,gland.y+y*radius,1.15,1.15);
      }
    }
    function stop(){cancelAnimationFrame(frame);frame=0;previous=0;canvas.dataset.motion=motion.matches?'static':'paused';}
    function tick(now){
      frame=0;if(disposed||!visible||document.hidden)return;
      if(motion.matches){sync();return;}
      const dt=previous?Math.min((now-previous)/1000,.06):0;previous=now;elapsed+=dt;
      energy+=((hovering||focused?1:0)-energy)*(1-Math.exp(-dt*3));
      if(now-lastDraw>1000/30){render(elapsed);lastDraw=now;}
      frame=requestAnimationFrame(tick);
    }
    function sync(){stop();if(disposed||!width||!height)return;if(motion.matches){energy=0;if(!staticPainted){render(0);staticPainted=true;}}else if(visible&&!document.hidden){canvas.dataset.motion='running';frame=requestAnimationFrame(tick);}}
    function resize(){const r=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.5);if(width===r.width&&height===r.height&&dpr===ratio)return;width=r.width;height=r.height;dpr=ratio;canvas.width=Math.max(1,Math.floor(width*dpr));canvas.height=Math.max(1,Math.floor(height*dpr));staticPainted=false;if(!motion.matches)render(elapsed);sync();}
    function enter(){hovering=true;}
    function leave(){hovering=false;}
    function focus(){focused=true;}function blur(){focused=false;}
    function preference(){hovering=false;focused=false;staticPainted=false;sync();}
    const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});
    const observer=new ResizeObserver(resize);intersection.observe(canvas);observer.observe(canvas);
    target.addEventListener('pointerenter',enter);target.addEventListener('pointerleave',leave);target.addEventListener('pointercancel',leave);target.addEventListener('focus',focus);target.addEventListener('blur',blur);
    document.addEventListener('visibilitychange',sync);motion.addEventListener('change',preference);window.addEventListener('resize',resize,{passive:true});resize();
    return()=>{disposed=true;stop();intersection.disconnect();observer.disconnect();target.removeEventListener('pointerenter',enter);target.removeEventListener('pointerleave',leave);target.removeEventListener('pointercancel',leave);target.removeEventListener('focus',focus);target.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',preference);window.removeEventListener('resize',resize);};
  }
</script>
<script>
  import { onMount } from 'svelte';
  let canvas = $state();
  let surface = $state();
  onMount(() => mountParticleBrain(canvas, surface));
</script>
<button bind:this={surface} type="button" aria-label="Pixel brain with a glowing teal pineal gland: hover or focus to gently expand and brighten">
  <canvas bind:this={canvas} aria-hidden="true"></canvas>
</button>
<style>
  button{display:block;width:100%;aspect-ratio:1/1.12;padding:0;background:transparent;border:0;cursor:crosshair}
  button:focus-visible{outline:1px solid #a5a7ff;outline-offset:4px}
  canvas{display:block;width:100%;height:100%;pointer-events:none}
</style>
