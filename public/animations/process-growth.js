// A single, ten-second growth cycle. Geometry follows the actual responsive grid.
export function mountProcessGrowth(grid) {
  const section=grid.closest('.process-section');
  const canvas=document.createElement('canvas');
  canvas.className='process-growth';canvas.setAttribute('aria-hidden','true');section.append(canvas);
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let paths=[],masks=[],width=0,height=0,start=null,frame=0,progress=0;
  let seed=61;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const clamp=v=>Math.max(0,Math.min(1,v));
  // Arc-length sampling keeps speed consistent even around corners.
  function vine(waypoints,delay,duration,amplitude=5,weight=1.6,leaves=true){
    const points=[];let distance=0;
    for(let i=1;i<waypoints.length;i++){
      const a=waypoints[i-1],b=waypoints[i],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),count=Math.max(1,Math.ceil(length/3));
      for(let j=0;j<count;j++){
        const t=j/count,wave=Math.sin((distance+t*length)/23)*amplitude*Math.sin(Math.PI*t);
        points.push([a[0]+dx*t-dy/(length||1)*wave,a[1]+dy*t+dx/(length||1)*wave]);
      }distance+=length;
    }points.push(waypoints.at(-1));
    const foliage=[];
    if(leaves)for(let i=5;i<points.length-2;i+=5+Math.floor(random()*7))foliage.push({i,side:random()>.5?1:-1,size:4+random()*7});
    paths.push({points,delay,duration,weight,foliage});
  }
  function geometry(){
    seed=61;paths=[];
    const origin=section.getBoundingClientRect(),g=grid.getBoundingClientRect();
    width=origin.width;height=origin.height;
    const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.ceil(width*ratio);canvas.height=Math.ceil(height*ratio);canvas.style.height=`${height}px`;ctx.setTransform(ratio,0,0,ratio,0,0);
    const l=g.left-origin.left,r=g.right-origin.left,t=g.top-origin.top,b=g.bottom-origin.top;
    const cells=[...grid.children].map(el=>{const q=el.getBoundingClientRect();return {l:q.left-origin.left,r:q.right-origin.left,t:q.top-origin.top,b:q.bottom-origin.top};});
    // Loose, staggered shoots emerge along both edges instead of sharing one root.
    for(let i=0;i<8;i++){
      const onBottom=i<5,slot=onBottom?i:i-5;
      const offset=12+slot*(onBottom?22:26)+random()*12;
      const x=onBottom?r-offset:r,y=onBottom?b:b-offset;
      const direction=random()<.5?-1:1,reach=14+random()*26;
      const drift=(random()-.5)*30,bend=(random()-.5)*22;
      const endX=onBottom?x+drift:x+direction*(8+random()*9);
      const endY=onBottom?y+direction*reach:y+drift;
      const shoot=[];
      for(let k=0;k<=20;k++){
        const t=k/20,u=1-t;
        const cx1=onBottom?x+bend:x+direction*reach*.45;
        const cy1=onBottom?y+direction*reach*.35:y+bend;
        const cx2=onBottom?endX-bend:endX;
        const cy2=onBottom?endY:endY-bend;
        shoot.push([u*u*u*x+3*u*u*t*cx1+3*u*t*t*cx2+t*t*t*endX,u*u*u*y+3*u*u*t*cy1+3*u*t*t*cy2+t*t*t*endY]);
      }
      vine(shoot,.03+random()*.23,.16+random()*.22,0,.7+random()*.55);
    }
    vine([[r,b],[l,b],[l,t]],.04,.70,7,2.1);
    vine([[r,b],[r,t],[l,t]],.12,.69,6,1.9);
    for(const [i,c] of cells.entries()){
      const delay=.15+(cells.length-1-i)*.10;
      vine([[c.r,c.b],[c.r,c.t],[c.l,c.t]],delay,.34,5,1.5);
      vine([[c.r,c.b],[c.l,c.b],[c.l,c.t]],delay+.03,.35,4,1.1);
      // Uneven shoots wander above and below the border, with varied bends and timing.
      const count=2+Math.floor(random()*4),firstSide=random()<.5?-1:1;
      for(let j=0;j<count;j++){
        const x=c.l+(c.r-c.l)*(.1+.8*(j+.15+random()*.7)/count);
        const side=j<2?firstSide*(j===0?1:-1):(random()<.5?-1:1);
        const reach=12+random()*27,lean=(random()-.5)*38;
        const curl=random()<.45,turn=(random()<.5?-1:1)*(5+random()*12);
        const a=[x,c.b],b1=[x+lean*.3,c.b+side*reach*.4];
        const b2=[x+lean+(curl?turn:0),c.b+side*reach*(curl?1.35:.7)];
        const end=[x+lean+(curl?-turn*.3:turn),c.b+side*reach*(curl?.65:1)];
        const shoot=[];
        for(let k=0;k<=20;k++){
          const t=k/20,u=1-t;
          shoot.push([u*u*u*a[0]+3*u*u*t*b1[0]+3*u*t*t*b2[0]+t*t*t*end[0],u*u*u*a[1]+3*u*u*t*b1[1]+3*u*t*t*b2[1]+t*t*t*end[1]]);
        }
        vine(shoot,delay+.13+random()*.15,.1+random()*.14,0,.65+random()*.55);
      }
    }
    // Exclude actual text bounds so leaves can never obscure the words.
    masks=[];
    const walker=document.createTreeWalker(grid,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      if(!walker.currentNode.textContent.trim())continue;
      const range=document.createRange();range.selectNodeContents(walker.currentNode);
      for(const q of range.getClientRects())masks.push([q.left-origin.left-4,q.top-origin.top-3,q.width+8,q.height+6]);
    }
    draw(progress);
  }
  function draw(value){
    ctx.clearRect(0,0,width,height);
    for(const path of paths){
      const local=clamp((value-path.delay)/path.duration);
      // Vary the pace with several small hesitations, without reversing growth.
      const pace=local-Math.sin(local*Math.PI*8)*.027;
      const n=Math.min(path.points.length,Math.floor(pace*path.points.length));if(n<2)continue;
      ctx.beginPath();ctx.moveTo(...path.points[0]);for(let i=1;i<n;i++)ctx.lineTo(...path.points[i]);
      ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#7770fa';ctx.lineWidth=path.weight;ctx.shadowColor='#6860ff';ctx.shadowBlur=7;ctx.stroke();ctx.shadowBlur=0;
      ctx.strokeStyle='#b2a6ff';ctx.lineWidth=.5;ctx.stroke();
      for(const leaf of path.foliage){
        if(leaf.i>=n-1)continue;
        const grow=clamp((n-leaf.i)/9),p=path.points[leaf.i],q=path.points[leaf.i+1],angle=Math.atan2(q[1]-p[1],q[0]-p[0])+leaf.side*.85,size=leaf.size*grow;
        ctx.save();ctx.translate(...p);ctx.rotate(angle);ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(size*.25,-size*.48,size,0);ctx.quadraticCurveTo(size*.4,size*.45,0,0);
        ctx.fillStyle=leaf.side>0?'#8272e8':'#5d51b8';ctx.fill();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(size*.8,0);ctx.strokeStyle='#b1a0ff';ctx.lineWidth=.5;ctx.stroke();ctx.restore();
      }
      if(local>0&&local<1){const tip=path.points[n-1];ctx.fillStyle='#d4c9ff';ctx.shadowColor='#9681ff';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(...tip,1.8,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
    }
    ctx.save();ctx.globalCompositeOperation='destination-out';for(const rect of masks)ctx.fillRect(...rect);ctx.restore();
  }
  function tick(now){progress=motion.matches?1:clamp((now-start)/10000);draw(progress);canvas.dataset.growth=progress===1?'complete':'growing';if(progress<1)frame=requestAnimationFrame(tick);}
  const observer=new IntersectionObserver(entries=>{if(start===null&&entries.some(e=>e.isIntersecting)){start=performance.now();observer.disconnect();frame=requestAnimationFrame(tick);}},{threshold:.12});
  canvas.dataset.growth='waiting';const resize=new ResizeObserver(geometry);resize.observe(section);geometry();observer.observe(grid);
  motion.addEventListener('change',()=>{if(start!==null&&motion.matches){cancelAnimationFrame(frame);progress=1;draw(1);canvas.dataset.growth='complete';}});
}
