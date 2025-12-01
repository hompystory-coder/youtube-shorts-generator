const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login first
    await page.goto('https://youtube-shorts-generator.pages.dev/login');
    await page.fill('#email', 'hompystory@gmail.com');
    await page.fill('#password', 'a1226119');
    await page.click('#loginButton');
    await page.waitForURL('**/youtube-shorts-generator.pages.dev/', { timeout: 5000 });
    await page.waitForTimeout(2000);
    
    // Get API keys from page
    const apiKeys = await page.evaluate(() => {
      return {
        minimax: document.getElementById('minimaxApiKey')?.value,
        minimaxGroup: document.getElementById('minimaxGroupId')?.value
      };
    });
    
    console.log('Minimax API Key:', apiKeys.minimax ? apiKeys.minimax.substring(0, 20) + '...' : 'Not found');
    console.log('Minimax Group ID:', apiKeys.minimaxGroup || 'Not found');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await browser.close();
})();
