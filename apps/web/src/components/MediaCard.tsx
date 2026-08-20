import { useState, useEffect } from "react";
import { MediaFact } from "@presenced/contracts";
import { Disc3, Play, Pause } from "lucide-react";

interface MediaCardProps {
  media: MediaFact | null;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export const MediaCard = ({ media }: MediaCardProps) => {
  const [estimatedPositionMs, setEstimatedPositionMs] = useState(0);

  useEffect(() => {
    if (!media) {
      setEstimatedPositionMs(0);
      return;
    }

    const anchorPos = media.positionAnchorMs ?? 0;
    const anchorMonotonic = media.anchorMonotonicMs ?? performance.now();
    const isPlaying = media.playback === "playing";

    if (!isPlaying) {
      setEstimatedPositionMs(anchorPos);
      return;
    }

    // Update position smoothly every 250ms
    const interval = setInterval(() => {
      const elapsed = Math.max(0, performance.now() - anchorMonotonic);
      const current = anchorPos + elapsed;
      if (media.durationMs && current > media.durationMs) {
        setEstimatedPositionMs(media.durationMs);
      } else {
        setEstimatedPositionMs(current);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [media]);

  if (!media) {
    return null;
  }

  const durationMs = media.durationMs ?? 0;
  const progressPercent =
    durationMs > 0
      ? Math.min(100, Math.max(0, (estimatedPositionMs / durationMs) * 100))
      : 0;

  return (
    <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-xl relative overflow-hidden space-y-4">
      {/* Accent glow from artwork */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-pink-500/10 text-pink-400">
            <Disc3 className="w-4 h-4 animate-spin-slow" />
          </span>
          <span className="text-xs font-semibold text-slate-300">Now Playing Media</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {media.player}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
              media.playback === "playing"
                ? "bg-pink-500/10 border-pink-500/30 text-pink-400"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            {media.playback === "playing" ? (
              <>
                <Play className="w-2.5 h-2.5 fill-pink-400" />
                Playing
              </>
            ) : (
              <>
                <Pause className="w-2.5 h-2.5" />
                Paused
              </>
            )}
          </span>
        </div>
      </div>

      <div className="flex items-start gap-4">
        {/* Album Artwork or Fallback Disc */}
        <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-md">
          {media.artUrl ? (
            <img
              src={media.artUrl}
              alt={media.title ?? "Album art"}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to icon on image error
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <Disc3 className="w-8 h-8 text-slate-600" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <h4 className="text-base font-bold text-white truncate">
            {media.title ?? "Unknown Title"}
          </h4>
          {media.artist && (
            <p className="text-xs font-medium text-slate-300 truncate">{media.artist}</p>
          )}
          {media.album && (
            <p className="text-xs text-slate-400 truncate">{media.album}</p>
          )}
        </div>
      </div>

      {/* Playback Progress Bar */}
      {durationMs > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 to-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>{formatTime(estimatedPositionMs)}</span>
            <span>{formatTime(durationMs)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
