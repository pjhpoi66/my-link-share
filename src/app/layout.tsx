import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import Header from '@/components/Header';
import { Toaster } from 'react-hot-toast';

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
      <body className={`${inter.className} bg-gray-50`}>
      <AuthProvider>
        <Toaster position="bottom-center" />
        <Header />
        <main className="pt-16">
          {children}
        </main>
      </AuthProvider>
      </body>
      </html>
  );
}

