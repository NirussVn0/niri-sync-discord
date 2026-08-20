import { describe, it, expect } from "vitest";
import { SystemMetricsReader } from "../sources/system/system-metrics-reader.js";

describe("SystemMetricsReader & Linux Metrics", () => {
  it("reads system fact with valid CPU and RAM metrics", () => {
    const reader = new SystemMetricsReader();
    const fact = reader.read();

    expect(fact.kind).toBe("system");
    expect(fact.metrics.cpuPercent).toBeGreaterThanOrEqual(0);
    expect(fact.metrics.cpuPercent).toBeLessThanOrEqual(100);
    expect(fact.metrics.ramPercent).toBeGreaterThanOrEqual(0);
    expect(fact.metrics.ramPercent).toBeLessThanOrEqual(100);
    expect(fact.metrics.uptimeSeconds).toBeGreaterThan(0);
    expect(fact.metrics.hostname).toBeDefined();
  });
});
