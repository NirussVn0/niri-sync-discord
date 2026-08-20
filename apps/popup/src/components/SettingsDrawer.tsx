import { useState } from "react";
import { PresenceSnapshot, CountdownCategory } from "@presenced/contracts";
import {
  X,
  Shield,
  Clock,
  Sparkles,
  Layers,
  Activity,
  Plus,
} from "lucide-react";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: PresenceSnapshot | null;
  onSetPrivacyMode: (enabled: boolean) => void;
  onAddCountdown?: (item: {
    title: string;
    targetDate: string;
    category: CountdownCategory;
    showOnDiscord: boolean;
  }) => void;
}

type SettingsTab = "scenes" | "countdowns" | "integrations" | "privacy";

export const SettingsDrawer = ({
  isOpen,
  onClose,
  snapshot,
  onSetPrivacyMode,
  onAddCountdown,
}: SettingsDrawerProps) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("scenes");
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newCategory, setNewCategory] = useState<CountdownCategory>("exam");
  const [newShowDiscord, setNewShowDiscord] = useState(false);

  if (!isOpen) return null;

  const handleAddCountdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    onAddCountdown?.({
      title: newTitle.trim(),
      targetDate: new Date(newDate).toISOString(),
      category: newCategory,
      showOnDiscord: newShowDiscord,
    });

    setNewTitle("");
    setNewDate("");
  };

  return (
    <div className="absolute inset-0 bg-background/98 backdrop-blur-xl z-50 flex flex-col p-4 text-slate-100 select-none animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Drawer Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-white">Companion Settings</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-surface text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-1 pt-3 pb-2 border-b border-surface-border/50 text-xs overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("scenes")}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "scenes"
              ? "bg-indigo-600 text-white font-bold"
              : "text-slate-400 hover:text-white hover:bg-surface"
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Scenes</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("countdowns")}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "countdowns"
              ? "bg-indigo-600 text-white font-bold"
              : "text-slate-400 hover:text-white hover:bg-surface"
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>Countdowns</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("integrations")}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "integrations"
              ? "bg-indigo-600 text-white font-bold"
              : "text-slate-400 hover:text-white hover:bg-surface"
          }`}
        >
          <Activity className="w-3 h-3" />
          <span>Health</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("privacy")}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "privacy"
              ? "bg-indigo-600 text-white font-bold"
              : "text-slate-400 hover:text-white hover:bg-surface"
          }`}
        >
          <Shield className="w-3 h-3" />
          <span>Privacy</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 scrollbar-thin">
        {activeTab === "scenes" && (
          <div className="space-y-2 text-xs">
            <h3 className="font-semibold text-slate-300">RPC Scene Profiles</h3>
            <p className="text-[11px] text-slate-400">
              Each scene configures Discord presence templates, priority, and layout rules.
            </p>
            <div className="space-y-1.5 pt-1">
              {[
                { name: "Auto Desktop", desc: "Dynamically selects Niri / MPRIS" },
                { name: "Music & Lyrics", desc: "Live LRCLIB synchronized lyrics" },
                { name: "Pomodoro Focus", desc: "Authoritative study sessions" },
                { name: "Milestone Countdown", desc: "Days left until exam/target" },
                { name: "System Context", desc: "Linux CPU/RAM telemetry" },
                { name: "Privacy Mode", desc: "Hides all window & media titles" },
              ].map((s) => (
                <div key={s.name} className="p-2.5 rounded-lg bg-surface/70 border border-surface-border">
                  <div className="font-bold text-white text-xs">{s.name}</div>
                  <div className="text-[10px] text-slate-400">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "countdowns" && (
          <div className="space-y-3 text-xs">
            <h3 className="font-semibold text-slate-300">Add Milestone Countdown</h3>
            <form onSubmit={handleAddCountdown} className="space-y-2 p-2.5 rounded-lg bg-surface border border-surface-border">
              <input
                type="text"
                placeholder="Milestone title (e.g. THPTQG 2027)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-surface-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-surface-border rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center justify-between pt-1">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as CountdownCategory)}
                  className="px-2 py-1 bg-slate-900 border border-surface-border rounded-lg text-xs text-white"
                >
                  <option value="exam">Exam</option>
                  <option value="project">Project</option>
                  <option value="holiday">Holiday</option>
                  <option value="personal">Personal</option>
                </select>

                <label className="flex items-center gap-1.5 text-[11px] text-slate-300">
                  <input
                    type="checkbox"
                    checked={newShowDiscord}
                    onChange={(e) => setNewShowDiscord(e.target.checked)}
                    className="rounded bg-slate-900 border-surface-border text-indigo-600"
                  />
                  <span>Sync Discord</span>
                </label>

                <button
                  type="submit"
                  className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs shadow-md transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            </form>

            {snapshot?.countdown?.activeCountdown && (
              <div className="space-y-1 pt-1">
                <div className="text-[11px] font-semibold text-slate-400">Active Countdown:</div>
                <div className="p-2.5 rounded-lg bg-surface/70 border border-surface-border flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{snapshot.countdown.activeCountdown.title}</div>
                    <div className="text-[10px] text-slate-400">{snapshot.countdown.totalFormatted}</div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                    Active
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="space-y-2 text-xs">
            <h3 className="font-semibold text-slate-300">Source Health & Status</h3>
            <div className="space-y-1.5">
              {[
                { name: "Niri Wayland IPC", source: "niri" },
                { name: "MPRIS Media Bus", source: "mpris" },
                { name: "LRCLIB Lyrics Sync", source: "lrclib" },
                { name: "Discord RPC Socket", source: "discord" },
              ].map((item) => {
                const health = snapshot?.health?.[item.source];
                const status = health?.status ?? "connected";

                return (
                  <div
                    key={item.source}
                    className="p-2.5 rounded-lg bg-surface border border-surface-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          status === "connected"
                            ? "bg-emerald-400"
                            : status === "degraded"
                            ? "bg-amber-400"
                            : "bg-rose-400"
                        }`}
                      />
                      <span className="font-medium text-slate-200">{item.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 capitalize">{status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "privacy" && (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-surface border border-surface-border space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Privacy Mode</span>
                </div>
                <input
                  type="checkbox"
                  checked={snapshot?.privacyMode ?? false}
                  onChange={(e) => onSetPrivacyMode(e.target.checked)}
                  className="rounded bg-slate-900 border-surface-border text-amber-500 w-4 h-4"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                When enabled, presenced masks all window titles and media metadata with generic placeholders.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="pt-2 border-t border-surface-border/50 text-center text-[10px] text-slate-500 font-mono">
        presenced v0.2.0 · Local-First Linux Companion
      </div>
    </div>
  );
};
