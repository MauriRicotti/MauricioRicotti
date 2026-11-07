import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';

const distDir = '/home/user/portfolio/dist';

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

const server = createServer((req, res) => {
  let url = req.url.split('?')[0];
  if (url === '/') url = '/index.html';
  const filePath = join(distDir, url);
  if (existsSync(filePath)) {
    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(readFileSync(filePath));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(4199, async () => {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop - Geist
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:4199/');
  await page.waitForFunction(() => !document.getElementById('mr-loader'), { timeout: 10000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: '/home/user/images/tipo-1-geist-desktop.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });

  // 1. Mobile - Geist
  const pageMob = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await pageMob.goto('http://localhost:4199/');
  await pageMob.waitForFunction(() => !document.getElementById('mr-loader'), { timeout: 10000 });
  await pageMob.waitForTimeout(600);
  await pageMob.screenshot({ path: '/home/user/images/tipo-1-geist-mobile.png', clip: { x: 0, y: 0, width: 390, height: 844 } });

  // 2. Desktop - Inter
  await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    if (h1) h1.className = h1.className.replace('font-editorial', 'font-inter');
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/home/user/images/tipo-2-inter-desktop.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });

  // 3. Desktop - DM Sans
  await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    if (h1) h1.className = h1.className.replace('font-inter', 'font-dmsans');
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/home/user/images/tipo-3-dmsans-desktop.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });

  console.log('All typography options captured');
  await browser.close();
  server.close();
  process.exit(0);
});
