import createMiddleware from 'next-intl/middleware';
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale, localeCountryMap, type Locale } from '@/i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for API routes, static files, _next
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('/favicon') ||
    pathname.includes('.')
  ) {
    return await updateSession(request);
  }

  // Locale detection for root path
  if (pathname === '/') {
    const savedLocale = request.cookies.get('selvo-locale')?.value as Locale;
    if (savedLocale && locales.includes(savedLocale)) {
      return NextResponse.redirect(new URL(`/${savedLocale}`, request.url));
    }

    const country = request.headers.get('CF-IPCountry') || '';
    const geoLocale = localeCountryMap[country];
    if (geoLocale) {
      return NextResponse.redirect(new URL(`/${geoLocale}`, request.url));
    }

    const acceptLang = request.headers.get('accept-language') || '';
    const browserLang = acceptLang.split(',')[0].split('-')[0].toLowerCase() as Locale;
    if (locales.includes(browserLang)) {
      return NextResponse.redirect(new URL(`/${browserLang}`, request.url));
    }

    return NextResponse.redirect(new URL('/en', request.url));
  }

  // Auth protection for dashboard routes
  const localePattern = locales.join('|');
  const isDashboardRoute = new RegExp(`^/(${localePattern})/(dashboard|resume|jobs|settings)`).test(pathname);

  if (isDashboardRoute) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (n) => request.cookies.get(n)?.value, set: () => {}, remove: () => {} } }
    );
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const locale = pathname.split('/')[1] || defaultLocale;
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};