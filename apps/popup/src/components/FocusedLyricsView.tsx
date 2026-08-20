import { useState, useEffect } from "react";
import { LyricsPayload, MediaFact } from "@presenced/contracts";
import { getActiveLyricLine } from "@presenced/core";
import { Mic2, Sparkles, Music2, AlertCircle } from "lucide-react";

interface FocusedLyricsViewProps {
  lyrics: LyricsPayload | null | undefined;
  media: MediaFact | null | undefined;
}

export const FocusedLyricsView = ({ lyrics, media }: FocusedLyricsViewProps) => {
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

  if (!media) return null;

  if (lyrics === undefined) {
    return (
      <div className="p-3 rounded-xl bg-surface/60 border border-surface-border text-center py-4 space-y-1 select-none">
        <Mic2 className="w-4 h-4 text-slate-500 mx-auto animate-pulse" />
        <p className="text-[11px] text-slate-400 font-mono">Fetching synchronized lyrics...</p>
      </div>
    );
  }

  if (!lyrics || (!lyrics.synced && !lyrics.plainLyrics && !lyrics.instrumental)) {
    return (
      <div className="p-3 rounded-xl bg-surface/60 border border-surface-border flex items-center justify-center gap-2 py-3 text-slate-500 select-none">
        <Mic2 className="w-3.5 h-3.5" />
        <span className="text-xs">No lyrics found for this track</span>
      </div>
    );
  }

  if (lyrics.instrumental) {
    return (
      <div className="p-3 rounded-xl bg-surface/60 border border-surface-border flex items-center justify-center gap-2 py-3 text-sky-400 select-none">
        <Music2 className="w-3.5 h-3.5 animate-bounce" />
        <span className="text-xs font-semibold">Instrumental Track</span>
      </div>
    );
  }

  if (!lyrics.synced && lyrics.plainLyrics) {
    return (
      <div className="p-3 rounded-xl bg-surface/60 border border-surface-border space-y-1 select-none">
        <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
          <AlertCircle className="w-3 h-3 text-amber-400" />
          <span>Plain Lyrics (Unsynced)</span>
        </div>
        <p className="text-xs text-slate-300 italic line-clamp-2 leading-relaxed">
          {lyrics.plainLyrics.split("\n").filter(Boolean).slice(0, 2).join(" · ")}
        </p>
      </div>
    );
  }

  const activeResult = getActiveLyricLine(lyrics.lines, currentPositionMs);
  const activeIndex = activeResult?.index ?? -1;
  const activeLine = activeResult?.line ?? null;
  const prevLine = activeIndex > 0 ? (lyrics.lines[activeIndex - 1] ?? null) : null;
  const nextLine =
    activeIndex >= 0 && activeIndex < lyrics.lines.length - 1
      ? (lyrics.lines[activeIndex + 1] ?? null)
      : null;

  return (
    <div className="p-3 rounded-xl bg-surface border border-surface-border space-y-2 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Synced Lyrics Focus</span>
        </div>
        <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 font-mono border border-indigo-500/20">
          LRCLIB
        </span>
      </div>

      {/* 3-Line Focus Area with Fixed Uniform Heights */}
      <div className="flex flex-col justify-center space-y-1 h-[78px] overflow-hidden text-center">
        {/* Previous Line */}
        <div className="h-5 text-xs text-slate-500 truncate transition-opacity duration-300 opacity-60">
          {prevLine?.text || "..."}
        </div>

        {/* Active Line */}
        <div className="h-6 text-xs font-bold text-indigo-300 tracking-tight truncate flex items-center justify-center gap-1.5 transition-all duration-300 transform scale-[1.02]">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping inline-block flex-shrink-0" />
          <span className="truncate">{activeLine?.text || "♫ ... ♫"}</span>
        </div>

        {/* Next Line */}
        <div className="h-5 text-xs text-slate-500 truncate transition-opacity duration-300 opacity-60">
          {nextLine?.text || "..."}
        </div>
      </div>
    </div>
  );
};
