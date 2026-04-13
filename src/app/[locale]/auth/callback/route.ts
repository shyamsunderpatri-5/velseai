import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session) {
      // Ensure profile exists (fallback if trigger failed)
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (!existingProfile) {
        const userMetadata = session.user.user_metadata as Record<string, unknown> | null;
        await supabase.from("profiles").insert({
          id: session.user.id,
          email: session.user.email,
          full_name: (userMetadata?.full_name as string) || (userMetadata?.name as string) || null,
          avatar_url: (userMetadata?.avatar_url as string) || null,
        });
      }

      // Track IP address for share detection (Starter plan feature)
      const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] 
        || request.headers.get("cf-connecting-ip")
        || request.headers.get("x-real-ip")
        || null;

      if (ipAddress) {
        try {
          const { data: existingIp } = await supabase
            .from("user_ip_tracking")
            .select("id")
            .eq("user_id", session.user.id)
            .eq("ip_address", ipAddress)
            .single();

          if (!existingIp) {
            const { data: ipAccounts } = await supabase
              .from("user_ip_tracking")
              .select("user_id")
              .eq("ip_address", ipAddress);

            const uniqueAccounts = new Set(ipAccounts?.map(a => a.user_id));
            
            // Flag if 3+ accounts share same IP (suspicious)
            if (uniqueAccounts.size < 3) {
              await supabase.from("user_ip_tracking").insert({
                user_id: session.user.id,
                ip_address: ipAddress,
              });
            } else {
              console.warn(`Suspicious IP ${ipAddress} linked to ${uniqueAccounts.size} accounts`);
            }
          }
        } catch (ipError) {
          console.error("IP tracking error:", ipError);
        }
      }

      const cookies = request.headers.get("cookie") || "";
      const referralCodeMatch = cookies.match(/referral_code=([^;]+)/);
      const referralCode = referralCodeMatch ? referralCodeMatch[1] : null;

      if (referralCode) {
        try {
          const { data: referrer } = await supabase
            .from("profiles")
            .select("id")
            .eq("referral_code", referralCode)
            .single();

          if (referrer) {
            await supabase
              .from("profiles")
              .update({ referred_by: referrer.id })
              .eq("id", session.user.id);
          }
        } catch (e) {
          console.error("Error applying referral:", e);
        }

        const response = NextResponse.redirect(`${origin}${next}`);
        response.cookies.delete("referral_code");
        return response;
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`);
}
