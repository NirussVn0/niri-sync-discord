/**
 * AudioWaveform — animated SVG waveform visualization.
 *
 * Renders a procedural sine-based waveform that reacts to playback state.
 * Used as a progress indicator in MusicCard, replacing the straight progress bar.
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface AudioWaveformProps {
  /** Current position in ms */
  positionMs: number;
  /** Total duration in ms */
  durationMs: number;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Waveform color (CSS color) */
  color?: string;
  /** Height in px */
  height?: number;
  /** Number of bars */
  bars?: number;
}

export const AudioWaveform = ({
  positionMs,
  durationMs,
  isPlaying,
  color = "#a78bfa",
  height = 32,
  bars = 48,
}: AudioWaveformProps) => {
  const [animPhase, setAnimPhase] = useState(0);
  const rafRef = useRef<number>(0);

  // Animate waveform phase when playing
  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = performance.now();
    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setAnimPhase((prev) => (prev + dt * 2) % (Math.PI * 2));
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying]);

  const progress = durationMs > 0 ? Math.min(1, positionMs / durationMs) : 0;
  const centerY = height / 2;
  const barWidth = 2;
  const gap = 1.5;

  // Generate waveform bars
  const barHeights: number[] = [];
  for (let i = 0; i < bars; i++) {
    const x = i / bars;
    // Multiple sine waves for organic feel
    const h1 = Math.sin(x * Math.PI * 3 + animPhase) * 0.3;
    const h2 = Math.sin(x * Math.PI * 7 + animPhase * 1.3) * 0.2;
    const h3 = Math.sin(x * Math.PI * 11 + animPhase * 0.7) * 0.15;
    const envelope = Math.sin(x * Math.PI); // bell curve
    const amplitude = (0.25 + h1 + h2 + h3) * envelope;
    barHeights.push(Math.max(2, Math.abs(amplitude) * height));
  }

  return (
    <div className="relative w-full overflow-hidden rounded-niri" style={{ height }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${bars * (barWidth + gap)} ${height}`}
        preserveAspectRatio="none"
        className="block"
      >
        {barHeights.map((barH, i) => {
          const x = i * (barWidth + gap);
          const isPast = i / bars <= progress;
          const opacity = isPast ? 0.9 : 0.2;

          return (
            <rect
              key={i}
              x={x}
              y={centerY - barH / 2}
              width={barWidth}
              height={barH}
              rx={1}
              fill={color}
              opacity={opacity}
              style={{
                transition: isPlaying ? "none" : "opacity 0.3s ease",
              }}
            />
          );
        })}
      </svg>

      {/* Progress indicator line */}
      <motion.div
        className="absolute top-0 h-full w-px"
        style={{ backgroundColor: color, opacity: 0.6 }}
        animate={{ left: `${progress * 100}%` }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
      />
    </div>
  );
};
