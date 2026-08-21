import { z } from "zod";

export const DiscordOpcode = {
  HANDSHAKE: 0,
  FRAME: 1,
  CLOSE: 2,
  PING: 3,
  PONG: 4,
} as const;
export type DiscordOpcode = (typeof DiscordOpcode)[keyof typeof DiscordOpcode];

export const DiscordTimestampsSchema = z.object({
  start: z.number().optional(),
  end: z.number().optional(),
});
export type DiscordTimestamps = z.infer<typeof DiscordTimestampsSchema>;

export const DiscordAssetsSchema = z.object({
  large_image: z.string().optional(),
  large_text: z.string().optional(),
  small_image: z.string().optional(),
  small_text: z.string().optional(),
});
export type DiscordAssets = z.infer<typeof DiscordAssetsSchema>;

export const DiscordActivitySchema = z.object({
  details: z.string().optional(),
  state: z.string().optional(),
  timestamps: DiscordTimestampsSchema.optional(),
  assets: DiscordAssetsSchema.optional(),
  instance: z.boolean().optional(),
});
export type DiscordActivity = z.infer<typeof DiscordActivitySchema>;

export const DEFAULT_DISCORD_CLIENT_ID = "1540340652670324867";
