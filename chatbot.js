(()=>{
  const localApi=location.hostname==='127.0.0.1'||location.hostname==='localhost'?'http://127.0.0.1:8001':'';
  const API=(window.PORTFOLIO_CHAT_API_URL||document.body.dataset.chatApi||localApi).replace(/\/$/,'');
  const STORAGE='bak-portfolio-chat-v1', SESSION='bak-portfolio-chat-session';
  const GREETING="Hi, I'm Babar's portfolio assistant. Ask me about his AI projects, technical skills, experience, or how to contact him.";
  const suggestions=['Tell me about Babar.','Which projects use FastAPI?','Show me his best AI projects.','How can I contact him?'];
  const state={messages:load(),pending:false};
  const sessionId=sessionStorage.getItem(SESSION)||createSession();

  function createSession(){const value=crypto.randomUUID().replaceAll('-','');sessionStorage.setItem(SESSION,value);return value}
  function load(){try{const value=JSON.parse(sessionStorage.getItem(STORAGE)||'[]');return Array.isArray(value)?value.slice(-6):[]}catch{return[]}}
  function save(){sessionStorage.setItem(STORAGE,JSON.stringify(state.messages.slice(-6)))}
  function el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node}

  const launcher=el('button','chat-launcher');launcher.type='button';launcher.setAttribute('aria-label','Open Babar portfolio assistant');launcher.setAttribute('aria-expanded','false');launcher.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-5 4v-4.5A2.5 2.5 0 0 1 4 13.5Z"/></svg><span>Ask about Babar</span>';
  const panel=el('section','chat-panel');panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','chat-title');
  panel.innerHTML='<header class="chat-head"><span class="chat-avatar" aria-hidden="true">AI</span><div class="chat-head-copy"><strong id="chat-title">Portfolio Assistant</strong><small>AI-generated, grounded in verified portfolio data</small></div><button class="chat-icon-button chat-clear" type="button" aria-label="Clear chat">↺</button><button class="chat-icon-button chat-close" type="button" aria-label="Close chat">×</button></header><div class="chat-feed" role="log" aria-live="polite" aria-relevant="additions"></div><form class="chat-form"><div class="chat-input-row"><label class="sr-only" for="chat-input">Ask about Babar</label><textarea id="chat-input" maxlength="1000" rows="1" required placeholder="Ask about projects, skills, or experience…"></textarea><button class="chat-send" type="submit" aria-label="Send message">↑</button></div><small class="chat-note">AI assistant. Messages are not stored permanently. Please avoid sharing sensitive information.</small></form>';
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
  async function submit(value){const message=(value||input.value).trim();if(!message||state.pending)return;const prior=history();state.messages.push({role:'user',content:message});save();addMessage('user',message);input.value='';state.pending=true;send.disabled=true;const loading=addMessage('assistant','');loading.querySelector('.chat-bubble').innerHTML='<span class="chat-typing" aria-label="Assistant is responding"><i></i><i></i><i></i></span>';
    try{const response=await fetch(`${API}/api/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,session_id:sessionId,history:prior})});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(apiError(data.detail));loading.remove();const answer=String(data.answer||'I could not retrieve that information right now.');const sources=Array.isArray(data.sources)?data.sources:[];state.messages.push({role:'assistant',content:answer,sources});save();addMessage('assistant',answer,sources)}catch(error){loading.remove();addMessage('assistant',apiError(error&&error.message),[],'error')}finally{state.pending=false;send.disabled=false;input.focus()}}
  function open(){panel.hidden=false;panel.classList.add('is-opening');launcher.setAttribute('aria-expanded','true');render();setTimeout(()=>input.focus(),0)}
  function close(){panel.hidden=true;launcher.setAttribute('aria-expanded','false');launcher.focus()}
  launcher.addEventListener('click',()=>panel.hidden?open():close());panel.querySelector('.chat-close').addEventListener('click',close);panel.querySelector('.chat-clear').addEventListener('click',()=>{state.messages=[];sessionStorage.removeItem(STORAGE);render();input.focus()});form.addEventListener('submit',event=>{event.preventDefault();submit()});input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();submit()}});
  panel.addEventListener('keydown',event=>{if(event.key==='Escape'){close();return}if(event.key!=='Tab')return;const items=[...panel.querySelectorAll('button,textarea,a[href]')].filter(item=>!item.disabled);const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}});
})();
