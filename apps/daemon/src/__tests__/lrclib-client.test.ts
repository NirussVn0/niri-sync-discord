import { describe, it, expect } from "vitest";
import { LrclibClient } from "../lyrics/lrclib-client.js";

describe("LrclibClient", () => {
  it("fetches synced lyrics and caches the result", async () => {
    let callCount = 0;
    const mockFetch = async () => {
      callCount++;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          trackName: "Starboy",
          artistName: "The Weeknd",
          duration: 230,
          instrumental: false,
          syncedLyrics: "[00:10.00]I'm trying to put you in the worst mood\n[00:20.00]P1 cleaner than your church shoes",
        }),
      } as unknown as Response;
    };

    const client = new LrclibClient();
    const query = {
      title: "Starboy",
      artist: "The Weeknd",
      durationMs: 230000,
    };

    const lyrics1 = await client.getLyrics(query, mockFetch);
    expect(lyrics1).not.toBeNull();
    expect(lyrics1?.synced).toBe(true);
    expect(lyrics1?.lines.length).toBe(2);
    expect(callCount).toBe(1);

    // Second call should hit in-memory cache
    const lyrics2 = await client.getLyrics(query, mockFetch);
    expect(lyrics2).toEqual(lyrics1);
    expect(callCount).toBe(1); // no extra fetch call
  });

  it("handles 404 response without crashing and caches negative result", async () => {
    let callCount = 0;
    const mockFetch = async () => {
      callCount++;
      return {
        ok: false,
        status: 404,
      } as unknown as Response;
    };

    const client = new LrclibClient();
    const query = {
      title: "Nonexistent Song",
      artist: "Unknown",
    };

    const res1 = await client.getLyrics(query, mockFetch);
    expect(res1).toBeNull();
    expect(callCount).toBe(1);

    const res2 = await client.getLyrics(query, mockFetch);
    expect(res2).toBeNull();
    expect(callCount).toBe(1);
  });
});
