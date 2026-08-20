import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PresenceStore } from "../state/presence-store.js";
import { DesktopFact, IntegrationHealth } from "@presenced/contracts";

describe("PresenceStore", () => {
  let store: PresenceStore;

  beforeEach(() => {
    vi.useFakeTimers();
    store = new PresenceStore({ focusDebounceMs: 100 });
  });

  afterEach(() => {
    store.stop();
    vi.useRealTimers();
  });

  it("applies desktop focus immediately if configured with 0ms debounce", () => {
    const directStore = new PresenceStore({ focusDebounceMs: 0 });
    const fact: DesktopFact = {
      kind: "desktop",
      appId: "kitty",
      observedAt: Date.now(),
    };

    directStore.setDesktop(fact);
    const snapshot = directStore.getSnapshot();
    expect(snapshot.desktop?.appId).toBe("kitty");
    expect(snapshot.presence?.category).toBe("terminal");
    directStore.stop();
  });

  it("debounces rapid desktop focus changes", () => {
    const fact1: DesktopFact = {
      kind: "desktop",
      appId: "kitty",
      observedAt: 1000,
    };
    const fact2: DesktopFact = {
      kind: "desktop",
      appId: "code",
      observedAt: 1050,
    };

    store.setDesktop(fact1);
    expect(store.getSnapshot().desktop).toBeNull(); // not yet applied

    // Advance 50ms (before 100ms timer)
    vi.advanceTimersByTime(50);
    store.setDesktop(fact2);

    // Advance another 50ms (first timer would have fired, but got reset)
    vi.advanceTimersByTime(50);
    expect(store.getSnapshot().desktop).toBeNull();

    // Advance past remaining 50ms
    vi.advanceTimersByTime(60);
    expect(store.getSnapshot().desktop?.appId).toBe("code");
    expect(store.getSnapshot().presence?.category).toBe("coding");
  });

  it("records integration health and emits events", () => {
    const healthEvents: IntegrationHealth[] = [];
    store.on("event", (e) => {
      if (e.type === "source.health.changed") {
        healthEvents.push(e.payload);
      }
    });

    const health: IntegrationHealth = {
      source: "niri",
      status: "connected",
      details: "Streaming events",
    };

    store.setHealth(health);
    expect(store.getHealth()["niri"]?.status).toBe("connected");
    expect(healthEvents.length).toBe(1);
    expect(healthEvents[0]?.status).toBe("connected");
  });

  it("toggles privacy mode and resolves privacy presence", () => {
    const fact: DesktopFact = {
      kind: "desktop",
      appId: "code",
      observedAt: 1000,
    };
    store.setDesktop(fact, true); // immediate

    expect(store.getSnapshot().presence?.category).toBe("coding");

    store.setPrivacyMode(true);
    expect(store.getSnapshot().privacyMode).toBe(true);
    expect(store.getSnapshot().presence?.category).toBe("privacy");

    store.setPrivacyMode(false);
    expect(store.getSnapshot().privacyMode).toBe(false);
    expect(store.getSnapshot().presence?.category).toBe("coding");
  });
});
