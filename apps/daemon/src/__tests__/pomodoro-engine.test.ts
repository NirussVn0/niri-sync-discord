import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PomodoroEngine } from "../sources/pomodoro/pomodoro-engine.js";

describe("PomodoroEngine & State Transitions", () => {
  let engine: PomodoroEngine;

  beforeEach(() => {
    engine = new PomodoroEngine({
      focusDurationSec: 10,
      shortBreakDurationSec: 3,
      longBreakDurationSec: 5,
      totalSessions: 2,
    });
  });

  afterEach(() => {
    engine.destroy();
  });

  it("starts in idle status", () => {
    const fact = engine.getFact();
    expect(fact.status).toBe("idle");
    expect(fact.mode).toBe("focus");
    expect(fact.remainingSeconds).toBe(10);
  });

  it("starts and ticks down seconds accurately", () => {
    engine.start("Physics Homework");
    let fact = engine.getFact();
    expect(fact.status).toBe("running");
    expect(fact.currentTask).toBe("Physics Homework");
    expect(fact.remainingSeconds).toBe(10);

    engine.tick();
    fact = engine.getFact();
    expect(fact.remainingSeconds).toBe(9);
  });

  it("pauses and resumes without resetting timer", () => {
    engine.start("Coding");
    engine.tick();
    engine.tick();
    expect(engine.getFact().remainingSeconds).toBe(8);

    engine.pause();
    expect(engine.getFact().status).toBe("paused");

    engine.resume();
    expect(engine.getFact().status).toBe("running");
    expect(engine.getFact().remainingSeconds).toBe(8);
  });

  it("transitions focus -> short_break -> focus session 2 -> long_break", () => {
    engine.start("Sprint 1");
    // Advance 10 seconds of focus
    for (let i = 0; i < 11; i++) {
      engine.tick();
    }

    let fact = engine.getFact();
    expect(fact.mode).toBe("short_break");
    expect(fact.remainingSeconds).toBe(3);

    // Advance 3 seconds of short break
    for (let i = 0; i < 4; i++) {
      engine.tick();
    }

    fact = engine.getFact();
    expect(fact.mode).toBe("focus");
    expect(fact.currentSession).toBe(2);

    // Advance 10 seconds of focus session 2
    for (let i = 0; i < 11; i++) {
      engine.tick();
    }

    fact = engine.getFact();
    expect(fact.mode).toBe("long_break");
    expect(fact.remainingSeconds).toBe(5);
  });
});
