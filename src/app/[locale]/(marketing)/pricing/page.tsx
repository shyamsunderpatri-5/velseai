import Link from "next/link";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { getPricing } from "@/lib/i18n/getPricing";
import { locales, type Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { PricingClient } from "@/components/pricing/PricingClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `Pricing — VELSEAI AI Resume Builder`,
    description: `VELSEAI plans start at $9. Includes unlimited ATS checks, AI resume builder, templates, job tracker, and cover letter generator.`,
    openGraph: {
      title: 'VELSEAI Pricing — AI Resume Builder',
      description: 'Get ATS-ready resumes with VELSEAI. Lifetime deal available.',
      url: `https://velseai.com/${locale}/pricing`,
      type: 'website',
    },
    alternates: { canonical: `https://velseai.com/${locale}/pricing` }
  };
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  const validLocale = locales.includes(locale as Locale) ? locale as Locale : 'en';
  const pricing = getPricing(validLocale);
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      description: "Perfect for trying out VELSEAI and checking your ATS score.",
      features: [
        { text: "1 resume", included: true },
        { text: "3 templates", included: true },
        { text: "3 ATS checks/day", included: true },
        { text: "5 AI uses/day", included: true },
        { text: "PDF export (watermark)", included: true },
        { text: "Job tracker", included: false },
        { text: "Cover letter generator", included: false },
      ],
      cta: "Get Started Free",
      popular: false,
      accent: "border-white/10",
    },
    {
      id: "sprint",
      name: "30-Day Sprint Pass",
      price: 9,
      description: "Perfect for high-intensity job searches. Nuke the competition with 30 days of unlimited power.",
      features: [
        { text: "Unlimited resumes", included: true },
        { text: "Unlimited ATS checks", included: true },
        { text: "Unlimited AI generations", included: true },
        { text: "All 5 premium templates", included: true },
        { text: "Job tracker (Unlimited)", included: true },
        { text: "Cover letter generator", included: true },
        { text: "PDF + DOCX export", included: true },
      ],
      cta: "Grab My Sprint Pass",
      popular: true,
      accent: "border-violet-500/50",
    },
    {
      id: "lifetime",
      name: "Lifetime Affiliate",
      price: pricing.lifetime.price,
      description: "One-time payment, forever access. No subscriptions, ever.",
      features: [
        { text: "Everything in Sprint Pass", included: true },
        { text: "No monthly fees, ever", included: true },
        { text: "All future templates", included: true },
        { text: "Priority support", included: true },
        { text: "Founding member badge", included: true },
      ],
      cta: "Get Lifetime Access",
      popular: false,
      accent: "border-amber-500/50",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D12] text-white">
      {/* Hero */}
      <section className="pt-24 pb-16 text-center">
        <div className="container mx-auto px-4">
          <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 px-4 py-1.5 mb-8 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 mr-2" />
            Simple, transparent pricing
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            Choose your plan
          </h1>
          <p className="text-white/40 max-w-xl mx-auto text-lg font-medium">
            Start free, upgrade to the Sprint Pass when you're ready to nuke the competition.
          </p>
          
          <div className="mt-8 text-[11px] font-bold text-white/20 uppercase tracking-[0.2em]">
            Payments securely powered by <span className="text-white/40">Stripe</span>
          </div>
        </div>
      </section>

      {/* Pricing Client Container */}
      <section className="py-16 pb-32">
        <div className="container mx-auto px-4">
          <PricingClient plans={plans} pricing={pricing} user={user} />
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-32 bg-white/[0.01] border-y border-white/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black mb-16 text-center tracking-tight">Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 text-left">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl group hover:bg-white/[0.04] transition-colors">
              <h3 className="font-bold mb-3 text-lg">Can I cancel anytime?</h3>
              <p className="text-white/40 text-sm leading-relaxed">Yes, you can cancel your subscription at any time with one click. No hidden fees or lock-ins.</p>
            </div>
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl group hover:bg-white/[0.04] transition-colors">
              <h3 className="font-bold mb-3 text-lg">What payment methods do you accept?</h3>
              <p className="text-white/40 text-sm leading-relaxed">We accept all major credit/debit cards, Apple Pay, and Google Pay through Stripe's secure infrastructure.</p>
            </div>
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl group hover:bg-white/[0.04] transition-colors">
              <h3 className="font-bold mb-3 text-lg">Can I try it for free?</h3>
              <p className="text-white/40 text-sm leading-relaxed">Yes! You can start with our Free tier to check your score and test the AI. Upgrade to the Sprint Pass whenever you need unlimited power.</p>
            </div>
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl group hover:bg-white/[0.04] transition-colors">
              <h3 className="font-bold mb-3 text-lg">Is my data secure?</h3>
              <p className="text-white/40 text-sm leading-relaxed">We use 256-bit AES encryption for all data storage. Your payment information is handled exclusively by Stripe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 text-white/20 text-[11px] font-bold uppercase tracking-widest">
          <p>© 2026 VELSEAI. All rights reserved.</p>
          <div className="flex justify-center gap-8">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}