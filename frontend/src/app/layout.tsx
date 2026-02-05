import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { ScoutWidget } from '@/features/ai-scout/components/ScoutWidget';
import { LiveAlertsProvider } from '@/features/live-ticker/context';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'StartupCompass',
    template: '%s | StartupCompass'
  },
  description: 'Discover, track, and connect with the most innovative startups worldwide',
  keywords: ['startups', 'founders', 'funding', 'venture capital', 'entrepreneurship', 'innovation'],
  authors: [{ name: 'StartupCompass Team' }],
  creator: 'StartupCompass',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://startupcompass.com',
    title: 'StartupCompass',
    description: 'Discover, track, and connect with the most innovative startups worldwide',
    siteName: 'StartupCompass',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'StartupCompass - Startup Discovery Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StartupCompass',
    description: 'Discover, track, and connect with the most innovative startups worldwide',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full antialiased`}>
        <Providers>
          <LiveAlertsProvider>
            {children}
            <ScoutWidget />
          </LiveAlertsProvider>
        </Providers>
      </body>
    </html>
  );
}
