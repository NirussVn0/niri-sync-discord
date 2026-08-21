/**
 * PomodoroWidget — compact glassmorphic timer with SVG ring, session dots, and a single action button.
 */
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard.js";
import { springSnap } from "../lib/animations.js";
import { Play, Pause, RotateCcw, FastForward, Timer } from "lucide-react";
import type { PomodoroFact } from "@presenced/contracts";

interface PomodoroWidgetProps {
  pomodoro: PomodoroFact | null | undefined;
  onStart: (taskName?: string) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSkip: () => void;
}

// ── Helpers ─────────────────────────────────────────────────────────────

function formatTime(sec: number): string {
  if (sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function modeLabel(mode: PomodoroFact["mode"]): string {
  switch (mode) {
    case "short_break": return "Break";
    case "long_break": return "Long Break";
    default: return "Focus";
  }
}

// ── SVG Timer Ring ──────────────────────────────────────────────────────

const RING_SIZE = 120;
const RING_STROKE = 5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface TimerRingProps {
  progress: number; // 0 → 1
  color: string;
  pulseClass?: string;
}

const TimerRing: React.FC<TimerRingProps> = ({ progress, color, pulseClass }) => {
  const offset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <svg
      width={RING_SIZE}
      height={RING_SIZE}
      viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      className="drop-shadow-lg"
    >
      {/* Track */}
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={RING_STROKE}
      />
      {/* Progress arc */}
      <motion.circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={RING_STROKE}
        strokeLinecap="round"
        strokeDasharray={RING_CIRCUMFERENCE}
        initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
        animate={{ strokeDashoffset: offset }}
        transition={{ type: "spring", damping: 30, stiffness: 120, mass: 1 }}
        transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        className={pulseClass}
      />
      {/* Glow tip on the progress arc */}
      {progress > 0.01 && (
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={RING_STROKE + 4}
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          opacity={0.2}
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          filter="blur(4px)"
        />
      )}
    </svg>
  );
};

// ── Session Dots ────────────────────────────────────────────────────────

interface SessionDotsProps {
  current: number;
  total: number;
  isActive: boolean;
}

const SessionDots: React.FC<SessionDotsProps> = ({ current, total, isActive }) => (
  <div className="flex items-center justify-center gap-1.5">
    {Array.from({ length: total }).map((_, i) => {
      const done = i + 1 < current;
      const isCurrent = i + 1 === current && isActive;
      return (
        <motion.span
          key={i}
          className={`rounded-full transition-colors ${
            done
              ? "bg-status-connected"
              : isCurrent
              ? "bg-status-connected"
              : "bg-white/10"
          }`}
          style={{ width: 8, height: 8 }}
          animate={
            isCurrent
              ? { scale: [1, 1.35, 1], opacity: [0.6, 1, 0.6] }
              : { scale: 1, opacity: done ? 0.9 : 0.35 }
          }
          transition={
            isCurrent
              ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.3 }
          }
        />
      );
    })}
  </div>
);

// ── Action Button ───────────────────────────────────────────────────────

interface ActionButtonProps {
  status: PomodoroFact["status"];
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSkip: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  status,
  onStart,
  onPause,
  onResume,
  onStop,
  onSkip,
}) => {
  if (status === "idle") {
    return (
      <motion.button
        type="button"
        onClick={onStart}
        className="flex items-center gap-1.5 px-5 py-1.5 rounded-niri bg-status-connected hover:brightness-110 text-white text-xs font-bold shadow-glow-sm transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        transition={springSnap}
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>Start</span>
      </motion.button>
    );
  }

  if (status === "running") {
    return (
      <div className="flex items-center gap-1.5">
        <motion.button
          type="button"
          onClick={onPause}
          className="flex items-center gap-1 px-4 py-1.5 rounded-niri bg-status-degraded hover:brightness-110 text-white text-xs font-bold transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          transition={springSnap}
        >
          <Pause className="w-3.5 h-3.5 fill-current" />
          <span>Pause</span>
        </motion.button>
        <motion.button
          type="button"
          onClick={onSkip}
          className="p-1.5 rounded-niri glass-surface hover:text-text-primary text-text-secondary transition-colors"
          title="Skip session"
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.88 }}
          transition={springSnap}
        >
          <FastForward className="w-3.5 h-3.5" />
        </motion.button>
        <motion.button
          type="button"
          onClick={onStop}
          className="p-1.5 rounded-niri glass-surface hover:text-text-primary text-text-secondary transition-colors"
          title="Reset timer"
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.88 }}
          transition={springSnap}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    );
  }

  // paused
  return (
    <div className="flex items-center gap-1.5">
      <motion.button
        type="button"
        onClick={onResume}
        className="flex items-center gap-1 px-4 py-1.5 rounded-niri bg-status-connected hover:brightness-110 text-white text-xs font-bold shadow-glow-sm transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
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
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.88 }}
        transition={springSnap}
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </motion.button>
    </div>
  );
};

// ── Main Widget ─────────────────────────────────────────────────────────

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({
  pomodoro,
  onStart,
  onPause,
  onResume,
  onStop,
  onSkip,
}) => {
  const status = pomodoro?.status ?? "idle";
  const mode = pomodoro?.mode ?? "focus";
  const remaining = pomodoro?.remainingSeconds ?? 25 * 60;
  const total = pomodoro?.totalDurationSeconds ?? 25 * 60;
  const currentSession = pomodoro?.currentSession ?? 1;
  const totalSessions = pomodoro?.totalSessions ?? 4;

  const progress = total > 0 ? remaining / total : 1;
  const isRunning = status === "running";

  // Mode-dependent ring colour
  const ringColor = useMemo(() => {
    switch (mode) {
      case "short_break":
      case "long_break":
        return "#facc15"; // amber-400
      default:
        return "#34d399"; // emerald-400
    }
  }, [mode]);

  return (
    <GlassCard className="flex flex-col items-center gap-2.5 py-3 px-4" glowColor={ringColor}>
      {/* Mode badge */}
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
        <Timer className="w-3 h-3 opacity-60" />
        <span>{modeLabel(mode)}</span>
        <span className="text-text-ghost">
          {currentSession}/{totalSessions}
        </span>
      </div>

      {/* Timer ring with time inside */}
      <div className="relative flex items-center justify-center">
        <TimerRing
          progress={progress}
          color={ringColor}
        />
        {/* Time display centred over ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black font-mono tracking-tight text-text-primary leading-none select-none">
            {formatTime(remaining)}
          </span>
        </div>
      </div>

      {/* Session dots */}
      <SessionDots
        current={currentSession}
        total={totalSessions}
        isActive={isRunning}
      />

      {/* Action buttons */}
      <div className="pt-0.5">
        <ActionButton
          status={status}
          onStart={() => onStart()}
          onPause={onPause}
          onResume={onResume}
          onStop={onStop}
          onSkip={onSkip}
        />
      </div>
    </GlassCard>
  );
};
