import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePresenceCompanion } from "./hooks/usePresenceCompanion.js";
import { useAudioAnalysis } from "./hooks/useAudioAnalysis.js";
import { useWidgetConfig } from "./hooks/useWidgetConfig.js";
import { HeaderWidget } from "./widgets/HeaderWidget.js";
import { MusicWidget } from "./widgets/MusicWidget.js";
import { RpcWidget } from "./widgets/RpcWidget.js";
import { PomodoroWidget } from "./widgets/PomodoroWidget.js";
import { CountdownWidget } from "./widgets/CountdownWidget.js";
import { LyricsWidget } from "./widgets/LyricsWidget.js";
import { SystemWidget } from "./widgets/SystemWidget.js";
import { ConnectionWidget } from "./widgets/ConnectionWidget.js";
import { WindowControls } from "./components/WindowControls.js";
import { SettingsPanel } from "./settings/SettingsPanel.js";
import { springNiri, springSnap } from "./lib/animations.js";
import { getVisibleWidgets } from "./lib/widget-registry.js";
import { Settings, ChevronLeft } from "lucide-react";

declare global {
  interface Window {
    __TAURI__?: {
      core: {
        invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
      };
    };
  }
}

export function App() {
  const {
    snapshot, wsConnected,
    setPrivacyMode,
    startPomodoro, pausePomodoro, resumePomodoro, stopPomodoro, skipPomodoro,
    playPauseMedia, nextMedia, previousMedia,
    addCountdown, deleteCountdown, toggleCountdown,
    getDiscordConfig, saveDiscordConfig, getRvcConfig, saveRvcConfig,
  } = usePresenceCompanion();

  const { visibility, isExpanded, toggleWidget, toggleSettings, collapseSettings } = useWidgetConfig();

  const isMusicPlaying = snapshot?.media?.playback === "playing";
  const audioAnalysis = useAudioAnalysis(isMusicPlaying);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        collapseSettings();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isExpanded, collapseSettings]);

  const visibleWidgets = getVisibleWidgets(visibility);

  // Determine window size based on mode
  const windowWidth = isExpanded ? 640 : 340;

  return (
    <motion.div
      className="relative min-h-[480px] max-h-[660px] bg-background glass-strong rounded-niri-xl text-text-primary flex flex-col select-none font-sans overflow-hidden"
      data-tauri-drag-region
      animate={{ width: windowWidth }}
      transition={springNiri}
      style={{
        "--audio-bass": String(audioAnalysis.bass),
        "--audio-volume": String(audioAnalysis.volume),
      } as any}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none rounded-niri-xl transition-opacity duration-300"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(124,138,255,0.15) 0%, transparent 70%)",
          opacity: 0.2 + audioAnalysis.volume * 0.3,
        }}
      />

      <div className="relative z-10 flex flex-col h-full p-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
          <HeaderWidget
            wsConnected={wsConnected}
            activeSceneType={snapshot?.scene?.activeSceneType ?? "auto"}
            userName="Niruss"
          />
          <div className="flex items-center gap-1">
            {isExpanded && (
              <motion.button
                type="button"
                onClick={collapseSettings}
                className="p-1.5 rounded-niri glass-surface text-text-secondary hover:text-text-primary transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={springSnap}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </motion.button>
            )}
            <motion.button
              type="button"
              onClick={toggleSettings}
              className={`p-1.5 rounded-niri transition-colors ${
                isExpanded
                  ? "bg-accent-primary/20 text-accent-primary"
                  : "glass-surface text-text-secondary hover:text-text-primary"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={springSnap}
            >
              <Settings className="w-3.5 h-3.5" />
            </motion.button>
            <WindowControls />
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={springNiri}
              >
                <SettingsPanel
                  visibility={visibility}
                  toggleWidget={toggleWidget}
                  onClose={collapseSettings}
                  snapshot={snapshot}
                  onSetPrivacyMode={setPrivacyMode}
                  onAddCountdown={addCountdown}
                  onDeleteCountdown={deleteCountdown}
                  onToggleCountdown={toggleCountdown}
                  getDiscordConfig={getDiscordConfig}
                  saveDiscordConfig={saveDiscordConfig}
                  getRvcConfig={getRvcConfig}
                  saveRvcConfig={saveRvcConfig}
                />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={springNiri}
                className="space-y-2"
              >
                {visibleWidgets.map((widget) => {
                  switch (widget.id) {
                    case "music":
                      return (
                        <MusicWidget
                          key={widget.id}
                          media={snapshot?.media}
                          onPlayPause={playPauseMedia}
                          onNext={nextMedia}
                          onPrevious={previousMedia}
                        />
                      );
                    case "rpc":
                      return (
                        <RpcWidget
                          key={widget.id}
                          connected={wsConnected}
                          status={snapshot?.presence?.title ?? undefined}
                        />
                      );
                    case "pomodoro":
                      return (
                        <PomodoroWidget
                          key={widget.id}
                          pomodoro={snapshot?.pomodoro}
                          onStart={(t) => startPomodoro(t)}
                          onPause={pausePomodoro}
                          onResume={resumePomodoro}
                          onStop={stopPomodoro}
                          onSkip={skipPomodoro}
                        />
                      );
                    case "countdown":
                      return <CountdownWidget key={widget.id} countdown={snapshot?.countdown} />;
                    case "lyrics":
                      return (
                        <LyricsWidget
                          key={widget.id}
                          lyrics={snapshot?.lyrics}
                          media={snapshot?.media}
                        />
                      );
                    case "system":
                      return <SystemWidget key={widget.id} system={snapshot?.system} />;
                    case "connection":
                      return <ConnectionWidget key={widget.id} health={snapshot?.health} />;
                    default:
                      return null;
                  }
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status bar */}
        <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-2xs text-text-muted">
          <span className="font-mono">presenced v0.4.0</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                wsConnected ? "bg-status-connected" : "bg-status-degraded"
              }`}
            />
            <span>{wsConnected ? "Daemon" : "Offline"}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default App;
