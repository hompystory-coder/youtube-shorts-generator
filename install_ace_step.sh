#!/bin/bash

# ACE-Step 1.5 음악 생성 웹서비스 자동 설치 스크립트
# 작성일: 2026-02-08
# 설치 위치: /home/music/aoto/
# 접속 URL: https://music.neuralgrid.kr/aoto

set -e  # 에러 발생 시 스크립트 중단

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 변수 설정
BASE_DIR="/home/music/aoto"
VENV_DIR="${BASE_DIR}/venv"
CHECKPOINTS_DIR="${BASE_DIR}/checkpoints"
OUTPUTS_DIR="${BASE_DIR}/outputs"
LOGS_DIR="${BASE_DIR}/logs"
CACHE_DIR="${BASE_DIR}/.cache/huggingface"
REPO_DIR="${BASE_DIR}/ACE-Step"
PORT=7866
GPU_ID=0

# 배너 출력
echo "======================================================"
echo "   ACE-Step 1.5 음악 생성 웹서비스 설치 스크립트"
echo "======================================================"
echo ""
echo "설치 위치: ${BASE_DIR}"
echo "접속 URL: https://music.neuralgrid.kr/aoto"
echo "포트: ${PORT}"
echo ""

# 사용자 확인
read -p "계속 진행하시겠습니까? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warning "설치가 취소되었습니다."
    exit 1
fi

# Step 1: 시스템 요구사항 확인
log_info "시스템 요구사항 확인 중..."

# Python 버전 확인
if ! command -v python3.10 &> /dev/null; then
    log_error "Python 3.10 이상이 필요합니다. 설치 후 다시 시도하세요."
    exit 1
fi
log_success "Python 3.10+ 확인 완료"

# Git 확인
if ! command -v git &> /dev/null; then
    log_error "Git이 설치되어 있지 않습니다. 설치 후 다시 시도하세요."
    exit 1
fi
log_success "Git 확인 완료"

# CUDA 확인 (선택사항)
if command -v nvidia-smi &> /dev/null; then
    log_success "NVIDIA GPU 확인 완료"
    nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
else
    log_warning "NVIDIA GPU를 찾을 수 없습니다. CPU 모드로 실행됩니다."
fi

# Step 2: 디렉터리 구조 생성
log_info "디렉터리 구조 생성 중..."

mkdir -p "${BASE_DIR}"
mkdir -p "${CHECKPOINTS_DIR}"
mkdir -p "${OUTPUTS_DIR}"
mkdir -p "${LOGS_DIR}"
mkdir -p "${CACHE_DIR}"

log_success "디렉터리 구조 생성 완료"

# Step 3: Python 가상환경 생성
log_info "Python 가상환경 생성 중..."

if [ -d "${VENV_DIR}" ]; then
    log_warning "가상환경이 이미 존재합니다. 건너뜁니다."
else
    python3.10 -m venv "${VENV_DIR}"
    log_success "가상환경 생성 완료"
fi

# 가상환경 활성화
source "${VENV_DIR}/bin/activate"

# pip 업그레이드
log_info "pip 업그레이드 중..."
pip install --upgrade pip
log_success "pip 업그레이드 완료"

# Step 4: PyTorch 설치 (CUDA 지원)
log_info "PyTorch (CUDA) 설치 중..."

if nvidia-smi &> /dev/null; then
    # GPU 사용 가능
    pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126
    log_success "PyTorch (CUDA) 설치 완료"
else
    # CPU만 사용
    pip3 install torch torchvision torchaudio
    log_success "PyTorch (CPU) 설치 완료"
fi

# Step 5: ACE-Step 저장소 클론
log_info "ACE-Step GitHub 저장소 클론 중..."

if [ -d "${REPO_DIR}" ]; then
    log_warning "저장소가 이미 존재합니다. 업데이트 중..."
    cd "${REPO_DIR}"
    git pull origin main
else
    cd "${BASE_DIR}"
    git clone https://github.com/ace-step/ACE-Step.git
    cd "${REPO_DIR}"
fi

log_success "ACE-Step 저장소 클론 완료"

# Step 6: ACE-Step 설치
log_info "ACE-Step 설치 중..."

pip install -e .

log_success "ACE-Step 설치 완료"

# Step 7: 추가 의존성 설치
log_info "추가 의존성 설치 중..."

# Hugging Face Hub
pip install huggingface-hub

# Gradio (보통 이미 설치되어 있음)
pip install gradio

log_success "추가 의존성 설치 완료"

# Step 8: 모델 체크포인트 다운로드
log_info "모델 체크포인트 확인 중..."

export HF_HOME="${CACHE_DIR}"

# 모델 존재 확인
if [ "$(ls -A ${CHECKPOINTS_DIR})" ]; then
    log_success "모델 체크포인트가 이미 존재합니다."
else
    log_info "모델 체크포인트 다운로드 중... (시간이 걸릴 수 있습니다)"
    
    # 첫 실행 시 자동으로 다운로드됨
    log_info "첫 실행 시 자동으로 다운로드됩니다."
fi

# Step 9: PM2 Ecosystem 설정 파일 생성
log_info "PM2 Ecosystem 설정 파일 생성 중..."

cat > "${BASE_DIR}/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: 'ace-step-music',
    script: '${VENV_DIR}/bin/acestep',
    cwd: '${BASE_DIR}',
    args: [
      '--checkpoint_path', '${CHECKPOINTS_DIR}',
      '--port', '${PORT}',
      '--server_name', '0.0.0.0',
      '--bf16', 'true',
      '--torch_compile', 'true',
      '--cpu_offload', 'false',
      '--device_id', '${GPU_ID}'
    ].join(' '),
    env: {
      CUDA_VISIBLE_DEVICES: '${GPU_ID}',
      HF_HOME: '${CACHE_DIR}',
      PYTHONPATH: '${REPO_DIR}',
    },
    max_memory_restart: '10G',
    error_file: '${LOGS_DIR}/error.log',
    out_file: '${LOGS_DIR}/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    autorestart: true,
    watch: false
  }]
};
EOF

log_success "PM2 Ecosystem 설정 파일 생성 완료"

# Step 10: PM2 서비스 시작
log_info "PM2 서비스 시작 중..."

# PM2 설치 확인
if ! command -v pm2 &> /dev/null; then
    log_warning "PM2가 설치되어 있지 않습니다. 설치 중..."
    npm install -g pm2
fi

# 기존 서비스 중지 (있을 경우)
pm2 delete ace-step-music 2>/dev/null || true

# 서비스 시작
cd "${BASE_DIR}"
pm2 start ecosystem.config.js

# PM2 상태 확인
pm2 status

log_success "PM2 서비스 시작 완료"

# Step 11: 테스트
log_info "서비스 테스트 중..."

sleep 10  # 서비스 시작 대기

# 포트 확인
if netstat -tuln | grep -q ":${PORT}"; then
    log_success "서비스가 포트 ${PORT}에서 실행 중입니다."
else
    log_error "서비스가 포트 ${PORT}에서 실행되지 않습니다. 로그를 확인하세요."
    pm2 logs ace-step-music --lines 50
    exit 1
fi

# Step 12: Nginx 설정 안내
echo ""
echo "======================================================"
log_success "ACE-Step 1.5 설치 완료!"
echo "======================================================"
echo ""
echo "다음 단계: Nginx 리버스 프록시 설정"
echo ""
echo "1. Nginx 설정 파일 생성:"
echo "   sudo nano /etc/nginx/sites-available/music-neuralgrid-aoto.conf"
echo ""
echo "2. 다음 내용 추가:"
echo "   ---"
cat << 'NGINX_CONFIG'
location /aoto/ {
    proxy_pass http://localhost:7866/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    client_max_body_size 100M;
    proxy_read_timeout 600s;
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;
    proxy_buffering off;
    proxy_request_buffering off;
}

location /aoto/outputs/ {
    alias /home/music/aoto/outputs/;
    autoindex off;
    expires 7d;
    add_header Cache-Control "public, immutable";
}
NGINX_CONFIG
echo "   ---"
echo ""
echo "3. 심볼릭 링크 생성:"
echo "   sudo ln -s /etc/nginx/sites-available/music-neuralgrid-aoto.conf /etc/nginx/sites-enabled/"
echo ""
echo "4. Nginx 재시작:"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo ""
echo "5. 브라우저에서 접속:"
echo "   https://music.neuralgrid.kr/aoto"
echo ""
echo "======================================================"
echo "유용한 명령어:"
echo "======================================================"
echo ""
echo "# 서비스 상태 확인"
echo "pm2 status"
echo ""
echo "# 로그 확인"
echo "pm2 logs ace-step-music"
echo ""
echo "# 서비스 재시작"
echo "pm2 restart ace-step-music"
echo ""
echo "# 서비스 중지"
echo "pm2 stop ace-step-music"
echo ""
echo "# GPU 사용률 확인"
echo "watch -n 1 nvidia-smi"
echo ""
echo "======================================================"
echo ""

log_success "설치가 완료되었습니다! 🎵"

# 가상환경 비활성화
deactivate
