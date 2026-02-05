import React, { useState, useEffect, useRef } from 'react';
// Layout update timestamp: 1770262885
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings, Music, CheckCircle, ArrowLeft, ArrowRight, Type, Mic, Volume2, Sparkles, Upload, ImageIcon, Loader, Play, Pause, X } from 'lucide-react';
import axios from 'axios';

function ShortsSettingsPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [scenes, setScenes] = useState([]);
  const [prompt, setPrompt] = useState('');
  
  // 제목 스타일 설정
  const [titleStyle, setTitleStyle] = useState({
    enabled: true,
    fontSize: 64,  // 쇼츠는 더 큰 제목 폰트
    fontFamily: 'Nanum Gothic',
    color: '#FFFFFF',
    strokeWidth: 4,
    strokeColor: '#000000',
    position: 'top',
    maxChars: 20,  // 쇼츠는 짧은 제목
    animation: 'none',  // 제목 애니메이션 효과
    animationDuration: 2.0  // 애니메이션 지속시간 (초) - 2배 느리게
  });
  
  // 배경 이미지 설정
  const [backgroundImage, setBackgroundImage] = useState({
    enabled: false,
    path: '',
    opacity: 1.0,
    blur: 0,
    blurIntensity: 0,
    speed: 1.0,
    effect: 'none'
  });
  
  // 배경음악 설정
  const [bgMusic, setBgMusic] = useState({
    enabled: false,
    path: '',
    volume: 0.2
  });
  
  // 워터마크 설정
  const [watermark, setWatermark] = useState({
    enabled: false,
    path: '',
    position: 'bottom-right',  // top-left, top-right, bottom-left, bottom-right, center
    size: 15,  // 비디오 너비 대비 퍼센트 (10-30%)
    opacity: 0.8  // 0.0 ~ 1.0
  });
  // 미리보기 스크롤 애니메이션용 ref
  const previewRef = useRef(null);

  
  // 자막 설정
  const [subtitle, setSubtitle] = useState({
    enabled: false,
    fontSize: 56,
    fontFamily: 'Nanum Gothic',
    color: '#FFFFFF',
    strokeWidth: 4,
    strokeColor: '#000000',
    position: 'center',
    maxLines: 2,
    charsPerLine: 15,
    animation: 'none',
    animationDuration: 2.0
  });
  
  const [voice, setVoice] = useState('male_001');
  const [saveStatus, setSaveStatus] = useState('');
  const autoSaveTimerRef = useRef(null);  // ⭐ useRef로 변경
  
  // 업로드 상태
  const [uploadingBgm, setUploadingBgm] = useState(false);
  const [uploadingBgImage, setUploadingBgImage] = useState(false);
  const [uploadingWatermark, setUploadingWatermark] = useState(false);
  
  // 미리듣기 상태
  const [previewing, setPreviewing] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [previewAudio, setPreviewAudio] = useState(null);
  
  // 파일 목록
  const [bgmFiles, setBgmFiles] = useState([]);
  const [bgImageFiles, setBgImageFiles] = useState([]);
  const [watermarkFiles, setWatermarkFiles] = useState([]);

  // 🎉 Minimax TTS 음성 옵션 (14개!) - 동적으로 백엔드에서 불러오기
  const [voiceOptions, setVoiceOptions] = useState([]);
  
  // 음성 옵션 불러오기 함수
  const loadVoiceOptions = async () => {
    try {
      const response = await axios.get('/api/voice/samples');
      if (response.data.success) {
        const { male, female } = response.data.data;
        
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const maleVoices = male.map(v => ({
          value: v.id,
          label: v.name,
          description: v.desc
        }));
        
        const femaleVoices = female.map(v => ({
          value: v.id,
          label: v.name,
          description: v.desc
        }));
        
        setVoiceOptions([...maleVoices, ...femaleVoices]);
        console.log('✅ 음성 옵션 로드 완료:', maleVoices.length + femaleVoices.length, '개');
      }
    } catch (err) {
      console.error('음성 옵션 로드 실패:', err);
      // 실패 시 기본 음성 옵션 사용
      setVoiceOptions([
        { value: 'male_001', label: '🎤 남성 1 - 전문 아나운서', description: '기본 남성 음성' },
        { value: 'female_001', label: '🎤 여성 1 - 뉴스 앵커', description: '기본 여성 음성' }
      ]);
    }
  };

  // 음성 미리듣기
  const handleVoicePreview = async (voiceId) => {
    // 이미 재생 중이면 정지
    if (playing === voiceId) {
      previewAudio?.pause();
      setPlaying(null);
      setPreviewAudio(null);
      return;
    }

    // 다른 오디오 정지
    if (previewAudio) {
      previewAudio.pause();
      setPreviewAudio(null);
    }

    setPreviewing(voiceId);

    try {
      // 음성별 샘플 텍스트
      const sampleTexts = {
        'male_qn_qingse': '안녕하세요, 청색 남성 목소리입니다. 깨끗하고 전문적인 톤으로 정보를 전달합니다.',
        'male_qn_jingying': '안녕하세요, 경영 남성 목소리입니다. 차분하고 신뢰감 있는 느낌을 줍니다.',
        'male_qn_badao': '안녕하세요! 패기 넘치는 남성 목소리입니다. 힘차고 활기찬 에너지를 전달합니다.',
        'male_qn_daxuesheng': '안녕하세요, 대학생 남성 목소리입니다. 친근하고 편안한 분위기를 만듭니다.',
        'female_tianmei': '안녕하세요, 달콤한 여성 목소리입니다. 부드럽고 매력적인 톤이 특징입니다.',
        'female_shaonv': '안녕하세요, 소녀 목소리입니다. 밝고 생기 넘치는 에너지를 전달합니다.',
        'female_yujie': '안녕하세요, 성숙한 여성 목소리입니다. 우아하고 세련된 분위기를 연출합니다.',
        'female_chengshu': '안녕하세요, 성숙 여성 목소리입니다. 안정적이고 신뢰감 있는 톤입니다.',
        'female_gongzhu': '안녕하세요, 공주님 목소리입니다. 고급스럽고 우아한 느낌을 줍니다.',
        'Podcast_girl': '안녕하세요, 팟캐스트 걸 목소리입니다. 편안하고 친근한 대화 스타일입니다.',
        'Audiobook_female': '안녕하세요, 오디오북 여성 목소리입니다. 명료하고 집중력 있는 낭독 톤입니다.',
        'Audiobook_male': '안녕하세요, 오디오북 남성 목소리입니다. 차분하고 깊이 있는 낭독이 특징입니다.',
        'Podcast_boy': '안녕하세요, 팟캐스트 보이 목소리입니다. 캐주얼하고 자유로운 분위기를 만듭니다.',
        'broadcaster_male': '안녕하세요, 방송인 남성 목소리입니다. 명확하고 설득력 있는 전달력이 돋보입니다.'
      };

      const response = await axios.post('/api/voice/preview-sample', {
        voiceId,
        text: sampleTexts[voiceId] || '안녕하세요, 음성 샘플입니다.'
      });

      const audioUrl = response.data.audioUrl;
      
      if (!audioUrl) {
        throw new Error('오디오 URL을 받지 못했습니다');
      }
      
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setPlaying(null);
        setPreviewAudio(null);
      };
      audio.onerror = (e) => {
        console.error('❌ Audio playback error:', e);
        alert('오디오 재생 중 오류가 발생했습니다');
        setPlaying(null);
        setPreviewAudio(null);
      };
      
      await audio.play();
      
      setPreviewAudio(audio);
      setPlaying(voiceId);
    } catch (err) {
      console.error('❌ 미리듣기 실패:', err);
      alert(err.response?.data?.error || '음성 미리듣기에 실패했습니다');
    } finally {
      setPreviewing(null);
    }
  };

  // 쇼츠용 폰트 옵션 (롱폼과 동일)
  const fontOptions = [
    // 기본 고딕/명조 폰트
    { value: 'NanumGothicBold', label: '⭐ 나눔고딕 Bold (기본)', category: '고딕체' },
    { value: 'NanumGothic', label: '나눔고딕', category: '고딕체' },
    { value: 'NanumMyeongjo', label: '나눔명조', category: '명조체' },
    { value: 'NanumMyeongjoBold', label: '나눔명조 Bold', category: '명조체' },
    { value: 'NanumBarunGothic', label: '나눔바른고딕', category: '고딕체' },
    { value: 'NanumBarunGothicBold', label: '나눔바른고딕 Bold', category: '고딕체' },
    { value: 'NanumSquareR', label: '나눔스퀘어', category: '고딕체' },
    { value: 'NanumSquareB', label: '나눔스퀘어 Bold', category: '고딕체' },
    
    // 손글씨 폰트
    { value: 'GamjaFlower', label: '✏️ 감자꽃 (귀여운 손글씨)', category: '손글씨' },
    { value: 'YeonSung', label: '✏️ 연성 (만화체 손글씨)', category: '손글씨' },
    { value: 'HiMelody', label: '✏️ 하이멜로디 (밝은 손글씨)', category: '손글씨' },
    { value: 'Gugi', label: '✏️ 구기 (통통한 손글씨)', category: '손글씨' },
    { value: 'DoHyeon', label: '✏️ 도현 (캐주얼 손글씨)', category: '손글씨' },
    { value: 'Gaegu', label: '✏️ 개구 (자연스러운 손글씨)', category: '손글씨' },
    { value: 'GaeguBold', label: '✏️ 개구 Bold', category: '손글씨' },
    { value: 'SingleDay', label: '✏️ 싱글데이 (또박또박 손글씨)', category: '손글씨' },
    { value: 'Sunflower', label: '✏️ 해바라기 (밝은 손글씨)', category: '손글씨' },
    { value: 'SunflowerLight', label: '✏️ 해바라기 Light', category: '손글씨' },
    { value: 'SunflowerBold', label: '✏️ 해바라기 Bold', category: '손글씨' }
  ];

  // 배경음악 파일 목록 불러오기
  const loadBgmFiles = async () => {
    try {
      const response = await axios.get('/api/upload/bgm/list');
      if (response.data.success) {
        setBgmFiles(response.data.files || []);
      }
    } catch (err) {
      console.error('배경음악 목록 로드 실패:', err);
    }
  };

  // 배경 이미지 파일 목록 불러오기
  const loadBgImageFiles = async () => {
    try {
      const response = await axios.get('/api/upload/background/list');
      if (response.data.success) {
        setBgImageFiles(response.data.files || []);
      }
    } catch (err) {
      console.error('배경 이미지 목록 로드 실패:', err);
    }
  };

  // 워터마크 파일 목록 불러오기
  const loadWatermarkFiles = async () => {
    try {
      const response = await axios.get('/api/upload/watermark/list');
      if (response.data.success) {
        setWatermarkFiles(response.data.files || []);
      }
    } catch (err) {
      console.error('워터마크 목록 로드 실패:', err);
    }
  };

  // 배경음악 업로드
  const handleBgmUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setUploadingBgm(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('/api/upload/bgm', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setBgMusic({...bgMusic, path: response.data.filePath});
        await loadBgmFiles();
        alert(`✅ 배경음악이 업로드되었습니다: ${response.data.fileName}`);
      }
    } catch (err) {
      console.error('배경음악 업로드 실패:', err);
      alert(`❌ 업로드에 실패했습니다: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploadingBgm(false);
      e.target.value = '';
    }
  };

  // 배경 이미지 업로드
  const handleBgImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setUploadingBgImage(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('/api/upload/background', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setBackgroundImage({...backgroundImage, path: response.data.filePath});
        await loadBgImageFiles();
        alert(`✅ 배경 이미지가 업로드되었습니다: ${response.data.fileName}`);
      }
    } catch (err) {
      console.error('배경 이미지 업로드 실패:', err);
      alert(`❌ 업로드에 실패했습니다: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploadingBgImage(false);
      e.target.value = '';
    }
  };

  // 워터마크 업로드
  const handleWatermarkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setUploadingWatermark(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('/api/upload/watermark', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setWatermark({...watermark, path: response.data.filePath});
        await loadWatermarkFiles();
        alert(`✅ 워터마크가 업로드되었습니다: ${response.data.fileName}`);
      }
    } catch (err) {
      console.error('워터마크 업로드 실패:', err);
      alert(`❌ 업로드에 실패했습니다: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploadingWatermark(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    // ⭐ 비동기 초기화 함수
    const initializeSettings = async () => {
      // localStorage에서 데이터 불러오기
      const savedData = localStorage.getItem('shorts-data');
      if (savedData) {
        const data = JSON.parse(savedData);
        console.log('📦 로드된 데이터:', data);
        setTitle(data.title || '');
        setScenes(data.scenes || []);
        setPrompt(data.prompt || '');
        
        // 저장된 설정이 있으면 불러오기
        if (data.settings) {
          console.log('⚙️ 저장된 설정:', data.settings);
          console.log('🎵 bgMusic:', data.settings.bgMusic);
          
          if (data.settings.titleStyle) {
            // 색상 값 검증 및 정제
            const titleStyle = data.settings.titleStyle;
            if (titleStyle.strokeColor && !titleStyle.strokeColor.match(/^#[0-9A-Fa-f]{6}$/)) {
              console.warn('⚠️ 잘못된 titleStyle.strokeColor 값:', titleStyle.strokeColor);
              titleStyle.strokeColor = '#000000';
            }
            if (titleStyle.color && !titleStyle.color.match(/^#[0-9A-Fa-f]{6}$/)) {
              console.warn('⚠️ 잘못된 titleStyle.color 값:', titleStyle.color);
              titleStyle.color = '#FFFFFF';
            }
            // 기본값 병합 (animation, animationDuration)
            setTitleStyle({
              enabled: true,
              fontSize: 64,
              fontFamily: 'Nanum Gothic',
              color: '#FFFFFF',
              strokeWidth: 4,
              strokeColor: '#000000',
              position: 'top',
              maxChars: 20,
              animation: 'none',
              animationDuration: 2.0,
              ...titleStyle
            });
          }
          if (data.settings.backgroundImage) {
            setBackgroundImage({
              enabled: false,
              path: '',
              opacity: 1.0,
              blur: 0,
              blurIntensity: 0,
              speed: 1.0,
              effect: 'none',
              ...data.settings.backgroundImage
            });
          }
          if (data.settings.bgMusic) {
            console.log('✅ bgMusic 복원:', data.settings.bgMusic);
            setBgMusic(data.settings.bgMusic);
          }
          if (data.settings.watermark) {
            console.log('✅ watermark 복원:', data.settings.watermark);
            setWatermark(data.settings.watermark);
          }
          if (data.settings.subtitle) {
            // 색상 값 검증 및 정제
            const subtitle = data.settings.subtitle;
            if (subtitle.strokeColor && !subtitle.strokeColor.match(/^#[0-9A-Fa-f]{6}$/)) {
              console.warn('⚠️ 잘못된 subtitle.strokeColor 값:', subtitle.strokeColor);
              subtitle.strokeColor = '#000000';
            }
            if (subtitle.color && !subtitle.color.match(/^#[0-9A-Fa-f]{6}$/)) {
              console.warn('⚠️ 잘못된 subtitle.color 값:', subtitle.color);
              subtitle.color = '#FFFFFF';
            }
            // 애니메이션 기본값 추가
            if (!subtitle.animation) subtitle.animation = 'none';
            if (!subtitle.animationDuration) subtitle.animationDuration = 2.0;
            setSubtitle(subtitle);
          }
          if (data.settings.voice) setVoice(data.settings.voice);
        }
      } else {
        // 데이터 없으면 기본값 사용
        console.log('⚠️ localStorage에 데이터 없음 - 기본값 사용');
      }
      
      // ⭐ 1. 먼저 파일 목록 로드 (순서 보장)
      console.log('📂 파일 목록 로딩 시작...');
      await loadBgmFiles();
      await loadBgImageFiles();
      await loadWatermarkFiles();
      await loadVoiceOptions();
      console.log('✅ 파일 목록 및 음성 옵션 로딩 완료');
      
      // ⭐ 2. 그 다음 백엔드에서 실시간 설정 불러오기 (우선순위 높음)
      await loadRealtimeSettings();
    };
    
    initializeSettings();
  }, [navigate]);
  
  // ⭐ 백엔드에서 실시간 설정 불러오기
  const loadRealtimeSettings = async () => {
    try {
      const response = await axios.get('/api/settings/realtime');
      if (response.data.success && response.data.data) {
        const settings = response.data.data;
        console.log('🌐 백엔드에서 설정 복원:', settings);
        
        // 백엔드 설정이 있으면 적용 (localStorage보다 우선)
        if (settings.titleStyle) {
          // 색상 값 검증 및 정제
          const titleStyle = settings.titleStyle;
          if (titleStyle.strokeColor && !titleStyle.strokeColor.match(/^#[0-9A-Fa-f]{6}$/)) {
            console.warn('⚠️ 잘못된 titleStyle.strokeColor 값:', titleStyle.strokeColor);
            titleStyle.strokeColor = '#000000';
          }
          if (titleStyle.color && !titleStyle.color.match(/^#[0-9A-Fa-f]{6}$/)) {
            console.warn('⚠️ 잘못된 titleStyle.color 값:', titleStyle.color);
            titleStyle.color = '#FFFFFF';
          }
          // 기본값 병합 (animation, animationDuration)
          setTitleStyle({
            enabled: true,
            fontSize: 64,
            fontFamily: 'Nanum Gothic',
            color: '#FFFFFF',
            strokeWidth: 4,
            strokeColor: '#000000',
            position: 'top',
            maxChars: 20,
            animation: 'none',
            animationDuration: 2.0,
            ...titleStyle
          });
        }
        if (settings.backgroundImage) {
          setBackgroundImage({
            enabled: false,
            path: '',
            opacity: 1.0,
            blur: 0,
            blurIntensity: 0,
            speed: 1.0,
            effect: 'none',
            ...settings.backgroundImage
          });
        }
        if (settings.bgMusic) {
          console.log('✅ 백엔드 bgMusic 복원:', settings.bgMusic);
          
          // ⭐ 배경음악 파일 존재 확인
          if (settings.bgMusic.path) {
            await validateBgmFile(settings.bgMusic);
          } else {
            setBgMusic(settings.bgMusic);
          }
        }
        if (settings.watermark) {
          console.log('✅ 백엔드 watermark 복원:', settings.watermark);
          setWatermark(settings.watermark);
        }
        if (settings.subtitle) {
          // 색상 값 검증 및 정제
          const subtitle = settings.subtitle;
          if (subtitle.strokeColor && !subtitle.strokeColor.match(/^#[0-9A-Fa-f]{6}$/)) {
            console.warn('⚠️ 잘못된 subtitle.strokeColor 값:', subtitle.strokeColor);
            subtitle.strokeColor = '#000000';
          }
          if (subtitle.color && !subtitle.color.match(/^#[0-9A-Fa-f]{6}$/)) {
            console.warn('⚠️ 잘못된 subtitle.color 값:', subtitle.color);
            subtitle.color = '#FFFFFF';
          }
          // 애니메이션 기본값 추가
          if (!subtitle.animation) subtitle.animation = 'none';
          if (!subtitle.animationDuration) subtitle.animationDuration = 2.0;
          setSubtitle(subtitle);
        }
        if (settings.voice) setVoice(settings.voice);
      }
    } catch (error) {
      console.error('백엔드 설정 불러오기 실패:', error);
    }
  };
  
  // ⭐ 배경음악 파일 존재 확인 및 유효성 검증
  const validateBgmFile = async (bgMusicSettings) => {
    try {
      // 파일 목록 가져오기
      const response = await axios.get('/api/upload/bgm/list');
      if (response.data.success) {
        const files = response.data.files || [];
        const filePaths = files.map(f => f.path);
        
        // 저장된 경로가 실제 파일 목록에 있는지 확인
        if (filePaths.includes(bgMusicSettings.path)) {
          console.log('✅ 배경음악 파일 존재 확인:', bgMusicSettings.path);
          setBgMusic(bgMusicSettings);
        } else {
          console.warn('⚠️ 배경음악 파일이 삭제되었습니다:', bgMusicSettings.path);
          console.log('📁 현재 파일 목록:', filePaths);
          
          // 파일이 없으면 경로만 초기화
          setBgMusic({
            enabled: bgMusicSettings.enabled,
            path: '',  // 경로 초기화
            volume: bgMusicSettings.volume
          });
          
          // 자동 저장하여 백엔드에도 반영
          setTimeout(() => autoSave(), 100);
        }
      }
    } catch (error) {
      console.error('배경음악 파일 검증 실패:', error);
      // 에러 시 일단 복원 (파일 목록 API 실패 가능성)
      setBgMusic(bgMusicSettings);
    }
  };

  const handleSave = () => {
    const settings = {
      titleStyle,
      backgroundImage,
      bgMusic,
      watermark,
      subtitle,
      voice
    };

    // localStorage에 설정 저장
    const savedData = localStorage.getItem('shorts-data');
    if (savedData) {
      const data = JSON.parse(savedData);
      data.settings = settings;
      localStorage.setItem('shorts-data', JSON.stringify(data));
      
      setSaveStatus('저장되었습니다! ✅');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  // 자동 저장 함수
  const autoSave = async () => {
    const settings = {
      titleStyle,
      backgroundImage,
      bgMusic,
      watermark,
      subtitle,
      voice
    };
    
    console.log('💾 자동 저장 중...', { bgMusic });

    // ⭐ 1. localStorage에 저장 (빠른 로컬 캐싱)
    const savedData = localStorage.getItem('shorts-data');
    if (savedData) {
      const data = JSON.parse(savedData);
      data.settings = settings;
      localStorage.setItem('shorts-data', JSON.stringify(data));
      console.log('✅ localStorage 저장 완료:', { bgMusic: data.settings.bgMusic });
    }
    
    // ⭐ 2. 백엔드에 저장 (영구 저장)
    try {
      const response = await axios.post('/api/settings/realtime', settings);
      if (response.data.success) {
        console.log('✅ 백엔드 저장 완료');
        setSaveStatus('자동 저장됨 ✅');
        setTimeout(() => setSaveStatus(''), 1500);
      }
    } catch (error) {
      console.error('❌ 백엔드 저장 실패:', error);
      // 백엔드 저장 실패해도 localStorage는 저장됨
      setSaveStatus('로컬 저장됨 ⚠️');
      setTimeout(() => setSaveStatus(''), 1500);
    }
  };

  // 설정 변경 시 자동 저장 (디바운스)
  useEffect(() => {
    // 이전 타이머 취소
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    // 새 타이머 설정
    autoSaveTimerRef.current = setTimeout(() => {
      autoSave();
    }, 500); // 500ms 후 자동 저장
    
    // cleanup: 컴포넌트 unmount 시 타이머 정리
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [titleStyle, backgroundImage, bgMusic, watermark, subtitle, voice]);

  // 스크롤 애니메이션
  useEffect(() => {
    const handleScroll = () => {
      if (previewRef.current) {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        previewRef.current.style.transform = 'translateY(' + scrollTop + 'px)';
        previewRef.current.style.transition = 'transform 0.5s ease-out';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const handleNext = () => {
    handleSave();
    navigate('/shorts-generate');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/shorts-edit')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>편집으로 돌아가기</span>
            </button>
            
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">쇼츠 설정</h1>
            </div>
          </div>
          
          <p className="text-gray-400 text-center">
            🎬 9:16 비율의 쇼츠 영상에 최적화된 설정입니다
          </p>
        </motion.div>

        {/* Settings Cards */}
        <div className="flex flex-row gap-8 justify-center items-start mx-auto min-h-screen">
          {/* 왼쪽: 설정 패널 */}
          <div className="w-[700px] space-y-6">
          
          {/* 제목 스타일 설정 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <Type className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">제목 스타일</h2>
            </div>
            
            <div className="space-y-4">
              {/* 제목 활성화 */}
              <div className="flex items-center justify-between">
                <span className="text-gray-300">제목 표시</span>
                <button
                  onClick={() => setTitleStyle({ ...titleStyle, enabled: !titleStyle.enabled })}
                  className={`
                    relative w-14 h-7 rounded-full transition-colors
                    ${titleStyle.enabled ? 'bg-purple-500' : 'bg-gray-600'}
                  `}
                >
                  <div className={`
                    absolute top-1 w-5 h-5 bg-white rounded-full transition-transform
                    ${titleStyle.enabled ? 'left-8' : 'left-1'}
                  `} />
                </button>
              </div>

              {titleStyle.enabled && (
                <>
                  {/* 폰트 선택 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">폰트</label>
                    <select
                      value={titleStyle.fontFamily}
                      onChange={(e) => setTitleStyle({ ...titleStyle, fontFamily: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {fontOptions.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 폰트 크기 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      폰트 크기: {titleStyle.fontSize}px
                    </label>
                    <input
                      type="range"
                      min="48"
                      max="80"
                      value={titleStyle.fontSize}
                      onChange={(e) => setTitleStyle({ ...titleStyle, fontSize: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* 제목 위치 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">제목 위치</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['top', 'bottom'].map((pos) => (
                        <button
                          key={pos}
                          onClick={() => setTitleStyle({ ...titleStyle, position: pos })}
                          className={`
                            px-4 py-2 rounded-lg font-medium transition-all
                            ${titleStyle.position === pos
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }
                          `}
                        >
                          {pos === 'top' ? '상단' : '하단'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 제목 색상 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">제목 색상</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={titleStyle.color}
                        onChange={(e) => setTitleStyle({ ...titleStyle, color: e.target.value })}
                        className="w-16 h-10 rounded-lg cursor-pointer bg-gray-700 border-2 border-gray-600"
                      />
                      <input
                        type="text"
                        value={titleStyle.color}
                        onChange={(e) => setTitleStyle({ ...titleStyle, color: e.target.value })}
                        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>

                  {/* 제목 테두리 색상 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">테두리 색상</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={titleStyle.strokeColor}
                        onChange={(e) => setTitleStyle({ ...titleStyle, strokeColor: e.target.value })}
                        className="w-16 h-10 rounded-lg cursor-pointer bg-gray-700 border-2 border-gray-600"
                      />
                      <input
                        type="text"
                        value={titleStyle.strokeColor}
                        onChange={(e) => setTitleStyle({ ...titleStyle, strokeColor: e.target.value })}
                        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  {/* 제목 테두리 두께 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      테두리 두께: {titleStyle.strokeWidth}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={titleStyle.strokeWidth}
                      onChange={(e) => setTitleStyle({ ...titleStyle, strokeWidth: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* 제목 애니메이션 효과 */}
                  <div className="pt-4 border-t border-gray-700">
                    <label className="text-gray-300 text-sm mb-3 block font-semibold">
                      🎬 제목 효과
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'none', label: '효과 없음', icon: '⏸️' },
                        { value: 'slide-down', label: '위→아래', icon: '⬇️' },
                        { value: 'slide-up', label: '아래→위', icon: '⬆️' },
                        { value: 'slide-right', label: '좌→우', icon: '➡️' },
                        { value: 'slide-left', label: '우→좌', icon: '⬅️' },
                        { value: 'fade-in', label: '페이드인', icon: '🌟' },
                        { value: 'zoom-in', label: '줌인', icon: '🔍' },
                        { value: 'typing', label: '타이핑', icon: '⌨️' }
                      ].map(effect => (
                        <button
                          key={effect.value}
                          onClick={() => setTitleStyle({ ...titleStyle, animation: effect.value })}
                          className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                            titleStyle.animation === effect.value
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          <span className="mr-1">{effect.icon}</span>
                          {effect.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 애니메이션 속도 */}
                  {titleStyle.animation !== 'none' && (
                    <div>
                      <label className="text-gray-300 text-sm mb-2 block">
                        효과 속도: {titleStyle.animationDuration.toFixed(1)}초
                      </label>
                      <div className="flex gap-2">
                        {[1.0, 1.5, 2.0, 3.0, 4.0].map(duration => (
                          <button
                            key={duration}
                            onClick={() => setTitleStyle({ ...titleStyle, animationDuration: duration })}
                            className={`px-4 py-2 rounded-lg transition-colors flex-1 ${
                              titleStyle.animationDuration === duration
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {duration.toFixed(1)}s
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* 배경 이미지 설정 - 성능 문제로 임시 비활성화 */}
          {false && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gray-800 rounded-xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">배경 이미지 (임시 비활성화)</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">배경 이미지 사용</span>
                <button
                  onClick={() => setBackgroundImage({ ...backgroundImage, enabled: !backgroundImage.enabled })}
                  className={`
                    relative w-14 h-7 rounded-full transition-colors
                    ${backgroundImage.enabled ? 'bg-purple-500' : 'bg-gray-600'}
                  `}
                >
                  <div className={`
                    absolute top-1 w-5 h-5 bg-white rounded-full transition-transform
                    ${backgroundImage.enabled ? 'left-8' : 'left-1'}
                  `} />
                </button>
              </div>

              
                  {/* 배경흐림 강도 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      배경흐림: {backgroundImage.blurIntensity.toFixed(1)}
                    </label>
                    <div className="flex gap-2">
                      {[0.5, 1.0, 1.5, 2.0].map(val => (
                        <button
                          key={val}
                          onClick={() => setBackgroundImage({ ...backgroundImage, blurIntensity: val })}
                          className={`
                            px-4 py-2 rounded-lg transition-colors flex-1
                            ${backgroundImage.blurIntensity === val 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                          `}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 줌 속도 + 패닝 속도 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      줌 속도 + 패닝 속도: {backgroundImage.speed.toFixed(1)}
                    </label>
                    <div className="flex gap-2">
                      {[0.5, 1.0, 1.5, 2.0].map(val => (
                        <button
                          key={val}
                          onClick={() => setBackgroundImage({ ...backgroundImage, speed: val })}
                          className={`
                            px-4 py-2 rounded-lg transition-colors flex-1
                            ${backgroundImage.speed === val 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                          `}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 속도 프리셋 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">속도 프리셋</label>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => setBackgroundImage({ ...backgroundImage, effect: 'left-to-right' })}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          backgroundImage.effect === 'left-to-right' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        좌 → 우 패닝
                      </button>
                      <button
                        onClick={() => setBackgroundImage({ ...backgroundImage, effect: 'right-to-left' })}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          backgroundImage.effect === 'right-to-left' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        우 → 좌 패닝
                      </button>
                      <button
                        onClick={() => setBackgroundImage({ ...backgroundImage, effect: 'top-to-bottom' })}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          backgroundImage.effect === 'top-to-bottom' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        위 → 아래 패닝
                      </button>
                      <button
                        onClick={() => setBackgroundImage({ ...backgroundImage, effect: 'bottom-to-top' })}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          backgroundImage.effect === 'bottom-to-top' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        아래 → 위 패닝
                      </button>
                      <button
                        onClick={() => setBackgroundImage({ ...backgroundImage, effect: 'zoom-in' })}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          backgroundImage.effect === 'zoom-in' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        줌인 효과 (호흡)
                      </button>
                      <button
                        onClick={() => setBackgroundImage({ ...backgroundImage, effect: 'zoom-out' })}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          backgroundImage.effect === 'zoom-out' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        줌아웃 효과 (호흡)
                      </button>
                      <button
                        onClick={() => setBackgroundImage({ ...backgroundImage, effect: 'circular' })}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          backgroundImage.effect === 'circular' 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        원형 모션
                      </button>
                      <button
                        onClick={() => setBackgroundImage({ ...backgroundImage, effect: 'shake' })}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          backgroundImage.effect === 'shake' 
                            ? 'bg-red-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        흔들림 모션
                      </button>
                      <button
                        onClick={() => setBackgroundImage({ ...backgroundImage, effect: 'ken-burns' })}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          backgroundImage.effect === 'ken-burns' 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        켄 번즈 효과
                      </button>
                      <button
                        onClick={() => setBackgroundImage({ ...backgroundImage, effect: 'none' })}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          backgroundImage.effect === 'none' 
                            ? 'bg-gray-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        효과 없음
                      </button>
                    </div>
                  </div>

              {backgroundImage.enabled && (
                <>
                  {/* 파일 업로드 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">이미지 파일 업로드</label>
                    <div className="flex gap-2">
                      <label className={`
                        flex-1 flex items-center justify-center gap-2 px-4 py-3 
                        bg-gray-700 text-white rounded-lg cursor-pointer
                        hover:bg-gray-600 transition-colors
                        ${uploadingBgImage ? 'opacity-50 cursor-not-allowed' : ''}
                      `}>
                        {uploadingBgImage ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            <span>업로드 중...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            <span>이미지 업로드</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBgImageUpload}
                          disabled={uploadingBgImage}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      PNG, JPG 형식 지원 (권장: 1080x1920)
                    </p>
                  </div>

                  {/* 파일 선택 */}
                  {bgImageFiles.length > 0 && (
                    <div>
                      <label className="text-gray-300 text-sm mb-2 block">저장된 이미지</label>
                      <select
                        value={backgroundImage.path}
                        onChange={(e) => setBackgroundImage({ ...backgroundImage, path: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">이미지 선택...</option>
                        {bgImageFiles.map((file) => (
                          <option key={file.path} value={file.path}>
                            {file.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 투명도 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      투명도: {Math.round(backgroundImage.opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={backgroundImage.opacity}
                      onChange={(e) => setBackgroundImage({ ...backgroundImage, opacity: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* 블러 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      블러 효과: {backgroundImage.blur}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={backgroundImage.blur}
                      onChange={(e) => setBackgroundImage({ ...backgroundImage, blur: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                </>
              )}
            </div>
          </motion.div>
          )}

          {/* 음성 설정 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <Mic className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">음성 설정</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {voiceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setVoice(option.value)}
                  className={`
                    p-4 rounded-lg border-2 transition-all text-left
                    ${voice === option.value
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-700 bg-gray-700/50 hover:border-purple-400'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-white font-medium">{option.label}</div>
                      <div className="text-gray-400 text-sm mt-1">{option.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVoicePreview(option.value);
                        }}
                        disabled={previewing === option.value}
                        className={`
                          px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2
                          ${previewing === option.value
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : playing === option.value
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-purple-500 text-white hover:bg-purple-600'
                          }
                        `}
                      >
                        {previewing === option.value ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            로딩...
                          </>
                        ) : playing === option.value ? (
                          <>
                            <Pause className="w-4 h-4" />
                            정지
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            미리듣기
                          </>
                        )}
                      </button>
                      {voice === option.value && (
                        <CheckCircle className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* 자막 설정 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-gray-800 rounded-xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <Type className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">자막 설정</h2>
            </div>
            
            <div className="space-y-4">
              {/* 자막 활성화 */}
              <div className="flex items-center justify-between">
                <span className="text-gray-300">자막 표시</span>
                <button
                  onClick={() => setSubtitle({ ...subtitle, enabled: !subtitle.enabled })}
                  className={`
                    relative w-14 h-7 rounded-full transition-colors
                    ${subtitle.enabled ? 'bg-purple-500' : 'bg-gray-600'}
                  `}
                >
                  <div className={`
                    absolute top-1 w-5 h-5 bg-white rounded-full transition-transform
                    ${subtitle.enabled ? 'left-8' : 'left-1'}
                  `} />
                </button>
              </div>

              {subtitle.enabled && (
                <>
                  {/* 폰트 선택 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">폰트</label>
                    <select
                      value={subtitle.fontFamily}
                      onChange={(e) => setSubtitle({ ...subtitle, fontFamily: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {fontOptions.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 폰트 크기 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      폰트 크기: {subtitle.fontSize}px
                    </label>
                    <input
                      type="range"
                      min="40"
                      max="80"
                      value={subtitle.fontSize}
                      onChange={(e) => setSubtitle({ ...subtitle, fontSize: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* 자막 위치 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">자막 위치</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['top', 'center', 'bottom'].map((pos) => (
                        <button
                          key={pos}
                          onClick={() => setSubtitle({ ...subtitle, position: pos })}
                          className={`
                            px-4 py-2 rounded-lg font-medium transition-all
                            ${subtitle.position === pos
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }
                          `}
                        >
                          {pos === 'top' ? '상단' : pos === 'center' ? '중앙' : '하단'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 자막 색상 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">자막 색상</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={subtitle.color}
                        onChange={(e) => setSubtitle({ ...subtitle, color: e.target.value })}
                        className="w-16 h-10 rounded-lg cursor-pointer bg-gray-700 border-2 border-gray-600"
                      />
                      <input
                        type="text"
                        value={subtitle.color}
                        onChange={(e) => setSubtitle({ ...subtitle, color: e.target.value })}
                        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>

                  {/* 자막 테두리 색상 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">테두리 색상</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={subtitle.strokeColor}
                        onChange={(e) => setSubtitle({ ...subtitle, strokeColor: e.target.value })}
                        className="w-16 h-10 rounded-lg cursor-pointer bg-gray-700 border-2 border-gray-600"
                      />
                      <input
                        type="text"
                        value={subtitle.strokeColor}
                        onChange={(e) => setSubtitle({ ...subtitle, strokeColor: e.target.value })}
                        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  {/* 자막 테두리 두께 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      테두리 두께: {subtitle.strokeWidth}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={subtitle.strokeWidth}
                      onChange={(e) => setSubtitle({ ...subtitle, strokeWidth: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* 🎬 자막 애니메이션 효과 */}
                  {subtitle.enabled && (
                    <div>
                      <label className="text-gray-300 text-sm mb-3 block font-semibold">
                        🎬 자막 효과
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'none', label: '효과 없음', icon: '⏸️' },
                          { value: 'slide-down', label: '위→아래', icon: '⬇️' },
                          { value: 'slide-up', label: '아래→위', icon: '⬆️' },
                          { value: 'slide-right', label: '좌→우', icon: '➡️' },
                          { value: 'slide-left', label: '우→좌', icon: '⬅️' },
                          { value: 'fade-in', label: '페이드인', icon: '🌟' },
                          { value: 'zoom-in', label: '줌인', icon: '🔍' },
                          { value: 'typing', label: '타이핑', icon: '⌨️' }
                        ].map(effect => (
                          <button
                            key={effect.value}
                            onClick={() => setSubtitle({ ...subtitle, animation: effect.value })}
                            className={`px-4 py-2 rounded-lg transition-all ${subtitle.animation === effect.value ? "bg-purple-600 text-white" : "bg-gray-600 text-gray-300 hover:bg-gray-500"}`}
                          >
                            <span className="mr-1">{effect.icon}</span>
                            {effect.label}
                          </button>
                        ))}
                      </div>

                      {/* 애니메이션 속도 */}
                      {subtitle.animation !== 'none' && (
                        <div className="mt-4">
                          <label className="text-gray-300 text-sm mb-2 block">
                            효과 속도: {(subtitle.animationDuration || 2.0).toFixed(1)}초
                          </label>
                          <div className="flex gap-2">
                            {[1.0, 1.5, 2.0, 3.0, 4.0].map(duration => (
                              <button
                                key={duration}
                                onClick={() => setSubtitle({ ...subtitle, animationDuration: duration })}
                                className={`flex-1 px-3 py-2 rounded-lg transition-all ${subtitle.animationDuration === duration ? "bg-purple-600 text-white" : "bg-gray-600 text-gray-300 hover:bg-gray-500"}`}
                              >
                                {duration.toFixed(1)}s
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 줄당 글자 수 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      줄당 글자 수: {subtitle.charsPerLine}자
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="20"
                      value={subtitle.charsPerLine}
                      onChange={(e) => setSubtitle({ ...subtitle, charsPerLine: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      쇼츠는 짧은 글자 수 권장 (9:16 비율)
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* 배경음악 설정 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <Music className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">배경음악 설정</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">배경음악 사용</span>
                <button
                  onClick={() => setBgMusic({ ...bgMusic, enabled: !bgMusic.enabled })}
                  className={`
                    relative w-14 h-7 rounded-full transition-colors
                    ${bgMusic.enabled ? 'bg-purple-500' : 'bg-gray-600'}
                  `}
                >
                  <div className={`
                    absolute top-1 w-5 h-5 bg-white rounded-full transition-transform
                    ${bgMusic.enabled ? 'left-8' : 'left-1'}
                  `} />
                </button>
              </div>

              {bgMusic.enabled && (
                <>
                  {/* 파일 업로드 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">음악 파일 업로드</label>
                    <div className="flex gap-2">
                      <label className={`
                        flex-1 flex items-center justify-center gap-2 px-4 py-3 
                        bg-gray-700 text-white rounded-lg cursor-pointer
                        hover:bg-gray-600 transition-colors
                        ${uploadingBgm ? 'opacity-50 cursor-not-allowed' : ''}
                      `}>
                        {uploadingBgm ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            <span>업로드 중...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            <span>음악 업로드</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleBgmUpload}
                          disabled={uploadingBgm}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      MP3, WAV 형식 지원
                    </p>
                  </div>

                  {/* 파일 선택 */}
                  {bgmFiles.length > 0 && (
                    <div>
                      <label className="text-gray-300 text-sm mb-2 block">저장된 음악</label>
                      <select
                        value={bgMusic.path}
                        onChange={(e) => setBgMusic({ ...bgMusic, path: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">음악 선택...</option>
                        {bgmFiles.map((file) => (
                          <option key={file.path} value={file.path}>
                            {file.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 음량 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      음량: {Math.round(bgMusic.volume * 100)}%
                    </label>
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-gray-400" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={bgMusic.volume}
                        onChange={(e) => setBgMusic({ ...bgMusic, volume: parseFloat(e.target.value) })}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-2">
                      💡 쇼츠는 음성이 중요하므로 배경음악을 낮게 설정하세요
                    </p>
                  </div>
                </>
              )}
              
              {/* 배경 효과 설정 */}
              <div className="space-y-4 mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">🎨 배경 효과 설정</h3>
                
                {/* 배경흐림 강도 */}
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    배경흐림: {backgroundImage.blurIntensity.toFixed(1)}x
                  </label>
                  <div className="flex gap-2">
                    {[0, 0.5, 1.0, 1.5, 2.0].map(val => (
                      <button
                        key={val}
                        onClick={() => setBackgroundImage({ ...backgroundImage, blurIntensity: val })}
                        className={`px-4 py-2 rounded-lg transition-colors flex-1 ${backgroundImage.blurIntensity === val ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                      >
                        {val.toFixed(1)}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* 줌 속도 + 패닝 속도 */}
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    줌 속도 + 패닝 속도: {backgroundImage.speed.toFixed(1)}x
                  </label>
                  <div className="flex gap-2">
                    {[0.5, 1.0, 1.5, 2.0].map(val => (
                      <button
                        key={val}
                        onClick={() => setBackgroundImage({ ...backgroundImage, speed: val })}
                        className={`px-4 py-2 rounded-lg transition-colors flex-1 ${backgroundImage.speed === val ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                      >
                        {val}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* 효과 버튼 */}
                <div>
                  <label className="text-gray-300 text-sm mb-3 block">배경 모션 효과</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setBackgroundImage({ ...backgroundImage, effect: 'left-to-right' })}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm ${backgroundImage.effect === 'left-to-right' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      ← 좌→우 패닝
                    </button>
                    <button
                      onClick={() => setBackgroundImage({ ...backgroundImage, effect: 'right-to-left' })}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm ${backgroundImage.effect === 'right-to-left' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      → 우→좌 패닝
                    </button>
                    <button
                      onClick={() => setBackgroundImage({ ...backgroundImage, effect: 'top-to-bottom' })}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm ${backgroundImage.effect === 'top-to-bottom' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      ↑ 위→아래 패닝
                    </button>
                    <button
                      onClick={() => setBackgroundImage({ ...backgroundImage, effect: 'bottom-to-top' })}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm ${backgroundImage.effect === 'bottom-to-top' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      ↓ 아래→위 패닝
                    </button>
                    <button
                      onClick={() => setBackgroundImage({ ...backgroundImage, effect: 'zoom-in' })}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm ${backgroundImage.effect === 'zoom-in' ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      🔍 줌인 효과
                    </button>
                    <button
                      onClick={() => setBackgroundImage({ ...backgroundImage, effect: 'zoom-out' })}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm ${backgroundImage.effect === 'zoom-out' ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      🔎 줌아웃 효과
                    </button>
                    <button
                      onClick={() => setBackgroundImage({ ...backgroundImage, effect: 'circular' })}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm ${backgroundImage.effect === 'circular' ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      ⭕ 원형 모션
                    </button>
                    <button
                      onClick={() => setBackgroundImage({ ...backgroundImage, effect: 'shake' })}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm ${backgroundImage.effect === 'shake' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      📳 흔들림
                    </button>
                    <button
                      onClick={() => setBackgroundImage({ ...backgroundImage, effect: 'ken-burns' })}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm ${backgroundImage.effect === 'ken-burns' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      🎬 켄 번즈 효과
                    </button>
                    <button
                      onClick={() => setBackgroundImage({ ...backgroundImage, effect: 'none' })}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm ${backgroundImage.effect === 'none' ? 'bg-gray-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      ⏸️ 효과 없음
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 워터마크 설정 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-gray-800 rounded-xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">워터마크 설정</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">워터마크 사용</span>
                <button
                  onClick={() => setWatermark({ ...watermark, enabled: !watermark.enabled })}
                  className={`
                    relative w-14 h-7 rounded-full transition-colors
                    ${watermark.enabled ? 'bg-blue-500' : 'bg-gray-600'}
                  `}
                >
                  <div className={`
                    absolute top-1 w-5 h-5 bg-white rounded-full transition-transform
                    ${watermark.enabled ? 'left-8' : 'left-1'}
                  `} />
                </button>
              </div>

              {watermark.enabled && (
                <>
                  {/* 파일 업로드 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">워터마크 이미지 업로드</label>
                    <div className="flex gap-2">
                      <label className={`
                        flex-1 flex items-center justify-center gap-2 px-4 py-3 
                        bg-gray-700 text-white rounded-lg cursor-pointer
                        hover:bg-gray-600 transition-colors
                        ${uploadingWatermark ? 'opacity-50 cursor-not-allowed' : ''}
                      `}>
                        {uploadingWatermark ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            <span>업로드 중...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            <span>이미지 업로드</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleWatermarkUpload}
                          disabled={uploadingWatermark}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      PNG (투명 배경 권장), JPG 형식 지원
                    </p>
                  </div>

                  {/* 파일 선택 */}
                  {watermarkFiles.length > 0 && (
                    <div>
                      <label className="text-gray-300 text-sm mb-2 block">저장된 워터마크</label>
                      <select
                        value={watermark.path}
                        onChange={(e) => setWatermark({ ...watermark, path: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">워터마크 선택...</option>
                        {watermarkFiles.map((file) => (
                          <option key={file.path} value={file.path}>
                            {file.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 위치 선택 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">워터마크 위치</label>
                    <select
                      value={watermark.position}
                      onChange={(e) => setWatermark({ ...watermark, position: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="top-left">⬉ 왼쪽 상단</option>
                      <option value="top-right">⬈ 오른쪽 상단</option>
                      <option value="bottom-left">⬋ 왼쪽 하단</option>
                      <option value="bottom-right">⬊ 오른쪽 하단</option>
                      <option value="center">⊙ 중앙</option>
                    </select>
                  </div>

                  {/* 크기 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      크기: {watermark.size}% (비디오 너비 대비)
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="1"
                      value={watermark.size}
                      onChange={(e) => setWatermark({ ...watermark, size: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>작게 (5%)</span>
                      <span>크게 (30%)</span>
                    </div>
                  </div>

                  {/* 투명도 */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      투명도: {Math.round(watermark.opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={watermark.opacity}
                      onChange={(e) => setWatermark({ ...watermark, opacity: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>투명 (10%)</span>
                      <span>불투명 (100%)</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* 저장 상태 */}
          {saveStatus && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-green-500/20 border border-green-500 rounded-lg p-4 text-center"
            >
              <p className="text-green-400">{saveStatus}</p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              disabled
              className="flex-1 py-4 bg-gray-700/50 text-gray-400 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              실시간 자동저장
            </button>
            
            <button
              onClick={handleNext}
              className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
            >
              <span>생성 페이지로</span>
              <ArrowRight className="w-5 h-5" />
            </button>

          </div>
                    {/* Scene Count Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-center text-gray-500 text-sm"
          >
            <p>총 {scenes.length}개 장면 · 예상 시간: {scenes.reduce((sum, s) => sum + (s.estimatedDuration || 5), 0)}초</p>
          </motion.div>

</div>
          
          {/* 오른쪽: 쇼츠 미리보기 */}
          <div className="w-[380px] flex-shrink-0">
            <div ref={previewRef}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 rounded-xl p-6 shadow-xl"
              >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">📱</span>
                  실시간 미리보기
                </h2>
                
                {/* 9:16 비율 쇼츠 미리보기 */}
                <div className="flex justify-center">
                  <div 
                    className="relative rounded-lg overflow-hidden shadow-2xl"
                    style={{ 
                      width: '270px', 
                      height: '480px',
                      aspectRatio: '9/16',
                      backgroundColor: '#f0f0f0'
                    }}
                  >
                    {/* 배경 이미지 또는 샘플 */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: backgroundImage.enabled && backgroundImage.path 
                          ? `url(/outputs/background/${backgroundImage.path.split('/').pop()})`
                          : `url(/sample-portrait.jpg), url(https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080&h=1920&fit=crop)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 1.0,
                        filter: backgroundImage.blur > 0 ? `blur(${backgroundImage.blur * backgroundImage.blurIntensity}px)` : 'none',
                        animation: backgroundImage.effect !== 'none' 
                          ? `bg-${backgroundImage.effect} ${15 / backgroundImage.speed}s ease-in-out infinite alternate`
                          : 'none'
                      }}
                    />
                    
                    {/* 제목 */}
                    {titleStyle.enabled && title && (
                      <div 
                        key={`title-${titleStyle.animation}-${titleStyle.animationDuration}`}
                        className={`absolute w-full px-4 text-center ${titleStyle.animation !== 'none' ? `title-animation-${titleStyle.animation}` : ''}`}
                        style={{
                          top: titleStyle.position === 'top' ? '10%' : 'auto',
                          bottom: titleStyle.position === 'bottom' ? '10%' : 'auto',
                          fontSize: `${Math.round(titleStyle.fontSize * 0.3)}px`,
                          fontFamily: `${titleStyle.fontFamily}, 'Noto Sans KR', sans-serif`,
                          color: titleStyle.color,
                          fontWeight: 700,
                          textShadow: `
                            ${titleStyle.strokeWidth}px ${titleStyle.strokeWidth}px 0 ${titleStyle.strokeColor},
                            -${titleStyle.strokeWidth}px -${titleStyle.strokeWidth}px 0 ${titleStyle.strokeColor},
                            ${titleStyle.strokeWidth}px -${titleStyle.strokeWidth}px 0 ${titleStyle.strokeColor},
                            -${titleStyle.strokeWidth}px ${titleStyle.strokeWidth}px 0 ${titleStyle.strokeColor}
                          `,
                          lineHeight: 1.2,
                          wordBreak: 'keep-all',
                          '--animation-duration': `${titleStyle.animationDuration}s`
                        }}
                      >
                        {title.slice(0, titleStyle.maxChars)}
                      </div>
                    )}
                    
                    {/* 자막 */}
                    {subtitle.enabled && (
                      <div 
                        className={`absolute w-full px-4 text-center ${titleStyle.animation !== 'none' ? `title-animation-${titleStyle.animation}` : ''}`}
                        style={{
                          ...(subtitle.position === 'top' && { top: '10%' }),
                          ...(subtitle.position === 'center' && { top: '50%', transform: 'translateY(-50%)' }),
                          ...(subtitle.position === 'bottom' && { bottom: '10%' }),
                          fontSize: `${Math.round(subtitle.fontSize * 0.3)}px`,
                          fontFamily: `${subtitle.fontFamily}, 'Noto Sans KR', sans-serif`,
                          color: subtitle.color,
                          fontWeight: 700,
                          textShadow: `
                            ${subtitle.strokeWidth}px ${subtitle.strokeWidth}px 0 ${subtitle.strokeColor},
                            -${subtitle.strokeWidth}px -${subtitle.strokeWidth}px 0 ${subtitle.strokeColor},
                            ${subtitle.strokeWidth}px -${subtitle.strokeWidth}px 0 ${subtitle.strokeColor},
                            -${subtitle.strokeWidth}px ${subtitle.strokeWidth}px 0 ${subtitle.strokeColor}
                          `,
                          lineHeight: 1.3,
                          wordBreak: 'keep-all'
                        }}
                      >
                        이것은 자막입니다<br/>설정을 변경해보세요
                      </div>
                    )}
                    
                    {/* 워터마크 */}
                    {watermark.enabled && watermark.path && (
                      <div 
                        className="absolute"
                        style={{
                          ...(watermark.position === 'top-left' && { top: '10px', left: '10px' }),
                          ...(watermark.position === 'top-right' && { top: '10px', right: '10px' }),
                          ...(watermark.position === 'bottom-left' && { bottom: '10px', left: '10px' }),
                          ...(watermark.position === 'bottom-right' && { bottom: '10px', right: '10px' }),
                          ...(watermark.position === 'center' && { 
                            top: '50%', 
                            left: '50%', 
                            transform: 'translate(-50%, -50%)' 
                          }),
                          opacity: watermark.opacity,
                          width: `${watermark.size}%`
                        }}
                      >
                        <img 
                          src={`/outputs/watermark/${watermark.path.split('/').pop()}`}
                          alt="Watermark"
                          className="w-full h-auto"
                        />
                      </div>
                    )}
                    
                    {/* 배경음악 표시 */}
                    {bgMusic.enabled && bgMusic.path && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
                        <Music className="w-3 h-3 text-white" />
                        <span className="text-white text-xs">BGM</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  비율: 9:16 (1080x1920)
                </p>
              </motion.div>
            </div>
          </div>




      

    </div>
      </div>
  );
}

export default ShortsSettingsPage;
