# 브라우저 캐시 완전 제거 가이드

## ✅ 배포 확인 완료

서버에 올바른 코드가 배포되어 있습니다:
- ✅ `flex flex-row gap-8` - 가로 배치
- ✅ `w-[700px]` - 설정 패널 고정 너비
- ✅ `w-[380px]` - 미리보기 고정 너비

**배포된 파일**: `index-C6pPfFYP.js` (2026-02-05 13:22 KST)

## 🔴 문제: 브라우저 캐시

브라우저가 이전 버전의 JS/CSS 파일을 캐싱하고 있습니다.

## ✅ 해결 방법 (순서대로 시도)

### 방법 1: 시크릿 모드 (가장 확실) ⭐

**Chrome**:
```
1. Ctrl + Shift + N (Windows)
2. Cmd + Shift + N (Mac)
3. https://shorts.neuralgrid.kr/shorts-settings 접속
```

**Firefox**:
```
1. Ctrl + Shift + P (Windows)
2. Cmd + Shift + P (Mac)
3. https://shorts.neuralgrid.kr/shorts-settings 접속
```

### 방법 2: 개발자 도구로 캐시 비활성화

```
1. F12 (개발자 도구 열기)
2. Network 탭 클릭
3. "Disable cache" 체크박스 선택
4. F5 (새로고침)
```

### 방법 3: 하드 리프레시

**Windows**:
```
Ctrl + Shift + R
또는
Ctrl + F5
```

**Mac**:
```
Cmd + Shift + R
```

### 방법 4: 캐시 완전 삭제

**Chrome**:
```
1. Ctrl/Cmd + Shift + Delete
2. "고급" 탭 선택
3. 기간: "전체 기간" 선택
4. 체크:
   ✓ 쿠키 및 기타 사이트 데이터
   ✓ 캐시된 이미지 및 파일
5. "데이터 삭제" 클릭
6. 브라우저 완전히 종료
7. 브라우저 다시 시작
8. https://shorts.neuralgrid.kr/shorts-settings 접속
```

**Firefox**:
```
1. Ctrl/Cmd + Shift + Delete
2. 삭제 기간: "모두" 선택
3. 체크:
   ✓ 쿠키
   ✓ 캐시
4. "지금 삭제" 클릭
5. 브라우저 재시작
6. https://shorts.neuralgrid.kr/shorts-settings 접속
```

### 방법 5: 다른 브라우저로 테스트

현재 Chrome 사용 중이라면:
- Firefox 설치 후 테스트
- Edge로 테스트
- Safari로 테스트 (Mac)

## 🧪 올바른 화면 확인 방법

### ✅ 예상되는 화면 (1920x1080)

```
┌──────────────────────────────────────────────┐
│                                              │
│   [   여백   ]  [설정 700px]  [미리보기 380px]  [   여백   ]  │
│                     ↓               ↓         │
│                 왼쪽에 위치    오른쪽에 위치    │
│                 (제목설정)     (9:16 preview)  │
│                 (자막설정)     (sticky)       │
│                                              │
└──────────────────────────────────────────────┘
```

### 브라우저 개발자 도구로 확인

```
1. F12 (개발자 도구)
2. Elements 탭
3. Settings Cards를 찾기
4. 다음을 확인:
   - 부모 div: class="flex flex-row gap-8..."
   - 왼쪽 div: class="w-[700px]..."
   - 오른쪽 div: class="w-[380px]..."
```

## 🔍 현재 로드된 파일 확인

```
1. F12
2. Network 탭
3. 페이지 새로고침
4. index-로 시작하는 파일 찾기
5. 다음 파일이어야 함:
   - index-C6pPfFYP.js
   - index-CTdskY8P.css
```

만약 다른 파일명이 보인다면 → 캐시 문제

## 📱 모바일에서 테스트

```
1. Chrome DevTools (F12)
2. Ctrl + Shift + M (Device Toolbar)
3. 상단에서 "Responsive" 선택
4. 너비를 1920px로 설정
5. 높이를 1080px로 설정
6. 레이아웃 확인
```

## ❗ 여전히 안 될 경우

1. **스크린샷 제공**:
   - F12 → Elements 탭 열린 상태
   - Settings Cards 부분 확장
   - className 부분이 보이도록
   
2. **Console 확인**:
   - F12 → Console 탭
   - 에러 메시지 확인
   
3. **Network 확인**:
   - F12 → Network 탭
   - 로드된 JS 파일명 확인

---

**테스트 URL**: https://shorts.neuralgrid.kr/shorts-settings

**배포 시각**: 2026-02-05 13:22 KST

**배포 파일**: 
- JS: index-C6pPfFYP.js (555.67 kB)
- CSS: index-CTdskY8P.css (46.27 kB)
