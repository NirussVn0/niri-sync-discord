import { describe, it, expect } from "vitest";
import { runDiagnostics } from "../cli.js";

describe("CLI Diagnostics", () => {
  it("generates a structured diagnostic report with system and tool status", () => {
    const diag = runDiagnostics();

    expect(diag).toHaveProperty("timestamp");
    expect(diag).toHaveProperty("nodeVersion");
    expect(diag).toHaveProperty("platform");
    expect(diag).toHaveProperty("niri");
    expect(diag).toHaveProperty("playerctl");
    expect(diag).toHaveProperty("discordIpc");
    expect(diag).toHaveProperty("database");
  });
});
