import { z } from "zod";
import { ActivityCategorySchema, ManualOverrideSchema } from "./rules.js";
import { DesktopFactSchema, MediaFactSchema } from "./facts.js";
import { IntegrationHealthSchema } from "./health.js";
import { LyricsPayloadSchema } from "./lyrics.js";
import { PomodoroFactSchema } from "./pomodoro.js";
import { CountdownFactSchema } from "./countdowns.js";
import { SystemFactSchema } from "./system.js";
import { SceneStateSchema } from "./scenes.js";

export const PresencePrivacySchema = z.enum(["safe", "sanitized", "private"]);
export type PresencePrivacy = z.infer<typeof PresencePrivacySchema>;

export const ActivityAssetsSchema = z.object({
  largeImage: z.string().optional(),
  largeText: z.string().optional(),
  smallImage: z.string().optional(),
  smallText: z.string().optional(),
});
export type ActivityAssets = z.infer<typeof ActivityAssetsSchema>;

export const ActivityTimestampsSchema = z.object({
  start: z.number().optional(),
  end: z.number().optional(),
});
export type ActivityTimestamps = z.infer<typeof ActivityTimestampsSchema>;

function numberOrZero() {
  return z.number().default(0);
}

export const ActivityCandidateSchema = z.object({
  id: z.string(),
  category: ActivityCategorySchema,
  priority: numberOrZero(),
  title: z.string(),
  details: z.string().optional(),
  state: z.string().optional(),
  timestamps: ActivityTimestampsSchema.optional(),
  assets: ActivityAssetsSchema.optional(),
  source: z.string(),
  privacy: PresencePrivacySchema,
  rawConfidence: z.number().min(0).max(1).default(1),
});
export type ActivityCandidate = z.infer<typeof ActivityCandidateSchema>;

export const ResolvedPresenceSchema = z.object({
  revision: z.number(),
  candidateId: z.string(),
  category: ActivityCategorySchema,
  title: z.string(),
  details: z.string().optional(),
  state: z.string().optional(),
  timestamps: ActivityTimestampsSchema.optional(),
  assets: ActivityAssetsSchema.optional(),
  source: z.string(),
  reason: z.string(),
  resolvedAt: z.number(),
});
export type ResolvedPresence = z.infer<typeof ResolvedPresenceSchema>;

export const PresenceSnapshotSchema = z.object({
  presence: ResolvedPresenceSchema.nullable(),
  candidates: z.array(ActivityCandidateSchema),
  desktop: DesktopFactSchema.nullable(),
  media: MediaFactSchema.nullable(),
  lyrics: LyricsPayloadSchema.nullable().optional(),
  pomodoro: PomodoroFactSchema.nullable().optional(),
  countdown: CountdownFactSchema.nullable().optional(),
  system: SystemFactSchema.nullable().optional(),
  scene: SceneStateSchema.nullable().optional(),
  health: z.record(z.string(), IntegrationHealthSchema),
  privacyMode: z.boolean(),
  override: ManualOverrideSchema.nullable(),
  updatedAt: z.number(),
});
export type PresenceSnapshot = z.infer<typeof PresenceSnapshotSchema>;
