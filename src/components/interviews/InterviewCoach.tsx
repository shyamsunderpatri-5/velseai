"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  Send,
  Sparkles,
  RefreshCw,
  Target,
  User,
  Brain,
  Zap,
  Loader2,
  ChevronLeft,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useResumeStore } from "@/stores/resumeStore";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function InterviewCoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const { content: resumeContent, title: resumeTitle } = useResumeStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startSession = async () => {
    setIsStarted(true);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [],
          jobDescription: "General Staff Software Engineer Position", // Default if none selected
          resumeContent
        }),
      });
      const data = await res.json();
      setMessages([{ role: "assistant", content: data.message }]);
    } catch (err) {
      toast.error("Failed to establish secure interview link");
      setIsStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user" as const, content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          jobDescription: "General Staff Software Engineer Position",
          resumeContent
        }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.message }]);
    } catch (err) {
      toast.error("Connection lost with Interview Agent");
    } finally {
      setLoading(false);
    }
  };

  if (!isStarted) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full p-12 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 mx-auto mb-8 shadow-2xl shadow-violet-500/10">
            <Brain className="w-10 h-10 text-violet-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-4">AI Interview Coach</h1>
          <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.3em] mb-12">
            Elite Simulation Protocol • 23 Metrics Awareness
          </p>
          
          <div className="space-y-4 mb-12 text-left">
            {[
              "Real-time feedback on behavioral signals",
              "Technical depth analysis based on your resume",
              "JD-specific questioning matrix",
              "Executive stress-test simulator"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/5">
                <Zap className="w-4 h-4 text-violet-400" />
                <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">{feature}</span>
              </div>
            ))}
          </div>

          <Button 
            onClick={startSession}
            className="w-full h-16 bg-white text-black hover:bg-white/90 font-black text-[12px] uppercase tracking-[0.2em] rounded-2xl"
          >
            Initiate Session
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto h-[80vh] flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
            <User className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">AI Executive Recruiter</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Active Analysis Session</span>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="h-8 border-white/10 text-[9px] font-black uppercase tracking-widest px-4">
          Resume: {resumeTitle || "Untitled"}
        </Badge>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 space-y-8 custom-scrollbar"
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
                max-w-[80%] p-6 rounded-[2rem] text-sm font-medium leading-relaxed
                ${m.role === 'user' 
                  ? 'bg-violet-600 text-white rounded-tr-none' 
                  : 'bg-white/[0.03] border border-white/5 text-white/80 rounded-tl-none'}
              `}>
                {m.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="p-6 rounded-[2rem] bg-white/[0.01] border border-white/5 rounded-tl-none">
                <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Input */}
      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl">
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
            placeholder="Construct your response with quantifiable impact..."
            className="flex-1 bg-transparent border-0 text-sm font-bold text-white placeholder:text-white/10 focus:ring-0 resize-none py-4 px-2 h-14"
          />
          <div className="flex items-center gap-2 h-14 pr-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-10 w-10 text-white/20 hover:text-white"
              onClick={() => toast.success("STT Protocol Initializing...")}
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="h-12 px-8 bg-white text-black hover:bg-white/90 font-black text-[10px] uppercase tracking-widest rounded-xl"
            >
              <Send className="w-3 h-3 mr-2" />
              Transmit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
