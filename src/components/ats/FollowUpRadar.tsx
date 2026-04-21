"use client";

import { useState, useEffect } from "react";
import { 
  History, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Send,
  Loader2,
  MoreVertical,
  Mail
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Application {
  id: string;
  company_name: string;
  job_title: string;
  status: string;
  applied_at: string;
  last_followup_at: string | null;
  followup_count: number;
}

export function FollowUpRadar() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .in("status", ["applied", "interview", "responded"])
      .order("applied_at", { ascending: false });

    if (!error) setApps(data || []);
    setLoading(false);
  };

  const getUrgency = (app: Application) => {
    const appliedDate = new Date(app.applied_at);
    const lastActionDate = app.last_followup_at ? new Date(app.last_followup_at) : appliedDate;
    const daysSinceLastAction = Math.floor((Date.now() - lastActionDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastAction >= 14) return { label: "Overdue", color: "text-rose-500", bg: "bg-rose-500/10", icon: <AlertCircle className="w-3 h-3" /> };
    if (daysSinceLastAction >= 7) return { label: "Follow Up", color: "text-amber-500", bg: "bg-amber-500/10", icon: <Clock className="w-3 h-3" /> };
    return { label: "Waiting", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: <CheckCircle2 className="w-3 h-3" /> };
  };

  const handleFollowUp = (app: Application) => {
    const script = `Hi ${app.company_name} team,\n\nI'm following up on my application for the ${app.job_title} position. I'm still very interested and would love to discuss how my background aligns with your team's goals.\n\nBest,\n[My Name]`;
    navigator.clipboard.writeText(script);
    toast.success("Follow-up script copied to clipboard!");
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
       <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
       <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Calculating Cadence Urgency...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-500 border border-emerald-500/20">
               <History className="w-5 h-5" />
            </div>
            <div>
               <h2 className="text-lg font-black text-white uppercase tracking-tight">Follow-Up Radar</h2>
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                 7 / 14 / 21 Day Institutional Cadence
               </p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {apps.length === 0 ? (
          <div className="p-12 rounded-3xl border border-dashed border-white/5 text-center text-zinc-600 text-[10px] font-black uppercase tracking-widest">
            No active applications in the nurturing pipeline
          </div>
        ) : (
          apps.map((app) => {
            const urgency = getUrgency(app);
            return (
              <div 
                key={app.id}
                className="group p-5 rounded-3xl bg-[#0C0C0E] border border-[#1F1F23] hover:border-emerald-500/30 transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                   <div className={`p-3 rounded-2xl ${urgency.bg} ${urgency.color} border border-white/5 transition-all`}>
                      <Mail className="w-5 h-5" />
                   </div>
                   <div className="space-y-1">
                      <div className="flex items-center gap-2">
                         <h3 className="text-sm font-black text-white uppercase tracking-tight">{app.job_title}</h3>
                         <span className="text-[10px] font-bold text-zinc-500">at {app.company_name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${urgency.bg} ${urgency.color} font-black text-[8px] uppercase tracking-widest`}>
                            {urgency.icon}
                            {urgency.label}
                         </div>
                         <div className="text-[9px] font-bold text-zinc-600">
                           Applied {new Date(app.applied_at).toLocaleDateString()}
                         </div>
                         <div className="text-[9px] font-bold text-zinc-600">
                           {app.followup_count} Follow-ups sent
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-2">
                   <Button 
                     size="sm"
                     onClick={() => handleFollowUp(app)}
                     className="bg-white/5 text-white hover:bg-white/10 h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[9px] border border-white/10"
                   >
                     <Send className="w-3.5 h-3.5 mr-2" /> 
                     Send Follow-up
                   </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
