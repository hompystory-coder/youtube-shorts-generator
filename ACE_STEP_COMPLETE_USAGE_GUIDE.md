# 🎵 ACE-Step 1.5 완전 사용 가이드

## 📋 목차
1. [빠른 시작](#빠른-시작)
2. [UI 둘러보기](#ui-둘러보기)
3. [음악 생성 단계별 가이드](#음악-생성-단계별-가이드)
4. [실전 예제](#실전-예제)
5. [고급 기능](#고급-기능)
6. [Tips & Tricks](#tips--tricks)

---

## 🚀 빠른 시작

### 1단계: 접속
```
https://music.neuralgrid.kr/aoto/
```

### 2단계: 기본 정보 입력
최소한 **Tags**와 **Lyrics**만 입력하면 됩니다!

### 3단계: 생성 버튼 클릭
**Text2Music** 버튼을 클릭하고 1-2분 기다리면 완성!

---

## 🎨 UI 둘러보기

### 프리미엄 다크 테마
ACE-Step 1.5는 고급스러운 다크 테마를 사용합니다:
- **배경**: 깊은 퍼플-블루 그라데이션
- **카드**: Glassmorphism 효과
- **테이블**: 퍼플 그라데이션 헤더
- **애니메이션**: 부드러운 60fps 모션

### 주요 섹션

#### 1. **Text2Music 탭** (메인)
- 음악 스타일과 가사를 입력하는 기본 탭
- 대부분의 작업은 여기서 수행

#### 2. **컨트롤 패널** (상단)
- Load: 저장된 프로젝트 불러오기
- Sample Data: 예제 데이터 로드

#### 3. **파라미터 영역** (좌측)
- Tags: 음악 스타일 정의
- Lyrics: 가사 입력
- Duration: 음악 길이
- Format: 출력 포맷

#### 4. **고급 설정** (하단)
- Audio2Audio: 레퍼런스 오디오
- LoRA: 특수 스타일
- 세부 파라미터

---

## 🎼 음악 생성 단계별 가이드

### Step 1: Tags 작성 (필수)
**Tags**는 음악의 스타일을 정의합니다.

#### 필수 요소:
```
[장르], [무드], [악기], [BPM], [특징]
```

#### 예시:
```
lo-fi, hip hop, chill, relaxing, jazz, piano, drums, 85 BPM, mellow
```

#### Tags 작성 공식:
```
장르 + 무드/느낌 + 주요 악기 + BPM + 추가 특징
```

### Step 2: Lyrics 작성 (필수)
**Lyrics**는 곡의 구조를 정의합니다.

#### 기본 구조:
```
[verse]
가사 내용...

[chorus]
가사 내용...

[bridge]
가사 내용...
```

#### 구조 태그:
- `[verse]` - 절
- `[chorus]` - 후렴구
- `[bridge]` - 브릿지
- `[outro]` - 아웃트로
- `[intro]` - 인트로 (옵션)
- `[instrumental]` - 악기 연주 구간

#### 예시:
```
[verse]
Soft piano keys falling like rain
Gentle beats that ease the pain
Vinyl crackle in the background
Peaceful vibes all around

[chorus]
Chill vibes flowing free
Just you and me
Relaxing melody
Perfect harmony

[bridge]
Time stands still in this moment
Every note a perfect component

[outro]
Fading into the night
Everything feels right
```

### Step 3: 기본 설정

#### Audio Duration
- **-1**: 자동 (30-240초)
- **60**: 60초 (추천)
- **120**: 2분
- **240**: 4분 (최대)

#### Format
- **mp3**: 범용 (추천) - 작은 파일 크기
- **wav**: 무손실 - 최고 품질
- **ogg**: 압축 - 균형잡힌 품질
- **flac**: 무손실 압축 - 품질 + 크기

### Step 4: 생성 시작
1. **Text2Music** 버튼 클릭
2. 진행 상황 모니터링 (1-2분 소요)
3. 완료되면 플레이어에서 재생
4. 다운로드 버튼으로 저장

---

## 💡 실전 예제

### 예제 1: Chill Lo-Fi Hip Hop

#### Tags:
```
lo-fi, hip hop, chill, relaxing, jazz, piano, drums, 85 BPM, mellow, smooth, nostalgic
```

#### Lyrics:
```
[verse]
Soft piano keys falling like rain
Gentle beats that ease the pain
Vinyl crackle in the background
Peaceful vibes all around

[chorus]
Chill vibes flowing free
Just you and me
Relaxing melody
Perfect harmony

[verse]
City lights through foggy windows
Time moves slow where the rhythm goes
Coffee cup and midnight thoughts
Finding peace in what time brought

[chorus]
Chill vibes flowing free
Just you and me
Relaxing melody
Perfect harmony

[outro]
Fading into the night
Everything feels right
```

#### 설정:
- Duration: 120초
- Format: mp3
- Infer Steps: 60
- Guidance Scale: 15.0

---

### 예제 2: Energetic Rock

#### Tags:
```
rock, energetic, electric guitar, drums, bass, 140 BPM, powerful, upbeat, dynamic, anthemic
```

#### Lyrics:
```
[verse]
Thunder rolling in my veins
Breaking through these heavy chains
Amplifiers scream so loud
Standing tall above the crowd

[chorus]
We're alive and burning bright
Setting fire to the night
Can you feel the power rise
Reaching for the skies

[verse]
Guitar strings cut through the air
Drumbeats pounding everywhere
Bass lines shake the ground below
Let the energy flow

[chorus]
We're alive and burning bright
Setting fire to the night
Can you feel the power rise
Reaching for the skies

[bridge]
One moment to ignite
One chance to get it right
We're breaking down the walls
Answering the call

[chorus]
We're alive and burning bright
Setting fire to the night
Can you feel the power rise
Reaching for the skies
```

#### 설정:
- Duration: 180초
- Format: wav
- Infer Steps: 60
- Guidance Scale: 15.0

---

### 예제 3: Emotional Piano Ballad

#### Tags:
```
ballad, emotional, piano, strings, slow, 65 BPM, melancholic, beautiful, intimate, heartfelt
```

#### Lyrics:
```
[verse]
Moonlight dancing on your face
Memories I can't erase
Every moment that we shared
Still reminds me that you cared

[chorus]
In the silence of the night
I hold on to you so tight
Though you're gone, you're still here
In every falling tear

[verse]
Photographs in dusty frames
Whispers of forgotten names
Time may heal but scars remain
Love and loss, joy and pain

[chorus]
In the silence of the night
I hold on to you so tight
Though you're gone, you're still here
In every falling tear

[bridge]
If I could turn back time
Would you still be mine
Questions left unanswered
Dancing in my mind

[chorus]
In the silence of the night
I hold on to you so tight
Though you're gone, you're still here
In every falling tear

[outro]
The piano plays our song
Where we both belong
```

#### 설정:
- Duration: 180초
- Format: wav
- Infer Steps: 70 (더 높은 품질)
- Guidance Scale: 18.0 (더 정확한 스타일)

---

### 예제 4: EDM Drop

#### Tags:
```
EDM, electronic, synth, bass drop, 128 BPM, energetic, festival, powerful, euphoric, buildup
```

#### Lyrics:
```
[verse]
Lights are flashing all around
Bodies moving to the sound
Feel the bass beneath your feet
Heartbeat matching with the beat

[buildup]
Hands up reaching for the sky
Feel the energy run high
Count down to the moment we ignite
Three, two, one

[drop]
Drop the bass, feel the power
This is our finest hour
Lost in rhythm, lost in sound
Feet lifting off the ground

[verse]
Synths are rising through the air
Electric vibes everywhere
Crowd is screaming, energy explodes
We're living in this moment that we chose

[buildup]
Hands up reaching for the sky
Feel the energy run high
Count down to the moment we ignite
Three, two, one

[drop]
Drop the bass, feel the power
This is our finest hour
Lost in rhythm, lost in sound
Feet lifting off the ground

[outro]
As the night fades away
We'll remember this day
Forever in the sound we found
```

#### 설정:
- Duration: 180초
- Format: mp3
- Infer Steps: 60
- Guidance Scale: 15.0
- Scheduler: dpmpp-2m-sde (EDM에 최적)

---

## 🎛️ 고급 기능

### Audio2Audio (레퍼런스 오디오)

#### 사용 시기:
- 특정 곡 스타일을 모방하고 싶을 때
- 기존 멜로디를 변형하고 싶을 때
- 일관된 사운드를 유지하고 싶을 때

#### 사용 방법:
1. "Enable Audio2Audio" 체크박스 활성화
2. Reference Audio 업로드
3. Refer audio strength 조절 (0.0-1.0)
   - **0.3**: 약간의 영향
   - **0.5**: 균형잡힌 영향 (추천)
   - **0.8**: 강한 영향

### LoRA (Low-Rank Adaptation)

#### 사용 가능한 스타일:
- `chinese-rap`: 중국식 랩
- `none`: LoRA 없음 (기본)

#### 사용 방법:
1. Lora Name or Path에서 스타일 선택
2. Lora weight 조절 (0.0-2.0)
   - **0.5**: 약한 효과
   - **1.0**: 표준 효과 (추천)
   - **1.5**: 강한 효과

### Preset 시스템

#### 사용 가능한 프리셋:
- **Modern Pop**: 현대 팝 음악
- **Rock**: 록 음악
- **Hip Hop**: 힙합
- **Country**: 컨트리
- **EDM**: 일렉트로닉 댄스 뮤직
- **Reggae**: 레게
- **Classical**: 클래식
- **Jazz**: 재즈
- **Metal**: 메탈
- **R&B**: 알앤비

#### 사용 효과:
- Preset 선택 시 Tags가 자동으로 채워짐
- 장르에 맞는 기본 설정 적용

---

## 🔧 세부 파라미터 설명

### 기본 파라미터

#### Infer Steps (30-100)
- **의미**: 생성 반복 횟수
- **30-40**: 빠른 생성, 낮은 품질
- **50-60**: 균형 (추천)
- **70-100**: 느린 생성, 높은 품질

#### Guidance Scale (1.0-30.0)
- **의미**: 프롬프트 준수 강도
- **10.0**: 창의적
- **15.0**: 균형 (추천)
- **20.0+**: 정확하지만 덜 창의적

#### Scheduler Type
- **euler**: 빠름, 표준
- **dpmpp-2m-sde**: 고품질 (추천)
- **ddim**: 안정적
- **pndm**: 빠른 수렴

### 고급 파라미터

#### CFG Type
- **apg**: Adaptive Perpendicular Guidance (추천)
- **standard**: 표준 CFG

#### Granularity Scale (0.0-20.0)
- **의미**: 세부 디테일 강도
- **5.0**: 부드러운 사운드
- **10.0**: 균형 (기본)
- **15.0+**: 매우 디테일한 사운드

#### Guidance Interval (0.0-1.0)
- **의미**: CFG 적용 구간
- **0.5**: 중간 구간 (기본)
- **0.8**: 후반부까지

#### ERG (Energy-Based Rejection Guidance)
- **use ERG for tag**: Tags 정확도 향상
- **use ERG for lyric**: Lyrics 정확도 향상
- **use ERG for diffusion**: 전체 품질 향상

---

## 💡 Tips & Tricks

### 🎯 품질 향상 팁

#### 1. Tags 최적화
```
❌ 나쁜 예: "good music, nice, cool"
✅ 좋은 예: "lo-fi, hip hop, jazz, piano, drums, 85 BPM, mellow, smooth"
```

**규칙**:
- 구체적인 장르 명시
- 주요 악기 나열
- BPM 포함
- 감정/무드 표현
- 쉼표(,)로 구분

#### 2. Lyrics 구조화
```
❌ 나쁜 예: 구조 없이 가사만 나열
✅ 좋은 예: [verse], [chorus] 등 구조 태그 사용
```

**구조 예시**:
```
[intro]
[verse]
[chorus]
[verse]
[chorus]
[bridge]
[chorus]
[outro]
```

#### 3. BPM 가이드
- **Slow Ballad**: 60-80 BPM
- **Mid-tempo**: 80-120 BPM
- **Upbeat**: 120-140 BPM
- **Fast Dance**: 140-180 BPM

#### 4. 길이 선택
- **짧은 테스트**: 30-60초
- **일반 곡**: 120-180초
- **긴 곡**: 180-240초

### 🚀 생성 속도 최적화

#### 빠른 생성:
```
Infer Steps: 40
Guidance Scale: 12.0
Duration: 60
```

#### 균형:
```
Infer Steps: 60
Guidance Scale: 15.0
Duration: 120
```

#### 최고 품질:
```
Infer Steps: 80
Guidance Scale: 18.0
Duration: 180
Scheduler: dpmpp-2m-sde
```

### 🎨 장르별 추천 설정

#### Lo-Fi / Chill
```
Tags: lo-fi, chill, jazz, piano, 80 BPM, mellow
Infer Steps: 60
Guidance Scale: 14.0
Scheduler: dpmpp-2m-sde
```

#### Rock
```
Tags: rock, electric guitar, drums, 130 BPM, energetic
Infer Steps: 60
Guidance Scale: 16.0
Scheduler: euler
```

#### EDM
```
Tags: EDM, synth, bass, 128 BPM, energetic, drop
Infer Steps: 60
Guidance Scale: 15.0
Scheduler: dpmpp-2m-sde
```

#### Ballad
```
Tags: ballad, piano, strings, 70 BPM, emotional
Infer Steps: 70
Guidance Scale: 18.0
Scheduler: dpmpp-2m-sde
```

---

## 🎵 Sample Data 활용

### Sample Data 로드 방법
1. **Sample Data** 버튼 클릭
2. 자동으로 예제 Tags, Lyrics, 설정 로드
3. 그대로 생성하거나 수정해서 사용

### 활용 방법
- 초보자: 그대로 생성해서 결과 확인
- 중급자: Tags만 수정
- 고급자: 전체 커스터마이징

---

## 📥 결과 다운로드

### 다운로드 방법
1. 생성 완료 후 오디오 플레이어에서 재생
2. 다운로드 버튼 (⬇️) 클릭
3. 선택한 포맷(mp3/wav/ogg/flac)으로 저장

### 파일 위치
- 서버: `/home/music/aoto/outputs/`
- 다운로드: 브라우저 다운로드 폴더

---

## 🎨 UI 사용 팁

### 다크 테마 최적화
- **배경 애니메이션**: 20초 루프 그라데이션
- **Glassmorphism**: 반투명 카드
- **테이블 Hover**: 퍼플 하이라이트
- **부드러운 애니메이션**: 60fps

### 접근성
- **시크릿 모드**: 캐시 없이 최신 UI
- **반응형**: 모바일/태블릿/데스크톱 지원
- **키보드 단축키**: Tab, Enter 지원

---

## ⚠️ 주의사항

### 생성 시간
- **일반**: 1-2분
- **긴 곡 (240초)**: 3-5분
- **고품질 (Steps 80+)**: 2-4분

### 메모리 사용
- 동시에 여러 곡 생성 시 대기 가능
- 한 번에 한 곡씩 생성 권장

### 저작권
- 생성된 음악은 AI가 만든 것입니다
- 상업적 사용 시 라이선스 확인 필요

---

## 🆘 문제 해결

### 생성 실패 시
1. Tags와 Lyrics 확인
2. 브라우저 새로고침 (Ctrl+F5)
3. 다른 Scheduler 시도
4. Infer Steps 낮추기

### 품질이 낮을 때
1. Infer Steps 높이기 (60 → 80)
2. Guidance Scale 조정 (15 → 18)
3. Scheduler를 dpmpp-2m-sde로 변경
4. Tags를 더 구체적으로 작성

### 스타일이 다를 때
1. Tags 재작성
2. Guidance Scale 높이기
3. ERG 옵션 활성화
4. LoRA 사용 고려

---

## 📚 학습 자료

### 추천 학습 순서
1. Sample Data로 기본 체험
2. Tags만 수정해보기
3. Lyrics 직접 작성
4. 고급 파라미터 실험
5. Audio2Audio 시도

### 실습 프로젝트
1. **프로젝트 1**: 좋아하는 장르 3곡 만들기
2. **프로젝트 2**: 짧은 곡(60초) vs 긴 곡(180초) 비교
3. **프로젝트 3**: 같은 Lyrics, 다른 Tags로 변형
4. **프로젝트 4**: Audio2Audio로 스타일 복제

---

## 🌐 외부 접속

### Production URL
```
https://music.neuralgrid.kr/aoto/
```

### 로컬 접속 (서버 내부)
```
http://localhost:7866
```

---

## 📊 시스템 정보

### 서비스 상태
- **서비스**: ace-step-music
- **PM2 ID**: 10
- **포트**: 7866
- **상태**: Online

### 기술 스택
- **AI 모델**: ACE-Step 1.5
- **UI**: Gradio 6.0
- **테마**: Premium Dark Theme
- **애니메이션**: 60fps CSS

---

## 🎯 빠른 참조

### 최소 필수 입력
```
Tags: [장르], [악기], [BPM]
Lyrics: [verse] ... [chorus] ...
```

### 추천 기본 설정
```
Duration: 60-120초
Format: mp3
Infer Steps: 60
Guidance Scale: 15.0
Scheduler: dpmpp-2m-sde
```

### 고급 사용자 설정
```
Infer Steps: 70-80
Guidance Scale: 16-18
Enable ERG options
Use Audio2Audio for style consistency
```

---

## 📞 지원

### 문제 보고
- 생성 실패, UI 오류 등
- 서버 상태 확인 필요 시

### 기능 제안
- 새로운 Preset 추가
- UI 개선 아이디어

---

## 🎉 마무리

ACE-Step 1.5는 강력한 AI 음악 생성 도구입니다!

### 시작하기:
1. https://music.neuralgrid.kr/aoto/ 접속
2. Sample Data 버튼 클릭
3. Text2Music 버튼으로 첫 곡 생성!

### 다음 단계:
- Tags와 Lyrics 직접 작성
- 다양한 장르 실험
- 고급 파라미터 탐색
- Audio2Audio 마스터

**Happy Music Making! 🎵**

---

**Last Updated**: 2026-02-08  
**Version**: ACE-Step 1.5 Premium  
**Status**: Production Ready  
**URL**: https://music.neuralgrid.kr/aoto/
