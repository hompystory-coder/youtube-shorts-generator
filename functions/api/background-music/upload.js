// Background Music Upload API - POST endpoint
// Handles background music file uploads

export async function onRequestPost(context) {
  try {
    const { request } = context;
    
    // Get auth token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    console.log('[Background Music Upload] POST request, token:', token ? 'present' : 'missing');
    
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
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No file provided'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    console.log('[Background Music Upload] File received:', file.name, 'Size:', file.size);
    
    // In production, upload to Cloudflare R2 or other storage
    // For now, return mock success response
    const mockUploadResult = {
      id: `bgm_${Date.now()}`,
      name: file.name,
      url: `https://example.com/uploads/${file.name}`,
      size: (file.size / (1024 * 1024)).toFixed(2), // MB
      duration: 180, // Mock duration
      uploadedAt: new Date().toISOString()
    };
    
    return new Response(JSON.stringify({
      success: true,
      data: mockUploadResult,
      message: '배경음악이 업로드되었습니다.'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('[Background Music Upload] Error:', error);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
