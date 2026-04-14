import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/server";
import {
  FileText,
  Plus,
  Target,
  Briefcase,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Crown,
  Calendar,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: resumes } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user?.id)
    .order("updated_at", { ascending: false })
    .limit(3);

  const { data: jobs } = await supabase
    .from("job_applications")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  const aiUsage = 0;
  const maxAiUsage = profile?.plan === "free" ? 5 : profile?.plan === "starter" ? 50 : 999;

  const stats = {
    totalResumes: resumes?.length || 0,
    totalJobs: jobs?.length || 0,
    avgAtsScore: resumes?.filter((r) => r.last_ats_score)?.length
      ? Math.round(
          resumes.reduce((sum, r) => sum + (r.last_ats_score || 0), 0) /
            resumes.filter((r) => r.last_ats_score).length
        )
      : null,
    applicationsSubmitted: jobs?.filter((j) => j.status === "applied").length || 0,
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">
            Welcome back, {profile?.full_name?.split(" ")[0] || "there"}! 👋
          </h1>
          <p className="text-zinc-400 mt-1">
            Here's what's happening with your job search
          </p>
        </div>
        <Link href="/resume/new">
          <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="w-4 h-4 mr-2" />
            Create Resume
          </Button>
        </Link>
      </div>

      {/* Stats Grid - Rezi Style */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#18181B] to-[#27272A] border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Total Resumes</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalResumes}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
              <TrendingUp className="w-3 h-3" />
              <span>Create more to increase</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#18181B] to-[#27272A] border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Jobs Tracked</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalJobs}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
              <Calendar className="w-3 h-3" />
              <span>Track every application</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#18181B] to-[#27272A] border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Applications</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.applicationsSubmitted}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
              <span>Keep applying!</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#18181B] to-[#27272A] border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Avg ATS Score</p>
                <p className={`text-3xl font-bold mt-1 ${getScoreColor(stats.avgAtsScore || 0)}`}>
                  {stats.avgAtsScore ? `${stats.avgAtsScore}%` : "—"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-purple-400">
              {stats.avgAtsScore && stats.avgAtsScore < 75 && (
                <>
                  <Zap className="w-3 h-3" />
                  <span>Improve with AI</span>
                </>
              )}
              {(!stats.avgAtsScore || stats.avgAtsScore >= 75) && (
                <span className="text-emerald-400">Great score!</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/ats-checker">
          <Card className="bg-[#18181B] border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-1 group cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Check ATS Score</h3>
                  <p className="text-sm text-zinc-500">Free, no signup needed</p>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/resume/new">
          <Card className="bg-[#18181B] border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-1 group cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Build Resume</h3>
                  <p className="text-sm text-zinc-500">AI-powered builder</p>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/jobs">
          <Card className="bg-[#18181B] border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-1 group cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Track Jobs</h3>
                  <p className="text-sm text-zinc-500">Kanban board tracker</p>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Resumes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-white">Recent Resumes</h2>
          <Link href="/resume" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            View all →
          </Link>
        </div>

        {resumes && resumes.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((resume) => (
              <Link key={resume.id} href={`/resume/${resume.id}`}>
                <Card className="bg-[#18181B] border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-1 group">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <FileText className="w-6 h-6 text-zinc-500" />
                      </div>
                      {resume.last_ats_score && (
                        <Badge
                          className={`${
                            resume.last_ats_score >= 75
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : resume.last_ats_score >= 50
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }`}
                        >
                          {resume.last_ats_score}%
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-medium text-white truncate">{resume.title}</h3>
                    <p className="text-sm text-zinc-500">
                      {resume.target_role || "No target role"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="bg-[#18181B] border-white/5">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-zinc-500" />
              </div>
              <h3 className="font-semibold text-white mb-2">No resumes yet</h3>
              <p className="text-sm text-zinc-500 mb-4">
                Create your first ATS-optimized resume
              </p>
              <Link href="/resume/new">
                <Button className="bg-gradient-to-r from-purple-600 to-violet-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Resume
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Usage (Free/Starter) */}
      {profile?.plan !== "pro" && profile?.plan !== "lifetime" && (
        <Card className="bg-gradient-to-r from-purple-600/10 to-violet-600/10 border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <Sparkles className="w-4 h-4 text-purple-400" />
              AI Credits Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">
                  {aiUsage} / {maxAiUsage} credits used
                </span>
                <span className="text-purple-400 font-medium">
                  {Math.round((aiUsage / maxAiUsage) * 100)}%
                </span>
              </div>
              <Progress 
                value={(aiUsage / maxAiUsage) * 100} 
                className="h-2 bg-zinc-800"
                style={{ 
                  '--progress-background': 'linear-gradient(90deg, #7C3AED, #A78BFA)' 
                } as React.CSSProperties}
              />
            </div>
            {profile?.plan === "free" && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">
                  Upgrade to Pro for unlimited AI credits
                </p>
                <Link href="/pricing">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Crown className="w-3 h-3 mr-1" />
                    Upgrade
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pro Tip */}
      <Card className="bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Pro Tip: ATS Optimization</h3>
              <p className="text-sm text-zinc-400">
                Resumes with 80%+ ATS score get 3x more interview calls. Run an ATS check on
                your resume and add the missing keywords to improve your match rate.
              </p>
              <Link href="/ats-checker">
                <Button variant="link" size="sm" className="px-0 mt-2 text-purple-400 hover:text-purple-300">
                  Check your ATS score now
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}