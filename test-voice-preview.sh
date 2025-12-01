#!/bin/bash

echo "🎤 Testing Voice Preview API..."
echo ""

# Mock API keys (user needs real ones)
MINIMAX_KEY="test_key_12345"
GROUP_ID="test_group"

# Test with sample text
curl -s -X POST "https://youtube-shorts-generator.pages.dev/api/voice/preview" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "안녕하세요. 이것은 음성 미리듣기 테스트입니다.",
    "voice": "Friendly_Person",
    "apiKey": "'"$MINIMAX_KEY"'",
    "groupId": "'"$GROUP_ID"'"
  }' | jq '.'

