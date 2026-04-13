import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import * as Sentry from "@sentry/nextjs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Career Roadmap Generator
 * Analyzes gaps from ATS checks and Technical Interviews to build a learning path.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch Skill Gaps from ATS Scores
    const { data: atsData } = await supabase
      .from("ats_scores")
      .select("missing_keywords")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // 2. Fetch Skill Gaps from Technical Interviews
    const { data: interviewData } = await supabase
      .from("interview_sessions")
      .select("feedback")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("updated_at", { ascending: false })
      .limit(5);

    // Flatten gaps
    const atsGaps = Array.from(new Set((atsData || []).flatMap(d => d.missing_keywords || [])));
    const interviewGaps = Array.from(new Set((interviewData || []).flatMap(d => (d.feedback as any)?.missed_technical_concepts || [])));

    const allGaps = Array.from(new Set([...atsGaps, ...interviewGaps]));

    if (allGaps.length === 0) {
      return NextResponse.json({ success: true, message: "No significant skill gaps detected yet. Keep practicing!", roadmap: [] });
    }

    // 3. Ask AI to prioritize and suggest resources for the top 5-7 gaps
    const prompt = `Analyze these technical skill gaps identified for a high-end software engineer candidate.
    GAPS: ${allGaps.join(", ")}

    Return a JSON array of objects representing a personalized roadmap.
    Schema:
    [
      {
        "skill_name": "string",
        "category": "technical" | "soft_skills" | "architecture",
        "priority": "critical" | "high" | "medium" | "low",
        "why_it_matters": "1 sentence on impact for hireability",
        "learning_resources": [
          { "title": "string", "url": "friendly name or link hint (e.g. MDN, Official Docs, Coursera)" }
        ]
      }
    ]
    Limit to top 7 most frequent or critical gaps for a North American market. Ensure resources are top-tier (official docs preferred).`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const response = JSON.parse(completion.choices[0]?.message?.content || "{\"roadmap\": []}");
    const roadmapItems = response.roadmap || response; // Handle variations in output wrapping

    // 4. Update Database (UPSERT)
    for (const item of roadmapItems) {
      await supabase
        .from("skill_roadmaps")
        .upsert({
          user_id: user.id,
          skill_name: item.skill_name,
          category: item.category,
          priority: item.priority,
          learning_resources: item.learning_resources,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "user_id, skill_name"
        });
    }

    return NextResponse.json({ success: true, roadmap: roadmapItems });
  } catch (err) {
    Sentry.captureException(err);
    console.error("[/api/ai/roadmap] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * Fetch existing roadmap
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: roadmap, error } = await supabase
      .from("skill_roadmaps")
      .select("*")
      .eq("user_id", user.id)
      .order("priority", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ roadmap });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
