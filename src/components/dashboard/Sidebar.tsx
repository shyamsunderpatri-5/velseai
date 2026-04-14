"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Target,
  Briefcase,
  Sparkles,
  Settings,
  Star,
  Crown,
  Zap,
} from "lucide-react";

interface SidebarProps {
  user: { id: string };
  profile?: {
    plan: string;
    full_name: string | null;
    email: string;
  };
}

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    accent: "from-blue-500 to-cyan-400",
  },
  {
    title: "My Resumes",
    href: "/resume",
    icon: FileText,
    accent: "from-purple-500 to-pink-400",
  },
  {
    title: "ATS Checker",
    href: "/ats-checker",
    icon: Target,
    accent: "from-green-500 to-emerald-400",
  },
  {
    title: "Job Tracker",
    href: "/jobs",
    icon: Briefcase,
    accent: "from-orange-500 to-amber-400",
  },
  {
    title: "AI Tools",
    href: "/ai-tools",
    icon: Sparkles,
    accent: "from-violet-500 to-purple-400",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    accent: "from-gray-500 to-slate-400",
  },
];

export function Sidebar({ user, profile }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="hidden lg:block w-64">
      <div className="sticky top-6 space-y-6">
        {/* User Profile Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#18181B] to-[#27272A] border border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <span className="text-white font-bold text-sm">
                  {getInitials(profile?.full_name)}
                </span>
              </div>
              {profile?.plan !== "free" && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 flex items-center justify-center shadow-md">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate text-sm">
                {profile?.full_name || "User"}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {profile?.email}
              </p>
            </div>
          </div>

          {profile?.plan !== "free" && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-purple-300 capitalize">
                {profile?.plan} Plan
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-white/10 text-white shadow-lg"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                    active
                      ? `bg-gradient-to-br ${item.accent} shadow-lg`
                      : "bg-zinc-800 group-hover:bg-zinc-700"
                  )}
                >
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <span>{item.title}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade CTA */}
        {profile?.plan === "free" && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600/20 to-violet-600/10 border border-purple-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-white text-sm">
                  Upgrade to Pro
                </span>
              </div>
              <p className="text-xs text-zinc-400 mb-3">
                Unlimited resumes, AI, and exports.
              </p>
              <Link href="/pricing">
                <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  View Plans
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}