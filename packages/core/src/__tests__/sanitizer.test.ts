import { describe, it, expect } from "vitest";
import { sanitizeText, isSensitiveApp } from "../sanitizer.js";

describe("sanitizer", () => {
  it("strips control characters and collapses whitespace", () => {
    const raw = "My   Project\u0000\u001F  File.ts  \n\t";
    const cleaned = sanitizeText(raw);
    expect(cleaned).toBe("My Project File.ts");
  });

  it("redacts secret patterns", () => {
    const tokenText = "bearer 1234567890abcdef1234567890";
    expect(sanitizeText(tokenText)).toBe("[Redacted Secret]");

    const ghToken = "ghp_123456789012345678901234567890123456";
    expect(sanitizeText(ghToken)).toBe("[Redacted Secret]");

    const apiKey = "api_key=abcdef1234567890";
    expect(sanitizeText(apiKey)).toBe("[Redacted Secret]");
  });

  it("replaces file paths by default", () => {
    const pathText = "Editing /home/user/secret_project/main.ts in Neovim";
    expect(sanitizeText(pathText)).toBe("Editing [Path] in Neovim");
  });

  it("truncates long strings to maxLength", () => {
    const longString = "A".repeat(200);
    const truncated = sanitizeText(longString, { maxLength: 100 });
    expect(truncated.length).toBe(100);
    expect(truncated.endsWith("…")).toBe(true);
  });

  it("identifies sensitive password managers and private apps", () => {
    expect(isSensitiveApp("1password")).toBe(true);
    expect(isSensitiveApp("org.keepassxc.KeePassXC")).toBe(true);
    expect(isSensitiveApp("bitwarden")).toBe(true);
    expect(isSensitiveApp("tor-browser")).toBe(true);
    expect(isSensitiveApp("code")).toBe(false);
    expect(isSensitiveApp("firefox")).toBe(false);
  });
});
