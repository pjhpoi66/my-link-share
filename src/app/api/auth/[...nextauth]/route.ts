import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth'; // 방금 만든 인증 설정 파일을 가져옵니다.

// NextAuth 함수에 인증 설정을 전달하여 핸들러를 생성합니다.
const handler = NextAuth(authOptions);

// GET과 POST 요청에 대해 동일한 핸들러를 export 합니다.
export { handler as GET, handler as POST };
