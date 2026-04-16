import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  
  // Locale detection: Matches /en, /en/, /en/path
  const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : 'en';
  
  // Strip locale for logic checks
  const pathWithoutLocale = localeMatch 
    ? pathname.replace(new RegExp(`^\\/${locale}`), '') || '/'
    : pathname;

  const isAuthPage = pathWithoutLocale.startsWith("/auth");
  const isLandingPage = pathWithoutLocale === "/";
  
  const isProtectedRoute =
    pathWithoutLocale.startsWith("/dashboard") ||
    pathWithoutLocale.startsWith("/resume") ||
    pathWithoutLocale.startsWith("/jobs") ||
    pathWithoutLocale.startsWith("/settings");

  // Rule 1: Redirect Guest from Protected Routes
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/auth/login`;
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Rule 2: Redirect Authenticated from Auth/Landing Pages
  if (user && (isAuthPage || isLandingPage)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
