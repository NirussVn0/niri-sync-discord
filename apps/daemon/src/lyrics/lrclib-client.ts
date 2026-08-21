import { LyricsPayload } from "@presenced/contracts";
import { parseLrc } from "@presenced/core";
import { DatabaseManager } from "../state/database.js";

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
  private readonly database: DatabaseManager | null;
  private readonly cache = new Map<string, { payload: LyricsPayload | null; expiresAt: number }>();
  private readonly defaultTtlMs: number;

  constructor(options: {
    baseUrl?: string;
    userAgent?: string;
    defaultTtlMs?: number;
    database?: DatabaseManager;
  } = {}) {
    this.baseUrl = options.baseUrl ?? "https://lrclib.net/api";
    this.userAgent =
      options.userAgent ?? "presenced-popup-niri/0.6.0 (https://github.com/NirussVn0/presenced-popup-niri)";
    this.database = options.database ?? null;
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
    const now = Date.now();

    // 1. In-memory cache
    const memoryCached = this.cache.get(trackKey);
    if (memoryCached && memoryCached.expiresAt > now) {
      return memoryCached.payload;
    }

    // 2. Persistent SQLite cache
    if (this.database) {
      const dbCached = this.database.getLyrics(trackKey);
      if (dbCached) {
        this.cache.set(trackKey, { payload: dbCached, expiresAt: now + this.defaultTtlMs });
        return dbCached;
      }
    }

    try {
      // 3. Exact match via /get
      let data: LrclibApiResponse | null = null;
      const params = new URLSearchParams({
        track_name: query.title,
      });
      if (query.artist) params.set("artist_name", query.artist);
      if (query.album) params.set("album_name", query.album);
      if (query.durationMs && query.durationMs > 0) {
        params.set("duration", String(Math.round(query.durationMs / 1000)));
      }

      const getRes = await fetchFn(`${this.baseUrl}/get?${params.toString()}`, {
        headers: {
          "User-Agent": this.userAgent,
        },
      });

      if (getRes.ok) {
        data = await getRes.json();
      } else if (getRes.status === 404) {
        // 4. Fallback search via /search?q=...
        const searchQuery = query.artist ? `${query.artist} ${query.title}` : query.title;
        const searchRes = await fetchFn(
          `${this.baseUrl}/search?q=${encodeURIComponent(searchQuery)}`,
          {
            headers: {
              "User-Agent": this.userAgent,
            },
          }
        );

        if (searchRes.ok) {
          const results: LrclibApiResponse[] = await searchRes.json();
          if (Array.isArray(results) && results.length > 0) {
            // Find closest matching duration or first with synced lyrics
            const targetDurSec = query.durationMs ? Math.round(query.durationMs / 1000) : null;
            data =
              results.find(
                (r) =>
                  r.syncedLyrics &&
                  (!targetDurSec || !r.duration || Math.abs(r.duration - targetDurSec) <= 5)
              ) ??
              results.find((r) => r.syncedLyrics) ??
              results[0] ??
              null;
          }
        }
      }

      if (!data) {
        // Cache negative 404 response
        this.cache.set(trackKey, { payload: null, expiresAt: now + 3600 * 1000 });
        this.database?.saveLyrics(trackKey, null, now + 3600 * 1000);
        return null;
      }

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

      const expiresAt = now + this.defaultTtlMs;
      this.cache.set(trackKey, { payload, expiresAt });
      this.database?.saveLyrics(trackKey, payload, expiresAt);
      return payload;
    } catch {
      return null;
    }
  }

  public clearCache(): void {
    this.cache.clear();
  }
}
