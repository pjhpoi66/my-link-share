import 'next-auth';

declare module 'next-auth' {
  /**
   * 클라이언트와 서버 양쪽에서 사용할 수 있도록 세션 객체를 확장합니다.
   */
  interface Session {
    user: {
      id: string; // 사용자 ID를 세션 타입에 추가합니다.
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /** JWT 토큰에 id 속성을 추가합니다. */
  interface JWT {
    id: string;
  }
}