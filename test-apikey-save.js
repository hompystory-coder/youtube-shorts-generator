const https = require('https');

const userId = 'admin_001';
const token = 'mock_jwt_token_12345';

const data = JSON.stringify({
  gemini_api_key: 'test-gemini-key-123',
  gemini_model: 'gemini-pro',
  minimax_api_key: 'test-minimax-key-456',
  minimax_group_id: 'test-group-789',
  shotstack_api_key: 'test-shotstack-key-000'
});

const options = {
  hostname: 'youtube-shorts-generator.pages.dev',
  port: 443,
  path: `/api/settings/${userId}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Authorization': `Bearer ${token}`
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
