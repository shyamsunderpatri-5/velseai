import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: referrals } = await supabase
      .from("profiles")
      .select("id, full_name, created_at")
      .eq("referred_by", user.id);

    const referralCount = referrals?.length || 0;
    const freeMonthsEarned = profile?.free_months_earned || 0;

    const { data: whatsappSession } = await supabase
      .from("whatsapp_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    return NextResponse.json({
      profile,
      subscriptions,
      referralCount,
      freeMonthsEarned,
      whatsappSession,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, avatarUrl, ...updates } = body;

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        full_name: fullName || undefined,
        avatar_url: avatarUrl || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}