const playwright = require('playwright');

(async () => {
    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Listen to console
    page.on('console', msg => {
        if (msg.text().includes('Loaded') || msg.text().includes('Found')) {
            console.log('   [CONSOLE]', msg.text());
        }
    });

    console.log('🧪 Testing login and full workflow...\n');

    try {
        // Test login page
        console.log('1. Testing login page access...');
        await page.goto('https://youtube-shorts-generator.pages.dev/login');
        await page.waitForLoadState('networkidle');
        console.log('   ✅ Login page loaded\n');
        
        // Login
        console.log('2. Logging in...');
        await page.fill('#email', 'hompystory@gmail.com');
        await page.fill('#password', 'a1226119');
        await page.click('#loginButton');
        
        await page.waitForURL('https://youtube-shorts-generator.pages.dev/');
        console.log('   ✅ Login successful\n');
        
        // Wait for background loading
        console.log('3. Waiting for background data to load...');
        await page.waitForTimeout(5000);
        
        // Check backgrounds
        const bgImageCount = await page.locator('#bgImageSelect option').count();
        const bgMusicCount = await page.locator('#bgMusicSelect option').count();
        
        console.log(`   Background images: ${bgImageCount} options`);
        console.log(`   Background music: ${bgMusicCount} options`);
        
        if (bgImageCount > 1) {
            const images = await page.locator('#bgImageSelect option').allTextContents();
            console.log('   Available images:', images.slice(1).join(', '));
            console.log('   ✅ Backgrounds loaded!\n');
        } else {
            console.log('   ⚠️ Backgrounds not loaded yet (CDN cache)\n');
        }
        
        // Test blog crawling
        console.log('4. Testing blog crawling...');
        await page.fill('#blogUrl', 'https://blog.naver.com/sbtmdusgkq/224059538276');
        
        const crawlButton = page.locator('button:has-text("블로그 크롤링 시작")');
        await crawlButton.click();
        console.log('   Crawl started...');
        
        await page.waitForTimeout(10000);
        
        const imageContainer = page.locator('#crawledImagesContainer');
        const isVisible = await imageContainer.isVisible();
        
        if (isVisible) {
            const imageCount = await imageContainer.locator('input[type="checkbox"]').count();
            console.log(`   ✅ Crawling successful! Found ${imageCount} images\n`);
        } else {
            console.log('   ⚠️ No images displayed (checking API response...)\n');
        }
        
        await page.screenshot({ path: 'screenshots-test/final-test.png', fullPage: true });
        console.log('📸 Screenshot saved: screenshots-test/final-test.png');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await browser.close();
    }
})();
