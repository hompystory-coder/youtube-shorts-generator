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
  console.log('✅ Logged in');
  
  await page.waitForTimeout(3000);
  
  console.log('\n🔍 Blog crawling test...');
  
  // Enter blog URL
  const blogUrl = 'https://blog.naver.com/alphahome/224056870043';
  await page.fill('#blogUrl', blogUrl);
  console.log('📝 URL entered:', blogUrl);
  
  // Click using text selector
  await page.click('button:has-text("블로그 크롤링 시작")');
  console.log('🚀 Crawl button clicked');
  
  // Wait for results
  try {
    await page.waitForFunction(() => {
      const container = document.getElementById('crawledImagesContainer');
      if (!container) return false;
      
      const style = window.getComputedStyle(container);
      const isVisible = style.display !== 'none';
      const hasImages = container.querySelectorAll('img').length > 0;
      
      console.log('Container visible:', isVisible, 'Has images:', hasImages);
      
      return isVisible && hasImages;
    }, { timeout: 60000 });
    
    const imageCount = await page.evaluate(() => {
      const container = document.getElementById('crawledImagesContainer');
      return container.querySelectorAll('img').length;
    });
    
    console.log(`\n✅ Crawling SUCCESS! Found ${imageCount} images`);
    await page.screenshot({ path: 'screenshots-test/crawl-success.png', fullPage: true });
    
  } catch (error) {
    console.log('\n❌ Crawling FAILED - timeout');
    
    const debugInfo = await page.evaluate(() => {
      const container = document.getElementById('crawledImagesContainer');
      return {
        containerExists: !!container,
        containerDisplay: container ? window.getComputedStyle(container).display : null,
        innerHTML: container ? container.innerHTML.substring(0, 200) : null
      };
    });
    
    console.log('Debug info:', JSON.stringify(debugInfo, null, 2));
    await page.screenshot({ path: 'screenshots-test/crawl-failed.png', fullPage: true });
  }
  
  await browser.close();
})();
