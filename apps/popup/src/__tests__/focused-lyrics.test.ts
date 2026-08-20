import { describe, it, expect } from "vitest";
import { getActiveLyricLine } from "@presenced/core";
import { LyricsPayload } from "@presenced/contracts";

describe("FocusedLyricsView & 3-Line Slicing", () => {
  const mockLyrics: LyricsPayload = {
    trackKey: "spotify:test",
    provider: "lrclib",
    synced: true,
    instrumental: false,
    lines: [
      { atMs: 0, text: "Line 1 — Intro" },
      { atMs: 5000, text: "Line 2 — Verse 1" },
      { atMs: 12000, text: "Line 3 — Chorus" },
      { atMs: 20000, text: "Line 4 — Outro" },
    ],
    matchConfidence: 1,
    fetchedAt: Date.now(),
  };

  it("finds active, previous and next lyric lines accurately", () => {
    // At 6000ms, active is index 1 ("Line 2 — Verse 1")
    const result = getActiveLyricLine(mockLyrics.lines, 6000);
    expect(result).not.toBeNull();
    expect(result?.index).toBe(1);

    const index = result?.index ?? 0;
    const active = mockLyrics.lines[index];
    const prev = mockLyrics.lines[index - 1];
    const next = mockLyrics.lines[index + 1];

    expect(active?.text).toBe("Line 2 — Verse 1");
    expect(prev?.text).toBe("Line 1 — Intro");
    expect(next?.text).toBe("Line 3 — Chorus");
  });

  it("handles boundary lines gracefully", () => {
    // At start (1000ms), active is index 0 (no prev)
    const firstResult = getActiveLyricLine(mockLyrics.lines, 1000);
    expect(firstResult).not.toBeNull();
    expect(firstResult?.index).toBe(0);

    const firstIndex = firstResult?.index ?? -1;
    const prev = firstIndex > 0 ? mockLyrics.lines[firstIndex - 1] : null;
    expect(prev).toBeNull();

    // At end (25000ms), active is index 3 (no next)
    const lastResult = getActiveLyricLine(mockLyrics.lines, 25000);
    expect(lastResult).not.toBeNull();
    expect(lastResult?.index).toBe(3);

    const lastIndex = lastResult?.index ?? -1;
    const next =
      lastIndex >= 0 && lastIndex < mockLyrics.lines.length - 1
        ? mockLyrics.lines[lastIndex + 1]
        : null;
    expect(next).toBeNull();
  });
});
