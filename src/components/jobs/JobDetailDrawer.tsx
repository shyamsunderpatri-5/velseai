"use client";

/**
 * JobDetailDrawer — Slide-out panel showing full details of a job application.
 * Allows editing status, notes, salary, viewing ATS score & cover letter.
 * Uses optimistic updates via the onUpdate callback.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import {
  ExternalLink,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Target,
  FileText,
  Trash2,
  Save,
  Loader2,
  Sparkles,
  ChevronDown,
  TrendingUp,
  Clock,
} from "lucide-react";
import type { JobApplication, JobStatus } from "@/types/jobs";
import { STATUS_CONFIG } from "@/types/jobs";

interface JobDetailDrawerProps {
  job: JobApplication | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (updated: JobApplication) => void;
  onDelete: (id: string) => void;
}

export function JobDetailDrawer({
  job,
  open,
  onClose,
  onUpdate,
  onDelete,
}: JobDetailDrawerProps) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notes, setNotes] = useState(job?.notes || "");
  const [status, setStatus] = useState<JobStatus>(job?.status || "saved");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync local state when job changes
  const handleJobChange = (newJob: JobApplication | null) => {
    if (newJob) {
      setNotes(newJob.notes || "");
      setStatus(newJob.status);
    }
  };

  // When job prop changes, sync state
  if (job && (notes !== (job.notes || "") || status !== job.status)) {
    handleJobChange(job);
  }

  const saveChanges = async () => {
    if (!job) return;
    setSaving(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: job.id,
          status,
          notes,
          updated_at: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      const { job: updated } = await res.json();
      onUpdate(updated);
      toast.success("Saved!");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!job) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/jobs?id=${job.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      onDelete(job.id);
      onClose();
      toast.success("Job removed from tracker");
    } catch {
      toast.error("Failed to delete job");
    } finally {
      setDeleting(false);
    }
  };

  const statusConf = status ? STATUS_CONFIG[status] : null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[520px] p-0 flex flex-col gap-0 overflow-hidden">
        {job && (
          <>
            {/* Header */}
            <div className={`p-6 ${statusConf?.bgColor || ""} border-b ${statusConf?.borderColor || ""}`}>
              <SheetHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <SheetTitle className="text-xl font-bold truncate">
                      {job.job_title}
                    </SheetTitle>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground font-medium">
                        {job.company_name}
                      </span>
                    </div>
                  </div>
                  {job.ats_score && (
                    <div className="flex-shrink-0">
                      <div
                        className={`text-center px-3 py-1.5 rounded-lg ${
                          job.ats_score >= 75
                            ? "bg-emerald-100 text-emerald-700"
                            : job.ats_score >= 50
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        <div className="text-xl font-bold">{job.ats_score}%</div>
                        <div className="text-xs">ATS Score</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap gap-3 mt-3">
                  {job.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </div>
                  )}
                  {job.salary_min && job.salary_max && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <DollarSign className="w-3.5 h-3.5" />
                      ${Math.round(job.salary_min / 1000)}k – ${Math.round(job.salary_max / 1000)}k
                    </div>
                  )}
                  {job.applied_date && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      Applied {new Date(job.applied_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Added {new Date(job.created_at).toLocaleDateString()}
                  </div>
                </div>
              </SheetHeader>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">Application Status</label>
                <Select value={status} onValueChange={(v: string) => setStatus(v as JobStatus)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saved">🔖 Saved</SelectItem>
                    <SelectItem value="applied">📤 Applied</SelectItem>
                    <SelectItem value="phone_screen">📞 Phone Screen</SelectItem>
                    <SelectItem value="interview">🎯 Interview</SelectItem>
                    <SelectItem value="offer">🎉 Offer</SelectItem>
                    <SelectItem value="rejected">❌ Rejected</SelectItem>
                    <SelectItem value="withdrawn">↩️ Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Match Score */}
              {job.match_score && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-violet-500" />
                    Resume Match Score
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${job.match_score}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          job.match_score >= 75 ? "bg-emerald-500" :
                          job.match_score >= 50 ? "bg-amber-500" : "bg-red-500"
                        }`}
                      />
                    </div>
                    <span className="font-bold text-sm">{job.match_score}%</span>
                  </div>
                  {job.match_reasons && job.match_reasons.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      {job.match_reasons.slice(0, 3).map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className={r.impact === "positive" ? "text-emerald-500" : "text-red-500"}>
                            {r.impact === "positive" ? "+" : "−"}
                          </span>
                          <span className="text-muted-foreground">{r.detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-violet-500" />
                  Notes
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Recruiter name, interview prep notes, referral contact..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Job Description preview */}
              {job.job_description && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Job Description</label>
                  <div className="bg-muted/40 rounded-lg p-3 text-sm text-muted-foreground max-h-32 overflow-y-auto">
                    {job.job_description.slice(0, 500)}
                    {job.job_description.length > 500 && "..."}
                  </div>
                </div>
              )}

              {/* External Link */}
              {job.job_url && (
                <a
                  href={job.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Original Posting
                </a>
              )}

              {/* AI Actions */}
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  AI Actions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    disabled={!job.job_description}
                    onClick={() => {
                      window.location.href = `/ats-checker?jobId=${job.id}`;
                    }}
                  >
                    <Target className="w-3.5 h-3.5 mr-1.5" />
                    Check ATS Score
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    disabled={!job.job_description}
                    onClick={() => {
                      window.location.href = `/resume?generateCoverLetter=1&jobId=${job.id}`;
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Generate Cover Letter
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex items-center justify-between gap-3 bg-background">
              <Button
                variant={confirmDelete ? "destructive" : "ghost"}
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-500 hover:text-red-600"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-1.5" />
                )}
                {confirmDelete ? "Confirm Delete" : "Delete"}
              </Button>

              <Button
                onClick={saveChanges}
                disabled={saving}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                )}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
