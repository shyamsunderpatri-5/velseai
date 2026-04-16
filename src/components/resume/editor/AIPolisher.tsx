"use client";

import * as React from "react";
import { Sparkles, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface AIPolisherProps {
  value: string;
  onUpdate: (newValue: string) => void;
  context?: string;
  className?: string;
}

export function AIPolisher({ value, onUpdate, context, className }: AIPolisherProps) {
  const [isPolishing, setIsPolishing] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handlePolish = async () => {
    if (!value || isPolishing) return;

    setIsPolishing(true);
    try {
      const response = await fetch("/api/ai/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: value,
          context: context,
        }),
      });

      if (!response.ok) throw new Error("Polish failed");

      const data = await response.json();
      if (data.polished) {
        onUpdate(data.polished);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
        toast.success("Content polished!", {
          icon: "✨",
          style: {
            background: "rgba(124, 58, 237, 0.1)",
            border: "1px solid rgba(124, 58, 237, 0.2)",
            color: "#7C3AED",
          }
        });
      }
    } catch (error) {
      console.error("Polish error:", error);
      toast.error("AI couldn't polish this right now");
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handlePolish}
      disabled={!value || isPolishing}
      className={cn(
        "h-7 px-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-500",
        success ? "bg-emerald-500/10 text-emerald-500" : "bg-violet-600/5 text-violet-500 hover:bg-violet-500/20 hover:text-white border border-violet-500/10",
        className
      )}
    >
      {isPolishing ? (
        <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
      ) : success ? (
        <Check className="w-3 h-3 mr-1.5" />
      ) : (
        <Sparkles className="w-3 h-3 mr-1.5" />
      )}
      {isPolishing ? "Polishing..." : success ? "Done" : "Polish"}
    </Button>
  );
}
