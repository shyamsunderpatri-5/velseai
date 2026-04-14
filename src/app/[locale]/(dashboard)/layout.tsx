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
      <Navbar user={user} profile={profile} isDashboard={true} />

      <div className="container py-6">
        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          <Sidebar user={user} profile={profile} />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
