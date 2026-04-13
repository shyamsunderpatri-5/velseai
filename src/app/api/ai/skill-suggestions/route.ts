import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/ai";

const skillSchema = z.object({
  currentSkills: z.array(z.string()).optional(),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(100, "Job description is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = skillSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentSkills, jobTitle, jobDescription } = parsed.data;
    const currentSkillsText = currentSkills?.join(", ") || "None listed";

    const prompt = `Based on the following job, suggest relevant technical and soft skills that the candidate should highlight:

Job Title: ${jobTitle}

Job Description:
${jobDescription}

Current Skills: ${currentSkillsText}

Return a JSON response with this structure:
{
  "suggestions": [
    {
      "skill": "skill name",
      "reason": "why this skill is important for this role",
      "priority": "high/medium/low"
    }
  ],
  "missingSkills": ["skill1", "skill2", "skill3"],
  "matchingSkills": ["skill1", "skill2"]
}

Focus on:
- Technical skills (programming languages, frameworks, tools)
- Soft skills (communication, leadership, problem-solving)
- Industry-specific certifications
- Prioritize skills explicitly mentioned in the job description
Return ONLY valid JSON.`;

    const suggestions = await generateText(prompt);

    if (!suggestions) {
      return NextResponse.json({ error: "Failed to generate skill suggestions" }, { status: 500 });
    }

    // Parse JSON from response
    let parsedSuggestions;
    try {
      // Try to extract JSON from the response
      const jsonMatch = suggestions.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedSuggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      // Return raw text if JSON parsing fails
      return NextResponse.json({ success: true, suggestions: suggestions });
    }

    // Track usage
    await supabase.from("ai_usage").insert({
      user_id: user.id,
      feature: "skill_suggestions",
      model_used: "ollama/openai",
    });

    return NextResponse.json({ success: true, ...parsedSuggestions });
  } catch (error) {
    console.error("Skill suggestions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}