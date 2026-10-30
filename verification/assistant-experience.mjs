// Real-browser UI tests. Provider replies below are TEST FIXTURES injected only
// into a local test server; no AI key/live provider is used or claimed tested.
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startServer} from './server.mjs';
const out=fileURLToPath(new URL('./artifacts/',import.meta.url));await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const server=await startServer(new URL('../',import.meta.url));
const ctx=await browser.newContext({ignoreHTTPSErrors:true,reducedMotion:'reduce'});
const page=await ctx.newPage();const errors=[];const results=[];
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>localStorage.setItem('fardin_theme',window.name==='light'?'light':'dark'));
function assert(ok,message){if(!ok)throw Error(message)}
const pauseFrames=async(p,n=2)=>p.evaluate(n=>new Promise(r=>{let count=0;function step(){if(++count>=n)r();else requestAnimationFrame(step)}requestAnimationFrame(step)}),n);
async function load(width,theme='dark',height=900){
 await page.setViewportSize({width,height});await page.evaluate(t=>window.name=t,theme).catch(()=>{});
 await page.goto(server.baseUrl);await page.waitForSelector('.fh-name');await page.evaluate(()=>document.fonts.ready);
 await page.waitForFunction(()=>document.querySelector('.fh-portrait img').complete&&document.querySelector('.fh-portrait img').naturalWidth>0&&document.querySelector('#home').dataset.nameRevealed==='true');
}
for(const theme of ['dark','light'])for(const width of [320,375,390,768,1024,1366,1440,1920]){
 await load(width,theme);
 const geometry=await page.evaluate(()=>{
  const stage=document.querySelector('.fh-visual').getBoundingClientRect(),b=document.querySelector('.fh-robot-hitbox').getBoundingClientRect();
  const visible=getComputedStyle(document.querySelector('.fh-robot-hitbox')).visibility==='visible';
  const face={left:stage.left+stage.width*.27,right:stage.left+stage.width*.80,top:stage.top+stage.height*.13,bottom:stage.top+stage.height*.66};
  const overlaps=visible&&b.left<face.right&&b.right>face.left&&b.top<face.bottom&&b.bottom>face.top;
  return {overlaps,portraitFit:getComputedStyle(document.querySelector('.fh-portrait img')).objectFit,nameSize:parseFloat(getComputedStyle(document.querySelector('.fh-name')).fontSize),horizontal:document.documentElement.scrollWidth>innerWidth};
 });
 assert(!geometry.overlaps&&!geometry.horizontal&&geometry.portraitFit==='contain','Hero geometry '+JSON.stringify({width,theme,geometry}));
 const flat=await page.evaluate(()=>({nav:getComputedStyle(document.querySelector('.navbar-wrapper')).backgroundColor,hero:getComputedStyle(document.querySelector('.fh-hero')).backgroundColor,layer:getComputedStyle(document.querySelector('.fh-atmosphere')).backgroundImage}));
 assert(flat.nav===flat.hero&&flat.layer==='none'&&flat.hero===(theme==='light'?'rgb(244, 244, 241)':'rgb(31, 31, 31)'),'Hero background is not the flat theme field '+JSON.stringify({theme,width,flat}));
 const alpha=await page.evaluate(()=>{const i=document.querySelector('.fh-portrait img'),c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;const x=c.getContext('2d');x.drawImage(i,0,0);const a=(px,py)=>x.getImageData(px,py,1,1).data[3];return {corners:[a(6,6),a(c.width-7,6),a(6,Math.floor(c.height*.4)),a(c.width-7,Math.floor(c.height*.4))],subject:a(Math.floor(c.width*.55),Math.floor(c.height*.4))};});
 assert(alpha.corners.every(v=>v<12)&&alpha.subject>240,'Portrait backdrop is not transparent '+JSON.stringify({theme,width,alpha}));
 await page.locator('.fh-chat-launcher').click();
 await page.waitForFunction(()=>document.querySelector('.pc-dialog').open&&document.querySelector('.pc-status').textContent.includes('Not configured'));
 assert(await page.locator('.pc-send').isDisabled(),'Unconfigured assistant must not send');
 assert(await page.locator('.pc-input').evaluate(e=>e===document.activeElement),'Chat did not focus the input');
 const box=await page.locator('.pc-dialog').boundingBox();
 assert(box.x>=0&&box.y>=0&&box.x+box.width<=width+.5&&box.y+box.height<=900,'Chat outside viewport '+JSON.stringify(box));
 if(width===390){for(let i=0;i<10;i++)await page.keyboard.press('Tab');assert(await page.evaluate(()=>!!document.activeElement.closest('.pc-dialog')),'Tab focus escaped chat');}
 await page.locator('.pc-chip').filter({hasText:'Education'}).click();
 assert((await page.locator('.pc-input').inputValue()).includes('educational'),'Prompt must populate, not invent a reply');
 assert(await page.locator('.pc-message-assistant').count()===0,'Missing-key UI displayed a fake answer');
 if([390,1440].includes(width))await page.screenshot({path:`${out}/assistant-unconfigured-${theme}-${width}.png`});
 await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.pc-dialog').open);
 assert(await page.locator('.fh-chat-launcher').evaluate(e=>e===document.activeElement),'Chat did not restore focus');
 results.push({test:'Hero/photo safety and accessible unconfigured chat',theme,width,status:'PASS',...geometry});
 console.log('PASS chat',theme,width);
}
// Verify the mobile tracker and scenic viewport through each chapter, not just
// when it first becomes sticky. Read-only navigation never forces page capture.
for(const theme of ['dark','light']){
 await load(390,theme,844);
 for(const id of ['who-i-am','what-i-build','why-me','how-i-work']){
  await page.locator(`.ae-nav-link[href="#${id}"]`).click();
  await page.waitForFunction(id=>document.querySelector('.ae-active')?.getAttribute('href')==='#'+id,id);await pauseFrames(page);
  const g=await page.evaluate(id=>{
   const nav=document.querySelector('.ae-nav').getBoundingClientRect(),chapter=document.getElementById(id).getBoundingClientRect(),scene=document.querySelector('.ae-scenery-frame').getBoundingClientRect();
   return {navTop:nav.top,navBottom:nav.bottom,chapterTop:chapter.top,sceneTop:scene.top,sceneBottom:scene.bottom,chapterBottom:chapter.bottom,src:document.querySelector('.ae-scenery img').currentSrc};
  },id);
  assert(g.navTop>=63&&g.navTop<=66&&g.chapterTop>=g.navBottom,'Tracker lost sticky position '+id+' '+JSON.stringify(g));
  assert(g.sceneTop<=g.chapterTop&&g.sceneBottom>=Math.min(g.chapterBottom,844)-2,'Scenery gap '+id+' '+JSON.stringify(g));
  assert(g.src.includes(theme==='light'?'about-summitscape-light.webp':'about-summitscape.webp'),'Wrong About theme image');
  if(id==='how-i-work')await page.screenshot({path:`${out}/about-final-chapter-${theme}-390.png`});
 }
 results.push({test:'Sticky mobile tracker and continuous scenery across all chapters',theme,status:'PASS'});
}
// Actual robot phase callbacks must coordinate the real name DOM.
await page.emulateMedia({reducedMotion:'no-preference'});
await page.addInitScript(()=>{
 window.robotPhases=[];window.progressiveNameObserved=false;
 new MutationObserver(()=>{
  const root=document.querySelector('#home'),phase=root?.dataset.mascotPhase;
  if(phase&&!window.robotPhases.includes(phase))window.robotPhases.push(phase);
  if(phase==='reveal'){
   const values=[...document.querySelectorAll('.fh-name-word')].map(e=>Number(e.style.opacity));
   const sum=values.reduce((a,b)=>a+b,0);if(sum>0&&sum<values.length)window.progressiveNameObserved=true;
  }
 }).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['data-mascot-phase','style']});
});
await load(1440,'dark');
await page.waitForFunction(()=>document.querySelector('#home').dataset.mascotPhase==='orbit',{},{timeout:20000});
const sequence=await page.evaluate(()=>({phases:window.robotPhases,progressive:window.progressiveNameObserved}));
assert(['enter','reveal','orbit'].every((p,i)=>sequence.phases.indexOf(p)>=i)&&sequence.progressive,'Robot/name sequence '+JSON.stringify(sequence));
results.push({test:'Real Three.js entrance/reveal/orbit and progressive name',status:'PASS',...sequence});
await page.waitForSelector('.fh-robot-hitbox',{state:'visible'});
await page.locator('.fh-robot-hitbox').hover({force:true});const before=await page.locator('.fh-robot-hitbox').boundingBox();
await new Promise(r=>setTimeout(r,180));const after=await page.locator('.fh-robot-hitbox').boundingBox();
assert(Math.abs(before.x-after.x)<.6&&Math.abs(before.y-after.y)<.6,'Robot does not pause for interaction');
await page.locator('.fh-robot-hitbox').click();await page.waitForFunction(()=>document.querySelector('.pc-dialog').open);
await page.locator('.pc-close').click();results.push({test:'Tracked robot button pauses and opens/closes chat',status:'PASS'});
// Short/keyboard-sized viewports retain composer and close controls.
await page.emulateMedia({reducedMotion:'reduce'});await load(390,'light',420);
await page.locator('.fh-chat-launcher').click();await page.waitForFunction(()=>document.querySelector('.pc-dialog').open);
const short=await page.evaluate(()=>{
 const b=document.querySelector('.pc-dialog').getBoundingClientRect(),s=document.querySelector('.pc-send').getBoundingClientRect(),c=document.querySelector('.pc-close').getBoundingClientRect();
 return {top:b.top,bottom:b.bottom,sendBottom:s.bottom,closeTop:c.top};
});assert(short.top>=0&&short.bottom<=420&&short.sendBottom<=short.bottom&&short.closeTop>=short.top,'Short chat clipped '+JSON.stringify(short));
await page.keyboard.press('Escape');results.push({test:'Short mobile viewport keeps chat controls reachable',status:'PASS'});
// Full server/client integration against an explicitly mocked provider only.
let mode='success';const payloads=[];
const fixture=await startServer(new URL('../',import.meta.url),{env:{AI_API_KEY:'fixture-not-a-real-key',AI_MODEL:'fixture-model'},fetchImpl:async(url,options)=>{
 payloads.push(JSON.parse(options.body));await new Promise(r=>setTimeout(r,350));
 if(mode==='error')return new Response('private upstream fixture',{status:500});
 return new Response(JSON.stringify({choices:[{message:{content:mode==='html'?'<img src=x onerror="window.fixtureXss=true">':'TEST FIXTURE: provider transport exercised.'}}]}),{status:200,headers:{'Content-Type':'application/json'}});
}});
await page.setViewportSize({width:390,height:844});await page.goto(fixture.baseUrl);await page.waitForSelector('.fh-name');
await page.locator('.fh-chat-launcher').click();await page.waitForFunction(()=>document.querySelector('.pc-status').textContent.includes('Server configured'));
await page.locator('.pc-input').fill('Which projects are in the portfolio?');await page.locator('.pc-send').click();await page.waitForSelector('.pc-pending');
await page.waitForSelector('.pc-message-assistant');assert((await page.locator('.pc-message-assistant').innerText()).includes('TEST FIXTURE'),'Fixture transport missing');
assert(payloads[0].messages[0].role==='system'&&payloads[0].messages[0].content.includes('Southeast University'),'Server grounding missing');
results.push({test:'Configured local transport, loading state and server profile grounding (mock provider only)',status:'PASS'});
mode='error';await page.locator('.pc-input').fill('Keep this question on failure');await page.locator('.pc-send').click();await page.waitForSelector('.pc-error:not([hidden])');
assert(await page.locator('.pc-input').inputValue()==='Keep this question on failure','Question lost on provider error');
assert(!(await page.locator('.pc-dialog').innerText()).includes('private upstream fixture'),'Upstream body leaked');
results.push({test:'Real server error path restores draft and hides upstream internals',status:'PASS'});
mode='html';await page.locator('.pc-input').fill('Display response safely');await page.locator('.pc-send').click();await page.waitForFunction(()=>document.querySelector('.pc-log').textContent.includes('<img src=x'));
assert(await page.locator('.pc-log img').count()===0&&!await page.evaluate(()=>window.fixtureXss),'Reply HTML executed');
results.push({test:'Provider-supplied HTML remains inert text',status:'PASS'});
await page.keyboard.press('Escape');await fixture.close();
assert(errors.length===0,'Browser page errors '+errors.join(';'));
await fs.writeFile(`${out}/assistant-experience-results.json`,JSON.stringify({testedAt:new Date().toISOString(),provider:'No live AI call; explicit fixture only where configured',results,pageErrors:errors},null,2));
console.log('ALL PASS',results.length,'assistant/animation/background cases');await browser.close();await server.close();
