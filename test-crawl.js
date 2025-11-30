const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    const text = msg.text();
    if (!text.includes('tailwindcss')) {  // Filter out tailwind warnings
      console.log('📱', text);
    }
  });
  
  console.log('🌐 Logging in...');
  await page.goto('https://youtube-shorts-generator.pages.dev/login.html');
  await page.fill('#email', 'hompystory@gmail.com');
  await page.fill('#password', 'a1226119');
  
  // Handle alert
  page.on('dialog', async dialog => await dialog.accept());
  
  await page.click('button[type="submit"]');
  
  // Wait for redirect to main page
  await page.waitForURL('https://youtube-shorts-generator.pages.dev/', { timeout: 10000 });
  console.log('✅ Logged in successfully');
  
  await page.waitForTimeout(2000);
  
  console.log('\n🔍 Starting blog crawling test...');
  
  // Enter blog URL
  const blogUrl = 'https://blog.naver.com/alphahome/224056870043';
  await page.fill('#blogUrl', blogUrl);
  console.log('📝 Blog URL entered:', blogUrl);
  
  // Click crawl button
  await page.click('#crawlBtn');
  console.log('🚀 Crawl button clicked, waiting for results...');
  
  // Wait for crawling to complete (up to 60 seconds)
  try {
    await page.waitForFunction(() => {
      const container = document.getElementById('crawledImagesContainer');
      return container && container.style.display !== 'none' && container.children.length > 0;
    }, { timeout: 60000 });
    
    console.log('✅ Crawling completed!');
    
    // Count images
    const imageCount = await page.evaluate(() => {
      const container = document.getElementById('crawledImagesContainer');
      const images = container.querySelectorAll('img');
      return images.length;
    });
    
    console.log(`🎨 Found ${imageCount} images in the grid`);
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots-test/crawl-success.png', fullPage: true });
    console.log('📸 Screenshot saved: screenshots-test/crawl-success.png');
    
  } catch (error) {
    console.log('❌ Timeout waiting for images');
    
    // Check button state
    const buttonDisabled = await page.evaluate(() => {
      return document.getElementById('crawlBtn').disabled;
    });
    console.log('Button disabled:', buttonDisabled);
    
    // Take error screenshot
    await page.screenshot({ path: 'screenshots-test/crawl-timeout.png', fullPage: true });
    console.log('📸 Error screenshot saved: screenshots-test/crawl-timeout.png');
  }
  
  await browser.close();
})();
