"use client";

import * as React from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  LogOut, 
  ChevronDown, 
  Lightbulb, 
  BookOpen, 
  Palette,
  Monitor,
  Moon,
  Sun,
  Loader2,
  ChevronRight
} from "lucide-react";

interface UserAccountNavProps {
  user: any;
  profile?: any;
}

export function UserAccountNav({ user, profile }: UserAccountNavProps) {
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const email = user?.email || "user@velseai.com";
  const initials = email[0].toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group select-none">
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/20 group-hover:scale-105 transition-transform">
            <span className="text-[12px] font-black text-white">{initials}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[280px] bg-[#0F0F12] border-white/10 p-2.5 rounded-[24px] shadow-2xl animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
      >
        {/* Profile Header */}
        <div className="p-4 mb-3 bg-violet-600/5 rounded-2xl border border-violet-500/10">
          <p className="text-[15px] font-bold tracking-tight text-white truncate mb-1.5">{email}</p>
          <div className="flex items-center justify-between">
            <div className="bg-violet-600/20 text-violet-400 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border border-violet-500/10">
              {profile?.plan || "FREE"} PROTOCOL
            </div>
            <Link href="/pricing" className="text-[10px] font-black text-violet-400 hover:text-violet-300 transition-colors tracking-widest">
              UPGRADE
            </Link>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          <Link href="/settings">
            <DropdownMenuItem className="h-12 px-3 rounded-xl focus:bg-white/5 cursor-pointer group transition-all">
              <User className="w-[18px] h-[18px] mr-4 text-zinc-600 group-hover:text-white" />
              <span className="text-[14px] font-bold text-zinc-400 group-hover:text-white">Account</span>
            </DropdownMenuItem>
          </Link>
          
          <DropdownMenuItem className="h-12 px-3 rounded-xl focus:bg-white/5 cursor-pointer group transition-all">
            <Lightbulb className="w-[18px] h-[18px] mr-4 text-zinc-600 group-hover:text-white" />
            <span className="text-[14px] font-bold text-zinc-400 group-hover:text-white">Suggest Feature</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="h-12 px-3 rounded-xl focus:bg-white/5 cursor-pointer group transition-all">
            <BookOpen className="w-[18px] h-[18px] mr-4 text-zinc-600 group-hover:text-white" />
            <span className="text-[14px] font-bold text-zinc-400 group-hover:text-white">User Guides</span>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="h-12 px-3 rounded-xl focus:bg-white/5 cursor-pointer group transition-all data-[state=open]:bg-white/5">
              <Palette className="w-[18px] h-[18px] mr-4 text-zinc-600 group-hover:text-white" />
              <span className="text-[14px] font-bold text-zinc-400 group-hover:text-white mr-auto">Theme</span>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-[#0F0F12] border-white/10 p-2 rounded-2xl shadow-2xl ml-2 w-40">
                <DropdownMenuItem className="h-10 rounded-xl focus:bg-white/5 cursor-pointer group">
                  <Sun className="w-4 h-4 mr-3 text-zinc-600 group-hover:text-white" />
                  <span className="text-sm font-bold text-zinc-400 group-hover:text-white">Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-10 rounded-xl focus:bg-white/5 cursor-pointer group">
                  <Moon className="w-4 h-4 mr-3 text-zinc-600 group-hover:text-white" />
                  <span className="text-sm font-bold text-zinc-400 group-hover:text-white">Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-10 rounded-xl focus:bg-white/5 cursor-pointer group">
                  <Monitor className="w-4 h-4 mr-3 text-zinc-600 group-hover:text-white" />
                  <span className="text-sm font-bold text-zinc-400 group-hover:text-white">System</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </div>

        <DropdownMenuSeparator className="my-2 bg-white/5 mx-2" />
        
        <form action="/auth/signout" method="post" onSubmit={() => setIsLoggingOut(true)}>
          <DropdownMenuItem 
            asChild
            className="h-12 px-3 rounded-xl focus:bg-red-500/10 cursor-pointer group transition-all"
          >
            <button 
              disabled={isLoggingOut}
              className="w-full flex items-center disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader2 className="w-[18px] h-[18px] mr-4 animate-spin text-red-500" />
              ) : (
                <LogOut className="w-[18px] h-[18px] mr-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
              )}
              <span className="text-[14px] font-bold text-zinc-400 group-hover:text-red-500 transition-colors">
                {isLoggingOut ? "Signing out..." : "Log out"}
              </span>
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
