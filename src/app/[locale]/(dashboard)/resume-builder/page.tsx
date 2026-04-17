import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ResumeBuilderFlow } from "@/components/resume-builder/ResumeBuilderFlow";

export const metadata = {
  title: "VelseAI | Optimized Resume Builder",
  description: "AI-Powered targeted resume synthesizer.",
};

export default async function ResumeBuilderPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // Fetch the user's latest ATS Scan to extract their context
  const { data: latestScore } = await supabase
    .from("ats_scores")
    .select("resume_text, job_description, missing_keywords, company_name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!latestScore || !latestScore.resume_text) {
    // If they haven't run a scan yet, force them back to ATS Checker
    return redirect("/ats-checker");
  }

  // Check Subscription Status
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const isPro = profile?.plan !== "free";

  return (
    <div className="flex-1 w-full p-4 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight">
            Optimization Engine
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Reconstructing your documentation to conquer Applicant Tracking Systems.
          </p>
        </div>

        <ResumeBuilderFlow 
          rawResumeText={latestScore.resume_text}
          jobDescription={latestScore.job_description}
          missingKeywords={latestScore.missing_keywords || []}
          companyName={latestScore.company_name}
          isPro={isPro}
        />

      </div>
    </div>
  );
}
