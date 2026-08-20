import { LyricsPayload } from "@presenced/contracts";
import { parseLrc } from "@presenced/core";

export interface LrclibTrackQuery {
  title: string;
  artist?: string;
  album?: string;
  durationMs?: number;
}

export interface LrclibApiResponse {
  id?: number;
  trackName?: string;
  artistName?: string;
  albumName?: string;
  duration?: number; // seconds
  instrumental?: boolean;
  plainLyrics?: string;
  syncedLyrics?: string;
}

export class LrclibClient {
  private readonly baseUrl: string;
  private readonly userAgent: string;
  private readonly cache = new Map<string, { payload: LyricsPayload | null; expiresAt: number }>();
  private readonly defaultTtlMs: number;

  constructor(options: { baseUrl?: string; userAgent?: string; defaultTtlMs?: number } = {}) {
    this.baseUrl = options.baseUrl ?? "https://lrclib.net/api";
    this.userAgent =
      options.userAgent ?? "presenced/0.1.0 (https://github.com/NirussVn0/niri-sync-discord)";
    this.defaultTtlMs = options.defaultTtlMs ?? 24 * 60 * 60 * 1000; // 24 hours
  }

  public getTrackKey(query: LrclibTrackQuery): string {
    return `${query.artist ?? "unknown"}:${query.title}`.toLowerCase().trim();
  }

  public async getLyrics(
    query: LrclibTrackQuery,
    fetchFn: typeof fetch = globalThis.fetch
  ): Promise<LyricsPayload | null> {
    const trackKey = this.getTrackKey(query);
    const cached = this.cache.get(trackKey);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      return cached.payload;
    }

    try {
      const params = new URLSearchParams({
        track_name: query.title,
      });
      if (query.artist) params.set("artist_name", query.artist);
      if (query.album) params.set("album_name", query.album);
      if (query.durationMs && query.durationMs > 0) {
        params.set("duration", String(Math.round(query.durationMs / 1000)));
      }

      const res = await fetchFn(`${this.baseUrl}/get?${params.toString()}`, {
        headers: {
          "User-Agent": this.userAgent,
        },
      });

      if (res.status === 404) {
        // Cache 404 negative response for 1 hour
        this.cache.set(trackKey, { payload: null, expiresAt: now + 3600 * 1000 });
        return null;
      }

      if (!res.ok) {
        return null;
      }

      const data: LrclibApiResponse = await res.json();
      const instrumental = Boolean(data.instrumental);
      const lines = data.syncedLyrics ? parseLrc(data.syncedLyrics) : [];
      const hasSynced = lines.length > 0;

      // Confidence score calculation
      let matchConfidence = 1.0;
      if (query.durationMs && data.duration) {
        const durDiffSec = Math.abs(query.durationMs / 1000 - data.duration);
        if (durDiffSec > 10) {
          matchConfidence = Math.max(0.5, 1 - durDiffSec / 100);
        }
      }

      const payload: LyricsPayload = {
        trackKey,
        provider: "lrclib",
        synced: hasSynced,
        instrumental,
        lines,
        ...(data.plainLyrics ? { plainLyrics: data.plainLyrics } : {}),
        matchConfidence,
        fetchedAt: now,
      };

      this.cache.set(trackKey, { payload, expiresAt: now + this.defaultTtlMs });
      return payload;
    } catch {
      return null;
    }
  }

  public clearCache(): void {
    this.cache.clear();
  }
}
