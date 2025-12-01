# Cloudflare Pages 캐시 퍼지 가이드

## 방법 1: Cloudflare Dashboard (수동)

### 1단계: Cloudflare Dashboard 접속
1. 브라우저에서 https://dash.cloudflare.com 접속
2. Cloudflare 계정으로 로그인

### 2단계: Pages 프로젝트 선택
1. 왼쪽 메뉴에서 **Workers & Pages** 클릭
2. **Pages** 탭 선택
3. 프로젝트 목록에서 **youtube-shorts-generator** 클릭

### 3단계: 최신 배포 확인
1. **Deployments** 탭 클릭
2. 최신 배포 확인 (Production 표시)
3. 배포 시간과 커밋 해시 확인

### 4단계: 캐시 퍼지 (Cache Purge)
**옵션 A - 프로젝트 전체 재배포 (권장)**
1. **Deployments** 탭에서 최신 배포 클릭
2. 우측 상단 **...** (점 3개) 메뉴 클릭
3. **Retry deployment** 선택
4. 2-3분 대기

**옵션 B - Cloudflare 사이트 캐시 퍼지**
1. Cloudflare Dashboard 메인으로 이동
2. **youtube-shorts-generator.pages.dev** 도메인 선택
3. **Caching** 탭 클릭
4. **Purge Cache** 버튼 클릭
5. **Purge Everything** 선택
6. 확인

### 5단계: 캐시 퍼지 확인
브라우저에서:
1. https://youtube-shorts-generator.pages.dev 접속
2. **Ctrl + Shift + R** (Windows) 또는 **Cmd + Shift + R** (Mac) - 강력 새로고침
3. 개발자 도구 열기 (F12)
4. Console 탭에서 로그 확인:
   - "🚀 App.js loaded" 메시지 확인
   - "Version: 1.0.1" 또는 그 이상 버전 확인

---

## 방법 2: Wrangler CLI (자동)

이미 설정되어 있으므로 바로 실행 가능합니다:

```bash
cd /home/user/youtube-shorts-final
npx wrangler pages deployment create youtube-shorts-generator
```

---

## 캐시가 업데이트되었는지 확인하는 방법

### 브라우저에서 확인:
1. https://youtube-shorts-generator.pages.dev 접속
2. F12 눌러서 개발자 도구 열기
3. Console 탭 확인
4. 다음 메시지가 보이면 성공:
   ```
   ✅ Loaded background images: 3
   ✅ Loaded background music: 2
   ```

### curl로 확인:
```bash
curl -s https://youtube-shorts-generator.pages.dev/static/app.js | head -5
```

출력에 "Version: 1.0.1" 또는 "Force update v1.0.2"가 보이면 성공!

---

## 문제 해결

### 여전히 구버전이 보이는 경우:

1. **브라우저 캐시 삭제**
   - Chrome: Ctrl + Shift + Delete → "캐시된 이미지 및 파일" 선택
   - 또는 시크릿 모드에서 테스트

2. **DNS 캐시 플러시**
   - Windows: `ipconfig /flushdns`
   - Mac: `sudo dscacheutil -flushcache`

3. **다른 브라우저에서 테스트**
   - Firefox, Safari, Edge 등

4. **모바일 데이터로 테스트**
   - WiFi 대신 모바일 데이터 사용

---

## 예상 소요 시간

- Retry deployment: 2-3분
- Cache purge: 5-10분
- 전체 CDN 업데이트: 10-30분

---

## 도움이 필요하시면

캐시 퍼지 후에도 문제가 지속되면 알려주세요!
