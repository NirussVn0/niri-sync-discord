import { describe, it, expect } from "vitest";
import { formatTimeMs } from "../utils/time-format.js";
import { MediaFact } from "@presenced/contracts";

describe("MusicCard & Time Formatting", () => {
  it("formats millisecond durations into mm:ss strings", () => {
    expect(formatTimeMs(0)).toBe("0:00");
    expect(formatTimeMs(5000)).toBe("0:05");
    expect(formatTimeMs(65000)).toBe("1:05");
    expect(formatTimeMs(222000)).toBe("3:42");
  });

  it("handles negative durations safely", () => {
    expect(formatTimeMs(-5000)).toBe("0:00");
  });

  it("validates MediaFact properties", () => {
    const media: MediaFact = {
      kind: "media",
      player: "spotify",
      playback: "playing",
      title: "Chuyện Đôi Ta",
      artist: "Da LAB",
      album: "After Hours",
      artUrl: "https://example.com/art.jpg",
      durationMs: 210000,
      positionAnchorMs: 35000,
      observedAt: Date.now(),
    };

    expect(media.player).toBe("spotify");
    expect(media.playback).toBe("playing");
    expect(media.durationMs).toBe(210000);
  });
});
