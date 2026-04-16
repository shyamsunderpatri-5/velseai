"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  Layout, 
  Palette,
  Check,
  ChevronLeft,
  ChevronRight,
  Type,
  X,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const TEMPLATES = [
  {
    id: "modern",
    name: "Modern Elite",
    description: "Multi-column, high-impact design for tech innovators.",
    preview: "bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20",
    accent: "#7C3AED",
  },
  {
    id: "tech",
    name: "Architect",
    description: "Optimized for Engineering and Product protocols.",
    preview: "bg-slate-900",
    accent: "#10B981",
  },
  {
    id: "creative",
    name: "Maverick",
    description: "Bold typography and progressive section layouts.",
    preview: "bg-gradient-to-br from-purple-900 to-pink-900",
    accent: "#EC4899",
  },
  {
    id: "classic",
    name: "Executive",
    description: "The gold standard for leadership and traditional fields.",
    preview: "bg-white/5",
    accent: "#FFFFFF",
  },
  {
    id: "minimal",
    name: "Zenith",
    description: "Focus on clarity. Zero clutter, maximum signal.",
    preview: "bg-zinc-800",
    accent: "#A1A1AA",
  },
];

const ACCENTS = ["#7C3AED", "#10B981", "#EC4899", "#3B82F6", "#F59E0B", "#FFFFFF"];
const FONTS = [
  { name: "Inter", value: "font-inter" },
  { name: "Outfit", value: "font-outfit" },
  { name: "Playfair", value: "font-playfair" },
];

interface TemplateSelectorProps {
  currentTemplate: string;
  onSelect: (templateId: string) => void;
  className?: string;
}

export function TemplateSelector({ currentTemplate, onSelect, className }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(
    Math.max(0, TEMPLATES.findIndex(t => t.id === currentTemplate))
  );

  const current = TEMPLATES[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? TEMPLATES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === TEMPLATES.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-9 px-4 bg-white/5 border border-white/5 hover:border-violet-500/30 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all duration-500 gap-3 group",
          isOpen && "border-violet-500/50 bg-violet-500/10 text-white"
        )}
      >
        <Layers className={cn("w-4 h-4 transition-transform duration-500", isOpen ? "rotate-180" : "group-hover:scale-110")} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{current.name}</span>
        <div 
          className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)]" 
          style={{ backgroundColor: current.accent }}
        />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for focus */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-[#050506]/60 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-full mt-4 right-0 w-[360px] bg-[#0A0A0C] border border-white/10 rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
            >
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 blur-[60px] pointer-events-none" />
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-black text-white text-xs uppercase tracking-[0.3em]">Design Laboratory</h3>
                  <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">Configure your visual protocol</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full text-white/20 hover:text-white hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Template Preview Carousel */}
              <div className="relative group mb-10">
                <div 
                  className={cn(
                    "aspect-[1.4/1] rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden transition-all duration-700",
                    current.preview
                  )}
                >
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <FileText className="w-16 h-16 text-white/40 drop-shadow-2xl" />
                    <Button 
                      size="sm"
                      onClick={() => {
                        onSelect(current.id);
                        setIsOpen(false);
                      }}
                      className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-black text-[10px] uppercase tracking-widest shadow-xl"
                    >
                      Deploy Protocol
                    </Button>
                  </motion.div>
                </div>
                
                <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Template Info */}
                <div className="text-center">
                  <h4 className="font-black text-white text-sm uppercase tracking-widest mb-2">{current.name}</h4>
                  <p className="text-[11px] text-white/30 font-medium leading-relaxed px-4">{current.description}</p>
                </div>

                {/* Accent Color Section */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Palette className="w-3.5 h-3.5 text-violet-500" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Chromatic Accent</span>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    {ACCENTS.map((color) => (
                      <button
                        key={color}
                        className={cn(
                          "w-8 h-8 rounded-full border-4 transition-all duration-300 hover:scale-125",
                          current.accent === color ? "border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          // Note: In real app, we'd update store theme color
                          onSelect(current.id);
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Typography Section */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Type className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Typography Matrix</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {FONTS.map((font) => (
                      <button
                        key={font.value}
                        className={cn(
                          "py-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest transition-all",
                          "hover:bg-white/10 hover:border-white/10"
                        )}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}