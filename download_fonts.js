const fs = require('fs');
const path = require('path');

async function downloadFont(url, filename) {
  console.log(`Downloading ${filename}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(path.join(__dirname, 'src', 'lib', 'pdf', 'fonts', filename), Buffer.from(arrayBuffer));
  console.log(`Saved ${filename}`);
}

async function main() {
  const base = "https://raw.githubusercontent.com/google/fonts/main/ofl/inter/static";
  try {
    await downloadFont(`${base}/Inter-Regular.ttf`, 'Inter-Regular.ttf');
    await downloadFont(`${base}/Inter-Bold.ttf`, 'Inter-Bold.ttf');
    await downloadFont(`${base}/Inter-Italic.ttf`, 'Inter-Italic.ttf');
  } catch (err) {
    console.error(err);
    // Try rsms/inter releases if google fonts fails
    const rsmsBase = "https://raw.githubusercontent.com/rsms/inter/master/docs/font-files";
    console.log("Trying rsms repo...");
    await downloadFont(`${rsmsBase}/Inter-Regular.ttf`, 'Inter-Regular.ttf');
    await downloadFont(`${rsmsBase}/Inter-Bold.ttf`, 'Inter-Bold.ttf');
    await downloadFont(`${rsmsBase}/Inter-Italic.ttf`, 'Inter-Italic.ttf');
  }
}

main().catch(console.error);
