#!/bin/bash

echo "🧪 Testing Background APIs..."
echo ""

# Test background images API
echo "📸 Testing Background Images API:"
curl -s "https://youtube-shorts-generator.pages.dev/api/background-images?userId=admin_001" \
  -H "Authorization: Bearer mock_token" | jq -r '.images[] | "  - \(.name)"'

echo ""

# Test background music API
echo "🎵 Testing Background Music API:"
curl -s "https://youtube-shorts-generator.pages.dev/api/background-music?userId=admin_001" \
  -H "Authorization: Bearer mock_token" | jq -r '.music[] | "  - \(.name) (\(.duration)s)"'

