import { createClient } from "@/lib/supabase/server";
import { sendText as sendWhatsAppText } from "@/lib/whatsapp/client";
import { fetchAdzunaJobs } from "./adzuna";

/**
 * VelseAI — Multi-Channel Broadcast Engine 2.0 (Live Ingestion)
 */

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

async function sendTelegramText(chatId: string, text: string): Promise<void> {
  if (!TELEGRAM_TOKEN) return;
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
}

export async function processJobBroadcasts() {
  const supabase = await createClient();

  // 1. Fetch active alerts
  const { data: alerts } = await supabase
    .from("job_alerts")
    .select(`
      *,
      profiles (
        id,
        email,
        whatsapp_phone,
        telegram_chat_id
      )
    `)
    .eq("is_active", true);

  if (!alerts || alerts.length === 0) return { matched: 0, notified: 0 };

  // 2. LIVE INGESTION: Fetch and cache jobs for all alert keywords
  const allKeywords = Array.from(new Set(alerts.flatMap(a => a.keywords || [])));
  if (allKeywords.length > 0) {
    const liveJobs = await fetchAdzunaJobs(allKeywords.slice(0, 5)); // Limit keywords for API health
    const jobInserts = liveJobs.map(job => ({
      provider: "adzuna",
      external_id: String(job.id),
      url: job.redirect_url,
      job_title: job.title,
      company_name: job.company.display_name,
      location: job.location.display_name,
      description: job.description,
      salary_info: job.salary_min ? `${job.salary_min} - ${job.salary_max}` : null,
      posted_at: job.created
    }));

    if (jobInserts.length > 0) {
      // Use upsert to prevent unique constraint (URL) crashes
      await supabase.from("external_jobs").upsert(jobInserts, { onConflict: "url" });
    }
  }

  // 3. Fetch recent unprocessed external jobs
  const { data: jobs } = await supabase
    .from("external_jobs")
    .select("*")
    .eq("is_processed", false)
    .order("created_at", { ascending: false })
    .limit(50);

  if (!jobs || jobs.length === 0) return { matched: 0, notified: 0 };

  let notifiedCount = 0;
  let matchedCount = 0;

  for (const alert of alerts) {
    for (const job of jobs) {
      const alertKeywords = alert.keywords || [];
      const jobText = (job.job_title + " " + (job.description || "")).toLowerCase();
      
      const matchedKeywords = alertKeywords.filter((k: string) => jobText.includes(k.toLowerCase()));
      const score = alertKeywords.length > 0 
        ? Math.round((matchedKeywords.length / alertKeywords.length) * 100)
        : 50;

      if (score >= 60) {
        matchedCount++;
        
        const { count } = await supabase
          .from("alert_matches")
          .select("*", { count: 'exact', head: true })
          .eq("alert_id", alert.id)
          .eq("job_id", job.id);

        if (count && count > 0) continue;

        await supabase.from("alert_matches").insert({
          alert_id: alert.id,
          job_id: job.id,
          match_score: score
        });

        const profile = alert.profiles as any;
        const message = `🚀 *Match Alert: ${score}% Match Detected*\n\n` +
          `🏢 *${job.company_name}*\n` +
          `💼 ${job.job_title}\n` +
          `📍 ${job.location || "Remote"}\n\n` +
          `🔗 [One-Click Apply](${job.url})\n\n` +
          `_Powered by VelseAI Network Domination Protocol_`;

        try {
          if (alert.channel === "whatsapp" && profile.whatsapp_phone) {
            await sendWhatsAppText({ to: profile.whatsapp_phone, body: message });
            notifiedCount++;
          } else if (alert.channel === "telegram" && profile.telegram_chat_id) {
            await sendTelegramText(profile.telegram_chat_id, message);
            notifiedCount++;
          }
        } catch (err) {
          console.error(`[Broadcast] Notification failed:`, err);
        }
      }
    }
  }

  return { matched: matchedCount, notified: notifiedCount };
}
