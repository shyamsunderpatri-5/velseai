"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, 
  Brain, 
  Plus, 
  History, 
  ChevronRight, 
  Play, 
  CheckCircle2, 
  Clock, 
  Trophy,
  Search,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CreateInterviewModal } from "@/components/interviews/CreateInterviewModal";
import { toast } from "react-hot-toast";

interface InterviewSession {
  id: string;
  job_title: string;
  company_name: string;
  status: "ongoing" | "completed";
  overall_score?: number;
  created_at: string;
}

export default function InterviewsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/settings"); // Reuse settings fetch or dedicated
      // For now, let's assume we have a dedicated sessions fetch or combine
      const sessionsRes = await fetch("/api/ai/interview/list"); 
      // I'll need to create this simple list API or use some other way.
      // Let's create the list API next.
      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error("Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-xl">
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 hover:bg-violet-500/30">
              <Zap className="w-3 h-3 mr-1 fill-current" /> Technical Drills
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              AI Mock <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-emerald-400">Technical</span> Rounds
            </h1>
            <p className="text-lg text-slate-300 font-medium">
              Don't just apply. Prepare. Our Senior Lead AI will grill you on DSA, System Design, and specific tech stacks.
            </p>
            <div className="flex gap-4 pt-2">
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-white text-slate-950 hover:bg-slate-100 font-bold rounded-xl h-12 px-6 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                <Plus className="w-5 h-5 mr-2" /> Start New Practice
              </Button>
            </div>
          </div>
          
          <div className="hidden lg:block relative">
            <div className="w-64 h-64 rounded-full bg-violet-500/20 blur-3xl absolute -top-10 -right-10 animate-pulse" />
            <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-inner w-72 space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-emerald-400">
                <Brain className="w-6 h-6" />
                <span className="font-mono text-sm tracking-widest uppercase">System Active</span>
              </div>
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    className="h-full bg-gradient-to-r from-violet-500 to-emerald-500" 
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-tighter">
                  <span>Logic Depth</span>
                  <span>85% Optimal</span>
                </div>
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                    <History className="w-3 h-3" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" /> Recent Drills
            </h2>
          </div>

          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse bg-slate-100 dark:bg-slate-900/50 h-24 border-dashed" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-slate-50 dark:bg-slate-900/20 rounded-3xl border border-dashed"
              >
                <Terminal className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">No interview history yet</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">
                  Ready to test your knowledge? Create your first technical mock interview session.
                </p>
                <Button variant="outline" className="mt-6 rounded-xl" onClick={() => setIsModalOpen(true)}>
                  Get Started
                </Button>
              </motion.div>
            ) : (
              sessions.map((session, idx) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card 
                    className="group border-slate-200 dark:border-white/5 hover:border-violet-500/50 transition-all cursor-pointer bg-white/50 backdrop-blur-sm dark:bg-slate-900/50"
                    onClick={() => router.push(`/interviews/${session.id}`)}
                  >
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          session.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {session.status === 'completed' ? <Trophy className="w-6 h-6" /> : <Play className="w-6 h-6 animate-pulse" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-violet-500 transition-colors">
                            {session.job_title}
                          </h3>
                          <p className="text-sm text-slate-500 flex items-center gap-1.5">
                            {session.company_name} • <Clock className="w-3 h-3" /> {new Date(session.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {session.overall_score && (
                          <div className="text-right mr-4 hidden sm:block">
                            <p className="text-xs text-slate-500 uppercase font-mono tracking-widest">Score</p>
                            <p className="text-xl font-black text-emerald-500">{session.overall_score}%</p>
                          </div>
                        )}
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar / Stats */}
        <div className="space-y-6">
          <Card className="border-none bg-gradient-to-br from-violet-600 to-indigo-700 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Zap className="w-32 h-32" />
            </div>
            <CardContent className="p-6 relative z-10 space-y-4">
              <h3 className="text-lg font-bold">Your Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-violet-100/70 uppercase">Total Sessions</p>
                  <p className="text-3xl font-black">{sessions.length}</p>
                </div>
                <div>
                  <p className="text-xs text-violet-100/70 uppercase">Avg Rating</p>
                  <p className="text-3xl font-black">
                    {sessions.length > 0 
                      ? Math.round(sessions.reduce((acc, s) => acc + (s.overall_score || 0), 0) / sessions.filter(s => s.overall_score).length || 0)
                      : 0}%
                  </p>
                </div>
              </div>
              <Button className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white">
                View Detailed Analytics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <Brain className="w-5 h-5 text-violet-500" /> Prep Tips
              </h3>
              <ul className="space-y-3">
                {[
                  "Be concise with code samples",
                  "Explain your trade-offs clearly",
                  "Ask for clarification if stuck",
                  "Discuss scaling & concurrency"
                ].map((tip, i) => (
                  <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateInterviewModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={(sessionId) => router.push(`/interviews/${sessionId}`)}
      />
    </div>
  );
}
