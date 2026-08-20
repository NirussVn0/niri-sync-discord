import { z } from "zod";

export const LyricLineSchema = z.object({
  atMs: z.number(),
  text: z.string(),
});
export type LyricLine = z.infer<typeof LyricLineSchema>;

export const LyricsPayloadSchema = z.object({
  trackKey: z.string(),
  provider: z.string(),
  synced: z.boolean(),
  instrumental: z.boolean(),
  lines: z.array(LyricLineSchema),
  plainLyrics: z.string().optional(),
  matchConfidence: z.number().min(0).max(1),
  fetchedAt: z.number(),
});
export type LyricsPayload = z.infer<typeof LyricsPayloadSchema>;
