"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import {
  LogOut,
  Star,
  User,
  LayoutDashboard,
  FileSearch,
  Plus,
  LogIn
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface NavbarProps {
  user?: any;
  profile?: any;
  isDashboard?: boolean;
}

export function Navbar({ user, profile, isDashboard }: NavbarProps) {
  const t = useTranslations("common");
  const pathname = usePathname();

  // Determine if we are on a landing/marketing page vs dashboard
  const isMarketing = !isDashboard;

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0D0D12]/80 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group transition-all duration-300 transform hover:scale-105">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-heading font-bold text-xl text-white tracking-tight">VELSEAI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/ats-checker"
              className={cn(
                "text-sm font-medium transition-colors",
                pathname.includes("/ats-checker") ? "text-violet-400" : "text-white/70 hover:text-white"
              )}
            >
              ATS Checker
            </Link>
            <Link
              href="/pricing"
              className={cn(
                "text-sm font-medium transition-colors",
                pathname.includes("/pricing") ? "text-violet-400" : "text-white/70 hover:text-white"
              )}
            >
              Pricing
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname.includes("/dashboard") ? "text-violet-400" : "text-white/70 hover:text-white"
                )}
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              {profile?.plan !== "pro" && profile?.plan !== "lifetime" && (
                <Link href="/pricing" className="hidden sm:block">
                  <Button variant="outline" size="sm" className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10">
                    <Star className="w-3.5 h-3.5 mr-1.5 fill-current" />
                    Upgrade
                  </Button>
                </Link>
              )}
              
              <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/50 leading-none">
                    {profile?.plan?.toUpperCase() || "FREE"}
                  </span>
                </div>
              </div>

              <form action="/auth/signout" method="post">
                <Button variant="ghost" size="sm" className="text-white/50 hover:text-white">
                  <LogOut className="w-4 h-4" />
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
