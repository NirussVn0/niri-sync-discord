import { useState, useEffect } from "react";
import {
  PresenceRules,
  DEFAULT_PRIORITIES,
  ActivityCategory,
  AppRule,
} from "@presenced/contracts";
import { Sliders, X, RotateCcw, Plus, Trash2, Shield } from "lucide-react";

interface RulesSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetRules: () => Promise<PresenceRules | null>;
  onSaveRules: (rules: PresenceRules) => Promise<boolean>;
}

const CATEGORIES: ActivityCategory[] = [
  "gaming",
  "music",
  "recording",
  "coding",
  "video",
  "browser",
  "terminal",
  "generic",
  "idle",
];

export const RulesSettingsModal = ({
  isOpen,
  onClose,
  onGetRules,
  onSaveRules,
}: RulesSettingsModalProps) => {
  const [priorities, setPriorities] = useState<Record<string, number>>({
    ...DEFAULT_PRIORITIES,
  });
  const [appRules, setAppRules] = useState<Record<string, AppRule>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // New App Rule inputs
  const [newAppId, setNewAppId] = useState("");
  const [newAppCategory, setNewAppCategory] = useState<ActivityCategory>("coding");
  const [newAppTitle, setNewAppTitle] = useState("");
  const [newAppIgnore, setNewAppIgnore] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      onGetRules()
        .then((rules) => {
          if (rules) {
            setPriorities({ ...DEFAULT_PRIORITIES, ...rules.priorities });
            setAppRules(rules.appRules || {});
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, onGetRules]);

  if (!isOpen) return null;

  const handlePriorityChange = (cat: string, val: number) => {
    setPriorities((prev) => ({
      ...prev,
      [cat]: val,
    }));
  };

  const handleResetDefaults = () => {
    setPriorities({ ...DEFAULT_PRIORITIES });
  };

  const handleAddAppRule = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAppId = newAppId.trim().toLowerCase();
    if (!cleanAppId) return;

    const rule: AppRule = {
      appId: cleanAppId,
      category: newAppCategory,
      ...(newAppTitle.trim() ? { customTitle: newAppTitle.trim() } : {}),
      hide: newAppIgnore,
    };

    setAppRules((prev) => ({
      ...prev,
      [cleanAppId]: rule,
    }));

    setNewAppId("");
    setNewAppTitle("");
    setNewAppIgnore(false);
  };

  const handleDeleteAppRule = (appId: string) => {
    setAppRules((prev) => {
      const next = { ...prev };
      delete next[appId];
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await onSaveRules({
      priorities,
      appRules,
      privacyMode: false,
    });
    setSaving(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl border border-surface-border w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sliders className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-white">Presence Engine Rules</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">Loading rules...</div>
          ) : (
            <>
              {/* Category Priorities */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Category Priority Weights
                  </h3>
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Defaults
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => {
                    const weight = priorities[cat] ?? 0;
                    return (
                      <div
                        key={cat}
                        className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3"
                      >
                        <span className="text-xs font-medium text-slate-300 capitalize">
                          {cat}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={weight}
                            onChange={(e) => handlePriorityChange(cat, Number(e.target.value))}
                            className="w-24 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                          />
                          <span className="text-xs font-mono font-bold text-indigo-400 w-7 text-right">
                            {weight}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom App Rules */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Custom App Overrides
                </h3>

                {/* Existing Rules List */}
                {Object.keys(appRules).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(appRules).map(([appId, rule]) => (
                      <div
                        key={appId}
                        className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white">{appId}</span>
                            {rule.hide ? (
                              <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px]">
                                Ignored
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] capitalize">
                                {rule.category ?? "auto"}
                              </span>
                            )}
                          </div>
                          {rule.customTitle && (
                            <p className="text-slate-400 truncate">Title: {rule.customTitle}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteAppRule(appId)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-xl p-4 text-center text-xs text-slate-500">
                    No custom app rules configured yet.
                  </div>
                )}

                {/* Add App Rule Form */}
                <form
                  onSubmit={handleAddAppRule}
                  className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 space-y-3"
                >
                  <p className="text-[11px] font-medium text-slate-400">Add App Rule</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="app_id (e.g. steam_app_123)"
                      value={newAppId}
                      onChange={(e) => setNewAppId(e.target.value)}
                      className="text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                    <select
                      value={newAppCategory}
                      onChange={(e) => setNewAppCategory(e.target.value as ActivityCategory)}
                      className="text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 capitalize"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} className="capitalize">
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Custom Display Title (optional)"
                      value={newAppTitle}
                      onChange={(e) => setNewAppTitle(e.target.value)}
                      className="text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAppIgnore}
                        onChange={(e) => setNewAppIgnore(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                      />
                      <span>Ignore this app (never publish presence)</span>
                    </label>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Rule
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-border flex items-center justify-between bg-slate-900/30">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Persisted locally to SQLite database</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="text-xs px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium shadow-lg shadow-indigo-600/30 transition-all"
            >
              {saving ? "Saving..." : "Save Rules"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
