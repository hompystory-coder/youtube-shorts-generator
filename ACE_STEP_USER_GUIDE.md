# 🎵 ACE-Step 1.5 사용 가이드

**AI 음악 생성 도구 완벽 가이드**  
**URL**: https://music.neuralgrid.kr/aoto/

---

## 🚀 빠른 시작

### 1. 사이트 접속
```
https://music.neuralgrid.kr/aoto/
```

### 2. Text2Music 탭 선택
- 페이지 상단의 "text2music" 탭 클릭

---

## 🎨 음악 생성 방법

### 기본 사용법

#### Step 1: Tags 입력
음악의 스타일, 장르, 분위기를 태그로 입력합니다.

**예시:**
```
funk, pop, soul, rock, melodic, guitar, drums, bass, keyboard, 
105 BPM, energetic, upbeat, groovy, vibrant, dynamic
```

**태그 종류:**
- **장르**: pop, rock, jazz, hip hop, EDM, country, classical, metal, R&B
- **분위기**: energetic, calm, upbeat, melancholic, happy, intense
- **악기**: guitar, piano, drums, bass, violin, saxophone, synth
- **템포**: 80 BPM, 120 BPM, 140 BPM 등
- **스타일**: melodic, groovy, rhythmic, ambient, atmospheric

#### Step 2: Lyrics 입력
가사를 입력합니다. 구조 태그를 사용하여 섹션을 구분할 수 있습니다.

**가사 구조 태그:**
```
[verse]      - 절(벌스)
[chorus]     - 후렴구(코러스)
[bridge]     - 브릿지
[instrumental] 또는 [inst] - 악기 연주 부분
```

**가사 예시:**
```
[verse]
Neon lights they flicker bright
City hums in dead of night
Rhythms pulse through concrete veins
Lost in echoes of refrains

[chorus]
Turn it up and let it flow
Feel the fire let it grow
In this rhythm we belong
Hear the night sing out our song

[bridge]
Voices blend in harmony
Lost in pure cacophony
Timeless echoes timeless cries
Soulful shouts beneath the skies
```

**악기만 있는 음악 (Instrumental):**
```
[instrumental]
```

#### Step 3: 기본 설정

| 설정 | 설명 | 추천값 |
|------|------|--------|
| **Audio Duration** | 음악 길이 (초) | -1 (랜덤 30-240초) |
| **Format** | 파일 형식 | wav (고품질) / mp3 (작은 용량) |
| **Infer Steps** | 생성 품질 (높을수록 품질↑, 시간↑) | 60 |
| **Guidance Scale** | 프롬프트 충실도 | 15.0 |

#### Step 4: Generate 버튼 클릭
- 오른쪽 하단의 "Generate" 버튼 클릭
- 생성 시간: 약 1-3분 (설정에 따라 다름)

---

## 🎯 프리셋 사용하기

왼쪽 상단의 **Preset** 드롭다운에서 장르를 선택하면 자동으로 태그가 채워집니다.

**제공되는 프리셋:**
- Modern Pop
- Rock
- Hip Hop
- Country
- EDM
- Reggae
- Classical
- Jazz
- Metal
- R&B

---

## 🎛️ 고급 설정

### Audio2Audio (오디오 스타일 복제)
참조 오디오 파일을 업로드하여 그 스타일을 따라하는 음악을 생성합니다.

**사용법:**
1. "Enable Audio2Audio" 체크박스 체크
2. "Reference Audio" 업로드
3. "Refer audio strength" 슬라이더 조정 (0.0-1.0)
   - 0.5: 균형 잡힌 스타일 복제

### LoRA (스타일 파인튜닝)
특정 스타일에 특화된 모델을 사용합니다.

**사용 가능한 LoRA:**
- **ACE-Step/ACE-Step-v1-chinese-rap-LoRA**: 중국 랩 스타일
- **none**: LoRA 사용 안 함

**설정:**
- Lora weight: 1.0 (기본값, -3.0 ~ 3.0)

### Basic Settings (기본 설정 상세)

| 파라미터 | 범위 | 기본값 | 설명 |
|----------|------|--------|------|
| **Infer Steps** | 1-200 | 60 | 생성 반복 횟수 (높을수록 품질↑) |
| **Guidance Scale** | 0-30 | 15.0 | 프롬프트 충실도 |
| **Guidance Scale Text** | 0-10 | 0.0 | 텍스트 가이던스 |
| **Guidance Scale Lyric** | 0-10 | 0.0 | 가사 가이던스 |
| **Manual Seeds** | 숫자 | - | 재현 가능한 결과 (예: 1,2,3,4) |

**참고:**
- Guidance Scale Text > 1 및 Guidance Scale Lyric > 1 이면 Guidance Scale은 적용되지 않습니다.

### Advanced Settings (고급 설정)

| 파라미터 | 옵션 | 기본값 | 설명 |
|----------|------|--------|------|
| **Scheduler Type** | euler / heun / pingpong | euler | 샘플링 방법 |
| **Auto VAE Decode** | True / False | True | 자동 디코딩 |

**Scheduler 설명:**
- **euler**: 빠르고 안정적 (권장)
- **heun**: 더 높은 품질, 시간 더 걸림
- **pingpong**: SDE 방식, 실험적

---

## 💡 팁 & 트릭

### 1. 고품질 음악 생성
```
- Infer Steps: 80-100
- Guidance Scale: 15-20
- Format: wav 또는 flac
```

### 2. 빠른 테스트
```
- Infer Steps: 30-40
- Guidance Scale: 10
- Format: mp3
- Audio Duration: 30초
```

### 3. 장르별 추천 태그

#### Pop
```
pop, melodic, catchy, upbeat, vocal, guitar, drums, bass, 
120 BPM, energetic, modern
```

#### Rock
```
rock, electric guitar, drums, bass, energetic, powerful, 
driving, 140 BPM, aggressive, intense
```

#### Hip Hop
```
hip hop, rap, beats, bass, 808, trap, urban, 90 BPM, 
groovy, rhythmic
```

#### EDM
```
EDM, electronic, synth, bass drop, energetic, dance, 
128 BPM, festival, uplifting
```

#### Jazz
```
jazz, saxophone, piano, drums, bass, smooth, improvisation, 
100 BPM, relaxed, sophisticated
```

#### Classical
```
classical, orchestra, violin, piano, strings, elegant, 
dramatic, emotional, cinematic
```

---

## 🎼 예제 프롬프트

### 예제 1: 신나는 팝송
**Tags:**
```
pop, energetic, upbeat, catchy, guitar, piano, drums, 
125 BPM, bright, cheerful, melodic
```

**Lyrics:**
```
[verse]
Wake up to the sunshine bright
Dancing through the morning light
Every step feels so alive
This is how we thrive

[chorus]
We're unstoppable tonight
Shining like the stars so bright
Feel the rhythm feel the beat
Moving to our own heartbeat

[bridge]
Nothing's gonna bring us down
We're the kings we wear the crown
Higher higher we will fly
Reaching for the endless sky
```

### 예제 2: 차분한 재즈
**Tags:**
```
jazz, smooth, relaxed, saxophone, piano, bass, drums, 
90 BPM, sophisticated, mellow, atmospheric
```

**Lyrics:**
```
[verse]
Evening falls on city streets
Gentle rhythm softly beats
Whispers of a saxophone
In this moment I'm not alone

[chorus]
Let the music take control
Jazz that soothes the weary soul
Notes that float and drift away
In this night I want to stay

[instrumental]
```

### 예제 3: 악기만 있는 음악 (Cinematic)
**Tags:**
```
cinematic, orchestral, dramatic, strings, piano, epic, 
emotional, powerful, 80 BPM, atmospheric
```

**Lyrics:**
```
[instrumental]
```

---

## 🔄 샘플 데이터 로드

UI 오른쪽 상단의 **"Sample"** 버튼을 클릭하면 예제 설정이 자동으로 로드됩니다.

---

## 📥 결과 다운로드

생성이 완료되면:
1. 오디오 플레이어에서 미리 듣기
2. 다운로드 버튼 (⬇️) 클릭하여 파일 저장
3. 공유 버튼 (🔗)으로 링크 생성

---

## ⚠️ 주의사항

### 생성 시간
- Infer Steps 60: 약 1-2분
- Infer Steps 100: 약 2-3분
- Audio Duration이 길수록 시간이 더 걸립니다

### 품질 vs 속도
- 높은 Infer Steps = 높은 품질, 느린 속도
- 낮은 Infer Steps = 낮은 품질, 빠른 속도

### 서버 상태
- 여러 사용자가 동시에 사용 시 대기 시간이 있을 수 있습니다
- 생성 중에는 페이지를 닫지 마세요

---

## 🎓 학습 자료

### 태그 작성 팁
1. **구체적으로 작성**: "energetic rock" 대신 "energetic electric rock guitar drums 140 BPM"
2. **장르 + 분위기 + 악기 + BPM** 조합 사용
3. **쉼표로 구분**: 각 태그를 쉼표로 명확히 분리
4. **중복 피하기**: 같은 의미의 단어 반복 X

### 가사 작성 팁
1. **구조 명확하게**: [verse], [chorus], [bridge] 태그 사용
2. **리듬 고려**: 음절 수와 운율 맞추기
3. **반복 활용**: 코러스는 반복해도 OK
4. **길이 조절**: 너무 길면 자연스럽지 않을 수 있음

---

## 🐛 문제 해결

### 음악이 생성되지 않아요
- 태그와 가사가 올바르게 입력되었는지 확인
- 샘플 버튼을 눌러 기본 설정 테스트
- 브라우저 새로고침 후 재시도

### 생성 시간이 너무 오래 걸려요
- Infer Steps를 30-40으로 낮춰보세요
- Audio Duration을 줄여보세요
- 다른 시간대에 다시 시도

### 원하는 스타일이 나오지 않아요
- 태그를 더 구체적으로 작성
- Guidance Scale을 20-25로 올려보세요
- 프리셋을 활용해보세요

---

## 📞 지원

**URL**: https://music.neuralgrid.kr/aoto/  
**타입**: AI Music Generation  
**모델**: ACE-Step 1.5  
**상태**: ✅ Production Ready

---

## 🎉 즐거운 음악 제작 되세요!

**ACE-Step 1.5로 여러분만의 독창적인 음악을 만들어보세요!** 🎵✨
