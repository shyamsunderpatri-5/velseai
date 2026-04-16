import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { InterviewSessionClient } from "@/components/interviews/InterviewSessionClient";

interface InterviewPageProps {
  params: {
    id: string;
    locale: string;
  };
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch session details
  const { data: session, error } = await supabase
    .from("interview_sessions")
    .select("*, interview_messages(*)")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !session) {
    return notFound();
  }

  // Map messages to simpler format for client
  const messages = (session.interview_messages || [])
    .filter((m: any) => m.role !== "system")
    .map((m: any) => ({
      role: m.role,
      content: m.content
    }));

  return (
    <div className="max-w-6xl mx-auto py-8">
      <InterviewSessionClient 
        sessionId={params.id}
        initialMessages={messages}
        session={session}
      />
    </div>
  );
}
