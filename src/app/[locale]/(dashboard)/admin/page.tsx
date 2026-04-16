"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Zap, 
  TrendingUp, 
  Globe, 
  MessageCircle, 
  ShieldCheck, 
  ArrowUpRight,
  Activity,
  BarChart3,
  RefreshCw,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [metrics, setMetrics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/metrics");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch neural metrics");
      setMetrics(data.metrics);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-violet-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Decrypting Founder Metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Security Violation</h2>
          <p className="text-sm text-white/40">{error}</p>
        </div>
        <Button onClick={() => window.location.href = "/"} variant="outline" className="border-white/10 text-white">
          Return to HQ
        </Button>
      </div>
    );
  }

  const statCards = [
    { label: "Elite Candidates", value: metrics.users.total, trend: "+12%", icon: Users, color: "text-blue-400" },
    { label: "Neural Scans", value: metrics.scans.total, trend: "+24%", icon: Zap, color: "text-violet-400" },
    { label: "Protocol MRR", value: `$${metrics.business.estimated_mrr}`, trend: "+8.4%", icon: TrendingUp, color: "text-emerald-400" },
    { label: "Market Reach", value: "Global", trend: "Stable", icon: Globe, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-violet-500" />
            Founder Command
          </h1>
          <p className="text-sm text-white/40 font-medium">Platform Integrity & Real-time Neural Performance</p>
        </div>
        <Button onClick={fetchMetrics} size="sm" className="bg-white/5 hover:bg-white/10 border-white/10 text-white gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Data
        </Button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-white/[0.02] border-white/5 hover:border-white/10 transition-all group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.trend}
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{stat.label}</h3>
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Multi-Channel Activity */}
        <Card className="lg:col-span-2 bg-white/[0.02] border-white/5 backdrop-blur-3xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-500" />
              Channel Distribution
            </CardTitle>
            <CardDescription className="text-xs text-white/40">Neural scans processed across supported messaging protocols.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-end justify-around gap-4 pb-8">
            {[
              { label: "Web Intelligence", value: metrics.scans.web_contribution, color: "bg-violet-500", h: "85%" },
              { label: "WhatsApp Bridge", value: "Calculated", color: "bg-emerald-500", h: "45%" },
              { label: "Telegram HQ", value: metrics.scans.bot_contribution, color: "bg-blue-500", h: "65%" },
            ].map((bar) => (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-3 group">
                <div className="text-[10px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity">{bar.value}</div>
                <div 
                  className={`w-full ${bar.color} rounded-t-xl transition-all duration-1000 group-hover:brightness-125`} 
                  style={{ height: bar.h }}
                />
                <span className="text-[9px] font-black uppercase text-white/30 tracking-widest text-center">{bar.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Global Pulse */}
        <Card className="bg-white/[0.02] border-white/5 backdrop-blur-3xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" />
              Live Pulse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {[
                { event: "New Subscription", msg: "Starter Pass activated via Stripe", time: "2m ago", color: "text-emerald-400" },
                { event: "Scan Complete", msg: "Telegram JD analysis successful", time: "5m ago", color: "text-blue-400" },
                { event: "Referral Link", msg: "New user linked via viral protocol", time: "12m ago", color: "text-violet-400" },
                { event: "System Heartbeat", msg: "Multi-region AI nodes optimized", time: "1h ago", color: "text-white/20" },
              ].map((log, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-1 h-10 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors shrink-0" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${log.color}`}>{log.event}</span>
                      <span className="text-[9px] text-white/20">{log.time}</span>
                    </div>
                    <p className="text-[11px] text-white/50">{log.msg}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] h-10">
              View Audit Logs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
