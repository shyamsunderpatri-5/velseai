import { describe, it, expect } from "vitest";
import { scoreResume } from "./scorer";

// ─────────────────────────────────────────────────────────────────────────────
// ATS Scorer — Smoke Tests
// Ensures the core scoring engine produces sane outputs without touching
// any external API, database, or browser APIs.
// ─────────────────────────────────────────────────────────────────────────────

const STRONG_RESUME = `
Senior Machine Learning Engineer with 6 years of experience building 
production AI systems. Expert in Python, TensorFlow, PyTorch, and LLM 
fine-tuning. Led cross-functional teams, deployed scalable ML pipelines 
on AWS and GCP. Strong background in NLP, generative AI, and agentic 
workflows. Built RAG systems, vector databases (Pinecone, Weaviate), 
and REST APIs. Proven track record of delivering measurable impact: 
reduced inference latency by 40%, improved model accuracy by 15%.
`;

const WEAK_RESUME = `
I am a hardworking individual who enjoys learning new things. 
I have worked at various companies and have good communication skills.
I am a team player and work well with others.
`;

const JOB_DESCRIPTION = `
We are looking for a Senior ML Engineer with 5+ years of Python experience.
Must have expertise in LLMs, generative AI, and NLP. Experience with AWS,
TensorFlow, PyTorch required. Knowledge of RAG systems and vector databases
(Pinecone, Weaviate) a strong plus. Must be able to lead technical teams.
`;

describe("scoreResume()", () => {
  it("returns a valid result object shape", () => {
    const result = scoreResume(STRONG_RESUME, JOB_DESCRIPTION);
    
    expect(result).toHaveProperty("overall_score");
    expect(result).toHaveProperty("keyword_score");
    expect(result).toHaveProperty("format_score");
    expect(result).toHaveProperty("skills_score");
    expect(result).toHaveProperty("matched_keywords");
    expect(result).toHaveProperty("missing_keywords");
    expect(result).toHaveProperty("suggestions");
    expect(result.suggestions).toHaveProperty("high_priority");
  });

  it("scores a strong resume higher than a weak resume", () => {
    const strong = scoreResume(STRONG_RESUME, JOB_DESCRIPTION);
    const weak   = scoreResume(WEAK_RESUME, JOB_DESCRIPTION);
    
    expect(strong.overall_score).toBeGreaterThan(weak.overall_score);
    expect(strong.keyword_score).toBeGreaterThan(weak.keyword_score);
  });

  it("overall_score is bounded between 0 and 100", () => {
    const result = scoreResume(STRONG_RESUME, JOB_DESCRIPTION);
    
    expect(result.overall_score).toBeGreaterThanOrEqual(0);
    expect(result.overall_score).toBeLessThanOrEqual(100);
  });

  it("matched keywords from JD appear in matched_keywords array", () => {
    const result = scoreResume(STRONG_RESUME, JOB_DESCRIPTION);
    
    // Python, TensorFlow, PyTorch are in both resume and JD
    const matched = result.matched_keywords.map(k => k.toLowerCase());
    expect(matched.some(k => ["python", "tensorflow", "pytorch"].includes(k))).toBe(true);
  });

  it("weak resume has missing keywords", () => {
    const result = scoreResume(WEAK_RESUME, JOB_DESCRIPTION);
    
    expect(result.missing_keywords.length).toBeGreaterThan(0);
  });

  it("suggestions arrays are always arrays (never null/undefined)", () => {
    const result = scoreResume(WEAK_RESUME, JOB_DESCRIPTION);
    
    expect(Array.isArray(result.suggestions.high_priority)).toBe(true);
    expect(Array.isArray(result.suggestions.medium_priority)).toBe(true);
    expect(Array.isArray(result.suggestions.low_priority)).toBe(true);
  });

  it("handles empty resume gracefully — no crash", () => {
    expect(() => scoreResume("", JOB_DESCRIPTION)).not.toThrow();
  });

  it("handles empty JD gracefully — no crash", () => {
    expect(() => scoreResume(STRONG_RESUME, "")).not.toThrow();
  });
});
