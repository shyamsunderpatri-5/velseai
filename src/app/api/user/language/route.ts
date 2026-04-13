import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const updateLanguageSchema = z.object({
  locale: z.enum(['en', 'es', 'pt', 'ar', 'fr', 'de', 'hi'])
});

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateLanguageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ preferred_language: parsed.data.locale })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to update language:", updateError);
      return NextResponse.json({ error: "Failed to update language" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Language update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}