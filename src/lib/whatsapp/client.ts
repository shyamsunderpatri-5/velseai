/**
 * VelseAI — WhatsApp Business Cloud API Client
 *
 * Handles all outbound communication:
 * - sendText: plain text messages
 * - sendInteractiveButtons: up to 3 quick-reply buttons
 * - sendDocument: send PDF buffer back to user
 * - sendReaction: emoji reaction to a message
 *
 * Meta WhatsApp Cloud API v21.0
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const WA_API_URL = "https://graph.facebook.com/v21.0";
const PHONE_ID = process.env.WHATSAPP_BUSINESS_PHONE_ID!;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WATextMessage {
  to: string;
  body: string;
  previewUrl?: boolean;
}

export interface WAButton {
  id: string;     // max 256 chars — used as payload in reply
  title: string;  // max 20 chars
}

export interface WAInteractiveButtonsMessage {
  to: string;
  bodyText: string;
  footerText?: string;
  headerText?: string;
  buttons: WAButton[];  // max 3 buttons
}

export interface WADocumentMessage {
  to: string;
  documentBuffer: Buffer;
  fileName: string;
  caption?: string;
  mimeType?: string;
}

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function waFetch(endpoint: string, body: Record<string, unknown>): Promise<Response> {
  if (!PHONE_ID || !ACCESS_TOKEN) {
    throw new Error(
      "WhatsApp credentials not configured. Set WHATSAPP_BUSINESS_PHONE_ID and WHATSAPP_ACCESS_TOKEN."
    );
  }

  const response = await fetch(`${WA_API_URL}/${PHONE_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    console.error("[WhatsApp Client] API error:", response.status, JSON.stringify(err));
    throw new Error(`WhatsApp API error ${response.status}: ${JSON.stringify(err)}`);
  }

  return response;
}

// ─── Upload media to WhatsApp servers (needed for sending documents) ──────────

async function uploadMedia(buffer: Buffer, mimeType: string, fileName: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", new Blob([new Uint8Array(buffer)], { type: mimeType }), fileName);
  formData.append("type", mimeType);
  formData.append("messaging_product", "whatsapp");

  const res = await fetch(`${WA_API_URL}/${PHONE_ID}/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    body: formData,
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(`Media upload failed: ${JSON.stringify(err)}`);
  }

  const { id } = await res.json();
  return id; // media_id for use in messages
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Send a plain text message
 */
export async function sendText({ to, body, previewUrl = false }: WATextMessage): Promise<void> {
  await waFetch("messages", {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: {
      body,
      preview_url: previewUrl,
    },
  });
}

/**
 * Send an interactive message with up to 3 quick-reply buttons.
 * User's reply will have button.payload set to the button id.
 */
export async function sendInteractiveButtons({
  to,
  bodyText,
  footerText,
  headerText,
  buttons,
}: WAInteractiveButtonsMessage): Promise<void> {
  if (buttons.length > 3) {
    throw new Error("WhatsApp interactive buttons: max 3 buttons allowed");
  }

  await waFetch("messages", {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      ...(headerText
        ? { header: { type: "text", text: headerText } }
        : {}),
      body: { text: bodyText },
      ...(footerText ? { footer: { text: footerText } } : {}),
      action: {
        buttons: buttons.map((b) => ({
          type: "reply",
          reply: { id: b.id, title: b.title },
        })),
      },
    },
  });
}

/**
 * Upload a document buffer (PDF) and send it to the user.
 * Used for sending tailored resume PDFs back in chat.
 */
export async function sendDocument({
  to,
  documentBuffer,
  fileName,
  caption,
  mimeType = "application/pdf",
}: WADocumentMessage): Promise<void> {
  // Step 1: Upload to WhatsApp servers
  const mediaId = await uploadMedia(documentBuffer, mimeType, fileName);

  // Step 2: Send as document message using media_id
  await waFetch("messages", {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "document",
    document: {
      id: mediaId,
      filename: fileName,
      caption: caption || "",
    },
  });
}

/**
 * Send emoji reaction to a specific message.
 * Used to acknowledge receipt (e.g. ✅ when processing starts).
 */
export async function sendReaction(to: string, messageId: string, emoji: string): Promise<void> {
  await waFetch("messages", {
    messaging_product: "whatsapp",
    to,
    type: "reaction",
    reaction: {
      message_id: messageId,
      emoji,
    },
  });
}

/**
 * Mark a message as read (updates ✓✓ to blue in WhatsApp)
 */
export async function markAsRead(messageId: string): Promise<void> {
  await waFetch("messages", {
    messaging_product: "whatsapp",
    status: "read",
    message_id: messageId,
  });
}
