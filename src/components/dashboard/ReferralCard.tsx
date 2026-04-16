"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Gift, Users, Trophy, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";

interface ReferralCardProps {
  referralCode: string;
  totalReferrals: number;
  monthsEarned: number;
}

export function ReferralCard({ referralCode, totalReferrals, monthsEarned }: ReferralCardProps) {
  const referralUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/signup?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    toast.success("Referral protocol copied to clipboard!");
  };

  return (
    <Card className="bg-white/[0.02] border-white/10 backdrop-blur-3xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
        <Trophy className="w-24 h-24 text-violet-500" />
      </div>
      
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center border border-violet-500/30">
            <Gift className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-white">Viral Growth Hub</CardTitle>
            <CardDescription className="text-white/40 text-xs">Invite peers & unlock mission-critical features.</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-2xl font-black text-white">{totalReferrals}</span>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Active Leads</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-2xl font-black text-emerald-400">{monthsEarned}</span>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Rewards Unlocked</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Your Private Invite Protocol</label>
          <div className="flex gap-2">
            <Input 
              readOnly 
              value={referralUrl}
              className="bg-black/40 border-white/5 text-white/60 text-xs h-10 font-mono"
            />
            <Button 
              onClick={copyToClipboard}
              className="bg-violet-600 hover:bg-violet-700 text-white shrink-0 h-10 px-4"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-white/40 italic">Next Milestone: 5 Referrals → Unlock Lifetime Logic</span>
            <div className="flex items-center gap-1 text-violet-400 font-bold">
              <span>View Leaderboard</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
