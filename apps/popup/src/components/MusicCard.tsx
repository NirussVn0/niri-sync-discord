import { useState, useEffect } from "react";
import { MediaFact } from "@presenced/contracts";
import { Music, Play, Pause, Disc } from "lucide-react";
import { formatTimeMs } from "../utils/time-format.js";

interface MusicCardProps {
  media: MediaFact | null | undefined;
}

export const MusicCard = ({ media }: MusicCardProps) => {
  const [currentPositionMs, setCurrentPositionMs] = useState(0);

  useEffect(() => {
    if (!media) return;

    const basePosition = media.positionAnchorMs ?? 0;
    const anchorTime = media.observedAt;
    const isPlaying = media.playback === "playing";
    const duration = media.durationMs ?? 0;

    const updatePosition = () => {
      if (isPlaying) {
        const elapsed = Date.now() - anchorTime;
        const estimated = basePosition + elapsed;
        setCurrentPositionMs(duration > 0 ? Math.min(estimated, duration) : estimated);
      } else {
        setCurrentPositionMs(basePosition);
      }
    };

    updatePosition();
    if (isPlaying) {
      const interval = setInterval(updatePosition, 250);
      return () => clearInterval(interval);
    }
  }, [media]);

  if (!media) {
    return (
      <div className="p-3.5 rounded-xl bg-surface border border-surface-border select-none text-center py-6 space-y-1">
        <Disc className="w-5 h-5 text-slate-600 mx-auto" />
        <p className="text-xs font-semibold text-slate-400">No Media Playing</p>
        <p className="text-[10px] text-slate-600">MPRIS player offline or paused</p>
      </div>
    );
  }

  const duration = media.durationMs ?? 0;
  const progressPercent = duration > 0 ? Math.min(100, (currentPositionMs / duration) * 100) : 0;
  const isPlaying = media.playback === "playing";

  return (
    <div className="p-3.5 rounded-xl bg-surface border border-surface-border space-y-3 select-none">
      {/* Top Header: Player & Playback State */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
          <Disc className={`w-3.5 h-3.5 ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "4s" }} />
          <span className="capitalize">{media.player}</span>
        </div>
        <span
          className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-mono ${
            isPlaying
              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              : "bg-slate-800 text-slate-400"
          }`}
        >
          {isPlaying ? <Play className="w-2.5 h-2.5 fill-current" /> : <Pause className="w-2.5 h-2.5 fill-current" />}
          {media.playback}
        </span>
      </div>

      {/* Main Track Details */}
      <div className="flex items-center gap-3">
        {media.artUrl ? (
          <img
            src={media.artUrl}
            alt={media.title}
            className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-800 shadow-md flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400">
            <Music className="w-5 h-5" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-white tracking-tight truncate">{media.title}</h2>
          <p className="text-xs text-slate-300 truncate">{media.artist || "Unknown Artist"}</p>
          {media.album && <p className="text-[10px] text-slate-500 truncate">{media.album}</p>}
        </div>
      </div>

      {/* Progress Bar & Timestamps */}
      {duration > 0 && (
        <div className="space-y-1 pt-1">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>{formatTimeMs(currentPositionMs)}</span>
            <span>{formatTimeMs(duration)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
