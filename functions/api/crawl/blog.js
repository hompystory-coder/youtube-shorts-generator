// Cloudflare Pages Function: POST /api/crawl/blog
export async function onRequestPost(context) {
  try {
    const { request } = context;
    const { url } = await request.json();

    if (!url) {
      return new Response(JSON.stringify({
        success: false,
        error: 'URL이 필요합니다.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    console.log('🔍 크롤링 시작:', url);

    // URL에서 HTML 가져오기
    const response = await fetch(url);
    const html = await response.text();

    // 간단한 이미지 추출 (정규식 사용)
    const imageRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    const images = [];
    let match;

    while ((match = imageRegex.exec(html)) !== null) {
      const imageUrl = match[1];
      
      // 상대 URL을 절대 URL로 변환
      let fullUrl = imageUrl;
      if (!imageUrl.startsWith('http')) {
        const urlObj = new URL(url);
        if (imageUrl.startsWith('/')) {
          fullUrl = `${urlObj.origin}${imageUrl}`;
        } else {
          fullUrl = `${urlObj.origin}/${imageUrl}`;
        }
      }

      // 크기가 작은 이미지나 아이콘 제외
      if (!fullUrl.includes('icon') && 
          !fullUrl.includes('logo') && 
          !fullUrl.includes('avatar') &&
          !fullUrl.includes('btn') &&
          !fullUrl.includes('button')) {
        images.push({
          url: fullUrl,
          alt: '',
          index: images.length
        });
      }
    }

    // 텍스트 추출 (간단한 방법)
    const textRegex = /<p[^>]*>(.*?)<\/p>/gi;
    const paragraphs = [];
    while ((match = textRegex.exec(html)) !== null) {
      const text = match[1]
        .replace(/<[^>]+>/g, '') // HTML 태그 제거
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .trim();
      
      if (text.length > 20) { // 최소 길이 필터
        paragraphs.push(text);
      }
    }

    // 제목 추출
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled';

    console.log(`✅ 크롤링 완료: ${images.length}개 이미지, ${paragraphs.length}개 단락`);

    // 파트로 나누기 (이미지 수에 맞춰)
    const parts = images.slice(0, 8).map((img, index) => ({
      id: `part_${Date.now()}_${index}`,
      index: index,
      image: img.url,
      text: paragraphs[index] || paragraphs[0] || title,
      selected: false
    }));

    return new Response(JSON.stringify({
      success: true,
      data: {
        title: title,
        url: url,
        images: images.slice(0, 20), // 최대 20개
        parts: parts,
        totalImages: images.length,
        totalParagraphs: paragraphs.length
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('크롤링 오류:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '크롤링 중 오류가 발생했습니다: ' + error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
