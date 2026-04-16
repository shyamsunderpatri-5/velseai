import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | VELSEAI",
  description: "Review the terms and conditions for using the VELSEAI AI Resume Builder and ATS Scanner.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0D0D12] text-white pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            Terms of Service
          </h1>
          <p className="text-white/40 text-lg">
            Last Updated: April 14, 2026
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-12">
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
              <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">01</span>
              Acceptance of Terms
            </h2>
            <p className="text-white/60 leading-relaxed">
              By accessing or using VELSEAI ("the Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
            <h2 className="text-2xl font-bold text-violet-400 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-sm">02</span>
              AI Usage & Limitations
            </h2>
            <div className="space-y-4 text-white/70 leading-relaxed">
              <p>
                VELSEAI utilizes advanced artificial intelligence to provide resume optimization and ATS scanning services. While we aim for maximum accuracy:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>AI suggestions are for guidance only and do not guarantee job placement.</li>
                <li>Users are responsible for verifying the factual accuracy of all resume content.</li>
                <li>The Service should be used as a tool to augment, not replace, professional career judgment.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
              <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">03</span>
              Subscription & Payments
            </h2>
            <div className="space-y-4 text-white/60">
              <p>
                Certain features require a paid subscription or a "Sprint Pass." All payments are processed securely via Stripe.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                  <h4 className="font-bold mb-1 text-white">Cancellations</h4>
                  <p className="text-xs text-white/40">Subscriptions can be cancelled at any time through your account settings.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                  <h4 className="font-bold mb-1 text-white">Refunds</h4>
                  <p className="text-xs text-white/40">We offer a 7-day satisfaction guarantee for first-time subscribers.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
              <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">04</span>
              Prohibited Conduct
            </h2>
            <p className="text-white/60 leading-relaxed">
              Users agree not to: (a) reverse engineer the AI models; (b) use the service for automated bulk document generation; or (c) attempt to bypass service limitations or security filters.
            </p>
          </section>

          <footer className="pt-12 border-t border-white/5 text-center text-sm text-white/20">
            <p>Questions? Contact <a href="mailto:support@velseai.com" className="text-white/40 hover:text-white underline transition-colors">support@velseai.com</a></p>
          </footer>
        </div>
      </div>
    </div>
  );
}
