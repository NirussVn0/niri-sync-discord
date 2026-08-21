import { useCallback, useEffect, useState } from "react";

export interface ThemeConfig {
  accentColor: string;
  glassOpacity: number;
  blurIntensity: number;
  borderStyle: "subtle" | "glowing" | "neon";
  clockStyle: "digital" | "minimal";
}

export const DEFAULT_THEME: ThemeConfig = {
  accentColor: "#7c8aff",
  glassOpacity: 45,
  blurIntensity: 24,
  borderStyle: "subtle",
  clockStyle: "digital",
};

const STORAGE_KEY = "presenced-theme-v1";

export function normalizeHex(color: string): string {
  return /^#[0-9a-f]{6}$/i.test(color) ? color : DEFAULT_THEME.accentColor;
}

export function hexToRgb(color: string): [number, number, number] {
  const normalized = normalizeHex(color).slice(1);
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function loadStoredTheme(): ThemeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_THEME;
    const parsed = JSON.parse(raw) as Partial<ThemeConfig>;
    return {
      accentColor: normalizeHex(parsed.accentColor ?? DEFAULT_THEME.accentColor),
      glassOpacity: Math.min(80, Math.max(10, parsed.glassOpacity ?? DEFAULT_THEME.glassOpacity)),
      blurIntensity: Math.min(40, Math.max(8, parsed.blurIntensity ?? DEFAULT_THEME.blurIntensity)),
      borderStyle: parsed.borderStyle ?? DEFAULT_THEME.borderStyle,
      clockStyle: parsed.clockStyle ?? DEFAULT_THEME.clockStyle,
    };
  } catch {
    return DEFAULT_THEME;
  }
}

function applyTheme(config: ThemeConfig): void {
  const root = document.documentElement;
  const [r, g, b] = hexToRgb(config.accentColor);
  root.style.setProperty("--accent-color", config.accentColor);
  root.style.setProperty("--accent-rgb", `${r} ${g} ${b}`);
  root.style.setProperty("--glass-alpha", String(config.glassOpacity / 100));
  root.style.setProperty("--glass-alpha-strong", String(Math.min(0.9, config.glassOpacity / 100 + 0.1)));
  root.style.setProperty("--glass-alpha-float", String(Math.max(0.1, config.glassOpacity / 100 - 0.1)));
  root.style.setProperty("--glass-blur", `${config.blurIntensity}px`);
  root.style.setProperty("--glass-blur-strong", `${Math.min(48, config.blurIntensity + 8)}px`);
  root.dataset.themeBorder = config.borderStyle;
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeConfig>(loadStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const loadTheme = useCallback(async () => theme, [theme]);

  const saveTheme = useCallback(async (next: ThemeConfig) => {
    const normalized = { ...next, accentColor: normalizeHex(next.accentColor) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    setTheme(normalized);
  }, []);

  return { theme, loadTheme, saveTheme };
}
