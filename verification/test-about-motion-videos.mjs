import { chromium } from 'playwright';
import { startServer } from './server.mjs';

const rootDir = new URL('../', import.meta.url);
const server = await startServer(rootDir);
const baseUrl = server.baseUrl;

console.log('Testing About Section 4-Step First Visit & Revisit Bot Replay on', baseUrl);

const browser = await chromium.launch({ headless: true, channel: 'chrome' });

try {
  // Test 1: Verify all 32 video URLs (16 chapter videos + 16 bot transition videos v2) return 200 video/mp4
  const videoFiles = [
    // Desktop (01-08)
    'Desktop/01_Desktop_Who-I-Am_Light.mp4',
    'Desktop/02_Desktop_Who-I-Am_Dark.mp4',
    'Desktop/03_Desktop_What-I-Build_Light.mp4',
    'Desktop/04_Desktop_What-I-Build_Dark.mp4',
    'Desktop/05_Desktop_Why-Me_Light.mp4',
    'Desktop/06_Desktop_Why-Me_Dark.mp4',
    'Desktop/07_Desktop_How-I-Work_Light.mp4',
    'Desktop/08_Desktop_How-I-Work_Dark.mp4',
    // Mobile (09-16)
    'Mobile/09_Mobile_Who-I-Am_Light.mp4',
    'Mobile/10_Mobile_Who-I-Am_Dark.mp4',
    'Mobile/11_Mobile_What-I-Build_Light.mp4',
    'Mobile/12_Mobile_What-I-Build_Dark.mp4',
    'Mobile/13_Mobile_Why-Me_Light.mp4',
    'Mobile/14_Mobile_Why-Me_Dark.mp4',
    'Mobile/15_Mobile_How-I-Work_Light.mp4',
    'Mobile/16_Mobile_How-I-Work_Dark.mp4'
  ];

  for (const relPath of videoFiles) {
    const chapRes = await fetch(`${baseUrl}/assets/videos/about-me/${relPath}`, { method: 'HEAD' });
    if (chapRes.status !== 200 || chapRes.headers.get('content-type') !== 'video/mp4') {
      throw new Error(`Failed to fetch chapter video ${relPath}: status ${chapRes.status}, type ${chapRes.headers.get('content-type')}`);
    }

    const botRes = await fetch(`${baseUrl}/assets/videos/about-me/bot-transition/${relPath}`, { method: 'HEAD' });
    if (botRes.status !== 200 || botRes.headers.get('content-type') !== 'video/mp4') {
      throw new Error(`Failed to fetch bot transition video ${relPath}: status ${botRes.status}, type ${botRes.headers.get('content-type')}`);
    }

    const chapLen = parseInt(chapRes.headers.get('content-length') || '0', 10);
    const botLen = parseInt(botRes.headers.get('content-length') || '0', 10);
    if (chapLen === botLen || chapLen === 0 || botLen === 0) {
      throw new Error(`Overwritten or invalid file sizes for ${relPath}: chapLen=${chapLen}, botLen=${botLen}`);
    }
  }
  console.log('PASS: All 32 video URLs resolve with HTTP 200, Content-Type: video/mp4, and distinct non-zero file sizes.');

  const artifactDir = 'C:/Users/hp/.gemini/antigravity/brain/d6713df1-cee0-49b1-be0b-47ff58963fc1';

  const chaptersConfig = [
    {
      id: 'who-i-am',
      name: 'Who I Am',
      desktopDark: '02_Desktop_Who-I-Am_Dark.mp4',
      desktopLight: '01_Desktop_Who-I-Am_Light.mp4',
      mobileDark: '10_Mobile_Who-I-Am_Dark.mp4',
      mobileLight: '09_Mobile_Who-I-Am_Light.mp4'
    },
    {
      id: 'what-i-build',
      name: 'What I Build',
      desktopDark: '04_Desktop_What-I-Build_Dark.mp4',
      desktopLight: '03_Desktop_What-I-Build_Light.mp4',
      mobileDark: '12_Mobile_What-I-Build_Dark.mp4',
      mobileLight: '11_Mobile_What-I-Build_Light.mp4'
    },
    {
      id: 'why-me',
      name: 'Why Me',
      desktopDark: '06_Desktop_Why-Me_Dark.mp4',
      desktopLight: '05_Desktop_Why-Me_Light.mp4',
      mobileDark: '14_Mobile_Why-Me_Dark.mp4',
      mobileLight: '13_Mobile_Why-Me_Light.mp4'
    },
    {
      id: 'how-i-work',
      name: 'How I Work',
      desktopDark: '08_Desktop_How-I-Work_Dark.mp4',
      desktopLight: '07_Desktop_How-I-Work_Light.mp4',
      mobileDark: '16_Mobile_How-I-Work_Dark.mp4',
      mobileLight: '15_Mobile_How-I-Work_Light.mp4'
    }
  ];

  // Test 2: Desktop Dark — All 4 Chapters First Visit (Intro Bot -> Chapter -> Outro Bot -> Static) + Double Revisit + Mid-Play Pause/Resume
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.addInitScript(() => { sessionStorage.setItem('welcome-intro-seen', '1'); });
    await page.goto(baseUrl + '/');
    await page.waitForSelector('#about');

    for (const [idx, ch] of chaptersConfig.entries()) {
      await page.locator(`#${ch.id}`).scrollIntoViewIfNeeded();

      // Step 1 of First Visit: Intro Bot Video plays first
      await page.waitForFunction((cid) => {
        const card = document.querySelector(`#${cid} .ae-scene-card`);
        const botV = document.querySelector(`#${cid} .ae-layer-bot-video`);
        return card?.dataset.stage === 'intro-bot' && botV?.classList.contains('is-active');
      }, ch.id, { timeout: 4000 });

      const chapterVidLocator = page.locator(`#${ch.id} .ae-layer-chapter-video`);
      const botVidLocator = page.locator(`#${ch.id} .ae-layer-bot-video`);
      const chapterSrc = await chapterVidLocator.getAttribute('src');
      const botSrc = await botVidLocator.getAttribute('src');
      const poster = await botVidLocator.getAttribute('poster');

      if (!chapterSrc.includes(`/about-me/Desktop/${ch.desktopDark}`)) {
        throw new Error(`Expected desktop chapter video ${ch.desktopDark}, got: ${chapterSrc}`);
      }
      if (!botSrc.includes(`/about-me/bot-transition/Desktop/${ch.desktopDark}`)) {
        throw new Error(`Expected matching desktop bot video ${ch.desktopDark}, got: ${botSrc}`);
      }
      if (!poster) {
        throw new Error(`Expected valid poster on video, got: ${poster}`);
      }
      console.log(`PASS: Chapter ${idx + 1} (${ch.name}) starts with Intro Bot video (${botSrc}).`);

      if (idx === 0) {
        // Verify container aspect ratio (desktop 1672:942)
        const cardBox = await page.locator(`#${ch.id} .ae-scene-card`).boundingBox();
        const ratio = cardBox.width / cardBox.height;
        const expectedRatio = 1672 / 942;
        if (Math.abs(ratio - expectedRatio) > 0.05) {
          throw new Error(`Aspect ratio mismatch: got ${ratio}, expected ~${expectedRatio}`);
        }

        // Test mid-play scroll pause/resume during intro-bot
        await page.waitForTimeout(250);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForFunction((cid) => {
          const botV = document.querySelector(`#${cid} .ae-layer-bot-video`);
          const card = document.querySelector(`#${cid} .ae-scene-card`);
          return botV && botV.paused && card?.dataset.stage === 'intro-bot';
        }, ch.id, { timeout: 3000 });

        await page.locator(`#${ch.id}`).scrollIntoViewIfNeeded();
        await page.waitForFunction((cid) => {
          const botV = document.querySelector(`#${cid} .ae-layer-bot-video`);
          const card = document.querySelector(`#${cid} .ae-scene-card`);
          return botV && !botV.paused && card?.dataset.stage === 'intro-bot';
        }, ch.id, { timeout: 3000 });
        console.log('PASS: Mid-play scroll out & back pauses and resumes Intro Bot video without restarting sequence.');
      }

      // End Intro Bot Video -> Step 2: Chapter Video plays
      await page.evaluate((cid) => {
        const v = document.querySelector(`#${cid} .ae-layer-bot-video`);
        if (v) v.dispatchEvent(new Event('ended'));
      }, ch.id);

      await page.waitForFunction((cid) => {
        const card = document.querySelector(`#${cid} .ae-scene-card`);
        const chapV = document.querySelector(`#${cid} .ae-layer-chapter-video`);
        return card?.dataset.stage === 'chapter-video' && chapV?.classList.contains('is-active');
      }, ch.id, { timeout: 3000 });
      console.log(`PASS: Chapter ${idx + 1} (${ch.name}) advances from Intro Bot -> Chapter Video (${chapterSrc}).`);

      if (idx === 0) {
        await page.waitForTimeout(250);
        await page.locator(`#${ch.id} .ae-scene-card`).screenshot({ path: `${artifactDir}/about-motion-dark-desktop.png` });
      }

      // End Chapter Video -> Step 3: Outro Bot Video plays (same bot video file)
      await page.evaluate((cid) => {
        const v = document.querySelector(`#${cid} .ae-layer-chapter-video`);
        if (v) v.dispatchEvent(new Event('ended'));
      }, ch.id);

      await page.waitForFunction((cid) => {
        const card = document.querySelector(`#${cid} .ae-scene-card`);
        const botV = document.querySelector(`#${cid} .ae-layer-bot-video`);
        return card?.dataset.stage === 'outro-bot' && botV?.classList.contains('is-active');
      }, ch.id, { timeout: 3000 });

      const outroBotSrc = await botVidLocator.getAttribute('src');
      if (outroBotSrc !== botSrc) {
        throw new Error(`Outro bot video src (${outroBotSrc}) did not match intro bot video src (${botSrc})`);
      }
      console.log(`PASS: Chapter ${idx + 1} (${ch.name}) advances from Chapter Video -> Outro Bot Video (same file).`);

      if (idx === 0) {
        await page.waitForTimeout(150);
        await page.locator(`#${ch.id} .ae-scene-card`).screenshot({ path: `${artifactDir}/about-bot-drawing-transition.png` });
      }

      // End Outro Bot Video -> Step 4: Static Image fades in and stays
      await page.evaluate((cid) => {
        const v = document.querySelector(`#${cid} .ae-layer-bot-video`);
        if (v) v.dispatchEvent(new Event('ended'));
      }, ch.id);

      await page.waitForFunction((cid) => {
        const card = document.querySelector(`#${cid} .ae-scene-card`);
        const pic = document.querySelector(`#${cid} .ae-scene-picture`);
        return card?.dataset.stage === 'static-image' && card.classList.contains('is-static') && pic?.classList.contains('is-visible');
      }, ch.id, { timeout: 3000 });
      console.log(`PASS: Chapter ${idx + 1} (${ch.name}) settles onto Static Image after Outro Bot Video.`);

      if (idx === 0) {
        await page.waitForTimeout(400);
        await page.locator(`#${ch.id} .ae-scene-card`).screenshot({ path: `${artifactDir}/about-transition-finished.png` });

        // Test Revisit #1: Scroll away and scroll back -> plays Revisit Bot Video once, NOT Chapter Video
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(350);
        await page.locator(`#${ch.id}`).scrollIntoViewIfNeeded();

        await page.waitForFunction((cid) => {
          const card = document.querySelector(`#${cid} .ae-scene-card`);
          const botV = document.querySelector(`#${cid} .ae-layer-bot-video`);
          const chapV = document.querySelector(`#${cid} .ae-layer-chapter-video`);
          return (
            card?.dataset.stage === 'revisit-bot' &&
            card?.dataset.revisitCount === '1' &&
            botV?.classList.contains('is-active') &&
            !chapV?.classList.contains('is-active')
          );
        }, ch.id, { timeout: 3000 });
        console.log('PASS: Revisit #1 triggers 3s Bot Video only (Chapter Video does NOT replay).');

        // Test mid-revisit scroll pause & resume (does not restart revisit count)
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForFunction((cid) => {
          const botV = document.querySelector(`#${cid} .ae-layer-bot-video`);
          const card = document.querySelector(`#${cid} .ae-scene-card`);
          return botV && botV.paused && card?.dataset.stage === 'revisit-bot' && card?.dataset.revisitCount === '1';
        }, ch.id, { timeout: 3000 });

        await page.locator(`#${ch.id}`).scrollIntoViewIfNeeded();
        await page.waitForFunction((cid) => {
          const botV = document.querySelector(`#${cid} .ae-layer-bot-video`);
          const card = document.querySelector(`#${cid} .ae-scene-card`);
          return botV && !botV.paused && card?.dataset.stage === 'revisit-bot' && card?.dataset.revisitCount === '1';
        }, ch.id, { timeout: 3000 });
        console.log('PASS: Scrolling away mid-revisit pauses and resumes from paused position without restarting.');

        // Finish Revisit #1 -> Static Image stays
        await page.evaluate((cid) => {
          const v = document.querySelector(`#${cid} .ae-layer-bot-video`);
          if (v) v.dispatchEvent(new Event('ended'));
        }, ch.id);

        await page.waitForFunction((cid) => {
          const card = document.querySelector(`#${cid} .ae-scene-card`);
          return card?.dataset.stage === 'static-image' && card.classList.contains('is-static');
        }, ch.id, { timeout: 3000 });
        console.log('PASS: Revisit #1 finishes and returns to Static Image.');

        // Test Revisit #2 (consecutive return): Scroll away and scroll back again -> Bot Video plays on second return too
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(350);
        await page.locator(`#${ch.id}`).scrollIntoViewIfNeeded();

        await page.waitForFunction((cid) => {
          const card = document.querySelector(`#${cid} .ae-scene-card`);
          const botV = document.querySelector(`#${cid} .ae-layer-bot-video`);
          return (
            card?.dataset.stage === 'revisit-bot' &&
            card?.dataset.revisitCount === '2' &&
            botV?.classList.contains('is-active')
          );
        }, ch.id, { timeout: 3000 });
        console.log('PASS: Revisit #2 plays Bot Video again on second return.');

        // Finish Revisit #2 -> Static Image stays
        await page.evaluate((cid) => {
          const v = document.querySelector(`#${cid} .ae-layer-bot-video`);
          if (v) v.dispatchEvent(new Event('ended'));
        }, ch.id);

        await page.waitForFunction((cid) => {
          const card = document.querySelector(`#${cid} .ae-scene-card`);
          return card?.dataset.stage === 'static-image';
        }, ch.id, { timeout: 3000 });
      }
    }

    await page.close();
  }

  // Test 3: Theme Toggle Mid-Sequence & Theme Toggle Before Revisit
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.addInitScript(() => {
      localStorage.setItem('fardin_theme', 'dark');
      sessionStorage.setItem('welcome-intro-seen', '1');
    });
    await page.goto(baseUrl + '/');
    await page.waitForSelector('#about');

    await page.locator('#who-i-am').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const card = document.querySelector('#who-i-am .ae-scene-card');
      return card?.dataset.stage === 'intro-bot';
    }, { timeout: 3000 });

    // Toggle theme from Dark -> Light while Chapter 1 is in intro-bot
    await page.locator('.theme-toggle-btn').click();
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');

    // Verify Chapter 1 stays locked on Dark videos for the rest of its first-visit sequence
    const lockedBotSrc1 = await page.locator('#who-i-am .ae-layer-bot-video').getAttribute('src');
    const lockedChapSrc1 = await page.locator('#who-i-am .ae-layer-chapter-video').getAttribute('src');
    if (!lockedBotSrc1.includes('02_Desktop_Who-I-Am_Dark.mp4') || !lockedChapSrc1.includes('02_Desktop_Who-I-Am_Dark.mp4')) {
      throw new Error(`Expected locked dark videos mid-sequence, got bot=${lockedBotSrc1}, chap=${lockedChapSrc1}`);
    }

    // Advance intro-bot -> chapter-video -> outro-bot
    await page.evaluate(() => document.querySelector('#who-i-am .ae-layer-bot-video').dispatchEvent(new Event('ended')));
    await page.waitForFunction(() => document.querySelector('#who-i-am .ae-scene-card')?.dataset.stage === 'chapter-video');
    await page.evaluate(() => document.querySelector('#who-i-am .ae-layer-chapter-video').dispatchEvent(new Event('ended')));
    await page.waitForFunction(() => document.querySelector('#who-i-am .ae-scene-card')?.dataset.stage === 'outro-bot');

    const outroSrc = await page.locator('#who-i-am .ae-layer-bot-video').getAttribute('src');
    if (outroSrc !== lockedBotSrc1) {
      throw new Error(`Expected outro bot video (${outroSrc}) to match intro bot video (${lockedBotSrc1})`);
    }
    console.log('PASS: Mid-sequence theme toggle preserves locked theme across intro-bot, chapter-video, and outro-bot.');

    // Complete first-visit sequence
    await page.evaluate(() => document.querySelector('#who-i-am .ae-layer-bot-video').dispatchEvent(new Event('ended')));
    await page.waitForFunction(() => document.querySelector('#who-i-am .ae-scene-card')?.dataset.stage === 'static-image');

    await page.locator('#who-i-am .ae-scene-card').screenshot({ path: `${artifactDir}/about-motion-light-desktop.png` });

    // Scroll away and revisit Chapter 1: now that theme is Light, revisit-bot MUST use the Light bot video!
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(350);
    await page.locator('#who-i-am').scrollIntoViewIfNeeded();

    await page.waitForFunction(() => {
      const card = document.querySelector('#who-i-am .ae-scene-card');
      return card?.dataset.stage === 'revisit-bot';
    }, { timeout: 3000 });

    const revisitBotSrc = await page.locator('#who-i-am .ae-layer-bot-video').getAttribute('src');
    if (!revisitBotSrc.includes('01_Desktop_Who-I-Am_Light.mp4')) {
      throw new Error(`Expected revisit after theme toggle to use Light bot video, got: ${revisitBotSrc}`);
    }
    console.log(`PASS: Revisit after theme toggle uses the NEW theme's bot video (${revisitBotSrc}).`);

    await page.close();
  }

  // Test 4: Mobile Dark & Light — First Visit Sequence + Revisit on Story Switch / Scroll
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.addInitScript(() => { sessionStorage.setItem('welcome-intro-seen', '1'); });
    await page.goto(baseUrl + '/');
    await page.waitForSelector('#about');

    await page.locator('#who-i-am').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const card = document.querySelector('#who-i-am .ae-scene-card');
      return card?.dataset.stage === 'intro-bot';
    }, { timeout: 4000 });

    const mobileChapterVid = page.locator('#who-i-am .ae-layer-chapter-video');
    const mobileBotVid = page.locator('#who-i-am .ae-layer-bot-video');
    const mobileSrc = await mobileChapterVid.getAttribute('src');
    const mobileBotSrc = await mobileBotVid.getAttribute('src');

    if (!mobileSrc.includes('/about-me/Mobile/10_Mobile_Who-I-Am_Dark.mp4')) {
      throw new Error(`Expected mobile dark chapter video, got: ${mobileSrc}`);
    }
    if (!mobileBotSrc.includes('/about-me/bot-transition/Mobile/10_Mobile_Who-I-Am_Dark.mp4')) {
      throw new Error(`Expected matching mobile dark bot video, got: ${mobileBotSrc}`);
    }

    // Complete Chapter 1 sequence on Mobile: intro-bot -> chapter-video -> outro-bot -> static-image
    await page.evaluate(() => document.querySelector('#who-i-am .ae-layer-bot-video').dispatchEvent(new Event('ended')));
    await page.waitForFunction(() => document.querySelector('#who-i-am .ae-scene-card')?.dataset.stage === 'chapter-video');
    await page.waitForTimeout(200);
    await page.locator('#who-i-am .ae-scene-card').screenshot({ path: `${artifactDir}/about-motion-dark-mobile.png` });

    await page.evaluate(() => document.querySelector('#who-i-am .ae-layer-chapter-video').dispatchEvent(new Event('ended')));
    await page.waitForFunction(() => document.querySelector('#who-i-am .ae-scene-card')?.dataset.stage === 'outro-bot');
    await page.evaluate(() => document.querySelector('#who-i-am .ae-layer-bot-video').dispatchEvent(new Event('ended')));
    await page.waitForFunction(() => document.querySelector('#who-i-am .ae-scene-card')?.dataset.stage === 'static-image');
    console.log('PASS: Mobile Dark Chapter 1 completes full 4-step sequence.');

    // Switch to Story 2 (What I Build) and back to Story 1 -> verify Story 1 plays revisit-bot
    await page.locator('.ae-story-bar-track').nth(1).click();
    await page.waitForTimeout(400);
    await page.locator('.ae-story-bar-track').nth(0).click();

    await page.waitForFunction(() => {
      const card = document.querySelector('#who-i-am .ae-scene-card');
      return card?.dataset.stage === 'revisit-bot' && card?.dataset.revisitCount === '1';
    }, { timeout: 3000 });
    console.log('PASS: Mobile returning to finished Chapter 1 replays Revisit Bot Video.');

    await page.close();

    // Mobile Light Mode check
    const lightMobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await lightMobilePage.addInitScript(() => {
      localStorage.setItem('fardin_theme', 'light');
      sessionStorage.setItem('welcome-intro-seen', '1');
    });
    await lightMobilePage.goto(baseUrl + '/');
    await lightMobilePage.locator('#who-i-am').scrollIntoViewIfNeeded();
    await lightMobilePage.waitForFunction(() => document.querySelector('#who-i-am .ae-scene-card')?.dataset.stage === 'intro-bot');

    const lightMobileVid = lightMobilePage.locator('#who-i-am .ae-layer-chapter-video');
    const lightMobileBot = lightMobilePage.locator('#who-i-am .ae-layer-bot-video');
    const lightSrc = await lightMobileVid.getAttribute('src');
    const lightBot = await lightMobileBot.getAttribute('src');

    if (!lightSrc.includes('/about-me/Mobile/09_Mobile_Who-I-Am_Light.mp4') || !lightBot.includes('/about-me/bot-transition/Mobile/09_Mobile_Who-I-Am_Light.mp4')) {
      throw new Error(`Expected mobile light videos, got chap=${lightSrc}, bot=${lightBot}`);
    }
    console.log(`PASS: Mobile light mode loads matching portrait chapter & bot videos (${lightSrc}, ${lightBot}).`);
    await lightMobilePage.locator('#who-i-am .ae-scene-card').screenshot({ path: `${artifactDir}/about-motion-light-mobile.png` });
    await lightMobilePage.close();
  }

  // Test 5: Error Fallback (Intro Bot failure -> Chapter Video; Outro Bot failure -> Static Image)
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.addInitScript(() => { sessionStorage.setItem('welcome-intro-seen', '1'); });
    await page.goto(baseUrl + '/');
    await page.waitForSelector('#about');

    await page.locator('#who-i-am').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('#who-i-am .ae-scene-card')?.dataset.stage === 'intro-bot');

    // Simulate error on intro-bot -> must advance to chapter-video
    await page.evaluate(() => document.querySelector('#who-i-am .ae-layer-bot-video').dispatchEvent(new Event('error')));
    await page.waitForFunction(() => document.querySelector('#who-i-am .ae-scene-card')?.dataset.stage === 'chapter-video');

    // Simulate error on chapter-video -> must advance to outro-bot (which auto-skips to static-image since bot video had an error)
    await page.evaluate(() => document.querySelector('#who-i-am .ae-layer-chapter-video').dispatchEvent(new Event('error')));
    await page.waitForFunction(() => document.querySelector('#who-i-am .ae-scene-card')?.dataset.stage === 'static-image');
    console.log('PASS: Video error fallback skips failed layers and guarantees static image visibility.');
    await page.close();
  }

  // Test 6: prefers-reduced-motion accessibility (first visit and revisit)
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => { sessionStorage.setItem('welcome-intro-seen', '1'); });
    await page.goto(baseUrl + '/');
    await page.waitForSelector('#about');
    await page.locator('#who-i-am').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Scroll away and back to ensure revisit also stays static
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(250);
    await page.locator('#who-i-am').scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);

    const reducedResult = await page.evaluate(() => {
      const vids = document.querySelectorAll('#who-i-am video');
      const card = document.querySelector('#who-i-am .ae-scene-card');
      const img = document.querySelector('#who-i-am .ae-scene-img');
      return {
        videoCount: vids.length,
        stage: card?.dataset.stage,
        isStatic: card.classList.contains('is-static'),
        imgVisible: !!img && window.getComputedStyle(img).opacity !== '0'
      };
    });
    if (reducedResult.videoCount !== 0 || !reducedResult.isStatic || !reducedResult.imgVisible || reducedResult.stage !== 'static-image') {
      throw new Error(`prefers-reduced-motion should show static image immediately on first visit and revisit: ${JSON.stringify(reducedResult)}`);
    }
    console.log('PASS: prefers-reduced-motion shows static artwork immediately on first visit and revisit without playing videos.');
    await page.close();
  }

  console.log('ALL ABOUT SECTION 4-STEP & REVISIT BOT REPLAY TESTS PASSED SUCCESSFULLY!');
} finally {
  await browser.close();
  await server.close();
}
