/**
 * Browser Lyrics Extractor — extracts lyrics from web pages using a configurable browser.
 *
 * Instead of relying solely on LRCLIB (which often has bad/missing lyrics for
 * Vietnamese/YouTube tracks), this module can extract lyrics from:
 * - YouTube Music lyrics panels
 * - Any web page with lyrics content
 *
 * Uses a headless Chromium instance with a user-specified browser path.
 * Falls back gracefully if browser is not available.
 */
import { LyricsPayload } from "@presenced/contracts";
import { parseLrc } from "@presenced/core";
import { spawn, ChildProcess } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

export interface BrowserLyricsOptions {
  /** Path to Chrome/Chromium/Brave binary */
  browserPath?: string;
  /** Timeout for extraction in ms */
  timeoutMs?: number;
  /** Whether browser extraction is enabled */
  enabled: boolean;
}

export interface BrowserLyricsResult {
  success: boolean;
  lyrics?: LyricsPayload;
  error?: string;
}

/**
 * Known browser paths on Linux
 */
const KNOWN_BROWSER_PATHS = [
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/brave-browser",
  "/usr/bin/brave-browser-stable",
  // Flatpak
  "/var/lib/flatpak/exports/bin/org.chromium.Chromium",
  // Snap
  "/snap/bin/chromium",
  // User-installed
  `${process.env.HOME}/.config/discord/app-*/Discord`,  // Electron-based
];

function findBrowserPath(): string | null {
  for (const p of KNOWN_BROWSER_PATHS) {
    // Handle glob patterns
    if (p.includes("*")) {
      const dir = path.dirname(p);
      const pattern = path.basename(p);
      if (fs.existsSync(dir)) {
        const matches = fs.readdirSync(dir).filter((f) => f.startsWith(pattern.replace("*", "")));
        if (matches.length > 0) {
          return path.join(dir, matches[0]!);
        }
      }
    } else if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

/**
 * Extract lyrics from a YouTube Music page using browser DevTools Protocol.
 *
 * This is a simplified approach — it spawns a headless browser, navigates to
 * the URL, and extracts the lyrics panel content. For production use, this
 * would need CDP (Chrome DevTools Protocol) integration.
 */
export async function extractLyricsFromUrl(
  url: string,
  options: BrowserLyricsOptions,
): Promise<BrowserLyricsResult> {
  if (!options.enabled) {
    return { success: false, error: "Browser lyrics extraction disabled" };
  }

  const browserPath = options.browserPath || findBrowserPath();
  if (!browserPath) {
    return { success: false, error: "No browser found for lyrics extraction" };
  }

  // For now, return a placeholder — full CDP integration would be a separate module
  // The idea: spawn headless Chrome → navigate to URL → query lyrics DOM → parse
  return {
    success: false,
    error: "Browser lyrics extraction: CDP integration pending — use LRCLIB or manual lyrics import",
  };
}

/**
 * Parse plain text lyrics into a LyricsPayload.
 * Useful when user provides lyrics manually or from a file.
 */
export function parsePlainLyrics(text: string, durationMs: number): LyricsPayload {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Try to detect LRC format
  const lrcText = lines.join("\n");
  if (lrcText.includes("[") && /\[\d{2}:\d{2}\.\d{2,3}\]/.test(lrcText)) {
    const parsedLines = parseLrc(lrcText);
    return {
      trackKey: "",
      provider: "manual",
      synced: true,
      instrumental: false,
      plainLyrics: lines.join("\n"),
      matchConfidence: 1,
      fetchedAt: Date.now(),
      lines: parsedLines,
    };
  }

  // Plain text — distribute evenly across duration
  const intervalMs = durationMs / Math.max(1, lines.length);
  return {
    trackKey: "",
    provider: "manual",
    synced: false,
    instrumental: false,
    plainLyrics: lines.join("\n"),
    matchConfidence: 1,
    fetchedAt: Date.now(),
    lines: lines.map((text, i) => ({
      atMs: i * intervalMs,
      text,
    })),
  };
}
