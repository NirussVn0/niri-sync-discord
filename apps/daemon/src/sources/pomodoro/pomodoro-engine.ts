import { EventEmitter } from "node:events";
import { PomodoroFact, PomodoroMode, PomodoroStatus } from "@presenced/contracts";

export interface PomodoroEngineOptions {
  focusDurationSec?: number;
  shortBreakDurationSec?: number;
  longBreakDurationSec?: number;
  totalSessions?: number;
}

export class PomodoroEngine extends EventEmitter {
  private status: PomodoroStatus = "idle";
  private mode: PomodoroMode = "focus";
  private currentTask: string | undefined = undefined;
  private remainingSeconds: number;
  private totalDurationSeconds: number;
  private currentSession = 1;
  private totalSessions: number;

  private readonly focusDurationSec: number;
  private readonly shortBreakDurationSec: number;
  private readonly longBreakDurationSec: number;
  private ticker: NodeJS.Timeout | null = null;

  constructor(options: PomodoroEngineOptions = {}) {
    super();
    this.focusDurationSec = options.focusDurationSec ?? 25 * 60;
    this.shortBreakDurationSec = options.shortBreakDurationSec ?? 5 * 60;
    this.longBreakDurationSec = options.longBreakDurationSec ?? 15 * 60;
    this.totalSessions = options.totalSessions ?? 4;

    this.remainingSeconds = this.focusDurationSec;
    this.totalDurationSeconds = this.focusDurationSec;
  }

  public getFact(): PomodoroFact {
    return {
      kind: "pomodoro",
      status: this.status,
      mode: this.mode,
      ...(this.currentTask ? { currentTask: this.currentTask } : {}),
      remainingSeconds: this.remainingSeconds,
      totalDurationSeconds: this.totalDurationSeconds,
      currentSession: this.currentSession,
      totalSessions: this.totalSessions,
      observedAt: Date.now(),
    };
  }

  public start(currentTask?: string, focusMinutes?: number): void {
    if (focusMinutes) {
      this.totalDurationSeconds = focusMinutes * 60;
      this.remainingSeconds = this.totalDurationSeconds;
    } else {
      this.totalDurationSeconds = this.focusDurationSec;
      this.remainingSeconds = this.focusDurationSec;
    }

    this.status = "running";
    this.mode = "focus";
    this.currentTask = currentTask || "Focus Session";

    this.startTicker();
    this.emitFact();
  }

  public pause(): void {
    if (this.status !== "running") return;
    this.status = "paused";
    this.stopTicker();
    this.emitFact();
  }

  public resume(): void {
    if (this.status !== "paused") return;
    this.status = "running";
    this.startTicker();
    this.emitFact();
  }

  public stop(): void {
    this.status = "idle";
    this.mode = "focus";
    this.remainingSeconds = this.focusDurationSec;
    this.totalDurationSeconds = this.focusDurationSec;
    this.currentSession = 1;
    this.currentTask = undefined;

    this.stopTicker();
    this.emitFact();
  }

  public skip(): void {
    this.advanceMode();
  }

  public tick(): void {
    if (this.status !== "running") return;

    if (this.remainingSeconds > 0) {
      this.remainingSeconds -= 1;
      this.emitFact();
    } else {
      this.advanceMode();
    }
  }

  private advanceMode(): void {
    if (this.mode === "focus") {
      // Completed focus session
      if (this.currentSession >= this.totalSessions) {
        this.mode = "long_break";
        this.totalDurationSeconds = this.longBreakDurationSec;
        this.remainingSeconds = this.longBreakDurationSec;
      } else {
        this.mode = "short_break";
        this.totalDurationSeconds = this.shortBreakDurationSec;
        this.remainingSeconds = this.shortBreakDurationSec;
      }
    } else {
      // Completed break -> advance to next focus session
      if (this.mode === "long_break") {
        this.currentSession = 1;
      } else {
        this.currentSession += 1;
      }
      this.mode = "focus";
      this.totalDurationSeconds = this.focusDurationSec;
      this.remainingSeconds = this.focusDurationSec;
    }

    this.emitFact();
  }

  private startTicker(): void {
    this.stopTicker();
    this.ticker = setInterval(() => this.tick(), 1000);
  }

  private stopTicker(): void {
    if (this.ticker) {
      clearInterval(this.ticker);
      this.ticker = null;
    }
  }

  private emitFact(): void {
    this.emit("fact", this.getFact());
  }

  public destroy(): void {
    this.stopTicker();
  }
}
