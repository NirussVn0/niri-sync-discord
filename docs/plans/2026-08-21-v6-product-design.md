# presenced-popup v0.6 — Product Design Spec

## Core Vision (from user feedback)

**NOT a dashboard of many widgets.** It's ONE main widget + optional side panels.

### The Metaphor
Think of it like a **phone home screen**:
- **Main widget** = the home screen (always visible, always beautiful)
- **Side panels** = app drawer (swipe left/right to reveal more)
- **Pencil** = edit mode (reorder, resize — NOT hide)
- **Settings** = deep configuration (theme, RVC, status text)

---

## Layout Architecture

```
┌─────────────────────────────────────────────────────┐
│  ◀  ┌──────────────────────────────────┐  ▶        │
│     │         MAIN WIDGET              │           │
│     │  🕐 14:30 · Good afternoon       │           │
│     │  ┌─────────┐ ┌────────────────┐  │           │
│     │  │ 🎵 Music│ │ Discord RVC    │  │           │
│     │  │ vinyl   │ │ Status: ...    │  │           │
│     │  │ playing │ │ Client: ...    │  │           │
│     │  └─────────┘ └────────────────┘  │           │
│     │  ┌──────────────────────────────┐ │           │
│     │  │ 🎤 Lyrics / ⏱️ Pomodoro     │ │           │
│     │  └──────────────────────────────┘ │           │
│     └──────────────────────────────────┘           │
│  [◀] Settings [Pencil] [⚙️] [×]                    │
└─────────────────────────────────────────────────────┘

◀ = Left side panel (opens when you press < or swipe left)
▶ = Right side panel (opens when you press > or swipe right)
```

### Main Widget (ALWAYS visible, mandatory)
The main widget is the **only thing the user sees by default**.
It contains ONLY essential info:
- **Header**: Clock + greeting + user avatar
- **Music**: If playing → vinyl disc + track info + waveform
- **Discord RVC**: Current status text + connection state + what's being shown
- **One secondary widget**: Lyrics OR Pomodoro OR Countdown (user chooses which)

The main widget is **fixed size**, **beautiful**, **cinematic**.
No scrolling. Everything fits. Period.

### Side Panels (optional, opened via < > or settings)
- **Left panel**: Additional widgets (system, connection health, countdown)
- **Right panel**: Additional widgets (lyrics extended, pomodoro detailed, quote of the day)
- Side panels **slide in/out** with animation
- They are **separate glass boxes** that appear next to the main widget
- User can choose which widgets go in which panel via settings

### Edit Mode (pencil button)
When pencil is active:
- Widgets show **drag handles** (up/down arrows) to reorder within their zone
- Widgets show **resize handles** (corner) to make bigger/smaller
- **NOT for hiding** — edit mode is for layout customization only
- Changes persist to localStorage

---

## RVC (Rich Voice Custom) System

This is the **core feature** the user cares about most.

### What RVC Means
RVC = what Discord shows as your "Playing/Listening/Watching" status.
Currently it just shows "Listening to Spotify" — boring.

### What the user wants:
1. **Custom status text** — not just "Listening to X" but creative text
2. **Status rotation** — cycle through multiple statuses on a timer
3. **Music-aware** — status changes based on what's playing
4. **Quote integration** — random quotes as Discord status
5. **Image assets** — custom large/small images for the presence

### RVC Settings (in Settings panel):
```
┌─────────────────────────────────────────┐
│ RVC Configuration                       │
│                                         │
│ Status Mode: [Auto ▼]                   │
│   Auto = show what's playing            │
│   Custom = user-defined text            │
│   Rotation = cycle through entries      │
│                                         │
│ Custom Status Text:                     │
│ [________________________]              │
│                                         │
│ Rotation Entries:                       │
│ ┌─────────────────────────────────┐     │
│ │ 🎵 Music (30s)                  │     │
│ │ 💭 Quote: "..." (60s)          │     │
│ │ 🎯 Focus Mode (120s)           │     │
│ └─────────────────────────────────┘     │
│ [+ Add Entry]                           │
│                                         │
│ Large Image: [URL or upload]            │
│ Small Image: [URL or upload]            │
│ Large Text:  [________________]         │
│ Small Text:  [________________]         │
│                                         │
│ Button Label: [________________]        │
│ Button URL:   [________________]        │
└─────────────────────────────────────────┘
```

### Quote System
- User provides text files with quotes (one per line)
- System picks random quote for Discord status
- Can rotate quotes every N minutes
- Default files: `quotes/vietnamese-wisdom.txt`, `quotes/chinese-philosophy.txt`
- User can add custom quote files in settings

---

## Theme System

### Settings → Theme:
```
┌─────────────────────────────────────────┐
│ Theme Configuration                     │
│                                         │
│ Accent Color: [■ #7c8aff] [Pick]       │
│ Glass Opacity: [====●====] 45%          │
│ Blur Intensity: [====●====] 24px        │
│ Border Style: [Subtle ▼]               │
│   Subtle / Glowing / Neon               │
│                                         │
│ Presets:                                │
│ [Niri Blue] [Cyber Green] [Warm Amber]  │
│ [Neon Purple] [Custom]                  │
│                                         │
│ Clock Style: [Digital ▼]               │
│   Digital / Analog / Minimal            │
└─────────────────────────────────────────┘
```

### Theme Tokens (stored in localStorage):
```json
{
  "accentColor": "#7c8aff",
  "glassOpacity": 0.45,
  "blurIntensity": 24,
  "borderStyle": "subtle",
  "clockStyle": "digital"
}
```

---

## Settings Panel Structure

Settings opens as a **full overlay** (not expanding the widget).

### Tabs:
1. **Widgets** — toggle which widgets appear in main/side panels
2. **RVC** — Discord status configuration (custom text, rotation, images)
3. **Theme** — colors, glass, clock style
4. **Quotes** — manage quote files, rotation interval
5. **About** — version, credit, links

---

## Widget Components (revised)

### Main Widget Zone:
- `PremiumClock` — greeting + time + date + avatar
- `MusicWidget` — vinyl + track + waveform (when playing)
- `RvcWidget` — Discord status preview + what's being shown
- `PrimaryWidget` — user's choice: Lyrics OR Pomodoro OR Countdown

### Left Side Panel:
- `SystemWidget` — CPU/RAM bars
- `ConnectionWidget` — health dots
- `CountdownWidget` — days remaining

### Right Side Panel:
- `LyricsWidget` — 3-line sync display
- `PomodoroWidget` — timer ring + controls
- `QuoteWidget` — random quote display

---

## File Structure (revised)

```
apps/popup/src/
├── App.tsx                          # Main shell
├── components/
│   ├── TutorialOverlay.tsx          # First-run tutorial
│   ├── WindowControls.tsx           # Minimize/close
│   └── EditHandles.tsx              # Drag/resize handles
├── widgets/
│   ├── PremiumClock.tsx             # Beautiful clock
│   ├── MusicWidget.tsx              # Vinyl + waveform
│   ├── RvcWidget.tsx                # Discord status preview
│   ├── PrimaryWidget.tsx            # User's chosen primary
│   ├── PomodoroWidget.tsx           # Timer ring
│   ├── CountdownWidget.tsx          # Days remaining
│   ├── LyricsWidget.tsx             # 3-line sync
│   ├── SystemWidget.tsx             # CPU/RAM
│   ├── ConnectionWidget.tsx         # Health dots
│   ├── QuoteWidget.tsx              # Random quote
│   ├── GlassCard.tsx                # Reusable wrapper
│   └── VinylDisc.tsx                # Spinning record
├── settings/
│   ├── SettingsPanel.tsx            # Full settings overlay
│   ├── WidgetToggles.tsx            # Main/side panel config
│   ├── RvcSettings.tsx              # Discord status config
│   ├── ThemeSettings.tsx            # Color/blur/clock style
│   ├── QuoteSettings.tsx            # Quote file management
│   └── DiscordSettings.tsx          # Client ID + socket
├── hooks/
│   ├── usePresenceCompanion.ts      # Daemon API client
│   ├── useAudioAnalysis.ts          # Audio frequency
│   ├── useWidgetConfig.ts           # Widget visibility/settings
│   └── useTheme.ts                  # Theme tokens
└── lib/
    ├── animations.ts                # Spring presets
    ├── scene-registry.ts            # Scene colors
    ├── widget-registry.ts           # Widget definitions
    └── theme-presets.ts             # Color presets
```

---

## Implementation Order

### Phase 1: Core Layout (this session)
1. Main widget zone with PremiumClock + MusicWidget + RvcWidget
2. Side panel system (< > keyboard navigation)
3. Edit mode with drag/resize handles
4. Tutorial overlay

### Phase 2: RVC System
1. RvcWidget — shows current Discord status
2. RvcSettings — custom text, rotation, images
3. Backend: RVC scheduler integration
4. Quote system with file management

### Phase 3: Theme System
1. Theme tokens + localStorage persistence
2. ThemeSettings panel
3. Color presets (Niri Blue, Cyber Green, etc.)
4. Clock style options (Digital/Analog/Minimal)

### Phase 4: Polish
1. Animations (slide-in panels, vinyl spin, waveform)
2. Performance optimization
3. QA testing
4. Documentation
