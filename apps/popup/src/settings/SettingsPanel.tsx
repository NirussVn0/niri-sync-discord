/**
 * SettingsPanel — expanded settings view with widget toggles + config.
 */
import { useState } from "react";
import { PresenceSnapshot, CountdownCategory } from "@presenced/contracts";
import { WidgetId, WIDGET_REGISTRY } from "../lib/widget-registry.js";
import { motion } from "framer-motion";
import { springSnap } from "../lib/animations.js";
import { Music, MessageSquare, Timer, CalendarClock, Mic2, Cpu, Wifi, Shield, ToggleLeft, ToggleRight } from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Music, MessageSquare, Timer, CalendarClock, Mic2, Cpu, Wifi, Shield,
};

interface SettingsPanelProps {
  visibility: Record<WidgetId, boolean>;
  toggleWidget: (id: WidgetId) => void;
  onClose: () => void;
  snapshot: PresenceSnapshot | null;
  onSetPrivacyMode: (enabled: boolean) => void;
  onAddCountdown?: (item: { title: string; targetDate: string; category: CountdownCategory; showOnDiscord: boolean }) => void;
  onDeleteCountdown?: (id: string) => void;
  onToggleCountdown?: (id: string) => void;
  getDiscordConfig: () => Promise<{ clientId?: string; socketPath?: string }>;
  saveDiscordConfig: (config: { clientId?: string; socketPath?: string }) => Promise<void>;
  getRvcConfig: () => Promise<{ enabled: boolean; tickIntervalSec: number; entries: any[] }>;
  saveRvcConfig: (config: { enabled: boolean; tickIntervalSec: number; entries: any[] }) => Promise<void>;
}

export const SettingsPanel = ({
  visibility, toggleWidget,
  getDiscordConfig, saveDiscordConfig,
  getRvcConfig, saveRvcConfig,
}: SettingsPanelProps) => {
  const [activeTab, setActiveTab] = useState<"widgets" | "discord" | "rvc">("widgets");
  const [discordClientId, setDiscordClientId] = useState("");
  const [discordSocketPath, setDiscordSocketPath] = useState("");
  const [rvcEnabled, setRvcEnabled] = useState(false);
  const [rvcInterval, setRvcInterval] = useState(30);

  // Load configs on mount
  useState(() => {
    getDiscordConfig().then((c) => {
      setDiscordClientId(c.clientId ?? "");
      setDiscordSocketPath(c.socketPath ?? "");
    });
    getRvcConfig().then((c) => {
      setRvcEnabled(c.enabled);
      setRvcInterval(c.tickIntervalSec);
    });
  });

  return (
    <div className="space-y-3 text-2xs">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border-subtle pb-2">
        {(["widgets", "discord", "rvc"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-2.5 py-1 rounded-niri font-medium transition-colors ${
              activeTab === tab
                ? "bg-accent-primary text-white font-bold"
                : "text-text-muted hover:text-text-primary glass-surface"
            }`}
          >
            {tab === "widgets" ? "Widgets" : tab === "discord" ? "Discord" : "RVC Rotation"}
          </button>
        ))}
      </div>

      {/* Widget toggles */}
      {activeTab === "widgets" && (
        <div className="space-y-1.5">
          <h3 className="font-semibold text-text-primary">Toggle Widgets</h3>
          {WIDGET_REGISTRY.filter((w) => w.toggleable).map((widget) => {
            const Icon = ICON_MAP[widget.icon] ?? Shield;
            const isOn = visibility[widget.id] ?? widget.defaultVisible;
            return (
              <motion.button
                key={widget.id}
                type="button"
                onClick={() => toggleWidget(widget.id)}
                className="w-full flex items-center justify-between p-2 rounded-niri glass-surface hover:bg-surface-hover transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={springSnap}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-text-secondary" />
                  <span className="text-text-primary">{widget.label}</span>
                </div>
                {isOn ? (
                  <ToggleRight className="w-5 h-5 text-status-connected" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-text-ghost" />
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Discord config */}
      {activeTab === "discord" && (
        <div className="space-y-2">
          <h3 className="font-semibold text-text-primary">Discord RPC</h3>
          <div className="p-2.5 rounded-niri glass-surface space-y-2">
            <label className="font-bold text-text-primary">Client ID</label>
            <input
              type="text"
              placeholder="From discord.com/developers/applications"
              value={discordClientId}
              onChange={(e) => setDiscordClientId(e.target.value)}
              className="w-full px-2.5 py-1 text-2xs bg-surface-solid border border-border rounded-niri text-text-primary placeholder-text-ghost font-mono focus:outline-none focus:border-accent-primary"
            />
            <label className="font-bold text-text-primary">Socket Path (optional)</label>
            <input
              type="text"
              placeholder="Auto-detect"
              value={discordSocketPath}
              onChange={(e) => setDiscordSocketPath(e.target.value)}
              className="w-full px-2.5 py-1 text-2xs bg-surface-solid border border-border rounded-niri text-text-primary placeholder-text-ghost font-mono focus:outline-none focus:border-accent-primary"
            />
            <button
              type="button"
              onClick={() => saveDiscordConfig({ clientId: discordClientId, socketPath: discordSocketPath })}
              className="px-3 py-1 bg-accent-primary hover:bg-accent-glow text-white rounded-niri font-bold text-2xs"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* RVC config */}
      {activeTab === "rvc" && (
        <div className="space-y-2">
          <h3 className="font-semibold text-text-primary">RVC Rotation</h3>
          <div className="p-2.5 rounded-niri glass-surface space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-text-primary">Enable Rotation</span>
              <button
                type="button"
                onClick={() => setRvcEnabled(!rvcEnabled)}
                className={`w-10 h-5 rounded-full transition-colors ${rvcEnabled ? "bg-status-connected" : "bg-surface-solid"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${rvcEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-text-secondary">Interval (sec):</label>
              <input
                type="number"
                value={rvcInterval}
                onChange={(e) => setRvcInterval(Number(e.target.value))}
                className="w-16 px-2 py-1 text-2xs bg-surface-solid border border-border rounded-niri text-text-primary font-mono focus:outline-none focus:border-accent-primary"
              />
            </div>
            <button
              type="button"
              onClick={() => saveRvcConfig({ enabled: rvcEnabled, tickIntervalSec: rvcInterval, entries: [] })}
              className="px-3 py-1 bg-accent-primary hover:bg-accent-glow text-white rounded-niri font-bold text-2xs"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
