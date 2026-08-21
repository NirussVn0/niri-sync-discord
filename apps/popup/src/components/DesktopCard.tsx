import { motion } from "framer-motion";
import { DesktopFact, ResolvedPresence } from "@presenced/contracts";
import { Monitor, Code, Terminal, Globe, Gamepad2, Video, EyeOff } from "lucide-react";
import { cardReveal } from "../lib/animations.js";

interface DesktopCardProps {
  desktop: DesktopFact | null | undefined;
  presence: ResolvedPresence | null | undefined;
  privacyMode?: boolean | undefined;
}

export const DesktopCard = ({ desktop, presence, privacyMode = false }: DesktopCardProps) => {
  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case "coding":    return <Code className="w-4 h-4 text-scene-focus-from" />;
      case "terminal":  return <Terminal className="w-4 h-4 text-status-connected" />;
      case "browser":   return <Globe className="w-4 h-4 text-status-degraded" />;
      case "gaming":    return <Gamepad2 className="w-4 h-4 text-status-error" />;
      case "video":     return <Video className="w-4 h-4 text-scene-music-from" />;
      default:          return <Monitor className="w-4 h-4 text-accent-primary" />;
    }
  };

  if (!desktop && !presence) {
    return (
      <div className="p-3.5 rounded-niri-lg glass-float select-none text-center py-6 space-y-1">
        <Monitor className="w-5 h-5 text-text-ghost mx-auto" />
        <p className="text-xs font-semibold text-text-secondary">Desktop Idle</p>
        <p className="text-2xs text-text-muted">No active window focused in Niri</p>
      </div>
    );
  }

  const category = presence?.category ?? "generic";
  const title = privacyMode
    ? "Privacy Mode"
    : presence?.title || desktop?.rawTitle || desktop?.appId || "Desktop Window";
  const details = privacyMode ? "Presence Hidden" : presence?.details;

  return (
    <motion.div
      className="p-3.5 rounded-niri-lg glass-float space-y-2.5 select-none"
      variants={cardReveal}
      initial="hidden"
      animate="visible"
      custom={0}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-2xs font-semibold text-text-primary">
          {getCategoryIcon(category)}
          <span className="capitalize">{desktop?.appId || category}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {privacyMode && (
            <span className="flex items-center gap-1 text-2xs px-1.5 py-0.5 rounded-niri bg-status-degraded/10 text-status-degraded border border-status-degraded/20 font-mono">
              <EyeOff className="w-2.5 h-2.5" />
              Masked
            </span>
          )}
          {desktop?.workspaceId != null && (
            <span className="text-2xs px-1.5 py-0.5 rounded-niri glass-surface text-text-muted font-mono">
              WS {desktop.workspaceId}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-0.5">
        <h2 className="text-sm font-bold text-text-primary tracking-tight truncate">{title}</h2>
        {details && <p className="text-xs text-text-secondary truncate">{details}</p>}
        {presence?.reason && !privacyMode && (
          <p className="text-2xs text-text-muted italic truncate pt-0.5">
            {presence.reason}
          </p>
        )}
      </div>
    </motion.div>
  );
};
