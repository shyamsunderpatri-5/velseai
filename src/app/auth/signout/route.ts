import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    await supabase.auth.signOut();
  }

  const url = new URL(request.url);
  const host = request.headers.get("host");
  const referer = request.headers.get("referer");
  
  // Try to extract locale from referer (e.g., http://localhost:3000/en/dashboard)
  const localeMatch = referer?.match(/\/[a-z]{2}(\/|$)/);
  const locale = localeMatch ? localeMatch[0].replace(/\//g, '') : 'en';

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const redirectUrl = new URL(`/${locale}`, `${protocol}://${host}`);

  return NextResponse.redirect(redirectUrl.toString(), {
    status: 302,
  });
}
