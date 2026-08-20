import { describe, it, expect } from "vitest";
import { PresenceSnapshot, PresenceSnapshotSchema } from "@presenced/contracts";

describe("usePresenceCompanion & Popup Contracts", () => {
  it("validates PresenceSnapshot with null and active presence", () => {
    const emptySnapshot: PresenceSnapshot = {
      presence: null,
      candidates: [],
      desktop: null,
      media: null,
      lyrics: null,
      health: {},
      privacyMode: false,
      override: null,
      updatedAt: Date.now(),
    };

    const parsed = PresenceSnapshotSchema.parse(emptySnapshot);
    expect(parsed.presence).toBeNull();
    expect(parsed.privacyMode).toBe(false);
  });

  it("validates PresenceSnapshot with extended V2 fields", () => {
    const v2Snapshot: PresenceSnapshot = {
      presence: {
        revision: 1,
        candidateId: "mpris:spotify",
        category: "music",
        title: "Chuyện Đôi Ta",
        details: "Da LAB",
        source: "mpris",
        reason: "Spotify playing",
        resolvedAt: Date.now(),
      },
      candidates: [],
      desktop: null,
      media: {
        kind: "media",
        player: "spotify",
        playback: "playing",
        title: "Chuyện Đôi Ta",
        artist: "Da LAB",
        durationMs: 210000,
        positionAnchorMs: 35000,
        observedAt: Date.now(),
      },
      lyrics: {
        trackKey: "spotify:Chuyện Đôi Ta",
        provider: "lrclib",
        synced: true,
        instrumental: false,
        lines: [
          { atMs: 0, text: "Intro" },
          { atMs: 10000, text: "Mình đã từng nghĩ sẽ bên nhau" },
        ],
        plainLyrics: "Intro\nMình đã từng nghĩ sẽ bên nhau",
        matchConfidence: 1,
        fetchedAt: Date.now(),
      },
      pomodoro: {
        kind: "pomodoro",
        status: "running",
        mode: "focus",
        remainingSeconds: 1200,
        totalDurationSeconds: 1500,
        currentSession: 1,
        totalSessions: 4,
        observedAt: Date.now(),
      },
      countdown: {
        kind: "countdown",
        activeCountdown: {
          id: "cd-1",
          title: "THPTQG 2027",
          targetDate: "2027-06-25T07:30:00Z",
          category: "exam",
          enabled: true,
          showOnDiscord: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        daysRemaining: 309,
        hoursRemaining: 14,
        totalFormatted: "309d 14h",
        observedAt: Date.now(),
      },
      health: {},
      privacyMode: false,
      override: null,
      updatedAt: Date.now(),
    };

    const parsed = PresenceSnapshotSchema.parse(v2Snapshot);
    expect(parsed.pomodoro?.mode).toBe("focus");
    expect(parsed.countdown?.daysRemaining).toBe(309);
    expect(parsed.media?.title).toBe("Chuyện Đôi Ta");
  });
});
