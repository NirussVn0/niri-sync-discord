import { useState, useEffect } from "react";
import {
  PresenceRules,
  ActivityCategory,
  DEFAULT_PRIORITIES,
  AppRule,
} from "@presenced/contracts";
import {
  Sliders,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Shield,
  EyeOff,
  Code,
  Globe,
  Gamepad2,
  Music,
  Video,
  Terminal,
  Clock,
  Sparkles,
} from "lucide-react";

interface RulesViewProps {
  getRules: () => Promise<PresenceRules | null>;
  updateRules: (rules: PresenceRules) => Promise<boolean>;
}

const CATEGORY_META: Record<
  ActivityCategory,
  { label: string; icon: typeof Code; color: string }
> = {
  manual: { label: "Manual Override", icon: Sparkles, color: "text-indigo-400" },
  privacy: { label: "Privacy Mode", icon: Shield, color: "text-amber-400" },
  gaming: { label: "Gaming", icon: Gamepad2, color: "text-purple-400" },
  music: { label: "Music (MPRIS)", icon: Music, color: "text-pink-400" },
  recording: { label: "Recording / Streaming", icon: Video, color: "text-red-400" },
  coding: { label: "Coding / IDEs", icon: Code, color: "text-blue-400" },
  focus: { label: "Focus / Deep Work", icon: Sparkles, color: "text-indigo-300" },
  pomodoro: { label: "Pomodoro Session", icon: Clock, color: "text-emerald-400" },
  countdown: { label: "Milestone Countdown", icon: Clock, color: "text-amber-300" },
  system: { label: "System Telemetry", icon: Terminal, color: "text-sky-400" },
  video: { label: "Video Players", icon: Video, color: "text-rose-400" },
  browser: { label: "Web Browsing", icon: Globe, color: "text-amber-400" },
  terminal: { label: "Terminal Emulators", icon: Terminal, color: "text-emerald-400" },
  custom: { label: "Custom Activity", icon: Sparkles, color: "text-violet-400" },
  generic: { label: "Generic Applications", icon: Sliders, color: "text-slate-400" },
  idle: { label: "Idle / Desktop", icon: Clock, color: "text-slate-500" },
};

export const RulesView = ({ getRules, updateRules }: RulesViewProps) => {
  const [rules, setRules] = useState<PresenceRules>({
    priorities: { ...DEFAULT_PRIORITIES },
    appRules: {},
    privacyMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New rule inputs
  const [newAppId, setNewAppId] = useState("");
  const [newCategory, setNewCategory] = useState<ActivityCategory | "">("");
  const [newCustomTitle, setNewCustomTitle] = useState("");
  const [newHide, setNewHide] = useState(false);

  useEffect(() => {
    getRules().then((res) => {
      if (res) setRules(res);
      setLoading(false);
    });
  }, [getRules]);

  const handlePriorityChange = (category: ActivityCategory, value: number) => {
    setRules((prev) => ({
      ...prev,
      priorities: {
        ...prev.priorities,
        [category]: value,
      },
    }));
  };

  const handleResetDefaults = () => {
    setRules((prev) => ({
      ...prev,
      priorities: { ...DEFAULT_PRIORITIES },
    }));
  };

  const handleAddAppRule = () => {
    const trimmed = newAppId.trim();
    if (!trimmed) return;

    const rule: AppRule = {
      appId: trimmed,
      ...(newCategory ? { category: newCategory as ActivityCategory } : {}),
      ...(newCustomTitle.trim() ? { customTitle: newCustomTitle.trim() } : {}),
      ...(newHide ? { hide: true } : {}),
    };

    setRules((prev) => ({
      ...prev,
      appRules: {
        ...prev.appRules,
        [trimmed]: rule,
      },
    }));

    setNewAppId("");
    setNewCategory("");
    setNewCustomTitle("");
    setNewHide(false);
  };

  const handleRemoveAppRule = (appId: string) => {
    setRules((prev) => {
      const updated = { ...prev.appRules };
      delete updated[appId];
      return { ...prev, appRules: updated };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const ok = await updateRules(rules);
    setSaving(false);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading rules and priorities...</div>;
  }

  const sortedCategories = (Object.keys(CATEGORY_META) as ActivityCategory[]).sort(
    (a, b) => (rules.priorities[b] ?? 0) - (rules.priorities[a] ?? 0)
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header & Save Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Presence Rules & Priorities</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure how the deterministic presence engine ranks competing activities and handles specific applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface border border-surface-border text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-md ${
              saveSuccess
                ? "bg-emerald-600 shadow-emerald-600/30"
                : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
            }`}
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : saveSuccess ? "Saved to SQLite!" : "Save Rules"}
          </button>
        </div>
      </div>

      {/* Category Priorities Sliders */}
      <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-xl space-y-6">
        <div>
          <h3 className="font-bold text-white text-base">Category Priority Weights</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            When multiple activities occur concurrently, the category with the higher numerical weight wins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {sortedCategories.map((category) => {
            const meta = CATEGORY_META[category];
            const Icon = meta.icon;
            const weight = rules.priorities[category] ?? 0;

            return (
              <div key={category} className="space-y-1.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                    <span className="font-semibold text-slate-200">{meta.label}</span>
                  </div>
                  <span className="font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                    {weight}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weight}
                  onChange={(e) => handlePriorityChange(category, Number(e.target.value))}
                  aria-label={`${meta.label} Priority Slider`}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-App Overrides Table */}
      <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-xl space-y-6">
        <div>
          <h3 className="font-bold text-white text-base">Application Rules & Filters</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Match Niri window <code className="text-slate-300 font-mono">app_id</code> values to override category, replace title, or hide them entirely.
          </p>
        </div>

        {/* Add App Rule Form */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-medium">App ID / Class</label>
            <input
              type="text"
              placeholder="e.g. org.mozilla.firefox"
              value={newAppId}
              onChange={(e) => setNewAppId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-medium">Category Remap</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as ActivityCategory)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Keep default</option>
              <option value="coding">Coding</option>
              <option value="gaming">Gaming</option>
              <option value="music">Music</option>
              <option value="video">Video</option>
              <option value="terminal">Terminal</option>
              <option value="browser">Browser</option>
              <option value="generic">Generic</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-medium">Custom Title</label>
            <input
              type="text"
              placeholder="e.g. Web Browsing"
              value={newCustomTitle}
              onChange={(e) => setNewCustomTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 py-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={newHide}
                onChange={(e) => setNewHide(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span className="flex items-center gap-1">
                <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                Hide
              </span>
            </label>

            <button
              type="button"
              onClick={handleAddAppRule}
              className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* Existing Rules List */}
        {Object.keys(rules.appRules).length > 0 ? (
          <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden">
            {Object.entries(rules.appRules).map(([appId, rule]) => (
              <div key={appId} className="p-3.5 flex items-center justify-between text-xs bg-slate-900/30 hover:bg-slate-900/60 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="font-mono font-semibold text-slate-200">{appId}</span>
                  {rule.category && (
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                      {rule.category}
                    </span>
                  )}
                  {rule.customTitle && (
                    <span className="text-slate-400 italic">"{rule.customTitle}"</span>
                  )}
                  {rule.hide && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/50">
                      <EyeOff className="w-3 h-3" />
                      Hidden
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveAppRule(appId)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title={`Delete rule for ${appId}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic py-2 text-center">
            No application override rules defined yet. Add an app_id above to customize behavior.
          </p>
        )}
      </div>
    </div>
  );
};
