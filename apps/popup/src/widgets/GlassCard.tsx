/**
 * GlassCard — reusable glassmorphic card wrapper for all widgets.
 */
import { motion } from "framer-motion";
import { springNiri } from "../lib/animations.js";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export const GlassCard = ({ glowColor, className = "", children }: GlassCardProps) => {
  const style = glowColor ? { borderColor: `${glowColor}25` } : {};
  return (
    <motion.div
      className={`rounded-niri-lg glass-float p-3 space-y-1.5 select-none ${className}`}
      style={style}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={springNiri}
    >
      {children}
    </motion.div>
  );
};
