import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { captureServerEvent } from "@/lib/analytics/posthog";
import * as Sentry from "@sentry/nextjs";
import type { ExternalJob } from "@/types/jobs";

/**
 * /api/jobs/recent — External job discovery endpoint
 *
 * Architecture:
 * 1. Check Supabase `cached_recent_jobs` table (miss if expired or missing)
 * 2. On cache miss: call TheirStack API (or Adzuna fallback, or mock)
 * 3. Optionally compute match score via AI (only if user has resume)
 * 4. Store in cache with 24h TTL
 * 5. Return normalized ExternalJob[]
 *
 * Query params:
 *   ?location=Berlin&skills=React,TypeScript&limit=20&refresh=true
 */

const querySchema = z.object({
  location: z.string().optional().default("Remote"),
  skills: z.string().optional().default(""),  // comma-separated
  limit: z.string().optional().default("20"),
  refresh: z.string().optional().default("false"),  // force cache refresh
});

// ─── TheirStack API types ─────────────────────────────────────────────────────

interface TheirStackJob {
  id: string;
  name: string;           // job title
  company: { name: string; logo?: string };
  location: string;
  remote: boolean;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  description: string;
  apply_url: string;
  date_posted: string;
  tech_tags: string[];
}

// ─── Normalize TheirStack response → ExternalJob ──────────────────────────────

function normalizeTheirStackJob(raw: TheirStackJob): ExternalJob {
  return {
    id: raw.id,
    title: raw.name,
    company: raw.company.name,
    company_logo: raw.company.logo,
    location: raw.location || "Remote",
    is_remote: raw.remote ?? false,
    salary_min: raw.salary_min,
    salary_max: raw.salary_max,
    salary_currency: raw.currency || "USD",
    description: raw.description?.slice(0, 1500) || "",
    required_skills: raw.tech_tags || [],
    url: raw.apply_url,
    source: "theirstack",
    posted_at: raw.date_posted,
  };
}

// ─── Mock jobs for when API key is missing ────────────────────────────────────

// ─── Elite Mock jobs with Global reach ────────────────────────────────────────

function getEliteMockJobs(location: string, userSkills: string[] = []): ExternalJob[] {
  const allMocks: ExternalJob[] = [
    {
      id: "elite-1",
      title: "Staff Product Engineer (AI)",
      company: "Vercel",
      location: "San Francisco, CA (Remote)",
      is_remote: true,
      salary_min: 180000,
      salary_max: 250000,
      salary_currency: "USD",
      description: "Join the team building the future of the web. Work on AI-native developer tools, Next.js core, and high-performance edge infrastructure. Looking for engineers who bridge the gap between AI research and product reality.",
      required_skills: ["Next.js", "TypeScript", "OpenAI", "React", "Rust", "Edge Functions"],
      url: "https://vercel.com/jobs",
      source: "mock",
      posted_at: new Date().toISOString(),
    },
    {
      id: "elite-2",
      title: "Senior Frontend Architect",
      company: "Linear",
      location: "London, UK (Remote)",
      is_remote: true,
      salary_min: 120000,
      salary_max: 180000,
      salary_currency: "GBP",
      description: "Linear is built on a foundation of craft and speed. You will lead the development of our high-performance desktop and mobile web clients. Experience with complex state management and fluid animations is essential.",
      required_skills: ["React", "TypeScript", "WASM", "Web Audio", "Framer Motion", "SQLite"],
      url: "https://linear.app/jobs",
      source: "mock",
      posted_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "elite-3",
      title: "Founding AI Engineer",
      company: "Perplexity AI",
      location: "New York, NY",
      is_remote: false,
      salary_min: 200000,
      salary_max: 300000,
      salary_currency: "USD",
      description: "We are reimagining search. You will build core indexing and retrieval systems that power the world's most advanced answer engine. Deep knowledge of LLMs, vector DBs, and search ranking is required.",
      required_skills: ["Python", "PyTorch", "Pinecone", "ElasticSearch", "LLMs", "FastAPI"],
      url: "https://perplexity.ai/jobs",
      source: "mock",
      posted_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "elite-4",
      title: "Full Stack Lead (Fintech)",
      company: "Revolut",
      location: "Berlin, Germany",
      is_remote: true,
      salary_min: 90000,
      salary_max: 140000,
      salary_currency: "EUR",
      description: "Scale financial services for 40M+ users. Lead a squad responsible for our Core Banking platform. Next-gen technology stack and high-velocity shipping culture.",
      required_skills: ["Java", "Kotlin", "React", "PostgreSQL", "Kafka", "Docker"],
      url: "https://revolut.com/jobs",
      source: "mock",
      posted_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "elite-5",
      title: "Senior UI/UX Engineer",
      company: "Stripe",
      location: "Bangalore, India",
      is_remote: true,
      salary_min: 6000000,
      salary_max: 9000000,
      salary_currency: "INR",
      description: "Build the interfaces that move billions of dollars. You care about every pixel, every frame of animation, and the overall developer experience of Stripe's Dashboard.",
      required_skills: ["React", "TypeScript", "D3.js", "Design Systems", "Tailwind CSS"],
      url: "https://stripe.com/jobs",
      source: "mock",
      posted_at: new Date(Date.now() - 43200000).toISOString(),
    }
  ];

  // Elite Scoring Logic: Real-time keyword cross-match simulation
  return allMocks.map(job => {
    let score = 0;
    const reasons: { factor: string; impact: string; detail: string }[] = [];
    const matchedSkills = job.required_skills.filter(s => 
      userSkills.map(us => us.toLowerCase()).includes(s.toLowerCase())
    );

    // Dynamic base score calculation
    if (matchedSkills.length > 0) {
      score = 40 + (matchedSkills.length / job.required_skills.length) * 50;
      reasons.push({
        factor: "Skills Match",
        impact: "High",
        detail: `You have ${matchedSkills.length} core technologies required for this role: ${matchedSkills.join(", ")}.`
      });
    } else {
      score = 25 + Math.random() * 15;
      reasons.push({
        factor: "Potential Alignment",
        impact: "Medium",
        detail: "Based on your general profile, you exhibit foundational alignment with the role's seniority level."
      });
    }

    if (job.is_remote) {
      score += 5;
      reasons.push({
        factor: "Geography",
        impact: "Positive",
        detail: "Remote-first position matches your preferred work-from-anywhere flexibility."
      });
    }

    return {
      ...job,
      match_score: Math.min(Math.round(score), 100),
      match_reasons: reasons
    };
  });
}

// ─── TheirStack API call ──────────────────────────────────────────────────────

async function fetchFromTheirStack(
  location: string,
  skills: string[],
  limit: number
): Promise<ExternalJob[]> {
  const apiKey = process.env.THEIRSTACK_API_KEY;
  if (!apiKey) {
    console.log("[jobs/recent] No THEIRSTACK_API_KEY — using elite mock engine");
    return getEliteMockJobs(location, skills);
  }

  try {
    const payload = {
      limit,
      page: 0,
      posted_at_max_age_days: 7,        // Last 7 days as per spec
      order_by: [{ desc: true, field: "date_posted" }],
      job_country_code_or: [],
      ...(location && location !== "Remote"
        ? { job_location_pattern_or: [location] }
        : { job_remote_or: [true] }),
      ...(skills.length > 0
        ? { technologies_or: skills.slice(0, 10) }
        : {}),
      include_total_results: false,
    };

    const response = await fetch("https://api.theirstack.com/v1/jobs/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      // 10-second timeout for external API
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[TheirStack] API error:", response.status, err);
      return getMockJobs(location, skills);
    }

    const data = await response.json();
    const rawJobs: TheirStackJob[] = data.data || data.jobs || [];
    return rawJobs.map(normalizeTheirStackJob);
  } catch (err) {
    console.error("[TheirStack] Fetch failed:", err);
    return getMockJobs(location, skills);
  }
}

// ─── Build cache key ──────────────────────────────────────────────────────────

function buildCacheKey(location: string, skills: string[]): string {
  const skillsKey = [...skills].sort().join(",").toLowerCase().slice(0, 100);
  return `${location.toLowerCase().replace(/\s+/g, "_")}:${skillsKey}`;
}

// ─── GET handler ──────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse + validate query params
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const params = querySchema.parse(searchParams);
    const skills = params.skills ? params.skills.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const limit = Math.min(parseInt(params.limit), 50);
    const forceRefresh = params.refresh === "true";

    // ── 1. Check Supabase cache ───────────────────────────────────────────────
    const cacheKey = buildCacheKey(params.location, skills);

    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from("cached_recent_jobs")
        .select("jobs_data, expires_at")
        .eq("cache_key", cacheKey)
        .single();

      if (cached && new Date(cached.expires_at) > new Date()) {
        // Cache hit! Return immediately
        const jobs = (cached.jobs_data as ExternalJob[]).slice(0, limit);
        return NextResponse.json({ jobs, cached: true, count: jobs.length });
      }
    }

    // ── 2. Cache miss — fetch from API ───────────────────────────────────────
    const jobs = await fetchFromTheirStack(params.location, skills, limit);

    // ── 3. Auto-use user preferences if no skills provided ───────────────────
    let userPrefs = null;
    if (skills.length === 0) {
      const { data: prefs } = await supabase
        .from("user_job_preferences")
        .select("skills, locations")
        .eq("user_id", user.id)
        .single();
      userPrefs = prefs;
    }

    // ── 4. Save to cache ──────────────────────────────────────────────────────
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await supabase
      .from("cached_recent_jobs")
      .upsert({
        cache_key: cacheKey,
        jobs_data: jobs,
        location: params.location,
        skills,
        job_count: jobs.length,
        source: process.env.THEIRSTACK_API_KEY ? "theirstack" : "mock",
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      }, { onConflict: "cache_key" });

    // ── 5. Track analytics ────────────────────────────────────────────────────
    await captureServerEvent("jobs_discovered", {
      distinctId: user.id,
      location: params.location,
      skills_count: skills.length,
      jobs_returned: jobs.length,
      cache_hit: false,
    });

    return NextResponse.json({
      jobs: jobs.slice(0, limit),
      cached: false,
      count: jobs.length,
    });

  } catch (err) {
    Sentry.captureException(err);
    console.error("[/api/jobs/recent] Error:", err);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
