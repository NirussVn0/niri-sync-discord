import { z } from "zod";

export const SourceHealthSchema = z.enum([
  "connected",
  "reconnecting",
  "disconnected",
  "degraded",
  "unsupported",
]);
export type SourceHealth = z.infer<typeof SourceHealthSchema>;

export const IntegrationHealthSchema = z.object({
  source: z.string(),
  status: SourceHealthSchema,
  lastEventAt: z.number().optional(),
  details: z.string().optional(),
  error: z.string().optional(),
});
export type IntegrationHealth = z.infer<typeof IntegrationHealthSchema>;
