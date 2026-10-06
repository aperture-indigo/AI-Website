export function mountWorkflow() {
  const NS='http://www.w3.org/2000/svg';
  const root=document.querySelector('#system-diagram'),stage=document.querySelector('#system-stage');
  const button=document.querySelector('#resolve'),status=document.querySelector('#system-status');
  const mobile=matchMedia('(max-width:700px)'),motion=matchMedia('(prefers-reduced-motion: reduce)');
  const el=(name,attrs={},text)=>{const n=document.createElementNS(NS,name);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(text)n.textContent=text;return n;};
  root.querySelector('#connections')?.remove();root.querySelector('#nodes')?.remove();
  const defs=el('defs');
  defs.innerHTML='<pattern id="flow-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#9292c7" opacity=".2"/></pattern><filter id="flow-glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="3"/></filter>';
  root.append(defs);
  const background=el('g',{'aria-hidden':'true'}),dust=el('g',{'aria-hidden':'true'}),wires=el('g',{'aria-hidden':'true'}),packets=el('g',{'aria-hidden':'true'}),fragments=el('g',{'aria-hidden':'true'}),nodes=el('g',{'aria-hidden':'true'});
  root.append(background,dust,wires,packets,fragments,nodes);
  const grid=el('rect',{class:'flow-grid',fill:'url(#flow-grid)'});
  background.append(grid);
  const labels=[['Website','A clear front door','CAPTURE'],['Enquiry','Details in one place','COLLECT'],['Workspace','One shared record','CONNECT'],['AI preparation','A useful first draft','PREPARE'],['Human review','A person decides','APPROVE'],['Customer reply','The right next step','DELIVER']];
  const icons=[['M-13-10h26v21h-26z','M-13-3h26','M-6 4h12'],['M-12-9h24v18h-24z','M-12-9l12 10 12-10'],['M-12-11h9v9h-9zM3-11h9v9H3zM-12 3h9v9h-9zM3 3h9v9H3z'],['M0-14v28M-14 0h28M-9-9l18 18M-9 9L9-9'],['M-10 0l7 7 15-16','M0-15l15 5v9c0 8-15 16-15 16S-15 7-15-1v-9z'],['M-14-10l29 10-29 11 6-11z','M-8 0h23']];
  const cards=labels.map(([title,sub,tag],i)=>{
    const g=el('g',{class:`flow-node${i===4?' flow-human':''}`});
    const rect=el('rect',{class:'flow-card',rx:3});
    const icon=el('g',{class:'flow-icon'});icons[i].forEach(d=>icon.append(el('path',{d})));
    const number=el('text',{class:'flow-step'},`0${i+1} / ${tag}`);
    const heading=el('text',{class:'flow-title'},title),detail=el('text',{class:'flow-detail'},sub);
    const light=el('circle',{class:'flow-port',r:3});
    g.append(rect,icon,number,heading,detail,light);nodes.append(g);
    return {g,rect,icon,number,heading,detail,light};
  });
  const routes=[[0,1],[1,2],[2,3],[3,4],[4,5],[0,3],[0,4],[1,4],[1,5],[2,5],[2,0],[3,1],[4,2]];
  const paths=routes.map((_,i)=>{const p=el('path',{class:i<5?'flow-route':'flow-tangle'});wires.append(p);return p;});
  const dots=routes.slice(0,5).map(()=>{const g=el('g');g.append(el('circle',{r:7,fill:'#66ead7',filter:'url(#flow-glow)'}),el('rect',{x:-2,y:-2,width:4,height:4,fill:'#bcfff0'}));packets.append(g);return g;});
  const clutter=['COPY / PASTE','Which version?','Follow up again','DUPLICATE ENTRY','Missing context','Waiting on approval','ANOTHER SPREADSHEET','Who owns this?'];
  const chips=clutter.map((text,i)=>{const g=el('g',{class:'flow-fragment'});g.append(el('rect',{x:-64,y:-12,width:128,height:24,rx:2}),el('text',{'text-anchor':'middle',y:4},text));fragments.append(g);return g;});
  let seed=12;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const specks=Array.from({length:100},()=>{const s={x:random(),y:random(),phase:random()*6.28,n:el('rect',{width:1.5,height:1.5,class:'flow-speck'})};dust.append(s.n);return s;});
  let scattered=[],ordered=[],width,height,progress=0,resolved=false,frame=0,visible=false,last=0,time=0,from=0,transition=0,animating=false;
  const mix=(a,b,t)=>a+(b-a)*t;
  function layout(){
    const small=mobile.matches;width=small?360:1200;height=small?1050:560;
    root.setAttribute('viewBox',`0 0 ${width} ${height}`);
    grid.setAttribute('width',width);grid.setAttribute('height',height);
    scattered=small?[[134,115],[222,335],[133,460],[224,610],[135,785],[221,950]]:[[145,150],[476,402],[385,155],[765,130],[880,417],[1090,270]];
    ordered=small?labels.map((_,i)=>[180,95+i*170]):labels.map((_,i)=>[110+i*196,280]);
    cards.forEach(c=>{
      Object.entries({x:small?-109:-78,y:small?-48:-69,width:small?218:156,height:small?96:138}).forEach(([k,v])=>c.rect.setAttribute(k,v));
      c.icon.setAttribute('transform',small?'translate(-77 4)':'translate(-47 -14)');
      [[c.number,small?-91:-61,small?-27:-47],[c.heading,small?-49:-61,small?1:25],[c.detail,small?-49:-61,small?23:45]].forEach(([n,x,y])=>{n.setAttribute('x',x);n.setAttribute('y',y);});
      c.light.setAttribute('cx',small?91:61);c.light.setAttribute('cy',small?-27:-47);
    });
    draw();
  }
  let points=[],lengths=[];
  function draw(){
    const p=progress;stage.style.setProperty('--flow-progress',p);
    points=scattered.map((s,i)=>s.map((v,j)=>mix(v,ordered[i][j],p)));
    cards.forEach((c,i)=>c.g.setAttribute('transform',`translate(${points[i][0]} ${points[i][1]}) rotate(${(1-p)*[ -5,4,3,-4,5,-3][i]})`));
    paths.forEach((path,i)=>{
      const [a,b]=routes[i],s=points[a],e=points[b];
      const vertical=mobile.matches,offset=vertical?51:81;
      const start=[s[0]+(vertical?0:offset*p),s[1]+(vertical?offset*p:0)];
      const end=[e[0]-(vertical?0:offset*p),e[1]-(vertical?offset*p:0)];
      const bend=(i%2?1:-1)*(90+i*13)*(1-p);
      const c1=vertical?[start[0]+bend,mix(start[1],end[1],.4)]:[mix(start[0],end[0],.4),start[1]+bend];
      const c2=vertical?[end[0]-bend,mix(start[1],end[1],.6)]:[mix(start[0],end[0],.6),end[1]-bend];
      path.setAttribute('d',`M${start} C${c1} ${c2} ${end}`);
      path.style.opacity=i<5?mix(.28,.8,p):.26*(1-p);
    });
    lengths=paths.slice(0,5).map(path=>path.getTotalLength());
    chips.forEach((g,i)=>{
      const x=mobile.matches?(i%2?260:90):[238,610,1010,170,660,1040,390,710][i];
      const y=mobile.matches?190+i*105:[62,65,86,312,275,490,510,487][i];
      g.setAttribute('transform',`translate(${mix(x,width/2,p)} ${mix(y,height/2,p)})`);g.style.opacity=Math.max(0,1-p*1.8);
    });
    root.querySelector('#diagram-desc').textContent=resolved?'An enquiry moves through Website, Enquiry, Workspace, AI preparation, Human review, and Customer reply. A person approves before a response is sent.':'Six tools are scattered among crossing handoffs, duplicate entry, missing context, and unclear ownership. Use Find the structure to connect them.';
  }
  function ambient(){
    specks.forEach((s,i)=>{
      const x=mix(s.x*(width-30)+15,mobile.matches?180:40+s.x*(width-80),progress);
      const y=mix(s.y*(height-30)+15,mobile.matches?30+s.y*(height-60):280,progress);
      s.n.setAttribute('x',x+Math.sin(time*.3+s.phase)*(1-progress)*4);s.n.setAttribute('y',y);
      s.n.style.opacity=(1-progress)*.25;
    });
    dots.forEach((g,i)=>{
      const t=(time*.24-i*.17+10)%1,point=paths[i].getPointAtLength(t*lengths[i]);
      g.setAttribute('transform',`translate(${point.x} ${point.y})`);g.style.opacity=progress*.95;
    });
  }
  function tick(now){
    frame=0;if(!visible||document.hidden)return;
    const dt=last?Math.min((now-last)/1000,.05):0;last=now;
    if(!motion.matches)time+=dt;
    if(animating){transition+=dt;const t=motion.matches?1:Math.min(1,transition/1.65);const ease=t*t*t*(t*(t*6-15)+10);progress=mix(from,resolved?1:0,ease);draw();if(t===1)animating=false;}
    ambient();if(!motion.matches||animating)frame=requestAnimationFrame(tick);
  }
  function resume(){cancelAnimationFrame(frame);frame=0;last=0;if(visible&&!document.hidden)frame=requestAnimationFrame(tick);}
  function setResolved(){
    resolved=!resolved;from=progress;transition=0;animating=true;
    stage.classList.toggle('resolved',resolved);stage.closest('.system-section').classList.toggle('workflow-resolved',resolved);
    button.setAttribute('aria-pressed',String(resolved));button.innerHTML=resolved?'See the complexity <span aria-hidden="true">−</span>':'Find the structure <span aria-hidden="true">＋</span>';
    status.textContent=resolved?'02 / ONE CONNECTED WORKFLOW':'01 / TOO MANY LOOSE ENDS';
    document.querySelector('#flow-headline').textContent=resolved?'Every handoff has a purpose.':'Good tools. Tangled together.';
    document.querySelector('#flow-caption').textContent=resolved?'Capture once. Keep context. Prepare with AI. Let a person decide.':'Copied details. Crossed wires. Decisions waiting for context.';
    document.querySelector('#flow-summary').textContent=resolved?'ONE SHARED RECORD  /  CLEAR OWNERSHIP  /  HUMAN APPROVAL':'DUPLICATE WORK  /  LOST CONTEXT  /  UNCLEAR OWNERSHIP';
    if(motion.matches){progress=resolved?1:0;animating=false;draw();ambient();}else resume();
  }
  button.addEventListener('click',setResolved);mobile.addEventListener('change',()=>{layout();ambient();});motion.addEventListener('change',resume);document.addEventListener('visibilitychange',resume);
  layout();ambient();
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume();},{threshold:.02}).observe(stage);
}
