# 영상 생성 시 제목/자막 설정 반영 수정

**작성자**: GenSpark AI Developer  
**작성일**: 2026-02-05 11:28 KST  
**버전**: v2.1.0

---

## 📋 문제점

### 증상
- ShortsSettings 페이지에서 설정한 제목/자막 스타일이 미리보기에는 반영되었지만
- 실제 영상 생성(`/shorts-generate`)을 하면 설정이 반영되지 않음

### 원인 분석
1. **키 이름 불일치**
   - 프론트엔드: `titleStyle`, `subtitle`
   - 백엔드: `titleSettings`, `subtitleSettings`

2. **장면 데이터 구조 문제**
   - 장면 데이터에는 `narration`만 있고 `title`이나 `subtitle`이 없음
   - 백엔드는 `scene.title`과 `scene.subtitle`을 기대함

---

## ✅ 해결 방법

### 1단계: 호환성 매핑 추가
**파일**: `/home/shorts/backend/src/utils/videoRenderer.js`  
**위치**: `createSceneVideo()` 함수 시작 부분

```javascript
// 프론트엔드 호환성: titleStyle → titleSettings, subtitle → subtitleSettings
if (!settings.titleSettings && settings.titleStyle) {
  console.log('🔄 titleStyle → titleSettings 매핑');
  settings.titleSettings = settings.titleStyle;
}
if (!settings.subtitleSettings && settings.subtitle) {
  console.log('🔄 subtitle → subtitleSettings 매핑');
  settings.subtitleSettings = settings.subtitle;
}
```

### 2단계: 장면 제목/자막 자동 생성
**파일**: `/home/shorts/backend/src/utils/videoRenderer.js`  
**위치**: `createSceneVideo()` 함수 중간 부분

```javascript
// 장면에 title/subtitle이 없으면 narration에서 자동 생성
if (!scene.title && scene.narration && settings.titleSettings?.enabled) {
  console.log('🔄 narration → scene.title 매핑');
  scene.title = scene.narration;
}
if (!scene.subtitle && scene.narration && settings.subtitleSettings?.enabled) {
  console.log('🔄 narration → scene.subtitle 매핑');
  scene.subtitle = scene.narration;
}
```

---

## 🎯 적용된 설정 항목

### 제목 설정 (titleStyle → titleSettings)
- ✅ `enabled`: 제목 표시 여부
- ✅ `position`: 위치 (top/center/bottom)
- ✅ `fontSize`: 폰트 크기
- ✅ `fontFamily`: 폰트 종류
- ✅ `color`: 텍스트 색상
- ✅ `strokeWidth`: 테두리 두께
- ✅ `strokeColor`: 테두리 색상
- ✅ `maxChars`: 최대 글자 수
- ⚠️ `animation`: 애니메이션 효과 (미리보기만 지원)
- ⚠️ `animationDuration`: 애니메이션 속도 (미리보기만 지원)

### 자막 설정 (subtitle → subtitleSettings)
- ✅ `enabled`: 자막 표시 여부
- ✅ `position`: 위치 (top/center/bottom)
- ✅ `fontSize`: 폰트 크기
- ✅ `fontFamily`: 폰트 종류
- ✅ `color`: 텍스트 색상
- ✅ `strokeWidth`: 테두리 두께
- ✅ `strokeColor`: 테두리 색상
- ✅ `maxLines`: 최대 줄 수
- ✅ `charsPerLine`: 줄당 글자 수
- ⚠️ `animation`: 애니메이션 효과 (미리보기만 지원)
- ⚠️ `animationDuration`: 애니메이션 속도 (미리보기만 지원)

---

## 🚨 제한 사항

### 애니메이션 효과
- **미리보기**: CSS 애니메이션 8종 지원 (slide-down, slide-up, fade-in, zoom-in, typing 등)
- **실제 영상**: FFmpeg의 `drawtext` 필터를 사용하므로 **정적 텍스트만 지원**
- **해결 방법**: 향후 FFmpeg 스크립트로 애니메이션을 구현하거나, 별도 렌더링 라이브러리 사용 필요

---

## 🧪 테스트 방법

### 1. 설정 페이지에서 테스트
1. https://shorts.neuralgrid.kr/shorts-settings 접속
2. 제목 설정:
   - 제목 표시: ON
   - 위치: 상단
   - 폰트 크기: 80px
   - 색상: 노란색 (#FFFF00)
   - 테두리: 6px, 검정색
3. 자막 설정:
   - 자막 표시: ON
   - 위치: 중앙
   - 폰트 크기: 64px
   - 색상: 흰색
   - 테두리: 4px, 검정색
4. 미리보기에서 즉시 반영 확인 ✅

### 2. 영상 생성에서 테스트
1. https://shorts.neuralgrid.kr/shorts-generate 접속
2. 영상 생성 실행
3. 생성된 영상 재생:
   - 제목이 **상단**에 **노란색**으로 표시 ✅
   - 자막이 **중앙**에 **흰색**으로 표시 ✅
   - 폰트 크기와 테두리 적용 ✅

---

## 📊 배포 정보

### 프론트엔드
- **변경사항**: 없음 (이미 배포됨)
- **빌드 자산**: `index-TMUYJShz.js`
- **배포 시각**: 2026-02-05 01:18 KST

### 백엔드
- **변경사항**: `videoRenderer.js` (호환성 매핑 + 장면 데이터 자동 생성)
- **배포 시각**: 2026-02-05 11:28 KST
- **재시작**: ✅ 완료

### 서비스 URL
- **프론트엔드**: https://shorts.neuralgrid.kr
- **설정 페이지**: https://shorts.neuralgrid.kr/shorts-settings
- **생성 페이지**: https://shorts.neuralgrid.kr/shorts-generate

---

## 🎉 최종 결과

### Before (문제 발생)
- ❌ 설정 페이지에서 설정을 변경해도 영상 생성 시 반영 안 됨
- ❌ 제목과 자막이 기본값으로만 표시
- ❌ 키 이름 불일치로 설정이 전달되지 않음

### After (해결 완료)
- ✅ 설정 페이지의 모든 설정이 영상 생성에 정확히 반영
- ✅ 제목과 자막을 독립적으로 제어 가능
- ✅ 위치, 크기, 색상, 테두리 모두 적용
- ✅ 하위 호환성 유지 (기존 설정 유지)
- ⚠️ 애니메이션은 미리보기에서만 작동 (FFmpeg 제한)

---

## 🔍 참고 사항

### 관련 파일
- `/home/shorts/backend/src/utils/videoRenderer.js`: 비디오 렌더링 핵심 로직
- `/home/shorts/frontend/src/pages/ShortsSettingsPage.jsx`: 설정 UI
- `/home/shorts/frontend/src/pages/ShortsGeneratePage.jsx`: 생성 페이지

### 관련 커밋
- `feat: ShortsSettings 완전 개선 + 영상 생성 연동`
- `fix: 영상 생성 시 제목/자막 설정 반영 수정`

### 변경 로그
- `CHANGES_2026-02-05.md`
- `CHANGES_2026-02-05_subtitle_animations.md`
- `CHANGES_2026-02-05_layout_improvements.md`
- `CHANGES_2026-02-05_video_generation_fix.md` (현재 문서)
