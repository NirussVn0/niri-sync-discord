import {
  Shield,
  ShieldAlert,
  Radio,
  RefreshCw,
  Sliders,
  Pause,
  Play,
  Activity,
  Cpu,
  Settings,
  History,
} from "lucide-react";
import { NavTab } from "../hooks/usePresenceState.js";

interface HeaderProps {
  wsConnected: boolean;
  privacyMode: boolean;
  isPaused: boolean;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onTogglePrivacy: (enabled: boolean) => void;
  onTogglePause: () => void;
  onRefresh: () => void;
}

export const Header = ({
  wsConnected,
  privacyMode,
  isPaused,
  activeTab,
  onTabChange,
  onTogglePrivacy,
  onTogglePause,
  onRefresh,
}: HeaderProps) => {
  const tabs: Array<{ id: NavTab; label: string; keyNum: string; icon: typeof Activity }> = [
    { id: "now", label: "Now", keyNum: "1", icon: Activity },
    { id: "rules", label: "Rules", keyNum: "2", icon: Sliders },
    { id: "integrations", label: "Integrations", keyNum: "3", icon: Cpu },
    { id: "settings", label: "Settings", keyNum: "4", icon: Settings },
    { id: "history", label: "History", keyNum: "5", icon: History },
  ];

  return (
    <header className="border-b border-surface-border bg-surface/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Connection Status */}
        <div className="flex items-center justify-between w-full md:w-auto space-x-3">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20">
              <Radio className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                presenced
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700">
                  v0.1.0
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">Linux Desktop Presence Engine</p>
            </div>
          </div>

          <div className="flex md:hidden items-center space-x-2 text-xs">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                wsConnected ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : "bg-amber-400 animate-ping"
              }`}
            />
            <span className="text-slate-300 font-medium text-xs">
              {wsConnected ? "Live" : "Offline"}
            </span>
          </div>
        </div>

        {/* Segmented Navigation Tabs */}
        <nav
          className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-surface-border/80 shadow-inner max-w-full overflow-x-auto"
          aria-label="Main Navigation"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
                aria-current={isActive ? "page" : undefined}
                title={`Switch to ${tab.label} (Press ${tab.keyNum})`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-mono hidden sm:inline-block ${
                    isActive ? "bg-indigo-700 text-indigo-100" : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {tab.keyNum}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Quick Actions & Status */}
        <div className="flex items-center space-x-2 sm:space-x-3 w-full md:w-auto justify-end">
          {/* Connection Status Desktop */}
          <div className="hidden md:flex items-center space-x-2 text-xs px-2 py-1 bg-surface-border/30 rounded-lg">
            <span
              className={`h-2 w-2 rounded-full ${
                wsConnected ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : "bg-amber-400 animate-ping"
              }`}
            />
            <span className="text-slate-300 font-medium text-[11px]">
              {wsConnected ? "Connected" : "Reconnecting..."}
            </span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            title="Refresh daemon state"
            aria-label="Refresh daemon state"
            className="p-1.5 rounded-lg bg-surface border border-surface-border text-slate-400 hover:text-slate-200 hover:bg-surface-hover transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Pause Presence Quick Action */}
          <button
            type="button"
            onClick={onTogglePause}
            title={isPaused ? "Resume Rich Presence" : "Pause Rich Presence"}
            aria-label={isPaused ? "Resume Rich Presence" : "Pause Rich Presence"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isPaused
                ? "bg-rose-500/20 border border-rose-500/50 text-rose-300 shadow-sm shadow-rose-500/20"
                : "bg-surface border border-surface-border text-slate-300 hover:bg-surface-hover"
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span>Paused</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Pause</span>
              </>
            )}
          </button>

          {/* Privacy Mode Quick Action */}
          <button
            type="button"
            onClick={() => onTogglePrivacy(!privacyMode)}
            title={privacyMode ? "Disable Privacy Mode" : "Enable Privacy Mode"}
            aria-label={privacyMode ? "Disable Privacy Mode" : "Enable Privacy Mode"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              privacyMode
                ? "bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-amber-500/20"
                : "bg-surface border border-surface-border text-slate-300 hover:bg-surface-hover"
            }`}
          >
            {privacyMode ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Private</span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Privacy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
