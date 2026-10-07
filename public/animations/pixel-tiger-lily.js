// Generated from src/components/PixelTigerLily.svelte.

  export function mountPixelTigerLily(canvas, target=canvas.parentElement) {
    const ctx=canvas.getContext('2d');if(!ctx)return()=>{};
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    const started=performance.now(),duration=11700;
    let width=0,height=0,dpr=1,frame=0,disposed=false,hover=false,energy=0,last=0,lastDraw=0;
    let seed=817;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const clamp=v=>Math.max(0,Math.min(1,v)),ease=t=>{t=clamp(t);return t*t*t*(t*(t*6-15)+10);};
    const mix=(a,b,t)=>a+(b-a)*t;
    const origin={x:205,y:125};
    const stem=t=>({x:origin.x-23*t+5*Math.sin(t*Math.PI),y:origin.y+77*t});
    const bezier=(c,t)=>{const u=1-t;return [0,1,2].map(i=>3*u*u*t*c[0][i]+3*u*t*t*c[1][i]+t*t*t*c[2][i]);};
    // Three upright inner petals and three outward-peeling outer petals.
    // All six surfaces share the stem's exact attachment point in world space.
    const shapes=[
      {c:[[-8,-32,-8],[-30,-88,-12],[-56,-81,-8]],w:17,delay:9.4},
      {c:[[2,-32,-14],[20,-90,-18],[25,-83,-10]],w:17,delay:9.8},
      {c:[[20,-30,-8],[63,-69,-8],[75,-62,0]],w:19,delay:9.5},
      {c:[[-18,-12,8],[-63,-56,15],[-81,-27,20]],w:16,delay:8.6},
      {c:[[24,-8,12],[81,-29,20],[76,18,21]],w:20,delay:8.8},
      {c:[[0,-7,24],[8,-30,42],[-18,-23,51]],w:21,delay:9.1}
    ];
    const petals=shapes.map((shape,index)=>{
      const spots=Array.from({length:22},()=>({t:.19+random()*.43,u:(random()-.5)*1.5,r:.014+random()*.009}));
      const points=[];
      for(let t=.005;t<1;t+=.012)for(let u=-1;u<=1;u+=.062){
        const center=bezier(shape.c,t),next=bezier(shape.c,Math.min(1,t+.003));
        const dx=next[0]-center[0],dy=next[1]-center[1],length=Math.hypot(dx,dy)||1;
        const breadth=Math.pow(Math.sin(Math.PI*t),.8)*shape.w;
        const open=[center[0]-dy/length*u*breadth,center[1]+dx/length*u*breadth,center[2]+(1-u*u)*Math.sin(Math.PI*t)*6];
        const angle=index*Math.PI/3,bulge=Math.pow(Math.sin(Math.PI*t),.85)*10;
        const closed=[t*15+Math.cos(angle)*bulge+u*Math.sin(angle)*bulge*.52,-86*t,Math.sin(angle)*bulge-u*Math.cos(angle)*bulge*.52];
        points.push({t,u,open,closed,grain:random(),spot:spots.some(s=>((t-s.t)/s.r)**2+((u-s.u)/(s.r*4))**2<1)});
      }
      return {...shape,index,points};
    });
    // Curved lanceolate leaves: a raised midrib, longitudinal veins, folded
    // surfaces, and a drooping tip, all attached directly to the stem curve.
    const foliage=[];
    for(const leaf of [{at:.46,side:-1,len:55,rise:25,w:9},{at:.69,side:1,len:69,rise:21,w:11},{at:.9,side:-1,len:36,rise:16,w:7}]){
      const root=stem(leaf.at);
      for(let t=0;t<1;t+=.015)for(let u=-1;u<=1;u+=.10){
        const breadth=Math.pow(Math.sin(Math.PI*t),.85)*leaf.w;
        const x=root.x+leaf.side*leaf.len*t,y=root.y-leaf.rise*Math.sin(t*Math.PI*.8)+t**5*14;
        const midrib=Math.abs(u)<.08,vein=Math.abs((Math.abs(u)*3.2+t*.4)%1)<.085;
        const light=.48+(1-Math.abs(u))*.26+(u<0?.12:0)+random()*.07;
        const rgb=midrib?[172,182,219]:vein?[106,129,178]:[83*light,102*light,162*light];
        foliage.push({x:x+u*breadth*.22,y:y+u*breadth*.65+u*u*3*Math.sin(t*Math.PI),rgb,size:1.15});
      }
    }
    function draw(now){
      if(!width||!height)return;
      // Halve the closed-bud pause while preserving the petal-opening cadence.
      const elapsed=Math.max(0,(now-started)/1000);
      const seconds=motion.matches?16:elapsed<4.3?elapsed*2:elapsed+4.3;
      canvas.dataset.bloom=seconds>=16?'open':seconds<8.6?'bud':'opening';
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
      const scale=Math.min(width/400,height/210)*(1+energy*.045);
      ctx.translate(width/2,height/2);ctx.scale(scale,scale);ctx.translate(-200,-105);
      const pixel=(x,y,size,rgb,alpha=1)=>{ctx.fillStyle=`rgba(${rgb.map(Math.round)},${alpha})`;ctx.fillRect(x,y,size,size);};
      for(const p of foliage)pixel(p.x,p.y,p.size,p.rgb);
      for(let i=0;i<=130;i++){
        const p=stem(i/130);
        pixel(p.x-1,p.y,1.7,[66,93,126]);pixel(p.x+.5,p.y,1.35,[138,161,190]);
      }
      if(energy>.01){
        const glow=ctx.createRadialGradient(205,95,8,205,95,105);
        glow.addColorStop(0,`rgba(138,120,240,${energy*.16})`);glow.addColorStop(1,'rgba(138,120,240,0)');ctx.fillStyle=glow;ctx.fillRect(95,-10,220,220);
      }
      const cloud=[];
      const add=(p,rgb,size=1.2)=>cloud.push({x:origin.x+p[0]+p[2]*.13,y:origin.y+p[1]+p[2]*.32,z:p[2],rgb,size});
      for(const petal of petals){
        const open=ease((seconds-petal.delay)/4.1);
        const settle=ease((seconds-12)/4);
        for(const p of petal.points){
          // Slight swelling precedes seam separation, then the tip peels back.
          const swell=1+.065*ease(seconds/8.6);
          const local=clamp(open*(.90+.10*p.t)+settle*.10*(1-p.t));
          const pos=p.closed.map((v,i)=>mix(i===1?v:v*swell,p.open[i],local));
          const ridge=Math.exp(-p.u*p.u*32),edge=Math.abs(p.u)>.91;
          const lighting=.82+p.grain*.10-Math.abs(p.u)*.13+(p.u<0?.06:0);
          const throat=Math.exp(-(((p.t-.28)/.24)**2))*(1-Math.abs(p.u)*.45);
          const rgb=[(190-throat*61)*lighting,(174-throat*64)*lighting,(239-throat*17)*lighting];
          if(ridge){rgb[0]+=ridge*16;rgb[1]+=ridge*14;rgb[2]+=ridge*8;}
          if(edge){rgb[0]+=18;rgb[1]+=18;}
          if(p.spot&&local>.25){const amount=ease((local-.25)/.5);const spot=[39+energy*50,32+energy*134,81+energy*108];for(let i=0;i<3;i++)rgb[i]=mix(rgb[i],spot[i],amount);}
          if(local<.3)for(let i=0;i<3;i++)rgb[i]*=.82+p.u*.09;
          add(pos,rgb,1.15+p.grain*.19);
        }
      }
      // Filaments are present inside the bud and revealed by the peeling petals.
      const spread=ease((seconds-9)/4);
      for(let i=0;i<6;i++){
        const end=[mix(11, -5+i*6,spread),-45-(i%3)*6,mix(-8,7+(i%2)*5,spread)];
        for(let j=0;j<=65;j++){
          const t=j/65;add([end[0]*t+Math.sin(t*Math.PI)*3,end[1]*t,end[2]*t],[192,190,226],1);
        }
        for(let y=-4;y<=4;y+=.8)for(let x=-1.7;x<=1.7;x+=.8){
          if((x/2)**2+(y/4.6)**2>1)continue;
          add([end[0]+x+y*.2,end[1]+y,end[2]+1],[69+energy*55,169+energy*61,171+energy*55],1);
        }
      }
      cloud.sort((a,b)=>a.z-b.z);
      for(const p of cloud)pixel(p.x,p.y,p.size,p.rgb);
      // A small calyx closes the join between the flower and its stem.
      for(let i=0;i<3;i++)for(let j=0;j<13;j++){
        const t=j/12;pixel(origin.x+(i-1)*t*6,origin.y-t*8,1.1,[95,137,158]);
      }
    }
    function tick(now){frame=0;if(disposed)return;const dt=last?Math.min((now-last)/1000,.06):.016;last=now;energy+=((hover?1:0)-energy)*(1-Math.exp(-dt*4));if(now-lastDraw>1000/30){draw(now);lastDraw=now;}if(!motion.matches&&((now-started)<duration+100||Math.abs(energy-(hover?1:0))>.002))frame=requestAnimationFrame(tick);}
    function wake(){if(disposed)return;if(motion.matches){energy=hover?1:0;draw(performance.now());}else if(!frame){last=0;frame=requestAnimationFrame(tick);}}
    function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(width*dpr));canvas.height=Math.max(1,Math.round(height*dpr));draw(performance.now());wake();}
    function enter(){hover=true;wake();}function leave(){hover=target.matches(':hover')||target===document.activeElement;wake();}
    const observer=new ResizeObserver(resize);observer.observe(canvas);
    target.addEventListener('pointerenter',enter);target.addEventListener('pointerleave',leave);target.addEventListener('focus',enter);target.addEventListener('blur',leave);motion.addEventListener('change',wake);resize();
    return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();target.removeEventListener('pointerenter',enter);target.removeEventListener('pointerleave',leave);target.removeEventListener('focus',enter);target.removeEventListener('blur',leave);motion.removeEventListener('change',wake);};
  }
