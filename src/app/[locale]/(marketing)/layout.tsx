import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "VELSEAI - AI ATS Resume Builder for India",
    template: "%s | VELSEAI",
  },
  description:
    "Beat the ATS filter and land your dream job. VELSEAI's AI-powered resume builder helps Indian job seekers create ATS-optimized resumes that get interviews.",
  keywords: [
    "ATS resume checker",
    "resume builder India",
    "ATS optimized resume",
    "Naukri resume format",
    "job resume builder",
    "AI resume writer",
  ],
  authors: [{ name: "VELSEAI" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://velseai.com",
    siteName: "VELSEAI",
    title: "VELSEAI - AI ATS Resume Builder for India",
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

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
