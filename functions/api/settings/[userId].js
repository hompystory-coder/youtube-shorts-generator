// User Settings API - Get user settings by userId
export async function onRequestGet(context) {
  const { params, env } = context;
  const userId = params.userId;
  
  console.log('[Settings API] Get settings for user:', userId);
  
  // D1 Database query
  if (env.DB) {
    try {
      // Get user settings
      const settings = await env.DB.prepare(`
        SELECT * FROM user_settings WHERE user_id = ?
      `).bind(userId).first();
      
      if (settings) {
        console.log('[Settings API] Settings found in DB');
        return new Response(JSON.stringify({
          success: true,
          data: {
            gemini_api_key: settings.gemini_api_key || '',
            minimax_api_key: settings.minimax_api_key || '',
            minimax_group_id: settings.minimax_group_id || '',
            shotstack_api_key: settings.shotstack_api_key || '',
            background_images: [],
            background_music: []
          }
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      console.log('[Settings API] No settings found, returning defaults');
    } catch (dbError) {
      console.error('[Settings API] DB Error:', dbError);
    }
  }
  
  // Fallback: Return empty settings
  return new Response(JSON.stringify({
    success: true,
    data: {
      gemini_api_key: '',
      minimax_api_key: '',
      minimax_group_id: '',
      shotstack_api_key: '',
      background_images: [],
      background_music: []
    }
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

// Handle CORS preflight
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

// POST/PUT to save settings
export async function onRequestPost(context) {
  try {
    const { params, request, env } = context;
    const userId = params.userId;
    const body = await request.json();
    
    console.log('[Settings API] Save settings for user:', userId);
    
    if (env.DB) {
      // Insert or update settings
      await env.DB.prepare(`
        INSERT INTO user_settings (
          user_id, gemini_api_key, minimax_api_key, minimax_group_id, shotstack_api_key, updated_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(user_id) DO UPDATE SET
          gemini_api_key = excluded.gemini_api_key,
          minimax_api_key = excluded.minimax_api_key,
          minimax_group_id = excluded.minimax_group_id,
          shotstack_api_key = excluded.shotstack_api_key,
          updated_at = datetime('now')
      `).bind(
        userId,
        body.gemini_api_key || '',
        body.minimax_api_key || '',
        body.minimax_group_id || '',
        body.shotstack_api_key || ''
      ).run();
      
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
    }
    
    // No DB available
    return new Response(JSON.stringify({
      success: false,
      error: 'Database not available'
    }), {
      status: 500,
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
