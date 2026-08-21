import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PresenceSnapshot, CountdownCategory } from "@presenced/contracts";
import {
  X, Shield, Clock, Layers, Activity, Plus, Trash2, Wifi,
} from "lucide-react";
import { drawerVariants, overlayVariants, springNiri, springSnap } from "../lib/animations.js";

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
  onDeleteCountdown?: (id: string) => void;
  onToggleCountdown?: (id: string) => void;
}

type SettingsTab = "scenes" | "countdowns" | "integrations" | "privacy" | "discord";

export const SettingsDrawer = ({
  isOpen, onClose, snapshot, onSetPrivacyMode, onAddCountdown, onDeleteCountdown, onToggleCountdown,
}: SettingsDrawerProps) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("scenes");
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newCategory, setNewCategory] = useState<CountdownCategory>("exam");
  const [newShowDiscord, setNewShowDiscord] = useState(false);

  // Discord config (local state — would sync to daemon via API)
  const [discordSocketPath, setDiscordSocketPath] = useState("");
  const [discordClientId, setDiscordClientId] = useState("");

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

  const TABS: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "scenes", label: "Scenes", icon: Layers },
    { id: "countdowns", label: "Countdowns", icon: Clock },
    { id: "integrations", label: "Health", icon: Activity },
    { id: "discord", label: "Discord", icon: Wifi },
    { id: "privacy", label: "Privacy", icon: Shield },
  ];

  const SCENE_INFO = [
    { name: "Auto Desktop", desc: "Dynamically selects Niri / MPRIS", color: "#7c8aff" },
    { name: "Music & Lyrics", desc: "Live LRCLIB synchronized lyrics", color: "#a78bfa" },
    { name: "Pomodoro Focus", desc: "Authoritative study sessions", color: "#fbbf24" },
    { name: "Milestone Countdown", desc: "Days left until exam/target", color: "#f87171" },
    { name: "System Context", desc: "Linux CPU/RAM telemetry", color: "#38bdf8" },
    { name: "Privacy Mode", desc: "Hides all window & media titles", color: "#fbbf24" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-background-solid/60 backdrop-blur-sm z-40 rounded-niri-xl"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="absolute inset-0 z-50 flex flex-col p-4 text-text-primary select-none glass-strong rounded-niri-xl overflow-hidden"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={springNiri}
          >
            {/* Drawer Top Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent-primary" />
                <h2 className="text-sm font-bold text-text-primary">Companion Settings</h2>
              </div>
              <motion.button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-niri glass-surface text-text-secondary hover:text-text-primary transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={springSnap}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Navigation Tab Bar */}
            <div className="flex items-center gap-1 pt-3 pb-2 border-b border-border-subtle text-2xs overflow-x-auto scrollbar-none">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2.5 py-1 rounded-niri font-medium transition-colors flex items-center gap-1.5 ${
                      activeTab === tab.id
                        ? "bg-accent-primary text-white font-bold"
                        : "text-text-muted hover:text-text-primary glass-surface"
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={springSnap}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 scrollbar-thin">
              <AnimatePresence mode="wait">
                {/* Scenes Tab */}
                {activeTab === "scenes" && (
                  <motion.div
                    key="scenes"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={springNiri}
                    className="space-y-2 text-2xs"
                  >
                    <h3 className="font-semibold text-text-primary">RPC Scene Profiles</h3>
                    <p className="text-2xs text-text-secondary">
                      Each scene configures Discord presence templates, priority, and layout rules.
                    </p>
                    <div className="space-y-1.5 pt-1">
                      {SCENE_INFO.map((s) => (
                        <div key={s.name} className="p-2.5 rounded-niri glass-surface flex items-center gap-2.5">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: s.color }}
                          />
                          <div>
                            <div className="font-bold text-text-primary text-2xs">{s.name}</div>
                            <div className="text-2xs text-text-muted">{s.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Countdowns Tab */}
                {activeTab === "countdowns" && (
                  <motion.div
                    key="countdowns"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={springNiri}
                    className="space-y-3 text-2xs"
                  >
                    <h3 className="font-semibold text-text-primary">Add Milestone Countdown</h3>
                    <form onSubmit={handleAddCountdown} className="space-y-2 p-2.5 rounded-niri glass-surface">
                      <input
                        type="text"
                        placeholder="Milestone title (e.g. THPTQG 2027)"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full px-2.5 py-1 text-2xs bg-surface-solid border border-border rounded-niri text-text-primary placeholder-text-ghost focus:outline-none focus:border-accent-primary transition-colors"
                      />
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full px-2.5 py-1 text-2xs bg-surface-solid border border-border rounded-niri text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                      />
                      <div className="flex items-center justify-between pt-1">
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as CountdownCategory)}
                          className="px-2 py-1 bg-surface-solid border border-border rounded-niri text-2xs text-text-primary"
                        >
                          <option value="exam">Exam</option>
                          <option value="project">Project</option>
                          <option value="holiday">Holiday</option>
                          <option value="personal">Personal</option>
                        </select>

                        <label className="flex items-center gap-1.5 text-2xs text-text-secondary">
                          <input
                            type="checkbox"
                            checked={newShowDiscord}
                            onChange={(e) => setNewShowDiscord(e.target.checked)}
                            className="rounded bg-surface-solid border-border text-accent-primary"
                          />
                          <span>Sync Discord</span>
                        </label>

                        <motion.button
                          type="submit"
                          className="flex items-center gap-1 px-3 py-1 bg-accent-primary hover:bg-accent-glow text-white rounded-niri font-bold text-2xs shadow-glow-sm transition-colors"
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          transition={springSnap}
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </motion.button>
                      </div>
                    </form>

                    {snapshot?.countdown?.activeCountdown && (
                      <div className="space-y-1 pt-1">
                        <div className="text-2xs font-semibold text-text-secondary">Active Countdown:</div>
                        <div className="p-2.5 rounded-niri glass-surface flex items-center justify-between">
                          <div>
                            <div className="font-bold text-text-primary">{snapshot.countdown.activeCountdown.title}</div>
                            <div className="text-2xs text-text-muted">{snapshot.countdown.totalFormatted}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {onToggleCountdown && (
                              <motion.button
                                type="button"
                                onClick={() => onToggleCountdown(snapshot.countdown!.activeCountdown!.id)}
                                className="text-2xs px-1.5 py-0.5 rounded-niri bg-status-connected/10 hover:bg-status-connected/20 text-status-connected border border-status-connected/20 font-mono transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={springSnap}
                              >
                                Active
                              </motion.button>
                            )}
                            {onDeleteCountdown && (
                              <motion.button
                                type="button"
                                onClick={() => onDeleteCountdown(snapshot.countdown!.activeCountdown!.id)}
                                className="p-1 rounded-niri hover:bg-status-error/20 text-text-secondary hover:text-status-error transition-colors"
                                title="Delete this countdown"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                transition={springSnap}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Integrations Tab */}
                {activeTab === "integrations" && (
                  <motion.div
                    key="integrations"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={springNiri}
                    className="space-y-2 text-2xs"
                  >
                    <h3 className="font-semibold text-text-primary">Source Health & Status</h3>
                    <div className="space-y-1.5">
                      {[
                        { name: "Niri Wayland IPC", source: "niri" },
                        { name: "MPRIS Media Bus", source: "mpris" },
                        { name: "LRCLIB Lyrics Sync", source: "lrclib" },
                        { name: "Discord RPC Socket", source: "discord" },
                      ].map((item) => {
                        const health = snapshot?.health?.[item.source];
                        const status = health?.status ?? "connected";
                        const statusColor =
                          status === "connected" ? "bg-status-connected" :
                          status === "degraded" ? "bg-status-degraded" :
                          "bg-status-error";

                        return (
                          <div
                            key={item.source}
                            className="p-2.5 rounded-niri glass-surface flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <motion.span
                                className={`w-2 h-2 rounded-full ${statusColor}`}
                                animate={status === "connected" ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                              <span className="font-medium text-text-primary">{item.name}</span>
                            </div>
                            <span className="text-2xs font-mono text-text-muted capitalize">{status}</span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Discord Tab — NEW */}
                {activeTab === "discord" && (
                  <motion.div
                    key="discord"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={springNiri}
                    className="space-y-3 text-2xs"
                  >
                    <h3 className="font-semibold text-text-primary">Discord RPC Configuration</h3>
                    <p className="text-2xs text-text-secondary">
                      Configure Discord Rich Presence. Works with official Discord, Equicord, Vencord, and other forks.
                    </p>

                    {/* Custom Socket Path */}
                    <div className="p-2.5 rounded-niri glass-surface space-y-2">
                      <label className="font-bold text-text-primary text-2xs">Custom IPC Socket Path</label>
                      <p className="text-2xs text-text-muted">
                        Leave empty for auto-detection. Set manually if using Equicord, Vencord, or custom Discord installs.
                      </p>
                      <input
                        type="text"
                        placeholder="Auto-detect (leave empty)"
                        value={discordSocketPath}
                        onChange={(e) => setDiscordSocketPath(e.target.value)}
                        className="w-full px-2.5 py-1 text-2xs bg-surface-solid border border-border rounded-niri text-text-primary placeholder-text-ghost font-mono focus:outline-none focus:border-accent-primary transition-colors"
                      />
                      <div className="text-2xs text-text-muted font-mono">
                        Example: /run/user/1000/discord-ipc-0
                      </div>
                    </div>

                    {/* Custom Client ID */}
                    <div className="p-2.5 rounded-niri glass-surface space-y-2">
                      <label className="font-bold text-text-primary text-2xs">Discord Application Client ID</label>
                      <p className="text-2xs text-text-muted">
                        Custom Client ID for Rich Presence. Get yours from{" "}
                        <span className="text-accent-primary">discord.com/developers/applications</span>
                      </p>
                      <input
                        type="text"
                        placeholder="Default: 1214041725514194954"
                        value={discordClientId}
                        onChange={(e) => setDiscordClientId(e.target.value)}
                        className="w-full px-2.5 py-1 text-2xs bg-surface-solid border border-border rounded-niri text-text-primary placeholder-text-ghost font-mono focus:outline-none focus:border-accent-primary transition-colors"
                      />
                    </div>

                    {/* Supported Clients */}
                    <div className="p-2.5 rounded-niri glass-surface space-y-2">
                      <label className="font-bold text-text-primary text-2xs">Supported Clients</label>
                      <div className="space-y-1">
                        {[
                          { name: "Official Discord", status: "Auto-detected" },
                          { name: "Equicord", status: "Auto-detected (IPC shared)" },
                          { name: "Vencord", status: "Auto-detected (IPC shared)" },
                          { name: "OpenAsar", status: "Auto-detected" },
                          { name: "Custom Client", status: "Set socket path above" },
                        ].map((client) => (
                          <div key={client.name} className="flex items-center justify-between py-0.5">
                            <span className="text-text-secondary">{client.name}</span>
                            <span className="text-2xs text-text-muted font-mono">{client.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Privacy Tab */}
                {activeTab === "privacy" && (
                  <motion.div
                    key="privacy"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={springNiri}
                    className="space-y-3 text-2xs"
                  >
                    <div className="p-3 rounded-niri glass-surface space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-text-primary flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-status-degraded" />
                          <span>Privacy Mode</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={snapshot?.privacyMode ?? false}
                          onChange={(e) => onSetPrivacyMode(e.target.checked)}
                          className="rounded bg-surface-solid border-border text-status-degraded w-4 h-4"
                        />
                      </div>
                      <p className="text-2xs text-text-secondary">
                        When enabled, presenced masks all window titles and media metadata with generic placeholders.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Drawer Footer */}
            <div className="pt-2 border-t border-border-subtle text-center text-2xs text-text-ghost font-mono">
              presenced v0.3.0 · Local-First Linux Companion
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
