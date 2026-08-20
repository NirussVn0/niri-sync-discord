import { useState, useEffect } from "react";
import { SceneType } from "@presenced/contracts";

interface HeaderWidgetProps {
  wsConnected: boolean;
  workspaceId?: number | null | undefined;
  activeSceneType?: SceneType;
  userName?: string;
}

export const HeaderWidget = ({
  wsConnected,
  workspaceId,
  activeSceneType = "auto",
  userName = "Niruss",
}: HeaderWidgetProps) => {
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const sceneLabels: Record<SceneType, string> = {
    auto: "Auto",
    music: "Music",
    focus: "Focus",
    pomodoro: "Pomodoro",
    countdown: "Countdown",
    system: "System",
    privacy: "Privacy",
    custom: "Custom",
  };

  return (
    <header className="flex items-center justify-between pb-3 border-b border-surface-border/80 select-none">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center font-bold text-xs text-white shadow-md flex-shrink-0">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5 truncate">
            <span>{`${getGreeting()}, ${userName}`}</span>
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                wsConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
              title={wsConnected ? "Daemon Connected" : "Connecting to Daemon..."}
            />
          </h1>
          <p className="text-[10px] text-slate-400 font-mono truncate">
            {dateStr} · {workspaceId != null ? `Workspace ${workspaceId}` : "Niri Wayland"}
          </p>
        </div>
      </div>

      <div className="text-right flex-shrink-0 pl-2">
        <div className="text-sm font-bold font-mono text-white tracking-wider">
          {timeStr || "12:00"}
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono border border-indigo-500/20 capitalize inline-block">
          {sceneLabels[activeSceneType] ?? "Auto"} Scene
        </span>
      </div>
    </header>
  );
};
