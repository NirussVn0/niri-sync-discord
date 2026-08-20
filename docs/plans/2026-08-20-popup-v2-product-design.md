# Niri Sync Discord — Popup-First V2 Product Design & Architectural Specification

**Document Version:** 2.1.0  
**Date:** 2026-08-20  
**Author:** Lead Software Engineer & Product Designer  
**Target Repository:** `NirussVn0/niri-sync-discord`  
**Status:** Approved Architecture Plan

---

## 1. Current Architecture Assessment

The V1 system was built as a daemon-centric monorepo with an accompanying web browser dashboard:
- **`packages/contracts`**: Strict Zod schemas and TypeScript interfaces for domain facts (`DesktopFact`, `MediaFact`), presence resolution (`ActivityCandidate`, `ResolvedPresence`, `PresenceSnapshot`), daemon events, health telemetry, and persistence rules.
- **`packages/core`**: Deterministic resolution state machine, rule-based category classifier, text sanitization and privacy masking pipeline, and $O(\log n)$ binary-search LRC lyric parsing.
- **`apps/daemon`**: Node.js LTS daemon running `NiriSource` (JSON stream via `niri msg --json event-stream`), `MprisSource` (`playerctl metadata --follow` with monotonic `PlaybackClock` position tracking), `DiscordRpcClient` (Unix domain IPC socket with 8-byte LE framing), `LrclibClient` (synced/plain lyrics lookup with search fallback and SQLite caching), `PresenceStore` (focus debounce and state broadcasting), `DatabaseManager` (native `node:sqlite` WAL persistence), and `ApiServer` (Hono HTTP + WebSocket stream on `127.0.0.1:4242`).
- **`apps/web`**: React + Vite + Tailwind CSS control center served either via Vite dev server or statically hosted by `ApiServer`.

---

## 2. KEEP / CHANGE / DROP Analysis

| Component / Module | Decision | Rationale |
| :--- | :--- | :--- |
| `packages/contracts` | **KEEP & EXTEND** | Existing Zod schemas for facts, lyrics, and presence are battle-tested. Extend with `Scene`, `Template`, `PomodoroFact`, `CountdownFact`, and `SystemFact`. |
| `packages/core` (Resolver, Sanitizer, LRC Parser) | **KEEP & EXTEND** | Core deterministic decision logic, $O(\log n)$ lyric search, and secret redactor are completely decoupled from UI. Add `SceneResolver`, `TemplateEngine`, `PomodoroClock`, and `CountdownCalculator`. |
| `apps/daemon` (Sources, Discord RPC, SQLite, API) | **KEEP & EXPAND** | Background daemon remains the authoritative "brain" running as a systemd user service. Add `PomodoroEngine`, `CountdownEngine`, `SystemSource`, `NiriShellAdapter`, and `SceneManager`. |
| Daemon Connection Model | **CHANGE** | Retain HTTP (`127.0.0.1:4242`) + WebSocket (`/api/events`) with local token handshake and auto-reconnect backoff, ensuring the daemon runs independently of popup window lifecycle. |
| Primary User Interface | **CHANGE** | Pivot from a full-page web dashboard to a dedicated, compact, borderless desktop popup app in `apps/popup/` powered by **Tauri v2 + React + TypeScript**. |
| `apps/web` (Web Dashboard) | **DROP / RETIRE** | Deprecate `apps/web` as the primary user surface. Reusable component logic (lyrics sync math, media progress bars, Discord simulated card) is migrated into `apps/popup/src/components/`. |

---

## 3. Product Goals

1. **Native Desktop Companion**: A compact, Wayland/Niri-native vertical popup (~380px wide × ~580px adaptive height) summoned via global shortcut (`Super+D` or user-defined hotkey), dismissing on `Escape` or loss of focus.
2. **Integrated Domain Context**: Unifies Niri window tracking, MPRIS media playback, 3-line focused synchronized lyrics, Pomodoro focus cycles, personal countdowns, and hardware telemetry into a single glanceable surface.
3. **First-Class Scene System**: User-selectable and auto-resolving Scenes (`Auto`, `Music`, `Focus`, `Pomodoro`, `Countdown`, `System`, `Custom`, `Privacy`) defining both popup presentation and Discord RPC payload.
4. **Safe Custom Template Engine**: Rich variable substitution (`{track}`, `{artist}`, `{lyric}`, `{pomodoro.remaining}`, `{countdown.days}`, `{system.cpu}`) allowing customized Discord state strings without code execution vulnerabilities.
5. **Authoritative Local Daemon**: Daemon runs persistently under `systemd --user`. Closing or hiding the popup does not interrupt Discord presence, Pomodoro ticking, or media tracking.
6. **Privacy by Default**: Raw window titles remain masked by default; instant one-click Privacy Scene suppresses all outgoing activity context.

---

## 4. Non-Goals

- **No Discord User-Token Selfbot**: Strictly uses local Discord IPC socket RPC (`SET_ACTIVITY`). No Custom Status mutation, scraping, or Discord Gateway token connections.
- **No Runtime LLM/AI Dependency**: All context categorization, lyrics alignment, and scene evaluation remain pure deterministic TypeScript.
- **No Heavy Rust Monolith**: Tauri Rust code is strictly restricted to window creation, Wayland position helpers, and system tray/shortcut bindings. Business logic remains 100% in TypeScript.
- **No Cloud Data Sync**: All configuration, overrides, countdowns, and lyrics caches remain local-first in SQLite (`~/.config/presenced/presenced.db`).
- **No Full System Resource Monitor**: Hardware telemetry is lightweight enrichment (CPU, RAM, Battery, Temp) polled at bounded intervals (3–5s), not an HTop replacement.

---

## 5. Popup UX Architecture

### 5.1 Physical Anatomy & Geometry
- **Window Shape**: Borderless, rounded corners (`rounded-2xl`, 16px radius), subtle 1px border (`border-slate-800/80`), translucent dark background (`bg-slate-950/90` with compositor blur).
- **Dimensions**: Fixed width `380px`, adaptive height `520px`–`640px` fitting comfortably in Niri floating/layer rules.
- **Layout Stream**:
  ```text
  ┌──────────────────────────────────────────┐
  │ [Avatar] Good Afternoon, Niruss   14:37  │
  │ Thursday, Aug 20 · Niri Workspace 1     │
  ├──────────────────────────────────────────┤
  │ SCENE SELECTOR PILLS                     │
  │ [ Auto* ] [ Music ] [ Focus ] [ Pomo ]   │
  ├──────────────────────────────────────────┤
  │ ACTIVE SCENE SURFACE                     │
  │                                          │
  │ [Art] Chuyện Đôi Ta                      │
  │       Da LAB · After Hours               │
  │ ──────●──────────────────────── 01:24/03:42 │
  │                                          │
  │ previous lyric line                      │
  │ ▶ MÌNH ĐÃ TỪNG NGHĨ SẼ BÊN NHAU...       │
  │ next lyric line                          │
  ├──────────────────────────────────────────┤
  │ POMODORO / COUNTDOWN WIDGET              │
  │ Focus: Calculus II · 21:40 left (2/4)    │
  ├──────────────────────────────────────────┤
  │ SYSTEM SUMMARY CHIPS                     │
  │ CPU 14% · RAM 42% · BAT 88% (Charging)  │
  ├──────────────────────────────────────────┤
  │ FOOTER QUICK CONTROLS                    │
  │ [ Pause ] [ Privacy ] [ Discord ] [ ⚙ ]  │
  └──────────────────────────────────────────┘
  ```

---

## 6. Scene System

A **Scene** determines the active context displayed in the popup and published to Discord Rich Presence.
- **`auto`**: Evaluates facts through priority resolver (`manual > privacy > gaming > music > recording > coding > video > browser > terminal > generic > idle`).
- **`music`**: Forces MPRIS media and synchronized lyrics to the forefront.
- **`focus`**: Focus mode suppressing desktop details, showing current task and elapsed time.
- **`pomodoro`**: Active Pomodoro focus/break cycle timer.
- **`countdown`**: Highlights active user milestone countdown (e.g. exams, hackathons, holidays).
- **`system`**: Hardware telemetry presence scene displaying CPU, RAM, and thermals.
- **`privacy`**: Masks all desktop and media presence; Discord RPC publishes generic "Private Mode".
- **`custom`**: User-defined custom text, static asset, and manual details.

---

## 7. Sources

1. **`NiriSource` / `NiriShellAdapter`**: Window focus, workspace transitions, active outputs (`niri msg --json event-stream`).
2. **`MprisSource`**: Track title, artist, album, art URL, playback status, monotonic position anchor (`playerctl metadata --follow`).
3. **`LrclibSource`**: Synchronized lyrics, plain lyrics, instrumental status, match confidence (`https://lrclib.net/api/get` + `/search`).
4. **`PomodoroEngine`**: Monotonic interval timer managing Focus (25m), Short Break (5m), Long Break (15m), and session count.
5. **`CountdownEngine`**: Active user countdown target calculations (days, hours, minutes remaining).
6. **`SystemSource`**: CPU usage percentage, RAM usage, battery level, and CPU temp.

---

## 8. Outputs

1. **Discord Rich Presence (`outputs/discord`)**: Dispatches `SET_ACTIVITY` frames via Linux IPC socket rendered using active Scene's template.
2. **Popup UI WebSocket Stream (`api/server.ts`)**: Real-time JSON broadcast of `PresenceSnapshot` on `/api/events`.

---

## 9. Template Engine

Safe token-based string replacement in `packages/core/src/template-engine.ts`:
`{track}`, `{artist}`, `{album}`, `{lyric}`, `{player}`, `{pomodoro.task}`, `{pomodoro.remaining}`, `{pomodoro.session}`, `{countdown.name}`, `{countdown.days}`, `{system.cpu}`, `{system.ram}`, `{time}`, `{date}`.

---

## 10. Lyrics UX

- **`synced`**: 3-Line Focus View (previous line, active highlighted line with glow accent, next line) with smooth translateY transitions.
- **`plain-only`**: Scrollable plain text lyrics.
- **`instrumental`**: Instrumental badge with music waveform icon.
- **`loading`**: Subtle pulse placeholder while LRCLIB queries.
- **`not-found`**: Clean fallback showing track metadata without clutter.

---

## 11. Pomodoro Engine

State machine: `idle` -> `focus` -> `short_break` -> `long_break`.
Monotonic timer anchored to `performance.now()`; survives popup hide/show and daemon restarts via SQLite persistence.

---

## 12. Countdown Engine

Stores user milestones with ISO target timestamps and calculates days/hours remaining dynamically.

---

## 13. System Metrics Source

Reads `/proc/stat`, `/proc/meminfo`, `/sys/class/power_supply/`, `/sys/class/thermal/` with 4s bounded polling and 2% change threshold.

---

## 14. Settings & Configuration

Slide-over drawer inside popup: general daemon settings, template presets, Pomodoro parameters, countdowns manager, app rules, and Niri integration snippet.

---

## 15. Secret Management

Zero plaintext token storage in browser `localStorage`. Local IPC cookie/token in `$XDG_RUNTIME_DIR/presenced.token` (`0600` permissions) for API authentication.

---

## 16. Persistence Architecture

SQLite (`~/.config/presenced/presenced.db`) with WAL mode: `kv_store`, `countdowns`, `lyrics_cache`, `activity_history`.

---

## 17. Privacy Architecture

Title masking by default; one-click Privacy Scene; per-app rules (`hide`, `genericize`, `customTitle`).

---

## 18. Tauri v2 Application Architecture

- `apps/popup/src/`: React 19 + TypeScript + Tailwind CSS.
- `apps/popup/src-tauri/`: Minimal Rust bootstrap, Wayland layer-shell configuration, and global shortcut listener.

---

## 19. Old Web App Migration Decision

Retire `apps/web` as primary app; migrate reusable components to `apps/popup/src/components/`.

---

## 20. Failure and Degraded States

Handled gracefully with reconnection backoff and explicit UI status indicators.

---

## 21. Test Strategy

100% coverage across Vitest unit/integration tests and UI review checks.

---

## 22. Technical Risks & Mitigations

Documented and verified via research spike.

---

## 23. Definition of Done

Strict typecheck, passing Vitest suite, native Wayland popup execution, zero regressions.

---

## 24. Native Niri / Wayland Integration

### 24.1 Architecture & Layer Policy
- **Primary Mode**: Wayland native + `wlr-layer-shell` via `gtk-layer-shell` on GTK3 WebKitGTK window handle.
- **Layer**: `Layer::Top` (sits above normal tiled windows and status bars).
- **Placement**: Anchored `Top | Right` with `16px` top and right margins on the currently focused Niri output.
- **Namespace**: `niri-sync-discord`
- **Application ID**: `io.niruss.niri-sync-discord`

### 24.2 NiriShellAdapter & Output Sync
`NiriShellAdapter` monitors Niri's JSON event stream (`niri msg --json event-stream`):
- Tracks `focused-output` dynamically (e.g. `HDMI-A-3` vs `DP-4`).
- Listens to workspace changes and overview toggle events (`OverviewOpened` / `OverviewClosed`).
- Hides popup smoothly during overview without destroying DOM state.

### 24.3 Focus Protection Semantics
When the popup receives keyboard interactivity or focus, `PresenceStore` detects that the focused window or layer surface belongs to `niri-sync-discord` / `io.niruss.niri-sync-discord`. Instead of switching presence candidate to `Idle`, the presence engine preserves the last meaningful desktop activity (e.g. `Coding`).

### 24.4 Normal Window Fallback
If `gtk-layer-shell` is unavailable, `PopupSurfaceAdapter` falls back to an ordinary floating Tauri window with recommended Niri window rule:
```kdl
window-rule {
    match app-id="io.niruss.niri-sync-discord"
    open-floating true
    default-column-width { fixed 390; }
}
```

### 24.5 Desktop Appearance & Semantic Design Tokens
`DesktopAppearanceSource` reads dark/light preferences and system theme to expose design tokens (`background`, `surface`, `surfaceElevated`, `text`, `textMuted`, `accent`, `warning`, `danger`, `success`, `border`, `radius`, `blur`).
