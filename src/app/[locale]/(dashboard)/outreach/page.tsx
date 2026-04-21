import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OutreachClient } from "./client";

export const metadata = {
  title: "Outreach Hub | Selvo Intelligence",
  description: "Generate high-conversion LinkedIn outreach and negotiation scripts powered by AI.",
};

export default async function OutreachPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return <OutreachClient />;
}
