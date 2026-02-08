#!/usr/bin/env python3
"""
ACE-Step 1.5 실제 음악 생성 테스트
"""
import requests
import json
import time

# API 엔드포인트
BASE_URL = "https://music.neuralgrid.kr/aoto"
API_URL = f"{BASE_URL}/gradio_api"

def test_music_generation():
    print("=" * 60)
    print("ACE-Step 1.5 음악 생성 테스트")
    print("=" * 60)
    
    # 1. API 정보 가져오기
    print("\n[1단계] API 정보 확인 중...")
    try:
        response = requests.get(f"{API_URL}/info", timeout=10)
        if response.status_code == 200:
            print("✅ API 연결 성공!")
            # print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        else:
            print(f"❌ API 연결 실패: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ API 연결 오류: {e}")
        return
    
    # 2. 음악 생성 파라미터 설정
    print("\n[2단계] 음악 생성 파라미터 설정...")
    music_params = {
        "tags": "lo-fi, hip hop, chill, relaxing, jazz, piano, drums, 85 BPM, mellow",
        "lyrics": """[verse]
Soft piano keys falling like rain
Gentle beats that ease the pain
Vinyl crackle in the background
Peaceful vibes all around

[chorus]
Chill vibes flowing free
Just you and me
Relaxing melody
Perfect harmony""",
        "duration": 60,  # 60초
        "format": "mp3",
        "infer_steps": 60,
        "guidance_scale": 15.0,
        "seed": -1,  # 랜덤
        "scheduler_type": "dpmpp-2m-sde"
    }
    
    print("📝 생성할 음악:")
    print(f"   - 장르: Lo-Fi Hip Hop")
    print(f"   - 길이: {music_params['duration']}초")
    print(f"   - 포맷: {music_params['format']}")
    print(f"   - Tags: {music_params['tags']}")
    
    # 3. 음악 생성 요청
    print("\n[3단계] 음악 생성 시작...")
    print("⏳ 생성 중... (약 1-2분 소요)")
    
    try:
        # Gradio API 호출 형식
        # /api/predict 엔드포인트를 사용
        predict_url = f"{API_URL}/call/text2music"
        
        # 실제 Gradio 6.0 API 형식에 맞춰 요청
        payload = {
            "data": [
                music_params["tags"],  # tags
                music_params["lyrics"],  # lyrics
                None,  # reference_audio
                music_params["duration"],  # duration
                music_params["format"],  # format
                "",  # preset (비어있음)
                "",  # lora_path
                music_params["seed"],  # seed
                music_params["infer_steps"],  # steps
                music_params["guidance_scale"],  # guidance
                music_params["scheduler_type"],  # scheduler
                # 나머지 고급 파라미터들...
            ]
        }
        
        print(f"\n🔗 API URL: {predict_url}")
        print(f"📦 Payload Keys: {list(payload.keys())}")
        
        response = requests.post(
            predict_url,
            json=payload,
            timeout=180  # 3분 타임아웃
        )
        
        print(f"\n📊 응답 상태: {response.status_code}")
        print(f"📄 응답 헤더: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ 음악 생성 성공!")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
            # 결과 분석
            if "data" in result:
                output_data = result["data"]
                print(f"\n🎵 생성 결과:")
                print(f"   - 출력 데이터: {output_data}")
                
                # 오디오 파일 경로 추출
                if isinstance(output_data, list) and len(output_data) > 0:
                    audio_info = output_data[0]
                    if isinstance(audio_info, dict) and "name" in audio_info:
                        audio_path = audio_info["name"]
                        audio_url = f"{BASE_URL}/file={audio_path}"
                        print(f"\n🎧 다운로드 URL:")
                        print(f"   {audio_url}")
        else:
            print(f"❌ 음악 생성 실패: {response.status_code}")
            print(f"응답 내용: {response.text[:500]}")
            
    except requests.exceptions.Timeout:
        print("❌ 요청 시간 초과 (3분)")
    except Exception as e:
        print(f"❌ 생성 오류: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 60)
    print("테스트 완료")
    print("=" * 60)

if __name__ == "__main__":
    test_music_generation()
