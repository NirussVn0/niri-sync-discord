import { SystemFact } from "@presenced/contracts";
import { Cpu, HardDrive, BatteryCharging, Battery, Clock, Server } from "lucide-react";

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
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export const SystemCard = ({ system }: SystemCardProps) => {
  const metrics = system?.metrics;

  if (!metrics) {
    return (
      <div className="p-3.5 rounded-xl bg-surface border border-surface-border select-none text-center py-6 space-y-1">
        <Cpu className="w-5 h-5 text-slate-600 mx-auto" />
        <p className="text-xs font-semibold text-slate-400">System Telemetry Offline</p>
        <p className="text-[10px] text-slate-600">Linux /proc metrics unavailable</p>
      </div>
    );
  }

  const cpuPercent = metrics.cpuPercent;
  const ramPercent = metrics.ramPercent;

  const getCpuColor = (pct: number) => {
    if (pct >= 80) return "text-rose-400";
    if (pct >= 50) return "text-amber-400";
    return "text-emerald-400";
  };

  return (
    <div className="p-3.5 rounded-xl bg-surface border border-surface-border space-y-3 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
          <Server className="w-3.5 h-3.5" />
          <span>System Context</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
          {metrics.hostname || "Linux"}
        </span>
      </div>

      {/* Grid of Telemetry Chips */}
      <div className="grid grid-cols-2 gap-2">
        {/* CPU Chip */}
        <div className="p-2.5 rounded-lg bg-slate-900/70 border border-surface-border space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-sky-400" />
              <span>CPU Load</span>
            </span>
            <span className={`font-mono font-bold ${getCpuColor(cpuPercent)}`}>
              {cpuPercent}%
            </span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                cpuPercent >= 80 ? "bg-rose-400" : cpuPercent >= 50 ? "bg-amber-400" : "bg-emerald-400"
              }`}
              style={{ width: `${cpuPercent}%` }}
            />
          </div>
        </div>

        {/* RAM Chip */}
        <div className="p-2.5 rounded-lg bg-slate-900/70 border border-surface-border space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-indigo-400" />
              <span>Memory</span>
            </span>
            <span className="font-mono font-bold text-slate-200">{ramPercent}%</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${ramPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-400 border-t border-surface-border/50">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>Uptime: {formatUptime(metrics.uptimeSeconds)}</span>
        </div>

        {metrics.batteryPercent !== undefined ? (
          <div className="flex items-center gap-1">
            {metrics.batteryState === "charging" ? (
              <BatteryCharging className="w-3 h-3 text-emerald-400" />
            ) : (
              <Battery className="w-3 h-3 text-slate-400" />
            )}
            <span>{metrics.batteryPercent}%</span>
          </div>
        ) : (
          <span>RAM {formatBytesGb(metrics.ramUsedBytes)}</span>
        )}
      </div>
    </div>
  );
};
