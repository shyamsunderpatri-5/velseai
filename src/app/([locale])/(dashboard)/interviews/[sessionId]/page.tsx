"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Terminal, 
  Send, 
  Loader2, 
  ShieldCheck, 
  Clock, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Building2,
  Brain,
  ChevronRight,
  Monitor
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";

interface Message {
  role: "assistant" | "user";
  content: string;
}

export default function InterviewSessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [finishing, setFinishing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/ai/interview/detail?sessionId=${sessionId}`);
      if (!res.ok) throw new Error("Failed to load interview");
      const data = await res.json();
      setSessionInfo(data.session);
      setMessages(data.messages.filter((m: any) => m.role !== "system"));
    } catch (err) {
      toast.error("COULD NOT FIND SESSION");
      router.push("/interviews");
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading || finishing) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          sessionId,
          userMessage: userMsg
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (finishing) return;
    setFinishing(true);
    
    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "finish", sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setFeedback(data.feedback);
      toast.success("TECHNICAL EVALUATION COMPLETE");
    } catch (err: any) {
      toast.error(err.message);
      setFinishing(false);
    }
  };

  if (!sessionInfo) return (
    <div className="h-[80vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6">
      
      {/* Sidebar: Context */}
      <div className="lg:w-80 flex-shrink-0 space-y-4 hidden lg:block overflow-y-auto pr-2 custom-scrollbar">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push("/interviews")}
          className="mb-2 text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> All Interviews
        </Button>

        <Card className="border-violet-500/20 bg-violet-500/5 backdrop-blur-sm">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1">
              <Badge className="bg-emerald-500 text-white border-none rounded-md px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest mb-2">
                Live Round
              </Badge>
              <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                {sessionInfo.job_title}
              </h2>
              <p className="text-sm font-medium text-violet-600 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> {sessionInfo.company_name}
              </p>
            </div>
            
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-white/20">
                <p className="text-slate-400 font-mono uppercase tracking-tighter mb-1">Difficulty</p>
                <p className="font-bold text-slate-700 dark:text-slate-200 capitalize">{sessionInfo.difficulty}</p>
              </div>
              <div className="p-3 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-white/20">
                <p className="text-slate-400 font-mono uppercase tracking-tighter mb-1">Focus</p>
                <p className="font-bold text-slate-700 dark:text-slate-200">Deep Technical / Arch</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {!feedback && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 rounded-2xl text-xs space-y-2">
            <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Pro-Tip
            </p>
            <p className="text-amber-700/80 leading-relaxed italic">
              "The technical lead is testing your depth. Don't just give keywords—explain the 'why' behind architectural choices."
            </p>
          </div>
        )}
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-slate-950 rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-white/5 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
             <div className="flex items-center gap-2">
               <Monitor className="w-4 h-4 text-slate-400" />
               <span className="text-sm font-mono text-slate-300 tracking-wider">SECURE CONNECTION ESTABLISHED</span>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-500 hidden sm:block uppercase tracking-widest">
              GPT-4O TECHNICAL LEAD
            </span>
            {!feedback && (
              <Button 
                onClick={handleFinish} 
                className="bg-red-500 hover:bg-red-600 text-white h-8 px-4 text-xs font-bold rounded-lg shadow-lg shadow-red-500/20"
                disabled={finishing || loading}
              >
                {finishing ? "Analyzing..." : "End & Evaluate"}
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
          <AnimatePresence>
            {messages.map((m, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[85%] rounded-2xl p-4 ${
                  m.role === 'assistant' 
                    ? 'bg-slate-900 border border-white/5 text-slate-200' 
                    : 'bg-violet-600 text-white shadow-lg'
                }`}>
                  <div className="flex items-center gap-2 mb-2 opacity-50">
                    {m.role === 'assistant' ? <Brain className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                    <span className="text-[10px] uppercase font-bold tracking-tighter">
                      {m.role === 'assistant' ? 'Technical Lead' : 'You'}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">
                    {m.content}
                  </p>
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
                  </div>
                  <span className="text-xs font-mono text-slate-500 italic">Thinking...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Feedback Overlay */}
        <AnimatePresence>
          {feedback && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-6 overflow-y-auto"
            >
               <div className="max-w-2xl mx-auto space-y-8 py-10">
                 <div className="text-center space-y-4">
                   <div className="relative inline-block">
                     <svg className="w-32 h-32 transform -rotate-90">
                       <circle cx="64" cy="64" r="56" stroke="gray" strokeWidth="8" fill="transparent" className="opacity-10" />
                       <circle 
                         cx="64" cy="64" r="56" stroke="#10b981" strokeWidth="8" fill="transparent"
                         strokeDasharray={351.8}
                         strokeDashoffset={351.8 - (351.8 * feedback.overall_score) / 100}
                         className="transition-all duration-1000"
                        />
                     </svg>
                     <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-4xl font-black text-white">{feedback.overall_score}%</span>
                     </div>
                   </div>
                   <h3 className="text-2xl font-bold text-white tracking-tight">Interview Evaluation Complete</h3>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Card className="bg-slate-900 border-white/10">
                     <CardContent className="p-4">
                        <p className="text-emerald-400 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Strong Points
                        </p>
                        <ul className="text-sm space-y-2 text-slate-300">
                          {feedback.key_strengths?.map((s: string, i: number) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                     </CardContent>
                   </Card>
                   <Card className="bg-slate-900 border-white/10">
                     <CardContent className="p-4">
                        <p className="text-amber-400 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                          <Brain className="w-4 h-4" /> Gaps Identified
                        </p>
                        <ul className="text-sm space-y-2 text-slate-300">
                          {feedback.areas_for_improvement?.map((s: string, i: number) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                     </CardContent>
                   </Card>
                 </div>

                 <Card className="bg-violet-600 border-none shadow-2xl">
                    <CardContent className="p-6 space-y-3">
                      <p className="text-white/80 font-mono text-[10px] uppercase tracking-widest">Senior Lead Summary</p>
                      <p className="text-lg font-bold text-white italic">"{feedback.summary_assessment}"</p>
                    </CardContent>
                 </Card>

                 <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-white/10 hover:bg-white/5 text-white"
                      onClick={() => router.push("/interviews")}
                    >
                      Back to Dashboard
                    </Button>
                    <Button 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => window.location.reload()}
                    >
                      Retry Round
                    </Button>
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input area */}
        {!feedback && (
          <div className="p-4 bg-slate-900/80 border-t border-white/5 backdrop-blur-xl">
            <form onSubmit={handleSendMessage} className="relative group">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your technical answer here..."
                className="bg-black/50 border-white/10 text-white h-14 pl-5 pr-20 rounded-2xl focus:ring-violet-500 focus:border-violet-500 transition-all font-medium"
                disabled={loading}
              />
              <div className="absolute right-2 top-2">
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={loading || !input.trim()}
                  className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-10 w-10 shadow-lg shadow-violet-500/20"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </form>
            <p className="text-center text-[10px] text-slate-500 mt-2 font-mono">
              CTRL + ENTER TO SEND · ALL RESPONSES RECORDED FOR FEEDBACK
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
