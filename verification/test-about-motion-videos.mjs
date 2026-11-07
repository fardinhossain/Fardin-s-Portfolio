import { chromium } from 'playwright';
import { startServer } from './server.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = new URL('../', import.meta.url);
const server = await startServer(rootDir);
const baseUrl = server.baseUrl;

console.log('Testing About Motion Videos on', baseUrl);

const browser = await chromium.launch({ headless: true, channel: 'chrome' });

try {
  // Test 1: Verify all 16 video URLs return 200 video/mp4
  const expectedVideos = [
    '01_Desktop_Who-I-Am_Light.mp4',
    '02_Desktop_Who-I-Am_Dark.mp4',
    '03_Desktop_What-I-Build_Light.mp4',
    '04_Desktop_What-I-Build_Dark.mp4',
    '05_Desktop_Why-Me_Light.mp4',
    '06_Desktop_Why-Me_Dark.mp4',
    '07_Desktop_How-I-Work_Light.mp4',
    '08_Desktop_How-I-Work_Dark.mp4',
    '09_Mobile_Who-I-Am_Light.mp4',
    '10_Mobile_Who-I-Am_Dark.mp4',
    '11_Mobile_What-I-Build_Light.mp4',
    '12_Mobile_What-I-Build_Dark.mp4',
    '13_Mobile_Why-Me_Light.mp4',
    '14_Mobile_Why-Me_Dark.mp4',
    '15_Mobile_How-I-Work_Light.mp4',
    '16_Mobile_How-I-Work_Dark.mp4'
  ];

  for (const name of expectedVideos) {
    const res = await fetch(`${baseUrl}/assets/images/about%20me/About_Motion_Videos_Premium_16/${encodeURIComponent(name)}`, { method: 'HEAD' });
    if (res.status !== 200 || res.headers.get('content-type') !== 'video/mp4') {
      throw new Error(`Failed to fetch video ${name}: status ${res.status}, type ${res.headers.get('content-type')}`);
    }
  }
  console.log(`PASS: All 16 video URLs resolve with HTTP 200 and Content-Type: video/mp4.`);

  // Test 2: Desktop Playback & Transition
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(baseUrl + '/');
    await page.waitForSelector('#about');

    // Scroll into Chapter 1 (Who I Am) card
    await page.locator('#who-i-am').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const debug = await page.evaluate(() => {
      const v = document.querySelector('#who-i-am .ae-scene-video');
      const card = document.querySelector('#who-i-am .ae-scene-card');
      const rect = card?.getBoundingClientRect();
      return {
        hasVideo: !!v,
        classes: v?.className,
        paused: v?.paused,
        currentTime: v?.currentTime,
        cardTop: rect?.top,
        cardBottom: rect?.bottom,
        vh: window.innerHeight
      };
    });
    console.log('Desktop Chapter 1 Debug:', debug);

    // Verify video element is present
    const videoLocator = page.locator('#who-i-am .ae-scene-video');
    await videoLocator.waitFor({ state: 'attached', timeout: 5000 });

    const videoSrc = await videoLocator.getAttribute('src');
    if (!videoSrc.includes('02_Desktop_Who-I-Am_Dark.mp4')) {
      throw new Error(`Expected dark desktop video, got: ${videoSrc}`);
    }
    console.log(`PASS: Desktop dark mode loads correct video (${videoSrc}).`);

    // Verify video plays and sets is-playing
    await page.waitForFunction(() => {
      const v = document.querySelector('#who-i-am .ae-scene-video');
      return v && (v.classList.contains('is-playing') || !v.paused);
    }, { timeout: 6000 });

    console.log('PASS: Desktop video playback begins when section enters view.');

    const artifactDir = 'C:/Users/hp/.gemini/antigravity/brain/d6713df1-cee0-49b1-be0b-47ff58963fc1';
    await page.locator('#who-i-am .ae-scene-card').screenshot({ path: `${artifactDir}/about-motion-dark-desktop.png` });

    // Simulate video end event to test smooth transition to static image
    await page.evaluate(() => {
      const v = document.querySelector('#who-i-am .ae-scene-video');
      if (v) {
        v.dispatchEvent(new Event('ended'));
      }
    });

    await page.waitForFunction(() => {
      const v = document.querySelector('#who-i-am .ae-scene-video');
      return v && v.classList.contains('is-finished');
    }, { timeout: 3000 });

    // Wait for the 0.65s cross-fade transition to complete
    await page.waitForTimeout(750);
    await page.locator('#who-i-am .ae-scene-card').screenshot({ path: `${artifactDir}/about-transition-finished.png` });

    const checkResult = await page.evaluate(() => {
      const img = document.querySelector('#who-i-am .ae-scene-img');
      const video = document.querySelector('#who-i-am .ae-scene-video');
      const vStyle = window.getComputedStyle(video);
      return {
        hasImg: !!img,
        naturalWidth: img?.naturalWidth,
        videoOpacity: vStyle.opacity,
        videoClasses: video?.className
      };
    });
    console.log('Transition Result:', checkResult);

    if (!checkResult.hasImg || checkResult.naturalWidth === 0 || parseFloat(checkResult.videoOpacity) > 0.05) {
      throw new Error(`Static image should be fully visible and video opacity should be 0 on finished. Got: ${JSON.stringify(checkResult)}`);
    }
    console.log('PASS: Smooth cross-fade to static artwork image upon video completion verified.');

    await page.close();
  }

  // Test 3: Desktop Light Mode Playback
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.addInitScript(() => { localStorage.setItem('fardin_theme', 'light'); });
    await page.goto(baseUrl + '/');
    await page.waitForSelector('#about');

    await page.locator('#who-i-am').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const videoLocator = page.locator('#who-i-am .ae-scene-video');
    await videoLocator.waitFor({ state: 'attached', timeout: 5000 });

    const videoSrc = await videoLocator.getAttribute('src');
    if (!videoSrc.includes('01_Desktop_Who-I-Am_Light.mp4')) {
      throw new Error(`Expected light desktop video, got: ${videoSrc}`);
    }
    console.log(`PASS: Desktop light mode loads correct video (${videoSrc}).`);

    // Capture desktop screenshots
    const artifactDir = 'C:/Users/hp/.gemini/antigravity/brain/d6713df1-cee0-49b1-be0b-47ff58963fc1';
    await page.locator('#who-i-am .ae-scene-card').screenshot({ path: `${artifactDir}/about-motion-light-desktop.png` });

    await page.close();
  }

  // Test 4: Mobile Story Playback & Switching
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(baseUrl + '/');
    await page.waitForSelector('#about');

    await page.locator('#who-i-am').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const mobileVideoLocator = page.locator('#who-i-am .ae-scene-video');
    await mobileVideoLocator.waitFor({ state: 'attached', timeout: 5000 });

    const mobileSrc = await mobileVideoLocator.getAttribute('src');
    if (!mobileSrc.includes('10_Mobile_Who-I-Am_Dark.mp4')) {
      throw new Error(`Expected mobile dark video, got: ${mobileSrc}`);
    }
    console.log(`PASS: Mobile dark mode loads correct portrait video (${mobileSrc}).`);

    const artifactDir = 'C:/Users/hp/.gemini/antigravity/brain/d6713df1-cee0-49b1-be0b-47ff58963fc1';
    await page.locator('#who-i-am .ae-scene-card').screenshot({ path: `${artifactDir}/about-motion-dark-mobile.png` });

    // Click next story bar (Story 2: What I Build)
    await page.locator('.ae-story-bar-track').nth(1).click();
    await page.waitForTimeout(400);

    const story2VideoLocator = page.locator('#what-i-build .ae-scene-video');
    await story2VideoLocator.waitFor({ state: 'attached', timeout: 5000 });

    const story2Src = await story2VideoLocator.getAttribute('src');
    if (!story2Src.includes('12_Mobile_What-I-Build_Dark.mp4')) {
      throw new Error(`Expected story 2 mobile dark video, got: ${story2Src}`);
    }
    console.log(`PASS: Mobile story navigation properly switches to next chapter video (${story2Src}).`);

    // Test Mobile Light
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: 'light' } }));
    });
    await page.close();

    const lightMobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await lightMobilePage.addInitScript(() => { localStorage.setItem('fardin_theme', 'light'); });
    await lightMobilePage.goto(baseUrl + '/');
    await lightMobilePage.locator('#who-i-am').scrollIntoViewIfNeeded();
    await lightMobilePage.waitForTimeout(500);

    const lightMobileVideo = lightMobilePage.locator('#who-i-am .ae-scene-video');
    const lightMobileSrc = await lightMobileVideo.getAttribute('src');
    if (!lightMobileSrc.includes('09_Mobile_Who-I-Am_Light.mp4')) {
      throw new Error(`Expected mobile light video, got: ${lightMobileSrc}`);
    }
    console.log(`PASS: Mobile light mode loads correct portrait video (${lightMobileSrc}).`);
    await lightMobilePage.locator('#who-i-am .ae-scene-card').screenshot({ path: `${artifactDir}/about-motion-light-mobile.png` });
    await lightMobilePage.close();
  }

  console.log('ALL MOTION VIDEO INTEGRATION TESTS PASSED!');
} finally {
  await browser.close();
  await server.close();
}
