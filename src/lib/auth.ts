import { PrismaAdapter } from '@auth/prisma-adapter';
import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import prisma from './prisma';

export const authOptions: AuthOptions = {
  // Prisma를 사용하여 세션 정보를 데이터베이스에 저장하도록 어댑터를 설정합니다.
  adapter: PrismaAdapter(prisma),
  // 사용할 인증 제공업체 목록
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  // 세션 관리 전략을 'jwt'로 설정합니다.
  session: {
    strategy: 'jwt',
  },
  // JWT 콜백: 세션에 사용자 ID를 포함시킵니다.
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // 세션 콜백: 클라이언트에서 접근할 수 있는 세션 객체에 사용자 ID를 추가합니다.
    async session({ session, token }) {
      if (session.user) {
        (session.user).id = token.id;
      }
      return session;
    },
  },
  // Next-Auth에서 생성하는 페이지들의 경로를 설정할 수 있습니다. (옵션)
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
    verifyRequest: '/',
    newUser: '/',
  },
};
