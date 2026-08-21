import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePresenceCompanion } from "./hooks/usePresenceCompanion.js";
import { useAudioAnalysis } from "./hooks/useAudioAnalysis.js";
import { useWidgetConfig } from "./hooks/useWidgetConfig.js";
import { PremiumClock } from "./widgets/PremiumClock.js";
import { MusicWidget } from "./widgets/MusicWidget.js";
import { RpcWidget } from "./widgets/RpcWidget.js";
import { PomodoroWidget } from "./widgets/PomodoroWidget.js";
import { CountdownWidget } from "./widgets/CountdownWidget.js";
import { LyricsWidget } from "./widgets/LyricsWidget.js";
import { SystemWidget } from "./widgets/SystemWidget.js";
import { ConnectionWidget } from "./widgets/ConnectionWidget.js";
import { WindowControls } from "./components/WindowControls.js";
import { TutorialOverlay } from "./components/TutorialOverlay.js";
import { SettingsPanel } from "./settings/SettingsPanel.js";
import { springNiri, springSnap } from "./lib/animations.js";
import { getVisibleWidgets } from "./lib/widget-registry.js";
import { Settings, Pencil, X } from "lucide-react";

export function App() {
  const {
    snapshot, wsConnected,
    setPrivacyMode,
    startPomodoro, pausePomodoro, resumePomodoro, stopPomodoro, skipPomodoro,
    playPauseMedia, nextMedia, previousMedia,
    addCountdown, deleteCountdown, toggleCountdown,
    getDiscordConfig, saveDiscordConfig, getRvcConfig, saveRvcConfig,
  } = usePresenceCompanion();

  const { visibility, isExpanded, editMode, toggleWidget, toggleSettings, collapseSettings, toggleEditMode } = useWidgetConfig();
  const isMusicPlaying = snapshot?.media?.playback === "playing";
  useAudioAnalysis(isMusicPlaying);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isExpanded) collapseSettings();
        if (editMode) toggleEditMode();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isExpanded, editMode, collapseSettings, toggleEditMode]);

  const visibleWidgets = getVisibleWidgets(visibility);

  // Split into layout zones
  const hasClock = visibility.header;
  const hasMusic = visibility.music;
  const hasRpc = visibility.rpc;
  const bottomWidgets = visibleWidgets.filter(
    (w) => !["header", "music", "rpc"].includes(w.id)
  );

  const renderWidget = (id: string) => {
    switch (id) {
      case "music": return <MusicWidget media={snapshot?.media} onPlayPause={playPauseMedia} onNext={nextMedia} onPrevious={previousMedia} />;
      case "rpc": return <RpcWidget connected={wsConnected} status={snapshot?.presence?.title ?? undefined} />;
      case "pomodoro": return <PomodoroWidget pomodoro={snapshot?.pomodoro} onStart={(t) => startPomodoro(t)} onPause={pausePomodoro} onResume={resumePomodoro} onStop={stopPomodoro} onSkip={skipPomodoro} />;
      case "countdown": return <CountdownWidget countdown={snapshot?.countdown} />;
      case "lyrics": return <LyricsWidget lyrics={snapshot?.lyrics} media={snapshot?.media} />;
      case "system": return <SystemWidget system={snapshot?.system} />;
      case "connection": return <ConnectionWidget health={snapshot?.health} />;
      default: return null;
    }
  };

  return (
    <>
      <TutorialOverlay />

      <div className="flex flex-col h-screen w-screen p-3 gap-2 select-none font-sans overflow-hidden">
        {/* ═══ Row 1: Clock (full width, centered) ═══ */}
        {hasClock && (
          <div className="flex-shrink-0">
            <PremiumClock userName="Niruss" wsConnected={wsConnected} />
          </div>
        )}

        {/* ═══ Row 2: Controls bar ═══ */}
        <div className="flex-shrink-0 flex items-center justify-between px-1">
          <div className="text-2xs text-text-muted font-mono">presenced v0.5.0</div>
          <div className="flex items-center gap-1">
            <motion.button
              type="button"
              onClick={toggleEditMode}
              className={`p-1.5 rounded-niri transition-colors ${editMode ? "bg-accent-primary/20 text-accent-primary" : "glass-surface text-text-secondary hover:text-text-primary"}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={springSnap}
              title="Edit widgets"
            >
              <Pencil className="w-3 h-3" />
            </motion.button>
            <motion.button
              type="button"
              onClick={toggleSettings}
              className={`p-1.5 rounded-niri transition-colors ${isExpanded ? "bg-accent-primary/20 text-accent-primary" : "glass-surface text-text-secondary hover:text-text-primary"}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={springSnap}
            >
              <Settings className="w-3.5 h-3.5" />
            </motion.button>
            <WindowControls />
          </div>
        </div>

        {/* ═══ Row 3: Main content ═══ */}
        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div key="settings" className="h-full glass-strong rounded-niri-xl p-3 overflow-y-auto scrollbar-thin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={springNiri}>
                <SettingsPanel visibility={visibility} toggleWidget={toggleWidget} onClose={collapseSettings} snapshot={snapshot} onSetPrivacyMode={setPrivacyMode} onAddCountdown={addCountdown} onDeleteCountdown={deleteCountdown} onToggleCountdown={toggleCountdown} getDiscordConfig={getDiscordConfig} saveDiscordConfig={saveDiscordConfig} getRvcConfig={getRvcConfig} saveRvcConfig={saveRvcConfig} />
              </motion.div>
            ) : (
              <motion.div key="dashboard" className="h-full grid gap-2" style={{ gridTemplateColumns: hasMusic && hasRpc ? "1fr 1fr" : "1fr", gridTemplateRows: "auto 1fr" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={springNiri}>
                {/* Top row: Music + RPC side by side */}
                {hasMusic && (
                  <div className={`${hasRpc ? "" : "col-span-2"}`}>
                    {renderWidget("music")}
                    {editMode && (
                      <button type="button" onClick={() => toggleWidget("music")} className="mt-1 text-2xs text-status-error hover:text-status-error/80">
                        Hide
                      </button>
                    )}
                  </div>
                )}
                {hasRpc && (
                  <div>
                    {renderWidget("rpc")}
                    {editMode && (
                      <button type="button" onClick={() => toggleWidget("rpc")} className="mt-1 text-2xs text-status-error hover:text-status-error/80">
                        Hide
                      </button>
                    )}
                  </div>
                )}

                {/* Bottom: remaining widgets in grid */}
                {bottomWidgets.length > 0 && (
                  <div className="col-span-2 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(bottomWidgets.length, 3)}, 1fr)` }}>
                    {bottomWidgets.map((w) => (
                      <div key={w.id} className="relative">
                        {renderWidget(w.id)}
                        {editMode && (
                          <button type="button" onClick={() => toggleWidget(w.id)} className="absolute top-1 right-1 p-0.5 rounded bg-status-error/20 text-status-error">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

export default App;
