// Kept in sync with shared/src/opencode-gateway.ts by the server attribution test.
// Runner is independently published and cannot depend on the control-plane packages.
/** Public product identity only: never include company, user, run, or credential data. */
export const OPENCODE_CLIENT_ID = "paperclip";

export function isOpenocodeGatewayUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "opencode.ai" || url.hostname.endsWith(".opencode.ai")) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

/**
 * OpenCode gateway endpoints (e.g. https://opencode.ai/zen/go/v1) require a
 * stable `x-opencode-session` id on model-request routes (listing endpoints
 * are exempt). The session id must stay stable across a conversation, so
 * callers derive it deterministically from connection-scoped inputs and never
 * rotate it per request. Clients are also asked to brand themselves with
 * their own user agent rather than a generic SDK name.
 */
export function opencodeClientHeaders(sessionId: string): Record<string, string> {
  return {
    "x-opencode-session": sessionId,
    "x-opencode-client": OPENCODE_CLIENT_ID,
    "user-agent": `${OPENCODE_CLIENT_ID}/1.0`,
  };
}
