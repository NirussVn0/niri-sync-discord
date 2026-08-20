import { LyricLine } from "@presenced/contracts";

const TIMESTAMP_TAG_REGEX = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\]/g;
const METADATA_TAG_REGEX = /^\[[a-zA-Z]+:[^\]]*\]$/;

/**
 * Parses raw LRC string into a sorted array of LyricLine objects.
 */
export function parseLrc(rawLrc: string): LyricLine[] {
  if (!rawLrc || typeof rawLrc !== "string") {
    return [];
  }

  const lines = rawLrc.split(/\r?\n/);
  const result: LyricLine[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || METADATA_TAG_REGEX.test(trimmed)) {
      continue;
    }

    // Match all timestamp tags in the line
    const timestamps: number[] = [];
    let match: RegExpExecArray | null;
    TIMESTAMP_TAG_REGEX.lastIndex = 0;

    while ((match = TIMESTAMP_TAG_REGEX.exec(trimmed)) !== null) {
      const minutes = parseInt(match[1] ?? "0", 10);
      const seconds = parseInt(match[2] ?? "0", 10);
      const fractionStr = match[3] ?? "0";
      // If 2 digits -> hundredths (x10 ms), if 3 digits -> ms
      const fractionMs =
        fractionStr.length === 2
          ? parseInt(fractionStr, 10) * 10
          : parseInt(fractionStr.padEnd(3, "0").slice(0, 3), 10);

      const atMs = minutes * 60 * 1000 + seconds * 1000 + fractionMs;
      timestamps.push(atMs);
    }

    if (timestamps.length === 0) {
      continue;
    }

    // Strip timestamp tags to get the lyric text
    const text = trimmed.replace(TIMESTAMP_TAG_REGEX, "").trim();

    for (const atMs of timestamps) {
      result.push({ atMs, text });
    }
  }

  // Sort chronologically by timestamp
  return result.sort((a, b) => a.atMs - b.atMs);
}

/**
 * Resolves the currently active lyric line index via O(log n) binary search.
 */
export function getActiveLyricLine(
  lines: LyricLine[],
  positionMs: number
): { index: number; line: LyricLine } | null {
  if (!lines || lines.length === 0) {
    return null;
  }

  // If position is before the first lyric line
  if (positionMs < (lines[0]?.atMs ?? 0)) {
    return null;
  }

  let low = 0;
  let high = lines.length - 1;
  let candidateIndex = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const line = lines[mid];
    if (!line) break;

    if (line.atMs <= positionMs) {
      candidateIndex = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const activeLine = lines[candidateIndex];
  if (!activeLine) return null;

  return { index: candidateIndex, line: activeLine };
}
