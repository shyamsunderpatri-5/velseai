# VELSEAI — Intelligence Advisory Protocol

VelseAI is a technical, AI-driven SaaS platform engineered to help professionals bypass strict Applicant Tracking Systems (ATS). Unlike traditional "Resume Builders" that generate templated PDFs, VelseAI operates as an **Intelligence Advisory Engine**. It ingests a user's existing resume, cross-references it against a target Job Description (JD), and outputs highly customized, ready-to-copy "Sentence Frames" designed to inject missing keywords naturally.

---

## 🏗 High-Level Design (HLD)

VelseAI operates on a modern, serverless architecture optimized for high-speed AI inference and deterministic output generation.

1.  **Frontend Layer**: Next.js 16 (App Router) client handling localized UI, form ingestion, and complex visual data representation (Radar Charts, ATS Score Gauges).
2.  **Auth & Database Layer**: Supabase handles enterprise-grade JWT sessions, PostgreSQL data persistence (User Profiles, Scans, Usage Quotas), and Row Level Security (RLS).
3.  **Application Logic (The Proxy)**: A localized `proxy.ts` bridges Next.js routing requirements, resolving legacy middleware conflicts and securing dashboard routes based on session validity.
4.  **Intelligence Engine Layer**: 
    *   **Deterministic Pass**: Fast RegExp-based extraction to instantly identify missing skills/keywords (`src/lib/ats/scorer.ts`).
    *   **Semantic AI Pass**: Uses Groq (for ultra-fast token streaming) and OpenAI GPT-4o for deep contextual understanding. The AI reads the missing keywords and generates customized "Sentence Frames" based on the user's specific past experience.
5.  **Telemetry & Monetization Layer**: PostHog captures fine-grained analytics on feature usage. Stripe handles the localized "$9 Sprint Pass" checkout flows.

---

## ⚙️ Low-Level Design (LLD)

### Data Models & Schemas (Supabase Postgres)
-   `users / profiles`: Core auth and subscription tier (Free, Sprint Pass).
-   `resumes`: Stores parsed text, raw JSON representations, and metadata.
-   `ai_usage`: Tracks token consumption and feature usage (e.g., "ATS Check", "Mock Interview") for rate-limiting.

### Core Modules (`src/lib/`)
-   **`/lib/ats/engine.ts`**: The orchestrator. Combines the deterministic output (`scoreResume`) with the AI semantic output to generate an overall algorithmic score (0-100).
-   **`/lib/ai/prompts.ts`**: The central repository for all LLM context instructions, including the `getATSImprovementPrompt` which commands the AI to build tailored keyword sentences.
-   **`/lib/ai/structured-outputs.ts`**: Comprehensive Zod schemas (e.g., `ATSScoreResultSchema`). We use OpenAI's Structured Outputs mechanism to guarantee the API returns perfect, typed JSON arrays containing our customized sentence frames.
-   **`/lib/ai/groq.ts`**: A wrapper prioritizing the Groq API (Llama3/Mixtral) for low-latency tasks like single-bullet rewrites, while falling back to OpenAI natively for deeper reasoning.

### Key Components (`src/components/ats/`)
-   **`DeepAnalysisSection.tsx`**: Renders the complete breakdown of the intelligence gap.
-   **`MissingIntelligenceTable.tsx`**: Dynamically maps over `missingKeywords`. It intersects the raw missing keyword strings with the AI-generated `keyword_frames` to display custom, copy-pasteable bullet advice.
-   **`ScoreRadarChart.tsx`**: Uses `framer-motion` to plot multi-JD viral comparisons.
-   **Zustand Stores (`comparisonStore.ts`)**: Manages the transient state when comparing a single resume against multiple Job Descriptions concurrently.

---

## 🛠 Tech Stack & Dependencies

### Core Frameworks
-   **Next.js (16.2.3)**: React framework with App Router topology.
-   **React (19.2.4)**: UI Component logic.
-   **TypeScript (5.x)**: Strict typing throughout the architecture.

### UI & Styling
-   **Tailwind CSS (v4)**: Core utility classes.
-   **Framer Motion (12.38.0)**: Complex mounting animations for scores and radar charts.
-   **Radix UI**: Headless accessible primitives (`@radix-ui/react-dialog`, `tabs`, `progress`, `switch`, `toast`).
-   **Lucide React (1.8.0)**: Consistent SVG iconography toolkit.

### AI & Intelligence
-   **OpenAI SDK (6.34.0)**: Main interface for GPT-4o structured outputs.
-   *(Implicit)* **Groq**: Rapid inference API integration for high-speed deterministic JSON generation.
-   **Zod (4.3.6)**: Schema validation and structured output mapping.
-   **Replicate (1.4.0)**: Hooked in for optional feature sets (AI Headshots).

### Database & Auth
-   **Supabase SSR (0.10.2) & Supabase-JS (2.103.0)**: PostgreSQL DB interactions, Edge Functions, Auth cookies.

### Parsers & Extractors
-   **Mammoth (1.12.0)**: `.docx` parsing for converting user uploads into raw ingestible text.
-   **PDF-Parse (2.4.5)**: Extracting text from standard `.pdf` uploads.
-   *(Note: Legacy `puppeteer` and `pdf-lib` exist in the `package.json` from Phase 1 builder architectures, but generation was stripped in favor of the Advisory format).*

### Telemetry & Business
-   **PostHog JS/Node**: Event tracking and user flow optimization.
-   **Stripe (22.0.1)**: Financial integration and checkout session generation.
-   **Nodemailer (8.0.5)**: Transactional email (Waitlists, Alerts).

### Best Practices & Code Quality
-   **Zustand (5.0.12)**: Lightweight global state (preferable to Redux).
-   **React Hook Form (7.72.1) + @hookform/resolvers (5.2.2)**: Performant, type-safe form validation bridging perfectly with Zod.
-   **Sentry NextJS (10.48.0)**: Production crash reporting and boundary detection.

---

## 🚀 Setup & Execution

```bash
# Clone the Core Asset
git clone https://github.com/shyamsunderpatri-5/velseai.git
cd velseai

# Install Dependencies
npm install

# Initialize Environment (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_secret
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key

# Boot Development Server
npm run dev
```

**System Output Guarantee**: By design, the architecture guarantees that a VelseAI generated audit produces mathematically perfect Zod-aligned AI responses, eliminating JSON parse failures in production.
