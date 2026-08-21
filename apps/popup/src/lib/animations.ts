/**
 * Framer-motion animation presets — synced with Niri spring physics.
 *
 * Niri config: damping-ratio=0.98, stiffness=300, epsilon=0.0001
 * We translate these to Framer Motion spring configs.
 */
import type { Variants, Transition } from "framer-motion";

// ── Spring presets (from Niri 60-animations.kdl) ────────────────────────

/** Niri default: smooth settle, barely any bounce (damping 0.98, stiffness 300) */
export const springNiri: Transition = {
  type: "spring",
  damping: 28,
  stiffness: 300,
  mass: 1,
};

/** Snappy response for interactive elements (slight overshoot) */
export const springSnap: Transition = {
  type: "spring",
  damping: 20,
  stiffness: 400,
  mass: 0.8,
};

/** Gentle settle for content entry */
export const springGentle: Transition = {
  type: "spring",
  damping: 30,
  stiffness: 200,
  mass: 1.2,
};

/** Quick dismiss for exit animations */
export const springQuick: Transition = {
  type: "spring",
  damping: 35,
  stiffness: 500,
  mass: 0.6,
};

// ── Screen transition variants ──────────────────────────────────────────

export const screenVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.96,
    filter: "blur(4px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    scale: 0.97,
    filter: "blur(3px)",
  }),
};

// ── Card reveal variants ────────────────────────────────────────────────

export const cardReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.97,
  },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...springNiri,
      delay: i * 0.06,
    },
  }),
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: { duration: 0.15 },
  },
};

// ── Stagger container ───────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springNiri,
  },
};

// ── Glow pulse variants ────────────────────────────────────────────────

export const glowPulse: Variants = {
  idle: { opacity: 0.5 },
  active: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ── Lyrics line transition ──────────────────────────────────────────────

export const lyricLineVariants: Variants = {
  enter: {
    opacity: 0,
    y: 10,
    scale: 0.95,
  },
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springGentle,
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.97,
    transition: { duration: 0.15 },
  },
};

// ── Drawer / overlay ────────────────────────────────────────────────────

export const drawerVariants: Variants = {
  hidden: {
    x: "100%",
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: springNiri,
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: springQuick,
  },
};

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// ── Progress bar ────────────────────────────────────────────────────────

export const progressBar: Variants = {
  initial: { scaleX: 0, originX: 0 },
  animate: (percent: number) => ({
    scaleX: percent / 100,
    transition: { type: "spring", damping: 30, stiffness: 200 },
  }),
};

// ── Number counter ──────────────────────────────────────────────────────

export const counterVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: springSnap,
  },
};
