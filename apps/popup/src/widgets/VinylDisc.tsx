/**
 * VinylDisc — animated spinning vinyl record SVG.
 * Rotates when music is playing, stops when paused.
 */
import { motion } from "framer-motion";

interface VinylDiscProps {
  isPlaying: boolean;
  artUrl?: string | null;
  size?: number;
}

export const VinylDisc = ({ isPlaying, artUrl, size = 64 }: VinylDiscProps) => {
  const center = size / 2;
  const outerR = size / 2 - 2;
  const artR = size / 4;

  return (
    <motion.div
      className="flex-shrink-0"
      animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
      transition={
        isPlaying
          ? { duration: 4, repeat: Infinity, ease: "linear" }
          : { duration: 0.5, ease: "easeOut" }
      }
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={outerR} fill="#1a1a2e" stroke="#333" strokeWidth="1" />
        {[0.7, 0.8, 0.9].map((r, i) => (
          <circle key={i} cx={center} cy={center} r={outerR * r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        ))}
        {artUrl ? (
          <>
            <clipPath id={`vc-${size}`}>
              <circle cx={center} cy={center} r={artR} />
            </clipPath>
            <image href={artUrl} x={center - artR} y={center - artR} width={artR * 2} height={artR * 2} clipPath={`url(#vc-${size})`} />
          </>
        ) : (
          <circle cx={center} cy={center} r={artR} fill="#6366f1" />
        )}
        <circle cx={center} cy={center} r={3} fill="#0a0a1a" />
      </svg>
    </motion.div>
  );
};
