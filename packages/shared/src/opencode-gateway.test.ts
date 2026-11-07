import { describe, expect, it } from "vitest";
import { isOpenocodeGatewayUrl, opencodeClientHeaders, OPENCODE_CLIENT_ID } from "./opencode-gateway.js";

describe("isOpenocodeGatewayUrl", () => {
  it("accepts opencode.ai gateway endpoints", () => {
    for (const url of [
      "https://opencode.ai/zen/go/v1",
      "https://opencode.ai/zen/v1",
      "https://sub.opencode.ai/v1",
    ]) {
      expect(isOpenocodeGatewayUrl(url)).toBe(true);
    }
  });
  it("rejects other providers and malformed values", () => {
    for (const url of [
      "http://opencode.ai/zen/go/v1",
      "https://eviI.example.com/v1",
      "https://gateway.example/v1",
      "https://user:pass@opencode.ai/v1",
      "not a url",
      "",
      undefined,
    ]) {
      expect(isOpenocodeGatewayUrl(url)).toBe(false);
    }
  });
});

describe("opencodeClientHeaders", () => {
  it("identifies the client and carries a stable session id", () => {
    const headers = opencodeClientHeaders("stable-session-id");
    expect(headers).toMatchObject({
      "x-opencode-session": "stable-session-id",
      "x-opencode-client": OPENCODE_CLIENT_ID,
      "user-agent": `${OPENCODE_CLIENT_ID}/1.0`,
    });
  });
});
