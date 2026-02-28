import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'School App - Sistem Informasi Kelas',
  description: 'Aplikasi manajemen kelas digital',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
