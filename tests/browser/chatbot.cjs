// Run with PLAYWRIGHT_MODULE pointing to an installed playwright package.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
 for(const viewport of [{width:1440,height:900},{width:768,height:1024},{width:390,height:844},{width:320,height:568}]){
  const context=await browser.newContext({viewport,isMobile:viewport.width<=390,hasTouch:viewport.width<=390});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  let resolveResponse;
  await page.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.pathname==='/api/chat'){
    await new Promise(resolve=>resolveResponse=resolve);
    return route.fulfill({json:{answer:'Babar builds AI projects with Python and FastAPI.',sources:[]}});
   }
   if(url.hostname!=='portfolio.test')return route.abort();
   const file=path.resolve(url.pathname==='/'?'index.html':'.'+decodeURIComponent(url.pathname));
   if(!file.startsWith(process.cwd()+path.sep))return route.abort();
   try{const body=await fs.readFile(file);const type={'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'}[path.extname(file)]||'application/octet-stream';await route.fulfill({body,contentType:type})}catch{await route.fulfill({status:404,body:''})}
  });
  await page.clock.install({time:new Date('2026-09-13T12:00:00Z')});await page.clock.pauseAt(new Date('2026-09-13T12:00:01Z'));await page.goto('https://portfolio.test/');
  const panel=page.locator('.chat-panel'),launcher=page.locator('.chat-launcher'),input=page.locator('#chat-input');
  await page.clock.runFor(1100);
  assert.equal(await launcher.getAttribute('aria-expanded'),'true');
  assert.equal(await input.evaluate(e=>e===document.activeElement),true);
  assert.match(await panel.textContent(),/Hi! I\u2019m Babar\u2019s AI assistant/);
  assert.equal(await input.getAttribute('placeholder'),'Type your message\u2026');
  assert.equal(await page.locator('.chat-suggestions button').count(),3);
  const box=await panel.boundingBox();assert(box.x>=0&&box.y>=0&&box.x+box.width<=viewport.width&&box.y+box.height<=viewport.height);
  assert.equal(await panel.locator('.chat-head').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(11, 31, 58)');
  await page.screenshot({animations:'disabled',path:path.join(process.env.TEMP||'.',`portfolio-chat-${viewport.width}.png`)});
  await page.clock.fastForward(11700);assert.equal(await launcher.getAttribute('aria-expanded'),'true');
  await page.clock.runFor(300);assert.equal(await launcher.getAttribute('aria-expanded'),'false');
  await page.clock.runFor(300);assert.equal(await panel.isVisible(),false);
  assert(await launcher.evaluate(e=>e.classList.contains('has-notification')));
  assert(await launcher.evaluate(e=>e===document.activeElement));
  await page.reload();await page.clock.runFor(1500);assert.equal(await panel.isVisible(),false);
  await launcher.click();await input.fill('Keep this draft');await page.clock.fastForward(14000);assert.equal(await panel.isVisible(),true);
  await page.keyboard.press('Escape');await page.clock.runFor(300);await launcher.click();assert.equal(await input.inputValue(),'Keep this draft');
  await page.locator('.chat-suggestions button').first().click();
  while(!resolveResponse)await new Promise(resolve=>setTimeout(resolve,10));
  await page.locator('.chat-close').click();await page.clock.runFor(300);await launcher.click();
  assert.equal(await page.locator('.chat-typing').count(),1);
  resolveResponse();await page.getByText('Babar builds AI projects with Python and FastAPI.').waitFor();
  await page.clock.fastForward(14000);assert.equal(await panel.isVisible(),true);
  await page.locator('.chat-close').click();await page.clock.runFor(300);await launcher.click();
  assert.equal(await page.getByText('Babar builds AI projects with Python and FastAPI.').count(),1);
  // Fresh introduction: each kind of interaction independently cancels closing.
  for(const kind of ['click','focus','type','keyboard']){
   await page.evaluate(()=>{sessionStorage.clear()});await page.reload();await page.clock.runFor(1500);
   if(kind==='click')await panel.locator('.chat-head-copy').click();
   if(kind==='focus'){await launcher.focus();await input.focus()}
   if(kind==='type')await input.fill('Hello');
   if(kind==='keyboard')await page.keyboard.press('Tab');
   await page.clock.fastForward(14000);assert.equal(await launcher.getAttribute('aria-expanded'),'true',kind);
  }
  if(viewport.width<=390){
   await page.setViewportSize({width:viewport.width,height:360});
   const inputBox=await input.boundingBox();assert(inputBox.y>=0&&inputBox.y+inputBox.height<=360);
   await page.setViewportSize(viewport);
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await panel.evaluate(e=>getComputedStyle(e).animationName),'none');
  await page.keyboard.press('Escape');await page.clock.runFor(1);assert.equal(await panel.isVisible(),false);
  await page.evaluate(()=>sessionStorage.clear());await page.reload();
  await launcher.click();await page.locator('.chat-close').click();await page.clock.runFor(1500);
  assert.equal(await panel.isVisible(),false,'Early manual close cancels introduction');
  await page.reload();await page.clock.runFor(1500);assert.equal(await panel.isVisible(),false);
  assert.deepEqual(errors,[]);console.log(`PASS ${viewport.width}x${viewport.height}: timing, session, interaction, conversation, keyboard, motion and layout`);
  await context.close();
 }
 } finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
