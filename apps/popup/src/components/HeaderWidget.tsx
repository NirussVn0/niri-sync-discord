import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SceneType } from "@presenced/contracts";
import { getSceneMeta } from "../lib/scene-registry.js";
import { springSnap } from "../lib/animations.js";

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

  const sceneMeta = getSceneMeta(activeSceneType);

  return (
    <header className="flex items-center justify-between pb-3 border-b border-border-subtle select-none">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Avatar with scene-colored ring */}
        <div className="relative">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-glow-sm"
            style={{
              background: `linear-gradient(135deg, ${sceneMeta.colorFrom}, ${sceneMeta.colorTo})`,
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          {/* Connection indicator */}
          <motion.div
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background-solid ${
              wsConnected ? "bg-status-connected" : "bg-status-degraded"
            }`}
            animate={wsConnected ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            title={wsConnected ? "Daemon Connected" : "Connecting..."}
          />
        </div>

        <div className="min-w-0">
          <h1 className="text-xs font-bold tracking-tight text-text-primary flex items-center gap-1.5 truncate">
            <span>{`${getGreeting()}, ${userName}`}</span>
          </h1>
          <p className="text-2xs text-text-muted font-mono truncate">
            {dateStr} · {workspaceId != null ? `Workspace ${workspaceId}` : "Niri Wayland"}
          </p>
        </div>
      </div>

      <div className="text-right flex-shrink-0 pl-2">
        <div className="text-sm font-bold font-mono text-text-primary tracking-wider">
          {timeStr || "12:00"}
        </div>
        <motion.span
          className="text-2xs px-2 py-0.5 rounded-niri font-mono border capitalize inline-block"
          style={{
            backgroundColor: `${sceneMeta.colorFrom}15`,
            color: sceneMeta.colorFrom,
            borderColor: `${sceneMeta.colorFrom}30`,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springSnap}
        >
          {sceneMeta.shortLabel} Scene
        </motion.span>
      </div>
    </header>
  );
};
