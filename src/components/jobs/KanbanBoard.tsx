"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  MapPin,
  MoreVertical,
  Target,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Brain,
  Zap,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { JobApplication, JobStatus } from "@/types/jobs";
import { STATUS_CONFIG, ALL_STATUSES } from "@/types/jobs";
import { JobDetailDrawer } from "./JobDetailDrawer";
import { toast } from "react-hot-toast";
import { useResumeStore } from "@/stores/resumeStore";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
  initialJobs: JobApplication[];
}

export function KanbanBoard({ initialJobs }: KanbanBoardProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobApplication[]>(initialJobs);
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const { resumeId } = useResumeStore();

  const jobsByStatus = ALL_STATUSES.reduce<Record<JobStatus, JobApplication[]>>(
    (acc, s) => {
      acc[s] = jobs.filter((j) => j.status === s);
      return acc;
    },
    {} as Record<JobStatus, JobApplication[]>
  );

  const handleStatusChange = useCallback(
    async (jobId: string, newStatus: JobStatus) => {
      const originalJobs = [...jobs];
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );

      try {
        const res = await fetch("/api/jobs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: jobId, status: newStatus }),
        });
        if (!res.ok) throw new Error();
        toast.success(`Protocol: Moved to ${STATUS_CONFIG[newStatus].label}`);
      } catch {
        setJobs(originalJobs);
        toast.error("Status sync failed");
      }
    },
    [jobs]
  );

  const handleTailorJob = async (job: JobApplication) => {
    if (!resumeId) {
      toast.error("No master resume found");
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
          jd: job.job_description
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("AI Tailoring Complete");
        router.push(`/editor?id=${data.newResumeId}`);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      toast.error("Tailoring sequence failed");
      setIsTailoring(false);
    }
  };

  const openDetail = (job: JobApplication) => {
    setSelectedJob(job);
    setDrawerOpen(true);
  };

  return (
    <div className="relative">
      <div className="overflow-x-auto pb-10">
        <div className="flex gap-6 min-w-max px-4">
          {ALL_STATUSES.map((status) => {
            const config = STATUS_CONFIG[status];
            const statusJobs = jobsByStatus[status];

            return (
              <div key={status} className="w-80 flex-shrink-0">
                {/* Column header */}
                <div className="flex items-center justify-between px-4 py-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-4 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{config.emoji}</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                      {config.label}
                    </span>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                    <span className="text-[10px] font-black text-white/40">{statusJobs.length}</span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="min-h-[600px] space-y-3">
                  <AnimatePresence mode="popLayout">
                    {statusJobs.map((job) => (
                      <KanbanCard
                        key={job.id}
                        job={job}
                        onOpen={openDetail}
                        onStatusChange={handleStatusChange}
                        onTailor={handleTailorJob}
                        currentStatus={status}
                      />
                    ))}
                  </AnimatePresence>

                  {statusJobs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/[0.02] rounded-3xl">
                      <div className="w-8 h-8 rounded-full bg-white/[0.02] flex items-center justify-center mb-4">
                        <ArrowRight className="w-4 h-4 text-white/10" />
                      </div>
                      <p className="text-[9px] font-black text-white/10 uppercase tracking-widest text-center px-8">
                        Awaiting Application Protocol
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Drawer */}
      <JobDetailDrawer
        job={selectedJob}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdate={(u) => setJobs(prev => prev.map(j => j.id === u.id ? u : j))}
        onDelete={(id) => setJobs(prev => prev.filter(j => j.id !== id))}
      />

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
              <h3 className="text-lg font-black text-white uppercase tracking-[0.4em] mb-3">AI Tailoring Protocol</h3>
              <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.3em]">Transforming experience bullets for JD match...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Individual Kanban Card ────────────────────────────────────────────────────

interface KanbanCardProps {
  job: JobApplication;
  currentStatus: JobStatus;
  onOpen: (job: JobApplication) => void;
  onStatusChange: (id: string, status: JobStatus) => void;
  onTailor: (job: JobApplication) => void;
}

function KanbanCard({ job, currentStatus, onOpen, onStatusChange, onTailor }: KanbanCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      className="group relative p-5 rounded-3xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-violet-500/30 transition-all duration-300 shadow-xl"
      onClick={() => onOpen(job)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest truncate mb-1">
            {job.company_name}
          </p>
          <h4 className="text-sm font-black text-white truncate group-hover:text-violet-400 transition-colors">
            {job.job_title}
          </h4>
        </div>
        
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/5 transition-all">
                <MoreVertical className="w-3.5 h-3.5 text-white/20" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#0A0A0B] border-white/5 rounded-xl backdrop-blur-xl">
              <DropdownMenuLabel className="text-[10px] font-black text-white/20 uppercase tracking-widest px-2 py-3">Phase Transition</DropdownMenuLabel>
              {ALL_STATUSES.filter(s => s !== currentStatus).map((s) => (
                <DropdownMenuItem key={s} onSelect={() => onStatusChange(job.id, s)} className="text-[11px] font-bold text-white/60 focus:bg-white/5 focus:text-white rounded-lg mx-1 my-0.5">
                  <span className="mr-3">{STATUS_CONFIG[s].emoji}</span>
                  {STATUS_CONFIG[s].label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem onSelect={() => onOpen(job)} className="text-[11px] font-bold text-white/60 focus:bg-white/5 focus:text-white rounded-lg mx-1">
                <Zap className="w-3.5 h-3.5 mr-3 text-amber-500" /> Full Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 h-6 px-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
            <Target className="w-3 h-3" />
            {job.match_score || 0}% Fit
          </div>
          {job.salary_min && (
            <span className="text-[10px] font-black text-white/20 uppercase tracking-tighter">
              ${Math.round(job.salary_min / 1000)}K+
            </span>
          )}
        </div>

        {currentStatus === "saved" && (
          <Button 
            onClick={(e) => { e.stopPropagation(); onTailor(job); }}
            className="w-full h-10 bg-violet-600 hover:bg-violet-700 text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg shadow-violet-600/20 border border-violet-500/30"
          >
            <Brain className="w-3 h-3 mr-2" />
            Tailor with AI
          </Button>
        )}
      </div>

      {/* Decorative pulse for high matches */}
      {(job.match_score || 0) > 85 && (
        <div className="absolute inset-0 border border-violet-500/20 rounded-3xl animate-pulse pointer-events-none" />
      )}
    </motion.div>
  );
}
