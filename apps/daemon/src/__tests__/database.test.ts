import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DatabaseManager } from "../state/database.js";
import { PresenceRules, ManualOverride } from "@presenced/contracts";

describe("DatabaseManager", () => {
  let db: DatabaseManager;

  beforeEach(() => {
    // In-memory sqlite database for testing
    db = new DatabaseManager({ dbPath: ":memory:" });
  });

  afterEach(() => {
    db.close();
  });

  it("loads default rules when database is empty", () => {
    const rules = db.getRules();
    expect(rules).not.toBeNull();
    expect(rules.priorities.gaming).toBe(90);
    expect(rules.priorities.music).toBe(80);
    expect(rules.priorities.coding).toBe(60);
    expect(rules.appRules).toEqual({});
  });

  it("persists and retrieves custom priority rules and app rules", () => {
    const customRules: PresenceRules = {
      priorities: {
        gaming: 95,
        music: 85,
        recording: 75,
        coding: 65,
        video: 55,
        browser: 35,
        terminal: 25,
        generic: 15,
        idle: 0,
      },
      appRules: {
        obsidian: {
          appId: "obsidian",
          category: "coding",
          customTitle: "Obsidian Notes",
          hide: false,
        },
        secret_app: {
          appId: "secret_app",
          hide: true,
        },
      },
      privacyMode: false,
    };

    db.saveRules(customRules);
    const loaded = db.getRules();

    expect(loaded.priorities.gaming).toBe(95);
    expect(loaded.priorities.coding).toBe(65);
    expect(loaded.appRules.obsidian?.customTitle).toBe("Obsidian Notes");
    expect(loaded.appRules.secret_app?.hide).toBe(true);
  });

  it("persists and retrieves privacy mode state", () => {
    expect(db.getPrivacyMode()).toBe(false);

    db.savePrivacyMode(true);
    expect(db.getPrivacyMode()).toBe(true);

    db.savePrivacyMode(false);
    expect(db.getPrivacyMode()).toBe(false);
  });

  it("persists manual override and expires outdated overrides", () => {
    const activeOverride: ManualOverride = {
      id: "override-1",
      category: "gaming",
      title: "Custom Game",
      expiresAt: Date.now() + 60000, // in 1 minute
      createdAt: Date.now(),
    };

    db.saveManualOverride(activeOverride);
    expect(db.getManualOverride()?.title).toBe("Custom Game");

    const expiredOverride: ManualOverride = {
      id: "override-2",
      category: "music",
      title: "Old Override",
      expiresAt: Date.now() - 1000, // expired 1s ago
      createdAt: Date.now() - 2000,
    };

    db.saveManualOverride(expiredOverride);
    expect(db.getManualOverride()).toBeNull();
  });
});
