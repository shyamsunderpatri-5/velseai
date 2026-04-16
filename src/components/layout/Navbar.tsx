"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import {
  LogOut,
  Star,
  User,
  LayoutDashboard,
  Plus,
  ChevronDown,
  Bell,
  Menu,
} from "lucide-react";
import { UserAccountNav } from "./UserAccountNav";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

interface NavbarProps {
  user?: any;
  profile?: any;
  isDashboard?: boolean;
}

export function Navbar({ user, profile, isDashboard }: NavbarProps) {
  const t = useTranslations("common");
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/5">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/20 group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-xl leading-none">V</span>
            </div>
            <span className="font-heading font-black text-xl text-white tracking-tighter">VELSEAI</span>
          </Link>

        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {profile?.plan === "free" && (
                <Link href="/pricing" className="hidden sm:block">
                  <Button size="sm" className="h-9 px-5 bg-violet-500 hover:bg-violet-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-violet-500/10 transition-all active:scale-95">
                    <Plus className="w-3.5 h-3.5 mr-2 stroke-[3]" />
                    Upgrade
                  </Button>
                </Link>
              )}
              
              <Button variant="ghost" size="icon" className="h-9 w-9 text-white/30 hover:text-white hover:bg-white/5 relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#0A0A0B]" />
              </Button>

              <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />
              
              <UserAccountNav user={user} profile={profile} />
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="h-10 px-4 sm:px-6 text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="h-10 sm:h-11 px-5 sm:px-7 bg-violet-600 hover:bg-violet-700 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-violet-600/20 transition-all active:scale-95">
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
