const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('\n🚀 워크플로우 테스트 시작\n');

    // Step 1: 메인 페이지 접속
    console.log('Step 1: 메인 페이지 접속...');
    await page.goto('https://youtube-shorts-generator.pages.dev/');
    await page.waitForTimeout(5000);
    
    // 로그인 체크
    const isLoggedIn = await page.evaluate(() => {
      return !!localStorage.getItem('jwt_token');
    });
    
    console.log('로그인 상태:', isLoggedIn ? '✅ 로그인됨' : '❌ 로그아웃됨');
    
    // 로그인 필요 시
    if (!isLoggedIn) {
      console.log('\n로그인 필요...');
      await page.goto('https://youtube-shorts-generator.pages.dev/login');
      await page.waitForTimeout(2000);
      
      await page.fill('#email', 'hompystory@gmail.com');
      await page.fill('#password', 'a1226119');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      await page.goto('https://youtube-shorts-generator.pages.dev/');
      await page.waitForTimeout(3000);
      console.log('✅ 로그인 완료');
    }
    
    await page.screenshot({ path: 'screenshots-test/01-main.png', fullPage: true });

    // Step 2: API 키 확인
    const apiKeys = await page.evaluate(() => {
      return {
        gemini: (document.getElementById('geminiApiKey')?.value || '').substring(0, 20),
        minimax: (document.getElementById('minimaxApiKey')?.value || '').substring(0, 20),
      };
    });
    console.log('\nAPI 키:', apiKeys);

    // Step 3: 블로그 URL 입력
    console.log('\nStep 2: 블로그 URL 입력...');
    
    const blogUrlInput = await page.$('#blogUrl');
    if (!blogUrlInput) {
      throw new Error('블로그 URL 입력란을 찾을 수 없습니다');
    }
    
    await page.fill('#blogUrl', 'https://blog.naver.com/alphahome/224056870043');
    await page.waitForTimeout(1000);
    console.log('✅ URL 입력 완료');
    
    await page.screenshot({ path: 'screenshots-test/02-url-entered.png', fullPage: true });

    // Step 4: 크롤링 버튼 찾기
    console.log('\nStep 3: 크롤링 시작...');
    
    // Alert 핸들러
    page.on('dialog', async dialog => {
      console.log('💬 Alert:', dialog.message());
      await dialog.accept();
    });
    
    // 버튼 찾기
    const crawlButtons = await page.$$('button');
    let foundButton = false;
    
    for (const btn of crawlButtons) {
      const text = await btn.textContent();
      if (text.includes('블로그 크롤링') || text.includes('크롤링 시작')) {
        console.log('✅ 크롤링 버튼 발견:', text.trim());
        await btn.click();
        foundButton = true;
        break;
      }
    }
    
    if (!foundButton) {
      throw new Error('크롤링 버튼을 찾을 수 없습니다');
    }
    
    console.log('⏳ 크롤링 중...');
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'screenshots-test/03-crawling.png', fullPage: true });

    // Step 5: 크롤링 결과 확인
    console.log('\nStep 4: 크롤링 결과 확인...');
    
    // 60초 동안 이미지 로드 대기
    for (let i = 0; i < 12; i++) {
      await page.waitForTimeout(5000);
      
      const result = await page.evaluate(() => {
        const container = document.getElementById('crawledImagesContainer');
        const images = document.querySelectorAll('.image-item');
        return {
          containerVisible: container && !container.classList.contains('hidden'),
          imageCount: images.length,
          containerHtml: container ? container.innerHTML.substring(0, 200) : 'not found'
        };
      });
      
      console.log(`   [${(i+1)*5}초] 이미지: ${result.imageCount}개, 컨테이너: ${result.containerVisible ? '표시됨' : '숨김'}`);
      
      if (result.imageCount > 0) {
        console.log(`✅ 크롤링 완료: ${result.imageCount}개 이미지`);
        await page.screenshot({ path: 'screenshots-test/04-crawled.png', fullPage: true });
        
        // 이미지 선택
        console.log('\nStep 5: 이미지 선택 (첫 3개)...');
        const selected = await page.evaluate(() => {
          const checkboxes = document.querySelectorAll('.image-checkbox');
          for (let i = 0; i < Math.min(3, checkboxes.length); i++) {
            checkboxes[i].click();
          }
          return Math.min(3, checkboxes.length);
        });
        console.log(`✅ ${selected}개 이미지 선택 완료`);
        
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshots-test/05-selected.png', fullPage: true });
        
        console.log('\n✅ 워크플로우 테스트 완료!');
        break;
      }
      
      if (i === 11) {
        console.log('❌ 크롤링 결과를 받지 못했습니다');
        console.log('   컨테이너 HTML:', result.containerHtml);
      }
    }

  } catch (error) {
    console.error('\n❌ 오류:', error.message);
    await page.screenshot({ path: 'screenshots-test/error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
