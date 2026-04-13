import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowRight, Sparkles } from "lucide-react";
import { getPricing } from "@/lib/i18n/getPricing";
import { locales, type Locale } from "@/i18n/config";

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
    description: `VELSEAI plans start at various prices. Includes unlimited ATS checks, AI resume builder, templates, job tracker, and cover letter generator.`,
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
  
  const plans = [
    {
      name: "Free",
      price: 0,
      description: "Perfect for trying out VELSEAI",
      features: [
        { text: "1 resume", included: true },
        { text: "3 templates", included: true },
        { text: "3 ATS checks/day", included: true },
        { text: "5 AI uses/day", included: true },
        { text: "PDF export (watermark)", included: true },
        { text: "Job tracker", included: false },
        { text: "Cover letter generator", included: false },
        { text: "LinkedIn import", included: false },
        { text: "Unlimited exports", included: false },
      ],
      cta: "Get Started Free",
      href: "/auth/signup",
      popular: false,
      accent: "border-white/10",
    },
    {
      name: "Starter",
      price: pricing.starter.monthly,
      yearlyPrice: pricing.starter.yearly,
      yearlySavings: (pricing.starter.monthly * 12) - pricing.starter.yearly,
      description: "Best for serious job seekers",
      features: [
        { text: "5 resumes", included: true },
        { text: "All 5 templates", included: true },
        { text: "Unlimited ATS checks", included: true },
        { text: "50 AI uses/day", included: true },
        { text: "PDF + DOCX export", included: true },
        { text: "Job tracker (50 jobs)", included: true },
        { text: "Cover letter generator", included: true },
        { text: "LinkedIn import", included: false },
        { text: "Unlimited exports", included: false },
      ],
      cta: "Start 7-Day Trial",
      href: "/auth/signup?plan=starter",
      popular: true,
      accent: "border-violet-500/50",
    },
    {
      name: "Pro",
      price: pricing.pro.monthly,
      yearlyPrice: pricing.pro.yearly,
      yearlySavings: (pricing.pro.monthly * 12) - pricing.pro.yearly,
      description: "For professionals who want the best",
      features: [
        { text: "Unlimited resumes", included: true },
        { text: "All templates + future", included: true },
        { text: "Unlimited ATS checks", included: true },
        { text: "Unlimited AI uses", included: true },
        { text: "PDF + DOCX export", included: true },
        { text: "Unlimited job tracker", included: true },
        { text: "Cover letter generator", included: true },
        { text: "LinkedIn import", included: true },
        { text: "Unlimited exports", included: true },
      ],
      cta: "Start 7-Day Trial",
      href: "/auth/signup?plan=pro",
      popular: false,
      accent: "border-white/10",
    },
    {
      name: "Lifetime",
      price: pricing.lifetime.price,
      description: "One-time payment, forever access",
      features: [
        { text: "Everything in Pro", included: true },
        { text: "No monthly fees, ever", included: true },
        { text: "All future templates included", included: true },
        { text: "Priority support", included: true },
        { text: "Founding member badge", included: true },
      ],
      cta: "Get Lifetime Access",
      href: "/auth/signup?plan=lifetime",
      popular: false,
      accent: "border-amber-500/50",
    },
  ];

  const yearly = false; // Toggle for yearly/monthly

  return (
    <div className="min-h-screen bg-[#0D0D12] text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0D0D12]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-xl">VELSEAI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/ats-checker" className="text-sm font-medium text-white/70 hover:text-white">
              ATS Checker
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-white">
              Pricing
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-16 text-center">
        <div className="container mx-auto px-4">
          <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 px-4 py-1 mb-6">
            <Sparkles className="w-3 h-3 mr-1" />
            Simple, transparent pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose your plan
          </h1>
          <p className="text-white/50 max-w-xl mx-auto">
            Start free, upgrade when ready. 30-day money-back guarantee.
          </p>
          
          {/* Payment Gateway Note */}
          <div className="mt-4 text-sm text-white/30">
            Payments powered by Stripe
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <Card key={i} className={`bg-white/[0.02] border ${plan.accent} relative`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-violet-600 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price === 0 ? `${pricing.symbol}0` : `${pricing.symbol}${plan.price}`}</span>
                    {plan.price > 0 && <span className="text-white/40">/month</span>}
                    {yearly && plan.yearlyPrice && (
                      <div className="text-sm text-emerald-400 mt-1">
                        {pricing.symbol}{plan.yearlyPrice}/year (save {pricing.symbol}{plan.yearlySavings})
                      </div>
                    )}
                  </div>
                  <p className="text-white/50 text-sm mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-white/20 flex-shrink-0" />
                        )}
                        <span className={feature.included ? "text-white/70" : "text-white/30"}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href}>
                    <Button className={`w-full ${plan.popular ? 'bg-violet-600 hover:bg-violet-700' : 'bg-white/10 hover:bg-white/20'}`}>
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16 bg-white/[0.02]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="max-w-2xl mx-auto space-y-4 text-left">
            <div className="p-4 bg-white/[0.02] rounded-lg">
              <h3 className="font-medium mb-2">Can I cancel anytime?</h3>
              <p className="text-white/50 text-sm">Yes, you can cancel your subscription at any time. No hidden fees.</p>
            </div>
            <div className="p-4 bg-white/[0.02] rounded-lg">
              <h3 className="font-medium mb-2">What payment methods do you accept?</h3>
              <p className="text-white/50 text-sm">We accept all major credit/debit cards</p>
            </div>
            <div className="p-4 bg-white/[0.02] rounded-lg">
              <h3 className="font-medium mb-2">Is there a free trial?</h3>
              <p className="text-white/50 text-sm">Starter and Pro plans come with a 7-day free trial. Cancel anytime during the trial.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="container mx-auto px-4 text-center text-white/30 text-sm">
          <p>© 2026 VELSEAI. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}