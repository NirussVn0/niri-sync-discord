import { useState, useEffect } from "react";
import { Sparkles, Radio, Shield, Settings, Music, Clock } from "lucide-react";

export function App() {
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      );
      setDateStr(
        now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-[380px] min-h-[540px] max-h-[640px] bg-background/95 backdrop-blur-md border border-surface-border rounded-2xl p-4 text-slate-100 flex flex-col justify-between shadow-2xl select-none font-sans overflow-hidden">
      {/* Top Profile / Greeting Row */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-border/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center font-bold text-xs text-white shadow-md">
            N
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              Good day, Niruss
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              {dateStr} · Niri Wayland
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-bold font-mono text-white tracking-wider">
            {timeStr || "12:00"}
          </div>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 font-mono border border-indigo-500/20">
            Auto Scene
          </span>
        </div>
      </div>

      {/* Main Companion Body */}
      <div className="py-4 space-y-3 flex-1 flex flex-col justify-center">
        {/* Compact Media / Activity Hero */}
        <div className="p-3.5 rounded-xl bg-surface border border-surface-border space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
              <Music className="w-3.5 h-3.5" />
              <span>Active Context</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              Connecting...
            </span>
          </div>

          <div className="text-center py-4 space-y-1">
            <Radio className="w-6 h-6 text-slate-500 mx-auto animate-pulse" />
            <p className="text-xs font-medium text-slate-300">presenced daemon standby</p>
            <p className="text-[10px] text-slate-500">
              Awaiting Niri IPC / MPRIS media events
            </p>
          </div>
        </div>

        {/* Focus / Pomodoro Mini Chip */}
        <div className="p-3 rounded-xl bg-surface/60 border border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-xs font-semibold text-slate-200">Pomodoro Focus</div>
              <div className="text-[10px] text-slate-400">25:00 · Ready to start</div>
            </div>
          </div>
          <button
            type="button"
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors"
          >
            Start
          </button>
        </div>
      </div>

      {/* Footer Quick Controls */}
      <div className="pt-3 border-t border-surface-border/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-white transition-colors"
            title="Privacy Mode"
          >
            <Shield className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-white transition-colors"
            title="Custom Scene"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono">v0.2.0</span>
          <button
            type="button"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
