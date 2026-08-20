import { describe, it, expect } from "vitest";
import { PlaybackClock } from "../sources/mpris/mpris-clock.js";
import { MediaFact } from "@presenced/contracts";

describe("PlaybackClock", () => {
  it("calculates monotonic elapsed position while playing", () => {
    const fact: MediaFact = {
      kind: "media",
      player: "spotify",
      playback: "playing",
      title: "Song",
      durationMs: 180000,
      positionAnchorMs: 10000,
      anchorMonotonicMs: 1000,
      observedAt: 1000,
    };

    // 5 seconds later
    const estimated = PlaybackClock.getEstimatedPositionMs(fact, 6000);
    expect(estimated).toBe(15000); // 10000 + (6000 - 1000)
  });

  it("clamps position to durationMs", () => {
    const fact: MediaFact = {
      kind: "media",
      player: "spotify",
      playback: "playing",
      title: "Song",
      durationMs: 30000,
      positionAnchorMs: 25000,
      anchorMonotonicMs: 1000,
      observedAt: 1000,
    };

    // 10 seconds later (past duration 30000)
    const estimated = PlaybackClock.getEstimatedPositionMs(fact, 11000);
    expect(estimated).toBe(30000);
  });

  it("returns static anchor position when paused", () => {
    const fact: MediaFact = {
      kind: "media",
      player: "spotify",
      playback: "paused",
      title: "Song",
      durationMs: 180000,
      positionAnchorMs: 42000,
      anchorMonotonicMs: 1000,
      observedAt: 1000,
    };

    // 10 seconds later
    const estimated = PlaybackClock.getEstimatedPositionMs(fact, 11000);
    expect(estimated).toBe(42000);
  });

  it("detects seek forward and backward discontinuities", () => {
    const prevFact: MediaFact = {
      kind: "media",
      player: "spotify",
      playback: "playing",
      title: "Song",
      durationMs: 180000,
      positionAnchorMs: 10000,
      anchorMonotonicMs: 1000,
      observedAt: 1000,
    };

    // Expected position at monotonic 2000 would be 11000
    // If incoming position is 50000 (seeked forward)
    const seekForwardFact: MediaFact = {
      ...prevFact,
      positionAnchorMs: 50000,
      anchorMonotonicMs: 2000,
    };
    expect(PlaybackClock.isSeek(prevFact, seekForwardFact, 2000)).toBe(true);

    // Normal progression (11000) is not a seek
    const normalFact: MediaFact = {
      ...prevFact,
      positionAnchorMs: 11100,
      anchorMonotonicMs: 2000,
    };
    expect(PlaybackClock.isSeek(prevFact, normalFact, 2000)).toBe(false);
  });
});
