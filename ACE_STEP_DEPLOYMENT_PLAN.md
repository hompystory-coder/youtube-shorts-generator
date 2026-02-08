# ACE-Step 1.5 음악 생성 웹서비스 구축 계획

## 📋 프로젝트 개요

**목표**: Ace-step 1.5 오픈소스를 활용한 독립적인 음악 생성 웹서비스 구축

### 핵심 정보
- **설치 위치**: `/home/music/aoto/`
- **접속 URL**: `https://music.neuralgrid.kr/aoto`
- **포트**: 7866 (내부), 443 (HTTPS, 외부)
- **독립성**: 기존 시스템(shorts)과 완전 분리

---

## 🎵 ACE-Step 1.5 주요 특징

### 성능 비교
| 모델 | 가사 일치율 | SongEval | 생성 속도 (A100, 4분 곡) |
|------|------------|----------|------------------------|
| Suno v5 | 34.2% | 4.72/5 | ~4분 |
| MiniMax 2.0 | 29.5% | 4.61/5 | ~2분 |
| **ACE-Step 1.5** | **26.3%** | **4.72/5** | **2초** ⚡ |

### 하드웨어 요구사항
- **최소 VRAM**: 4GB
- **RTX 4090**: 1분 음악 → 1.74초
- **RTX 3090**: 1분 음악 → 4.70초
- **A100**: 1분 음악 → 2.20초

### 주요 기능
✅ **Text2Music**: 텍스트 설명 → 음악 생성  
✅ **Lyric2Vocal**: 가사 → 보컬 생성 (LoRA)  
✅ **Repainting**: 특정 구간 재생성  
✅ **Lyric Editing**: 가사 수정 (멜로디 유지)  
✅ **Extend**: 음악 확장 (앞/뒤)  
✅ **Variations**: 변형 생성  
✅ **Voice Cloning**: 음성 복제  
✅ **LoRA Training**: 커스텀 스타일 학습  
✅ **50+ 언어** 지원

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│          https://music.neuralgrid.kr/aoto (HTTPS)           │
│                  (Nginx Reverse Proxy)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│             ACE-Step 1.5 Gradio Web UI (Port 7866)          │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │Text2Music│ Retake   │ Repaint  │  Edit    │ Extend   │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              ACE-Step 1.5 Core Model (GPU)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  LM Planner → DiT Generator → Audio Output             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  • Model: /home/music/aoto/checkpoints/                     │
│  • Output: /home/music/aoto/outputs/                        │
│  • Cache: /home/music/aoto/.cache/                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 설치 단계

### Phase 1: 환경 구축

#### 1.1 디렉터리 구조 생성

```bash
# SSH로 원격 서버 접속
ssh azamans@115.91.5.140

# 기본 디렉터리 구조 생성
mkdir -p /home/music/aoto/{checkpoints,outputs,logs,.cache/huggingface}
cd /home/music/aoto
```

#### 1.2 Python 가상환경 생성

```bash
# Python 3.10 확인
python3.10 --version  # Python 3.10+ 필요

# 가상환경 생성
python3.10 -m venv venv

# 가상환경 활성화
source venv/bin/activate

# pip 업그레이드
pip install --upgrade pip
```

#### 1.3 ACE-Step 1.5 설치

```bash
# GitHub 저장소 클론
git clone https://github.com/ace-step/ACE-Step.git
cd ACE-Step

# 최신 버전 확인 (v1.5)
git checkout main

# PyTorch CUDA 설치 (GPU 사용 시)
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126

# ACE-Step 설치
pip install -e .

# 추가 의존성
pip install triton-windows  # Windows의 경우 (Linux는 불필요)
```

#### 1.4 모델 체크포인트 다운로드

```bash
# 환경변수 설정
export HF_HOME="/home/music/aoto/.cache/huggingface"

# ACE-Step 실행 (자동으로 모델 다운로드)
acestep --checkpoint_path /home/music/aoto/checkpoints --port 7866 --device_id 0
```

**수동 다운로드 (선택사항)**:
```bash
# Hugging Face CLI 설치
pip install huggingface-hub

# 모델 다운로드
huggingface-cli download ACE-Step/ACE-Step-v1.5-3.5B --local-dir /home/music/aoto/checkpoints
```

---

### Phase 2: 서비스 설정

#### 2.1 PM2 Ecosystem 설정

```bash
# /home/music/aoto/ecosystem.config.js 생성
cat > /home/music/aoto/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'ace-step-music',
    script: '/home/music/aoto/venv/bin/acestep',
    cwd: '/home/music/aoto',
    args: [
      '--checkpoint_path', '/home/music/aoto/checkpoints',
      '--port', '7866',
      '--server_name', '0.0.0.0',
      '--bf16', 'true',
      '--torch_compile', 'true',
      '--cpu_offload', 'false',
      '--device_id', '0'
    ].join(' '),
    env: {
      CUDA_VISIBLE_DEVICES: '0',
      HF_HOME: '/home/music/aoto/.cache/huggingface',
      PYTHONPATH: '/home/music/aoto/ACE-Step',
    },
    max_memory_restart: '10G',
    error_file: '/home/music/aoto/logs/error.log',
    out_file: '/home/music/aoto/logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    autorestart: true,
    watch: false
  }]
};
EOF
```

#### 2.2 PM2로 서비스 시작

```bash
# PM2 설치 (전역)
npm install -g pm2

# 서비스 시작
cd /home/music/aoto
pm2 start ecosystem.config.js

# 서비스 상태 확인
pm2 status

# 로그 확인
pm2 logs ace-step-music --lines 100
```

#### 2.3 Nginx 리버스 프록시 설정

```bash
# Nginx 설정 파일 생성
sudo nano /etc/nginx/sites-available/music-neuralgrid-aoto.conf
```

```nginx
# /etc/nginx/sites-available/music-neuralgrid-aoto.conf

# ACE-Step 음악 생성 서비스
location /aoto/ {
    # 기본 프록시 설정
    proxy_pass http://localhost:7866/;
    proxy_http_version 1.1;
    
    # 헤더 설정
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Gradio WebSocket 지원
    proxy_cache_bypass $http_upgrade;
    
    # 대용량 파일 업로드/다운로드 지원
    client_max_body_size 100M;
    proxy_read_timeout 600s;
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;
    
    # 버퍼 설정
    proxy_buffering off;
    proxy_request_buffering off;
}

# 생성된 음악 파일 서빙
location /aoto/outputs/ {
    alias /home/music/aoto/outputs/;
    autoindex off;
    expires 7d;
    add_header Cache-Control "public, immutable";
}
```

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/music-neuralgrid-aoto.conf /etc/nginx/sites-enabled/

# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl reload nginx
```

---

### Phase 3: 보안 및 최적화

#### 3.1 방화벽 설정

```bash
# 포트 7866은 외부 접근 차단 (localhost만 허용)
sudo ufw deny 7866/tcp
sudo ufw allow 443/tcp  # HTTPS는 허용
sudo ufw reload
```

#### 3.2 SSL 인증서 (Let's Encrypt)

```bash
# Certbot 설치 (이미 설치되어 있을 가능성)
sudo apt install certbot python3-certbot-nginx

# 인증서 발급/갱신 (music.neuralgrid.kr 도메인)
sudo certbot --nginx -d music.neuralgrid.kr
```

#### 3.3 로그 로테이션

```bash
# /etc/logrotate.d/ace-step-music 생성
sudo nano /etc/logrotate.d/ace-step-music
```

```
/home/music/aoto/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    missingok
    copytruncate
}
```

---

## 🧪 테스트 계획

### 1. 기본 기능 테스트

#### 1.1 Text2Music 테스트
```
입력:
- Tags: "upbeat pop, electronic, happy, summer vibes"
- Lyrics: "[Verse] Walking on sunshine [Chorus] Feel the rhythm tonight"
- Duration: 60 seconds

확인:
- 음악 생성 성공 ✓
- 가사 일치 ✓
- 스타일 일치 ✓
- 다운로드 가능 ✓
```

#### 1.2 Retake 테스트
```
입력:
- 기존 생성 음악 선택
- Variance: 0.5

확인:
- 유사하지만 다른 변형 생성 ✓
- 스타일 유지 ✓
```

#### 1.3 Repainting 테스트
```
입력:
- Source Audio: 업로드 또는 이전 생성
- Start Time: 10s
- End Time: 20s

확인:
- 특정 구간만 재생성 ✓
- 나머지 구간 유지 ✓
```

### 2. 성능 테스트

```bash
# GPU 메모리 사용량 확인
nvidia-smi -l 1

# CPU/메모리 사용량 모니터링
htop
```

**예상 성능**:
- **1분 음악 생성 시간**: 4-5초 (RTX 3090 기준)
- **VRAM 사용량**: 6-8GB
- **동시 요청 처리**: 1개 (순차 처리)

### 3. 브라우저 접속 테스트

```
1. 브라우저에서 접속: https://music.neuralgrid.kr/aoto
2. Text2Music 탭에서 음악 생성 테스트
3. 생성된 음악 재생 및 다운로드 확인
4. 다른 탭(Retake, Repaint, Edit, Extend) 기능 테스트
```

---

## 📊 모니터링

### PM2 모니터링

```bash
# 실시간 상태 확인
pm2 monit

# 로그 확인
pm2 logs ace-step-music

# 리소스 사용량
pm2 show ace-step-music
```

### Nginx 로그

```bash
# 접속 로그
sudo tail -f /var/log/nginx/access.log | grep "/aoto"

# 에러 로그
sudo tail -f /var/log/nginx/error.log
```

### GPU 모니터링

```bash
# GPU 사용률 실시간 확인
watch -n 1 nvidia-smi
```

---

## 🐛 트러블슈팅

### 문제 1: 모델 다운로드 실패

**증상**: `Error downloading model from Hugging Face`

**해결**:
```bash
# Hugging Face 토큰 설정
export HUGGING_FACE_HUB_TOKEN="your_token_here"

# 수동 다운로드
huggingface-cli download ACE-Step/ACE-Step-v1.5-3.5B --local-dir /home/music/aoto/checkpoints
```

### 문제 2: CUDA 메모리 부족

**증상**: `CUDA out of memory`

**해결**:
```bash
# CPU Offload 활성화
acestep --checkpoint_path /home/music/aoto/checkpoints --port 7866 --cpu_offload true

# 또는 더 작은 배치 크기 사용
# ecosystem.config.js에서 args에 추가:
# '--cpu_offload', 'true'
```

### 문제 3: Gradio 인터페이스 접근 불가

**증상**: `502 Bad Gateway` 또는 연결 불가

**해결**:
```bash
# 서비스 상태 확인
pm2 status ace-step-music

# 포트 확인
sudo netstat -tuln | grep 7866

# Nginx 로그 확인
sudo tail -f /var/log/nginx/error.log

# PM2 재시작
pm2 restart ace-step-music
```

### 문제 4: 음악 생성 실패

**증상**: `Generation failed`

**해결**:
```bash
# 로그 확인
pm2 logs ace-step-music --lines 100

# 디스크 공간 확인
df -h /home/music/aoto

# 권한 확인
ls -la /home/music/aoto/outputs/
```

---

## 🔄 유지보수

### 정기 작업

#### 1. 로그 정리 (월 1회)
```bash
# 오래된 로그 삭제
find /home/music/aoto/logs/ -name "*.log" -mtime +30 -delete

# 오래된 생성 음악 삭제 (90일 이상)
find /home/music/aoto/outputs/ -name "*.mp3" -mtime +90 -delete
find /home/music/aoto/outputs/ -name "*.wav" -mtime +90 -delete
```

#### 2. 모델 업데이트 (필요 시)
```bash
cd /home/music/aoto/ACE-Step
git pull origin main

# 의존성 업데이트
source /home/music/aoto/venv/bin/activate
pip install --upgrade -e .

# 서비스 재시작
pm2 restart ace-step-music
```

#### 3. 백업 (주 1회)
```bash
# 설정 파일 백업
tar -czf /home/music/backups/aoto-config-$(date +%Y%m%d).tar.gz \
    /home/music/aoto/ecosystem.config.js \
    /etc/nginx/sites-available/music-neuralgrid-aoto.conf

# 중요한 생성 음악 백업
rsync -av /home/music/aoto/outputs/ /home/music/backups/aoto-outputs/
```

---

## 📈 확장 계획 (Phase 4-6)

### Phase 4: 커스텀 기능 추가
- **Custom LoRA 학습**: 사용자 음악 스타일 학습
- **Batch Generation**: 여러 곡 동시 생성
- **API 엔드포인트**: REST API 제공

### Phase 5: 사용자 관리
- **사용자 인증**: 로그인/회원가입
- **생성 이력 관리**: 사용자별 생성 음악 저장
- **사용량 제한**: 일일 생성 제한 설정

### Phase 6: 고급 기능
- **Voice Cloning**: 사용자 음성 복제
- **Stem Generation**: 개별 악기 트랙 생성
- **Cover Generation**: 기존 곡 커버 생성

---

## 📚 참고 자료

### 공식 문서
- **GitHub**: https://github.com/ace-step/ACE-Step
- **Hugging Face**: https://huggingface.co/collections/ACE-Step/ace-step-15
- **데모**: https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- **논문**: https://arxiv.org/abs/2602.00744

### 관련 서비스
- **Shorts 영상 생성**: https://shorts.neuralgrid.kr/shorts-generate
- **Shorts 설정**: https://shorts.neuralgrid.kr/shorts-settings

### 기존 TTS 비교 분석
- **TTS_COMPARISON_ANALYSIS.md**: Minimax vs Fish Audio 비교
- **OPEN_SOURCE_TTS_COMPARISON.md**: Qwen3-TTS, Kokoro, Coqui 비교

---

## ✅ 체크리스트

### 설치 전
- [ ] GPU 메모리 확인 (최소 6GB 권장)
- [ ] 디스크 공간 확인 (최소 50GB)
- [ ] Python 3.10+ 설치 확인
- [ ] CUDA 12.6+ 설치 확인

### 설치 중
- [ ] 디렉터리 구조 생성
- [ ] 가상환경 생성 및 활성화
- [ ] ACE-Step 1.5 설치
- [ ] 모델 체크포인트 다운로드
- [ ] PM2 서비스 설정
- [ ] Nginx 리버스 프록시 설정

### 설치 후
- [ ] 기본 기능 테스트
- [ ] 성능 테스트
- [ ] 브라우저 접속 확인
- [ ] 로그 모니터링 설정
- [ ] 백업 스크립트 설정

---

## 🚀 다음 단계

1. **즉시 실행**: 이 계획서를 따라 설치 시작
2. **테스트**: 기본 기능 확인 후 피드백
3. **최적화**: 성능 모니터링 및 튜닝
4. **확장**: 커스텀 기능 추가 계획

---

**작성일**: 2026-02-08  
**작성자**: GenSpark AI Developer  
**버전**: 1.0  
**커밋**: (설치 후 업데이트 예정)  
**브랜치**: genspark_ai_developer
