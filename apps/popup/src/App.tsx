import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SceneType } from "@presenced/contracts";
import { usePresenceCompanion } from "./hooks/usePresenceCompanion.js";
import { useAudioAnalysis, analysisToCssVars } from "./hooks/useAudioAnalysis.js";
import { HeaderWidget } from "./components/HeaderWidget.js";
import { NaviBar } from "./components/NaviBar.js";
import { DesktopCard } from "./components/DesktopCard.js";
import { MusicCard } from "./components/MusicCard.js";
import { FocusedLyricsView } from "./components/FocusedLyricsView.js";
import { DiscordPreview } from "./components/DiscordPreview.js";
import { PomodoroCard } from "./components/PomodoroCard.js";
import { CountdownCard } from "./components/CountdownCard.js";
import { SystemCard } from "./components/SystemCard.js";
import { SettingsDrawer } from "./components/SettingsDrawer.js";
import { WindowControls } from "./components/WindowControls.js";
import { Shield, Settings } from "lucide-react";
import { motion as m } from "framer-motion";
import {
  type ScreenId, getScreenMeta,
} from "./lib/scene-registry.js";
import {
  screenVariants, cardReveal,
  springNiri, springSnap,
} from "./lib/animations.js";

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

  const [activeScreen, setActiveScreen] = useState<ScreenId>("auto");
  const [direction, setDirection] = useState(1);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // Audio analysis for music-reactive animations
  const isMusicPlaying = snapshot?.media?.playback === "playing";
  const audioAnalysis = useAudioAnalysis(isMusicPlaying);
  const audioCssVars = analysisToCssVars(audioAnalysis);

  // Sync with daemon scene state
  const daemonScene = snapshot?.scene?.activeSceneType ?? "auto";
  const activeSceneType = (activeScreen === "discord" ? daemonScene : activeScreen) as SceneType;

  const handleNavigate = useCallback((screen: ScreenId) => {
    setActiveScreen((prev) => {
      const prevIdx = ["auto", "music", "focus", "pomodoro", "countdown", "system", "privacy", "discord"].indexOf(prev);
      const nextIdx = ["auto", "music", "focus", "pomodoro", "countdown", "system", "privacy", "discord"].indexOf(screen);
      setDirection(nextIdx > prevIdx ? 1 : -1);
      return screen;
    });
    // Also switch daemon scene if it's a scene type
    if (screen !== "discord") {
      switchScene(screen as SceneType);
    }
  }, [switchScene]);

  const handleSelectScene = useCallback((sceneType: SceneType) => {
    setActiveScreen(sceneType);
    setDirection(1);
    switchScene(sceneType);
  }, [switchScene]);

  const sceneMeta = getScreenMeta(activeScreen);

  // ── Render screen content ──────────────────────────────────────────
  const renderScreen = () => {
    if (activeScreen === "discord") {
      return (
        <DiscordPreview
          presence={snapshot?.presence}
          mediaArtUrl={snapshot?.media?.artUrl}
          discordConnected={wsConnected}
        />
      );
    }

    switch (activeScreen) {
      case "pomodoro":
        return (
          <PomodoroCard
            pomodoro={snapshot?.pomodoro}
            onStart={(task) => startPomodoro(task)}
            onPause={pausePomodoro}
            onResume={resumePomodoro}
            onStop={stopPomodoro}
            onSkip={skipPomodoro}
          />
        );

      case "countdown":
        return <CountdownCard countdown={snapshot?.countdown} />;

      case "system":
        return <SystemCard system={snapshot?.system} />;

      case "privacy":
        return (
          <div className="p-4 rounded-niri-lg glass-float text-center space-y-3 py-8 select-none">
            <Shield className="w-8 h-8 text-status-degraded mx-auto" />
            <div className="text-sm font-bold text-text-primary">Privacy Mode Active</div>
            <p className="text-xs text-text-secondary">
              Window titles and media metadata are masked with generic activity descriptions.
            </p>
            <m.button
              type="button"
              onClick={() => {
                setPrivacyMode(false);
                handleSelectScene("auto");
              }}
              className="px-3 py-1.5 rounded-niri bg-status-degraded/10 hover:bg-status-degraded/20 text-status-degraded border border-status-degraded/30 text-xs font-semibold transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={springSnap}
            >
              Disable Privacy Mode
            </m.button>
          </div>
        );

      case "music":
        return (
          <div className="space-y-2.5">
            <MusicCard
              media={snapshot?.media}
              onPlayPause={playPauseMedia}
              onNext={nextMedia}
              onPrevious={previousMedia}
            />
            <FocusedLyricsView lyrics={snapshot?.lyrics} media={snapshot?.media} />
          </div>
        );

      case "focus":
        return (
          <DesktopCard
            desktop={snapshot?.desktop}
            presence={snapshot?.presence}
            privacyMode={snapshot?.privacyMode}
          />
        );

      case "auto":
      default:
        return snapshot?.media ? (
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
        );
    }
  };

  return (
    <div
      className={`relative w-[380px] min-h-[560px] max-h-[660px] bg-background glass-strong rounded-niri-xl p-4 text-text-primary flex flex-col justify-between shadow-glass-lg select-none font-sans overflow-hidden`}
      data-tauri-drag-region
      style={audioCssVars as React.CSSProperties}
    >
      {/* ── Ambient glow overlay (scene-colored + audio-reactive) ──────── */}
      <div
        className="absolute inset-0 pointer-events-none rounded-niri-xl transition-all duration-300"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${sceneMeta.glowColor} 0%, transparent 70%)`,
          opacity: 0.2 + audioAnalysis.volume * 0.3,
          transform: `scale(${1 + audioAnalysis.bass * 0.02})`,
        }}
      />

      {/* ── Scan line effect (subtle sci-fi) ──────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none scan-line opacity-20 rounded-niri-xl overflow-hidden" />

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Top: Window Controls + Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <HeaderWidget
              wsConnected={wsConnected}
              workspaceId={snapshot?.desktop?.workspaceId}
              activeSceneType={activeSceneType}
              userName="Niruss"
            />
          </div>
          <WindowControls />
        </div>

        {/* NaviBar — sci-fi screen navigator */}
        <div className="pt-2.5">
          <NaviBar activeScreen={activeScreen} onNavigate={handleNavigate} />
        </div>

        {/* Main Dynamic Screen Surface with animated transitions */}
        <div className="py-2.5 flex-1 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeScreen}
              custom={direction}
              variants={screenVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={springNiri}
              className="space-y-2.5"
            >
              {/* Mini Pomodoro quick bar (non-pomodoro scenes) */}
              {activeScreen !== "pomodoro" && activeScreen !== "discord" && (
                <m.div
                  variants={cardReveal}
                  initial="hidden"
                  animate="visible"
                  custom={0}
                  className="p-3 rounded-niri-lg glass-float flex items-center justify-between"
                >
                  <div>
                    <div className="text-2xs font-semibold text-text-primary">Pomodoro Focus</div>
                    <div className="text-2xs text-text-muted font-mono">
                      {snapshot?.pomodoro?.status === "running"
                        ? `${Math.floor(snapshot.pomodoro.remainingSeconds / 60)}:${String(
                            snapshot.pomodoro.remainingSeconds % 60
                          ).padStart(2, "0")} · Session ${snapshot.pomodoro.currentSession}/${snapshot.pomodoro.totalSessions}`
                        : "25:00 · Ready to start"}
                    </div>
                  </div>
                  <m.button
                    type="button"
                    onClick={() =>
                      snapshot?.pomodoro?.status === "running"
                        ? pausePomodoro()
                        : startPomodoro()
                    }
                    className="px-2.5 py-1 rounded-niri bg-status-connected/10 hover:bg-status-connected/20 text-status-connected border border-status-connected/30 text-2xs font-medium transition-colors"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    transition={springSnap}
                  >
                    {snapshot?.pomodoro?.status === "running" ? "Pause" : "Start"}
                  </m.button>
                </m.div>
              )}

              {/* Screen content */}
              <motion.div
                variants={cardReveal}
                initial="hidden"
                animate="visible"
                custom={1}
              >
                {renderScreen()}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Quick Controls */}
        <div className="pt-2.5 border-t border-border-subtle flex items-center justify-between text-2xs text-text-muted">
          <div className="flex items-center gap-2">
            <m.button
              type="button"
              onClick={() => {
                const nextMode = !snapshot?.privacyMode;
                setPrivacyMode(nextMode);
                if (nextMode) handleSelectScene("privacy");
                else if (activeScreen === "privacy") handleSelectScene("auto");
              }}
              className={`p-2 rounded-niri border transition-colors ${
                snapshot?.privacyMode
                  ? "bg-status-degraded/20 text-status-degraded border-status-degraded/40"
                  : "glass-surface hover:text-text-primary"
              }`}
              title={snapshot?.privacyMode ? "Privacy Mode Active" : "Enable Privacy Mode"}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={springSnap}
            >
              <Shield className="w-4 h-4" />
            </m.button>
            <m.button
              type="button"
              onClick={() => handleNavigate("discord")}
              className={`p-2 rounded-niri border transition-colors ${
                activeScreen === "discord"
                  ? "bg-accent-primary/20 text-accent-primary border-accent-primary/40"
                  : "glass-surface hover:text-text-primary"
              }`}
              title="Discord Rich Presence Preview"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={springSnap}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
            </m.button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-2xs text-text-ghost font-mono">v0.3.0</span>
            <m.button
              type="button"
              onClick={() => setShowSettingsDrawer(true)}
              className="p-2 rounded-niri glass-surface hover:text-text-primary transition-colors"
              title="Settings"
              whileHover={{ scale: 1.08, rotate: 30 }}
              whileTap={{ scale: 0.92 }}
              transition={springSnap}
            >
              <Settings className="w-4 h-4" />
            </m.button>
          </div>
        </div>

        {/* Settings Drawer */}
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
    </div>
  );
}

export default App;
