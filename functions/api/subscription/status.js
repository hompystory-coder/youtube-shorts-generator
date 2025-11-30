// Subscription Status API - Check user subscription status
// Mock implementation for development

export async function onRequestGet(context) {
  const { request } = context;
  
  // Get auth token from cookies or Authorization header
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  console.log('[Subscription API] Check status, token:', token ? 'present' : 'missing');
  
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
  
  // Mock subscription status
  // In production, this would check against Cloudflare D1 database
  const mockStatus = {
    status: 'trial',  // trial, active, expired
    daysLeft: 3,
    subscription_start: new Date().toISOString(),
    subscription_end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  return new Response(JSON.stringify({
    success: true,
    data: mockStatus
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true'
    }
  });
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    }
  });
}
