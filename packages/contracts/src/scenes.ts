import { z } from "zod";

export const SceneTypeSchema = z.enum([
  "auto",
  "music",
  "focus",
  "pomodoro",
  "countdown",
  "system",
  "privacy",
  "custom",
]);
export type SceneType = z.infer<typeof SceneTypeSchema>;

export const SceneDefinitionSchema = z.object({
  id: z.string(),
  type: SceneTypeSchema,
  name: z.string(),
  templateId: z.string(),
  customDetails: z.string().optional(),
  customState: z.string().optional(),
  targetCountdownId: z.string().optional(),
  priorityOverride: z.number().optional(),
});
export type SceneDefinition = z.infer<typeof SceneDefinitionSchema>;

export const SceneStateSchema = z.object({
  activeSceneId: z.string(),
  activeSceneType: SceneTypeSchema,
  isAuto: z.boolean(),
  scenes: z.array(SceneDefinitionSchema),
  updatedAt: z.number(),
});
export type SceneState = z.infer<typeof SceneStateSchema>;
