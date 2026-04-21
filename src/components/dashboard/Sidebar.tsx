"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Target,
  Briefcase,
  Sparkles,
  Settings,
  Star,
  Crown,
  ChevronRight,
  MessageSquare,
  BookOpen,
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
    title: "My Progress",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "ATS Checker",
    href: "/ats-checker",
    icon: Target,
  },
  {
    title: "Story Bank",
    href: "/story-bank",
    icon: BookOpen,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
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
    <aside className="hidden lg:block w-72">
      <div className="sticky top-6 space-y-8">
        {/* User Module */}
        <div className="group relative">
          <div className="p-4 rounded-2xl bg-[#0C0C0E] border border-[#1F1F23] hover:border-violet-500/30 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-600/20">
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
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className="text-[10px] uppercase font-black tracking-widest text-violet-400">
                    {profile?.plan || "Free"}
                  </span>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-2">
          <div className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
            Main Menu
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={`${item.title}-${item.href}`}
                  href={item.href}
                  className="relative block"
                >
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300",
                      active
                        ? "text-white bg-violet-600/10 shadow-[inset_0_0_20px_rgba(124,58,237,0.05)]"
                        : "text-zinc-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                      active ? "text-violet-400" : "text-zinc-600 group-hover:text-zinc-400"
                    )}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span>{item.title}</span>
                    {active && (
                      <motion.div 
                        layoutId="active-nav"
                        className="ml-auto w-1 h-1 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(124,58,237,0.8)]" 
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Support Section */}
        <div className="space-y-2">
          <div className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
            Support
          </div>
          <Link href="/pricing">
            <div className={cn(
              "p-4 rounded-2xl bg-[#0C0C0E] border border-[#1F1F23] relative overflow-hidden group hover:border-violet-500/30 transition-all cursor-pointer",
              profile?.plan === "free" ? "block" : "hidden"
            )}>
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-violet-600/10 rounded-full blur-2xl group-hover:bg-violet-600/20 transition-all" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-violet-600/20 flex items-center justify-center">
                    <Star className="w-3.5 h-3.5 text-violet-400 fill-violet-400" />
                  </div>
                  <span className="font-bold text-white text-xs">Upgrade Pro</span>
                </div>
                <p className="text-[10px] text-zinc-500 line-clamp-2 mb-3">
                  Unlock unlimited AI features and 50+ premium templates.
                </p>
                <div className="w-full py-2 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white text-center group-hover:bg-violet-600 group-hover:border-violet-600 transition-all">
                  GET ACCESS
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
}