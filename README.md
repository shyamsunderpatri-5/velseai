# VELSEAI — AI Career Co-Pilot (Global SaaS)

<p align="center">
  <strong>Beat the ATS. Land jobs. From anywhere.</strong>
</p>

<p align="center">
  VelseAI is a world-class, technical-first career platform designed to help candidates dominate the North American and European job markets. We combine AI-powered resume optimization, real-time mock interviews, and automated ecosystem tools to turn job seekers into hired professionals.
</p>

<p align="center">
  <a href="https://velseai.com">velseai.com</a> •
  <a href="#features">Features</a> •
  <a href="#pricing">Pricing</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a>
</p>

---

## Features

### 🎯 Pro ATS Checker
- **Deep Analysis**: Proprietary scoring engine (Keywords, Format, Skills, Experience).
- **Keyword Optimization**: One-click detection of missing technical terms.
- **Job Tailoring**: Automatically adapt your resume to a specific job description.

### 📄 Next-Gen AI Resume Builder
- **Elite Templates**: Optimized for ATS logic (Modern, Tech, German CV/Lebenslauf, Arabic RTL).
- **AI "Fix My Resume"**: One-click global optimization of summaries and bullet points.
- **Multilingual AI**: Full support for English, German, French, Spanish, Portuguese, and Arabic.

### 🤖 AI Technical Interview Engine
- **Mock Interviews**: Interactive technical rounds (DSA/System Design) with a Senior Lead AI.
- **Growth Roadmap**: Automatically identifies skill gaps and builds a personalized learning path with resources.

### 🔌 VelseAI Chrome Extension
- **Instant Sync**: Capture jobs from LinkedIn and Indeed directly into your VelseAI dashboard.
- **JD Extraction**: High-accuracy parsing of job requirements from any web page.

### 💼 Career Co-Pilot Hub
- **Job Application Tracker**: Kanban pipeline with automated follow-up alerts.
- **WhatsApp/Telegram Integration**: Receive job matches and application alerts on your phone.
- **Public Bio-Link Portfolio**: A professional public page (`/u/username`) with a secure recruiter bridge.

---

## ⏳ What is pending (Phase 5: Enterprise & Market Maturity)

To transform VelseAI into a tier-1 global SaaS leader, we are prioritizing these items for our next milestone:

*   **AI Voice Integration**: Real-time "Listen & Speak" mode using OpenAI's Realtime API for immersive, low-latency mock interviews.
*   **Referral Dashboard**: A dedicated portal for users to track referrals and earn free "Pro Months."
*   **Market Intelligence (Salary Benchmarking)**: Real-time salary data for major US/Canada hubs integrated directly into the dashboard.
*   **Premium PDF Customization**: "Design Pro" mode for granular control over typography, layouts, and color palettes.
*   **Official WhatsApp Business API**: Upgrading to a verified business API for professional-grade transactional automation.
*   **Enterprise Workspaces**: Secure multi-seat dashboards for recruitment agencies and university career departments.

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes + Supabase (PostgreSQL + RLS + Auth + Storage)
- **AI Engine**: OpenAI GPT-4o (Production) / Ollama (Local Development)
- **Ecosystem**: Chrome Extension (Manifest v3, Content Scripts, Background Workers)
- **Automation**: Cron-based job alerts (WhatsApp/Telegram Webhooks)
- **PDF/DOCX Generator**: Puppeteer + pdf-lib + docx
- **Payments**: Stripe Global Integration (USD/CAD Focus)

---

## Pricing (North American Market)

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | 1 resume, 3 templates, Basic ATS checks, Watermarked PDF |
| **Starter** | $19/mo | 5 resumes, All templates, 3 Technical AI Mock Rounds/mo, No watermark |
| **Pro** | $39/mo | Unlimited resumes, Unlimited AI Technical Rounds, Public Portfolio, Priority Support |
| **Lifetime** | $149 | Everything in Pro, Forever (Founding Member Badge) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (PostgreSQL)
- OpenAI API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/shyamsunderpatri-5/velseai.git
cd velseai

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

### Environment Variables (.env)
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_key
```

### Run Locally
```bash
npm run dev
```

---

## Project Structure
```
velseai/
├── extension/          # Chrome Extension source
├── src/
│   ├── app/            # App Router (Next.js 16)
│   ├── components/     # UI Components (shadcn)
│   ├── lib/            # Shared Logic (AI, Payments, PDF)
│   └── i18n/           # Internationalization config
├── supabase/           # SQL Migrations & Schema
└── public/             # Static Assets
```

---

## Built with ❤️ for world-class talent
**VELSEAI — Beat the ATS. Land jobs. From anywhere.**
