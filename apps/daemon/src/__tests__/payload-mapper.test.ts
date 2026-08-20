import { describe, it, expect } from "vitest";
import { mapPresenceToDiscordActivity } from "../outputs/discord/payload-mapper.js";
import { ResolvedPresence, RpcTemplate } from "@presenced/contracts";

describe("payload-mapper", () => {
  it("returns null for null presence", () => {
    expect(mapPresenceToDiscordActivity(null)).toBeNull();
  });

  it("maps desktop presence safely", () => {
    const presence: ResolvedPresence = {
      revision: 1,
      candidateId: "desktop:code",
      category: "coding",
      title: "Visual Studio Code",
      details: "niri-sync-discord",
      source: "niri",
      reason: "Visual Studio Code active",
      resolvedAt: 1000,
    };

    const activity = mapPresenceToDiscordActivity(presence);
    expect(activity).not.toBeNull();
    expect(activity?.details).toBe("Visual Studio Code");
    expect(activity?.state).toBe("niri-sync-discord");
  });

  it("maps music presence with title, artist, timestamps, and artwork", () => {
    const presence: ResolvedPresence = {
      revision: 1,
      candidateId: "media:spotify",
      category: "music",
      title: "Midnight City",
      details: "M83",
      state: "Hurry Up, We're Dreaming",
      source: "mpris:spotify",
      reason: "Midnight City won",
      timestamps: {
        start: 1700000000000,
        end: 1700000240000,
      },
      assets: {
        largeImage: "https://example.com/art.jpg",
        largeText: "Hurry Up, We're Dreaming",
      },
      resolvedAt: 1000,
    };

    const activity = mapPresenceToDiscordActivity(presence);
    expect(activity).not.toBeNull();
    expect(activity?.details).toBe("Midnight City");
    expect(activity?.state).toBe("M83");
    expect(activity?.timestamps?.start).toBe(1700000000);
    expect(activity?.timestamps?.end).toBe(1700000240);
    expect(activity?.assets?.large_image).toBe("https://example.com/art.jpg");
  });

  it("maps privacy mode correctly", () => {
    const presence: ResolvedPresence = {
      revision: 1,
      candidateId: "privacy:active",
      category: "privacy",
      title: "Privacy Mode",
      source: "privacy",
      reason: "Privacy mode active",
      resolvedAt: 1000,
    };

    const activity = mapPresenceToDiscordActivity(presence);
    expect(activity).not.toBeNull();
    expect(activity?.details).toBe("Privacy Mode");
    expect(activity?.state).toBeUndefined();
  });

  it("applies custom RPC templates when provided", () => {
    const presence: ResolvedPresence = {
      revision: 1,
      candidateId: "custom:1",
      category: "pomodoro",
      title: "Focusing",
      source: "pomodoro",
      reason: "Pomodoro active",
      resolvedAt: 1000,
    };

    const template: RpcTemplate = {
      id: "custom-tpl",
      name: "Custom Study",
      detailsTemplate: "Studying {pomodoro.task}",
      stateTemplate: "{pomodoro.remaining} left • Session {pomodoro.session}",
      isBuiltin: false,
    };

    const activity = mapPresenceToDiscordActivity(presence, {
      template,
      variables: {
        pomodoro: {
          task: "Linear Algebra",
          remaining: "18:30",
          session: "3/4",
        },
      },
    });

    expect(activity).not.toBeNull();
    expect(activity?.details).toBe("Studying Linear Algebra");
    expect(activity?.state).toBe("18:30 left • Session 3/4");
  });
});
