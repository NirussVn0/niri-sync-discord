import { z } from "zod";

export const DesktopFactSchema = z.object({
  kind: z.literal("desktop"),
  appId: z.string(),
  workspaceId: z.number().optional(),
  windowId: z.number().optional(),
  rawTitle: z.string().optional(), // Sensitive: never published directly to Discord without rule
  observedAt: z.number(),
});
export type DesktopFact = z.infer<typeof DesktopFactSchema>;

export const PlaybackStatusSchema = z.enum(["playing", "paused", "stopped"]);
export type PlaybackStatus = z.infer<typeof PlaybackStatusSchema>;

export const MediaFactSchema = z.object({
  kind: z.literal("media"),
  player: z.string(),
  playback: PlaybackStatusSchema,
  title: z.string().optional(),
  artist: z.string().optional(),
  album: z.string().optional(),
  artUrl: z.string().optional(),
  durationMs: z.number().optional(),
  positionAnchorMs: z.number().optional(),
  anchorMonotonicMs: z.number().optional(),
  observedAt: z.number(),
});
export type MediaFact = z.infer<typeof MediaFactSchema>;
