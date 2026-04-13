import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const jobApplicationSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobUrl: z.string().url().optional().or(z.literal("")),
  jobDescription: z.string().optional(),
  status: z.enum(["saved", "applied", "phone_screen", "interview", "offer", "rejected", "withdrawn"]).default("saved"),
  appliedDate: z.string().optional().or(z.literal("")),
  followUpDate: z.string().optional().or(z.literal("")),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  location: z.string().optional(),
  jobType: z.string().optional(),
  notes: z.string().optional(),
  resumeId: z.string().uuid().optional(),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: jobs, error } = await supabase
      .from("job_applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
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
    const parsed = jobApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data: job, error } = await supabase
      .from("job_applications")
      .insert({
        user_id: user.id,
        company_name: parsed.data.companyName,
        job_title: parsed.data.jobTitle,
        job_url: parsed.data.jobUrl || null,
        job_description: parsed.data.jobDescription || null,
        status: parsed.data.status,
        applied_date: parsed.data.appliedDate || null,
        follow_up_date: parsed.data.followUpDate || null,
        salary_min: parsed.data.salaryMin || null,
        salary_max: parsed.data.salaryMax || null,
        location: parsed.data.location || null,
        job_type: parsed.data.jobType || null,
        notes: parsed.data.notes || null,
        resume_id: parsed.data.resumeId || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const { data: job, error } = await supabase
      .from("job_applications")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("job_applications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}