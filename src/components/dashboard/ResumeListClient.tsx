"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  MoreVertical, 
  Trash2, 
  Copy, 
  Edit3, 
  Plus, 
  Zap,
  Target,
  Calendar,
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Resume {
  id: string;
  title: string;
  target_role: string | null;
  last_ats_score: number | null;
  updated_at: string;
  template_id: string;
  content: any;
  settings: any;
}

interface ResumeListClientProps {
  initialResumes: Resume[];
}

export function ResumeListClient({ initialResumes }: ResumeListClientProps) {
  const router = useRouter();
  const [resumes, setResumes] = React.useState<Resume[]>(initialResumes);
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume? This action cannot be undone.")) return;
    
    setIsProcessing(id);
    const supabase = createClient();
    
    const { error } = await supabase
      .from("resumes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting resume:", error);
      alert("Failed to delete resume");
    } else {
      setResumes((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    }
    setIsProcessing(null);
  };

  const handleDuplicate = async (resume: Resume) => {
    setIsProcessing(resume.id);
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: newResume, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: `${resume.title} (Copy)`,
        template_id: resume.template_id,
        target_role: resume.target_role,
        content: resume.content,
        settings: resume.settings,
        last_ats_score: resume.last_ats_score,
      })
      .select()
      .single();

    if (error) {
      console.error("Error duplicating resume:", error);
      alert("Failed to duplicate resume");
    } else {
      setResumes((prev) => [newResume, ...prev]);
      router.refresh();
    }
    setIsProcessing(null);
  };

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

  return (
    <div className="space-y-10">
      {/* Header Module */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">My Resumes</h1>
          <p className="text-zinc-500 font-medium mt-2">
            Managing <span className="text-violet-400 font-bold">{resumes.length}</span> active career intelligence assets.
          </p>
        </div>
        <Link href="/resume/new">
          <Button className="h-14 px-8 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-violet-600/20 transition-all hover:scale-[1.02] active:scale-98">
            <Plus className="w-5 h-5 mr-2 stroke-[3]" />
            Create Intelligence Asset
          </Button>
        </Link>
      </div>

      {resumes.length > 0 ? (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {resumes.map((resume) => (
              <motion.div
                key={resume.id}
                variants={item}
                layout
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[24px] pointer-events-none" />
                
                <div className="relative p-6 bg-[#1A1C26] border border-[#2D313F] rounded-[24px] hover:border-violet-500/30 transition-all duration-300 shadow-xl group-hover:shadow-violet-600/5">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#0F0F12] border border-[#2D313F] flex items-center justify-center group-hover:border-violet-500/20 transition-all">
                        <FileText className="w-7 h-7 text-zinc-600 group-hover:text-violet-400 transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white truncate text-lg leading-tight group-hover:text-violet-400 transition-colors">
                          {resume.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Target className="w-3.5 h-3.5 text-zinc-600" />
                          <p className="text-xs font-semibold text-zinc-500 truncate uppercase tracking-wider">
                            {resume.target_role || "No Target Intelligence"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-600 hover:text-white hover:bg-white/5 rounded-xl">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 bg-[#1A1C26] border-[#2D313F] text-white rounded-xl shadow-2xl">
                        <DropdownMenuItem 
                          asChild
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer focus:bg-white/5 focus:text-violet-400"
                        >
                          <Link href={`/resume/${resume.id}`}>
                            <Edit3 className="w-4 h-4" />
                            <span className="font-bold text-xs uppercase tracking-widest">Edit Layout</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDuplicate(resume)}
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer focus:bg-white/5 focus:text-violet-400"
                        >
                          <Copy className="w-4 h-4" />
                          <span className="font-bold text-xs uppercase tracking-widest">Clone Asset</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[#2D313F]" />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(resume.id)}
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer text-rose-500 focus:bg-rose-500/10 focus:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="font-bold text-xs uppercase tracking-widest">Purge Asset</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Intelligence Score Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-violet-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">ATS Signal Depth</span>
                      </div>
                      {resume.last_ats_score !== null ? (
                        <div className={cn(
                          "px-3 py-1 rounded-lg text-[11px] font-black tracking-widest uppercase border",
                          resume.last_ats_score >= 85 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                            : resume.last_ats_score >= 70 
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        )}>
                          {resume.last_ats_score}% Match
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-lg text-[11px] font-black tracking-widest uppercase bg-zinc-800 text-zinc-500 border border-zinc-700/50">
                          Inactive
                        </div>
                      )}
                    </div>

                    {/* Progress Bar for Score */}
                    <div className="h-1.5 w-full bg-[#0F0F12] rounded-full overflow-hidden border border-[#2D313F]/50">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${resume.last_ats_score || 0}%` }}
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          (resume.last_ats_score || 0) >= 85 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
                          (resume.last_ats_score || 0) >= 70 ? "bg-amber-500" : "bg-rose-500"
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#2D313F]">
                    <div className="flex items-center gap-2.5 text-zinc-600">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Refreshed {new Date(resume.updated_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    
                    <Link href={`/resume/${resume.id}`}>
                      <Button size="sm" className="h-9 px-5 bg-white/5 hover:bg-violet-600 hover:text-white border border-[#2D313F] text-zinc-400 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all">
                        {isProcessing === resume.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          "Open Workspace"
                        )}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Create New Interactive Card */}
          <motion.div variants={item}>
            <Link href="/resume/new" className="block h-full group">
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-8 bg-transparent border-2 border-dashed border-[#2D313F] rounded-[24px] group-hover:border-violet-500/50 group-hover:bg-violet-600/5 transition-all duration-300">
                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                  <Plus className="w-8 h-8 text-zinc-600 group-hover:text-white transition-colors stroke-[2.5]" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">New Intelligence</h3>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-2 group-hover:text-zinc-400 transition-colors">
                  Deploy Career Asset
                </p>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-[#1A1C26] border border-[#2D313F] rounded-[32px] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
          <div className="w-24 h-24 rounded-[32px] bg-[#0F0F12] border border-[#2D313F] flex items-center justify-center mb-8 shadow-2xl">
            <AlertCircle className="w-10 h-10 text-zinc-800" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">Zero Intelligence Assets Detected</h3>
          <p className="text-zinc-500 font-medium mt-3 max-w-sm mx-auto leading-relaxed">
            Your career command center is idle. Deploy your first ATS-optimized asset to begin tracking.
          </p>
          <Link href="/resume/new" className="mt-10">
            <Button size="lg" className="h-16 px-10 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-violet-600/20">
              <Plus className="w-5 h-5 mr-3 stroke-[3]" />
              Deploy Initial Asset
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
