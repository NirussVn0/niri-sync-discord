import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MediaFact } from "@presenced/contracts";
import { Music, Play, Pause, Disc, SkipBack, SkipForward } from "lucide-react";
import { formatTimeMs } from "../utils/time-format.js";
import { springSnap } from "../lib/animations.js";
import { AudioWaveform } from "./AudioWaveform.js";

interface MusicCardProps {
  media: MediaFact | null | undefined;
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export const MusicCard = ({
  media,
  onPlayPause,
  onNext,
  onPrevious,
}: MusicCardProps) => {
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
      <div className="p-3.5 rounded-niri-lg glass-float select-none text-center py-6 space-y-1">
        <Disc className="w-5 h-5 text-text-ghost mx-auto" />
        <p className="text-xs font-semibold text-text-secondary">No Media Playing</p>
        <p className="text-2xs text-text-muted">MPRIS player offline or paused</p>
      </div>
    );
  }

  const duration = media.durationMs ?? 0;
  const isPlaying = media.playback === "playing";

  return (
    <div className="p-3.5 rounded-niri-lg glass-float space-y-3 select-none">
      {/* Top Header: Player & Playback State & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-2xs font-semibold text-scene-music-from">
          <Disc className={`w-3.5 h-3.5 ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "4s" }} />
          <span className="capitalize">{media.player}</span>
        </div>

        <div className="flex items-center gap-1">
          {onPrevious && (
            <motion.button
              type="button"
              onClick={onPrevious}
              className="p-1 rounded-niri glass-surface text-text-secondary hover:text-text-primary transition-colors"
              title="Previous Track"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              transition={springSnap}
            >
              <SkipBack className="w-3 h-3" />
            </motion.button>
          )}

          <motion.button
            type="button"
            onClick={onPlayPause}
            className={`flex items-center gap-1 text-2xs px-2.5 py-1 rounded-niri font-mono transition-colors ${
              isPlaying
                ? "bg-status-connected/10 text-status-connected border border-status-connected/20 hover:bg-status-connected/20"
                : "glass-surface text-text-secondary hover:text-text-primary"
            }`}
            title={isPlaying ? "Pause Playback" : "Resume Playback"}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={springSnap}
          >
            {isPlaying ? <Pause className="w-2.5 h-2.5 fill-current" /> : <Play className="w-2.5 h-2.5 fill-current" />}
            {media.playback}
          </motion.button>

          {onNext && (
            <motion.button
              type="button"
              onClick={onNext}
              className="p-1 rounded-niri glass-surface text-text-secondary hover:text-text-primary transition-colors"
              title="Next Track"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              transition={springSnap}
            >
              <SkipForward className="w-3 h-3" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Main Track Details */}
      <div className="flex items-center gap-3">
        {media.artUrl ? (
          <motion.img
            src={media.artUrl}
            alt={media.title}
            className="w-12 h-12 rounded-niri object-cover bg-surface-solid border border-border shadow-glow-sm flex-shrink-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springSnap}
          />
        ) : (
          <div className="w-12 h-12 rounded-niri bg-scene-music-from/10 border border-scene-music-from/20 flex items-center justify-center flex-shrink-0 text-scene-music-from">
            <Music className="w-5 h-5" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-text-primary tracking-tight truncate">{media.title}</h2>
          <p className="text-xs text-text-secondary truncate">{media.artist || "Unknown Artist"}</p>
          {media.album && <p className="text-2xs text-text-muted truncate">{media.album}</p>}
        </div>
      </div>

      {/* Waveform Visualization & Timestamps */}
      {duration > 0 && (
        <div className="space-y-1 pt-1">
          <AudioWaveform
            positionMs={currentPositionMs}
            durationMs={duration}
            isPlaying={isPlaying}
            color="#a78bfa"
            height={28}
            bars={48}
          />
          <div className="flex items-center justify-between text-2xs font-mono text-text-muted">
            <span>{formatTimeMs(currentPositionMs)}</span>
            <span>{formatTimeMs(duration)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
