/**
 * Scene registry — defines all navigable screens with their visual identity.
 * Each scene has a color pair for ambient glow and a unique icon.
 */
import type { SceneType } from "@presenced/contracts";

export interface SceneMeta {
  type: SceneType;
  label: string;
  shortLabel: string;
  icon: string;       // Lucide icon name
  colorFrom: string;  // Gradient start
  colorTo: string;    // Gradient end
  glowColor: string;  // Ambient glow rgba
  cssClass: string;   // Tailwind glow class
}

export const SCENES: SceneMeta[] = [
  {
    type: "auto",
    label: "Auto Context",
    shortLabel: "Auto",
    icon: "Sparkles",
    colorFrom: "#7c8aff",
    colorTo: "#60a5fa",
    glowColor: "rgba(124, 138, 255, 0.25)",
    cssClass: "glow-auto",
  },
  {
    type: "music",
    label: "Music & Lyrics",
    shortLabel: "Music",
    icon: "Music",
    colorFrom: "#a78bfa",
    colorTo: "#c084fc",
    glowColor: "rgba(167, 139, 250, 0.25)",
    cssClass: "glow-music",
  },
  {
    type: "focus",
    label: "Focus Desktop",
    shortLabel: "Focus",
    icon: "Crosshair",
    colorFrom: "#34d399",
    colorTo: "#2dd4bf",
    glowColor: "rgba(52, 211, 153, 0.25)",
    cssClass: "glow-focus",
  },
  {
    type: "pomodoro",
    label: "Pomodoro Focus",
    shortLabel: "Pomo",
    icon: "Timer",
    colorFrom: "#fbbf24",
    colorTo: "#f59e0b",
    glowColor: "rgba(251, 191, 36, 0.25)",
    cssClass: "glow-pomo",
  },
  {
    type: "countdown",
    label: "Milestone Countdown",
    shortLabel: "Exam",
    icon: "CalendarClock",
    colorFrom: "#f87171",
    colorTo: "#fb923c",
    glowColor: "rgba(248, 113, 113, 0.25)",
    cssClass: "glow-countdown",
  },
  {
    type: "system",
    label: "System Telemetry",
    shortLabel: "Sys",
    icon: "Cpu",
    colorFrom: "#38bdf8",
    colorTo: "#818cf8",
    glowColor: "rgba(56, 189, 248, 0.25)",
    cssClass: "glow-system",
  },
  {
    type: "privacy",
    label: "Privacy Shield",
    shortLabel: "Privacy",
    icon: "Shield",
    colorFrom: "#fbbf24",
    colorTo: "#f97316",
    glowColor: "rgba(251, 191, 36, 0.25)",
    cssClass: "glow-privacy",
  },
];

// Extra non-scene screens (navigated via < > but not SceneType)
export interface ExtraScreen {
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
  colorFrom: string;
  colorTo: string;
  glowColor: string;
  cssClass: string;
}

export const EXTRA_SCREENS: ExtraScreen[] = [
  {
    id: "discord",
    label: "Discord Preview",
    shortLabel: "Discord",
    icon: "MessageSquare",
    colorFrom: "#5865f2",
    colorTo: "#8b5cf6",
    glowColor: "rgba(88, 101, 242, 0.25)",
    cssClass: "glow-discord",
  },
];

export type ScreenId = SceneType | "discord";

export function getSceneMeta(type: SceneType): SceneMeta {
  const found = SCENES.find((s) => s.type === type);
  return found ?? SCENES[0]!;
}

export function getScreenMeta(id: ScreenId): SceneMeta | ExtraScreen {
  const scene = SCENES.find((s) => s.type === id);
  if (scene) return scene;
  return EXTRA_SCREENS.find((s) => s.id === id) ?? EXTRA_SCREENS[0]!;
}

export const ALL_SCREEN_IDS: ScreenId[] = [
  ...SCENES.map((s) => s.type),
  ...EXTRA_SCREENS.map((s) => s.id as ScreenId),
];

export function getScreenIndex(id: ScreenId): number {
  return ALL_SCREEN_IDS.indexOf(id);
}

export function getNextScreen(current: ScreenId): ScreenId {
  const idx = ALL_SCREEN_IDS.indexOf(current);
  return ALL_SCREEN_IDS[(idx + 1) % ALL_SCREEN_IDS.length]!;
}

export function getPrevScreen(current: ScreenId): ScreenId {
  const idx = ALL_SCREEN_IDS.indexOf(current);
  return ALL_SCREEN_IDS[(idx - 1 + ALL_SCREEN_IDS.length) % ALL_SCREEN_IDS.length]!;
}
