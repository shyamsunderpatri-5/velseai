import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const jobAlertSchema = z.object({
  keywords: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  frequency: z.enum(["daily", "weekly"]).optional(),
  channel: z.enum(["email", "whatsapp", "telegram"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: alerts } = await supabase
      .from("job_alerts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Job alerts GET error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
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
    const parsed = jobAlertSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    // TODO Phase 2: Integrate TheirStack / Bright Data API for job data
    // This will trigger: daily Celery worker → fetch jobs → match against user skills → send via email/WhatsApp
    
    const { data: alert, error } = await supabase
      .from("job_alerts")
      .insert({
        user_id: user.id,
        keywords: parsed.data.keywords || [],
        locations: parsed.data.locations || [],
        frequency: parsed.data.frequency || "daily",
        channel: parsed.data.channel || "email",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ alert, message: "Job alert created (Phase 2 feature coming soon)" });
  } catch (error) {
    console.error("Job alerts POST error:", error);
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get("id");

    if (!alertId) {
      return NextResponse.json({ error: "Alert ID required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("job_alerts")
      .delete()
      .eq("id", alertId)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ message: "Alert deleted" });
  } catch (error) {
    console.error("Job alerts DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 });
  }
}
