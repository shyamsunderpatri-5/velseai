"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    // Check for access token in URL hash (Supabase sends it there)
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      // Token is in the URL - user is authenticated via the reset link
      setIsLoading(false);
    } else {
      // No token - redirect to forgot password
      router.push("/auth/forgot-password");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0D0D12]">
        <header className="border-b border-white/5">
          <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/20 group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-xl leading-none">V</span>
            </div>
            <span className="font-heading font-black text-xl text-white tracking-tighter">VELSEAI</span>
          </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/[0.02] border-white/10">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <CardTitle className="font-heading text-2xl text-white">Password Reset!</CardTitle>
              <CardDescription className="text-white/50">
                Your password has been successfully updated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/60 text-center mb-4">
                Redirecting to login...
              </p>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/10">
                  Go to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>

        <footer className="border-t border-white/5 py-6">
          <p className="text-center text-sm text-white/30">
            © 2026 VELSEAI. Built for job seekers worldwide.
          </p>
        </footer>
      </div>
    );
  }

  if (!isLoading && !window.location.hash.includes("access_token")) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D12]">
      <header className="border-b border-white/5">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/20 group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-xl leading-none">V</span>
            </div>
            <span className="font-heading font-black text-xl text-white tracking-tighter">VELSEAI</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/[0.02] border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-2xl text-white">New Password</CardTitle>
            <CardDescription className="text-white/50">
              Enter your new password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/80">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500"
                />
              </div>

              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Reset Password
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-white/10">
              <Link href="/auth/login">
                <Button variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-white/5 py-6">
        <p className="text-center text-sm text-white/30">
          © 2026 VELSEAI. Built for job seekers worldwide.
        </p>
      </footer>
    </div>
  );
}