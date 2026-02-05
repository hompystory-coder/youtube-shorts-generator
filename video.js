// 로컬 FFmpeg 기반 비디오 생성 API
// Shotstack API 비용 제로 - 완전 무료
import express from 'express';
import videoRenderer from '../utils/videoRenderer.js';
import multer from 'multer';

const router = express.Router();


// Multer 설정 (FormData 파싱용)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});
// 비디오 생성 상태 저장 (프로덕션에서는 Redis 사용 권장)
const videoJobs = new Map();

/**
 * POST /api/video/generate
 * 로컬 FFmpeg로 비디오 생성
 * - API 비용 제로
 * - 빠른 처리 속도
 * - 완전한 커스터마이징
 */
router.post('/generate', upload.fields([{ name: 'bgMusicFile' }, { name: 'bgImageFile' }]), async (req, res) => {
  try {
    // === 디버깅: 요청 데이터 로깅 ===
    console.log('📦 받은 요청 body:', JSON.stringify(req.body, null, 2));
    console.log('📦 scenes 타입:', typeof req.body.scenes);
    console.log('📦 scenes 값:', req.body.scenes);
    console.log('📦 scenes 길이:', req.body.scenes?.length);
    // === 디버깅 끝 ===
    
    // FormData에서 JSON 파싱 처리
    let scenes = req.body.scenes;
    let settings = req.body.settings;
    
    // FormData로 전송된 경우 JSON 파싱
    if (typeof scenes === 'string') {
      try {
        scenes = JSON.parse(scenes);
      } catch (e) {
        console.error('❌ scenes JSON 파싱 실패:', e);
      }
    }
    
    // parts를 scenes로 변환 (호환성)
    if (!scenes && req.body.parts) {
      console.log('📝 parts를 scenes로 변환');
      let parts = req.body.parts;
      if (typeof parts === 'string') {
        try {
          parts = JSON.parse(parts);
        } catch (e) {
          console.error('❌ parts JSON 파싱 실패:', e);
        }
      }
      scenes = parts;
    }
    
    // audioFiles 파싱 및 각 장면에 매핑
    let audioFiles = req.body.audioFiles;
    if (typeof audioFiles === 'string') {
      try {
        audioFiles = JSON.parse(audioFiles);
      } catch (e) {
        console.error('❌ audioFiles JSON 파싱 실패:', e);
        audioFiles = [];
      }
    }
    
    // audioFiles가 있으면 각 장면에 audioUrl 추가
    if (audioFiles && audioFiles.length > 0) {
      console.log(`🎤 ${audioFiles.length}개 음성 파일을 장면에 매핑`);
      for (let i = 0; i < scenes.length && i < audioFiles.length; i++) {
        // audioFiles[i]가 문자열(URL)이면 그대로, 객체면 url 속성 추출
        const audioUrl = typeof audioFiles[i] === 'string' ? audioFiles[i] : (audioFiles[i]?.url || audioFiles[i]?.filepath);
        if (audioUrl) {
          scenes[i].audioUrl = audioUrl;
          scenes[i].audioPath = audioUrl;  // videoRenderer는 audioPath를 찾음
          console.log(`   장면 ${i + 1}: ${audioUrl}`);
        }
      }
    } else {
      console.log('⚠️  음성 파일 없음 - 자막과 제목만 생성됩니다');
    }
    
    if (typeof settings === 'string') {
      try {
        settings = JSON.parse(settings);
      } catch (e) {
        console.error('❌ settings JSON 파싱 실패:', e);
      }
    }

    // 입력 검증
    if (!scenes || scenes.length === 0) {
      return res.status(400).json({
        success: false,
        error: '장면 데이터가 필요합니다.'
      });
    }

    // 각 장면에 필수 필드 확인 및 imageUrl 프록시 처리
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      if (!scene.imageUrl) {
        return res.status(400).json({
          success: false,
          error: `장면 ${i + 1}에 이미지가 필요합니다.`
        });
      }
      
      // /api/image-proxy?url=... 형식을 원본 URL로 변환
      if (scene.imageUrl.startsWith('/api/image-proxy?url=')) {
        try {
          const urlParam = scene.imageUrl.split('url=')[1];
          scene.imageUrl = decodeURIComponent(urlParam);
          console.log(`📝 장면 ${i + 1}: 프록시 URL을 원본 URL로 변환`);
        } catch (e) {
          console.error(`❌ 장면 ${i + 1}: URL 디코딩 실패`, e);
        }
      }
      
      // scene.text 또는 scene.narration을 subtitle로 매핑 (자막 활성화 시)
      // subtitle 객체가 있으면 자막 활성화로 간주 (enabled 체크 안함)
      if (settings?.subtitle) {
        // ✨ subtitles 배열이 있으면 우선 사용 (20-25자 분할된 자막)
        if (scene.subtitles && Array.isArray(scene.subtitles) && scene.subtitles.length > 0) {
          scene.subtitle = scene.subtitles.join('\n');  // 배열을 줄바꿈으로 합침
          console.log(`📝 장면 ${i + 1}: 자막 ${scene.subtitles.length}줄 추가`);
        } else {
          // 기존 방식: text 또는 narration 사용
          const text = scene.text || scene.narration;
          if (text) {
            scene.subtitle = text;
            console.log(`📝 장면 ${i + 1}: 자막 추가 "${text.substring(0, 20)}..."`);
          }
        }
      }
      
      // 글로벌 제목을 각 장면에 추가 (제목 활성화 시)
      // title 또는 titleConfig 또는 titleStyle 지원
      const titleSettings = settings?.title || settings?.titleConfig || settings?.titleStyle;
      const globalTitle = req.body.title;  // ⭐ req.body에서 제목 가져오기
      
      if (titleSettings?.enabled !== false && globalTitle) {
        // titleSettings.enabled가 명시적으로 false가 아니면 제목 추가
        scene.title = globalTitle;
        console.log(`📝 장면 ${i + 1}: 제목 추가 "${globalTitle.substring(0, 30)}..."`);
      } else if (titleSettings?.text) {
        // 레거시: titleSettings.text가 있으면 사용
        scene.title = titleSettings.text;
        console.log(`📝 장면 ${i + 1}: 제목 추가 (레거시) "${titleSettings.text.substring(0, 30)}..."`);
      }
      
      //       if (!scene.audioUrl) {
      //         return res.status(400).json({
      //           success: false,
      //           error: `장면 ${i + 1}에 음성이 필요합니다.`
      //         });
      //       }
    }

    // 업로드된 파일 처리
    if (req.files) {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // 업로드 디렉토리 생성
      await fs.mkdir('/tmp/uploads/music', { recursive: true });
      await fs.mkdir('/tmp/uploads/backgrounds', { recursive: true });
      
      // 배경 음악 파일 처리
      if (req.files.bgMusicFile && req.files.bgMusicFile[0]) {
        const bgMusicFile = req.files.bgMusicFile[0];
        const bgMusicPath = path.join('/tmp/uploads/music', `${Date.now()}_${bgMusicFile.originalname}`);
        await fs.writeFile(bgMusicPath, bgMusicFile.buffer);
        
        if (!settings.bgMusic) settings.bgMusic = {};
        settings.bgMusic.url = bgMusicPath;
        console.log(`🎵 배경 음악 파일 저장: ${bgMusicPath}`);
      }
      
      // 배경 이미지 파일 처리
      if (req.files.bgImageFile && req.files.bgImageFile[0]) {
        const bgImageFile = req.files.bgImageFile[0];
        const bgImagePath = path.join('/tmp/uploads/backgrounds', `${Date.now()}_${bgImageFile.originalname}`);
        await fs.writeFile(bgImagePath, bgImageFile.buffer);
        
        if (!settings.bgImage) settings.bgImage = {};
        settings.bgImage.url = bgImagePath;
        console.log(`🖼️  배경 이미지 파일 저장: ${bgImagePath}`);
      }
    }

    // settings 키 이름 정규화 (frontend와 renderer 간 호환성)
    // frontend: subtitle, title, titleConfig, titleStyle → renderer: subtitleSettings, titleSettings
    if (settings.subtitle) {
      settings.subtitleSettings = settings.subtitle;
      console.log(`🔄 subtitle → subtitleSettings 변환 (fontSize: ${settings.subtitle.fontSize})`);
    }
    
    // ⭐ titleStyle (쇼츠), titleConfig (롱폼), title (레거시) 모두 지원
    if (settings.titleStyle) {
      settings.titleSettings = settings.titleStyle;
      console.log(`🔄 titleStyle → titleSettings 변환 (쇼츠)`);
      console.log(`   fontSize: ${settings.titleStyle.fontSize}, fontFamily: ${settings.titleStyle.fontFamily}, maxChars: ${settings.titleStyle.maxChars}`);
    } else if (settings.titleConfig) {
      settings.titleSettings = settings.titleConfig;
      console.log(`🔄 titleConfig → titleSettings 변환 (롱폼)`);
      console.log(`   fontSize: ${settings.titleConfig.fontSize}, fontFamily: ${settings.titleConfig.fontFamily}`);
    } else if (settings.title && typeof settings.title === 'object') {
      // settings.title이 설정 객체인 경우 (레거시)
      settings.titleSettings = settings.title;
      console.log(`🔄 title → titleSettings 변환 (레거시)`);
      console.log(`   fontSize: ${settings.title.fontSize}, fontFamily: ${settings.title.fontFamily}`);
    }

    // ⭐ bgMusic.path → bgMusic.url 변환 (프론트엔드에서 path로 보내는 경우)
    if (settings.bgMusic && settings.bgMusic.path && !settings.bgMusic.url) {
      settings.bgMusic.url = settings.bgMusic.path;
      console.log(`🔄 bgMusic.path → bgMusic.url 변환`);
      console.log(`   path: ${settings.bgMusic.path}`);
    }

    // ⭐ backgroundImage.path → bgImage.url 변환
    if (settings.backgroundImage && settings.backgroundImage.path && !settings.backgroundImage.url) {
      if (!settings.bgImage) settings.bgImage = {};
      settings.bgImage.url = settings.backgroundImage.path;
      settings.bgImage.opacity = settings.backgroundImage.opacity || 0.3;
      settings.bgImage.blur = settings.backgroundImage.blur || 10;
      console.log(`🔄 backgroundImage.path → bgImage.url 변환`);
      console.log(`   path: ${settings.backgroundImage.path}, opacity: ${settings.bgImage.opacity}, blur: ${settings.bgImage.blur}`);
    }

    console.log(`🎬 로컬 FFmpeg 비디오 생성 시작: ${scenes.length}개 장면`);
    console.log(`💰 API 비용: ₩0 (무료!)`);
    console.log(`📦 scenes 데이터:`, JSON.stringify(scenes.map(s => ({
      text: s.text,
      imageUrl: s.imageUrl?.substring(0, 50) + '...',
      audioUrl: s.audioUrl ? '있음' : '없음',
      duration: s.duration
    })), null, 2));
    console.log(`📦 settings 데이터:`, JSON.stringify(settings, null, 2));
    console.log(`🎬 videoFormat: ${settings.videoFormat || 'shorts (기본값)'}`);
    console.log(`📝 contentMode: ${settings.contentMode || 'summary (기본값)'}`);

    // 비디오 ID 생성
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // 초기 상태 저장
    videoJobs.set(videoId, {
      status: 'processing',
      progress: 0,
      message: '비디오 생성 준비 중...',
      startTime: Date.now(),
      scenes: scenes.length
    });

    // 즉시 응답 (백그라운드에서 처리)
    res.json({
      success: true,
      data: {
        videoId,
        status: 'processing',
        message: `로컬 FFmpeg로 비디오 생성 시작! (API 비용 ₩0)`,
        estimatedTime: `약 ${scenes.length * 10}초`,
        checkUrl: `/api/video/status/${videoId}`
      }
    });

    // 백그라운드에서 비디오 생성
    (async () => {
      try {
        console.log(`🚀 백그라운드 비디오 생성 시작: ${videoId}`);

        // 진행률 업데이트
        videoJobs.set(videoId, {
          ...videoJobs.get(videoId),
          progress: 10,
          message: '장면 비디오 생성 중...'
        });

        // ⭐ 마지막 고정 멘트 추가
        const closingScene = {
          text: "자세한 정보는 더 보기를 확인 하시면 됩니다",
          subtitle: "자세한 정보는 더 보기를 확인 하시면 됩니다",
          narration: "자세한 정보는 더 보기를 확인 하시면 됩니다",
          duration: 5,
          imageUrl: scenes[scenes.length - 1]?.imageUrl || scenes[0]?.imageUrl, // 마지막 또는 첫 이미지 재사용
          title: req.body.title || scenes[0]?.title
        };
        scenes.push(closingScene);
        console.log(`📌 마지막 고정 멘트 추가: "${closingScene.text}"`);

        // ⭐ TTS 자동 생성 (audioUrl이 없는 scenes에 대해)
        const scenesNeedingTTS = scenes.filter(s => !s.audioUrl && (s.text || s.subtitle || s.narration));
        if (scenesNeedingTTS.length > 0) {
          console.log(`🎙️ ${scenesNeedingTTS.length}개 장면에 TTS 생성 필요`);
          
          videoJobs.set(videoId, {
            ...videoJobs.get(videoId),
            progress: 15,
            message: `TTS 음성 생성 중... (0/${scenesNeedingTTS.length})`
          });

          // voice API 호출
          const voiceId = settings.voice || 'male_001';
          const axios = await import('axios').then(m => m.default);
          
          try {
            const ttsResponse = await axios.post('http://localhost:4001/api/voice/generate', {
              scenes: scenesNeedingTTS.map(s => ({
                text: s.text || s.subtitle || s.narration,
                narration: s.text || s.subtitle || s.narration
              })),
              voiceId: voiceId
            });

            console.log('🔍 TTS API 응답:', JSON.stringify({
              success: ttsResponse.data.success,
              hasData: !!ttsResponse.data.data,
              hasAudioFiles: !!(ttsResponse.data.data?.audioFiles || ttsResponse.data.audioFiles),
              audioFilesCount: (ttsResponse.data.data?.audioFiles || ttsResponse.data.audioFiles)?.length
            }));

            if (ttsResponse.data.success) {
              const audioFiles = ttsResponse.data.data?.audioFiles || ttsResponse.data.audioFiles;
              if (!audioFiles || audioFiles.length === 0) {
                console.log('⚠️  TTS 응답에 audioFiles가 없음');
                return;
              }
              console.log(`✅ TTS 생성 완료: ${audioFiles.length}개 파일`);
              
              // audioUrl을 scenes에 매핑
              let ttsIndex = 0;
              for (let i = 0; i < scenes.length; i++) {
                if (!scenes[i].audioUrl && (scenes[i].text || scenes[i].subtitle || scenes[i].narration)) {
                  if (ttsIndex < audioFiles.length) {
                    scenes[i].audioUrl = audioFiles[ttsIndex].filepath || audioFiles[ttsIndex].url;
                    scenes[i].audioPath = scenes[i].audioUrl; // videoRenderer가 audioPath를 참조
                    scenes[i].duration = audioFiles[ttsIndex].duration || 3;
                    console.log(`   장면 ${i + 1}: audioUrl 추가 (${scenes[i].duration}초)`);
                    ttsIndex++;
                  }
                }
              }
            }
          } catch (ttsError) {
            console.error('⚠️  TTS 생성 실패:', ttsError.message);
            console.log('   자막과 제목만으로 비디오 생성 계속...');
          }
        }

        // 비디오 생성 (로컬 FFmpeg 사용)
        console.log('🔍 [video.js] generateVideo 호출 전:', {
          videoFormat: settings.videoFormat,
          contentMode: settings.contentMode,
          settingsKeys: Object.keys(settings),
          scenesWithAudio: scenes.filter(s => s.audioUrl).length,
          totalScenes: scenes.length
        });
        
        // 🔍 디버깅: 각 장면의 audioUrl 확인
        console.log('📊 장면별 audioUrl 상태:');
        scenes.forEach((scene, index) => {
          console.log(`   장면 ${index + 1}: audioUrl = ${scene.audioUrl ? '✅ 있음' : '❌ 없음'}${scene.audioUrl ? ` (${scene.audioUrl.substring(scene.audioUrl.length - 30)})` : ''}`);
        });
        
        const result = await videoRenderer.generateVideo(scenes, settings);

        // 완료 상태 업데이트
        const endTime = Date.now();
        const duration = Math.round((endTime - videoJobs.get(videoId).startTime) / 1000);

        videoJobs.set(videoId, {
          status: 'completed',
          progress: 100,
          message: '비디오 생성 완료!',
          videoUrl: result.videoUrl,
          videoPath: result.videoPath,
          videoId: result.videoId,
          size: result.size,
          duration: result.duration,
          processingTime: duration,
          cost: 0 // 무료!
        });

        console.log(`✅ 비디오 생성 완료: ${videoId}`);
        console.log(`   처리 시간: ${duration}초`);
        console.log(`   파일 크기: ${(result.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   비용: ₩0 (무료!)`);

      } catch (error) {
        console.error(`❌ 비디오 생성 실패: ${videoId}`, error);
        
        videoJobs.set(videoId, {
          status: 'failed',
          progress: 0,
          message: '비디오 생성 실패',
          error: error.message
        });
      }
    })();

  } catch (error) {
    console.error('❌ 비디오 생성 요청 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/video/status/:videoId
 * 비디오 생성 상태 확인
 */
router.get('/status/:videoId', (req, res) => {
  try {
    const { videoId } = req.params;
    
    const job = videoJobs.get(videoId);

    if (!job) {
      return res.json({
        success: true,
        data: {
          videoId,
          status: 'not_found',
          progress: 0,
          message: '비디오 작업을 찾을 수 없습니다.'
        }
      });
    }

    res.json({
      success: true,
      data: {
        videoId,
        ...job
      }
    });

  } catch (error) {
    console.error('❌ 상태 확인 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/video/generate-scene
 * 단일 장면 비디오 생성 (테스트용)
 */
router.post('/generate-scene', async (req, res) => {
  try {
    const { scene, settings } = req.body;

    if (!scene || !scene.imageUrl || !scene.audioUrl) {
      return res.status(400).json({
        success: false,
        error: '장면 데이터(이미지, 음성)가 필요합니다.'
      });
    }

    console.log('🎬 단일 장면 비디오 생성...');

    // 단일 장면 생성
    const scenePath = await videoRenderer.createSceneVideo(scene, 0, settings);

    res.json({
      success: true,
      data: {
        scenePath,
        message: '장면 비디오 생성 완료'
      }
    });

  } catch (error) {
    console.error('❌ 장면 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/video/:videoId
 * 비디오 삭제
 */
router.delete('/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const job = videoJobs.get(videoId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: '비디오를 찾을 수 없습니다.'
      });
    }

    if (job.videoPath) {
      const fs = await import('fs/promises');
      try {
        await fs.unlink(job.videoPath);
        console.log(`🗑️  비디오 파일 삭제: ${job.videoPath}`);
      } catch (error) {
        console.error('파일 삭제 실패:', error);
      }
    }

    videoJobs.delete(videoId);

    res.json({
      success: true,
      message: '비디오가 삭제되었습니다.'
    });

  } catch (error) {
    console.error('❌ 비디오 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/video/jobs/list
 * 모든 비디오 작업 목록
 */
router.get('/jobs/list', (req, res) => {
  try {
    const jobs = Array.from(videoJobs.entries()).map(([id, job]) => ({
      videoId: id,
      ...job
    }));

    res.json({
      success: true,
      data: {
        total: jobs.length,
        jobs: jobs.sort((a, b) => b.startTime - a.startTime)
      }
    });

  } catch (error) {
    console.error('❌ 작업 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/video/jobs/cleanup
 * 완료된 작업 정리
 */
router.post('/jobs/cleanup', (req, res) => {
  try {
    let cleaned = 0;
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24시간

    for (const [videoId, job] of videoJobs.entries()) {
      if (job.status === 'completed' || job.status === 'failed') {
        if (now - job.startTime > maxAge) {
          videoJobs.delete(videoId);
          cleaned++;
        }
      }
    }

    res.json({
      success: true,
      message: `${cleaned}개의 오래된 작업을 정리했습니다.`
    });

  } catch (error) {
    console.error('❌ 작업 정리 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 정기적으로 오래된 작업 정리 (1시간마다)
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000;
  let cleaned = 0;

  for (const [videoId, job] of videoJobs.entries()) {
    if (job.status === 'completed' || job.status === 'failed') {
      if (now - job.startTime > maxAge) {
        videoJobs.delete(videoId);
        cleaned++;
      }
    }
  }

  if (cleaned > 0) {
    console.log(`🗑️  ${cleaned}개의 오래된 비디오 작업 정리 완료`);
  }
}, 60 * 60 * 1000);

/**
 * GET /api/video/list
 * 생성된 비디오 파일 목록 조회 (파일 시스템 기반)
 */
router.get('/list', async (req, res) => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const videosDir = path.join(process.env.OUTPUT_DIR || '/mnt/music-storage/shorts-videos/outputs', 'videos');
    
    console.log(`📂 비디오 목록 조회: ${videosDir}`);
    
    // 디렉토리 존재 확인
    try {
      await fs.access(videosDir);
    } catch (error) {
      return res.json({
        success: true,
        data: {
          total: 0,
          videos: []
        }
      });
    }
    
    // 비디오 파일 목록 읽기
    const files = await fs.readdir(videosDir);
    const videoFiles = files.filter(file => file.endsWith('.mp4'));
    
    // 각 파일의 메타데이터 읽기
    const videos = await Promise.all(
      videoFiles.map(async (file) => {
        const filePath = path.join(videosDir, file);
        const stats = await fs.stat(filePath);
        
        return {
          videoId: file.replace('.mp4', ''),
          filename: file,
          url: `/outputs/videos/${file}`,
          size: stats.size,
          createdAt: stats.mtime,
          thumbnail: `/outputs/videos/${file}` // 비디오를 썸네일로 사용
        };
      })
    );
    
    // 최신순 정렬
    videos.sort((a, b) => b.createdAt - a.createdAt);
    
    console.log(`✅ 비디오 ${videos.length}개 조회 완료`);
    
    res.json({
      success: true,
      data: {
        total: videos.length,
        videos
      }
    });
    
  } catch (error) {
    console.error('❌ 비디오 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/video/generate-with-ai
 * AI 이미지투비디오로 쇼츠 생성
 * - image-to-video AI 사용
 * - 자연스러운 움직임 생성
 */
router.post('/generate-with-ai', upload.none(), async (req, res) => {
  console.log('🤖 AI 이미지투비디오 생성 요청 받음');
  
  try {
    // 요청 파싱
    let { scenes, settings } = req.body;
    
    if (typeof scenes === 'string') {
      scenes = JSON.parse(scenes);
    }
    if (typeof settings === 'string') {
      settings = JSON.parse(settings);
    }
    
    if (!scenes || scenes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'scenes가 필요합니다'
      });
    }
    
    // AI 비디오 모드 활성화
    settings.useAiVideo = true;
    settings.aiVideoModel = settings.aiVideoModel || 'runway/gen4_turbo';
    
    // videoId 생성
    const videoId = `ai_video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // 초기 상태 저장
    videoJobs.set(videoId, {
      status: 'processing',
      progress: 0,
      message: 'AI 비디오 생성 준비 중...',
      startTime: Date.now()
    });
    
    // 즉시 응답
    res.json({
      success: true,
      data: {
        videoId,
        message: 'AI 비디오 생성이 시작되었습니다',
        status: 'processing',
        estimatedTime: scenes.length * 60 // 장면당 약 60초 예상
      }
    });
    
    // 백그라운드에서 AI 비디오 생성
    (async () => {
      try {
        console.log(`🚀 AI 비디오 생성 시작: ${videoId}`);
        console.log(`   장면 수: ${scenes.length}`);
        console.log(`   모델: ${settings.aiVideoModel}`);
        
        const scenePaths = [];
        
        // 각 장면별로 AI 비디오 생성
        for (let i = 0; i < scenes.length; i++) {
          const scene = scenes[i];
          const progress = Math.round((i / scenes.length) * 90);
          
          videoJobs.set(videoId, {
            ...videoJobs.get(videoId),
            progress,
            message: `장면 ${i + 1}/${scenes.length} AI 생성 중...`
          });
          
          console.log(`\n📹 장면 ${i + 1}/${scenes.length} AI 생성 시작`);
          
          // AI 비디오 메타데이터 생성
          const aiMeta = await videoRenderer.createSceneVideo(scene, i, settings);
          
          if (aiMeta.needsAiGeneration) {
            console.log(`   🤖 video_generation 호출 준비`);
            console.log(`   이미지: ${aiMeta.imageUrl}`);
            console.log(`   프롬프트: ${aiMeta.prompt}`);
            console.log(`   모델: ${aiMeta.model}`);
            
            try {
              // video_generation 도구 호출
              // 주의: 이 도구는 Claude AI 환경에서만 사용 가능합니다
              // 일반 Node.js 환경에서는 작동하지 않으므로 Fallback 처리가 필요합니다
              
              console.log(`   ⚠️  video_generation 도구는 Claude AI 환경 전용입니다`);
              console.log(`   🔄 FFmpeg Fallback 모드로 전환합니다`);
              
              // FFmpeg 모드로 폴백
              // useAiVideo를 false로 설정하여 일반 FFmpeg 생성
              const fallbackSettings = {
                ...settings,
                useAiVideo: false
              };
              
              const fallbackPath = await videoRenderer.createSceneVideo(
                scene,
                i,
                fallbackSettings
              );
              
              scenePaths.push(fallbackPath);
              
              console.log(`   ✅ FFmpeg 모드로 장면 생성 완료`);
              
            } catch (aiError) {
              console.error(`   ❌ AI 비디오 생성 실패:`, aiError);
              console.log(`   🔄 FFmpeg Fallback 모드로 재시도`);
              
              // 최종 Fallback: 일반 FFmpeg 모드
              const fallbackSettings = {
                ...settings,
                useAiVideo: false
              };
              
              const fallbackPath = await videoRenderer.createSceneVideo(
                scene,
                i,
                fallbackSettings
              );
              
              scenePaths.push(fallbackPath);
            }
            
          } else {
            // FFmpeg 모드 (폴백)
            scenePaths.push(aiMeta);
          }
        }
        
        // 모든 장면 결합
        videoJobs.set(videoId, {
          ...videoJobs.get(videoId),
          progress: 95,
          message: '장면 결합 중...'
        });
        
        const finalVideo = await videoRenderer.concatenateScenes(scenePaths, settings);
        
        // 완료
        videoJobs.set(videoId, {
          status: 'completed',
          progress: 100,
          message: 'AI 비디오 생성 완료!',
          videoUrl: finalVideo.videoUrl,
          videoPath: finalVideo.videoPath,
          videoId: finalVideo.videoId,
          size: finalVideo.size,
          duration: finalVideo.duration,
          processingTime: Math.round((Date.now() - videoJobs.get(videoId).startTime) / 1000)
        });
        
        console.log(`✅ AI 비디오 생성 완료: ${videoId}`);
        
      } catch (error) {
        console.error(`❌ AI 비디오 생성 실패: ${videoId}`, error);
        
        // Fallback 모드로 재시도
        console.log(`🔄 최종 FFmpeg Fallback 시도...`);
        
        try {
          const fallbackSettings = {
            ...settings,
            useAiVideo: false
          };
          
          const result = await videoRenderer.generateVideo(scenes, fallbackSettings);
          
          videoJobs.set(videoId, {
            status: 'completed',
            progress: 100,
            message: '비디오 생성 완료 (FFmpeg 모드)',
            videoUrl: result.videoUrl,
            videoPath: result.videoPath,
            videoId: result.videoId,
            size: result.size,
            duration: result.duration,
            processingTime: Math.round((Date.now() - videoJobs.get(videoId).startTime) / 1000),
            fallbackUsed: true,
            fallbackReason: error.message
          });
          
          console.log(`✅ FFmpeg Fallback 성공: ${videoId}`);
          
        } catch (fallbackError) {
          console.error(`❌ FFmpeg Fallback도 실패: ${videoId}`, fallbackError);
          
          videoJobs.set(videoId, {
            status: 'failed',
            progress: 0,
            message: 'AI 비디오 및 FFmpeg 모두 실패',
            error: error.message,
            fallbackError: fallbackError.message
          });
        }
      }
    })();
    
  } catch (error) {
    console.error('❌ AI 비디오 생성 요청 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/video/generate-json
 * JSON 형식으로 비디오 생성 (multer 없이)
 * longform API에서 사용
 */
router.post('/generate-json', async (req, res) => {
  try {
    const { parts, title, videoFormat, contentMode, subtitle, bgMusic } = req.body;
    
    console.log(`\n🎬 [JSON 비디오 생성] 시작`);
    console.log(`   제목: ${title}`);
    console.log(`   장면 수: ${parts?.length || 0}개`);
    
    // parts를 scenes로 변환
    const scenes = parts || [];
    
    if (!scenes || scenes.length === 0) {
      return res.status(400).json({
        success: false,
        error: '장면(scenes) 데이터가 필요합니다.'
      });
    }
    
    // settings 객체 구성
    const settings = {
      subtitle: subtitle || {
        enabled: true,
        fontSize: 48,
        color: 'white',
        fontFamily: 'NanumGothicBold'
      },
      bgMusic: bgMusic || { enabled: false },
      videoFormat: videoFormat || 'longform',
      contentMode: contentMode || 'full'
    };
    
    // 기존 generate 로직 재사용
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    console.log(`🎥 비디오 렌더링 시작: ${videoId}`);
    
    // VideoRenderer 호출
    const result = await videoRenderer.generateVideo({
      videoId,
      title: title || '제목 없음',
      scenes: scenes.map((scene, index) => ({
        sceneNumber: scene.sceneNumber || index + 1,
        text: scene.text || '',
        narration: scene.text || '',
        imageUrl: scene.imageUrl,
        audioUrl: scene.audioUrl,
        duration: scene.duration || 8,
        subtitle: scene.text || ''
      })),
      settings
    });
    
    if (result.success) {
      console.log(`✅ 비디오 생성 완료: ${result.videoUrl}`);
      res.json({
        success: true,
        videoId: result.videoId,
        videoUrl: result.videoUrl,
        duration: result.duration || 0
      });
    } else {
      throw new Error(result.error || '비디오 생성 실패');
    }
    
  } catch (error) {
    console.error('❌ JSON 비디오 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message || '비디오 생성에 실패했습니다.'
    });
  }
});

export default router;
