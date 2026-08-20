import { IntegrationHealth } from "@presenced/contracts";
import { STATUS_CONFIG } from "../components/IntegrationsHealthRow.js";
import { Layers, Disc3, MessageSquare, Mic2, RefreshCw, AlertTriangle } from "lucide-react";

interface IntegrationsViewProps {
  health: Record<string, IntegrationHealth>;
  onRefresh: () => void;
}

export const IntegrationsView = ({ health, onRefresh }: IntegrationsViewProps) => {
  const integrationsList = [
    {
      key: "niri",
      name: "Niri Window Compositor",
      icon: <Layers className="w-5 h-5 text-sky-400" />,
      streamSource: "niri msg --json event-stream",
      description:
        "Subscribes to Niri's real-time compositor JSON event stream to track window focus, workspace transitions, and active desktop application IDs without polling.",
      diagnosticsHint: "Check if 'niri' binary exists in PATH and socket is accessible in $XDG_RUNTIME_DIR.",
    },
    {
      key: "mpris",
      name: "MPRIS Media (playerctl)",
      icon: <Disc3 className="w-5 h-5 text-pink-400" />,
      streamSource: "playerctl metadata --format '...' --follow",
      description:
        "Observes D-Bus MPRIS media players (Spotify, VLC, Chromium, Firefox, etc.), capturing title, artist, album art URL, length, and monotonic playback position anchors.",
      diagnosticsHint: "Ensure 'playerctl' package is installed and your media player exposes the MPRIS D-Bus interface.",
    },
    {
      key: "discord",
      name: "Discord Local RPC",
      icon: <MessageSquare className="w-5 h-5 text-indigo-400" />,
      streamSource: "$XDG_RUNTIME_DIR/discord-ipc-0 (or Flatpak/Snap sandbox socket)",
      description:
        "Dispatches SET_ACTIVITY frames directly over local Unix domain socket with Little-Endian 8-byte framing, duplicate suppression, and 3-second rate-limiting coalescing.",
      diagnosticsHint: "Make sure Discord or Discord Canary desktop app is open and running.",
    },
    {
      key: "lyrics",
      name: "LRCLIB Synced Lyrics",
      icon: <Mic2 className="w-5 h-5 text-emerald-400" />,
      streamSource: "https://lrclib.net/api/get (with /search fallback)",
      description:
        "Fetches synchronized and plain lyrics once per track identity, scores match confidence, parses LRC timestamps, and caches persistently in local SQLite.",
      diagnosticsHint: "Requires internet connection. Queries are cached for 24 hours to minimize network traffic.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Integrations & Data Sources</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time status, socket connections, and health telemetry for all presence sources.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-surface-border text-slate-300 hover:bg-surface-hover transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Poll Status Now
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrationsList.map((item) => {
          const itemHealth = health[item.key];
          const status = itemHealth?.status ?? "disconnected";
          const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.disconnected;

          return (
            <div
              key={item.key}
              className="bg-surface rounded-2xl border border-surface-border p-6 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{item.name}</h3>
                      <span className="text-[11px] font-mono text-slate-500">{item.streamSource}</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                    {config.label}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

                {itemHealth?.error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold">Error: </span>
                      <span>{itemHealth.error}</span>
                    </div>
                  </div>
                )}

                <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Message:</span>
                    <span className="text-slate-200 font-medium text-right">
                      {itemHealth?.details || "Default configuration"}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Last Event Timestamp:</span>
                    <span className="font-mono text-slate-300">
                      {itemHealth?.lastEventAt
                        ? new Date(itemHealth.lastEventAt).toLocaleString()
                        : "No events received yet"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
                <span>{item.diagnosticsHint}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
