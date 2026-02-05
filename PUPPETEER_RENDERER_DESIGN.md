# Puppeteer 기반 HTML 렌더링 설계

## 📅 설계 날짜
2026-02-05 18:15 KST

## 🎯 목표

### 핵심 목표
1. **CSS 애니메이션 완벽 지원**
   - React 프리뷰와 동일한 결과
   - 8가지 애니메이션 효과 모두 구현
   - animationDuration 정확히 반영

2. **고품질 영상 생성**
   - 1080x1920 (9:16) 해상도
   - 60fps 부드러운 애니메이션
   - 투명도, 그림자 등 모든 CSS 효과 지원

3. **성능 최적화**
   - 장면당 3-5초 렌더링 (목표)
   - 메모리 효율적 관리
   - 병렬 처리 가능

## 🏗️ 시스템 아키텍처

### 전체 흐름
```
1. Frontend (React)
   └─> 설정 전송 (titleStyle, subtitle 등)
        │
2. Backend API (video.js)
   └─> 설정 수신 및 검증
        │
3. VideoRenderer (videoRenderer.js)
   ├─> 기존: FFmpeg drawtext ❌
   └─> 신규: Puppeteer HTML 렌더러 ✅
        │
4. Puppeteer Module (puppeteerRenderer.js) ⭐ NEW
   ├─> HTML 템플릿 생성
   ├─> CSS 애니메이션 주입
   ├─> Puppeteer 스크린샷 캡처
   └─> FFmpeg 인코딩
        │
5. 최종 비디오 생성
```

### 모듈 구조
```
/home/shorts/backend/src/utils/
├── videoRenderer.js           # 기존 렌더러 (통합 관리)
├── puppeteerRenderer.js       # ⭐ NEW: Puppeteer 렌더러
├── htmlTemplates.js           # ⭐ NEW: HTML 템플릿
└── cssAnimations.js           # ⭐ NEW: CSS keyframes
```

---

## 📋 상세 설계

### 1. Puppeteer 렌더러 (puppeteerRenderer.js)

#### 주요 기능
```javascript
class PuppeteerRenderer {
  // 장면을 HTML로 렌더링하고 비디오로 변환
  async renderScene(scene, settings) {
    // 1. HTML 생성
    const html = this.generateHTML(scene, settings);
    
    // 2. Puppeteer로 페이지 열기
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // 3. 뷰포트 설정 (9:16)
    await page.setViewport({
      width: 1080,
      height: 1920,
      deviceScaleFactor: 1
    });
    
    // 4. HTML 로드
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });
    
    // 5. 프레임 캡처 (60fps)
    const frames = await this.captureFrames(page, scene.duration, 60);
    
    // 6. FFmpeg로 인코딩
    const videoPath = await this.encodeVideo(frames, scene.duration);
    
    await browser.close();
    return videoPath;
  }
  
  // HTML 생성
  generateHTML(scene, settings) {
    // htmlTemplates.js 사용
  }
  
  // 프레임 캡처
  async captureFrames(page, duration, fps) {
    const totalFrames = Math.ceil(duration * fps);
    const frames = [];
    
    for (let i = 0; i < totalFrames; i++) {
      const timestamp = i / fps;
      
      // CSS animation 시간 업데이트
      await page.evaluate((time) => {
        document.documentElement.style.setProperty('--current-time', `${time}s`);
      }, timestamp);
      
      // 스크린샷 캡처
      const screenshot = await page.screenshot({
        type: 'png',
        encoding: 'binary'
      });
      
      frames.push(screenshot);
    }
    
    return frames;
  }
  
  // FFmpeg 인코딩
  async encodeVideo(frames, duration) {
    // 프레임 이미지들을 FFmpeg로 인코딩
  }
}
```

---

### 2. HTML 템플릿 (htmlTemplates.js)

#### 템플릿 구조
```javascript
function generateSceneHTML(scene, settings) {
  const { titleSettings, subtitleSettings } = settings;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      width: 1080px;
      height: 1920px;
      overflow: hidden;
      background: #000;
      position: relative;
    }
    
    /* 배경 이미지 */
    .background {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    /* 제목 */
    .title {
      position: absolute;
      width: 100%;
      text-align: center;
      font-family: '${titleSettings.fontFamily}';
      font-size: ${titleSettings.fontSize}px;
      color: ${titleSettings.color};
      text-shadow: 
        ${titleSettings.strokeWidth}px ${titleSettings.strokeWidth}px 0 ${titleSettings.strokeColor},
        -${titleSettings.strokeWidth}px -${titleSettings.strokeWidth}px 0 ${titleSettings.strokeColor},
        ${titleSettings.strokeWidth}px -${titleSettings.strokeWidth}px 0 ${titleSettings.strokeColor},
        -${titleSettings.strokeWidth}px ${titleSettings.strokeWidth}px 0 ${titleSettings.strokeColor};
      
      /* ⭐ 애니메이션 적용 */
      animation: ${titleSettings.animation} ${titleSettings.animationDuration}s ease-out;
    }
    
    /* 자막 */
    .subtitle {
      position: absolute;
      width: 100%;
      text-align: center;
      font-family: '${subtitleSettings.fontFamily}';
      font-size: ${subtitleSettings.fontSize}px;
      color: ${subtitleSettings.color};
      text-shadow: 
        ${subtitleSettings.strokeWidth}px ${subtitleSettings.strokeWidth}px 0 ${subtitleSettings.strokeColor},
        -${subtitleSettings.strokeWidth}px -${subtitleSettings.strokeWidth}px 0 ${subtitleSettings.strokeColor},
        ${subtitleSettings.strokeWidth}px -${subtitleSettings.strokeWidth}px 0 ${subtitleSettings.strokeColor},
        -${subtitleSettings.strokeWidth}px ${subtitleSettings.strokeWidth}px 0 ${subtitleSettings.strokeColor};
      
      /* ⭐ 애니메이션 적용 */
      animation: ${subtitleSettings.animation} ${subtitleSettings.animationDuration}s ease-out;
    }
    
    /* ⭐ CSS 애니메이션 keyframes */
    ${generateAnimationKeyframes()}
  </style>
</head>
<body>
  <!-- 배경 이미지 -->
  <img src="${scene.imageUrl}" class="background" />
  
  <!-- 제목 -->
  ${titleSettings.enabled ? `
  <div class="title" style="${getTitlePosition(titleSettings.position)}">
    ${scene.title}
  </div>
  ` : ''}
  
  <!-- 자막 -->
  ${subtitleSettings.enabled ? `
  <div class="subtitle" style="${getSubtitlePosition(subtitleSettings.position)}">
    ${scene.subtitle}
  </div>
  ` : ''}
</body>
</html>
  `;
}
```

---

### 3. CSS 애니메이션 (cssAnimations.js)

#### Keyframes 정의
```javascript
function generateAnimationKeyframes() {
  return `
    /* 1. slide-down (위→아래) */
    @keyframes slide-down {
      from {
        transform: translateY(-100px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    /* 2. slide-up (아래→위) */
    @keyframes slide-up {
      from {
        transform: translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    /* 3. slide-right (좌→우) */
    @keyframes slide-right {
      from {
        transform: translateX(-100px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    /* 4. slide-left (우→좌) */
    @keyframes slide-left {
      from {
        transform: translateX(100px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    /* 5. fade-in (페이드인) */
    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    /* 6. zoom-in (줌인) */
    @keyframes zoom-in {
      from {
        transform: scale(0.8);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    /* 7. typing (타이핑) */
    @keyframes typing {
      from {
        width: 0;
        opacity: 0;
      }
      to {
        width: 100%;
        opacity: 1;
      }
    }
  `;
}
```

---

## 🔧 구현 단계

### Phase 1: 기본 구조 (1-2일)
- [x] 아키텍처 설계
- [ ] Puppeteer 설치 및 환경 설정
- [ ] 기본 HTML 템플릿 작성
- [ ] 간단한 정적 렌더링 테스트

### Phase 2: 애니메이션 구현 (2-3일)
- [ ] CSS keyframes 모듈 구현
- [ ] 8가지 애니메이션 모두 구현
- [ ] animationDuration 동적 적용
- [ ] 애니메이션 테스트

### Phase 3: 통합 및 최적화 (2-3일)
- [ ] 기존 videoRenderer.js와 통합
- [ ] 프레임 캡처 최적화
- [ ] 메모리 관리 개선
- [ ] 병렬 처리 구현

### Phase 4: 테스트 및 배포 (1-2일)
- [ ] 전체 시스템 테스트
- [ ] 성능 벤치마크
- [ ] 문서화
- [ ] 프로덕션 배포

**전체 예상 기간**: 6-10일

---

## 📦 필요한 패키지

### Backend 의존성
```json
{
  "puppeteer": "^21.0.0",
  "puppeteer-core": "^21.0.0",
  "sharp": "^0.32.0",         // 이미지 처리
  "canvas": "^2.11.0",        // Canvas 지원
  "@napi-rs/canvas": "^0.1.0" // 네이티브 Canvas
}
```

### 시스템 요구사항
```bash
# Chromium 의존성 (Ubuntu/Debian)
sudo apt-get install -y \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2
```

---

## 🎨 최적화 전략

### 1. 프레임 캡처 최적화
```javascript
// 메모리 효율적인 스트리밍 방식
async function captureFramesOptimized(page, duration, fps) {
  const frameStream = fs.createWriteStream('frames_%04d.png');
  
  for (let i = 0; i < totalFrames; i++) {
    const screenshot = await page.screenshot();
    frameStream.write(screenshot);
    
    // 메모리 해제
    if (i % 100 === 0) {
      global.gc && global.gc();
    }
  }
}
```

### 2. 병렬 처리
```javascript
// 여러 장면을 동시에 렌더링
async function renderScenesParallel(scenes, settings) {
  const concurrency = 2; // 동시 2개 장면
  const queue = [...scenes];
  const results = [];
  
  while (queue.length > 0) {
    const batch = queue.splice(0, concurrency);
    const batchResults = await Promise.all(
      batch.map(scene => renderScene(scene, settings))
    );
    results.push(...batchResults);
  }
  
  return results;
}
```

### 3. 캐싱
```javascript
// HTML 템플릿 캐싱
const templateCache = new Map();

function getCachedTemplate(key, generator) {
  if (!templateCache.has(key)) {
    templateCache.set(key, generator());
  }
  return templateCache.get(key);
}
```

---

## 📊 예상 성능

### 렌더링 시간
| 항목 | 기존 (FFmpeg) | 신규 (Puppeteer) |
|------|--------------|------------------|
| 장면당 시간 | 2-3초 | 4-6초 |
| 10장면 영상 | 20-30초 | 40-60초 |
| CPU 사용률 | 70-80% | 80-90% |
| 메모리 | 500MB | 1-2GB |

### 품질 비교
| 항목 | 기존 | 신규 |
|------|------|------|
| 애니메이션 | ❌ | ✅ 완벽 |
| CSS 효과 | ❌ | ✅ 전부 |
| 프리뷰 일치 | ⚠️ 부분 | ✅ 100% |
| 유지보수 | ⚠️ 어려움 | ✅ 쉬움 |

---

## 🧪 테스트 계획

### 1. 단위 테스트
- [ ] HTML 템플릿 생성 테스트
- [ ] CSS 애니메이션 keyframes 테스트
- [ ] 프레임 캡처 테스트
- [ ] FFmpeg 인코딩 테스트

### 2. 통합 테스트
- [ ] 전체 장면 렌더링 테스트
- [ ] 다양한 설정 조합 테스트
- [ ] 오류 처리 테스트

### 3. 성능 테스트
- [ ] 렌더링 속도 벤치마크
- [ ] 메모리 사용량 측정
- [ ] 병렬 처리 효율성 테스트

---

## 📚 참고 자료

### Puppeteer
- [Puppeteer 공식 문서](https://pptr.dev/)
- [Puppeteer 스크린샷 가이드](https://pptr.dev/guides/screenshots)
- [Puppeteer 성능 최적화](https://pptr.dev/guides/configuration)

### FFmpeg
- [FFmpeg 이미지 시퀀스](https://trac.ffmpeg.org/wiki/Slideshow)
- [FFmpeg concat demuxer](https://ffmpeg.org/ffmpeg-formats.html#concat)

### CSS 애니메이션
- [MDN CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [CSS Animation Performance](https://web.dev/animations-guide/)

---

## ✅ 체크리스트

### 설계 단계 ✅
- [x] 아키텍처 설계
- [x] 모듈 구조 정의
- [x] API 인터페이스 설계
- [x] 최적화 전략 수립

### 구현 단계 (진행 예정)
- [ ] Puppeteer 설치
- [ ] HTML 템플릿 구현
- [ ] CSS 애니메이션 구현
- [ ] 렌더러 통합
- [ ] 테스트
- [ ] 최적화
- [ ] 배포

---

**다음 단계**: Puppeteer 설치 및 기본 환경 설정
