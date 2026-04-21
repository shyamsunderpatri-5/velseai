"use client";

import { useState } from "react";
import { ActiveCommandPanel } from "@/components/ats/ActiveCommandPanel";
import { LinkedInOptimizer } from "@/components/ats/LinkedInOptimizer";
import { Briefcase, DollarSign, TrendingUp, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";

export function OutreachClient() {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [score, setScore] = useState(80);
  const [started, setStarted] = useState(false);

  return (
    <div className="space-y-16 pb-16">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-600/10 border border-blue-500/20">
            <Briefcase className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Outreach Hub
            </h1>
            <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
              LinkedIn scripts · negotiation playbooks · brand positioning
            </p>
          </div>
        </div>
      </div>

      {/* Context Setter */}
      {!started && (
        <div className="max-w-xl space-y-6 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              Set Your Target
            </h2>
            <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">
              Enter the role you&apos;re pursuing to generate precision scripts
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Target Job Title
              </Label>
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Solutions Engineer"
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-700 rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Target Company
              </Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Anthropic"
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-700 rounded-xl h-12"
              />
            </div>
            <button
              onClick={() => {
                if (jobTitle && companyName) setStarted(true);
              }}
              disabled={!jobTitle || !companyName}
              className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-[11px] transition-all"
            >
              Activate Intelligence Modules
            </button>
          </div>
        </div>
      )}

      {started && (
        <div className="space-y-16">
          {/* Context Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-4 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest">{jobTitle}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">{companyName}</span>
            </div>
            <button
              onClick={() => setStarted(false)}
              className="text-[10px] font-black text-zinc-600 hover:text-white uppercase tracking-widest transition-colors"
            >
              Change Target →
            </button>
          </div>

          {/* ActiveCommandPanel — Outreach + Negotiation */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1">
              <div className="w-1 h-4 rounded-full bg-blue-500" />
              LinkedIn Outreach + Negotiation Scripts
            </div>
            <ActiveCommandPanel
              jobTitle={jobTitle}
              companyName={companyName}
              overallScore={score}
            />
          </section>

          {/* Divider */}
          <div className="border-t border-white/5" />

          {/* LinkedIn Profile Optimizer */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1">
              <div className="w-1 h-4 rounded-full bg-[#0077b5]" />
              LinkedIn Profile Optimizer
            </div>
            <LinkedInOptimizer />
          </section>
        </div>
      )}
    </div>
  );
}
