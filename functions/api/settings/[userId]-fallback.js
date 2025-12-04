// User Settings API with localStorage fallback
// This version works without Supabase for SSH server deployment

// Mock database using in-memory storage
const mockDB = {
  settings: {},
  images: [],
  music: []
};

// GET - Fetch user settings
export async function onRequestGet(context) {
  const { params } = context;
  const userId = params.userId || 'admin_001';
  
  console.log('[Settings API] Get settings for user:', userId);
  
  try {
    const settings = mockDB.settings[userId] || {};
    
    // Return mock data with default API keys
    return new Response(JSON.stringify({
      success: true,
      data: {
        gemini_api_key: settings.gemini_api_key || '',
        minimax_api_key: settings.minimax_api_key || '',
        minimax_group_id: settings.minimax_group_id || '',
        shotstack_api_key: settings.shotstack_api_key || '',
        background_images: [
          {
            id: 1,
            name: '기본 배경 1',
            url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
            data_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
            size: 1024000,
            uploadedAt: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            name: '기본 배경 2',
            url: 'https://images.unsplash.com/photo-1557683316-973673baf926',
            data_url: 'https://images.unsplash.com/photo-1557683316-973673baf926',
            size: 1024000,
            uploadedAt: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            name: '기본 배경 3',
            url: 'https://images.unsplash.com/photo-1617791160536-598cf32026fb',
            data_url: 'https://images.unsplash.com/photo-1617791160536-598cf32026fb',
            size: 1024000,
            uploadedAt: new Date().toISOString(),
            created_at: new Date().toISOString()
          }
        ],
        background_music: [
          {
            id: 1,
            name: '기본 음악 1',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            data_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            size: 5120000,
            uploadedAt: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            name: '기본 음악 2',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            data_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            size: 5120000,
            uploadedAt: new Date().toISOString(),
            created_at: new Date().toISOString()
          }
        ]
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('[Settings API] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch settings'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// POST/PUT - Save user settings
export async function onRequestPost(context) {
  try {
    const { params, request } = context;
    const userId = params.userId || 'admin_001';
    
    // Support both Cloudflare (request.json()) and Express (request.body)
    let body;
    if (typeof request.json === 'function') {
      body = await request.json();
    } else {
      body = request.body;
    }
    
    console.log('[Settings API] Save settings for user:', userId);
    console.log('[Settings API] Data:', body);
    
    // Save to mock database
    mockDB.settings[userId] = {
      gemini_api_key: body.gemini_api_key || '',
      minimax_api_key: body.minimax_api_key || '',
      minimax_group_id: body.minimax_group_id || '',
      shotstack_api_key: body.shotstack_api_key || '',
      updated_at: new Date().toISOString()
    };
    
    console.log('[Settings API] Settings saved successfully');
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Settings saved successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('[Settings API] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to save settings'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export const onRequestPut = onRequestPost;

// CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
