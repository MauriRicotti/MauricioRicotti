import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });

// Desktop 1440x900
const pageD = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await pageD.goto("file:///tmp/test-expanded-full.html");
await pageD.screenshot({ path: "/tmp/expanded-desktop.png" });

// Mobile 390x844
const pageM = await browser.newPage({ viewport: { width: 390, height: 844 } });
await pageM.goto("file:///tmp/test-expanded-full.html");
await pageM.screenshot({ path: "/tmp/expanded-mobile.png" });

await browser.close();
console.log("Screenshots captured successfully!");
