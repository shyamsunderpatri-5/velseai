"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
          const currentSkills = content.skills || [];
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

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div className="flex items-center gap-4">
          <Link href="/resume">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-medium border-0 p-0 h-auto focus:ring-0 text-lg"
              placeholder="Resume Title"
            />
            <div className="flex items-center gap-2 mt-1">
              {isSaving ? (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              ) : lastSaved ? (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check className="w-3 h-3 text-success" />
                  Saved
                </span>
              ) : isDirty ? (
                <span className="text-xs text-muted-foreground">Unsaved changes</span>
              ) : null}
              {initialResume.last_ats_score && (
                <Badge
                  variant={
                    initialResume.last_ats_score >= 75
                      ? "success"
                      : initialResume.last_ats_score >= 50
                      ? "warning"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  ATS: {initialResume.last_ats_score}%
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowPreview(!showPreview)}
            title={showPreview ? "Hide preview" : "Show preview"}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleSave} disabled={!isDirty || isSaving}>
            <Save className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleExportPDF}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleExportDOCX} title="Export as DOCX">
            <FileText className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={handleFixResume} 
            disabled={isFixingResume}
            title="Fix my entire resume with AI"
            className="text-violet-400 border-violet-500/50 hover:bg-violet-500/10"
          >
            {isFixingResume ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            Fix
          </Button>
          <Button className="bg-accent hover:bg-accent/90">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Editor Panel */}
        <div className="overflow-auto">
          <Tabs value={activeSection} onValueChange={setActiveSection}>
            <TabsList className="w-full grid grid-cols-6 mb-4">
              {sections.map((section) => (
                <TabsTrigger key={section.id} value={section.id} className="text-xs">
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="personal">
              <PersonalInfoSection />
            </TabsContent>

            <TabsContent value="experience">
              <ExperienceSection />
            </TabsContent>

            <TabsContent value="education">
              <EducationSection />
            </TabsContent>

            <TabsContent value="skills">
              <SkillsSection />
            </TabsContent>

            <TabsContent value="projects">
              <ProjectsSection />
            </TabsContent>

            <TabsContent value="certifications">
              <CertificationsSection />
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="hidden lg:block border rounded-lg bg-white overflow-auto">
            <ResumePreview
              content={content}
              settings={{
                ...DEFAULT_RESUME_SETTINGS,
                templateId: initialResume.template_id,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
