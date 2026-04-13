"use client";

/**
 * JobsPageClient — Interactive client shell for Job Tracker.
 * Manages: AddJobModal, view toggle (kanban/table), stats.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  LayoutGrid,
  List,
  ExternalLink,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { AddJobModal } from "./AddJobModal";
import { KanbanBoard } from "./KanbanBoard";
import type { JobApplication } from "@/types/jobs";

interface JobsPageClientProps {
  initialJobs: JobApplication[];
  resumes: { id: string; title: string; target_role: string | null }[];
}

export function JobsPageClient({ initialJobs, resumes }: JobsPageClientProps) {
  const [jobs, setJobs] = useState<JobApplication[]>(initialJobs);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [view, setView] = useState<"kanban" | "table">("kanban");

  const handleJobAdded = (job: JobApplication) => {
    setJobs((prev) => [job, ...prev]);
  };

  const stats = {
    total: jobs.length,
    applied: jobs.filter((j) => j.status === "applied").length,
    interviews: jobs.filter(
      (j) => j.status === "interview" || j.status === "phone_screen"
    ).length,
    offers: jobs.filter((j) => j.status === "offer").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Job Tracker</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Track every application from saved to offer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="jobs/discover">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Search className="w-4 h-4" />
              Discover Jobs
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 bg-violet-100 text-violet-700"
              >
                New
              </Badge>
            </Button>
          </Link>
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5"
            onClick={() => setAddModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Job
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Briefcase, color: "text-slate-600" },
          { label: "Applied", value: stats.applied, icon: Building2, color: "text-blue-600" },
          { label: "Interviews", value: stats.interviews, icon: Calendar, color: "text-amber-600" },
          { label: "Offers 🎉", value: stats.offers, icon: DollarSign, color: "text-emerald-600" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-0.5">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-7 h-7 ${stat.color} opacity-60`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={view === "kanban" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => setView("kanban")}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Kanban
          </Button>
          <Button
            variant={view === "table" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => setView("table")}
          >
            <List className="w-3.5 h-3.5" />
            Table
          </Button>
        </div>

        {jobs.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {jobs.length} application{jobs.length !== 1 ? "s" : ""} tracked
          </p>
        )}
      </div>

      {/* Board / Table */}
      {jobs.length === 0 ? (
        <EmptyState onAdd={() => setAddModalOpen(true)} />
      ) : view === "kanban" ? (
        <KanbanBoard initialJobs={jobs} />
      ) : (
        <JobsTable jobs={jobs} />
      )}

      {/* Add Job Modal */}
      <AddJobModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleJobAdded}
      />
    </div>
  );
}

// ─── Table View ───────────────────────────────────────────────────────────────

function JobsTable({ jobs }: { jobs: JobApplication[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            {["Company", "Role", "Location", "Status", "Applied", "ATS"].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                {h}
              </th>
            ))}
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {jobs.map((job, i) => (
            <motion.tr
              key={job.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="border-b last:border-0 hover:bg-muted/30 transition-colors"
            >
              <td className="px-4 py-3 font-medium">{job.company_name}</td>
              <td className="px-4 py-3 text-muted-foreground">{job.job_title}</td>
              <td className="px-4 py-3 text-muted-foreground">{job.location || "—"}</td>
              <td className="px-4 py-3">
                <Badge variant="secondary" className="text-xs capitalize">
                  {job.status.replace("_", " ")}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs">
                {job.applied_date
                  ? new Date(job.applied_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })
                  : "—"}
              </td>
              <td className="px-4 py-3">
                {job.ats_score ? (
                  <span
                    className={`font-bold text-xs ${
                      job.ats_score >= 75
                        ? "text-emerald-600"
                        : job.ats_score >= 50
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    {job.ats_score}%
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {job.job_url && (
                  <a
                    href={job.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Card>
      <CardContent className="py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-violet-600" />
        </div>
        <h3 className="font-semibold text-lg mb-2">No applications tracked yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm">
          Add jobs manually, or discover new openings and add them in one click.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button
            onClick={onAdd}
            className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Your First Job
          </Button>
          <Link href="jobs/discover">
            <Button variant="outline" className="gap-1.5">
              <Search className="w-4 h-4" />
              Discover Jobs
            </Button>
          </Link>
        </div>
        <div className="mt-8 p-4 bg-violet-50 dark:bg-violet-950/30 rounded-xl max-w-sm mx-auto">
          <div className="flex items-center gap-2 text-sm text-violet-700 dark:text-violet-300 font-medium">
            <Sparkles className="w-4 h-4" />
            Pro Tip
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Send a photo of any job posting to our WhatsApp bot — it'll automatically extract the JD and add it to your tracker!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
