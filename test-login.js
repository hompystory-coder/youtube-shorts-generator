const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('📱 Console:', msg.text()));
  
  console.log('🌐 Navigating to login page...');
  await page.goto('https://youtube-shorts-generator.pages.dev/login.html', {
    waitUntil: 'networkidle',
    timeout: 30000
  });
  
  await page.waitForTimeout(2000);
  
  console.log('📝 Filling login form...');
  await page.fill('#email', 'hompystory@gmail.com');
  await page.fill('#password', 'a1226119');
  
  console.log('🔐 Clicking login button...');
  
  // Listen for dialog (alert)
  page.on('dialog', async dialog => {
    console.log('🔔 Alert message:', dialog.message());
    await dialog.accept();
  });
  
  await page.click('button[type="submit"]');
  
  // Wait for response or navigation
  await page.waitForTimeout(5000);
  
  // Check localStorage
  const token = await page.evaluate(() => localStorage.getItem('jwt_token'));
  const userInfo = await page.evaluate(() => localStorage.getItem('user_info'));
  
  console.log('🎫 Token stored:', !!token);
  console.log('👤 User info stored:', !!userInfo);
  
  if (token) {
    console.log('Token:', token.substring(0, 30) + '...');
  }
  
  if (userInfo) {
    console.log('User info:', userInfo);
  }
  
  const currentUrl = page.url();
  console.log('📍 Current URL:', currentUrl);
  
  // Take screenshot for debugging
  await page.screenshot({ path: 'screenshots-test/login-result.png', fullPage: true });
  console.log('📸 Screenshot saved: screenshots-test/login-result.png');
  
  await browser.close();
  
  if (token && userInfo) {
    console.log('\n✅ 로그인 성공!');
  } else {
    console.log('\n❌ 로그인 실패 - 토큰이 저장되지 않음');
  }
})();
