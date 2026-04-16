"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  User,
  Brain,
  Zap,
  Loader2,
  ChevronLeft,
  Trophy,
  MessageSquare,
  AlertCircle,
  FileText
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface InterviewSessionClientProps {
  sessionId: string;
  initialMessages: Message[];
  session: any;
}

export function InterviewSessionClient({ sessionId, initialMessages, session }: InterviewSessionClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(session.status === "completed");
  const [feedback, setFeedback] = useState(session.feedback || null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || isFinished) return;

    const userMessage = { role: "user" as const, content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          sessionId,
          userMessage: userMessage.content
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch (err: any) {
      toast.error(err.message || "Link unstable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (loading || isFinished) return;
    setLoading(true);
    toast.loading("Analyzing session performance...", { id: "finish-session" });

    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "finish",
          sessionId
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setIsFinished(true);
      setFeedback(data.feedback);
      toast.success("Intelligence report generated!", { id: "finish-session" });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to terminate link safely.", { id: "finish-session" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-h-[800px] gap-6">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 rounded-3xl bg-zinc-900 border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link href="/interviews">
            <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center border border-violet-500/20 shadow-lg shadow-violet-600/10">
            <Brain className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">{session.job_title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isFinished ? 'bg-zinc-600' : 'bg-emerald-500 animate-pulse'}`} />
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                {isFinished ? 'Analysis Complete' : 'Active Transmission'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="h-8 border-white/10 text-[9px] font-black uppercase tracking-widest px-4 hidden md:flex">
            <Building2 className="w-3 h-3 mr-2" /> {session.company_name}
          </Badge>
          {!isFinished && (
            <Button 
              size="sm" 
              onClick={handleFinish}
              className="h-9 px-6 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
            >
              Terminate Session
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex gap-6">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col gap-6">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 space-y-6 custom-scrollbar"
          >
            <AnimatePresence>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, x: m.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[85%] p-5 rounded-[2rem] text-sm font-medium leading-relaxed
                    ${m.role === 'user' 
                      ? 'bg-violet-600 text-white rounded-tr-none shadow-lg shadow-violet-600/10' 
                      : 'bg-zinc-900 border border-white/5 text-zinc-300 rounded-tl-none'}
                  `}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {loading && !isFinished && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="p-5 rounded-[2rem] bg-zinc-900 border border-white/5 rounded-tl-none">
                    <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!isFinished && (
            <div className="p-4 bg-zinc-900 border border-white/5 rounded-[2.5rem] shadow-2xl">
              <div className="relative flex items-center gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Articulate your technical response..."
                  className="flex-1 bg-transparent border-0 text-sm font-bold text-white placeholder:text-zinc-700 focus:ring-0 resize-none py-3 px-2 min-h-[50px] max-h-[150px]"
                />
                <Button 
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="h-12 w-12 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Intelligence Sidebar */}
        {isFinished && feedback && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 flex flex-col gap-6"
          >
            <Card className="bg-zinc-900 border-white/5 p-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
              <div className="relative w-24 h-24 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-zinc-800"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={283}
                    strokeDashoffset={283 - (283 * (feedback.overall_score || 0)) / 100}
                    className="text-emerald-500 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{feedback.overall_score}%</span>
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Score</span>
                </div>
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Session Summary</h3>
              <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                {feedback.summary || "Elite technical performance detected."}
              </p>
            </Card>

            <div className="flex-1 bg-zinc-900 border border-white/5 rounded-[2.5rem] p-6 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Key Strengths</span>
                </div>
                {(feedback.strengths || []).map((s: string, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    {s}
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Improvements</span>
                </div>
                {(feedback.improvements || []).map((s: string, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
