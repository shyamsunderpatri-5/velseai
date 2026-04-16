import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Free ATS Resume Checker & Scanner | VELSEAI",
    template: "%s | VELSEAI",
  },
  description:
    "Free ATS Resume Checker. Instantly score your resume against job descriptions using enterprise-grade AI. Bypass filter gatekeepers and land the interview today.",
  keywords: [
    "Free ATS resume checker",
    "ATS checker",
    "resume scanner",
    "free resume score",
    "check resume for ATS",
    "online ATS scanner",
    "VELSEAI resume builder",
  ],
  authors: [{ name: "VELSEAI" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://velseai.com",
    siteName: "VELSEAI",
    title: "Free ATS Resume Checker & Scanner | VELSEAI",
    description: "Get your free ATS resume score in seconds with VELSEAI AI.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free ATS Resume Checker & Scanner | VELSEAI",
    description: "Instantly check if your resume is ATS-friendly for free.",
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

