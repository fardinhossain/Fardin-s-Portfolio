import { chromium } from 'playwright';
import { startServer } from './server.mjs';

const server = await startServer(new URL('../', import.meta.url));
const baseUrl = server.baseUrl;

console.log('Testing navbar scroll spy on:', baseUrl);

const browser = await chromium.launch({
  headless: true,
  channel: 'chrome',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader']
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  localStorage.setItem('fardin_intro_seen', 'true');
  localStorage.setItem('fardin_theme', 'dark');
});

await page.goto(baseUrl + '/');
await page.waitForSelector('.ae-section');
await page.waitForFunction(() => document.documentElement.dataset.scrollEngine === 'lenis');
await page.waitForTimeout(500);

// Helper to get currently active desktop nav item text
async function getActiveNavText() {
  return await page.evaluate(() => {
    const activeBtn = document.querySelector('.nav-links-desktop .nav-item-btn.active');
    return activeBtn ? activeBtn.textContent.trim() : 'NONE';
  });
}

const jump = async (target) => {
  await page.evaluate(async (t) => {
    const { scrollToTarget } = await import('/assets/js/smooth-scroll.js');
    scrollToTarget(t, { immediate: true });
  }, target);
  await page.waitForTimeout(100);
};

const tests = [
  { name: 'Initial load at top (Hero)', target: 0, expected: 'NONE' },
  { name: 'Scroll to About section', target: '#about', expected: 'ABOUT' },
  { name: 'Scroll to Experience section', target: '#experience', expected: 'EXPERIENCE' },
  { name: 'Scroll to Projects section', target: '#projects', expected: 'PROJECTS' },
  { name: 'Scroll to Certifications section', target: '#certifications', expected: 'CERTIFICATIONS' },
  { name: 'Scroll to Contact section', target: '#contact', expected: 'CONTACT' },
  { name: 'Scroll back to About section', target: '#about', expected: 'ABOUT' },
  { name: 'Scroll back to top (Hero)', target: 0, expected: 'NONE' }
];

let allPassed = true;

for (const t of tests) {
  await jump(t.target);
  await page.waitForTimeout(150);

  const debug = await page.evaluate(() => {
    return {
      scrollY: window.scrollY
    };
  });

  const active = await getActiveNavText();
  const pass = active === t.expected;
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${t.name}: expected "${t.expected}", got "${active}" (scrollY=${debug.scrollY})`);
  if (!pass) allPassed = false;
}

// Also test clicking each nav button directly
console.log('\nTesting click navigation on navbar items:');
const navItems = ['ABOUT', 'EXPERIENCE', 'PROJECTS', 'CERTIFICATIONS', 'CONTACT'];
for (const label of navItems) {
  const btn = page.locator(`.nav-links-desktop .nav-item-btn:has-text("${label}")`);
  await btn.click();
  await page.waitForTimeout(1100);
  const active = await getActiveNavText();
  const pass = active === label;
  console.log(`[${pass ? 'PASS' : 'FAIL'}] Click ${label}: active is "${active}"`);
  if (!pass) allPassed = false;
}

// Take screenshot of About Me section with navbar active highlight
await jump('#about');
await page.waitForTimeout(300);
await page.screenshot({ path: 'verification/artifacts/navbar-active-about.png' });
console.log('Saved screenshot of About Me with active nav item to verification/artifacts/navbar-active-about.png');

await browser.close();
await server.close();

if (!allPassed) {
  console.error('\nSome scroll spy tests failed!');
  process.exit(1);
} else {
  console.log('\nAll scroll spy tests passed successfully!');
  process.exit(0);
}
