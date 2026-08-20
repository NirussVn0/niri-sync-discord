import { HistoryEntry } from "../hooks/usePresenceState.js";
import { History, Trash2, Activity } from "lucide-react";

interface HistoryViewProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
}

export const HistoryView = ({ history, onClearHistory }: HistoryViewProps) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Recent Activity History</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Local session audit log of resolved presence states (stored in browser localStorage, not transmitted).
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear History
          </button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-xl space-y-4">
          <div className="divide-y divide-slate-800/80">
            {history.map((item) => (
              <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 mt-0.5 flex-shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-200 truncate">{item.presence.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        {item.presence.category}
                      </span>
                    </div>
                    {item.presence.details && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.presence.details}</p>
                    )}
                    <p className="text-[11px] text-slate-500 italic mt-0.5">{item.presence.reason}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 text-[11px] text-slate-500 font-mono">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-surface-border p-12 text-center space-y-3">
          <History className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No activity history recorded yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            As Niri and media players publish presence changes, recent winning activities will be logged here.
          </p>
        </div>
      )}
    </div>
  );
};
