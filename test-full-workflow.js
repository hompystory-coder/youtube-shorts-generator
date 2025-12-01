const playwright = require('playwright');

(async () => {
    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    console.log('🌐 Starting full workflow test...\n');

    try {
        // ===== 1. LOGIN =====
        console.log('🔐 Step 1: Login');
        await page.goto('https://youtube-shorts-generator.pages.dev/login');
        await page.waitForLoadState('networkidle');
        
        await page.fill('#email', 'hompystory@gmail.com');
        await page.fill('#password', 'a1226119');
        await page.click('#loginButton');
        
        // Wait for redirect
        await page.waitForURL('https://youtube-shorts-generator.pages.dev/', { timeout: 10000 });
        console.log('✅ Login successful\n');
        
        // Wait for page to load
        await page.waitForTimeout(3000);
        
        // ===== 2. CHECK BACKGROUND SETTINGS =====
        console.log('🖼️ Step 2: Check Background Settings');
        
        // Check background images
        const bgImageSelect = page.locator('#bgImageSelect');
        await bgImageSelect.waitFor({ state: 'visible', timeout: 5000 });
        const bgImageCount = await bgImageSelect.locator('option').count();
        console.log(`   Background Images: ${bgImageCount} options`);
        
        if (bgImageCount > 1) {
            const imageOptions = await bgImageSelect.locator('option').allTextContents();
            console.log('   Available images:', imageOptions.slice(1).join(', '));
            // Select first image
            await bgImageSelect.selectOption({ index: 1 });
            console.log('   ✅ Selected first background image');
        } else {
            console.log('   ⚠️ No background images loaded');
        }
        
        // Check background music
        const bgMusicSelect = page.locator('#bgMusicSelect');
        const bgMusicCount = await bgMusicSelect.locator('option').count();
        console.log(`   Background Music: ${bgMusicCount} options`);
        
        if (bgMusicCount > 1) {
            const musicOptions = await bgMusicSelect.locator('option').allTextContents();
            console.log('   Available music:', musicOptions.slice(1).join(', '));
            // Select first music
            await bgMusicSelect.selectOption({ index: 1 });
            console.log('   ✅ Selected first background music');
        } else {
            console.log('   ⚠️ No background music loaded');
        }
        
        await page.screenshot({ path: 'screenshots-test/step2-backgrounds.png' });
        console.log('   📸 Screenshot saved\n');
        
        // ===== 3. VOICE PREVIEW TEST =====
        console.log('🎤 Step 3: Voice Preview Test');
        
        const voiceSelect = page.locator('#minimaxVoiceSelect');
        await voiceSelect.selectOption('Calm_Woman');
        console.log('   Selected voice: Calm_Woman');
        
        const previewBtn = page.locator('#previewVoiceBtn');
        await previewBtn.click();
        console.log('   Clicked voice preview button');
        
        // Wait for response
        await page.waitForTimeout(3000);
        
        const btnText = await page.locator('#previewVoiceText').textContent();
        console.log(`   Button status: "${btnText}"`);
        
        await page.screenshot({ path: 'screenshots-test/step3-voice-preview.png' });
        console.log('   📸 Screenshot saved\n');
        
        // ===== 4. FONT PREVIEW TEST =====
        console.log('🔤 Step 4: Font Preview Test');
        
        const fontSelect = page.locator('#fontSelect');
        await fontSelect.selectOption('Black Han Sans');
        console.log('   Selected font: Black Han Sans');
        await page.waitForTimeout(500);
        
        await fontSelect.selectOption('Jua');
        console.log('   Selected font: Jua');
        await page.waitForTimeout(500);
        
        await fontSelect.selectOption('Noto Sans KR');
        console.log('   Selected font: Noto Sans KR (default)');
        
        await page.screenshot({ path: 'screenshots-test/step4-font-preview.png' });
        console.log('   📸 Screenshot saved\n');
        
        // ===== 5. OTHER SETTINGS TEST =====
        console.log('⚙️ Step 5: Other Settings Test');
        
        // Caption size
        const captionSizeSelect = page.locator('#captionSizeSelect');
        if (await captionSizeSelect.count() > 0) {
            await captionSizeSelect.selectOption('large');
            console.log('   Caption size: Large');
            await page.waitForTimeout(300);
        }
        
        // Caption color
        const captionColorSelect = page.locator('#captionColorSelect');
        if (await captionColorSelect.count() > 0) {
            await captionColorSelect.selectOption('yellow');
            console.log('   Caption color: Yellow');
            await page.waitForTimeout(300);
        }
        
        // Shadow effect
        const shadowEffectSelect = page.locator('#shadowEffectSelect');
        if (await shadowEffectSelect.count() > 0) {
            await shadowEffectSelect.selectOption('strong');
            console.log('   Shadow effect: Strong');
            await page.waitForTimeout(300);
        }
        
        // Image transition
        const imageTransitionSelect = page.locator('#imageTransitionSelect');
        if (await imageTransitionSelect.count() > 0) {
            await imageTransitionSelect.selectOption('slideLeft');
            console.log('   Image transition: Slide Left');
            await page.waitForTimeout(300);
        }
        
        // Video style
        const videoStyleSelect = page.locator('#videoStyleSelect');
        if (await videoStyleSelect.count() > 0) {
            await videoStyleSelect.selectOption('calm');
            console.log('   Video style: Calm');
            await page.waitForTimeout(300);
        }
        
        await page.screenshot({ path: 'screenshots-test/step5-other-settings.png' });
        console.log('   📸 Screenshot saved\n');
        
        // ===== 6. BLOG CRAWLING TEST =====
        console.log('🔍 Step 6: Blog Crawling Test');
        
        const blogUrlInput = page.locator('#blogUrl');
        await blogUrlInput.fill('https://blog.naver.com/sbtmdusgkq/224059538276');
        console.log('   Entered blog URL: https://blog.naver.com/sbtmdusgkq/224059538276');
        
        // Click crawl button (find by text)
        const crawlButton = page.locator('button:has-text("블로그 크롤링 시작")');
        await crawlButton.click();
        console.log('   Clicked crawl button');
        
        // Wait for crawling to complete
        console.log('   Waiting for crawl to complete...');
        await page.waitForTimeout(10000);
        
        // Check for images
        const imageContainer = page.locator('#crawledImagesContainer');
        const isVisible = await imageContainer.isVisible();
        
        if (isVisible) {
            const imageCount = await imageContainer.locator('input[type="checkbox"]').count();
            console.log(`   ✅ Crawling successful! Found ${imageCount} images`);
            
            // Select some images
            if (imageCount > 0) {
                const checkboxes = imageContainer.locator('input[type="checkbox"]');
                const selectCount = Math.min(5, imageCount);
                for (let i = 0; i < selectCount; i++) {
                    await checkboxes.nth(i).check();
                }
                console.log(`   ✅ Selected ${selectCount} images`);
            }
        } else {
            console.log('   ⚠️ Image container not visible');
        }
        
        await page.screenshot({ path: 'screenshots-test/step6-blog-crawl.png', fullPage: true });
        console.log('   📸 Screenshot saved\n');
        
        console.log('✅ Full workflow test completed!');
        console.log('\n📁 Screenshots saved in screenshots-test/');
        
        // Keep browser open for inspection
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.error('❌ Error during workflow test:', error.message);
        await page.screenshot({ path: 'screenshots-test/error.png' });
    } finally {
        await browser.close();
    }
})();
