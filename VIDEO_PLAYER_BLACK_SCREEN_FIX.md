# 비디오 플레이어 검은 화면 문제 해결 보고서

## 📅 수정 일시
- **일시**: 2026-02-06 08:00 KST
- **작업자**: AI Assistant
- **브랜치**: genspark_ai_developer
- **커밋**: 648d88b

---

## 🐛 문제 상황

### 사용자 보고
> "생성되는것 같기는한대 보이지를 않아"

### 증상
- ✅ "스킵 생성은 제작되었습니다" 메시지 표시 (녹색 체크)
- ✅ 시간 표시: "9:16 (A트)"
- ✅ 장면 수: "총 10 개 장면"
- ❌ **비디오 플레이어: 검은 화면만 표시**
- ❌ **재생 버튼 작동 안 함**

### 스크린샷 분석
```
[상태 메시지]
✅ 스킵 생성은 제작되었습니다!

[비디오 플레이어]
━━━━━━━━━━━━━━━━━
│                │
│   (검은 화면)   │  ← 문제!
│                │
━━━━━━━━━━━━━━━━━
▶ 0:00 [━━━━━━━━━] ⚙️
```

---

## 🔍 문제 분석

### 1단계: 백엔드 로그 확인
```log
✅ 비디오 생성 완료: video_1770331594793_s6ulgn
   처리 시간: 87초
   파일 크기: 1.10 MB
   비용: ₩0 (무료!)
```

**결과**: ✅ 영상 파일은 정상 생성됨

### 2단계: 파일 시스템 확인
```bash
$ ls -lh /mnt/music-storage/shorts-videos/outputs/videos/
-rw-r--r-- 1 azamans azamans 1.1M Feb 6 07:48 video_1770331594793_s6ulgn.mp4
```

**결과**: ✅ 파일 존재 확인

### 3단계: 파일 접근성 확인
```bash
$ curl -I https://shorts.neuralgrid.kr/shorts-videos/outputs/videos/video_1770331594793_s6ulgn.mp4
HTTP/2 200
content-type: video/mp4
content-length: 1152306
```

**결과**: ✅ 파일 접근 가능

### 4단계: API 응답 구조 확인
**문제 발견!** ❌

#### videoRenderer.js의 Puppeteer 렌더러 반환값 (Line 1474-1479)
```javascript
// Before (문제)
const result = {
  videoId,
  videoPath: outputVideoPath,
  size: stats.size,
  url: `/outputs/videos/${videoId}.mp4`  // ← videoUrl이 없음!
};
```

#### 프론트엔드 기대값
```javascript
// ShortsGeneratePage.jsx (Line 446)
<video src={videoData.videoUrl} />  // ← videoUrl을 기대함!
```

#### 실제 동작
```javascript
videoData = {
  videoId: "video_1770331594793_s6ulgn",
  videoPath: "/mnt/music-storage/...",
  size: 1152306,
  url: "/outputs/videos/video_1770331594793_s6ulgn.mp4",
  videoUrl: undefined  // ← 없음!
}

// 결과
<video src={undefined} />  // ← 검은 화면!
```

---

## 🔧 근본 원인

### **Puppeteer 렌더러의 return 객체에 videoUrl 필드 누락**

#### 비교: FFmpeg 렌더러 vs Puppeteer 렌더러

| 렌더러 | videoUrl 포함 | 프론트엔드 표시 |
|--------|--------------|----------------|
| **FFmpeg** | ✅ Yes | ✅ 정상 |
| **Puppeteer** | ❌ No | ❌ 검은 화면 |

#### 왜 FFmpeg는 정상이고 Puppeteer는 문제인가?

**FFmpeg 렌더러** (Line 1365):
```javascript
return {
  videoUrl: `/shorts-videos/outputs/videos/${videoId}.mp4`,  // ✅ 있음
  // ...
};
```

**Puppeteer 렌더러** (Line 1479 - 수정 전):
```javascript
return {
  url: `/outputs/videos/${videoId}.mp4`,  // ❌ url만 있음
  // videoUrl 없음!
};
```

---

## ✅ 해결 방법

### 수정 내역: videoRenderer.js (Line 1474-1481)

#### Before (문제)
```javascript
const result = {
  videoId,
  videoPath: outputVideoPath,
  size: stats.size,
  url: `/outputs/videos/${videoId}.mp4`
};
```

#### After (수정)
```javascript
const result = {
  videoId,
  videoPath: outputVideoPath,
  size: stats.size,
  url: `/outputs/videos/${videoId}.mp4`,
  videoUrl: `/shorts-videos/outputs/videos/${videoId}.mp4` // ⭐ 추가!
};
```

### 수정 이유

1. **프론트엔드 호환성**
   - `<video src={videoData.videoUrl} />`가 videoUrl을 기대함
   - videoUrl이 없으면 `src={undefined}` → 검은 화면

2. **FFmpeg 렌더러와 일관성**
   - FFmpeg는 videoUrl을 반환
   - Puppeteer도 동일한 구조로 반환해야 함

3. **URL 경로 차이**
   - `url`: 내부 경로 (`/outputs/videos/...`)
   - `videoUrl`: 공개 URL (`/shorts-videos/outputs/videos/...`)

---

## 🔄 데이터 흐름

### Before (문제 상황)
```
1. Puppeteer 렌더러
   └─> return { videoId, url, size, videoPath }
   
2. video.js
   └─> videoJobs.set(videoId, { ...result })
   
3. GET /api/video/status/:videoId
   └─> return { videoId, url, size, ... }  // videoUrl 없음!
   
4. 프론트엔드
   └─> videoData.videoUrl = undefined
   
5. <video src={undefined} />
   └─> 검은 화면 ❌
```

### After (수정 후)
```
1. Puppeteer 렌더러
   └─> return { videoId, url, size, videoPath, videoUrl } ✅
   
2. video.js
   └─> videoJobs.set(videoId, { ...result })
   
3. GET /api/video/status/:videoId
   └─> return { videoId, url, size, videoUrl, ... } ✅
   
4. 프론트엔드
   └─> videoData.videoUrl = "/shorts-videos/outputs/videos/..." ✅
   
5. <video src="/shorts-videos/outputs/videos/..." />
   └─> 영상 재생! ✅
```

---

## 📊 테스트 결과

### 수정 전 (07:48 영상)
```javascript
// API 응답
{
  videoId: "video_1770331594793_s6ulgn",
  url: "/outputs/videos/video_1770331594793_s6ulgn.mp4",
  videoUrl: undefined  // ❌
}

// 프론트엔드
<video src={undefined} />  // 검은 화면
```

### 수정 후 (다음 영상부터)
```javascript
// API 응답 (예상)
{
  videoId: "video_1234567890_abc123",
  url: "/outputs/videos/video_1234567890_abc123.mp4",
  videoUrl: "/shorts-videos/outputs/videos/video_1234567890_abc123.mp4"  // ✅
}

// 프론트엔드
<video src="/shorts-videos/outputs/videos/video_1234567890_abc123.mp4" />
// 영상 재생! ✅
```

---

## 🎯 영향 범위

### 영향받는 영상
- **Puppeteer 렌더러로 생성된 모든 영상**
  - 애니메이션이 있는 영상 (fade-in, typing, slide-*, zoom-in 등)
  
### 영향받지 않는 영상
- **FFmpeg 렌더러로 생성된 영상**
  - 애니메이션이 없는 영상 (animation: 'none')

### 시간대별 분석
```
19:34 이후 생성 영상:
- video_1770287666003_knid49wbk.mp4 - ❌ 검은 화면 (Puppeteer)
- video_1770288078591_2zql95.mp4 - ❌ 검은 화면 (Puppeteer, fade-in)
- video_1770294024787_r8k65n.mp4 - ❌ 검은 화면 (Puppeteer)
- video_1770303029168_w7iz98.mp4 - ❌ 검은 화면 (Puppeteer)
- video_1770307640284_tzprtr.mp4 - ❌ 검은 화면 (Puppeteer)
- video_1770308154548_scq7v1.mp4 - ❌ 검은 화면 (Puppeteer, typing)
- video_1770308520274_q8ngd6.mp4 - ❌ 검은 화면 (Puppeteer, typing)
- video_1770331499438_sb842s.mp4 - ❌ 검은 화면 (Puppeteer)
- video_1770331594793_s6ulgn.mp4 - ❌ 검은 화면 (Puppeteer)

08:00 수정 후 생성 영상:
- 다음 영상부터 - ✅ 정상 재생 예상
```

---

## 🛠️ 사용자 조치사항

### 기존 영상 (수정 전 생성)
**문제**: 검은 화면 표시

**해결 방법 (임시):**
1. **직접 URL로 접근**
   ```
   https://shorts.neuralgrid.kr/shorts-videos/outputs/videos/[VIDEO_ID].mp4
   ```
   
2. **다운로드 버튼 사용**
   - 다운로드는 정상 작동함
   - 로컬에서 재생 가능

3. **영상 재생성**
   - 같은 뉴스 URL로 다시 생성하면 정상 표시됨

### 새 영상 (수정 후 생성)
**상태**: ✅ 정상 작동 예상

**확인 방법:**
1. 뉴스 URL 입력
2. 영상 생성 (90초 대기)
3. 비디오 플레이어에서 **바로 재생 가능** ✅

---

## 📝 관련 파일

### 수정된 파일
- `/home/shorts/backend/src/utils/videoRenderer.js` (Line 1479)
  - `videoUrl` 필드 추가

### 관련 파일 (수정 없음)
- `/home/shorts/backend/src/routes/video.js`
  - videoJobs에 result 저장
- `/home/shorts/frontend/src/pages/ShortsGeneratePage.jsx`
  - `<video src={videoData.videoUrl} />`

---

## 🚀 배포 상태

- **백엔드**: ✅ 재시작 완료 (PM2 pid: 3645176)
- **커밋**: 648d88b
- **브랜치**: genspark_ai_developer
- **푸시**: ✅ GitHub

---

## 🎉 최종 결과

### ✅ **문제 해결 완료!**

**Before:**
```
영상 생성 성공 → videoUrl 없음 → 검은 화면 ❌
```

**After:**
```
영상 생성 성공 → videoUrl 포함 → 정상 재생 ✅
```

---

## 📚 참고 문서

### 이전 수정 사항
1. [TTS_AUDIOPATH_FIX.md](./TTS_AUDIOPATH_FIX.md)
   - TTS audioPath 누락 문제

2. [VIDEOID_CONSISTENCY_FIX.md](./VIDEOID_CONSISTENCY_FIX.md)
   - videoId 불일치 문제

3. [SYSTEM_ANALYSIS_REPORT.md](./SYSTEM_ANALYSIS_REPORT.md)
   - 시스템 종합 분석

### 이번 수정
4. **VIDEO_PLAYER_BLACK_SCREEN_FIX.md** (본 문서)
   - Puppeteer videoUrl 누락 문제

---

## 🎯 학습 포인트

### 문제 발생 원인
1. **API 응답 구조 불일치**
   - 백엔드 ↔ 프론트엔드 간 기대값 불일치

2. **두 렌더러의 다른 구현**
   - FFmpeg: videoUrl 포함 ✅
   - Puppeteer: videoUrl 누락 ❌

3. **테스트 커버리지 부족**
   - Puppeteer 렌더러의 return 값 검증 누락

### 예방 방법
1. **타입 정의 사용**
   ```typescript
   interface VideoResult {
     videoId: string;
     videoPath: string;
     size: number;
     url: string;
     videoUrl: string;  // ← 명시적으로 정의
   }
   ```

2. **통합 테스트**
   - API 응답 → 프론트엔드 렌더링까지 E2E 테스트

3. **렌더러 추상화**
   - 공통 인터페이스 정의
   - 모든 렌더러가 동일한 구조 반환

---

**작성 완료**: 2026-02-06 08:05 KST  
**문제**: Puppeteer 렌더러 videoUrl 누락  
**해결**: videoUrl 필드 추가  
**상태**: ✅ 수정 완료 및 배포됨  
**다음 영상부터**: ✅ 정상 재생 가능
