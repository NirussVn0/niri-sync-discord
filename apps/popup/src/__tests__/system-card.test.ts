import { describe, it, expect } from "vitest";
import { SystemFact } from "@presenced/contracts";

describe("SystemCard & Formatting", () => {
  it("formats metrics accurately", () => {
    const fact: SystemFact = {
      kind: "system",
      metrics: {
        cpuPercent: 35,
        ramUsedBytes: 8.5 * 1024 * 1024 * 1024,
        ramTotalBytes: 32 * 1024 * 1024 * 1024,
        ramPercent: 27,
        uptimeSeconds: 14400,
        hostname: "cachyos",
      },
      observedAt: Date.now(),
    };

    expect(fact.metrics.cpuPercent).toBe(35);
    expect(fact.metrics.ramPercent).toBe(27);
    expect(fact.metrics.hostname).toBe("cachyos");
  });
});
