import { z } from "zod";

export const TemplateVariablesSchema = z.object({
  app: z.string().optional(),
  activity: z.string().optional(),
  project: z.string().optional(),
  track: z.string().optional(),
  artist: z.string().optional(),
  album: z.string().optional(),
  lyric: z.string().optional(),
  player: z.string().optional(),
  pomodoro: z
    .object({
      task: z.string().optional(),
      remaining: z.string().optional(),
      session: z.string().optional(),
      state: z.string().optional(),
    })
    .optional(),
  countdown: z
    .object({
      name: z.string().optional(),
      days: z.string().optional(),
      hours: z.string().optional(),
      totalFormatted: z.string().optional(),
    })
    .optional(),
  system: z
    .object({
      cpu: z.string().optional(),
      ram: z.string().optional(),
      battery: z.string().optional(),
      temp: z.string().optional(),
    })
    .optional(),
  time: z.string().optional(),
  date: z.string().optional(),
});
export type TemplateVariables = z.infer<typeof TemplateVariablesSchema>;

export const RpcTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  detailsTemplate: z.string(),
  stateTemplate: z.string().optional(),
  largeTextTemplate: z.string().optional(),
  smallTextTemplate: z.string().optional(),
  largeImageKey: z.string().optional(),
  smallImageKey: z.string().optional(),
  isBuiltin: z.boolean().default(false),
});
export type RpcTemplate = z.infer<typeof RpcTemplateSchema>;
