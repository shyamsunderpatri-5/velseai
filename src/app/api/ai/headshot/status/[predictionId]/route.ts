import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPredictionStatus } from "@/lib/ai/headshot";

export async function GET(
  request: NextRequest,
  { params }: { params: { predictionId: string } }
) {
  try {
    const { predictionId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prediction = await getPredictionStatus(predictionId);

    // Update status in DB
    let resultUrl = null;
    if (prediction.status === "succeeded" && prediction.output) {
      // The output of PhotoMaker is usually an array of strings (URLs)
      const outputs = prediction.output as string[];
      resultUrl = outputs[0];

      // OPTIONAL: In a production environment, we should download the image from Replicate 
      // and upload it to our own Supabase bucket to ensure persistence.
      // For now, we'll use the Replicate URL and update the DB record.
      
      await supabase
        .from("headshot_generations")
        .update({ 
          status: "succeeded",
          result_url: resultUrl,
          updated_at: new Date().toISOString()
        })
        .eq("prediction_id", predictionId);
    } else if (prediction.status === "failed") {
      await supabase
        .from("headshot_generations")
        .update({ 
          status: "failed",
          updated_at: new Date().toISOString()
        })
        .eq("prediction_id", predictionId);
    }

    return NextResponse.json({ 
      status: prediction.status,
      output: resultUrl,
      error: prediction.error 
    });

  } catch (error) {
    console.error("Headshot status poll error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
