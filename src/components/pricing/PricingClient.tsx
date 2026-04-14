"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

interface Plan {
  id: string;
  name: string;
  price: number;
  yearlyPrice?: number;
  yearlySavings?: number;
  description: string;
  features: { text: string; included: boolean }[];
  cta: string;
  popular: boolean;
  accent: string;
}

interface PricingClientProps {
  plans: Plan[];
  pricing: any;
  user: any;
}

export function PricingClient({ plans, pricing, user }: PricingClientProps) {
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = React.useState<string | null>(null);

  const handleSubscribe = async (plan: Plan) => {
    if (plan.id === "free") return;

    if (!user) {
      window.location.href = `/auth/signup?plan=${plan.id}&billing=${billingCycle}`;
      return;
    }

    setIsLoading(plan.id);
    try {
      const planKey = plan.id === "lifetime" ? "lifetime" : `${plan.id}_${billingCycle}`;
      
      const response = await fetch("/api/payment/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          planId: planKey,
          currency: pricing.currency
        }),
      });

      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || "Failed to create checkout");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-16">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={cn("text-sm font-medium transition-colors", billingCycle === "monthly" ? "text-white" : "text-white/40")}>
          Monthly
        </span>
        <button
          onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
          className="relative w-14 h-7 bg-white/10 rounded-full border border-white/10 p-1 transition-colors hover:border-violet-500/50"
        >
          <div className={cn(
            "absolute w-5 h-5 bg-violet-500 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(139,92,246,0.5)]",
            billingCycle === "yearly" ? "translate-x-7" : "translate-x-0"
          )} />
        </button>
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium transition-colors", billingCycle === "yearly" ? "text-white" : "text-white/40")}>
            Yearly
          </span>
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] py-0 px-2 font-bold uppercase tracking-wider">
            Save 30%
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const isLifetime = plan.id === "lifetime";
          const displayPrice = isLifetime 
            ? plan.price 
            : billingCycle === "monthly" ? plan.price : plan.yearlyPrice;
          
          return (
            <Card key={plan.id} className={cn(
              "bg-white/[0.02] border transition-all duration-500 relative group hover:bg-white/[0.04] p-1",
              plan.popular ? "border-violet-500/50 scale-105 z-10 shadow-[0_0_40px_rgba(139,92,246,0.1)]" : "border-white/5"
            )}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-600/20 px-3 py-1 text-xs font-bold uppercase tracking-widest">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <div className="p-6">
                <CardHeader className="text-center pb-4 p-0">
                  <CardTitle className="text-xl font-black text-white tracking-tight uppercase">{plan.name}</CardTitle>
                  <div className="mt-6 flex flex-col items-center">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-white/40 self-start mt-1.5">{pricing.symbol}</span>
                      <span className="text-5xl font-black text-white tracking-tighter">{displayPrice}</span>
                      {!isLifetime && plan.price > 0 && <span className="text-white/40 text-sm font-medium">/{billingCycle === "monthly" ? "mo" : "yr"}</span>}
                    </div>
                    {billingCycle === "yearly" && plan.yearlySavings && !isLifetime && (
                      <div className="text-[10px] font-bold text-emerald-400 mt-2 uppercase tracking-widest">
                        Save {pricing.symbol}{plan.yearlySavings} per year
                      </div>
                    )}
                    {isLifetime && (
                      <div className="text-[10px] font-bold text-amber-400 mt-2 uppercase tracking-widest">
                        One-time payment
                      </div>
                    )}
                  </div>
                  <p className="text-white/50 text-xs mt-4 leading-relaxed px-4">{plan.description}</p>
                </CardHeader>

                <CardContent className="p-0 pt-8">
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, j) => (
                      <div key={j} className="flex items-start gap-3 text-sm">
                        {feature.included ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-emerald-400" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <X className="w-3 h-3 text-white/20" />
                          </div>
                        )}
                        <span className={cn("text-xs leading-tight font-medium", feature.included ? "text-white/70" : "text-white/30")}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={() => handleSubscribe(plan)}
                    disabled={isLoading !== null}
                    className={cn(
                      "w-full h-11 font-bold text-xs uppercase tracking-[0.1em] transition-all",
                      plan.popular 
                        ? "bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-600/20" 
                        : plan.id === "free"
                          ? "bg-white/5 hover:bg-white/10 text-white/70"
                          : "bg-white/10 hover:bg-white/20 text-white"
                    )}
                  >
                    {isLoading === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
