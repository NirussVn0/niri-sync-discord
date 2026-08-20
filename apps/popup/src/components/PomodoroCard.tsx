import { useState } from "react";
import { PomodoroFact } from "@presenced/contracts";
import { Clock, Play, Pause, RotateCcw, FastForward } from "lucide-react";

interface PomodoroCardProps {
  pomodoro: PomodoroFact | null | undefined;
  onStart: (taskName?: string) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSkip: () => void;
}

function formatMinutesSeconds(sec: number): string {
  if (sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const PomodoroCard = ({
  pomodoro,
  onStart,
  onPause,
  onResume,
  onStop,
  onSkip,
}: PomodoroCardProps) => {
  const [taskInput, setTaskInput] = useState("");

  const status = pomodoro?.status ?? "idle";
  const mode = pomodoro?.mode ?? "focus";
  const remainingSec = pomodoro?.remainingSeconds ?? 25 * 60;
  const currentSession = pomodoro?.currentSession ?? 1;
  const totalSessions = pomodoro?.totalSessions ?? 4;
  const taskName = pomodoro?.currentTask || "Focus Session";

  const getModeLabel = () => {
    switch (mode) {
      case "short_break":
        return "Short Break";
      case "long_break":
        return "Long Break";
      default:
        return "Focus Session";
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case "short_break":
      case "long_break":
        return "text-sky-400 bg-sky-500/10 border-sky-500/20";
      default:
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  return (
    <div className="p-3.5 rounded-xl bg-surface border border-surface-border space-y-3 select-none">
      {/* Header with Mode & Session Dots */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Pomodoro</span>
        </div>

        {/* 4 Session Dots */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalSessions }).map((_, idx) => {
            const isCompleted = idx + 1 < currentSession;
            const isCurrent = idx + 1 === currentSession && status === "running";

            return (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? "bg-emerald-400"
                    : isCurrent
                    ? "bg-emerald-400 animate-pulse ring-2 ring-emerald-400/30"
                    : "bg-slate-800"
                }`}
                title={`Session ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* Main Countdown Time & Task */}
      <div className="text-center py-2 space-y-1">
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider border ${getModeColor()}`}
        >
          {getModeLabel()} · {currentSession}/{totalSessions}
        </span>

        <div className="text-3xl font-black font-mono tracking-tight text-white pt-1">
          {formatMinutesSeconds(remainingSec)}
        </div>

        {status === "idle" ? (
          <div className="pt-1 px-4">
            <input
              type="text"
              placeholder="What are you focusing on?"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-surface-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        ) : (
          <p className="text-xs text-slate-300 font-medium truncate px-4">{taskName}</p>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-2 pt-1">
        {status === "idle" ? (
          <button
            type="button"
            onClick={() => onStart(taskInput)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Focus</span>
          </button>
        ) : status === "running" ? (
          <>
            <button
              type="button"
              onClick={onPause}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
              title="Skip to next session"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onStop}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
              title="Reset timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onResume}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume</span>
            </button>
            <button
              type="button"
              onClick={onStop}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
              title="Reset timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
