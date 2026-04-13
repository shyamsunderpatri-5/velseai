# Selvo - AI ATS Resume Builder

<p align="center">
  <img src="public/logo.svg" alt="Selvo Logo" width="120" />
</p>

<p align="center">
  <strong>Beat the ATS. Get the Interview.</strong>
</p>

<p align="center">
  An AI-powered ATS resume builder targeted at Indian, Southeast Asian, and emerging market job seekers.
</p>

<p align="center">
  <a href="https://selvo.in">selvo.in</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#documentation">Documentation</a>
</p>

---

## Features

### Free ATS Checker (No Login Required)
- **Instant Analysis**: Get your ATS score in under 10 seconds
- **Keyword Optimization**: Identify missing keywords and get actionable suggestions
- **Format Scoring**: Check if your resume is ATS-friendly
- **Rate Limited**: 3 checks/day for anonymous users (10/day when logged in)

### Resume Builder
- **5 Professional Templates**: Modern, Classic, Creative, Minimal, Tech
- **Real-time Preview**: See changes as you type
- **Auto-save**: Never lose your work
- **Multiple Resumes**: Create and manage multiple versions

### AI Features
- **Bullet Point Generator**: Create achievement-focused bullets with quantified results
- **Resume Summary Writer**: Generate compelling professional summaries
- **Skill Suggestions**: Get recommendations based on your target role
- **AI powered by Ollama (free, local) or OpenAI (fallback)**

### Job Tracker
- **Kanban Board**: Visual pipeline for your applications
- **Status Tracking**: Saved → Applied → Phone Screen → Interview → Offer
- **ATS Score Integration**: Track scores for each application
- **Salary & Location**: Keep track of important details

### Pricing
| Plan | Price | Features |
|------|-------|----------|
| Free | ₹0 | 1 resume, 3 ATS checks/day, 5 AI uses/day |
| Starter | ₹199/mo | 5 resumes, unlimited ATS, 50 AI uses/day |
| Pro | ₹499/mo | Unlimited everything |
| Lifetime | ₹2,999 one-time | Pro forever |

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes + Supabase (PostgreSQL + Auth + Storage)
- **AI**: Ollama (local, free) with fallback to OpenAI GPT-4o-mini
- **PDF Generation**: Puppeteer
- **Email**: Nodemailer + Brevo SMTP
- **Payments**: Razorpay (India) + Stripe (International)
- **State**: Zustand (client), React Query (server)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- (Optional) Ollama for local AI
- (Optional) OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/selvo.git
cd selvo

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

# Payments
RAZORPAY_KEY_ID=rzp_xxx
RAZORPAY_KEY_SECRET=xxx
STRIPE_SECRET_KEY=sk_xxx

# Email
BREVO_SMTP_USER=your-email
BREVO_SMTP_PASS=your-brevo-key
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
selvo/
├── src/
│   ├── app/
│   │   ├── (marketing)/      # Public pages
│   │   │   ├── page.tsx       # Landing page
│   │   │   ├── ats-checker/   # Free ATS checker
│   │   │   └── pricing/       # Pricing page
│   │   ├── (dashboard)/      # Protected pages
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── resume/        # Resume builder
│   │   │   └── jobs/          # Job tracker
│   │   ├── api/               # API routes
│   │   │   ├── ats-score/     # ATS scoring engine
│   │   │   ├── ai/            # AI features
│   │   │   └── resume/        # PDF export
│   │   └── auth/              # Auth pages
│   ├── components/
│   │   ├── ui/                # shadcn components
│   │   ├── ats/                # ATS checker components
│   │   ├── resume/             # Resume builder components
│   │   └── dashboard/          # Dashboard components
│   ├── lib/
│   │   ├── supabase/          # Supabase clients
│   │   ├── ai/                # AI service layer
│   │   └── ats/               # ATS scoring engine
│   ├── types/                 # TypeScript types
│   ├── stores/                # Zustand stores
│   └── hooks/                 # Custom hooks
├── supabase/
│   └── schema.sql             # Database schema
└── public/                    # Static assets
```

---

## Database Schema

The database includes:

- `profiles` - User profiles (extends Supabase auth)
- `resumes` - User resumes with JSON content
- `ats_scores` - ATS check history
- `job_applications` - Job tracker entries
- `cover_letters` - Generated cover letters
- `subscriptions` - Payment subscriptions
- `ai_usage` - AI feature usage tracking
- `anonymous_ats_checks` - Rate limiting for free users
- `email_queue` - Async email sending queue

All tables have Row Level Security (RLS) enabled.

---

## API Routes

### ATS Scoring
- `POST /api/ats-score` - Analyze resume against job description

### AI Features
- `POST /api/ai/bullet-points` - Generate achievement bullets
- `POST /api/ai/resume-summary` - Generate professional summary
- `POST /api/ai/skill-suggestions` - Get skill recommendations

### Resume
- `GET /api/resume/export-pdf` - Export resume as PDF
- `GET /api/resume/export-docx` - Export resume as DOCX

### Jobs
- `GET /api/jobs` - List user's job applications
- `POST /api/jobs` - Create job application
- `PUT /api/jobs/[id]` - Update job application
- `DELETE /api/jobs/[id]` - Delete job application

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Railway (Optional)

For background workers and additional compute:
- Deploy Supabase separately or use hosted Supabase
- Deploy API routes as separate services

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is proprietary software. All rights reserved.

---

## Built with ❤️ for Indian job seekers

**Selvo - Beat the ATS. Get the Interview.**
