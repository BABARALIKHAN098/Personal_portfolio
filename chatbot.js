(()=>{
  // Milliseconds; the close delay starts when the introduction opens.
  const AUTO_OPEN_DELAY=1000, AUTO_CLOSE_DELAY=12000;
  const CLOSE_ANIMATION_DURATION=280, INTRO_STORAGE='portfolioChatIntroShown';
  if(document.querySelector('.chat-launcher'))return;
  let openTimer,closeTimer,animationTimer,isOpen=false,automaticFocus=false,introShown=false;
  try{introShown=sessionStorage.getItem(INTRO_STORAGE)==='true'}catch{}

  const localApi=location.hostname==='127.0.0.1'||location.hostname==='localhost'?'http://127.0.0.1:8001':'';
  const API=(window.PORTFOLIO_CHAT_API_URL||document.body.dataset.chatApi||localApi).replace(/\/$/,'');
  const STORAGE='bak-portfolio-chat-v1', SESSION='bak-portfolio-chat-session';
  const GREETING="Hi! I\u2019m Babar\u2019s AI assistant. Ask me about his projects, skills, or experience.";
  const suggestions=['View Projects','Explore Skills','Contact Babar'];
  const state={messages:load(),pending:false};
  const sessionId=(()=>{try{return sessionStorage.getItem(SESSION)||createSession()}catch{return crypto.randomUUID().replaceAll('-','')}})();

  function createSession(){const value=crypto.randomUUID().replaceAll('-','');sessionStorage.setItem(SESSION,value);return value}
  function load(){try{const value=JSON.parse(sessionStorage.getItem(STORAGE)||'[]');return Array.isArray(value)?value.slice(-6):[]}catch{return[]}}
  function save(){try{sessionStorage.setItem(STORAGE,JSON.stringify(state.messages.slice(-6)))}catch{}}
  function el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node}

  const launcher=el('button','chat-launcher');launcher.type='button';launcher.setAttribute('aria-label','Open Babar portfolio assistant');launcher.setAttribute('aria-expanded','false');launcher.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-5 4v-4.5A2.5 2.5 0 0 1 4 13.5Z"/></svg><span>Ask about Babar</span>';
  const panel=el('section','chat-panel');panel.hidden=true;panel.setAttribute('role','dialog');panel.id='portfolio-chat';panel.setAttribute('aria-label','Babar\u2019s AI assistant');launcher.setAttribute('aria-controls',panel.id);panel.setAttribute('aria-labelledby','chat-title');
  panel.innerHTML='<header class="chat-head"><span class="chat-avatar" aria-hidden="true">AI</span><div class="chat-head-copy"><strong id="chat-title">Portfolio Assistant</strong><small><span class="chat-online-dot" aria-hidden="true"></span> Online &middot; Portfolio AI assistant</small></div><button class="chat-icon-button chat-clear" type="button" aria-label="Clear chat">↺</button><button class="chat-icon-button chat-close" type="button" aria-label="Close chat">×</button></header><div class="chat-feed" role="log" aria-live="polite" aria-relevant="additions"></div><form class="chat-form"><div class="chat-input-row"><label class="sr-only" for="chat-input">Ask about Babar</label><textarea id="chat-input" maxlength="1000" rows="1" required placeholder="Type your message&hellip;"></textarea><button class="chat-send" type="submit" aria-label="Send message">↑</button></div><small class="chat-note">AI assistant. Messages are not stored permanently. Please avoid sharing sensitive information.</small></form>';
  document.body.append(launcher,panel);
  const feed=panel.querySelector('.chat-feed'),form=panel.querySelector('form'),input=panel.querySelector('textarea'),send=panel.querySelector('.chat-send');

  function sourceLink(source){try{const url=new URL(source.url,location.href);if(!['https:','mailto:'].includes(url.protocol))return null;const a=el('a','',source.title);a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';return a}catch{return null}}
  function apiError(detail){
    if(typeof detail==='string'&&detail.trim())return detail;
    if(Array.isArray(detail)){return 'Your message could not be processed. Please clear the chat and try again.'}
    if(detail&&typeof detail==='object'&&typeof detail.message==='string')return detail.message;
    return "I couldn't retrieve that information right now. Please try again or use the portfolio contact section.";
  }
  function addMessage(role,content,sources=[],kind=''){const row=el('div',`chat-message ${role} ${kind}`.trim());const bubble=el('div','chat-bubble',content);if(sources.length){const list=el('div','chat-sources');sources.forEach(source=>{const link=sourceLink(source);if(link)list.append(link)});bubble.append(list)}row.append(bubble);feed.append(row);feed.scrollTop=feed.scrollHeight;return row}
  function render(){feed.replaceChildren();if(!state.messages.length){addMessage('assistant',GREETING);const group=el('div','chat-suggestions');suggestions.forEach(text=>{const button=el('button','',text);button.type='button';button.addEventListener('click',()=>submit(text));group.append(button)});feed.append(group)}else state.messages.forEach(message=>addMessage(message.role,message.content,message.sources||[]));}
  function history(){
    let remaining=3500;
    const recent=[];
    for(const message of state.messages.slice(-6).reverse()){
      if(remaining<=0)break;
      const content=String(message.content||'').slice(0,Math.min(1600,remaining));
      if(content){recent.push({role:message.role,content});remaining-=content.length}
    }
    return recent.reverse();
  }
  async function submit(value){interact();const message=(value||input.value).trim();if(!message||state.pending)return;const prior=history();state.messages.push({role:'user',content:message});save();addMessage('user',message);input.value='';state.pending=true;send.disabled=true;const loading=addMessage('assistant','');loading.querySelector('.chat-bubble').innerHTML='<span class="chat-typing" aria-label="Assistant is responding"><i></i><i></i><i></i></span>';
    try{const response=await fetch(`${API}/api/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,session_id:sessionId,history:prior})});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(apiError(data.detail));loading.remove();const answer=String(data.answer||'I could not retrieve that information right now.');const sources=Array.isArray(data.sources)?data.sources:[];state.messages.push({role:'assistant',content:answer,sources});save();addMessage('assistant',answer,sources)}catch(error){loading.remove();addMessage('assistant',apiError(error&&error.message),[],'error')}finally{state.pending=false;send.disabled=false;if(isOpen)focusInput()}}

  function rememberIntro(){
    introShown=true;
    try{sessionStorage.setItem(INTRO_STORAGE,'true')}catch{}
    clearTimeout(openTimer);launcher.classList.remove('is-intro-pulsing');
  }
  function interact(){if(!automaticFocus)clearTimeout(closeTimer)}
  function focusInput(){
    // Accessibility focus must not count as visitor interaction.
    automaticFocus=true;input.focus({preventScroll:true});automaticFocus=false;
  }
  function open(automatic=false){
    clearTimeout(animationTimer);clearTimeout(closeTimer);rememberIntro();
    isOpen=true;panel.hidden=false;panel.inert=false;
    panel.classList.remove('is-closing');panel.classList.add('is-opening');
    launcher.classList.remove('has-notification');
    launcher.setAttribute('aria-expanded','true');launcher.setAttribute('aria-label','Close Babar portfolio assistant');
    updateViewport();focusInput();
    if(automatic)closeTimer=setTimeout(()=>close(true),AUTO_CLOSE_DELAY);
  }
  function close(automatic=false){
    rememberIntro();clearTimeout(closeTimer);clearTimeout(animationTimer);
    isOpen=false;panel.classList.remove('is-opening');panel.classList.add('is-closing');
    panel.inert=true;launcher.setAttribute('aria-expanded','false');launcher.setAttribute('aria-label','Open Babar portfolio assistant');
    if(automatic)launcher.classList.add('has-notification');
    launcher.focus({preventScroll:true});
    animationTimer=setTimeout(()=>{panel.hidden=true;panel.classList.remove('is-closing')},
      matchMedia('(prefers-reduced-motion: reduce)').matches?0:CLOSE_ANIMATION_DURATION);
  }
  function updateViewport(){
    const viewport=window.visualViewport;
    panel.style.setProperty('--chat-viewport-height',(viewport?viewport.height:window.innerHeight)+'px');
    panel.style.setProperty('--chat-keyboard-offset',(viewport?Math.max(0,window.innerHeight-viewport.height-viewport.offsetTop):0)+'px');
  }
  const events=new AbortController();
  const listen=(target,type,handler)=>target.addEventListener(type,handler,{signal:events.signal});
  listen(launcher,'click',()=>isOpen?close():open());
  listen(panel.querySelector('.chat-close'),'click',()=>close());
  listen(panel.querySelector('.chat-clear'),'click',()=>{state.messages=[];try{sessionStorage.removeItem(STORAGE)}catch{}render();focusInput()});
  ['pointerdown','click','input','focusin','keydown','wheel','touchstart'].forEach(type=>listen(panel,type,interact));
  listen(form,'submit',event=>{event.preventDefault();submit()});
  listen(input,'keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();submit()}});
  // Nonmodal so visitors can still navigate the portfolio.
  listen(document,'keydown',event=>{if(event.key==='Escape'&&isOpen){event.preventDefault();close()}});
  listen(window,'resize',updateViewport);
  if(window.visualViewport){listen(window.visualViewport,'resize',updateViewport);listen(window.visualViewport,'scroll',updateViewport)}
  function scheduleIntro(){
    if(introShown)return;
    launcher.classList.add('is-intro-pulsing');
    clearTimeout(openTimer);openTimer=setTimeout(()=>open(true),AUTO_OPEN_DELAY);
  }
  listen(window,'pagehide',event=>{
    clearTimeout(openTimer);clearTimeout(closeTimer);clearTimeout(animationTimer);
    if(!isOpen){panel.hidden=true;panel.classList.remove('is-closing')}
    if(!event.persisted)events.abort();
  });
  listen(window,'pageshow',scheduleIntro);
  render();updateViewport();scheduleIntro();
})();
