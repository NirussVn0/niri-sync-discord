import { useState } from "react";
import { SceneType } from "@presenced/contracts";
import { usePresenceCompanion } from "./hooks/usePresenceCompanion.js";
import { HeaderWidget } from "./components/HeaderWidget.js";
import { SceneSelector } from "./components/SceneSelector.js";
import { DesktopCard } from "./components/DesktopCard.js";
import { MusicCard } from "./components/MusicCard.js";
import { FocusedLyricsView } from "./components/FocusedLyricsView.js";
import { DiscordPreview } from "./components/DiscordPreview.js";
import { PomodoroCard } from "./components/PomodoroCard.js";
import { CountdownCard } from "./components/CountdownCard.js";
import { SystemCard } from "./components/SystemCard.js";
import { SettingsDrawer } from "./components/SettingsDrawer.js";
import { Shield, Settings, MessageSquare } from "lucide-react";

export function App() {
  const {
    snapshot,
    wsConnected,
    setPrivacyMode,
    switchScene,
    startPomodoro,
    pausePomodoro,
    resumePomodoro,
    stopPomodoro,
    skipPomodoro,
    playPauseMedia,
    nextMedia,
    previousMedia,
    addCountdown,
    deleteCountdown,
    toggleCountdown,
  } = usePresenceCompanion();

  const [localScene, setLocalScene] = useState<SceneType | null>(null);
  const [showDiscordPreview, setShowDiscordPreview] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  const activeSceneType = localScene ?? snapshot?.scene?.activeSceneType ?? "auto";

  const handleSelectScene = (sceneType: SceneType) => {
    setLocalScene(sceneType);
    switchScene(sceneType);
  };

  return (
    <div className="relative w-[380px] min-h-[560px] max-h-[660px] bg-background/95 backdrop-blur-md border border-surface-border rounded-2xl p-4 text-slate-100 flex flex-col justify-between shadow-2xl select-none font-sans overflow-hidden">
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
          onSelectScene={handleSelectScene}
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
            {/* 1. Pomodoro Scene */}
            {activeSceneType === "pomodoro" && (
              <PomodoroCard
                pomodoro={snapshot?.pomodoro}
                onStart={(task) => startPomodoro(task)}
                onPause={pausePomodoro}
                onResume={resumePomodoro}
                onStop={stopPomodoro}
                onSkip={skipPomodoro}
              />
            )}

            {/* 2. Milestone Countdown Scene */}
            {activeSceneType === "countdown" && (
              <CountdownCard countdown={snapshot?.countdown} />
            )}

            {/* 3. Linux System Telemetry Scene */}
            {activeSceneType === "system" && (
              <SystemCard system={snapshot?.system} />
            )}

            {/* 4. Privacy Mode Scene */}
            {activeSceneType === "privacy" && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2 py-8 select-none">
                <Shield className="w-8 h-8 text-amber-400 mx-auto" />
                <div className="text-sm font-bold text-amber-300">Privacy Mode Active</div>
                <p className="text-xs text-slate-400">
                  Window titles and media metadata are masked with generic activity descriptions.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPrivacyMode(false);
                    handleSelectScene("auto");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-xs font-semibold transition-colors"
                >
                  Disable Privacy Mode
                </button>
              </div>
            )}

            {/* 5. Dedicated Music Scene */}
            {activeSceneType === "music" && (
              <div className="space-y-2.5">
                <MusicCard
                  media={snapshot?.media}
                  onPlayPause={playPauseMedia}
                  onNext={nextMedia}
                  onPrevious={previousMedia}
                />
                <FocusedLyricsView lyrics={snapshot?.lyrics} media={snapshot?.media} />
              </div>
            )}

            {/* 6. Dedicated Focus Desktop Scene */}
            {activeSceneType === "focus" && (
              <DesktopCard
                desktop={snapshot?.desktop}
                presence={snapshot?.presence}
                privacyMode={snapshot?.privacyMode}
              />
            )}

            {/* 7. Auto Context Scene */}
            {activeSceneType === "auto" && (
              <>
                {snapshot?.media ? (
                  <div className="space-y-2.5">
                    <MusicCard
                      media={snapshot.media}
                      onPlayPause={playPauseMedia}
                      onNext={nextMedia}
                      onPrevious={previousMedia}
                    />
                    <FocusedLyricsView lyrics={snapshot.lyrics} media={snapshot.media} />
                  </div>
                ) : (
                  <DesktopCard
                    desktop={snapshot?.desktop}
                    presence={snapshot?.presence}
                    privacyMode={snapshot?.privacyMode}
                  />
                )}
              </>
            )}

            {/* Mini Pomodoro quick bar when not in dedicated pomodoro scene */}
            {activeSceneType !== "pomodoro" && (
              <div className="p-3 rounded-xl bg-surface/60 border border-surface-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Pomodoro Focus</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {snapshot?.pomodoro?.status === "running"
                      ? `${Math.floor(snapshot.pomodoro.remainingSeconds / 60)}:${String(
                          snapshot.pomodoro.remainingSeconds % 60
                        ).padStart(2, "0")} · Session ${snapshot.pomodoro.currentSession}/${
                          snapshot.pomodoro.totalSessions
                        }`
                      : "25:00 · Ready to start"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    snapshot?.pomodoro?.status === "running"
                      ? pausePomodoro()
                      : startPomodoro()
                  }
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors"
                >
                  {snapshot?.pomodoro?.status === "running" ? "Pause" : "Start"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Quick Controls */}
      <div className="pt-2.5 border-t border-surface-border/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const nextMode = !snapshot?.privacyMode;
              setPrivacyMode(nextMode);
              if (nextMode) handleSelectScene("privacy");
              else if (activeSceneType === "privacy") handleSelectScene("auto");
            }}
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
            onClick={() => setShowSettingsDrawer(true)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-white transition-colors"
            title="Settings Drawer"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Slide-Over Settings Drawer */}
      <SettingsDrawer
        isOpen={showSettingsDrawer}
        onClose={() => setShowSettingsDrawer(false)}
        snapshot={snapshot}
        onSetPrivacyMode={(enabled) => setPrivacyMode(enabled)}
        onAddCountdown={(item) => addCountdown(item)}
        onDeleteCountdown={(id) => deleteCountdown(id)}
        onToggleCountdown={(id) => toggleCountdown(id)}
      />
    </div>
  );
}

export default App;
