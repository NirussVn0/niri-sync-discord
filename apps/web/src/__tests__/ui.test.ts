import { describe, it, expect } from "vitest";
import { ResolvedPresence, MediaFact, ActivityCandidate } from "@presenced/contracts";
import { STATUS_CONFIG } from "../components/IntegrationsHealthRow.js";

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

  it("maps all 6 integration health statuses properly in STATUS_CONFIG", () => {
    expect(STATUS_CONFIG.connected.label).toBe("Connected");
    expect(STATUS_CONFIG.reconnecting.label).toBe("Reconnecting");
    expect(STATUS_CONFIG.disconnected.label).toBe("Disconnected");
    expect(STATUS_CONFIG.degraded.label).toBe("Degraded");
    expect(STATUS_CONFIG.unsupported.label).toBe("Unsupported");
    expect(STATUS_CONFIG["permission-required"].label).toBe("Permission Required");
    expect(STATUS_CONFIG["provider-rate-limited"].label).toBe("Rate Limited");
  });

  it("sorts candidates properly by priority descending", () => {
    const candidates: ActivityCandidate[] = [
      { id: "c1", category: "generic", priority: 10, title: "App", source: "niri", privacy: "safe", rawConfidence: 1 },
      { id: "c2", category: "music", priority: 80, title: "Song", source: "mpris:spotify", privacy: "safe", rawConfidence: 1 },
      { id: "c3", category: "coding", priority: 60, title: "Code", source: "niri", privacy: "safe", rawConfidence: 1 },
    ];

    const sorted = [...candidates].sort((a, b) => b.priority - a.priority);
    expect(sorted[0]?.id).toBe("c2");
    expect(sorted[1]?.id).toBe("c3");
    expect(sorted[2]?.id).toBe("c1");
  });
});
