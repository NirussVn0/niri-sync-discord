/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // ── Niri-synced color palette ──────────────────────────────────────
      colors: {
        // Base surfaces (from Niri transparent dark aesthetic)
        background: {
          DEFAULT: "rgba(6, 8, 14, 0.85)",
          solid: "#06080e",
          glass: "rgba(12, 15, 24, 0.60)",
        },
        surface: {
          DEFAULT: "rgba(16, 20, 32, 0.55)",
          solid: "#101420",
          glass: "rgba(20, 25, 40, 0.45)",
          border: "rgba(40, 50, 80, 0.35)",
          hover: "rgba(30, 38, 56, 0.60)",
        },
        // Niri focus ring colors (from config: #808080 / #505050)
        niri: {
          focus: "#808080",
          dim: "#505050",
        },
        // Scene-specific accent glows
        accent: {
          primary: "rgb(var(--accent-rgb) / <alpha-value>)",
          glow: "rgb(var(--accent-rgb) / 0.86)",
          muted: "rgb(var(--accent-rgb) / 0.15)",
        },
        // Scene ambient colors
        scene: {
          auto:    { from: "#7c8aff", to: "#60a5fa" },  // Indigo → Sky
          music:   { from: "#a78bfa", to: "#c084fc" },  // Violet → Purple
          focus:   { from: "#34d399", to: "#2dd4bf" },  // Emerald → Teal
          pomo:    { from: "#fbbf24", to: "#f59e0b" },  // Amber → Gold
          countdown: { from: "#f87171", to: "#fb923c" }, // Rose → Orange
          system:  { from: "#38bdf8", to: "#818cf8" },  // Sky → Indigo
          privacy: { from: "#fbbf24", to: "#f97316" },  // Amber → Orange
          rules:   { from: "#a3e635", to: "#34d399" },  // Lime → Emerald
          discord: { from: "#5865f2", to: "#8b5cf6" },  // Discord → Violet
        },
        // Text hierarchy
        text: {
          primary: "rgba(240, 242, 255, 0.95)",
          secondary: "rgba(180, 190, 220, 0.70)",
          muted: "rgba(140, 155, 190, 0.50)",
          ghost: "rgba(100, 120, 160, 0.35)",
        },
        // Status colors
        status: {
          connected: "#34d399",
          degraded: "#fbbf24",
          error: "#f87171",
          offline: "#6b7280",
        },
        // Border system
        border: {
          DEFAULT: "rgba(40, 50, 80, 0.30)",
          subtle: "rgba(40, 50, 80, 0.15)",
          accent: "rgb(var(--accent-rgb) / 0.30)",
          glow: "rgb(var(--accent-rgb) / 0.50)",
        },
      },

      // ── Typography ─────────────────────────────────────────────────────
      fontFamily: {
        sans: [
          "'Geist Sans'",
          "'Inter'",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        mono: [
          "'Geist Mono'",
          "'JetBrains Mono'",
          "'Fira Code'",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },

      // ── Spacing scale (Niri-aligned: base 4px, gaps 8px) ──────────────
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },

      // ── Border radius (Niri uses 10px for windows) ────────────────────
      borderRadius: {
        "niri": "10px",
        "niri-lg": "14px",
        "niri-xl": "18px",
      },

      // ── Box shadow — glow system ───────────────────────────────────────
      boxShadow: {
        "glow-sm": "0 0 12px -2px rgb(var(--accent-rgb) / 0.25)",
        "glow": "0 0 24px -4px rgb(var(--accent-rgb) / 0.30)",
        "glow-lg": "0 0 40px -6px rgb(var(--accent-rgb) / 0.35)",
        "glow-scene": "0 0 30px -5px var(--scene-glow, rgba(124, 138, 255, 0.25))",
        "glass": "0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        "glass-lg": "0 16px 48px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        "neon": "0 0 5px rgba(124, 138, 255, 0.4), 0 0 20px rgba(124, 138, 255, 0.15)",
      },

      // ── Backdrop blur ──────────────────────────────────────────────────
      backdropBlur: {
        "glass": "16px",
        "glass-lg": "24px",
      },

      // ── Animation keyframes ────────────────────────────────────────────
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-4px) scale(0.99)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(124, 138, 255, 0.20)" },
          "50%": { borderColor: "rgba(124, 138, 255, 0.50)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },

      animation: {
        "fade-in": "fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-out": "fade-out 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-right": "slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-left": "slide-in-left 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "border-glow": "border-glow 3s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};
