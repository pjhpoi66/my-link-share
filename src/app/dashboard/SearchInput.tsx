'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// --- 아이콘 컴포넌트 ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;

export default function SearchInput() {
  const router = useRouter();
  // URL의 쿼리 파라미터를 읽기 위한 훅
  const searchParams = useSearchParams();
  // URL에서 'search' 쿼리 값을 가져와 초기 상태로 설정
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // URL의 검색어가 바뀔 때마다 입력창의 값도 동기화
  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedSearch = searchTerm.trim();
    if (trimmedSearch) {
      router.push(`/dashboard?search=${trimmedSearch}`);
    } else {
      router.push('/dashboard');
    }
  };

  return (
      <form onSubmit={handleSearch} className="relative w-full max-w-sm">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <SearchIcon />
        </div>
        <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="제목 또는 설명으로 검색..."
            className="w-full pl-10 pr-4 py-2 text-sm text-black bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />
      </form>
  );
}
