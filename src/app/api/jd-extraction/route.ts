import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const jdExtractionSchema = z.object({
  imageUrl: z.string().url().optional(),
  imageBase64: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = jdExtractionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // TODO Phase 4: Vision AI for JD Photo Extraction
    // 
    // This feature will:
    // 1. Accept image (URL or base64) of job posting screenshot
    // 2. Use GPT-4o vision / Claude Vision to extract:
    //    - company name
    //    - job title
    //    - requirements/skills
    //    - responsibilities
    // 3. Return structured JD data
    // 4. Auto-generate tailored resume
    
    const { imageUrl, imageBase64 } = parsed.data;

    if (!imageUrl && !imageBase64) {
      return NextResponse.json({ error: "Image required" }, { status: 400 });
    }

    // Placeholder response - feature coming soon
    return NextResponse.json({
      message: "JD Photo Extraction feature coming soon!",
      status: "coming_soon",
      extracted_jd: null,
      company_name: null,
      job_title: null,
      required_skills: [],
      // TODO: When implemented:
      // const openai = new OpenAI();
      // const response = await openai.chat.completions.create({
      //   model: "gpt-4o-vision",
      //   messages: [{
      //     role: "user",
      //     content: [
      //       { type: "text", text: "Extract job details from this image" },
      //       { type: "image_url", image_url: { url: imageUrl } }
      //     ]
      //   }]
      // });
    });
  } catch (error) {
    console.error("JD extraction error:", error);
    return NextResponse.json({ error: "Failed to extract JD" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const { data: extractions } = await supabase
      .from("jd_extractions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    return NextResponse.json({ extractions });
  } catch (error) {
    console.error("JD extraction GET error:", error);
    return NextResponse.json({ error: "Failed to fetch extractions" }, { status: 500 });
  }
}
