(() => {
  const rows = [
    {title:'AI & Machine Learning', items:[['Python','Core Language','python','#3776AB'],['Scikit-learn','Classical ML','scikitlearn','#F7931E'],['TensorFlow','Deep Learning','tensorflow','#FF6F00'],['Pandas','Data Workflow','pandas','#150458'],['NumPy','Numerical Computing','numpy','#4D77CF']]},
    {title:'Generative AI & Agents', items:[['LangChain','LLM Orchestration','langchain','#1C3C3C'],['Hugging Face','Open Models','huggingface','#D49A00'],['PyTorch','Model Development','pytorch','#EE4C2C'],['OpenAI','Language Models','openai','#222222'],['n8n','AI Automation','n8n','#EA4B71']]},
    {title:'Engineering & MLOps', items:[['FastAPI','API Services','fastapi','#009688'],['Docker','Containers','docker','#2496ED'],['GitHub','Version Control','github','#181717'],['PostgreSQL','Data Layer','postgresql','#4169A1'],['React','Product Interfaces','react','#087EA4']]}
  ];
  window.renderCapabilities = (stage, skills) => {
    const card = ([name,category,slug,color], duplicate) => `<li class="capability-card" ${duplicate?'':'tabindex="0"'} style="--brand:${color}"><span class="capability-logo"><img src="assets/logos/${slug}.svg" width="32" height="32" alt="" decoding="async"></span><span class="capability-copy"><strong>${name}</strong><small>${category}</small></span></li>`;
    stage.innerHTML = `<div class="capability-layers">${rows.map((row,index)=>`<section class="capability-row" aria-labelledby="capability-row-${index}"><h3 id="capability-row-${index}"><span class="capability-dot" aria-hidden="true"></span>${row.title}</h3><div class="capability-window"><div class="capability-track">${[false,true].map(duplicate=>`<ul class="capability-group" ${duplicate?'aria-hidden="true"':''}>${row.items.map(item=>card(item,duplicate)).join('')}</ul>`).join('')}</div></div></section>`).join('')}</div><details class="capability-support"><summary>Explore supporting capabilities</summary><div>${skills.map(([title,items])=>`<p><strong>${title}</strong><span>${items.join(' · ')}</span></p>`).join('')}</div></details>`;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = matchMedia('(hover: hover) and (pointer: fine)');
    const reset = () => {stage.style.setProperty('--tilt-x','0deg');stage.style.setProperty('--tilt-y','0deg')};
    stage.addEventListener('pointermove', event => {
      if(motion.matches || !pointer.matches || event.pointerType==='touch')return;
      const bounds = stage.getBoundingClientRect();
      stage.style.setProperty('--tilt-x',`${((event.clientY-bounds.top)/bounds.height-.5)*-2}deg`);
      stage.style.setProperty('--tilt-y',`${((event.clientX-bounds.left)/bounds.width-.5)*2.5}deg`);
    });
    stage.addEventListener('pointerleave',reset);
    motion.addEventListener('change',reset);
    pointer.addEventListener('change',reset);
    // Bring the complete, static original list into view for keyboard navigation.
    stage.addEventListener('focusin',event=>{
      if(!event.target.matches('.capability-card'))return;
      const viewport=event.target.closest('.capability-window');
      viewport.scrollLeft=event.target.offsetLeft-(viewport.clientWidth-event.target.offsetWidth)/2;
    });
    stage.addEventListener('focusout',event=>{
      if(event.relatedTarget && stage.contains(event.relatedTarget))return;
      stage.querySelectorAll('.capability-window').forEach(viewport=>{viewport.scrollLeft=0});
    });
  };
})();
