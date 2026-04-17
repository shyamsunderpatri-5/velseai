"use client";

import { motion } from "framer-motion";
import { CheckCircle2, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";

export type TemplateId = "classic" | "modern" | "minimal";

interface TemplateSelectorProps {
  selectedTemplate: TemplateId | null;
  onSelect: (templateId: TemplateId) => void;
}

const templates = [
  {
    id: "classic" as TemplateId,
    name: "Classic Institutional",
    description: "Single column, black & white. Perfect for Finance, Legal, and stringent legacy ATS systems.",
    atsCompatibility: "100%",
    features: ["Zero tables", "Maximum parsing safety", "Traditional hierarchy"]
  },
  {
    id: "modern" as TemplateId,
    name: "Modern Tech",
    description: "Subtle color accents with clean typographical hierarchy. Best for Tech, Startups, and Marketing.",
    atsCompatibility: "95%",
    features: ["Two-column header", "Brand color accent", "Sleek readability"]
  },
  {
    id: "minimal" as TemplateId,
    name: "Minimalist Grid",
    description: "Heavy whitespace with thin geometric dividers. Stands out beautifully to human recruiters.",
    atsCompatibility: "98%",
    features: ["Expanded leading", "Thin structural lines", "Contemporary"]
  }
];

export function TemplateSelector({ selectedTemplate, onSelect }: TemplateSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
          <LayoutTemplate className="w-6 h-6 text-emerald-500" />
          Aesthetic Hierarchy
        </h2>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto">
          Select a structural template. All templates are guaranteed to parse perfectly through Workday and Greenhouse ATS engines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id;

          return (
            <motion.div
              key={template.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(template.id)}
              className={cn(
                "relative cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden group",
                isSelected
                  ? "bg-emerald-600/10 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                  : "bg-[#0C0C0E] border-[#1F1F23] hover:border-emerald-500/30"
              )}
            >
              {/* Abstract Visual Representation of the Template */}
              <div className="h-40 w-full border-b border-[#1F1F23] bg-zinc-950 p-4 relative flex justify-center items-center">
                {isSelected && (
                  <div className="absolute top-3 right-3 z-10">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-black" />
                    </motion.div>
                  </div>
                )}
                
                {template.id === "classic" && (
                  <div className="w-[120px] h-[160px] bg-white rounded-md shadow-sm p-3 opacity-90 transition-transform group-hover:scale-105">
                     <div className="h-1 w-full bg-zinc-800 mb-1"></div>
                     <div className="h-0.5 w-2/3 bg-zinc-800 mb-2 mx-auto"></div>
                     <div className="space-y-1 mt-3">
                       <div className="h-0.5 w-full bg-zinc-300"></div>
                       <div className="h-0.5 w-full bg-zinc-300"></div>
                       <div className="h-0.5 w-4/5 bg-zinc-300"></div>
                     </div>
                  </div>
                )}

                {template.id === "modern" && (
                  <div className="w-[120px] h-[160px] bg-white rounded-md shadow-sm opacity-90 transition-transform group-hover:scale-105 flex flex-col">
                     <div className="h-6 w-full bg-blue-600 rounded-t-md p-1.5 flex justify-between items-center">
                       <div className="h-1 w-1/3 bg-white/80"></div>
                       <div className="h-1 w-1/4 bg-white/50"></div>
                     </div>
                     <div className="p-2 space-y-1 mt-1">
                       <div className="h-1 w-full bg-zinc-300"></div>
                       <div className="h-0.5 w-full bg-zinc-200"></div>
                       <div className="h-0.5 w-4/5 bg-zinc-200"></div>
                     </div>
                  </div>
                )}

                {template.id === "minimal" && (
                  <div className="w-[120px] h-[160px] bg-white rounded-md shadow-sm p-3 opacity-90 transition-transform group-hover:scale-105">
                     <div className="h-8 w-8 rounded-full bg-zinc-200 mb-2"></div>
                     <div className="h-[1px] w-full bg-zinc-200 mb-2"></div>
                     <div className="space-y-2 mt-2">
                       <div className="h-[1px] w-full bg-zinc-300"></div>
                       <div className="h-[1px] w-4/5 bg-zinc-300"></div>
                     </div>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-white text-lg">{template.name}</h3>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">ATS Scorer</span>
                    <span className="text-emerald-400 font-bold text-sm tracking-tight">{template.atsCompatibility}</span>
                  </div>
                </div>
                
                <p className="text-sm text-zinc-400 leading-relaxed min-h-[60px]">
                  {template.description}
                </p>

                <div className="pt-2 border-t border-white/5">
                  <ul className="space-y-1.5">
                    {template.features.map((feature, i) => (
                      <li key={i} className="text-[11px] text-zinc-500 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-zinc-700" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
