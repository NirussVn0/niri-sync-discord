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
import { Settings } from "lucide-react";

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

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape" && isExpanded) collapseSettings(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isExpanded, collapseSettings]);

  const visibleWidgets = getVisibleWidgets(visibility);
  const topWidgets = visibleWidgets.filter((w) => ["music", "rpc"].includes(w.id));
  const bottomWidgets = visibleWidgets.filter((w) => !["music", "rpc"].includes(w.id));

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
    <div className="flex flex-col gap-2 select-none font-sans" style={{ width: isExpanded ? 680 : undefined } as any}>
      {/* Widget 1: Clock + Controls */}
      <motion.div className="glass-strong rounded-niri-xl p-3 flex items-center justify-between" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={springNiri}>
        <HeaderWidget wsConnected={wsConnected} activeSceneType={snapshot?.scene?.activeSceneType ?? "auto"} userName="Niruss" />
        <div className="flex items-center gap-1">
          <motion.button type="button" onClick={toggleSettings} className={`p-1.5 rounded-niri transition-colors ${isExpanded ? "bg-accent-primary/20 text-accent-primary" : "glass-surface text-text-secondary hover:text-text-primary"}`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={springSnap}>
            <Settings className="w-3.5 h-3.5" />
          </motion.button>
          <WindowControls />
        </div>
      </motion.div>

      {/* Widget 2: Dashboard content */}
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div key="settings" className="glass-strong rounded-niri-xl p-3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={springNiri}>
            <SettingsPanel visibility={visibility} toggleWidget={toggleWidget} onClose={collapseSettings} snapshot={snapshot} onSetPrivacyMode={setPrivacyMode} onAddCountdown={addCountdown} onDeleteCountdown={deleteCountdown} onToggleCountdown={toggleCountdown} getDiscordConfig={getDiscordConfig} saveDiscordConfig={saveDiscordConfig} getRvcConfig={getRvcConfig} saveRvcConfig={saveRvcConfig} />
          </motion.div>
        ) : (
          <motion.div key="dashboard" className="glass-strong rounded-niri-xl p-3 space-y-2 max-h-[480px] overflow-y-auto scrollbar-thin relative" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={springNiri} style={{ background: "rgba(12,15,24,0.35)", backdropFilter: "blur(24px)" }}>
            <div className="absolute inset-0 pointer-events-none rounded-niri-xl" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,138,255,0.15) 0%, transparent 70%)", opacity: 0.2 + audioAnalysis.volume * 0.3 }} />
            {topWidgets.length > 0 && (
              <div className="grid grid-cols-2 gap-2 relative">
                {topWidgets.map((w) => <div key={w.id}>{renderWidget(w.id)}</div>)}
              </div>
            )}
            {bottomWidgets.map((w) => <div key={w.id} className="relative">{renderWidget(w.id)}</div>)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status bar */}
      <div className="text-center text-2xs text-text-muted font-mono">
        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${wsConnected ? "bg-status-connected" : "bg-status-degraded"}`} />
        {wsConnected ? "presenced v0.4.1" : "Offline"}
      </div>
    </div>
  );
}

export default App;
