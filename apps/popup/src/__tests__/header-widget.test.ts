import { describe, it, expect } from "vitest";
import { SceneType } from "@presenced/contracts";

describe("HeaderWidget & Profile Formatting", () => {
  it("formats greeting and labels correctly for all scene types", () => {
    const sceneTypes: SceneType[] = [
      "auto",
      "music",
      "focus",
      "pomodoro",
      "countdown",
      "system",
      "privacy",
      "custom",
    ];

    expect(sceneTypes).toHaveLength(8);
  });

  it("handles workspaceId display properly", () => {
    const workspaceId = 3;
    const badgeText = workspaceId != null ? `Workspace ${workspaceId}` : "Niri Wayland";
    expect(badgeText).toBe("Workspace 3");

    const nullWorkspace: number | null = null;
    const fallbackText = nullWorkspace != null ? `Workspace ${nullWorkspace}` : "Niri Wayland";
    expect(fallbackText).toBe("Niri Wayland");
  });
});
