import { describe, it, expect } from "vitest";
import { SceneResolver } from "../scene-resolver.js";

describe("SceneResolver & Deterministic Priority", () => {
  const resolver = new SceneResolver();

  it("resolves privacy scene when privacyMode is active", () => {
    const scene = resolver.resolve({
      privacyMode: true,
      media: {
        kind: "media",
        player: "spotify",
        playback: "playing",
        title: "Song",
        observedAt: Date.now(),
      },
    });

    expect(scene.type).toBe("privacy");
    expect(scene.isAuto).toBe(false);
  });

  it("resolves manual override scene when explicitly selected", () => {
    const scene = resolver.resolve({
      manualSceneType: "pomodoro",
      media: {
        kind: "media",
        player: "spotify",
        playback: "playing",
        title: "Song",
        observedAt: Date.now(),
      },
    });

    expect(scene.type).toBe("pomodoro");
    expect(scene.isAuto).toBe(false);
  });

  it("auto resolves music scene when media is playing", () => {
    const scene = resolver.resolve({
      media: {
        kind: "media",
        player: "spotify",
        playback: "playing",
        title: "Chuyện Đôi Ta",
        observedAt: Date.now(),
      },
      desktop: {
        kind: "desktop",
        appId: "code",
        windowId: 1,
        observedAt: Date.now(),
      },
    });

    expect(scene.type).toBe("music");
    expect(scene.isAuto).toBe(true);
  });

  it("auto resolves pomodoro scene when pomodoro is actively running", () => {
    const scene = resolver.resolve({
      pomodoro: {
        kind: "pomodoro",
        status: "running",
        mode: "focus",
        remainingSeconds: 1400,
        totalDurationSeconds: 1500,
        currentSession: 1,
        totalSessions: 4,
        observedAt: Date.now(),
      },
      desktop: {
        kind: "desktop",
        appId: "code",
        windowId: 1,
        observedAt: Date.now(),
      },
    });

    expect(scene.type).toBe("pomodoro");
    expect(scene.isAuto).toBe(true);
  });
});
