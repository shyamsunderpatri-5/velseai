"use client";

import { motion } from "framer-motion";
import { 
  Plus, 
  ExternalLink, 
  ChevronRight, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  Target, 
  Trophy 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

const templates = [
  {
    id: "modern",
    title: "Protocol Alpha",
    subtitle: "Staff-Level Software Architecture",
    description: "High-density information grid designed to survive the first 6-second filter.",
    score: 98,
    badge: "Most Popular",
    color: "violet"
  },
  {
    id: "minimal",
    title: "Clean Logic",
    subtitle: "FAANG Standard (Minimalist)",
    description: "Zero-noise layout focused entirely on technical impact and quantifiable achievements.",
    score: 95,
    badge: "ATS Gold",
    color: "blue"
  },
  {
    id: "executive",
    title: "Founder Core",
    subtitle: "Management & CxO Excellence",
    description: "Sophisticated typography paired with executive-level project storytelling.",
    score: 92,
    badge: "Premium Vault",
    color: "amber"
  },
  {
    id: "creative",
    title: "Velocity UI",
    subtitle: "Design & Product Management",
    description: "Strategic use of accent colors to emphasize portfolio and vision metrics.",
    score: 89,
    badge: "Strategic Use",
    color: "emerald"
  }
];

export function TemplateGallery() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
    >
      {templates.map((template) => (
        <motion.div
          key={template.id}
          variants={item}
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] pointer-events-none" />
          
          <Card className="p-8 bg-zinc-900 border-white/5 rounded-[2.5rem] hover:border-violet-500/30 transition-all duration-500 shadow-2xl overflow-hidden">
            {/* Template Header */}
            <div className="flex items-start justify-between mb-8">
              <div className="space-y-3">
                <Badge variant="outline" className={cn(
                  "h-6 px-3 text-[9px] font-black uppercase tracking-widest border-transparent bg-white/5",
                  template.color === 'violet' ? "bg-violet-600/20 text-violet-400" :
                  template.color === 'blue' ? "bg-blue-600/20 text-blue-400" :
                  template.color === 'amber' ? "bg-amber-600/20 text-amber-400" :
                  "bg-emerald-600/20 text-emerald-400"
                )}>
                  {template.badge}
                </Badge>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-violet-400 transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-1">
                    {template.subtitle}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="text-2xl font-black text-white">{template.score}</div>
                <div className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em] mt-0.5">ATS Index</div>
              </div>
            </div>

            {/* Template Preview (Aesthetic Mockup) */}
            <div className="relative aspect-[4/3] rounded-3xl bg-black/40 border border-white/5 mb-8 overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
              <div className="absolute inset-x-8 top-8 bottom-0 bg-zinc-800 rounded-t-xl border-x border-t border-white/5 shadow-2xl p-6 space-y-4">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-white/10 rounded-lg animate-pulse" />
                    <div className="h-2 w-48 bg-white/5 rounded-lg" />
                  </div>
                  <div className="h-10 w-10 bg-white/5 rounded-xl" />
                </div>
                <div className="space-y-2 pt-4">
                  <div className="h-1.5 w-full bg-white/5 rounded-full" />
                  <div className="h-1.5 w-[90%] bg-white/5 rounded-full" />
                  <div className="h-1.5 w-[95%] bg-white/5 rounded-full" />
                </div>
              </div>
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <Link href={`/resume/new?template=${template.id}`}>
                  <Button className="h-14 px-8 bg-white text-black hover:bg-white/90 font-black text-xs uppercase tracking-[0.2em] rounded-2xl">
                    <Sparkles className="w-5 h-5 mr-3" /> Use Strategy
                  </Button>
                </Link>
              </div>
            </div>

            <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-8 px-2">
              {template.description}
            </p>

            {/* Features Row */}
            <div className="flex items-center gap-4 px-2">
              {[
                { icon: ShieldCheck, label: "ATS Pass" },
                { icon: Zap, label: "6s Audit" },
                { icon: Target, label: "Role-Centric" }
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <f.icon className="w-3.5 h-3.5 text-zinc-700" />
                  <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">{f.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
