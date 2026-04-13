import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { UserJobPreferences } from "@/types/jobs";

/**
 * GET  /api/user/preferences — fetch current user's job prefs
 * POST /api/user/preferences — upsert user's job prefs
 *
 * Also accepts ?auto=true to auto-populate from latest resume JSON
 */

const prefsSchema = z.object({
  locations: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  targetRoles: z.array(z.string()).optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryCurrency: z.string().optional(),
  jobType: z
    .enum(["any", "full_time", "part_time", "contract", "remote", "hybrid"])
    .optional(),
  alertEmail: z.boolean().optional(),
  alertWhatsapp: z.boolean().optional(),
  alertFrequency: z.enum(["daily", "weekly", "never"]).optional(),
  industries: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const autoPopulate = request.nextUrl.searchParams.get("auto") === "true";

    // Fetch existing prefs
    const { data: prefs } = await supabase
      .from("user_job_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // If no prefs + auto=true, try to extract from latest resume
    if (!prefs && autoPopulate) {
      const { data: resume } = await supabase
        .from("resumes")
        .select("content, target_role, target_industry")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (resume?.content) {
        const content = resume.content as Record<string, unknown>;
        const skills = (content.skills as string[]) || [];
        const targetRole = resume.target_role || "";

        // Auto-insert default prefs from resume
        const { data: created } = await supabase
          .from("user_job_preferences")
          .insert({
            user_id: user.id,
            skills: skills.slice(0, 20),
            target_roles: targetRole ? [targetRole] : [],
            locations: ["Remote"],
            industries: resume.target_industry ? [resume.target_industry] : [],
          })
          .select()
          .single();

        return NextResponse.json({
          preferences: created,
          autoPopulated: true,
        });
      }
    }

    return NextResponse.json({ preferences: prefs || null });
  } catch (err) {
    console.error("[/api/user/preferences GET]", err);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = prefsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data: upserted, error } = await supabase
      .from("user_job_preferences")
      .upsert(
        {
          user_id: user.id,
          locations: parsed.data.locations,
          skills: parsed.data.skills,
          target_roles: parsed.data.targetRoles,
          salary_min: parsed.data.salaryMin,
          salary_max: parsed.data.salaryMax,
          salary_currency: parsed.data.salaryCurrency,
          job_type: parsed.data.jobType,
          alert_email: parsed.data.alertEmail,
          alert_whatsapp: parsed.data.alertWhatsapp,
          alert_frequency: parsed.data.alertFrequency,
          industries: parsed.data.industries,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, preferences: upserted });
  } catch (err) {
    console.error("[/api/user/preferences POST]", err);
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}
