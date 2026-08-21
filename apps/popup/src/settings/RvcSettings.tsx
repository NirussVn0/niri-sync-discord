/**
 * RvcSettings — Discord Rich Presence configuration panel.
 * Custom status text, rotation entries, images, quote integration.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { springSnap } from "../lib/animations.js";
import { Plus, Trash2, Music, MessageSquare, Clock, ToggleLeft, ToggleRight } from "lucide-react";

interface RvcEntry {
  id: string;
  type: "music" | "custom" | "quote" | "pomodoro";
  label: string;
  durationSec: number;
  customText?: string;
  quoteFile?: string;
  enabled: boolean;
}

interface RvcSettingsProps {
  onSave: (config: { enabled: boolean; tickIntervalSec: number; entries: RvcEntry[] }) => Promise<void>;
  onLoad: () => Promise<{ enabled: boolean; tickIntervalSec: number; entries: RvcEntry[] }>;
}

const ENTRY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  music: Music,
  custom: MessageSquare,
  quote: MessageSquare,
  pomodoro: Clock,
};

export const RvcSettings = ({ onSave, onLoad }: RvcSettingsProps) => {
  const [enabled, setEnabled] = useState(false);
  const [interval, setInterval] = useState(30);
  const [entries, setEntries] = useState<RvcEntry[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    onLoad().then((config) => {
      setEnabled(config.enabled);
      setInterval(config.tickIntervalSec);
      setEntries(config.entries);
    });
  }, [onLoad]);

  const addEntry = (type: RvcEntry["type"], extra?: Partial<RvcEntry>) => {
    const id = `rvc-${Date.now()}`;
    const labels: Record<string, string> = {
      music: "Now Playing",
      custom: "Custom Status",
      quote: "Wisdom Quote",
      pomodoro: "Focus Mode",
    };
    setEntries((prev) => [
      ...prev,
      {
        id,
        type,
        label: labels[type] ?? "Status",
        durationSec: 30,
        enabled: true,
        ...extra,
      },
    ]);
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const updateEntry = (id: string, updates: Partial<RvcEntry>) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const handleSave = async () => {
    await onSave({ enabled, tickIntervalSec: interval, entries });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-3 text-2xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-text-primary">RVC Configuration</h3>
        <div className="flex items-center gap-2">
          <span className="text-text-secondary">Enabled</span>
          <button type="button" onClick={() => setEnabled(!enabled)} className={`w-10 h-5 rounded-full transition-colors ${enabled ? "bg-status-connected" : "bg-surface-solid"}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Interval */}
      <div className="flex items-center gap-2">
        <label className="text-text-secondary">Rotation interval:</label>
        <input type="number" value={interval} onChange={(e) => setInterval(Number(e.target.value))} className="w-16 px-2 py-1 text-2xs bg-surface-solid border border-border rounded-niri text-text-primary font-mono focus:outline-none focus:border-accent-primary" />
        <span className="text-text-muted">sec</span>
      </div>

      {/* Entries */}
      <div className="space-y-1.5">
        <div className="text-2xs font-semibold text-text-secondary">Rotation Entries</div>
        {entries.map((entry) => {
          const Icon = ENTRY_ICONS[entry.type] ?? MessageSquare;
          return (
            <motion.div key={entry.id} className="p-2 rounded-niri glass-surface flex items-center gap-2" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={springSnap}>
              <Icon className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-text-primary font-medium truncate">{entry.label}</div>
                {entry.type === "custom" && (
                  <input type="text" value={entry.customText ?? ""} onChange={(e) => updateEntry(entry.id, { customText: e.target.value })} placeholder="Custom status text..." className="w-full mt-1 px-2 py-0.5 text-2xs bg-surface-solid border border-border rounded-niri text-text-primary placeholder-text-ghost focus:outline-none focus:border-accent-primary" />
                )}
                {entry.type === "quote" && (
                  <input type="text" value={entry.quoteFile ?? ""} onChange={(e) => updateEntry(entry.id, { quoteFile: e.target.value })} placeholder="quotes/vietnamese-wisdom.txt" className="w-full mt-1 px-2 py-0.5 text-2xs bg-surface-solid border border-border rounded-niri text-text-primary placeholder-text-ghost font-mono focus:outline-none focus:border-accent-primary" />
                )}
              </div>
              <input type="number" value={entry.durationSec} onChange={(e) => updateEntry(entry.id, { durationSec: Number(e.target.value) })} className="w-12 px-1 py-0.5 text-2xs bg-surface-solid border border-border rounded-niri text-text-primary font-mono text-center focus:outline-none focus:border-accent-primary" title="Duration (sec)" />
              <span className="text-text-muted">s</span>
              <button type="button" onClick={() => updateEntry(entry.id, { enabled: !entry.enabled })} className="flex-shrink-0">
                {entry.enabled ? <ToggleRight className="w-4 h-4 text-status-connected" /> : <ToggleLeft className="w-4 h-4 text-text-ghost" />}
              </button>
              <button type="button" onClick={() => removeEntry(entry.id)} className="flex-shrink-0 p-0.5 rounded hover:bg-status-error/20 text-text-muted hover:text-status-error transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Add buttons */}
      <div className="flex flex-wrap gap-1.5">
        {(["music", "custom", "quote", "pomodoro"] as const).map((type) => (
          <button key={type} type="button" onClick={() => addEntry(type)} className="flex items-center gap-1 px-2 py-1 rounded-niri glass-surface text-text-secondary hover:text-text-primary text-2xs transition-colors">
            <Plus className="w-2.5 h-2.5" />
            <span>{type === "music" ? "Music" : type === "custom" ? "Custom" : type === "quote" ? "Quote" : "Pomo"}</span>
          </button>
        ))}
      </div>

      {/* Save */}
      <motion.button type="button" onClick={handleSave} className="w-full py-1.5 rounded-niri bg-accent-primary hover:bg-accent-glow text-white font-bold text-2xs transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={springSnap}>
        {saved ? "✓ Saved" : "Save RVC Config"}
      </motion.button>
    </div>
  );
};
