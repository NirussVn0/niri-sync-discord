import { EventEmitter } from "node:events";
import { CountdownFact, CountdownItem } from "@presenced/contracts";
import { DatabaseManager } from "../../state/database.js";

export class CountdownEngine extends EventEmitter {
  private database: DatabaseManager;
  private ticker: NodeJS.Timeout | null = null;

  constructor(database: DatabaseManager) {
    super();
    this.database = database;
    this.startTicker();
  }

  public getFact(): CountdownFact {
    const items = this.database.getCountdowns().filter((item) => item.enabled);
    const now = Date.now();

    // Find the closest upcoming event
    const upcoming = items
      .filter((item) => new Date(item.targetDate).getTime() > now)
      .sort(
        (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
      );

    const activeCountdown = upcoming[0] ?? null;

    if (!activeCountdown) {
      return {
        kind: "countdown",
        activeCountdown: null,
        daysRemaining: 0,
        hoursRemaining: 0,
        totalFormatted: "No active countdown",
        observedAt: now,
      };
    }

    const targetMs = new Date(activeCountdown.targetDate).getTime();
    const diffMs = Math.max(0, targetMs - now);

    const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const totalFormatted = `${daysRemaining}d ${hoursRemaining}h left`;

    return {
      kind: "countdown",
      activeCountdown,
      daysRemaining,
      hoursRemaining,
      totalFormatted,
      observedAt: now,
    };
  }

  public addCountdown(
    item: Omit<CountdownItem, "id" | "createdAt" | "updatedAt">
  ): CountdownItem {
    const fullItem: CountdownItem = {
      ...item,
      id: `countdown-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.database.saveCountdown(fullItem);
    this.emitFact();
    return fullItem;
  }

  public removeCountdown(id: string): void {
    this.database.deleteCountdown(id);
    this.emitFact();
  }

  public toggleCountdown(id: string): void {
    const items = this.database.getCountdowns();
    const target = items.find((i) => i.id === id);
    if (target) {
      target.enabled = !target.enabled;
      target.updatedAt = Date.now();
      this.database.saveCountdown(target);
      this.emitFact();
    }
  }

  private startTicker(): void {
    // Tick every minute to refresh remaining days/hours
    this.ticker = setInterval(() => this.emitFact(), 60000);
  }

  private emitFact(): void {
    this.emit("fact", this.getFact());
  }

  public destroy(): void {
    if (this.ticker) {
      clearInterval(this.ticker);
      this.ticker = null;
    }
  }
}
