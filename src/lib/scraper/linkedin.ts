import puppeteer from "puppeteer";

/**
 * VelseAI — LinkedIn Job Intelligence Scraper
 * 
 * Extracts:
 * - Hiring Manager name/profile
 * - Job Poster role
 * - Company details
 * -JD text (as fallback if vision fails)
 */

export interface LinkedInLeadData {
  hiring_manager?: {
    name: string;
    profile_url?: string;
    title?: string;
  };
  job_poster_role?: string;
  company_name: string;
  job_title: string;
  is_verified_poster: boolean;
}

export async function scrapeLinkedInJob(url: string): Promise<LinkedInLeadData> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    
    // Set user agent to avoid basic blocks
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

    // Wait for the main job content
    await page.waitForSelector(".job-view-layout", { timeout: 10000 }).catch(() => null);

    const data = await page.evaluate(() => {
      const getText = (sel: string) => document.querySelector(sel)?.textContent?.trim() || "";
      
      // Selectors for public view (Guest)
      const company = getText(".topcard__org-name-link") || getText(".job-details-jobs-unified-top-card__company-name");
      const title = getText(".topcard__title") || getText(".job-details-jobs-unified-top-card__job-title");
      
      // Hiring Manager / Poster Section
      // Note: This often requires a session, but some public jobs show "Meet the hiring team"
      const posterName = getText(".hirer-card__name") || getText(".jobs-poster-card__name");
      const posterTitle = getText(".hirer-card__title") || getText(".jobs-poster-card__headline");
      const posterLink = (document.querySelector(".hirer-card__link") as HTMLAnchorElement)?.href || "";

      return {
        company_name: company,
        job_title: title,
        hiring_manager: posterName ? {
          name: posterName,
          profile_url: posterLink,
          title: posterTitle
        } : undefined,
        is_verified_poster: !!document.querySelector(".jobs-poster-card__verified-badge")
      };
    });

    if (!data.company_name && !data.job_title) {
       throw new Error("Could not extract job data. The page might be protected or the URL is invalid.");
    }

    return data as LinkedInLeadData;

  } finally {
    await browser.close();
  }
}
