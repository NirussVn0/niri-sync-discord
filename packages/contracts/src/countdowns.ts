import { z } from "zod";

export const CountdownCategorySchema = z.enum(["exam", "project", "holiday", "personal"]);
export type CountdownCategory = z.infer<typeof CountdownCategorySchema>;

export const CountdownItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  targetDate: z.string(), // ISO string e.g. 2027-06-25T07:30:00Z
  category: CountdownCategorySchema,
  icon: z.string().optional(),
  enabled: z.boolean().default(true),
  showOnDiscord: z.boolean().default(false),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type CountdownItem = z.infer<typeof CountdownItemSchema>;

export const CountdownFactSchema = z.object({
  kind: z.literal("countdown"),
  activeCountdown: CountdownItemSchema.nullable(),
  daysRemaining: z.number(),
  hoursRemaining: z.number(),
  totalFormatted: z.string(),
  observedAt: z.number(),
});
export type CountdownFact = z.infer<typeof CountdownFactSchema>;
