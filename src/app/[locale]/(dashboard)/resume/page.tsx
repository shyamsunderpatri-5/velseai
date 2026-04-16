import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ResumeListClient } from "@/components/dashboard/ResumeListClient";

export default async function ResumeListPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: resumes, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching resumes:", error);
  }

  return <ResumeListClient initialResumes={resumes || []} />;
}
