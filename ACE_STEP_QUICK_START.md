# 🎵 ACE-Step 1.5 빠른 시작 가이드

## 🌐 접속 방법
```
https://music.neuralgrid.kr/aoto/
```

---

## ⚡ 3단계로 음악 만들기

### 방법 1: Sample Data 사용 (가장 빠름!)

```
1. 브라우저에서 https://music.neuralgrid.kr/aoto/ 접속
2. "Sample Data" 버튼 클릭
3. "Text2Music" 버튼 클릭
4. 1-2분 기다리면 완성! 🎉
```

### 방법 2: 직접 입력

#### Step 1: Tags 입력 (음악 스타일)
```
lo-fi, hip hop, chill, piano, drums, 85 BPM, mellow
```

#### Step 2: Lyrics 입력 (가사 구조)
```
[verse]
Soft piano keys falling like rain
Gentle beats that ease the pain

[chorus]
Chill vibes flowing free
Just you and me
```

#### Step 3: 생성 시작
```
"Text2Music" 버튼 클릭 → 완성!
```

---

## 🎨 화면 구성

```
┌─────────────────────────────────────────────┐
│  ACE-Step 1.5 - AI Music Generation         │
│  ┌────────────┐  ┌─────────────┐            │
│  │ Sample Data│  │ Load        │            │
│  └────────────┘  └─────────────┘            │
├─────────────────────────────────────────────┤
│  Tags (음악 스타일):                          │
│  ┌─────────────────────────────────────┐    │
│  │ lo-fi, chill, piano, 85 BPM        │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Lyrics (가사):                              │
│  ┌─────────────────────────────────────┐    │
│  │ [verse]                            │    │
│  │ ...                                │    │
│  │ [chorus]                           │    │
│  │ ...                                │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Duration: 60초  Format: mp3               │
│                                             │
│  ┌─────────────────────┐                    │
│  │    Text2Music       │  ← 이 버튼 클릭!   │
│  └─────────────────────┘                    │
└─────────────────────────────────────────────┘
```

---

## 📝 필수 입력 항목

### Tags (필수)
**무엇을 입력하나요?**
- 장르 (lo-fi, rock, EDM 등)
- 악기 (piano, guitar, drums 등)
- BPM (60-180)
- 느낌 (chill, energetic, emotional 등)

**예시:**
```
✅ 좋은 예: "lo-fi, chill, jazz, piano, 85 BPM, mellow"
❌ 나쁜 예: "good music, nice"
```

### Lyrics (필수)
**무엇을 입력하나요?**
- 가사 구조 태그
- 실제 가사 내용

**구조 태그:**
- `[verse]` - 절
- `[chorus]` - 후렴
- `[bridge]` - 브릿지
- `[outro]` - 엔딩

**예시:**
```
[verse]
가사 내용...

[chorus]
후렴구...

[verse]
가사 내용...

[chorus]
후렴구...
```

---

## 🎯 자주 쓰는 설정

### Lo-Fi / Chill
```
Tags: lo-fi, hip hop, chill, jazz, piano, drums, 80 BPM, mellow
Duration: 120초
Format: mp3
```

### Rock
```
Tags: rock, electric guitar, drums, bass, 130 BPM, energetic
Duration: 180초
Format: wav
```

### EDM
```
Tags: EDM, electronic, synth, bass, 128 BPM, drop, energetic
Duration: 180초
Format: mp3
```

### Ballad
```
Tags: ballad, piano, strings, 70 BPM, emotional, slow
Duration: 180초
Format: wav
```

---

## ⚙️ 기본 설정 이해하기

### Audio Duration
- **-1**: 자동 (30-240초 랜덤)
- **60**: 1분 (빠른 테스트)
- **120**: 2분 (일반적)
- **180**: 3분 (긴 곡)

### Format
- **mp3**: 작은 파일, 빠른 다운로드 (추천)
- **wav**: 무손실, 최고 품질
- **ogg**: 압축, 균형
- **flac**: 무손실 압축

### Infer Steps
- **40**: 빠름, 품질 낮음
- **60**: 균형 (추천)
- **80**: 느림, 품질 높음

### Guidance Scale
- **12.0**: 창의적
- **15.0**: 균형 (추천)
- **18.0**: 정확

---

## 🚀 실전 예제

### 예제 1: 공부할 때 듣는 음악

```javascript
Tags:
lo-fi, study, chill, piano, soft beats, 75 BPM, calm, peaceful

Lyrics:
[verse]
Quiet room, gentle light
Books open through the night
Soft piano notes that flow
Helping thoughts to grow

[chorus]
Focus deep, mind at ease
Floating on this melody
Every beat a step ahead
Knowledge fills my head

Duration: 120초
Format: mp3
Infer Steps: 60
```

### 예제 2: 운동할 때 듣는 음악

```javascript
Tags:
rock, energetic, electric guitar, drums, 140 BPM, powerful, upbeat

Lyrics:
[verse]
Push harder, feel the burn
Every rep another turn
Heart racing, sweat is flowing
Strength inside is growing

[chorus]
Stronger every single day
Never gonna walk away
Feel the power, feel the might
Ready for the fight

Duration: 180초
Format: mp3
Infer Steps: 60
```

### 예제 3: 잠들기 전 음악

```javascript
Tags:
ambient, relaxing, piano, soft pads, 60 BPM, dreamy, peaceful, lullaby

Lyrics:
[verse]
Stars are shining soft and bright
Whispers of the quiet night
Gentle melodies unfold
Stories waiting to be told

[chorus]
Close your eyes and drift away
To where dreams and moonbeams play
Rest your weary mind and soul
Let the music make you whole

Duration: 180초
Format: wav
Infer Steps: 70
```

---

## 💡 빠른 팁

### 🎯 더 좋은 결과를 위한 팁

#### 1. Tags는 구체적으로
```
❌ "pop music"
✅ "modern pop, synth, drums, 120 BPM, upbeat, catchy"
```

#### 2. Lyrics는 구조화
```
❌ 가사만 막 쓰기
✅ [verse], [chorus] 태그 사용
```

#### 3. BPM 가이드
- 느린 곡: 60-80
- 중간: 90-120
- 빠른 곡: 130-160

#### 4. 길이 선택
- 테스트: 60초
- 일반: 120초
- 긴 곡: 180초

---

## ⚡ 문제 해결

### 생성이 안 될 때
```
1. 브라우저 새로고침 (Ctrl + F5)
2. Tags와 Lyrics 다시 확인
3. Duration을 60초로 줄여보기
4. Sample Data로 테스트
```

### 결과가 마음에 안 들 때
```
1. Tags를 더 구체적으로
2. Guidance Scale 높이기 (15 → 18)
3. Infer Steps 높이기 (60 → 80)
4. 다른 Scheduler 시도
```

---

## 📥 결과 다운로드

### 방법 1: 웹 UI에서
```
1. 음악 생성 완료
2. 플레이어 하단의 다운로드 버튼 (⬇️) 클릭
3. 파일 저장
```

### 방법 2: 직접 링크
```
생성된 음악의 URL을 복사해서 다운로드
```

---

## 🎨 UI 특징

### 프리미엄 다크 테마
- **배경**: 깊은 퍼플-블루 그라데이션
- **애니메이션**: 20초 루프 배경
- **카드**: Glassmorphism 효과
- **테이블**: 퍼플 그라데이션 헤더

### 반응형 디자인
- 데스크톱, 태블릿, 모바일 지원
- 시크릿 모드 권장 (최신 UI)

---

## 🔗 유용한 링크

### 서비스 URL
```
https://music.neuralgrid.kr/aoto/
```

### 자세한 가이드
- `ACE_STEP_COMPLETE_USAGE_GUIDE.md` - 완전 가이드
- `ACE_STEP_USER_GUIDE.md` - 사용자 매뉴얼

---

## 🎯 체크리스트

### 첫 음악 만들기
- [ ] https://music.neuralgrid.kr/aoto/ 접속
- [ ] "Sample Data" 버튼 클릭
- [ ] "Text2Music" 버튼 클릭
- [ ] 1-2분 기다리기
- [ ] 생성된 음악 듣기
- [ ] 다운로드

### 나만의 음악 만들기
- [ ] Tags 작성 (장르, 악기, BPM)
- [ ] Lyrics 작성 ([verse], [chorus])
- [ ] Duration 설정 (60-180초)
- [ ] Format 선택 (mp3/wav)
- [ ] "Text2Music" 버튼 클릭
- [ ] 결과 확인 및 다운로드

---

## 📞 지원

### 문제가 있나요?
- UI 오류
- 생성 실패
- 품질 문제

### 피드백
- 기능 제안
- 개선 아이디어

---

## 🎉 시작하기

**지금 바로 시작하세요!**

```
1. 브라우저 열기
2. https://music.neuralgrid.kr/aoto/ 입력
3. "Sample Data" 버튼 클릭
4. "Text2Music" 버튼 클릭
5. 첫 AI 음악 완성! 🎵
```

**더 궁금하다면:**
- `ACE_STEP_COMPLETE_USAGE_GUIDE.md` 읽어보기
- 다양한 예제 시도해보기
- 파라미터 실험해보기

---

**Happy Music Making! 🎵**

---

**Version**: ACE-Step 1.5  
**Status**: Production Ready  
**Last Updated**: 2026-02-08  
**URL**: https://music.neuralgrid.kr/aoto/
