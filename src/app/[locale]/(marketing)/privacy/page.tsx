import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | VELSEAI",
  description: "Learn how VELSEAI protects your data with transient in-memory processing and zero-retention architecture.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0D0D12] text-white pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            Privacy Policy
          </h1>
          <p className="text-white/40 text-lg">
            Effective Date: April 14, 2026
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-12">
          <section className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
            <h2 className="text-2xl font-bold text-emerald-400 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-sm">01</span>
              The In-Memory Guarantee
            </h2>
            <div className="space-y-4 text-white/70 leading-relaxed">
              <p className="font-bold text-white">
                VELSEAI operates on a "Zero-Retention" architecture for all candidate documents.
              </p>
              <p>
                When you upload a resume or job description for ATS analysis, our engine processes the data <strong>transiently in-memory</strong>. Once the analysis is complete and the results are delivered to your session:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>The document is purged from active memory.</li>
                <li>No copies are stored on our persistent database servers.</li>
                <li>Your raw resume text is never tracked or categorized for training models without explicit consent.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
              <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">02</span>
              Information We Collect
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5">
                <h3 className="font-bold text-lg mb-2 text-violet-400">Account Data</h3>
                <p className="text-sm text-white/50">Basic identity information (Name, Email) required to manage your subscription and project history.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5">
                <h3 className="font-bold text-lg mb-2 text-violet-400">Usage Analytics</h3>
                <p className="text-sm text-white/50">Anonymous telemetry (page views, button clicks) to improve platform performance and security.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
              <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">03</span>
              Security Infrastructure
            </h2>
            <p className="text-white/60 leading-relaxed">
              We utilize enterprise-grade encryption (AES-256) for all data in transit. Our infrastructure is hosted on secure, SOC2-compliant cloud environments with continuous monitoring to prevent unauthorized access.
            </p>
          </section>

          <section className="p-8 rounded-3xl bg-violet-600/5 border border-violet-500/10 text-center">
            <h2 className="text-xl font-bold mb-4">Contact Our Privacy Team</h2>
            <p className="text-white/50 text-sm mb-6">Questions about your data or our processing protocols?</p>
            <a href="mailto:privacy@velseai.com" className="text-violet-400 font-bold hover:underline italic">
              privacy@velseai.com
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
