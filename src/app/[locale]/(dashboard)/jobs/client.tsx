"use client";

import { DiscoveryInbox } from "@/components/ats/DiscoveryInbox";
import { FollowUpRadar } from "@/components/ats/FollowUpRadar";
import { RadioTower, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export function JobsClient() {
  const router = useRouter();
  const locale = useLocale();

  const handleAudit = (url: string) => {
    // Pre-load job URL into ATS checker
    router.push(`/${locale}/ats-checker?jobUrl=${encodeURIComponent(url)}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-violet-600/10 border border-violet-500/20">
            <RadioTower className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Job Discovery
            </h1>
            <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
              Elite portal scanner · live AI opportunity radar
            </p>
          </div>
        </div>
      </div>

      {/* Discovery Inbox — New Leads */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1">
          <div className="w-1 h-4 rounded-full bg-violet-500" />
          Incoming Leads
        </div>
        <DiscoveryInbox onAudit={handleAudit} />
      </section>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Follow-Up Radar — Nurture Pipeline */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1">
          <div className="w-1 h-4 rounded-full bg-emerald-500" />
          Nurture Pipeline
        </div>
        <FollowUpRadar />
      </section>
    </div>
  );
}
