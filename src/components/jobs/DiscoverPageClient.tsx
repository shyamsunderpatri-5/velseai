"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  RefreshCw,
  Loader2,
  Filter,
  Sparkles,
  Target,
  ArrowUpRight,
  Brain,
  Zap,
  Globe,
  Settings,
} from "lucide-react";
import { DiscoverJobCard } from "./DiscoverJobCard";
import type { ExternalJob, UserJobPreferences } from "@/types/jobs";
import { toast } from "react-hot-toast";
import { useResumeStore } from "@/stores/resumeStore";

interface DiscoverPageClientProps {
  preferences: UserJobPreferences | null;
  hasResume: boolean;
}

const LOCATION_PRESETS = ["Remote", "London", "San Francisco", "Bangalore", "Berlin"];

export function DiscoverPageClient({ preferences, hasResume }: DiscoverPageClientProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState<ExternalJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [location, setLocation] = useState(preferences?.locations?.[0] || "Remote");
  const [skillsInput, setSkillsInput] = useState((preferences?.skills || []).slice(0, 5).join(", "));
  const { resumeId } = useResumeStore();

  const fetchJobs = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      try {
        const skills = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
        const params = new URLSearchParams({
          location,
          ...(skills.length > 0 ? { skills: skills.join(",") } : {}),
          refresh: forceRefresh ? "true" : "false",
        });

        const res = await fetch(`/api/jobs/recent?${params.toString()}`);
        const data = await res.json();
        
        // Sort by match score for premium feel
        const sortedJobs = (data.jobs || []).sort((a: any, b: any) => (b.match_score || 0) - (a.match_score || 0));
        setJobs(sortedJobs);
      } catch (err) {
        toast.error("Failed to sync job protocol");
      } finally {
        setLoading(false);
      }
    },
    [location, skillsInput]
  );

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleTailorJob = async (job: ExternalJob) => {
    if (!resumeId) {
      toast.error("Protocol error: No master resume found");
      return;
    }

    setIsTailoring(true);
    try {
      const res = await fetch("/api/ai/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          jobId: job.id,
          jd: job.description
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Intelligence successfully tailored");
        router.push(`/editor?id=${data.newResumeId}`);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      toast.error("Tailoring sequence failed");
      setIsTailoring(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Cinematic Header & Search */}
      <div className="relative pt-10 pb-20 overflow-hidden rounded-[3rem] bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent border border-white/5">
        <div className="absolute top-0 right-0 p-10 opacity-5">
          <Globe className="w-64 h-64 animate-spin-slow" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Global Discovery Protocol</span>
          </motion.div>
          
          <h1 className="text-4xl font-black text-white tracking-tighter mb-4">
            Find your <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Elite Match</span>
          </h1>
          <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.3em] mb-12">
            Real-time AI matching across 5M+ Global opportunities
          </p>

          {/* Search Glass */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 p-2 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl">
            <div className="md:col-span-5 relative group">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-violet-500 transition-all" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location..."
                className="w-full h-14 bg-transparent pl-14 pr-4 border-0 text-sm font-bold text-white placeholder:text-white/10 focus:ring-0"
              />
            </div>
            <div className="md:col-span-5 relative group">
              <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-fuchsia-500 transition-all" />
              <input
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Skills/Roles (React, AI, Staff...)"
                className="w-full h-14 bg-transparent pl-14 pr-4 border-0 text-sm font-bold text-white placeholder:text-white/10 focus:ring-0"
              />
            </div>
            <div className="md:col-span-2">
              <Button 
                onClick={() => fetchJobs()}
                className="w-full h-14 bg-white text-black hover:bg-white/90 font-black text-[10px] uppercase tracking-widest rounded-2xl"
              >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Initiate"}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {LOCATION_PRESETS.map((loc) => (
              <button
                key={loc}
                onClick={() => { setLocation(loc); setTimeout(() => fetchJobs(), 100); }}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white hover:bg-white/10 transition-all"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Matrix */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-violet-500" />
            <h2 className="text-xs font-black text-white uppercase tracking-[0.4em]">Intelligence Feed</h2>
          </div>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
            {jobs.length} Synced results
          </p>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-[2.5rem] bg-white/[0.02] border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  className="group relative p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-violet-500/30 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-all">
                    <Sparkles className="w-24 h-24" />
                  </div>

                  <div className="relative z-10 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-violet-500/20 transition-all">
                          <Zap className="w-5 h-5 text-violet-500" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{job.company}</p>
                          <h3 className="text-sm font-black text-white leading-tight">{job.title}</h3>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg uppercase tracking-widest">
                          {job.match_score}% Fit
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-white/40 font-medium leading-relaxed line-clamp-3 mb-8">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-10">
                      {job.required_skills.slice(0, 3).map((s) => (
                        <span key={s} className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[8px] font-bold text-white/40 uppercase tracking-wider">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center gap-3">
                      <Button 
                        onClick={() => handleTailorJob(job)}
                        className="flex-1 h-12 bg-white text-black hover:bg-white/90 font-black text-[9px] uppercase tracking-widest rounded-xl"
                      >
                        <Brain className="w-3 h-3 mr-2" />
                        Tailor with AI
                      </Button>
                      <a href={job.url} target="_blank" rel="noopener" className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Tailoring Overlay */}
      <AnimatePresence>
        {isTailoring && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex items-center justify-center"
          >
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-12">
                <motion.div 
                  className="absolute inset-0 border-4 border-violet-500/20 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Loader2 className="w-32 h-32 text-violet-500 animate-spin-slow stroke-[1px]" />
                <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-fuchsia-500" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-[0.4em] mb-3">Initializing Tailoring</h3>
              <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.3em]">Mapping 23 metrics to JD Keyword matrix...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
