import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const usernameSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  bio: z.string().max(500).optional(),
  bioPublic: z.boolean().optional(),
});

/**
 * Claim Username / Update Bio Settings
 * POST /api/settings/username
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = usernameSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ 
        error: "Invalid input", 
        details: "Username must be 3-20 characters, alphanumeric and underscore only." 
      }, { status: 400 });
    }

    const { username, bio, bioPublic } = parsed.data;

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        username: username.toLowerCase(),
        bio,
        bio_public: bioPublic,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, profile });
  } catch (err) {
    console.error("Username update error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
