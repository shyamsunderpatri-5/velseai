import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "VELSEAI - AI ATS Resume Builder",
    template: "%s | VELSEAI",
  },
  description:
    "Beat the ATS filter and land your dream job. VELSEAI's AI-powered resume builder helps job seekers create ATS-optimized resumes that get interviews.",
  keywords: [
    "ATS resume checker",
    "resume builder",
    "ATS optimized resume",
    "job resume builder",
    "AI resume writer",
  ],
  authors: [{ name: "VELSEAI" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://velseai.com",
    siteName: "VELSEAI",
    title: "VELSEAI - AI ATS Resume Builder",
    description: "Beat the ATS filter and land your dream job.",
  },
  twitter: {
    card: "summary_large_image",
    title: "VELSEAI - AI ATS Resume Builder",
    description: "Beat the ATS filter and land your dream job.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} profile={profile} isDashboard={false} />
      <main className="flex-1">{children}</main>
    </div>
  );
}

