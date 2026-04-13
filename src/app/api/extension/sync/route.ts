import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const syncSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  description: z.string().optional(),
  url: z.string().url(),
  source: z.string().optional(),
});

/**
 * Extension Sync API
 * POST /api/extension/sync
 * 
 * Authenticated via session cookies from the main app.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please login to the VelseAI dashboard." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = syncSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid job data", details: parsed.error.flatten() }, { status: 400 });
    }

    const { title, company, location, description, url, source } = parsed.data;

    // Check if we already saved this URL
    const { data: existing } = await supabase
      .from("job_applications")
      .select("id")
      .eq("user_id", user.id)
      .eq("job_url", url)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, message: "Job already saved", id: existing.id });
    }

    // Insert new application
    const { data: job, error: insertError } = await supabase
      .from("job_applications")
      .insert({
        user_id: user.id,
        job_title: title,
        company_name: company,
        location: location,
        job_description: description,
        job_url: url,
        status: "saved",
        notes: `Captured via Chrome Extension from ${source || 'external site'}`
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, jobId: job.id });
  } catch (err: any) {
    console.error("[/api/extension/sync] Error:", err.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
