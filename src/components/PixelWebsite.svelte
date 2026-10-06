<script module>
  export function mountPixelWebsite(canvas, interactionTarget = canvas.parentElement || canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let width=0,height=0,dpr=1,visible=false,disposed=false;
    let frame=0,previous=0,elapsed=0,lastDraw=0,energy=0;
    let hovering=false,focused=false,drawingContent=false;
    const colors={frame:'124,112,215',light:'204,197,255',muted:'103,104,164',teal:'60,190,191'};
    const vibrant={frame:'156,137,255',light:'228,219,255',muted:'164,163,228',teal:'107,243,226'};
    let contentColors=colors;
    function pixel(x,y,color='light',alpha=.65,size=1.3) {
      if(drawingContent) {
        ctx.shadowColor=`rgba(${vibrant[color]},${.2+energy*.65})`;
        ctx.shadowBlur=.6+energy*4;
        alpha=Math.min(1,alpha*(1+energy*.5));
      }
      ctx.fillStyle=`rgba(${drawingContent?contentColors[color]:colors[color]},${alpha})`;ctx.fillRect(x,y,size,size);
    }
    function line(x,y,w,color='light',alpha=.65) {
      for(let i=0;i<w;i+=3)pixel(x+i,y,color,alpha);
    }
    function box(x,y,w,h,color='frame',fill=false) {
      line(x,y,w,color,.8);line(x,y+h,w,color,.65);
      for(let j=3;j<h;j+=3){pixel(x,y+j,color,.65);pixel(x+w,y+j,color,.65);}
      if(fill)for(let j=6;j<h-3;j+=4)for(let i=6;i<w-3;i+=4)
        pixel(x+i,y+j,color,.10+.13*((Math.sin(i*.11+j*.13)+1)*.5),1);
    }
    function text(x,y,widths) {widths.forEach((w,i)=>line(x,y+i*7,w,'muted',.65));}
    function view(index) {
      if(index===0) {
        line(24,10,43,'teal',.8);
        line(24,26,91,'light',.9);line(24,30,91,'light',.65);
        line(24,40,69,'light',.9);line(24,44,69,'light',.65);
        text(24,61,[83,89,62]);box(24,89,49,15,'teal');
        box(133,14,91,91,'frame',true);
        box(151,32,37,32,'light');box(168,49,38,38,'teal');
        line(24,123,198,'muted',.3);
        [24,78,132,186].forEach(x=>line(x,135,30,'muted',.5));
      } else if(index===1) {
        line(24,12,100,'light',.9);text(24,25,[153,119]);
        for(let i=0;i<3;i++) {
          const x=24+i*69;box(x,47,60,90,'frame');
          box(x+9,57,42,31,i===1?'teal':'frame',true);
          line(x+9,100,35,'light',.8);text(x+9,112,[42,35,25]);
        }
      } else if(index===2) {
        box(24,12,88,124,'frame',true);
        // A simple pixel landscape inside an image placeholder.
        for(let i=0;i<66;i+=3) {
          const y=89-Math.sin(i/66*Math.PI)*31;
          pixel(35+i,y,'teal',.65);
        }
        box(78,30,12,12,'light');
        line(131,17,80,'light',.9);line(131,27,65,'light',.85);
        text(131,46,[91,83,88,69]);text(131,83,[87,91,62]);
        box(131,117,56,15,'teal');
      } else {
        line(65,16,118,'light',.9);line(80,27,88,'light',.8);
        text(64,46,[122,113]);
        box(54,71,140,18,'frame');line(63,79,62,'muted',.5);
        box(54,99,140,23,'teal');line(93,110,61,'teal',.9);
        line(24,138,198,'muted',.35);
      }
    }
    function render(time) {
      if(!width||!height||disposed)return;
      contentColors=Object.fromEntries(Object.keys(colors).map(key=>{
        const bright=vibrant[key].split(',').map(Number);
        return [key,colors[key].split(',').map((value,i)=>Math.round(Number(value)+(bright[i]-Number(value))*energy)).join(',')];
      }));
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
      const scale=Math.min(width/280,height/330)*.86*(1+(motion.matches?0:energy*.075));
      ctx.translate((width-280*scale)/2,(height-330*scale)/2);ctx.scale(scale,scale);
      // A constant ambient halo unifies the monitor with the other illustrations.
      // Its intensity stays fixed during hover; only screen content responds.
      ctx.save();ctx.translate(140,170);ctx.scale(1,.92);
      const ambient=ctx.createRadialGradient(0,0,15,0,0,177);
      ambient.addColorStop(0,'rgba(108,101,242,.13)');
      ambient.addColorStop(.58,'rgba(72,76,167,.065)');
      ambient.addColorStop(1,'rgba(25,31,74,0)');
      ctx.fillStyle=ambient;ctx.fillRect(-177,-177,354,354);ctx.restore();
      // The monitor, browser chrome, and stand remain completely stationary.
      ctx.shadowColor='rgba(124,112,215,.3)';ctx.shadowBlur=2;
      box(9,55,261,205,'frame');box(16,62,247,183,'muted');
      [24,32,40].forEach((x,i)=>pixel(x,70,i===0?'teal':'frame',.8,2));
      box(61,68,135,7,'muted');line(16,83,247,'frame',.45);
      box(126,263,28,21,'frame');line(98,287,84,'frame',.8);line(89,291,102,'muted',.6);
      const period=4,hold=2.9,position=time/period;
      const index=Math.floor(position)%4,phase=time%period;
      const t=Math.max(0,Math.min(1,(phase-hold)/(period-hold)));
      const scroll=t*t*t*(t*(t*6-15)+10)*154;
      ctx.save();ctx.beginPath();ctx.rect(18,87,241,153);ctx.clip();
      drawingContent=true;
      ctx.translate(16,87-scroll);view(index);
      ctx.translate(0,154);view((index+1)%4);ctx.restore();
      drawingContent=false;
      // Four understated pixels mark the current view.
      for(let i=0;i<4;i++)pixel(125+i*8,251,i===index?'teal':'muted',i===index?.9:.4,2);
      ctx.shadowBlur=0;
    }
    function stop(){cancelAnimationFrame(frame);frame=0;previous=0;canvas.dataset.motion=motion.matches?'static':'paused';}
    function tick(now){
      frame=0;if(disposed||!visible||document.hidden)return;
      const dt=previous?Math.min((now-previous)/1000,.06):0;previous=now;elapsed+=dt;
      energy+=((hovering||focused?1:0)-energy)*(1-Math.exp(-dt*3));
      if(now-lastDraw>1000/30){render(elapsed);lastDraw=now;}
      frame=requestAnimationFrame(tick);
    }
    function sync(){stop();if(disposed||!width||!height)return;if(motion.matches){energy=hovering||focused?1:0;render(0);}else if(visible&&!document.hidden){canvas.dataset.motion='running';frame=requestAnimationFrame(tick);}}
    function resize(){
      const r=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.5);
      if(width===r.width&&height===r.height&&dpr===ratio)return;
      width=r.width;height=r.height;dpr=ratio;
      canvas.width=Math.max(1,Math.floor(width*dpr));canvas.height=Math.max(1,Math.floor(height*dpr));
      render(motion.matches?0:elapsed);sync();
    }
    const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});
    const observer=new ResizeObserver(resize);intersection.observe(canvas);observer.observe(canvas);
    function update(){if(motion.matches)sync();}
    function enter(){hovering=true;update();}function leave(){hovering=false;update();}
    function focus(){focused=true;update();}function blur(){focused=false;update();}
    interactionTarget.addEventListener('pointerenter',enter);interactionTarget.addEventListener('pointerleave',leave);
    interactionTarget.addEventListener('pointercancel',leave);interactionTarget.addEventListener('focus',focus);interactionTarget.addEventListener('blur',blur);
    document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);resize();
    return()=>{disposed=true;stop();intersection.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);
      interactionTarget.removeEventListener('pointerenter',enter);interactionTarget.removeEventListener('pointerleave',leave);interactionTarget.removeEventListener('pointercancel',leave);interactionTarget.removeEventListener('focus',focus);interactionTarget.removeEventListener('blur',blur);
    };
  }
</script>
<script>
  import { onMount } from 'svelte';
  let canvas = $state();
  onMount(() => mountPixelWebsite(canvas));
</script>
<div tabindex="0" role="img" aria-label="Pixel computer screen scrolling through four website layouts. Hover or focus to gently enlarge and illuminate the screen content.">
  <canvas bind:this={canvas} aria-hidden="true"></canvas>
</div>
<style>
  div{display:block;width:100%;aspect-ratio:1/1.18;position:relative}
  div:focus-visible{outline:1px solid #a5a7ff;outline-offset:4px}
  canvas{display:block;width:100%;height:100%;pointer-events:none}
</style>
