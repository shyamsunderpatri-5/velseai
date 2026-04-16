/**
 * VelseAI — Privacy & Integrity Utility
 * 
 * Ensures all platform logs and external telemetry adhere to 
 * GDPR and Indian Data Privacy standards by masking sensitive PII.
 */

export function maskPII(value: string | undefined | null): string {
  if (!value) return "REDACTED";
  if (value.includes("@")) {
    const [user, domain] = value.split("@");
    return `${user[0]}${"*".repeat(user.length - 1)}@${domain}`;
  }
  if (value.startsWith("+") || /[0-9]{10}/.test(value)) {
    return value.replace(/.(?=.{4})/g, "*");
  }
  return value.replace(/.(?=.{2})/g, "*");
}
