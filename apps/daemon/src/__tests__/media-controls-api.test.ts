import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WebSocket } from "ws";
import { PresenceStore } from "../state/presence-store.js";
import { ApiServer } from "../api/server.js";
import { PomodoroEngine } from "../sources/pomodoro/pomodoro-engine.js";
import { CountdownEngine } from "../sources/countdown/countdown-engine.js";
import { MprisSource } from "../sources/mpris/mpris-source.js";
import { DaemonEvent } from "@presenced/contracts";
import { DatabaseManager } from "../state/database.js";

describe("Media Controls, Scenes, Pomodoro & Countdowns API", () => {
  let store: PresenceStore;
  let server: ApiServer;
  let pomodoroEngine: PomodoroEngine;
  let countdownEngine: CountdownEngine;
  let mprisMock: MprisSource;
  let db: DatabaseManager;

  beforeEach(async () => {
    db = new DatabaseManager({ dbPath: ":memory:" });
    store = new PresenceStore({ focusDebounceMs: 0 });
    pomodoroEngine = new PomodoroEngine();
    pomodoroEngine.on("fact", (fact) => store.setPomodoro(fact));
    countdownEngine = new CountdownEngine(db);
    countdownEngine.on("fact", (fact) => store.setCountdown(fact));

    mprisMock = {
      playPause: vi.fn(),
      next: vi.fn(),
      previous: vi.fn(),
    } as unknown as MprisSource;

    server = new ApiServer({
      port: 0,
      host: "127.0.0.1",
      store,
      pomodoroEngine,
      countdownEngine,
      mprisSource: mprisMock,
    });

    await server.start();
  });

  afterEach(async () => {
    await server.stop();
    pomodoroEngine.destroy();
    countdownEngine.destroy();
    store.stop();
    db.close();
  });

  it("dispatches MPRIS playback controls", async () => {
    const app = server.getApp();

    const playPauseRes = await app.request("/api/media/play-pause", { method: "POST" });
    expect(playPauseRes.status).toBe(200);
    expect(mprisMock.playPause).toHaveBeenCalledOnce();

    const nextRes = await app.request("/api/media/next", { method: "POST" });
    expect(nextRes.status).toBe(200);
    expect(mprisMock.next).toHaveBeenCalledOnce();

    const prevRes = await app.request("/api/media/previous", { method: "POST" });
    expect(prevRes.status).toBe(200);
    expect(mprisMock.previous).toHaveBeenCalledOnce();
  });

  it("handles scene switching and broadcasts state snapshot over WebSocket", async () => {
    const app = server.getApp();
    const activePort = server.getPort();
    const ws = new WebSocket(`ws://127.0.0.1:${activePort}/api/events`);
    const receivedEvents: DaemonEvent[] = [];

    ws.on("message", (data) => {
      receivedEvents.push(JSON.parse(data.toString()));
    });

    await new Promise<void>((resolve, reject) => {
      ws.on("open", () => resolve());
      ws.on("error", (err) => reject(err));
    });

    // Switch scene to pomodoro
    const sceneRes = await app.request("/api/scene", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sceneType: "pomodoro" }),
    });

    expect(sceneRes.status).toBe(200);
    const sceneJson = await sceneRes.json();
    expect(sceneJson.scene?.activeSceneType).toBe("pomodoro");

    // Wait for websocket broadcast
    await new Promise((resolve) => setTimeout(resolve, 80));

    const snapshotEvents = receivedEvents.filter((e) => e.type === "state.snapshot");
    expect(snapshotEvents.length).toBeGreaterThanOrEqual(1);
    const lastSnapshot = snapshotEvents[snapshotEvents.length - 1];
    expect(lastSnapshot?.payload.scene?.activeSceneType).toBe("pomodoro");

    ws.close();
  });

  it("handles Pomodoro lifecycle endpoints", async () => {
    const app = server.getApp();

    // Start Pomodoro
    const startRes = await app.request("/api/pomodoro/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskName: "Write Unit Tests", durationMinutes: 30 }),
    });
    expect(startRes.status).toBe(200);
    const startJson = await startRes.json();
    expect(startJson.pomodoro?.status).toBe("running");
    expect(startJson.pomodoro?.currentTask).toBe("Write Unit Tests");

    // Pause Pomodoro
    const pauseRes = await app.request("/api/pomodoro/pause", { method: "POST" });
    expect(pauseRes.status).toBe(200);
    const pauseJson = await pauseRes.json();
    expect(pauseJson.pomodoro?.status).toBe("paused");

    // Resume Pomodoro
    const resumeRes = await app.request("/api/pomodoro/resume", { method: "POST" });
    expect(resumeRes.status).toBe(200);
    const resumeJson = await resumeRes.json();
    expect(resumeJson.pomodoro?.status).toBe("running");

    // Skip to next session
    const skipRes = await app.request("/api/pomodoro/skip", { method: "POST" });
    expect(skipRes.status).toBe(200);
    const skipJson = await skipRes.json();
    expect(skipJson.pomodoro?.mode).toBe("short_break");

    // Stop Pomodoro
    const stopRes = await app.request("/api/pomodoro/stop", { method: "POST" });
    expect(stopRes.status).toBe(200);
    const stopJson = await stopRes.json();
    expect(stopJson.pomodoro?.status).toBe("idle");
  });

  it("handles Countdown CRUD and toggle endpoints", async () => {
    const app = server.getApp();

    // Add milestone countdown
    const addRes = await app.request("/api/countdowns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Product Launch",
        targetDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        category: "project",
        showOnDiscord: true,
      }),
    });

    expect(addRes.status).toBe(200);
    const addJson = await addRes.json();
    const itemId = addJson.item.id;
    expect(itemId).toBeDefined();
    expect(addJson.snapshot.countdown?.activeCountdown?.title).toBe("Product Launch");

    // Toggle countdown
    const toggleRes = await app.request(`/api/countdowns/${itemId}/toggle`, { method: "POST" });
    expect(toggleRes.status).toBe(200);

    // Delete countdown
    const deleteRes = await app.request(`/api/countdowns/${itemId}`, { method: "DELETE" });
    expect(deleteRes.status).toBe(200);
  });
});
