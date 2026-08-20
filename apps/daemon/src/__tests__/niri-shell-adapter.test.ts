import { describe, it, expect } from "vitest";
import { NiriParser } from "../sources/niri/niri-parser.js";
import { NiriShellAdapter } from "../sources/niri/niri-shell-adapter.js";

describe("NiriShellAdapter & Focus Protection", () => {
  it("initializes NiriShellAdapter with default state", () => {
    const adapter = new NiriShellAdapter();
    expect(adapter.getFocusedOutput()).toBeNull();
    expect(adapter.getOutputs()).toEqual([]);
    expect(adapter.getWorkspaces()).toEqual([]);
    expect(adapter.isOverview()).toBe(false);

    adapter.setOverviewActive(true);
    expect(adapter.isOverview()).toBe(true);
  });

  it("protects presence context when popup window receives focus", () => {
    const parser = new NiriParser();

    // 1. Initial window: VS Code
    const openVsCode = {
      WindowOpenedOrChanged: {
        window: {
          id: 10,
          title: "niri-sync-discord — Visual Studio Code",
          app_id: "code",
          workspace_id: 1,
          is_focused: true,
        },
      },
    };
    const res1 = parser.processEvent(openVsCode, 1000);
    expect(res1.changed).toBe(true);
    expect(res1.fact?.appId).toBe("code");

    // 2. User summons popup (focus changes to io.niruss.niri-sync-discord)
    const openPopup = {
      WindowOpenedOrChanged: {
        window: {
          id: 99,
          title: "presenced",
          app_id: "io.niruss.niri-sync-discord",
          workspace_id: 1,
          is_focused: true,
        },
      },
    };
    const res2 = parser.processEvent(openPopup, 2000);
    // Should NOT emit a new fact or clear presence, preserving the previous VS Code fact
    expect(res2.changed).toBe(false);
    expect(res2.fact?.appId).toBe("code");
  });
});
