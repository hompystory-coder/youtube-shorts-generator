// Cloudflare Pages Function: POST /api/payment/payapp/request
export async function onRequestPost(context) {
  try {
    const { request } = context;
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

    const { planType, paymentMethod } = await request.json();

    if (!planType) {
      return new Response(JSON.stringify({
        success: false,
        error: '구독 플랜이 필요합니다.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 결제 금액 결정
    const prices = {
      'monthly': 33000,
      'yearly': 297000
    };

    const amount = prices[planType] || 0;

    console.log(`💳 결제 요청: ${planType} 플랜, ${amount}원`);

    // PAYAPP 결제 URL 생성 (Mock)
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const paymentUrl = `https://payapp-mock.example.com/payment/${paymentId}`;

    // 실제로는 PAYAPP API 호출하여 결제 URL 생성
    // const payappResponse = await fetch('https://api.payapp.kr/payment', {
    //   method: 'POST',
    //   headers: { 'Authorization': 'Bearer PAYAPP_API_KEY' },
    //   body: JSON.stringify({ amount, planType, ... })
    // });

    console.log(`✅ 결제 URL 생성: ${paymentId}`);

    return new Response(JSON.stringify({
      success: true,
      data: {
        paymentId: paymentId,
        paymentUrl: paymentUrl,
        amount: amount,
        planType: planType,
        expiresAt: Date.now() + (30 * 60 * 1000) // 30분 후 만료
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('결제 요청 오류:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '결제 요청 중 오류가 발생했습니다: ' + error.message
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
