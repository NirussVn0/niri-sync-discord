/**
 * RVC Rotation — cycles multiple Discord Rich Presence statuses on a timer.
 *
 * Each entry defines:
 * - A scene (custom, music, quote, pomodoro, etc.)
 * - Duration in seconds before switching
 * - Optional quote source file for random quotes
 *
 * The scheduler picks the next entry and publishes it to Discord.
 */
import { ResolvedPresence, ActivityCategory } from "@presenced/contracts";
import { DiscordRpcClient } from "./discord-client.js";
import { DiscordActivity, DEFAULT_DISCORD_CLIENT_ID } from "./discord-types.js";
import { mapPresenceToDiscordActivity } from "./payload-mapper.js";

export interface RvcEntry {
  /** Unique ID for this rotation entry */
  id: string;
  /** Scene type: "custom", "music", "quote", "pomodoro", "countdown", "system", "auto" */
  scene: string;
  /** Duration in seconds before switching to next entry */
  durationSec: number;
  /** For "quote" scene: path to a text file with one quote per line */
  quoteFile?: string;
  /** For "custom" scene: static Discord activity fields */
  customActivity?: Partial<DiscordActivity>;
  /** Enable/disable this entry */
  enabled: boolean;
}

export interface RvcRotationConfig {
  /** Whether rotation is enabled */
  enabled: boolean;
  /** Time between rotation ticks in seconds (min interval) */
  tickIntervalSec: number;
  /** The rotation entries */
  entries: RvcEntry[];
}

export interface RvcSchedulerOptions {
  minIntervalMs?: number;
}

/**
 * Loads a quotes file and returns random lines.
 */
export async function loadQuotes(filePath: string): Promise<string[]> {
  const fs = await import("node:fs/promises");
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return content
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("#"));
  } catch {
    return [];
  }
}

/**
 * Picks a random item from an array.
 */
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

/**
 * RvcScheduler — manages rotation of multiple Discord RPC statuses.
 */
export class RvcScheduler {
  private readonly client: DiscordRpcClient;
  private readonly minIntervalMs: number;
  private config: RvcRotationConfig;
  private currentIndex = 0;
  private timer: NodeJS.Timeout | null = null;
  private lastPublishedAt = 0;
  private quoteCache = new Map<string, string[]>();
  private lastQuotePerFile = new Map<string, string>();

  /** The "real" presence from the daemon (music, desktop, etc.) — used in "auto" scene */
  private realPresence: ResolvedPresence | null = null;

  constructor(client: DiscordRpcClient, config: RvcRotationConfig, options: RvcSchedulerOptions = {}) {
    this.client = client;
    this.config = config;
    this.minIntervalMs = options.minIntervalMs ?? 3000;
  }

  public updateConfig(config: RvcRotationConfig): void {
    this.config = config;
    if (!config.enabled) {
      this.stop();
    } else {
      this.start();
    }
  }

  public updateRealPresence(presence: ResolvedPresence | null): void {
    this.realPresence = presence;
  }

  public start(): void {
    if (this.timer) return;
    if (!this.config.enabled || this.config.entries.length === 0) return;
    this.tick();
  }

  public stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private async tick(): Promise<void> {
    const enabledEntries = this.config.entries.filter((e) => e.enabled);
    if (enabledEntries.length === 0) {
      this.stop();
      return;
    }

    const entry = enabledEntries[this.currentIndex % enabledEntries.length]!;
    const activity = await this.buildActivity(entry);

    if (activity) {
      this.client.setActivity(activity).catch(() => {});
    }

    // Schedule next tick
    const nextIndex = (this.currentIndex + 1) % enabledEntries.length;
    this.currentIndex = nextIndex;

    const nextEntry = enabledEntries[nextIndex]!;
    const waitMs = (entry.durationSec || 30) * 1000;

    this.timer = setTimeout(() => this.tick(), waitMs);
  }

  private async buildActivity(entry: RvcEntry): Promise<DiscordActivity | null> {
    switch (entry.scene) {
      case "custom":
        return entry.customActivity as DiscordActivity ?? null;

      case "music": {
        if (!this.realPresence) return null;
        return mapPresenceToDiscordActivity(this.realPresence);
      }

      case "quote": {
        if (!entry.quoteFile) return null;
        let quotes = this.quoteCache.get(entry.quoteFile);
        if (!quotes || quotes.length === 0) {
          quotes = await loadQuotes(entry.quoteFile);
          this.quoteCache.set(entry.quoteFile, quotes);
        }
        if (quotes.length === 0) return null;

        // Pick a different quote than last time
        let quote = randomPick(quotes);
        let attempts = 0;
        while (quote === this.lastQuotePerFile.get(entry.quoteFile) && attempts < 5) {
          quote = randomPick(quotes);
          attempts++;
        }
        this.lastQuotePerFile.set(entry.quoteFile, quote);

        return {
          details: quote,
          state: "💭 Wisdom of the moment",
          instance: true,
        };
      }

      case "pomodoro": {
        if (!this.realPresence) return null;
        return mapPresenceToDiscordActivity(this.realPresence);
      }

      case "countdown": {
        if (!this.realPresence) return null;
        return mapPresenceToDiscordActivity(this.realPresence);
      }

      case "auto":
      default: {
        if (!this.realPresence) return null;
        return mapPresenceToDiscordActivity(this.realPresence);
      }
    }
  }

  public async clear(): Promise<void> {
    this.stop();
    await this.client.setActivity(null);
  }
}
