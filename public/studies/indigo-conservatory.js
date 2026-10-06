// A still photograph with motion confined to the pool and planted glass walls.
// All coordinates are normalized to the source photograph, not the viewport.
const image = document.querySelector('#scene');
let canvas = document.querySelector('#atmosphere');
let control = document.querySelector('#motion');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const vertexSource = `
attribute vec2 a_position;
varying vec2 v_uv;
void main(){v_uv=vec2(a_position.x*.5+.5,.5-a_position.y*.5);gl_Position=vec4(a_position,0.,1.);}`;
const fragmentSource = `
precision highp float;
uniform sampler2D u_image;
uniform float u_time;
uniform vec2 u_resolution;
varying vec2 v_uv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float cloud(vec2 p){return noise(p)*.57+noise(p*2.03+7.1)*.28+noise(p*4.01+2.8)*.15;}
void main(){
 vec2 uv=v_uv;
 // Inner water boundary: feather away from the stone rim and preserve its shape.
 float depth=clamp((uv.y-.747)/.16,0.,1.);
 float left=mix(.443,.342,depth);
 float right=mix(.572,.663,depth);
 float water=smoothstep(.745,.76,uv.y)*(1.-smoothstep(.895,.909,uv.y));
 water*=smoothstep(left,left+.012,uv.x)*(1.-smoothstep(right-.012,right,uv.x));
 float t=u_time;
 float ripple=sin(uv.y*260.-t*1.85+sin(uv.x*42.+t*.32)*1.4);
 float secondary=sin(uv.y*430.+uv.x*39.-t*1.15);
 vec2 displacement=vec2(sin(uv.y*180.+t*.72)*.0014,(ripple*.0023+secondary*.0008));
 displacement*=water*(.3+depth*.7);
 // The overhead pool is a separate trapezoid, well inside its rigid frame.
 float ceilingDepth=clamp((uv.y-.075)/.34,0.,1.);
 float ceilingLeft=mix(.347,.451,ceilingDepth);
 float ceilingRight=mix(.651,.571,ceilingDepth);
 float ceiling=smoothstep(.075,.095,uv.y)*(1.-smoothstep(.397,.421,uv.y));
 ceiling*=smoothstep(ceilingLeft,ceilingLeft+.012,uv.x)*(1.-smoothstep(ceilingRight-.012,ceilingRight,uv.x));
 float overhead=sin(uv.y*210.+uv.x*28.-t*1.45+sin(uv.x*51.+t*.3));
 displacement+=ceiling*vec2(sin(uv.y*145.+t*.61)*.0013,overhead*.0026);
 vec3 color=texture2D(u_image,uv+displacement).rgb;
 color+=vec3(.04,.075,.09)*water*(ripple*.35+secondary*.18)*(.3+depth*.7);
 color+=vec3(.035,.065,.075)*ceiling*overhead*.22;
 // Follow the sloping glass enclosures. Exclude the pool, furniture, and aisle.
 float leftTop=.18+uv.x*.79;
 float leftBottom=.92-uv.x*.47;
 float leftGlass=(1.-smoothstep(.383,.423,uv.x))*smoothstep(leftTop,leftTop+.09,uv.y)*(1.-smoothstep(leftBottom-.1,leftBottom,uv.y));
 float rightTop=.18+(1.-uv.x)*.78;
 float rightBottom=.91-(1.-uv.x)*.46;
 float rightGlass=smoothstep(.59,.66,uv.x)*smoothstep(rightTop,rightTop+.1,uv.y)*(1.-smoothstep(rightBottom-.15,rightBottom-.05,uv.y));
 float glass=max(leftGlass,rightGlass);
 vec2 drift=vec2(sin(t*.11)*.22,t*.075);
 float vapor=cloud(uv*vec2(13.,5.5)+drift);
 float fine=cloud(uv*vec2(23.,10.)+vec2(-t*.032,t*.105));
 float mist=smoothstep(.47,.78,vapor*.7+fine*.3)*glass;
 // Only a translucent veil: foliage and the glass seams remain visible.
 color=mix(color,vec3(.58,.56,.52),mist*.19);
 gl_FragColor=vec4(color,max(max(water,ceiling),glass));
}`;
async function start() {
 try { await image.decode(); } catch { return; }
 const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false,powerPreference:'default'});
 if(!gl) { startFallback(); return; }
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
 let program;
 try {
  program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertexSource));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragmentSource));gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
 } catch(error){console.warn('Using canvas motion fallback:',error);startFallback();return;}
 gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const position=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
 const time=gl.getUniformLocation(program,'u_time');
 let paused=reducedMotion.matches, lost=false, elapsed=0, previous=0, frame=0, lastDraw=0;
 function draw(){gl.uniform1f(time,elapsed);gl.drawArrays(gl.TRIANGLES,0,6);}
 function resize(){const bounds=canvas.getBoundingClientRect();const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(bounds.width*ratio);canvas.height=Math.round(bounds.height*ratio);gl.viewport(0,0,canvas.width,canvas.height);draw();}
 function tick(now){if(paused||document.hidden||lost)return;if(previous)elapsed+=Math.min((now-previous)/1000,.1);previous=now;if(now-lastDraw>33){draw();lastDraw=now;}frame=requestAnimationFrame(tick);}
 function resume(){cancelAnimationFrame(frame);previous=0;if(!paused&&!document.hidden&&!lost)frame=requestAnimationFrame(tick);}
 function updateControl(){control.textContent=paused?'Play water & mist':'Pause water & mist';control.setAttribute('aria-pressed',String(paused));}
 control.addEventListener('click',()=>{paused=!paused;updateControl();resume();});
 reducedMotion.addEventListener('change',event=>{paused=event.matches;updateControl();resume();});
 document.addEventListener('visibilitychange',resume);
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancelAnimationFrame(frame);canvas.classList.remove('ready');startFallback();});
 new ResizeObserver(resize).observe(canvas);
 resize();canvas.dataset.renderer='webgl';canvas.classList.add('ready');control.hidden=false;updateControl();resume();
}
// A working animation path for browsers with WebGL disabled or unavailable.
function startFallback() {
 const old=canvas;canvas=old.cloneNode();old.replaceWith(canvas);
 const ctx=canvas.getContext('2d');if(!ctx)return;
 canvas.dataset.renderer='canvas2d';
 let paused=reducedMotion.matches,elapsed=0,previous=0,frame=0,lastDraw=0;
 const pools=[[[.444,.749],[.573,.749],[.663,.904],[.344,.904]],[[.35,.079],[.649,.079],[.570,.411],[.454,.411]]];
 const gardens=[[[0,.20],[.42,.55],[.40,.72],[0,.91]],[[.61,.55],[1,.20],[1,.77],[.63,.69]]];
 function clip(points){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x*canvas.width,y*canvas.height):ctx.moveTo(x*canvas.width,y*canvas.height));ctx.closePath();ctx.clip();}
 function draw(){
  const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);
  pools.forEach((pool,index)=>{
   ctx.save();clip(pool);
   const top=Math.min(...pool.map(p=>p[1]))*h,bottom=Math.max(...pool.map(p=>p[1]))*h;
   for(let y=top;y<bottom;y+=2){
    const shift=Math.sin(y/h*230-elapsed*1.5+index)*h*.0028;
    const xShift=Math.sin(y/h*160+elapsed*.7)*w*.0014;
    const sy=(y+shift)/h*image.naturalHeight;
    ctx.drawImage(image,0,sy,image.naturalWidth,2/h*image.naturalHeight,xShift,y,w,2.5);
   }ctx.restore();
  });
  gardens.forEach((garden,side)=>{ctx.save();clip(garden);
   for(let i=0;i<12;i++){
    const progress=(i/12+elapsed*.012)%1;
    const x=(side?1:0)*w+(side?-1:1)*((i*.073)% .39)*w+Math.sin(elapsed*.15+i)*w*.014;
    const y=(.91-progress*.65)*h;
    const radius=w*(.045+(i%3)*.012);
    const gradient=ctx.createRadialGradient(x,y,0,x,y,radius);
    gradient.addColorStop(0,'rgba(148,143,133,'+(Math.sin(progress*Math.PI)*.065)+')');gradient.addColorStop(1,'rgba(148,143,133,0)');
    ctx.fillStyle=gradient;ctx.fillRect(x-radius,y-radius,radius*2,radius*2);
   }ctx.restore();
  });
 }
 function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);draw();}
 function tick(now){if(paused||document.hidden)return;if(previous)elapsed+=Math.min((now-previous)/1000,.1);previous=now;if(now-lastDraw>33){draw();lastDraw=now;}frame=requestAnimationFrame(tick);}
 function resume(){cancelAnimationFrame(frame);previous=0;if(!paused&&!document.hidden)frame=requestAnimationFrame(tick);control.textContent=paused?'Play water & mist':'Pause water & mist';control.setAttribute('aria-pressed',String(paused));}
 // Replace the control to discard any listeners from a lost WebGL context.
 const button=control.cloneNode(true);control.replaceWith(button);control=button;
 control.addEventListener('click',()=>{paused=!paused;resume();});
 reducedMotion.addEventListener('change',event=>{paused=event.matches;resume();});
 document.addEventListener('visibilitychange',resume);new ResizeObserver(resize).observe(canvas);
 resize();canvas.classList.add('ready');control.hidden=false;resume();
}
start();
