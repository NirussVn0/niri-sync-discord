import { CountdownFact, CountdownCategory } from "@presenced/contracts";
import { Calendar, GraduationCap, Briefcase, Plane, Star, Radio } from "lucide-react";

interface CountdownCardProps {
  countdown: CountdownFact | null | undefined;
}

export const CountdownCard = ({ countdown }: CountdownCardProps) => {
  const active = countdown?.activeCountdown;

  const getCategoryIcon = (cat?: CountdownCategory) => {
    switch (cat) {
      case "exam":
        return <GraduationCap className="w-3.5 h-3.5 text-amber-400" />;
      case "project":
        return <Briefcase className="w-3.5 h-3.5 text-sky-400" />;
      case "holiday":
        return <Plane className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Star className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  if (!active) {
    return (
      <div className="p-3.5 rounded-xl bg-surface border border-surface-border select-none text-center py-6 space-y-1">
        <Calendar className="w-5 h-5 text-slate-600 mx-auto" />
        <p className="text-xs font-semibold text-slate-400">No Active Countdown</p>
        <p className="text-[10px] text-slate-600">Add an exam or milestone in Settings</p>
      </div>
    );
  }

  const daysRemaining = countdown.daysRemaining;
  const isUrgent = daysRemaining <= 7;
  const targetDateStr = new Date(active.targetDate).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="p-3.5 rounded-xl bg-surface border border-surface-border space-y-3 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
          {getCategoryIcon(active.category)}
          <span className="capitalize">{active.category} Countdown</span>
        </div>
        {active.showOnDiscord && (
          <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30 font-mono">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            RPC Active
          </span>
        )}
      </div>

      <div className="space-y-1">
        <h2 className="text-sm font-bold text-white tracking-tight truncate">{active.title}</h2>
        <p className="text-[10px] text-slate-400 font-mono">Target: {targetDateStr}</p>
      </div>

      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-surface-border">
        <div className="flex items-baseline gap-1.5">
          <span
            className={`text-2xl font-black font-mono tracking-tight ${
              isUrgent ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {daysRemaining}
          </span>
          <span className="text-xs text-slate-400 font-medium">days</span>
          <span
            className={`text-lg font-bold font-mono ml-2 ${
              isUrgent ? "text-amber-300" : "text-emerald-300"
            }`}
          >
            {countdown.hoursRemaining}
          </span>
          <span className="text-xs text-slate-400 font-medium">hours left</span>
        </div>

        <span
          className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase font-bold ${
            isUrgent
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse"
              : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
          }`}
        >
          {isUrgent ? "Imminent" : "On Track"}
        </span>
      </div>
    </div>
  );
};
