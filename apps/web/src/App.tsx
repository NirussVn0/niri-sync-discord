import { useState } from "react";
import { usePresenceState } from "./hooks/usePresenceState.js";
import { Header } from "./components/Header.js";
import { PresenceCard } from "./components/PresenceCard.js";
import { MediaCard } from "./components/MediaCard.js";
import { LyricsView } from "./components/LyricsView.js";
import { DiscordPreviewCard } from "./components/DiscordPreviewCard.js";
import { IntegrationsHealthRow } from "./components/IntegrationsHealthRow.js";
import { ManualOverrideModal } from "./components/ManualOverrideModal.js";
import { RulesView } from "./views/RulesView.js";
import { IntegrationsView } from "./views/IntegrationsView.js";
import { SettingsView } from "./views/SettingsView.js";
import { HistoryView } from "./views/HistoryView.js";
import { AlertCircle } from "lucide-react";

export function App() {
  const {
    snapshot,
    wsConnected,
    error,
    activeTab,
    setActiveTab,
    history,
    clearHistory,
    isPaused,
    togglePausePresence,
    setPrivacyMode,
    setOverride,
    clearOverride,
    getRules,
    updateRules,
    refresh,
  } = usePresenceState();

  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col font-sans">
      <Header
        wsConnected={wsConnected}
        privacyMode={snapshot?.privacyMode ?? false}
        isPaused={isPaused}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onTogglePrivacy={setPrivacyMode}
        onTogglePause={togglePausePresence}
        onRefresh={refresh}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Error / Disconnected Banner */}
        {error && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-center justify-between text-amber-300 text-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={refresh}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dynamic View Rendering based on activeTab */}
        {activeTab === "now" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Main 2-Column Now Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Active Presence & Media & Lyrics (Primary 7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <PresenceCard
                  presence={snapshot?.presence ?? null}
                  override={snapshot?.override ?? null}
                  desktop={snapshot?.desktop ?? null}
                  candidates={snapshot?.candidates ?? []}
                  onOpenOverrideModal={() => setIsOverrideModalOpen(true)}
                  onClearOverride={clearOverride}
                />

                {snapshot?.media && <MediaCard media={snapshot.media} />}

                {snapshot?.media && (
                  <LyricsView lyrics={snapshot.lyrics} media={snapshot.media} />
                )}
              </div>

              {/* Discord Preview (Secondary 5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <DiscordPreviewCard
                  presence={snapshot?.presence ?? null}
                  mediaArtUrl={snapshot?.media?.artUrl}
                />
              </div>
            </div>

            {/* Health & Status Overview Row */}
            <div className="pt-2">
              <IntegrationsHealthRow
                health={snapshot?.health ?? {}}
                onViewDetails={() => setActiveTab("integrations")}
              />
            </div>
          </div>
        )}

        {activeTab === "rules" && (
          <div className="animate-in fade-in duration-200">
            <RulesView getRules={getRules} updateRules={updateRules} />
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="animate-in fade-in duration-200">
            <IntegrationsView health={snapshot?.health ?? {}} onRefresh={refresh} />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="animate-in fade-in duration-200">
            <SettingsView />
          </div>
        )}

        {activeTab === "history" && (
          <div className="animate-in fade-in duration-200">
            <HistoryView history={history} onClearHistory={clearHistory} />
          </div>
        )}
      </main>

      <footer className="border-t border-surface-border py-6 text-center text-xs text-slate-500">
        <p>presenced · Local-First Linux Presence Engine for Niri + Discord</p>
      </footer>

      {/* Manual Override Modal */}
      <ManualOverrideModal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        onSubmit={setOverride}
      />
    </div>
  );
}

export default App;
