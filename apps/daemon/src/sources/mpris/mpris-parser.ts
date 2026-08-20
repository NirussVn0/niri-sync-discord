import { MediaFact, PlaybackStatus } from "@presenced/contracts";

export class MprisParser {
  /**
   * Parse a tab-separated line from playerctl metadata command.
   */
  public parseLine(
    line: string,
    observedAt: number = Date.now(),
    monotonicNow: number = performance.now()
  ): MediaFact | null {
    const trimmed = line.trim();
    if (!trimmed) {
      return null;
    }

    const parts = line.split("\t");
    if (parts.length < 2) {
      return null;
    }

    const player = (parts[0] ?? "").trim();
    const rawStatus = (parts[1] ?? "").trim().toLowerCase();

    if (!player) {
      return null;
    }

    let playback: PlaybackStatus = "stopped";
    if (rawStatus === "playing") {
      playback = "playing";
    } else if (rawStatus === "paused") {
      playback = "paused";
    }

    const title = parts[2]?.trim() || undefined;
    const artist = parts[3]?.trim() || undefined;
    const album = parts[4]?.trim() || undefined;
    const artUrl = parts[5]?.trim() || undefined;

    // Length and position from playerctl are in microseconds
    let durationMs: number | undefined;
    const lengthUs = parts[6] ? Number(parts[6].trim()) : NaN;
    if (!Number.isNaN(lengthUs) && lengthUs > 0) {
      durationMs = Math.floor(lengthUs / 1000);
    }

    let positionAnchorMs: number | undefined;
    const positionUs = parts[7] ? Number(parts[7].trim()) : NaN;
    if (!Number.isNaN(positionUs) && positionUs >= 0) {
      positionAnchorMs = Math.floor(positionUs / 1000);
    }

    const fact: MediaFact = {
      kind: "media",
      player,
      playback,
      title,
      artist,
      album,
      artUrl,
      durationMs,
      positionAnchorMs,
      anchorMonotonicMs: monotonicNow,
      observedAt,
    };

    return fact;
  }
}
