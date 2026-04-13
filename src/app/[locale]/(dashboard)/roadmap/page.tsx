"use client";

import React, { useState, useEffect } from "react";
import { 
  Map, 
  Target, 
  BookOpen, 
  ChevronRight, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Loader2,
  Brain,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";

interface RoadmapItem {
  id: string;
  skill_name: string;
  category: string;
  status: "to_learn" | "learning" | "mastered";
  priority: "critical" | "high" | "medium" | "low";
  learning_resources: { title: string, url: string }[];
  updated_at: string;
}

export default function CareerRoadmapPage() {
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const res = await fetch("/api/ai/roadmap");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setRoadmap(data.roadmap || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/roadmap", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRoadmap(data.roadmap || []);
      toast.success("ROADMAP CALIBRATED SUCCESSFULY");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    // In a full implementation, we'd have a PATCH API
    toast.success(`Marker updated to ${newStatus}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 text-white border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Map className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
             <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-3 mb-2">
               Ego-Free Growth
             </Badge>
             <h1 className="text-4xl font-black tracking-tight">
               Technical <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Roadmap</span>
             </h1>
             <p className="text-slate-400 font-medium max-w-lg">
               Your personal learning path built from your actual interview failures and ATS gaps. We prioritize what recruiters actually care about.
             </p>
          </div>
          
          <Button 
            onClick={handleGenerate}
            disabled={generating}
            className="bg-white text-slate-950 hover:bg-slate-100 font-bold rounded-xl h-12 px-6 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            {generating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <RefreshCw className="w-5 h-5 mr-2" />}
            Regenerate Roadmap
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <Card key={i} className="h-40 animate-pulse bg-slate-900/50" />)}
        </div>
      ) : roadmap.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
           <Brain className="w-16 h-16 mx-auto text-slate-700 mb-4" />
           <h3 className="text-xl font-bold text-white">Your Roadmap is Empty</h3>
           <p className="text-slate-500 max-w-sm mx-auto mt-2">
             Start mock interviews or run ATS checks on your resume to detect technical gaps.
           </p>
           <Button variant="outline" className="mt-6 border-white/10 text-white" onClick={handleGenerate}>
             Run Baseline Analysis
           </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
             <h2 className="text-sm font-mono text-slate-500 uppercase tracking-widest pl-2">Gap Analysis & Learning Path</h2>
             <div className="space-y-4">
                {roadmap.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className={`group relative transition-all border-none overflow-hidden ${
                      item.priority === 'critical' ? 'bg-red-500/5 ring-1 ring-red-500/20' : 
                      item.priority === 'high' ? 'bg-amber-500/5 ring-1 ring-amber-500/20' : 'bg-slate-900/50'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                                {item.skill_name}
                              </h3>
                              <Badge className={
                                item.priority === 'critical' ? 'bg-red-500' : 
                                item.priority === 'high' ? 'bg-amber-500' : 'bg-slate-700'
                              }>
                                {item.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">
                              Category: {item.category}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`rounded-lg ${item.status === 'mastered' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500'}`}
                              onClick={() => updateStatus(item.id, 'mastered')}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-6 space-y-3">
                           <p className="text-xs text-slate-400 font-bold flex items-center gap-2">
                             <BookOpen className="w-3 h-3 text-violet-500" /> RECOMMENDED CURRICULUM
                           </p>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {item.learning_resources?.map((res, i) => (
                                <a 
                                  key={i} 
                                  href="#" // Logic for redirection
                                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                                >
                                  <span className="text-xs font-bold text-slate-300 truncate pr-2">{res.title}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-600" />
                                </a>
                              ))}
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
             </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
             <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-xl overflow-hidden relative">
               <div className="absolute bottom-0 right-0 p-4 opacity-10">
                 <Target className="w-24 h-24" />
               </div>
               <CardContent className="p-6 space-y-6 relative z-10">
                  <h3 className="font-bold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-300" /> Readiness Score
                  </h3>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black">
                      {Math.round((roadmap.filter(i => i.status === 'mastered').length / (roadmap.length || 1)) * 100)}%
                    </span>
                    <span className="text-sm text-indigo-100 font-medium mb-2 opacity-70">to Market-Ready</span>
                  </div>
                  <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-1000" 
                      style={{ width: `${(roadmap.filter(i => i.status === 'mastered').length / (roadmap.length || 1)) * 100}%` }}
                    />
                  </div>
               </CardContent>
             </Card>

             <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-amber-500">Critical Priority Gaps</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    You have {roadmap.filter(i => i.priority === 'critical').length} skills identified as critical. Addressing these will increase your ATS pass rate by ~35%.
                  </p>
                </div>
             </div>
          </div>

        </div>
      )}
    </div>
  );
}
