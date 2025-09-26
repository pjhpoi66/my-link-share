// app/page.tsx

'use client';

import { useState, FormEvent } from 'react';
import { scrapeUrlAction, ScrapedData } from '@/app/server/action';

// 아이콘을 위한 간단한 SVG 컴포넌트들
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>;
const LoaderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>;
const GoogleIcon = () => <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 76.2c-27.3-26.2-63.4-42.4-105.7-42.4-84.9 0-153.2 68.3-153.2 153.2s68.3 153.2 153.2 153.2c92.8 0 135-61.2 140.8-92.6H248v-96.2h238.4c2.6 12.9 4.1 26.4 4.1 40.8z"></path></svg>;

// 임시 사용자 정보 타입을 정의합니다.
interface User {
  name: string;
  image: string;
}

export default function HomePage() {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [user, setUser] = useState<User | null>(null);

  /**
   * 폼 제출 시 실행될 함수
   * 이벤트 객체의 타입을 FormEvent로 지정합니다.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('URL을 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setScrapedData(null);

    const result = await scrapeUrlAction(url);

    // result 객체의 타입이 명확하므로 success 속성에 따라 분기 처리가 안전합니다.
    if (result.success) {
      setScrapedData(result.data);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!scrapedData) return;
    alert('저장 기능 구현 필요!\n이 데이터를 Prisma를 사용해 DB에 저장하는 Server Action을 호출합니다.');
    setScrapedData(null);
    setUrl('');
  };

  return (
      <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center font-sans p-4">
        {/* --- 상단 헤더: 로그인/사용자 정보 --- */}
        <header className="absolute top-0 right-0 p-6">
          {user ? (
              <div className="flex items-center space-x-4">
                <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full" />
                <button
                    onClick={() => setUser(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  로그아웃
                </button>
              </div>
          ) : (
              <button
                  onClick={() => setUser({ name: '홍길동', image: 'https://placehold.co/40x40/E4E4E7/71717A?text=G' })}
                  className="inline-flex items-center px-4 py-2 font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
              >
                <GoogleIcon />
                Google로 로그인
              </button>
          )}
        </header>

        <main className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Link Saver</h1>
            <p className="mt-4 text-lg text-gray-600">저장하고 싶은 링크를 붙여넣으세요.</p>
          </div>

          <form onSubmit={handleSubmit} className="relative mb-6">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <LinkIcon />
            </div>
            <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full pl-12 pr-32 py-4 text-lg bg-white border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                disabled={isLoading}
            />
            <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all shadow-md disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center w-28"
                disabled={isLoading}
            >
              {isLoading ? <LoaderIcon /> : '가져오기'}
            </button>
          </form>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          {scrapedData && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in-up">
                <div className="md:flex">
                  {scrapedData.image && (
                      <div className="md:flex-shrink-0">
                        <img
                            className="h-48 w-full object-cover md:w-48"
                            src={scrapedData.image}
                            alt={scrapedData.title}
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src='https://placehold.co/300x200/E4E4E7/71717A?text=No+Image'; }}
                        />
                      </div>
                  )}
                  <div className="p-8 flex flex-col justify-between">
                    <div>
                      {/* new URL()은 클라이언트 측에서만 사용 가능하므로, 안전하게 처리합니다. */}
                      <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                        {(() => { try { return new URL(scrapedData.url).hostname; } catch { return ''; } })()}
                      </div>
                      <a href={scrapedData.url} target="_blank" rel="noopener noreferrer" className="block mt-1 text-lg leading-tight font-medium text-black hover:underline">
                        {scrapedData.title}
                      </a>
                      <p className="mt-2 text-gray-500">
                        {scrapedData.description}
                      </p>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                          onClick={() => setScrapedData(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                      >
                        취소
                      </button>
                      <button
                          onClick={handleSave}
                          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
                      >
                        저장하기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          )}
        </main>
      </div>
  );
}
