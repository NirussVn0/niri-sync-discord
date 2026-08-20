import { ResolvedPresence } from "@presenced/contracts";
import { DiscordRpcClient } from "./discord-client.js";
import { DiscordActivity } from "./discord-types.js";
import { mapPresenceToDiscordActivity } from "./payload-mapper.js";

export interface DiscordSchedulerOptions {
  minIntervalMs?: number;
}

export class DiscordScheduler {
  private readonly client: DiscordRpcClient;
  private readonly minIntervalMs: number;
  private lastPublishedPayloadStr: string | null = null;
  private lastPublishedAt = 0;
  private pendingPresence: ResolvedPresence | null = null;
  private throttleTimer: NodeJS.Timeout | null = null;

  constructor(client: DiscordRpcClient, options: DiscordSchedulerOptions = {}) {
    this.client = client;
    this.minIntervalMs = options.minIntervalMs ?? 3000;

    // Resend activity when Discord RPC reconnects / emits ready
    this.client.on("ready", () => {
      this.lastPublishedPayloadStr = null; // force publish
      if (this.pendingPresence) {
        this.publishNow(this.pendingPresence);
      }
    });
  }

  public updatePresence(presence: ResolvedPresence | null): void {
    this.pendingPresence = presence;
    const now = Date.now();
    const elapsed = now - this.lastPublishedAt;

    // High signal events (Privacy mode, track change, manual override) can publish immediately if enough time has passed
    const isHighSignal =
      presence?.category === "music" ||
      presence?.category === "manual" ||
      presence?.category === "privacy";

    if (elapsed >= this.minIntervalMs || (isHighSignal && elapsed >= 1000)) {
      if (this.throttleTimer) {
        clearTimeout(this.throttleTimer);
        this.throttleTimer = null;
      }
      this.publishNow(presence);
      return;
    }

    // Otherwise coalesce and schedule for next allowed interval
    if (!this.throttleTimer) {
      const requiredInterval = isHighSignal ? 1000 : this.minIntervalMs;
      const waitTime = Math.max(50, requiredInterval - elapsed);
      this.throttleTimer = setTimeout(() => {
        this.throttleTimer = null;
        this.publishNow(this.pendingPresence);
      }, waitTime);
    }
  }

  private publishNow(presence: ResolvedPresence | null): void {
    this.lastPublishedAt = Date.now();
    const activity = mapPresenceToDiscordActivity(presence);
    const payloadStr = JSON.stringify(activity);

    // Duplicate suppression
    if (payloadStr === this.lastPublishedPayloadStr) {
      return;
    }

    this.lastPublishedPayloadStr = payloadStr;
    this.client.setActivity(activity).catch(() => {
      // Ignore async socket write errors
    });
  }

  public async clear(): Promise<void> {
    if (this.throttleTimer) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = null;
    }
    this.pendingPresence = null;
    this.lastPublishedPayloadStr = null;
    await this.client.setActivity(null);
  }
}
