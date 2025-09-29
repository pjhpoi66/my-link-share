'use server';

import * as cheerio from 'cheerio';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from '@prisma/client';

export interface ScrapedData {
  title: string;
  description: string;
  image: string | null;
  url: string;
}

type ScrapeResult =
    | { success: true; data: ScrapedData }
    | { success: false; error: string };

// scrapeUrlAction 함수는 기존과 동일합니다.
export async function scrapeUrlAction(url: string): Promise<ScrapeResult> {
  if (!url) { return { success: false, error: 'URL이 제공되지 않았습니다.' }; }
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } });
    if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
    const html = await response.text();
    const $ = cheerio.load(html);
    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '제목 없음';
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '설명 없음';
    const image = $('meta[property="og:image"]').attr('content') || $('link[rel="icon"]').attr('href') || null;
    let imageUrl: string | null = image;
    if (image && !image.startsWith('http')) {
      try {
        const pageUrl = new URL(url);
        imageUrl = new URL(image, pageUrl.origin).href;
      } catch { imageUrl = null; }
    }
    const resultData: ScrapedData = { title, description, image: imageUrl, url };
    return { success: true, data: resultData };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    return { success: false, error: `정보를 가져오는 데 실패했습니다: ${errorMessage}` };
  }
}


/**
 * 스크래핑된 북마크 데이터를 데이터베이스에 저장하는 Server Action
 * @param bookmarkData - 저장할 북마크 데이터
 * @param tagsString - 쉼표로 구분된 태그 문자열 (e.g., "react, nextjs")
 * @returns Promise<{ success: boolean; error?: string }> - 저장 성공 여부
 */
export async function saveBookmarkAction(
    bookmarkData: ScrapedData,
    // 2. 태그 문자열을 파라미터로 받도록 수정합니다.
    tagsString?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  let tagNames = ['tag1', 'tag2'];

  // 3. 쉼표로 구분된 태그 문자열을 파싱하고, 공백 제거, 소문자 변환, 빈 값 필터링을 수행합니다.
  tagNames = tagsString
      ? tagsString.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0)
      : [];

  try {
    //    (하나라도 실패하면 모든 작업이 롤백되어 데이터 일관성을 보장합니다.)
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      //    Promise.all을 사용해 모든 태그 작업을 병렬로 처리하여 성능을 높입니다.
      const tagOperations = tagNames.map(name =>
          tx.tag.upsert({
            where: { name },
            update: {},
            create: { name },
          })
      );
      const tags = await Promise.all(tagOperations);

      await tx.bookmark.create({
        data: {
          title: bookmarkData.title,
          description: bookmarkData.description,
          image: bookmarkData.image,
          url: bookmarkData.url,
          userId: session.user.id,
          tags: {
            connect: tags.map(tag => ({ id: tag.id })),
          },
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to save bookmark with tags:', error);
    // 7. Prisma 에러 타입(PrismaClientKnownRequestError)을 사용하여 더 안전하게 에러를 처리합니다.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: '이미 저장된 링크입니다.' };
    }
    return { success: false, error: '북마크 저장 중 오류가 발생했습니다. ' };
  }
}

// deleteBookmarkAction 함수는 기존과 동일합니다.
export async function deleteBookmarkAction(
    bookmarkId: number
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) { return {success: false, error: '로그인이 필요합니다.'}; }
  if (!bookmarkId) { return {success: false, error: '삭제할 북마크 ID가 필요합니다.'}; }
  try {
    const bookmark = await prisma.bookmark.findUnique({ where: {id: bookmarkId}, });
    if (!bookmark) { return {success: false, error: '북마크를 찾을 수 없습니다.'}; }
    if (bookmark.userId !== session.user.id) { return {success: false, error: '삭제 권한이 없습니다.'}; }
    await prisma.bookmark.delete({ where: {id: bookmarkId}, });
    return {success: true};
  } catch (error) {
    console.error('Failed to delete bookmark:', error);
    return {success: false, error: '북마크 삭제 중 오류가 발생했습니다.'};
  }
}

