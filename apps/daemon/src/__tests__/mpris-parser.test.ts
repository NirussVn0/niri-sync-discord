import { describe, it, expect } from "vitest";
import { MprisParser } from "../sources/mpris/mpris-parser.js";

describe("MprisParser", () => {
  const parser = new MprisParser();

  it("parses tab-delimited metadata from Spotify", () => {
    const rawLine = "spotify\tPlaying\tStarboy\tThe Weeknd\tStarboy\thttps://i.scdn.co/image/ab67616d0000b273\t230000000\t45000000";
    const fact = parser.parseLine(rawLine, 1000, 500);

    expect(fact).not.toBeNull();
    expect(fact?.player).toBe("spotify");
    expect(fact?.playback).toBe("playing");
    expect(fact?.title).toBe("Starboy");
    expect(fact?.artist).toBe("The Weeknd");
    expect(fact?.album).toBe("Starboy");
    expect(fact?.artUrl).toBe("https://i.scdn.co/image/ab67616d0000b273");
    expect(fact?.durationMs).toBe(230000); // 230000000 us -> 230000 ms
    expect(fact?.positionAnchorMs).toBe(45000); // 45000000 us -> 45000 ms
    expect(fact?.anchorMonotonicMs).toBe(500);
  });

  it("handles paused state and empty optional fields", () => {
    const rawLine = "brave\tPaused\tYouTube Music\t\t\t\t\t";
    const fact = parser.parseLine(rawLine, 1000, 500);

    expect(fact).not.toBeNull();
    expect(fact?.player).toBe("brave");
    expect(fact?.playback).toBe("paused");
    expect(fact?.title).toBe("YouTube Music");
    expect(fact?.artist).toBeUndefined();
    expect(fact?.album).toBeUndefined();
    expect(fact?.durationMs).toBeUndefined();
    expect(fact?.positionAnchorMs).toBeUndefined();
  });

  it("returns null for empty or invalid lines", () => {
    expect(parser.parseLine("")).toBeNull();
    expect(parser.parseLine("   \t   ")).toBeNull();
  });
});
