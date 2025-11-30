// Cloudflare Pages Function: POST /api/auth/login
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { email, password } = await request.json();

    // 간단한 검증
    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: '이메일과 비밀번호를 입력해주세요.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 관리자 계정 확인
    if (email === 'hompystory@gmail.com' && password === 'a1226119') {
      const token = `tok_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const user = {
        id: 'admin_001',
        email: email,
        name: '관리자',
        role: 'super_admin',
        subscription_status: 'admin'
      };

      return new Response(JSON.stringify({
        success: true,
        message: '로그인되었습니다.',
        token: token,
        user: user
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // D1 데이터베이스 쿼리 (DB가 없으면 스킵)
    if (env.DB) {
      try {
        const result = await env.DB.prepare(
          'SELECT * FROM users WHERE email = ?'
        ).bind(email).first();

        if (result && result.password === password) {
          const token = `tok_${Date.now()}_${Math.random().toString(36).substring(2)}`;
          
          // 구독 상태 확인
          const subscription = await env.DB.prepare(
            'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
          ).bind(result.id).first();

          const user = {
            id: result.id,
            email: result.email,
            name: result.name,
            role: result.role || 'user',
            subscription_status: subscription ? subscription.status : 'none'
          };

          return new Response(JSON.stringify({
            success: true,
            message: '로그인되었습니다.',
            token: token,
            user: user
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      } catch (dbError) {
        console.error('DB Error:', dbError);
      }
    }

    // 로그인 실패
    return new Response(JSON.stringify({
      success: false,
      error: '이메일 또는 비밀번호가 올바르지 않습니다.'
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '로그인 처리 중 오류가 발생했습니다.'
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
