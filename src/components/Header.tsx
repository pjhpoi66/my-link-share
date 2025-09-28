'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

// --- 아이콘 컴포넌트들 ---
const LogoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>;
const GoogleIcon = () => <svg className="w-4 h-4 mr-2" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 76.2c-27.3-26.2-63.4-42.4-105.7-42.4-84.9 0-153.2 68.3-153.2 153.2s68.3 153.2 153.2 153.2c92.8 0 135-61.2 140.8-92.6H248v-96.2h238.4c2.6 12.9 4.1 26.4 4.1 40.8z"></path></svg>;

export default function Header() {
  const { data: session, status } = useSession();

  return (
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 왼쪽: 로고 */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2 text-gray-800 hover:text-indigo-600 transition-colors">
                <LogoIcon />
                <span className="font-bold text-lg">Link Saver</span>
              </Link>
            </div>

            {/* 오른쪽: 메뉴 및 인증 */}
            <div className="flex items-center space-x-4">
              {status === 'loading' ? (
                  <div className="w-24 h-8 bg-gray-200 rounded-md animate-pulse"></div>
              ) : session ? (
                  <>
                    <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">
                      내 북마크
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      로그아웃
                    </button>
                    <img src={session.user?.image!} alt={session.user?.name!} className="w-8 h-8 rounded-full" />
                  </>
              ) : (
                  <button
                      onClick={() => signIn('google', { prompt: 'select_account' })}
                      className="inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                  >
                    <GoogleIcon />
                    로그인
                  </button>
              )}
            </div>
          </div>
        </div>
      </header>
  );
}
