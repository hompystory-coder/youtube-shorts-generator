#!/usr/bin/env python3
"""
ACE-Step 1.5 실제 음악 생성 - Chill Lo-Fi Hip Hop
"""
import requests
import json
import time

BASE_URL = "https://music.neuralgrid.kr/aoto"

def generate_music():
    print("=" * 70)
    print("🎵 ACE-Step 1.5 음악 생성 시작")
    print("=" * 70)
    
    # 음악 생성 파라미터 (API 순서대로)
    params = [
        "mp3",  # 0. Format
        60,  # 1. Audio Duration (60초)
        "lo-fi, hip hop, chill, relaxing, jazz, piano, drums, 85 BPM, mellow, smooth",  # 2. Tags
        """[verse]
Soft piano keys falling like rain
Gentle beats that ease the pain
Vinyl crackle in the background
Peaceful vibes all around

[chorus]
Chill vibes flowing free
Just you and me
Relaxing melody
Perfect harmony""",  # 3. Lyrics
        60,  # 4. Infer Steps
        15.0,  # 5. Guidance Scale
        "dpmpp-2m-sde",  # 6. Scheduler Type
        "apg",  # 7. CFG Type
        10.0,  # 8. Granularity Scale
        None,  # 9. manual seeds
        0.5,  # 10. Guidance Interval
        0.0,  # 11. Guidance Interval Decay
        3.0,  # 12. Min Guidance Scale
        True,  # 13. use ERG for tag
        False,  # 14. use ERG for lyric
        True,  # 15. use ERG for diffusion
        None,  # 16. OSS Steps
        0.0,  # 17. Guidance Scale Text
        0.0,  # 18. Guidance Scale Lyric
        False,  # 19. Enable Audio2Audio
        0.5,  # 20. Refer audio strength
        None,  # 21. Reference Audio
        "none",  # 22. Lora Name or Path
        1.0,  # 23. Lora weight
    ]
    
    print("\n📝 생성 파라미터:")
    print(f"   - 장르: Chill Lo-Fi Hip Hop")
    print(f"   - 길이: 60초")
    print(f"   - 포맷: MP3")
    print(f"   - BPM: 85")
    print(f"   - Tags: {params[2]}")
    
    # Step 1: Call 시작
    print("\n[1단계] 음악 생성 요청 시작...")
    call_url = f"{BASE_URL}/gradio_api/call/__call__"
    
    try:
        response = requests.post(
            call_url,
            json={"data": params},
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"❌ 요청 실패: {response.status_code}")
            print(response.text[:500])
            return
        
        result = response.json()
        event_id = result.get("event_id")
        
        if not event_id:
            print("❌ Event ID를 받지 못했습니다")
            print(json.dumps(result, indent=2))
            return
        
        print(f"✅ 요청 성공! Event ID: {event_id}")
        
        # Step 2: 결과 폴링
        print("\n[2단계] 음악 생성 중... (약 1-2분 소요)")
        print("⏳ ", end="", flush=True)
        
        status_url = f"{BASE_URL}/gradio_api/call/__call__/{event_id}"
        
        start_time = time.time()
        last_progress = -1
        
        while True:
            try:
                status_response = requests.get(status_url, timeout=10)
                
                if status_response.status_code != 200:
                    print(f"\n⚠️  상태 확인 실패: {status_response.status_code}")
                    time.sleep(2)
                    continue
                
                # SSE 형식 파싱
                lines = status_response.text.strip().split('\n')
                
                for line in lines:
                    if line.startswith('data: '):
                        data_str = line[6:]  # 'data: ' 제거
                        
                        try:
                            data = json.loads(data_str)
                            
                            # Progress 업데이트
                            if "progress" in data:
                                progress = data.get("progress", {})
                                current = progress.get("current", 0)
                                total = progress.get("total", 60)
                                
                                if current != last_progress:
                                    percent = (current / total * 100) if total > 0 else 0
                                    print(f"\r⏳ 진행률: {current}/{total} ({percent:.1f}%)", end="", flush=True)
                                    last_progress = current
                            
                            # 완료 확인
                            if data.get("msg") == "process_completed":
                                print("\n✅ 음악 생성 완료!")
                                
                                output_data = data.get("output", {}).get("data", [])
                                
                                if output_data:
                                    audio_info = output_data[0]
                                    
                                    if isinstance(audio_info, dict):
                                        audio_path = audio_info.get("path", audio_info.get("name", ""))
                                        audio_url = f"{BASE_URL}/file={audio_path}"
                                        
                                        elapsed = time.time() - start_time
                                        
                                        print(f"\n🎧 생성 완료!")
                                        print(f"   - 소요 시간: {elapsed:.1f}초")
                                        print(f"   - 다운로드 URL:")
                                        print(f"     {audio_url}")
                                        print(f"\n💡 브라우저에서 직접 들어보세요:")
                                        print(f"   {BASE_URL}")
                                        
                                        return audio_url
                                    else:
                                        print(f"\n⚠️  예상치 못한 응답 형식:")
                                        print(json.dumps(output_data, indent=2))
                                        return None
                                
                                print("\n⚠️  출력 데이터가 비어있습니다")
                                return None
                            
                            # 에러 확인
                            if data.get("msg") == "process_failed":
                                print(f"\n❌ 생성 실패: {data.get('error', 'Unknown error')}")
                                return None
                        
                        except json.JSONDecodeError:
                            continue
                
                time.sleep(1)
                
                # 타임아웃 (5분)
                if time.time() - start_time > 300:
                    print("\n⏱️  타임아웃 (5분)")
                    return None
            
            except requests.exceptions.RequestException as e:
                print(f"\n⚠️  연결 오류: {e}")
                time.sleep(2)
                continue
    
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    print("\n🎼 ACE-Step 1.5로 Chill Lo-Fi Hip Hop 만들기")
    print("=" * 70)
    
    audio_url = generate_music()
    
    print("\n" + "=" * 70)
    if audio_url:
        print("✅ 성공!")
    else:
        print("❌ 실패")
    print("=" * 70)
