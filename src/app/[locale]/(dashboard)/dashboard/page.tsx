"use client";

import * as React from "react";
import { ScoreTrendChart } from "@/components/dashboard/ScoreTrendChart";
import { ReferralCard } from "@/components/dashboard/ReferralCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  Plus, 
  FileText, 
  Briefcase, 
  CheckCircle2, 
  Target, 
  TrendingUp, 
  Brain, 
  ArrowRight, 
  Sparkles, 
  Crown,
  Zap
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const [data, setData] = React.useState<any>({
    resumes: [],
    jobs: [],
    profile: null,
    loading: true
  });

  const supabase = createClient();

  React.useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [resumesRes, jobsRes, profileRes] = await Promise.all([
        supabase.from("resumes").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(5),
        supabase.from("job_applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("profiles").select("*").eq("id", user.id).single()
      ]);

      setData({
        resumes: resumesRes.data || [],
        jobs: jobsRes.data || [],
        profile: profileRes.data,
        loading: false
      });
    }
    fetchData();
  }, [supabase]);

  if (data.loading) {
    return (
      <div className="flex flex-col gap-10">
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/4 rounded-2xl" />
          <Skeleton className="h-4 w-1/3 rounded-lg" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[220px] rounded-[2rem]" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-full min-h-[100px] rounded-2xl" />)}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Skeleton className="h-32 rounded-[2rem]" />
              <Skeleton className="h-32 rounded-[2rem]" />
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-40 rounded-[2rem]" />
            <Skeleton className="h-48 rounded-[2rem]" />
          </div>
        </div>
      </div>
    );
  }

  const { resumes, jobs, profile } = data;

  const stats = {
    totalResumes: resumes?.length || 0,
    totalJobs: jobs?.length || 0,
    avgAtsScore: resumes?.some((r: any) => r.last_ats_score)
      ? Math.round(
          resumes.reduce((sum: number, r: any) => sum + (r.last_ats_score || 0), 0) /
            resumes.filter((r: any) => r.last_ats_score).length
        )
      : null,
    applicationsSubmitted: jobs?.filter((j: any) => j.status === "applied").length || 0,
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* Header Module */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
            Intelligence <span className="text-violet-400">Velocity</span>
          </h1>
          <p className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px]">
             Tracking your career protocol efficiency in real-time.
          </p>
        </div>
        <Link href="/ats-checker">
          <Button className="h-14 px-8 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-violet-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Target className="w-5 h-5 mr-2 stroke-[3]" />
            Start New Audit
          </Button>
        </Link>
      </motion.div>

      {/* Intelligence & Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Visualization */}
        <div className="lg:col-span-2 rezi-card p-0 overflow-hidden flex flex-col min-h-[220px]">
          <div className="p-6 pb-0 flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Intelligence Velocity</h3>
              <p className="text-sm font-bold text-white mt-1">Profile Mastery Progress</p>
            </div>
            <TrendingUp className="w-4 h-4 text-violet-500" />
          </div>
          <div className="flex-1 min-h-[140px]">
            <ScoreTrendChart history={resumes[0]?.score_history || []} />
          </div>
        </div>

        {/* Rapid Stats */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Audits", value: stats.totalResumes, icon: Target, color: "text-blue-400" },
            { label: "Jobs", value: stats.totalJobs, icon: Briefcase, color: "text-amber-400" },
            { label: "Success", value: stats.applicationsSubmitted, icon: CheckCircle2, color: "text-emerald-400" },
            { label: "Avg Match", value: stats.avgAtsScore ? `${stats.avgAtsScore}%` : "—", icon: Zap, color: "text-violet-400" },
          ].map((stat, i) => (
            <div key={i} className="rezi-card p-5 group flex flex-col justify-between hover:border-violet-500/30 transition-all">
              <div className={`w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center`}>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-white tracking-tight">{stat.value}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mt-1">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content: Recent Activity */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Recent Audit Protocols</h2>
            <Link href="/ats-checker" className="text-[10px] font-black text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-[0.2em] px-2 py-1">
              New Audit →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {resumes.length > 0 ? resumes.map((resume: any) => (
              <Link key={resume.id} href={`/ats-checker`}>
                <div className="rezi-card p-5 flex items-start justify-between group h-32">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center transition-transform group-hover:scale-110">
                      <Target className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white leading-tight truncate">{resume.title}</h3>
                      <p className="text-[9px] uppercase font-black tracking-widest text-zinc-600 mt-1">
                        {resume.target_role || "GENERAL AUDIT"}
                      </p>
                    </div>
                  </div>
                  {resume.last_ats_score && (
                    <div className="flex flex-col items-end">
                      <span className={cn(
                        "text-[10px] font-black px-3 py-1.5 rounded-xl border",
                        resume.last_ats_score >= 80 ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/5" : 
                        resume.last_ats_score >= 60 ? "text-amber-400 border-amber-400/20 bg-amber-400/5" :
                        "text-red-400 border-red-400/20 bg-red-400/5"
                      )}>
                        {Math.round(resume.last_ats_score)}%
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            )) : (
              <div className="col-span-full py-12 text-center rezi-card">
                <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">No Audit Protocols Found</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar Widgets */}
        <motion.div variants={item} className="space-y-6">
          <h2 className="text-lg font-black text-white uppercase tracking-wider">Elite Protocols</h2>
          
          {/* Interview Coach Card */}
          <Link href="/interviews" className="block">
            <div className="rezi-card p-6 bg-gradient-to-br from-violet-600/20 via-transparent to-transparent border-violet-500/20 group hover:border-violet-500/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-violet-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Coach Simulator</span>
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-sm font-bold text-white mb-2">Mock Interview Session</h4>
              <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                Simulate a FAANG/SaaS interview with your latest resume protocol.
              </p>
            </div>
          </Link>

          {/* Referral Growth Card */}
          <ReferralCard 
            referralCode={profile?.referralCode || "MISSION-ALPHA"} 
            totalReferrals={0} 
            monthsEarned={profile?.freeMonthsEarned || 0}
          />

          {/* AI Usage Card */}
          <div className="rezi-card p-6 bg-gradient-to-br from-[#0C0C0E] to-[#121214]">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Neural Load</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="text-2xl font-black text-white">0%</div>
                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Daily Limit</div>
              </div>
              <Progress value={5} className="h-1 bg-zinc-900" />
              <p className="text-[9px] text-zinc-600 font-medium">
                Resets in <span className="text-white/40">12 hours</span>.
              </p>
              {profile?.plan === "free" && (
                <Link href="/pricing" className="block">
                  <Button variant="outline" className="w-full h-12 border-white/5 bg-white/5 text-white hover:bg-white hover:text-black font-black text-[10px] uppercase tracking-widest rounded-xl">
                    <Crown className="w-3.5 h-3.5 mr-2" />
                    Upgrade to Enterprise
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}