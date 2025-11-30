const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console logs
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    console.log('📝', text);
  });

  // Capture errors
  page.on('pageerror', error => {
    console.error('❌ Page Error:', error.message);
  });

  try {
    console.log('\n🚀 로그인 테스트 시작\n');

    // Go to login page
    console.log('Step 1: 로그인 페이지 접속...');
    await page.goto('https://youtube-shorts-generator.pages.dev/login');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'screenshots-test/login-page.png', fullPage: true });

    // Fill login form
    console.log('\nStep 2: 로그인 정보 입력...');
    await page.fill('#email', 'hompystory@gmail.com');
    await page.fill('#password', 'a1226119');
    
    // Click login button
    console.log('\nStep 3: 로그인 버튼 클릭...');
    await page.click('button[type="submit"]');
    
    // Wait for navigation or error
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log('\n현재 URL:', currentUrl);
    
    await page.screenshot({ path: 'screenshots-test/after-login.png', fullPage: true });

    // Check if logged in
    const authToken = await page.evaluate(() => {
      return localStorage.getItem('jwt_token');
    });
    
    const userInfo = await page.evaluate(() => {
      return localStorage.getItem('user_info');
    });

    console.log('\n✅ 로그인 상태:');
    console.log('   - Auth Token:', authToken ? '✓ 있음' : '✗ 없음');
    console.log('   - User Info:', userInfo ? '✓ 있음' : '✗ 없음');

    if (authToken) {
      console.log('\n✅ 로그인 성공!');
      
      // Go to main page
      console.log('\nStep 4: 메인 페이지 이동...');
      await page.goto('https://youtube-shorts-generator.pages.dev/');
      await page.waitForTimeout(5000);
      
      await page.screenshot({ path: 'screenshots-test/main-page.png', fullPage: true });
      
      // Check API keys
      const apiKeys = await page.evaluate(() => {
        return {
          gemini: document.getElementById('geminiApiKey')?.value || '',
          minimax: document.getElementById('minimaxApiKey')?.value || '',
          minimaxGroup: document.getElementById('minimaxGroupId')?.value || '',
          shotstack: document.getElementById('shotstackApiKey')?.value || ''
        };
      });
      
      console.log('\nAPI 키 로드 상태:');
      console.log('   - Gemini:', apiKeys.gemini ? '✓ 로드됨' : '✗ 없음');
      console.log('   - Minimax:', apiKeys.minimax ? '✓ 로드됨' : '✗ 없음');
      console.log('   - Minimax Group:', apiKeys.minimaxGroup ? '✓ 로드됨' : '✗ 없음');
      console.log('   - Shotstack:', apiKeys.shotstack ? '✓ 로드됨' : '✗ 없음');
      
    } else {
      console.log('\n❌ 로그인 실패!');
    }

    console.log('\n📋 Console 로그 요약:');
    const errorLogs = logs.filter(log => log.includes('ERROR') || log.includes('❌') || log.includes('Failed'));
    if (errorLogs.length > 0) {
      console.log('오류 메시지:');
      errorLogs.forEach(log => console.log('  ', log));
    } else {
      console.log('오류 없음');
    }

  } catch (error) {
    console.error('\n❌ 테스트 오류:', error.message);
    await page.screenshot({ path: 'screenshots-test/error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
