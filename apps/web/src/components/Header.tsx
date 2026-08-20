import { Shield, ShieldAlert, Radio, RefreshCw, Sliders } from "lucide-react";

interface HeaderProps {
  wsConnected: boolean;
  privacyMode: boolean;
  onTogglePrivacy: (enabled: boolean) => void;
  onRefresh: () => void;
  onOpenRulesModal?: () => void;
}

export const Header = ({
  wsConnected,
  privacyMode,
  onTogglePrivacy,
  onRefresh,
  onOpenRulesModal,
}: HeaderProps) => {
  return (
    <header className="border-b border-surface-border bg-surface/50 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              presenced
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono border border-slate-700">
                v0.1.0
              </span>
            </h1>
            <p className="text-xs text-slate-400">Linux Desktop Presence Engine</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2 text-xs">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                wsConnected ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : "bg-amber-400 animate-ping"
              }`}
            />
            <span className="text-slate-300 font-medium">
              {wsConnected ? "Live Connected" : "Connecting..."}
            </span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            title="Refresh daemon state"
            className="p-2 rounded-lg bg-surface border border-surface-border text-slate-400 hover:text-slate-200 hover:bg-surface-hover transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Rules & Priorities Modal */}
          {onOpenRulesModal && (
            <button
              type="button"
              onClick={onOpenRulesModal}
              title="Configure Priority Rules & App Overrides"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-surface-border text-slate-300 hover:bg-surface-hover transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Rules & Priorities
            </button>
          )}

          {/* Privacy Mode Quick Action */}
          <button
            type="button"
            onClick={() => onTogglePrivacy(!privacyMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              privacyMode
                ? "bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-amber-500/20"
                : "bg-surface border border-surface-border text-slate-300 hover:bg-surface-hover"
            }`}
          >
            {privacyMode ? (
              <>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Privacy Active
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 text-slate-400" />
                Privacy Mode
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
