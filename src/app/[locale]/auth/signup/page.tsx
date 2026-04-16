import { type Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign Up | VELSEAI",
  description: "Create your free VELSEAI account",
};

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; plan?: string }>;
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
        <div className="w-full max-w-md">
          <SignupForm />
        </div>
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