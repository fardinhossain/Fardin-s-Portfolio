import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {startServer} from './server.mjs';
const out=fileURLToPath(new URL('./artifacts/',import.meta.url));
await fs.mkdir(out,{recursive:true});
const server=await startServer(new URL('../',import.meta.url));
const baseUrl=server.baseUrl;
const browser=await chromium.launch({headless:true,channel:'chrome',args:['--no-sandbox','--enable-unsafe-swiftshader']});
const results=[];
const widths=process.env.QUICK?[]:[320,375,390,768,1024,1366,1440,1920];
const errors=[];
const context=await browser.newContext({ignoreHTTPSErrors:true,deviceScaleFactor:1});
const page=await context.newPage();
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{localStorage.setItem('fardin_theme',window.name==='light'?'light':'dark');});
async function load(width,theme='dark',motion='no-preference') {
 await page.setViewportSize({width,height:1000});
 await page.emulateMedia({reducedMotion:motion});
 await page.evaluate(t=>window.name=t,theme).catch(()=>{});
 await page.goto(baseUrl+'/',{waitUntil:'domcontentloaded'});
 await page.waitForSelector('.fh-name');
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForFunction(()=>document.querySelector('.fh-portrait img').complete && document.querySelector('.fh-portrait img').naturalWidth>0);
 await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('.fh-actions')).opacity)>.99);
 await page.waitForFunction(()=>document.querySelector('#home').dataset.nameRevealed==='true');
}
for(const theme of ['dark','light']) for(const width of widths) {
 await load(width,theme);
 const layout=await page.evaluate(()=>{
  const rect=e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom}};
  const hero=document.querySelector('.fh-hero');
  const overflows=[...document.querySelectorAll('.fh-hero h1,.fh-hero h2,.fh-kicker,.fh-actions a,.fh-strengths li,.ae-chapter h3,.ae-capability,.ae-step,.ae-label,.ae-nav-link')].map(e=>({text:e.textContent,rect:rect(e)})).filter(x=>x.rect.x<-.5||x.rect.right>innerWidth+.5);
  return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,theme:document.documentElement.dataset.theme,portrait:rect(document.querySelector('.fh-portrait')),portraitTheme:document.querySelector('.fh-portrait picture').dataset.portraitTheme,portraitSource:document.querySelector('.fh-portrait img').currentSrc,extraHalo:!!document.querySelector('.fh-halo'),nameFont:getComputedStyle(document.querySelector('.fh-name')).fontFamily,mobileNameOverlay:document.querySelector('.fh-visual').contains(document.querySelector('.fh-name')),headline:rect(document.querySelector('.fh-headline')),name:rect(document.querySelector('.fh-name')),hero:rect(hero),about:rect(document.querySelector('#about')),overflows,headText:document.querySelector('.fh-headline').textContent.replace(/\s+/g,' ').trim(),nameText:document.querySelector('.fh-name').textContent,quote:document.querySelector('.ae-quote .ae-reveal-visual').textContent,stages:[...document.querySelectorAll('.ae-step h4')].map(e=>e.textContent),resume:document.querySelector('.fh-resume').getAttribute('href'),chapters:document.querySelectorAll('.ae-chapter').length};
 });
 if(layout.scrollWidth>width||layout.overflows.length||layout.chapters!==4||layout.headText!=='BUILDING THAT CREATES INTELLIGENT IMPACT') throw Error('Layout/content failure '+JSON.stringify(layout));
 if(layout.portraitTheme!==theme||!layout.portraitSource.includes(theme==='light'?'hero-portrait-light-cutout.webp':'hero-portrait-dark-cutout.webp')||layout.extraHalo||!layout.nameFont.includes('Anton'))throw Error('Theme portrait/name regression '+JSON.stringify(layout));
 if(width<=700 && (!layout.mobileNameOverlay || layout.name.bottom>layout.portrait.bottom+1 || layout.name.y<layout.portrait.y+layout.portrait.height*.65))throw Error('Mobile name is not over lower portrait '+JSON.stringify(layout));
 results.push({theme,width,status:'PASS',...layout});
 if([320,390,768,1440,1920].includes(width))await page.screenshot({path:`${out}/hero-${theme}-${width}.png`});
 await page.locator('#about').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>[...document.querySelectorAll('.ae-reveal-entered .ae-word')].every(e=>Number(getComputedStyle(e).opacity)>.99));
 if([390,1440].includes(width))await page.locator('#about').screenshot({path:`${out}/about-${theme}-${width}.png`});
 console.log('PASS',theme,width,'height',layout.hero.height);
}
// Real button clicks and deterministic chapter tracking at desktop/mobile.
for(const width of (process.env.QUICK?[]:[390,1440])){
 await load(width,'dark','reduce');
 for(const [index,id] of ['who-i-am','what-i-build','why-me','how-i-work'].entries()){
  await page.locator(`.ae-nav-link[href="#${id}"]`).click();
  await page.waitForFunction(i=>document.querySelector('.ae-active')?.getAttribute('href')===`#${['who-i-am','what-i-build','why-me','how-i-work'][i]}`,index);
  const top=await page.locator(`#${id}`).evaluate(e=>e.getBoundingClientRect().top);
  if(top<65||top>240)throw Error('Chapter scroll offset '+width+' '+id+' '+top);
 }
 await page.locator('.navbar-wrapper .brand-logo').click();
 await page.waitForFunction(()=>scrollY<100);
 await page.waitForSelector('.fh-orbit-host canvas');
 const before=await page.locator('.fh-orbit-host canvas').screenshot();
 await page.waitForTimeout(150);
 const after=await page.locator('.fh-orbit-host canvas').screenshot();
 if(!before.equals(after))throw Error('Reduced-motion robot is not static');
 // Use reduced motion to exercise the real shared theme handler without long flight.
 await page.locator('.theme-toggle-btn').click();
 await page.waitForFunction(()=>document.documentElement.dataset.theme==='light' && document.querySelector('.fh-portrait picture').dataset.portraitTheme==='light' && document.querySelector('.fh-portrait img').currentSrc.includes('hero-portrait-light-cutout.webp'));
 await page.locator('.fh-contact').click();
 await page.waitForFunction(()=>Math.abs(document.querySelector('#contact').getBoundingClientRect().top)<180);
 results.push({test:'chapter navigation, Home, reduced-motion static robot, theme toggle and contact CTA',width,status:'PASS'});
}
// Exercise actual module in an isolated measurable host: pose changes, pause,
// preference changes, renderer failure and idempotent disposal.
await load(1440,'dark','reduce');
await page.evaluate(async()=>{
 const {mountHeroOrbit}=await import('/assets/js/hero-orbit-scene.js');
 const host=document.createElement('div');host.id='orbit-test-host';host.style.cssText='position:fixed;inset:100px auto auto 500px;width:500px;height:500px;z-index:200;background:#111';document.body.append(host);
 window.testOrbit=mountHeroOrbit(host,{reducedMotion:false});
});
await page.waitForSelector('#orbit-test-host canvas');
const robotA=await page.locator('#orbit-test-host').screenshot();
await page.waitForTimeout(450);
const robotB=await page.locator('#orbit-test-host').screenshot();
const moved=!robotA.equals(robotB);
await page.evaluate(()=>window.testOrbit.setReducedMotion(true));
const robotStaticA=await page.locator('#orbit-test-host').screenshot();
await page.waitForTimeout(150);
const robotStaticB=await page.locator('#orbit-test-host').screenshot();
const stopped=robotStaticA.equals(robotStaticB);
const cleanup=await page.evaluate(async()=>{
 const {mountHeroOrbit}=await import('/assets/js/hero-orbit-scene.js');
 window.testOrbit.dispose();window.testOrbit.dispose();
 const removed=!document.querySelector('#orbit-test-host canvas');document.querySelector('#orbit-test-host').remove();delete window.testOrbit;
 const failing=document.createElement('div');document.body.append(failing);const original=HTMLCanvasElement.prototype.getContext;
 HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl/.test(type)?null:original.call(this,type,...args)};
 let fallback;try{const controller=mountHeroOrbit(failing);controller.dispose();fallback=!failing.querySelector('canvas')}finally{HTMLCanvasElement.prototype.getContext=original;failing.remove()}
 return {removed,fallback};
});
const lifecycle={moved,stopped,...cleanup};
if(!Object.values(lifecycle).every(Boolean))throw Error('Lifecycle '+JSON.stringify(lifecycle));
results.push({test:'WebGL screenshot changes, reduced-motion switch, disposal and no-WebGL fallback',status:'PASS',...lifecycle});
// No WebGL must never block semantic Hero/About content or controls.
const fallbackContext=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:390,height:844},reducedMotion:'reduce'});
await fallbackContext.addInitScript(()=>{
 const original=HTMLCanvasElement.prototype.getContext;
 HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl/.test(type)?null:original.call(this,type,...args)};
});
const fallbackPage=await fallbackContext.newPage();
fallbackPage.on('pageerror',e=>errors.push(e.message));
await fallbackPage.goto(baseUrl+'/');await fallbackPage.waitForSelector('.fh-name');
await fallbackPage.waitForFunction(()=>document.querySelector('.ae-chapter'));
if(await fallbackPage.locator('.ae-chapter').count()!==4)throw Error('Fallback lost chapter content');
if(await fallbackPage.locator('.fh-resume').getAttribute('href')!=='/Fardin_Hossain_Resume.pdf')throw Error('Fallback lost resume');
await fallbackContext.close();
results.push({test:'Hero/About remain readable and links remain present without WebGL',status:'PASS'});
// Whitespace is not implemented using margins: assert exact text and real spaces.
await page.locator('#about').scrollIntoViewIfNeeded();
const spacing=await page.evaluate(()=>{
 const el=document.querySelector('.ae-quote .ae-reveal-visual');
 const exact=el.textContent==='I turn complex problems into practical digital experiences.”' && document.querySelector('.ae-quote .ae-sr-only').textContent==='“I turn complex problems into practical digital experiences.”';
 const spaces=[...el.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE&&/\s/.test(n.textContent));
 const widths=spaces.map(n=>{const r=document.createRange();r.selectNodeContents(n);return r.getBoundingClientRect().width});
 return {exact,count:spaces.length,visibleSpaces:widths.every(w=>w>1)};
});
if(!spacing.exact||spacing.count!==7||!spacing.visibleSpaces)throw Error('Whitespace regression '+JSON.stringify(spacing));
results.push({test:'Exact quote text, punctuation and rendered whitespace widths',status:'PASS',...spacing});
if(errors.length)throw Error('Browser exceptions '+errors.join(';'));
await fs.writeFile(`${out}/results.json`,JSON.stringify({testedAt:new Date().toISOString(),browser:'Chromium 141 / Playwright 1.56.1 / software WebGL',results,pageErrors:errors},null,2));
console.log('ALL PASS',results.length,'cases, no page exceptions');
await browser.close();
await server.close();
