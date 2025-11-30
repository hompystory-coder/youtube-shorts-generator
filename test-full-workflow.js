const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('\n========================================');
    console.log('🚀 전체 워크플로우 테스트 시작');
    console.log('========================================\n');

    // Step 1: 로그인
    console.log('📝 Step 1: 로그인...');
    await page.goto('https://youtube-shorts-generator.pages.dev/login');
    await page.waitForTimeout(3000);
    
    await page.fill('#email', 'hompystory@gmail.com');
    await page.fill('#password', 'a1226119');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    console.log('✅ 로그인 완료\n');
    await page.screenshot({ path: 'screenshots-test/01-login.png', fullPage: true });

    // Step 2: 메인 페이지 이동
    console.log('📝 Step 2: 메인 페이지 이동...');
    await page.goto('https://youtube-shorts-generator.pages.dev/');
    await page.waitForTimeout(3000);
    
    const apiKeysLoaded = await page.evaluate(() => {
      return {
        gemini: document.getElementById('geminiApiKey')?.value?.length > 0,
        minimax: document.getElementById('minimaxApiKey')?.value?.length > 0,
      };
    });
    console.log('API 키 상태:', apiKeysLoaded);
    console.log('✅ 메인 페이지 로드 완료\n');
    await page.screenshot({ path: 'screenshots-test/02-main-page.png', fullPage: true });

    // Step 3: 블로그 크롤링
    console.log('📝 Step 3: 블로그 크롤링...');
    await page.fill('#blogUrl', 'https://blog.naver.com/alphahome/224056870043');
    await page.waitForTimeout(1000);
    
    // 크롤링 버튼 클릭
    await page.click('button:has-text("블로그 크롤링 시작")');
    console.log('⏳ 크롤링 중... (최대 60초 대기)');
    
    // Alert 대기
    page.on('dialog', async dialog => {
      console.log('💬 Alert:', dialog.message());
      await dialog.accept();
    });
    
    // 이미지 로드 대기
    await page.waitForFunction(() => {
      const container = document.getElementById('crawledImagesContainer');
      return container && !container.classList.contains('hidden') && container.querySelector('.image-item');
    }, { timeout: 60000 });
    
    const imageCount = await page.evaluate(() => {
      return document.querySelectorAll('.image-item').length;
    });
    console.log(`✅ 크롤링 완료: ${imageCount}개 이미지 발견\n`);
    await page.screenshot({ path: 'screenshots-test/03-crawled.png', fullPage: true });

    if (imageCount === 0) {
      throw new Error('크롤링된 이미지가 없습니다');
    }

    // Step 4: 이미지 선택 (첫 5개)
    console.log('📝 Step 4: 이미지 선택 (첫 5개)...');
    const selectedCount = await page.evaluate(() => {
      const checkboxes = document.querySelectorAll('.image-checkbox');
      let count = 0;
      for (let i = 0; i < Math.min(5, checkboxes.length); i++) {
        checkboxes[i].click();
        count++;
      }
      return count;
    });
    console.log(`✅ ${selectedCount}개 이미지 선택 완료\n`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots-test/04-images-selected.png', fullPage: true });

    // Step 5: 스크립트 생성 (자동 또는 수동)
    console.log('📝 Step 5: 스크립트 확인...');
    
    // 스크립트 생성 버튼 찾기
    const generateScriptBtn = await page.$('button:has-text("스크립트 생성")');
    if (generateScriptBtn) {
      console.log('스크립트 생성 버튼 클릭...');
      await generateScriptBtn.click();
      await page.waitForTimeout(5000);
    }
    
    // 스크립트 텍스트 확인
    let scriptText = await page.evaluate(() => {
      const textarea = document.getElementById('scriptTextarea') || 
                       document.querySelector('textarea[placeholder*="스크립트"]');
      return textarea ? textarea.value : '';
    });
    
    console.log(`스크립트 길이: ${scriptText.length} 자`);
    
    // 스크립트가 없으면 샘플 텍스트 입력
    if (scriptText.length === 0) {
      console.log('⚠️ 스크립트가 비어있음. 샘플 텍스트 입력...');
      scriptText = '코지바이브 블랙트리 대형 크리스마스 트리를 소개합니다. 150개의 지네 전구가 함께 제공되는 쿨 세트입니다. 고급스러운 블랙 디자인으로 특별한 분위기를 연출하세요. 다채로운 조명 모드로 원하는 분위기를 만들 수 있습니다. 이번 크리스마스, 코지바이브와 함께 특별한 순간을 만드세요.';
      
      await page.evaluate((text) => {
        const textarea = document.getElementById('scriptTextarea') || 
                        document.querySelector('textarea[placeholder*="스크립트"]');
        if (textarea) {
          textarea.value = text;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, scriptText);
      
      await page.waitForTimeout(1000);
    }
    
    console.log('✅ 스크립트 준비 완료\n');
    await page.screenshot({ path: 'screenshots-test/05-script.png', fullPage: true });

    // Step 6: 음성 생성
    console.log('📝 Step 6: 음성 생성...');
    
    // 음성 생성 버튼 찾기 및 스크롤
    await page.evaluate(() => {
      const btn = document.getElementById('generateVoiceBtn') || 
                  document.querySelector('button:has-text("음성 생성")');
      if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await page.waitForTimeout(2000);
    
    // 음성 생성 버튼 상태 확인
    const voiceBtnStatus = await page.evaluate(() => {
      const btn = document.getElementById('generateVoiceBtn') || 
                  document.querySelector('button:has-text("음성 생성")');
      return btn ? {
        exists: true,
        visible: btn.offsetParent !== null,
        disabled: btn.disabled,
        text: btn.textContent.trim()
      } : { exists: false };
    });
    
    console.log('음성 생성 버튼 상태:', voiceBtnStatus);
    
    if (voiceBtnStatus.exists && voiceBtnStatus.visible && !voiceBtnStatus.disabled) {
      console.log('⏳ 음성 생성 시작... (최대 120초 대기)');
      
      const voiceBtn = await page.$('#generateVoiceBtn, button:has-text("음성 생성")');
      await voiceBtn.click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'screenshots-test/06-voice-generating.png', fullPage: true });
      
      // 음성 생성 완료 대기
      try {
        await page.waitForFunction(() => {
          const btn = document.getElementById('generateVoiceBtn') || 
                     document.querySelector('button:has-text("음성 생성")');
          return btn && !btn.disabled && !btn.textContent.includes('생성 중');
        }, { timeout: 120000 });
        
        console.log('✅ 음성 생성 완료\n');
        await page.screenshot({ path: 'screenshots-test/07-voice-completed.png', fullPage: true });
      } catch (e) {
        console.log('⚠️ 음성 생성 시간 초과 (계속 진행)\n');
      }
    } else {
      console.log('❌ 음성 생성 버튼을 사용할 수 없음\n');
      await page.screenshot({ path: 'screenshots-test/06-voice-btn-unavailable.png', fullPage: true });
    }

    // Step 7: 영상 생성
    console.log('📝 Step 7: 영상 생성...');
    
    // 영상 생성 버튼 찾기 및 스크롤
    await page.evaluate(() => {
      const btn = document.getElementById('generateVideoBtn') || 
                  document.querySelector('button:has-text("영상 생성")');
      if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await page.waitForTimeout(2000);
    
    // 영상 생성 버튼 상태 확인
    const videoBtnStatus = await page.evaluate(() => {
      const btn = document.getElementById('generateVideoBtn') || 
                  document.querySelector('button:has-text("영상 생성")');
      return btn ? {
        exists: true,
        visible: btn.offsetParent !== null,
        disabled: btn.disabled,
        text: btn.textContent.trim()
      } : { exists: false };
    });
    
    console.log('영상 생성 버튼 상태:', videoBtnStatus);
    
    if (videoBtnStatus.exists && videoBtnStatus.visible && !videoBtnStatus.disabled) {
      console.log('⏳ 영상 생성 시작... (매우 오래 걸릴 수 있음 - 최대 10분)');
      
      const videoBtn = await page.$('#generateVideoBtn, button:has-text("영상 생성")');
      await videoBtn.click();
      await page.waitForTimeout(5000);
      
      await page.screenshot({ path: 'screenshots-test/08-video-generating.png', fullPage: true });
      
      // 영상 생성 진행 상태 모니터링
      console.log('📊 영상 생성 진행 상태 모니터링 중...');
      
      const startTime = Date.now();
      let lastStatus = '';
      
      for (let i = 0; i < 120; i++) { // 최대 10분 (5초 x 120회)
        await page.waitForTimeout(5000);
        
        const status = await page.evaluate(() => {
          const btn = document.getElementById('generateVideoBtn') || 
                     document.querySelector('button:has-text("영상 생성")');
          const statusText = document.querySelector('.status-message, .progress-text');
          return {
            btnText: btn ? btn.textContent.trim() : '',
            statusText: statusText ? statusText.textContent.trim() : '',
            btnDisabled: btn ? btn.disabled : true
          };
        });
        
        if (status.btnText !== lastStatus || status.statusText) {
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          console.log(`   [${elapsed}초] ${status.btnText}${status.statusText ? ' - ' + status.statusText : ''}`);
          lastStatus = status.btnText;
        }
        
        // 완료 확인
        if (!status.btnDisabled && !status.btnText.includes('생성 중')) {
          console.log('✅ 영상 생성 완료!\n');
          await page.screenshot({ path: 'screenshots-test/09-video-completed.png', fullPage: true });
          
          // 생성된 영상 확인
          const videoResult = await page.evaluate(() => {
            const videoEl = document.querySelector('video');
            const downloadLink = document.querySelector('a[download]');
            return {
              hasVideo: !!videoEl,
              videoSrc: videoEl ? videoEl.src : null,
              hasDownload: !!downloadLink,
              downloadHref: downloadLink ? downloadLink.href : null
            };
          });
          
          console.log('생성된 영상 정보:', videoResult);
          break;
        }
        
        // 매 30초마다 스크린샷
        if (i % 6 === 0) {
          await page.screenshot({ 
            path: `screenshots-test/08-video-progress-${Math.floor(i/6)}.png`, 
            fullPage: true 
          });
        }
      }
      
    } else {
      console.log('❌ 영상 생성 버튼을 사용할 수 없음');
      await page.screenshot({ path: 'screenshots-test/08-video-btn-unavailable.png', fullPage: true });
    }

    console.log('\n========================================');
    console.log('✅ 전체 워크플로우 테스트 완료');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    console.error('스택:', error.stack);
    await page.screenshot({ path: 'screenshots-test/error-final.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
