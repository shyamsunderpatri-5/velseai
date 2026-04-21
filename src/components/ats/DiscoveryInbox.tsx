"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Radar, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Sparkles,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";

interface JobLead {
  id: string;
  company_name: string;
  job_title: string;
  job_url: string;
  location: string;
  discovered_at: string;
  status: 'new' | 'dismissed' | 'pursued';
}

interface DiscoveryInboxProps {
  onAudit?: (url: string) => void;
}

export function DiscoveryInbox({ onAudit }: DiscoveryInboxProps) {
  const [leads, setLeads] = useState<JobLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("job_discovery")
      .select("*")
      .eq("status", "new")
      .order("discovered_at", { ascending: false });

    if (error) {
      toast.error("Failed to load discovery radar data");
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'dismissed' | 'pursued') => {
    const supabase = createClient();
    const { error } = await supabase
      .from("job_discovery")
      .update({ status })
      .eq("id", id);

    if (error) {
       toast.error("Protocol error: Status transition failed");
    } else {
       setLeads(leads.filter(l => l.id !== id));
       if (status === 'pursued') {
         toast.success("Opportunity locked. Redirecting to Audit...");
         const lead = leads.find(l => l.id === id);
         if (lead && onAudit) onAudit(lead.job_url);
       }
    }
  };

  const triggerScan = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/cron/scan");
      const data = await res.json();
      if (data.success) {
        toast.success(`Scan complete: Discoverd ${data.new_leads} new leads.`);
        fetchLeads();
      }
    } catch (e) {
      toast.error("Deep scan failed.");
    } finally {
      setScanning(false);
    }
  };

  if (loading) return (
     <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Calibrating Discovery Radar...</p>
     </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-600/10 text-violet-500 border border-violet-500/20">
               <Radar className="w-5 h-5" />
            </div>
            <div>
               <h2 className="text-lg font-black text-white uppercase tracking-tight">Discovery Inbox</h2>
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                 Live Feed from Elite Career Portals
               </p>
            </div>
         </div>
         <Button 
           size="sm" 
           onClick={triggerScan}
           disabled={scanning}
           className="bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[9px] h-8 border border-white/5"
         >
           {scanning ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Sparkles className="w-3 h-3 mr-2" />}
           Deep Scan
         </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <AnimatePresence mode="popLayout">
          {leads.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-16 rounded-3xl border border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-4"
            >
               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-700">
                  <Zap className="w-6 h-6" />
               </div>
               <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Radar Clear. Run a Deep Scan to discovery new leads.</p>
            </motion.div>
          ) : (
            leads.map((lead) => (
              <motion.div 
                key={lead.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="group p-5 rounded-3xl bg-[#0C0C0E] border border-[#1F1F23] hover:border-violet-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white font-black text-xs uppercase border border-white/5 group-hover:bg-violet-600/10 group-hover:text-violet-400 group-hover:border-violet-400/20 transition-all">
                      {lead.company_name[0]}
                   </div>
                   <div className="space-y-1">
                      <div className="flex items-center gap-2">
                         <h3 className="text-sm font-black text-white uppercase tracking-tight">{lead.job_title}</h3>
                         <Badge className="bg-white/5 text-zinc-500 text-[8px] h-4 uppercase font-black tracking-widest border-none">
                            {lead.company_name}
                         </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="flex items-center gap-1 text-zinc-600 group-hover:text-zinc-400 transition-colors">
                            <MapPin className="w-3 h-3" />
                            <span className="text-[10px] font-bold">{lead.location}</span>
                         </div>
                         <div className="flex items-center gap-1 text-zinc-600">
                            <span className="text-[10px] font-bold">Discovered {new Date(lead.discovered_at).toLocaleDateString()}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center">
                   <a 
                     href={lead.job_url} 
                     target="_blank" 
                     rel="noreferrer"
                     className="p-2 rounded-xl bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                   >
                     <ExternalLink className="w-4 h-4" />
                   </a>
                   <Button 
                     variant="ghost" 
                     size="sm"
                     onClick={() => updateStatus(lead.id, 'dismissed')}
                     className="text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 h-10 w-10 rounded-xl"
                   >
                     <XCircle className="w-5 h-5" />
                   </Button>
                   <Button 
                     size="sm"
                     onClick={() => updateStatus(lead.id, 'pursued')}
                     className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[9px]"
                   >
                     <CheckCircle2 className="w-4 h-4 mr-2" /> 
                     AUDIT LEAD
                   </Button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
