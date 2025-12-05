// Background Images Upload API - POST endpoint
// Handles background image file uploads

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
    
    // Get auth token
    const authHeader = request.headers?.get('Authorization') || request.headers?.authorization;
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
    
    // Parse body
    let body;
    if (req.body && typeof req.body === 'object') {
      body = req.body; // Express
    } else {
      body = await request.json(); // Cloudflare
    }
    
    const { name: fileName, dataUrl, userId } = body;
    
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
    
    console.log('[Background Images Upload] Uploading:', fileName);
    
    // Extract base64 data
    const base64Data = dataUrl.replace(/^data:image\/[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(fileName);
    const uniqueFileName = `${timestamp}_${Math.random().toString(36).substring(7)}${ext}`;
    
    // Save to public/uploads/images
    const uploadsDir = path.join(__dirname, '../../../public/uploads/images');
    const filePath = path.join(uploadsDir, uniqueFileName);
    
    console.log('[Background Images Upload] Saving to:', filePath);
    console.log('[Background Images Upload] Uploads dir:', uploadsDir);
    
    // Ensure directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('[Background Images Upload] Created directory:', uploadsDir);
    }
    
    // Write file
    fs.writeFileSync(filePath, buffer);
    
    console.log('[Background Images Upload] File saved successfully');
    
    // Return result with server URL
    const uploadResult = {
      id: `img_${timestamp}`,
      name: fileName,
      url: `/uploads/images/${uniqueFileName}`,
      size: (buffer.length / (1024 * 1024)).toFixed(2), // MB
      uploadedAt: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    return new Response(JSON.stringify({
      success: true,
      data: uploadResult,
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
    console.error('[Background Images Upload] Error stack:', error.stack);
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
