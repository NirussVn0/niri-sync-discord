import { ResolvedPresence } from "@presenced/contracts";
import { Gamepad2 } from "lucide-react";

interface DiscordPreviewCardProps {
  presence: ResolvedPresence | null;
}

export const DiscordPreviewCard = ({ presence }: DiscordPreviewCardProps) => {
  return (
    <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-indigo-400" />
          Discord Outgoing Preview
        </h3>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
          Rich Presence RPC
        </span>
      </div>

      {/* Discord Profile Card Simulation */}
      <div className="bg-[#1e1f22] rounded-xl p-4 border border-[#2b2d31] shadow-inner text-slate-200">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#949ba4] mb-3">
          {presence?.category === "music" ? "Listening to Media" : "Playing a Game"}
        </div>

        {presence ? (
          <div className="flex items-start space-x-3.5">
            {/* Discord Activity Icon / Large Image */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-md border border-white/10">
              {presence.title.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="font-bold text-sm text-white truncate">{presence.title}</div>
              {presence.details && (
                <div className="text-xs text-[#dbdee1] truncate">{presence.details}</div>
              )}
              {presence.state && (
                <div className="text-xs text-[#949ba4] truncate">{presence.state}</div>
              )}
              <div className="text-[11px] text-[#949ba4] pt-0.5">
                0:00 elapsed
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-[#949ba4] italic">
            No active Rich Presence published
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-500">
        Shows the exact payload dispatched via local Discord IPC socket. Raw private window titles are filtered by default.
      </p>
    </div>
  );
};
