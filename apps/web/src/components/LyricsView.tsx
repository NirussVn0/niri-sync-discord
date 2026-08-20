import { useState, useEffect, useRef } from "react";
import { LyricsPayload, MediaFact } from "@presenced/contracts";
import { getActiveLyricLine } from "@presenced/core";
import { Mic2, Sparkles, Music2, AlertCircle } from "lucide-react";

interface LyricsViewProps {
  lyrics: LyricsPayload | null | undefined;
  media: MediaFact | null;
}

export const LyricsView = ({ lyrics, media }: LyricsViewProps) => {
  const [estimatedPositionMs, setEstimatedPositionMs] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync clock position
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

    const interval = setInterval(() => {
      const elapsed = Math.max(0, performance.now() - anchorMonotonic);
      const current = anchorPos + elapsed;
      setEstimatedPositionMs(current);
    }, 100);

    return () => clearInterval(interval);
  }, [media]);

  // Compute active lyric line
  useEffect(() => {
    if (!lyrics || !lyrics.synced || lyrics.lines.length === 0) {
      setActiveIndex(null);
      return;
    }

    const active = getActiveLyricLine(lyrics.lines, estimatedPositionMs);
    setActiveIndex(active?.index ?? null);
  }, [lyrics, estimatedPositionMs]);

  // Container-relative smooth scrolling to prevent browser page jumping
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeEl = activeLineRef.current;
      const targetTop =
        activeEl.offsetTop - container.offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      container.scrollTo({
        top: Math.max(0, targetTop),
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }
  }, [activeIndex]);

  if (!media) {
    return null;
  }

  const confidencePercent = lyrics?.matchConfidence ? Math.round(lyrics.matchConfidence * 100) : 100;

  return (
    <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-400">
            <Mic2 className="w-4 h-4" />
          </span>
          <h3 className="text-xs font-semibold text-slate-300">Synchronized Lyrics</h3>
        </div>

        <div className="flex items-center gap-2">
          {lyrics?.synced && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3 h-3" />
              Synced ({confidencePercent}%)
            </span>
          )}
          {lyrics && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
              {lyrics.provider}
            </span>
          )}
        </div>
      </div>

      {lyrics?.instrumental ? (
        <div className="py-8 text-center space-y-2">
          <Music2 className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-medium text-slate-300">Instrumental Track</p>
          <p className="text-xs text-slate-500">No vocals present in LRCLIB record.</p>
        </div>
      ) : lyrics?.synced && lyrics.lines.length > 0 ? (
        <div
          ref={containerRef}
          className="max-h-72 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-slate-800"
          tabIndex={0}
          aria-label="Synchronized lyrics stream"
        >
          {lyrics.lines.map((line, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={`${line.atMs}-${idx}`}
                ref={isActive ? activeLineRef : null}
                className={`transition-colors duration-200 px-3 py-2 rounded-lg text-center leading-relaxed select-none text-sm ${
                  isActive
                    ? "font-semibold text-white bg-indigo-950/40 border border-indigo-500/30 shadow-sm"
                    : "text-slate-500 hover:text-slate-400"
                }`}
              >
                {line.text || "♪ ♪ ♪"}
              </div>
            );
          })}
        </div>
      ) : lyrics?.plainLyrics ? (
        <div className="max-h-64 overflow-y-auto whitespace-pre-wrap text-center text-xs text-slate-400 leading-relaxed p-2 font-sans">
          {lyrics.plainLyrics}
        </div>
      ) : (
        <div className="py-6 text-center space-y-2 text-slate-500">
          <AlertCircle className="w-6 h-6 mx-auto text-slate-600" />
          <p className="text-xs">No lyrics found for "{media.title}"</p>
        </div>
      )}
    </div>
  );
};
