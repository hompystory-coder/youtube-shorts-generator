// User Payments API - GET endpoint
// Returns payment history for a user

export async function onRequestGet(context) {
  try {
    const { request } = context;
    
    // Get auth token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    console.log('[User Payments API] GET request, token:', token ? 'present' : 'missing');
    
    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Authentication required'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Mock payment history - In production, fetch from D1 database
    const mockPayments = [
      {
        id: 'pay_1',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        plan: 'Professional',
        amount: 29000,
        status: 'completed',
        method: '카드'
      },
      {
        id: 'pay_2',
        date: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000).toISOString(),
        plan: 'Professional',
        amount: 29000,
        status: 'completed',
        method: '카드'
      }
    ];
    
    return new Response(JSON.stringify({
      success: true,
      data: mockPayments,
      total: mockPayments.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('[User Payments API] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
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
