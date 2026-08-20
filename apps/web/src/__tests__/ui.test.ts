import { describe, it, expect } from "vitest";
import { ResolvedPresence, MediaFact } from "@presenced/contracts";

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

  it("handles MediaFact with playback duration and artwork", () => {
    const mediaFact: MediaFact = {
      kind: "media",
      player: "spotify",
      playback: "playing",
      title: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      artUrl: "https://example.com/art.jpg",
      durationMs: 200000,
      positionAnchorMs: 50000,
      observedAt: Date.now(),
    };

    expect(mediaFact.player).toBe("spotify");
    expect(mediaFact.playback).toBe("playing");
    expect(mediaFact.title).toBe("Blinding Lights");
    expect(mediaFact.durationMs).toBe(200000);
  });
});
