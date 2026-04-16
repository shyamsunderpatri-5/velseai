"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics/posthog";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [password, setPassword] = React.useState("");
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);

  const passwordStrength = React.useMemo(() => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  }, [password]);

  const strengthLabel = passwordStrength > 0 ? ["Very Weak", "Weak", "Fair", "Good", "Strong"][passwordStrength - 1] : "";
  const strengthColor = passwordStrength > 0 ? ["bg-red-500", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-emerald-500"][passwordStrength - 1] : "";

  const handleEmailSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      setIsLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            referred_by_code: referralCode, // Tracking metadata for Phase 5 Growth Loop
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error("Signup error:", signUpError);
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      // If user created successfully, funnel to Dashboard
      if (data.user || data.session) {
        trackEvent("user_signed_up", { 
          method: "email",
          has_referral: !!referralCode 
        });
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Signup exception:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
        <CardTitle className="font-heading text-2xl text-white tracking-tight">Create Your Account</CardTitle>
        <CardDescription className="text-white/50">
          Start building mission-critical resumes for free
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Form */}
        <form onSubmit={handleEmailSignup} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-white/80">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="John Doe"
              required
              disabled={isLoading}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500"
            />
          </div>

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
            <Label htmlFor="password" className="text-white/80">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a strong password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500"
            />
            {password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        i < passwordStrength ? strengthColor : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-white/40">
                  Password strength: <span className={strengthColor ? strengthColor.replace("bg-", "text-") : ""}>{strengthLabel}</span>
                </p>
              </div>
            )}
          </div>


          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5"
            />
            <label htmlFor="terms" className="text-xs text-white/50">
              I agree to the{" "}
              <Link href="/terms" className="text-violet-400 hover:text-violet-300">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-violet-400 hover:text-violet-300">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-violet-400 hover:text-violet-300">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}