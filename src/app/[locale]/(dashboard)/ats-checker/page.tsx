import Link from "next/link";
import { Metadata } from "next";
import { ATSCheckerClient } from "./client";

export const metadata: Metadata = {
  title: 'Free ATS Score Checker — No Signup Needed | VELSEAI',
  description: 'Paste your resume and job description. Get your ATS score in 10 seconds. See exactly which keywords are missing. 100% free, no account required.',
  keywords: ['free ATS checker', 'ATS score checker', 'resume ATS score', 'ATS resume checker free', 'check resume ATS score'],
  openGraph: {
    title: 'Free ATS Score Checker — Instant Results',
    description: 'Find out if your resume will pass ATS filters. Free, no login, results in 10 seconds.',
    url: 'https://velseai.com/ats-checker',
    type: 'website',
  },
  alternates: { canonical: 'https://velseai.com/ats-checker' }
};

export default function ATSCheckerPage() {
  return <ATSCheckerClient />;
}
