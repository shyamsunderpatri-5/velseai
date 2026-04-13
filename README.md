# VELSEAI — AI ATS Resume Builder

<p align="center">
  <strong>Beat the ATS. Get the Interview. In Any Language.</strong>
</p>

<p align="center">
  The only AI resume builder that beats ATS filters in 7 languages — at half the price of Rezi, Teal, and Kickresume.
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

### 🎯 Free ATS Checker (No Login Required)
- **Instant Analysis**: Get your ATS score in under 10 seconds
- **Keyword Optimization**: Identify missing keywords with actionable suggestions
- **4 Sub-Scores**: Keywords (40%), Format (25%), Skills (20%), Experience (15%)
- **Rate Limited**: 3 checks LIFETIME per IP for anonymous users (unlimited when logged in)
- **Share Results**: WhatsApp & LinkedIn sharing with score

### 📄 Resume Builder
- **7 Professional Templates**: Modern, Classic, Creative, Minimal, Tech, German Lebenslauf, Arabic RTL
- **9 Sections**: Personal Info, Summary, Experience, Education, Skills, Projects, Certifications, Languages, Achievements
- **Real-time Preview**: See changes as you type
- **Auto-save**: Saves every 30 seconds
- **Multiple Resumes**: Create and manage unlimited versions

### 🤖 AI Features
- **Bullet Point Generator**: Create achievement-focused bullets with quantified results
- **Resume Summary Writer**: Generate compelling professional summaries
- **Skill Suggestions**: Get recommendations based on target role
- **Cover Letter Generator**: AI-powered cover letters
- **"Fix My Entire Resume"**: One-click AI improvement (bullet points + summary + skills)
- **7 Languages**: AI responds in user's language (EN, DE, FR, ES, PT, AR, HI)
- **Powered by Ollama (free, local) or OpenAI GPT-4o-mini (fallback)**

### 💼 Job Tracker
- **Kanban Board**: Visual pipeline (Saved → Applied → Phone Screen → Interview → Offer → Rejected → Withdrawn)
- **Status Tracking**: Full application lifecycle
- **ATS Score Integration**: Track scores per application
- **Salary & Location**: Track important details
- **CSV Export**: Export all applications

### 🌍 Multilingual (7 Languages)
- 🇺🇸 English (en)
- 🇩🇪 German (de) — including German Lebenslauf template
- 🇫🇷 French (fr)
- 🇪🇸 Spanish (es)
- 🇧🇷 Portuguese (pt)
- 🇦🇪 Arabic (ar) — full RTL support
- 🇮🇳 Hindi (hi) — for diaspora

### 📤 Exports
- **PDF Export**: A4 format with Puppeteer
- **DOCX Export**: Word format
- **Watermark**: Free plan includes watermark, paid plans no watermark

### 💳 Payments (Stripe Only)
- **Global**: USD, EUR, BRL based on locale
- **Monthly & Yearly**: 30% discount for yearly
- **Lifetime Deal**: One-time payment

---

## Pricing

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 1 resume, 3 templates, 3 ATS checks LIFETIME, 5 AI uses/day, PDF (watermark) |
| Starter | $9.99/mo | 5 resumes, all templates, unlimited ATS, 50 AI uses/day, PDF+DOCX, Job tracker |
| Pro | $14.99/mo | Unlimited resumes & AI, no watermark, public resume links, priority support |
| Lifetime | $49 one-time | Everything in Pro, forever |

**Competitor Comparison:**

| Feature | VELSEAI | Rezi | Teal | Kickresume | Jobscan |
|---------|---------|------|------|------------|---------|
| Price/mo | $9.99 | $29 | $29 | $19 | $49 |
| Languages | 7 | 1 | 1 | 3 | 1 |
| ATS Score | ✅ | ✅ | ✅ | ❌ | ✅ |
| AI Builder | ✅ | ✅ | ✅ | ✅ | ❌ |
| Job Tracker | ✅ | ❌ | ✅ | ❌ | ❌ |
| German CV | ✅ | ❌ | ❌ | ❌ | ❌ |
| Arabic RTL | ✅ | ❌ | ❌ | ❌ | ❌ |
| Free Checker | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes + Supabase (PostgreSQL + Auth + Storage)
- **i18n**: next-intl (7 locales)
- **AI**: Ollama (local, free) with OpenAI GPT-4o-mini fallback
- **PDF**: Puppeteer + pdf-lib
- **DOCX**: html-docx-js
- **Email**: Nodemailer + Brevo SMTP
- **Payments**: Stripe (handles USD, EUR, GBP, BRL)
- **Analytics**: PostHog
- **Errors**: Sentry
- **State**: Zustand

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase account
- (Optional) Ollama for local AI
- (Optional) OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/shyamsunderpatri-5/velseai.git
cd velseai

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your credentials
```

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Enable Email and OAuth providers in Authentication settings
4. Copy your Supabase URL and keys to `.env.local`

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI (optional - Ollama or OpenAI)
OLLAMA_BASE_URL=http://localhost:11434
OPENAI_API_KEY=sk-your-key

# Payments (Stripe only)
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email
BREVO_SMTP_USER=your-email
BREVO_SMTP_PASS=your-brevo-key

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
POSTHOG_API_KEY=phc_xxx

# Errors (optional)
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Setting up Ollama (Optional)

For local AI features (free):

```bash
# Install Ollama
brew install ollama  # macOS
# or download from ollama.ai

# Pull a model
ollama pull mistral

# Start Ollama server
ollama serve
```

---

## Project Structure

```
velseai/
├── src/
│   ├── app/
│   │   ├── [locale]/              # Locale-based routing
│   │   │   ├── (marketing)/       # Public pages
│   │   │   │   ├── page.tsx        # Landing page
│   │   │   │   ├── ats-checker/    # Free ATS checker
│   │   │   │   └── pricing/        # Pricing page
│   │   │   ├── (dashboard)/        # Protected pages
│   │   │   │   ├── dashboard/      # Main dashboard
│   │   │   │   ├── resume/         # Resume builder
│   │   │   │   ├── jobs/           # Job tracker
│   │   │   │   └── settings/        # User settings
│   │   │   └── auth/               # Auth pages
│   │   ├── api/                    # API routes
│   │   │   ├── ats-score/          # ATS scoring engine
│   │   │   ├── ai/                 # AI features
│   │   │   ├── resume/              # PDF/DOCX export
│   │   │   ├── payment/stripe/     # Stripe checkout
│   │   │   ├── webhooks/stripe/    # Stripe webhooks
│   │   │   ├── job-alerts/         # Phase 2 scaffolding
│   │   │   ├── jd-extraction/      # Phase 4 scaffolding
│   │   │   └── webhooks/whatsapp/  # Phase 3 scaffolding
│   │   └── sitemap.ts              # SEO sitemap
│   ├── components/
│   │   ├── ui/                     # shadcn components
│   │   ├── ats/                    # ATS checker components
│   │   ├── resume/                 # Resume builder components
│   │   │   ├── editor/             # Resume editor
│   │   │   └── preview/            # Resume preview + templates
│   │   └── dashboard/              # Dashboard components
│   ├── lib/
│   │   ├── supabase/               # Supabase clients
│   │   ├── ai/                     # AI service layer
│   │   ├── ats/                    # ATS scoring engine
│   │   ├── payments/               # Stripe integration
│   │   ├── email/                  # Email service
│   │   └── analytics/              # PostHog integration
│   ├── i18n/                       # next-intl config
│   ├── messages/                   # Translation files (en, de, fr, es, pt, ar, hi)
│   ├── types/                      # TypeScript types
│   ├── stores/                     # Zustand stores
│   └── proxy.ts                    # Middleware
├── supabase/
│   └── schema.sql                  # Database schema
└── public/                         # Static assets
```

---

## Database Schema

### Core Tables
- `profiles` - User profiles (extends Supabase auth)
- `resumes` - User resumes with JSON content
- `ats_scores` - ATS check history
- `job_applications` - Job tracker entries
- `cover_letters` - Generated cover letters
- `subscriptions` - Payment subscriptions
- `ai_usage` - AI feature usage tracking
- `anonymous_ats_checks` - Rate limiting for free users (lifetime 3 checks)
- `email_queue` - Async email sending queue

### Phase 2-4 Scaffolding
- `job_alerts` - Job search alerts (coming soon)
- `whatsapp_sessions` / `whatsapp_messages` - WhatsApp integration (coming soon)
- `jd_extractions` - JD photo extraction (coming soon)
- `user_ip_tracking` - Account sharing detection

All tables have Row Level Security (RLS) enabled.

---

## API Routes

### ATS Scoring
- `POST /api/ats-score` - Analyze resume against job description

### AI Features
- `POST /api/ai/bullet-points` - Generate achievement bullets
- `POST /api/ai/resume-summary` - Generate professional summary
- `POST /api/ai/skill-suggestions` - Get skill recommendations
- `POST /api/ai/cover-letter` - Generate cover letter
- `POST /api/ai/interview-questions` - Practice questions
- `POST /api/ai/job-tailoring` - Tailor resume to job
- `POST /api/ai/career-advice` - Career guidance
- `POST /api/ai/remote-work` - Remote work optimization

### Resume
- `GET /api/resume/export-pdf` - Export resume as PDF
- `GET /api/resume/export-docx` - Export resume as DOCX

### Payments
- `POST /api/payment/stripe` - Create Stripe checkout session
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

### Jobs
- `GET /api/jobs` - List user's job applications
- `POST /api/jobs` - Create job application
- `PUT /api/jobs/[id]` - Update job application
- `DELETE /api/jobs/[id]` - Delete job application

### Utilities
- `POST /api/utils/share-detection` - Detect account sharing
- `POST /api/job-alerts` - Job alert management (Phase 2)
- `POST /api/jd-extraction` - JD photo extraction (Phase 4)

---

## Analytics Events (PostHog)

- `user_signed_up` - Sign up events
- `user_logged_in` - Login events
- `ats_check_completed` - ATS check results
- `export_clicked` - PDF/DOCX exports
- `fix_resume_clicked` - AI resume improvement

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

---

## Target Markets

1. 🇺🇸 USA / Canada / Australia — English, USD
2. 🇩🇪 Germany / Austria / Switzerland — German, EUR
3. 🇫🇷 France / Belgium — French, EUR
4. 🇧🇷 Brazil — Portuguese, BRL
5. 🇦🇪 UAE / Saudi Arabia — Arabic, USD
6. 🇵🇭 Philippines / 🇳🇬 Nigeria — English, USD

---

## Built with ❤️ for job seekers worldwide

**VELSEAI — Beat the ATS. Get the Interview. In Any Language.**
