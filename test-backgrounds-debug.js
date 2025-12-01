const playwright = require('playwright');

(async () => {
    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Listen to console
    page.on('console', msg => console.log('   [CONSOLE]', msg.text()));

    console.log('🔍 Testing background loading...\n');

    // Login
    await page.goto('https://youtube-shorts-generator.pages.dev/login');
    await page.fill('#email', 'hompystory@gmail.com');
    await page.fill('#password', 'a1226119');
    await page.click('#loginButton');
    await page.waitForURL('https://youtube-shorts-generator.pages.dev/');
    console.log('✅ Logged in\n');
    
    // Wait for background loading
    await page.waitForTimeout(5000);
    
    // Check localStorage
    const userInfo = await page.evaluate(() => localStorage.getItem('user_info'));
    console.log('User info:', userInfo ? 'exists' : 'missing');
    
    const token = await page.evaluate(() => localStorage.getItem('jwt_token') || localStorage.getItem('auth_token'));
    console.log('Token:', token ? 'exists' : 'missing');
    
    // Check select elements
    const bgImageCount = await page.locator('#bgImageSelect option').count();
    const bgMusicCount = await page.locator('#bgMusicSelect option').count();
    
    console.log('\nBackground images options:', bgImageCount);
    console.log('Background music options:', bgMusicCount);
    
    if (bgImageCount > 1) {
        const images = await page.locator('#bgImageSelect option').allTextContents();
        console.log('Images:', images);
    }
    
    if (bgMusicCount > 1) {
        const music = await page.locator('#bgMusicSelect option').allTextContents();
        console.log('Music:', music);
    }
    
    await browser.close();
})();
