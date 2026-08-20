import { z } from "zod";

export const ActivityCategorySchema = z.enum([
  "manual",
  "privacy",
  "gaming",
  "music",
  "recording",
  "coding",
  "focus",
  "pomodoro",
  "countdown",
  "system",
  "video",
  "browser",
  "terminal",
  "custom",
  "generic",
  "idle",
]);
export type ActivityCategory = z.infer<typeof ActivityCategorySchema>;

export const ManualOverrideSchema = z.object({
  id: z.string(),
  category: ActivityCategorySchema,
  title: z.string(),
  details: z.string().optional(),
  state: z.string().optional(),
  expiresAt: z.number().optional(),
  createdAt: z.number(),
});
export type ManualOverride = z.infer<typeof ManualOverrideSchema>;

export const AppRuleSchema = z.object({
  appId: z.string(),
  category: ActivityCategorySchema.optional(),
  customTitle: z.string().optional(),
  hide: z.boolean().optional(),
  allowSanitizedTitle: z.boolean().optional(),
  priorityBoost: z.number().optional(),
});
export type AppRule = z.infer<typeof AppRuleSchema>;

export const PriorityTableSchema = z.record(ActivityCategorySchema, z.number());
export type PriorityTable = z.infer<typeof PriorityTableSchema>;

export const DEFAULT_PRIORITIES: PriorityTable = {
  manual: 100,
  privacy: 95,
  gaming: 90,
  pomodoro: 85,
  music: 80,
  recording: 75,
  focus: 70,
  countdown: 65,
  coding: 60,
  video: 50,
  system: 40,
  custom: 35,
  browser: 30,
  terminal: 25,
  generic: 10,
  idle: 0,
};

export const PresenceRulesSchema = z.object({
  priorities: PriorityTableSchema.default(DEFAULT_PRIORITIES),
  appRules: z.record(z.string(), AppRuleSchema).default({}),
  privacyMode: z.boolean().default(false),
});
export type PresenceRules = z.infer<typeof PresenceRulesSchema>;
