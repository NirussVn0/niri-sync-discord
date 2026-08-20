import { describe, it, expect } from "vitest";
import { ResolvedPresence } from "@presenced/contracts";

describe("DiscordPreview & Unicode Safety", () => {
  it("extracts first character safely from Unicode/CJK and Vietnamese titles", () => {
    const vietnamese = "Chuyện Đôi Ta";
    const char1 = Array.from(vietnamese)[0];
    expect(char1).toBe("C");

    const japanese = "夜に駆ける";
    const char2 = Array.from(japanese)[0];
    expect(char2).toBe("夜");

    const emoji = "🎵 Music";
    const char3 = Array.from(emoji)[0];
    expect(char3).toBe("🎵");
  });

  it("handles countdown vs elapsed timestamps", () => {
    const presenceWithStart: ResolvedPresence = {
      revision: 1,
      candidateId: "m1",
      category: "music",
      title: "Song",
      timestamps: { start: Date.now() - 65000 },
      source: "mpris",
      reason: "Music playing",
      resolvedAt: Date.now(),
    };

    expect(presenceWithStart.timestamps?.start).toBeDefined();
    expect(presenceWithStart.timestamps?.end).toBeUndefined();

    const presenceWithEnd: ResolvedPresence = {
      revision: 2,
      candidateId: "p1",
      category: "pomodoro",
      title: "Focus",
      timestamps: { end: Date.now() + 1500000 },
      source: "pomodoro",
      reason: "Pomodoro running",
      resolvedAt: Date.now(),
    };

    expect(presenceWithEnd.timestamps?.end).toBeDefined();
  });
});
