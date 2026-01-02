const fs = require('fs');
const path = require('path');
const playwright = require('playwright');

(async () => {
  const url = process.env.URL || 'http://localhost:3000';
  const outDir = path.resolve(process.cwd(), 'test-results', 'navbar-screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();

  const scenarios = [
    { name: 'desktop', width: 1280, height: 800 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 812 },
  ];

  for (const s of scenarios) {
    const page = await context.newPage();
    await page.setViewportSize({ width: s.width, height: s.height });

    // Retry connecting until server is ready (10 attempts)
    let connected = false;
    for (let i = 0; i < 10; i++) {
      try {
        const resp = await page.goto(url, { waitUntil: 'networkidle' });
        if (resp && resp.status() < 500) {
          connected = true;
          break;
        }
      } catch (err) {
        // wait then retry
      }
      await new Promise((r) => setTimeout(r, 1000));
    }

    if (!connected) {
      console.error(`Could not connect to ${url}. Is the dev server running?`);
      await page.close();
      continue;
    }

    // Wait for navbar selector
    await page.waitForSelector('nav', { timeout: 5000 }).catch(() => {});

    // Capture full page and clipped navbar
    const fullPath = path.join(outDir, `${s.name}-full.png`);
    await page.screenshot({ path: fullPath, fullPage: true });

    const navHandle = await page.$('nav');
    if (navHandle) {
      const clipPath = path.join(outDir, `${s.name}-nav.png`);
      await navHandle.screenshot({ path: clipPath });
    }

    await page.close();
    console.log(`Captured ${s.name}`);
  }

  await browser.close();
  console.log('Screenshots saved to', outDir);
})();