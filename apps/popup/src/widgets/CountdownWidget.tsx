/**
 * CountdownWidget — glassmorphic countdown timer with urgency indicator.
 */
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { CountdownFact } from "@presenced/contracts";
import { Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { GlassCard } from "./GlassCard.js";
import { springSnap, counterVariants } from "../lib/animations.js";

interface CountdownWidgetProps {
  countdown: CountdownFact | null | undefined;
}

export const CountdownWidget = ({ countdown }: CountdownWidgetProps) => {
  const active = countdown?.activeCountdown;
  const daysRemaining = countdown?.daysRemaining ?? 0;
  const hoursRemaining = countdown?.hoursRemaining ?? 0;
  const isUrgent = daysRemaining <= 7;

  const targetDateStr = active?.targetDate
    ? new Date(active.targetDate).toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <GlassCard glowColor={isUrgent ? "#ef4444" : "#22c55e"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-2xs font-semibold text-accent-primary">
          <Calendar className="w-3.5 h-3.5" />
          <span>Countdown</span>
        </div>

        {/* Urgency badge */}
        <motion.span
          className={`text-2xs px-2 py-0.5 rounded-niri font-mono uppercase font-bold flex items-center gap-1 ${
            isUrgent
              ? "bg-status-error/20 text-status-error border border-status-error/30"
              : "bg-status-connected/10 text-status-connected border border-status-connected/20"
          }`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springSnap}
        >
          {isUrgent ? (
            <AlertTriangle className="w-2.5 h-2.5" />
          ) : (
            <CheckCircle className="w-2.5 h-2.5" />
          )}
          {isUrgent ? "Imminent" : "On Track"}
        </motion.span>
      </div>

      {/* Countdown title */}
      {active ? (
        <h2 className="text-sm font-bold text-text-primary tracking-tight truncate">
          {active.title}
        </h2>
      ) : (
        <h2 className="text-sm font-bold text-text-ghost tracking-tight">
          No Active Countdown
        </h2>
      )}

      {/* Target date */}
      {targetDateStr && (
        <div className="flex items-center gap-1 text-2xs text-text-muted font-mono">
          <Clock className="w-3 h-3 text-text-ghost" />
          <span>Target: {targetDateStr}</span>
        </div>
      )}

      {/* Large remaining numbers */}
      <div className="flex items-baseline gap-1.5 pt-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={daysRemaining}
            variants={counterVariants}
            initial="initial"
            animate="animate"
            className="flex items-baseline gap-1"
          >
            <span
              className={`text-2xl font-black font-mono tracking-tight ${
                isUrgent ? "text-status-error" : "text-status-connected"
              }`}
            >
              {daysRemaining}
            </span>
            <span className="text-xs text-text-muted font-medium">days</span>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={hoursRemaining}
            variants={counterVariants}
            initial="initial"
            animate="animate"
            className="flex items-baseline gap-1 ml-2"
          >
            <span
              className={`text-lg font-bold font-mono ${
                isUrgent ? "text-status-error" : "text-status-connected"
              }`}
            >
              {hoursRemaining}
            </span>
            <span className="text-xs text-text-muted font-medium">hours</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </GlassCard>
  );
};
