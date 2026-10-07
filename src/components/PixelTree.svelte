<script module>
  export function mountPixelTree(canvas, interactionTarget = canvas.parentElement || canvas) {
    const ctx=canvas.getContext('2d');if(!ctx)return()=>{};
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    let width=0,height=0,dpr=1,visible=false,disposed=false,frame=0,last=0,time=0,lastDraw=0;
    let energy=0,hovering=false,focused=false;
    let seed=421;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const pixels=[],tips=[],segments=[],rootTips=[];
    function dot(x,y,z,kind,alpha=.6,size=1.25,segment=-1,distance=0,light=1){
      pixels.push({x,y,z,kind,alpha,size,segment,distance,light});
    }
    function limb(x,y,z,angle,length,thickness,depth,root=false,parent=-1,distance=0){
      const bend=(random()-.5)*.34,zBend=(random()-.5)*length*.95;
      const id=segments.length;segments.push({parent,start:distance,length});
      const steps=Math.ceil(length/1.8);let endX=x,endY=y,endZ=z;
      for(let i=0;i<=steps;i++){
        const t=i/steps,a=angle+bend*t;
        endX=x+Math.cos(a)*length*t;endY=y+Math.sin(a)*length*t;endZ=z+zBend*t;
        const breadth=thickness*(1-t*.35);
        for(let j=-breadth/2;j<=breadth/2;j+=1.7){
          const surface=Math.sqrt(Math.max(0,1-(j/(breadth/2))**2));
          dot(endX-Math.sin(a)*j,endY+Math.cos(a)*j,endZ+surface*breadth*.4,
            root?'root':'wood',.45+random()*.3,1+random()*.4,id,distance+length*t,.65+surface*.35);
        }
      }
      if(depth===0){
        if(root)rootTips.push({id,length:distance+length,x:endX});
        else tips.push({x:endX,y:endY,z:endZ});
        return;
      }
      for(const side of [-1,1]){
        let next=angle+bend+side*((root?.46:.49)+random()*.16);
        next=root?Math.max(.12,Math.min(Math.PI-.12,next)):Math.max(-Math.PI+.12,Math.min(-.12,next));
        limb(endX,endY,endZ,next,length*(.65+random()*.1),Math.max(1.1,thickness*.61),depth-1,root,id,distance+length);
      }
    }
    // Use the same visible-surface spacing and shading for trunk and boughs.
    // Every bough begins on this shared centerline before extending into depth.
    const trunkAt=y=>({x:150+Math.sin((218-y)/90*3.5)*4,y,z:0});
    for(let y=218;y>=128;y-=1.8){
      const t=(218-y)/90,{x,z}=trunkAt(y),thickness=12-t*7;
      for(let j=-thickness/2;j<=thickness/2;j+=1.7){
        const surface=Math.sqrt(Math.max(0,1-(j/(thickness/2))**2));
        dot(x+j,y,z+surface*thickness*.4,'wood',.45+random()*.3,1+random()*.4,-1,218-y,.65+surface*.35);
      }
    }
    for(const [y,angle,length,thickness,depth] of [[167,-2.43,43,6,4],[150,-.76,43,5,4],[133,-1.69,40,5,4],[176,-.47,39,4,3],[156,-2.04,37,4,3]]){
      const base=trunkAt(y);limb(base.x,base.y,base.z,angle,length,thickness,depth);
    }
    function foliage(x,y,z,rx,ry,rz,count){
      for(let i=0;i<count;i++){
        const vertical=1-2*random(),angle=random()*Math.PI*2,ring=Math.sqrt(1-vertical*vertical);
        const radius=.65+.35*Math.cbrt(random());
        const nx=Math.cos(angle)*ring,ny=vertical,nz=Math.sin(angle)*ring;
        const light=Math.max(.2,Math.min(1,.56-nx*.22-ny*.26+nz*.28));
        dot(x+nx*rx*radius,y+ny*ry*radius,z+nz*rz*radius,'leaf',.38+random()*.4,1+random()*.65,-1,0,light);
      }
    }
    // Dense overlapping leaf volumes fill the top while retaining small gaps and boughs.
    for(const tip of tips)foliage(tip.x,tip.y,tip.z,13+random()*6,11+random()*4,14+random()*8,85);
    for(const [x,y,z,rx,ry] of [[100,92,0,36,29],[150,65,-9,40,30],[195,91,0,36,31],[137,116,21,38,28],[191,127,17,29,23],[80,126,9,26,21]])
      foliage(x,y,z,rx,ry,27,330);
    for(const [angle,length] of [[.23,39],[.65,40],[1.12,44],[1.68,42],[2.22,40],[2.83,38]])
      limb(150,218,0,angle,length,5.5,3,true);
    // Each pulse follows one tip's actual ancestry, rather than lighting a horizontal band.
    const selected=[rootTips[5],rootTips[29],rootTips[43]].map((tip,i)=>{
      const path=new Set();let id=tip.id;
      while(id!==-1){path.add(id);id=segments[id].parent;}
      return {path,length:tip.length,period:19+i*4,delay:[0,7,14][i],speed:8+i*.65};
    });
    const projected=pixels.map(p=>{
      const perspective=420/(420-p.z);
      const x=150+(p.x-150)*perspective,y=215+(p.y-215)*perspective-p.z*.12;
      const depth=Math.max(0,Math.min(1,(p.z+55)/110));
      const base=p.kind==='root'?[108,112,185]:p.kind==='leaf'?[159,145,238]:[191,180,239];
      const shade=.53+p.light*.34+depth*.25;
      return {...p,x,y,base:base.map(v=>Math.min(255,Math.round(v*shade))),alpha:p.alpha*(.55+depth*.55),size:p.size*(.85+depth*.25)};
    }).filter(p=>p.x>15&&p.x<285&&p.y>14&&p.y<338).sort((a,b)=>a.z-b.z);
    function render(seconds){
      if(!width||!height||disposed)return;
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
      const scale=Math.min(width/300,height/354);
      ctx.translate((width-300*scale)/2,(height-354*scale)/2);ctx.scale(scale,scale);
      // A faint elliptical ground contour reinforces depth without moving the tree.
      for(let i=0;i<100;i++){
        const a=i/100*Math.PI*2;
        ctx.fillStyle='rgba(116,120,159,.15)';ctx.fillRect(150+Math.cos(a)*119,219+Math.sin(a)*12,1,1);
      }
      const pulses=selected.map(route=>{
        const phase=(seconds+route.delay)%route.period;
        return {...route,head:route.length-phase*route.speed};
      });
      for(const p of projected){
        let pulse=0;
        if(!motion.matches)for(const route of pulses){
          if(p.kind==='root'&&route.path.has(p.segment)&&route.head> -9)
            pulse=Math.max(pulse,Math.exp(-Math.pow((p.distance-route.head)/7,2)));
          else if(p.kind==='wood'&&p.segment===-1&&route.head<0&&route.head> -80)
            pulse=Math.max(pulse,Math.exp(-Math.pow((p.distance+route.head)/9,2))*.65);
        }
        const rootEnergy=p.kind==='root'?energy:0;
        // Keep the collar fixed; expansion blends in along the first part of each root.
        const collar=Math.min(1,p.distance/16);
        const rootScale=1+(motion.matches?0:rootEnergy*.10*collar*collar*(3-2*collar));
        const x=150+(p.x-150)*rootScale,y=218+(p.y-218)*rootScale;
        const rgb=p.base.map((v,i)=>Math.min(255,Math.round((v+([107,243,226][i]-v)*pulse*.95)*(1+rootEnergy*.10))));
        ctx.fillStyle=`rgba(${rgb},${Math.min(.98,p.alpha+pulse*.42)})`;
        const size=(p.size+pulse*.2)*rootScale;ctx.fillRect(x,y,size,size);
        if(rootEnergy>.005){ctx.fillStyle=`rgba(${rgb},${rootEnergy*.018})`;ctx.fillRect(x-1.5,y-1.5,size+3,size+3);}
        if(pulse>.18){ctx.fillStyle=`rgba(60,190,191,${pulse*.055})`;ctx.fillRect(x-2,y-2,size+4,size+4);}
      }
    }
    function stop(){cancelAnimationFrame(frame);frame=0;last=0;canvas.dataset.motion=motion.matches?'static':'paused';}
    function tick(now){
      frame=0;if(disposed||!visible||document.hidden)return;
      const dt=last?Math.min((now-last)/1000,.06):0;last=now;time+=dt;
      energy+=((hovering||focused?1:0)-energy)*(1-Math.exp(-dt*3));
      if(now-lastDraw>1000/30){render(time);lastDraw=now;}
      frame=requestAnimationFrame(tick);
    }
    function sync(){stop();if(disposed||!width||!height)return;if(motion.matches){energy=hovering||focused?1:0;render(0);}else if(visible&&!document.hidden){canvas.dataset.motion='running';frame=requestAnimationFrame(tick);}}
    function resize(){
      const r=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.5);
      if(width===r.width&&height===r.height&&dpr===ratio)return;
      width=r.width;height=r.height;dpr=ratio;canvas.width=Math.max(1,Math.floor(width*dpr));canvas.height=Math.max(1,Math.floor(height*dpr));render(motion.matches?0:time);sync();
    }
    const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});
    const observer=new ResizeObserver(resize);intersection.observe(canvas);observer.observe(canvas);
    function enter(){hovering=true;if(motion.matches)sync();}function leave(){hovering=false;if(motion.matches)sync();}
    function focus(){focused=true;if(motion.matches)sync();}function blur(){focused=false;if(motion.matches)sync();}
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
  let canvas=$state();
  onMount(()=>mountPixelTree(canvas));
</script>
<div tabindex="0" role="img" aria-label="Pixel tree with branching roots below the ground. Slow teal pulses follow selected roots upward into the trunk beneath a dense, layered canopy. Hover or focus to emphasize the roots with a brighter glow and gentle expansion.">
  <canvas bind:this={canvas} aria-hidden="true"></canvas>
</div>
<style>
  div{display:block;width:100%;aspect-ratio:1/1.18;position:relative}
  div:focus-visible{outline:1px solid #a5a7ff;outline-offset:4px}
  canvas{display:block;width:100%;height:100%;pointer-events:none}
</style>
