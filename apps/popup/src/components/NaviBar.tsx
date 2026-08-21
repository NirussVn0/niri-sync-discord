/**
 * NaviBar — sci-fi horizontal screen navigator.
 *
 * Features:
 * - Horizontal pill strip with ambient glow per active scene
 * - < > keyboard navigation (Left/Right arrow keys)
 * - Click to jump to any screen
 * - Smooth framer-motion transitions
 * - Progress indicator at bottom
 */
import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Music, Crosshair, Timer, CalendarClock, Cpu, Shield,
  MessageSquare, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  SCENES, EXTRA_SCREENS,
  type ScreenId, getScreenIndex, getNextScreen, getPrevScreen,
} from "../lib/scene-registry";
import { springSnap } from "../lib/animations";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles, Music, Crosshair, Timer, CalendarClock, Cpu, Shield, MessageSquare,
};

interface ScreenEntry {
  id: ScreenId;
  label: string;
  shortLabel: string;
  icon: string;
  colorFrom: string;
  colorTo: string;
  glowColor: string;
}

const ALL_SCREENS: ScreenEntry[] = [
  ...SCENES.map((s) => ({
    id: s.type as ScreenId,
    label: s.label,
    shortLabel: s.shortLabel,
    icon: s.icon,
    colorFrom: s.colorFrom,
    colorTo: s.colorTo,
    glowColor: s.glowColor,
  })),
  ...EXTRA_SCREENS.map((s) => ({
    id: s.id as ScreenId,
    label: s.label,
    shortLabel: s.shortLabel,
    icon: s.icon,
    colorFrom: s.colorFrom,
    colorTo: s.colorTo,
    glowColor: s.glowColor,
  })),
];

interface NaviBarProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

export const NaviBar = ({ activeScreen, onNavigate }: NaviBarProps) => {
  // ── Keyboard navigation (< >) ────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const next = e.key === "ArrowRight"
          ? getNextScreen(activeScreen)
          : getPrevScreen(activeScreen);
        onNavigate(next);
      }
    },
    [activeScreen, onNavigate]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const currentIndex = getScreenIndex(activeScreen);

  return (
    <div className="select-none">
      {/* ── Navigation arrows + pills ─────────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        {/* Left arrow */}
        <motion.button
          type="button"
          onClick={() => onNavigate(getPrevScreen(activeScreen))}
          className="flex-shrink-0 p-1.5 rounded-lg glass-surface text-text-secondary hover:text-text-primary transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={springSnap}
          title="Previous screen (←)"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </motion.button>

        {/* Scene pills — scrollable strip */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          {ALL_SCREENS.map((screen) => {
            const isActive = screen.id === activeScreen;
            const IconComponent = ICON_MAP[screen.icon] ?? Sparkles;

            return (
              <motion.button
                key={screen.id}
                type="button"
                onClick={() => onNavigate(screen.id)}
                className={`
                  relative flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-semibold
                  whitespace-nowrap flex-shrink-0 transition-colors duration-200
                  ${isActive
                    ? "text-white"
                    : "text-text-muted hover:text-text-secondary glass-surface"
                  }
                `}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={springSnap}
              >
                {/* Active background with scene glow */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-bg"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${screen.colorFrom}30, ${screen.colorTo}20)`,
                      border: `1px solid ${screen.colorFrom}50`,
                      boxShadow: `0 0 16px -3px ${screen.glowColor}`,
                    }}
                    transition={springSnap}
                  />
                )}
                <IconComponent className={`w-3 h-3 relative z-10 ${isActive ? "text-white" : ""}`} />
                <span className="relative z-10">{screen.shortLabel}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Right arrow */}
        <motion.button
          type="button"
          onClick={() => onNavigate(getNextScreen(activeScreen))}
          className="flex-shrink-0 p-1.5 rounded-lg glass-surface text-text-secondary hover:text-text-primary transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={springSnap}
          title="Next screen (→)"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {/* ── Progress dots ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-1 pt-1.5">
        {ALL_SCREENS.map((screen, idx) => {
          const isActive = idx === currentIndex;
          return (
            <motion.div
              key={screen.id}
              className="rounded-full cursor-pointer"
              animate={{
                width: isActive ? 16 : 4,
                height: 4,
                backgroundColor: isActive ? screen.colorFrom : "rgba(100, 120, 160, 0.30)",
                boxShadow: isActive ? `0 0 8px ${screen.colorFrom}60` : "none",
              }}
              transition={springSnap}
              onClick={() => onNavigate(screen.id)}
            />
          );
        })}
      </div>
    </div>
  );
};
