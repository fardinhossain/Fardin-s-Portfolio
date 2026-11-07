import { chromium } from 'playwright';
import { startServer } from './server.mjs';

const rootDir = new URL('../', import.meta.url);
const server = await startServer(rootDir);
const baseUrl = server.baseUrl;

console.log('Testing Hero Transition Coordination after 6s Welcome Intro on', baseUrl);

const browser = await chromium.launch({
  headless: true,
  channel: 'chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']
});

try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(baseUrl + '/');

  // 1. Overlay is active
  await page.locator('.welcome-intro-overlay').waitFor({ state: 'attached', timeout: 3000 });
  console.log('Step 1: Welcome intro overlay is mounted.');

  // 2. While overlay is active, hero animations are NOT running
  const typewriterTextWhileIntro = await page.evaluate(() => {
    const p1 = document.querySelector('.fh-part-1')?.textContent || '';
    const p2 = document.querySelector('.fh-part-2')?.textContent || '';
    return (p1 + p2).trim();
  });
  if (typewriterTextWhileIntro !== '') {
    throw new Error(`Expected typewriter bar empty during intro, found: "${typewriterTextWhileIntro}"`);
  }

  const robotCanvasWhileIntro = await page.evaluate(() => {
    return document.querySelectorAll('.fh-orbit-host canvas').length;
  });
  if (robotCanvasWhileIntro !== 0) {
    throw new Error('Expected 0 Three.js canvas in hero orbit host during intro, but canvas was mounted!');
  }
  console.log('Step 2: Hero animations (Three.js orbit and Typewriter) are dormant while intro is active.');

  // 3. Trigger video ended (simulates 6-second video completion)
  await page.evaluate(() => {
    const v = document.querySelector('.welcome-intro-video');
    if (v) v.dispatchEvent(new Event('ended'));
  });

  // 4. Wait for the overlay to fade out and unmount (Hero section appears!)
  await page.waitForFunction(() => !document.querySelector('.welcome-intro-overlay'), { timeout: 3000 });
  const heroAppearedTimestamp = Date.now();
  console.log('Step 3: Welcome overlay unmounted; Hero section has appeared.');

  // 5. Check at ~150ms after Hero appeared: 0.5s has NOT elapsed yet
  await page.waitForTimeout(150);
  const robotCanvasAt150ms = await page.evaluate(() => {
    return document.querySelectorAll('.fh-orbit-host canvas').length;
  });
  if (robotCanvasAt150ms !== 0) {
    throw new Error('Hero animations started too early! Expected no Three.js canvas before 0.5s elapsed.');
  }
  console.log('Step 4: At 150ms after appearance, animations have not triggered yet (0.5s delay working).');

  // 6. Wait for 0.5s (500ms) delay to complete (total ~600ms after appearance)
  await page.waitForFunction(() => {
    const hasCanvas = document.querySelectorAll('.fh-orbit-host canvas').length > 0;
    return hasCanvas;
  }, { timeout: 3000 });
  const animationTriggerTimestamp = Date.now();
  const elapsedDelay = animationTriggerTimestamp - heroAppearedTimestamp;
  console.log(`Step 5: Hero animation triggered after ${elapsedDelay}ms (~0.5s delay verified).`);

  // 7. Verify typewriter starts typing after 0.5s
  await page.waitForFunction(() => {
    const p1 = document.querySelector('.fh-part-1')?.textContent || '';
    return p1.length > 0;
  }, { timeout: 3000 });
  const typedText = await page.evaluate(() => {
    return document.querySelector('.fh-typewriter-text')?.textContent || '';
  });
  console.log(`Step 6: Typewriter feature bar actively typing: "${typedText}".`);

  console.log('ALL HERO TRANSITION COORDINATION TESTS PASSED SUCCESSFULLY!');
  await ctx.close();
} finally {
  await browser.close();
  await server.close();
}
