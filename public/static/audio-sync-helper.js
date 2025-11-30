// Audio Sync Helper - For video generation with audio timing
// Version: 1.0.0

console.log('🎵 Audio Sync Helper loaded');

/**
 * Calculate video clip durations based on audio duration
 * @param {number} totalAudioDuration - Total audio duration in seconds
 * @param {number} imageCount - Number of images to display
 * @returns {Array} Array of clip durations
 */
function calculateClipDurations(totalAudioDuration, imageCount) {
    if (imageCount === 0) return [];
    
    const baseDuration = totalAudioDuration / imageCount;
    const durations = [];
    
    for (let i = 0; i < imageCount; i++) {
        durations.push(baseDuration);
    }
    
    console.log(`📊 Calculated ${imageCount} clips with ${baseDuration.toFixed(2)}s each`);
    return durations;
}

/**
 * Generate Shotstack timeline from images and audio
 * @param {Array} images - Array of image URLs
 * @param {string} audioUrl - Audio file URL
 * @param {number} audioDuration - Audio duration in seconds
 * @returns {Object} Shotstack timeline configuration
 */
function generateShotstackTimeline(images, audioUrl, audioDuration) {
    const clipDurations = calculateClipDurations(audioDuration, images.length);
    
    const clips = [];
    let currentTime = 0;
    
    // Add image clips
    images.forEach((imageUrl, index) => {
        const duration = clipDurations[index];
        
        clips.push({
            asset: {
                type: 'image',
                src: imageUrl
            },
            start: currentTime,
            length: duration,
            fit: 'cover',
            scale: 1,
            position: 'center',
            transition: {
                in: 'fade',
                out: 'fade'
            }
        });
        
        currentTime += duration;
    });
    
    // Shotstack timeline
    const timeline = {
        background: '#000000',
        tracks: [
            {
                clips: clips
            },
            {
                clips: [
                    {
                        asset: {
                            type: 'audio',
                            src: audioUrl
                        },
                        start: 0,
                        length: audioDuration
                    }
                ]
            }
        ]
    };
    
    console.log('🎬 Generated Shotstack timeline:', timeline);
    return timeline;
}

/**
 * Synchronize text animations with audio timestamps
 * @param {Array} textSegments - Array of text segments with timestamps
 * @param {number} totalDuration - Total video duration
 * @returns {Array} Array of synchronized text clips
 */
function syncTextWithAudio(textSegments, totalDuration) {
    const textClips = [];
    
    textSegments.forEach(segment => {
        const { text, start, end } = segment;
        const duration = end - start;
        
        textClips.push({
            asset: {
                type: 'html',
                html: `
                    <div style="
                        font-size: 48px;
                        font-weight: bold;
                        color: white;
                        text-align: center;
                        padding: 20px;
                        background: rgba(0,0,0,0.7);
                        border-radius: 10px;
                    ">
                        ${text}
                    </div>
                `,
                css: '',
                width: 1080,
                height: 1920
            },
            start: start,
            length: duration,
            position: 'bottom',
            offset: {
                y: 0.2
            },
            transition: {
                in: 'fade',
                out: 'fade'
            }
        });
    });
    
    console.log(`📝 Synced ${textClips.length} text clips`);
    return textClips;
}

/**
 * Get audio duration from URL
 * @param {string} audioUrl - Audio file URL
 * @returns {Promise<number>} Audio duration in seconds
 */
async function getAudioDuration(audioUrl) {
    return new Promise((resolve, reject) => {
        const audio = new Audio(audioUrl);
        
        audio.addEventListener('loadedmetadata', () => {
            const duration = audio.duration;
            console.log(`⏱️ Audio duration: ${duration.toFixed(2)}s`);
            resolve(duration);
        });
        
        audio.addEventListener('error', (error) => {
            console.error('❌ Failed to load audio:', error);
            reject(error);
        });
    });
}

/**
 * Format time in MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Export functions to global scope
window.AudioSyncHelper = {
    calculateClipDurations,
    generateShotstackTimeline,
    syncTextWithAudio,
    getAudioDuration,
    formatTime
};

console.log('✅ Audio Sync Helper initialized');
