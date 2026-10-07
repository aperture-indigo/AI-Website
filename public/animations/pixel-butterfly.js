// Generated from src/components/PixelButterfly.svelte.

  export function mountPixelButterfly(canvas, interactionTarget = canvas.parentElement || canvas) {
    const ctx=canvas.getContext('2d');if(!ctx)return()=>{};
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    let width=0,height=0,dpr=1,visible=false,disposed=false,frame=0,last=0,time=0,lastDraw=0;
    let energy=0,hovering=false,focused=false;
    const flight={phase:0,x:0,y:0,vx:0,vy:0,bank:0,effort:.45,wind:0};
    // Smooth, deterministic gusts give each flight interval a different rhythm.
    function breeze(t,salt){
      const hash=n=>{const v=Math.sin(n*127.1+salt*311.7)*43758.5453;return v-Math.floor(v);};
      const i=Math.floor(t),f=t-i,e=f*f*(3-2*f);
      return hash(i)+(hash(i+1)-hash(i))*e;
    }
    function advanceFlight(dt){
      const gust=(breeze(time*.23,7)-.5)*2;
      const activity=breeze(time*.37,19);
      const effort=Math.max(0,Math.min(1,(activity-.27)/.43));
      flight.effort+=(effort-flight.effort)*(1-Math.exp(-dt*2.8));
      flight.wind=gust;
      const rate=.4+flight.effort*1.8+breeze(time*.9,31)*.25;
      flight.phase+=dt*Math.PI*2*rate;
      // A gust pushes the body off course, then wingbeats gradually recover lift.
      const targetX=gust*15+(breeze(time*.41,11)-.5)*6;
      const targetY=(breeze(time*.28,43)-.5)*18+(1-flight.effort)*10-flight.effort*7;
      flight.vx+=((targetX-flight.x)*4.2-flight.vx*3.2)*dt;
      flight.vy+=((targetY-flight.y)*4.8-flight.vy*3.1)*dt;
      flight.x+=flight.vx*dt;flight.y+=flight.vy*dt;
      const bank=gust*.075-flight.vx*.007;
      flight.bank+=(bank-flight.bank)*(1-Math.exp(-dt*2.3));
    }
    const eyes=[[65,-15,15,12],[43,66,13,11]];
    let seed=947;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    // Paint a finely stippled wing once, then articulate the two wing planes.
    const texture=document.createElement('canvas');texture.width=600;texture.height=1050;
    const ink=texture.getContext('2d');ink.scale(3,3);ink.translate(12,127);
    // Rounded, broad forewings and continuous tapered hindwings follow the reference silhouette.
    const fore=new Path2D('M7 -12 C44 -24 85 -53 112 -49 C135 -48 153 -40 162 -25 C170 -15 153 -7 141 4 C129 16 119 32 108 43 C84 67 48 40 8 10 Z');
    const hind=new Path2D('M8 12 C35 16 72 35 91 52 C113 73 98 91 79 98 C56 103 49 117 51 137 C53 158 72 177 77 190 C82 202 70 204 66 193 C57 180 48 183 42 166 C28 139 14 100 11 68 C8 45 7 24 8 12 Z');
    const veins=[[[8,-8],[57,-27],[111,-44],[156,-26]],[[9,-5],[71,-13],[151,-8]],[[10,0],[74,2],[132,16]],[[10,5],[64,21],[107,45]],[[10,12],[47,35],[89,57]],[[11,19],[41,50],[94,79]],[[12,24],[32,64],[56,101],[44,130],[51,161],[72,193]],[[11,27],[21,70],[33,115],[44,153],[66,184]]];
    // Continuous, antialiased silk beneath fine stippling keeps the silhouette
    // crisp while retaining the material detail of the site's pixel illustrations.
    function paintWings(ink,natural=false){
    for(const [shape,upper] of [[hind,false],[fore,true]]){
      ink.save();ink.clip(shape);
      const silk=ink.createLinearGradient(12,-45,147,155);
      silk.addColorStop(0,natural?'#e5f5c3':upper?'#beb1ed':'#aa99da');silk.addColorStop(.35,natural?'#c2e698':upper?'#9682cf':'#8b76c0');
      silk.addColorStop(.7,natural?'#8bbd88':'#68529f');silk.addColorStop(1,natural?'#d5edb6':'#bcafea');
      ink.fillStyle=silk;ink.fillRect(0,-120,180,335);
      const sheen=ink.createRadialGradient(72,10,4,76,25,118);
      sheen.addColorStop(0,natural?'rgba(253,255,224,.25)':'rgba(225,214,255,.2)');sheen.addColorStop(1,natural?'rgba(54,93,60,.10)':'rgba(40,28,90,.10)');
      ink.fillStyle=sheen;ink.fillRect(0,-120,180,335);
      for(let y=-60;y<203;y+=.85)for(let x=5;x<169;x+=.85){
        const grain=random();ink.fillStyle=grain>.5?'rgba(233,224,255,.12)':'rgba(35,22,69,.10)';
        ink.fillRect(x+(random()-.5)*.4,y,.45+grain*.18,.45+grain*.18);
      }
      // Fine curved veins give the wings structure without heavy dark stripes.
      for(const points of veins){
        const trace=()=>{ink.beginPath();ink.moveTo(...points[0]);for(let i=1;i<points.length-1;i++)ink.quadraticCurveTo(...points[i],(points[i][0]+points[i+1][0])/2,(points[i][1]+points[i+1][1])/2);ink.lineTo(...points.at(-1));};
        trace();ink.strokeStyle=natural?'rgba(57,98,55,.25)':'rgba(36,22,76,.25)';ink.lineWidth=1.6;ink.stroke();
        trace();ink.strokeStyle=natural?'rgba(244,255,209,.56)':'rgba(212,196,250,.46)';ink.lineWidth=.48;ink.stroke();
      }
      ink.strokeStyle=natural?'rgba(104,74,132,.48)':'rgba(48,30,88,.36)';ink.lineWidth=4;ink.stroke(shape);
      ink.strokeStyle=natural?'rgba(216,210,244,.7)':'rgba(213,195,252,.65)';ink.lineWidth=.85;ink.stroke(shape);
      ink.restore();
    }
    }
    paintWings(ink);
    function drawEyes(context,highlight=0){
      for(const [x,y,rx,ry] of eyes){
        context.save();context.translate(x,y);context.rotate(-.2);context.scale(1,ry/rx);
        const iris=context.createRadialGradient(-rx*.17,-rx*.18,0,0,0,rx*1.1);
        iris.addColorStop(0,highlight?'#e2fff4':'#b7eee0');iris.addColorStop(.16,'#81d5c5');
        iris.addColorStop(.25,'#202643');iris.addColorStop(.42,'#273956');
        iris.addColorStop(.56,highlight?'#b2ffdf':'#54afa6');iris.addColorStop(.76,highlight?'#82ead3':'#438f94');
        iris.addColorStop(.84,'#403660');iris.addColorStop(.94,highlight?'#d0b7ff':'#ac91da');iris.addColorStop(1,'#6e559f');
        context.fillStyle=iris;context.beginPath();context.arc(0,0,rx*1.08,0,Math.PI*2);context.fill();
        context.strokeStyle='rgba(222,206,255,.5)';context.lineWidth=.5;context.stroke();context.restore();
      }
    }
    drawEyes(ink);
    const naturalTexture=document.createElement('canvas');naturalTexture.width=600;naturalTexture.height=1050;
    const naturalInk=naturalTexture.getContext('2d');naturalInk.scale(3,3);naturalInk.translate(12,127);
    seed=947;paintWings(naturalInk,true);drawEyes(naturalInk);
    const blended=document.createElement('canvas');blended.width=600;blended.height=1050;
    const blendInk=blended.getContext('2d');let lastBlend=-1;
    function blendWings(){
      if(Math.abs(energy-lastBlend)<.001)return;
      lastBlend=energy;blendInk.clearRect(0,0,600,1050);
      blendInk.globalAlpha=1;blendInk.globalCompositeOperation='source-over';blendInk.drawImage(texture,0,0);
      blendInk.globalCompositeOperation='source-atop';blendInk.globalAlpha=energy;blendInk.drawImage(naturalTexture,0,0);
      blendInk.globalAlpha=1;blendInk.globalCompositeOperation='source-over';
    }
    const transitionColor=(a,b)=>`rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*energy))})`;

    function pixel(x,y,size,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x+size/2,y+size/2,size*.5,0,Math.PI*2);ctx.fill();}
    function render(seconds){
      if(!width||!height||disposed)return;
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
      const scale=Math.min(width/415,height/355)*(1+(motion.matches?0:energy*.075));
      blendWings();
      const moving=!motion.matches;
      const lift=moving?Math.sin(flight.phase-.6)*flight.effort*1.5:0;
      ctx.translate(width*.5+(moving?flight.x*scale:0),height*.32+(moving?flight.y+lift:0)*scale);
      ctx.scale(scale,scale);ctx.rotate(moving?flight.bank:0);
      const stroke=Math.pow(.5-.5*Math.cos(flight.phase),1.35);
      const flap=moving?.18+stroke*(.18+flight.effort*.88):.22;
      for(const side of [-1,1]){
        ctx.save();
        // Wing hinges share the thorax; foreshortening reveals their depth.
        const wingAngle=flap+(moving?side*flight.wind*.07*Math.sin(flight.phase+.4):0);
        ctx.transform(side*Math.cos(wingAngle),-Math.sin(wingAngle)*.15,0,1,0,0);
        ctx.globalAlpha=.66+Math.cos(wingAngle)*.08;
        ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
        ctx.drawImage(blended,0,0,600,1050,-12,-127,200,350);
        ctx.shadowBlur=0;
        if(energy>.005){
          // Indigo light traces the wing boundaries while the membranes stay translucent.
          ctx.save();ctx.globalAlpha=energy*.8;ctx.strokeStyle='#9c89ff';ctx.lineWidth=.85;
          ctx.shadowColor='#7660ff';ctx.shadowBlur=14;
          ctx.stroke(hind);ctx.stroke(fore);
          ctx.shadowBlur=5;ctx.strokeStyle='#c1acff';ctx.lineWidth=.45;ctx.stroke(hind);ctx.stroke(fore);ctx.restore();
          for(const [x,y,r] of [[65,-15,27],[43,66,23]]){
            const glow=ctx.createRadialGradient(x,y,2,x,y,r);
            glow.addColorStop(0,`rgba(94,240,215,${energy*.22})`);glow.addColorStop(1,'rgba(94,240,215,0)');
            ctx.fillStyle=glow;ctx.fillRect(x-r,y-r,r*2,r*2);
          }
          ctx.save();ctx.globalAlpha*=energy;drawEyes(ctx,1);ctx.restore();
        }
        ctx.restore();
      }
      // Segmented abdomen, a softly lit thorax, legs, and feathered antennae.
      const body=new Path2D('M0 -21 C7 -19 6 -1 5 11 C5 34 2 54 0 59 C-3 52 -5 30 -5 11 C-6 -1 -7 -19 0 -21 Z');
      const bodyLight=ctx.createLinearGradient(-6,0,6,0);
      bodyLight.addColorStop(0,transitionColor([101,85,131],[125,133,91]));bodyLight.addColorStop(.43,transitionColor([213,200,233],[246,240,207]));bodyLight.addColorStop(.72,transitionColor([167,152,198],[211,218,167]));bodyLight.addColorStop(1,transitionColor([81,69,105],[100,119,81]));
      ctx.fillStyle=bodyLight;ctx.fill(body);
      ctx.save();ctx.clip(body);
      for(let y=-17;y<55;y+=1.2){
        const r=y<9?4.5:Math.max(.7,4.1-(y-9)*.065);
        for(let x=-r;x<=r;x+=1.1)pixel(x,y,.5,`rgba(230,217,250,${.10+.16*(.5+.5*Math.sin(x*17+y*3))})`);
        if(y>10&&Math.floor(y)%6===0){ctx.strokeStyle='rgba(72,55,103,.3)';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(-r,y);ctx.quadraticCurveTo(0,y+2,r,y);ctx.stroke();}
      }
      ctx.restore();
      for(const side of [-1,1]){
        // Curved central shafts with separate paired combs, broad in the middle
        // and tapering to fine tips, like the close-up reference.
        const antenna=t=>({x:side*(3+8*t+19*t*t),y:-17-45*t});
        for(let i=0;i<=70;i++){
          const p=antenna(i/70);
          pixel(p.x,p.y,1.15,'rgba(204,197,246,.92)');
        }
        for(let i=0;i<19;i++){
          const t=.09+i*.047,p=antenna(t),dx=side*(8+38*t),dy=-45;
          const length=Math.hypot(dx,dy),tx=dx/length,ty=dy/length;
          const spread=Math.pow(Math.sin(Math.PI*t),.8)*9.5;
          for(const edge of [-1,1]){
            const reach=spread*(edge===side?1:.83);
            const samples=Math.ceil(reach*1.6);
            for(let j=1;j<=samples;j++){
              const u=j/samples,along=2.8*u+1.4*u*u;
              const x=p.x+(-ty)*edge*reach*u+tx*along;
              const y=p.y+tx*edge*reach*u+ty*along;
              pixel(x,y,.8,edge===side?'rgba(189,198,241,.88)':'rgba(165,157,225,.82)');
            }
          }
        }
        for(let leg=0;leg<3;leg++)for(let i=0;i<13;i++){
          const t=i/12;pixel(side*(3+t*10),leg*8+t*10,1,'rgba(134,132,182,.5)');
        }
      }
    }
    function stop(){cancelAnimationFrame(frame);frame=0;last=0;canvas.dataset.motion=motion.matches?'static':'paused';}
    function tick(now){frame=0;if(disposed||!visible||document.hidden)return;const dt=last?Math.min((now-last)/1000,.06):0;last=now;time+=dt;advanceFlight(dt);energy+=((hovering||focused?1:0)-energy)*(1-Math.exp(-dt*2));if(now-lastDraw>1000/30){render(time);lastDraw=now;}frame=requestAnimationFrame(tick);}
    function sync(){stop();if(disposed||!width||!height)return;if(motion.matches){energy=hovering||focused?1:0;render(0);}else if(visible&&!document.hidden){canvas.dataset.motion='running';frame=requestAnimationFrame(tick);}}
    function resize(){const r=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);if(width===r.width&&height===r.height&&dpr===ratio)return;width=r.width;height=r.height;dpr=ratio;canvas.width=Math.max(1,Math.floor(width*dpr));canvas.height=Math.max(1,Math.floor(height*dpr));render(motion.matches?0:time);sync();}
    const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});const observer=new ResizeObserver(resize);intersection.observe(canvas);observer.observe(canvas);
    function update(){if(motion.matches)sync();}
    function enter(){hovering=true;update();}function leave(){hovering=false;update();}
    function focus(){focused=true;update();}function blur(){focused=false;update();}
    interactionTarget.addEventListener('pointerenter',enter);interactionTarget.addEventListener('pointerleave',leave);interactionTarget.addEventListener('pointercancel',leave);interactionTarget.addEventListener('focus',focus);interactionTarget.addEventListener('blur',blur);
    document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);resize();
    return()=>{disposed=true;stop();intersection.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);
      interactionTarget.removeEventListener('pointerenter',enter);interactionTarget.removeEventListener('pointerleave',leave);interactionTarget.removeEventListener('pointercancel',leave);interactionTarget.removeEventListener('focus',focus);interactionTarget.removeEventListener('blur',blur);
    };
  }
