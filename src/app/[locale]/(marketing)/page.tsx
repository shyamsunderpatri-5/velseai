import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { 
  CheckCircle2, 
  Zap, 
  Target, 
  FileText, 
  Sparkles, 
  ArrowRight,
  Star,
  Users,
  Brain,
  Clock,
  BarChart3,
  Shield,
  Bot,
  TrendingUp
} from "lucide-react";

export const metadata: Metadata = {
  title: 'VELSEAI — Free ATS Resume Checker & AI Resume Builder',
  description: 'Check if your resume passes ATS filters instantly — no signup needed. Build ATS-optimized resumes with AI. Used by 10,000+ job seekers globally. Free to start.',
  keywords: ['ATS resume checker', 'resume builder', 'free ATS checker', 'ATS score checker', 'AI resume builder'],
  openGraph: {
    title: 'VELSEAI — Beat the ATS. Get the Interview.',
    description: '75% of resumes are rejected before a human reads them. Check yours free in 10 seconds.',
    url: 'https://velseai.com',
    siteName: 'VELSEAI',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'VELSEAI — Free ATS Checker', description: 'Check your ATS score free. No signup.' },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://velseai.com' }
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0D0D12] text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0D0D12]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-heading font-bold text-xl text-white">VELSEAI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/ats-checker" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              ATS Checker
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Pricing
            </Link>
            <LanguageSwitcher />
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                Log in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 px-4 py-1 mb-6">
              <Sparkles className="w-3 h-3 mr-1" />
              Free ATS Checker — No Signup Required
            </Badge>
            
            <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Your resume is </span>
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                getting rejected
              </span>
              <span className="text-white">.</span>
            </h1>
            
            <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10">
              75% of resumes never reach a human recruiter. We'll help you beat the ATS and land more interviews.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/ats-checker">
                <Button size="lg" className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white px-8">
                  Check Your ATS Score
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 px-8">
                  Build Resume with AI
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-white/40 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant results</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No signup needed</span>
              </div>
            </div>
          </div>

          {/* Hero Image / Score Demo */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="relative rounded-2xl border border-white/10 bg-[#16161D] p-8 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-2xl" />
              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Target className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-white/70">Your ATS Score</span>
                  </div>
                  <div className="text-6xl font-bold text-white">87<span className="text-2xl text-white/50">%</span></div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">
                    <TrendingUp className="w-3 h-3" />
                    Excellent match
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Keyword Match", value: "92%", color: "bg-emerald-500" },
                    { label: "Format Score", value: "85%", color: "bg-blue-500" },
                    { label: "Skills Match", value: "78%", color: "bg-violet-500" },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">{item.label}</span>
                        <span className="text-white font-medium">{item.value}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: item.value }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitor Comparison */}
      <section className="py-24 bg-white/[0.02]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-white mb-4">
              Why choose VELSEAI?
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              We offer more features at half the price of our competitors
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-white font-medium">Feature</th>
                  <th className="py-4 px-4 text-violet-400 font-medium">VELSEAI</th>
                  <th className="py-4 px-4 text-white/50 font-medium">Rezi</th>
                  <th className="py-4 px-4 text-white/50 font-medium">Teal</th>
                  <th className="py-4 px-4 text-white/50 font-medium">Kickresume</th>
                  <th className="py-4 px-4 text-white/50 font-medium">Jobscan</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 text-white">Price/month</td>
                  <td className="py-4 px-4 text-violet-400 font-bold">$9.99</td>
                  <td className="py-4 px-4 text-white/50">$29</td>
                  <td className="py-4 px-4 text-white/50">$29</td>
                  <td className="py-4 px-4 text-white/50">$19</td>
                  <td className="py-4 px-4 text-white/50">$49</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 text-white">Languages</td>
                  <td className="py-4 px-4 text-violet-400 font-bold">7</td>
                  <td className="py-4 px-4 text-white/50">1</td>
                  <td className="py-4 px-4 text-white/50">1</td>
                  <td className="py-4 px-4 text-white/50">3</td>
                  <td className="py-4 px-4 text-white/50">1</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 text-white">ATS Score Checker</td>
                  <td className="py-4 px-4 text-emerald-400">✓</td>
                  <td className="py-4 px-4 text-emerald-400">✓</td>
                  <td className="py-4 px-4 text-emerald-400">✓</td>
                  <td className="py-4 px-4 text-white/20">✗</td>
                  <td className="py-4 px-4 text-emerald-400">✓</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 text-white">AI Resume Builder</td>
                  <td className="py-4 px-4 text-emerald-400">✓</td>
                  <td className="py-4 px-4 text-emerald-400">✓</td>
                  <td className="py-4 px-4 text-emerald-400">✓</td>
                  <td className="py-4 px-4 text-emerald-400">✓</td>
                  <td className="py-4 px-4 text-white/20">✗</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 text-white">Job Tracker</td>
                  <td className="py-4 px-4 text-emerald-400">✓</td>
                  <td className="py-4 px-4 text-white/20">✗</td>
                  <td className="py-4 px-4 text-emerald-400">✓</td>
                  <td className="py-4 px-4 text-white/20">✗</td>
                  <td className="py-4 px-4 text-white/20">✗</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 text-white">DOCX Export</td>
                  <td className="py-4 px-4 text-emerald-400">✓</td>
                  <td className="py-4 px-4 text-emerald-400">✓</td>
                  <td className="py-4 px-4 text-emerald-400">✓</td>
                  <td className="py-4 px-4 text-emerald-400">✓</td>
                  <td className="py-4 px-4 text-white/20">✗</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 text-white">Cover Letter AI</td>
                  <td className="py-4 px-4 text-emerald-400">✓</td>
                  <td className="py-4 px-4 text-emerald-400">✓</td>
                  <td className="py-4 px-4 text-white/20">✗</td>
                  <td className="py-4 px-4 text-emerald-400">✓</td>
                  <td className="py-4 px-4 text-white/20">✗</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 text-white">German Lebenslauf</td>
                  <td className="py-4 px-4 text-emerald-400">✓</td>
                  <td className="py-4 px-4 text-white/20">✗</td>
                  <td className="py-4 px-4 text-white/20">✗</td>
                  <td className="py-4 px-4 text-white/20">✗</td>
                  <td className="py-4 px-4 text-white/20">✗</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 text-white">Arabic RTL</td>
                  <td className="py-4 px-4 text-emerald-400">✓</td>
                  <td className="py-4 px-4 text-white/20">✗</td>
                  <td className="py-4 px-4 text-white/20">✗</td>
                  <td className="py-4 px-4 text-white/20">✗</td>
                  <td className="py-4 px-4 text-white/20">✗</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-white">Free ATS Checker</td>
                  <td className="py-4 px-4 text-emerald-400">✓</td>
                  <td className="py-4 px-4 text-white/20">✗</td>
                  <td className="py-4 px-4 text-white/20">✗</td>
                  <td className="py-4 px-4 text-white/20">✗</td>
                  <td className="py-4 px-4 text-white/20">✗</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="font-heading font-bold text-white">VELSEAI</span>
            </div>
            <p className="text-sm text-white/30">
              © 2026 VELSEAI. Built for job seekers worldwide.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-sm text-white/30 hover:text-white">Privacy</Link>
              <Link href="/terms" className="text-sm text-white/30 hover:text-white">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}