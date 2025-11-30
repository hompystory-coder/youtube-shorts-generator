// Cloudflare Pages Function: POST /api/generate/script
export async function onRequestPost(context) {
  try {
    const { request } = context;
    const { parts, title, style } = await request.json();

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

    console.log(`🎬 스크립트 생성 시작: ${parts.length}개 파트`);

    // 간단한 스크립트 생성 (실제로는 Gemini API 호출)
    const scripts = parts.map((part, index) => {
      // 텍스트가 너무 길면 요약
      let scriptText = part.text || '';
      if (scriptText.length > 200) {
        scriptText = scriptText.substring(0, 197) + '...';
      }

      return {
        partId: part.id || `part_${index}`,
        index: index,
        text: scriptText,
        duration: Math.max(3, Math.min(10, Math.ceil(scriptText.length / 20))) // 3-10초
      };
    });

    const totalDuration = scripts.reduce((sum, s) => sum + s.duration, 0);

    console.log(`✅ 스크립트 생성 완료: ${scripts.length}개 파트, 총 ${totalDuration}초`);

    return new Response(JSON.stringify({
      success: true,
      data: {
        scripts: scripts,
        totalDuration: totalDuration,
        title: title || '쇼츠 영상'
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('스크립트 생성 오류:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '스크립트 생성 중 오류가 발생했습니다: ' + error.message
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
