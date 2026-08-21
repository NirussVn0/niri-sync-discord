import { motion } from "framer-motion";
import { CountdownFact, CountdownCategory } from "@presenced/contracts";
import { Calendar, GraduationCap, Briefcase, Plane, Star, Radio } from "lucide-react";
import { cardReveal, counterVariants } from "../lib/animations.js";

interface CountdownCardProps {
  countdown: CountdownFact | null | undefined;
}

export const CountdownCard = ({ countdown }: CountdownCardProps) => {
  const active = countdown?.activeCountdown;

  const getCategoryIcon = (cat?: CountdownCategory) => {
    switch (cat) {
      case "exam":     return <GraduationCap className="w-3.5 h-3.5 text-status-degraded" />;
      case "project":  return <Briefcase className="w-3.5 h-3.5 text-scene-system-from" />;
      case "holiday":  return <Plane className="w-3.5 h-3.5 text-status-error" />;
      default:         return <Star className="w-3.5 h-3.5 text-accent-primary" />;
    }
  };

  if (!active) {
    return (
      <div className="p-3.5 rounded-niri-lg glass-float select-none text-center py-6 space-y-1">
        <Calendar className="w-5 h-5 text-text-ghost mx-auto" />
        <p className="text-xs font-semibold text-text-secondary">No Active Countdown</p>
        <p className="text-2xs text-text-muted">Add an exam or milestone in Settings</p>
      </div>
    );
  }

  const daysRemaining = countdown.daysRemaining;
  const isUrgent = daysRemaining <= 7;
  const targetDateStr = new Date(active.targetDate).toLocaleDateString([], {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <motion.div
      className="p-3.5 rounded-niri-lg glass-float space-y-3 select-none"
      variants={cardReveal}
      initial="hidden"
      animate="visible"
      custom={0}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-2xs font-semibold text-status-degraded">
          {getCategoryIcon(active.category)}
          <span className="capitalize">{active.category} Countdown</span>
        </div>
        {active.showOnDiscord && (
          <span className="flex items-center gap-1 text-2xs px-1.5 py-0.5 rounded-niri bg-scene-discord-from/20 text-scene-discord-from border border-scene-discord-from/30 font-mono">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            RPC Active
          </span>
        )}
      </div>

      <div className="space-y-0.5">
        <h2 className="text-sm font-bold text-text-primary tracking-tight truncate">{active.title}</h2>
        <p className="text-2xs text-text-muted font-mono">Target: {targetDateStr}</p>
      </div>

      <div className="flex items-center justify-between p-2.5 rounded-niri glass-surface">
        <div className="flex items-baseline gap-1.5">
          <motion.span
            className={`text-2xl font-black font-mono tracking-tight ${isUrgent ? "text-status-degraded" : "text-status-connected"}`}
            variants={counterVariants}
            initial="initial"
            animate="animate"
            key={daysRemaining}
          >
            {daysRemaining}
          </motion.span>
          <span className="text-xs text-text-muted font-medium">days</span>
          <span className={`text-lg font-bold font-mono ml-2 ${isUrgent ? "text-status-degraded" : "text-status-connected"}`}>
            {countdown.hoursRemaining}
          </span>
          <span className="text-xs text-text-muted font-medium">hours left</span>
        </div>

        <span
          className={`text-2xs px-2 py-0.5 rounded-niri font-mono uppercase font-bold ${
            isUrgent
              ? "bg-status-error/20 text-status-error border border-status-error/30"
              : "bg-status-connected/10 text-status-connected border border-status-connected/20"
          }`}
        >
          {isUrgent ? "Imminent" : "On Track"}
        </span>
      </div>
    </motion.div>
  );
};
