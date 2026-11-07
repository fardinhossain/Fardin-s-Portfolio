import { chromium } from 'playwright';
import { startServer } from './server.mjs';

const rootDir = new URL('../', import.meta.url);
const server = await startServer(rootDir);
const baseUrl = server.baseUrl;

console.log('Testing Welcome Intro (6s Cinematic Entrance) on', baseUrl);

const browser = await chromium.launch({
  headless: true,
  channel: 'chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']
});

try {
  // Test 1: Both welcome videos return HTTP 200 and Content-Type: video/mp4
  const expectedVideos = [
    'Welcome_Desktop_Dark_6s.mp4',
    'Welcome_Mobile_Dark_6s.mp4'
  ];
  for (const file of expectedVideos) {
    const res = await fetch(`${baseUrl}/assets/videos/welcome/${file}`, { method: 'HEAD' });
    if (res.status !== 200 || res.headers.get('content-type') !== 'video/mp4') {
      throw new Error(`Failed to fetch /assets/videos/welcome/${file}: status ${res.status}, type ${res.headers.get('content-type')}`);
    }
  }
  console.log('PASS: Both welcome videos exist and return HTTP 200 with video/mp4.');

  // Test 2: Fresh session desktop playback, scroll lock, session flag, and fade-out
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (err) => console.error('PAGE ERROR:', err));
    await page.goto(baseUrl + '/');

    // Overlay must be mounted
    const overlay = page.locator('.welcome-intro-overlay');
    await overlay.waitFor({ state: 'attached', timeout: 3000 });

    // Video must have desktop dark source
    const video = page.locator('.welcome-intro-video');
    await video.waitFor({ state: 'attached', timeout: 3000 });
    const src = await video.getAttribute('src');
    if (!src.includes('Welcome_Desktop_Dark_6s.mp4')) {
      throw new Error(`Expected desktop video, got: ${src}`);
    }

    // Scroll must be locked
    const overflowLocked = await page.evaluate(() => document.body.style.overflow);
    if (overflowLocked !== 'hidden') {
      throw new Error(`Expected body overflow hidden, got: ${overflowLocked}`);
    }

    // sessionStorage must have welcome-intro-seen
    const seen = await page.evaluate(() => sessionStorage.getItem('welcome-intro-seen'));
    if (seen !== 'true') {
      throw new Error(`Expected welcome-intro-seen in sessionStorage, got: ${seen}`);
    }

    // Trigger video ended to test 500ms fadeout and DOM removal
    await page.evaluate(() => {
      const v = document.querySelector('.welcome-intro-video');
      if (v) v.dispatchEvent(new Event('ended'));
    });

    // Verify .is-fading-out class
    await page.waitForFunction(() => {
      const el = document.querySelector('.welcome-intro-overlay');
      return el && el.classList.contains('is-fading-out');
    }, { timeout: 2000 });

    // Verify DOM unmounted after fade
    await page.waitForFunction(() => {
      return !document.querySelector('.welcome-intro-overlay');
    }, { timeout: 3000 });

    // Verify body scroll unlocked
    const overflowUnlocked = await page.evaluate(() => document.body.style.overflow);
    if (overflowUnlocked !== '') {
      throw new Error(`Expected body overflow restored, got: ${overflowUnlocked}`);
    }

    console.log('PASS: Fresh session plays desktop intro, locks scroll, sets session flag, fades out, and unmounts.');

    // Test 3: Same session internal navigation does NOT replay
    await page.locator('.nav-links-desktop button:has-text("ABOUT")').click();
    await page.waitForTimeout(500);
    const overlayCount = await page.locator('.welcome-intro-overlay').count();
    if (overlayCount !== 0) {
      throw new Error('Intro replayed on internal section navigation!');
    }
    console.log('PASS: Same session navigation does not replay intro.');

    // Test 4: Logo click replays intro on home page without reloading
    await page.locator('.brand-logo').click();
    await page.locator('.welcome-intro-overlay').waitFor({ state: 'attached', timeout: 2000 });
    console.log('PASS: Logo click replays intro without page reload.');

    // Dismiss with Escape key
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.welcome-intro-overlay'), { timeout: 2000 });
    console.log('PASS: Escape key immediately dismisses intro.');

    // Test 5: Hard/normal reload replays intro even when session flag is set
    await page.reload();
    await page.locator('.welcome-intro-overlay').waitFor({ state: 'attached', timeout: 3000 });
    console.log('PASS: Page reload replays intro.');

    // Test 6: Skip button click immediately dismisses intro
    const skipBtn = page.locator('.welcome-intro-skip-btn');
    if ((await skipBtn.textContent()).trim() !== 'Skip intro') {
      throw new Error(`Expected button text "Skip intro", got: "${await skipBtn.textContent()}"`);
    }
    await skipBtn.click();
    await page.waitForFunction(() => !document.querySelector('.welcome-intro-overlay'), { timeout: 2000 });
    console.log('PASS: "Skip intro" button immediately dismisses intro.');

    await ctx.close();
  }

  // Test 7: Mobile viewport selects mobile video
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(baseUrl + '/');

    const video = page.locator('.welcome-intro-video');
    await video.waitFor({ state: 'attached', timeout: 3000 });
    const src = await video.getAttribute('src');
    if (!src.includes('Welcome_Mobile_Dark_6s.mp4')) {
      throw new Error(`Expected mobile video on mobile viewport, got: ${src}`);
    }

    // Tapping the video element does nothing
    await video.click({ force: true });
    await page.waitForTimeout(300);
    const stillMounted = await page.locator('.welcome-intro-overlay').count();
    if (stillMounted !== 1) {
      throw new Error('Clicking video unexpectedly dismissed intro!');
    }

    // Dismiss via skip button
    await page.locator('.welcome-intro-skip-btn').click();
    await page.waitForFunction(() => !document.querySelector('.welcome-intro-overlay'), { timeout: 2000 });
    console.log('PASS: Mobile viewport selects mobile video, tapping video does not dismiss, skip button works.');

    await ctx.close();
  }

  // Test 8: prefers-reduced-motion bypasses intro entirely
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce'
    });
    const page = await ctx.newPage();
    await page.goto(baseUrl + '/');
    await page.waitForTimeout(500);

    const overlayCount = await page.locator('.welcome-intro-overlay').count();
    if (overlayCount !== 0) {
      throw new Error('Intro mounted when prefers-reduced-motion is reduce!');
    }

    // Logo click also respects reduced motion
    await page.locator('.brand-logo').click();
    await page.waitForTimeout(300);
    const overlayAfterLogo = await page.locator('.welcome-intro-overlay').count();
    if (overlayAfterLogo !== 0) {
      throw new Error('Logo click triggered intro during prefers-reduced-motion!');
    }
    console.log('PASS: prefers-reduced-motion skips intro on load and logo click.');

    await ctx.close();
  }

  // Test 9: Video failure (network abort/error) dismisses immediately
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();

    // Abort video network request
    await page.route('**/*.mp4', (route) => route.abort());
    await page.goto(baseUrl + '/');

    // Overlay must be dismissed and site revealed immediately
    await page.waitForFunction(() => !document.querySelector('.welcome-intro-overlay'), { timeout: 3000 });
    const heroVisible = await page.locator('.fh-hero').isVisible();
    if (!heroVisible) {
      throw new Error('Hero not visible after video abort!');
    }
    console.log('PASS: Video load failure immediately unmounts overlay and shows site.');

    await ctx.close();
  }

  console.log('ALL WELCOME INTRO TESTS PASSED SUCCESSFULLY!');
} finally {
  await browser.close();
  await server.close();
}
