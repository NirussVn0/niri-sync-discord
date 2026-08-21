/**
 * MusicWidget — glassmorphic music widget with spinning vinyl disc,
 * track info, playback controls, and audio waveform visualization.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MediaFact } from "@presenced/contracts";
import { Music, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { formatTimeMs } from "../utils/time-format.js";
import { GlassCard } from "./GlassCard.js";
import { VinylDisc } from "./VinylDisc.js";
import { AudioWaveform } from "../components/AudioWaveform.js";
import { springSnap } from "../lib/animations.js";

interface MusicWidgetProps {
  media: MediaFact | null | undefined;
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export const MusicWidget = ({
  media,
  onPlayPause,
  onNext,
  onPrevious,
}: MusicWidgetProps) => {
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

  if (!media) {
    return (
      <GlassCard>
        <div className="flex flex-col items-center justify-center py-6 gap-1.5">
          <Music className="w-5 h-5 text-text-ghost" />
          <p className="text-xs font-semibold text-text-secondary">
            No Media Playing
          </p>
          <p className="text-2xs text-text-muted">MPRIS player offline</p>
        </div>
      </GlassCard>
    );
  }

  const duration = media.durationMs ?? 0;
  const isPlaying = media.playback === "playing";

  return (
    <GlassCard glowColor="#a78bfa">
      <div className="space-y-3 select-none">
        {/* Main row: vinyl disc + track info */}
        <div className="flex items-center gap-3">
          <VinylDisc
            isPlaying={isPlaying}
            artUrl={media.artUrl ?? null}
            size={48}
          />

          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-text-primary tracking-tight truncate">
              {media.title ?? "Untitled"}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {media.artist || "Unknown Artist"}
            </p>
            {media.album && (
              <p className="text-2xs text-text-muted truncate">
                {media.album}
              </p>
            )}
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-2">
          {onPrevious && (
            <motion.button
              type="button"
              onClick={onPrevious}
              className="p-1.5 rounded-niri glass-surface text-text-secondary hover:text-text-primary transition-colors"
              title="Previous Track"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              transition={springSnap}
            >
              <SkipBack className="w-3.5 h-3.5" />
            </motion.button>
          )}

          <motion.button
            type="button"
            onClick={onPlayPause}
            className={`flex items-center justify-center w-8 h-8 rounded-niri transition-colors ${
              isPlaying
                ? "bg-status-connected/10 text-status-connected border border-status-connected/20 hover:bg-status-connected/20"
                : "glass-surface text-text-secondary hover:text-text-primary"
            }`}
            title={isPlaying ? "Pause Playback" : "Resume Playback"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={springSnap}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </motion.button>

          {onNext && (
            <motion.button
              type="button"
              onClick={onNext}
              className="p-1.5 rounded-niri glass-surface text-text-secondary hover:text-text-primary transition-colors"
              title="Next Track"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              transition={springSnap}
            >
              <SkipForward className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>

        {/* Waveform + timestamps */}
        {duration > 0 && (
          <div className="space-y-1">
            <AudioWaveform
              positionMs={currentPositionMs}
              durationMs={duration}
              isPlaying={isPlaying}
              color="#a78bfa"
              height={28}
              bars={24}
            />
            <div className="flex items-center justify-between text-2xs font-mono text-text-muted">
              <span>{formatTimeMs(currentPositionMs)}</span>
              <span>{formatTimeMs(duration)}</span>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
