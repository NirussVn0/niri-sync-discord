import { describe, it, expect, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { TokenManager } from "../auth/token-manager.js";

describe("TokenManager & IPC Auth", () => {
  const testTokenPath = path.join(os.tmpdir(), `test-presenced-${Date.now()}.token`);
  let manager: TokenManager;

  afterEach(() => {
    manager?.destroy();
  });

  it("generates a 64-character (256-bit) hex token and writes with 0600 permissions", () => {
    manager = new TokenManager({
      tokenPath: testTokenPath,
      enableAuth: true,
    });

    const token = manager.getToken();
    expect(token).toHaveLength(64);
    expect(fs.existsSync(testTokenPath)).toBe(true);

    const content = fs.readFileSync(testTokenPath, "utf8");
    expect(content).toBe(token);

    const stats = fs.statSync(testTokenPath);
    // 0o600 mode
    expect(stats.mode & 0o777).toBe(0o600);
  });

  it("validates authentic tokens and rejects invalid tokens", () => {
    manager = new TokenManager({
      tokenPath: testTokenPath,
      enableAuth: true,
    });

    expect(manager.validate(manager.getToken())).toBe(true);
    expect(manager.validate("wrong-token")).toBe(false);
    expect(manager.validate(null)).toBe(false);
    expect(manager.validate(undefined)).toBe(false);
  });

  it("allows all tokens when auth is disabled", () => {
    manager = new TokenManager({
      enableAuth: false,
    });

    expect(manager.validate(undefined)).toBe(true);
    expect(manager.validate("anything")).toBe(true);
  });
});
