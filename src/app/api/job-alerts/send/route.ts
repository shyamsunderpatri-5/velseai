import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/sender";
import type { ExternalJob } from "@/types/jobs";
import * as Sentry from "@sentry/nextjs";

/**
 * POST /api/job-alerts/send
 *
 * Fired by Vercel cron (daily at 07:00 UTC) via /api/cron/job-alerts.
 * Sends personalized job digest emails to users who have:
 *   - alert_email = true
 *   - alert_frequency = 'daily' (or 'weekly' on Mondays)
 *
 * Security: CRON_SECRET header required.
 *
 * Flow:
 *   1. Fetch all eligible users from user_job_preferences
 *   2. For each user, fetch cached jobs matching their prefs
 *   3. Filter to only jobs posted in last 24h
 *   4. Build personalized HTML digest email
 *   5. Send via sender.ts (Brevo/Gmail SMTP)
 *   6. Update last_alert_sent_at in user_job_preferences
 */

// ─── HTML email builder ────────────────────────────────────────────────────────

function buildJobAlertEmailHtml(params: {
  userName: string;
  jobs: ExternalJob[];
  location: string;
  unsubscribeUrl: string;
  appUrl: string;
}): string {
  const { userName, jobs, location, unsubscribeUrl, appUrl } = params;

  const jobCards = jobs
    .slice(0, 8)
    .map((job) => {
      const matchBadge =
        job.match_score && job.match_score >= 60
          ? `<span style="background:#7c3aed;color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;">${job.match_score}% match</span>`
          : "";

      const salaryStr =
        job.salary_min && job.salary_max
          ? `${job.salary_currency || "$"}${Math.round(job.salary_min / 1000)}k–${Math.round(job.salary_max / 1000)}k`
          : "";

      const skillChips = job.required_skills
        .slice(0, 4)
        .map(
          (s) =>
            `<span style="background:#f3e8ff;color:#7c3aed;border-radius:12px;padding:2px 8px;font-size:10px;margin:2px;">${s}</span>`
        )
        .join("");

      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #f3f4f6;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="font-size:16px;font-weight:700;color:#111827;">${job.title}</div>
                  <div style="font-size:13px;color:#6b7280;margin:3px 0;">${job.company} · ${job.location} ${job.is_remote ? "🌍 Remote" : ""}</div>
                  ${salaryStr ? `<div style="font-size:12px;color:#059669;margin:3px 0;">💰 ${salaryStr}</div>` : ""}
                  <div style="margin:6px 0;">${skillChips}</div>
                </td>
                <td align="right" valign="top">
                  <div>${matchBadge}</div>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top:10px;">
                  <a href="${job.url}" target="_blank" style="display:inline-block;background:#111827;color:#fff;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">Apply Now →</a>
                  &nbsp;
                  <a href="${appUrl}/jobs" style="font-size:12px;color:#7c3aed;text-decoration:none;">Track Application</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Daily Job Digest — VelseAI</title>
</head>
<body style="font-family:system-ui,-apple-system,sans-serif;margin:0;padding:0;background:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px;background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#a855f7 100%);">
              <div style="font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;">✨ VelseAI</div>
              <div style="font-size:14px;color:rgba(255,255,255,0.8);margin-top:4px;">Your Daily Job Digest · ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
              <div style="margin-top:16px;font-size:20px;font-weight:700;color:#fff;">
                ${jobs.length} new jobs near <span style="text-decoration:underline;text-decoration-style:dotted;">${location}</span>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="color:#374151;font-size:15px;margin:0 0 24px;">Hi <strong>${userName}</strong>! Here are today's top matches based on your skills and preferences:</p>

              <table width="100%" cellpadding="0" cellspacing="0">
                ${jobCards}
              </table>

              <!-- CTA -->
              <div style="text-align:center;margin:32px 0 0;">
                <a href="${appUrl}/jobs/discover" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;font-weight:700;">
                  See All ${jobs.length}+ Jobs →
                </a>
                <div style="margin-top:12px;font-size:12px;color:#9ca3af;">Also available in your Kanban tracker</div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:11px;text-align:center;">
                © ${new Date().getFullYear()} VelseAI · 
                <a href="${appUrl}/settings" style="color:#6b7280;">Manage preferences</a> · 
                <a href="${unsubscribeUrl}" style="color:#6b7280;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Validate cron secret
  const cronSecret = request.headers.get("x-cron-secret") || request.headers.get("authorization")?.replace("Bearer ", "");

  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Use service role to read all user preferences
    const { createClient: createSupabase } = await import("@supabase/supabase-js");
    const serviceDb = createSupabase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const today = new Date();
    const isMonday = today.getDay() === 1;

    // Get users eligible for alerts today
    const { data: userPrefs } = await serviceDb
      .from("user_job_preferences")
      .select("*, profiles!inner(email, full_name)")
      .eq("alert_email", true)
      .or(`alert_frequency.eq.daily,and(alert_frequency.eq.weekly,${isMonday})`);

    if (!userPrefs || userPrefs.length === 0) {
      return NextResponse.json({ sent: 0, message: "No eligible users" });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://velseai.com";
    let sentCount = 0;
    const errors: string[] = [];

    for (const prefs of userPrefs) {
      try {
        const location = prefs.locations?.[0] || "Remote";
        const skills = prefs.skills || [];

        // Build cache key to look up cached jobs
        const skillsKey = [...skills].sort().join(",").toLowerCase().slice(0, 100);
        const cacheKey = `${location.toLowerCase().replace(/\s+/g, "_")}:${skillsKey}`;

        const { data: cached } = await serviceDb
          .from("cached_recent_jobs")
          .select("jobs_data, updated_at")
          .eq("cache_key", cacheKey)
          .single();

        if (!cached?.jobs_data) continue;

        const allJobs = cached.jobs_data as ExternalJob[];

        // Filter to last 24h jobs only
        const recentCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentJobs = allJobs.filter(
          (j) => new Date(j.posted_at) > recentCutoff
        );

        if (recentJobs.length === 0) continue;

        // Sort by match score if available
        const sortedJobs = recentJobs.sort(
          (a, b) => (b.match_score || 0) - (a.match_score || 0)
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profile = (prefs as any).profiles;
        const userName = profile?.full_name?.split(" ")[0] || "there";
        const userEmail = profile?.email;

        if (!userEmail) continue;

        const unsubscribeUrl = `${appUrl}/api/user/preferences/unsubscribe?userId=${prefs.user_id}`;

        const html = buildJobAlertEmailHtml({
          userName,
          jobs: sortedJobs,
          location,
          unsubscribeUrl,
          appUrl,
        });

        await sendEmail({
          to: userEmail,
          subject: `🔥 ${sortedJobs.length} new jobs in ${location} — VelseAI Daily Digest`,
          html,
        });

        // Update last sent time
        await serviceDb
          .from("user_job_preferences")
          .update({ last_alert_sent_at: new Date().toISOString() })
          .eq("user_id", prefs.user_id);

        sentCount++;
      } catch (userErr) {
        console.error(`[job-alerts] Failed for user ${prefs.user_id}:`, userErr);
        errors.push(prefs.user_id);
      }
    }

    console.log(`[job-alerts] Sent ${sentCount} emails, ${errors.length} errors`);

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errors.length,
      total_eligible: userPrefs.length,
    });

  } catch (err) {
    Sentry.captureException(err);
    console.error("[job-alerts] Fatal error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
