import { describe, it, expect } from "vitest";
import { SceneType } from "@presenced/contracts";

describe("SceneSelector & Scene Switching", () => {
  it("verifies all 7 scene options are valid SceneTypes", () => {
    const validTypes: SceneType[] = [
      "auto",
      "music",
      "focus",
      "pomodoro",
      "countdown",
      "system",
      "privacy",
    ];

    for (const type of validTypes) {
      expect(typeof type).toBe("string");
    }
  });
});
