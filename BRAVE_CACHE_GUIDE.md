# 브레이브 브라우저 캐시 완전 제거 가이드

## 🦁 브레이브 브라우저 특징

브레이브는 **강력한 캐싱**과 **추적 차단** 기능이 있어서 일반적인 새로고침으로는 캐시가 제거되지 않을 수 있습니다.

## ✅ 해결 방법 (브레이브 전용)

### 방법 1: 브레이브 프라이빗 창 (가장 확실) ⭐⭐⭐

```
Windows: Ctrl + Shift + N
Mac: Cmd + Shift + N

→ https://shorts.neuralgrid.kr/shorts-settings 접속
```

**이 방법이 가장 확실합니다!**

### 방법 2: 브레이브 Shields 비활성화 + 하드 리프레시

```
1. https://shorts.neuralgrid.kr/shorts-settings 접속
2. 주소창 왼쪽의 🦁 (Shields) 아이콘 클릭
3. "Shields down for this site" 클릭
4. Ctrl + Shift + R (하드 리프레시)
```

### 방법 3: 브레이브 Site Settings 초기화

```
1. https://shorts.neuralgrid.kr/shorts-settings 접속
2. 주소창 왼쪽의 자물쇠 🔒 아이콘 클릭
3. "Site settings" 클릭
4. 맨 아래 "Clear data" 클릭
5. 페이지 새로고침
```

### 방법 4: 브레이브 캐시 완전 삭제

```
1. Ctrl/Cmd + Shift + Delete
   (또는 ≡ 메뉴 → 설정 → 개인정보 및 보안)

2. 시간 범위: "전체" 선택

3. 다음 체크:
   ✓ 인터넷 사용 기록
   ✓ 다운로드 기록  
   ✓ 쿠키 및 기타 사이트 데이터
   ✓ 캐시된 이미지 및 파일

4. "인터넷 사용 기록 삭제" 클릭

5. 브레이브 완전히 종료 (모든 창)

6. 브레이브 다시 시작

7. https://shorts.neuralgrid.kr/shorts-settings 접속
```

### 방법 5: 브레이브 강제 새로고침

```
Windows:
- Ctrl + F5
- Ctrl + Shift + R

Mac:
- Cmd + Shift + R
```

### 방법 6: 개발자 도구 캐시 비활성화

```
1. F12 (개발자 도구)
2. Network 탭 클릭
3. "Disable cache" 체크
4. 개발자 도구를 열어둔 채로 F5 새로고침
```

## 🎯 브레이브에서 확인하는 방법

### 1단계: 프라이빗 창으로 접속
```
Ctrl + Shift + N → https://shorts.neuralgrid.kr/shorts-settings
```

### 2단계: F12로 확인
```
1. F12 (개발자 도구)
2. Elements 탭
3. Ctrl+F로 "flex flex-row" 검색
4. 다음과 같아야 함:
   <div class="flex flex-row gap-8 justify-center items-start mx-auto">
```

### 3단계: Network 탭 확인
```
1. F12 → Network 탭
2. Ctrl+R (새로고침)
3. "index-" 로 필터링
4. 다음 파일이 로드되어야 함:
   - index-C6pPfFYP.js
   - index-CTdskY8P.css
```

## 🔍 올바른 화면 (1920x1080)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│    [여백]   [설정 패널 700px]   [미리보기 380px]   [여백]    │
│                    ↓                    ↓           │
│               왼쪽 중앙            오른쪽 고정       │
│                                                     │
│             • 제목 스타일          📱 실시간         │
│             • 자막 스타일          미리보기          │
│             • 애니메이션           (9:16)           │
│             • 배경 설정            (sticky)         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## ⚠️ 브레이브 특수 기능 주의사항

### Shields (방패) 기능
브레이브의 Shields가 활성화되어 있으면:
- JavaScript가 차단될 수 있음
- 캐시가 더 강하게 유지됨

**해결**: Shields를 일시적으로 비활성화

### Aggressive 모드
브레이브를 "Aggressive" 모드로 설정했다면:
- 더 많은 스크립트가 차단됨
- 캐시가 더욱 강력함

**해결**: 
```
brave://settings/shields
→ Trackers & ads blocking: Standard로 변경
```

## 🧪 테스트 스크립트 (브레이브 Console)

프라이빗 창에서:
```
1. https://shorts.neuralgrid.kr/shorts-settings 접속
2. F12 → Console 탭
3. 다음 입력:

document.querySelectorAll('[class*="flex-row"]').length > 0

결과가 true면 → 정상
결과가 false면 → 여전히 캐시 문제
```

## 📱 브레이브 모바일 (참고)

혹시 브레이브 모바일을 사용 중이라면:
```
1. ⋮ (메뉴) → New Private Tab
2. https://shorts.neuralgrid.kr/shorts-settings 접속
```

## 🆘 여전히 안 될 경우

1. **브레이브 버전 확인**:
   ```
   brave://version
   ```
   최신 버전인지 확인

2. **다른 브라우저로 테스트**:
   - Chrome (Chromium 기반이므로 비교 가능)
   - Firefox
   - Edge

3. **브레이브 프로필 새로 만들기**:
   ```
   1. 브레이브 설정 → 프로필
   2. 새 프로필 추가
   3. 새 프로필로 테스트
   ```

4. **브레이브 재설치** (최후의 수단):
   ```
   1. 브레이브 완전 삭제
   2. 설정 폴더도 삭제:
      Windows: %LOCALAPPDATA%\BraveSoftware
      Mac: ~/Library/Application Support/BraveSoftware
   3. 재설치
   ```

## ✅ 가장 확실한 방법 요약

```
1️⃣ Ctrl + Shift + N (프라이빗 창)
2️⃣ https://shorts.neuralgrid.kr/shorts-settings 접속
3️⃣ F12 → Elements에서 "flex flex-row" 확인
```

**이 방법으로 안 보인다면**:
- 스크린샷 공유 (F12 → Elements 탭 포함)
- Console 탭의 에러 메시지 공유

---

**배포 확인됨**: 
- 파일: index-C6pPfFYP.js
- 배포: 2026-02-05 13:22 KST
- 상태: ✅ 서버 정상

**테스트 URL**: https://shorts.neuralgrid.kr/shorts-settings
