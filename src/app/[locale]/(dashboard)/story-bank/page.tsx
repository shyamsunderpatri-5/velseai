import { createClient } from "@/lib/supabase/server";
import { StoryBankClient } from "./client";
import { redirect } from "next/navigation";

export default async function StoryBankPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: stories } = await supabase
    .from("interview_stories")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <StoryBankClient user={{ id: user.id }} initialStories={stories || []} />;
}
