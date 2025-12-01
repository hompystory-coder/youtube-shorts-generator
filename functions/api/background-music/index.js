// Background Music API - GET endpoint
// Returns list of background music for a user

export async function onRequestGet(context) {
  try {
    const { request } = context;
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    console.log('[Background Music API] GET request for userId:', userId);
    
    // Mock data - In production, fetch from D1 database
    const mockMusicList = [
      {
        id: 'bgm_1',
        name: '경쾌한 팝송.mp3',
        url: 'https://example.com/music1.mp3',
        data_url: 'https://example.com/music1.mp3',
        duration: 180,
        size: 2.5,
        uploadedAt: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: 'bgm_2',
        name: '차분한 재즈.mp3',
        url: 'https://example.com/music2.mp3',
        data_url: 'https://example.com/music2.mp3',
        duration: 200,
        size: 3.2,
        uploadedAt: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
    ];
    
    return new Response(JSON.stringify({
      success: true,
      data: mockMusicList,
      total: mockMusicList.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('[Background Music API] Error:', error);
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
