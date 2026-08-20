import { MediaFact } from "@presenced/contracts";

export class PlaybackClock {
  /**
   * Calculates estimated playback position in milliseconds.
   */
  public static getEstimatedPositionMs(
    fact: MediaFact,
    monotonicNow: number = performance.now()
  ): number {
    const anchorPosition = fact.positionAnchorMs ?? 0;

    if (fact.playback !== "playing") {
      return anchorPosition;
    }

    const anchorMonotonic = fact.anchorMonotonicMs ?? monotonicNow;
    const elapsed = Math.max(0, monotonicNow - anchorMonotonic);
    const estimated = anchorPosition + elapsed;

    if (fact.durationMs && fact.durationMs > 0) {
      return Math.min(estimated, fact.durationMs);
    }

    return estimated;
  }

  /**
   * Detects whether a position jump represents an intentional seek rather than normal progression.
   */
  public static isSeek(
    prevFact: MediaFact | null,
    nextFact: MediaFact,
    monotonicNow: number = performance.now(),
    toleranceMs = 2500
  ): boolean {
    if (!prevFact || prevFact.player !== nextFact.player || prevFact.title !== nextFact.title) {
      return false;
    }

    if (prevFact.positionAnchorMs === undefined || nextFact.positionAnchorMs === undefined) {
      return false;
    }

    const expectedPosition = PlaybackClock.getEstimatedPositionMs(prevFact, monotonicNow);
    const diff = Math.abs(expectedPosition - nextFact.positionAnchorMs);

    return diff > toleranceMs;
  }
}
