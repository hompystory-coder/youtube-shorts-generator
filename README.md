# YouTube Shorts Generator

AI 기반 유튜브 쇼츠 자동 생성 플랫폼

## 📋 프로젝트 개요

- **이름**: YouTube Shorts Generator (유튜브 쇼츠 자동 생성기)
- **목표**: 블로그 콘텐츠를 AI 기반으로 쇼츠 영상으로 자동 변환
- **주요 기능**:
  - 블로그 크롤링 및 콘텐츠 추출
  - AI 음성 생성 (Gemini, Minimax)
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
- **Backend**: Cloudflare Workers + Pages Functions
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2, KV
- **AI APIs**: 
  - Gemini (스크립트 생성, 음성 생성)
  - Minimax (음성 생성)
  - Shotstack (비디오 생성)
- **Payment**: PAYAPP

## 👥 사용자 가이드

### 1. 회원가입 및 로그인
1. 우측 상단 "회원가입" 클릭
2. 이메일, 비밀번호, 이름 입력
3. 자동으로 3일 무료 체험 시작

### 2. API 키 설정
1. "마이페이지" → "API 키 설정" 이동
2. 필요한 API 키 입력:
   - Gemini API Key
   - Minimax API Key (선택)
   - Shotstack API Key

### 3. 영상 생성
1. 홈페이지에서 블로그 URL 입력
2. "블로그 크롤링 시작" 클릭
3. 크롤링된 이미지 중 원하는 이미지 선택
4. "음성 생성" 클릭
5. "비디오 생성" 클릭
6. 완성된 영상 다운로드

### 4. 구독 결제
1. "플랜보기" 버튼 클릭
2. 월간(33,000원/월) 또는 연간(297,000원/년) 선택
3. 결제 방법 선택:
   - 무통장 입금
   - 간편결제 (PAYAPP)

## 🚀 배포 상태

- **플랫폼**: Cloudflare Pages
- **상태**: ✅ 활성
- **마지막 업데이트**: 2024-11-30

## 🔐 관리자 계정

- **이메일**: hompystory@gmail.com
- **역할**: super_admin
- **권한**: 전체 사용자 관리, 결제 내역 조회, 시스템 설정

## 📝 주요 완료 기능

✅ 사용자 인증 (회원가입, 로그인, JWT)  
✅ 3일 무료 체험 시스템  
✅ 블로그 크롤링  
✅ AI 스크립트 생성  
✅ AI 음성 생성 (Gemini, Minimax)  
✅ AI 비디오 생성 (Shotstack)  
✅ 구독 결제 시스템 (PAYAPP)  
✅ 마이페이지 (프로젝트 관리, API 키 설정)  
✅ 관리자 페이지 (사용자 관리, 결제 내역)

## 🐛 최근 버그 수정

- ✅ 결제 페이지 인증 토큰 인식 문제 수정 (`jwt_token` 우선 확인)
- ✅ localStorage 토큰 키 호환성 개선

## 🔮 향후 개선 계획

- [ ] 비디오 생성 속도 최적화
- [ ] 다양한 음성 스타일 추가
- [ ] 템플릿 기반 영상 생성
- [ ] 크롤링 성능 개선
- [ ] 프로젝트 공유 기능

## 📞 문의

- **이메일**: hompystory@gmail.com
- **GitHub Issues**: https://github.com/hompystory-coder/youtube-shorts-generator/issues
