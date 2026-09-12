const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
PORTFOLIO_PROJECTS.find(project=>project.id==='delivery-guard').links.video='assets/videos/deliveryguard-ai.mp4';
const iconSvg=(type)=>`<svg viewBox="0 0 120 72" role="img" aria-label="Abstract ${type} project illustration"><path d="M8 58H112M18 58V28l20-12 18 19 22-24 25 17v30"/><circle cx="18" cy="28" r="4"/><circle cx="38" cy="16" r="4"/><circle cx="56" cy="35" r="4"/><circle cx="78" cy="11" r="4"/><circle cx="103" cy="28" r="4"/><path class="accent" d="M18 48h20m8 0h28m8 0h21"/></svg>`;

// Compact previews summarize the original evidence; full text stays in openCase().
const PROJECT_PREVIEWS = {
  'content-optimization': {description:'Prioritize content review with leakage-aware models and a research inference workspace.',result:'Validation macro F1 0.4302 &middot; Research only',tech:['Scikit-learn','FastAPI','JavaScript']},
  'delivery-guard': {description:'Predict delivery risk before shipment with a leakage-aware ML pipeline and dashboard.',result:'77.05% ROC AUC &middot; 36,104-order chronological holdout',tech:['Scikit-learn','FastAPI','React']},
  'resume-screening': {description:'Parse resumes, rank keyword matches, and export a traceable recruiter shortlist.',result:'4 document formats &middot; Ranked results and CSV export',tech:['Python','Flask','SQLite']},
  'fake-news': {description:'Classify article text with a reusable TF-IDF pipeline and a real-time Flask interface.',result:'Real-time classification &middot; No published test metric',tech:['Scikit-learn','TF-IDF','Flask']},
  'invoice-intelligence': {description:'Forecast freight costs and flag invoices for manual review in one finance dashboard.',result:'Freight forecasts and approval flags &middot; No benchmark',tech:['Streamlit','Pandas','Plotly']},
  'potato-disease': {description:'Screen uploaded potato leaf images for early blight, late blight, or healthy leaves.',result:'3 classes &middot; Image preview and confidence output',tech:['TensorFlow','Keras','Flask']},
  'mindsight': {description:'Explore a qualified ML score from lifestyle inputs in a privacy-focused web application.',result:'Educational score estimate &middot; Not a diagnosis',tech:['Python','FastAPI','Machine Learning']}
};
function projectCard(p,i) {
  const preview=PROJECT_PREVIEWS[p.id]||{description:p.solution,result:'',tech:p.tech.slice(0,3)};
  const number=String(PORTFOLIO_PROJECTS.indexOf(p)+1).padStart(2,'0');
  return `<article class="project-card project-window reveal" data-category="${p.category}" aria-labelledby="project-title-${p.id}">
    <div class="project-window-bar" aria-hidden="true"><span class="window-dots"><i></i><i></i><i></i></span><span class="window-caption">PROJECT / ${number}</span><span class="window-detail">&nearr;</span></div>
    <div class="project-art project-photo"><img src="assets/projects/${p.id}.png" alt="${p.title} application screenshot" loading="lazy" width="1280" height="720"></div>
    <div class="project-body"><p class="project-category">${p.categoryLabel}</p><h3 id="project-title-${p.id}">${p.title}</h3>
      <p class="project-summary">${preview.description}</p>
      <p class="project-metric">${preview.result}</p>
      <div class="tags">${preview.tech.slice(0,3).map(t=>`<span>${t}</span>`).join('')}</div>
      <div class="card-actions"><button class="btn btn-primary case-open" data-id="${p.id}" aria-label="Read the ${p.title} case study">Case Study <span aria-hidden="true">&nearr;</span></button>${linkButton('GitHub',p.links.github)}</div>
    </div></article>`;
}
function linkButton(label,url){if(label==='Demo video'&&url)return `<button class="btn btn-quiet video-open" data-video="${url}">${label} ▶</button>`;return url?`<a class="btn btn-quiet" href="${url}" target="_blank" rel="noreferrer">${label} ↗</a>`:`<button class="btn btn-quiet unavailable" data-label="${label}">${label}</button>`}
function renderProjects(filter='all'){const list=filter==='all'?PORTFOLIO_PROJECTS:PORTFOLIO_PROJECTS.filter(p=>p.category===filter);$('#project-grid').innerHTML=list.map(projectCard).join('');bindProjectActions();observeReveals()}
const SKILL_ICONS=[
  '<path d="m9 8-4 4 4 4M15 8l4 4-4 4M14 4l-4 16"/>',
  '<circle cx="12" cy="5" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M12 7v4M7.5 16.5 11 12h2l3.5 4.5"/>',
  '<path d="M9.5 4.5A3.5 3.5 0 0 0 6 8v1a3 3 0 0 0 0 6v1a3.5 3.5 0 0 0 3.5 3.5M14.5 4.5A3.5 3.5 0 0 1 18 8v1a3 3 0 0 1 0 6v1a3.5 3.5 0 0 1-3.5 3.5M12 4v16"/>',
  '<path d="M5 6h14M5 10h10M5 14h14M5 18h7"/><circle cx="18" cy="17" r="2"/>',
  '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="3"/>',
  '<rect x="4" y="4" width="16" height="6" rx="2"/><rect x="4" y="14" width="16" height="6" rx="2"/><path d="M8 7h.01M8 17h.01M16 10v4"/>',
  '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
  '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
  '<path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z"/><path d="m4 12 8 4.5 8-4.5M4 16.5l8 4.5 8-4.5"/>'
];
function skillIcon(i,title){return `<span class="skill-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${SKILL_ICONS[i]||SKILL_ICONS[0]}</svg></span><span class="sr-only">${title}</span>`}
const TECH_MARKS={'Python':'Py','SQL':'DB','JavaScript':'JS','TypeScript':'TS','Scikit-learn':'SK','Pandas':'Pd','NumPy':'Np','Feature Engineering':'ƒx','TensorFlow':'TF','Keras':'K','CNNs':'◉','TF-IDF':'Tf','Text Classification':'T','Document Parsing':'▤','Image Classification':'◐','Pillow':'P','FastAPI':'⚡','Flask':'F','REST APIs':'↔','Pydantic':'P²','React':'⚛','Vite':'V','Tailwind CSS':'TW','Streamlit':'S','SQLite':'SQ','Plotly':'▥','Jupyter':'J','Docker':'◇','Pytest':'✓','Model Serving':'▶','GitHub':'GH'};
function techBadge(name){const mark=TECH_MARKS[name]||name.slice(0,2);const slug=name.toLowerCase().replace(/[^a-z0-9]+/g,'-');return `<span class="tech-badge tech-${slug}"><i aria-hidden="true">${mark}</i>${name}</span>`}
function renderSkills(){window.renderCapabilities($('#skill-grid'),SKILL_GROUPS)}
function bindProjectActions(){$$('.case-open').forEach(b=>b.addEventListener('click',()=>openCase(b.dataset.id)));$$('.unavailable').forEach(b=>b.addEventListener('click',()=>toast(`${b.dataset.label} link will appear after the verified URL is added.`)))}
function openCase(id){const p=PORTFOLIO_PROJECTS.find(x=>x.id===id),d=p.details||{};$('#case-content').innerHTML=`<p class="kicker">CASE STUDY / ${p.categoryLabel}</p><h2 id="case-title">${p.title}</h2><p class="status">${p.status}</p><p class="dialog-lead">${p.solution}</p><div class="case-grid"><section><h3>Real-world problem</h3><p>${p.problem}</p></section><section><h3>Target users</h3><p>${d.users||'Not documented.'}</p></section><section><h3>Data / information source</h3><p>${d.data||'Not documented.'}</p></section><section><h3>Solution architecture</h3><p>${d.architecture||'Not documented.'}</p></section><section><h3>Approach & preprocessing</h3><p>${d.approach||'Not documented.'}</p></section><section><h3>Evaluation methodology</h3><p>${d.evaluation||'Not documented.'}</p></section><section><h3>Verified results</h3><p>${p.result}</p></section><section><h3>Engineering decisions</h3><p>${d.decisions||'Not documented.'}</p></section><section><h3>Limitations & improvements</h3><p>${d.limitations||'Not documented.'}</p></section></div><div class="tags">${p.tech.map(t=>`<span>${t}</span>`).join('')}</div><div class="case-links">${linkButton('GitHub',p.links.github)}${linkButton('Live demo',p.links.demo)}${linkButton('Demo video',p.links.video)}</div>`;$('#case-dialog').showModal();$$('.unavailable',$('#case-content')).forEach(b=>b.addEventListener('click',()=>toast(`${b.dataset.label} link will appear after the verified URL is added.`)));$('.video-open',$('#case-content'))?.addEventListener('click',()=>openVideo(p.links.video,p.title))}

let videoAudioContext,videoAudioGain;
function boostVideoAudio(){
  const AudioContext=window.AudioContext||window.webkitAudioContext;
  if(!AudioContext)return;
  try{
    if(!videoAudioContext){
      videoAudioContext=new AudioContext();
      const source=videoAudioContext.createMediaElementSource($('#modal-video'));
      videoAudioGain=videoAudioContext.createGain();
      const limiter=videoAudioContext.createDynamicsCompressor();
      limiter.threshold.value=-6;limiter.knee.value=6;limiter.ratio.value=20;limiter.attack.value=0.003;limiter.release.value=0.15;
      source.connect(videoAudioGain);videoAudioGain.connect(limiter);limiter.connect(videoAudioContext.destination);
    }
    videoAudioGain.gain.value=Number($('#video-boost').value);
    videoAudioContext.resume().catch(()=>toast('Press play to resume audio.'));
  }catch{toast('Audio boost is unavailable in this browser. Use the video volume control.');}
}
function openVideo(src,title){const dialog=$('#video-dialog'),video=$('#modal-video');$('#video-title').textContent=title;video.src=src;video.volume=1;video.muted=false;video.defaultPlaybackRate=Number($('#video-speed').value);video.playbackRate=video.defaultPlaybackRate;boostVideoAudio();$('#case-dialog').close();dialog.showModal();video.play().catch(()=>toast('Press play to start the demo.'))}
function closeVideo(){const dialog=$('#video-dialog'),video=$('#modal-video');video.pause();video.removeAttribute('src');video.load();dialog.close()}
function toast(msg){const el=$('.toast');el.textContent=msg;el.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove('show'),3400)}
function observeReveals(){if(matchMedia('(prefers-reduced-motion: reduce)').matches){$$('.reveal').forEach(x=>x.classList.add('visible'));return} const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');o.unobserve(e.target)}}),{threshold:.12});$$('.reveal:not(.visible)').forEach(x=>o.observe(x))}

document.addEventListener('DOMContentLoaded',()=>{
  renderProjects();renderSkills();observeReveals();$('#year').textContent=new Date().getFullYear();
  $$('.filters button').forEach(b=>b.addEventListener('click',()=>{$$('.filters button').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderProjects(b.dataset.filter)}));
  const menu=$('.menu-toggle');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));$('.nav-links').classList.toggle('open')});$$('.nav-links a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');$('.nav-links').classList.remove('open')}));
  const sections=$$('main section[id]');const navObs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){$$('.nav-links a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${e.target.id}`))}}),{rootMargin:'-35% 0px -60%'});sections.forEach(s=>navObs.observe(s));
  $$('.resume-trigger').forEach(button=>button.addEventListener('click',()=>{if(button.textContent.trim().startsWith('View')){window.open('resume.pdf','_blank','noopener');return}const link=document.createElement('a');link.href='resume.pdf';link.download='Babar_Ali_Khan_AI_Engineer_Resume.pdf';document.body.appendChild(link);link.click();link.remove()}));
  $$('.unavailable-link,.social-placeholder').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();toast('Add the verified profile URL in index.html.')}));
  $('.dialog-close').addEventListener('click',()=>$('#case-dialog').close());$('#case-dialog').addEventListener('click',e=>{if(e.target===$('#case-dialog'))e.target.close()});
  $('.video-close').addEventListener('click',closeVideo);$('#video-dialog').addEventListener('click',e=>{if(e.target===$('#video-dialog'))closeVideo()});$('#video-dialog').addEventListener('close',()=>{const video=$('#modal-video');video.pause();video.removeAttribute('src');video.load()});
  $$('.gallery-video-open').forEach(button=>button.addEventListener('click',()=>openVideo(button.dataset.video,button.dataset.title)));
  $('#video-boost').addEventListener('change',boostVideoAudio);
  $('#video-speed').addEventListener('change',e=>{const video=$('#modal-video');video.defaultPlaybackRate=Number(e.target.value);video.playbackRate=Number(e.target.value)});
  $('.back-top').addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
  $('#contact-form').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget,s=$('.form-status',f);if(!f.checkValidity()){f.reportValidity();s.textContent='Please complete all fields with a valid email.';s.className='form-status error';return}const d=new FormData(f);s.textContent='Opening your email app…';s.className='form-status success';location.href=`mailto:babaralikhanaiexpert098@gmail.com?subject=${encodeURIComponent(d.get('subject'))}&body=${encodeURIComponent(`From: ${d.get('name')} (${d.get('email')})\n\n${d.get('message')}`)}`});
  $('#suggestion-form').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget,s=$('.form-status',f);if(!f.checkValidity()){f.reportValidity();return}s.textContent='Thank you — your feedback is appreciated. Connect a form endpoint to store submissions.';s.className='form-status success';f.reset()});
});
