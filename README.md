# YouTube Shorts Generator

AI 기반 유튜브 쇼츠 자동 생성 플랫폼

## 📋 프로젝트 개요

- **이름**: YouTube Shorts Generator (유튜브 쇼츠 자동 생성기)
- **목표**: 블로그 콘텐츠를 AI 기반으로 쇼츠 영상으로 자동 변환
- **주요 기능**:
  - 블로그 크롤링 및 콘텐츠 추출
  - AI 음성 생성 (Minimax)
  - AI 비디오 생성 (Shotstack)
  - 구독 결제 시스템 (PAYAPP)
  - 3일 무료 체험 제공

## 🌐 배포 URL

- **프로덕션**: https://youtube-shorts-generator.pages.dev
- **GitHub**: https://github.com/hompystory-coder/youtube-shorts-generator

## 💾 데이터 아키텍처

- **데이터베이스**: Cloudflare D1 (SQLite)
- **파일 스토리지**: Cloudflare R2
- **키-값 스토리지**: Cloudflare KV
- **주요 테이블**:
  - users (사용자 정보)
  - subscriptions (구독 상태)
  - payments (결제 기록)
  - projects (프로젝트/영상)

## 🔧 기술 스택

- **Frontend**: HTML, TailwindCSS, JavaScript
- **Backend**: Express.js (SSH 서버), Cloudflare Workers + Pages Functions
- **Database**: Supabase PostgreSQL (사용자/구독), File-based JSON (API 키)
- **Storage**: Server Filesystem (배경 이미지/음악), Cloudflare R2
- **AI APIs**: 
  - Minimax (음성 생성)
  - Shotstack (비디오 생성)
- **Payment**: PAYAPP

## 📅 버전 정보

- **현재 버전**: 2025-12-01 (안정 버전)
- **마지막 업데이트**: 2025-12-01 07:33
- **상태**: ✅ 안정 버전 (12월 1일)

## ✅ 완료된 기능 (12월 1일 버전)

### 핵심 기능
- ✅ 회원가입 및 로그인 시스템
- ✅ 블로그 크롤링 (네이버 블로그)
- ✅ Minimax 음성 미리듣기 기능
- ✅ 배경 이미지/음악 업로드 (서버 저장)
- ✅ 구독 결제 시스템
- ✅ 관리자 페이지

### UI/UX
- ✅ 자막 설정 기본 기능
- ✅ localStorage 기반 설정 저장
- ✅ 배경 이미지/음악 선택

### API
- ✅ 인증 API (로그인, 회원가입)
- ✅ 블로그 크롤링 API
- ✅ 음성 미리듣기 API
- ✅ 배경 업로드/삭제 API
- ✅ 설정 저장 API

## 🚀 배포 가이드

### SSH 서버 업데이트

```bash
cd ~/youtube-shorts-generator && \
git pull origin main && \
pm2 restart youtube-shorts-generator && \
sleep 3 && \
echo "✅ 서버 업데이트 완료!"
```

### 브라우저 테스트

1. **강제 새로고침**: `Ctrl + Shift + R` (Windows) 또는 `Cmd + Shift + R` (Mac)
2. **개발자 도구**: `F12`
3. **테스트 계정**: 
   - 이메일: `hompystory@gmail.com`
   - 비밀번호: `a1226119`

## 👥 사용자 가이드

### 1. 회원가입 및 로그인
1. 우측 상단 "회원가입" 클릭
2. 이메일, 비밀번호, 이름 입력
3. 자동으로 3일 무료 체험 시작

### 2. 영상 생성 프로세스
1. **블로그 URL 입력** → "블로그 크롤링 시작"
2. **이미지 선택** → 원하는 이미지 선택
3. **스크립트 작성** → 수동 또는 자동 생성
4. **음성 생성** → Minimax API로 TTS 생성
5. **영상 생성** → Shotstack API로 최종 영상 생성

## 📊 프로젝트 타임라인

- **2025-11-30**: 프로젝트 시작 및 기본 구조 완성
- **2025-12-01**: 음성 미리듣기, 배경 업로드 기능 완성 ✅ 현재 버전
- **2025-12-02~04**: UI/UX 개선 (실시간 미리보기)
- **2025-12-05**: 블로그 크롤링 개선
- **2025-12-07**: AI 스크립트 생성 기능 추가

## 🔄 버전 되돌리기

### 백업 브랜치
현재 버전으로 되돌리기 전 백업이 생성되었습니다:
- 백업 브랜치: `backup-before-reset-YYYYMMDD-HHMMSS`

### 다시 최신 버전으로 가려면
```bash
cd ~/youtube-shorts-generator && \
git checkout backup-before-reset-YYYYMMDD-HHMMSS && \
git branch -M main && \
git push -f origin main
```

## 🆘 문제 해결

### 캐시 문제
브라우저 캐시 때문에 구버전이 로드될 수 있습니다:
- **해결**: `Ctrl + Shift + R` (강제 새로고침)
- **또는**: 브라우저 캐시 삭제 (`Ctrl + Shift + Delete`)

### API 키 설정
마이페이지에서 다음 API 키를 설정해야 합니다:
- Minimax API Key
- Minimax Group ID
- Shotstack API Key

## 📝 개발 노트

### 12월 1일 버전 특징
- ✅ 안정적인 블로그 크롤링
- ✅ Minimax 음성 미리듣기 작동
- ✅ 배경 이미지/음악 업로드 작동
- ❌ AI 스크립트 자동 생성 없음 (수동 입력 필요)
- ❌ 실시간 자막 미리보기 없음
- ❌ 템플릿 저장 기능 없음

### 왜 12월 1일 버전인가?
- AI 기능 추가 전의 안정적인 버전
- 모든 기본 기능이 정상 작동
- 복잡한 디버깅 로그 없음
- 간단하고 이해하기 쉬운 코드

## 📞 연락처

- **GitHub**: https://github.com/hompystory-coder/youtube-shorts-generator
- **이메일**: hompystory@gmail.com

---

**버전**: 2025-12-01 안정 버전  
**업데이트**: 2025-12-07 (12월 1일로 롤백)  
**상태**: ✅ 운영 중
