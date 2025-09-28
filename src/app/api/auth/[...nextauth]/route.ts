// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

// GET과 POST 요청에 대해 동일한 핸들러를 export 합니다.
export { handler as GET, handler as POST };