"use client";

/**
 * KanbanBoard — Interactive client-side Kanban for the job tracker.
 *
 * Architecture decisions:
 * - Purely React state (no third-party DnD lib) for simplicity & bundle size
 * - Status changes via button menu (mobile-friendly, accessible)
 * - Optimistic updates: update UI immediately, revert on API error
 * - Framer Motion for card enter/exit animations
 * - Supabase Realtime subscription for multi-tab sync (optional)
 */

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  DollarSign,
  Calendar,
  MoreVertical,
  Target,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import type { JobApplication, JobStatus } from "@/types/jobs";
import { STATUS_CONFIG, ALL_STATUSES } from "@/types/jobs";
import { JobDetailDrawer } from "./JobDetailDrawer";
import { toast } from "react-hot-toast";

interface KanbanBoardProps {
  initialJobs: JobApplication[];
}

export function KanbanBoard({ initialJobs }: KanbanBoardProps) {
  const [jobs, setJobs] = useState<JobApplication[]>(initialJobs);
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Group jobs by status
  const jobsByStatus = ALL_STATUSES.reduce<Record<JobStatus, JobApplication[]>>(
    (acc, s) => {
      acc[s] = jobs.filter((j) => j.status === s);
      return acc;
    },
    {} as Record<JobStatus, JobApplication[]>
  );

  const handleStatusChange = useCallback(
    async (jobId: string, newStatus: JobStatus) => {
      // Optimistic update
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );

      try {
        const res = await fetch("/api/jobs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: jobId, status: newStatus }),
        });
        if (!res.ok) throw new Error("Failed to update");
        toast.success(`Moved to ${STATUS_CONFIG[newStatus].label}`);
      } catch {
        // Revert on error
        setJobs((prev) =>
          prev.map((j) =>
            j.id === jobId ? { ...j, status: jobs.find((x) => x.id === jobId)!.status } : j
          )
        );
        toast.error("Failed to update status");
      }
    },
    [jobs]
  );

  const handleUpdateJob = useCallback((updated: JobApplication) => {
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
    setSelectedJob(updated);
  }, []);

  const handleDeleteJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }, []);

  const openDetail = (job: JobApplication) => {
    setSelectedJob(job);
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-4 min-w-max">
          {ALL_STATUSES.map((status) => {
            const config = STATUS_CONFIG[status];
            const statusJobs = jobsByStatus[status];

            return (
              <div key={status} className="w-72 flex-shrink-0">
                {/* Column header */}
                <div
                  className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl border ${config.borderColor} ${config.bgColor}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{config.emoji}</span>
                    <span className={`font-semibold text-sm ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-xs font-bold px-2 ${config.bgColor} ${config.color} border ${config.borderColor}`}
                  >
                    {statusJobs.length}
                  </Badge>
                </div>

                {/* Cards */}
                <div
                  className={`min-h-[200px] rounded-b-xl border-x border-b ${config.borderColor} bg-background/50 p-2 space-y-2`}
                >
                  <AnimatePresence>
                    {statusJobs.map((job) => (
                      <KanbanCard
                        key={job.id}
                        job={job}
                        onOpen={openDetail}
                        onStatusChange={handleStatusChange}
                        currentStatus={status}
                      />
                    ))}
                  </AnimatePresence>

                  {statusJobs.length === 0 && (
                    <div className="text-center py-10 text-xs text-muted-foreground">
                      No applications here yet
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
        onUpdate={handleUpdateJob}
        onDelete={handleDeleteJob}
      />
    </>
  );
}

// ─── Individual Kanban Card ────────────────────────────────────────────────────

interface KanbanCardProps {
  job: JobApplication;
  currentStatus: JobStatus;
  onOpen: (job: JobApplication) => void;
  onStatusChange: (id: string, status: JobStatus) => void;
}

function KanbanCard({ job, currentStatus, onOpen, onStatusChange }: KanbanCardProps) {
  const nextStatuses = ALL_STATUSES.filter((s) => s !== currentStatus);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="cursor-pointer hover:shadow-md hover:border-violet-500/30 transition-all duration-200 group"
        onClick={() => onOpen(job)}
      >
        <CardContent className="p-3 space-y-2">
          {/* Title + actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-semibold text-sm truncate leading-tight">
                {job.job_title}
              </h4>
              <div className="flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">
                  {job.company_name}
                </span>
              </div>
            </div>

            {/* Action menu — prevent propagation so card click doesn't fire */}
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Move to
                  </DropdownMenuLabel>
                  {nextStatuses.map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onSelect={() => onStatusChange(job.id, s)}
                      className="text-sm"
                    >
                      <span className="mr-2">{STATUS_CONFIG[s].emoji}</span>
                      {STATUS_CONFIG[s].label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  {job.job_url && (
                    <DropdownMenuItem asChild>
                      <a
                        href={job.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Posting
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onSelect={() => onOpen(job)}
                    className="text-sm"
                  >
                    <ChevronRight className="w-3.5 h-3.5 mr-2" />
                    Open Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {job.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {job.location}
              </div>
            )}
            {job.salary_min && job.salary_max && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="w-3 h-3" />
                ${Math.round(job.salary_min / 1000)}k–${Math.round(job.salary_max / 1000)}k
              </div>
            )}
          </div>

          {/* Score badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {job.ats_score && (
              <Badge
                variant="secondary"
                className={`text-xs px-1.5 py-0.5 ${
                  job.ats_score >= 75
                    ? "bg-emerald-100 text-emerald-700"
                    : job.ats_score >= 50
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                <Target className="w-2.5 h-2.5 mr-1" />
                ATS {job.ats_score}%
              </Badge>
            )}
            {job.match_score && (
              <Badge
                variant="secondary"
                className={`text-xs px-1.5 py-0.5 ${
                  job.match_score >= 75
                    ? "bg-violet-100 text-violet-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <TrendingUp className="w-2.5 h-2.5 mr-1" />
                {job.match_score}% match
              </Badge>
            )}
          </div>

          {/* Applied date */}
          {job.applied_date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              Applied{" "}
              {new Date(job.applied_date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
