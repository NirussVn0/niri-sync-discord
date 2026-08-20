import type { ReactNode } from "react";
import { IntegrationHealth, SourceHealth } from "@presenced/contracts";
import { Layers, Disc3, MessageSquare, Mic2 } from "lucide-react";

interface IntegrationsHealthRowProps {
  health: Record<string, IntegrationHealth>;
  onViewDetails?: () => void;
}

interface IntegrationCardDef {
  key: string;
  name: string;
  icon: ReactNode;
  defaultStatus: SourceHealth;
  description: string;
}

const INTEGRATIONS: IntegrationCardDef[] = [
  {
    key: "niri",
    name: "Niri IPC",
    icon: <Layers className="w-4 h-4" />,
    defaultStatus: "disconnected",
    description: "Compositor event stream for window focus",
  },
  {
    key: "mpris",
    name: "MPRIS Media",
    icon: <Disc3 className="w-4 h-4" />,
    defaultStatus: "disconnected",
    description: "Media player metadata & playback status",
  },
  {
    key: "discord",
    name: "Discord RPC",
    icon: <MessageSquare className="w-4 h-4" />,
    defaultStatus: "disconnected",
    description: "Local IPC Rich Presence output",
  },
  {
    key: "lyrics",
    name: "LRCLIB Lyrics",
    icon: <Mic2 className="w-4 h-4" />,
    defaultStatus: "disconnected",
    description: "Synchronized lyrics cache & provider",
  },
];

export const STATUS_CONFIG: Record<
  SourceHealth,
  { label: string; dot: string; text: string; bg: string }
> = {
  connected: {
    label: "Connected",
    dot: "bg-emerald-400 shadow-sm shadow-emerald-400/50",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  reconnecting: {
    label: "Reconnecting",
    dot: "bg-amber-400 animate-ping",
    text: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  disconnected: {
    label: "Disconnected",
    dot: "bg-slate-500",
    text: "text-slate-400",
    bg: "bg-slate-800/40 border-slate-700/50",
  },
  degraded: {
    label: "Degraded",
    dot: "bg-amber-400",
    text: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  unsupported: {
    label: "Unsupported",
    dot: "bg-rose-500",
    text: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
  "permission-required": {
    label: "Permission Required",
    dot: "bg-amber-500",
    text: "text-amber-400",
    bg: "bg-amber-500/15 border-amber-500/30",
  },
  "provider-rate-limited": {
    label: "Rate Limited",
    dot: "bg-amber-400",
    text: "text-amber-300",
    bg: "bg-amber-500/15 border-amber-500/30",
  },
};

export const IntegrationsHealthRow = ({ health, onViewDetails }: IntegrationsHealthRowProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Integration Status
        </h3>
        {onViewDetails && (
          <button
            type="button"
            onClick={onViewDetails}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            View Details →
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {INTEGRATIONS.map((item) => {
          const itemHealth = health[item.key];
          const status = itemHealth?.status ?? item.defaultStatus;
          const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.disconnected;

          return (
            <div
              key={item.key}
              className="bg-surface rounded-xl border border-surface-border p-4 shadow-sm hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                    <span className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sky-400">
                      {item.icon}
                    </span>
                    {item.name}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${config.bg} ${config.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                    {config.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {itemHealth?.details || item.description}
                </p>
              </div>

              {itemHealth?.lastEventAt && (
                <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800">
                  Last event: {new Date(itemHealth.lastEventAt).toLocaleTimeString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
