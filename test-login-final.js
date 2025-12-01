const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Monitor console
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  
  try {
    console.log('1. Accessing login page...');
    await page.goto('https://youtube-shorts-generator.pages.dev/login');
    await page.waitForLoadState('networkidle');
    
    console.log('2. Filling login form...');
    await page.fill('#email', 'hompystory@gmail.com');
    await page.fill('#password', 'a1226119');
    
    console.log('3. Submitting login...');
    await page.click('#loginButton');
    
    // Wait for redirect or error
    await page.waitForTimeout(3000);
    
    console.log('4. Current URL:', page.url());
    
    // Check localStorage
    const authToken = await page.evaluate(() => localStorage.getItem('auth_token'));
    const userInfo = await page.evaluate(() => localStorage.getItem('user_info'));
    
    console.log('5. Auth token exists:', !!authToken);
    console.log('6. User info exists:', !!userInfo);
    
    if (page.url().includes('youtube-shorts-generator.pages.dev') && 
        !page.url().includes('/login')) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed or still on login page');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await browser.close();
})();
