import { createClient } from "../supabase/server";

/**
 * Milestone 3: Portal Scanner Engine
 * Automatically discovers leads from elite company boards (Greenhouse, Ashby, Lever).
 */

const TARGET_KEYWORDS = [
  "AI", "ML", "LLM", "Agent", "Agentic", "GenAI", "Generative AI", 
  "NLP", "Solutions Architect", "Solutions Engineer", "Forward Deployed",
  "Product Manager", "RevOps", "Automation"
];

const NEGATIVE_KEYWORDS = [
  "Junior", "Intern", "Crypto", "Blockchain", "Web3", ".NET", "Java "
];

interface DiscoveryTarget {
  name: string;
  type: "greenhouse" | "ashby" | "lever";
  url: string;
}

const DISCOVERY_TARGETS: DiscoveryTarget[] = [
  { name: "Anthropic", type: "greenhouse", url: "https://boards-api.greenhouse.io/v1/boards/anthropic/jobs" },
  { name: "OpenAI", type: "ashby", url: "https://api.ashbyhq.com/posting-api/job-board/openai?includeCompensation=true" }, 
  { name: "ElevenLabs", type: "ashby", url: "https://api.ashbyhq.com/posting-api/job-board/elevenlabs?includeCompensation=true" },
  { name: "Airtable", type: "greenhouse", url: "https://boards-api.greenhouse.io/v1/boards/airtable/jobs" },
  { name: "Vercel", type: "greenhouse", url: "https://boards-api.greenhouse.io/v1/boards/vercel/jobs" },
  { name: "Mistral", type: "lever", url: "https://api.lever.co/v0/postings/mistral" },
  { name: "Cohere", type: "ashby", url: "https://api.ashbyhq.com/posting-api/job-board/cohere?includeCompensation=true" },
  { name: "LangChain", type: "ashby", url: "https://api.ashbyhq.com/posting-api/job-board/langchain?includeCompensation=true" },
  { name: "Weights & Biases", type: "lever", url: "https://api.lever.co/v0/postings/wandb" },
];

/**
 * Enterprise Concurrency Limiter
 * Ensures we don't overwhelm external APIs while maintaining high-speed discovery.
 */
async function parallelScan(targets: DiscoveryTarget[], limit: number, scanFn: (target: DiscoveryTarget) => Promise<any[]>) {
  const results: any[] = [];
  const tasks = [...targets];
  
  async function worker() {
    while (tasks.length > 0) {
      const target = tasks.shift();
      if (target) {
        const found = await scanFn(target);
        results.push(...found);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, targets.length) }, worker));
  return results;
}

export async function runDiscoveryScan() {
  const supabase = await createClient();
  
  // 1. Load institutional dedup data (to avoid reposts)
  const { data: existingLeads } = await supabase
    .from("job_discovery")
    .select("company_name, job_title, job_url");
    
  const seenUrls = new Set(existingLeads?.map(l => l.job_url) || []);
  const seenCompanyRoles = new Set(existingLeads?.map(l => `${l.company_name.toLowerCase()}::${l.job_title.toLowerCase()}`) || []);

  const scanTarget = async (target: DiscoveryTarget) => {
    const foundInTarget = [];
    try {
      const res = await fetch(target.url);
      if (!res.ok) return [];

      const data = await res.json();
      let rawJobs = [];

      if (target.type === "greenhouse") rawJobs = data.jobs || [];
      if (target.type === "ashby") rawJobs = data.jobs || [];
      if (target.type === "lever") rawJobs = Array.isArray(data) ? data : [];

      for (const raw of rawJobs) {
        const title = target.type === "lever" ? raw.text : raw.title;
        const url = target.type === "lever" ? raw.hostedUrl : (raw.absolute_url || raw.jobUrl);
        const location = target.type === "lever" ? raw.categories?.location : (raw.location?.name || raw.location);

        if (!title || !url) continue;

        // Enterprise Dedup Protocol (URL + Company::Role)
        if (seenUrls.has(url)) continue;
        const key = `${target.name.toLowerCase()}::${title.toLowerCase()}`;
        if (seenCompanyRoles.has(key)) continue;

        // Filter Logic
        const lowerTitle = title.toLowerCase();
        const matchesKeyword = TARGET_KEYWORDS.some(k => lowerTitle.includes(k.toLowerCase()));
        const matchesNegative = NEGATIVE_KEYWORDS.some(k => lowerTitle.includes(k.toLowerCase()));

        if (matchesKeyword && !matchesNegative) {
          seenUrls.add(url);
          seenCompanyRoles.add(key);
          foundInTarget.push({
            company_name: target.name,
            job_title: title,
            job_url: url,
            location: location || "Remote / Unspecified",
            source: "portal_scanner"
          });
        }
      }
    } catch (error) {
      console.error(`[Scanner] Failed to scan ${target.name}:`, error);
    }
    return foundInTarget;
  };

  const allFoundLeads = await parallelScan(DISCOVERY_TARGETS, 5, scanTarget);

  // Bulk Insert with upsert to prevent duplicates on job_url
  if (allFoundLeads.length > 0) {
    const { error } = await supabase
      .from("job_discovery")
      .upsert(allFoundLeads, { onConflict: "job_url" });

    if (error) {
      console.error("[Scanner] Failed to save discovered leads:", error);
    }
    return allFoundLeads.length;
  }

  return 0;
}
