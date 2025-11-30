// Cloudflare Pages Function: POST /api/generate/video
export async function onRequestPost(context) {
  try {
    const { request } = context;
    const { parts, voices, title } = await request.json();

    if (!parts || parts.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: '파트 정보가 필요합니다.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    console.log(`🎬 비디오 생성 시작: ${parts.length}개 파트`);

    // 비디오 생성 시뮬레이션 (실제로는 Shotstack API 호출)
    // 매우 시간이 걸리는 작업 (5-10분)
    
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const mockVideoUrl = `https://example.com/videos/${videoId}.mp4`;

    // 비디오 생성 작업을 백그라운드로 전송
    // 실제로는 Queue나 Durable Objects 사용 필요

    console.log(`✅ 비디오 생성 작업 시작: ${videoId}`);

    return new Response(JSON.stringify({
      success: true,
      data: {
        videoId: videoId,
        status: 'processing', // processing, completed, failed
        message: '비디오 생성이 시작되었습니다. 5-10분 정도 소요됩니다.',
        estimatedTime: 600, // 초
        videoUrl: null, // 완료 후 업데이트됨
        progress: 0
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('비디오 생성 오류:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '비디오 생성 중 오류가 발생했습니다: ' + error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// GET /api/generate/video/:videoId - 비디오 상태 확인
export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const pathParts = url.pathname.split('/');
    const videoId = pathParts[pathParts.length - 1];

    if (!videoId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Video ID가 필요합니다.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Mock 응답: 실제로는 DB나 Queue에서 상태 확인
    const progress = Math.min(100, Math.floor(Math.random() * 100));
    const isComplete = progress >= 95;

    return new Response(JSON.stringify({
      success: true,
      data: {
        videoId: videoId,
        status: isComplete ? 'completed' : 'processing',
        progress: progress,
        videoUrl: isComplete ? `https://example.com/videos/${videoId}.mp4` : null,
        message: isComplete ? '비디오 생성 완료!' : `비디오 생성 중... ${progress}%`
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('비디오 상태 확인 오류:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '비디오 상태 확인 중 오류가 발생했습니다.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
