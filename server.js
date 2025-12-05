// Node.js Server for YouTube Shorts Generator
// Converts Cloudflare Pages Functions to Express server

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Import API handlers
import { onRequestPost as loginHandler, onRequestOptions as loginOptions } from './functions/api/auth/login-supabase.js';
import { onRequestGet as settingsGetHandler, onRequestPost as settingsPostHandler, onRequestOptions as settingsOptions } from './functions/api/settings/[userId]-fallback.js';
import { onRequestGet as bgImagesHandler } from './functions/api/background-images/index.js';
import { onRequestGet as bgMusicHandler } from './functions/api/background-music/index.js';
import { onRequestPost as bgImagesUploadHandler, onRequestOptions as bgImagesUploadOptions } from './functions/api/background-images/upload.js';
import { onRequestPost as bgMusicUploadHandler, onRequestOptions as bgMusicUploadOptions } from './functions/api/background-music/upload.js';
import { onRequestPost as voicePreviewHandler, onRequestOptions as voicePreviewOptions } from './functions/api/voice/preview.js';
import { onRequestPost as crawlBlogHandler, onRequestOptions as crawlBlogOptions } from './functions/api/crawl/blog.js';

// Helper function to convert Cloudflare context to Express
function createContext(req, res) {
  return {
    request: req,
    env: {},
    params: req.params
  };
}

// API Routes

// Auth - Login
app.options('/api/auth/login', async (req, res) => {
  const response = await loginOptions();
  res.status(response.status).set(Object.fromEntries(response.headers.entries())).send();
});

app.post('/api/auth/login', async (req, res) => {
  const context = createContext(req, res);
  const response = await loginHandler(context);
  const body = await response.text();
  res.status(response.status).set(Object.fromEntries(response.headers.entries())).send(body);
});

// Settings
app.options('/api/settings/:userId', async (req, res) => {
  const response = await settingsOptions();
  res.status(response.status).set(Object.fromEntries(response.headers.entries())).send();
});

app.get('/api/settings/:userId', async (req, res) => {
  const context = createContext(req, res);
  const response = await settingsGetHandler(context);
  const body = await response.text();
  res.status(response.status).set(Object.fromEntries(response.headers.entries())).send(body);
});

app.post('/api/settings/:userId', async (req, res) => {
  const context = createContext(req, res);
  const response = await settingsPostHandler(context);
  const body = await response.text();
  res.status(response.status).set(Object.fromEntries(response.headers.entries())).send(body);
});

// Background Images
app.get('/api/background-images', async (req, res) => {
  const context = createContext(req, res);
  const response = await bgImagesHandler(context);
  const body = await response.text();
  res.status(response.status).set(Object.fromEntries(response.headers.entries())).send(body);
});

// Background Music
app.get('/api/background-music', async (req, res) => {
  const context = createContext(req, res);
  const response = await bgMusicHandler(context);
  const body = await response.text();
  res.status(response.status).set(Object.fromEntries(response.headers.entries())).send(body);
});

// Background Images Upload
app.options('/api/background-images/upload', async (req, res) => {
  const response = await bgImagesUploadOptions();
  res.status(response.status).set(Object.fromEntries(response.headers.entries())).send();
});

app.post('/api/background-images/upload', async (req, res) => {
  const context = createContext(req, res);
  const response = await bgImagesUploadHandler(context);
  const body = await response.text();
  res.status(response.status).set(Object.fromEntries(response.headers.entries())).send(body);
});

// Background Music Upload
app.options('/api/background-music/upload', async (req, res) => {
  const response = await bgMusicUploadOptions();
  res.status(response.status).set(Object.fromEntries(response.headers.entries())).send();
});

app.post('/api/background-music/upload', async (req, res) => {
  const context = createContext(req, res);
  const response = await bgMusicUploadHandler(context);
  const body = await response.text();
  res.status(response.status).set(Object.fromEntries(response.headers.entries())).send(body);
});

// Voice Preview
app.options('/api/voice/preview', async (req, res) => {
  const response = await voicePreviewOptions();
  res.status(response.status).set(Object.fromEntries(response.headers.entries())).send();
});

app.post('/api/voice/preview', async (req, res) => {
  const context = createContext(req, res);
  const response = await voicePreviewHandler(context);
  const body = await response.text();
  res.status(response.status).set(Object.fromEntries(response.headers.entries())).send(body);
});

// Crawl Blog
app.options('/api/crawl/blog', async (req, res) => {
  const response = await crawlBlogOptions();
  res.status(response.status).set(Object.fromEntries(response.headers.entries())).send();
});

app.post('/api/crawl/blog', async (req, res) => {
  const context = createContext(req, res);
  const response = await crawlBlogHandler(context);
  const body = await response.text();
  res.status(response.status).set(Object.fromEntries(response.headers.entries())).send(body);
});

// HTML pages routing (Cloudflare Pages style)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/payment', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'payment.html'));
});

app.get('/mypage', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mypage.html'));
});

// Redirect .html extensions
app.get('/login.html', (req, res) => res.redirect(301, '/login'));
app.get('/signup.html', (req, res) => res.redirect(301, '/signup'));
app.get('/payment.html', (req, res) => res.redirect(301, '/payment'));
app.get('/mypage.html', (req, res) => res.redirect(301, '/mypage'));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 YouTube Shorts Generator Server`);
  console.log(`📡 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🌍 Access from: http://115.91.5.140:${PORT}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});
