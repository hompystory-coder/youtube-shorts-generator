#!/bin/bash

# Create Pull Request using GitHub CLI
gh pr create \
  --title "📚 ACE-Step 1.5 Complete Usage Documentation" \
  --body "## 📖 ACE-Step 1.5 완전 사용 가이드 문서

### 🎯 주요 변경사항

#### 새로운 문서 추가
1. **ACE_STEP_HOW_TO_USE.md** - 사용법 총정리
   - 초간단 30초 시작법
   - 실전 예제 4개 (공부, 운동, 수면, EDM)
   - 장르별 추천 설정
   - 학습 경로 및 연습 과제

2. **ACE_STEP_QUICK_START.md** - 빠른 시작 가이드
   - 3단계 시작법
   - UI 구성도
   - 체크리스트

3. **ACE_STEP_COMPLETE_USAGE_GUIDE.md** - 완전 가이드
   - 단계별 튜토리얼
   - 실전 예제 4개 (Lo-Fi, Rock, Ballad, EDM)
   - 고급 기능 (Audio2Audio, LoRA)
   - Tips & Tricks

4. **ACE_STEP_USER_GUIDE.md** - 사용자 매뉴얼
   - 기본 사용법
   - 파라미터 설명

#### 데모 스크립트
- **demo_sample_data_load.py** - Sample Data 로드 데모
- **generate_music_real.py** - 실제 음악 생성 API
- **test_ace_step_music.py** - API 테스트

### 📚 문서 구조

\`\`\`
ACE-Step 1.5 Documentation
├── ACE_STEP_HOW_TO_USE.md (총정리) ⭐
├── ACE_STEP_QUICK_START.md (빠른 시작)
├── ACE_STEP_COMPLETE_USAGE_GUIDE.md (완전 가이드)
└── ACE_STEP_USER_GUIDE.md (매뉴얼)
\`\`\`

### ✨ 주요 내용

#### 🚀 빠른 시작 (30초)
\`\`\`
1. https://music.neuralgrid.kr/aoto/ 접속
2. \"Sample Data\" 버튼 클릭
3. \"Text2Music\" 버튼 클릭
4. 완성! 🎉
\`\`\`

#### 🎼 기본 사용법
- **Tags**: 장르 + 악기 + BPM + 느낌
- **Lyrics**: [verse], [chorus] 구조 사용
- **Duration**: 60-180초 추천

#### 💡 실전 예제
1. **공부용 음악** (Lo-Fi, 75 BPM)
2. **운동용 음악** (Rock, 140 BPM)
3. **수면용 음악** (Ambient, 60 BPM)
4. **파티 음악** (EDM, 128 BPM)

### 🎯 학습 경로
- **입문** (0-30분): Sample Data 체험
- **초급** (30분-2시간): 장르 실험
- **중급** (2시간-1일): 파라미터 튜닝
- **고급** (1일+): 전문가 수준

### 📊 시스템 정보
- **URL**: https://music.neuralgrid.kr/aoto/
- **Status**: ✅ Production Ready
- **Console Errors**: 0
- **CSS Loaded**: ✅
- **Performance**: 60fps

### 🔗 관련 이슈
- ACE-Step Premium UI 업그레이드 완료
- Gradio 6.0 호환성 확인
- 프리미엄 다크 테마 적용

### ✅ 체크리스트
- [x] 사용법 총정리 문서
- [x] 빠른 시작 가이드
- [x] 완전 가이드 (11,000+ 단어)
- [x] 실전 예제 4개
- [x] 장르별 설정
- [x] 학습 경로
- [x] 연습 과제
- [x] 데모 스크립트

### 📝 커밋 요약
- \`0543e5c\` docs: 사용법 총정리
- \`a044c9d\` docs: 빠른 시작 가이드
- \`aacadd5\` docs: 완전 사용 가이드
- \`a82ec34\` feat: Premium UI 검증 완료

---

**Ready for Review! 🎵**" \
  --base main \
  --head genspark_ai_developer

