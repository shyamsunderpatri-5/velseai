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

      {/* Stats */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "50K+", label: "Resumes Analyzed" },
              { value: "3x", label: "More Interviews" },
              { value: "89%", label: "Average Score" },
              { value: "Free", label: "To Get Started" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-white mb-4">
              Everything you need to land your dream job
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Built with AI specifically for global job seekers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Target className="w-6 h-6" />,
                title: "ATS Score Checker",
                description: "Instantly analyze your resume against ATS systems. Get your score in 10 seconds.",
                color: "from-emerald-500 to-teal-500"
              },
              {
                icon: <Bot className="w-6 h-6" />,
                title: "AI Resume Builder",
                description: "Build ATS-optimized resumes with AI. Choose from 5 professional templates.",
                color: "from-violet-500 to-purple-500"
              },
              {
                icon: <Brain className="w-6 h-6" />,
                title: "AI Writing Assistant",
                description: "Generate bullet points, summaries, and cover letters that highlight your achievements.",
                color: "from-fuchsia-500 to-pink-500"
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: "5 ATS Templates",
                description: "Professional, ATS-friendly templates designed for global job markets.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Job Tracker",
                description: "Track all your applications in one place. Never miss a follow-up.",
                color: "from-amber-500 to-orange-500"
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Instant Results",
                description: "No waiting. Get detailed analysis and actionable suggestions immediately.",
                color: "from-rose-500 to-red-500"
              },
            ].map((feature, i) => (
              <Card key={i} className="bg-white/[0.02] border-white/5 hover:border-white/10 transition-all group">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 text-white`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/50 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white/[0.02]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-white mb-4">
              How it works
            </h2>
            <p className="text-white/50">Get your ATS score in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Paste your resume", description: "Upload or paste your resume text" },
              { step: "02", title: "Add job description", description: "Paste the job description you're targeting" },
              { step: "03", title: "Get your score", description: "See your ATS score and improvement tips" },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-8xl font-bold text-white/[0.03] absolute -top-4 -left-2">{item.step}</div>
                <div className="relative pt-8">
                  <h3 className="font-heading text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-white/50">{item.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-white/20">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/ats-checker">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white px-8">
                Try It Now — It's Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-white/50">Start free, upgrade when you're ready</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[{ 
                name: "Free", 
                price: "$0", 
                desc: "Perfect to get started",
                features: ["1 resume", "3 templates", "3 ATS checks/day", "5 AI uses/day"],
                cta: "Get Started",
                popular: false
              },
              { 
                name: "Starter", 
                price: "$9.99", 
                desc: "For serious job seekers",
                features: ["5 resumes", "All templates", "Unlimited ATS", "50 AI uses/day", "Job tracker"],
                cta: "Start Trial",
                popular: true
              },
              { 
                name: "Pro", 
                price: "$14.99", 
                desc: "For professionals",
                features: ["Unlimited resumes", "Everything in Starter", "Unlimited AI", "Priority support"],
                cta: "Go Pro",
                popular: false
              },
            ].map((plan, i) => (
              <Card key={i} className={`bg-white/[0.02] border ${plan.popular ? 'border-violet-500/50' : 'border-white/5'} relative`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-violet-600 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="font-heading text-xl font-semibold text-white mb-1">{plan.name}</h3>
                    <div className="text-4xl font-bold text-white mb-1">{plan.price}<span className="text-lg text-white/40">/mo</span></div>
                    <p className="text-white/50 text-sm">{plan.desc}</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-white/70 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/pricing">
                    <Button className={`w-full ${plan.popular ? 'bg-violet-600 hover:bg-violet-700' : 'bg-white/10 hover:bg-white/20'} text-white`}>
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white/[0.02]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-white mb-4">
              Loved by job seekers
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: "Priya R.", role: "Software Engineer", content: "My ATS score went from 42% to 89%. Landed 3 interviews in one week!", score: "+47 pts" },
              { name: "Rahul S.", role: "Data Analyst", content: "The keyword analysis helped me tailor my resume perfectly. Highly recommend!", score: "55% → 82%" },
              { name: "Anita M.", role: "Product Manager", content: "As a career changer, VELSEAI helped me highlight transferable skills effectively.", score: "Hired in 2 weeks" },
            ].map((t, i) => (
              <Card key={i} className="bg-white/[0.02] border-white/5">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-violet-400 text-violet-400" />)}
                  </div>
                  <p className="text-white/70 mb-4">"{t.content}"</p>
                  <div className="pt-4 border-t border-white/5">
                    <p className="font-medium text-white">{t.name}</p>
                    <p className="text-sm text-white/40">{t.role}</p>
                    <Badge className="mt-2 bg-emerald-500/20 text-emerald-400">{t.score}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0">
            <CardContent className="py-16 text-center">
              <h2 className="font-heading text-4xl font-bold text-white mb-4">
                Ready to beat the ATS?
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                Start for free. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/ats-checker">
                  <Button size="lg" className="bg-white text-violet-600 hover:bg-white/90 px-8">
                    Check Your ATS Score Free
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                    Build Your Resume
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
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