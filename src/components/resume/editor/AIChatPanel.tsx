"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Send,
  Sparkles,
  Loader2,
  Bot,
  User,
  X,
  Wand2,
  Lightbulb,
  FileText,
  RefreshCw,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatPanelProps {
  onInsertText?: (text: string) => void;
  resumeContext?: string;
  className?: string;
}

const quickActions = [
  { label: "Improve summary", icon: Wand2, prompt: "Improve my professional summary" },
  { label: "Add bullet points", icon: Lightbulb, prompt: "Generate achievement bullet points for my experience" },
  { label: "Fix grammar", icon: RefreshCw, prompt: "Fix grammar and improve clarity" },
  { label: "Make it ATS-friendly", icon: FileText, prompt: "Make my resume more ATS-friendly" },
];

export function AIChatPanel({ onInsertText, resumeContext, className }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI resume assistant. I can help you:\n\n• Improve your professional summary\n• Generate achievement bullet points\n• Fix grammar and clarity\n• Make your resume ATS-friendly\n• Suggest skills to add\n\nWhat would you like to work on?",
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
          history: messages.slice(-5),
        }),
      });

      const data = await response.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I couldn't process that. Try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
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

  const handleInsert = (content: string) => {
    if (onInsertText) {
      onInsertText(content);
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-[#18181B] border-l border-white/5", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">AI Assistant</h3>
            <p className="text-xs text-zinc-500">Resume helper</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                  msg.role === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-[#27272A] text-zinc-200 border border-white/5"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.role === "assistant" && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-zinc-400 hover:text-white"
                      onClick={() => handleInsert(msg.content)}
                    >
                      Insert
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-zinc-400 hover:text-white"
                      onClick={() => setInput(msg.content)}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-zinc-300" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-[#27272A] rounded-2xl px-4 py-3 border border-white/5">
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-white/5">
        <p className="text-xs text-zinc-500 mb-2">Quick actions</p>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              className="text-xs bg-transparent border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
              onClick={() => handleQuickAction(action.prompt)}
            >
              <action.icon className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to help with your resume..."
            className="bg-[#27272A] border-white/10 text-white placeholder:text-zinc-500 min-h-[44px] max-h-[120px] resize-none"
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
            className="bg-purple-600 hover:bg-purple-700 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}