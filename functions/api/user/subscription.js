// User Subscription API - GET endpoint
// Returns subscription information for a user

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    
    // Get auth token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    console.log('[User Subscription API] GET request, token:', token ? 'present' : 'missing');
    
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
    
    // Extract userId from token or get from URL
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'admin_001'; // Default fallback
    
    // In production, query D1 database for user subscription
    // For now, return mock data
    try {
      if (env.DB) {
        const result = await env.DB.prepare(
          'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
        ).bind(userId).first();
        
        if (result) {
          return new Response(JSON.stringify({
            success: true,
            data: {
              plan: result.plan_type,
              status: result.status,
              startDate: result.start_date,
              endDate: result.end_date,
              autoRenew: result.auto_renew === 1,
              price: result.plan_type === 'trial' ? 0 : 29000
            }
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      }
    } catch (dbError) {
      console.log('[User Subscription API] DB query failed, using mock data:', dbError);
    }
    
    // Mock subscription data
    const mockSubscription = {
      plan: 'trial',
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: false,
      price: 0
    };
    
    return new Response(JSON.stringify({
      success: true,
      data: mockSubscription
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('[User Subscription API] Error:', error);
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
