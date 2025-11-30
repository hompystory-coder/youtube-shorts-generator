// Cloudflare Pages Function: POST /api/crawl/blog
// Enhanced version with relaxed image filtering
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

    // 네이버 블로그인 경우 PostView URL로 변환
    let contentUrl = url;
    if (url.includes('blog.naver.com')) {
      console.log('📝 네이버 블로그 감지, PostView URL로 변환 중...');
      
      // URL 패턴: https://blog.naver.com/{blogId}/{logNo}
      const blogMatch = url.match(/blog\.naver\.com\/([^\/]+)\/(\d+)/);
      if (blogMatch) {
        const blogId = blogMatch[1];
        const logNo = blogMatch[2];
        contentUrl = `https://blog.naver.com/PostView.naver?blogId=${blogId}&logNo=${logNo}`;
        console.log('✅ PostView URL 생성:', contentUrl);
      }
    }

    // 실제 콘텐츠 페이지 가져오기
    const response = await fetch(contentUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    const html = await response.text();

    // 이미지 추출
    const images = [];
    const imagePatterns = [
      /<img[^>]+src=["']([^"']+)["']/gi,
      /<img[^>]+data-lazy-src=["']([^"']+)["']/gi,
      /https?:\/\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp)/gi,
    ];

    const foundUrls = new Set();

    for (const pattern of imagePatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const imageUrl = match[1] || match[0];
        
        // 상대 URL을 절대 URL로 변환
        let fullUrl = imageUrl;
        if (!imageUrl.startsWith('http')) {
          try {
            const urlObj = new URL(contentUrl);
            if (imageUrl.startsWith('//')) {
              fullUrl = 'https:' + imageUrl;
            } else if (imageUrl.startsWith('/')) {
              fullUrl = `${urlObj.origin}${imageUrl}`;
            } else {
              fullUrl = `${urlObj.origin}/${imageUrl}`;
            }
          } catch (e) {
            continue;
          }
        }

        // 제외 패턴 (UI 요소만)
        const excludePatterns = [
          'icon', 'logo', 'avatar', 'profile',
          'emoticon', 'sticker', 'banner',
          '_s.jpg', '_t.jpg', // 썸네일
          '.gif', // GIF
        ];
        
        const shouldExclude = excludePatterns.some(pattern => 
          fullUrl.toLowerCase().includes(pattern.toLowerCase())
        );
        
        // 이미지 크기 필터 (너무 작은 이미지 제외)
        const hasSizeInfo = fullUrl.match(/w(\d+)/);
        const isSmallImage = hasSizeInfo && parseInt(hasSizeInfo[1]) < 200;
        
        // 조건: 제외 패턴 아니고, 작은 이미지 아니고, 중복 아님
        if (!shouldExclude && !isSmallImage && !foundUrls.has(fullUrl)) {
          foundUrls.add(fullUrl);
          images.push({
            url: fullUrl,
            alt: '',
            index: images.length
          });
        }
      }
    }

    // 텍스트 추출
    const paragraphs = [];
    const textPatterns = [
      /<p[^>]*>(.*?)<\/p>/gi,
      /<div[^>]*class=["'][^"']*se-text[^"']*["'][^>]*>(.*?)<\/div>/gi,
    ];

    for (const pattern of textPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const text = match[1]
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .trim();
        
        if (text.length > 20) {
          paragraphs.push(text);
        }
      }
    }

    // 중복 제거
    const uniqueParagraphs = [...new Set(paragraphs)];

    // 제목 추출
    const titlePatterns = [
      /<title[^>]*>(.*?)<\/title>/i,
      /<h1[^>]*>(.*?)<\/h1>/i,
    ];

    let title = 'Untitled';
    for (const pattern of titlePatterns) {
      const match = html.match(pattern);
      if (match) {
        title = match[1].replace(/<[^>]+>/g, '').trim();
        if (title && title !== 'Untitled') break;
      }
    }

    console.log(`✅ 크롤링 완료: ${images.length}개 이미지, ${uniqueParagraphs.length}개 단락`);

    // 파트로 나누기
    const parts = images.slice(0, 8).map((img, index) => ({
      id: `part_${Date.now()}_${index}`,
      index: index,
      image: img.url,
      text: uniqueParagraphs[index] || uniqueParagraphs[0] || title,
      selected: false
    }));

    return new Response(JSON.stringify({
      success: true,
      data: {
        title: title,
        url: url,
        images: images.slice(0, 20),
        parts: parts,
        totalImages: images.length,
        totalParagraphs: uniqueParagraphs.length
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
