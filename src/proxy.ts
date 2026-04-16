import createMiddleware from 'next-intl/middleware';
import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale, localeCountryMap, type Locale } from '@/i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

/**
 * Institutional Security Proxy (Next.js 16 Edition)
 * ----------------------------
 * 1. Orchestrates locale-aware routing via next-intl.
 * 2. Enforces institutional-grade session validation at the edge.
 * 3. Handles auto-redirection for authenticated vs guest users.
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Session & Cookie Sync: Essential for a reliable SSR experience
  const response = await updateSession(request);
  
  // If updateSession returned a redirect, honor it immediately
  if (response.status === 302 || response.status === 307) {
    return response;
  }

  // 2. Metadata, Static & API Pass-through
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') || // Critical: API routes are NOT locale-prefixed
    pathname.includes('/favicon') ||
    pathname.includes('/logo-') || // Whitelist branding assets
    pathname.includes('.')
  ) {
    return response;
  }

  // 3. Root Level Redirect (Geo-Aware & Session-Protected)
  if (pathname === '/') {
    // Session check for root to dashboard redirect
    const supabase = await (await import('@/lib/supabase/server')).createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const savedLocale = request.cookies.get('selvo-locale')?.value as Locale;
    const country = request.headers.get('CF-IPCountry') || '';
    const geoLocale = localeCountryMap[country];
    const targetLocale = (savedLocale && locales.includes(savedLocale)) ? savedLocale : (geoLocale || 'en');

    const targetPath = user ? `/${targetLocale}/ats-checker` : `/${targetLocale}`;
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  // 4. Multi-Locale Session Guard (Institutional Security)
  const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  if (localeMatch) {
    const locale = localeMatch[1];
    const pathWithoutLocale = pathname.replace(new RegExp(`^\\/${locale}`), '') || '/';

    const isDashboardRoute = 
      pathWithoutLocale.startsWith("/dashboard") ||
      pathWithoutLocale.startsWith("/resume") ||
      pathWithoutLocale.startsWith("/jobs") ||
      pathWithoutLocale.startsWith("/ats-checker") ||
      pathWithoutLocale.startsWith("/settings");

    const isAuthPage = pathWithoutLocale.startsWith("/auth") && !pathWithoutLocale.startsWith("/auth/signout");
    const isLandingPage = pathWithoutLocale === "/";

    // Fast-path user check
    const supabase = await (await import('@/lib/supabase/server')).createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Authenticated users visitor a landing/auth page (excluding signout) -> Force to Dashboard
    if (user && (isLandingPage || isAuthPage)) {
      return NextResponse.redirect(new URL(`/${locale}/ats-checker`, request.url));
    }

    // Guest users attempting to reach protected routes -> Force to Login
    if (!user && isDashboardRoute) {
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. Normal i18n Routing
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};