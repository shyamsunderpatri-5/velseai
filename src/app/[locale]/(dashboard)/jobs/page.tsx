"use client";

/**
 * Jobs Tracker Page (/dashboard/jobs)
 *
 * Server component shell → passes data to client KanbanBoard.
 * Client-side: AddJobModal, KanbanBoard, JobDetailDrawer, Table toggle.
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { JobApplication } from "@/types/jobs";
import { JobsPageClient } from "@/components/jobs/JobsPageClient";

export default async function JobsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: jobs } = await supabase
    .from("job_applications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, target_role")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(10);

  return (
    <Suspense>
      <JobsPageClient
        initialJobs={(jobs as JobApplication[]) || []}
        resumes={resumes || []}
      />
    </Suspense>
  );
}
