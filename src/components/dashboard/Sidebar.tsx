"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  RadioTower,
  BookOpen,
  Briefcase,
  FileText,
  Settings,
  Star,
  Crown,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  user: { id: string };
  profile?: {
    plan: string;
    full_name: string | null;
    email: string;
  };
}

const navGroups = [
  {
    label: "Intelligence",
    items: [
      { title: "My Progress",     href: "/dashboard",      icon: LayoutDashboard, color: "violet" },
      { title: "ATS Checker",     href: "/ats-checker",    icon: Target,          color: "violet" },
      { title: "Job Discovery",   href: "/jobs",           icon: RadioTower,      color: "emerald" },
      { title: "Story Bank",      href: "/story-bank",     icon: BookOpen,        color: "amber"   },
    ],
  },
  {
    label: "Build",
    items: [
      { title: "Outreach Hub",    href: "/outreach",       icon: Briefcase,       color: "blue"    },
      { title: "Resume Builder",  href: "/resume-builder", icon: FileText,        color: "violet"  },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Settings",        href: "/settings",       icon: Settings,        color: "zinc"    },
    ],
  },
];

const colorMap: Record<string, { active: string; glow: string; dot: string }> = {
  violet:  { active: "bg-violet-600/10 text-violet-400",  glow: "shadow-[inset_0_0_20px_rgba(124,58,237,0.05)]",  dot: "bg-violet-400 shadow-[0_0_8px_rgba(124,58,237,0.8)]"  },
  emerald: { active: "bg-emerald-600/10 text-emerald-400", glow: "shadow-[inset_0_0_20px_rgba(52,211,153,0.05)]",  dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" },
  amber:   { active: "bg-amber-500/10 text-amber-400",     glow: "shadow-[inset_0_0_20px_rgba(251,191,36,0.05)]",  dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"   },
  blue:    { active: "bg-blue-600/10 text-blue-400",       glow: "shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]",  dot: "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]"    },
  zinc:    { active: "bg-white/5 text-zinc-300",           glow: "",                                               dot: "bg-zinc-400"                                           },
};

export function Sidebar({ user, profile }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname.endsWith("/dashboard");
    }
    return pathname.includes(href);
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <aside className="hidden lg:block w-72">
      <div className="sticky top-6 space-y-6">

        {/* User Avatar Card */}
        <div className="group relative">
          <div className="p-4 rounded-2xl bg-[#0C0C0E] border border-[#1F1F23] hover:border-violet-500/30 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-600/20">
                  {getInitials(profile?.full_name)}
                </div>
                {profile?.plan !== "free" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg"
                  >
                    <Crown className="w-2.5 h-2.5 text-white" />
                  </motion.div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate text-sm">
                  {profile?.full_name || "Account"}
                </p>
                <span className="text-[10px] uppercase font-black tracking-widest text-violet-400">
                  {profile?.plan || "Free"}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="space-y-5">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-3 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-700 mb-2">
                {group.label}
              </div>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  const colors = colorMap[item.color] || colorMap.violet;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="relative block"
                    >
                      <motion.div
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300",
                          active
                            ? `text-white ${colors.active} ${colors.glow}`
                            : "text-zinc-500 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0",
                          active ? "" : "text-zinc-600"
                        )}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="flex-1 text-[13px] font-bold tracking-tight">{item.title}</span>
                        {active && (
                          <motion.div
                            layoutId="active-nav-dot"
                            className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", colors.dot)}
                          />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Upgrade Card */}
        {profile?.plan === "free" && (
          <Link href="/pricing">
            <div className="p-4 rounded-2xl bg-[#0C0C0E] border border-[#1F1F23] relative overflow-hidden group hover:border-violet-500/30 transition-all cursor-pointer">
              <div className="absolute -top-8 -right-8 w-20 h-20 bg-violet-600/10 rounded-full blur-2xl group-hover:bg-violet-600/20 transition-all" />
              <div className="relative flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-600/20 flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-violet-400 fill-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-xs">Upgrade to Pro</p>
                  <p className="text-[9px] text-zinc-500 truncate">Unlimited scans · all features</p>
                </div>
                <div className="text-[9px] font-black text-violet-400 bg-violet-600/10 px-2 py-1 rounded-lg uppercase tracking-widest group-hover:bg-violet-600 group-hover:text-white transition-all flex-shrink-0">
                  $9
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
}