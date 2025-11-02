import type React from 'react';
import type { Metadata } from 'next';
import { Orbitron } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { siteConfig } from '@/lib/config';

// Optimize font loading with display swap and preload
const orbitron = Orbitron({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-orbitron',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://honeysingh.dev';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Honey Singh - Full Stack Developer',
    template: '%s | Honey Singh',
  },
  description:
    'Personal portfolio of Honey Singh, a 21-year-old full stack developer from India with 5+ years of experience in JavaScript, TypeScript, Python, Golang, and Rust. Building innovative digital solutions across web, mobile, and blockchain.',
  keywords: [
    'developer',
    'portfolio',
    'full stack developer',
    'javascript',
    'typescript',
    'python',
    'golang',
    'rust',
    'react',
    'nextjs',
    'web developer',
    'software engineer',
    'frontend developer',
    'backend developer',
    'blockchain developer',
    'india',
  ],
  authors: [{ name: 'Honey Singh', url: siteConfig.personal.githubUrl }],
  creator: 'Honey Singh',
  publisher: 'Honey Singh',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Honey Singh - Portfolio',
    title: 'Honey Singh - Full Stack Developer',
    description:
      'Personal portfolio of Honey Singh, a 21-year-old full stack developer from India with 5+ years of experience in JavaScript, TypeScript, Python, Golang, and Rust.',
    images: [
      {
        url: `${siteUrl}/placeholder-logo.png`,
        width: 1200,
        height: 630,
        alt: 'Honey Singh - Full Stack Developer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Honey Singh - Full Stack Developer',
    description:
      'Personal portfolio of Honey Singh, a 21-year-old full stack developer from India with 5+ years of experience.',
    images: [`${siteUrl}/placeholder-logo.png`],
    creator: '@honeysinghdev',
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'technology',
  classification: 'Portfolio Website',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <Script
          src='https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js'
          strategy='afterInteractive'
        />
        <link rel='icon' href='/favicon.ico' sizes='any' />
        <link rel='icon' href='/placeholder-logo.svg' type='image/svg+xml' />
        <link rel='apple-touch-icon' href='/placeholder-logo.png' />
      </head>
      <body className={`${orbitron.className} bg-black`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className='min-h-screen'>{children}</div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
