import { describe, it, expect } from "vitest";
import {
  SceneDefinitionSchema,
  SceneStateSchema,
  RpcTemplateSchema,
  TemplateVariablesSchema,
  PomodoroFactSchema,
  CountdownItemSchema,
  CountdownFactSchema,
  SystemMetricsSchema,
  SystemFactSchema,
} from "../index.js";

describe("Contracts V2 - Scenes, Templates, Pomodoro, Countdowns, System", () => {
  it("validates SceneDefinition and SceneState schemas", () => {
    const scene = SceneDefinitionSchema.parse({
      id: "scene-music",
      type: "music",
      name: "Music & Lyrics",
      templateId: "tpl-music",
      priorityOverride: 90,
    });
    expect(scene.type).toBe("music");

    const state = SceneStateSchema.parse({
      activeSceneId: "scene-music",
      activeSceneType: "music",
      isAuto: false,
      scenes: [scene],
      updatedAt: Date.now(),
    });
    expect(state.activeSceneType).toBe("music");
  });

  it("validates RpcTemplate and TemplateVariables schemas", () => {
    const tpl = RpcTemplateSchema.parse({
      id: "tpl-default",
      name: "Default Template",
      detailsTemplate: "{track} — {artist}",
      stateTemplate: "{lyric}",
      isBuiltin: true,
    });
    expect(tpl.detailsTemplate).toBe("{track} — {artist}");

    const vars = TemplateVariablesSchema.parse({
      track: "Blinding Lights",
      artist: "The Weeknd",
      pomodoro: {
        task: "Deep Work",
        remaining: "24:10",
        session: "1/4",
      },
      countdown: {
        name: "THPTQG 2027",
        days: "309",
      },
      system: {
        cpu: "12%",
        ram: "45%",
      },
    });
    expect(vars.track).toBe("Blinding Lights");
    expect(vars.pomodoro?.remaining).toBe("24:10");
  });

  it("validates PomodoroFact schema", () => {
    const fact = PomodoroFactSchema.parse({
      kind: "pomodoro",
      status: "running",
      mode: "focus",
      currentTask: "Physics Homework",
      remainingSeconds: 1420,
      totalDurationSeconds: 1500,
      currentSession: 2,
      totalSessions: 4,
      observedAt: Date.now(),
    });
    expect(fact.status).toBe("running");
    expect(fact.mode).toBe("focus");
  });

  it("validates CountdownItem and CountdownFact schemas", () => {
    const item = CountdownItemSchema.parse({
      id: "cd-1",
      title: "THPTQG 2027",
      targetDate: "2027-06-25T07:30:00Z",
      category: "exam",
      enabled: true,
      showOnDiscord: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    expect(item.category).toBe("exam");

    const fact = CountdownFactSchema.parse({
      kind: "countdown",
      activeCountdown: item,
      daysRemaining: 309,
      hoursRemaining: 14,
      totalFormatted: "309d 14h",
      observedAt: Date.now(),
    });
    expect(fact.daysRemaining).toBe(309);
  });

  it("validates SystemMetrics and SystemFact schemas", () => {
    const fact = SystemFactSchema.parse({
      kind: "system",
      metrics: {
        cpuPercent: 18.5,
        ramUsedBytes: 8589934592,
        ramTotalBytes: 17179869184,
        ramPercent: 50.0,
        batteryPercent: 88,
        batteryState: "charging",
        cpuTempCelsius: 52,
        uptimeSeconds: 84200,
      },
      observedAt: Date.now(),
    });
    expect(fact.metrics.cpuPercent).toBe(18.5);
    expect(fact.metrics.batteryState).toBe("charging");
  });
});
