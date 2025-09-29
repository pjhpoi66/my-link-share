'use client';

import { useState, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { scrapeUrlAction, saveBookmarkAction, ScrapedData } from '@/app/server/action';
import toast from 'react-hot-toast';
import Image from 'next/image';

const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>;
const LoaderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>;

export default function HomePage() {
  const { status } = useSession();
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [tags, setTags] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url.trim()) { setError('URL을 입력해주세요.'); return; }
    setIsLoading(true);
    setError(null);
    setScrapedData(null);
    setTags('');
    const result = await scrapeUrlAction(url);
    if (result.success) { setScrapedData(result.data); } else { setError(result.error); }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!scrapedData) return;
    setIsSaving(true);
    setError(null);

    toast.promise(
        saveBookmarkAction(scrapedData, tags),
        {
          loading: '저장 중...',
          success: () => {
            setScrapedData(null);
            setUrl('');
            setTags(''); // 저장 성공 후 태그 입력창을 초기화합니다.
            return '북마크가 저장되었습니다!';
          },
          error: (err) => err.message || '저장에 실패했습니다.',
        }
    );

    setIsSaving(false);
  };

  return (
      <div className="flex flex-col items-center justify-center font-sans p-4 min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Link Saver</h1>
            <p className="mt-4 text-lg text-gray-600">저장하고 싶은 링크를 붙여넣으세요.</p>
          </div>

          {status === 'authenticated' ? (
              <>
                <form onSubmit={handleSubmit} className="relative mb-6">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><LinkIcon /></div>
                  <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className="w-full pl-12 pr-32 py-4 text-lg text-black bg-white border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" disabled={isLoading} />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all shadow-md disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center w-28" disabled={isLoading}>
                    {isLoading ? <LoaderIcon /> : '가져오기'}
                  </button>
                </form>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                {scrapedData && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in-up">
                      <div className="md:flex">
                        {scrapedData.image && (
                            <div className="md:flex-shrink-0 relative h-48 md:w-48 w-full">  {/* 이미지 컨테이너 수정 */}
                              <Image
                                  src={scrapedData.image}
                                  alt={scrapedData.title}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://placehold.co/300x200/E4E4E7/71717A?text=No+Image';
                                  }}
                              />
                            </div>
                        )}
                        <div className="p-8 flex flex-col justify-between flex-grow">
                          <div>
                            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{(() => { try { return new URL(scrapedData.url).hostname; } catch { return ''; } })()}</div>
                            <a href={scrapedData.url} target="_blank" rel="noopener noreferrer" className="block mt-1 text-lg leading-tight font-medium text-black hover:underline">{scrapedData.title}</a>
                            <p className="mt-2 text-gray-500">{scrapedData.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-8 pt-0">
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                          태그 (쉼표로 구분)
                        </label>
                        <input
                            type="text"
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="예: React, NextJS, Webdev"
                            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="px-8 pb-6 pt-4 flex justify-end space-x-3 bg-gray-50 rounded-b-xl border-t">
                        <button onClick={() => setScrapedData(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">취소</button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700" disabled={isSaving}>
                          {isSaving ? '저장 중...' : '저장하기'}
                        </button>
                      </div>
                    </div>
                )}
              </>
          ) : (
              <div className="text-center p-8 bg-white rounded-xl shadow-sm">
                <p className="text-gray-600">북마크를 저장하려면 먼저 로그인해주세요.</p>
              </div>
          )}
        </div>
      </div>
  );
}

