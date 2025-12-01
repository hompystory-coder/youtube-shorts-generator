const playwright = require('playwright');

(async () => {
    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Listen to console
    page.on('console', msg => console.log('[CONSOLE]', msg.text()));

    console.log('🔍 Testing with latest deployment URL...\n');

    // Use latest deployment URL
    const BASE_URL = 'https://eaf1cb89.youtube-shorts-generator.pages.dev';
    
    // Check if app.js has loadUserBackgrounds
    const response = await page.goto(BASE_URL + '/static/app.js');
    const content = await response.text();
    const hasFunction = content.includes('loadUserBackgrounds');
    console.log(`loadUserBackgrounds function exists: ${hasFunction}`);
    console.log(`File size: ${content.length} characters\n`);
    
    if (hasFunction) {
        console.log('✅ Latest deployment has the correct code!\n');
        console.log('Testing full workflow...\n');
        
        // Login
        await page.goto(BASE_URL + '/login');
        await page.fill('#email', 'hompystory@gmail.com');
        await page.fill('#password', 'a1226119');
        await page.click('#loginButton');
        await page.waitForURL(BASE_URL + '/');
        console.log('✅ Logged in\n');
        
        // Wait for background loading
        await page.waitForTimeout(5000);
        
        // Check background options
        const bgImageCount = await page.locator('#bgImageSelect option').count();
        const bgMusicCount = await page.locator('#bgMusicSelect option').count();
        
        console.log('Background images:', bgImageCount);
        console.log('Background music:', bgMusicCount);
        
        if (bgImageCount > 1) {
            const images = await page.locator('#bgImageSelect option').allTextContents();
            console.log('Images:', images.slice(1));
        }
        
        if (bgMusicCount > 1) {
            const music = await page.locator('#bgMusicSelect option').allTextContents();
            console.log('Music:', music.slice(1));
        }
    } else {
        console.log('❌ Latest deployment is missing loadUserBackgrounds function');
    }
    
    await browser.close();
})();
