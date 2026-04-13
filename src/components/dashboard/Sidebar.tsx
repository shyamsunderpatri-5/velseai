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

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Resumes",
    href: "/resume",
    icon: FileText,
  },
  {
    title: "ATS Checker",
    href: "/ats-checker",
    icon: Target,
  },
  {
    title: "Job Tracker",
    href: "/jobs",
    icon: Briefcase,
  },
  {
    title: "AI Tools",
    href: "/ai-tools",
    icon: Sparkles,
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

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-4">
        {/* User Info */}
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center">
              <span className="text-white font-medium">
                {profile?.full_name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {profile?.full_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.title}
              {isActive(item.href) && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </Link>
          ))}
        </nav>

        {/* Upgrade CTA for free users */}
        {profile?.plan === "free" && (
          <div className="p-4 rounded-lg bg-gradient-to-br from-accent/20 to-warning/20 border border-accent/50">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-accent" />
              <span className="font-medium text-sm">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Unlimited resumes, AI, and exports.
            </p>
            <Link href="/pricing">
              <button className="w-full px-3 py-1.5 rounded-md bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors">
                View Plans
              </button>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
