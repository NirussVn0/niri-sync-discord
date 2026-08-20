import { describe, it, expect } from "vitest";
import { resolvePresence } from "../resolver.js";
import {
  DesktopFact,
  MediaFact,
  ManualOverride,
  PresenceRules,
  DEFAULT_PRIORITIES,
} from "@presenced/contracts";

describe("presence resolver", () => {
  const defaultRules: PresenceRules = {
    priorities: { ...DEFAULT_PRIORITIES },
    appRules: {},
    privacyMode: false,
  };

  it("resolves desktop focus when no media is present", () => {
    const desktop: DesktopFact = {
      kind: "desktop",
      appId: "code",
      windowId: 1,
      rawTitle: "main.ts - presenced",
      observedAt: 1000,
    };

    const result = resolvePresence({
      desktop,
      media: null,
      manualOverride: null,
      privacyMode: false,
      rules: defaultRules,
      currentRevision: 0,
    });

    expect(result.presence).not.toBeNull();
    expect(result.presence?.category).toBe("coding");
    expect(result.presence?.title).toBe("Visual Studio Code");
    // Window title is private by default and not included
    expect(result.presence?.details).toBeUndefined();
    expect(result.presence?.source).toBe("niri");
  });

  it("prioritizes playing music over coding focus", () => {
    const desktop: DesktopFact = {
      kind: "desktop",
      appId: "code",
      observedAt: 1000,
    };
    const media: MediaFact = {
      kind: "media",
      player: "spotify",
      playback: "playing",
      title: "Bohemian Rhapsody",
      artist: "Queen",
      album: "A Night at the Opera",
      observedAt: 1000,
    };

    const result = resolvePresence({
      desktop,
      media,
      manualOverride: null,
      privacyMode: false,
      rules: defaultRules,
      currentRevision: 0,
    });

    expect(result.presence).not.toBeNull();
    expect(result.presence?.category).toBe("music");
    expect(result.presence?.title).toBe("Bohemian Rhapsody");
    expect(result.presence?.details).toBe("Queen");
    expect(result.presence?.state).toBe("A Night at the Opera");
    expect(result.presence?.reason).toContain("Bohemian Rhapsody (music, priority 80) won over Visual Studio Code (coding, priority 60)");
  });

  it("prioritizes coding focus when music is paused", () => {
    const desktop: DesktopFact = {
      kind: "desktop",
      appId: "code",
      observedAt: 1000,
    };
    const media: MediaFact = {
      kind: "media",
      player: "spotify",
      playback: "paused",
      title: "Bohemian Rhapsody",
      artist: "Queen",
      observedAt: 1000,
    };

    const result = resolvePresence({
      desktop,
      media,
      manualOverride: null,
      privacyMode: false,
      rules: defaultRules,
      currentRevision: 0,
    });

    expect(result.presence).not.toBeNull();
    expect(result.presence?.category).toBe("coding");
    expect(result.presence?.title).toBe("Visual Studio Code");
  });

  it("respects manual override with highest priority", () => {
    const desktop: DesktopFact = {
      kind: "desktop",
      appId: "code",
      observedAt: 1000,
    };
    const override: ManualOverride = {
      id: "override-1",
      category: "manual",
      title: "Studying for Exams",
      details: "Do not disturb",
      createdAt: 1000,
    };

    const result = resolvePresence({
      desktop,
      media: null,
      manualOverride: override,
      privacyMode: false,
      rules: defaultRules,
      currentRevision: 0,
      now: 2000,
    });

    expect(result.presence).not.toBeNull();
    expect(result.presence?.category).toBe("manual");
    expect(result.presence?.title).toBe("Studying for Exams");
    expect(result.presence?.details).toBe("Do not disturb");
  });

  it("ignores expired manual override", () => {
    const desktop: DesktopFact = {
      kind: "desktop",
      appId: "code",
      observedAt: 1000,
    };
    const override: ManualOverride = {
      id: "override-1",
      category: "manual",
      title: "Temporary Override",
      expiresAt: 1500,
      createdAt: 1000,
    };

    const result = resolvePresence({
      desktop,
      media: null,
      manualOverride: override,
      privacyMode: false,
      rules: defaultRules,
      currentRevision: 0,
      now: 2000, // now > expiresAt
    });

    expect(result.presence).not.toBeNull();
    expect(result.presence?.category).toBe("coding");
  });

  it("prioritizes privacy mode over desktop and media", () => {
    const desktop: DesktopFact = {
      kind: "desktop",
      appId: "code",
      observedAt: 1000,
    };
    const media: MediaFact = {
      kind: "media",
      player: "spotify",
      playback: "playing",
      title: "Bohemian Rhapsody",
      observedAt: 1000,
    };

    const result = resolvePresence({
      desktop,
      media,
      manualOverride: null,
      privacyMode: true,
      rules: defaultRules,
      currentRevision: 0,
    });

    expect(result.presence).not.toBeNull();
    expect(result.presence?.category).toBe("privacy");
    expect(result.presence?.title).toBe("Privacy Mode");
  });

  it("respects per-app custom title and allowSanitizedTitle rules", () => {
    const rules: PresenceRules = {
      priorities: { ...DEFAULT_PRIORITIES },
      appRules: {
        "org.wezfurlong.wezterm": {
          appId: "org.wezfurlong.wezterm",
          category: "terminal",
          customTitle: "Hacking in WezTerm",
          allowSanitizedTitle: true,
        },
      },
      privacyMode: false,
    };

    const desktop: DesktopFact = {
      kind: "desktop",
      appId: "org.wezfurlong.wezterm",
      rawTitle: "cargo build --release",
      observedAt: 1000,
    };

    const result = resolvePresence({
      desktop,
      media: null,
      manualOverride: null,
      privacyMode: false,
      rules,
      currentRevision: 0,
    });

    expect(result.presence).not.toBeNull();
    expect(result.presence?.title).toBe("Hacking in WezTerm");
    expect(result.presence?.details).toBe("cargo build --release");
  });

  it("hides app when hide: true rule is configured", () => {
    const rules: PresenceRules = {
      priorities: { ...DEFAULT_PRIORITIES },
      appRules: {
        "secret-app": {
          appId: "secret-app",
          hide: true,
        },
      },
      privacyMode: false,
    };

    const desktop: DesktopFact = {
      kind: "desktop",
      appId: "secret-app",
      observedAt: 1000,
    };

    const result = resolvePresence({
      desktop,
      media: null,
      manualOverride: null,
      privacyMode: false,
      rules,
      currentRevision: 0,
    });

    expect(result.presence).toBeNull();
    expect(result.candidates.length).toBe(0);
  });
});
