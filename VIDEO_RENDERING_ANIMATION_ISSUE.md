# 🚨 영상 렌더링 애니메이션 미적용 이슈

## 📅 발견 날짜
2026-02-05 18:00 KST

## 🎯 문제 상황

### 사용자 보고
- 설정 페이지에서 제목/자막 애니메이션을 설정해도 **실제 생성된 영상에 반영되지 않음**
- 제목 설정도 영상에 제대로 반영되지 않음
- 자막 움직임(애니메이션)이 반영되지 않음

### 근본 원인 분석

#### 1. Frontend → Backend 전달은 정상 ✅
**파일**: `ShortsGeneratePage.jsx` (수정 완료)
```javascript
titleStyle: {
  // ... 기본 속성 ...
  animation: 'none',        // ✅ 전달됨
  animationDuration: 2.0    // ✅ 전달됨
},
subtitle: {
  // ... 기본 속성 ...
  animation: 'none',        // ✅ 전달됨
  animationDuration: 2.0    // ✅ 전달됨
}
```

#### 2. Backend API 수신 정상 ✅
**파일**: `/home/shorts/backend/src/routes/video.js`
- `settings.titleStyle` → `settings.titleSettings` 매핑 확인
- `settings.subtitle` → `settings.subtitleSettings` 매핑 확인

#### 3. VideoRenderer 전달 정상 ✅
**파일**: `/home/shorts/backend/src/utils/videoRenderer.js` (라인 698-713)
```javascript
// 매핑 로직 존재
if (!settings.titleSettings && settings.titleStyle) {
  settings.titleSettings = settings.titleStyle;
}
if (!settings.subtitleSettings && settings.subtitle) {
  settings.subtitleSettings = settings.subtitle;
}
```

#### 4. 🚨 렌더링 로직에서 애니메이션 미사용 ❌

**문제**: FFmpeg의 `drawtext` 필터만 사용
- `createTitleFilter()` - 라인 414~
- `createSubtitleFilter()` - 라인 274~

**현재 구조**:
```javascript
createSubtitleFilter(text, settings = {}) {
  const {
    fontFamily = 'NanumGothicBold',
    fontSize = 56,
    color,
    position = 'center',
    strokeWidth,
    strokeColor,
    charsPerLine = 15,
    maxLines = 2
    // ❌ animation 없음!
    // ❌ animationDuration 없음!
  } = settings;
  
  // ... FFmpeg drawtext 필터 생성 ...
  return `drawtext=text='${text}':fontfile=${fontPath}:...`;
}
```

---

## 🔍 기술적 제약사항

### FFmpeg drawtext 필터의 한계
1. **정적 텍스트만 지원**
   - 텍스트 위치, 색상, 크기는 고정
   - CSS 애니메이션 같은 동적 효과 불가능

2. **애니메이션 불가**
   - `slide-down`, `fade-in`, `zoom-in` 등의 효과 구현 불가
   - 타이밍 함수(ease, ease-in-out) 불가
   - keyframe 애니메이션 불가

3. **FFmpeg 애니메이션 구현 방법**
   - `overlay` 필터로 프레임별 위치 변경
   - `fade` 필터로 페이드 효과
   - 복잡한 수학 표현식 필요
   - 성능 영향 큼

---

## 💡 해결 방안

### 방안 1: FFmpeg 애니메이션 구현 (복잡)
**장점**:
- 기존 시스템 유지
- 백엔드만 수정

**단점**:
- 매우 복잡한 구현
- 각 애니메이션마다 별도 로직 필요
- 성능 저하 가능성
- 유지보수 어려움

**예시 코드** (fade-in):
```javascript
if (animation === 'fade-in') {
  // fade 필터 사용
  filter += `,fade=t=in:st=0:d=${animationDuration}`;
}
```

**예시 코드** (slide-down):
```javascript
if (animation === 'slide-down') {
  // y 좌표를 시간에 따라 변경
  const startY = 'h-1920';  // 화면 밖 위쪽
  const endY = `h-${yOffset}`;
  filter += `:y='if(lt(t,${animationDuration}),${startY}+(${endY}-${startY})*t/${animationDuration},${endY})'`;
}
```

### 방안 2: HTML/Canvas 기반 렌더링으로 전환 (권장)
**장점**:
- CSS 애니메이션 그대로 사용 가능
- 복잡한 효과 구현 쉬움
- 미리보기와 동일한 결과
- 유지보수 쉬움

**단점**:
- 큰 시스템 변경 필요
- 개발 시간 소요

**사용 가능한 도구**:
1. **Puppeteer** (추천)
   - HTML → 비디오 캡처
   - CSS 애니메이션 완벽 지원
   - 프리뷰와 동일한 렌더링

2. **Remotion**
   - React 기반 비디오 생성
   - CSS-in-JS 지원
   - 타임라인 관리 쉬움

3. **Canvas + FFmpeg**
   - Node.js canvas로 프레임 생성
   - FFmpeg로 인코딩

### 방안 3: 기본 애니메이션만 구현 (절충안)
**장점**:
- 빠른 구현
- 핵심 기능만 지원

**단점**:
- 일부 애니메이션만 가능
- 품질 제한

**구현 가능한 애니메이션**:
- ✅ `fade-in`: FFmpeg `fade` 필터
- ✅ `slide-down`: drawtext y 좌표 애니메이션
- ✅ `slide-up`: drawtext y 좌표 애니메이션
- ⚠️ `zoom-in`: 복잡 (fontsize 변경)
- ❌ `typing`: 거의 불가능

---

## 📋 현재 상태 요약

| 단계 | 상태 | 비고 |
|------|------|------|
| Frontend 설정 UI | ✅ | 8가지 효과, 5단계 속도 |
| Frontend → Backend 전달 | ✅ | animation, animationDuration 포함 |
| Backend API 수신 | ✅ | settings.titleStyle, settings.subtitle |
| VideoRenderer 매핑 | ✅ | titleSettings, subtitleSettings |
| **렌더링 로직 적용** | ❌ | **애니메이션 미구현** |

**적용률**: 80% (렌더링 제외)

---

## 🚀 권장 조치

### 단기 (지금 당장)
1. **사용자에게 상황 설명**
   - 설정은 저장되지만 영상에는 아직 미반영
   - 기술적 제약 설명

2. **기본 애니메이션 2-3개만 구현** (선택)
   - `fade-in`: 가장 쉬움
   - `slide-down`, `slide-up`: 중간 난이도
   - 나머지는 "준비 중" 표시

### 중기 (1-2주)
1. **HTML 기반 렌더링으로 전환**
   - Puppeteer 도입
   - 미리보기와 동일한 렌더링
   - 모든 CSS 애니메이션 지원

2. **테스트 및 최적화**
   - 성능 튜닝
   - 품질 검증

### 장기
1. **고급 효과 추가**
   - 커스텀 애니메이션
   - 트랜지션 효과
   - 파티클 효과

---

## 💬 사용자 커뮤니케이션 예시

```
안녕하세요!

현재 영상 생성 시 애니메이션 설정이 반영되지 않는 이슈를 확인했습니다.

📋 원인:
- 설정 전달은 정상이지만, 영상 렌더링 엔진(FFmpeg)이 
  CSS 스타일의 애니메이션을 지원하지 않습니다.

🔧 해결 방안:
1. 단기: 기본 애니메이션 2-3개만 우선 구현
2. 중기: HTML 기반 렌더링으로 전환 (완벽한 애니메이션 지원)

📅 예상 일정:
- 기본 fade-in: 1-2일
- 전체 애니메이션 지원: 1-2주

현재는 설정이 저장되지만 영상에는 아직 반영되지 않는 점 
양해 부탁드립니다.
```

---

## 📚 참고 자료

### FFmpeg 애니메이션 예시
- [FFmpeg drawtext 공식 문서](https://ffmpeg.org/ffmpeg-filters.html#drawtext)
- [FFmpeg overlay 애니메이션](https://trac.ffmpeg.org/wiki/FilteringGuide)

### HTML 기반 렌더링
- [Puppeteer](https://pptr.dev/)
- [Remotion](https://www.remotion.dev/)
- [node-canvas](https://github.com/Automattic/node-canvas)

---

**결론**: 설정은 완벽하게 전달되지만, 렌더링 단계에서 애니메이션이 구현되지 않았습니다. 
HTML 기반 렌더링으로 전환하는 것을 강력히 권장합니다.
