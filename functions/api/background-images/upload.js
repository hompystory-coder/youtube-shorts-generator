// Background Images Upload API - POST endpoint
// Handles background image file uploads

export async function onRequestPost(context) {
  try {
    const { request } = context;
    
    // Get auth token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    console.log('[Background Images Upload] POST request, token:', token ? 'present' : 'missing');
    
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
    
    // Check content type and parse accordingly
    const contentType = request.headers.get('Content-Type') || '';
    let fileName, fileData, userId;
    
    if (contentType.includes('application/json')) {
      // Handle JSON upload (data URL from browser)
      const body = await request.json();
      fileName = body.name;
      fileData = body.dataUrl;
      userId = body.userId;
      
      if (!fileName || !fileData) {
        return new Response(JSON.stringify({
          success: false,
          message: 'File name and data are required'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      console.log('[Background Images Upload] JSON upload:', fileName);
      
    } else if (contentType.includes('multipart/form-data')) {
      // Handle FormData upload
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
      
      fileName = file.name;
      console.log('[Background Images Upload] FormData upload:', fileName, 'Size:', file.size);
      
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: 'Unsupported Content-Type'
      }), {
        status: 415,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // In production, upload to Cloudflare R2 or other storage
    // For now, return mock success response
    const mockUploadResult = {
      id: `img_${Date.now()}`,
      name: fileName,
      url: `https://images.unsplash.com/photo-${Date.now()}?w=400`,
      data_url: fileData || `https://images.unsplash.com/photo-${Date.now()}?w=400`, // For frontend display
      size: '1.5', // MB
      uploadedAt: new Date().toISOString(),
      created_at: new Date().toISOString() // For frontend display
    };
    
    return new Response(JSON.stringify({
      success: true,
      data: mockUploadResult,
      message: '배경 이미지가 업로드되었습니다.'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('[Background Images Upload] Error:', error);
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
