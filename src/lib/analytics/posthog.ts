"use client";

import { useEffect, type ReactNode } from "react";

let posthogInstance: unknown = null;
let initialized = false;

export function initPostHog() {
  if (initialized) return;
  
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";
  
  if (!apiKey) {
    console.log("[Analytics] PostHog API key not set - using console logging only");
    return;
  }
  
  try {
    const { Posthog } = require("posthog-js");
    posthogInstance = new Posthog(apiKey, {
      host,
      autogcaptue: true,
      disable_session_recording: true,
    });
    initialized = true;
    console.log("[Analytics] PostHog initialized successfully");
  } catch (error) {
    console.error("[Analytics] Failed to initialize PostHog:", error);
  }
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (!posthogInstance) {
    console.log("[Analytics] identifyUser:", userId, traits);
    return;
  }
  try {
    (posthogInstance as { identify: (id: string, traits?: Record<string, unknown>) => void }).identify(userId, traits);
  } catch (error) {
    console.error("[Analytics] identify error:", error);
  }
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (!posthogInstance) {
    console.log("[Analytics] trackEvent:", event, properties);
    return;
  }
  try {
    (posthogInstance as { capture: (event: string, properties?: Record<string, unknown>) => void }).capture(event, properties);
  } catch (error) {
    console.error("[Analytics] trackEvent error:", error);
  }
}

export async function captureServerEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  const apiKey = process.env.POSTHOG_API_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";
  
  if (!apiKey) {
    console.log("[Analytics Server] captureServerEvent:", event, properties);
    return;
  }
  
  try {
    const { PostHog } = require("posthog-node");
    const client = new PostHog(apiKey, { host });
    await client.capture({
      distinctId: (properties?.distinctId as string) || "server",
      event,
      properties,
    });
    await client.shutdown();
  } catch (error) {
    console.error("[Analytics Server] captureServerEvent error:", error);
  }
}