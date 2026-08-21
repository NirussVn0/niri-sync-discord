/**
 * SystemWidget — glassmorphic system telemetry card with CPU/RAM bars.
 */
import { motion } from "framer-motion";
import { SystemFact } from "@presenced/contracts";
import {
  Cpu,
  HardDrive,
  BatteryCharging,
  Battery,
  Clock,
  Server,
} from "lucide-react";
import { GlassCard } from "./GlassCard.js";
import { progressBar } from "../lib/animations.js";

interface SystemWidgetProps {
  system: SystemFact | null | undefined;
}

function formatBytesGb(bytes: number): string {
  if (bytes <= 0) return "0 GB";
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

const getCpuBarColor = (pct: number) => {
  if (pct >= 80) return "bg-status-error";
  if (pct >= 50) return "bg-status-degraded";
  return "bg-status-connected";
};

const getCpuTextColor = (pct: number) => {
  if (pct >= 80) return "text-status-error";
  if (pct >= 50) return "text-status-degraded";
  return "text-status-connected";
};

export const SystemWidget = ({ system }: SystemWidgetProps) => {
  const metrics = system?.metrics;

  if (!metrics) {
    return (
      <GlassCard>
        <div className="flex flex-col items-center justify-center py-4 space-y-1 select-none">
          <Cpu className="w-5 h-5 text-text-ghost" />
          <p className="text-xs font-semibold text-text-secondary">
            System Telemetry Offline
          </p>
          <p className="text-2xs text-text-muted">Linux /proc unavailable</p>
        </div>
      </GlassCard>
    );
  }

  const cpuPercent = metrics.cpuPercent;
  const ramPercent = metrics.ramPercent;

  return (
    <GlassCard glowColor="#6366f1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-2xs font-semibold text-scene-system-from">
          <Server className="w-3.5 h-3.5" />
          <span>System</span>
        </div>
        <span className="text-2xs px-2 py-0.5 rounded-niri glass-surface text-text-secondary font-mono">
          {metrics.hostname || "Linux"}
        </span>
      </div>

      {/* CPU Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-2xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-scene-system-from" />
            <span>CPU</span>
          </span>
          <span
            className={`font-mono font-bold ${getCpuTextColor(cpuPercent)}`}
          >
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

      {/* RAM Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-2xs text-text-secondary">
          <span className="flex items-center gap-1">
            <HardDrive className="w-3 h-3 text-accent-primary" />
            <span>RAM</span>
          </span>
          <span className="font-mono font-bold text-text-primary">
            {ramPercent}%
          </span>
        </div>
        <div className="w-full h-1 bg-surface-solid rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent-indigo rounded-full"
            variants={progressBar}
            initial="initial"
            animate="animate"
            custom={ramPercent}
          />
        </div>
        <p className="text-2xs text-text-muted font-mono">
          {formatBytesGb(metrics.ramUsedBytes)} / {formatBytesGb(metrics.ramTotalBytes)}
        </p>
      </div>

      {/* Secondary metrics row */}
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
          <span className="text-text-ghost">No battery</span>
        )}
      </div>
    </GlassCard>
  );
};
