import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JobsClient } from "./client";

export const metadata = {
  title: "Job Discovery | Selvo Intelligence",
  description: "Discover elite AI & tech roles from top portals. Track your follow-up cadence.",
};

export default async function JobsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return <JobsClient />;
}
