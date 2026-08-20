import { z } from "zod";

export const SystemMetricsSchema = z.object({
  cpuPercent: z.number().min(0).max(100),
  ramUsedBytes: z.number(),
  ramTotalBytes: z.number(),
  ramPercent: z.number().min(0).max(100),
  batteryPercent: z.number().min(0).max(100).optional(),
  batteryState: z.enum(["charging", "discharging", "full", "unknown"]).optional(),
  cpuTempCelsius: z.number().optional(),
  uptimeSeconds: z.number(),
  hostname: z.string().optional(),
});
export type SystemMetrics = z.infer<typeof SystemMetricsSchema>;

export const SystemFactSchema = z.object({
  kind: z.literal("system"),
  metrics: SystemMetricsSchema,
  observedAt: z.number(),
});
export type SystemFact = z.infer<typeof SystemFactSchema>;
