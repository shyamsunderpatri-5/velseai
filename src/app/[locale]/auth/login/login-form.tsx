"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics/posthog";
import { Loader2, AlertCircle } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    trackEvent("user_logged_in", { method: "email" });
    router.push("/dashboard");
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsGoogleLoading(false);
    }
  };


  return (
    <Card className="bg-white/[0.02] border-white/10">
      <CardHeader className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center shadow-xl shadow-violet-600/20 mx-auto mb-4">
          <span className="text-white font-black text-2xl">V</span>
        </div>
        <CardTitle className="font-heading text-2xl text-white tracking-tight">Welcome Back</CardTitle>
        <CardDescription className="text-white/50">
          Sign in to your VELSEAI account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              disabled={isLoading}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white/80">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-violet-400 hover:text-violet-300"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              disabled={isLoading}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500"
            />
          </div>

          <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-white/50">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-violet-400 hover:text-violet-300">
            Sign up free
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}