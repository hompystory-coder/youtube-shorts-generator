// Force update v1.0.2
// YouTube Shorts Generator - Main Application JavaScript
// Version: 1.0.1 - Voice Preview Update

console.log('🚀 App.js loaded');

// Global state
let currentStep = 1;
let blogImages = [];
let selectedImages = [];
let generatedScript = '';
let generatedAudioUrl = '';
let generatedVideoUrl = '';
let userBackgroundImages = [];
let userBackgroundMusic = [];

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
        // Get user info from localStorage (saved during login)
        const userInfoStr = localStorage.getItem('user_info');
        
        if (!userInfoStr) {
            throw new Error('No user info in localStorage');
        }
        
        const user = JSON.parse(userInfoStr);
        
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
        
    } catch (error) {
        console.error('❌ Auth check failed:', error);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user_info');
        
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

// Load uploaded files from localStorage
function loadUploadedFiles() {
    console.log('🔄 loadUploadedFiles() 시작...');
    
    try {
        // Load background images
        const savedImages = localStorage.getItem('uploaded_bg_images');
        console.log('📦 localStorage.getItem("uploaded_bg_images"):', savedImages ? '데이터 있음' : '데이터 없음');
        
        if (savedImages) {
            userBackgroundImages = JSON.parse(savedImages);
            console.log(`✅ LocalStorage에서 배경 이미지 로드: ${userBackgroundImages.length}개`);
            console.log('✅ 로드된 이미지:', userBackgroundImages.map(img => img.name).join(', '));
            populateBgImageSelect();
        } else {
            console.log('⚠️ LocalStorage에 저장된 배경 이미지 없음');
            userBackgroundImages = [];
        }
        
        // Load background music
        const savedMusic = localStorage.getItem('uploaded_bg_music');
        console.log('📦 localStorage.getItem("uploaded_bg_music"):', savedMusic ? '데이터 있음' : '데이터 없음');
        
        if (savedMusic) {
            userBackgroundMusic = JSON.parse(savedMusic);
            console.log(`✅ LocalStorage에서 배경 음악 로드: ${userBackgroundMusic.length}개`);
            console.log('✅ 로드된 음악:', userBackgroundMusic.map(m => m.name).join(', '));
            console.log('✅ 음악 데이터 상세:', userBackgroundMusic.map(m => ({
                id: m.id,
                name: m.name,
                hasDataUrl: !!m.data_url,
                dataUrlLength: m.data_url ? m.data_url.length : 0
            })));
            populateBgMusicSelect();
        } else {
            console.log('⚠️ LocalStorage에 저장된 배경 음악 없음');
            userBackgroundMusic = [];
        }
        
        console.log('✅ loadUploadedFiles() 완료');
    } catch (error) {
        console.error('❌ LocalStorage 로드 실패:', error);
        console.error('❌ 에러 상세:', error.message);
        userBackgroundImages = [];
        userBackgroundMusic = [];
    }
}

// Save uploaded files to localStorage
function saveUploadedFiles() {
    try {
        // Save images
        const imagesJson = JSON.stringify(userBackgroundImages);
        localStorage.setItem('uploaded_bg_images', imagesJson);
        
        // Save music
        const musicJson = JSON.stringify(userBackgroundMusic);
        localStorage.setItem('uploaded_bg_music', musicJson);
        
        console.log('💾 LocalStorage에 저장 완료');
        console.log('💾 저장된 이미지:', userBackgroundImages.length + '개');
        console.log('💾 저장된 음악:', userBackgroundMusic.length + '개');
        
        // Verify images
        const verifyImages = localStorage.getItem('uploaded_bg_images');
        const verifyMusic = localStorage.getItem('uploaded_bg_music');
        
        if (verifyImages && verifyMusic) {
            const parsedImages = JSON.parse(verifyImages);
            const parsedMusic = JSON.parse(verifyMusic);
            console.log('✅ 저장 검증 성공 - 이미지:', parsedImages.length, '개, 음악:', parsedMusic.length, '개');
        } else {
            console.error('❌ 저장 검증 실패 - 이미지:', !!verifyImages, ', 음악:', !!verifyMusic);
        }
        
        return true;
    } catch (error) {
        console.error('❌ LocalStorage 저장 실패:', error);
        console.error('에러 상세:', error.message);
        return false;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎬 ========================================');
    console.log('🎬 Initializing YouTube Shorts Generator...');
    console.log('🎬 ========================================');
    
    // Check authentication
    console.log('🔐 Step 1: 인증 확인 중...');
    await checkAuth();
    console.log('✅ Step 1 완료');
    
    // Load uploaded files from localStorage first
    console.log('📦 Step 2: LocalStorage에서 파일 로드 중...');
    console.log('📦 현재 userBackgroundImages 길이:', userBackgroundImages.length);
    console.log('📦 현재 userBackgroundMusic 길이:', userBackgroundMusic.length);
    loadUploadedFiles();
    console.log('📦 로드 후 userBackgroundImages 길이:', userBackgroundImages.length);
    console.log('📦 로드 후 userBackgroundMusic 길이:', userBackgroundMusic.length);
    console.log('✅ Step 2 완료');
    
    // Load user's background images and music from server
    console.log('🌐 Step 3: loadUserBackgrounds() 호출 중...');
    await loadUserBackgrounds();
    console.log('✅ Step 3 완료');
    
    // Setup event listeners
    console.log('🎯 Step 4: 이벤트 리스너 설정 중...');
    setupEventListeners();
    console.log('✅ Step 4 완료');
    
    console.log('🎬 ========================================');
    console.log('🎬 초기화 완료!');
    console.log('🎬 최종 userBackgroundImages:', userBackgroundImages.length, '개');
    console.log('🎬 최종 userBackgroundMusic:', userBackgroundMusic.length, '개');
    console.log('🎬 ========================================');
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
async function previewVoice() {
    console.log('🎤 Preview voice clicked');
    
    const voiceSelect = document.getElementById('minimaxVoiceSelect');
    const previewBtn = document.getElementById('previewVoiceBtn');
    const previewText = document.getElementById('previewVoiceText');
    const previewIcon = document.getElementById('previewVoiceIcon');
    const audioElement = document.getElementById('voicePreviewAudio');
    
    if (!voiceSelect) {
        alert('음성 선택 요소를 찾을 수 없습니다.');
        return;
    }
    
    const selectedVoice = voiceSelect.value;
    
    // Get API keys from hidden inputs (loaded from mypage)
    const minimaxApiKey = document.getElementById('minimaxApiKey')?.value;
    const minimaxGroupId = document.getElementById('minimaxGroupId')?.value;
    
    if (!minimaxApiKey) {
        alert('⚠️ Minimax API 키가 설정되지 않았습니다.\n\n마이페이지 → API 키 탭에서 Minimax API 키를 먼저 설정해주세요.');
        return;
    }
    
    // Sample text for preview
    const sampleText = '안녕하세요. 이것은 음성 미리듣기 샘플입니다. 선택하신 목소리로 유튜브 쇼츠가 생성됩니다.';
    
    try {
        // Disable button
        if (previewBtn) {
            previewBtn.disabled = true;
            previewText.textContent = '생성 중...';
            previewIcon.className = 'fas fa-spinner fa-spin';
        }
        
        console.log('🎤 Calling voice preview API...');
        
        const response = await fetch(`${API_BASE}/api/voice/preview`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: sampleText,
                voice: selectedVoice,
                apiKey: minimaxApiKey,
                groupId: minimaxGroupId
            })
        });
        
        const data = await response.json();
        
        console.log('📦 API Response:', data);
        
        if (!data.success) {
            console.error('❌ API Error Details:', JSON.stringify(data.debug, null, 2));
            
            // 더 자세한 에러 정보 표시
            let errorMsg = data.error || '음성 생성 실패';
            if (data.debug && data.debug.base_resp) {
                errorMsg += `\n상태 코드: ${data.debug.base_resp.status_code}`;
                errorMsg += `\n메시지: ${data.debug.base_resp.status_msg}`;
            }
            
            throw new Error(errorMsg);
        }
        
        console.log('✅ Voice preview generated:', data.data.audioUrl);
        
        // Play audio
        if (audioElement && data.data.audioUrl) {
            audioElement.src = data.data.audioUrl;
            audioElement.play();
            
            // Update button to stop state
            previewText.textContent = '재생 중...';
            previewIcon.className = 'fas fa-stop';
            
            // Reset button when audio ends
            audioElement.onended = () => {
                previewText.textContent = '음성 미리듣기';
                previewIcon.className = 'fas fa-play';
                if (previewBtn) previewBtn.disabled = false;
            };
        } else {
            throw new Error('오디오 URL을 받지 못했습니다.');
        }
        
    } catch (error) {
        console.error('❌ Voice preview error:', error);
        
        // 에러 메시지 표시
        let errorMessage = error.message;
        if (errorMessage.includes('rate limit') || errorMessage.includes('사용량 제한')) {
            errorMessage += '\n\n💡 팁: 30초 정도 기다린 후 다시 시도해주세요.';
        }
        
        alert('음성 미리듣기 실패:\n\n' + errorMessage);
        
        // Reset button
        if (previewBtn) {
            previewBtn.disabled = false;
            previewText.textContent = '음성 미리듣기';
            previewIcon.className = 'fas fa-play';
        }
    }
}

// Stage change handler (placeholder)
function onStageChanged(stage) {
    console.log('📍 Stage changed:', stage);
}

// Blog crawling function
async function crawlBlog() {
    console.log('🔍 crawlBlog function called');
    
    const blogUrlInput = document.getElementById('blogUrl');
    const crawlButton = document.querySelector('button[onclick="crawlBlog()"]');
    const container = document.getElementById('crawledImagesContainer');
    
    if (!blogUrlInput || !blogUrlInput.value.trim()) {
        alert('블로그 URL을 입력해주세요.');
        return;
    }
    
    const blogUrl = blogUrlInput.value.trim();
    console.log('📝 Blog URL:', blogUrl);
    
    // Disable button
    if (crawlButton) {
        crawlButton.disabled = true;
        crawlButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>크롤링 중...';
    }
    
    try {
        console.log('📡 Calling API...');
        const response = await fetch(`${API_BASE}/api/crawl/blog`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: blogUrl })
        });
        
        console.log('📦 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📦 API Response:', result);
        
        if (result.success && result.data && result.data.images) {
            const images = result.data.images;
            console.log(`✅ Found ${images.length} images`);
            
            // Display images
            displayBlogImages(images);
            
            alert(`✅ ${images.length}개의 이미지를 찾았습니다!`);
        } else {
            throw new Error('Invalid response format');
        }
        
    } catch (error) {
        console.error('❌ Crawling error:', error);
        alert(`❌ 크롤링 실패: ${error.message}`);
        
        if (container) {
            container.style.display = 'none';
        }
    } finally {
        // Reset button
        if (crawlButton) {
            crawlButton.disabled = false;
            crawlButton.innerHTML = '<i class="fas fa-download mr-2"></i>블로그 크롤링 시작';
        }
        console.log('✅ crawlBlog completed');
    }
}

// Display blog images function
function displayBlogImages(images) {
    console.log('🎨 displayBlogImages called with', images.length, 'images');
    
    const container = document.getElementById('crawledImagesContainer');
    if (!container) {
        console.error('❌ Container not found: crawledImagesContainer');
        return;
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Create grid
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
    
    images.forEach((img, index) => {
        const imageUrl = typeof img === 'string' ? img : img.url;
        
        if (!imageUrl) {
            console.warn('⚠️ Invalid image at index', index, img);
            return;
        }
        
        const imageCard = document.createElement('div');
        imageCard.className = 'relative border rounded-lg p-2 hover:border-blue-500 cursor-pointer';
        imageCard.innerHTML = `
            <input type="checkbox" class="absolute top-3 right-3 w-5 h-5" data-image-url="${imageUrl}">
            <img src="${imageUrl}" alt="Image ${index + 1}" class="w-full h-32 object-cover rounded" onerror="this.parentElement.style.display='none'">
            <p class="text-xs text-gray-600 mt-1 text-center">#${index + 1}</p>
        `;
        
        // Add click handler for checkbox
        const checkbox = imageCard.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                if (!selectedImages.includes(imageUrl)) {
                    selectedImages.push(imageUrl);
                }
            } else {
                selectedImages = selectedImages.filter(url => url !== imageUrl);
            }
            console.log('📌 Selected images:', selectedImages.length);
        });
        
        grid.appendChild(imageCard);
    });
    
    container.appendChild(grid);
    container.style.display = 'block';
    
    console.log(`✅ Displayed ${images.length} images in grid`);
}

// Load user's background images and music from API
async function loadUserBackgrounds() {
    // localStorage만 사용 - 서버 데이터는 로드하지 않음
    console.log('✅ Using localStorage only for backgrounds');
    console.log('📦 Background images:', userBackgroundImages.length);
    console.log('📦 Background music:', userBackgroundMusic.length);
    
    // 이미 loadUploadedFiles()에서 로드되었으므로 추가 작업 불필요
    // 드롭다운만 다시 업데이트
    populateBgImageSelect();
    populateBgMusicSelect();
}

// Populate background image select dropdown
function populateBgImageSelect() {
    const select = document.getElementById('bgImageSelect');
    if (!select) return;
    
    // Clear existing options except the first one
    select.innerHTML = '<option value="">선택 안함 (기본 이미지 사용)</option>';
    
    // Add user's uploaded images
    userBackgroundImages.forEach(image => {
        const option = document.createElement('option');
        option.value = image.id;
        option.textContent = image.name;
        option.dataset.url = image.url || image.data_url;
        select.appendChild(option);
    });
    
    console.log(`✅ Populated ${userBackgroundImages.length} background images`);
}

// Populate background music select dropdown
function populateBgMusicSelect() {
    const select = document.getElementById('bgMusicSelect');
    if (!select) return;
    
    // Clear existing options except the first one
    select.innerHTML = '<option value="">선택 안함 (음악 없음)</option>';
    
    // Add user's uploaded music
    userBackgroundMusic.forEach(music => {
        const option = document.createElement('option');
        option.value = music.id;
        // Display name only (no duration)
        option.textContent = music.name;
        option.dataset.url = music.url || music.data_url;
        select.appendChild(option);
    });
    
    console.log(`✅ Populated ${userBackgroundMusic.length} background music`);
}

// Background Image Upload Handler
async function handleBgImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    console.log('📤 배경 이미지 업로드:', file.name);

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드할 수 있습니다.');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('이미지 파일은 5MB 이하만 업로드할 수 있습니다.');
        return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async function(e) {
        const dataUrl = e.target.result;
        
        // Create image object
        const newImage = {
            id: Date.now(),
            name: file.name,
            url: dataUrl,
            data_url: dataUrl,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            created_at: new Date().toISOString()
        };

        // Add to list
        userBackgroundImages.push(newImage);
        
        // Save to localStorage
        saveUploadedFiles();
        
        // Update select dropdown
        populateBgImageSelect();
        
        // Auto-select the new image
        document.getElementById('bgImageSelect').value = newImage.id;
        
        console.log('✅ 배경 이미지 추가됨:', newImage.name);
        alert(`✅ 배경 이미지 "${file.name}"가 추가되었습니다!`);
    };
    
    reader.readAsDataURL(file);
    
    // Reset file input
    event.target.value = '';
}

// Background Music Upload Handler
async function handleBgMusicUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    console.log('📤 배경 음악 업로드:', file.name);

    // Validate file type
    if (!file.type.startsWith('audio/')) {
        alert('음악 파일만 업로드할 수 있습니다.');
        return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('음악 파일은 10MB 이하만 업로드할 수 있습니다.');
        return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async function(e) {
        const dataUrl = e.target.result;
        
        console.log('📦 음악 데이터 변환 완료, localStorage에 즉시 저장합니다...');
        
        // Create music object WITHOUT duration (즉시 저장)
        const newMusic = {
            id: Date.now(),
            name: file.name,
            url: dataUrl,
            data_url: dataUrl,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            created_at: new Date().toISOString()
        };

        // IMMEDIATELY add to list and save
        userBackgroundMusic.push(newMusic);
        
        // Save to localStorage IMMEDIATELY
        try {
            const musicJson = JSON.stringify(userBackgroundMusic);
            const sizeInMB = (musicJson.length / (1024 * 1024)).toFixed(2);
            console.log(`📊 저장할 음악 데이터 크기: ${sizeInMB} MB`);
            
            localStorage.setItem('uploaded_bg_music', musicJson);
            console.log('💾 LocalStorage에 배경 음악 즉시 저장 완료!');
            
            // Verify save
            const saved = localStorage.getItem('uploaded_bg_music');
            if (saved) {
                const parsed = JSON.parse(saved);
                console.log('✅ 저장 검증 성공:', parsed.length, '개의 음악 파일');
                console.log('✅ 저장된 음악 파일명:', parsed.map(m => m.name).join(', '));
            } else {
                console.error('❌ 저장 검증 실패: localStorage에서 데이터를 읽을 수 없음');
            }
        } catch (err) {
            console.error('❌ LocalStorage 저장 실패:', err);
            console.error('❌ 에러 이름:', err.name);
            console.error('❌ 에러 메시지:', err.message);
            if (err.name === 'QuotaExceededError') {
                alert('⚠️ 저장 공간이 부족합니다. 음악 파일이 너무 큽니다.');
            }
        }
        
        // Update select dropdown
        populateBgMusicSelect();
        
        // Auto-select the new music
        document.getElementById('bgMusicSelect').value = newMusic.id;
        
        console.log('✅ 배경 음악 추가됨:', newMusic.name);
        alert(`✅ 배경 음악 "${file.name}"이 추가되었습니다!`);
    };
    
    reader.readAsDataURL(file);
    
    // Reset file input
    event.target.value = '';
}

// Background Image Delete Handler
function handleBgImageDelete() {
    const select = document.getElementById('bgImageSelect');
    const selectedValue = select.value;
    
    if (!selectedValue) {
        alert('삭제할 배경 이미지를 먼저 선택해주세요.');
        return;
    }

    if (!confirm('선택한 배경 이미지를 삭제하시겠습니까?')) {
        return;
    }

    // Remove from array
    const imageIndex = userBackgroundImages.findIndex(img => img.id == selectedValue);
    if (imageIndex > -1) {
        const deletedImage = userBackgroundImages.splice(imageIndex, 1)[0];
        console.log('🗑️ 배경 이미지 삭제됨:', deletedImage.name);
        
        // Save to localStorage
        saveUploadedFiles();
        
        // Update dropdown
        populateBgImageSelect();
        
        alert(`✅ 배경 이미지 "${deletedImage.name}"가 삭제되었습니다.`);
    }
}

// Background Music Delete Handler
function handleBgMusicDelete() {
    const select = document.getElementById('bgMusicSelect');
    const selectedValue = select.value;
    
    if (!selectedValue) {
        alert('삭제할 배경 음악을 먼저 선택해주세요.');
        return;
    }

    if (!confirm('선택한 배경 음악을 삭제하시겠습니까?')) {
        return;
    }

    // Remove from array
    const musicIndex = userBackgroundMusic.findIndex(music => music.id == selectedValue);
    if (musicIndex > -1) {
        const deletedMusic = userBackgroundMusic.splice(musicIndex, 1)[0];
        console.log('🗑️ 배경 음악 삭제됨:', deletedMusic.name);
        
        // Save to localStorage
        saveUploadedFiles();
        
        // Update dropdown
        populateBgMusicSelect();
        
        alert(`✅ 배경 음악 "${deletedMusic.name}"이 삭제되었습니다.`);
    }
}

// Make functions globally accessible
window.previewVoice = previewVoice;
window.onStageChanged = onStageChanged;
window.crawlBlog = crawlBlog;
window.displayBlogImages = displayBlogImages;
window.loadUserBackgrounds = loadUserBackgrounds;
window.handleBgImageUpload = handleBgImageUpload;
window.handleBgMusicUpload = handleBgMusicUpload;
window.handleBgImageDelete = handleBgImageDelete;
window.handleBgMusicDelete = handleBgMusicDelete;

console.log('✅ Global functions registered');
// Deployed at: Mon Dec  1 06:20:30 UTC 2025
// Cache bust: 1764571239
