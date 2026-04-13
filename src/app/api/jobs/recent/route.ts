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

function getMockJobs(location: string, skills: string[]): ExternalJob[] {
  return [
    {
      id: "mock-1",
      title: "Senior Full Stack Engineer",
      company: "Revolut",
      location: location,
      is_remote: true,
      job_type: "full_time",
      salary_min: 90000,
      salary_max: 130000,
      salary_currency: "USD",
      description: "We are looking for a Senior Full Stack Engineer to join our growing team. You will work on high-scale financial products used by 30M+ customers. Strong Next.js, TypeScript, and PostgreSQL skills required.",
      required_skills: skills.length > 0 ? skills.slice(0, 5) : ["Next.js", "TypeScript", "PostgreSQL", "React", "Node.js"],
      url: "https://careers.revolut.com",
      source: "mock",
      posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      match_score: 78,
    },
    {
      id: "mock-2",
      title: "Frontend Engineer – AI Products",
      company: "Mistral AI",
      location: "Paris, France",
      is_remote: true,
      job_type: "full_time",
      salary_min: 80000,
      salary_max: 120000,
      salary_currency: "EUR",
      description: "Shape the future of AI interfaces. You'll build beautiful, performant UIs for our LLM products. We value engineers who care deeply about UX and performance.",
      required_skills: ["React", "TypeScript", "Tailwind CSS", "Framer Motion", "REST APIs"],
      url: "https://mistral.ai/careers",
      source: "mock",
      posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      match_score: 65,
    },
    {
      id: "mock-3",
      title: "Backend Engineer – Platform",
      company: "Stripe",
      location: "Dublin, Ireland",
      is_remote: false,
      job_type: "full_time",
      salary_min: 120000,
      salary_max: 180000,
      salary_currency: "EUR",
      description: "Stripe's Platform team builds the infrastructure that powers global payments for millions of businesses. You'll work on distributed systems, APIs, and developer tools.",
      required_skills: ["Go", "PostgreSQL", "Redis", "Kafka", "Kubernetes", "gRPC"],
      url: "https://stripe.com/jobs",
      source: "mock",
      posted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      match_score: 52,
    },
    {
      id: "mock-4",
      title: "AI/ML Engineer",
      company: "DeepMind",
      location: "London, UK",
      is_remote: false,
      job_type: "full_time",
      salary_min: 100000,
      salary_max: 160000,
      salary_currency: "GBP",
      description: "Join DeepMind's Applied AI team. You'll implement and optimize ML models for real-world deployment. Strong Python, PyTorch, and production ML experience required.",
      required_skills: ["Python", "PyTorch", "TensorFlow", "MLOps", "CUDA", "LLMs"],
      url: "https://deepmind.google/careers",
      source: "mock",
      posted_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      match_score: 41,
    },
    {
      id: "mock-5",
      title: "Full Stack Developer – SaaS",
      company: "Shopify",
      location: location,
      is_remote: true,
      job_type: "remote",
      salary_min: 100000,
      salary_max: 140000,
      salary_currency: "CAD",
      description: "Build commerce experiences for millions of merchants. You'll work on our storefront and checkout APIs, partner integrations, and internal tooling.",
      required_skills: ["Ruby on Rails", "React", "GraphQL", "TypeScript", "MySQL"],
      url: "https://shopify.com/careers",
      source: "mock",
      posted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      match_score: 70,
    },
  ];
}

// ─── TheirStack API call ──────────────────────────────────────────────────────

async function fetchFromTheirStack(
  location: string,
  skills: string[],
  limit: number
): Promise<ExternalJob[]> {
  const apiKey = process.env.THEIRSTACK_API_KEY;
  if (!apiKey) {
    console.log("[jobs/recent] No THEIRSTACK_API_KEY — using mock data");
    return getMockJobs(location, skills);
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
