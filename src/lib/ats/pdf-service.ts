/**
 * Premium PDF Generation Service — Vercel-Compatible
 * -------------------------------------------------------
 * Uses environment-aware browser launch:
 *  - LOCAL (dev): full `puppeteer` (bundled Chromium, no extra config)
 *  - PRODUCTION (Vercel): `puppeteer-core` + `@sparticuz/chromium`
 *    (Vercel's 250MB function limit blocks full puppeteer's Chromium binary)
 */

async function getBrowser() {
  if (process.env.NODE_ENV === "production") {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteerCore = (await import("puppeteer-core")).default;
    return puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  } else {
    const puppeteer = (await import("puppeteer")).default;
    return puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
}

export async function generatePremiumPDF(html: string, _outputPath: string): Promise<Buffer> {
  // 1. ATS Normalization (Anti-mojibake)
  const normalizedHtml = normalizeTextForATS(html);

  // 2. Environment-aware browser launch
  const browser = await getBrowser();

  try {
    const page = await browser.newPage();

    const styledHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@700;900&display=swap" rel="stylesheet" />
          <style>
            *, *::before, *::after { box-sizing: border-box; }
            body {
              font-family: 'DM Sans', sans-serif;
              margin: 0;
              color: #1a1a1a;
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            h1, h2, h3, h4 {
              font-family: 'Space Grotesk', sans-serif;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin: 0 0 0.5em;
            }
            h1 { font-size: 2rem; }
            h2 { font-size: 1.25rem; color: #3b0764; border-bottom: 2px solid #7c3aed; padding-bottom: 4px; }
            h3 { font-size: 1rem; }
            .container { padding: 40px; max-width: 100%; }
            p { line-height: 1.7; margin: 0 0 0.75em; }
            ul { padding-left: 1.2em; margin: 0 0 0.75em; }
            li { margin-bottom: 0.35em; line-height: 1.6; }
            .score-chip {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 99px;
              background: #7c3aed;
              color: #fff;
              font-family: 'Space Grotesk', sans-serif;
              font-size: 0.75rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.1em;
            }
            .section { margin-bottom: 2rem; }
            .tag {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 6px;
              background: #f3f0ff;
              color: #6d28d9;
              font-size: 0.7rem;
              font-weight: 700;
              margin: 2px;
              text-transform: uppercase;
            }
            table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
            th { font-family: 'Space Grotesk', sans-serif; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.15em; padding: 10px; background: #f9f8ff; color: #6d28d9; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #ede9fe; font-size: 0.85rem; vertical-align: top; }
            @page { size: A4; margin: 0.6in; }
          </style>
        </head>
        <body>
          <div class="container">
            ${normalizedHtml}
          </div>
        </body>
      </html>
    `;

    await page.setContent(styledHtml, { waitUntil: "networkidle0", timeout: 30000 });

    // Wait for fonts to be fully loaded
    await page.evaluate(() => document.fonts.ready);

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.6in",
        right: "0.6in",
        bottom: "0.6in",
        left: "0.6in",
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

/**
 * Normalizes text for ATS compatibility by converting problematic Unicode symbols.
 * Prevents "mojibake" (garbled text) in legacy recruiters' systems.
 */
function normalizeTextForATS(html: string): string {
  if (!html) return html;

  return html
    .replace(/\u2014/g, "-")                          // em-dash
    .replace(/\u2013/g, "-")                          // en-dash
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')      // smart double quotes
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")      // smart single quotes
    .replace(/\u2026/g, "...")                         // ellipsis
    .replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, "") // zero-width spaces
    .replace(/\u00A0/g, " ")                          // non-breaking space
    .replace(/\u2219|\u2022/g, "*");                  // bullets -> asterisks
}
