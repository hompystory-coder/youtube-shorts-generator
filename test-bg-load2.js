const playwright = require('playwright');

(async () => {
    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('🔐 Testing background loading on main page...\n');

    // Go to login page
    await page.goto('https://youtube-shorts-generator.pages.dev/login.html');
    
    // Login
    await page.fill('#email', 'hompystory@gmail.com');
    await page.fill('#password', 'a1226119');
    await page.click('#loginBtn');
    
    // Wait for redirect to main page
    await page.waitForURL('https://youtube-shorts-generator.pages.dev/', { timeout: 10000 });
    console.log('✅ Login successful\n');
    
    // Wait for background loading
    await page.waitForTimeout(3000);
    
    // Check background image select
    const bgImageOptions = await page.locator('#bgImageSelect option').count();
    console.log(`🖼️ Background Image Options: ${bgImageOptions}`);
    
    if (bgImageOptions > 1) {
        const imageNames = await page.locator('#bgImageSelect option').allTextContents();
        console.log('   Available images:', imageNames.slice(1).join(', '));
    }
    
    // Check background music select
    const bgMusicOptions = await page.locator('#bgMusicSelect option').count();
    console.log(`🎵 Background Music Options: ${bgMusicOptions}`);
    
    if (bgMusicOptions > 1) {
        const musicNames = await page.locator('#bgMusicSelect option').allTextContents();
        console.log('   Available music:', musicNames.slice(1).join(', '));
    }
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots-test/bg-selection.png', fullPage: true });
    console.log('\n📸 Screenshot saved: screenshots-test/bg-selection.png');

    await browser.close();
})();
