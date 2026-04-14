"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ExperienceSection } from "./ExperienceSection";
import { EducationSection } from "./EducationSection";
import { SkillsSection } from "./SkillsSection";
import { ProjectsSection } from "./ProjectsSection";
import { CertificationsSection } from "./CertificationsSection";
import { ResumePreview } from "../preview/ResumePreview";
import { createClient } from "@/lib/supabase/client";
import { useResumeStore } from "@/stores/resumeStore";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/posthog";
import { DEFAULT_RESUME_SETTINGS } from "@/types/resume";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Loader2,
  Download,
  Share2,
  Check,
  Undo,
  Wand2,
  Sparkles,
  FileText,
  Eye
} from "lucide-react";

interface ResumeEditorProps {
  initialResume: {
    id: string;
    title: string;
    content: unknown;
    settings: unknown;
    template_id: string;
    target_role: string | null;
    last_ats_score: number | null;
  };
}

const sections = [
  { id: "personal", label: "Personal Info", icon: FileText },
  { id: "experience", label: "Experience", icon: FileText },
  { id: "education", label: "Education", icon: FileText },
  { id: "skills", label: "Skills", icon: FileText },
  { id: "projects", label: "Projects", icon: FileText },
  { id: "certifications", label: "Certifications", icon: FileText },
];

export function ResumeEditor({ initialResume }: ResumeEditorProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = React.useState("personal");
  const [showPreview, setShowPreview] = React.useState(true);
  const supabase = createClient();

  const {
    resumeId,
    title,
    content,
    isDirty,
    isSaving,
    lastSaved,
    setResumeId,
    setTitle,
    setContent,
    setSaving,
    setSaved,
  } = useResumeStore();

  React.useEffect(() => {
    setResumeId(initialResume.id);
    setTitle(initialResume.title);
    if (initialResume.content) {
      setContent(initialResume.content as never);
    }
  }, [initialResume, setResumeId, setTitle, setContent]);

  const handleSave = React.useCallback(async () => {
    if (!resumeId || !isDirty) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("resumes")
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", resumeId);

      if (error) throw error;
      setSaved();
      toast.success("Resume saved");
    } catch (error) {
      console.error("Error saving resume:", error);
      toast.error("Failed to save resume");
    }
  }, [resumeId, isDirty, title, content, supabase, setSaving, setSaved]);

  React.useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (isDirty) {
        handleSave();
      }
    }, 2000);

    return () => clearTimeout(debounceTimer);
  }, [isDirty, content, handleSave]);

  const handleExportPDF = async () => {
    toast.loading("Generating PDF...", { id: "pdf-export" });
    try {
      const response = await fetch(`/api/resume/export-pdf?resumeId=${resumeId}&templateId=${initialResume.template_id}`);
      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded", { id: "pdf-export" });
      trackEvent("export_clicked", { format: "pdf" });
    } catch (error) {
      toast.error("Failed to generate PDF", { id: "pdf-export" });
    }
  };

  const handleExportDOCX = async () => {
    toast.loading("Generating DOCX...", { id: "docx-export" });
    try {
      const response = await fetch(`/api/resume/export-docx?resumeId=${resumeId}`);
      if (!response.ok) throw new Error("Failed to generate DOCX");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("DOCX downloaded", { id: "docx-export" });
      trackEvent("export_clicked", { format: "docx" });
    } catch (error) {
      toast.error("Failed to generate DOCX", { id: "docx-export" });
    }
  };

  const [isFixingResume, setIsFixingResume] = React.useState(false);

  const handleFixResume = async () => {
    setIsFixingResume(true);
    toast.loading("Fixing your resume with AI...", { id: "fix-resume" });
    
    try {
      const resumeContent = content as unknown as { personal?: { title?: string }; experience?: unknown[]; skills?: unknown[]; summary?: string };
      
      // Step 1: Improve all bullet points
      const bulletResponse = await fetch("/api/ai/bullet-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experience: resumeContent.experience || [],
          jobTitle: resumeContent.personal?.title || "",
        }),
      });
      
      if (bulletResponse.ok) {
        const bulletData = await bulletResponse.json();
        if (bulletData.bulletPoints) {
          toast.success("Improved bullet points", { id: "fix-resume" });
        }
      }

      // Step 2: Generate better summary
      const summaryResponse = await fetch("/api/ai/resume-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: JSON.stringify(content),
          jobTitle: resumeContent.personal?.title || "",
        }),
      });

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        if (summaryData.summary) {
          // Create updated content with new summary
          const updatedContent = { ...content, summary: summaryData.summary };
          setContent(updatedContent as never);
          toast.success("Updated summary", { id: "fix-resume" });
        }
      }

      // Step 3: Get skill suggestions
      const skillsResponse = await fetch("/api/ai/skill-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSkills: resumeContent.skills || [],
          jobTitle: resumeContent.personal?.title || "",
        }),
      });

      if (skillsResponse.ok) {
        const skillsData = await skillsResponse.json();
        if (skillsData.suggestedSkills) {
          const currentSkills = (content as any).skills || [];
          const newSkills = [...currentSkills, ...skillsData.suggestedSkills];
          const updatedContent = { ...content, skills: newSkills };
          setContent(updatedContent as never);
          toast.success("Added suggested skills", { id: "fix-resume" });
        }
      }

      toast.success("Resume improved!", { id: "fix-resume" });
      trackEvent("fix_resume_clicked", { success: true });
    } catch (error) {
      console.error("Fix resume error:", error);
      toast.error("Failed to fix resume", { id: "fix-resume" });
    } finally {
      setIsFixingResume(false);
    }
  };

  const t = useTranslations("resumeEditor");

  return (
    <div className="h-[calc(100vh-4.1rem)] flex flex-col bg-[#0D0D12] text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#0D0D12]/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-white/50 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-bold border-0 p-0 h-auto focus:ring-0 text-base bg-transparent text-white placeholder:text-white/20"
              placeholder="Untitled Resume"
            />
            <div className="flex items-center gap-3">
              {isSaving ? (
                <span className="text-[10px] text-violet-400 flex items-center gap-1.5 font-medium uppercase tracking-wider">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {t("autoSaving")}
                </span>
              ) : lastSaved ? (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1.5 font-medium uppercase tracking-wider">
                  <Check className="w-3 h-3" />
                  {t("saved")}
                </span>
              ) : isDirty ? (
                <span className="text-[10px] text-white/30 font-medium uppercase tracking-wider">
                  Unsaved Changes
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/10 mr-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-8 text-[11px] font-bold uppercase tracking-wider", !showPreview ? "bg-white/10 text-white" : "text-white/40")}
              onClick={() => setShowPreview(false)}
            >
              Editor
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-8 text-[11px] font-bold uppercase tracking-wider", showPreview ? "bg-white/10 text-white" : "text-white/40")}
              onClick={() => setShowPreview(true)}
            >
              Split View
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSave} 
              disabled={!isDirty || isSaving}
              className="h-9 border-white/10 bg-white/5 text-white/70 hover:text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {t("save")}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportPDF}
              className="h-9 border-violet-500/20 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportDOCX}
              className="h-9 border-white/10 bg-white/5 text-white/70 hover:text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              DOCX
            </Button>
            <Button 
              className="h-9 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20"
              onClick={handleFixResume}
              disabled={isFixingResume}
            >
              {isFixingResume ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              AI Fix
            </Button>
          </div>
        </div>
      </div>

      {/* 3-Panel Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel 1: Vertical Sidebar Navigation */}
        <div className="w-64 border-r border-white/5 bg-[#0D0D12] p-4 flex flex-col gap-2">
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4 px-2">
            Resume Sections
          </div>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                activeSection === section.id 
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/10" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <section.icon className={cn(
                "w-4 h-4 transition-colors",
                activeSection === section.id ? "text-white" : "text-white/20 group-hover:text-white/60"
              )} />
              {section.label}
              {activeSection === section.id && (
                <div className="ml-auto w-1 h-1 rounded-full bg-white animate-pulse" />
              )}
            </button>
          ))}
          
          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">AI Score</span>
              </div>
              <div className="text-2xl font-black text-white">{initialResume.last_ats_score || 0}%</div>
              <div className="mt-2 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000" 
                  style={{ width: `${initialResume.last_ats_score || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Modern Form Editor */}
        <div className="flex-1 overflow-auto bg-[#09090B] p-8 lg:p-12">
          <div className="max-w-2xl mx-auto space-y-10">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeSection === "personal" && <PersonalInfoSection />}
              {activeSection === "experience" && <ExperienceSection />}
              {activeSection === "education" && <EducationSection />}
              {activeSection === "skills" && <SkillsSection />}
              {activeSection === "projects" && <ProjectsSection />}
              {activeSection === "certifications" && <CertificationsSection />}
            </div>
          </div>
        </div>

        {/* Panel 3: Premium Live Preview */}
        {showPreview && (
          <div className="hidden lg:flex w-[600px] xl:w-[800px] border-l border-white/5 bg-[#12121A] flex-col overflow-hidden animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-white/30" />
                <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Live A4 Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-success/10 px-2 py-1 rounded-full border border-success/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] font-bold text-success uppercase tracking-widest">In Sync</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-12 bg-pattern-dots">
              <div className="mx-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] transform scale-[0.9] origin-top">
                <ResumePreview
                  content={content}
                  settings={{
                    ...DEFAULT_RESUME_SETTINGS,
                    templateId: initialResume.template_id,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
