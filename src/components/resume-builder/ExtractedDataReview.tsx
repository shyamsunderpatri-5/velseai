"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExtractedResumeSchema, ExtractedResume } from "@/lib/resume-builder/schemas";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Save, Trash2, Plus, GripVertical, AlertCircle, CheckCircle2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface ExtractedDataReviewProps {
  initialData: ExtractedResume;
  onSave: (data: ExtractedResume) => void;
}

export function ExtractedDataReview({ initialData, onSave }: ExtractedDataReviewProps) {
  const form = useForm<ExtractedResume>({
    resolver: zodResolver(ExtractedResumeSchema),
    defaultValues: initialData as any,
  });

  const { control, handleSubmit, formState: { errors } } = form;

  const { fields: experienceFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: "experience" });
  const { fields: educationFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: "education" });

  const onSubmit = (data: ExtractedResume) => {
    onSave(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-emerald-400 font-bold text-sm">Extraction Successful</h3>
            <p className="text-zinc-400 text-xs mt-0.5">Please verify the parsed data before AI optimization.</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit(onSubmit as any)}
          className="w-full md:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Confirm & Proceed
        </button>
      </div>

      {/* Validation Error Banner */}
      {Object.keys(errors).length > 0 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: "auto" }}
          className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-500 font-bold text-sm">Validation Error</h3>
            <p className="text-red-400/80 text-xs mt-0.5">
              Some fields have missing or invalid data. Please check the regions highlighted in red:
            </p>
            <ul className="mt-2 space-y-1">
              {Object.keys(errors).map((key) => (
                <li key={key} className="text-[10px] text-red-400/60 uppercase tracking-wider font-bold">
                  • {key.replace(/([A-Z])/g, ' $1')} section requires attention
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 text-sm">
        <Accordion type="single" collapsible defaultValue="personal" className="w-full space-y-3">
          
          {/* PERSONAL INFO */}
          <AccordionItem value="personal" className={cn("border rounded-xl bg-[#0C0C0E] overflow-hidden transition-all", errors.personal ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.05)]" : "border-[#1F1F23]")}>
            <AccordionTrigger className="px-5 py-4 hover:bg-white/5 data-[state=open]:bg-white/5 transition-all">
              <div className="flex items-center gap-2 font-bold text-white">
                <span className={cn("transition-colors", errors.personal ? "text-red-500" : "text-violet-400")}>01.</span> 
                Personal Information
                {errors.personal && <AlertCircle className="w-4 h-4 text-red-500 ml-2" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pt-2 pb-6 border-t border-[#1F1F23]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Full Name</label>
                  <input 
                    {...form.register("personal.name")} 
                    className={cn(
                      "w-full bg-black border rounded-lg px-3 py-2 text-white outline-none transition-all",
                      errors.personal?.name ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]" : "border-white/10 focus:border-violet-500"
                    )} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email</label>
                  <input 
                    {...form.register("personal.email")} 
                    className={cn(
                      "w-full bg-black border rounded-lg px-3 py-2 text-white outline-none transition-all",
                      errors.personal?.email ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]" : "border-white/10 focus:border-violet-500"
                    )} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">LinkedIn</label>
                  <input {...form.register("personal.linkedin")} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Location Format (City, Country)</label>
                  <div className="flex gap-2">
                    <input {...form.register("personal.city")} placeholder="City" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none" />
                    <input {...form.register("personal.country")} placeholder="Country" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date of Birth</label>
                  <input {...form.register("personal.dateOfBirth")} placeholder="MM/DD/YYYY" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Nationality</label>
                  <input {...form.register("personal.nationality")} placeholder="e.g. German" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Visa Status</label>
                  <input {...form.register("personal.visaStatus")} placeholder="e.g. EU Citizen" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Marital Status</label>
                  <input {...form.register("personal.maritalStatus")} placeholder="Optional" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* EXPERIENCE */}
          <AccordionItem value="experience" className={cn("border rounded-xl bg-[#0C0C0E] overflow-hidden transition-all", errors.experience ? "border-red-500/50" : "border-[#1F1F23]")}>
            <AccordionTrigger className="px-5 py-4 hover:bg-white/5 data-[state=open]:bg-white/5 transition-all">
              <div className="flex items-center gap-2 font-bold text-white">
                <span className={cn("transition-colors", errors.experience ? "text-red-500" : "text-violet-400")}>02.</span> 
                Professional Experience
                {errors.experience && <AlertCircle className="w-4 h-4 text-red-500 ml-2" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pt-2 pb-6 border-t border-[#1F1F23]">
              <div className="space-y-6 mt-4">
                {experienceFields.map((field, index) => (
                  <div key={field.id} className="p-4 rounded-xl border border-white/5 bg-black/50 relative group">
                    <button 
                      type="button" 
                      onClick={() => removeExp(index)}
                      className="absolute top-4 right-4 p-1.5 rounded-md bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-10">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Company</label>
                        <input {...form.register(`experience.${index}.company` as const)} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Role</label>
                        <input {...form.register(`experience.${index}.role` as const)} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none" />
                      </div>
                    </div>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={() => appendExp({ company: "", role: "", startDate: "", endDate: "", location: "", responsibilities: [], achievements: [] })}
                  className="w-full py-3 rounded-xl border border-dashed border-white/20 text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Experience
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* EDUCATION */}
          <AccordionItem value="education" className={cn("border rounded-xl bg-[#0C0C0E] overflow-hidden transition-all", errors.education ? "border-red-500/50" : "border-[#1F1F23]")}>
            <AccordionTrigger className="px-5 py-4 hover:bg-white/5 data-[state=open]:bg-white/5 transition-all">
              <div className="flex items-center gap-2 font-bold text-white">
                <span className={cn("transition-colors", errors.education ? "text-red-500" : "text-violet-400")}>03.</span> 
                Education
                {errors.education && <AlertCircle className="w-4 h-4 text-red-500 ml-2" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pt-2 pb-6 border-t border-[#1F1F23]">
              <div className="space-y-4 mt-4">
                {educationFields.map((field, index) => (
                  <div key={field.id} className="p-4 rounded-xl border border-white/5 bg-black/50 relative group">
                    <button 
                      type="button" 
                      onClick={() => removeEdu(index)}
                      className="absolute top-4 right-4 p-1.5 rounded-md bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-10">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Institution</label>
                        <input {...form.register(`education.${index}.institution` as const)} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Degree</label>
                        <input {...form.register(`education.${index}.degree` as const)} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none" />
                      </div>
                    </div>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={() => appendEdu({ institution: "", degree: "", field: "", startYear: "", endYear: "", grade: "" })}
                  className="w-full py-3 rounded-xl border border-dashed border-white/20 text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Education
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="location-meta" className="border border-[#1F1F23] rounded-xl bg-[#0C0C0E] overflow-hidden">
            <AccordionTrigger className="px-5 py-4 hover:bg-white/5 data-[state=open]:bg-white/5 transition-all">
              <div className="flex items-center gap-2 font-bold text-white">
                <span className="text-violet-400">04.</span> Regional Metadata
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pt-2 pb-6 border-t border-[#1F1F23]">
              <div className="space-y-4 mt-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Formal Declaration (India Only)</label>
                  <textarea {...form.register("declaration")} placeholder="I hereby declare that the above-mentioned information is correct..." className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none min-h-[80px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">References (UK / Middle East)</label>
                  <textarea {...form.register("references")} placeholder="Available upon request" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none min-h-[60px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Photo URL (Germany / EU)</label>
                  <input {...form.register("photoUrl")} placeholder="https://..." className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </form>
    </div>
  );
}
