// Cloudflare Pages Function: POST /api/generate/voice
export async function onRequestPost(context) {
  try {
    const { request } = context;
    const { scripts, voiceModel, apiKey } = await request.json();

    if (!scripts || scripts.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: '스크립트 정보가 필요합니다.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    console.log(`🎤 음성 생성 시작: ${scripts.length}개 스크립트, 모델: ${voiceModel || 'default'}`);

    // 음성 생성 시뮬레이션 (실제로는 Gemini/Minimax API 호출)
    // 시간이 걸리는 작업이므로 비동기 처리 필요
    
    const voices = scripts.map((script, index) => {
      return {
        partId: script.partId || `part_${index}`,
        index: index,
        audioUrl: `https://example.com/audio/voice_${Date.now()}_${index}.mp3`, // Mock URL
        duration: script.duration || 5,
        text: script.text
      };
    });

    console.log(`✅ 음성 생성 완료: ${voices.length}개 음성`);

    return new Response(JSON.stringify({
      success: true,
      data: {
        voices: voices,
        model: voiceModel || 'gemini-default',
        totalDuration: voices.reduce((sum, v) => sum + v.duration, 0)
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('음성 생성 오류:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '음성 생성 중 오류가 발생했습니다: ' + error.message
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
