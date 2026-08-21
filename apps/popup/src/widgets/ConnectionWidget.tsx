/**
 * ConnectionWidget — compact health-dot dashboard for all integration sources.
 *
 * Shows Niri, MPRIS, LRCLIB, and Discord as single-line rows with colored
 * status dots and labels inside a GlassCard wrapper.
 */
import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard.js";
import { springSnap } from "../lib/animations.js";
import { IntegrationHealth, SourceHealth } from "@presenced/contracts";
import { Layers, Disc3, MessageSquare, Mic2 } from "lucide-react";

/* ── Types ────────────────────────────────────────────────────────────── */

export interface ConnectionWidgetProps {
  /** Per-source health map keyed by source name. */
  health: Record<string, IntegrationHealth> | undefined;
}

/* ── Source registry ──────────────────────────────────────────────────── */

interface SourceDef {
  key: string;
  name: string;
  icon: React.ReactNode;
  defaultStatus: SourceHealth;
}

const SOURCES: SourceDef[] = [
  { key: "niri",   name: "Niri IPC",  icon: <Layers className="w-3 h-3" />,        defaultStatus: "disconnected" },
  { key: "mpris",  name: "MPRIS",     icon: <Disc3 className="w-3 h-3" />,         defaultStatus: "disconnected" },
  { key: "lyrics", name: "LRCLIB",    icon: <Mic2 className="w-3 h-3" />,          defaultStatus: "disconnected" },
  { key: "discord", name: "Discord",  icon: <MessageSquare className="w-3 h-3" />, defaultStatus: "disconnected" },
];

/* ── Status → colour mapping ──────────────────────────────────────────── */

interface DotStyle {
  dot: string;
  text: string;
}

const STATUS_STYLES: Record<SourceHealth, DotStyle> = {
  connected:             { dot: "bg-emerald-400 shadow-sm shadow-emerald-400/50", text: "text-emerald-400" },
  reconnecting:          { dot: "bg-amber-400 animate-pulse",                     text: "text-amber-400" },
  disconnected:          { dot: "bg-slate-500",                                   text: "text-slate-400" },
  degraded:              { dot: "bg-amber-400",                                   text: "text-amber-400" },
  unsupported:           { dot: "bg-rose-500",                                    text: "text-rose-400" },
  "permission-required":  { dot: "bg-amber-500",                                  text: "text-amber-400" },
  "provider-rate-limited": { dot: "bg-amber-400",                                 text: "text-amber-300" },
};

const FALLBACK_STYLE: DotStyle = STATUS_STYLES.disconnected;

/* ── Component ────────────────────────────────────────────────────────── */

export const ConnectionWidget = ({ health }: ConnectionWidgetProps) => {
  return (
    <GlassCard>
      {/* Section header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-2xs font-bold text-text-secondary uppercase tracking-wider">
          Integrations
        </span>
        {health && (
          <span className="text-2xs text-text-muted font-mono">
            {Object.values(health).filter((h) => h.status === "connected").length}/
            {Object.keys(health).length || SOURCES.length} online
          </span>
        )}
      </div>

      {/* Source rows */}
      <div className="space-y-1">
        {SOURCES.map((src) => {
          const entry = health?.[src.key];
          const status: SourceHealth = entry?.status ?? src.defaultStatus;
          const { dot, text } = STATUS_STYLES[status] ?? FALLBACK_STYLE;
          const label = entry?.details
            ? entry.details
            : status.charAt(0).toUpperCase() + status.slice(1);

          return (
            <motion.div
              key={src.key}
              className="flex items-center gap-2 py-0.5 px-1 rounded-niri hover:bg-white/[0.03] transition-colors"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={springSnap}
            >
              {/* Icon */}
              <span className="text-text-muted flex-shrink-0">{src.icon}</span>

              {/* Name */}
              <span className="text-2xs font-medium text-text-secondary flex-shrink-0 w-14">
                {src.name}
              </span>

              {/* Dot + status text */}
              <span className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${dot}`} />
                <span className={`text-2xs truncate ${text}`}>{label}</span>
              </span>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
};
