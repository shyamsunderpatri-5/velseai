import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createHeadshotPrediction, HeadshotStyle } from "@/lib/ai/headshot";

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, style, resumeId } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ error: "Source image URL required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Start Replicate prediction
    const prediction = await createHeadshotPrediction(imageUrl, style as HeadshotStyle);

    // Track in database
    const { error: dbError } = await supabase
      .from("headshot_generations")
      .insert({
        user_id: user.id,
        resume_id: resumeId,
        prediction_id: prediction.id,
        status: prediction.status,
        style_name: style,
        source_url: imageUrl
      });

    if (dbError) {
      console.error("Failed to track headshot generation:", dbError);
    }

    return NextResponse.json({ 
      predictionId: prediction.id,
      status: prediction.status 
    });

  } catch (error) {
    console.error("Headshot generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
