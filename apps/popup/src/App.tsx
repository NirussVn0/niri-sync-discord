import { usePresenceCompanion } from "./hooks/usePresenceCompanion.js";
import { HeaderWidget } from "./components/HeaderWidget.js";
import { Sparkles, Radio, Shield, Settings, Music, Clock } from "lucide-react";

export function App() {
  const { snapshot, wsConnected, setPrivacyMode } = usePresenceCompanion();

  return (
    <div className="w-[380px] min-h-[540px] max-h-[640px] bg-background/95 backdrop-blur-md border border-surface-border rounded-2xl p-4 text-slate-100 flex flex-col justify-between shadow-2xl select-none font-sans overflow-hidden">
      {/* Top Profile / Greeting Widget */}
      <HeaderWidget
        wsConnected={wsConnected}
        workspaceId={snapshot?.desktop?.workspaceId}
        activeSceneType={snapshot?.scene?.activeSceneType ?? "auto"}
        userName="Niruss"
      />

      {/* Main Companion Body */}
      <div className="py-4 space-y-3 flex-1 flex flex-col justify-center">
        {/* Compact Media / Activity Hero */}
        <div className="p-3.5 rounded-xl bg-surface border border-surface-border space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
              <Music className="w-3.5 h-3.5" />
              <span>Active Context</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                snapshot?.presence
                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {snapshot?.presence ? snapshot.presence.category : "Standby"}
            </span>
          </div>

          {snapshot?.presence ? (
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white truncate">
                {snapshot.presence.title}
              </h2>
              {snapshot.presence.details && (
                <p className="text-xs text-slate-300 truncate">{snapshot.presence.details}</p>
              )}
              <p className="text-[10px] text-slate-500 italic truncate mt-1">
                {snapshot.presence.reason}
              </p>
            </div>
          ) : (
            <div className="text-center py-4 space-y-1">
              <Radio className="w-6 h-6 text-slate-500 mx-auto animate-pulse" />
              <p className="text-xs font-medium text-slate-300">presenced daemon standby</p>
              <p className="text-[10px] text-slate-500">
                Awaiting Niri IPC / MPRIS media events
              </p>
            </div>
          )}
        </div>

        {/* Focus / Pomodoro Mini Chip */}
        <div className="p-3 rounded-xl bg-surface/60 border border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-xs font-semibold text-slate-200">Pomodoro Focus</div>
              <div className="text-[10px] text-slate-400">
                {snapshot?.pomodoro
                  ? `${Math.floor(snapshot.pomodoro.remainingSeconds / 60)}:${String(
                      snapshot.pomodoro.remainingSeconds % 60
                    ).padStart(2, "0")} · Session ${snapshot.pomodoro.currentSession}/${
                      snapshot.pomodoro.totalSessions
                    }`
                  : "25:00 · Ready to start"}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors"
          >
            Start
          </button>
        </div>
      </div>

      {/* Footer Quick Controls */}
      <div className="pt-3 border-t border-surface-border/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPrivacyMode(!snapshot?.privacyMode)}
            className={`p-1.5 rounded-lg border transition-colors ${
              snapshot?.privacyMode
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-900 border-slate-800 hover:text-white"
            }`}
            title={snapshot?.privacyMode ? "Privacy Mode Active" : "Enable Privacy Mode"}
          >
            <Shield className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-white transition-colors"
            title="Custom Scene"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono">v0.2.0</span>
          <button
            type="button"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
