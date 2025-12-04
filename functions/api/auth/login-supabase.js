// Login API with Supabase
import supabase from '../../../lib/supabase.js';
import crypto from 'crypto';

// Hash password with SHA-256
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function onRequestPost(context) {
  try {
    const { request } = context;
    const { email, password } = await request.json();

    console.log('[Login API] Login attempt:', email);

    // Validation
    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: '이메일과 비밀번호를 입력해주세요.'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Query user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      console.log('[Login API] User not found:', email);
      return new Response(JSON.stringify({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다.'
      }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Verify password (SHA-256)
    const passwordHash = hashPassword(password);
    const isPasswordValid = (passwordHash === user.password);
    
    if (!isPasswordValid) {
      console.log('[Login API] Invalid password for:', email);
      console.log('[Login API] Expected hash:', user.password);
      console.log('[Login API] Provided hash:', passwordHash);
      return new Response(JSON.stringify({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다.'
      }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Generate token
    const token = `tok_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    console.log('[Login API] Login successful:', email);

    return new Response(JSON.stringify({
      success: true,
      message: '로그인되었습니다.',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscription_status: user.subscription_status
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('[Login API] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '로그인 중 오류가 발생했습니다.'
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
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
