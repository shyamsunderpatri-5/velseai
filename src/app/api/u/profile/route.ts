import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Public Profile Fetch
 * GET /api/u/profile?username=...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch profile
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, bio, bio_public")
      .eq("username", username)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Only fetch primary resume if bio is public
    if (!profile.bio_public) {
       return NextResponse.json({ profile: { bio_public: false } });
    }

    // Fetch primary resume (most recent public or just most recent)
    const { data: resume } = await supabase
      .from("resumes")
      .select("content, template_id")
      .eq("user_id", profile.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({ profile, resume });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
