import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LyricsPayload, MediaFact } from "@presenced/contracts";
import { getActiveLyricLine } from "@presenced/core";
import { Mic2, Sparkles, Music2, AlertCircle } from "lucide-react";
import { lyricLineVariants, springGentle, cardReveal } from "../lib/animations.js";

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
      <div className="p-3 rounded-niri-lg glass-surface text-center py-4 space-y-1 select-none">
        <Mic2 className="w-4 h-4 text-text-ghost mx-auto animate-pulse" />
        <p className="text-2xs text-text-muted font-mono">Fetching synchronized lyrics...</p>
      </div>
    );
  }

  if (!lyrics || (!lyrics.synced && !lyrics.plainLyrics && !lyrics.instrumental)) {
    return (
      <div className="p-3 rounded-niri-lg glass-surface flex items-center justify-center gap-2 py-3 text-text-muted select-none">
        <Mic2 className="w-3.5 h-3.5" />
        <span className="text-xs">No lyrics found for this track</span>
      </div>
    );
  }

  if (lyrics.instrumental) {
    return (
      <div className="p-3 rounded-niri-lg glass-surface flex items-center justify-center gap-2 py-3 text-scene-system-from select-none">
        <Music2 className="w-3.5 h-3.5 animate-bounce" />
        <span className="text-xs font-semibold">Instrumental Track</span>
      </div>
    );
  }

  if (!lyrics.synced && lyrics.plainLyrics) {
    return (
      <motion.div
        className="p-3 rounded-niri-lg glass-surface space-y-1 select-none"
        variants={cardReveal}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        <div className="flex items-center gap-1 text-2xs font-semibold text-text-secondary">
          <AlertCircle className="w-3 h-3 text-status-degraded" />
          <span>Plain Lyrics (Unsynced)</span>
        </div>
        <p className="text-xs text-text-secondary italic line-clamp-2 leading-relaxed">
          {lyrics.plainLyrics.split("\n").filter(Boolean).slice(0, 2).join(" · ")}
        </p>
      </motion.div>
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
    <motion.div
      className="p-3 rounded-niri-lg glass-float space-y-2 select-none"
      variants={cardReveal}
      initial="hidden"
      animate="visible"
      custom={0}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-2xs font-bold text-accent-primary">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Synced Lyrics Focus</span>
        </div>
        <span className="text-2xs px-1.5 py-0.2 rounded-niri bg-accent-primary/10 text-accent-primary font-mono border border-accent-primary/20">
          LRCLIB
        </span>
      </div>

      {/* 3-Line Focus Area with animated transitions */}
      <div className="flex flex-col justify-center space-y-1 h-[78px] overflow-hidden text-center">
        {/* Previous Line */}
        <div className="h-5 text-xs text-text-muted truncate opacity-60">
          {prevLine?.text || "..."}
        </div>

        {/* Active Line — animated */}
        <div className="h-6 flex items-center justify-center gap-1.5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLine?.text ?? "empty"}
              variants={lyricLineVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={springGentle}
              className="text-xs font-bold text-accent-primary tracking-tight truncate flex items-center justify-center gap-1.5"
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-accent-primary inline-block flex-shrink-0"
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="truncate">{activeLine?.text || "♫ ... ♫"}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next Line */}
        <div className="h-5 text-xs text-text-muted truncate opacity-60">
          {nextLine?.text || "..."}
        </div>
      </div>
    </motion.div>
  );
};
