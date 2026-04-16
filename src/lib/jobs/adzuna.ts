/**
 * VelseAI — Adzuna Job Data Engine
 * 
 * Fetches real-time job listings for the automated broadcast system.
 */

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;

export interface AdzunaJob {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  redirect_url: string;
  created: string;
  salary_min?: number;
  salary_max?: number;
  category?: { label: string };
}

export async function fetchAdzunaJobs(keywords: string[], country: string = "us", limit: number = 20): Promise<AdzunaJob[]> {
  if (!ADZUNA_APP_ID || !ADZUNA_API_KEY) {
    console.warn("[Adzuna] Credentials missing. Running in mock mode.");
    return [];
  }

  const query = keywords.join(" ");
  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_API_KEY}&results_per_page=${limit}&what=${encodeURIComponent(query)}&content-type=application/json`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Adzuna API Fault: ${res.status}`);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("[Adzuna] Fetch error:", err);
    return [];
  }
}
