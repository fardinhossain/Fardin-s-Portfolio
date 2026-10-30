import { chromium } from 'playwright';
import { startServer } from './server.mjs';

const server = await startServer(new URL('../', import.meta.url));
const baseUrl = server.baseUrl;

console.log('Testing mobile journey features on:', baseUrl);

const browser = await chromium.launch({
  headless: true,
  channel: 'chrome',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader']
});

// Mobile viewport test (e.g. iPhone 14/15: 390x844)
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.addInitScript(() => {
  localStorage.setItem('fardin_intro_seen', 'true');
  localStorage.setItem('fardin_theme', 'dark');
});

await page.goto(baseUrl + '/experience/flyrank-ai');
await page.waitForTimeout(1000);

let passed = true;

// 1. Test Verify button in topbar on mobile
console.log('\n--- 1. Testing Verify button on mobile ---');
const verifyBtn = page.locator('.story-topbar-verify');
const verifyText = await verifyBtn.innerText();
console.log('Verify button visible text:', verifyText.trim());
const verifyBox = await verifyBtn.boundingBox();
console.log('Verify button dimensions:', verifyBox);
if (verifyBox.height > 35) {
  console.error('FAIL: Verify button is too tall:', verifyBox.height);
  passed = false;
} else {
  console.log('PASS: Verify button is short and thin (height <= 35px):', verifyBox.height);
}
await page.screenshot({ path: 'verification/artifacts/mobile-verify-btn.png', clip: { x: 0, y: 0, width: 390, height: 80 } });

// 2. Test Chapter 03 Month slide left-to-right
console.log('\n--- 2. Testing Chapter 03 4-Month slide left-to-right ---');
const monthNextBtn = page.locator('.month-nav-btn.next');
await monthNextBtn.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const initialMonthTitle = await page.locator('.month-title-h3').textContent();
console.log('Initial Month Title:', initialMonthTitle);

await monthNextBtn.click();
await page.waitForTimeout(300);
const secondMonthTitle = await page.locator('.month-title-h3').textContent();
console.log('After clicking Next Month:', secondMonthTitle);

if (secondMonthTitle !== initialMonthTitle) {
  console.log('PASS: Month slide transitioned to next month:', secondMonthTitle);
} else {
  console.error('FAIL: Month did not transition on next button click');
  passed = false;
}
await page.screenshot({ path: 'verification/artifacts/mobile-month-slider.png' });

// 3. Test Chapter 04 Ranker table text overlapping
console.log('\n--- 3. Testing Chapter 04 Ranker table layout on mobile ---');
const rankerTable = page.locator('.ranker-candidates-table');
await rankerTable.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);

const tableMetrics = await page.evaluate(() => {
  const table = document.querySelector('.ranker-candidates-table');
  const firstRow = document.querySelector('.ranker-candidates-table .table-row:not(.header)');
  return {
    scrollWidth: table.scrollWidth,
    clientWidth: table.clientWidth,
    isScrollable: table.scrollWidth > table.clientWidth,
    rowColumnsCount: firstRow ? firstRow.children.length : 0
  };
});
console.log('Ranker table metrics:', tableMetrics);
if (tableMetrics.isScrollable && tableMetrics.scrollWidth >= 550) {
  console.log('PASS: Ranker table has comfortable width and horizontal scrolling without overlapping');
} else {
  console.error('FAIL: Ranker table is not properly scrollable or columns squeezed');
  passed = false;
}
await page.screenshot({ path: 'verification/artifacts/mobile-ranker-table.png' });

// 4. Test Chapter 05 Certificates left to right slide
console.log('\n--- 4. Testing Chapter 05 Certificate mobile left-to-right carousel ---');
const certsNav = page.locator('.certs-mobile-slider-bar');
await certsNav.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);

const certsCarouselState = await page.evaluate(() => {
  const grid = document.querySelector('.story-certs-grid');
  const style = window.getComputedStyle(grid);
  const cards = Array.from(document.querySelectorAll('.story-cert-flip-container'));
  return {
    display: style.display,
    flexDirection: style.flexDirection,
    overflowX: style.overflowX,
    cardCount: cards.length,
    firstCardWidth: cards[0] ? cards[0].getBoundingClientRect().width : 0
  };
});
console.log('Certs carousel layout:', certsCarouselState);
if (certsCarouselState.display === 'flex' && certsCarouselState.overflowX === 'auto') {
  console.log('PASS: Certificates arranged left to right in a horizontal slider on mobile');
} else {
  console.error('FAIL: Certificates grid is not horizontal on mobile');
  passed = false;
}

// Test clicking Next Certificate
const certNextBtn = page.locator('.certs-slide-arrow-btn.next');
await certNextBtn.click();
await page.waitForTimeout(400);
console.log('PASS: Clicked next certificate button');
await page.screenshot({ path: 'verification/artifacts/mobile-certs-slider.png' });

// 5. Test Chapter 06 Headline text and Standing proof pictures slider
console.log('\n--- 5. Testing Chapter 06 Headline text & Standing screenshots slider ---');
const leaderboardTitle = page.locator('#leaderboard-title');
await leaderboardTitle.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const headlineText = await leaderboardTitle.textContent();
console.log('Chapter 06 Headline:', headlineText.trim());
if (headlineText.includes('#1 in Bangladesh and #23 in worldwide in Machine Learning track')) {
  console.log('PASS: Exact headline text fixed as requested');
} else {
  console.error('FAIL: Headline text does not match requested text');
  passed = false;
}

// Test Standing Proof Screenshots
const proofTabs = page.locator('.proof-tab-btn');
const tabCount = await proofTabs.count();
console.log('Standing proof slide tabs count:', tabCount);

const initialSlideTitle = await page.locator('.proof-rank-h4').textContent();
console.log('Initial proof slide title:', initialSlideTitle);

// Click Worldwide tab
await proofTabs.nth(1).click();
await page.waitForTimeout(300);
const secondSlideTitle = await page.locator('.proof-rank-h4').textContent();
console.log('After switching tab to Worldwide:', secondSlideTitle);

if (secondSlideTitle !== initialSlideTitle && secondSlideTitle.includes('#23 Worldwide')) {
  console.log('PASS: Standing screenshots slider switches between Bangladesh (#1) and Worldwide (#23)');
} else {
  console.error('FAIL: Standing screenshot slider did not switch');
  passed = false;
}
await page.screenshot({ path: 'verification/artifacts/mobile-standing-slider.png' });

// Also test desktop layout
const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await desktopPage.addInitScript(() => {
  localStorage.setItem('fardin_intro_seen', 'true');
  localStorage.setItem('fardin_theme', 'dark');
});
await desktopPage.goto(baseUrl + '/experience/flyrank-ai');
await desktopPage.waitForTimeout(1400);
await desktopPage.waitForFunction(() => !document.querySelector('.story-branded-loader'), { timeout: 10000 });
await desktopPage.locator('#leaderboard-title').scrollIntoViewIfNeeded();
await desktopPage.waitForTimeout(400);
await desktopPage.screenshot({ path: 'verification/artifacts/desktop-standing-slider.png' });
console.log('PASS: Desktop standing proof screenshot saved');

await browser.close();
await server.close();

if (passed) {
  console.log('\nAll mobile journey features passed successfully!');
  process.exit(0);
} else {
  console.error('\nSome mobile journey tests failed!');
  process.exit(1);
}
