"use client";

import { useState } from "react";
import { 
  MessageSquare, 
  TrendingUp, 
  Loader2, 
  Copy, 
  Check, 
  Briefcase,
  DollarSign,
  ShieldCheck,
  Zap,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ActiveCommandPanelProps {
  jobTitle: string;
  companyName: string;
  overallScore: number;
}

export function ActiveCommandPanel({ jobTitle, companyName, overallScore }: ActiveCommandPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [outreach, setOutreach] = useState<any>(null);
  const [negotiation, setNegotiation] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const generateOutreach = async (type: string) => {
    setLoading("outreach");
    try {
      // Mocking the API call for now - in production this hits /api/ai/outreach
      const res = await fetch("/api/ai/outreach", {
        method: "POST",
        body: JSON.stringify({ type, jobTitle, companyName }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      setOutreach(data);
    } catch (e) {
      toast.error("Signal lost. Could not generate outreach.");
    } finally {
      setLoading(null);
    }
  };

  const generateNegotiation = async () => {
    setLoading("negotiation");
    try {
      const res = await fetch("/api/ai/negotiation", {
        method: "POST",
        body: JSON.stringify({ jobTitle, companyName }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      setNegotiation(data);
    } catch (e) {
      toast.error("Deep intelligence check failed.");
    } finally {
      setLoading(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Intelligence copied to clipboard.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-12 border-t border-white/5">
      {/* LinkedIn Outreach Block */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-400" />
              Active Outreach Radar
            </h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">High-conversion LinkedIn protocols</p>
          </div>
          <div className="flex gap-2">
             {["Recruiter", "Hiring Manager"].map((type) => (
                <Button 
                  key={type}
                  variant="outline" 
                  size="sm"
                  onClick={() => generateOutreach(type)}
                  disabled={loading === "outreach"}
                  className="bg-white/5 border-white/10 text-[9px] font-black uppercase tracking-widest h-8 px-3"
                >
                  {loading === "outreach" ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Zap className="w-3 h-3 mr-2" />}
                  {type}
                </Button>
             ))}
          </div>
        </div>

        <div className="min-h-[160px] rounded-3xl border border-white/5 bg-white/[0.01] p-6 relative overflow-hidden flex flex-col justify-center">
            {outreach ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-sm text-zinc-300 italic leading-relaxed">"{outreach.message}"</p>
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                   <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Ready for Deployment
                   </div>
                   <Button 
                     variant="ghost" 
                     size="sm" 
                     onClick={() => copyToClipboard(outreach.message, 'outreach')}
                     className="h-8 rounded-xl bg-white/5 text-white text-[10px] font-bold"
                    >
                      {copied === 'outreach' ? <Check className="w-3 h-3 mr-2" /> : <Copy className="w-3 h-3 mr-2" />}
                      Copy Script
                   </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3 opacity-20">
                <MessageSquare className="w-10 h-10 mx-auto" />
                <p className="text-[9px] font-black uppercase tracking-widest">Select target to generate power-move script</p>
              </div>
            )}
        </div>
      </div>

      {/* Negotiation & Project Evaluation Block */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Active Intelligence
            </h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Negotiation & Signal Evaluation</p>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm"
              variant="outline"
              onClick={generateNegotiation}
              disabled={loading === "negotiation"}
              className="bg-white/5 border-white/10 text-[9px] font-black uppercase tracking-widest h-8 px-4"
            >
               {loading === "negotiation" ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <DollarSign className="w-3 h-3 mr-2" />}
               Negotiation
            </Button>
            <Button 
              size="sm"
              variant="outline"
              disabled
              className="bg-white/5 border-white/10 text-[9px] font-black uppercase tracking-widest h-8 px-4 opacity-50"
            >
               <TrendingUp className="w-3 h-3 mr-2" />
               ROI Check
            </Button>
          </div>
        </div>

        <div className="min-h-[160px] rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden">
            {negotiation ? (
              <div className="p-0 divide-y divide-white/5 animate-in fade-in slide-in-from-right-4 duration-500">
                 {[
                   { label: "High-Status Pivot", text: negotiation.pivot, icon: <Target className="w-3 h-3" /> },
                   { label: "Founder Leverage", text: negotiation.founder_leverage, icon: <DollarSign className="w-3 h-3" /> },
                   { label: "Review Anchor", text: negotiation.review_anchor, icon: <ShieldCheck className="w-3 h-3" /> }
                 ].map((script) => (
                   <div key={script.label} className="p-4 flex items-start gap-4 group">
                      <div className="p-2 rounded-lg bg-white/5 text-zinc-500 group-hover:text-emerald-400 group-hover:bg-emerald-400/10 transition-all">
                         {script.icon}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                           <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{script.label}</span>
                           <button 
                             onClick={() => copyToClipboard(script.text, script.label)}
                             className="text-zinc-700 hover:text-white"
                           >
                             {copied === script.label ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                           </button>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">{script.text}</p>
                      </div>
                   </div>
                 ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[160px] space-y-3 opacity-20 text-center p-6">
                <DollarSign className="w-10 h-10" />
                <p className="text-[9px] font-black uppercase tracking-widest">Authorize intelligence retrieval to reveal scripts</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
