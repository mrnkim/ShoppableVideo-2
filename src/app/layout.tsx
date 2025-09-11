import './globals.css';
import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono } from 'next/font/google';


// Load Inter font with Latin subset for better performance
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Load IBM Plex Mono for time indicators
const ibmPlexMono = IBM_Plex_Mono({
  weight: '500',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ibm-plex-mono',
});

export const metadata: Metadata = {
  title: 'Shoppable Video Platform',
  description: 'Discover and purchase products directly from videos without interrupting playback',
  keywords: 'shoppable video, video commerce, AI product detection, TwelveLabs',
  authors: [{ name: 'Shoppable Video Demo' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable} h-full`}>
      <body className="h-full bg-zinc-100">
          <main className="h-full mx-auto p-6">
            {children}
          </main>
      </body>
    </html>
  );
}
