// Cloudflare Pages Function: POST /api/voice/preview
// Minimax TTS API를 사용하여 음성 미리듣기 생성

export async function onRequestPost(context) {
  try {
    const { request } = context;
    const { text, voice, apiKey, groupId } = await request.json();

    if (!text) {
      return new Response(JSON.stringify({
        success: false,
        error: '미리듣기 텍스트가 필요합니다.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Minimax API 키가 필요합니다. 마이페이지에서 API 키를 설정해주세요.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    console.log(`🎤 음성 미리듣기 시작: voice=${voice}, text=${text.substring(0, 30)}...`);

    // Minimax TTS API 호출
    const minimaxResponse = await fetch('https://api.minimax.chat/v1/text_to_speech?GroupId=' + (groupId || ''), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'speech-01-turbo',
        text: text,
        stream: false,
        voice_setting: {
          voice_id: voice || 'Friendly_Person',
          speed: 1.0,
          vol: 1.0,
          pitch: 0
        },
        audio_setting: {
          sample_rate: 24000,
          bitrate: 128000,
          format: 'mp3'
        }
      })
    });

    if (!minimaxResponse.ok) {
      const errorText = await minimaxResponse.text();
      console.error('❌ Minimax API 오류:', errorText);
      
      return new Response(JSON.stringify({
        success: false,
        error: `Minimax API 오류: ${minimaxResponse.status} - ${errorText}`
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const result = await minimaxResponse.json();
    
    console.log('📦 Minimax API 응답:', JSON.stringify(result));
    
    // Minimax API 응답에서 오디오 URL 추출
    // 가능한 경로들: result.audio_file, result.data.audio_file, result.extra_info.audio_file
    const audioUrl = result.audio_file || 
                     result.data?.audio_file || 
                     result.extra_info?.audio_file;
    
    if (!audioUrl) {
      console.error('❌ 오디오 URL을 찾을 수 없음:', JSON.stringify(result, null, 2));
      return new Response(JSON.stringify({
        success: false,
        error: '음성 생성에 실패했습니다. API 응답에 오디오 파일이 없습니다.',
        debug: result
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    console.log(`✅ 음성 미리듣기 완료: ${audioUrl}`);

    return new Response(JSON.stringify({
      success: true,
      data: {
        audioUrl: audioUrl,
        voice: voice,
        text: text,
        duration: result.duration || 3
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ 음성 미리듣기 오류:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '음성 미리듣기 중 오류가 발생했습니다: ' + error.message
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
