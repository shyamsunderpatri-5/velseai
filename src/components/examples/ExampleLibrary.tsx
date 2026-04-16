"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Search, 
  Filter, 
  ChevronRight, 
  Sparkles,
  Briefcase,
  Code,
  LineChart,
  Palette,
  Megaphone
} from "lucide-react";

const EXAMPLES = [
  {
    title: "Senior Full Stack Engineer",
    company: "Google / Meta Style",
    role: "Engineering",
    score: 98,
    icon: Code,
    color: "text-blue-400"
  },
  {
    title: "Product Manager (SaaS)",
    company: "Airbnb / Stripe Style",
    role: "Product",
    score: 96,
    icon: Briefcase,
    color: "text-violet-400"
  },
  {
    title: "Data Scientist",
    company: "Nvidia / DeepMind Style",
    role: "Data Science",
    score: 97,
    icon: LineChart,
    color: "text-emerald-400"
  },
  {
    title: "Senior UI/UX Designer",
    company: "Apple / Vercel Style",
    role: "Design",
    score: 99,
    icon: Palette,
    color: "text-fuchsia-400"
  },
  {
    title: "Growth Marketing Lead",
    company: "HubSpot / TikTok Style",
    role: "Marketing",
    score: 95,
    icon: Megaphone,
    color: "text-amber-400"
  }
];

export function ExampleLibrary() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Pro Library</h1>
          <p className="text-zinc-500 font-medium mt-2">
            Elite-tier examples curated for 100% ATS compatibility.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input 
              placeholder="Search roles..." 
              className="h-12 w-64 bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 text-xs font-bold text-white focus:ring-violet-500/50"
            />
          </div>
          <Button variant="outline" className="h-12 w-12 border-white/5 bg-white/5 rounded-xl">
            <Filter className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {EXAMPLES.map((example, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rezi-card p-6 flex flex-col justify-between group hover:border-white/20 transition-all cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-2xl bg-zinc-900 border border-white/5 transition-transform group-hover:scale-110">
                  <example.icon className={`w-5 h-5 ${example.color}`} />
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-xs font-black text-emerald-400">{example.score}%</div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-zinc-600">ATS Score</div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white leading-tight mb-1">{example.title}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{example.company}</p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <Badge variant="outline" className="text-[8px] uppercase tracking-widest py-1 border-white/10 text-zinc-400">
                {example.role}
              </Badge>
              <div className="flex items-center gap-2 text-violet-400 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Use Example <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </motion.div>
        ))}

        {/* Coming Soon Card */}
        <div className="rezi-card p-6 border-dashed border-white/5 bg-transparent flex flex-col items-center justify-center text-center opacity-40">
          <Sparkles className="w-6 h-6 text-zinc-600 mb-4" />
          <h3 className="text-xs font-bold text-white uppercase tracking-widest">45+ More Examples</h3>
          <p className="text-[9px] text-zinc-600 mt-2">Uploading Pro Content Pack...</p>
        </div>
      </div>
    </div>
  );
}
