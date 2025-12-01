#!/bin/bash

# Get API keys from the app
API_KEY="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiLrsJzsnqXsnqkg66eI66as7J247Iqk7YWMIiwiVXNlck5hbWUiOiLrsJzsnqXsnqkg66eI66as7J247Iqk7YWMIiwiQWNjb3VudCI6IiIsIlN1YmplY3RJRCI6IjE5NzcwNTc1NzIxMDEwNDEyODAiLCJQaG9uZSI6IjgyMDE5MDc3ODIzMjQ1IiwiR3JvdXBJRCI6IjE5NzcwNTc1NzI3MzcyNjI1MzYiLCJQYWdlTmFtZSI6IiIsIk1haWwiOiIiLCJDcmVhdGVUaW1lIjoiMjAyNC0xMi0yOCAxNjo1MjozOSIsImlzcyI6Im1pbmltYXgifQ.dAebqZKLuOPRQVz1e-FjBr8qGNJuGPrFIBzpAC_D_Yr6wFn6R1P4tZhPsROCzjb7c4F9cgTFLrYPMbW_7Hpb5UX7jCvPm9aSKLaZCHWFDe7GzK9mh0OwqPcE4yqbZL3xSMPqYVdYRGaB-LFlJN25W-SH6IQTXNVFkNgLOqLVT4EFyM_VfxNrjZ1TdTtKPLU6i-fNp-R53ZNKk7x8S0MomxkrQcOHmv6Dij-_nxsUL73oxYxBvG5cUqrS-hZhpGYGXt0wE9DssgKhBTCeFCBMNFl4iSPJYdQEXEyFfDhvuI-YtxP5SxLgHQQO6q4IFHiHfHHdqQfuDqk0SHh5cQ"
GROUP_ID="1977057572737262536"

echo "Testing Minimax TTS API..."
echo "API Key: ${API_KEY:0:20}..."
echo "Group ID: $GROUP_ID"
echo ""

curl -X POST "https://api.minimax.chat/v1/text_to_speech?GroupId=$GROUP_ID" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "speech-01-turbo",
    "text": "안녕하세요. 테스트입니다.",
    "stream": false,
    "voice_setting": {
      "voice_id": "Calm_Woman",
      "speed": 1.0,
      "vol": 1.0,
      "pitch": 0
    },
    "audio_setting": {
      "sample_rate": 24000,
      "bitrate": 128000,
      "format": "mp3"
    }
  }' 2>&1 | jq '.' || echo "Failed to parse JSON"
