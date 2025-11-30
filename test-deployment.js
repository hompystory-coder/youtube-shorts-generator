const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const baseUrl = 'https://5570748b.youtube-shorts-generator.pages.dev';
    
    console.log('\n========== 테스트 1: 블로그 크롤링 ==========\n');
    
    // 1. 로그인
    console.log('1. 로그인...');
    await page.goto(`${baseUrl}/login`);
    await page.waitForTimeout(2000);
    
    await page.fill('#email', 'hompystory@gmail.com');
    await page.fill('#password', 'a1226119');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('✅ 로그인 완료');

    // 2. 메인 페이지
    console.log('\n2. 메인 페이지 이동...');
    await page.goto(`${baseUrl}/`);
    await page.waitForTimeout(3000);
    console.log('✅ 메인 페이지 로드');

    // 3. 블로그 크롤링
    console.log('\n3. 블로그 크롤링...');
    await page.fill('#blogUrl', 'https://blog.naver.com/alphahome/224056870043');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("블로그 크롤링 시작")');
    console.log('크롤링 시작...');
    
    // 최대 60초 대기
    await page.waitForFunction(() => {
      const container = document.getElementById('crawledImagesContainer');
      return container && container.children.length > 0;
    }, { timeout: 60000 });
    
    const imageCount = await page.evaluate(() => {
      return document.querySelectorAll('#crawledImagesContainer .image-item').length;
    });
    console.log(`✅ 크롤링 완료: ${imageCount}개 이미지`);
    
    if (imageCount > 0) {
      console.log('✅ 블로그 크롤링 문제 해결됨!');
    } else {
      console.log('❌ 여전히 이미지가 0개입니다.');
    }
    
    await page.screenshot({ path: 'screenshots-test/deployment-crawled.png', fullPage: true });

    console.log('\n========== 테스트 2: 회원가입 및 구독 정보 ==========\n');
    
    // 회원가입
    const testEmail = `test${Date.now()}@example.com`;
    console.log('1. 회원가입...');
    await page.goto(`${baseUrl}/signup.html`);
    await page.waitForTimeout(2000);
    
    await page.fill('#name', '테스트 사용자');
    await page.fill('#email', testEmail);
    await page.fill('#password', 'test123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log(`✅ 회원가입 완료: ${testEmail}`);
    
    // 마이페이지
    console.log('\n2. 마이페이지 구독 정보 확인...');
    await page.goto(`${baseUrl}/mypage.html`);
    await page.waitForTimeout(5000); // API 로드 대기
    
    await page.screenshot({ path: 'screenshots-test/deployment-mypage.png', fullPage: true });
    
    // 구독 정보 확인
    const hasSubscriptionInfo = await page.evaluate(() => {
      const infoEl = document.getElementById('subscriptionInfo');
      return infoEl && !infoEl.classList.contains('hidden');
    });
    
    if (hasSubscriptionInfo) {
      console.log('✅ 구독 정보가 표시됩니다!');
      
      const subDetails = await page.evaluate(() => {
        const infoEl = document.getElementById('subscriptionInfo');
        return infoEl ? infoEl.textContent : 'none';
      });
      console.log('구독 정보:', subDetails.substring(0, 100));
    } else {
      console.log('⚠️ 구독 정보가 표시되지 않음');
    }
    
    // 구독 버튼 확인
    console.log('\n3. 구독 플랜 버튼 확인...');
    const paymentLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href="/payment"]'));
      return links.length;
    });
    
    console.log(`결제 페이지 링크: ${paymentLinks}개 발견`);
    
    if (paymentLinks > 0) {
      console.log('✅ 결제 페이지 링크 있음');
      
      // 첫 번째 링크 클릭
      await page.click('a[href="/payment"]');
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      console.log('현재 URL:', currentUrl);
      
      if (currentUrl.includes('/payment')) {
        console.log('✅ 결제 페이지로 이동 성공');
        await page.screenshot({ path: 'screenshots-test/deployment-payment.png', fullPage: true });
      } else {
        console.log('⚠️ 다른 페이지로 이동:', currentUrl);
      }
    } else {
      console.log('❌ 결제 페이지 링크를 찾을 수 없음');
    }
    
    console.log('\n========== 테스트 완료 ==========\n');
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
    await page.screenshot({ path: 'screenshots-test/deployment-error.png', fullPage: true });
  }

  await browser.close();
})();
