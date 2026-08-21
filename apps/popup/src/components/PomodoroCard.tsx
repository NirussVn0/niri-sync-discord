import { useState } from "react";
import { motion } from "framer-motion";
import { PomodoroFact } from "@presenced/contracts";
import { Clock, Play, Pause, RotateCcw, FastForward } from "lucide-react";
import { springSnap, cardReveal, counterVariants } from "../lib/animations.js";

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

export const PomodoroCard = ({ pomodoro, onStart, onPause, onResume, onStop, onSkip }: PomodoroCardProps) => {
  const [taskInput, setTaskInput] = useState("");

  const status = pomodoro?.status ?? "idle";
  const mode = pomodoro?.mode ?? "focus";
  const remainingSec = pomodoro?.remainingSeconds ?? 25 * 60;
  const currentSession = pomodoro?.currentSession ?? 1;
  const totalSessions = pomodoro?.totalSessions ?? 4;
  const taskName = pomodoro?.currentTask || "Focus Session";

  const getModeLabel = () => {
    switch (mode) {
      case "short_break": return "Short Break";
      case "long_break": return "Long Break";
      default: return "Focus Session";
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case "short_break":
      case "long_break":
        return "text-scene-system-from bg-scene-system-from/10 border-scene-system-from/20";
      default:
        return "text-status-connected bg-status-connected/10 border-status-connected/20";
    }
  };

  return (
    <motion.div
      className="p-3.5 rounded-niri-lg glass-float space-y-3 select-none"
      variants={cardReveal}
      initial="hidden"
      animate="visible"
      custom={0}
    >
      {/* Header with Mode & Session Dots */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-2xs font-semibold text-status-connected">
          <Clock className="w-3.5 h-3.5" />
          <span>Pomodoro</span>
        </div>

        {/* Session Dots */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalSessions }).map((_, idx) => {
            const isCompleted = idx + 1 < currentSession;
            const isCurrent = idx + 1 === currentSession && status === "running";

            return (
              <motion.span
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  isCompleted
                    ? "bg-status-connected"
                    : isCurrent
                    ? "bg-status-connected"
                    : "bg-surface-solid"
                }`}
                animate={isCurrent ? { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                title={`Session ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* Main Countdown Time & Task */}
      <div className="text-center py-2 space-y-1">
        <span className={`text-2xs px-2 py-0.5 rounded-niri font-mono uppercase tracking-wider border ${getModeColor()}`}>
          {getModeLabel()} · {currentSession}/{totalSessions}
        </span>

        <motion.div
          className="text-3xl font-black font-mono tracking-tight text-text-primary pt-1"
          variants={counterVariants}
          initial="initial"
          animate="animate"
          key={remainingSec}
        >
          {formatMinutesSeconds(remainingSec)}
        </motion.div>

        {status === "idle" ? (
          <div className="pt-1 px-4">
            <input
              type="text"
              placeholder="What are you focusing on?"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              className="w-full px-2.5 py-1 text-2xs bg-surface-solid border border-border rounded-niri text-text-primary placeholder-text-ghost focus:outline-none focus:border-accent-primary transition-colors"
            />
          </div>
        ) : (
          <p className="text-xs text-text-secondary font-medium truncate px-4">{taskName}</p>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-2 pt-1">
        {status === "idle" ? (
          <motion.button
            type="button"
            onClick={() => onStart(taskInput)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-niri bg-status-connected hover:bg-status-connected/90 text-white text-xs font-bold shadow-glow-sm transition-colors"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={springSnap}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Focus</span>
          </motion.button>
        ) : status === "running" ? (
          <>
            <motion.button
              type="button"
              onClick={onPause}
              className="flex items-center gap-1 px-3 py-1.5 rounded-niri bg-status-degraded hover:bg-status-degraded/90 text-white text-xs font-bold transition-colors"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={springSnap}
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </motion.button>
            <motion.button
              type="button"
              onClick={onSkip}
              className="p-1.5 rounded-niri glass-surface hover:text-text-primary text-text-secondary transition-colors"
              title="Skip to next session"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={springSnap}
            >
              <FastForward className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              type="button"
              onClick={onStop}
              className="p-1.5 rounded-niri glass-surface hover:text-text-primary text-text-secondary transition-colors"
              title="Reset timer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={springSnap}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              type="button"
              onClick={onResume}
              className="flex items-center gap-1 px-3 py-1.5 rounded-niri bg-status-connected hover:bg-status-connected/90 text-white text-xs font-bold transition-colors"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={springSnap}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume</span>
            </motion.button>
            <motion.button
              type="button"
              onClick={onStop}
              className="p-1.5 rounded-niri glass-surface hover:text-text-primary text-text-secondary transition-colors"
              title="Reset timer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={springSnap}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
};
