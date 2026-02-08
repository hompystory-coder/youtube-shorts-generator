import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



/**
 * Puppeteer 기반 HTML 렌더러
 * Frontend와 동일한 애니메이션을 영상에 적용
 */
class PuppeteerRenderer {
    constructor() {
        this.browser = null;
        this.templatePath = path.join(__dirname, '../templates/videoTemplate.html');
    }

    /**
     * 브라우저 초기화
     */
    async initBrowser() {
        if (!this.browser) {
            console.log('🚀 Puppeteer 브라우저 시작...');
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            });
            console.log('✅ Puppeteer 브라우저 준비 완료');
        }
        return this.browser;
    }

    /**
     * 브라우저 종료
     */
    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            console.log('🔒 Puppeteer 브라우저 종료');
        }
    }

    /**
     * HTML 템플릿 로드
     */
    async loadTemplate() {
        try {
            const template = await fs.readFile(this.templatePath, 'utf-8');
            return template;
        } catch (error) {
            console.error('❌ 템플릿 로드 실패:', error);
            throw error;
        }
    }
    /**
     * 제목 HTML 생성
     */
    buildTitleHTML(text, settings) {
        if (!text || !settings.enabled) return '';

        const {
            fontSize = 72,
            fontFamily = 'NanumGothicBold',
            color = '#FFFFFF',
            strokeWidth = 4,
            strokeColor = '#000000',
            position = 'top',
            animation = 'none',
            animationDuration = 2.0
        } = settings;

        // 텍스트 그림자 (테두리 효과)
        const textShadow = strokeWidth > 0 
            ? `
                -${strokeWidth}px -${strokeWidth}px 0 ${strokeColor},
                ${strokeWidth}px -${strokeWidth}px 0 ${strokeColor},
                -${strokeWidth}px ${strokeWidth}px 0 ${strokeColor},
                ${strokeWidth}px ${strokeWidth}px 0 ${strokeColor}
            `.trim()
            : 'none';

        // 애니메이션 클래스
        const animationClass = animation !== 'none' ? `animation-${animation}` : '';

        return `
            <div class="title-container ${position}">
                <div class="title-text ${animationClass}" 
                     style="font-size: ${fontSize}px; 
                            font-family: '${fontFamily}', 'Noto Sans KR', sans-serif; 
                            color: ${color}; 
                            text-shadow: ${textShadow};
                            --animation-duration: ${animationDuration}s;">
                    ${this.escapeHtml(text)}
                </div>
            </div>
        `;
    }

    /**
     * 자막 HTML 생성
     */
    buildSubtitleHTML(text, settings) {
        if (!text || !settings.enabled) return '';

        const {
            fontSize = 56,
            fontFamily = 'NanumGothicBold',
            color = '#FFFFFF',
            strokeWidth = 4,
            strokeColor = '#000000',
            position = 'center',
            animation = 'none',
            animationDuration = 2.0
        } = settings;

        // 텍스트 그림자 (테두리 효과)
        const textShadow = strokeWidth > 0 
            ? `
                -${strokeWidth}px -${strokeWidth}px 0 ${strokeColor},
                ${strokeWidth}px -${strokeWidth}px 0 ${strokeColor},
                -${strokeWidth}px ${strokeWidth}px 0 ${strokeColor},
                ${strokeWidth}px ${strokeWidth}px 0 ${strokeColor}
            `.trim()
            : 'none';

        // 애니메이션 클래스
        const animationClass = animation !== 'none' ? `animation-${animation}` : '';

        return `
            <div class="subtitle-container ${position}">
                <div class="subtitle-text ${animationClass}" 
                     style="font-size: ${fontSize}px; 
                            font-family: '${fontFamily}', 'Noto Sans KR', sans-serif; 
                            color: ${color}; 
                            text-shadow: ${textShadow};
                            --animation-duration: ${animationDuration}s;">
                    ${this.escapeHtml(text)}
                </div>
            </div>
        `;
    }
    /**
     * 워터마크 HTML 생성
     */
    buildWatermarkHTML(settings) {
        if (!settings.enabled || !settings.path) return '';

        const {
            position = 'bottom-right',
            size = 15,
            opacity = 0.8
        } = settings;

        // 워터마크 이미지의 실제 경로
        const watermarkPath = settings.path;

        return `
            <img src="file://${watermarkPath}" 
                 class="watermark ${position}" 
                 style="width: ${size}%; opacity: ${opacity};" 
                 alt="Watermark" />
        `;
    }

    /**
     * HTML escape
     */
    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/\n/g, '<br>');
    }

    /**
     * 장면별 HTML 생성
     */
    async buildSceneHTML(scene, settings) {
        const template = await this.loadTemplate();

        // 배경 이미지
        const bgImageHTML = settings.backgroundImage?.enabled && settings.backgroundImage?.path
            ? `<img src="file://${settings.backgroundImage.path}" class="background-image" alt="Background" />`
            : '';

        // 장면 이미지
        const sceneImageHTML = scene.imagePath
            ? `<img src="file://${scene.imagePath}" class="scene-image" alt="Scene" />`
            : '';

        // 제목
        const titleHTML = scene.title 
            ? this.buildTitleHTML(scene.title, settings.titleSettings || {})
            : '';

        // 자막
        const subtitleHTML = scene.subtitle 
            ? this.buildSubtitleHTML(scene.subtitle, settings.subtitleSettings || {})
            : '';

        // 워터마크
        const watermarkHTML = this.buildWatermarkHTML(settings.watermark || {});

        // 템플릿 치환
        return template
            .replace('{{BACKGROUND_IMAGE}}', bgImageHTML)
            .replace('{{SCENE_IMAGE}}', sceneImageHTML)
            .replace('{{TITLE}}', titleHTML)
            .replace('{{SUBTITLE}}', subtitleHTML)
            .replace('{{WATERMARK}}', watermarkHTML);
    }
    /**
     * 장면 렌더링 (스크린샷 생성)
     */
    async renderScene(scene, settings, outputPath) {
        const browser = await this.initBrowser();
        const page = await browser.newPage();

        try {
            // 뷰포트 설정 (1080x1920 Shorts)
            await page.setViewport({
                width: 1080,
                height: 1920,
                deviceScaleFactor: 1
            });

            // HTML 생성
            const html = await this.buildSceneHTML(scene, settings);

            // HTML 로드
            await page.setContent(html, {
                waitUntil: 'networkidle0'
            });

            // 애니메이션 시간 계산
            const titleAnimation = settings.titleSettings?.animation || 'none';
            const subtitleAnimation = settings.subtitleSettings?.animation || 'none';
            const titleDuration = settings.titleSettings?.animationDuration || 2.0;
            const subtitleDuration = settings.subtitleSettings?.animationDuration || 2.0;
            
            const maxAnimationDuration = Math.max(
                titleAnimation !== 'none' ? titleDuration : 0,
                subtitleAnimation !== 'none' ? subtitleDuration : 0
            );

            // 애니메이션 완료 대기 (애니메이션 시간 + 여유 0.5초)
            if (maxAnimationDuration > 0) {
                await page.waitForTimeout((maxAnimationDuration + 0.5) * 1000);
            }

            // 스크린샷 캡처
            await page.screenshot({
                path: outputPath,
                type: 'png',
                fullPage: false
            });

            console.log(`✅ 스크린샷 생성: ${path.basename(outputPath)}`);

            await page.close();
            return outputPath;

        } catch (error) {
            console.error('❌ 장면 렌더링 실패:', error);
            await page.close();
            throw error;
        }
    }

    /**
     * 모든 장면 렌더링
     */
    async renderAllScenes(scenes, settings, outputDir) {
        console.log(`🎬 총 ${scenes.length}개 장면 렌더링 시작...`);
        
        const screenshotPaths = [];
        
        for (let i = 0; i < scenes.length; i++) {
            const scene = scenes[i];
            const outputPath = path.join(outputDir, `scene_${String(i + 1).padStart(3, '0')}.png`);
            
            console.log(`📸 장면 ${i + 1}/${scenes.length} 렌더링 중...`);
            await this.renderScene(scene, settings, outputPath);
            
            screenshotPaths.push(outputPath);
        }
        
        console.log(`✅ 모든 장면 렌더링 완료!`);
        return screenshotPaths;
    }
    /**
     * FFmpeg로 스크린샷들을 영상으로 변환
     */
    async createVideoFromScreenshots(screenshotPaths, audioPath, outputVideoPath, duration) {
        return new Promise((resolve, reject) => {
            console.log('🎥 FFmpeg로 영상 생성 중...');

            const fps = screenshotPaths.length / duration;
            
            // FFmpeg 명령어
            const ffmpegArgs = [
                '-y',
                '-framerate', fps.toFixed(2),
                '-pattern_type', 'glob',
                '-i', path.join(path.dirname(screenshotPaths[0]), 'scene_*.png'),
                '-i', audioPath,
                '-c:v', 'libx264',
                '-preset', 'medium',
                '-crf', '23',
                '-pix_fmt', 'yuv420p',
                '-c:a', 'aac',
                '-b:a', '128k',
                '-shortest',
                outputVideoPath
            ];

            const ffmpeg = spawn('ffmpeg', ffmpegArgs);

            let stderr = '';

            ffmpeg.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ FFmpeg 영상 생성 완료!');
                    resolve(outputVideoPath);
                } else {
                    console.error('❌ FFmpeg 실패:', stderr);
                    reject(new Error(`FFmpeg exited with code ${code}`));
                }
            });

            ffmpeg.on('error', (error) => {
                console.error('❌ FFmpeg 실행 오류:', error);
                reject(error);
            });
        });
    }

    /**
     * 임시 파일 정리
     */
    async cleanup(screenshotPaths) {
        console.log('🧹 임시 파일 정리 중...');
        for (const filePath of screenshotPaths) {
            try {
                await fs.unlink(filePath);
            } catch (error) {
                console.warn(`⚠️  파일 삭제 실패: ${filePath}`, error);
            }
        }
        console.log('✅ 임시 파일 정리 완료');
    }
}

// Export
const puppeteerRenderer = new PuppeteerRenderer();
export default puppeteerRenderer;
export { PuppeteerRenderer };
