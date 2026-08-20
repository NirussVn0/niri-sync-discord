import { useState } from "react";
import { usePresenceCompanion } from "./hooks/usePresenceCompanion.js";
import { HeaderWidget } from "./components/HeaderWidget.js";
import { SceneSelector } from "./components/SceneSelector.js";
import { DesktopCard } from "./components/DesktopCard.js";
import { MusicCard } from "./components/MusicCard.js";
import { FocusedLyricsView } from "./components/FocusedLyricsView.js";
import { DiscordPreview } from "./components/DiscordPreview.js";
import { Shield, Settings, MessageSquare, Clock } from "lucide-react";

export function App() {
  const { snapshot, wsConnected, setPrivacyMode, switchScene } = usePresenceCompanion();
  const [showDiscordPreview, setShowDiscordPreview] = useState(false);

  const activeSceneType = snapshot?.scene?.activeSceneType ?? "auto";

  return (
    <div className="w-[380px] min-h-[560px] max-h-[660px] bg-background/95 backdrop-blur-md border border-surface-border rounded-2xl p-4 text-slate-100 flex flex-col justify-between shadow-2xl select-none font-sans overflow-hidden">
      {/* Top Profile / Greeting Widget */}
      <HeaderWidget
        wsConnected={wsConnected}
        workspaceId={snapshot?.desktop?.workspaceId}
        activeSceneType={activeSceneType}
        userName="Niruss"
      />

      {/* Horizontal Scene Selector Pills */}
      <div className="pt-2.5">
        <SceneSelector
          activeSceneType={activeSceneType}
          onSelectScene={(type) => switchScene(type)}
        />
      </div>

      {/* Main Dynamic Companion Surface */}
      <div className="py-2.5 space-y-2.5 flex-1 overflow-y-auto scrollbar-thin">
        {/* Toggle between Main Scene vs Discord Preview */}
        {showDiscordPreview ? (
          <DiscordPreview
            presence={snapshot?.presence}
            mediaArtUrl={snapshot?.media?.artUrl}
            discordConnected={wsConnected}
          />
        ) : (
          <>
            {/* If Media is playing or activeScene is music -> show MusicCard + FocusedLyricsView */}
            {snapshot?.media && (
              <div className="space-y-2.5">
                <MusicCard media={snapshot.media} />
                <FocusedLyricsView lyrics={snapshot.lyrics} media={snapshot.media} />
              </div>
            )}

            {/* Desktop Context Card (shown if no media or if activeScene is auto/focus) */}
            {(!snapshot?.media || activeSceneType === "focus" || activeSceneType === "auto") && (
              <DesktopCard
                desktop={snapshot?.desktop}
                presence={snapshot?.presence}
                privacyMode={snapshot?.privacyMode}
              />
            )}

            {/* Pomodoro Quick Mini Widget */}
            <div className="p-3 rounded-xl bg-surface/60 border border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Pomodoro Focus</div>
                  <div className="text-[10px] text-slate-400 font-mono">
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
          </>
        )}
      </div>

      {/* Footer Quick Controls */}
      <div className="pt-2.5 border-t border-surface-border/80 flex items-center justify-between text-xs text-slate-400">
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
            onClick={() => setShowDiscordPreview(!showDiscordPreview)}
            className={`p-1.5 rounded-lg border transition-colors ${
              showDiscordPreview
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                : "bg-slate-900 border-slate-800 hover:text-white"
            }`}
            title="Toggle Discord Rich Presence Preview"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono">v0.2.0</span>
          <button
            type="button"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-white transition-colors"
            title="Settings Drawer"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
