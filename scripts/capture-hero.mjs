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
  if (url === '/en' || url === '/en/') url = '/en/index.html';
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

  // Desktop ES
  const pageDesktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageDesktop.goto('http://localhost:4199/');
  await pageDesktop.waitForFunction(() => !document.getElementById('mr-loader'), { timeout: 10000 });
  await pageDesktop.waitForTimeout(600);
  await pageDesktop.screenshot({ path: '/tmp/hero-desktop-updated.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log('Desktop ES captured');

  // Mobile ES
  const pageMobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await pageMobile.goto('http://localhost:4199/');
  await pageMobile.waitForFunction(() => !document.getElementById('mr-loader'), { timeout: 10000 });
  await pageMobile.waitForTimeout(600);
  await pageMobile.screenshot({ path: '/tmp/hero-mobile-updated.png', clip: { x: 0, y: 0, width: 390, height: 844 } });
  console.log('Mobile ES captured');

  // Desktop EN
  const pageDesktopEn = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageDesktopEn.goto('http://localhost:4199/en');
  await pageDesktopEn.waitForFunction(() => !document.getElementById('mr-loader'), { timeout: 10000 });
  await pageDesktopEn.waitForTimeout(600);
  await pageDesktopEn.screenshot({ path: '/tmp/hero-desktop-en.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log('Desktop EN captured');

  await browser.close();
  server.close();
  process.exit(0);
});
