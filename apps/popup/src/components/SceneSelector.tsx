import { SceneType } from "@presenced/contracts";
import { Sparkles, Music, Crosshair, Clock, Calendar, Cpu, Shield } from "lucide-react";

interface SceneSelectorProps {
  activeSceneType: SceneType;
  onSelectScene: (sceneType: SceneType) => void;
}

const SCENE_OPTIONS: { type: SceneType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: "auto", label: "Auto", icon: Sparkles },
  { type: "music", label: "Music", icon: Music },
  { type: "focus", label: "Focus", icon: Crosshair },
  { type: "pomodoro", label: "Pomo", icon: Clock },
  { type: "countdown", label: "Exam", icon: Calendar },
  { type: "system", label: "Sys", icon: Cpu },
  { type: "privacy", label: "Private", icon: Shield },
];

export const SceneSelector = ({
  activeSceneType,
  onSelectScene,
}: SceneSelectorProps) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
      {SCENE_OPTIONS.map((item) => {
        const Icon = item.icon;
        const isActive = activeSceneType === item.type;

        return (
          <button
            key={item.type}
            type="button"
            onClick={() => onSelectScene(item.type)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
              isActive
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                : "bg-surface border border-surface-border text-slate-400 hover:text-white hover:bg-surface-hover"
            }`}
          >
            <Icon className={`w-3 h-3 ${isActive ? "text-white" : "text-slate-400"}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
