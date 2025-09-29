import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import BookmarkCard from './BookmarkCard';
import SearchInput from './SearchInput';
import { unstable_noStore as noStore } from 'next/cache';
import { Prisma } from "@prisma/client";

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
                                             searchParams,
                                           }: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  noStore();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/');
  }

  const params = await searchParams;
  const searchTerm = typeof params?.search === 'string' ? params.search : undefined;

  const whereClause: Prisma.BookmarkWhereInput = {
    userId: session.user.id,
    // searchTerm이 존재할 경우에만 OR 조건을 추가합니다.
    ...(searchTerm && {
      OR: [
        { title: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } }, // 제목 검색 (대소문자 무시)
        { description: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } }, // 설명 검색 (대소문자 무시)
      ],
    }),
  };


  const bookmarks = await prisma.bookmark.findMany({
    where: whereClause, // 동적으로 생성된 where 조건을 사용합니다.
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
      <div className="font-sans p-4 sm:p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">내 북마크</h1>
            <p className="mt-1 text-gray-600">
              {searchTerm
                  ? `${bookmarks.length}개의 검색 결과`
                  : `${bookmarks.length}개의 링크가 저장되어 있습니다.`}
            </p>
          </div>

          <div className="mb-8">
            <SearchInput />
          </div>

          <main>
            {bookmarks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookmarks.map((bookmark) => (
                      <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                  ))}
                </div>
            ) : (
                <div className="text-center p-12 bg-white rounded-xl shadow-sm">
                  <h3 className="text-xl font-medium text-gray-800">
                    {searchTerm ? '검색 결과가 없습니다.' : '저장된 북마크가 없습니다.'}
                  </h3>
                  <p className="mt-2 text-gray-500">
                    {searchTerm ? '다른 키워드로 검색해보세요.' : '첫 번째 북마크를 저장해보세요!'}
                  </p>
                </div>
            )}
          </main>
        </div>
      </div>
  );
}

