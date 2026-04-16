"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  ChevronDown, 
  Upload, 
  Info, 
  CheckCircle2, 
  Plus,
  ArrowUpFromLine,
  Search,
  Zap,
  Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_RESUME_CONTENT, DEFAULT_RESUME_SETTINGS } from "@/types/resume";
import { cn } from "@/lib/utils";

export default function NewResumePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [extractionProgress, setExtractionProgress] = React.useState(0);
  const [isExtracting, setIsExtracting] = React.useState(false);
  
  // Form State
  const [title, setTitle] = React.useState("");
  const [experienceLevel, setExperienceLevel] = React.useState("mid");
  const [isTargeting, setIsTargeting] = React.useState(true);

  const handleCreate = async () => {
    setIsLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Plan check
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    const { data: existingResumes } = await supabase
      .from("resumes")
      .select("id")
      .eq("user_id", user.id);

    const resumeLimit = profile?.plan === "free" ? 1 : profile?.plan === "starter" ? 5 : 999;

    if ((existingResumes?.length || 0) >= resumeLimit) {
      alert(`Your ${profile?.plan} plan allows up to ${resumeLimit} resumes. Please upgrade to create more.`);
      setIsLoading(false);
      return;
    }

    const { data: resume, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: title || "Untitled Resume",
        template_id: "modern",
        content: DEFAULT_RESUME_CONTENT,
        settings: {
          ...DEFAULT_RESUME_SETTINGS,
          experienceLevel,
          isTargeting,
        },
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating resume:", error);
      setIsLoading(false);
      return;
    }

    router.push(`/resume/${resume.id}`);
  };

  // Simulate extraction for UI demo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsExtracting(true);
      setExtractionProgress(0);
      const interval = setInterval(() => {
        setExtractionProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsExtracting(false);
              handleCreate();
            }, 800);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-[#1A1C26] border border-[#2D313F] rounded-[24px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2D313F]">
          <h1 className="text-lg font-bold text-white tracking-tight">Create a resume</h1>
          <button 
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full border border-[#2D313F] flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Area */}
        <div className="p-6 space-y-7 overflow-y-auto max-h-[80vh]">
          
          {/* Resume Name */}
          <div className="space-y-2.5 px-1">
            <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">
              Resume Name <span className="text-violet-500 ml-0.5">*</span>
            </Label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lead Engineer"
              className="h-13 bg-[#0F0F12] border-[#2D313F] rounded-xl text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all font-medium"
            />
          </div>

          {/* Experience Level */}
          <div className="space-y-2.5 px-1">
            <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">
              Experience Level
            </Label>
            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger className="h-13 bg-[#0F0F12] border-[#2D313F] rounded-xl text-white focus:ring-1 focus:ring-violet-500 transition-all">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1C26] border-[#2D313F] text-white">
                <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                <SelectItem value="mid">Mid-Senior level (3-10 years)</SelectItem>
                <SelectItem value="sr">Expert / Lead (10+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Import LinkedIn */}
          <div className="space-y-2.5 px-1">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">
                Import from LinkedIn
              </Label>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 h-13 bg-[#0F0F12]/50 border border-[#2D313F] border-dashed rounded-xl px-4 cursor-pointer hover:bg-[#0F0F12] hover:border-violet-500/50 transition-all group">
                <Input 
                  type="file" 
                  accept=".rezi,.json"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                />
                <span className="text-zinc-600 text-[13px] font-medium group-hover:text-zinc-400">Upload Profile Data file</span>
                <ArrowUpFromLine className="w-4 h-4 text-zinc-600 ml-auto group-hover:text-violet-400 transition-colors" />
              </div>
            </div>
          </div>

          {/* Import Existing */}
          <div className="space-y-2.5 px-1">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">
                Import Existing Resume
              </Label>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
            </div>
            <div className={cn(
              "relative h-13 flex items-center px-4 rounded-xl transition-all border",
              isExtracting ? "bg-violet-600/5 border-violet-500/30" : "bg-[#0F0F12] border-[#2D313F]"
            )}>
              {isExtracting ? (
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-black text-violet-400 uppercase tracking-widest">
                    <span>Extracting intelligence...</span>
                    <span>{extractionProgress}%</span>
                  </div>
                  <Progress value={extractionProgress} className="h-1.5 bg-violet-600/10" />
                </div>
              ) : (
                <>
                  <Input 
                    type="file" 
                    accept=".pdf,.docx"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                  />
                  <span className="text-zinc-600 text-[13px] font-medium">Drop your resume here (PDF or DOCX)</span>
                </>
              )}
            </div>
            {isExtracting && (
              <div className="flex gap-2 text-[11px] text-zinc-600 mt-2 leading-relaxed animate-pulse">
                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <p>This process may take up to 60 seconds. Please be patient while the AI Brain audits your career.</p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-[#2D313F] mx-[-1.5rem] my-2" />

          {/* Target Toggle */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-white">Target your resume</h3>
                <div className="flex items-start gap-2 text-[12px] text-zinc-500 leading-snug">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                  </div>
                  <p>You're more likely to get an interview if you show you have the required experience.</p>
                </div>
              </div>
              <div className="flex-shrink-0 pt-1">
                {/* Custom Toggle UI */}
                <button 
                  onClick={() => setIsTargeting(!isTargeting)}
                  className={cn(
                    "w-11 h-6 rounded-full p-1 transition-colors duration-200",
                    isTargeting ? "bg-violet-600" : "bg-zinc-700"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full transition-transform duration-200",
                    isTargeting ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </div>
            </div>

            {/* Final Action */}
            <Button 
              onClick={handleCreate}
              disabled={isLoading || isExtracting}
              className="w-full h-14 mt-4 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-violet-600/20 transition-all hover:scale-[1.01] active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                  Initializing Workspace...
                </>
              ) : (
                <>
                  CREATE NEW RESUME
                </>
              )}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
