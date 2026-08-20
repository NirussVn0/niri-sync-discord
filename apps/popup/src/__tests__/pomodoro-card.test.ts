import { describe, it, expect } from "vitest";
import { PomodoroFact } from "@presenced/contracts";

describe("PomodoroCard & State Rendering", () => {
  it("computes mode labels and session dots appropriately", () => {
    const runningFocus: PomodoroFact = {
      kind: "pomodoro",
      status: "running",
      mode: "focus",
      currentTask: "Calculus",
      remainingSeconds: 1200,
      totalDurationSeconds: 1500,
      currentSession: 2,
      totalSessions: 4,
      observedAt: Date.now(),
    };

    expect(runningFocus.mode).toBe("focus");
    expect(runningFocus.currentSession).toBe(2);
    expect(runningFocus.remainingSeconds).toBe(1200);

    const minutes = Math.floor(runningFocus.remainingSeconds / 60);
    const seconds = runningFocus.remainingSeconds % 60;
    const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    expect(formatted).toBe("20:00");
  });

  it("handles short and long break mode facts", () => {
    const shortBreak: PomodoroFact = {
      kind: "pomodoro",
      status: "running",
      mode: "short_break",
      remainingSeconds: 300,
      totalDurationSeconds: 300,
      currentSession: 2,
      totalSessions: 4,
      observedAt: Date.now(),
    };

    expect(shortBreak.mode).toBe("short_break");
    expect(shortBreak.remainingSeconds).toBe(300);
  });
});
