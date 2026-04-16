"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AIChatResponse } from "@/lib/ai/structured-outputs";
import {
  Send,
  Sparkles,
  Loader2,
  Bot,
  User,
  Wand2,
  Lightbulb,
  FileText,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  actions_applied?: boolean;
}

interface AIChatPanelProps {
  onApplyAction?: (response: AIChatResponse) => void;
  resumeContext?: string;
  className?: string;
}

const quickActions = [
  { label: "Elite summary", icon: Wand2, prompt: "Rewrite my summary for a Senior role at a top tech company. Make it punchy and metric-driven." },
  { label: "Quantify metrics", icon: Lightbulb, prompt: "Help me add quantifiable metrics (%, $, time) to my most recent experience." },
  { label: "ATS Keywords", icon: FileText, prompt: "Optimize my skills and experience for ATS readability. Add industry-standard keywords." },
];

export function AIChatPanel({ onApplyAction, resumeContext, className }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "I am VELSEAI. I have write-access to your resume state.\n\nTell me what to build, and I will execute it.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (userMessage?: string) => {
    const message = userMessage || input.trim();
    if (!message) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/resume-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          context: resumeContext,
          history: messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data: AIChatResponse = await response.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Protocol error. Retrying...",
        timestamp: new Date(),
        actions_applied: data.suggested_actions && data.suggested_actions.length > 0,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Execution: Auto-apply the actions back to the editor
      if (data.suggested_actions && data.suggested_actions.length > 0 && onApplyAction) {
        onApplyAction(data);
      }
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Network interruption. Please verify your connection.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    handleSend(prompt);
  };

  return (
    <div className={cn("flex flex-col h-full bg-[#08080A] border-l border-white/5", className)}>
      {/* Premium Chat Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#08080A] rounded-full" />
          </div>
          <div>
            <h3 className="font-black text-white text-xs uppercase tracking-widest">VELSEAI Core</h3>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">Active Sync</p>
          </div>
        </div>
      </div>

      {/* Modern Conversation Thread */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col gap-2",
              msg.role === "user" ? "items-end" : "items-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-5 py-3.5 text-sm transition-all duration-300",
                msg.role === "user"
                  ? "bg-violet-600 text-white shadow-xl shadow-violet-600/10"
                  : "bg-white/5 text-zinc-300 border border-white/5"
              )}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              
              {msg.actions_applied && (
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Changes Applied in real-time
                </div>
              )}
            </div>
            <span className="text-[10px] text-white/10 font-bold uppercase tracking-widest px-1">
              {msg.role === "user" ? "You" : "VELSEAI"} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col gap-2 items-start opacity-50">
            <div className="bg-white/5 rounded-2xl px-5 py-4 border border-white/5">
              <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Command Center */}
      <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-2 mb-3">
          <RefreshCw className="w-3 h-3 text-white/20" />
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Suggested Commands</span>
        </div>
        <div className="flex flex-col gap-2">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-left transition-all hover:bg-white/10 hover:border-violet-500/30"
              onClick={() => handleQuickAction(action.prompt)}
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-violet-500/20 group-hover:text-violet-400 transition-all">
                <action.icon className="w-4 h-4 text-white/40 group-hover:text-violet-400" />
              </div>
              <span className="text-[11px] font-bold text-white/40 group-hover:text-white transition-all">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* High-Impact Input */}
      <div className="p-6 border-t border-white/5 bg-[#050506]">
        <div className="relative group">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Command the AI..."
            className="bg-white/5 border-white/5 text-white placeholder:text-white/10 min-h-[56px] max-h-[160px] resize-none pr-14 rounded-2xl transition-all focus:bg-white/[0.07] focus:border-violet-500/50"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={cn(
              "absolute right-2.5 bottom-2.5 w-10 h-10 rounded-xl transition-all duration-300",
              input.trim() ? "bg-violet-600 text-white shadow-lg shadow-violet-600/40 opacity-100" : "bg-white/5 text-white/20 opacity-0"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}