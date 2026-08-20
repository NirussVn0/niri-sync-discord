import { useState, useEffect } from "react";
import { ResolvedPresence } from "@presenced/contracts";
import { Gamepad2, Disc3 } from "lucide-react";

interface DiscordPreviewCardProps {
  presence: ResolvedPresence | null;
  mediaArtUrl?: string | null | undefined;
}

function formatDuration(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const remainingS = s % 60;
  return `${m}:${remainingS.toString().padStart(2, "0")}`;
}

export const DiscordPreviewCard = ({ presence, mediaArtUrl }: DiscordPreviewCardProps) => {
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [remainingSec, setRemainingSec] = useState<number | null>(null);

  useEffect(() => {
    if (!presence?.timestamps?.start) {
      setElapsedSec(0);
      setRemainingSec(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const start = presence.timestamps?.start ?? now;
      const elapsed = Math.max(0, (now - start) / 1000);
      setElapsedSec(elapsed);

      if (presence.timestamps?.end) {
        const remaining = Math.max(0, (presence.timestamps.end - now) / 1000);
        setRemainingSec(remaining);
      } else {
        setRemainingSec(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [presence?.timestamps?.start, presence?.timestamps?.end]);

  const firstChar = presence?.title ? Array.from(presence.title)[0]?.toUpperCase() || "P" : "?";
  const artwork = presence?.assets?.largeImage || mediaArtUrl;

  return (
    <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-indigo-400" />
          Discord Outgoing Preview
        </h3>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
          SET_ACTIVITY RPC
        </span>
      </div>

      {/* Discord Profile Card Simulation */}
      <div className="bg-[#1e1f22] rounded-xl p-4 border border-[#2b2d31] shadow-inner text-slate-200">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#949ba4] mb-3 flex items-center justify-between">
          <span>{presence?.category === "music" ? "Listening to Spotify" : "Playing a Game"}</span>
          {presence?.category === "music" && <Disc3 className="w-3.5 h-3.5 animate-spin text-pink-400" />}
        </div>

        {presence ? (
          <div className="flex items-start space-x-3.5">
            {/* Discord Activity Icon / Artwork */}
            {artwork ? (
              <img
                src={artwork}
                alt="Activity Art"
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-md border border-white/10"
                onError={(e) => {
                  // Fallback on broken image url
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-md border border-white/10">
                {firstChar}
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="font-bold text-sm text-white truncate" title={presence.title}>
                {presence.title}
              </div>
              {presence.details && (
                <div className="text-xs text-[#dbdee1] truncate" title={presence.details}>
                  {presence.details}
                </div>
              )}
              {presence.state && (
                <div className="text-xs text-[#949ba4] truncate" title={presence.state}>
                  {presence.state}
                </div>
              )}
              <div className="text-[11px] text-[#949ba4] pt-0.5 font-mono">
                {remainingSec !== null
                  ? `${formatDuration(elapsedSec)} / ${formatDuration(elapsedSec + remainingSec)} (${formatDuration(remainingSec)} left)`
                  : `${formatDuration(elapsedSec)} elapsed`}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-[#949ba4] italic">
            No active Rich Presence published (cleared)
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        Exact simulated rendering of the frame dispatched to your local Discord client. Window titles are filtered according to your active privacy rules.
      </p>
    </div>
  );
};
