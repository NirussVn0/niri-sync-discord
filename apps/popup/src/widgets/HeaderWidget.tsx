/**
 * HeaderWidget — clock + avatar + connection indicator.
 */
import { useState, useEffect } from "react";
import { SceneType } from "@presenced/contracts";
import { getSceneMeta } from "../lib/scene-registry.js";

interface HeaderWidgetProps {
  wsConnected: boolean;
  activeSceneType?: SceneType;
  userName?: string;
}

export const HeaderWidget = ({
  wsConnected,
  activeSceneType = "auto",
  userName = "Niruss",
}: HeaderWidgetProps) => {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const update = () => {
      setTimeStr(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      );
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, []);

  const sceneMeta = getSceneMeta(activeSceneType);

  return (
    <div className="flex items-center gap-2.5 min-w-0">
      {/* Clock */}
      <div className="text-sm font-bold font-mono text-text-primary tracking-wider">
        {timeStr || "12:00"}
      </div>

      {/* Avatar */}
      <div className="relative">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-2xs text-white shadow-glow-sm"
          style={{
            background: `linear-gradient(135deg, ${sceneMeta.colorFrom}, ${sceneMeta.colorTo})`,
          }}
        >
          {userName.charAt(0).toUpperCase()}
        </div>
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background-solid ${
            wsConnected ? "bg-status-connected" : "bg-status-degraded"
          }`}
        />
      </div>
    </div>
  );
};
