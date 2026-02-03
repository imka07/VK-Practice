import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Квизы от VK - Интерактивные квизы',
  description: 'Платформа для проведения интерактивных квизов в реальном времени',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
