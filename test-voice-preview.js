const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Monitor console
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('API') || text.includes('voice') || text.includes('❌') || text.includes('✅')) {
      console.log('CONSOLE:', text);
    }
  });
  
  try {
    console.log('1. Login...');
    await page.goto('https://youtube-shorts-generator.pages.dev/login');
    await page.fill('#email', 'hompystory@gmail.com');
    await page.fill('#password', 'a1226119');
    await page.click('#loginButton');
    await page.waitForURL('**/youtube-shorts-generator.pages.dev/', { timeout: 5000 });
    
    console.log('2. Wait for page load...');
    await page.waitForTimeout(3000);
    
    console.log('3. Check API keys loaded...');
    const apiKeys = await page.evaluate(() => {
      return {
        gemini: document.getElementById('geminiApiKey')?.value,
        minimax: document.getElementById('minimaxApiKey')?.value,
        minimaxGroup: document.getElementById('minimaxGroupId')?.value,
        shotstack: document.getElementById('shotstackApiKey')?.value
      };
    });
    
    console.log('API Keys:', {
      gemini: apiKeys.gemini ? '✓ Loaded' : '✗ Missing',
      minimax: apiKeys.minimax ? '✓ Loaded' : '✗ Missing',
      minimaxGroup: apiKeys.minimaxGroup ? '✓ Loaded' : '✗ Missing',
      shotstack: apiKeys.shotstack ? '✓ Loaded' : '✗ Missing'
    });
    
    console.log('4. Check voice select...');
    const voiceSelect = await page.$('#minimaxVoiceSelect');
    const options = await page.evaluate(() => {
      const select = document.getElementById('minimaxVoiceSelect');
      return select ? Array.from(select.options).map(o => o.value) : [];
    });
    console.log('Voice options:', options.length, 'voices');
    
    if (apiKeys.minimax) {
      console.log('5. Test voice preview...');
      await page.selectOption('#minimaxVoiceSelect', 'Calm_Woman');
      await page.click('#previewVoiceBtn');
      
      await page.waitForTimeout(5000);
      
      console.log('6. Check result...');
    } else {
      console.log('⚠️ Cannot test voice preview - Minimax API key not loaded');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await browser.close();
})();
