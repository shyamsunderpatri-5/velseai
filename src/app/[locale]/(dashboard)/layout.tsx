import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import {
  FileText,
  LayoutDashboard,
  Target,
  Briefcase,
  Settings,
  Star,
  LogOut,
  Plus,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-heading font-bold text-xl">VELSEAI</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-primary"
              >
                Dashboard
              </Link>
              <Link
                href="/ats-checker"
                className="text-sm font-medium hover:text-primary"
              >
                ATS Checker
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {profile?.plan !== "pro" && profile?.plan !== "lifetime" && (
              <Link href="/pricing">
                <Button size="sm" className="bg-accent hover:bg-accent/90">
                  <Star className="w-4 h-4 mr-1" />
                  Upgrade
                </Button>
              </Link>
            )}
            <Badge
              variant={profile?.plan === "free" ? "secondary" : "success"}
              className="hidden sm:inline-flex"
            >
              {profile?.plan === "free"
                ? "Free"
                : profile?.plan === "starter"
                ? "Starter"
                : profile?.plan === "pro"
                ? "Pro"
                : "Lifetime"}
            </Badge>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          <Sidebar user={user} profile={profile} />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
