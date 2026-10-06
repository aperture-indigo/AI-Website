<script module>
  export function mountOrbitalNetwork(canvas, interactionTarget = canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};
    const target = interactionTarget || canvas;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, height = 0, dpr = 1, visible = false, disposed = false;
    let frame = 0, previous = 0, elapsed = 0, lastDraw = 0, energy = 0;
    let hovering = false, focused = false;
    let seed = 831;
    const random = () => { seed = (Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
    const sphere = Array.from({length: 440}, (_, i) => {
      const y = 1-2*(i+.5)/440, a = i*2.3999632297, r = Math.sqrt(1-y*y);
      return {x: Math.cos(a)*r, y, z: Math.sin(a)*r, light: .5+random()*.5};
    });
    const nodes = Array.from({length: 7}, (_, i) => ({
      phase: i*Math.PI*2/7, radius: .72+(i%3)*.09,
      tilt: -.55+(i%3)*.55, speed: .07+(i%3)*.012, size: .058+(i%2)*.014
    }));
    const edges = [[0,2],[2,4],[4,6],[6,1],[1,3],[3,5],[5,0]];
    function pixel(x, y, size, color, alpha) {
      ctx.fillStyle = `rgba(${color},${alpha})`;
      ctx.fillRect(Math.round(x),Math.round(y),size,size);
    }
    function render(time) {
      if (!width || !height || disposed) return;
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,width,height);
      const scale = Math.min(width*.41,height*.35), cx = width*.5, cy = height*.49;
      const project = (x,y,z) => {
        const depth = 3.8/(3.8-z*.3);
        return {x:cx+x*scale*depth,y:cy+y*scale*depth,z,depth};
      };
      const core = project(0,0,0);
      function orbit(node, angle) {
        const radius = node.radius*(1+energy*.085);
        const x = Math.cos(angle)*radius, y = Math.sin(angle)*radius;
        return project(x*Math.cos(node.tilt)-y*.68*Math.sin(node.tilt),
          x*Math.sin(node.tilt)+y*.68*Math.cos(node.tilt), Math.sin(angle)*radius*.55);
      }
      // Quiet, square-dot orbital traces keep the same material as the brain.
      for (const node of nodes.filter((_,i)=>i<3)) {
        for (let j=0;j<125;j++) {
          const p=orbit(node,j/125*Math.PI*2);
          pixel(p.x,p.y,1,'87,95,168',.15+(p.z+1)*.035);
        }
      }
      const points = nodes.map(n=>orbit(n,n.phase+time*n.speed));
      function link(a,b,index,outer=false) {
        const pulse = .5+.5*Math.sin(time*3.5-index*.9);
        const opacity = (outer?.12:.24)+energy*(.18+pulse*.22);
        ctx.strokeStyle = `rgba(64,206,202,${opacity})`;
        ctx.lineWidth = .65+energy*.25;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        // Sparse packets at rest; the bright moving tail grows with interaction.
        const progress = (time*(outer?.095:.15)+index*.173)%1;
        for (let k=0;k<5;k++) {
          const t=progress-k*.016;
          if(t<0)continue;
          pixel(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,k===0?2:1,
            k===0?'168,255,240':'64,206,202',(outer?.3:.58)*(1-k/5)+energy*.28);
        }
      }
      edges.forEach(([a,b],i)=>link(points[a],points[b],i+7,true));
      points.forEach((p,i)=>link(i%2?p:core,i%2?core:p,i));
      function orb(center,radius,isCore=false) {
        const rotation=time*(isCore?.24:.12), ca=Math.cos(rotation),sa=Math.sin(rotation);
        const glow=ctx.createRadialGradient(center.x,center.y,0,center.x,center.y,radius*2.3);
        glow.addColorStop(0,`rgba(${isCore?'108,101,242':'52,200,198'},${isCore?.21+energy*.08:.1+energy*.08})`);
        glow.addColorStop(1,'rgba(25,31,74,0)');
        ctx.fillStyle=glow;ctx.fillRect(center.x-radius*2.3,center.y-radius*2.3,radius*4.6,radius*4.6);
        for (let i=0;i<sphere.length;i+=isCore?1:5) {
          const p=sphere[i],x=p.x*ca+p.z*sa,z=-p.x*sa+p.z*ca;
          const light=(z+1)*.5;
          const alpha=(.12+light*.72)*p.light*(z<0?.35:1);
          const color=isCore?(light>.7?'205,199,255':'112,105,232'):(light>.7?'172,251,237':'60,190,191');
          pixel(center.x+x*radius,center.y+p.y*radius,light>.7?1.5:1,color,alpha);
        }
      }
      const objects=points.map((p,i)=>({p,r:nodes[i].size*scale*(1+energy*.24)*p.depth}));
      objects.push({p:core,r:scale*.215*(1+energy*.055),core:true});
      objects.sort((a,b)=>a.p.z-b.p.z).forEach(o=>orb(o.p,o.r,o.core));
    }
    function stop(){cancelAnimationFrame(frame);frame=0;previous=0;canvas.dataset.motion=motion.matches?'static':'paused';}
    function tick(now){
      frame=0;if(disposed||!visible||document.hidden)return;
      const dt=previous?Math.min((now-previous)/1000,.06):0;previous=now;elapsed+=dt;
      energy+=((hovering||focused?1:0)-energy)*(1-Math.exp(-dt*3));
      if(now-lastDraw>1000/30){render(elapsed);lastDraw=now;}
      frame=requestAnimationFrame(tick);
    }
    function sync(){stop();if(disposed||!width||!height)return;if(motion.matches){energy=0;render(0);}else if(visible&&!document.hidden){canvas.dataset.motion='running';frame=requestAnimationFrame(tick);}}
    function resize(){
      const r=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.5);
      if(width===r.width&&height===r.height&&dpr===ratio)return;
      width=r.width;height=r.height;dpr=ratio;
      canvas.width=Math.max(1,Math.floor(width*dpr));canvas.height=Math.max(1,Math.floor(height*dpr));
      render(motion.matches?0:elapsed);sync();
    }
    function enter(){hovering=true;}function leave(){hovering=false;}
    function focus(){focused=true;}function blur(){focused=false;}
    const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});
    const observer=new ResizeObserver(resize);intersection.observe(canvas);observer.observe(canvas);
    target.addEventListener('pointerenter',enter);target.addEventListener('pointerleave',leave);target.addEventListener('pointercancel',leave);
    target.addEventListener('focus',focus);target.addEventListener('blur',blur);
    document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);resize();
    return()=>{disposed=true;stop();intersection.disconnect();observer.disconnect();
      target.removeEventListener('pointerenter',enter);target.removeEventListener('pointerleave',leave);target.removeEventListener('pointercancel',leave);
      target.removeEventListener('focus',focus);target.removeEventListener('blur',blur);
      document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);
    };
  }
</script>
<script>
  import { onMount } from 'svelte';
  let canvas = $state();
  let surface = $state();
  onMount(() => mountOrbitalNetwork(canvas, surface));
</script>
<div bind:this={surface} tabindex="0" role="img" aria-label="Living network: orbiting pixel nodes exchange data through a glowing core. Hover or focus to energize the connections.">
  <canvas bind:this={canvas} aria-hidden="true"></canvas>
</div>
<style>
  div{display:block;width:100%;aspect-ratio:1/1.18;position:relative;cursor:crosshair}
  div:focus-visible{outline:1px solid #a5a7ff;outline-offset:4px}
  canvas{display:block;width:100%;height:100%;pointer-events:none}
</style>
