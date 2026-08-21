/**
 * LyricsWidget — glassmorphic 3-line lyrics display with animated transitions.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LyricsPayload, MediaFact } from "@presenced/contracts";
import { getActiveLyricLine } from "@presenced/core";
import { Mic2, Sparkles, Music2 } from "lucide-react";
import { GlassCard } from "./GlassCard.js";
import { lyricLineVariants, springGentle } from "../lib/animations.js";

interface LyricsWidgetProps {
  lyrics: LyricsPayload | null | undefined;
  media: MediaFact | null | undefined;
}

export const LyricsWidget = ({ lyrics, media }: LyricsWidgetProps) => {
  const [currentPositionMs, setCurrentPositionMs] = useState(0);

  // Track playback position for synced lyrics
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
        setCurrentPositionMs(
          duration > 0 ? Math.min(estimated, duration) : estimated,
        );
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

  // No media playing
  if (!media) {
    return (
      <GlassCard>
        <div className="flex flex-col items-center justify-center py-4 space-y-1 select-none">
          <Mic2 className="w-5 h-5 text-text-ghost" />
          <p className="text-xs font-semibold text-text-secondary">
            No Media Playing
          </p>
          <p className="text-2xs text-text-muted">Lyrics need active media</p>
        </div>
      </GlassCard>
    );
  }

  // Loading lyrics
  if (lyrics === undefined) {
    return (
      <GlassCard>
        <div className="flex flex-col items-center justify-center py-4 space-y-1 select-none">
          <Mic2 className="w-5 h-5 text-text-ghost animate-pulse" />
          <p className="text-2xs text-text-muted font-mono">
            Fetching synchronized lyrics...
          </p>
        </div>
      </GlassCard>
    );
  }

  // No lyrics found
  if (
    !lyrics ||
    (!lyrics.synced && !lyrics.plainLyrics && !lyrics.instrumental)
  ) {
    return (
      <GlassCard>
        <div className="flex items-center justify-center gap-2 py-3 text-text-muted select-none">
          <Mic2 className="w-3.5 h-3.5" />
          <span className="text-xs">No lyrics found for this track</span>
        </div>
      </GlassCard>
    );
  }

  // Instrumental track
  if (lyrics.instrumental) {
    return (
      <GlassCard>
        <div className="flex items-center justify-center gap-2 py-3 text-scene-system-from select-none">
          <Music2 className="w-3.5 h-3.5 animate-bounce" />
          <span className="text-xs font-semibold">Instrumental Track</span>
        </div>
      </GlassCard>
    );
  }

  // Plain (unsynced) lyrics
  if (!lyrics.synced && lyrics.plainLyrics) {
    return (
      <GlassCard>
        <div className="space-y-1 select-none">
          <div className="flex items-center gap-1 text-2xs font-semibold text-text-secondary">
            <Mic2 className="w-3 h-3 text-status-degraded" />
            <span>Plain Lyrics (Unsynced)</span>
          </div>
          <p className="text-xs text-text-secondary italic line-clamp-2 leading-relaxed">
            {lyrics.plainLyrics
              .split("\n")
              .filter(Boolean)
              .slice(0, 2)
              .join(" · ")}
          </p>
        </div>
      </GlassCard>
    );
  }

  // Synced lyrics — 3-line focus view
  const activeResult = getActiveLyricLine(lyrics.lines, currentPositionMs);
  const activeIndex = activeResult?.index ?? -1;
  const activeLine = activeResult?.line ?? null;
  const prevLine = activeIndex > 0 ? (lyrics.lines[activeIndex - 1] ?? null) : null;
  const nextLine =
    activeIndex >= 0 && activeIndex < lyrics.lines.length - 1
      ? (lyrics.lines[activeIndex + 1] ?? null)
      : null;

  return (
    <GlassCard glowColor="#a78bfa">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-2xs font-bold text-accent-primary">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Lyrics</span>
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
              <span className="truncate">
                {activeLine?.text || "♫ ... ♫"}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next Line */}
        <div className="h-5 text-xs text-text-muted truncate opacity-60">
          {nextLine?.text || "..."}
        </div>
      </div>
    </GlassCard>
  );
};
