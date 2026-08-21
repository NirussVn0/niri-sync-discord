import { motion } from "framer-motion";
import { SystemFact } from "@presenced/contracts";
import { Cpu, HardDrive, BatteryCharging, Battery, Clock, Server } from "lucide-react";
import { cardReveal, progressBar } from "../lib/animations.js";

interface SystemCardProps {
  system: SystemFact | null | undefined;
}

function formatBytesGb(bytes: number): string {
  if (bytes <= 0) return "0 GB";
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
}

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export const SystemCard = ({ system }: SystemCardProps) => {
  const metrics = system?.metrics;

  if (!metrics) {
    return (
      <div className="p-3.5 rounded-niri-lg glass-float select-none text-center py-6 space-y-1">
        <Cpu className="w-5 h-5 text-text-ghost mx-auto" />
        <p className="text-xs font-semibold text-text-secondary">System Telemetry Offline</p>
        <p className="text-2xs text-text-muted">Linux /proc metrics unavailable</p>
      </div>
    );
  }

  const cpuPercent = metrics.cpuPercent;
  const ramPercent = metrics.ramPercent;

  const getCpuColor = (pct: number) => {
    if (pct >= 80) return "text-status-error";
    if (pct >= 50) return "text-status-degraded";
    return "text-status-connected";
  };

  const getCpuBarColor = (pct: number) => {
    if (pct >= 80) return "bg-status-error";
    if (pct >= 50) return "bg-status-degraded";
    return "bg-status-connected";
  };

  return (
    <motion.div
      className="p-3.5 rounded-niri-lg glass-float space-y-3 select-none"
      variants={cardReveal}
      initial="hidden"
      animate="visible"
      custom={0}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-2xs font-semibold text-scene-system-from">
          <Server className="w-3.5 h-3.5" />
          <span>System Context</span>
        </div>
        <span className="text-2xs px-2 py-0.5 rounded-niri glass-surface text-text-secondary font-mono">
          {metrics.hostname || "Linux"}
        </span>
      </div>

      {/* Grid of Telemetry Chips */}
      <div className="grid grid-cols-2 gap-2">
        {/* CPU Chip */}
        <div className="p-2.5 rounded-niri glass-surface space-y-1.5">
          <div className="flex items-center justify-between text-2xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-scene-system-from" />
              <span>CPU</span>
            </span>
            <span className={`font-mono font-bold ${getCpuColor(cpuPercent)}`}>
              {cpuPercent}%
            </span>
          </div>
          <div className="w-full h-1 bg-surface-solid rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${getCpuBarColor(cpuPercent)}`}
              variants={progressBar}
              initial="initial"
              animate="animate"
              custom={cpuPercent}
            />
          </div>
        </div>

        {/* RAM Chip */}
        <div className="p-2.5 rounded-niri glass-surface space-y-1.5">
          <div className="flex items-center justify-between text-2xs text-text-secondary">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-accent-primary" />
              <span>RAM</span>
            </span>
            <span className="font-mono font-bold text-text-primary">{ramPercent}%</span>
          </div>
          <div className="w-full h-1 bg-surface-solid rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent-primary rounded-full"
              variants={progressBar}
              initial="initial"
              animate="animate"
              custom={ramPercent}
            />
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="flex items-center justify-between pt-1 text-2xs font-mono text-text-muted border-t border-border-subtle">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-text-ghost" />
          <span>Up: {formatUptime(metrics.uptimeSeconds)}</span>
        </div>

        {metrics.batteryPercent !== undefined ? (
          <div className="flex items-center gap-1">
            {metrics.batteryState === "charging" ? (
              <BatteryCharging className="w-3 h-3 text-status-connected" />
            ) : (
              <Battery className="w-3 h-3 text-text-secondary" />
            )}
            <span>{metrics.batteryPercent}%</span>
          </div>
        ) : (
          <span>RAM {formatBytesGb(metrics.ramUsedBytes)}</span>
        )}
      </div>
    </motion.div>
  );
};
