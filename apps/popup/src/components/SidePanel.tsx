/**
 * SidePanel — slide-in panel for additional widgets.
 * Appears on left or right side of main widget.
 */
import { motion, AnimatePresence } from "framer-motion";
import { springNiri } from "../lib/animations.js";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidePanelProps {
  side: "left" | "right";
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const SidePanel = ({ side, isOpen, onToggle, children }: SidePanelProps) => {
  const isLeft = side === "left";

  return (
    <div className={`relative flex-shrink-0 ${isLeft ? "order-first" : "order-last"}`}>
      {/* Toggle button (always visible) */}
      <motion.button
        type="button"
        onClick={onToggle}
        className="absolute top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-niri glass-surface text-text-secondary hover:text-text-primary transition-colors"
        style={{ [isLeft ? "right" : "left"]: "-12px" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isLeft ? (
          isOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
        ) : (
          isOpen ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />
        )}
      </motion.button>

      {/* Panel content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="glass-strong rounded-niri-xl p-2 space-y-2 overflow-y-auto scrollbar-thin"
            style={{ width: 200, maxHeight: "100%" }}
            initial={{ [isLeft ? "x" : "x"]: isLeft ? -200 : 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ [isLeft ? "x" : "x"]: isLeft ? -200 : 200, opacity: 0 }}
            transition={springNiri}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
