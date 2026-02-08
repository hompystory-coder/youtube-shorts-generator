#!/usr/bin/env python3
"""
ACE-Step 1.5 Sample Data 로드 데모
웹 UI에서 Sample Data 버튼을 클릭하면 어떻게 되는지 보여주기
"""
import requests
import json

BASE_URL = "https://music.neuralgrid.kr/aoto"

def demo_sample_data():
    print("=" * 70)
    print("🎵 ACE-Step 1.5 - Sample Data 로드 데모")
    print("=" * 70)
    
    print("\n[웹 UI 사용법]")
    print("1. 브라우저에서 https://music.neuralgrid.kr/aoto/ 접속")
    print("2. 상단의 'Sample Data' 버튼 클릭")
    print("3. 자동으로 예제 Tags, Lyrics, 설정이 로드됨")
    print("4. 'Text2Music' 버튼을 클릭하면 음악 생성 시작")
    
    print("\n[API로 Sample Data 확인]")
    
    # Sample Data 엔드포인트 호출
    api_url = f"{BASE_URL}/gradio_api/call/sample_data"
    
    try:
        response = requests.post(api_url, json={"data": []}, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            event_id = result.get("event_id")
            
            print(f"✅ Sample Data 요청 성공! Event ID: {event_id}")
            
            # 결과 가져오기
            status_url = f"{BASE_URL}/gradio_api/call/sample_data/{event_id}"
            status_response = requests.get(status_url, timeout=10)
            
            # SSE 응답 파싱
            lines = status_response.text.strip().split('\n')
            for line in lines:
                if line.startswith('data: '):
                    data_str = line[6:]
                    try:
                        data = json.loads(data_str)
                        
                        if data.get("msg") == "process_completed":
                            output = data.get("output", {}).get("data", [])
                            
                            if output:
                                print("\n📝 Sample Data 내용:")
                                print("-" * 70)
                                
                                # Tags
                                if len(output) > 0:
                                    tags = output[0]
                                    print(f"\n🏷️  Tags:")
                                    print(f"   {tags[:200]}...")
                                
                                # Lyrics
                                if len(output) > 1:
                                    lyrics = output[1]
                                    print(f"\n🎤 Lyrics:")
                                    lines = lyrics.split('\n')[:8]
                                    for line in lines:
                                        print(f"   {line}")
                                    print("   ...")
                                
                                # 기타 설정
                                if len(output) > 2:
                                    print(f"\n⚙️  기본 설정:")
                                    print(f"   - Infer Steps: {output[4] if len(output) > 4 else 'N/A'}")
                                    print(f"   - Guidance Scale: {output[5] if len(output) > 5 else 'N/A'}")
                                    print(f"   - Scheduler: {output[6] if len(output) > 6 else 'N/A'}")
                                
                                print("\n" + "-" * 70)
                                print("\n💡 이 예제 데이터로:")
                                print("   1. 그대로 'Text2Music' 버튼 클릭")
                                print("   2. 또는 Tags/Lyrics 수정")
                                print("   3. 또는 파라미터 조정")
                                print("   4. 생성 시작!")
                                
                                return
                    except:
                        continue
            
            print("\n⚠️  Sample Data를 파싱할 수 없습니다")
        else:
            print(f"❌ 요청 실패: {response.status_code}")
    
    except Exception as e:
        print(f"❌ 오류: {e}")
    
    print("\n" + "=" * 70)
    print("💻 직접 사용해보세요!")
    print("🌐 URL: https://music.neuralgrid.kr/aoto/")
    print("=" * 70)

if __name__ == "__main__":
    demo_sample_data()
