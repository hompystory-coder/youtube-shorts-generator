// Background Images API - GET endpoint
// Returns list of background images for a user

export async function onRequestGet(context) {
  try {
    const { request } = context;
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    console.log('[Background Images API] GET request for userId:', userId);
    
    // Mock data - In production, fetch from D1 database
    const mockImageList = [
      {
        id: 'img_1',
        name: '배경1.jpg',
        url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400',
        data_url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400',
        size: 1.2,
        uploadedAt: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: 'img_2',
        name: '배경2.jpg',
        url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400',
        data_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400',
        size: 1.5,
        uploadedAt: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: 'img_3',
        name: '배경3.jpg',
        url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400',
        data_url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400',
        size: 1.8,
        uploadedAt: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
    ];
    
    return new Response(JSON.stringify({
      success: true,
      data: mockImageList,
      total: mockImageList.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('[Background Images API] Error:', error);
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
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
