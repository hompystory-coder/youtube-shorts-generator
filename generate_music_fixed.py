#!/usr/bin/env python3
import requests
import json
import time
import re

BASE_URL = "https://music.neuralgrid.kr/aoto"

def generate_music():
    print("=" * 70)
    print("🎵 ACE-Step 1.5 음악 생성")
    print("=" * 70)
    
    params = [
        "mp3", 60,
        "lo-fi, hip hop, chill, relaxing, jazz, piano, drums, 85 BPM, mellow",
        "[verse]\nSoft piano keys falling like rain\nGentle beats that ease the pain\n\n[chorus]\nChill vibes flowing free\nJust you and me",
        60, 15.0, "dpmpp-2m-sde", "apg", 10.0, None, 0.5, 0.0, 3.0,
        True, False, True, None, 0.0, 0.0, False, 0.5, None, "none", 1.0
    ]
    
    print(f"\n📝 Lo-Fi Hip Hop (60초, 85 BPM)")
    
    # Step 1: 요청 시작
    print("\n[1단계] 요청 시작...")
    call_url = f"{BASE_URL}/gradio_api/call/__call__"
    
    response = requests.post(call_url, json={"data": params}, timeout=10)
    
    if response.status_code != 200:
        print(f"❌ 실패: {response.status_code}")
        return None
    
    result = response.json()
    event_id = result.get("event_id")
    
    if not event_id:
        print("❌ Event ID 없음")
        return None
    
    print(f"✅ Event ID: {event_id}")
    
    # Step 2: 폴링
    print("\n[2단계] 생성 중...")
    status_url = f"{BASE_URL}/gradio_api/call/__call__/{event_id}"
    
    start_time = time.time()
    
    while True:
        try:
            status_response = requests.get(status_url, timeout=10, stream=True)
            
            for line in status_response.iter_lines():
                if not line:
                    continue
                
                line_str = line.decode('utf-8')
                
                if line_str.startswith('data: '):
                    data_json = line_str[6:].strip()
                    
                    if not data_json or data_json == "[DONE]":
                        continue
                    
                    try:
                        data = json.loads(data_json)
                        
                        # 진행률
                        if isinstance(data, dict) and "progress" in data:
                            progress = data["progress"]
                            if isinstance(progress, dict):
                                current = progress.get("current", 0)
                                total = progress.get("total", 60)
                                percent = (current / total * 100) if total > 0 else 0
                                print(f"\r⏳ {current}/{total} ({percent:.0f}%)", end="", flush=True)
                        
                        # 완료
                        if isinstance(data, dict) and data.get("msg") == "process_completed":
                            print("\n✅ 완료!")
                            
                            output = data.get("output", {})
                            if isinstance(output, dict):
                                output_data = output.get("data", [])
                                
                                if output_data and len(output_data) > 0:
                                    audio_info = output_data[0]
                                    
                                    if isinstance(audio_info, dict):
                                        path = audio_info.get("path", audio_info.get("name", ""))
                                        url = f"{BASE_URL}/file={path}"
                                        
                                        elapsed = time.time() - start_time
                                        print(f"\n🎧 생성 완료! ({elapsed:.0f}초)")
                                        print(f"\n다운로드:")
                                        print(f"{url}")
                                        print(f"\n브라우저:")
                                        print(f"{BASE_URL}")
                                        
                                        return url
                            
                            return None
                        
                        # 실패
                        if isinstance(data, dict) and data.get("msg") == "process_failed":
                            print(f"\n❌ 실패: {data.get('error', 'Unknown')}")
                            return None
                    
                    except json.JSONDecodeError:
                        continue
            
            # 타임아웃
            if time.time() - start_time > 300:
                print("\n⏱️ 타임아웃")
                return None
            
            time.sleep(0.5)
        
        except Exception as e:
            print(f"\n⚠️ 오류: {e}")
            time.sleep(2)

if __name__ == "__main__":
    generate_music()
