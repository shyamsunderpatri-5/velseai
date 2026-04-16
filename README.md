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
- **Deep Analysis Protocol**: Proprietary scoring engine (Keywords, Format, Skills, Experience).
- **Keyword Intelligence**: One-click detection of missing technical terms with severity mapping.

### 🧠 Intelligence Advisory Engine (Replaced Legacy Builders)
- **Contextual Sentence Frames**: Instead of generating templated PDFs, VelseAI generates highly customized, copy-pasteable bullet points that inject missing keywords seamlessly into your existing experience.
- **Multilingual AI Strategy**: Full support for evaluating resumes in English, German, French, Spanish, Portuguese, and Arabic.
- **Authenticity Proofing**: Detects "keyword stuffing" and overly generic AI phrasing.

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

*   **Performance Review Synthesizer (Brag Document)**: Retain hired users by allowing them to drop weekly messy notes, automatically generating their annual performance review or updating their passive resume.
*   **"Passive Bait" LinkedIn Autobomber**: AI that drips optimal keywords into your LinkedIn profile to constantly trigger recruiter algorithms while you're employed.
*   **Offer & Equity Negotiation Protocol**: Paste your job offer, and the AI evaluates market data to generate the exact aggressive email required to secure a 15% salary increase.
*   **Referral Dashboard**: A dedicated portal for users to track referrals and earn free "Sprint Passes."
*   **Market Intelligence (Salary Benchmarking)**: Real-time salary data for major US/Canada hubs integrated directly into the dashboard.
*   **AI Voice Integration**: Real-time "Listen & Speak" mode using OpenAI's Realtime API for immersive, low-latency mock interviews.

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes + Supabase (PostgreSQL + RLS + Auth + Storage)
- **AI Engine**: Groq LPU (Ultra-Fast Parsing) + OpenAI GPT-4o (Deep Analysis)
- **Ecosystem**: Chrome Extension (Manifest v3, Content Scripts, Background Workers)
- **Automation**: Cron-based job alerts (WhatsApp/Telegram Webhooks)
- **Payments**: Stripe Global Integration (USD/CAD Focus)

---

## Pricing (North American Market)

| Plan | Price | Features |
|------|-------|----------|
| **Trial** | $0 | 1 Basic ATS Check, Limited Analysis Visibility |
| **Sprint Pass** | $9/30-days | Unlimited Intelligence Audits, Full AI Protocol Unlock, No Auto-Renewal |
| **Career Dominion** | $49/yr | For passive job seekers: Auto-updating Brag Documents, Continuous LinkedIn Optimization advice |

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
