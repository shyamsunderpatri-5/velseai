import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D12]">
      {/* Header */}
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

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/[0.02] border-white/10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-violet-400" />
            </div>
            <CardTitle className="font-heading text-2xl text-white">Check your email</CardTitle>
            <CardDescription className="text-white/50">
              We've sent a verification link to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-white/60 text-center">
              Click the link in the email to verify your account. 
              The link will expire in 24 hours.
            </p>
            <div className="pt-4">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6">
        <p className="text-center text-sm text-white/30">
          © 2026 VELSEAI. Built for job seekers worldwide.
        </p>
      </footer>
    </div>
  );
}