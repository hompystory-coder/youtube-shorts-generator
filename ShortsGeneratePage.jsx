import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Loader, CheckCircle, Film, Download, ArrowLeft, Play, Smartphone, Copy, Check } from 'lucide-react';
import axios from 'axios';

function ShortsGeneratePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [scenes, setScenes] = useState([]);
  const [sourceUrl, setSourceUrl] = useState(''); // 원본 기사 URL
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    // 쇼츠 데이터 불러오기 및 비디오 생성 시작
    const loadDataAndGenerate = async () => {
      const savedData = localStorage.getItem('shorts-data');
      if (savedData) {
        const data = JSON.parse(savedData);
        console.log('📦 Loaded data:', data); // 디버깅
        console.log('🔗 Source URL:', data.url); // 디버깅
        setTitle(data.title || '제목 없음');
        setScenes(data.scenes || []);
        setSourceUrl(data.url || data.sourceUrl || ''); // 원본 기사 URL 저장
        console.log('✅ sourceUrl set to:', data.url || data.sourceUrl || ''); // 디버깅
        
        // 데이터 로드 후 자동으로 생성 시작
        await new Promise(resolve => setTimeout(resolve, 500));
        startGeneration(data);
      } else {
        // 데이터가 없으면 크롤링 페이지로 돌아가기
        navigate('/');
      }
    };

    loadDataAndGenerate();
  }, [navigate]);

  const startGeneration = async (data) => {
    if (!data.scenes || data.scenes.length === 0) {
      setError('장면 데이터가 없습니다.');
      return;
    }

    setGenerating(true);
    setError('');
    setProgress(10);
    setStatus('쇼츠 비디오 생성을 준비하고 있습니다...');

    try {
      console.log('🎬 쇼츠 비디오 생성 시작:', data);

      // 쇼츠 전용 설정 (9:16)
      const settings = data.settings || {};
      
      const requestData = {
        title: data.title,
        scenes: data.scenes,
        prompt: data.prompt,
        videoFormat: 'shorts',  // ⭐ 9:16 비율
        aspectRatio: '9:16',    // ⭐ 세로 영상
        settings: {
          // 제목 스타일 (쇼츠용)
          titleStyle: settings.titleStyle || {
            enabled: true,
            fontSize: 64,        // 쇼츠는 더 큰 제목
            color: '#FFFFFF',
            fontFamily: 'NanumGothicBold',
            strokeWidth: 4,
            strokeColor: '#000000',
            position: 'top',
            maxChars: 20,
            animation: 'none',        // ⭐ 애니메이션 효과
            animationDuration: 2.0    // ⭐ 애니메이션 속도
          },
          // 배경 이미지
          backgroundImage: settings.backgroundImage || {
            enabled: false,
            path: '',
            opacity: 0.3,
            blur: 10
          },
          // 자막 (쇼츠용 - 중앙 배치)
          subtitle: settings.subtitle || {
            enabled: true,
            fontSize: 56,        // 쇼츠는 큰 자막
            color: '#FFFFFF',
            fontFamily: 'NanumGothicBold',
            strokeWidth: 4,
            strokeColor: '#000000',
            position: 'center',  // 중앙 배치
            maxLines: 2,
            charsPerLine: 15,    // 짧은 글자 수
            animation: 'none',        // ⭐ 애니메이션 효과
            animationDuration: 2.0    // ⭐ 애니메이션 속도
          },
          // 배경음악
          bgMusic: settings.bgMusic || {
            enabled: false,
            path: '',
            volume: 0.2
          },
          // 워터마크
          watermark: settings.watermark || {
            enabled: false,
            path: '',
            position: 'bottom-right',
            size: 15,
            opacity: 0.8
          },
          // 음성
          voice: settings.voice || 'male_001',
          // 이미지 효과 (쇼츠용 간소화)
          imageEffect: {
            effect: 'zoom-pan',  // 쇼츠는 동적 효과
            intensity: 'medium'
          }
        }
      };

      console.log('📤 전송할 requestData:', requestData);
      console.log('🖼️ 워터마크 설정:', requestData.settings.watermark);

      setProgress(20);
      setStatus(`TTS 음성 생성 중... (0/${data.scenes.length})`);

      // 비디오 생성 API 호출
      const response = await axios.post('/api/video/generate', requestData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(20 + percentCompleted * 0.3); // 20-50%
        }
      });

      if (response.data.success) {
        // 비디오 생성이 백그라운드에서 진행 중
        const videoResult = response.data.data;
        const videoId = videoResult.videoId;
        
        setProgress(50);
        setStatus('쇼츠 영상 생성 중...');

        // 상태 폴링 (비디오 생성 완료 대기)
        const checkStatus = async () => {
          try {
            const statusResponse = await axios.get(`/api/video/status/${videoId}`);
            console.log('📊 상태 확인:', statusResponse.data);
            
            // 응답 구조: { success: true, data: { videoId, status, progress, message, ... } }
            const jobData = statusResponse.data.data || statusResponse.data;
            
            if (jobData.status === 'completed') {
              // 생성 완료
              console.log('✅ 비디오 생성 완료!', jobData);
              console.log('🔗 완료 시점 sourceUrl:', sourceUrl); // 디버깅
              setProgress(100);
              setStatus('✅ 쇼츠 영상 생성 완료!');
              // videoData에 sourceUrl 포함
              setVideoData({ ...jobData, sourceUrl: sourceUrl });
              setGenerating(false);
            } else if (jobData.status === 'failed') {
              console.error('❌ 비디오 생성 실패:', jobData);
              throw new Error(jobData.message || '비디오 생성 실패');
            } else if (jobData.status === 'not_found') {
              console.error('❌ 비디오 작업을 찾을 수 없음:', videoId);
              throw new Error('비디오 작업을 찾을 수 없습니다.');
            } else {
              // 진행 중
              const currentProgress = jobData.progress || 50;
              setProgress(Math.min(50 + currentProgress * 0.5, 95));
              setStatus(jobData.message || '생성 중...');
              console.log(`⏳ 생성 진행 중: ${currentProgress}% - ${jobData.message}`);
              
              // 2초 후 다시 확인
              setTimeout(checkStatus, 2000);
            }
          } catch (err) {
            console.error('❌ 상태 확인 오류:', err);
            setError(err.message || '상태 확인 실패');
            setGenerating(false);
          }
        };

        // 상태 확인 시작
        checkStatus();
      } else {
        throw new Error(response.data.error || '비디오 생성 실패');
      }
    } catch (err) {
      console.error('❌ 비디오 생성 오류:', err);
      setError(err.response?.data?.error || err.message || '비디오 생성에 실패했습니다.');
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (videoData?.videoPath) {
      const link = document.createElement('a');
      link.href = videoData.videoUrl;
      link.download = `shorts_${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePreview = () => {
    if (videoData?.videoPath) {
      window.open(videoData.videoUrl, '_blank');
    }
  };

  const handleRestart = () => {
    navigate('/shorts-settings');
  };

  // 유튜브 업로드용 정보 생성
  const generateYouTubeInfo = () => {
    if (!title || !scenes || scenes.length === 0) return null;

    // 본문 생성: 장면들의 narration을 합침
    let description = scenes
      .map((scene, index) => scene.narration || scene.text || '')
      .filter(text => text.trim())
      .join(' ');

    console.log('🔗 generateYouTubeInfo 호출됨'); // 디버깅
    console.log('🔗 현재 sourceUrl state:', sourceUrl); // 디버깅
    console.log('🔗 videoData.sourceUrl:', videoData?.sourceUrl); // 디버깅
    
    // sourceUrl을 state 또는 videoData에서 가져오기
    const finalSourceUrl = sourceUrl || videoData?.sourceUrl || '';
    console.log('🔗 최종 sourceUrl:', finalSourceUrl); // 디버깅
    console.log('🔗 sourceUrl 타입:', typeof finalSourceUrl); // 디버깅
    console.log('🔗 sourceUrl 길이:', finalSourceUrl?.length); // 디버깅
    
    // 원본 기사 URL 추가
    if (finalSourceUrl && finalSourceUrl.trim()) {
      console.log('✅ URL을 본문에 추가:', finalSourceUrl); // 디버깅
      description += `\n\n더 자세한 내용은 ${finalSourceUrl} 접속하시면 보실 수 있습니다.`;
    } else {
      console.log('⚠️ sourceUrl이 비어있음 - state:', sourceUrl, ', videoData:', videoData?.sourceUrl); // 디버깅
    }

    // 키워드 생성: 제목과 본문에서 추출
    const keywords = generateKeywords(title, description);

    return {
      title: title,
      description: description,
      keywords: keywords
    };
  };

  // 키워드 자동 생성 함수 (개선된 버전)
  const generateKeywords = (title, description) => {
    // 한국어 불용어 리스트 (조사, 접속사, 대명사 등)
    const stopWords = new Set([
      '이', '그', '저', '것', '수', '등', '들', '및', '와', '과', '의', '를', '을', '가', '이', '에', '에서', '으로', '로',
      '은', '는', '도', '만', '라', '이라', '하다', '되다', '있다', '없다', '같다', '이다', '아니다',
      '하는', '되는', '있는', '없는', '한', '될', '된', '일', '때', '더', '가장', '매우', '너무', '정말',
      '그리고', '그러나', '하지만', '또한', '또', '및', '등', '위해', '통해', '대한', '관한', '따른',
      '있습니다', '없습니다', '합니다', '입니다', '했습니다', '것입니다', '것이다',
      '이번', '오늘', '어제', '내일', '올해', '지난', '다음', '지금', '현재', '최근',
      '것으로', '것을', '것이', '것은', '것도', '수도', '수가', '수를', '수는',
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been'
    ]);

    // 제목을 더 높은 가중치로 처리
    const titleWords = title
      .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 2 && !stopWords.has(word.toLowerCase()));

    // 본문에서 단어 추출
    const descWords = description
      .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 2 && !stopWords.has(word.toLowerCase()));

    // 단어 빈도수 계산 (제목 단어는 3배 가중치)
    const wordScore = {};
    
    titleWords.forEach(word => {
      if (word.length >= 2) {
        wordScore[word] = (wordScore[word] || 0) + 3;
      }
    });
    
    descWords.forEach(word => {
      if (word.length >= 2) {
        wordScore[word] = (wordScore[word] || 0) + 1;
      }
    });

    // 점수 기준 정렬 후 상위 5개 추출
    const topKeywords = Object.entries(wordScore)
      .sort((a, b) => {
        // 점수가 같으면 길이가 긴 단어 우선
        if (b[1] === a[1]) {
          return b[0].length - a[0].length;
        }
        return b[1] - a[1];
      })
      .slice(0, 5)
      .map(entry => entry[0]);

    // 추출된 키워드가 없거나 부족한 경우에만 기본 키워드 추가
    if (topKeywords.length === 0) {
      return ['쇼츠', '숏폼', '영상', '콘텐츠', 'shorts'];
    }
    
    // 5개가 안되면 기본 키워드로 채우기
    const fillerKeywords = ['쇼츠', '숏폼', 'shorts', '영상', '콘텐츠'];
    while (topKeywords.length < 5) {
      const filler = fillerKeywords.find(k => !topKeywords.includes(k));
      if (filler) {
        topKeywords.push(filler);
      } else {
        break;
      }
    }
    
    return topKeywords;
  };

  // 클립보드 복사 함수
  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
      alert('클립보드 복사에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/shorts-settings')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              disabled={generating}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>설정으로 돌아가기</span>
            </button>
            
            <div className="flex items-center gap-3">
              <Smartphone className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">쇼츠 영상 생성</h1>
            </div>
          </div>
          
          <p className="text-gray-400 text-center">
            🎬 9:16 비율의 세로 영상을 생성합니다
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-8 shadow-xl"
        >
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-gray-400">총 {scenes.length}개 장면</p>
          </div>

          {/* Progress Section */}
          {generating && (
            <div className="mb-6">
              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-3">
                <Loader className="w-6 h-6 text-purple-400 animate-spin" />
                <p className="text-gray-300">{status}</p>
              </div>

              {/* Progress Percentage */}
              <p className="text-center text-gray-400 mt-2">{progress}%</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 bg-red-500/20 border border-red-500 rounded-lg p-4"
            >
              <p className="text-red-400">{error}</p>
              <button
                onClick={handleRestart}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                설정으로 돌아가기
              </button>
            </motion.div>
          )}

          {/* Success - Video Preview */}
          {videoData && !generating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Success Message */}
              <div className="flex items-center justify-center gap-3 bg-green-500/20 border border-green-500 rounded-lg p-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <p className="text-green-400 font-medium">쇼츠 영상이 성공적으로 생성되었습니다!</p>
              </div>

              {/* Video Preview - 9:16 aspect ratio */}
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="max-w-xs mx-auto">
                  <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden">
                    <video
                      src={videoData.videoUrl}
                      controls
                      className="w-full h-full object-contain"
                      poster={videoData.thumbnailPath}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 mb-1">비율</p>
                  <p className="text-white font-medium">9:16 (세로)</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 mb-1">장면 수</p>
                  <p className="text-white font-medium">{scenes.length}개</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 mb-1">파일 크기</p>
                  <p className="text-white font-medium">
                    {videoData.fileSize ? `${(videoData.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 mb-1">길이</p>
                  <p className="text-white font-medium">
                    {videoData.duration ? `${videoData.duration}초` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handlePreview}
                  className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  미리보기
                </button>
                
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  다운로드
                </button>
              </div>

              {/* YouTube Upload Info Section */}
              {(() => {
                const youtubeInfo = generateYouTubeInfo();
                if (!youtubeInfo) return null;
                
                return (
                  <div className="bg-gradient-to-br from-red-900/30 to-gray-800 rounded-xl p-6 border border-red-500/30">
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <h3 className="text-xl font-bold text-white">유튜브 업로드 정보</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {/* 제목 */}
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold text-gray-300">제목</label>
                          <button
                            onClick={() => copyToClipboard(youtubeInfo.title, 'title')}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-xs text-gray-300 transition-colors"
                          >
                            {copiedField === 'title' ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>복사됨</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>복사</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-white font-medium">{youtubeInfo.title}</p>
                      </div>

                      {/* 본문 */}
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold text-gray-300">본문 (설명)</label>
                          <button
                            onClick={() => copyToClipboard(youtubeInfo.description, 'description')}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-xs text-gray-300 transition-colors"
                          >
                            {copiedField === 'description' ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>복사됨</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>복사</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {youtubeInfo.description}
                        </p>
                      </div>

                      {/* 키워드 */}
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold text-gray-300">키워드 (태그)</label>
                          <button
                            onClick={() => copyToClipboard(youtubeInfo.keywords.join(', '), 'keywords')}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-xs text-gray-300 transition-colors"
                          >
                            {copiedField === 'keywords' ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>복사됨</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>복사</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {youtubeInfo.keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-red-300 text-sm"
                            >
                              #{keyword}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 전체 복사 버튼 */}
                      <button
                        onClick={() => {
                          const fullText = `제목:\n${youtubeInfo.title}\n\n설명:\n${youtubeInfo.description}\n\n키워드:\n${youtubeInfo.keywords.join(', ')}`;
                          copyToClipboard(fullText, 'all');
                        }}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        {copiedField === 'all' ? (
                          <>
                            <Check className="w-5 h-5" />
                            <span>전체 복사됨!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5" />
                            <span>전체 복사하기</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* New Video Button */}
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <Film className="w-5 h-5" />
                새 쇼츠 만들기
              </button>
            </motion.div>
          )}

          {/* Loading State */}
          {generating && (
            <div className="text-center py-8">
              <div className="inline-block">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              </div>
              <p className="text-gray-400">
                쇼츠 영상을 생성하는 중입니다. 잠시만 기다려주세요...
              </p>
              <p className="text-gray-500 text-sm mt-2">
                장면 수에 따라 1-3분 정도 소요될 수 있습니다.
              </p>
            </div>
          )}
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
        >
          <div className="flex gap-3">
            <Smartphone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-blue-400 mb-1">쇼츠 영상 특징</p>
              <ul className="space-y-1 text-gray-400">
                <li>• 9:16 세로 비율 (모바일 최적화)</li>
                <li>• YouTube Shorts, Instagram Reels 용</li>
                <li>• 큰 자막 (56px) 및 중앙 배치</li>
                <li>• 빠른 장면 전환 (5-10초)</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ShortsGeneratePage;
