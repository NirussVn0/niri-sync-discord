/**
 * WindowControls — Tauri window minimize/maximize/close buttons.
 * Rendered in the header for frameless window management.
 */
import { motion } from "framer-motion";
import { Minus, X } from "lucide-react";
import { springSnap } from "../lib/animations.js";

declare global {
  interface Window {
    __TAURI__?: {
      core: {
        invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
      };
    };
  }
}

const invoke = (cmd: string) => {
  window.__TAURI__?.core?.invoke(cmd).catch(() => {});
};

export const WindowControls = () => {
  return (
    <div className="flex items-center gap-1 -mr-1">
      <motion.button
        type="button"
        onClick={() => invoke("minimize_window")}
        className="p-1 rounded-niri hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.85 }}
        transition={springSnap}
        title="Minimize"
      >
        <Minus className="w-3 h-3" />
      </motion.button>
      <motion.button
        type="button"
        onClick={() => invoke("close_window")}
        className="p-1 rounded-niri hover:bg-status-error/30 text-text-muted hover:text-status-error transition-colors"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.85 }}
        transition={springSnap}
        title="Close"
      >
        <X className="w-3 h-3" />
      </motion.button>
    </div>
  );
};
