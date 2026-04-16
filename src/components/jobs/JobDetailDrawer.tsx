"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Target,
  FileText,
  Trash2,
  Save,
  Loader2,
  Sparkles,
  TrendingUp,
  Brain,
  Zap,
  Globe,
  Briefcase,
  Calendar,
  Clock,
} from "lucide-react";
import type { JobApplication, JobStatus } from "@/types/jobs";
import { STATUS_CONFIG } from "@/types/jobs";
import { useResumeStore } from "@/stores/resumeStore";

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
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [notes, setNotes] = useState(job?.notes || "");
  const [status, setStatus] = useState<JobStatus>(job?.status || "saved");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { resumeId } = useResumeStore();

  const handleTailorJob = async () => {
    if (!job || !resumeId) return;
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
        toast.success("Intelligence Tailored Successfully");
        router.push(`/editor?id=${data.newResumeId}`);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      toast.error("Tailoring sequence failed");
      setIsTailoring(false);
    }
  };

  const saveChanges = async () => {
    if (!job) return;
    setSaving(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: job.id, status, notes }),
      });
      const data = await res.json();
      onUpdate(data.job);
      toast.success("Intelligence Synchronized");
    } catch {
      toast.error("Sync failed");
    } finally {
      setSaving(false);
    }
  };

  const statusConf = status ? STATUS_CONFIG[status] : null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[540px] p-0 bg-[#050505] border-white/10 flex flex-col overflow-hidden">
        <AnimatePresence>
          {job && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col h-full"
            >
              {/* Cinematic Header */}
              <div className="relative p-8 pb-12 overflow-hidden border-b border-white/5">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Zap className="w-32 h-32 text-violet-500" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Briefcase className="w-4 h-4 text-violet-500" />
                    </div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Application Intelligence Card</span>
                  </div>
                  
                  <SheetTitle className="text-3xl font-black text-white tracking-tighter mb-2">
                    {job.job_title}
                  </SheetTitle>
                  <p className="text-sm font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" /> {job.company_name}
                  </p>
                </div>
              </div>

              {/* Scrollable Intelligence Feed */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                
                {/* Status Controller */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Pipeline Phase</label>
                  <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                    <SelectTrigger className="h-14 bg-white/5 border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-violet-500/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0A0B] border-white/10 rounded-2xl">
                      {Object.entries(STATUS_CONFIG).map(([key, config]: [any, any]) => (
                        <SelectItem key={key} value={key} className="text-xs font-bold py-3 text-white/60 focus:bg-white/5 focus:text-white rounded-xl mx-2 my-1">
                          <span className="mr-3">{config.emoji}</span> {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Score Intelligence */}
                {job.match_score !== null && (
                  <div className="p-6 rounded-[2rem] bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-violet-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Profile Alignment</span>
                      </div>
                      <span className="text-2xl font-black text-white tracking-tighter">{job.match_score}%</span>
                    </div>
                    
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-8">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${job.match_score}%` }}
                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                      />
                    </div>

                    {job.match_reasons && (
                      <div className="space-y-4">
                        {job.match_reasons.slice(0, 3).map((r, i) => (
                          <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${r.impact === 'High' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <div>
                              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">{r.factor}</p>
                              <p className="text-[11px] font-medium text-white/60 leading-relaxed">{r.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Command Notes */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Campaign Notes</label>
                    <FileText className="w-3 h-3 text-white/10" />
                  </div>
                  <Textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[120px] bg-white/[0.02] border-white/5 rounded-[2rem] p-6 text-sm font-medium text-white/70 placeholder:text-white/10 focus:ring-violet-500/20"
                    placeholder="Enter recruiter insights, follow-up dates, or interview feedback..."
                  />
                </div>

                {/* Interview Strategy & Scheduling */}
                {status === 'interview' && (
                  <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Interview Protocol</span>
                      </div>
                      <Badge className="bg-amber-500/10 text-amber-500 border-none text-[8px] uppercase tracking-widest">Critical Phase</Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="relative">
                        <input 
                          type="datetime-local" 
                          className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-5 text-xs font-bold text-white focus:ring-violet-500/50 appearance-none"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline"
                        onClick={() => {
                          const title = encodeURIComponent(`Interview: ${job.job_title} at ${job.company_name}`);
                          const details = encodeURIComponent(`Career Campaign: VELSEAI Tracker\nCompany: ${job.company_name}\nStatus: ${status}`);
                          window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`, '_blank');
                        }}
                        className="w-full h-12 rounded-xl border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black font-black text-[9px] uppercase tracking-[0.2em] transition-all"
                      >
                        Add to Calendar Protocol
                      </Button>
                    </div>
                  </div>
                )}

                {/* AI Command Center */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">AI Protocol Hub</label>
                    <Sparkles className="w-3 h-3 text-violet-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={handleTailorJob}
                      disabled={isTailoring}
                      className="h-16 rounded-2xl bg-white text-black hover:bg-white/90 font-black text-[10px] uppercase tracking-widest"
                    >
                      {isTailoring ? <Loader2 className="animate-spin w-4 h-4" /> : (
                        <><Brain className="w-4 h-4 mr-2" /> Tailor Resume</>
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      className="h-16 rounded-2xl border-white/10 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 font-black text-[10px] uppercase tracking-widest"
                    >
                      <Zap className="w-4 h-4 mr-2" /> Cover Letter
                    </Button>
                  </div>
                </div>
              </div>

              {/* Kinetic Footer */}
              <div className="p-8 bg-[#080808] border-t border-white/5 flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (confirmDelete) {
                      onDelete(job.id);
                      onClose();
                    } else {
                      setConfirmDelete(true);
                      setTimeout(() => setConfirmDelete(false), 3000);
                    }
                  }}
                  className="text-red-500/40 hover:text-red-500 font-black text-[10px] uppercase tracking-widest"
                >
                  {confirmDelete ? "Execute Delete?" : "Delete Profile"}
                </Button>
                
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={onClose} className="border-white/10 text-white/40 font-black text-[10px] uppercase tracking-widest rounded-xl">
                    Cancel
                  </Button>
                  <Button 
                    onClick={saveChanges}
                    disabled={saving}
                    className="bg-violet-600 hover:bg-violet-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl px-10"
                  >
                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : "Save Changes"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
