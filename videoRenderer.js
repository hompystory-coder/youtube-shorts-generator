// 로컬 FFmpeg 기반 비디오 렌더러
// Shotstack API 비용 제로 - 완전 무료 로컬 처리
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';  // 동기 fs 메서드용
import { fileURLToPath } from 'url';
import { createWriteStream, existsSync } from 'fs';
import axios from 'axios';
import { spawn } from 'child_process';
// 🎨 Puppeteer 렌더러 (애니메이션 지원)
import { PuppeteerRenderer } from './puppeteerRenderer.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 출력 디렉토리 설정
const BASE_OUTPUT_DIR = process.env.OUTPUT_DIR || '/tmp/outputs';
const OUTPUT_DIR = path.join(BASE_OUTPUT_DIR, 'videos');
const TEMP_DIR = path.join(BASE_OUTPUT_DIR, 'temp');

console.log('🎬 VideoRenderer initialized');
console.log(`📂 BASE_OUTPUT_DIR: ${BASE_OUTPUT_DIR}`);
console.log(`📂 OUTPUT_DIR: ${OUTPUT_DIR}`);
console.log(`📂 TEMP_DIR: ${TEMP_DIR}`);

/**
 * 비디오 렌더러 클래스
 * - 로컬 FFmpeg 사용으로 API 비용 제로
 * - 자막/제목 2줄 중앙 정렬 지원
 * - 배경 이미지, 음악, 효과 지원
 */
class VideoRenderer {
  constructor() {
    this.ensureDirs();
  }

  /**
   * 필요한 디렉토리 생성
   */
  async ensureDirs() {
    try {
      await fs.mkdir(OUTPUT_DIR, { recursive: true });
      await fs.mkdir(TEMP_DIR, { recursive: true });
      console.log('✅ 비디오 출력 디렉토리 준비 완료');
    } catch (error) {
      console.error('❌ 디렉토리 생성 실패:', error);
    }
  }

  /**
   * URL에서 파일 다운로드 (로컬 파일 경로도 지원)
   */
  async downloadFile(url, outputPath) {
    try {
      // 프록시 URL인 경우 (로컬 API 서버로 변환)
      if (url.startsWith('/api/')) {
        url = `http://localhost:4001${url}`;
        console.log(`🔗 프록시 URL 변환: ${url}`);
      }
      
      // 로컬 파일 경로인 경우 (/ 또는 ./ 로 시작하지만 /api/ 제외)
      if ((url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) && 
          !url.startsWith('http://') && !url.startsWith('https://')) {
        // 상대 경로를 절대 경로로 변환
        let sourcePath = url;
        if (url.startsWith('/outputs/')) {
          // /outputs/ 경로는 환경 변수의 OUTPUT_DIR로 변환
          const OUTPUT_BASE = process.env.OUTPUT_DIR || '/tmp/outputs';
          sourcePath = path.join(OUTPUT_BASE, url.replace('/outputs/', ''));
          console.log(`🔗 경로 변환: ${url} → ${sourcePath}`);
        } else if (!path.isAbsolute(url)) {
          sourcePath = path.resolve(url);
        }
        
        // 파일이 존재하는지 확인
        if (!existsSync(sourcePath)) {
          throw new Error(`로컬 파일이 존재하지 않습니다: ${sourcePath}`);
        }
        
        // 파일 복사
        await fs.copyFile(sourcePath, outputPath);
        console.log(`✅ 로컬 파일 복사 완료: ${path.basename(sourcePath)}`);
        return;
      }
      
      // HTTP/HTTPS URL인 경우
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
      });

      const writer = createWriteStream(outputPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      console.error(`❌ 파일 다운로드 실패: ${url}`, error.message);
      throw error;
    }
  }

  /**
   * 비디오 파일에 오디오 스트림이 있는지 확인
   */
  async checkHasAudio(videoPath) {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          console.warn(`⚠️ ffprobe 실패, 오디오 없음으로 간주: ${err.message}`);
          resolve(false);
          return;
        }
        
        // 오디오 스트림 찾기
        const hasAudio = metadata.streams.some(stream => stream.codec_type === 'audio');
        resolve(hasAudio);
      });
    });
  }

  /**
   * 폰트 파일 경로 가져오기 (폴백 지원)
   */
  getFontPath(fontFamily) {
    console.log(`🔍 폰트 검색: "${fontFamily}"`);
    
    // path는 이미 상단에 import됨
    const customFontsPath = path.join(__dirname, '../..', 'fonts');
    
    // 폰트 매핑: 요청된 폰트 -> { path, file }
    const fontMap = {
      // === 커스텀 Google Fonts (다운로드한 실제 폰트) ===
      'BlackHanSans': { path: customFontsPath, file: 'BlackHanSans-Regular.ttf' },
      'DoHyeon': { path: customFontsPath, file: 'DoHyeon-Regular.ttf' },
      'Jua': { path: customFontsPath, file: 'Jua-Regular.ttf' },
      
      // Gaegu 손글씨 폰트 (별칭 포함)
      'Gaegu': { path: customFontsPath, file: 'Gaegu-Regular.ttf' },
      'GaeguRegular': { path: customFontsPath, file: 'Gaegu-Regular.ttf' },
      'GaeguBold': { path: customFontsPath, file: 'Gaegu-Bold.ttf' },
      
      // 기타 손글씨 폰트
      'CuteFont': { path: customFontsPath, file: 'CuteFont-Regular.ttf' },
      'KirangHaerang': { path: customFontsPath, file: 'KirangHaerang-Regular.ttf' },
      'GamjaFlower': { path: customFontsPath, file: 'GamjaFlower-Regular.ttf' },
      'YeonSung': { path: customFontsPath, file: 'YeonSung-Regular.ttf' },
      'Stylish': { path: customFontsPath, file: 'Stylish-Regular.ttf' },
      
      // Sunflower 폰트 (별칭 포함)
      'Sunflower': { path: customFontsPath, file: 'Sunflower-Light.ttf' },
      'SunflowerLight': { path: customFontsPath, file: 'Sunflower-Light.ttf' },
      'SunflowerMedium': { path: customFontsPath, file: 'Sunflower-Medium.ttf' },
      'SunflowerBold': { path: customFontsPath, file: 'Sunflower-Bold.ttf' },
      
      // === Nanum 계열 (시스템 설치) ===
      'NanumGothicBold': { path: '/usr/share/fonts/truetype/nanum', file: 'NanumGothicBold.ttf' },
      'NanumGothic': { path: '/usr/share/fonts/truetype/nanum', file: 'NanumGothic.ttf' },
      'NanumBarunGothicBold': { path: '/usr/share/fonts/truetype/nanum', file: 'NanumBarunGothicBold.ttf' },
      'NanumBarunGothic': { path: '/usr/share/fonts/truetype/nanum', file: 'NanumBarunGothic.ttf' },
      'NanumMyeongjoBold': { path: '/usr/share/fonts/truetype/nanum', file: 'NanumMyeongjoBold.ttf' },
      'NanumMyeongjo': { path: '/usr/share/fonts/truetype/nanum', file: 'NanumMyeongjo.ttf' },
      'NanumSquare': { path: '/usr/share/fonts/truetype/nanum', file: 'NanumSquareR.ttf' },
      'NanumSquareB': { path: '/usr/share/fonts/truetype/nanum', file: 'NanumSquareB.ttf' },
      'NanumSquareRound': { path: '/usr/share/fonts/truetype/nanum', file: 'NanumSquareRoundR.ttf' },
      
      // === Noto Sans CJK KR (시스템 설치) ===
      'Noto Sans KR': { path: '/usr/share/fonts/opentype/noto', file: 'NotoSansCJK-Regular.ttc' },
      'Noto Sans KR Bold': { path: '/usr/share/fonts/opentype/noto', file: 'NotoSansCJK-Bold.ttc' },
      'Noto Sans KR Medium': { path: '/usr/share/fonts/opentype/noto', file: 'NotoSansCJK-Medium.ttc' },
      'Noto Sans KR Black': { path: '/usr/share/fonts/opentype/noto', file: 'NotoSansCJK-Black.ttc' },
      'Noto Serif KR': { path: '/usr/share/fonts/opentype/noto', file: 'NotoSerifCJK-Regular.ttc' },
    };

    // 폰트 찾기
    const fontInfo = fontMap[fontFamily];
    
    if (fontInfo) {
      const fullPath = `${fontInfo.path}/${fontInfo.file}`;
      console.log(`   ✅ 매핑됨: ${fullPath}`);
      return fullPath;
    }
    
    // 기본 폴백: NanumGothicBold (안정적인 한글 폰트)
    const fallbackPath = '/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf';
    console.log(`   ⚠️ 폰트 없음, 폴백 사용: ${fallbackPath}`);
    return fallbackPath;
  }

  /**
   * 텍스트를 2줄로 분리 (한글 기준 약 20자)
   */
  splitTextToTwoLines(text, maxCharsPerLine = 20) {
    console.log(`📝 텍스트 분리 시도: "${text}" (길이: ${text.length}, 최대: ${maxCharsPerLine})`);
    
    if (text.length <= maxCharsPerLine) {
      console.log(`   ✅ 짧은 텍스트, 분리 안함`);
      return text;
    }

    // 중간 지점 찾기
    const midPoint = Math.floor(text.length / 2);
    
    // 띄어쓰기나 구두점을 찾아서 자연스럽게 나누기
    let splitPoint = midPoint;
    for (let i = midPoint; i < text.length && i < midPoint + 10; i++) {
      if (text[i] === ' ' || text[i] === ',' || text[i] === '.' || text[i] === '!' || text[i] === '?') {
        splitPoint = i + 1;
        break;
      }
    }

    const firstLine = text.substring(0, splitPoint).trim();
    const secondLine = text.substring(splitPoint).trim();
    const result = `${firstLine}\n${secondLine}`;
    
    console.log(`   ✂️ 텍스트 분리 완료: "${firstLine}" / "${secondLine}"`);
    
    return result;
  }

  /**
   * 긴 텍스트를 2줄로 자동 분리 (중앙 정렬용)
   * 단어 기준으로 균등 분리
   */
  splitTextIntoTwoLines(text, maxCharsPerLine = 20) {
    // 자막: 무조건 1줄 (20-25자 권장)
    // 제목: maxCharsPerLine 기준으로 2줄 허용
    
    // 텍스트가 짧으면 1줄로 반환
    if (text.length <= maxCharsPerLine) {
      console.log(`   ✅ 1줄 표시: "${text}" (${text.length}자)`);
      return [text];
    }
    
    // 공백으로 단어 분리
    const words = text.split(' ');
    if (words.length === 1) {
      // 단어가 하나면 그대로 1줄로
      console.log(`   ✅ 1줄 표시 (단일 단어): "${text}" (${text.length}자)`);
      return [text];
    }
    
    // 중간 지점 찾기 (균등 분배)
    let firstLine = '';
    let secondLine = '';
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = firstLine ? firstLine + ' ' + word : word;
      
      if (testLine.length <= maxCharsPerLine || firstLine === '') {
        firstLine = testLine;
      } else {
        secondLine += (secondLine ? ' ' : '') + word;
      }
    }
    
    if (secondLine) {
      console.log(`   ✅ 2줄 분리:\n      1줄: "${firstLine}" (${firstLine.length}자)\n      2줄: "${secondLine}" (${secondLine.length}자)`);
      return [firstLine, secondLine];
    }
    
    console.log(`   ✅ 1줄 표시: "${firstLine}" (${firstLine.length}자)`);
    return [firstLine];
  }

  /**
   * 자막 텍스트를 FFmpeg 필터 형식으로 변환
   * 2줄 중앙 정렬, 그림자 효과, 테두리 지원
   */
  createSubtitleFilter(text, settings = {}) {
    console.log(`\n🎨 [자막 필터 생성] 원본 텍스트: "${text}"`);
    
    const {
      fontFamily = 'NanumGothicBold',
      fontSize = 56,
      color,          // 프론트엔드에서 color로 전달
      fontColor,      // 또는 fontColor로 전달 (호환성)
      position = 'center',  // ⭐ 자막 위치: 'top', 'center', 'bottom'
      strokeWidth,    // 프론트엔드에서 strokeWidth로 전달
      strokeColor,    // 프론트엔드에서 strokeColor로 전달
      borderWidth,    // 또는 borderWidth로 전달 (호환성)
      borderColor,    // 또는 borderColor로 전달 (호환성)
      charsPerLine = 15,  // ⭐ 한 줄당 최대 글자 수 (기본값 15)
      maxLines = 2        // ⭐ 최대 줄 수 (기본값 2)
    } = settings;
    
    // ⭐ position에 따라 yOffset 계산 (1080x1920 쇼츠 기준)
    // FFmpeg drawtext의 y 좌표: y=h-yOffset (화면 하단 기준)
    // 1920px 높이 기준:
    //   - 상단: y=h-1700 = 220px (상단에서 220px)
    //   - 중앙: y=h-960 = 960px (정중앙)
    //   - 하단: y=h-200 = 1720px (하단에서 200px)
    let yOffset;
    switch (position) {
      case 'top':
        yOffset = 1700;  // 상단: 화면 상단에서 220px 아래
        break;
      case 'bottom':
        yOffset = 200;  // 하단: 화면 하단에서 200px 위
        break;
      case 'center':
      default:
        yOffset = 960;  // 중앙: 화면 정중앙 (1920/2)
        break;
    }
    
    console.log(`   🎯 자막 위치: ${position} → yOffset: ${yOffset}`);
    
    // ⭐ 최대 글자 수 제한 적용 (charsPerLine * maxLines)
    const maxTotalChars = charsPerLine * maxLines;
    if (text.length > maxTotalChars) {
      text = text.substring(0, maxTotalChars) + '...';
      console.log(`   ⚠️  자막이 ${maxTotalChars}자(${charsPerLine}자×${maxLines}줄)로 제한됨: "${text}"`);
    }
    
    // color/fontColor 매핑 (color 우선)
    const finalFontColor = color !== undefined ? color : (fontColor !== undefined ? fontColor : 'white');
    
    // strokeWidth/strokeColor를 borderWidth/borderColor로 매핑
    const finalBorderWidth = strokeWidth !== undefined ? strokeWidth : (borderWidth !== undefined ? borderWidth : 4);
    const finalBorderColor = strokeColor !== undefined ? strokeColor : (borderColor !== undefined ? borderColor : 'black');
    
    // 그림자 강제 제거 (사용자 요청)
    const shadowX = 0;
    const shadowY = 0;

    console.log(`   설정: fontSize=${fontSize}, fontFamily=${fontFamily}, fontColor=${finalFontColor}, yOffset=${yOffset}, borderWidth=${finalBorderWidth}, borderColor=${finalBorderColor}, charsPerLine=${charsPerLine}, maxLines=${maxLines}`);

    // 폰트 파일 경로 가져오기
    const fontPath = this.getFontPath(fontFamily);
    console.log(`   폰트 경로: ${fontPath}`);

    // ✨ 자막 분할 로직: \n 기준 우선 처리
    let lines;
    if (text.includes('\n')) {
      // 백엔드에서 이미 분할된 자막 (subtitles 배열)
      lines = text.split('\n').filter(line => line.trim());
      console.log(`   ✅ \\n 기준 자막 분할: ${lines.length}줄`);
      lines.forEach((line, i) => {
        console.log(`     ${i+1}줄: "${line}" (${line.length}자)`);
      });
    } else if (text.length <= charsPerLine) {
      // charsPerLine 이하는 1줄
      lines = [text];
      console.log(`   자막 1줄 표시: "${text}" (${text.length}자)`);
    } else {
      // charsPerLine 초과는 2줄로 분할
      const mid = Math.floor(text.length / 2);
      let splitIndex = mid;
      
      // 중간 지점 앞뒤 5자 범위 내에서 공백 찾기
      for (let j = mid - 5; j <= mid + 5 && j < text.length; j++) {
        if (j > 0 && (text[j] === ' ' || text[j] === ',' || text[j] === '.')) {
          splitIndex = j;
          break;
        }
      }
      
      const firstLine = text.substring(0, splitIndex).trim();
      const secondLine = text.substring(splitIndex).trim();
      lines = [firstLine, secondLine];
      console.log(`   자막 2줄 표시:`);
      console.log(`     1줄: "${firstLine}" (${firstLine.length}자)`);
      console.log(`     2줄: "${secondLine}" (${secondLine.length}자)`);
    }

    // 각 줄을 이스케이프
    const escapedLines = lines.map(line => 
      line
        .replace(/\\/g, '\\\\')
        .replace(/'/g, '"')  // 작은따옴표를 큰따옴표로 변환 (FFmpeg 필터 호환성)
        .replace(/:/g, '\\:')
    );

    // 줄 간격 (픽셀)
    const lineSpacing = fontSize * 1.2;

    // 2줄인 경우 첫 번째 줄을 위로, 두 번째 줄을 아래로
    const filters = escapedLines.map((escapedLine, index) => {
      const yPos = lines.length === 1 
        ? `h-${yOffset}` // 1줄이면 그대로
        : `h-${yOffset + lineSpacing * (lines.length - 1 - index)}`; // 2줄이면 첫줄 위, 둘째줄 아래

      // 테두리가 0이면 bordercolor 제외
      let drawtextCmd = `drawtext=` +
        `text='${escapedLine}':` +
        `fontfile=${fontPath}:` +
        `fontsize=${fontSize}:` +
        `fontcolor=${finalFontColor}:` +
        `x=(w-text_w)/2:` +
        `y=${yPos}`;
      
      // 테두리가 있을 때만 borderw와 bordercolor 추가
      if (finalBorderWidth > 0) {
        drawtextCmd += `:borderw=${finalBorderWidth}:bordercolor=${finalBorderColor}`;
      }
      
      return drawtextCmd;
    });
    
    const finalFilter = filters.join(',');
    console.log(`   ✅ 최종 필터 (${lines.length}줄): ${finalFilter.substring(0, 200)}...`);
    return finalFilter;
  }

  /**
   * 제목 텍스트를 FFmpeg 필터 형식으로 변환
   * 2줄 중앙 정렬
   */
  createTitleFilter(text, settings = {}) {
    console.log(`\n🎬 [제목 필터 생성] 원본 텍스트: "${text}"`);
    
    const {
      fontFamily = 'NanumGothicBold',
      fontSize = 72,
      color,          // 프론트엔드에서 color로 전달
      fontColor,      // 또는 fontColor로 전달 (호환성)
      position = 'top',  // ⭐ 제목 위치: 'top', 'center', 'bottom'
      strokeWidth,    // 프론트엔드에서 strokeWidth로 전달
      strokeColor,    // 프론트엔드에서 strokeColor로 전달
      borderWidth,    // 또는 borderWidth로 전달 (호환성)
      borderColor,    // 또는 borderColor로 전달 (호호성)
      maxChars = 20   // ⭐ 최대 글자 수 제한 (기본값 20)
    } = settings;
    
    // ⭐ position에 따라 yPosition 계산 (1080x1920 쇼츠 기준)
    // FFmpeg drawtext의 y 좌표: 절대 위치 (화면 상단 기준)
    // 1920px 높이 기준:
    //   - 상단: y=280 (상단에서 280px)
    //   - 중앙: y=960 (정중앙)
    //   - 하단: y=1640 (하단에서 280px)
    let yPosition;
    switch (position) {
      case 'top':
        yPosition = 280;  // 상단: 화면 상단에서 280px 아래
        break;
      case 'bottom':
        yPosition = 1640;  // 하단: 화면 하단에서 280px 위
        break;
      case 'center':
      default:
        yPosition = 960;  // 중앙: 화면 정중앙
        break;
    }
    
    console.log(`   🎯 제목 위치: ${position} → yPosition: ${yPosition}`);
    
    // ⭐ 최대 글자 수 제한 적용
    if (text.length > maxChars) {
      text = text.substring(0, maxChars) + '...';
      console.log(`   ⚠️  제목이 ${maxChars}자로 제한됨: "${text}"`);
    }
    
    // color/fontColor 매핑 (color 우선)
    const finalFontColor = color !== undefined ? color : (fontColor !== undefined ? fontColor : 'yellow');
    
    // strokeWidth/strokeColor를 borderWidth/borderColor로 매핑
    const finalBorderWidth = strokeWidth !== undefined ? strokeWidth : (borderWidth !== undefined ? borderWidth : 5);
    const finalBorderColor = strokeColor !== undefined ? strokeColor : (borderColor !== undefined ? borderColor : 'black');
    
    // 그림자 강제 제거 (사용자 요청)
    const shadowX = 0;
    const shadowY = 0;

    console.log(`   설정: fontSize=${fontSize}, fontFamily=${fontFamily}, fontColor=${finalFontColor}, yPosition=${yPosition}, borderWidth=${finalBorderWidth}, borderColor=${finalBorderColor}`);

    // 폰트 파일 경로 가져오기
    const fontPath = this.getFontPath(fontFamily);
    console.log(`   폰트 경로: ${fontPath}`);

    // 제목: 1줄 우선 (20자까지 1줄, 최대 30자까지 허용)
    const lines = this.splitTextIntoTwoLines(text, 15);
    console.log(`   분리된 줄: ${lines.length}줄`, lines);

    // 각 줄을 이스케이프
    const escapedLines = lines.map(line => 
      line
        .replace(/\\/g, '\\\\')
        .replace(/'/g, '"')  // 작은따옴표를 큰따옴표로 변환 (FFmpeg 필터 호환성)
        .replace(/:/g, '\\:')
    );

    // 줄 간격 (픽셀)
    const lineSpacing = fontSize * 1.2;

    // 2줄인 경우 첫 번째 줄을 위로, 두 번째 줄을 아래로
    const filters = escapedLines.map((escapedLine, index) => {
      const yPos = lines.length === 1 
        ? yPosition // 1줄이면 그대로
        : yPosition + (lineSpacing * index); // 2줄이면 첫줄 위, 둘째줄 아래

      // 테두리가 0이면 bordercolor 제외
      let drawtextCmd = `drawtext=` +
        `text='${escapedLine}':` +
        `fontfile=${fontPath}:` +
        `fontsize=${fontSize}:` +
        `fontcolor=${finalFontColor}:` +
        `x=(w-text_w)/2:` +
        `y=${yPos}`;
      
      // 테두리가 있을 때만 borderw와 bordercolor 추가
      if (finalBorderWidth > 0) {
        drawtextCmd += `:borderw=${finalBorderWidth}:bordercolor=${finalBorderColor}`;
      }
      
      return drawtextCmd;
    });
    
    const finalFilter = filters.join(',');
    console.log(`   ✅ 최종 필터 (${lines.length}줄): ${finalFilter.substring(0, 200)}...`);
    return finalFilter;
  }

  /**
   * 이미지 효과 필터 생성 (Ken Burns, Pan, Zoom 등)
   * hasBackground=true: 오버레이용 (비율 유지), false: 전체 화면용 (1080x1920 crop)
   */
  createImageEffectFilter(effect = 'none', intensity = 'medium', duration = 3.5, hasBackground = false) {
    console.log(`🎬 이미지 효과: ${effect} (강도: ${intensity}, 배경: ${hasBackground ? '있음' : '없음'})`);
    
    // 강도별 파라미터
    const intensityParams = {
      'low': { zoomFactor: 1.1, panDistance: 50 },
      'medium': { zoomFactor: 1.2, panDistance: 100 },
      'high': { zoomFactor: 1.3, panDistance: 150 }
    };
    
    const params = intensityParams[intensity] || intensityParams['medium'];
    const fps = 30; // 프레임레이트
    const frames = Math.floor(duration * fps);
    
    // 배경이 있으면 오버레이용으로 비율 유지하며 효과 적용
    if (hasBackground) {
      // 오버레이 모드: zoompan 필터 사용하여 효과 적용
      const fps = 30;
      const totalFrames = Math.floor(duration * fps);
      
      switch(effect) {
        case 'zoom-in':
          // 줌인: zoompan 필터 사용 (비율 유지)
          return `zoompan=z='min(zoom+0.0015,${params.zoomFactor})':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=${fps}`;
          
        case 'zoom-out':
          // 줌아웃: 역방향 줌
          return `zoompan=z='if(lte(zoom,1.0),1.0,max(zoom-0.0015,1.0))':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=${fps}`;
          
        case 'zoom-pulse':
          // 펄스 효과: 확대/축소 반복 (심장 박동 효과)
          return `zoompan=z='1+0.05*sin(2*PI*t/${duration}*2)':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=${fps}`;
          
        case 'fade-in':
          // 페이드인: 점점 나타남
          return `scale=1080:1920:force_original_aspect_ratio=decrease,fade=in:st=0:d=${duration/2}`;
          
        case 'fade-out':
          // 페이드아웃: 점점 사라짐
          return `scale=1080:1920:force_original_aspect_ratio=decrease,fade=out:st=${duration/2}:d=${duration/2}`;
          
        case 'slide-in-left':
          // 좌측에서 슬라이드 등장
          return `scale=1080:1920:force_original_aspect_ratio=decrease,pad=2160:1920:(2160-iw)/2:(1920-ih)/2,crop=1080:1920:if(lte(t\\,${duration/3})\\,1080-1080*t/(${duration/3})\\,0):0`;
          
        case 'slide-in-right':
          // 우측에서 슬라이드 등장
          return `scale=1080:1920:force_original_aspect_ratio=decrease,pad=2160:1920:(2160-iw)/2:(1920-ih)/2,crop=1080:1920:if(lte(t\\,${duration/3})\\,1080*t/(${duration/3})\\,1080):0`;
          
        case 'slide-in-up':
          // 위에서 슬라이드 등장
          return `scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:3840:(1080-iw)/2:(3840-ih)/2,crop=1080:1920:0:if(lte(t\\,${duration/3})\\,1920-1920*t/(${duration/3})\\,0)`;
          
        case 'slide-in-down':
          // 아래에서 슬라이드 등장
          return `scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:3840:(1080-iw)/2:(3840-ih)/2,crop=1080:1920:0:if(lte(t\\,${duration/3})\\,1920*t/(${duration/3})\\,1920)`;
          
        case 'pan-left':
        case 'pan-right':
        case 'pan-up':
        case 'pan-down':
        case 'pan-lr':
        case 'pan-rl':
          // 패닝 효과: 배경 있을 때는 간단히 스케일만 적용 (패닝은 전체 화면용)
          return `scale=1080:1920:force_original_aspect_ratio=decrease`;
          
        case 'ken-burns':
        case 'ken-burns-center':
          // Ken Burns: zoompan으로 중앙 줌인
          return `zoompan=z='min(zoom+0.0015,${params.zoomFactor})':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=${fps}`;
          
        case 'rotate-slow':
          // 회전: 비율 유지하며 회전
          return `rotate=a=PI*2*t/${duration}/4:fillcolor=none,scale=1080:1920:force_original_aspect_ratio=decrease`;
          
        case 'rotate-fast':
          // 빠른 회전: 2배 속도
          return `rotate=a=PI*2*t/${duration}/2:fillcolor=none,scale=1080:1920:force_original_aspect_ratio=decrease`;
          
        case 'none':
        default:
          // 효과 없음: 비율 유지
          return `scale=1080:1920:force_original_aspect_ratio=decrease`;
      }
    } else {
      // 전체 화면 모드: 화면 채우며 효과 적용 (1080x1920 crop)
      switch(effect) {
        case 'zoom-in':
          // 줌인 효과: 점점 확대
          return `scale=w='iw*min(1+((${params.zoomFactor}-1)*t/${duration})\\,${params.zoomFactor})':h='ih*min(1+((${params.zoomFactor}-1)*t/${duration})\\,${params.zoomFactor})',crop=1080:1920:(iw-1080)/2:(ih-1920)/2`;
          
        case 'zoom-out':
          // 줌아웃 효과: 확대된 상태에서 축소
          return `scale=w='iw*min(${params.zoomFactor}-(${params.zoomFactor}-1)*t/${duration}\\,${params.zoomFactor})':h='ih*min(${params.zoomFactor}-(${params.zoomFactor}-1)*t/${duration}\\,${params.zoomFactor})',crop=1080:1920:(iw-1080)/2:(ih-1920)/2`;
          
        case 'pan-left':
          // 좌측으로 패닝
          return `scale=1280:1920,crop=1080:1920:'min(iw-1080\\,${params.panDistance}*t/${duration})':0`;
          
        case 'pan-right':
          // 우측으로 패닝
          return `scale=1280:1920,crop=1080:1920:'max(0\\,iw-1080-${params.panDistance}*t/${duration})':0`;
          
        case 'pan-up':
          // 위로 패닝
          return `scale=1080:2200,crop=1080:1920:0:'max(0\\,ih-1920-${params.panDistance}*t/${duration})'`;
          
        case 'pan-down':
          // 아래로 패닝
          return `scale=1080:2200,crop=1080:1920:0:'min(ih-1920\\,${params.panDistance}*t/${duration})'`;
          
        case 'pan-lr':
          // 좌우 패닝 (좌 -> 우)
          return `scale=1280:1920,crop=1080:1920:'min(iw-1080\\,${params.panDistance*2}*t/${duration})':0`;
          
        case 'pan-rl':
          // 우좌 패닝 (우 -> 좌)
          return `scale=1280:1920,crop=1080:1920:'max(0\\,iw-1080-${params.panDistance*2}*t/${duration})':0`;
          
        case 'ken-burns':
          // Ken Burns 효과: 줌인 + 패닝
          return `scale=w='iw*min(1+((${params.zoomFactor}-1)*t/${duration})\\,${params.zoomFactor})':h='ih*min(1+((${params.zoomFactor}-1)*t/${duration})\\,${params.zoomFactor})',crop=1080:1920:'min((iw-1080)/2+(${params.panDistance}*t/${duration})\\,iw-1080)':(ih-1920)/2`;
          
        case 'ken-burns-center':
          // Ken Burns 중앙 줌인
          return `scale=w='iw*min(1+((${params.zoomFactor}-1)*t/${duration})\\,${params.zoomFactor})':h='ih*min(1+((${params.zoomFactor}-1)*t/${duration})\\,${params.zoomFactor})',crop=1080:1920:(iw-1080)/2:(ih-1920)/2`;
          
        case 'rotate-slow':
          // 느린 회전 (시계방향)
          return `rotate=a='PI*2*t/${duration}/4':fillcolor=black,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920`;
          
        case 'rotate-fast':
          // 빠른 회전 (2배 속도)
          return `rotate=a='PI*2*t/${duration}/2':fillcolor=black,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920`;
          
        case 'zoom-pulse':
          // 펄스 효과: 확대/축소 반복
          return `zoompan=z='1+0.1*sin(2*PI*n/${frames}*2)':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=${fps}`;
          
        case 'fade-in':
          // 페이드인: 점점 나타남
          return `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fade=in:st=0:d=${duration/2}`;
          
        case 'fade-out':
          // 페이드아웃: 점점 사라짐
          return `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fade=out:st=${duration/2}:d=${duration/2}`;
          
        case 'slide-in-left':
          // 좌측에서 슬라이드 등장
          return `scale=1280:1920,crop=1080:1920:'if(lte(t\\,${duration/3})\\,200-200*t/(${duration/3})\\,0)':0`;
          
        case 'slide-in-right':
          // 우측에서 슬라이드 등장
          return `scale=1280:1920,crop=1080:1920:'if(lte(t\\,${duration/3})\\,200*t/(${duration/3})\\,200)':0`;
          
        case 'slide-in-up':
          // 위에서 슬라이드 등장
          return `scale=1080:2200,crop=1080:1920:0:'if(lte(t\\,${duration/3})\\,280-280*t/(${duration/3})\\,0)'`;
          
        case 'slide-in-down':
          // 아래에서 슬라이드 등장
          return `scale=1080:2200,crop=1080:1920:0:'if(lte(t\\,${duration/3})\\,280*t/(${duration/3})\\,280)'`;
          
        case 'none':
        default:
          // 효과 없음: 화면 채움
          return `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920`;
      }
    }
  }

  /**
   * 단일 장면 비디오 생성
   * 이미지 + 음성 + 자막 + 제목 결합
   */
  async createSceneVideo(scene, sceneIndex, settings = {}) {
    // ⭐ 프론트엔드 호환성: titleStyle → titleSettings, subtitle → subtitleSettings
    console.log('\n📊 [설정 확인]');
    console.log('   settings.titleStyle:', settings.titleStyle ? 'O' : 'X');
    console.log('   settings.subtitle:', settings.subtitle ? 'O' : 'X');
    console.log('   settings.titleSettings:', settings.titleSettings ? 'O' : 'X');
    console.log('   settings.subtitleSettings:', settings.subtitleSettings ? 'O' : 'X');
    
    if (!settings.titleSettings && settings.titleStyle) {
      settings.titleSettings = settings.titleStyle;
      console.log('   🔄 titleStyle → titleSettings 매핑 완료');
      console.log('   매핑된 titleSettings:', JSON.stringify(settings.titleSettings, null, 2));
    }
    if (!settings.subtitleSettings && settings.subtitle) {
      settings.subtitleSettings = settings.subtitle;
      console.log('   🔄 subtitle → subtitleSettings 매핑 완료');
      console.log('   매핑된 subtitleSettings:', JSON.stringify(settings.subtitleSettings, null, 2));
    }
    
    console.log('\n🏷️  [장면 데이터 확인]');
    console.log('   scene.title:', scene.title || '(없음)');
    console.log('   scene.subtitle:', scene.subtitle || '(없음)');
    console.log('   scene.narration:', scene.narration || '(없음)');
    
    // ⭐ scene.title이 없으면 narration을 title로 사용 (titleStyle.enabled일 때)
    if (!scene.title && scene.narration && settings.titleSettings?.enabled) {
      scene.title = scene.narration;
      console.log('   🔄 narration → title 자동 매핑 (titleSettings.enabled=true)');
    }
    
    // ⭐ scene.subtitle이 없으면 narration을 subtitle로 사용 (subtitle.enabled일 때)
    if (!scene.subtitle && scene.narration && settings.subtitleSettings?.enabled) {
      scene.subtitle = scene.narration;
      console.log('   🔄 narration → subtitle 자동 매핑 (subtitleSettings.enabled=true)');
    }
    
    // 더 간단한 sceneId 생성 (특수문자 없음)
    const timestamp = Date.now();
    const sceneId = `scene${timestamp}_${sceneIndex}`;
    const outputPath = path.join(TEMP_DIR, `${sceneId}.mp4`);

    console.log(`🎬 장면 ${sceneIndex + 1} 생성 중...`);
    console.log(`   📂 출력 경로: ${outputPath}`);
    console.log(`   ⏱️  장면 duration: ${scene.duration} (타입: ${typeof scene.duration})`);

    try {
      // TEMP_DIR 존재 및 쓰기 권한 확인
      await fs.access(TEMP_DIR, fs.constants.W_OK);
      console.log(`   ✅ TEMP_DIR 쓰기 가능: ${TEMP_DIR}`);
    } catch (error) {
      console.error(`   ❌ TEMP_DIR 접근 불가: ${TEMP_DIR}`, error);
      // 디렉토리 생성 시도
      await fs.mkdir(TEMP_DIR, { recursive: true });
      console.log(`   ✅ TEMP_DIR 생성 완료: ${TEMP_DIR}`);
    }

    try {
      // AI 이미지투비디오 모드 확인
      const useAiVideo = settings.useAiVideo || false;
      const aiVideoModel = settings.aiVideoModel || 'kling/v2.6/pro';
      
      if (useAiVideo && scene.imageUrl) {
        // ========== AI 이미지투비디오 모드 ==========
        console.log(`   🤖 AI 이미지투비디오 생성 (모델: ${aiVideoModel})`);
        
        // AI 비디오 생성을 위한 video_generation 도구 호출
        // 이 부분은 별도 함수로 분리하여 처리
        return await this.createAiVideoScene(scene, sceneIndex, settings, sceneId, outputPath);
      }
      
      // ========== 기존 FFmpeg 모드 ==========
      console.log(`   🎨 FFmpeg 비디오 생성 (효과: ${settings.imageEffect || 'none'})`);
      
      // 1. 원본 이미지 다운로드
      const imagePath = path.join(TEMP_DIR, `${sceneId}_image.jpg`);
      if (scene.imageUrl) {
        await this.downloadFile(scene.imageUrl, imagePath);
      }

      // 2. 배경 이미지 다운로드 (있을 경우)
      let bgImagePath = null;
      // ⚠️ 배경이미지 임시 비활성화 (성능 문제로 인해)
      const bgImageSettings = null; // settings.backgroundImage || settings.bgImage;
      const bgImageSource = null; // bgImageSettings?.path || bgImageSettings?.url;
      
      if (false && bgImageSettings?.enabled && bgImageSource) {
        console.log(`🖼️  배경이미지 처리 시작`);
        console.log(`   enabled: ${bgImageSettings.enabled}`);
        console.log(`   source: ${bgImageSource}`);
        console.log(`   opacity: ${bgImageSettings.opacity}`);
        console.log(`   blur: ${bgImageSettings.blur}`);
        
        // 로컬 파일 경로인 경우 (path)
        if (bgImageSource.startsWith('/') || bgImageSource.startsWith('./')) {
          bgImagePath = bgImageSource;
          console.log(`   ✅ 로컬 파일 사용: ${bgImagePath}`);
          
          // 파일 존재 확인
          try {
            await fs.access(bgImagePath);
            console.log(`   ✅ 배경이미지 파일 존재 확인`);
          } catch (err) {
            console.error(`   ❌ 배경이미지 파일 없음: ${bgImagePath}`);
            console.error(`   에러:`, err.message);
            bgImagePath = null;
          }
        } else {
          // URL인 경우 다운로드
          bgImagePath = path.join(TEMP_DIR, `${sceneId}_bgimage.jpg`);
          console.log(`   📥 URL에서 다운로드: ${bgImagePath}`);
          await this.downloadFile(bgImageSource, bgImagePath);
        }
      } else {
        console.log(`🔳 배경이미지 비활성화 또는 소스 없음`);
        if (bgImageSettings) {
          console.log(`   enabled: ${bgImageSettings.enabled}`);
          console.log(`   path: ${bgImageSettings.path}`);
          console.log(`   url: ${bgImageSettings.url}`);
        }
      }

      // 3. 음성 다운로드
      const audioPath = path.join(TEMP_DIR, `${sceneId}_audio.mp3`);
      let hasAudio = false;
      if (scene.audioUrl) {
        console.log(`   🎤 음성 다운로드: ${scene.audioUrl}`);
        await this.downloadFile(scene.audioUrl, audioPath);
        
        // 파일이 실제로 존재하는지 확인
        try {
          await fs.access(audioPath);
          hasAudio = true;
          console.log(`   ✅ 음성 파일 확인: ${audioPath}`);
        } catch (err) {
          console.error(`   ❌ 음성 파일 없음: ${audioPath}`);
          hasAudio = false;
        }
      } else {
        console.log(`   ⚠️  장면 ${sceneIndex + 1}: audioUrl 없음 - 음성 없이 생성`);
      }

      // 4. FFmpeg 필터 생성
      const filters = [];

      // 이미지 효과 설정 가져오기
      const imageEffect = settings.imageEffect || 'none';
      const effectIntensity = settings.effectIntensity || 'medium';
      const sceneDuration = scene.duration || 3.5;
      
      // 배경 이미지 처리 (맨 앞 레이어)
      if (bgImagePath) {
        // ⭐ backgroundImage 또는 bgImage 설정 가져오기
        const bgImageSettings = settings.backgroundImage || settings.bgImage;
        const opacity = bgImageSettings?.opacity || 0.3;
        const blur = bgImageSettings?.blur || 10;
        
        console.log(`   🖼️  배경이미지 필터 적용: opacity=${opacity}, blur=${blur}`);
        
        // 배경 이미지: 화면 전체를 채움 + 블러 효과
        const bgFilter = blur > 0 
          ? `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=${blur}:${blur}[bg]`
          : `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[bg]`;
        filters.push(bgFilter);
        
        // 원본 이미지: 배경이 있어도 이미지 효과 적용 (장면 이미지에만 효과)
        console.log(`   🎨 장면 이미지 효과 적용: ${imageEffect} (배경 있음)`);
        const imageEffectFilter = this.createImageEffectFilter(imageEffect, effectIntensity, sceneDuration, true);
        filters.push(`[1:v]${imageEffectFilter}[overlay]`);
        
        // 오버레이: 원본 이미지를 배경 위에 중앙 배치
        filters.push(`[bg][overlay]overlay=(W-w)/2:(H-h)/2:format=auto,format=yuv420p[main]`);
      } else {
        // 배경 이미지 없으면 원본 이미지에 효과 적용 (화면 전체 채움, hasBackground=false)
        const imageEffectFilter = this.createImageEffectFilter(imageEffect, effectIntensity, sceneDuration, false);
        filters.push(`[0:v]${imageEffectFilter}[main]`);
      }

      // 자막 추가
      if (scene.subtitle) {
        const subtitleFilter = this.createSubtitleFilter(
          scene.subtitle,
          settings.subtitleSettings || {}
        );
        filters.push(`[main]${subtitleFilter}[sub]`);
      }

      // 제목 추가
      if (scene.title) {
        const titleFilter = this.createTitleFilter(
          scene.title,
          settings.titleSettings || {}
        );
        const inputLabel = scene.subtitle ? '[sub]' : '[main]';
        filters.push(`${inputLabel}${titleFilter}[final]`);
      }

      // 4. FFmpeg 직접 실행 (fluent-ffmpeg 우회)
      return new Promise((resolve, reject) => {
        // 최종 출력 레이블 결정 (필터 생성 전에)
        let finalLabel = '[main]';
        if (scene.title) {
          finalLabel = '[final]';
        } else if (scene.subtitle) {
          finalLabel = '[sub]';
        }
        
        // FFmpeg 명령 인자 구성
        const args = [];
        
        // 입력 파일들
        if (bgImagePath) {
          args.push('-loop', '1', '-i', bgImagePath);
        }
        args.push('-loop', '1', '-i', imagePath);
        
        // 오디오 입력 추가 (파일이 실제로 존재할 때만)
        if (hasAudio) {
          args.push('-i', audioPath);
          console.log(`   🎵 오디오 입력 추가: ${audioPath}`);
        } else {
          console.log(`   ⚠️  오디오 입력 없음 - 영상만 생성`);
        }
        
        // 출력 덮어쓰기
        args.push('-y');
        
        // 필터 체인
        const finalFilterString = filters.join(';');
        args.push('-filter_complex', finalFilterString);
        
        // cleanLabel (이미 위에서 finalLabel 결정됨)
        const cleanLabel = finalLabel.replace(/\[|\]/g, '');
        
        console.log(`   🏷️  최종 레이블: ${finalLabel}`);
        console.log(`   🏷️  scene.title: ${scene.title ? 'O' : 'X'}`);
        console.log(`   🏷️  scene.subtitle: ${scene.subtitle ? 'O' : 'X'}`);
        console.log(`   🏷️  filters 개수: ${filters.length}`);
        console.log(`   🔗 필터 체인 (전체):\n${finalFilterString}`);
        
        // 비디오 및 오디오 매핑
        args.push('-map', `[${cleanLabel}]`);
        const audioIndex = bgImagePath ? '2' : '1';
        if (hasAudio) {
          args.push('-map', `${audioIndex}:a`);
          console.log(`   🎵 오디오 매핑: ${audioIndex}:a`);
        } else {
          console.log(`   ⚠️  오디오 매핑 없음 - 무음 영상`);
        }
        
        // 코덱 및 품질 옵션
        // ⚡ ultrafast preset: 2-3배 빠른 인코딩 (배경이미지 처리 최적화)
        args.push(
          '-c:v', 'libx264',
          '-preset', 'ultrafast',
          '-crf', '23',
          '-pix_fmt', 'yuv420p',
          '-shortest',
          '-t', String(scene.duration || 4)
        );
        
        if (hasAudio) {
          args.push('-c:a', 'aac', '-b:a', '128k');
          console.log(`   🎵 오디오 코덱 설정: aac 128k`);
        } else {
          console.log(`   ⚠️  오디오 코덱 설정 없음`);
        }
        
        // 출력 파일
        args.push(outputPath);
        
        console.log(`   🚀 FFmpeg 전체 명령:`);
        console.log(`      ffmpeg ${args.join(' ')}`);
        console.log(`   📋 필터 인자 (실제값):`);
        const filterArg = args[args.indexOf('-filter_complex') + 1];
        console.log(`      ${filterArg}`);
        
        // FFmpeg 프로세스 시작
        const ffmpegProcess = spawn('ffmpeg', args);
        
        let stderrOutput = '';
        
        let lastProgressLog = 0;
        let lastPercent = 0;
        
        ffmpegProcess.stderr.on('data', (data) => {
          const line = data.toString();
          stderrOutput += line;
          
          // 에러 또는 경고 감지
          if (line.includes('Error') || line.includes('Invalid')) {
            console.error(`   ⚠️  FFmpeg: ${line.trim()}`);
          }
          
          // 진행률 파싱 (선택적) - debounce 처리로 로그 중복 방지
          const timeMatch = line.match(/time=(\d{2}):(\d{2}):(\d{2})/);
          if (timeMatch) {
            const seconds = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]);
            const duration = scene.duration || 4;
            const percent = Math.min(100, Math.round((seconds / duration) * 100));
            
            // 진행률이 10% 이상 변경되었거나, 1초 이상 경과한 경우에만 로그
            const now = Date.now();
            if ((percent > 0 && percent <= 100) && 
                (percent >= lastPercent + 10 || now - lastProgressLog > 1000)) {
              console.log(`   진행률: ${percent}%`);
              lastPercent = percent;
              lastProgressLog = now;
            }
          }
        });
        
        ffmpegProcess.on('close', (code) => {
          if (code === 0) {
            console.log(`✅ 장면 ${sceneIndex + 1} 완료: ${outputPath}`);
            // 파일 생성 확인
            fs.access(outputPath).then(() => {
              console.log(`   ✅ 파일 생성 확인: ${outputPath}`);
              // 임시 파일 정리
              this.cleanupTempFiles([imagePath, audioPath]).catch(console.error);
              resolve(outputPath);
            }).catch(err => {
              console.error(`   ❌ 파일 생성 실패: ${outputPath}`, err);
              reject(new Error(`파일 생성 실패: ${outputPath}`));
            });
          } else {
            console.error(`❌ 장면 ${sceneIndex + 1} 실패: FFmpeg exit code ${code}`);
            console.error(`   📁 출력 경로: ${outputPath}`);
            console.error(`   📁 FFmpeg stderr (마지막 500자):\n${stderrOutput.slice(-500)}`);
            reject(new Error(`FFmpeg exited with code ${code}`));
          }
        });
        
        ffmpegProcess.on('error', (error) => {
          console.error(`❌ FFmpeg 프로세스 에러:`, error);
          reject(error);
        });
      });

    } catch (error) {
      console.error(`❌ 장면 ${sceneIndex + 1} 생성 실패:`, error);
      throw error;
    }
  }

  /**
   * 모든 장면 비디오를 하나로 결합
   * 배경 음악 추가 지원
   */
  async concatenateScenes(scenePaths, settings = {}) {
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const outputPath = path.join(OUTPUT_DIR, `${videoId}.mp4`);
    const concatListPath = path.join(TEMP_DIR, `${videoId}_concat.txt`);

    console.log(`🔗 ${scenePaths.length}개 장면 결합 중...`);

    try {
      // 1. concat 리스트 파일 생성
      const concatList = scenePaths
        .map(p => `file '${p}'`)
        .join('\n');
      await fs.writeFile(concatListPath, concatList);

      // 2. 배경 음악 다운로드 (있을 경우)
      let bgMusicPath = null;
      // ⭐ bgMusic.path (로컬 파일) 또는 bgMusic.url (다운로드) 지원
      // ⭐ 빈 문자열('') 체크 추가
      const bgMusicSource = (settings.bgMusic?.path && settings.bgMusic.path.trim()) || 
                           (settings.bgMusic?.url && settings.bgMusic.url.trim());
      
      if (settings.bgMusic?.enabled && bgMusicSource) {
        console.log(`🎵 배경음악 처리 시작`);
        console.log(`   enabled: ${settings.bgMusic.enabled}`);
        console.log(`   source: ${bgMusicSource}`);
        console.log(`   volume: ${settings.bgMusic.volume}`);
        
        // 로컬 파일 경로인 경우 (path)
        if (bgMusicSource.startsWith('/') || bgMusicSource.startsWith('./')) {
          bgMusicPath = bgMusicSource;
          console.log(`   ✅ 로컬 파일 사용: ${bgMusicPath}`);
          
          // 파일 존재 확인
          try {
            await fs.access(bgMusicPath);
            console.log(`   ✅ 배경음악 파일 존재 확인`);
          } catch (err) {
            console.error(`   ❌ 배경음악 파일 없음: ${bgMusicPath}`);
            console.error(`   에러:`, err.message);
            bgMusicPath = null;
          }
        } else {
          // URL인 경우 다운로드
          bgMusicPath = path.join(TEMP_DIR, `${videoId}_bgmusic.mp3`);
          console.log(`   📥 URL에서 다운로드: ${bgMusicPath}`);
          await this.downloadFile(bgMusicSource, bgMusicPath);
        }
      } else {
        console.log(`🔇 배경음악 비활성화 또는 소스 없음`);
        if (settings.bgMusic) {
          console.log(`   enabled: ${settings.bgMusic.enabled}`);
          console.log(`   path: ${settings.bgMusic.path}`);
          console.log(`   url: ${settings.bgMusic.url}`);
        }
      }

      // 3. 첫 번째 장면 비디오의 오디오 스트림 확인
      const hasAudio = await this.checkHasAudio(scenePaths[0]);
      console.log(`   입력 비디오 오디오 스트림: ${hasAudio ? '있음' : '없음'}`);

      // 4. FFmpeg로 결합
      return new Promise((resolve, reject) => {
        const command = ffmpeg()
          .input(concatListPath)
          .inputOptions(['-f', 'concat', '-safe', '0']);

        // 배경 음악 추가 (파일이 실제로 존재하는지 한 번 더 확인)
        let actualBgMusicPath = null;
        console.log(`🔍 FFmpeg 직전 bgMusicPath 확인: ${bgMusicPath}`);
        if (bgMusicPath) {
          try {
            // 동기적으로 파일 존재 확인
            console.log(`   파일 존재 체크: ${bgMusicPath}`);
            if (fsSync.existsSync(bgMusicPath)) {
              actualBgMusicPath = bgMusicPath;
              console.log(`   ✅ FFmpeg 실행 전 배경음악 파일 재확인 완료`);
              console.log(`   actualBgMusicPath 설정됨: ${actualBgMusicPath}`);
            } else {
              console.warn(`   ⚠️ 배경음악 파일이 삭제되었습니다: ${bgMusicPath}`);
              console.warn(`   ⚠️ 배경음악 없이 비디오 생성을 계속합니다.`);
            }
          } catch (err) {
            console.error(`   ❌ 배경음악 파일 확인 실패:`, err.message);
            console.error(`   에러 스택:`, err.stack);
          }
        } else {
          console.log(`   ℹ️ bgMusicPath가 null입니다 (배경음악 없음)`);
        }

        // ⭐ 워터마크 처리
        let watermarkPath = null;
        let watermarkInputIndex = null;
        console.log(`🔍 워터마크 설정 확인:`, JSON.stringify(settings.watermark || {}));
        if (settings.watermark?.enabled && settings.watermark?.path) {
          watermarkPath = settings.watermark.path;
          console.log(`🖼️ 워터마크 처리 시작`);
          console.log(`   원본 경로: ${watermarkPath}`);
          
          // 경로 변환: /outputs/ 경로를 실제 경로로 변환
          if (watermarkPath.startsWith('/outputs/')) {
            const OUTPUT_BASE = process.env.OUTPUT_DIR || '/tmp/outputs';
            watermarkPath = path.join(OUTPUT_BASE, watermarkPath.replace('/outputs/', ''));
            console.log(`   변환된 경로: ${watermarkPath}`);
          } else if (!path.isAbsolute(watermarkPath)) {
            // 상대 경로를 절대 경로로 변환
            watermarkPath = path.resolve(watermarkPath);
            console.log(`   절대 경로로 변환: ${watermarkPath}`);
          }
          
          // 파일 존재 확인 (동기)
          try {
            if (fsSync.existsSync(watermarkPath)) {
              console.log(`   ✅ 워터마크 파일 존재 확인`);
              
              // ⭐ 워터마크를 먼저 입력으로 추가 (인덱스 1)
              command.input(watermarkPath);
              watermarkInputIndex = 1;  // video(0), watermark(1)
              
              console.log(`   워터마크 입력 인덱스: ${watermarkInputIndex}`);
            } else {
              console.error(`   ❌ 워터마크 파일 없음: ${watermarkPath}`);
              watermarkPath = null;
            }
          } catch (err) {
            console.error(`   ❌ 워터마크 파일 확인 오류:`, err.message);
            watermarkPath = null;
          }
        } else {
          console.log(`🔇 워터마크 비활성화 또는 경로 없음`);
        }

        // ⭐ 비디오 및 오디오 필터 처리
        const videoFilters = [];
        const audioFilters = [];
        
        // 워터마크 오버레이 필터 생성
        if (watermarkPath) {
          const wmSettings = settings.watermark || {};
          const wmSize = wmSettings.size || 15;  // 비디오 너비 대비 퍼센트
          const wmOpacity = wmSettings.opacity || 0.8;
          const wmPosition = wmSettings.position || 'bottom-right';
          
          // 워터마크 크기 조정
          // 쇼츠(1080px 너비) 기준: 15% = 162px, 20% = 216px
          // wmSize를 5배로 증폭하여 원본 이미지가 작아도 충분히 크게 표시
          const scaleFactor = wmSize * 5;  // 15% → 75% (원본 대비), 20% → 100% (원본 크기 유지)
          const scaleFilter = `scale=w=${scaleFactor}*iw/100:h=-1`;
          
          // 위치 계산
          let overlayX, overlayY;
          const padding = 20;  // 패딩
          switch (wmPosition) {
            case 'top-left':
              overlayX = padding;
              overlayY = padding;
              break;
            case 'top-right':
              overlayX = `W-w-${padding}`;
              overlayY = padding;
              break;
            case 'bottom-left':
              overlayX = padding;
              overlayY = `H-h-${padding}`;
              break;
            case 'bottom-right':
              overlayX = `W-w-${padding}`;
              overlayY = `H-h-${padding}`;
              break;
            case 'center':
              overlayX = '(W-w)/2';
              overlayY = '(H-h)/2';
              break;
            default:
              overlayX = `W-w-${padding}`;
              overlayY = `H-h-${padding}`;
          }
          
          // 워터마크 필터: 크기 조정 + 투명도 + 오버레이
          videoFilters.push(
            `[${watermarkInputIndex}:v]${scaleFilter},format=rgba,colorchannelmixer=aa=${wmOpacity}[wm]`,
            `[0:v][wm]overlay=${overlayX}:${overlayY}:format=auto[vout]`
          );
          
          console.log(`   워터마크 위치: ${wmPosition} (${overlayX}, ${overlayY})`);
          console.log(`   워터마크 크기: ${wmSize}%, 투명도: ${Math.round(wmOpacity * 100)}%`);
        }

        if (actualBgMusicPath) {
          command.input(actualBgMusicPath);  // ✅ actualBgMusicPath 사용
          
          // 배경 음악 볼륨 설정 (기본값: 0.3)
          const bgMusicVolume = settings.bgMusic.volume !== undefined ? settings.bgMusic.volume : 0.3;
          console.log(`   배경 음악 볼륨: ${Math.round(bgMusicVolume * 100)}%`);
          
          // ⭐ 음악 입력 인덱스: 워터마크 유무에 따라 결정
          // - 워터마크 없음: video(0), music(1)
          // - 워터마크 있음: video(0), watermark(1), music(2)
          const musicInputIndex = watermarkPath ? 2 : 1;
          
          if (hasAudio) {
            // 입력 비디오에 오디오가 있으면 믹싱
            audioFilters.push(
              '[0:a]volume=1.0[voice]',
              `[${musicInputIndex}:a]volume=${bgMusicVolume}[music]`,
              '[voice][music]amix=inputs=2:duration=first[aout]'
            );
          } else {
            // 입력 비디오에 오디오가 없으면 배경 음악만 사용
            console.log('   입력 비디오에 오디오 없음, 배경 음악만 사용');
            const soloMusicVolume = Math.min(bgMusicVolume * 1.5, 1.0);
            audioFilters.push(`[${musicInputIndex}:a]volume=${soloMusicVolume}[aout]`);
          }
        }
        
        // ComplexFilter 구성
        if (videoFilters.length > 0 || audioFilters.length > 0) {
          const allFilters = [...videoFilters, ...audioFilters];
          command.complexFilter(allFilters);
          
          // 출력 매핑
          if (watermarkPath) {
            command.outputOptions(['-map', '[vout]']);
          } else {
            command.outputOptions(['-map', '0:v']);
          }
          
          if (audioFilters.length > 0) {
            command.outputOptions(['-map', '[aout]']);
          } else if (!hasAudio && !actualBgMusicPath) {
            // 오디오 없음 (비디오만)
          } else if (hasAudio && !actualBgMusicPath) {
            // 원본 오디오만
            command.outputOptions(['-map', '0:a']);
          }
        } else if (!hasAudio) {
          // 워터마크도 없고 오디오도 없음
          console.log('   오디오 없는 비디오 결합');
          command.outputOptions(['-map', '0:v']);
        }

        command
          .outputOptions([
            '-c:v', 'libx264',
            '-preset', 'veryfast',  // ⚡ 최종 결합 빠르게
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '128k'
          ])
          .output(outputPath)
          .on('start', (cmd) => {
            console.log(`🎬 최종 결합 시작: ${cmd}`);
          })
          .on('progress', (progress) => {
            console.log(`   진행률: ${Math.round(progress.percent || 0)}%`);
          })
          .on('end', async () => {
            console.log(`✅ 최종 비디오 생성 완료: ${outputPath}`);
            
            // 임시 파일 정리
            await this.cleanupTempFiles([
              concatListPath,
              bgMusicPath,
              ...scenePaths
            ]);

            // 파일 정보 가져오기
            const stats = await fs.stat(outputPath);
            
            resolve({
              videoId,
              videoPath: outputPath,
              videoUrl: `/shorts-videos/outputs/videos/${videoId}.mp4`,
              size: stats.size,
              duration: settings.totalDuration || scenePaths.length * 3
            });
          })
          .on('error', (error) => {
            console.error('❌ 비디오 결합 실패:', error);
            reject(error);
          })
          .run();
      });

    } catch (error) {
      console.error('❌ 비디오 결합 중 오류:', error);
      throw error;
    }
  }


  /**
   * Puppeteer를 사용한 애니메이션 영상 생성
   * @param {Array} scenes - 장면 배열
   * @param {Object} settings - 설정 객체
   * @returns {Object} - 생성된 영상 정보
   */
  async generateVideoWithPuppeteer(scenes, settings = {}) {
    console.log('🎨 Puppeteer 렌더러로 애니메이션 영상 생성 시작...');
    
    try {
      // Puppeteer 렌더러 인스턴스 생성
      const puppeteerRenderer = new PuppeteerRenderer();
      
      // 임시 디렉토리 생성
      const tempDir = path.join(TEMP_DIR, `puppeteer_${Date.now()}`);
      await fs.mkdir(tempDir, { recursive: true });
      console.log(`📁 임시 디렉토리 생성: ${tempDir}`);
      
      // 브라우저 초기화
      await puppeteerRenderer.initBrowser();
      
      // 장면 준비 (imagePath, title, subtitle 매핑)
      const preparedScenes = scenes.map(scene => ({
        imagePath: scene.imagePath,
        title: scene.title || (settings.titleSettings?.enabled ? scene.narration : null),
        subtitle: scene.subtitle || (settings.subtitleSettings?.enabled ? scene.narration : null),
        duration: scene.duration || 4
      }));
      
      // 모든 장면 렌더링 (스크린샷 생성)
      const screenshotPaths = await puppeteerRenderer.renderAllScenes(
        preparedScenes,
        settings,
        tempDir
      );
      
      // 오디오 파일 준비
      const audioPath = scenes[0]?.audioPath || null;
      if (!audioPath) {
        throw new Error('오디오 파일이 없습니다');
      }
      
      // 전체 영상 길이 계산
      const totalDuration = scenes.reduce((sum, scene) => sum + (scene.duration || 4), 0);
      
      // FFmpeg로 최종 영상 생성
      const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const outputVideoPath = path.join(OUTPUT_DIR, `${videoId}.mp4`);
      
      // 배경음악 처리
      let finalAudioPath = audioPath;
      if (settings.bgMusic?.enabled && settings.bgMusic?.path) {
        console.log('🎵 배경음악 믹싱 중...');
        const mixedAudioPath = path.join(tempDir, 'mixed_audio.mp3');
        await this.mixAudioWithBGM(audioPath, settings.bgMusic.path, settings.bgMusic.volume || 0.2, mixedAudioPath);
        finalAudioPath = mixedAudioPath;
      }
      
      // 스크린샷 → 영상 변환
      await puppeteerRenderer.createVideoFromScreenshots(
        screenshotPaths,
        finalAudioPath,
        outputVideoPath,
        totalDuration
      );
      
      // 브라우저 종료
      await puppeteerRenderer.closeBrowser();
      
      // 임시 파일 정리
      await puppeteerRenderer.cleanup(screenshotPaths);
      
      // 결과 정보
      const stats = await fs.stat(outputVideoPath);
      const result = {
        videoId,
        videoPath: outputVideoPath,
        size: stats.size,
        url: `/outputs/videos/${videoId}.mp4`
      };
      
      console.log('🎉 Puppeteer 영상 생성 완료!');
      console.log(`   Video ID: ${result.videoId}`);
      console.log(`   Size: ${(result.size / 1024 / 1024).toFixed(2)} MB`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Puppeteer 영상 생성 실패:', error);
      throw error;
    }
  }


  /**
   * 전체 비디오 생성 프로세스
   * 장면 생성 → 결합 → 최종 출력
   */
  async generateVideo(scenes, settings = {}) {
    console.log(`🚀 비디오 생성 시작: ${scenes.length}개 장면`);
    console.log(`📦 받은 scenes:`, JSON.stringify(scenes, null, 2));
    console.log(`📦 받은 settings:`, JSON.stringify(settings, null, 2));
    
    // 🎨 애니메이션 설정 확인
    const titleAnimation = settings.titleSettings?.animation || settings.titleStyle?.animation || 'none';
    const subtitleAnimation = settings.subtitleSettings?.animation || settings.subtitle?.animation || 'none';
    const hasAnimation = titleAnimation !== 'none' || subtitleAnimation !== 'none';
    
    if (hasAnimation) {
      console.log('🎬 애니메이션 감지! Puppeteer 렌더러 사용');
      console.log(`   제목 애니메이션: ${titleAnimation}`);
      console.log(`   자막 애니메이션: ${subtitleAnimation}`);
      return await this.generateVideoWithPuppeteer(scenes, settings);
    }
    
    console.log('🎥 애니메이션 없음. FFmpeg 기본 렌더러 사용');
    
    try {
      // 1. 각 장면별 비디오 생성
      const scenePaths = [];
      for (let i = 0; i < scenes.length; i++) {
        const scenePath = await this.createSceneVideo(scenes[i], i, settings);
        scenePaths.push(scenePath);
      }

      // 2. 모든 장면 결합
      const result = await this.concatenateScenes(scenePaths, settings);

      console.log(`🎉 비디오 생성 완료!`);
      console.log(`   Video ID: ${result.videoId}`);
      console.log(`   Path: ${result.videoPath}`);
      console.log(`   Size: ${(result.size / 1024 / 1024).toFixed(2)} MB`);

      return result;

    } catch (error) {
      console.error('❌ 비디오 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 임시 파일 정리
   */
  async cleanupTempFiles(filePaths) {
    for (const filePath of filePaths) {
      if (!filePath) continue;
      try {
        await fs.unlink(filePath);
        console.log(`🗑️  임시 파일 삭제: ${filePath}`);
      } catch (error) {
        // 파일이 없으면 무시
      }
    }
  }

  /**
   * AI 이미지투비디오로 장면 생성
   * video_generation 도구를 사용하여 자연스러운 움직임 생성
   * 
   * 참고: 실제 AI 비디오 생성은 routes에서 video_generation 도구를 호출해야 함
   * 여기서는 AI 생성이 필요한 장면임을 표시하고 메타데이터 반환
   */
  async createAiVideoScene(scene, sceneIndex, settings, sceneId, outputPath) {
    console.log(`   🤖 AI 비디오 생성 모드 (실제 생성은 routes에서 처리)`);
    
    try {
      // 1. AI 비디오 생성 설정
      const aiVideoModel = settings.aiVideoModel || 'runway/gen4_turbo';
      const sceneDuration = scene.duration || 5;
      const aspectRatio = '9:16'; // 세로 쇼츠 형식
      
      // 2. AI 프롬프트 생성 (자막 기반)
      let prompt = scene.subtitle || scene.title || 'Product showcase with natural movement';
      
      // 자연스러운 움직임 키워드 추가
      const movementKeywords = [
        'subtle camera movement',
        'natural motion',
        'smooth cinematic shot',
        'professional video'
      ];
      
      // 기존 프롬프트에 움직임 키워드 추가
      prompt = `${prompt}, ${movementKeywords.join(', ')}`;
      
      console.log(`   📝 AI 프롬프트: "${prompt}"`);
      console.log(`   ⏱️  지속시간: ${sceneDuration}초`);
      console.log(`   📐 비율: ${aspectRatio}`);
      console.log(`   🎨 모델: ${aiVideoModel}`);
      
      // 3. AI 비디오 생성 요청 정보 반환
      // routes에서 video_generation 도구를 호출하여 실제 생성
      return {
        needsAiGeneration: true,
        sceneId,
        sceneIndex,
        outputPath,
        imageUrl: scene.imageUrl,
        audioUrl: scene.audioUrl,
        subtitle: scene.subtitle,
        title: scene.title,
        prompt,
        duration: sceneDuration,
        aspectRatio,
        model: aiVideoModel,
        subtitleSettings: settings.subtitleSettings,
        titleSettings: settings.titleSettings
      };
      
    } catch (error) {
      console.error(`❌ AI 비디오 메타데이터 생성 실패:`, error);
      throw error;
    }
  }

  /**
   * AI 생성된 비디오에 음성과 자막 추가
   * @param {string} aiVideoPath - AI로 생성된 비디오 파일 경로
   * @param {object} sceneInfo - 장면 정보 (자막, 제목, 음성 등)
   * @returns {Promise<string>} - 최종 비디오 경로
   */
  async addAudioAndSubtitlesToAiVideo(aiVideoPath, sceneInfo) {
    console.log(`   🎬 AI 비디오에 음성과 자막 추가 중...`);
    
    const sceneId = sceneInfo.sceneId;
    const outputPath = sceneInfo.outputPath;
    
    return new Promise(async (resolve, reject) => {
      try {
        // 1. 음성 파일 다운로드
        let audioPath = null;
        if (sceneInfo.audioUrl) {
          audioPath = path.join(TEMP_DIR, `${sceneId}_audio.mp3`);
          await this.downloadFile(sceneInfo.audioUrl, audioPath);
        }
        
        // 2. FFmpeg 필터 생성
        const filters = [];
        let currentLabel = '[0:v]';
        let nextLabel = '[v1]';
        
        // 자막 추가
        if (sceneInfo.subtitle) {
          const subtitleFilter = this.createSubtitleFilter(
            sceneInfo.subtitle,
            sceneInfo.subtitleSettings || {}
          );
          filters.push(`${currentLabel}${subtitleFilter}${nextLabel}`);
          currentLabel = nextLabel;
          nextLabel = '[v2]';
        }
        
        // 제목 추가
        if (sceneInfo.title) {
          const titleFilter = this.createTitleFilter(
            sceneInfo.title,
            sceneInfo.titleSettings || {}
          );
          const finalLabel = '[final]';
          filters.push(`${currentLabel}${titleFilter}${finalLabel}`);
          currentLabel = finalLabel;
        }
        
        // 3. FFmpeg 명령 실행
        const command = ffmpeg();
        
        // AI 생성 비디오 입력
        command.input(aiVideoPath);
        
        // 음성 입력 (있을 경우)
        if (audioPath) {
          command.input(audioPath);
        }
        
        // 필터 적용
        if (filters.length > 0) {
          command.complexFilter(filters.join(';'));
        }
        
        // 출력 옵션
        const outputOpts = ['-map'];
        
        if (filters.length > 0) {
          outputOpts.push(currentLabel);
        } else {
          outputOpts.push('[0:v]');
        }
        
        // 오디오 매핑
        if (audioPath) {
          outputOpts.push('-map', '1:a');
        } else {
          // AI 비디오의 원본 오디오 유지 (있을 경우)
          outputOpts.push('-map', '0:a?');
        }
        
        outputOpts.push(
          '-c:v', 'libx264',
          '-preset', 'medium',
          '-crf', '23',
          '-pix_fmt', 'yuv420p',
          '-shortest'
        );
        
        if (audioPath) {
          outputOpts.push('-c:a', 'aac', '-b:a', '128k');
        }
        
        command
          .outputOptions(outputOpts)
          .output(outputPath)
          .on('start', (cmd) => {
            console.log(`   FFmpeg 시작: ${cmd}`);
          })
          .on('progress', (progress) => {
            console.log(`   진행률: ${Math.round(progress.percent || 0)}%`);
          })
          .on('end', () => {
            console.log(`   ✅ 음성/자막 합성 완료: ${outputPath}`);
            resolve(outputPath);
          })
          .on('error', (err) => {
            console.error(`   ❌ FFmpeg 실패:`, err);
            reject(err);
          })
          .run();
          
      } catch (error) {
        console.error(`   ❌ 음성/자막 추가 실패:`, error);
        reject(error);
      }
    });
  }

  /**
   * 오래된 임시 파일 정리 (24시간 이상)
   */
  async cleanupOldTempFiles() {
    try {
      const files = await fs.readdir(TEMP_DIR);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24시간

      for (const file of files) {
        const filePath = path.join(TEMP_DIR, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtimeMs > maxAge) {
          await fs.unlink(filePath);
          console.log(`🗑️  오래된 임시 파일 삭제: ${file}`);
        }
      }
    } catch (error) {
      console.error('❌ 임시 파일 정리 실패:', error);
    }
  }
}

// 싱글톤 인스턴스
const videoRenderer = new VideoRenderer();

// 정기적으로 오래된 임시 파일 정리 (1시간마다)
setInterval(() => {
  videoRenderer.cleanupOldTempFiles().catch(console.error);
}, 60 * 60 * 1000);

export default videoRenderer;
