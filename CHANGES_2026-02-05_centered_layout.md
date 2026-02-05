# 레이아웃 중앙 정렬 - 설정 패널 중앙 배치

**작성자**: GenSpark AI Developer  
**작성일**: 2026-02-05 11:57 KST  
**버전**: v2.1.2

---

## 📋 문제점

### 증상
- 설정 패널이 **왼쪽에 치우쳐 있음**
- 미리보기가 오른쪽 끝에 붙어 있음
- 사용자 요구: **설정 패널이 화면 중앙에 있고**, 미리보기가 그 옆에 따라다녀야 함

### Before (문제 상황)
```
[설정 패널 50%                    ][빈공간][미리보기 30%]
```
- 설정 패널이 왼쪽부터 시작
- 미리보기가 오른쪽 끝에 위치
- 중앙 정렬이 아님

---

## ✅ 해결 방법

### 변경 사항
**파일**: `/home/shorts/frontend/src/pages/ShortsSettingsPage.jsx`

#### 1. 메인 컨테이너 중앙 정렬
```jsx
// Before
<div className="flex gap-6 max-w-7xl mx-auto">

// After
<div className="flex gap-6 justify-center items-start px-8">
```

**설명**:
- `justify-center`: 자식 요소들을 가로 중앙 정렬
- `items-start`: 상단 정렬 유지
- `px-8`: 좌우 여백 추가

#### 2. 설정 패널 고정 너비
```jsx
// Before
<div className="flex-1 max-w-[50%] space-y-6">

// After
<div className="w-[600px] space-y-6">
```

**설명**:
- `w-[600px]`: 600px 고정 너비 (중앙 배치)
- 더 이상 flex-1이 아니므로 중앙에 위치

#### 3. 미리보기 크기 조정
```jsx
// Before
<div className="w-[30%] shrink-0 sticky top-8 self-start">

// After
<div className="w-[360px] shrink-0 sticky top-8 self-start">
```

**설명**:
- `w-[360px]`: 360px 고정 너비 (9:16 비율에 적합)
- `sticky top-8`: 스크롤 시 따라다님

---

## 🎯 적용 결과

### After (정상 작동)
```
        [설정 패널 600px][미리보기 360px]
```
- ✅ 설정 패널이 화면 중앙에 위치
- ✅ 미리보기가 설정 패널 바로 옆에 위치
- ✅ 전체 레이아웃이 중앙 정렬
- ✅ Sticky 스크롤 유지

---

## 🧪 테스트 방법

### 1. 중앙 정렬 확인
1. https://shorts.neuralgrid.kr/shorts-settings 접속
2. **설정 패널이 화면 중앙**에 위치하는지 확인
3. **미리보기가 설정 패널 바로 옆**에 붙어 있는지 확인

### 2. Sticky 스크롤 테스트
1. 페이지를 천천히 스크롤
2. **미리보기가 설정 패널 옆에서 따라다님** 확인

### 3. 다양한 화면 크기 테스트
- 1920px 이상: 중앙 정렬 유지
- 1280px~1920px: 중앙 정렬 유지
- 1280px 이하: 자연스럽게 축소

---

## 📦 배포 정보

### 프론트엔드
- **빌드 자산**: `index-Cn4q_JjX.js`
- **배포 시각**: 2026-02-05 11:57 KST
- **빌드 시간**: ~1.80초
- **빌드 크기**: 553.92 kB (gzip: 160.12 kB)

### 변경 파일
- `/home/shorts/frontend/src/pages/ShortsSettingsPage.jsx`
  - Line 680: 중앙 정렬 컨테이너
  - Line 683: 설정 패널 600px 고정
  - Line 1849: 미리보기 360px 고정

### 서비스 URL
- **설정 페이지**: https://shorts.neuralgrid.kr/shorts-settings

---

## 🔍 기술 세부사항

### 중앙 정렬 원리
```jsx
<div className="flex gap-6 justify-center items-start px-8">
  <div className="w-[600px]">설정 패널</div>
  <div className="w-[360px] sticky">미리보기</div>
</div>
```

**작동 방식**:
1. `justify-center`: 부모 컨테이너가 자식들을 중앙 정렬
2. `w-[600px]` + `w-[360px]` = 960px 고정 너비
3. 브라우저 너비가 1200px라면 좌우에 각각 120px 여백
4. Sticky는 그대로 유지되며 스크롤 시 따라다님

### 반응형 고려
- **1920px 이상**: 중앙에 960px 레이아웃, 좌우 여백 넓음
- **1280px~1920px**: 중앙 정렬 유지, 적절한 여백
- **1280px 이하**: 자동으로 축소 (향후 미디어 쿼리 추가 가능)

---

## ✅ 체크리스트

- [x] 설정 패널 중앙 배치
- [x] 미리보기가 설정 패널 옆에 위치
- [x] Sticky 스크롤 정상 작동
- [x] 전체 레이아웃 중앙 정렬
- [x] 실시간 미리보기 정상 작동
- [x] 빌드 성공 및 배포 완료

---

## 🎉 최종 결과

### Before
- ❌ 설정 패널이 왼쪽에 치우침
- ❌ 미리보기가 오른쪽 끝에 위치
- ❌ 중앙 정렬 아님

### After
- ✅ 설정 패널이 화면 중앙에 위치
- ✅ 미리보기가 설정 패널 바로 옆에 위치
- ✅ 전체 레이아웃 중앙 정렬
- ✅ Sticky 스크롤로 미리보기가 따라다님

**테스트 URL**: https://shorts.neuralgrid.kr/shorts-settings

🚀 **이제 설정 패널이 화면 중앙에 있고, 미리보기가 옆에서 따라다닙니다!**
