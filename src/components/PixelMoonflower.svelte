<script module>
  export function mountPixelMoonflower(canvas, target=canvas.parentElement) {
    const ctx=canvas.getContext('2d');if(!ctx)return()=>{};
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    const started=performance.now();
    let width=0,height=0,dpr=1,frame=0,disposed=false,hover=false,energy=0,last=0;
    let seed=817;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const petals=[],foliage=[];
    // One continuous, five-pleated trumpet rather than separate daisy petals.
    for(let y=-1;y<=1;y+=.022)for(let x=-1;x<=1;x+=.022){
      const radius=Math.hypot(x,y),angle=Math.atan2(y,x),edge=.94+.06*Math.cos(angle*5+.5);
      if(radius>edge)continue;
      const fold=Math.pow(.5+.5*Math.cos(angle*5+.5),14);
      petals.push({x,y,r:radius,a:angle,fold,grain:random(),edge:radius>edge-.025});
    }
    // Heart-shaped climbing leaves, stippled in subdued indigo.
    for(const leaf of [{x:186,y:167,side:-1,size:25},{x:217,y:180,side:1,size:20}]){
      for(let y=-1;y<1.15;y+=.065)for(let x=-1.2;x<1.2;x+=.065){
        const yy=-y;
        if((x*x+yy*yy-1)**3-x*x*yy**3>0)continue;
        const px=x*leaf.size,py=y*leaf.size;
        foliage.push({x:leaf.x+leaf.side*(px*.72-py*.55),y:leaf.y+px*.3+py*.55,light:Math.abs(x)<.08||Math.abs((y+Math.abs(x)*.7)% .3)<.05,grain:random()});
      }
    }
    const ease=t=>t*t*(3-2*t);
    function draw(now){
      if(!width||!height)return;
      const progress=motion.matches?1:Math.max(0,Math.min(1,(now-started-350)/8500));
      canvas.dataset.bloom=progress===1?'open':'opening';
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
      const scale=Math.min(width/400,height/210)*(1+energy*.045);
      ctx.translate(width/2,height/2);ctx.scale(scale,scale);ctx.translate(-200,-105);
      const pixel=(x,y,size,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,size,size);};
      for(let i=0;i<105;i++){
        const t=i/104,x=201+Math.sin(t*3.5)*13,y=122+t*80;
        pixel(x,y,1.5,'rgba(123,120,186,.75)');pixel(x+1.7,y,1,'rgba(191,183,226,.45)');
      }
      for(const p of foliage)pixel(p.x,p.y,1.15,p.light?'rgba(168,161,226,.72)':`rgba(90,87,153,${.38+p.grain*.3})`);
      // The outer lip unfurls a little later than the throat; neighboring folds
      // open at slightly different rates, keeping the motion soft and organic.
      const opening=ease(progress);
      if(energy>.01){
        const glow=ctx.createRadialGradient(200,87,8,200,87,98);
        glow.addColorStop(0,`rgba(138,120,240,${energy*.12})`);glow.addColorStop(1,'rgba(138,120,240,0)');ctx.fillStyle=glow;ctx.fillRect(100,-12,200,200);
      }
      for(const p of petals){
        const delay=p.r*.1+(.5+.5*Math.sin(p.a*5+.5))*.045;
        const unfold=ease(Math.max(0,Math.min(1,(progress-delay)/(1-delay))));
        const openX=200+p.x*82;
        const openY=85+p.y*68+20*(1-p.r)**2;
        const budX=200+p.x*8+Math.sin(p.r*5+p.a)*3;
        const budY=122-p.r*88;
        const x=budX+(openX-budX)*unfold,y=budY+(openY-budY)*unfold;
        const throat=Math.exp(-p.r*p.r*65),pleat=p.fold*(.3+.7*p.r);
        const shade=(1-opening)*.15+pleat*.20;
        const light=.84+p.grain*.14-shade;
        const rgb=[244*light-throat*83,243*light-throat*86,250*light-throat*45];
        if(p.edge){rgb[0]-=25;rgb[1]-=30;}
        const size=1.12+p.grain*.3+energy*.12;
        pixel(x,y,size,`rgba(${rgb.map(v=>Math.round(v))},${.76+p.grain*.22})`);
      }
      // A small, luminous throat gives the open trumpet depth.
      if(opening>.55){
        ctx.globalAlpha=(opening-.55)/.45;
        for(let i=0;i<5;i++){
          const angle=i*Math.PI*2/5;
          for(let j=0;j<8;j++)pixel(200+Math.cos(angle)*j*.32,105-j*.8,1,'rgba(235,232,214,.9)');
        }
        ctx.globalAlpha=1;
      }
    }
    function tick(now){frame=0;if(disposed)return;const dt=last?Math.min((now-last)/1000,.06):.016;last=now;energy+=((hover?1:0)-energy)*(1-Math.exp(-dt*4));draw(now);if(!motion.matches&&((now-started)<9000||Math.abs(energy-(hover?1:0))>.002))frame=requestAnimationFrame(tick);}
    function wake(){if(disposed)return;if(motion.matches){energy=hover?1:0;draw(performance.now());}else if(!frame){last=0;frame=requestAnimationFrame(tick);}}
    function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(width*dpr));canvas.height=Math.max(1,Math.round(height*dpr));draw(performance.now());wake();}
    function enter(){hover=true;wake();}function leave(){hover=target.matches(':hover')||target===document.activeElement;wake();}
    const observer=new ResizeObserver(resize);observer.observe(canvas);
    target.addEventListener('pointerenter',enter);target.addEventListener('pointerleave',leave);target.addEventListener('focus',enter);target.addEventListener('blur',leave);motion.addEventListener('change',wake);resize();
    return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();target.removeEventListener('pointerenter',enter);target.removeEventListener('pointerleave',leave);target.removeEventListener('focus',enter);target.removeEventListener('blur',leave);motion.removeEventListener('change',wake);};
  }
</script>
<script>
  import { onMount } from 'svelte';
  let canvas=$state();
  onMount(()=>mountPixelMoonflower(canvas));
</script>
<figure tabindex="0" role="img" aria-label="A white pixel moonflower with indigo folds slowly unfurls into an open trumpet-shaped bloom.">
  <canvas bind:this={canvas} aria-hidden="true"></canvas>
</figure>
<style>
  figure{width:100%;aspect-ratio:400/210;margin:0}
  canvas{display:block;width:100%;height:100%}
</style>
