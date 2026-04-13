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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">
            Welcome back, {profile?.full_name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your job search
          </p>
        </div>
        <Link href="/resume/new">
          <Button className="bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Resume
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resumes</p>
                <p className="text-2xl font-bold">{stats.totalResumes}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jobs Tracked</p>
                <p className="text-2xl font-bold">{stats.totalJobs}</p>
              </div>
              <Briefcase className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-2xl font-bold">{stats.applicationsSubmitted}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg ATS Score</p>
                <p className="text-2xl font-bold">
                  {stats.avgAtsScore ? `${stats.avgAtsScore}%` : "—"}
                </p>
              </div>
              <Target className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/ats-checker">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium">Check ATS Score</h3>
                  <p className="text-sm text-muted-foreground">Free, no signup needed</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/resume/new">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-navy/10 text-navy flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium">Build Resume</h3>
                  <p className="text-sm text-muted-foreground">AI-powered builder</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/jobs">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 text-success flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium">Track Jobs</h3>
                  <p className="text-sm text-muted-foreground">Kanban board tracker</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Resumes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Recent Resumes</h2>
          <Link href="/resume" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        {resumes && resumes.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((resume) => (
              <Link key={resume.id} href={`/resume/${resume.id}`}>
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-16 rounded bg-muted flex items-center justify-center">
                        <FileText className="w-6 h-6 text-muted-foreground" />
                      </div>
                      {resume.last_ats_score && (
                        <Badge
                          variant={
                            resume.last_ats_score >= 75
                              ? "success"
                              : resume.last_ats_score >= 50
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {resume.last_ats_score}%
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-medium truncate">{resume.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {resume.target_role || "No target role"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-2">No resumes yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first ATS-optimized resume
              </p>
              <Link href="/resume/new">
                <Button size="sm" className="bg-accent hover:bg-accent/90">
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Usage Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {aiUsage} / {maxAiUsage} uses
                </span>
                <span className="text-muted-foreground">
                  {Math.round((aiUsage / maxAiUsage) * 100)}%
                </span>
              </div>
              <Progress value={(aiUsage / maxAiUsage) * 100} className="h-2" />
            </div>
            {profile?.plan === "free" && (
              <p className="text-sm text-muted-foreground">
                Upgrade to Pro for unlimited AI uses
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-gradient-to-r from-navy/5 to-transparent border-navy/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-navy/10 text-navy flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Pro Tip: ATS Optimization</h3>
              <p className="text-sm text-muted-foreground">
                Resumes with 80%+ ATS score get 3x more interview calls. Run an ATS check on
                your resume and add the missing keywords to improve your match rate.
              </p>
              <Link href="/ats-checker">
                <Button variant="link" size="sm" className="px-0 mt-2">
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
