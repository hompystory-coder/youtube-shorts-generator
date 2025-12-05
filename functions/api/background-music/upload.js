// Background Music Upload API - POST endpoint
// Handles background music file uploads

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // Support both Cloudflare and Express
    const req = request.body ? request : { body: request };
    
    // Get auth token (handle both Cloudflare and Express)
    let authHeader;
    if (request.headers && typeof request.headers.get === 'function') {
      // Cloudflare Pages Functions
      authHeader = request.headers.get('Authorization');
    } else {
      // Express
      authHeader = request.headers?.['authorization'] || request.headers?.['Authorization'];
    }
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
    
    // Parse body
    let body;
    if (req.body && typeof req.body === 'object') {
      body = req.body; // Express
    } else {
      body = await request.json(); // Cloudflare
    }
    
    const { name: fileName, dataUrl, userId, duration } = body;
    
    if (!fileName || !dataUrl) {
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
    
    console.log('[Background Music Upload] Uploading:', fileName);
    
    // Extract base64 data
    const base64Data = dataUrl.replace(/^data:audio\/[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Check file size (max 5MB)
    const sizeInMB = buffer.length / (1024 * 1024);
    if (sizeInMB > 5) {
      return new Response(JSON.stringify({
        success: false,
        message: '음악 파일은 5MB 이하만 업로드할 수 있습니다.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(fileName);
    const uniqueFileName = `${timestamp}_${Math.random().toString(36).substring(7)}${ext}`;
    
    // Save to public/uploads/music
    const uploadsDir = path.join(__dirname, '../../../public/uploads/music');
    const filePath = path.join(uploadsDir, uniqueFileName);
    
    console.log('[Background Music Upload] Saving to:', filePath);
    console.log('[Background Music Upload] Uploads dir:', uploadsDir);
    
    // Ensure directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('[Background Music Upload] Created directory:', uploadsDir);
    }
    
    // Write file
    fs.writeFileSync(filePath, buffer);
    
    console.log('[Background Music Upload] File saved successfully');
    
    // Return result with server URL
    const uploadResult = {
      id: `bgm_${timestamp}`,
      name: fileName,
      url: `/uploads/music/${uniqueFileName}`,
      size: sizeInMB.toFixed(2), // MB
      duration: duration || null,
      uploadedAt: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    return new Response(JSON.stringify({
      success: true,
      data: uploadResult,
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
    console.error('[Background Music Upload] Error stack:', error.stack);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.stack
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
