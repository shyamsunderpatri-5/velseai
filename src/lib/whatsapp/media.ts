/**
 * VelseAI — WhatsApp Media Fetcher
 *
 * Fetches image/document media from WhatsApp Cloud API by media_id.
 * Used to download JD photos sent by users → passed to GPT-4o vision.
 *
 * Flow:
 *   media_id → GET /v21.0/{media_id} → get download URL
 *           → GET URL (with auth header) → Buffer
 *           → base64 for OpenAI vision API
 */

const WA_API_URL = "https://graph.facebook.com/v21.0";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;

export interface MediaInfo {
  url: string;
  mimeType: string;
  sha256: string;
  fileSize: number;
  id: string;
}

/**
 * Step 1: Get the temporary download URL for a media_id.
 * URLs expire after 5 minutes — fetch immediately.
 */
export async function getMediaUrl(mediaId: string): Promise<MediaInfo> {
  const res = await fetch(`${WA_API_URL}/${mediaId}`, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(`Failed to get media URL for ${mediaId}: ${JSON.stringify(err)}`);
  }

  const data = await res.json();

  return {
    url: data.url,
    mimeType: data.mime_type,
    sha256: data.sha256,
    fileSize: data.file_size,
    id: data.id,
  };
}

/**
 * Step 2: Download the actual media bytes using the temporary URL.
 * Returns a Buffer ready for:
 *  - base64 encoding → OpenAI vision API
 *  - Storage in Supabase Storage
 */
export async function downloadMediaBuffer(mediaUrl: string): Promise<Buffer> {
  const res = await fetch(mediaUrl, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    signal: AbortSignal.timeout(30000), // 30s for large images
  });

  if (!res.ok) {
    throw new Error(`Failed to download media: ${res.status} ${res.statusText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Convenience: fetch media by ID and return as base64 data URL.
 * Ready to pass to OpenAI vision API as image_url.
 */
export async function mediaIdToBase64(mediaId: string): Promise<{
  base64: string;
  dataUrl: string;
  mimeType: string;
  byteSize: number;
}> {
  const info = await getMediaUrl(mediaId);
  const buffer = await downloadMediaBuffer(info.url);
  const base64 = buffer.toString("base64");

  return {
    base64,
    dataUrl: `data:${info.mimeType};base64,${base64}`,
    mimeType: info.mimeType,
    byteSize: buffer.byteLength,
  };
}

/**
 * Upload a buffer to Supabase Storage and return the public URL.
 * Used to persist JD images for reference in jd_extractions table.
 */
export async function uploadMediaToSupabase(
  supabase: ReturnType<typeof import("@supabase/supabase-js").createClient>,
  buffer: Buffer,
  userId: string,
  mimeType: string
): Promise<string | null> {
  try {
    const ext = mimeType.split("/")[1] || "jpg";
    const path = `jd-photos/${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("velseai-media")
      .upload(path, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error("[Media] Supabase upload error:", error);
      return null;
    }

    const { data } = supabase.storage.from("velseai-media").getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.error("[Media] Upload failed:", err);
    return null;
  }
}
