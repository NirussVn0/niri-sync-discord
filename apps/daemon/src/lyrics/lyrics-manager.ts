import { EventEmitter } from "node:events";
import { MediaFact, IntegrationHealth } from "@presenced/contracts";
import { LrclibClient } from "./lrclib-client.js";
import { PresenceStore } from "../state/presence-store.js";

export class LyricsManager extends EventEmitter {
  private readonly client: LrclibClient;
  private readonly store: PresenceStore;
  private currentTrackKey: string | null = null;
  private currentHealth: IntegrationHealth = {
    source: "lyrics",
    status: "disconnected",
  };

  constructor(store: PresenceStore, client: LrclibClient = new LrclibClient()) {
    super();
    this.store = store;
    this.client = client;
  }

  public getHealth(): IntegrationHealth {
    return this.currentHealth;
  }

  private setHealth(status: IntegrationHealth["status"], details?: string): void {
    this.currentHealth = {
      source: "lyrics",
      status,
      lastEventAt: status === "connected" ? Date.now() : this.currentHealth.lastEventAt,
      ...(details ? { details } : {}),
    };
    this.store.setHealth(this.currentHealth);
    this.emit("health", this.currentHealth);
  }

  public start(): void {
    this.setHealth("connected", "Lyrics provider ready (LRCLIB)");

    this.store.on("event", (event) => {
      if (event.type === "media.changed") {
        this.handleMediaChanged(event.payload);
      }
    });
  }

  private async handleMediaChanged(media: MediaFact | null): Promise<void> {
    if (!media || !media.title) {
      if (this.currentTrackKey !== null) {
        this.currentTrackKey = null;
        this.store.setLyrics(null);
      }
      return;
    }

    const query = {
      title: media.title,
      ...(media.artist ? { artist: media.artist } : {}),
      ...(media.album ? { album: media.album } : {}),
      ...(media.durationMs ? { durationMs: media.durationMs } : {}),
    };
    const trackKey = this.client.getTrackKey(query);

    if (trackKey === this.currentTrackKey) {
      return; // already have lyrics for this track
    }

    this.currentTrackKey = trackKey;
    const lyrics = await this.client.getLyrics(query);

    // Ensure we didn't switch tracks while fetch was in flight
    if (this.currentTrackKey === trackKey) {
      this.store.setLyrics(lyrics);
      if (lyrics) {
        this.setHealth("connected", `Loaded lyrics for "${media.title}" (${lyrics.synced ? "Synced" : "Plain"})`);
      } else {
        this.setHealth("connected", `No lyrics found for "${media.title}"`);
      }
    }
  }
}
