import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import BookmarkCard from './BookmarkCard';

// 이 페이지는 서버 컴포넌트입니다.
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/');
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc', // 최신순으로 정렬
    },
  });

  return (
      <div className="bg-gray-50 min-h-screen font-sans p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <main>
            {bookmarks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* 2. 기존의 복잡한 카드 UI 로직을 BookmarkCard 컴포넌트로 대체합니다. */}
                  {bookmarks.map((bookmark) => (
                      <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                  ))}
                </div>
            ) : (
                <div className="text-center p-12 bg-white rounded-xl shadow-sm">
                  <h3 className="text-xl font-medium text-gray-800">저장된 북마크가 없습니다.</h3>
                  <p className="mt-2 text-gray-500">첫 번째 북마크를 저장해보세요!</p>
                </div>
            )}
          </main>
        </div>
      </div>
  );
}

