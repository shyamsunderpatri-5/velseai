import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DiscoverPageClient } from "@/components/jobs/DiscoverPageClient";
import type { UserJobPreferences } from "@/types/jobs";

/**
 * Job Discovery Page (/dashboard/jobs/discover)
 *
 * Shows recently opened jobs from TheirStack, filtered by user preferences.
 * User can filter by location + skills, add to tracker with one click.
 */

export default async function DiscoverPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Load user's job preferences (to pre-fill filters)
  const { data: prefs } = await supabase
    .from("user_job_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Check if user has a resume (for match scoring)
  const { count: resumeCount } = await supabase
    .from("resumes")
    .select("id", { count: "exact" })
    .eq("user_id", user.id);

  return (
    <Suspense>
      <DiscoverPageClient
        preferences={(prefs as UserJobPreferences) || null}
        hasResume={(resumeCount || 0) > 0}
      />
    </Suspense>
  );
}
