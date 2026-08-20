import { z } from "zod";

export const PomodoroModeSchema = z.enum(["focus", "short_break", "long_break"]);
export type PomodoroMode = z.infer<typeof PomodoroModeSchema>;

export const PomodoroStatusSchema = z.enum(["idle", "running", "paused", "completed"]);
export type PomodoroStatus = z.infer<typeof PomodoroStatusSchema>;

export const PomodoroConfigSchema = z.object({
  focusDurationSeconds: z.number().default(1500), // 25 min
  shortBreakDurationSeconds: z.number().default(300), // 5 min
  longBreakDurationSeconds: z.number().default(900), // 15 min
  sessionsBeforeLongBreak: z.number().default(4),
  autoStartBreaks: z.boolean().default(false),
  autoStartFocus: z.boolean().default(false),
});
export type PomodoroConfig = z.infer<typeof PomodoroConfigSchema>;

export const PomodoroFactSchema = z.object({
  kind: z.literal("pomodoro"),
  status: PomodoroStatusSchema,
  mode: PomodoroModeSchema,
  currentTask: z.string().optional(),
  remainingSeconds: z.number(),
  totalDurationSeconds: z.number(),
  currentSession: z.number(),
  totalSessions: z.number(),
  anchorMonotonicMs: z.number().optional(),
  observedAt: z.number(),
});
export type PomodoroFact = z.infer<typeof PomodoroFactSchema>;
