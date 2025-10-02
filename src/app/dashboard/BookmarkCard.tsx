'use client';

import type {Bookmark, Tag} from '@prisma/client';
import {FormEvent, useState} from 'react';
import {useRouter} from 'next/navigation';
import toast from 'react-hot-toast';
import {deleteBookmarkAction, updateBookmarkAction} from '@/app/server/action';
import Link from 'next/link';


const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
  <path d="m15 5 4 4"/>
</svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M3 6h18"/>
  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z"/>
  <path d="m10 11 2 2m-2 0 2-2"/>
</svg>;

interface BookmarkCardProps {
  bookmark: Bookmark & { tags: Tag[] };
}

const EditModal = ({bookmark, onClose, onSave}: {
  bookmark: Bookmark & { tags: Tag[] },
  onClose: () => void,
  onSave: (data: { title: string, description: string }, tags: string) => Promise<void>
}) => {
  const [title, setTitle] = useState(bookmark.title);
  const [description, setDescription] = useState(bookmark.description || ''); // null인 경우 빈 문자열로 처리
  const [tags, setTags] = useState(bookmark.tags.map(t => t.name).join(', '));
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({title, description}, tags);
    setIsSaving(false);
  };

  return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
           onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-fade-in-up"
             onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">북마크 수정</h3>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required
                       className="w-full px-3 py-2 text-sm text-black bg-white border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required
                          rows={3}
                          className="w-full px-3 py-2 text-sm text-black bg-white border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
              </div>
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">태그 (쉼표로 구분)</label>
                <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)}
                       placeholder="예: React, NextJS"
                       className="w-full px-3 py-2 text-sm text-black bg-white border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
            </div>
            <div className="px-6 py-4 flex justify-end space-x-3 bg-gray-50 rounded-b-lg border-t">
              <button type="button" onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">취소
              </button>
              <button type="submit" disabled={isSaving}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300">
                {isSaving ? '저장 중...' : '변경사항 저장'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}

export default function BookmarkCard({bookmark}: BookmarkCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = () => {
    toast((t) => (
        <div className="flex flex-col items-center gap-3 p-2">
          <p className="font-semibold text-center">
            &#39;<span className="font-bold text-indigo-600 truncate max-w-xs inline-block">{bookmark.title}</span>&#39;
            <br/>
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
                onClick={() => toast.dismiss(t.id)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              취소
            </button>
          </div>
        </div>
    ), {
      duration: 5000,
    });
  };

  const performDelete = async () => {
    setIsDeleting(true);
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

  const handleUpdate = async (updatedData: { title: string, description: string }, tagsString: string) => {
    await toast.promise(
        updateBookmarkAction(bookmark.id, updatedData, tagsString),
        {
          loading: '수정 중...',
          success: () => {
            setIsEditing(false); // 성공 시 모달을 닫습니다.
            router.refresh();   // 페이지를 새로고침하여 변경사항을 반영합니다.
            return '북마크가 수정되었습니다.';
          },
          error: (err) => err.message || '수정 중 오류가 발생했습니다.',
        }
    );
  };

  return (
      <>
        <div
            className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col group relative transition-shadow hover:shadow-lg">
          <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="block">
            <img
                className="h-40 w-full object-cover"
                src={bookmark.image || 'https://placehold.co/300x200/E4E4E7/71717A?text=No+Image'}
                alt={bookmark.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://placehold.co/300x200/E4E4E7/71717A?text=No+Image';
                }}
            />
          </a>
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="font-semibold text-lg mb-1 truncate">
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer"
                 className="hover:text-indigo-600 transition-colors">
                {bookmark.title}
              </a>
            </h3>
            <p className="text-gray-500 text-sm flex-grow mb-4 line-clamp-3">
              {bookmark.description}
            </p>

            {bookmark.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {bookmark.tags.map(tag => (
                      <Link
                          href={`/dashboard?tag=${tag.name}`}
                          key={tag.id}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                      >
                        #{tag.name}
                      </Link>
                  ))}
                </div>
            )}

            <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400 truncate">
              {(() => {
                try {
                  return new URL(bookmark.url).hostname;
                } catch {
                  return '';
                }
              })()}
            </span>
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setIsEditing(true)} // 수정 버튼 클릭 시 모달을 엽니다.
                    className="p-2 rounded-full text-gray-400 hover:bg-blue-50 hover:text-blue-500"
                    aria-label="Edit bookmark"
                >
                  <EditIcon/>
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                    aria-label="Delete bookmark"
                >
                  <TrashIcon/>
                </button>
              </div>
            </div>
          </div>
          {isDeleting && (<div className="absolute inset-0 bg-white/70 flex items-center justify-center"><span
              className="text-sm text-gray-600">삭제 중...</span></div>)}
        </div>

        {isEditing && (
            <EditModal
                bookmark={bookmark}
                onClose={() => setIsEditing(false)}
                onSave={handleUpdate}
            />
        )}
      </>
  );
}

