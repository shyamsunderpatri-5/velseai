"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/stores/resumeStore";
import { Plus, Trash2, Sparkles, Building2, Zap, Loader2 } from "lucide-react";
import { AIPolisher } from "./AIPolisher";
import { BulletFixModal, type BulletFixPayload } from "./BulletFixModal";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export function ExperienceSection() {
  const { content, addExperience, updateExperience, removeExperience } =
    useResumeStore();
  const { experience } = content;

  // Fix-bullet state: stores "expId-bulletIdx" of the bullet currently being fixed
  const [fixingBulletKey, setFixingBulletKey] = React.useState<string | null>(null);
  const [fixPayload, setFixPayload] = React.useState<BulletFixPayload | null>(null);

  const fixBullet = React.useCallback(async (
    expId: string,
    bulletIdx: number,
    bulletText: string,
    role: string,
    company: string
  ) => {
    if (!bulletText.trim() || bulletText.length < 5) {
      toast.error("Write something in the bullet first.", {
        style: { background: "#1a0a0a", border: "1px solid #7f1d1d", color: "#fca5a5" },
      });
      return;
    }

    const key = `${expId}-${bulletIdx}`;
    setFixingBulletKey(key);

    try {
      const response = await fetch("/api/ai/fix-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "single_bullet",
          bulletText,
          bulletContext: `Role: ${role} at ${company}. Focus on quantifiable impact and strong action verbs.`,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        toast.error(err.error || "AI fix failed. Try again.", {
          style: { background: "#1a0a0a", border: "1px solid #7f1d1d", color: "#fca5a5" },
        });
        return;
      }

      const data = await response.json();
      setFixPayload({
        expId,
        bulletIdx,
        original: bulletText,
        rewritten: data.rewritten || bulletText,
        improvement: data.improvement || "",
      });
    } catch (err) {
      console.error("[ExperienceSection] fixBullet error:", err);
      toast.error("Network error. Check your connection.");
    } finally {
      setFixingBulletKey(null);
    }
  }, []);

  return (
    <>
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white mb-1 uppercase tracking-wider">Experience</h2>
            <p className="text-xs text-white/30 font-medium uppercase tracking-widest">
              Your professional journey & impact
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={addExperience}
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-[10px] uppercase tracking-widest h-8 px-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Position
          </Button>
        </div>

        {experience.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
            <Building2 className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/20 font-bold uppercase tracking-widest text-xs mb-6">
              No experience protocols found
            </p>
            <Button 
              variant="outline"
              onClick={addExperience}
              className="border-white/10 bg-white/5 text-white/60 hover:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Initialize Record
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {experience.map((exp, index) => (
              <div 
                key={exp.id} 
                className="group relative bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] hover:border-violet-500/20 transition-all duration-500"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-violet-500/10 group-hover:text-violet-500 transition-all">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">Position {index + 1}</h3>
                      <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Core Professional Record</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-white/10 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    onClick={() => removeExperience(exp.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Role Title</Label>
                    <Input
                      value={exp.role}
                      onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                      placeholder="Senior Software Engineer"
                      className="bg-white/5 border-white/5 focus:border-violet-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em]">Company</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                      placeholder="Google Cloud"
                      className="bg-white/5 border-white/5 focus:border-violet-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em]">Location</Label>
                    <Input
                      value={exp.location || ""}
                      onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                      placeholder="Mountain View, CA"
                      className="bg-white/5 border-white/5 focus:border-violet-500/50"
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <div className="flex items-center gap-3 cursor-pointer group/check" onClick={() => updateExperience(exp.id, { isCurrent: !exp.isCurrent })}>
                      <div className={cn(
                        "w-5 h-5 rounded-md border transition-all flex items-center justify-center",
                        exp.isCurrent ? "bg-violet-600 border-violet-500 shadow-lg shadow-violet-600/20" : "bg-white/5 border-white/10"
                      )}>
                        {exp.isCurrent && <Sparkles className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-[10px] font-bold text-white/40 group-hover/check:text-white transition-all uppercase tracking-widest">Ongoing Role</span>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6 mt-6 pt-6 border-t border-white/5">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em]">Start Period</Label>
                    <Input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                      className="bg-white/5 border-white/5 focus:border-violet-500/50 invert-icon"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em]">End Period</Label>
                    <Input
                      type="month"
                      value={exp.endDate || ""}
                      onChange={(e) => updateExperience(exp.id, { endDate: e.target.value || null })}
                      disabled={exp.isCurrent}
                      className="bg-white/5 border-white/5 focus:border-violet-500/50 disabled:opacity-20 invert-icon"
                    />
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <Label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Impact & Results</Label>
                    <div className="h-px flex-1 bg-white/5 mx-4" />
                  </div>
                  
                  <div className="space-y-4">
                    {exp.bulletPoints.map((bullet, bulletIndex) => (
                      <div key={bulletIndex} className="group/bullet relative">
                        <div className="flex gap-4">
                          <div className="pt-3">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full transition-all duration-500",
                              bullet.length > 20 ? "bg-violet-500 shadow-[0_0_8px_rgba(124,58,237,0.5)]" : "bg-white/10"
                            )} />
                          </div>
                          <div className="flex-1 space-y-3">
                            <Textarea
                              value={bullet}
                              onChange={(e) => {
                                const newBullets = [...exp.bulletPoints];
                                newBullets[bulletIndex] = e.target.value;
                                updateExperience(exp.id, { bulletPoints: newBullets });
                              }}
                              placeholder="Elite bullet point (Verb + Metric + Impact)..."
                              className="bg-white/5 border-white/5 focus:border-violet-500/50 min-h-[80px] text-sm leading-relaxed resize-none transition-all group-hover/bullet:bg-white/[0.07]"
                            />
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <AIPolisher 
                                  value={bullet} 
                                  onUpdate={(val) => {
                                    const newBullets = [...exp.bulletPoints];
                                    newBullets[bulletIndex] = val;
                                    updateExperience(exp.id, { bulletPoints: newBullets });
                                  }}
                                  context={`Role: ${exp.role} at ${exp.company}. Focus on quantifying impact.`}
                                />

                                {/* Fix This ✦ — calls single_bullet API (fast Groq path) */}
                                <Button
                                  id={`fix-bullet-${exp.id}-${bulletIndex}`}
                                  variant="ghost"
                                  size="sm"
                                  disabled={!bullet || fixingBulletKey === `${exp.id}-${bulletIndex}`}
                                  onClick={() => fixBullet(exp.id, bulletIndex, bullet, exp.role, exp.company)}
                                  className={cn(
                                    "h-7 px-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                                    "bg-amber-500/5 text-amber-500/70 hover:bg-amber-500/15 hover:text-amber-400 border border-amber-500/15"
                                  )}
                                >
                                  {fixingBulletKey === `${exp.id}-${bulletIndex}` ? (
                                    <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                                  ) : (
                                    <Zap className="w-3 h-3 mr-1.5" />
                                  )}
                                  {fixingBulletKey === `${exp.id}-${bulletIndex}` ? "Fixing..." : "Fix This"}
                                </Button>
                              </div>

                              {exp.bulletPoints.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-[10px] text-white/10 hover:text-red-500 font-bold uppercase tracking-widest"
                                  onClick={() => {
                                    const newBullets = exp.bulletPoints.filter((_, i) => i !== bulletIndex);
                                    updateExperience(exp.id, { bulletPoints: newBullets });
                                  }}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-4 py-6 border-2 border-dashed border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 text-white/30 hover:text-white transition-all rounded-2xl"
                      onClick={() => {
                        const newBullets = [...exp.bulletPoints, ""];
                        updateExperience(exp.id, { bulletPoints: newBullets });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Add Impact Point</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BulletFixModal — portal-style, rendered at component root */}
      <BulletFixModal
        payload={fixPayload}
        onClose={() => setFixPayload(null)}
      />
    </>
  );
}

