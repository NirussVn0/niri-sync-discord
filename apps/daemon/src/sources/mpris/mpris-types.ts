import { z } from "zod";

export const RawMprisMetadataSchema = z.object({
  player: z.string(),
  status: z.string(),
  title: z.string().optional(),
  artist: z.string().optional(),
  album: z.string().optional(),
  artUrl: z.string().optional(),
  lengthUs: z.number().optional(),
  positionUs: z.number().optional(),
});
export type RawMprisMetadata = z.infer<typeof RawMprisMetadataSchema>;
