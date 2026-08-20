import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DatabaseManager } from "../state/database.js";
import { CountdownEngine } from "../sources/countdown/countdown-engine.js";

describe("CountdownEngine & SQLite Persistence", () => {
  let db: DatabaseManager;
  let engine: CountdownEngine;

  beforeEach(() => {
    db = new DatabaseManager({ dbPath: ":memory:" });
    engine = new CountdownEngine(db);
  });

  afterEach(() => {
    engine.destroy();
    db.close();
  });

  it("handles empty countdown list gracefully", () => {
    const fact = engine.getFact();
    expect(fact.activeCountdown).toBeNull();
    expect(fact.daysRemaining).toBe(0);
    expect(fact.totalFormatted).toBe("No active countdown");
  });

  it("adds, sorts, and calculates closest upcoming countdown", () => {
    const now = Date.now();
    const futureDate1 = new Date(now + 10 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(); // 10d 4h
    const futureDate2 = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30d

    engine.addCountdown({
      title: "Far Event",
      targetDate: futureDate2,
      category: "holiday",
      enabled: true,
      showOnDiscord: false,
    });

    engine.addCountdown({
      title: "Near Exam",
      targetDate: futureDate1,
      category: "exam",
      enabled: true,
      showOnDiscord: true,
    });

    const fact = engine.getFact();
    expect(fact.activeCountdown).not.toBeNull();
    expect(fact.activeCountdown?.title).toBe("Near Exam");
    expect(fact.daysRemaining).toBe(10);
    expect(fact.hoursRemaining).toBe(4);
    expect(fact.totalFormatted).toBe("10d 4h left");
  });
});
