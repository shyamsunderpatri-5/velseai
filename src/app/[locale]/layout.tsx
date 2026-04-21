import { NextIntlClientProvider } from 'next-intl';
import { Providers } from '@/components/providers/Providers';
import { getMessages } from 'next-intl/server';
import '../globals.css';
import { notFound } from 'next/navigation';
import { locales, rtlLocales, type Locale } from '@/i18n/config';
import type { Metadata, Viewport } from 'next';
import { getTranslations } from 'next-intl/server';

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateViewport(): Promise<Viewport> {
  return {
    themeColor: '#050505',
    colorScheme: 'dark',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  
  return {
    title: { template: `%s | VELSEAI`, default: t('homeTitle') || 'VELSEAI — Enterprise AI Resume Engine' },
    description: t('homeDescription') || 'The most advanced AI-driven resume and career engine. Reach 100% ATS compatibility with cinematic intelligence.',
    applicationName: 'VELSEAI',
    authors: [{ name: 'VELSEAI Intelligence' }],
    generator: 'Next.js',
    keywords: ['AI Resume', 'ATS Checker', 'Job Hunter', 'AI Career Coach', 'Modern Resume Builder'],
    referrer: 'origin-when-cross-origin',
    keywords: ['AI Resume', 'ATS Checker', 'Job Hunter', 'AI Career Coach', 'Modern Resume Builder'],
    referrer: 'origin-when-cross-origin',
    manifest: '/manifest.json',
    alternates: {
      canonical: `https://velseai.com/${locale}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `https://velseai.com/${l}`])
      )
    },
    openGraph: {
      title: 'VELSEAI — Global Career Intelligence',
      description: 'Experience the next generation of career engineering. AI-driven resume tailoring and automated job hunting.',
      siteName: 'VELSEAI',
      url: `https://velseai.com/${locale}`,
      type: 'website',
      images: [
        {
          url: 'https://velseai.com/og-image.jpg',
          width: 1200,
          height: 630,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'VELSEAI — Elite Career AI',
      description: 'Transform your job hunt with enterprise-grade AI intelligence.',
      images: ['https://velseai.com/og-image.jpg'],
    },
    appleWebApp: {
      title: 'VELSEAI',
      statusBarStyle: 'black-translucent',
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    }
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  const messages = await getMessages({ locale });
  const isRTL = rtlLocales.includes(locale as Locale);

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}