const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    const text = msg.text();
    if (!text.includes('tailwindcss')) {
      console.log('📱', text);
    }
  });
  
  console.log('🌐 Logging in...');
  await page.goto('https://youtube-shorts-generator.pages.dev/login.html');
  await page.fill('#email', 'hompystory@gmail.com');
  await page.fill('#password', 'a1226119');
  
  page.on('dialog', async dialog => await dialog.accept());
  
  await page.click('button[type="submit"]');
  await page.waitForURL('https://youtube-shorts-generator.pages.dev/', { timeout: 10000 });
  console.log('✅ Logged in successfully');
  
  await page.waitForTimeout(2000);
  
  console.log('\n🏠 Navigating to My Page...');
  await page.goto('https://youtube-shorts-generator.pages.dev/mypage.html');
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Check if still logged in
  const currentUrl = page.url();
  console.log('📍 Current URL:', currentUrl);
  
  if (currentUrl.includes('login.html')) {
    console.log('❌ FAILED: Redirected to login page (logged out)');
  } else if (currentUrl.includes('mypage.html')) {
    console.log('✅ SUCCESS: Still on My Page (logged in)');
    
    // Check user info is displayed
    const userName = await page.textContent('#userName').catch(() => null);
    const userEmail = await page.textContent('#userEmail').catch(() => null);
    
    console.log('👤 User Name:', userName);
    console.log('📧 User Email:', userEmail);
  }
  
  // Take screenshot
  await page.screenshot({ path: 'screenshots-test/mypage-test.png', fullPage: true });
  console.log('📸 Screenshot saved');
  
  await browser.close();
})();
