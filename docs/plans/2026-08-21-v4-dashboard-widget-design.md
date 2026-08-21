# presenced-popup v0.4 — Dashboard Widget System Design

## Vision
A Niri Wayland desktop companion that lives as a **floating glassmorphic widget cluster** on the desktop — inspired by PreMiD (Discord activity), Rainmeter (sci-fi widget aesthetics), and Waybar (Niri-native status).

Not a single monolithic popup. A **dashboard of independent, toggleable widgets** that can be shown/hidden individually.

## Architecture: Two-Mode Window

### Mode 1: Compact Dashboard (default)
- **Size**: 320×480px, always-on-top, frameless, transparent
- **Layout**: Vertical stack of small glass widgets
- **Header**: Clock (HH:MM) + User avatar + Settings gear icon
- **Widgets** (each togglable):
  - 🎵 **Music Widget** — spinning vinyl disc + track info + waveform
  - 📊 **RPC Widget** — current Discord status preview
  - ⏱️ **Pomodoro Widget** — timer ring + session dots
  - 📅 **Countdown Widget** — days remaining + urgency badge
  - 🎤 **Lyrics Widget** — 3-line sync display
  - 💻 **System Widget** — CPU/RAM mini bars
  - 🔗 **Connection Widget** — Discord/Niri/MPRIS health dots

### Mode 2: Expanded Settings
- **Size**: 640×580px (smooth animation from compact)
- **Layout**: Left panel = widget toggles, Right panel = widget config
- **Toggle each widget on/off**
- **Per-widget settings** (e.g., music: show/hide waveform, pomodoro: default duration)
- Click gear again → shrink back to compact

## Visual Design (PreMiD × Rainmeter × Waybar)

### Glassmorphism
- Background: `rgba(12, 15, 24, 0.35)` with `backdrop-filter: blur(24px)`
- Borders: `1px solid rgba(255, 255, 255, 0.08)` (not dark borders)
- Each widget card: separate glass pane with subtle glow border
- Wallpaper shows through all layers

### Color System (Niri-synced)
- Primary accent: `#7c8aff` (Niri focus ring blue)
- Scene-specific glows (music=purple, pomo=amber, system=cyan)
- Status: connected=green, degraded=amber, error=red
- Text: white primary, muted secondary on glass

### Typography
- Font: Geist Sans (or Inter fallback)
- Mono: Geist Mono (for timers, technical data)
- Clock: Large, bold, monospace

### Animations (Niri spring physics)
- Widget appear: slide-in + fade (damping 0.98, stiffness 300)
- Mode switch: smooth resize animation (200ms spring)
- Vinyl spin: continuous rotation when music playing
- Waveform: 24-bar sine animation synced to playback
- Glow pulse: ambient opacity reacts to audio volume

## Widget Components

### HeaderWidget (new)
```
┌─────────────────────────────┐
│ 🕐 14:30   👤 Niruss    ⚙️ │
└─────────────────────────────┘
```
- Left: Digital clock (HH:MM, mono font)
- Center: User avatar (circle, scene-colored ring)
- Right: Settings gear (click → expand to settings mode)

### MusicWidget (redesigned)
```
┌─────────────────────────────┐
│ ♫ Brave · Playing           │
│ ┌─────┐                     │
│ │ 🎵  │ Gửi em, người...   │
│ │spin │ Ân Ngô              │
│ └─────┘                     │
│ ▁▂▃▅▇▆▅▃▂▁ (waveform)      │
│ 1:23 ──────────── 3:45      │
└─────────────────────────────┘
```
- Spinning vinyl disc (CSS rotation, pauses when paused)
- Track title + artist (truncated)
- Animated waveform bars
- Progress timestamps

### RpcWidget (new)
```
┌─────────────────────────────┐
│ Discord RPC                 │
│ ✅ Connected · ID: 1214...  │
│ Status: Listening to...     │
└─────────────────────────────┘
```
- Connection status with colored dot
- Client ID (truncated)
- Current status text

### PomodoroWidget (mini)
```
┌─────────────────────────────┐
│ ⏱ 25:00  ●●○○  Session 1/4 │
│ [Start]                     │
└─────────────────────────────┘
```
- Timer display
- Session dots (4 dots, filled = completed)
- Start/Pause button

### CountdownWidget (mini)
```
┌─────────────────────────────┐
│ 📅 THPTQG 2027             │
│ 14 days · 6 hours           │
└─────────────────────────────┘
```

### LyricsWidget (mini)
```
┌─────────────────────────────┐
│ 🎤 prev line...             │
│ ♫ ACTIVE LINE HERE          │
│    next line...             │
└─────────────────────────────┘
```

### SystemWidget (mini)
```
┌─────────────────────────────┐
│ CPU ████░░░░ 45%            │
│ RAM ██████░░ 72%            │
└─────────────────────────────┘
```

## Settings Panel (expanded mode)
```
┌──────────────────────────────────────────┐
│ ⚙️ presenced Settings          [Close ×] │
├────────────────────┬─────────────────────┤
│ Widget Toggles     │ Widget Config       │
│                    │                     │
│ ☑ Music Widget     │ Music:              │
│ ☑ RPC Widget       │ ☑ Show waveform     │
│ ☑ Pomodoro         │ ☑ Spinning disc     │
│ ☑ Countdown        │                     │
│ ☑ Lyrics           │ Pomodoro:           │
│ ☑ System           │ Duration: [25] min  │
│                    │                     │
│ Discord Config     │ Discord:            │
│ Client ID: [____]  │ Socket: [auto]      │
│ Socket: [auto]     │                     │
│                    │ Quotes:             │
│ RVC Rotation       │ ☑ Vietnamese        │
│ ☑ Enabled          │ ☑ Chinese           │
│ Interval: [30]s    │ Interval: [5] min   │
└────────────────────┴─────────────────────┘
```

## Niri Wayland Integration
- Use `wlr-layer-shell` protocol for proper floating
- Widget respects Niri gaps and workspace
- Game mode: auto-hide when fullscreen app detected
- Keyboard shortcut: Super+P to toggle widget visibility

## File Structure (proposed)
```
apps/popup/src/
├── App.tsx                    # Main app shell (compact/expanded modes)
├── hooks/
│   ├── usePresenceCompanion.ts  # Daemon API client
│   ├── useAudioAnalysis.ts      # Audio frequency analysis
│   └── useWidgetConfig.ts       # Widget visibility/settings state
├── widgets/
│   ├── HeaderWidget.tsx         # Clock + avatar + settings gear
│   ├── MusicWidget.tsx          # Vinyl disc + waveform + track info
│   ├── RpcWidget.tsx            # Discord RPC status
│   ├── PomodoroWidget.tsx       # Timer ring + controls
│   ├── CountdownWidget.tsx      # Days remaining
│   ├── LyricsWidget.tsx         # 3-line sync display
│   ├── SystemWidget.tsx         # CPU/RAM bars
│   └── ConnectionWidget.tsx     # Health status dots
├── settings/
│   ├── SettingsPanel.tsx        # Expanded settings view
│   ├── WidgetToggles.tsx        # On/off toggles
│   ├── DiscordSettings.tsx      # Client ID + socket config
│   └── RvcSettings.tsx          # Rotation config
├── components/
│   ├── VinylDisc.tsx            # Animated spinning disc SVG
│   ├── WaveformBars.tsx         # Audio waveform visualization
│   ├── GlassCard.tsx            # Reusable glassmorphic card
│   └── WindowControls.tsx       # Minimize/close buttons
└── lib/
    ├── animations.ts            # Spring physics presets
    ├── scene-registry.ts        # Scene metadata + colors
    └── widget-registry.ts       # Widget definitions + defaults
```
