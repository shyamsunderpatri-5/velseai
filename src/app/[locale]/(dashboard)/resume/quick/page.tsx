"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { WizardStep } from "@/components/resume/wizard/WizardStep";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useResumeStore } from "@/stores/resumeStore";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  Layout, 
  CheckCircle2,
  Trash2,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkExperience, Education, Skill, ResumeContent, DEFAULT_RESUME_CONTENT } from "@/types/resume";

const STEPS = [
  "Identity",
  "Contact",
  "Summary",
  "Experience",
  "Education",
  "Skills",
  "Template",
  "Finalizing"
];

export default function QuickWizardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  
  // Local wizard state
  const [wizardData, setWizardData] = React.useState({
    fullName: "",
    targetRole: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    experience: [] as WorkExperience[],
    education: [] as Education[],
    skills: [] as string[],
    templateId: "modern"
  });

  const updateData = (fields: Partial<typeof wizardData>) => {
    setWizardData(prev => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      createResume();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    } else {
      router.back();
    }
  };

  const generateAIHighlights = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/resume-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Generate a 2-sentence professional resume summary for a ${wizardData.targetRole} named ${wizardData.fullName}.` }],
          context: "Quick Wizard Onboarding"
        }),
      });
      const data = await response.json();
      const summary = data.message?.content || "";
      updateData({ summary });
    } catch (err) {
      toast.error("AI Protocol Fault: Fallback to manual entry.");
    } finally {
      setLoading(false);
    }
  };

  const createResume = async () => {
    setLoading(true);
    toast.loading("VELSEAI Protocol: Synthesizing Digital Asset...", { id: "create-resume" });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Auth required");

      const content: ResumeContent = {
        ...DEFAULT_RESUME_CONTENT,
        personal: {
          ...DEFAULT_RESUME_CONTENT.personal,
          fullName: wizardData.fullName,
          email: wizardData.email,
          phone: wizardData.phone,
          location: wizardData.location,
          summary: wizardData.summary,
        },
        experience: wizardData.experience,
        education: wizardData.education,
        skills: [{ id: crypto.randomUUID(), category: "Core Technologies", skills: wizardData.skills }],
      };

      const { data, error } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title: wizardData.targetRole || "Quick Sprint Resume",
          target_role: wizardData.targetRole,
          template_id: wizardData.templateId,
          content: content,
          settings: { templateId: wizardData.templateId, primaryColor: "#7C3AED", fontSize: "medium", spacing: "normal", showPhoto: false }
        })
        .select("id")
        .single();

      if (error) throw error;

      toast.success("Asset Synthesized. Redirecting to Command Center.", { id: "create-resume" });
      router.push(`/resume/${data.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create resume.", { id: "create-resume" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] flex flex-col pt-4">
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <WizardStep
            key="step1"
            title="Professional Identity"
            subtitle="How should recruiters identify your digital profile?"
            stepNumber={1}
            totalSteps={STEPS.length}
            onNext={handleNext}
            onBack={handleBack}
            isNextDisabled={!wizardData.fullName || !wizardData.targetRole}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-violet-500 transition-colors" />
                  <Input 
                    value={wizardData.fullName}
                    onChange={e => updateData({ fullName: e.target.value })}
                    className="h-14 pl-12 bg-white/[0.03] border-white/5 focus:border-violet-500/30 rounded-2xl text-sm font-medium" 
                    placeholder="e.g. Alex Rivera" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Target Role</Label>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-violet-500 transition-colors" />
                  <Input 
                    value={wizardData.targetRole}
                    onChange={e => updateData({ targetRole: e.target.value })}
                    className="h-14 pl-12 bg-white/[0.03] border-white/5 focus:border-violet-500/30 rounded-2xl text-sm font-medium" 
                    placeholder="e.g. Senior Product Designer" 
                  />
                </div>
              </div>
            </div>
          </WizardStep>
        )}

        {currentStep === 2 && (
          <WizardStep
            key="step2"
            title="Contact Protocols"
            subtitle="Where should we direct interview requests?"
            stepNumber={2}
            totalSteps={STEPS.length}
            onNext={handleNext}
            onBack={handleBack}
            isNextDisabled={!wizardData.email || !wizardData.phone}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-violet-500 transition-colors" />
                  <Input 
                    value={wizardData.email}
                    onChange={e => updateData({ email: e.target.value })}
                    className="h-14 pl-12 bg-white/[0.03] border-white/5 focus:border-violet-500/30 rounded-2xl text-sm font-medium" 
                    placeholder="alex@example.com" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Phone Number</Label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-violet-500 transition-colors" />
                  <Input 
                    value={wizardData.phone}
                    onChange={e => updateData({ phone: e.target.value })}
                    className="h-14 pl-12 bg-white/[0.03] border-white/5 focus:border-violet-500/30 rounded-2xl text-sm font-medium" 
                    placeholder="+1 555 000 0000" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Location</Label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-violet-500 transition-colors" />
                  <Input 
                    value={wizardData.location}
                    onChange={e => updateData({ location: e.target.value })}
                    className="h-14 pl-12 bg-white/[0.03] border-white/5 focus:border-violet-500/30 rounded-2xl text-sm font-medium" 
                    placeholder="San Francisco, CA" 
                  />
                </div>
              </div>
            </div>
          </WizardStep>
        )}

        {currentStep === 3 && (
          <WizardStep
            key="step3"
            title="Strategic Summary"
            subtitle="Elevator pitch for your career journey."
            stepNumber={3}
            totalSteps={STEPS.length}
            onNext={handleNext}
            onBack={handleBack}
            isNextLoading={loading}
          >
            <div className="space-y-6">
              <div className="relative group">
                <Textarea 
                  value={wizardData.summary}
                  onChange={e => updateData({ summary: e.target.value })}
                  className="min-h-[200px] bg-white/[0.03] border-white/5 focus:border-violet-500/30 rounded-2xl p-4 text-sm font-medium leading-relaxed resize-none" 
                  placeholder="Summarize your professional impact..." 
                />
              </div>
              <button
                onClick={generateAIHighlights}
                className="w-full h-14 flex items-center justify-center gap-3 bg-violet-600/10 border border-violet-500/20 rounded-2xl text-violet-400 font-black text-[10px] uppercase tracking-widest hover:bg-violet-600/20 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Auto-Synthesize with AI
              </button>
            </div>
          </WizardStep>
        )}

        {currentStep === 4 && (
          <WizardStep
            key="step4"
            title="Latest Victory"
            subtitle="Your most impactful professional experience."
            stepNumber={4}
            totalSteps={STEPS.length}
            onNext={handleNext}
            onBack={handleBack}
          >
            <div className="space-y-6">
              {wizardData.experience.length === 0 ? (
                <button 
                  onClick={() => updateData({ 
                    experience: [{ 
                      id: crypto.randomUUID(), 
                      company: "", 
                      role: wizardData.targetRole, 
                      startDate: "2023", 
                      endDate: null, 
                      isCurrent: true, 
                      bulletPoints: ["Implemented strategic solutions..."] 
                    }] 
                  })}
                  className="w-full py-12 border-2 border-dashed border-white/5 bg-white/[0.02] rounded-3xl flex flex-col items-center gap-4 text-white/20 hover:text-white/40 hover:bg-white/[0.04] transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Add Primary Experience</span>
                </button>
              ) : (
                <div className="space-y-4">
                  {wizardData.experience.map((exp, idx) => (
                    <div key={exp.id} className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-violet-500 uppercase tracking-widest">Selected Focus</span>
                        <button onClick={() => updateData({ experience: [] })} className="text-white/20 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <Input 
                          value={exp.company}
                          onChange={e => {
                            const newExp = [...wizardData.experience];
                            newExp[idx].company = e.target.value;
                            updateData({ experience: newExp });
                          }}
                          className="h-12 bg-white/5 border-white/5 rounded-xl text-sm" 
                          placeholder="Company Name" 
                        />
                        <Input 
                          value={exp.role}
                          onChange={e => {
                            const newExp = [...wizardData.experience];
                            newExp[idx].role = e.target.value;
                            updateData({ experience: newExp });
                          }}
                          className="h-12 bg-white/5 border-white/5 rounded-xl text-sm" 
                          placeholder="Role / Title" 
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input 
                            value={exp.startDate}
                            onChange={e => {
                              const newExp = [...wizardData.experience];
                              newExp[idx].startDate = e.target.value;
                              updateData({ experience: newExp });
                            }}
                            className="h-12 bg-white/5 border-white/5 rounded-xl text-sm" 
                            placeholder="Start (e.g. 2021)" 
                          />
                          <Input 
                            value={exp.endDate || ""}
                            onChange={e => {
                              const newExp = [...wizardData.experience];
                              newExp[idx].endDate = e.target.value;
                              updateData({ experience: newExp });
                            }}
                            className="h-12 bg-white/5 border-white/5 rounded-xl text-sm" 
                            placeholder="End (or Present)" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </WizardStep>
        )}

        {currentStep === 5 && (
          <WizardStep
            key="step5"
            title="Educational Foundation"
            subtitle="Academic credentials that validate your path."
            stepNumber={5}
            totalSteps={STEPS.length}
            onNext={handleNext}
            onBack={handleBack}
          >
            <div className="space-y-6">
              {wizardData.education.length === 0 ? (
                <button 
                  onClick={() => updateData({ 
                    education: [{ 
                      id: crypto.randomUUID(), 
                      institution: "", 
                      degree: "Bachelors", 
                      field: "", 
                      startDate: "2018", 
                      endDate: "2022" 
                    }] 
                  })}
                  className="w-full py-12 border-2 border-dashed border-white/5 bg-white/[0.02] rounded-3xl flex flex-col items-center gap-4 text-white/20 hover:text-white/40 hover:bg-white/[0.04] transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Add Education</span>
                </button>
              ) : (
                <div className="space-y-4">
                  {wizardData.education.map((edu, idx) => (
                    <div key={edu.id} className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Core Diploma</span>
                        <button onClick={() => updateData({ education: [] })} className="text-white/20 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <Input 
                          value={edu.institution}
                          onChange={e => {
                            const newEdu = [...wizardData.education];
                            newEdu[idx].institution = e.target.value;
                            updateData({ education: newEdu });
                          }}
                          className="h-12 bg-white/5 border-white/5 rounded-xl text-sm" 
                          placeholder="Institution Name" 
                        />
                        <Input 
                          value={edu.degree}
                          onChange={e => {
                            const newEdu = [...wizardData.education];
                            newEdu[idx].degree = e.target.value;
                            updateData({ education: newEdu });
                          }}
                          className="h-12 bg-white/5 border-white/5 rounded-xl text-sm" 
                          placeholder="Degree (e.g. B.S. CS)" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </WizardStep>
        )}

        {currentStep === 6 && (
          <WizardStep
            key="step6"
            title="Tech Intelligence"
            subtitle="Core strengths that define your craft."
            stepNumber={6}
            totalSteps={STEPS.length}
            onNext={handleNext}
            onBack={handleBack}
          >
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {["React", "TypeScript", "Node.js", "Python", "AWS", "Product Management", "Strategic Analysis", "Marketing", "Figma"].map(skill => (
                  <button
                    key={skill}
                    onClick={() => {
                      if (wizardData.skills.includes(skill)) {
                        updateData({ skills: wizardData.skills.filter(s => s !== skill) });
                      } else {
                        updateData({ skills: [...wizardData.skills, skill] });
                      }
                    }}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                      wizardData.skills.includes(skill)
                        ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/20 scale-105"
                        : "bg-white/[0.03] border-white/5 text-white/40 hover:border-white/20"
                    )}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              <div className="pt-4 border-t border-white/5 space-y-2">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest pl-1">Custom Skills (Comma Separated)</p>
                <Input 
                  onChange={e => {
                    const extra = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                    // Minimalist implementation: merge with set
                    // updateData({ skills: [...new Set([...wizardData.skills, ...extra])] });
                  }}
                  className="h-14 bg-white/[0.03] border-white/5 rounded-2xl text-sm font-medium" 
                  placeholder="e.g. Next.js, Framer Motion, Postgres" 
                />
              </div>
            </div>
          </WizardStep>
        )}

        {currentStep === 7 && (
          <WizardStep
            key="step7"
            title="Visual Interface"
            subtitle="Select the blueprint for your final output."
            stepNumber={7}
            totalSteps={STEPS.length}
            onNext={handleNext}
            onBack={handleBack}
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: "modern", name: "Alpha", color: "bg-violet-600" },
                { id: "minimal", name: "Beta", color: "bg-zinc-600" },
                { id: "professional", name: "Gamma", color: "bg-blue-600" },
                { id: "creative", name: "Delta", color: "bg-emerald-600" }
              ].map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => updateData({ templateId: tpl.id })}
                  className={cn(
                    "relative aspect-[3/4] rounded-2xl border transition-all overflow-hidden group",
                    wizardData.templateId === tpl.id
                      ? "border-violet-600 ring-2 ring-violet-600/20"
                      : "border-white/5 hover:border-white/10"
                  )}
                >
                  <div className={cn("absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity", tpl.color)} />
                  <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{tpl.name}</span>
                    {wizardData.templateId === tpl.id && <CheckCircle2 className="w-4 h-4 text-violet-500" />}
                  </div>
                </button>
              ))}
            </div>
          </WizardStep>
        )}

        {currentStep === 8 && (
          <WizardStep
            key="step8"
            title="Finalizing Protocol"
            subtitle="Ready to materialize your professional asset?"
            stepNumber={8}
            totalSteps={STEPS.length}
            onNext={handleNext}
            onBack={handleBack}
            nextLabel="Synthesize Asset"
          >
            <div className="py-20 flex flex-col items-center justify-center space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-violet-600 blur-[60px] opacity-20 animate-pulse" />
                <div className="w-24 h-24 rounded-3xl bg-violet-600 flex items-center justify-center shadow-2xl shadow-violet-600/40 relative z-10">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-black text-white tracking-tight">Configuration Locked</p>
                <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">Ready for rejection-proof export</p>
              </div>
            </div>
          </WizardStep>
        )}
      </AnimatePresence>
    </div>
  );
}
