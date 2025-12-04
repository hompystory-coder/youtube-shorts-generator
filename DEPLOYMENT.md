# SSH 서버 배포 가이드

## 서버 정보
- **서버 IP**: 115.91.5.140
- **사용자**: azamans
- **포트**: 3001
- **Node.js**: v20.19.6
- **npm**: 10.8.2

---

## 1️⃣ 초기 배포

### SSH 접속
```bash
ssh azamans@115.91.5.140
# 비밀번호: 7009011226119
```

### PM2 설치 (최초 1회만)
```bash
sudo npm install -g pm2
pm2 --version
```

### 프로젝트 클론
```bash
cd ~
git clone https://github.com/hompystory-coder/youtube-shorts-generator.git
cd youtube-shorts-generator
```

### 의존성 설치
```bash
npm install
```

### 로그 디렉토리 생성
```bash
mkdir -p logs
```

### PM2로 서버 시작
```bash
pm2 start ecosystem.config.cjs
```

### PM2 설정 저장 (재부팅 시 자동 시작)
```bash
pm2 save
pm2 startup
# 출력된 명령어 실행 (sudo로 시작하는 명령어)
```

---

## 2️⃣ 서버 관리 명령어

### 상태 확인
```bash
pm2 status
pm2 list
```

### 로그 확인
```bash
pm2 logs youtube-shorts-generator --nostream
pm2 logs youtube-shorts-generator --lines 50
```

### 서버 재시작
```bash
pm2 restart youtube-shorts-generator
```

### 서버 중지
```bash
pm2 stop youtube-shorts-generator
```

### 서버 삭제
```bash
pm2 delete youtube-shorts-generator
```

---

## 3️⃣ 업데이트 배포

### 방법 1: 자동 배포 (권장)
```bash
cd ~/youtube-shorts-generator
npm run deploy
```

### 방법 2: 수동 배포
```bash
cd ~/youtube-shorts-generator
git pull origin main
npm install
pm2 restart youtube-shorts-generator
```

---

## 4️⃣ 포트 및 방화벽 설정

### 포트 확인
```bash
sudo netstat -tulpn | grep 3001
```

### 방화벽 포트 개방 (Ubuntu UFW)
```bash
sudo ufw allow 3001/tcp
sudo ufw status
```

---

## 5️⃣ Nginx 리버스 프록시 설정 (선택사항)

도메인을 연결하려면 Nginx를 설정하세요:

```bash
sudo nano /etc/nginx/sites-available/youtube-shorts-generator
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/youtube-shorts-generator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6️⃣ 접속 URL

### 직접 접속 (포트 포함)
```
http://115.91.5.140:3001
```

### Nginx 설정 후 (도메인)
```
http://your-domain.com
```

---

## 7️⃣ 문제 해결

### 포트가 이미 사용 중
```bash
# 3001 포트 사용 중인 프로세스 확인
sudo lsof -i :3001

# 프로세스 종료
sudo kill -9 <PID>
```

### PM2 프로세스 초기화
```bash
pm2 kill
pm2 start ecosystem.config.cjs
```

### 전체 재설치
```bash
cd ~
rm -rf youtube-shorts-generator
git clone https://github.com/hompystory-coder/youtube-shorts-generator.git
cd youtube-shorts-generator
npm install
pm2 start ecosystem.config.cjs
```

---

## 8️⃣ 모니터링

### 실시간 모니터링
```bash
pm2 monit
```

### CPU/메모리 사용량
```bash
pm2 status
```

### 로그 스트리밍
```bash
pm2 logs youtube-shorts-generator
```

---

## 📝 참고사항

1. **포트 3001 사용**: 3000번은 다른 서비스에서 사용 중일 수 있어 3001번 사용
2. **방화벽 설정**: 외부에서 접속하려면 방화벽에서 3001번 포트 개방 필요
3. **Nginx 권장**: 프로덕션 환경에서는 Nginx 리버스 프록시 사용 권장
4. **PM2 자동 시작**: `pm2 startup` 명령으로 서버 재부팅 시 자동 시작 설정
5. **로그 관리**: `logs/` 디렉토리에 로그 파일 자동 생성

---

## 🚀 Quick Start

```bash
# 1. SSH 접속
ssh azamans@115.91.5.140

# 2. PM2 설치 (최초 1회)
sudo npm install -g pm2

# 3. 프로젝트 클론
git clone https://github.com/hompystory-coder/youtube-shorts-generator.git
cd youtube-shorts-generator

# 4. 설치 및 시작
npm install
mkdir -p logs
pm2 start ecosystem.config.cjs
pm2 save

# 5. 접속 확인
curl http://localhost:3001
```

**배포 완료!** 🎉

브라우저에서 `http://115.91.5.140:3001` 접속
