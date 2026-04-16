"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  CreditCard,
  Users,
  Shield,
  Copy,
  Check,
  Loader2,
  Crown,
  MessageCircle,
  LogOut,
  ChevronRight,
  Settings as SettingsIcon,
  Bell,
  Fingerprint,
  Smartphone,
  Globe,
  Clock,
  ShieldCheck,
  Zap,
  TrendingUp
} from "lucide-react";
import { WhatsAppSettings } from "@/components/settings/WhatsAppSettings";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: string;
  plan_expires_at: string | null;
  referral_code: string;
  free_months_earned: number;
}

interface Subscription {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  started_at: string;
  expires_at: string;
}

type TabType = "profile" | "subscription" | "referrals" | "security" | "whatsapp";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = React.useState<TabType>("profile");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([]);
  const [formData, setFormData] = React.useState({
    fullName: "",
  });
  const [whatsappSession, setWhatsappSession] = React.useState<any>(null);

  React.useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      if (data.profile) {
        setProfile(data.profile);
        setFormData({ fullName: data.profile.full_name || "" });
        setSubscriptions(data.subscriptions || []);
        setWhatsappSession(data.whatsappSession);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: formData.fullName }),
      });
      const data = await response.json();
      if (data.profile) {
        setProfile(data.profile);
        toast.success("Identity synchronized successfully");
      }
    } catch (error) {
      toast.error("Failed to synchronize protocols");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "pro":
        return <Badge className="bg-violet-600/20 text-violet-400 border-violet-500/20 px-3 py-1 font-black uppercase text-[10px] tracking-widest">Priority Elite</Badge>;
      case "lifetime":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1 font-black uppercase text-[10px] tracking-widest"><Crown className="w-3 h-3 mr-1.5" />Infinite Alpha</Badge>;
      default:
        return <Badge className="bg-white/5 text-zinc-500 border-white/10 px-3 py-1 font-black uppercase text-[10px] tracking-widest">Free Protocol</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">Synchronizing Protocols...</p>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: any; description: string }[] = [
    { id: "profile", label: "Identity", icon: User, description: "Parameter Configuration" },
    { id: "subscription", label: "Authorization", icon: CreditCard, description: "Access Tiers" },
    { id: "referrals", label: "Network", icon: Users, description: "Viral Propagation" },
    { id: "security", label: "Hardening", icon: Shield, description: "Security Matrix" },
    { id: "whatsapp", label: "Integrator", icon: MessageCircle, description: "WhatsApp Node" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 px-4 sm:px-6">
      {/* High-Fidelity Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[18px] bg-violet-600 flex items-center justify-center shadow-2xl shadow-violet-600/30">
              <span className="text-white font-black text-2xl tracking-tighter italic">V</span>
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none italic">Mission Control</h1>
              <p className="text-zinc-600 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Personal Identity & Data Matrix</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">System Online</span>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="h-10 px-5 text-rose-500 hover:text-white hover:bg-rose-600 font-black uppercase tracking-widest text-[10px] rounded-xl border border-rose-500/10 transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Purge Session
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-12">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group text-left border",
                activeTab === tab.id 
                  ? "bg-violet-600 border-violet-500/50 text-white shadow-2xl shadow-violet-600/20" 
                  : "bg-[#1A1C26] border-[#2D313F] text-zinc-500 hover:border-violet-500/30 hover:text-zinc-300"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                activeTab === tab.id ? "bg-white/20 scale-110" : "bg-[#0F0F12] border border-[#2D313F] group-hover:border-violet-500/20"
              )}>
                <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-white" : "group-hover:text-violet-400")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-[12px] uppercase tracking-widest">{tab.label}</p>
                <p className={cn(
                  "text-[10px] truncate font-bold uppercase tracking-widest mt-0.5",
                  activeTab === tab.id ? "text-white/60" : "text-zinc-700"
                )}>
                  {tab.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Dynamic Workspace Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Profile Intelligence Workspace */}
              {activeTab === "profile" && (
                <div className="space-y-8">
                  <div className="bg-[#1A1C26] border border-[#2D313F] rounded-[32px] p-8 sm:p-12 shadow-2xl overflow-hidden relative">
                    <div className="flex flex-col sm:flex-row items-center gap-10 mb-14 pb-14 border-b border-[#2D313F]">
                      <div className="relative">
                        <div className="absolute inset-0 bg-violet-600/20 blur-[30px] rounded-full scale-125 opacity-50" />
                        <Avatar className="w-24 h-24 border-4 border-[#0F0F12] shadow-2xl relative">
                          <AvatarFallback className="bg-violet-600 text-white text-3xl font-black italic">
                            {profile?.full_name?.[0] || profile?.email?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-[#1A1C26] flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="text-center sm:text-left space-y-3">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{profile?.full_name || "Protocol Alpha"}</h2>
                          {getPlanBadge(profile?.plan || "free")}
                        </div>
                        <p className="text-zinc-600 font-black uppercase text-[10px] tracking-[0.3em]">{profile?.email}</p>
                      </div>
                    </div>

                    {/* IDENTITY PARAMETER TABLE */}
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 px-2">Identity Parameters</h3>
                      <div className="bg-[#0F0F12] border border-[#2D313F] rounded-[24px] overflow-hidden">
                        <div className="grid grid-cols-12 border-b border-[#2D313F] bg-white/[0.02] py-4 px-6">
                          <div className="col-span-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Parameter</div>
                          <div className="col-span-8 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Configuration</div>
                        </div>
                        
                        {/* Name Row */}
                        <div className="grid grid-cols-12 py-6 px-6 items-center border-b border-[#2D313F]/50 hover:bg-white/[0.01] transition-colors">
                          <div className="col-span-4 flex items-center gap-3">
                            <Fingerprint className="w-4 h-4 text-zinc-700" />
                            <span className="text-xs font-black text-white uppercase tracking-widest">Operational Name</span>
                          </div>
                          <div className="col-span-8 flex items-center gap-4">
                            <Input
                              value={formData.fullName}
                              onChange={(e) => setFormData({ fullName: e.target.value })}
                              className="h-11 bg-transparent border-none text-white focus:ring-1 focus:ring-violet-500 placeholder:text-zinc-800 font-bold"
                              placeholder="Update Identity..."
                            />
                            {formData.fullName !== profile?.full_name && (
                              <Badge className="bg-amber-500/10 text-amber-500 border-none text-[9px] uppercase font-black">Modified</Badge>
                            )}
                          </div>
                        </div>

                        {/* Email Row */}
                        <div className="grid grid-cols-12 py-6 px-6 items-center border-b border-[#2D313F]/50 hover:bg-white/[0.01] transition-colors">
                          <div className="col-span-4 flex items-center gap-3">
                            <Globe className="w-4 h-4 text-zinc-700" />
                            <span className="text-xs font-black text-white uppercase tracking-widest">Secure Endpoint</span>
                          </div>
                          <div className="col-span-8 flex items-center gap-4">
                            <span className="text-sm font-bold text-zinc-600">{profile?.email}</span>
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] uppercase font-black">Verified Protocol</Badge>
                          </div>
                        </div>

                        {/* ID Row */}
                        <div className="grid grid-cols-12 py-6 px-6 items-center hover:bg-white/[0.01] transition-colors">
                          <div className="col-span-4 flex items-center gap-3">
                            <Shield className="w-4 h-4 text-zinc-700" />
                            <span className="text-xs font-black text-white uppercase tracking-widest">Node ID</span>
                          </div>
                          <div className="col-span-8 flex items-center gap-4 font-mono text-[10px] text-zinc-700 uppercase tracking-tighter">
                            {profile?.id}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 pt-12 border-t border-[#2D313F] flex justify-end">
                      <Button 
                        onClick={handleSaveProfile} 
                        disabled={saving}
                        className="h-14 px-10 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-2xl shadow-2xl shadow-violet-600/30 transition-all active:scale-95"
                      >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <SettingsIcon className="w-5 h-5 mr-3" />}
                        SYNCHRONIZE IDENTITY
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Authorization & Billing Workspace */}
              {activeTab === "subscription" && (
                <div className="space-y-8">
                  <div className="bg-[#1A1C26] border border-[#2D313F] rounded-[32px] p-8 sm:p-12 shadow-2xl overflow-hidden relative">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-14">
                      <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">Authorization Matrix</h2>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] mt-2">Access Lifecycle & Transaction Ledger</p>
                      </div>
                      {getPlanBadge(profile?.plan || "free")}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                      <div className="p-8 bg-[#0F0F12] border border-[#2D313F] rounded-[24px] space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center">
                            <Crown className="w-5 h-5 text-violet-500" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Active Tier</p>
                        </div>
                        <p className="text-3xl font-black text-white uppercase italic tracking-tighter">
                          {profile?.plan === "pro" ? "Priority Elite" : "Standard Alpha"}
                        </p>
                      </div>
                      <div className="p-8 bg-[#0F0F12] border border-[#2D313F] rounded-[24px] space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-500" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Renewal Protocol</p>
                        </div>
                        <p className="text-3xl font-black text-white uppercase italic tracking-tighter">
                          {profile?.plan_expires_at ? new Date(profile.plan_expires_at).toLocaleDateString() : "INFINITE"}
                        </p>
                      </div>
                    </div>

                    {/* BILLING LEDGER TABLE */}
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 px-2">Transaction Ledger</h3>
                      <div className="bg-[#0F0F12] border border-[#2D313F] rounded-[24px] overflow-hidden">
                        <div className="grid grid-cols-12 border-b border-[#2D313F] bg-white/[0.02] py-4 px-6 font-black uppercase tracking-widest text-[9px] text-zinc-600">
                          <div className="col-span-4">Operational Log</div>
                          <div className="col-span-3">Timestamp</div>
                          <div className="col-span-3 text-right">Credit Value</div>
                          <div className="col-span-2 text-right">Status</div>
                        </div>

                        {subscriptions.length > 0 ? subscriptions.map((sub) => (
                          <div key={sub.id} className="grid grid-cols-12 py-6 px-6 items-center border-b border-[#2D313F]/50 hover:bg-white/[0.01] transition-colors">
                            <div className="col-span-4 font-black text-white text-xs uppercase tracking-widest">{sub.plan} Asset Access</div>
                            <div className="col-span-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{new Date(sub.started_at).toLocaleDateString()}</div>
                            <div className="col-span-3 text-right font-black text-white italic">${(sub.amount / 100).toFixed(2)}</div>
                            <div className="col-span-2 flex justify-end">
                              <Badge className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2 py-0 border-none",
                                sub.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                              )}>
                                {sub.status}
                              </Badge>
                            </div>
                          </div>
                        )) : (
                          <div className="py-20 text-center text-zinc-800 font-bold uppercase tracking-[0.3em] text-[10px]">
                            Empty Ledger Logs
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Hardening Matrix */}
              {activeTab === "security" && (
                <div className="space-y-8">
                  <div className="bg-[#1A1C26] border border-[#2D313F] rounded-[32px] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-14">
                      <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase underline decoration-violet-600/50 decoration-4 underline-offset-8">Security Hardening</h2>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] mt-3">Active Session Matrix & Authorization Integrity</p>
                      </div>
                      <ShieldCheck className="w-12 h-12 text-violet-600" />
                    </div>

                    <div className="space-y-6">
                      {/* PASSWORD PROTOCOL TABLE */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 px-2">Access Control</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="p-8 bg-[#0F0F12] border border-[#2D313F] rounded-[24px] group hover:border-violet-500/30 transition-all flex flex-col justify-between h-48">
                            <div className="space-y-2">
                              <p className="font-black text-white uppercase tracking-tighter italic text-lg leading-none">Primary Key</p>
                              <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest">Master password protocol</p>
                            </div>
                            <Button variant="outline" className="w-full h-11 border-[#2D313F] text-zinc-400 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all">
                              CONFIGURE KEY
                            </Button>
                          </div>
                          <div className="p-8 bg-[#0F0F12] border border-[#2D313F] rounded-[24px] group hover:border-violet-500/30 transition-all flex flex-col justify-between h-48">
                            <div className="space-y-2">
                              <p className="font-black text-white uppercase tracking-tighter italic text-lg leading-none">2FA Matrix</p>
                              <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest">Multi-factor authorization</p>
                            </div>
                            <Button className="w-full h-11 bg-white/5 text-zinc-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-500/10">
                              DEPLOY 2FA
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* SESSION MATRIX TABLE */}
                      <div className="space-y-4 pt-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 px-2">Session Matrix</h3>
                        <div className="bg-[#0F0F12] border border-[#2D313F] rounded-[24px] overflow-hidden">
                          <div className="grid grid-cols-12 bg-white/[0.02] border-b border-[#2D313F] py-4 px-6 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                            <div className="col-span-5">Terminal Device</div>
                            <div className="col-span-4">Origin</div>
                            <div className="col-span-3 text-right">Status</div>
                          </div>
                          
                          {/* Mock Active Session Table Row */}
                          <div className="grid grid-cols-12 py-6 px-6 border-b border-[#2D313F]/50 items-center">
                            <div className="col-span-5 flex items-center gap-3">
                              <Smartphone className="w-4 h-4 text-violet-500" />
                              <div className="min-w-0">
                                <p className="text-xs font-black text-white uppercase tracking-tighter">Current Terminal</p>
                                <p className="text-[9px] text-zinc-700 font-bold uppercase truncate">Chrome · Windows NT 10.0</p>
                              </div>
                            </div>
                            <div className="col-span-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">192.168.1.7</div>
                            <div className="col-span-3 flex justify-end">
                              <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] uppercase font-black px-2 tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)]">Active Loop</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Referrals & Network Workspace */}
              {activeTab === "referrals" && (
                <div className="space-y-8">
                  <div className="bg-[#1A1C26] border border-[#2D313F] rounded-[32px] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-14">
                      <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">Network Propagation</h2>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] mt-3">Transmission Codes & Network Effect Statistics</p>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 py-2 font-black text-[10px] uppercase tracking-widest animate-pulse">
                        Propagation Status: NOMINAL
                      </Badge>
                    </div>

                    <div className="p-10 bg-[#0F0F12] border border-dashed border-violet-500/30 rounded-[32px] mb-12 group hover:bg-violet-600/5 transition-all">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-10">
                        <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">Unique Transmission Code</p>
                          <p className="text-6xl font-black text-white italic tracking-tighter leading-none">{profile?.referral_code}</p>
                        </div>
                        <Button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/auth/signup?ref=${profile?.referral_code}`);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className={cn(
                            "h-16 px-12 font-black rounded-2xl transition-all duration-300 min-w-[240px] text-xs uppercase tracking-widest shadow-2xl",
                            copied ? "bg-emerald-500 shadow-emerald-500/20" : "bg-violet-600 hover:bg-violet-700 shadow-violet-600/20"
                          )}
                        >
                          {copied ? <Check className="w-5 h-5 mr-3" /> : <Copy className="w-5 h-5 mr-3" />}
                          {copied ? "PROTOCOLS CAPTURED" : "SYNC TRANSMISSION CODE"}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-10 bg-[#0F0F12] border border-[#2D313F] rounded-[32px] text-center space-y-4">
                        <p className="text-7xl font-black text-violet-500 italic tracking-tighter leading-none">{profile?.free_months_earned || 0}</p>
                        <p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.3em]">Operational Quota Earned (Months)</p>
                      </div>
                      <div className="p-10 bg-[#0F0F12] border border-[#2D313F] rounded-[32px] text-center space-y-4">
                        <p className="text-7xl font-black text-zinc-800 italic tracking-tighter leading-none">0</p>
                        <p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.3em]">Integrated Network Entities</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Integrator Nodes Workspace */}
              {activeTab === "whatsapp" && (
                <div className="space-y-8">
                  <div className="bg-[#1A1C26] border border-[#2D313F] rounded-[32px] p-8 sm:p-12 shadow-2xl">
                    <div className="flex items-center justify-between mb-14">
                      <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase underline decoration-emerald-500/50 decoration-4 underline-offset-8">WhatsApp Integrator</h2>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] mt-3">High-Priority Direct Communication Nodes</p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                        <MessageCircle className="w-7 h-7 text-emerald-500" />
                      </div>
                    </div>
                    
                    <WhatsAppSettings 
                      isConnected={!!whatsappSession} 
                      connectedPhone={whatsappSession?.phone_number}
                      onStatusChange={(connected) => {
                        if (!connected) setWhatsappSession(null);
                        else fetchSettings();
                      }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}