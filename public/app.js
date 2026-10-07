if (document.querySelector('#system-diagram')) {
  import('/animations/workflow.js').then(({ mountWorkflow }) => mountWorkflow()).catch(error => console.warn('Workflow unavailable:', error));
}
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#main-nav');
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  menu.classList.toggle('open', !expanded);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.classList.contains('open')) {
    menu.classList.remove('open'); menuButton.setAttribute('aria-expanded','false'); menuButton.focus();
  }
});
const journeys = {
  web: { code:'01 / EXPERIENCE',label:'DESIGNED FOR PEOPLE',title:'A website that feels like you.',copy:'Clear, considered, and built to turn a first impression into a useful conversation.',link:'Explore digital experience',href:'/services.html#web',art:document.querySelector('#preview-art')?.innerHTML },
  systems: { code:'02 / CONNECTION',label:'LESS MANUAL WORK',title:'Your tools, working together.',copy:'A clear path from the first enquiry to the next step. Less copying, fewer gaps, more continuity.',link:'Explore connected systems',href:'/services.html#systems',art:'<div class="workflow-preview"><div class="workflow-row"><span>01</span> New enquiry <em>RECEIVE</em></div><div class="workflow-join"></div><div class="workflow-row"><span>02</span> Shared workspace <em>ORGANISE</em></div><div class="workflow-join"></div><div class="workflow-row"><span>03</span> The right next step <em>ASSIGN</em></div></div>' },
  ai: { code:'03 / INTELLIGENCE',label:'BUILT AROUND HUMAN JUDGEMENT',title:'Useful intelligence. Clear limits.',copy:'Prepare a summary. Find the right information. Draft a response. Keep a person in control of what happens next.',link:'Explore applied intelligence',href:'/services.html#ai',art:'<div class="terminal-preview"><p class="terminal-prompt">$ enquiry.prepare</p><p><span class="accent">✓</span> organise incoming details</p><p><span class="accent">✓</span> prepare a short summary</p><p><span class="accent">✓</span> draft a useful response</p><p class="terminal-comment">// a person makes the final call</p><div class="approval">HUMAN REVIEW <span>REQUIRED</span></div></div>' }
};
const tabs = [...document.querySelectorAll('[data-journey]')];
function chooseJourney(tab) {
  const journey = journeys[tab.dataset.journey];
  tabs.forEach(button => {const selected=button===tab;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
  document.querySelector('#journey-panel').setAttribute('aria-labelledby',tab.id);
  for (const [id,key] of [['preview-code','code'],['journey-label','label'],['journey-title','title'],['journey-copy','copy']]) document.getElementById(id).textContent=journey[key];
  const link=document.querySelector('#journey-link');link.href=journey.href;link.innerHTML=journey.link+' <span aria-hidden="true">＋</span>';
  document.querySelector('#preview-art').innerHTML=journey.art;
}
tabs.forEach((tab,index) => {
  tab.addEventListener('click',()=>chooseJourney(tab));
  tab.addEventListener('keydown',event=>{
    let next;
    if(event.key==='ArrowRight') next=(index+1)%tabs.length;
    if(event.key==='ArrowLeft') next=(index+tabs.length-1)%tabs.length;
    if(event.key==='Home') next=0;
    if(event.key==='End') next=tabs.length-1;
    if(next!==undefined){event.preventDefault();tabs[next].focus();chooseJourney(tabs[next]);}
  });
});
document.querySelector('#brief-form')?.addEventListener('submit',event=>{
  event.preventDefault();
  const business=document.querySelector('#business').value.trim();
  const project=document.querySelector('#project').value.trim();
  if(!business||!project){document.querySelector('#brief-status').textContent='Add a little context to both fields before saving.';return;}
  const content=`APERTURE INDIGO / PROJECT NOTES\n\nBusiness or project:\n${business}\n\nWhat I would like to improve:\n${project}\n\nSaved locally. This draft has not been sent.\n`;
  const url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='aperture-indigo-project-notes.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  document.querySelector('#brief-status').textContent='Your notes are ready to download. Nothing has been sent.';
});

const connectedCanvas = document.querySelector('.connected-contours');
if (connectedCanvas) {
  import('/animations/contour-field.js').then(({ mountContourField }) => {
    mountContourField(connectedCanvas, connectedCanvas.closest('.door-connected'));
  }).catch(error => console.warn('Contour background unavailable:', error));
}

const intelligenceCanvas = document.querySelector('.intelligence-voronoi');
if (intelligenceCanvas) {
  import('/animations/voronoi-field.js').then(({ mountVoronoiField }) => {
    mountVoronoiField(intelligenceCanvas, intelligenceCanvas.closest('.door-intelligence'));
  }).catch(error => console.warn('Voronoi background unavailable:', error));
}

const experienceCanvas = document.querySelector('.experience-starfield');
if (experienceCanvas) {
  import('/animations/starfield-warp.js').then(({ mountStarfieldWarp }) => {
    mountStarfieldWarp(experienceCanvas, experienceCanvas.closest('.door-experience'));
  }).catch(error => console.warn('Starfield background unavailable:', error));
}

const brainSurface = document.querySelector('.particle-brain');
if (brainSurface) {
  import('/animations/particle-brain.js').then(({ mountParticleBrain }) => {
    mountParticleBrain(brainSurface.querySelector('canvas'), brainSurface);
  }).catch(error => console.warn('Particle brain unavailable:', error));
}

const networkSurface = document.querySelector('.orbital-network');
if (networkSurface) {
  import('/animations/orbital-network.js').then(({ mountOrbitalNetwork }) => {
    mountOrbitalNetwork(networkSurface.querySelector('canvas'), networkSurface);
  }).catch(error => console.warn('Orbital network unavailable:', error));
}

const websiteCanvas = document.querySelector('.pixel-website canvas');
if (websiteCanvas) {
  import('/animations/pixel-website.js').then(({ mountPixelWebsite }) => {
    mountPixelWebsite(websiteCanvas);
  }).catch(error => console.warn('Pixel website unavailable:', error));
}

const treeCanvas = document.querySelector('.pixel-tree canvas');
if (treeCanvas) {
  import('/animations/pixel-tree.js').then(({ mountPixelTree }) => {
    mountPixelTree(treeCanvas);
  }).catch(error => console.warn('Pixel tree unavailable:', error));
}

const butterflyCanvas = document.querySelector('.pixel-butterfly canvas');
if (butterflyCanvas) {
  import('/animations/pixel-butterfly.js').then(({ mountPixelButterfly }) => {
    mountPixelButterfly(butterflyCanvas);
  }).catch(error => console.warn('Pixel butterfly unavailable:', error));
}

const tigerLilyCanvas = document.querySelector('.pixel-tiger-lily canvas');
if (tigerLilyCanvas) {
  import('/animations/pixel-tiger-lily.js').then(({ mountPixelTigerLily }) => {
    mountPixelTigerLily(tigerLilyCanvas);
  }).catch(error => console.warn('Pixel tiger lily unavailable:', error));
}

const processGrid = document.querySelector('.process-grid');
if (processGrid) {
  import('/animations/process-growth.js').then(({ mountProcessGrowth }) => {
    mountProcessGrowth(processGrid);
  }).catch(error => console.warn('Process growth unavailable:', error));
}
