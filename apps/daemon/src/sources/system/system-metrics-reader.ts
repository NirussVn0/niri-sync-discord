import * as fs from "node:fs";
import * as os from "node:os";
import { SystemFact, SystemMetrics } from "@presenced/contracts";

export class SystemMetricsReader {
  private prevCpuTotal = 0;
  private prevCpuIdle = 0;

  /**
   * Reads Linux /proc/stat, /proc/meminfo, /proc/uptime, and /sys to construct SystemFact.
   */
  public read(): SystemFact {
    const metrics: SystemMetrics = {
      cpuPercent: this.readCpuPercent(),
      ramUsedBytes: 0,
      ramTotalBytes: 0,
      ramPercent: 0,
      uptimeSeconds: os.uptime(),
      hostname: os.hostname(),
    };

    // Read RAM from /proc/meminfo
    try {
      if (fs.existsSync("/proc/meminfo")) {
        const content = fs.readFileSync("/proc/meminfo", "utf8");
        let totalKb = 0;
        let availKb = 0;

        for (const line of content.split("\n")) {
          if (line.startsWith("MemTotal:")) {
            totalKb = parseInt(line.replace(/\D+/g, ""), 10) || 0;
          } else if (line.startsWith("MemAvailable:")) {
            availKb = parseInt(line.replace(/\D+/g, ""), 10) || 0;
          }
        }

        if (totalKb > 0) {
          const usedKb = totalKb - availKb;
          metrics.ramTotalBytes = totalKb * 1024;
          metrics.ramUsedBytes = usedKb * 1024;
          metrics.ramPercent = Math.min(100, Math.max(0, Math.round((usedKb / totalKb) * 100)));
        }
      }
    } catch {
      // Fallback to os module if /proc/meminfo read fails
      const total = os.totalmem();
      const free = os.freemem();
      const used = total - free;
      metrics.ramTotalBytes = total;
      metrics.ramUsedBytes = used;
      metrics.ramPercent = Math.min(100, Math.max(0, Math.round((used / total) * 100)));
    }

    // Read Battery from /sys/class/power_supply/BAT*
    try {
      const batDirs = ["/sys/class/power_supply/BAT0", "/sys/class/power_supply/BAT1"];
      for (const batDir of batDirs) {
        if (fs.existsSync(batDir)) {
          const capPath = `${batDir}/capacity`;
          const statPath = `${batDir}/status`;
          if (fs.existsSync(capPath)) {
            const cap = parseInt(fs.readFileSync(capPath, "utf8").trim(), 10);
            if (!Number.isNaN(cap)) {
              metrics.batteryPercent = Math.min(100, Math.max(0, cap));
            }
          }
          if (fs.existsSync(statPath)) {
            const stat = fs.readFileSync(statPath, "utf8").trim().toLowerCase();
            if (stat === "charging") metrics.batteryState = "charging";
            else if (stat === "discharging") metrics.batteryState = "discharging";
            else if (stat === "full") metrics.batteryState = "full";
            else metrics.batteryState = "unknown";
          }
          break;
        }
      }
    } catch {
      // Ignore battery read failure on desktop
    }

    return {
      kind: "system",
      metrics,
      observedAt: Date.now(),
    };
  }

  private readCpuPercent(): number {
    try {
      if (fs.existsSync("/proc/stat")) {
        const content = fs.readFileSync("/proc/stat", "utf8");
        const firstLine = content.split("\n")[0];
        if (firstLine && firstLine.startsWith("cpu ")) {
          const parts = firstLine.trim().split(/\s+/).slice(1).map(Number);
          // user, nice, system, idle, iowait, irq, softirq, steal
          const idle = (parts[3] ?? 0) + (parts[4] ?? 0);
          const total = parts.reduce((acc, curr) => acc + (curr ?? 0), 0);

          const diffIdle = idle - this.prevCpuIdle;
          const diffTotal = total - this.prevCpuTotal;

          this.prevCpuIdle = idle;
          this.prevCpuTotal = total;

          if (diffTotal > 0) {
            const usage = 100 - (diffIdle / diffTotal) * 100;
            return Math.min(100, Math.max(0, Math.round(usage)));
          }
        }
      }
    } catch {
      // fallback
    }

    return 0;
  }
}
