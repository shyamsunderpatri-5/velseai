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
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PostHog } = require("posthog-node");
    const client = new PostHog(apiKey, { host });
    await client.capture({
      distinctId: (properties?.distinctId as string) || "server",
      event,
      properties: {
        ...properties,
        $lib: "posthog-node",
        $lib_version: "3.1.2", // Standard version for the workspace
      },
    });
    await client.shutdown();
  } catch (error) {
    console.error("[Analytics Server] captureServerEvent error:", error);
  }
}
