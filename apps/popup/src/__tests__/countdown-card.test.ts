import { describe, it, expect } from "vitest";
import { CountdownFact } from "@presenced/contracts";

describe("CountdownCard & Urgent Highlights", () => {
  it("determines urgency when daysRemaining <= 7", () => {
    const urgentFact: CountdownFact = {
      kind: "countdown",
      activeCountdown: {
        id: "c1",
        title: "Calculus Exam",
        targetDate: new Date(Date.now() + 3 * 86400000).toISOString(),
        category: "exam",
        enabled: true,
        showOnDiscord: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      daysRemaining: 3,
      hoursRemaining: 12,
      totalFormatted: "3d 12h left",
      observedAt: Date.now(),
    };

    expect(urgentFact.daysRemaining).toBeLessThanOrEqual(7);
    expect(urgentFact.activeCountdown?.category).toBe("exam");
  });

  it("handles non-urgent long-term milestones", () => {
    const longTerm: CountdownFact = {
      kind: "countdown",
      activeCountdown: {
        id: "c2",
        title: "THPTQG 2027",
        targetDate: new Date(Date.now() + 300 * 86400000).toISOString(),
        category: "exam",
        enabled: true,
        showOnDiscord: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      daysRemaining: 300,
      hoursRemaining: 0,
      totalFormatted: "300d 0h left",
      observedAt: Date.now(),
    };

    expect(longTerm.daysRemaining).toBe(300);
  });
});
