import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '../components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Link Saver',
  description: 'A simple app to save and share links',
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="ko">
      <body className={inter.className}>
      <AuthProvider>{children}</AuthProvider>
      </body>
      </html>
  );
}
