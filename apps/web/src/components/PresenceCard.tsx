import type { ReactNode } from "react";
import {
  ResolvedPresence,
  ActivityCategory,
  ManualOverride,
  DesktopFact,
} from "@presenced/contracts";
import {
  Code,
  Terminal,
  Globe,
  Gamepad2,
  Music,
  Video,
  VideoOff,
  ShieldAlert,
  UserCheck,
  HelpCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface PresenceCardProps {
  presence: ResolvedPresence | null;
  override: ManualOverride | null;
  desktop: DesktopFact | null;
  onOpenOverrideModal: () => void;
  onClearOverride: () => void;
}

const CATEGORY_CONFIG: Record<
  ActivityCategory,
  { label: string; bg: string; text: string; icon: ReactNode }
> = {
  coding: {
    label: "Coding",
    bg: "bg-blue-500/10 border-blue-500/30",
    text: "text-blue-400",
    icon: <Code className="w-4 h-4 text-blue-400" />,
  },
  terminal: {
    label: "Terminal",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    text: "text-emerald-400",
    icon: <Terminal className="w-4 h-4 text-emerald-400" />,
  },
  browser: {
    label: "Browsing",
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-400",
    icon: <Globe className="w-4 h-4 text-amber-400" />,
  },
  gaming: {
    label: "Gaming",
    bg: "bg-purple-500/10 border-purple-500/30",
    text: "text-purple-400",
    icon: <Gamepad2 className="w-4 h-4 text-purple-400" />,
  },
  music: {
    label: "Music",
    bg: "bg-pink-500/10 border-pink-500/30",
    text: "text-pink-400",
    icon: <Music className="w-4 h-4 text-pink-400" />,
  },
  video: {
    label: "Video",
    bg: "bg-rose-500/10 border-rose-500/30",
    text: "text-rose-400",
    icon: <Video className="w-4 h-4 text-rose-400" />,
  },
  recording: {
    label: "Recording",
    bg: "bg-red-500/10 border-red-500/30",
    text: "text-red-400",
    icon: <VideoOff className="w-4 h-4 text-red-400" />,
  },
  manual: {
    label: "Manual Override",
    bg: "bg-indigo-500/10 border-indigo-500/30",
    text: "text-indigo-400",
    icon: <UserCheck className="w-4 h-4 text-indigo-400" />,
  },
  privacy: {
    label: "Privacy Mode",
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-400",
    icon: <ShieldAlert className="w-4 h-4 text-amber-400" />,
  },
  generic: {
    label: "App",
    bg: "bg-slate-500/10 border-slate-500/30",
    text: "text-slate-400",
    icon: <HelpCircle className="w-4 h-4 text-slate-400" />,
  },
  idle: {
    label: "Idle",
    bg: "bg-slate-500/10 border-slate-500/30",
    text: "text-slate-400",
    icon: <Clock className="w-4 h-4 text-slate-400" />,
  },
};

export const PresenceCard = ({
  presence,
  override,
  desktop,
  onOpenOverrideModal,
  onClearOverride,
}: PresenceCardProps) => {
  const categoryConfig = presence
    ? CATEGORY_CONFIG[presence.category] ?? CATEGORY_CONFIG.generic
    : CATEGORY_CONFIG.idle;

  return (
    <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-xl relative overflow-hidden">
      {/* Subtle glow effect */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${categoryConfig.bg} ${categoryConfig.text}`}
          >
            {categoryConfig.icon}
            {categoryConfig.label}
          </span>
          <span className="text-xs text-slate-400">
            Source: <span className="text-slate-300 font-mono">{presence?.source ?? "none"}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {override ? (
            <button
              type="button"
              onClick={onClearOverride}
              className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
            >
              Clear Override
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenOverrideModal}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Set Override
            </button>
          )}
        </div>
      </div>

      {presence ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
              {presence.title}
            </h2>
            {presence.details && (
              <p className="text-slate-300 text-sm mt-1">{presence.details}</p>
            )}
            {presence.state && (
              <p className="text-slate-400 text-xs mt-0.5">{presence.state}</p>
            )}
          </div>

          {/* Winning Reason Explainer */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 flex items-start gap-2.5">
            <div className="p-1 rounded-md bg-sky-500/10 text-sky-400 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-slate-300">Why this won: </span>
              <span className="text-slate-400">{presence.reason}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center space-y-2">
          <Clock className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No active activity</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Focus a window in Niri or play media to generate presence candidates.
          </p>
        </div>
      )}

      {/* Raw Desktop Ingestion (Sanitized view) */}
      {desktop && (
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div>
            Focused App: <span className="font-mono text-slate-300">{desktop.appId}</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Window ID: {desktop.windowId ?? "none"} · Workspace: {desktop.workspaceId ?? "default"}
          </div>
        </div>
      )}
    </div>
  );
};
