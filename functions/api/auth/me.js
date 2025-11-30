// Cloudflare Pages Function: GET /api/auth/me
export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        error: '인증이 필요합니다.'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // 토큰 검증 (간단한 형식 체크)
    if (!token || !token.startsWith('tok_')) {
      return new Response(JSON.stringify({
        success: false,
        error: '유효하지 않은 토큰입니다.'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 테스트용 사용자 정보 반환
    const user = {
      id: 'user_test_001',
      email: 'test@example.com',
      name: '테스트 사용자',
      role: 'user',
      subscription_status: 'trial',
      trial_days_left: 3
    };

    return new Response(JSON.stringify({
      success: true,
      user: user
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Auth me error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '사용자 정보 조회 중 오류가 발생했습니다.'
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
