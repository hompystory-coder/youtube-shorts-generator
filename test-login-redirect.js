const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Testing /login.html redirect...');
  const response = await page.goto('https://youtube-shorts-generator.pages.dev/login.html');
  console.log(`Status: ${response.status()}`);
  console.log(`Final URL: ${page.url()}`);
  
  console.log('\nTesting /login direct access...');
  const response2 = await page.goto('https://youtube-shorts-generator.pages.dev/login');
  console.log(`Status: ${response2.status()}`);
  console.log(`Final URL: ${page.url()}`);
  
  await browser.close();
})();
