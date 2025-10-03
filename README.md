##  Link Saver (my-link-share)

Link Saver는 사용자가 웹에서 발견한 유용한 링크를 저장하고, 태그를 이용해 관리하며, 필요에 따라 다른 사람과 쉽게 공유할 수 있도록 돕는 풀스택 웹 애플리케이션입니다.

https://share-link.joonghopark-gemchat.com/

## 주요 기능

소셜 로그인: Google 계정을 이용한 간편하고 안전한 사용자 인증

링크 저장 및 관리: 웹 페이지의 URL과 관련 정보를 저장하는 기능

태그 시스템: 저장된 링크를 태그별로 분류하여 쉽게 검색 및 관리

## 기술 스택

Frontend
Framework: Next.js (React)

Styling: (프로젝트에 사용된 CSS 프레임워크나 라이브러리를 기입하세요, 예: Tailwind CSS, Emotion 등)

Backend
Framework: Next.js API Routes, Node.js (Express 등)

Database ORM: Prisma

Authentication: NextAuth.js (Google OAuth 2.0 Provider)

Deployment & Infrastructure
Server OS: Rocky Linux 9.6

Web Server: Nginx (Reverse Proxy)

Process Manager: PM2 (또는 다른 Node.js 프로세스 관리 도구)

SSL/TLS: Let's Encrypt (Certbot을 통한 와일드카드 인증서)

DNS & CDN: Cloudflare

##시작하기

Repository 클론:

```bash
git clone https://github.com/pjhpoi66/my-link-share.git
```
의존성 설치:

```bash
npm install
```
데이터베이스 마이그레이션
```bash
npx prisma migrate dev
````

환경 변수 설정:
프로젝트 루트에 .env.local 파일을 생성하고 아래 내용을 추가합니다. 이 주소는 로컬에서 실행 중인 백엔드 API 서버를 가리켜야 합니다.

NEXT_PUBLIC_API_URL=http://localhost:8081

개발 서버 실행:

```bash
npm run dev
```

애플리케이션 접속:
브라우저를 열고 http://localhost:3000 주소로 접속합니다.

# 환경변수
Database
DATABASE_URL="[Production 데이터베이스 연결 URL]"

NextAuth.js
NEXTAUTH_URL="https://joonghopark-gemchat.com"
NEXTAUTH_SECRET="[프로덕션용으로 생성한 강력한 시크릿 키]"

Google OAuth
GOOGLE_CLIENT_ID="[프로덕션용 Google 클라이언트 ID]"
GOOGLE_CLIENT_SECRET="[프로덕션용 Google 클라이언트 시크릿]"

기타 필요한 환경 변수
NODE_ENV=production