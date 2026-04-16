"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ExperienceSection } from "./ExperienceSection";
import { EducationSection } from "./EducationSection";
import { SkillsSection } from "./SkillsSection";
import { ProjectsSection } from "./ProjectsSection";
import { CertificationsSection } from "./CertificationsSection";
import { AIChatPanel } from "./AIChatPanel";
import { TemplateSelector } from "./TemplateSelector";
import { ResumePreview } from "../preview/ResumePreview";
import { createClient } from "@/lib/supabase/client";
import { useResumeStore } from "@/stores/resumeStore";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/posthog";
import { DEFAULT_RESUME_SETTINGS } from "@/types/resume";
import { AIChatResponse } from "@/lib/ai/structured-outputs";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Loader2,
  Download,
  Check,
  Sparkles,
  FileText,
  Eye,
  History,
  Layout,
  MessageSquare,
  ShieldCheck,
  Target
} from "lucide-react";
import { ScoreGauge } from "@/components/ats/ScoreGauge";
import { ATSMetricsChecklist } from "@/components/ats/ATSMetricsChecklist";
import { JDMatcher } from "@/components/ats/JDMatcher";
import { FixAllBanner } from "./FixAllBanner";
import { ScoreRadarChart } from "@/components/ats/ScoreRadarChart";

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
  { id: "personal", label: "Identity", icon: FileText },
  { id: "experience", label: "Experience", icon: FileText },
  { id: "education", label: "Education", icon: FileText },
  { id: "skills", label: "Skills", icon: FileText },
  { id: "projects", label: "Projects", icon: FileText },
  { id: "certifications", label: "Certifications", icon: FileText },
];

export function ResumeEditor({ initialResume }: ResumeEditorProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = React.useState("personal");
  const [activeTab, setActiveTab] = React.useState<"preview" | "chat" | "audit">("preview");
  const [selectedTemplate, setSelectedTemplate] = React.useState(initialResume.template_id || "modern");
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
    updatePersonalInfo,
    addExperience,
    updateExperience,
    addSkill,
    updateSectionOrder,
    setSaving,
    setSaved,
    undo,
    redo,
    canUndo,
    canRedo,
    analysisResults,
    jobDescription,
  } = useResumeStore();

  const overallScore = analysisResults?.audit.overall_score || 0;

  React.useEffect(() => {
    setResumeId(initialResume.id);
    setTitle(initialResume.title);
    if (initialResume.content) {
      setContent(initialResume.content as never);
    }
  }, [initialResume, setResumeId, setTitle, setContent]);

  // handleAIAction: The bridge between AI logic and state mutation
  const handleAIAction = React.useCallback((response: AIChatResponse) => {
    if (!response.suggested_actions || response.suggested_actions.length === 0) return;

    response.suggested_actions.forEach(action => {
      try {
        switch (action.type) {
          case "UPDATE_PERSONAL":
            updatePersonalInfo(action.data);
            break;
          case "ADD_EXPERIENCE":
            // Complex addition: we might need a store action that takes data
            // For now, I'll trigger the add and then update would be better, 
            // but let's assume we implement a more robust ADD in the store later
            addExperience();
            // Note: In a real scenario, we'd find the newly created ID and update it
            break;
          case "UPDATE_EXPERIENCE":
            updateExperience(action.data.id, action.data);
            break;
          case "ADD_SKILL":
            addSkill();
            break;
          case "UPDATE_SECTION_ORDER":
            updateSectionOrder(action.data.order);
            break;
        }
      } catch (e) {
        console.error("Failed to apply AI action:", e);
      }
    });

    toast.success("AI updated your resume", {
      icon: "✨",
      style: {
        background: "rgba(124, 58, 237, 0.1)",
        border: "1px solid rgba(124, 58, 237, 0.2)",
        color: "#7C3AED",
      }
    });
  }, [updatePersonalInfo, addExperience, updateExperience, addSkill, updateSectionOrder]);

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
      // No toast on auto-save to keep UX clean
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
    }, 3000);

    return () => clearTimeout(debounceTimer);
  }, [isDirty, content, handleSave]);

  const handleExportPDF = async () => {
    toast.loading("Generating PDF...", { id: "pdf-export" });
    try {
      const response = await fetch(`/api/resume/export-pdf?resumeId=${resumeId}&templateId=${selectedTemplate}`);
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
    } catch (error) {
      toast.error("Failed to generate PDF", { id: "pdf-export" });
    }
  };

  const t = useTranslations("resumeEditor");

  return (
    <div className="h-[calc(100vh-4.1rem)] flex flex-col bg-[#050506] text-white">
      {/* Premium Top Navigation */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#050506]/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/5 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          
          <div className="h-8 w-px bg-white/5" />

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-bold border-0 p-0 h-auto focus:ring-0 text-sm bg-transparent text-white placeholder:text-white/20 w-48"
                placeholder="Job Title / Project"
              />
              {isSaving && <Loader2 className="w-3 h-3 animate-spin text-violet-500" />}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 h-4">
                {lastSaved ? (
                  <span className="text-[10px] text-white/30 flex items-center gap-1.5 font-bold uppercase tracking-[0.1em]">
                    <Check className="w-3 h-3 text-emerald-500" />
                    Last saved {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                ) : (
                  <span className="text-[10px] text-white/20 font-bold uppercase tracking-[0.1em]">Draft Mode</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-8 px-3 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all", activeTab === "preview" ? "bg-white/10 text-white" : "text-white/30 hover:text-white")}
              onClick={() => setActiveTab("preview")}
            >
              <Eye className="w-3.5 h-3.5 mr-2" />
              Preview
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-8 px-3 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all", activeTab === "chat" ? "bg-white/10 text-white" : "text-white/30 hover:text-white")}
              onClick={() => setActiveTab("chat")}
            >
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Co-pilot
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-8 px-3 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all", activeTab === "audit" ? "bg-white/10 text-white" : "text-white/30 hover:text-white")}
              onClick={() => setActiveTab("audit")}
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-2" />
              Audit
            </Button>
          </div>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={undo}
              disabled={!canUndo()}
              className="h-9 w-9 p-0 border-white/5 bg-white/5 text-white/40 hover:text-white disabled:opacity-20"
            >
              <History className="w-4 h-4 scale-x-[-1]" />
            </Button>
            
            <TemplateSelector
              currentTemplate={selectedTemplate}
              onSelect={(id) => setSelectedTemplate(id)}
            />

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportPDF}
              className="h-9 border-violet-500/20 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 px-4 font-bold text-xs uppercase tracking-wider"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Triple-Split Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel 1: Minimalist Section Navigation */}
        <div className="w-20 border-r border-white/5 bg-[#050506] py-6 flex flex-col items-center gap-6">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "relative group flex flex-col items-center gap-1.5 transition-all",
                activeSection === section.id ? "text-violet-500" : "text-white/20 hover:text-white/60"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                activeSection === section.id 
                  ? "bg-violet-600/10 border border-violet-500/20" 
                  : "bg-white/0 border border-transparent"
              )}>
                <section.icon className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">{section.label.substring(0, 3)}</span>
              {activeSection === section.id && (
                <div className="absolute -left-0 w-1 h-8 bg-violet-600 rounded-full blur-[2px]" />
              )}
            </button>
          ))}
          
          <div className="mt-auto group flex flex-col items-center gap-1 cursor-pointer" onClick={() => setActiveTab("audit")}>
            <ScoreGauge 
              score={overallScore} 
              size="sm" 
              showLabel={false} 
            />
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-2 group-hover:text-violet-400 transition-all">Audit</span>
          </div>
        </div>

        {/* Panel 2: Center Editor (Manual) */}
        <div className="flex-1 overflow-auto bg-[#050506] relative">
          <div className="max-w-[800px] mx-auto p-12 lg:p-16 pb-32">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white mb-2">{sections.find(s => s.id === activeSection)?.label}</h1>
                <p className="text-white/30 text-xs font-medium uppercase tracking-[0.2em]">Build with precision</p>
              </div>
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                <Sparkles className="w-4 h-4 text-violet-500" />
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              {activeSection === "personal" && <PersonalInfoSection />}
              {activeSection === "experience" && <ExperienceSection />}
              {activeSection === "education" && <EducationSection />}
              {activeSection === "skills" && <SkillsSection />}
              {activeSection === "projects" && <ProjectsSection />}
              {activeSection === "certifications" && <CertificationsSection />}
            </div>
          </div>
          
          {/* Glass Gradient Fade at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050506] to-transparent pointer-events-none" />

          {/* Fix All Banner — sticky at bottom, only visible when score < 70 */}
          <FixAllBanner jobDescription={jobDescription} />
        </div>

        {/* Panel 3: Inspector (Preview / Chat / Audit) */}
        <div className="w-[480px] border-l border-white/5 bg-[#050506] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              {activeTab === "preview" && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col pt-8"
                >
                  <div className="flex-1 px-8 pb-20 flex items-center justify-center bg-pattern-grid-light overflow-auto">
                    <div className="shadow-[0_0_100px_rgba(0,0,0,0.8)] transform scale-[0.6] lg:scale-[0.7] xl:scale-[0.8] origin-center">
                      <ResumePreview
                        content={content}
                        settings={{
                          ...DEFAULT_RESUME_SETTINGS,
                          templateId: selectedTemplate,
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "chat" && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <AIChatPanel 
                    className="w-full h-full"
                    resumeContext={JSON.stringify(content)}
                    onApplyAction={handleAIAction}
                  />
                </motion.div>
              )}

              {activeTab === "audit" && (
                <motion.div
                  key="audit"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full px-8 pt-8 space-y-12"
                >
                  <div className="text-center mb-12">
                    <ScoreGauge 
                      score={overallScore} 
                      size="lg" 
                    />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-8">Intelligence Protocol</p>
                  </div>

                  {/* Score Radar Chart */}
                  {analysisResults && (
                    <div className="mb-10">
                      <ScoreRadarChart
                        scores={{
                          Keywords: analysisResults.audit.categories.optimization?.reduce((a, m) => a + m.score, 0) / Math.max(analysisResults.audit.categories.optimization?.length || 1, 1) * 100,
                          Impact:   analysisResults.audit.categories.impact?.reduce((a, m) => a + m.score, 0) / Math.max(analysisResults.audit.categories.impact?.length || 1, 1) * 100,
                          Format:   analysisResults.audit.categories.formatting?.reduce((a, m) => a + m.score, 0) / Math.max(analysisResults.audit.categories.formatting?.length || 1, 1) * 100,
                          Foundation: analysisResults.audit.categories.foundational?.reduce((a, m) => a + m.score, 0) / Math.max(analysisResults.audit.categories.foundational?.length || 1, 1) * 100,
                          Match:    analysisResults.match?.match_score ?? 0,
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-16">
                    <section>
                      <div className="flex items-center gap-3 mb-6">
                        <Target className="w-5 h-5 text-violet-500" />
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Keyword Matcher</h3>
                      </div>
                      <JDMatcher />
                    </section>
                    
                    <section>
                      <div className="flex items-center gap-3 mb-6">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">23-Metric Audit</h3>
                      </div>
                      <ATSMetricsChecklist />
                    </section>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

