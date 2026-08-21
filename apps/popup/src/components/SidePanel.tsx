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
  const panelId = `${side}-side-panel`;

  return (
    <div
      className={`pointer-events-none absolute inset-y-2 z-30 w-[200px] ${isLeft ? "left-2" : "right-2"}`}
      data-side-panel={side}
    >
      {/* Toggle button (always visible) */}
      <motion.button
        type="button"
        onClick={onToggle}
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label={`${isOpen ? "Close" : "Open"} ${side} widgets`}
        className="pointer-events-auto absolute top-1/2 z-40 -translate-y-1/2 p-1.5 rounded-niri glass-surface text-text-secondary hover:text-text-primary transition-colors"
        style={isOpen
          ? { [isLeft ? "right" : "left"]: "-12px" }
          : { [isLeft ? "left" : "right"]: "0" }}
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
            id={panelId}
            className={`pointer-events-auto absolute inset-y-0 w-[200px] glass-strong rounded-niri-xl p-2 space-y-2 overflow-y-auto scrollbar-thin ${isLeft ? "left-0" : "right-0"}`}
            initial={{ x: isLeft ? -200 : 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isLeft ? -200 : 200, opacity: 0 }}
            transition={springNiri}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
