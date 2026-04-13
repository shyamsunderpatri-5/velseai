import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const shareDetectionSchema = z.object({
  action: z.enum(["check", "register"]),
  userId: z.string().uuid().optional(),
});

const MAX_ACCOUNTS_PER_IP = 3;
const MAX_IPS_PER_ACCOUNT = 2;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = shareDetectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { action, userId } = parsed.data;
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] 
      || request.headers.get("cf-connecting-ip")
      || "unknown";

    const supabase = await createClient();

    if (action === "register" && userId) {
      // When a user registers or first uses the app, track their IP
      const { data: existing } = await supabase
        .from("user_ip_tracking")
        .select("*")
        .eq("user_id", userId)
        .eq("ip_address", ipAddress)
        .single();

      if (!existing) {
        // Check how many accounts already use this IP
        const { data: ipAccounts } = await supabase
          .from("user_ip_tracking")
          .select("user_id")
          .eq("ip_address", ipAddress);

        const uniqueAccounts = new Set(ipAccounts?.map(a => a.user_id));
        
        if (uniqueAccounts.size >= MAX_ACCOUNTS_PER_IP) {
          return NextResponse.json({
            warning: "Suspicious: This IP is linked to multiple accounts",
            flagged: true,
          });
        }

        // Register this IP for the user
        await supabase.from("user_ip_tracking").insert({
          user_id: userId,
          ip_address: ipAddress,
          first_seen: new Date().toISOString(),
        });
      }

      // Check if user has too many IPs
      const { data: userIPs } = await supabase
        .from("user_ip_tracking")
        .select("ip_address")
        .eq("user_id", userId);

      const uniqueUserIPs = new Set(userIPs?.map(i => i.ip_address));
      
      if (uniqueUserIPs.size >= MAX_IPS_PER_ACCOUNT) {
        return NextResponse.json({
          warning: "Account linked to multiple devices/IPs",
          flagged: true,
          ips: uniqueUserIPs.size,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Share detection error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}