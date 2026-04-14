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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TEMPLATES = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and professional with a touch of color",
    preview: "bg-gradient-to-br from-slate-800 to-slate-900",
    accent: "#7C3AED",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional two-column layout",
    preview: "bg-white",
    accent: "#1A1A2E",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Stand out with unique design elements",
    preview: "bg-gradient-to-br from-purple-900 to-pink-900",
    accent: "#EC4899",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Less is more - clean and simple",
    preview: "bg-gray-100",
    accent: "#6B7280",
  },
  {
    id: "tech",
    name: "Tech",
    description: "Perfect for software engineers",
    preview: "bg-slate-900",
    accent: "#10B981",
  },
];

interface TemplateSelectorProps {
  currentTemplate: string;
  onSelect: (templateId: string) => void;
  className?: string;
}

export function TemplateSelector({ currentTemplate, onSelect, className }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(
    TEMPLATES.findIndex(t => t.id === currentTemplate) || 0
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
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 border-white/10 bg-white/5 text-white/70 hover:text-white gap-2"
      >
        <Layout className="w-4 h-4" />
        <span className="text-xs font-medium">{current.name}</span>
        <div 
          className="w-3 h-3 rounded-full ml-2" 
          style={{ backgroundColor: current.accent }}
        />
      </Button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-[#18181B] border border-white/10 rounded-2xl p-4 shadow-2xl z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm">Choose Template</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          {/* Preview Card */}
          <div className="relative mb-4">
            <div 
              className={cn(
                "h-32 rounded-xl border border-white/10 flex items-center justify-center",
                current.preview
              )}
            >
              <FileText className={cn(
                "w-12 h-12",
                ["classic", "minimal"].includes(current.id) ? "text-gray-400" : "text-white/50"
              )} />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
              <Button 
                size="sm"
                onClick={() => {
                  onSelect(current.id);
                  setIsOpen(false);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-xs"
              >
                <Check className="w-3 h-3 mr-1" />
                Apply
              </Button>
            </div>
          </div>

          {/* Template Info */}
          <div className="text-center mb-4">
            <h4 className="font-medium text-white text-sm">{current.name}</h4>
            <p className="text-xs text-zinc-500">{current.description}</p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              className="text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex gap-1">
              {TEMPLATES.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    idx === currentIndex ? "bg-purple-500" : "bg-zinc-700"
                  )}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="text-zinc-400 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Color customization */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-xs text-zinc-500">Accent Color</span>
            </div>
            <div className="flex gap-2">
              {["#7C3AED", "#EC4899", "#10B981", "#F59E0B", "#3B82F6"].map((color) => (
                <button
                  key={color}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                    current.accent === color ? "border-white" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onSelect(current.id);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}