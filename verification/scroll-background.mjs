import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startServer} from './server.mjs';
const out=fileURLToPath(new URL('./artifacts/',import.meta.url));await fs.mkdir(out,{recursive:true});
const server=await startServer(new URL('../',import.meta.url));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const context=await browser.newContext({ignoreHTTPSErrors:true});
const page=await context.newPage();const errors=[];const results=[];
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>localStorage.setItem('fardin_theme',window.name==='light'?'light':'dark'));
const jump=async target=>page.evaluate(async t=>{const {scrollToTarget}=await import('/assets/js/smooth-scroll.js');scrollToTarget(t,{immediate:true});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},target);
const frames=async(count=40)=>page.evaluate(n=>new Promise(resolve=>{const values=[];function sample(){values.push(scrollY);if(values.length>=n)resolve(values);else requestAnimationFrame(sample)}requestAnimationFrame(sample)}),count);
function assert(condition,message){if(!condition)throw Error(message)}
for(const theme of ['dark','light'])for(const width of [320,375,390,768,1024,1366,1440,1920]){
 await page.setViewportSize({width,height:1000});await page.evaluate(t=>window.name=t,theme);
 await page.goto(server.baseUrl+'/');await page.waitForSelector('.ae-section');
 await page.waitForFunction(()=>document.documentElement.dataset.scrollEngine==='lenis');
 await jump('#about');
 await page.waitForFunction(()=>document.querySelector('.ae-scenery img').complete&&document.querySelector('.ae-scenery img').naturalWidth>0);
 await page.evaluate(()=>document.querySelector('.ae-scenery img').decode());
 const background=await page.evaluate(()=>{
  const b=document.querySelector('.ae-section').getBoundingClientRect(),img=document.querySelector('.ae-scenery img'),i=img.getBoundingClientRect(),s=document.querySelector('.ae-scenery').getBoundingClientRect();
  return {theme:document.documentElement.dataset.theme,sectionHeight:b.height,imageHeight:i.height,sectionWidth:b.width,imageWidth:i.width,source:img.currentSrc,allChaptersCovered:[...document.querySelectorAll('.ae-chapter')].every(c=>{const r=c.getBoundingClientRect();return r.top>=s.top-1&&r.bottom<=s.bottom+1}),sceneryHeight:s.height,overflow:document.documentElement.scrollWidth>innerWidth};
 });
 assert(background.sceneryHeight>=background.sectionHeight-1&&background.allChaptersCovered&&!background.overflow,'Background coverage '+JSON.stringify(background));
 assert(background.source.endsWith('.webp'),'Optimized user image not selected');
 results.push({test:'Full About background',width,...background,status:'PASS'});
 if([390,1440].includes(width)){
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>[...document.querySelectorAll('.ae-reveal-entered .ae-word')].every(e=>Number(getComputedStyle(e).opacity)>.99));
  await page.screenshot({path:`${out}/summitscape-${theme}-${width}.png`});
  if(width===1440&&theme==='dark'){
   await jump('#why-me');await page.screenshot({path:`${out}/summitscape-dark-chapter03.png`});
  }
 }
 console.log('PASS background',theme,width);
}
await page.setViewportSize({width:1440,height:1000});
await jump('#about');const start=await page.evaluate(()=>scrollY);await page.mouse.move(820,400);await page.mouse.wheel(0,560);const samples=await frames(55);const delta=samples.at(-1)-start;
assert(delta>250&&delta<600,'Wheel destination unexpected '+delta);
assert(samples.some(y=>y>start+5&&y<samples.at(-1)-5),'Wheel jumped rather than eased');
assert(samples.every((y,i)=>i===0||y>=samples[i-1]-1),'Wheel reversed unexpectedly');
results.push({test:'Actual wheel eases progressively, real window scroll updates',status:'PASS',delta,distinctPositions:new Set(samples.map(Math.round)).size});
// Existing chapter links use the same service and finish below sticky navigation.
await jump('#about');await page.locator('.ae-nav-link[href="#how-i-work"]').click();
await page.waitForFunction(()=>Math.abs(document.querySelector('#how-i-work').getBoundingClientRect().top-parseFloat(getComputedStyle(document.querySelector('#about')).getPropertyValue('--ae-anchor-offset')))<3);
await page.waitForFunction(()=>document.querySelector('.ae-active')?.getAttribute('href')==='#how-i-work');
results.push({test:'Programmatic chapter navigation uses smooth controller and preserves tracker',status:'PASS'});
// New manual wheel input must cancel a previous programmatic destination.
await jump('#about');
await page.evaluate(async()=>{const {scrollToTarget}=await import('/assets/js/smooth-scroll.js');scrollToTarget('#contact');});
await frames(3);await page.mouse.move(30,300);
// Capture at actual event dispatch, not before a potentially slow WebGL frame.
await page.evaluate(()=>document.addEventListener('wheel',()=>{window.testInterruptDistance=document.querySelector('#contact').getBoundingClientRect().top;},{once:true,capture:true}));
await page.mouse.wheel(0,-360);await frames(65);
const beforeInterrupt=await page.evaluate(()=>{const value=window.testInterruptDistance;delete window.testInterruptDistance;return value});
const contactDistance=await page.locator('#contact').evaluate(e=>e.getBoundingClientRect().top);
assert(contactDistance>beforeInterrupt+80,'User wheel did not interrupt old contact destination: '+JSON.stringify({beforeInterrupt,contactDistance}));
results.push({test:'Manual wheel interrupts navigation; no locked forced scroll',status:'PASS',contactDistance});
// A nested native scrollable dialog must not move the underlying page.
await jump('#about');await page.evaluate(()=>{
 const d=document.createElement('div');d.id='scroll-dialog-test';d.setAttribute('role','dialog');d.style.cssText='position:fixed;top:200px;left:600px;width:280px;height:220px;overflow:auto;z-index:99999;background:#222';d.innerHTML='<div style="height:1500px">Temporary scrolling test</div>';document.body.append(d);
});
const beforeDialog=await page.evaluate(()=>scrollY);await page.mouse.move(720,310);await page.mouse.wheel(0,260);await frames(25);
const dialog=await page.evaluate(()=>({inner:document.querySelector('#scroll-dialog-test').scrollTop,outer:scrollY}));
assert(dialog.inner>100&&Math.abs(dialog.outer-beforeDialog)<2,'Nested dialog scroll stolen '+JSON.stringify(dialog));
await page.evaluate(()=>document.querySelector('#scroll-dialog-test').remove());
results.push({test:'Nested dialog scroll remains native and does not move background page',status:'PASS'});
// Delivery effects no longer own viewport movement.
await jump('#projects');await page.waitForFunction(()=>document.querySelector('#projects').dataset.projectsDelivering==='true',{timeout:15000});
const deliverySamples=await frames(80);assert(Math.max(...deliverySamples)-Math.min(...deliverySamples)<3,'Project delivery changed viewport');
results.push({test:'Robot delivery does not auto-follow or pull the viewport',status:'PASS'});
// Live OS preference switches destroy/recreate the enhancement without reload.
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.documentElement.dataset.scrollEngine==='native'&&!document.documentElement.classList.contains('lenis'));
await page.locator('.navbar-wrapper .brand-logo').click();await page.waitForFunction(()=>scrollY<2);
const style=await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior);assert(style==='auto','Reduced-motion smooth CSS remains active');
await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>document.documentElement.dataset.scrollEngine==='lenis');
results.push({test:'Live reduced-motion preference returns to native/instant then restores easing',status:'PASS'});
// Touch events are deliberately not smoothed or prevented by Lenis.
const touchContext=await browser.newContext({ignoreHTTPSErrors:true,hasTouch:true,isMobile:true,viewport:{width:390,height:844}});const touchPage=await touchContext.newPage();
await touchPage.goto(server.baseUrl+'/');await touchPage.waitForSelector('.fh-name');await touchPage.waitForFunction(()=>document.documentElement.dataset.scrollEngine==='lenis');
const nativeTouch=await touchPage.evaluate(()=>{
 const target=document.body;
 const start=new Touch({identifier:1,target,clientX:150,clientY:500});
 target.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,cancelable:true,touches:[start],targetTouches:[start],changedTouches:[start]}));
 const next=new Touch({identifier:1,target,clientX:150,clientY:400});
 const move=new TouchEvent('touchmove',{bubbles:true,cancelable:true,touches:[next],targetTouches:[next],changedTouches:[next]});
 target.dispatchEvent(move);
 target.dispatchEvent(new TouchEvent('touchend',{bubbles:true,cancelable:true,touches:[],targetTouches:[],changedTouches:[next]}));
 return !move.defaultPrevented;
});assert(nativeTouch,'Touch scrolling was intercepted');await touchContext.close();
results.push({test:'Mobile touch movement is not prevented or given synthetic inertia',status:'PASS'});
// Native keyboard navigation must remain available.
await jump(0);await page.keyboard.press('PageDown');const keySamples=await frames(40);
assert(keySamples.at(-1)>300,'Native PageDown stopped working');
results.push({test:'Browser keyboard PageDown continues to move the real document',status:'PASS'});
// The same singleton serves the dedicated internship route and its back-to-top.
await page.goto(server.baseUrl+'/journey');await page.waitForSelector('.story-page-root');
await page.waitForFunction(()=>!document.querySelector('.story-branded-loader')&&document.documentElement.dataset.scrollEngine==='lenis');
await jump('#chapter-05-certificates');await page.locator('.story-back-to-top-btn').click();await page.waitForFunction(()=>scrollY<2);
results.push({test:'Journey route and story back-to-top use the shared smooth service',status:'PASS'});
// Enhancement download failure must leave a usable native-scrolling website.
const failedContext=await browser.newContext({ignoreHTTPSErrors:true});
await failedContext.route('**/vendor/lenis-1.3.11.mjs',route=>route.abort());
const failedPage=await failedContext.newPage();failedPage.on('pageerror',e=>errors.push(e.message));
await failedPage.goto(server.baseUrl+'/');await failedPage.waitForSelector('.ae-section');
await failedPage.waitForFunction(()=>document.documentElement.dataset.scrollEngine==='native');
await failedPage.locator('.ae-nav-link[href="#why-me"]').click();
await failedPage.waitForFunction(()=>Math.abs(document.querySelector('#why-me').getBoundingClientRect().top-parseFloat(getComputedStyle(document.querySelector('#about')).getPropertyValue('--ae-anchor-offset')))<3);
await failedContext.close();
results.push({test:'Blocked smooth module falls back to working native anchor scrolling',status:'PASS'});
assert(errors.length===0,'Browser exceptions '+errors.join(';'));
await fs.writeFile(`${out}/scroll-background-results.json`,JSON.stringify({testedAt:new Date().toISOString(),browser:'Chromium 141 / software WebGL',results,pageErrors:errors},null,2));
console.log('ALL PASS',results.length,'background/scroll cases');
await browser.close();await server.close();
