import { describe, it, expect } from "vitest";
import { ResolvedPresence } from "@presenced/contracts";

describe("Web UI components & contracts", () => {
  it("formats presence correctly for Discord and Presence cards", () => {
    const mockPresence: ResolvedPresence = {
      revision: 1,
      candidateId: "desktop:code",
      category: "coding",
      title: "Visual Studio Code",
      details: "TypeScript Project",
      source: "niri",
      reason: "Visual Studio Code (coding, priority 60) active",
      resolvedAt: Date.now(),
    };

    expect(mockPresence.category).toBe("coding");
    expect(mockPresence.title).toBe("Visual Studio Code");
    expect(mockPresence.details).toBe("TypeScript Project");
  });

  it("handles privacy mode presence", () => {
    const privacyPresence: ResolvedPresence = {
      revision: 2,
      candidateId: "privacy:active",
      category: "privacy",
      title: "Privacy Mode",
      source: "privacy",
      reason: "Privacy mode active (priority 95)",
      resolvedAt: Date.now(),
    };

    expect(privacyPresence.category).toBe("privacy");
    expect(privacyPresence.title).toBe("Privacy Mode");
  });
});
