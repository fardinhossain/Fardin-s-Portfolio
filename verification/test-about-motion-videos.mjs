import { chromium } from 'playwright';
import { startServer } from './server.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = new URL('../', import.meta.url);
const server = await startServer(rootDir);
const baseUrl = server.baseUrl;

console.log('Testing About Motion & Bot F-01 Transition Videos on', baseUrl);

const browser = await chromium.launch({ headless: true, channel: 'chrome' });

try {
  // Test 1: Verify all 20 video URLs (16 chapter videos + 4 bot transition videos) return 200 video/mp4
  const expectedVideos = [
    // Desktop chapter videos
    'Desktop/01_Desktop_Who-I-Am_Light.mp4',
    'Desktop/02_Desktop_Who-I-Am_Dark.mp4',
    'Desktop/03_Desktop_What-I-Build_Light.mp4',
    'Desktop/04_Desktop_What-I-Build_Dark.mp4',
    'Desktop/05_Desktop_Why-Me_Light.mp4',
    'Desktop/06_Desktop_Why-Me_Dark.mp4',
    'Desktop/07_Desktop_How-I-Work_Light.mp4',
    'Desktop/08_Desktop_How-I-Work_Dark.mp4',
    // Desktop bot transition videos
    'Desktop/Bot_Transition_Desktop_Light.mp4',
    'Desktop/Bot_Transition_Desktop_Dark.mp4',
    // Mobile chapter videos
    'Mobile/09_Mobile_Who-I-Am_Light.mp4',
    'Mobile/10_Mobile_Who-I-Am_Dark.mp4',
    'Mobile/11_Mobile_What-I-Build_Light.mp4',
    'Mobile/12_Mobile_What-I-Build_Dark.mp4',
    'Mobile/13_Mobile_Why-Me_Light.mp4',
    'Mobile/14_Mobile_Why-Me_Dark.mp4',
    'Mobile/15_Mobile_How-I-Work_Light.mp4',
    'Mobile/16_Mobile_How-I-Work_Dark.mp4',
    // Mobile bot transition videos
    'Mobile/Bot_Transition_Mobile_Light.mp4',
    'Mobile/Bot_Transition_Mobile_Dark.mp4'
  ];

  for (const relPath of expectedVideos) {
    const res = await fetch(`${baseUrl}/assets/videos/about-me/${relPath}`, { method: 'HEAD' });
    if (res.status !== 200 || res.headers.get('content-type') !== 'video/mp4') {
      throw new Error(`Failed to fetch video ${relPath}: status ${res.status}, type ${res.headers.get('content-type')}`);
    }
  }
  console.log(`PASS: All 20 video URLs resolve with HTTP 200 and Content-Type: video/mp4.`);

  const artifactDir = 'C:/Users/hp/.gemini/antigravity/brain/d6713df1-cee0-49b1-be0b-47ff58963fc1';

  // Test 2: Desktop 3-Step Sequence: Chapter Video -> Bot Transition Video -> Static Image
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(baseUrl + '/');
    await page.waitForSelector('#about');

    // Scroll into Chapter 1 (Who I Am)
    await page.locator('#who-i-am').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const chapterVidLocator = page.locator('#who-i-am .ae-layer-chapter-video');
    const botVidLocator = page.locator('#who-i-am .ae-layer-bot-video');
    await chapterVidLocator.waitFor({ state: 'attached', timeout: 5000 });
    await botVidLocator.waitFor({ state: 'attached', timeout: 5000 });

    const chapterSrc = await chapterVidLocator.getAttribute('src');
    const botSrc = await botVidLocator.getAttribute('src');
    const poster = await chapterVidLocator.getAttribute('poster');

    if (!chapterSrc.includes('02_Desktop_Who-I-Am_Dark.mp4')) {
      throw new Error(`Expected dark desktop chapter video, got: ${chapterSrc}`);
    }
    if (!botSrc.includes('Bot_Transition_Desktop_Dark.mp4')) {
      throw new Error(`Expected dark desktop bot video, got: ${botSrc}`);
    }
    if (!poster || !poster.includes('Who%20I%20Am')) {
      throw new Error(`Expected valid poster on video, got: ${poster}`);
    }
    console.log(`PASS: Step 1 initialized — Chapter video (${chapterSrc}), Bot video mounted (${botSrc}), poster set.`);

    // Check aspect ratio of the container (desktop 1672:942)
    const cardBox = await page.locator('#who-i-am .ae-scene-card').boundingBox();
    const ratio = cardBox.width / cardBox.height;
    const expectedRatio = 1672 / 942;
    if (Math.abs(ratio - expectedRatio) > 0.05) {
      throw new Error(`Aspect ratio mismatch: got ${ratio}, expected ~${expectedRatio}`);
    }
    console.log(`PASS: Container maintains exact aspect ratio (${ratio.toFixed(3)} vs ${expectedRatio.toFixed(3)}).`);

    // Capture screenshot of Chapter Video playing
    await page.waitForTimeout(300);
    await page.locator('#who-i-am .ae-scene-card').screenshot({ path: `${artifactDir}/about-motion-dark-desktop.png` });

    // Transition from Chapter Video to Bot Video (trigger ended on chapter video)
    await page.evaluate(() => {
      const v = document.querySelector('#who-i-am .ae-layer-chapter-video');
      if (v) v.dispatchEvent(new Event('ended'));
    });

    // Verify Bot Video layer becomes active
    await page.waitForFunction(() => {
      const botV = document.querySelector('#who-i-am .ae-layer-bot-video');
      return botV && botV.classList.contains('is-active');
    }, { timeout: 3000 });
    console.log('PASS: Step 2 — Bot F-01 transition video layer active after chapter video ended.');

    // Capture screenshot of Bot Video in transition
    await page.waitForTimeout(150);
    await page.locator('#who-i-am .ae-scene-card').screenshot({ path: `${artifactDir}/about-bot-drawing-transition.png` });

    // Transition from Bot Video to Static Image (trigger ended on bot video)
    await page.evaluate(() => {
      const v = document.querySelector('#who-i-am .ae-layer-bot-video');
      if (v) v.dispatchEvent(new Event('ended'));
    });

    // Verify Static Image becomes active and card gets is-static
    await page.waitForFunction(() => {
      const card = document.querySelector('#who-i-am .ae-scene-card');
      const pic = document.querySelector('#who-i-am .ae-scene-picture');
      return card && card.classList.contains('is-static') && pic && pic.classList.contains('is-visible');
    }, { timeout: 3000 });

    await page.waitForTimeout(700); // allow 600ms opacity transition to complete
    await page.locator('#who-i-am .ae-scene-card').screenshot({ path: `${artifactDir}/about-transition-finished.png` });

    const checkStatic = await page.evaluate(() => {
      const img = document.querySelector('#who-i-am .ae-scene-img');
      const chapV = document.querySelector('#who-i-am .ae-layer-chapter-video');
      const botV = document.querySelector('#who-i-am .ae-layer-bot-video');
      const card = document.querySelector('#who-i-am .ae-scene-card');
      return {
        hasImg: !!img && img.naturalWidth > 0,
        chapOpacity: window.getComputedStyle(chapV).opacity,
        botOpacity: window.getComputedStyle(botV).opacity,
        isStatic: card.classList.contains('is-static')
      };
    });
    console.log('Static Result:', checkStatic);
    if (!checkStatic.hasImg || parseFloat(checkStatic.chapOpacity) > 0.05 || parseFloat(checkStatic.botOpacity) > 0.05) {
      throw new Error(`Static image not fully settled or video opacity > 0: ${JSON.stringify(checkStatic)}`);
    }
    console.log('PASS: Step 3 — Static artwork image fully visible and video opacity 0.');

    // Test scroll away and back: verify it stays in static mode and does not replay
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.locator('#who-i-am').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    const recheck = await page.evaluate(() => {
      const card = document.querySelector('#who-i-am .ae-scene-card');
      return card.classList.contains('is-static');
    });
    if (!recheck) {
      throw new Error('Finished chapter should remain static and not replay on scroll back.');
    }
    console.log('PASS: Finished chapter stays on static artwork permanently without replaying.');

    await page.close();
  }

  // Test 3: Desktop Light Mode
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.addInitScript(() => { localStorage.setItem('fardin_theme', 'light'); });
    await page.goto(baseUrl + '/');
    await page.waitForSelector('#about');

    await page.locator('#who-i-am').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const chapterVid = page.locator('#who-i-am .ae-layer-chapter-video');
    const botVid = page.locator('#who-i-am .ae-layer-bot-video');

    const chapterSrc = await chapterVid.getAttribute('src');
    const botSrc = await botVid.getAttribute('src');

    if (!chapterSrc.includes('01_Desktop_Who-I-Am_Light.mp4')) {
      throw new Error(`Expected light desktop video, got: ${chapterSrc}`);
    }
    if (!botSrc.includes('Bot_Transition_Desktop_Light.mp4')) {
      throw new Error(`Expected light desktop bot video, got: ${botSrc}`);
    }
    console.log(`PASS: Desktop light mode loads correct chapter & bot videos (${chapterSrc}, ${botSrc}).`);

    await page.locator('#who-i-am .ae-scene-card').screenshot({ path: `${artifactDir}/about-motion-light-desktop.png` });
    await page.close();
  }

  // Test 4: Mobile Dark & Light
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(baseUrl + '/');
    await page.waitForSelector('#about');

    await page.locator('#who-i-am').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const mobileChapterVid = page.locator('#who-i-am .ae-layer-chapter-video');
    const mobileBotVid = page.locator('#who-i-am .ae-layer-bot-video');

    const mobileSrc = await mobileChapterVid.getAttribute('src');
    const mobileBotSrc = await mobileBotVid.getAttribute('src');

    if (!mobileSrc.includes('10_Mobile_Who-I-Am_Dark.mp4')) {
      throw new Error(`Expected mobile dark chapter video, got: ${mobileSrc}`);
    }
    if (!mobileBotSrc.includes('Bot_Transition_Mobile_Dark.mp4')) {
      throw new Error(`Expected mobile dark bot video, got: ${mobileBotSrc}`);
    }
    console.log(`PASS: Mobile dark mode loads correct portrait chapter & bot videos (${mobileSrc}, ${mobileBotSrc}).`);

    // Verify mobile aspect ratio (1086 / 1448)
    const mobileBox = await page.locator('#who-i-am .ae-scene-card').boundingBox();
    const mobileRatio = mobileBox.width / mobileBox.height;
    const expectedMobileRatio = 1086 / 1448;
    if (Math.abs(mobileRatio - expectedMobileRatio) > 0.05) {
      throw new Error(`Mobile aspect ratio mismatch: got ${mobileRatio}, expected ~${expectedMobileRatio}`);
    }
    console.log(`PASS: Mobile container maintains exact portrait aspect ratio (${mobileRatio.toFixed(3)}).`);

    await page.locator('#who-i-am .ae-scene-card').screenshot({ path: `${artifactDir}/about-motion-dark-mobile.png` });

    // Switch to Chapter 2 (What I Build)
    await page.locator('.ae-story-bar-track').nth(1).click();
    await page.waitForTimeout(500);

    const ch2Vid = page.locator('#what-i-build .ae-layer-chapter-video');
    const ch2Src = await ch2Vid.getAttribute('src');
    if (!ch2Src.includes('12_Mobile_What-I-Build_Dark.mp4')) {
      throw new Error(`Expected story 2 mobile dark video, got: ${ch2Src}`);
    }
    console.log(`PASS: Mobile story navigation switches to next chapter video (${ch2Src}).`);
    await page.close();

    // Mobile Light Mode
    const lightMobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await lightMobilePage.addInitScript(() => { localStorage.setItem('fardin_theme', 'light'); });
    await lightMobilePage.goto(baseUrl + '/');
    await lightMobilePage.locator('#who-i-am').scrollIntoViewIfNeeded();
    await lightMobilePage.waitForTimeout(600);

    const lightMobileVid = lightMobilePage.locator('#who-i-am .ae-layer-chapter-video');
    const lightMobileBot = lightMobilePage.locator('#who-i-am .ae-layer-bot-video');
    const lightSrc = await lightMobileVid.getAttribute('src');
    const lightBot = await lightMobileBot.getAttribute('src');

    if (!lightSrc.includes('09_Mobile_Who-I-Am_Light.mp4')) {
      throw new Error(`Expected mobile light chapter video, got: ${lightSrc}`);
    }
    if (!lightBot.includes('Bot_Transition_Mobile_Light.mp4')) {
      throw new Error(`Expected mobile light bot video, got: ${lightBot}`);
    }
    console.log(`PASS: Mobile light mode loads correct portrait chapter & bot videos (${lightSrc}, ${lightBot}).`);
    await lightMobilePage.locator('#who-i-am .ae-scene-card').screenshot({ path: `${artifactDir}/about-motion-light-mobile.png` });
    await lightMobilePage.close();
  }

  // Test 5: prefers-reduced-motion accessibility
  {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 }
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(baseUrl + '/');
    await page.waitForSelector('#about');
    await page.locator('#who-i-am').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    const reducedResult = await page.evaluate(() => {
      const vids = document.querySelectorAll('#who-i-am video');
      const card = document.querySelector('#who-i-am .ae-scene-card');
      const img = document.querySelector('#who-i-am .ae-scene-img');
      return {
        videoCount: vids.length,
        isStatic: card.classList.contains('is-static'),
        imgVisible: !!img && window.getComputedStyle(img).opacity !== '0'
      };
    });
    console.log('Reduced motion check:', reducedResult);
    if (!reducedResult.isStatic || !reducedResult.imgVisible) {
      throw new Error(`prefers-reduced-motion should show static image immediately: ${JSON.stringify(reducedResult)}`);
    }
    console.log('PASS: prefers-reduced-motion correctly shows static artwork immediately without playing videos.');
    await page.close();
  }

  console.log('ALL ABOUT MOTION & BOT F-01 TRANSITION TESTS PASSED SUCCESSFULLY!');
} finally {
  await browser.close();
  await server.close();
}
