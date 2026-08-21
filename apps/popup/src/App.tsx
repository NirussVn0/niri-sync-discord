import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePresenceCompanion } from "./hooks/usePresenceCompanion.js";
import { useWidgetConfig } from "./hooks/useWidgetConfig.js";
import { PremiumClock } from "./widgets/PremiumClock.js";
import { MusicWidget } from "./widgets/MusicWidget.js";
import { RvcWidget } from "./widgets/RvcWidget.js";
import { PomodoroWidget } from "./widgets/PomodoroWidget.js";
import { CountdownWidget } from "./widgets/CountdownWidget.js";
import { LyricsWidget } from "./widgets/LyricsWidget.js";
import { SystemWidget } from "./widgets/SystemWidget.js";
import { ConnectionWidget } from "./widgets/ConnectionWidget.js";
import { WindowControls } from "./components/WindowControls.js";
import { TutorialOverlay } from "./components/TutorialOverlay.js";
import { SidePanel } from "./components/SidePanel.js";
import { EditHandles } from "./components/EditHandles.js";
import { SettingsPanel } from "./settings/SettingsPanel.js";
import { springNiri, springSnap } from "./lib/animations.js";
import { Settings, Pencil } from "lucide-react";

export function App() {
  const {
    snapshot, wsConnected,
    setPrivacyMode,
    startPomodoro, pausePomodoro, resumePomodoro, stopPomodoro, skipPomodoro,
    playPauseMedia, nextMedia, previousMedia,
    addCountdown, deleteCountdown, toggleCountdown,
    getDiscordConfig, saveDiscordConfig, getRvcConfig, saveRvcConfig,
  } = usePresenceCompanion();

  const { visibility, isExpanded, editMode, toggleSettings, collapseSettings, toggleEditMode } = useWidgetConfig();

  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  // Keyboard: < > for side panels, Escape for close
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && !isExpanded) setLeftOpen((p) => !p);
      if (e.key === "ArrowRight" && !isExpanded) setRightOpen((p) => !p);
      if (e.key === "Escape") {
        if (isExpanded) collapseSettings();
        if (editMode) toggleEditMode();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isExpanded, editMode, collapseSettings, toggleEditMode]);

  const isMusicPlaying = snapshot?.media?.playback === "playing";

  return (
    <>
      <TutorialOverlay />

      <div className="flex h-screen w-screen p-2 gap-2 select-none font-sans overflow-hidden">
        {/* ═══ Left Side Panel ═══ */}
        <SidePanel side="left" isOpen={leftOpen} onToggle={() => setLeftOpen((p) => !p)}>
          {visibility.system && <SystemWidget system={snapshot?.system} />}
          {visibility.connection && <ConnectionWidget health={snapshot?.health} />}
          {visibility.countdown && <CountdownWidget countdown={snapshot?.countdown} />}
        </SidePanel>

        {/* ═══ Main Widget ═══ */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Header: Clock + Controls */}
          <motion.div className="glass-strong rounded-niri-xl p-3 flex items-center justify-between" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={springNiri}>
            <PremiumClock userName="Niruss" wsConnected={wsConnected} />
            <div className="flex items-center gap-1">
              <motion.button type="button" onClick={toggleEditMode} className={`p-1.5 rounded-niri transition-colors ${editMode ? "bg-accent-primary/20 text-accent-primary" : "glass-surface text-text-secondary hover:text-text-primary"}`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={springSnap} title="Edit widgets">
                <Pencil className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button type="button" onClick={toggleSettings} className={`p-1.5 rounded-niri transition-colors ${isExpanded ? "bg-accent-primary/20 text-accent-primary" : "glass-surface text-text-secondary hover:text-text-primary"}`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={springSnap}>
                <Settings className="w-3.5 h-3.5" />
              </motion.button>
              <WindowControls />
            </div>
          </motion.div>

          {/* Content area */}
          <div className="flex-1 min-h-0">
            <AnimatePresence mode="wait">
              {isExpanded ? (
                <motion.div key="settings" className="h-full glass-strong rounded-niri-xl p-3 overflow-y-auto scrollbar-thin" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={springNiri}>
                  <SettingsPanel visibility={visibility} toggleWidget={() => {}} onClose={collapseSettings} snapshot={snapshot} onSetPrivacyMode={setPrivacyMode} onAddCountdown={addCountdown} onDeleteCountdown={deleteCountdown} onToggleCountdown={toggleCountdown} getDiscordConfig={getDiscordConfig} saveDiscordConfig={saveDiscordConfig} getRvcConfig={getRvcConfig} saveRvcConfig={saveRvcConfig} />
                </motion.div>
              ) : (
                <motion.div key="main" className="h-full grid gap-2" style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto auto" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={springNiri}>
                  {/* Row 1: Music + RVC */}
                  <div className="relative">
                    {visibility.music && <MusicWidget media={snapshot?.media} onPlayPause={playPauseMedia} onNext={nextMedia} onPrevious={previousMedia} />}
                    {editMode && <EditHandles />}
                  </div>
                  <div className="relative">
                    <RvcWidget connected={wsConnected} status={snapshot?.presence?.title ?? undefined} clientId="15403406" displayMode={isMusicPlaying ? "music" : "auto"} />
                    {editMode && <EditHandles />}
                  </div>

                  {/* Row 2: Primary widget (user's choice) */}
                  <div className="col-span-2 relative">
                    {visibility.lyrics && <LyricsWidget lyrics={snapshot?.lyrics} media={snapshot?.media} />}
                    {visibility.pomodoro && !visibility.lyrics && <PomodoroWidget pomodoro={snapshot?.pomodoro} onStart={(t) => startPomodoro(t)} onPause={pausePomodoro} onResume={resumePomodoro} onStop={stopPomodoro} onSkip={skipPomodoro} />}
                    {visibility.countdown && !visibility.lyrics && !visibility.pomodoro && <CountdownWidget countdown={snapshot?.countdown} />}
                    {editMode && <EditHandles />}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status bar */}
          <div className="flex-shrink-0 text-center text-2xs text-text-muted font-mono">
            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${wsConnected ? "bg-status-connected" : "bg-status-degraded"}`} />
            presenced v0.6.0
          </div>
        </div>

        {/* ═══ Right Side Panel ═══ */}
        <SidePanel side="right" isOpen={rightOpen} onToggle={() => setRightOpen((p) => !p)}>
          {visibility.lyrics && <LyricsWidget lyrics={snapshot?.lyrics} media={snapshot?.media} />}
          {visibility.pomodoro && <PomodoroWidget pomodoro={snapshot?.pomodoro} onStart={(t) => startPomodoro(t)} onPause={pausePomodoro} onResume={resumePomodoro} onStop={stopPomodoro} onSkip={skipPomodoro} />}
        </SidePanel>
      </div>
    </>
  );
}

export default App;
