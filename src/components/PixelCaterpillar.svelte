<script module>
  export function mountPixelCaterpillar(canvas, interactionTarget = canvas.parentElement || canvas) {
    const ctx=canvas.getContext('2d');if(!ctx)return()=>{};
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    let width=0,height=0,dpr=1,visible=false,disposed=false,frame=0,last=0,time=0,lastDraw=0;
    let energy=0,hovering=false,focused=false;
    let seed=581;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const branch=[],segments=[];
    const branchY=x=>173-x*.18;
    for(let x=24;x<374;x+=1.7)for(let y=0;y<8;y+=1.7)
      branch.push({x,y:branchY(x)+y,a:.3+random()*.4,light:1-y/12});
    for(let i=0;i<10;i++){
      const r=12+Math.sin((i+.8)/11*Math.PI)*9,points=[];
      for(let y=-r;y<=r;y+=1.35)for(let x=-14;x<=14;x+=1.35){
        const nx=x/14,ny=y/r;if(nx*nx+ny*ny>1)continue;
        const volume=Math.sqrt(1-nx*nx-ny*ny),light=.42+volume*.4-ny*.14;
        const stripe=Math.abs(nx+.27+Math.sin(ny*4)*.08)<.22;
        const spot=stripe&&Math.abs(Math.abs(ny)-.47)<.12;
        const sideSpot=Math.hypot(nx-.30,ny-.67)<.15;
        const base=spot?[64,184,181]:stripe||sideSpot?[29,31,64]:[159,145,238];
        points.push({x,y,spot,pattern:stripe||sideSpot,rgb:base.map(v=>Math.round(v*light)),alpha:.65+random()*.3,size:.9+random()*.4});
      }
      segments.push({x:93+i*19,r,points});
    }
    const leaf=[];
    for(let y=84;y<121;y+=1.4)for(let x=296;x<337;x+=1.4){
      const u=(x-315)*.78-(y-102)*.63,v=(x-315)*.63+(y-102)*.78;
      if(u*u/25**2+v*v/10**2>1)continue;
      leaf.push({x,y,vein:Math.abs(v)<.9||Math.abs((u+v*1.8)%9)<1.1,a:.45+random()*.4});
    }
    function dot(x,y,size,rgb,alpha){ctx.fillStyle=`rgba(${rgb},${alpha})`;ctx.fillRect(x,y,size,size);}
    function render(seconds){
      if(!width||!height||disposed)return;
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
      const scale=Math.min(width/400,height/210)*(1+(motion.matches?0:energy*.075));ctx.translate((width-400*scale)/2,(height-210*scale)/2);ctx.scale(scale,scale);
      const active=motion.matches?0:1;
      const chew=(.5-.5*Math.cos(seconds*2.1))*active;
      const pause=.5+.5*Math.sin(seconds*.47);
      const nibble=chew*(.4+pause*.6);
      for(const p of branch)dot(p.x,p.y,1.1,[113,109,160].map(v=>Math.round(v*p.light)),p.a);
      // A short stem and veined leaf grow from the top of the supporting branch.
      for(let t=0;t<1;t+=.07)dot(301+t*15,branchY(301)-t*19,1.2,'110,159,174',.7);
      for(const p of leaf){
        const bite=Math.hypot((p.x-297)/1.1,p.y-112);
        if(bite<4+nibble*2)continue;
        dot(p.x,p.y,1.05,p.vein?'161,224,218':'78,122,143',p.a);
      }
      // Prolegs grip the branch; the segmented body barely ripples as it feeds.
      for(let i=0;i<10;i++){
        const s=segments[i],wave=Math.sin(seconds*1.1-i*.65)*.55*active;
        const y=branchY(s.x)-s.r-2+wave;
        if([0,2,4,6,8,9].includes(i))for(let j=0;j<8;j++)
          dot(s.x+4+j*.22,y+s.r-4+j,1.25,'145,133,207',.68);
        for(const p of s.points){
          const strength=energy*(p.spot?1:p.pattern?.45:0);
          const target=p.spot?[157,255,233]:[130,115,213];
          const color=p.rgb.map((v,i)=>Math.round(v+(target[i]-v)*strength));
          if(p.spot&&energy>.01){ctx.shadowColor=`rgba(101,241,216,${energy*.7})`;ctx.shadowBlur=energy*5;}
          dot(s.x+p.x,y+p.y,p.size,color,Math.min(1,p.alpha+strength*.2));
          ctx.shadowBlur=0;
        }
      }
      // Rounded head, small ocelli, and paired mouthparts that close around the leaf.
      const hx=285+nibble*1.8,hy=branchY(285)-12+nibble;
      for(let y=-12;y<13;y+=1.3)for(let x=-11;x<12;x+=1.3){
        const d=x*x/121+y*y/169;if(d>1)continue;
        const light=.5+Math.sqrt(1-d)*.4-y*.009;
        const band=Math.abs(x+y*.18)<2.3;
        dot(hx+x,hy+y,1.05,(band?[40,44,62]:[181,169,238]).map(v=>Math.round(v*light)),.9);
      }
      for(let i=0;i<3;i++)dot(hx+6-i*.6,hy-2+i*2,1.5,'28,34,50',.95);
      dot(hx+7,hy-3,1,'219,212,255',.85);
      for(const side of [-1,1])for(let j=0;j<4;j++)
        dot(hx+9+j,hy+6+side*(2-nibble)*j*.4,1.25,'191,182,240',.9);
      // A few tiny leaf crumbs fall only during a bite and disappear below it.
      if(active)for(let i=0;i<3;i++){
        const t=(seconds*.29+i*.31)%1;
        if(t<.45)dot(299+i*2+Math.sin(t*9+i),115+t*32,1,'102,185,178',(.45-t)*1.1);
      }
    }
    function stop(){cancelAnimationFrame(frame);frame=0;last=0;canvas.dataset.motion=motion.matches?'static':'paused';}
    function tick(now){frame=0;if(disposed||!visible||document.hidden)return;const dt=last?Math.min((now-last)/1000,.06):0;last=now;time+=dt;energy+=((hovering||focused?1:0)-energy)*(1-Math.exp(-dt*3));if(now-lastDraw>1000/30){render(time);lastDraw=now;}frame=requestAnimationFrame(tick);}
    function sync(){stop();if(disposed||!width||!height)return;if(motion.matches){energy=hovering||focused?1:0;render(0);}else if(visible&&!document.hidden){canvas.dataset.motion='running';frame=requestAnimationFrame(tick);}}
    function resize(){const r=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);if(width===r.width&&height===r.height&&dpr===ratio)return;width=r.width;height=r.height;dpr=ratio;canvas.width=Math.max(1,Math.floor(width*dpr));canvas.height=Math.max(1,Math.floor(height*dpr));render(motion.matches?0:time);sync();}
    const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});const observer=new ResizeObserver(resize);intersection.observe(canvas);observer.observe(canvas);
    function update(){if(motion.matches)sync();}
    function enter(){hovering=true;update();}function leave(){hovering=false;update();}
    function focus(){focused=true;update();}function blur(){focused=false;update();}
    interactionTarget.addEventListener('pointerenter',enter);interactionTarget.addEventListener('pointerleave',leave);interactionTarget.addEventListener('pointercancel',leave);interactionTarget.addEventListener('focus',focus);interactionTarget.addEventListener('blur',blur);
    document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);resize();
    return()=>{disposed=true;stop();intersection.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);interactionTarget.removeEventListener('pointerenter',enter);interactionTarget.removeEventListener('pointerleave',leave);interactionTarget.removeEventListener('pointercancel',leave);interactionTarget.removeEventListener('focus',focus);interactionTarget.removeEventListener('blur',blur);};
  }
</script>
<script>
  import { onMount } from 'svelte';
  let canvas=$state();
  onMount(()=>mountPixelCaterpillar(canvas));
</script>
<div tabindex="0" role="img" aria-label="A patterned pixel caterpillar grips a branch and slowly nibbles a leaf growing from its top. Hover or focus to enlarge and illuminate its markings.">
  <canvas bind:this={canvas} aria-hidden="true"></canvas>
</div>
<style>
  div{width:100%;aspect-ratio:400/210}
  div:focus-visible{outline:1px solid #a5a7ff;outline-offset:4px}
  canvas{display:block;width:100%;height:100%}
</style>
