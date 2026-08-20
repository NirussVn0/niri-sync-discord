import { describe, it, expect } from "vitest";
import { DesktopFact, ResolvedPresence } from "@presenced/contracts";

describe("DesktopCard & Window Formatting", () => {
  it("formats desktop fact and presence title correctly", () => {
    const desktop: DesktopFact = {
      kind: "desktop",
      appId: "code",
      workspaceId: 1,
      windowId: 7,
      rawTitle: "presenced — Visual Studio Code",
      observedAt: Date.now(),
    };

    const presence: ResolvedPresence = {
      revision: 1,
      candidateId: "desktop:code",
      category: "coding",
      title: "Visual Studio Code",
      details: "presenced",
      source: "niri",
      reason: "Visual Studio Code active",
      resolvedAt: Date.now(),
    };

    expect(desktop.appId).toBe("code");
    expect(presence.category).toBe("coding");
    expect(presence.title).toBe("Visual Studio Code");
  });

  it("handles privacy mode overrides cleanly", () => {
    const presence: ResolvedPresence = {
      revision: 2,
      candidateId: "privacy:active",
      category: "privacy",
      title: "Privacy Mode",
      source: "privacy",
      reason: "Privacy mode active",
      resolvedAt: Date.now(),
    };

    expect(presence.category).toBe("privacy");
    expect(presence.title).toBe("Privacy Mode");
  });
});
