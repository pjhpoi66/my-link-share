// src/app/dashboard/BookmarkCard.tsx

'use client';

import type { Bookmark } from '@prisma/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteBookmarkAction } from '@/app/server/action'
import toast from "react-hot-toast";
import Image from 'next/image';
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z"/><path d="m10 11 2 2m-2 0 2-2"/></svg>;

interface BookmarkCardProps {
  bookmark: Bookmark;
}

export default function BookmarkCard({ bookmark }: BookmarkCardProps) {
  // 3. next/navigation의 useRouter 훅을 사용하여 라우터 객체를 가져옵니다.
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState(bookmark.image || 'https://placehold.co/300x200/E4E4E7/71717A?text=No+Image');

  const handleDelete = () => {
    toast((t) => (
        <div className="flex flex-col items-center gap-3 p-2">
          <p className="font-semibold text-center">
            &apos;<span className="font-bold text-indigo-600 truncate max-w-xs inline-block">{bookmark.title}</span>&apos;
            <br />
            북마크를 정말 삭제하시겠습니까?
          </p>
          <div className="flex gap-4">
            <button
                onClick={() => {
                  toast.dismiss(t.id);
                  performDelete();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700"
            >
              삭제
            </button>
            <button
                onClick={() => toast.dismiss(t.id)} // '취소' 버튼은 토스트를 닫기만 합니다.
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              취소
            </button>
          </div>
        </div>
    ), {
      duration: 5000, // 5초 뒤에 자동으로 닫힘
    });
  };

  const performDelete = async () => {
    setIsDeleting(true);
    setError(null);

    toast.promise(
        deleteBookmarkAction(bookmark.id),
        {
          loading: '삭제 중...',
          success: () => {
            router.refresh();
            return '북마크가 삭제되었습니다.';
          },
          error: (err) => err.message || '삭제 중 오류가 발생했습니다.',
        }
    );
  };

  return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col group relative">
        <div className="relative h-48 w-full">  {/* 이미지 컨테이너 추가 */}
          <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="block h-full">
            <Image
                src={imgSrc}
                alt={bookmark.title}
                fill
                className="object-cover"
                onError={() => {
                  setImgSrc('https://placehold.co/300x200/E4E4E7/71717A?text=No+Image');
                }}
            />
          </a>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold text-lg mb-1 truncate">
            <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
              {bookmark.title}
            </a>
          </h3>
          <p className="text-gray-500 text-sm flex-grow mb-4 line-clamp-3">
            {bookmark.description}
          </p>
          <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400 truncate">
            {(() => {
              try { return new URL(bookmark.url).hostname; } catch { return ''; }
            })()}
          </span>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Delete bookmark"
            >
              <TrashIcon />
            </button>
          </div>
        </div>
        {/* 삭제 중일 때 로딩 오버레이 표시 */}
        {isDeleting && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm text-gray-600">삭제 중...</span>
            </div>
        )}
        {/* 에러 메시지 표시 */}
        {error && <p className="text-red-500 text-xs text-center p-2">{error}</p>}
      </div>
  );
}

