import { DesktopFact, ResolvedPresence } from "@presenced/contracts";
import { Monitor, Code, Terminal, Globe, Gamepad2, Video, EyeOff } from "lucide-react";

interface DesktopCardProps {
  desktop: DesktopFact | null | undefined;
  presence: ResolvedPresence | null | undefined;
  privacyMode?: boolean;
}

export const DesktopCard = ({
  desktop,
  presence,
  privacyMode = false,
}: DesktopCardProps) => {
  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case "coding":
        return <Code className="w-4 h-4 text-sky-400" />;
      case "terminal":
        return <Terminal className="w-4 h-4 text-emerald-400" />;
      case "browser":
        return <Globe className="w-4 h-4 text-amber-400" />;
      case "gaming":
        return <Gamepad2 className="w-4 h-4 text-rose-400" />;
      case "video":
        return <Video className="w-4 h-4 text-purple-400" />;
      default:
        return <Monitor className="w-4 h-4 text-indigo-400" />;
    }
  };

  if (!desktop && !presence) {
    return (
      <div className="p-3.5 rounded-xl bg-surface border border-surface-border select-none text-center py-6 space-y-1">
        <Monitor className="w-5 h-5 text-slate-600 mx-auto" />
        <p className="text-xs font-semibold text-slate-400">Desktop Idle</p>
        <p className="text-[10px] text-slate-600">No active window focused in Niri</p>
      </div>
    );
  }

  const category = presence?.category ?? "generic";
  const title = privacyMode
    ? "Privacy Mode"
    : presence?.title || desktop?.rawTitle || desktop?.appId || "Desktop Window";
  const details = privacyMode ? "Presence Hidden" : presence?.details;

  return (
    <div className="p-3.5 rounded-xl bg-surface border border-surface-border space-y-2.5 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
          {getCategoryIcon(category)}
          <span className="capitalize">{desktop?.appId || category}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {privacyMode && (
            <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
              <EyeOff className="w-2.5 h-2.5" />
              Masked
            </span>
          )}
          {desktop?.workspaceId != null && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              WS {desktop.workspaceId}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-0.5">
        <h2 className="text-sm font-bold text-white tracking-tight truncate">{title}</h2>
        {details && <p className="text-xs text-slate-400 truncate">{details}</p>}
        {presence?.reason && !privacyMode && (
          <p className="text-[10px] text-slate-500 italic truncate pt-0.5">
            {presence.reason}
          </p>
        )}
      </div>
    </div>
  );
};
