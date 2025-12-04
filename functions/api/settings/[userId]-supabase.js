// User Settings API with Supabase
import supabase from '../../../lib/supabase.js';

// GET - Fetch user settings
export async function onRequestGet(context) {
  const { params } = context;
  const userId = params.userId;
  
  console.log('[Settings API] Get settings for user:', userId);
  
  try {
    // Get user settings from Supabase
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('[Settings API] Error:', error);
    }
    
    // Get background images
    const { data: images } = await supabase
      .from('background_images')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    // Get background music
    const { data: music } = await supabase
      .from('background_music')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    console.log('[Settings API] Settings found:', !!settings);
    console.log('[Settings API] Images:', images?.length || 0);
    console.log('[Settings API] Music:', music?.length || 0);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        gemini_api_key: settings?.gemini_api_key || '',
        minimax_api_key: settings?.minimax_api_key || '',
        minimax_group_id: settings?.minimax_group_id || '',
        shotstack_api_key: settings?.shotstack_api_key || '',
        background_images: images || [],
        background_music: music || []
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
    const userId = params.userId;
    
    // Support both Cloudflare (request.json()) and Express (request.body)
    let body;
    if (typeof request.json === 'function') {
      body = await request.json();
    } else {
      body = request.body;
    }
    
    console.log('[Settings API] Save settings for user:', userId);
    
    // Upsert settings
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        gemini_api_key: body.gemini_api_key || '',
        minimax_api_key: body.minimax_api_key || '',
        minimax_group_id: body.minimax_group_id || '',
        shotstack_api_key: body.shotstack_api_key || '',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    
    if (error) {
      console.error('[Settings API] Save error:', error);
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
