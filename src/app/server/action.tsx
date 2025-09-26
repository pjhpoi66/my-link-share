// app/server/action.tsx
'use server';

import * as cheerio from 'cheerio';


// 스크래핑에 성공했을 때 반환할 데이터의 구조를 정의합니다.
export interface ScrapedData {
  title: string;
  description: string;
  image: string | null; // 이미지는 없을 수도 있으므로 null 허용
  url: string;
}

// 성공 또는 실패 시의 반환 값 타입을 명확하게 정의합니다.
type ScrapeResult =
    | { success: true; data: ScrapedData }
    | { success: false; error: string };


/**
 * URL을 받아 메타데이터를 추출하는 Server Action 함수
 * @param url - 스크래핑할 웹사이트의 URL (string)
 * @returns Promise<ScrapeResult> - 스크래핑 결과 (성공 또는 실패 객체)
 */
export async function scrapeUrlAction(url: string): Promise<ScrapeResult> {
  if (!url) {
    return { success: false, error: 'URL이 제공되지 않았습니다.' };
  }

  try {
    // 1. 제공된 URL로 fetch 요청을 보냅니다.
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 2. 응답받은 HTML 텍스트를 가져옵니다.
    const html = await response.text();
    // 3. Cheerio로 HTML을 로드합니다.
    const $ = cheerio.load(html);

    // 4. 메타 태그에서 정보를 추출합니다.
    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '제목 없음';
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '설명 없음';
    const image = $('meta[property="og:image"]').attr('content') || $('link[rel="icon"]').attr('href') || null;

    let imageUrl: string | null = image;
    if (image && !image.startsWith('http')) {
      try {
        const pageUrl = new URL(url);
        // URL 생성자를 이용해 상대 경로를 절대 경로로 안전하게 변환
        imageUrl = new URL(image, pageUrl.origin).href;
      } catch (e) {
        // url이나 image 경로가 잘못된 형식일 경우 null 처리
        imageUrl = null;
      }
    }

    // 5. 정의된 ScrapedData 타입에 맞는 객체를 생성하여 반환합니다.
    const resultData: ScrapedData = {
      title,
      description,
      image: imageUrl,
      url,
    };

    return {
      success: true,
      data: resultData,
    };

  } catch (error) {
    console.error('Scraping error:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    return { success: false, error: `정보를 가져오는 데 실패했습니다: ${errorMessage}` };
  }
}
