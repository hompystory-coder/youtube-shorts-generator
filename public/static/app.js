// YouTube Shorts Generator - Main Application JavaScript
// Version: 1.0.0

console.log('🚀 App.js loaded');

// Global state
let currentStep = 1;
let blogImages = [];
let selectedImages = [];
let generatedScript = '';
let generatedAudioUrl = '';
let generatedVideoUrl = '';

// API Base URL
const API_BASE = '';  // Cloudflare Pages Functions use relative paths

// Auth Management
async function checkAuth() {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('auth_token') || localStorage.getItem('token');
    
    const authLoading = document.getElementById('authLoading');
    const authNotLoggedIn = document.getElementById('authNotLoggedIn');
    const authLoggedIn = document.getElementById('authLoggedIn');
    
    if (!token) {
        if (authLoading) authLoading.classList.add('hidden');
        if (authNotLoggedIn) authNotLoggedIn.classList.remove('hidden');
        if (authLoggedIn) authLoggedIn.classList.add('hidden');
        console.log('⚠️ No authentication token found');
        return null;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Authentication failed');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
            const user = result.data;
            
            // Update UI
            if (authLoading) authLoading.classList.add('hidden');
            if (authNotLoggedIn) authNotLoggedIn.classList.add('hidden');
            if (authLoggedIn) authLoggedIn.classList.remove('hidden');
            
            // Update user info
            if (document.getElementById('userName')) {
                document.getElementById('userName').textContent = user.name || 'User';
            }
            if (document.getElementById('userEmail')) {
                document.getElementById('userEmail').textContent = user.email || '';
            }
            
            // Show admin button for super admin
            if (user.email === 'hompystory@gmail.com' && document.getElementById('adminButton')) {
                document.getElementById('adminButton').classList.remove('hidden');
            }
            
            console.log('✅ User authenticated:', user.email);
            return user;
        }
    } catch (error) {
        console.error('❌ Auth check failed:', error);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        
        if (authLoading) authLoading.classList.add('hidden');
        if (authNotLoggedIn) authNotLoggedIn.classList.remove('hidden');
        if (authLoggedIn) authLoggedIn.classList.add('hidden');
    }
    
    return null;
}

// Logout handler
function handleLogout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user_info');
    window.location.href = '/';
}

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎬 Initializing YouTube Shorts Generator...');
    
    // Check authentication
    await checkAuth();
    
    // Setup event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Blog URL crawl button
    const crawlBtn = document.getElementById('crawlBtn');
    if (crawlBtn) {
        crawlBtn.addEventListener('click', handleCrawlBlog);
    }
    
    // Generate script button
    const generateScriptBtn = document.getElementById('generateScriptBtn');
    if (generateScriptBtn) {
        generateScriptBtn.addEventListener('click', handleGenerateScript);
    }
    
    // Generate audio button
    const generateAudioBtn = document.getElementById('generateAudioBtn');
    if (generateAudioBtn) {
        generateAudioBtn.addEventListener('click', handleGenerateAudio);
    }
    
    // Generate video button
    const generateVideoBtn = document.getElementById('generateVideoBtn');
    if (generateVideoBtn) {
        generateVideoBtn.addEventListener('click', handleGenerateVideo);
    }
}

// Handle blog crawling
async function handleCrawlBlog() {
    const blogUrlInput = document.getElementById('blogUrl');
    const crawlBtn = document.getElementById('crawlBtn');
    const blogUrl = blogUrlInput?.value?.trim();
    
    if (!blogUrl) {
        alert('블로그 URL을 입력해주세요.');
        return;
    }
    
    // Disable button and show loading
    if (crawlBtn) {
        crawlBtn.disabled = true;
        crawlBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>크롤링 중...';
    }
    
    try {
        console.log('🔍 Crawling blog:', blogUrl);
        
        const response = await fetch(`${API_BASE}/api/crawl/blog`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: blogUrl })
        });
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📦 API Response:', { success: result.success, imageCount: result.data?.images?.length });
        
        if (result.success && result.data) {
            blogImages = result.data.images || [];
            const blogText = result.data.text || '';
            
            console.log(`✅ Crawled ${blogImages.length} images`);
            
            if (blogImages.length > 0) {
                console.log('First image:', blogImages[0]);
                
                // Display images
                try {
                    displayBlogImages(blogImages);
                    console.log('✅ Images displayed successfully');
                } catch (displayError) {
                    console.error('❌ Display error:', displayError);
                    throw displayError;
                }
                
                alert(`${blogImages.length}개의 이미지를 찾았습니다. 원하는 이미지를 선택하세요.`);
            } else {
                throw new Error('크롤링된 이미지가 없습니다.');
            }
        } else {
            throw new Error(result.message || result.error || 'Crawling failed');
        }
    } catch (error) {
        console.error('❌ Crawl error:', error);
        alert('블로그 크롤링에 실패했습니다: ' + error.message);
    } finally {
        // Reset button - ALWAYS runs
        console.log('🔄 Resetting button...');
        if (crawlBtn) {
            crawlBtn.disabled = false;
            crawlBtn.innerHTML = '<i class="fas fa-search mr-2"></i>블로그 크롤링 시작';
        }
        console.log('✅ Button reset complete');
    }
}

// Display blog images
function displayBlogImages(images) {
    console.log('🎨 displayBlogImages called with', images.length, 'images');
    
    const container = document.getElementById('crawledImagesContainer');
    if (!container) {
        console.error('❌ crawledImagesContainer not found');
        throw new Error('Container element not found');
    }
    
    console.log('✅ Container found:', container);
    
    // Show container
    container.classList.remove('hidden');
    container.innerHTML = '';
    
    // Create grid
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
    
    let successCount = 0;
    
    images.forEach((img, index) => {
        try {
            // Handle both string URLs and image objects {url: "...", alt: "", index: 0}
            const imgUrl = typeof img === 'string' ? img : img.url;
            
            if (!imgUrl) {
                console.warn(`⚠️ Image ${index} has no URL`);
                return;
            }
            
            const div = document.createElement('div');
            div.className = 'relative cursor-pointer border-4 border-transparent hover:border-blue-500 rounded-lg transition image-item';
            div.innerHTML = `
                <img src="${imgUrl}" alt="Image ${index + 1}" class="w-full h-48 object-cover rounded-lg" onerror="this.parentElement.parentElement.style.display='none'">
                <div class="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow">
                    <input type="checkbox" class="w-5 h-5 image-checkbox" data-index="${index}" data-url="${imgUrl}">
                </div>
                <div class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    ${index + 1}
                </div>
            `;
            
            grid.appendChild(div);
            successCount++;
        } catch (itemError) {
            console.error(`❌ Error creating image item ${index}:`, itemError);
        }
    });
    
    container.appendChild(grid);
    console.log(`✅ Grid appended to container, ${successCount} items created`);
    
    // Add checkbox listeners
    const checkboxes = document.querySelectorAll('.image-checkbox');
    console.log(`📝 Found ${checkboxes.length} checkboxes`);
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleImageSelection);
    });
    
    console.log(`✅ Displayed ${successCount} images in grid`);
}

// Handle image selection
function handleImageSelection(event) {
    const checkbox = event.target;
    const imageUrl = checkbox.dataset.url;
    
    if (checkbox.checked) {
        if (!selectedImages.includes(imageUrl)) {
            selectedImages.push(imageUrl);
        }
    } else {
        selectedImages = selectedImages.filter(url => url !== imageUrl);
    }
    
    console.log(`📷 Selected images: ${selectedImages.length}`);
}

// Handle script generation
async function handleGenerateScript() {
    if (selectedImages.length === 0) {
        alert('이미지를 하나 이상 선택해주세요.');
        return;
    }
    
    const generateScriptBtn = document.getElementById('generateScriptBtn');
    
    // Disable button
    if (generateScriptBtn) {
        generateScriptBtn.disabled = true;
        generateScriptBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>스크립트 생성 중...';
    }
    
    try {
        console.log('📝 Generating script for', selectedImages.length, 'images');
        
        const geminiApiKey = document.getElementById('geminiApiKey')?.value;
        
        const response = await fetch(`${API_BASE}/api/generate/script`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                images: selectedImages,
                gemini_api_key: geminiApiKey
            })
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
            generatedScript = result.data.script;
            
            // Display script
            const scriptTextarea = document.getElementById('scriptText');
            if (scriptTextarea) {
                scriptTextarea.value = generatedScript;
            }
            
            // Move to next step
            updateStep(3);
            
            console.log('✅ Script generated');
        } else {
            throw new Error(result.message || 'Script generation failed');
        }
    } catch (error) {
        console.error('❌ Script generation error:', error);
        alert('스크립트 생성에 실패했습니다: ' + error.message);
    } finally {
        // Reset button
        if (generateScriptBtn) {
            generateScriptBtn.disabled = false;
            generateScriptBtn.innerHTML = '<i class="fas fa-file-alt mr-2"></i>스크립트 생성';
        }
    }
}

// Handle audio generation
async function handleGenerateAudio() {
    const scriptTextarea = document.getElementById('scriptText');
    const script = scriptTextarea?.value?.trim();
    
    if (!script) {
        alert('스크립트를 입력해주세요.');
        return;
    }
    
    const generateAudioBtn = document.getElementById('generateAudioBtn');
    
    // Disable button
    if (generateAudioBtn) {
        generateAudioBtn.disabled = true;
        generateAudioBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>음성 생성 중...';
    }
    
    try {
        console.log('🎙️ Generating audio...');
        
        const minimaxApiKey = document.getElementById('minimaxApiKey')?.value;
        const minimaxGroupId = document.getElementById('minimaxGroupId')?.value;
        const voiceId = document.getElementById('minimaxVoiceSelect')?.value || 'Friendly_Person';
        
        const response = await fetch(`${API_BASE}/api/generate/voice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: script,
                minimax_api_key: minimaxApiKey,
                minimax_group_id: minimaxGroupId,
                voice_id: voiceId
            })
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
            generatedAudioUrl = result.data.audio_url;
            
            // Display audio player
            const audioPlayerDiv = document.getElementById('audioPlayer');
            if (audioPlayerDiv) {
                audioPlayerDiv.innerHTML = `
                    <audio controls class="w-full">
                        <source src="${generatedAudioUrl}" type="audio/mpeg">
                    </audio>
                `;
            }
            
            // Move to next step
            updateStep(4);
            
            console.log('✅ Audio generated');
        } else {
            throw new Error(result.message || 'Audio generation failed');
        }
    } catch (error) {
        console.error('❌ Audio generation error:', error);
        alert('음성 생성에 실패했습니다: ' + error.message);
    } finally {
        // Reset button
        if (generateAudioBtn) {
            generateAudioBtn.disabled = false;
            generateAudioBtn.innerHTML = '<i class="fas fa-microphone mr-2"></i>음성 생성';
        }
    }
}

// Handle video generation
async function handleGenerateVideo() {
    if (!generatedAudioUrl) {
        alert('먼저 음성을 생성해주세요.');
        return;
    }
    
    const generateVideoBtn = document.getElementById('generateVideoBtn');
    
    // Disable button
    if (generateVideoBtn) {
        generateVideoBtn.disabled = true;
        generateVideoBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>영상 생성 중... (최대 5분 소요)';
    }
    
    try {
        console.log('🎬 Generating video...');
        
        const shotstackApiKey = document.getElementById('shotstackApiKey')?.value;
        
        const response = await fetch(`${API_BASE}/api/generate/video`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                images: selectedImages,
                audio_url: generatedAudioUrl,
                shotstack_api_key: shotstackApiKey
            })
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
            generatedVideoUrl = result.data.video_url;
            
            // Display video player
            const videoPlayerDiv = document.getElementById('videoPlayer');
            if (videoPlayerDiv) {
                videoPlayerDiv.innerHTML = `
                    <video controls class="w-full rounded-lg shadow-lg">
                        <source src="${generatedVideoUrl}" type="video/mp4">
                    </video>
                    <a href="${generatedVideoUrl}" download class="mt-4 inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                        <i class="fas fa-download mr-2"></i>영상 다운로드
                    </a>
                `;
            }
            
            // Move to final step
            updateStep(5);
            
            console.log('✅ Video generated');
            alert('영상 생성이 완료되었습니다!');
        } else {
            throw new Error(result.message || 'Video generation failed');
        }
    } catch (error) {
        console.error('❌ Video generation error:', error);
        alert('영상 생성에 실패했습니다: ' + error.message);
    } finally {
        // Reset button
        if (generateVideoBtn) {
            generateVideoBtn.disabled = false;
            generateVideoBtn.innerHTML = '<i class="fas fa-video mr-2"></i>영상 생성';
        }
    }
}

// Update progress step
function updateStep(step) {
    currentStep = step;
    
    // Update progress indicators
    for (let i = 1; i <= 5; i++) {
        const stepElement = document.getElementById(`step${i}`);
        if (!stepElement) continue;
        
        if (i < step) {
            stepElement.classList.add('completed');
            stepElement.classList.remove('active');
        } else if (i === step) {
            stepElement.classList.add('active');
            stepElement.classList.remove('completed');
        } else {
            stepElement.classList.remove('completed', 'active');
        }
    }
    
    // Show/hide panels
    document.querySelectorAll('[id^="panel"]').forEach(panel => {
        panel.classList.add('hidden');
    });
    
    const currentPanel = document.getElementById(`panel${step}`);
    if (currentPanel) {
        currentPanel.classList.remove('hidden');
    }
}

// Make functions globally available
window.handleLogout = handleLogout;
window.showPricingModal = showPricingModal;
window.closePricingModal = closePricingModal;

// Pricing modal functions (if not defined in inline script)
if (typeof showPricingModal === 'undefined') {
    window.showPricingModal = function() {
        const modal = document.getElementById('pricingModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        }
    };
}

if (typeof closePricingModal === 'undefined') {
    window.closePricingModal = function() {
        const modal = document.getElementById('pricingModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = 'auto';
        }
    };
}

console.log('✅ App.js initialized');

// Preview voice function
function previewVoice() {
    console.log('🎤 Preview voice clicked');
    alert('음성 미리듣기 기능은 준비 중입니다.');
}

// Stage change handler (placeholder)
function onStageChanged(stage) {
    console.log('📍 Stage changed:', stage);
}

// Make functions globally accessible
window.previewVoice = previewVoice;
window.onStageChanged = onStageChanged;

console.log('✅ Global functions registered');
