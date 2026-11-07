import { chromium } from 'playwright';
import { startServer } from './server.mjs';
import path from 'node:path';

const rootDir = new URL('../', import.meta.url);
const server = await startServer(rootDir);
const baseUrl = server.baseUrl;

console.log('Testing Single-Line Typewriter Feature Bar on', baseUrl);

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const artifactDir = "C:\\Users\\hp\\.gemini\\antigravity\\brain\\d6713df1-cee0-49b1-be0b-47ff58963fc1";

try {
  // Test 1: Desktop Viewport & Typewriter Sequence
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(baseUrl + '/');
  await page.waitForSelector('.fh-strengths');

  const bar = page.locator('.fh-strengths');

  const initialBox = await bar.boundingBox();
  console.log(`Initial Feature Bar Box: y=${initialBox.y}, h=${initialBox.height}, w=${initialBox.width}`);

  // Wait for feature 1 to be fully typed (Full-Stack Developer)
  await page.waitForFunction(() => {
    const p1 = document.querySelector('.fh-part-1')?.textContent?.trim() || '';
    const p2 = document.querySelector('.fh-part-2')?.textContent?.trim() || '';
    return p1.includes('Full-Stack') && p2.includes('Developer');
  }, { timeout: 8000 });

  const feature1Box = await bar.boundingBox();
  console.log(`Feature 1 Typed Box: y=${feature1Box.y}, h=${feature1Box.height}`);

  if (Math.abs(feature1Box.height - initialBox.height) > 1.0) {
    throw new Error(`Layout shift detected: initial height ${initialBox.height} != typed height ${feature1Box.height}`);
  }

  // Verify that part1 and part2 are on ONE single line (identical vertical top within 2px)
  const p1Box = await page.locator('.fh-part-1').boundingBox();
  const p2Box = await page.locator('.fh-part-2').boundingBox();
  console.log(`Line check: Part 1 y=${p1Box.y}, h=${p1Box.height} | Part 2 y=${p2Box.y}, h=${p2Box.height}`);
  if (Math.abs(p1Box.y - p2Box.y) > 3.0) {
    throw new Error(`Text is not on one line! Part 1 y=${p1Box.y}, Part 2 y=${p2Box.y}`);
  }

  // Screenshot Feature 1 (Full-Stack Developer)
  await page.screenshot({ path: path.join(artifactDir, 'feature-bar-fullstack-oneline.png'), clip: { x: 0, y: Math.max(0, feature1Box.y - 60), width: 1440, height: 180 } });
  console.log('Captured feature-bar-fullstack-oneline.png');

  // Wait for feature 2 (AI & ML Enthusiast)
  await page.waitForFunction(() => {
    const p1 = document.querySelector('.fh-part-1')?.textContent?.trim() || '';
    const p2 = document.querySelector('.fh-part-2')?.textContent?.trim() || '';
    return p1.includes('AI & ML') && p2.includes('Enthusiast');
  }, { timeout: 12000 });

  const feature2Box = await bar.boundingBox();
  await page.screenshot({ path: path.join(artifactDir, 'feature-bar-aiml-oneline.png'), clip: { x: 0, y: Math.max(0, feature2Box.y - 60), width: 1440, height: 180 } });
  console.log('Captured feature-bar-aiml-oneline.png');

  // Wait for feature 3 (Problem Solver)
  await page.waitForFunction(() => {
    const p1 = document.querySelector('.fh-part-1')?.textContent?.trim() || '';
    const p2 = document.querySelector('.fh-part-2')?.textContent?.trim() || '';
    return p1.includes('Problem') && p2.includes('Solver');
  }, { timeout: 12000 });

  const feature3Box = await bar.boundingBox();
  await page.screenshot({ path: path.join(artifactDir, 'feature-bar-problem-solver-oneline.png'), clip: { x: 0, y: Math.max(0, feature3Box.y - 60), width: 1440, height: 180 } });
  console.log('Captured feature-bar-problem-solver-oneline.png');

  // Test 2: Mobile Viewport (375x667)
  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 667 } });
  await mobilePage.goto(baseUrl + '/');
  await mobilePage.waitForSelector('.fh-strengths');

  await mobilePage.waitForFunction(() => {
    const p1 = document.querySelector('.fh-part-1')?.textContent?.trim() || '';
    const p2 = document.querySelector('.fh-part-2')?.textContent?.trim() || '';
    return p1.length > 0 && p2.length > 0;
  }, { timeout: 8000 });

  const mobileBarBox = await mobilePage.locator('.fh-strengths').boundingBox();
  const mobileCardBox = await mobilePage.locator('.fh-typewriter-card').boundingBox();

  console.log(`Mobile bar: w=${mobileBarBox.width}, card x=${mobileCardBox.x}, card right=${mobileCardBox.x + mobileCardBox.width}`);
  if (mobileCardBox.x < 0 || mobileCardBox.x + mobileCardBox.width > 375) {
    throw new Error(`Mobile overflow detected! card x=${mobileCardBox.x}, right=${mobileCardBox.x + mobileCardBox.width}`);
  }

  await mobilePage.screenshot({ path: path.join(artifactDir, 'feature-bar-mobile-oneline.png'), clip: { x: 0, y: Math.max(0, mobileBarBox.y - 40), width: 375, height: 140 } });
  console.log('Captured feature-bar-mobile-oneline.png');

  console.log('ALL SINGLE-LINE TYPEWRITER FEATURE BAR TESTS PASSED!');
} catch (err) {
  console.error('Error during test:', err);
  process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
