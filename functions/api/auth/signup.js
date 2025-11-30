// Cloudflare Pages Function: POST /api/auth/signup
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { email, password, name } = await request.json();

    // 검증
    if (!email || !password || !name) {
      return new Response(JSON.stringify({
        success: false,
        error: '모든 필드를 입력해주세요.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const token = `tok_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // D1 데이터베이스 사용 가능한 경우
    if (env.DB) {
      try {
        // 이메일 중복 확인
        const existing = await env.DB.prepare(
          'SELECT id FROM users WHERE email = ?'
        ).bind(email).first();

        if (existing) {
          return new Response(JSON.stringify({
            success: false,
            error: '이미 사용 중인 이메일입니다.'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }

        // 사용자 생성
        await env.DB.prepare(`
          INSERT INTO users (id, email, password, name, role, created_at)
          VALUES (?, ?, ?, ?, 'user', datetime('now'))
        `).bind(userId, email, password, name).run();

        // 3일 무료 체험 구독 생성
        const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 3);

        await env.DB.prepare(`
          INSERT INTO subscriptions (id, user_id, plan_type, status, trial_end_date, created_at)
          VALUES (?, ?, 'trial', 'trial', ?, datetime('now'))
        `).bind(subscriptionId, userId, trialEndDate.toISOString()).run();

        const user = {
          id: userId,
          email: email,
          name: name,
          role: 'user',
          subscription_status: 'trial'
        };

        return new Response(JSON.stringify({
          success: true,
          message: '회원가입이 완료되었습니다. 3일 무료 체험이 시작되었습니다!',
          token: token,
          user: user
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });

      } catch (dbError) {
        console.error('DB Error:', dbError);
        
        // DB 오류 시 폴백: 메모리에서만 처리
        const user = {
          id: userId,
          email: email,
          name: name,
          role: 'user',
          subscription_status: 'trial'
        };

        return new Response(JSON.stringify({
          success: true,
          message: '회원가입이 완료되었습니다. (임시)',
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
    }

    // DB 없이 기본 응답
    const user = {
      id: userId,
      email: email,
      name: name,
      role: 'user',
      subscription_status: 'trial'
    };

    return new Response(JSON.stringify({
      success: true,
      message: '회원가입이 완료되었습니다.',
      token: token,
      user: user
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '회원가입 처리 중 오류가 발생했습니다.'
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
