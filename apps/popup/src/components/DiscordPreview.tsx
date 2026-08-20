import { useState, useEffect } from "react";
import { ResolvedPresence } from "@presenced/contracts";
import { MessageSquare, Radio } from "lucide-react";

interface DiscordPreviewProps {
  presence: ResolvedPresence | null | undefined;
  mediaArtUrl?: string | null | undefined;
  discordConnected?: boolean;
}

function formatDuration(sec: number): string {
  if (sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export const DiscordPreview = ({
  presence,
  mediaArtUrl,
  discordConnected = true,
}: DiscordPreviewProps) => {
  const [tickerSec, setTickerSec] = useState(0);

  useEffect(() => {
    if (!presence?.timestamps?.start && !presence?.timestamps?.end) {
      setTickerSec(0);
      return;
    }

    const updateTicker = () => {
      const now = Date.now();
      if (presence.timestamps?.end) {
        const remaining = Math.max(0, Math.floor((presence.timestamps.end - now) / 1000));
        setTickerSec(remaining);
      } else if (presence.timestamps?.start) {
        const elapsed = Math.max(0, Math.floor((now - presence.timestamps.start) / 1000));
        setTickerSec(elapsed);
      }
    };

    updateTicker();
    const interval = setInterval(updateTicker, 1000);
    return () => clearInterval(interval);
  }, [presence]);

  if (!presence) {
    return (
      <div className="p-3.5 rounded-xl bg-surface border border-surface-border select-none text-center py-6 space-y-1">
        <MessageSquare className="w-5 h-5 text-slate-600 mx-auto" />
        <p className="text-xs font-semibold text-slate-400">Discord Presence Idle</p>
        <p className="text-[10px] text-slate-600">No activity currently broadcast to Discord RPC</p>
      </div>
    );
  }

  const firstChar = Array.from(presence.title || "P")[0] ?? "P";
  const isCountdown = !!presence.timestamps?.end;

  return (
    <div className="p-3.5 rounded-xl bg-[#232428] border border-surface-border space-y-2.5 select-none text-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5 text-[#5865F2]" />
          <span>Discord Rich Presence</span>
        </div>
        <span
          className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
            discordConnected
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
          }`}
        >
          {discordConnected ? "RPC Active" : "RPC Offline"}
        </span>
      </div>

      <div className="p-3 rounded-lg bg-[#111214] border border-[#2b2d31] flex items-start gap-3">
        {mediaArtUrl || presence.assets?.largeImage ? (
          <div className="relative flex-shrink-0">
            <img
              src={mediaArtUrl || presence.assets?.largeImage}
              alt="Presence Asset"
              className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-800"
            />
            {presence.assets?.smallImage && (
              <img
                src={presence.assets.smallImage}
                alt="Small Icon"
                className="w-4 h-4 rounded-full absolute -bottom-1 -right-1 border-2 border-[#111214] bg-slate-800"
              />
            )}
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center flex-shrink-0 text-sm font-bold text-[#5865F2]">
            {firstChar}
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 className="text-xs font-bold text-white tracking-tight truncate">
            {presence.title}
          </h3>
          {presence.details && (
            <p className="text-[11px] text-[#dbdee1] truncate">{presence.details}</p>
          )}
          {presence.state && (
            <p className="text-[11px] text-[#949ba4] truncate">{presence.state}</p>
          )}
          {(presence.timestamps?.start || presence.timestamps?.end) && (
            <p className="text-[10px] text-[#949ba4] font-mono pt-0.5 flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
              <span>{isCountdown ? `${formatDuration(tickerSec)} left` : `${formatDuration(tickerSec)} elapsed`}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
