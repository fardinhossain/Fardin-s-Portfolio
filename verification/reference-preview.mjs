import {chromium} from 'playwright';
import {startServer} from './server.mjs';
import fs from 'node:fs/promises';
const server=await startServer(new URL('../',import.meta.url));
const b=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const p=await b.newPage({reducedMotion:'reduce',ignoreHTTPSErrors:true});p.on('pageerror',e=>console.log('ERROR',e.message));
await fs.mkdir(new URL('./artifacts/',import.meta.url),{recursive:true});
for(const width of [1440,761,390]){
 await p.setViewportSize({width,height:1000});await p.goto(server.baseUrl);await p.waitForSelector('.fh-name');await p.evaluate(()=>document.fonts.ready);await p.waitForSelector('.fh-orbit-host canvas');
 await p.waitForFunction(()=>document.querySelector('.fh-portrait img').complete);
 await p.screenshot({path:new URL(`./artifacts/reference-hero-${width}.png`,import.meta.url).pathname});
 await p.evaluate(()=>document.querySelector('#about').scrollIntoView({behavior:'instant',block:'start'}));
 await p.waitForSelector('.ae-ghost-robot canvas');await p.locator('.ae-scenery img').evaluate(e=>e.decode());
 await p.screenshot({path:new URL(`./artifacts/reference-about-${width}.png`,import.meta.url).pathname});
 console.log(width,await p.evaluate(()=>({heroHeight:document.querySelector('.fh-hero').offsetHeight,title:getComputedStyle(document.querySelector('.ae-title')).fontSize,quote:getComputedStyle(document.querySelector('.ae-quote')).fontSize,contentX:document.querySelector('.ae-content').getBoundingClientRect().x,overflow:document.documentElement.scrollWidth>innerWidth})));
}
await b.close();await server.close();
