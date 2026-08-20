# Niri Sync Discord — Popup-First V2 Product Design & Architectural Specification

**Document Version:** 2.0.0  
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

### Key Bottlenecks of V1 Architecture
1. **Interaction Mismatch**: Opening a full web browser tab to check presence, tune Pomodoro, or see current lyrics disrupts Wayland window tiling workflows.
2. **Hardcoded Presence Strings**: Discord activity formatting was coupled to rigid category defaults without dynamic user-defined templates or countdown variables.
3. **Missing Desktop Companion Features**: Productive desktop sessions require focus timers (Pomodoro), personal event/exam countdowns, hardware health monitoring, and instant scene overrides.

---

## 2. KEEP / CHANGE / DROP Analysis

| Component / Module | Decision | Rationale |
| :--- | :--- | :--- |
| `packages/contracts` | **KEEP & EXTEND** | Existing Zod schemas for facts, lyrics, and presence are battle-tested. Extend with `Scene`, `Template`, `PomodoroFact`, `CountdownFact`, and `SystemFact`. |
| `packages/core` (Resolver, Sanitizer, LRC Parser) | **KEEP & EXTEND** | Core deterministic decision logic, $O(\log n)$ lyric search, and secret redactor are completely decoupled from UI. Add `SceneResolver`, `TemplateEngine`, `PomodoroClock`, and `CountdownCalculator`. |
| `apps/daemon` (Sources, Discord RPC, SQLite, API) | **KEEP & EXPAND** | Background daemon remains the authoritative "brain" running as a systemd user service. Add `PomodoroEngine`, `CountdownEngine`, `SystemSource`, and `SceneManager`. |
| Daemon Connection Model | **CHANGE** | Retain HTTP (`127.0.0.1:4242`) + WebSocket (`/api/events`) with enhanced local token handshake and auto-reconnect backoff, ensuring the daemon runs independently of popup window lifecycle. |
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

### 5.2 Window Behavior & Wayland Interaction
- **Summoning**: Bound to keyboard shortcut via Niri configuration (`binds { "Mod+D" { spawn "presenced-popup"; } }`) or Tauri system-level global hotkey plugin.
- **Dismissal**: `Escape` key, clicking outside (when `closeOnBlur: true` is enabled in settings), or pressing the hotkey toggle again.
- **State Preservation**: The popup UI state (active view drawer, scroll position) caches locally so reopening is instantaneous (<50ms).

---

## 6. Scene System

A **Scene** determines the active context displayed in the popup and published to Discord Rich Presence.

### 6.1 Supported Built-in Scenes
1. **`auto`**: Default mode. Evaluates all incoming facts through the deterministic priority resolver (`manual > privacy > gaming > music > recording > coding > video > browser > terminal > generic > idle`).
2. **`music`**: Forces MPRIS media and synchronized lyrics to the forefront, even if high-priority desktop windows are open.
3. **`focus`**: Focus mode suppressing desktop details, showing current task title and elapsed time.
4. **`pomodoro`**: Active Pomodoro focus/break cycle timer with session counter and progress bar.
5. **`countdown`**: Highlights active user milestone countdown (e.g. exams, hackathons, holidays).
6. **`system`**: Hardware telemetry presence scene displaying CPU, RAM, and thermals.
7. **`privacy`**: Masks all desktop and media presence; Discord RPC publishes generic "Private Mode".
8. **`custom`**: User-defined custom text, static asset, and manual details.

### 6.2 Scene Data Contract (`packages/contracts/src/scenes.ts`)
```ts
export type SceneType =
  | "auto"
  | "music"
  | "focus"
  | "pomodoro"
  | "countdown"
  | "system"
  | "privacy"
  | "custom";

export interface SceneDefinition {
  id: string;
  type: SceneType;
  name: string;
  templateId: string;
  customDetails?: string;
  customState?: string;
  targetCountdownId?: string;
  priorityOverride?: number;
}
```

---

## 7. Sources

The daemon orchestrates 6 normalized factual data sources:
1. **`NiriSource`**: Window focus, workspace transitions, app IDs (`niri msg --json event-stream`).
2. **`MprisSource`**: Track title, artist, album, art URL, playback status, monotonic position anchor (`playerctl metadata --follow`).
3. **`LrclibSource`**: Synchronized lyrics, plain lyrics, instrumental status, match confidence (`https://lrclib.net/api/get` + `/search`).
4. **`PomodoroEngine`**: Monotonic interval timer managing Focus (25m), Short Break (5m), Long Break (15m), and session count.
5. **`CountdownEngine`**: Active user countdown target calculations (days, hours, minutes remaining).
6. **`SystemSource`**: CPU usage percentage (from `/proc/stat`), RAM usage (from `/proc/meminfo`), battery level (from `/sys/class/power_supply/`), and CPU temp (from `/sys/class/thermal/`).

---

## 8. Outputs

1. **Discord Rich Presence (`outputs/discord`)**:
   - Dispatches `SET_ACTIVITY` frames via Linux IPC socket (`$XDG_RUNTIME_DIR/discord-ipc-0`, Flatpak, Snap).
   - Rendered using the active Scene's template.
   - Throttled at 3-second coalescing intervals (1 second for high-signal transitions).
2. **Popup UI WebSocket Stream (`api/server.ts`)**:
   - Real-time JSON broadcast of `PresenceSnapshot` on `/api/events`.
   - Emits delta events: `presence.resolved`, `scene.changed`, `pomodoro.tick`, `lyrics.changed`, `system.metrics`.

---

## 9. Template Engine

The template engine in `packages/core/src/template-engine.ts` replaces tokens safely without `eval` or arbitrary script execution.

### 9.1 Supported Tokens
| Token | Source | Example Output |
| :--- | :--- | :--- |
| `{app}` | Niri Focused App | `Visual Studio Code` |
| `{project}` | Sanitized Window Title | `niri-sync-discord` |
| `{track}` | MPRIS Metadata | `Chuyện Đôi Ta` |
| `{artist}` | MPRIS Metadata | `Da LAB` |
| `{album}` | MPRIS Metadata | `After Hours` |
| `{lyric}` | Active Synced Lyric | `Mình đã từng nghĩ sẽ bên nhau...` |
| `{player}` | MPRIS Player Name | `Spotify` |
| `{pomodoro.task}` | Pomodoro Engine | `Calculus II Homework` |
| `{pomodoro.remaining}` | Pomodoro Engine | `23:45` |
| `{pomodoro.session}` | Pomodoro Engine | `2/4` |
| `{pomodoro.state}` | Pomodoro Engine | `Focus` / `Short Break` |
| `{countdown.name}` | Countdown Target | `THPTQG 2027` |
| `{countdown.days}` | Countdown Target | `309` |
| `{countdown.hours}` | Countdown Target | `14` |
| `{system.cpu}` | System Source | `14%` |
| `{system.ram}` | System Source | `42%` |
| `{system.battery}` | System Source | `88%` |
| `{time}` | Monotonic Clock | `14:37` |
| `{date}` | Monotonic Clock | `Aug 20` |

### 9.2 Fallback Strategy
If a token references an unavailable source (e.g. `{lyric}` when lyrics are not found, or `{track}` when player is closed), the template engine collapses the token cleanly or substitutes a configured fallback (e.g. artist/album).

---

## 10. Lyrics UX

### 10.1 Presentation States
- **`synced`**: Synchronized LRC lines available. Rendered in **3-Line Focus View** (previous line, active highlighted line with glowing accent, next line) with smooth translateY transitions.
- **`plain-only`**: Scrollable plain text lyrics.
- **`instrumental`**: Instrumental badge with music waveform icon.
- **`loading`**: Subtle pulse placeholder while LRCLIB queries.
- **`not-found`**: Clean fallback showing track metadata without clutter.
- **`uncertain-match`**: Displays warning chip (`Match confidence < 70%`) with "Search Alternative" action.

---

## 11. Pomodoro Engine

### 11.1 State Machine
```text
  ┌───────────┐    Start     ┌───────────┐
  │   IDLE    ├─────────────►│   FOCUS   │
  └─────▲─────┘              └─────┬─────┘
        │                          │ Timer Expired (Session < 4)
        │ Reset                    ▼
        │                    ┌───────────┐
        ├────────────────────┤ S-BREAK   │
        │                    └─────┬─────┘
        │                          │ Timer Expired (Session == 4)
        │                          ▼
        │                    ┌───────────┐
        └────────────────────┤ L-BREAK   │
                             └───────────┘
```
- **Durations**: Configurable (Default: 25m Focus, 5m Short Break, 15m Long Break, 4 sessions).
- **Monotonic Anchor**: Anchored against `performance.now()`; survives popup closing/reopening and system sleep.
- **Persistence**: Active session state stored in SQLite so restarting daemon preserves remaining seconds.

---

## 12. Countdown Engine

- **Data Model**:
  ```ts
  export interface CountdownItem {
    id: string;
    title: string;
    targetDate: string; // ISO 8601 string
    category: "exam" | "project" | "holiday" | "personal";
    icon?: string;
    enabled: boolean;
    showOnDiscord: boolean;
  }
  ```
- **Math**: Computes exact days, hours, minutes remaining to target timestamp.
- **Formatting**: Short format (`309d 14h`) and verbose format (`309 days remaining`).

---

## 13. System Metrics Source

- **Linux `/proc` & `/sys` Readers**:
  - `CPU`: Delta calculation between consecutive `/proc/stat` reads.
  - `Memory`: Parsed from `MemTotal` and `MemAvailable` in `/proc/meminfo`.
  - `Battery`: Capacity & status read from `/sys/class/power_supply/BAT0/capacity`.
  - `Temperature`: Thermal zone read from `/sys/class/thermal/thermal_zone0/temp`.
- **Sampling Rate**: Polled every 4 seconds in the daemon; emits only when changed > 2% to minimize CPU overhead.

---

## 14. Settings & Configuration

Settings are accessed via a slide-over drawer inside the popup app:
- **General**: Startup with systemd, daemon port (default 4242), loopback bind address.
- **Scenes & Presets**: Select active template presets, manage custom templates.
- **Pomodoro Config**: Focus duration, break durations, notification sound toggles.
- **Countdowns**: Add, edit, remove milestone targets.
- **App Rules & Privacy**: Per-app priority overrides, sanitization rules, and blacklisted app IDs.
- **Diagnostics**: Live telemetry status, socket paths, and LRCLIB cache clear button.

---

## 15. Secret Management

- **Zero Plaintext Token Storage**: No API secrets or tokens are stored in browser `localStorage`.
- **Local IPC Authentication**: When the popup connects to `ws://127.0.0.1:4242/api/events`, the daemon authenticates the connection using a local cookie/token stored in `$XDG_RUNTIME_DIR/presenced.token` (permissions `0600`).
- **OS Secret Service**: If external APIs requiring authentication are added in the future, tokens are stored via `libsecret` / OS keyring through a minimal Tauri command.

---

## 16. Persistence Architecture

Persistent state is stored in SQLite (`~/.config/presenced/presenced.db`) with WAL mode enabled:
- **`kv_store`**: Key-value JSON storage for `rules`, `scenes`, `templates`, `pomodoro_state`, `privacy_mode`.
- **`countdowns`**: Relational table for user milestones `(id, title, target_date, category, enabled, show_on_discord, updated_at)`.
- **`lyrics_cache`**: Synced/plain lyrics cache `(track_key, payload, expires_at)`.
- **`activity_history`**: Bounded table for recent resolved activities `(id, candidate_id, category, title, details, reason, timestamp)`.

---

## 17. Privacy Architecture

1. **Title Masking**: Raw window titles remain private by default unless a specific rule enables `allowSanitizedTitle`.
2. **Instant Privacy Scene**: Toggle in Header or shortcut immediately sets Discord activity to `"Privacy Mode"` and clears details.
3. **App Rules**: Per-app policy configurations:
   - `hide`: Excludes window from presence resolution completely.
   - `genericize`: Uses generic app name (e.g. "Web Browser" instead of page URL/title).
   - `customTitle`: Replaces title with static user string.

---

## 18. Tauri v2 Application Architecture

- **Path**: `apps/popup/`
- **Frontend (`apps/popup/src/`)**:
  - React 19 + TypeScript + Tailwind CSS + Lucide Icons.
  - Consumes WebSocket stream from `127.0.0.1:4242/api/events`.
  - State management via custom hook `usePresenceCompanion()`.
- **Tauri Rust Core (`apps/popup/src-tauri/`)**:
  - Minimal `main.rs` configuring `tauri-plugin-shell`, `tauri-plugin-global-shortcut`, and `tauri-plugin-window-state`.
  - Configures borderless window with transparent background, decorations disabled, and Wayland layer-shell/floating hints.

---

## 19. Old Web App Migration Decision

- **Decision**: **Retire `apps/web` as primary app** and establish `apps/popup` as the flagship product.
- **Migration Strategy**:
  1. Extract battle-tested UI primitives (`LyricsView` math, `DiscordPreviewCard` ticker, `IntegrationsHealthRow` status configs) into `apps/popup/src/components/`.
  2. The daemon's `ApiServer` static asset route will point to `apps/popup/dist` for headless browser fallback inspection if requested, but standalone desktop execution is driven by Tauri v2.
  3. Delete obsolete large dashboard grid views in favor of compact vertical cards.

---

## 20. Failure and Degraded States

| Failure Scenario | System Response | Popup UI Display |
| :--- | :--- | :--- |
| **Daemon not running** | Popup WebSocket retries with exponential backoff (1s -> 5s). | Displays amber "Connecting to presenced daemon..." banner with retry button. |
| **Niri not running / crashed** | `NiriSource` attempts reconnect every 3s. | Niri indicator shows "Reconnecting" / "Unsupported"; fallback to MPRIS/Manual. |
| **No active media player** | `MprisSource` clears media fact. | Music scene displays clean idle placeholder; auto-resolver selects next candidate. |
| **LRCLIB unavailable / 404** | Negative cached for 1 hour; uses `/search` fallback. | Shows "No lyrics found" or plain track metadata without layout jump. |
| **Discord not running** | `DiscordRpcClient` reconnects every 5s. | Discord preview shows "Discord Offline (Waiting for IPC socket)". |

---

## 21. Test Strategy

1. **Unit Tests (Vitest)**:
   - Template engine token replacement and edge cases (`template-engine.test.ts`).
   - Scene resolver priority and fallback logic (`scene-resolver.test.ts`).
   - Pomodoro state transitions and duration math (`pomodoro.test.ts`).
   - Countdown days calculation and leap year handling (`countdown.test.ts`).
   - System metrics parser (`system-metrics.test.ts`).
2. **Integration Tests (Vitest)**:
   - Daemon WebSocket broadcast of scene and pomodoro events (`daemon-scenes.test.ts`).
   - SQLite persistence of countdowns and templates (`database-v2.test.ts`).
3. **UI / Smoke Tests**:
   - Component rendering in popup shell at fixed 380px width.
   - Long text, Vietnamese diacritics, and Japanese CJK string wrapping.
   - Reduced-motion mode verification.

---

## 22. Technical Risks & Mitigations

1. **Wayland Floating / Positioning**: Wayland compositors restrict arbitrary client window positioning.
   - *Mitigation*: Configure standard Wayland floating rules for `app_id: "presenced-popup"` in Niri configuration (`window-rules { match app-id="presenced-popup" { open-floating true; default-column-width { fixed 380; }; } }`).
2. **Audio/Video MPRIS Desync**: Video players (MPV, Chromium) pausing without sending position anchors.
   - *Mitigation*: Use monotonic elapsed math clamped to track duration; reset anchor immediately on pause event.
3. **Template Token Injection / Exploitation**: Malicious tokens in window titles.
   - *Mitigation*: Tokens are parsed via single-pass regex matching against a strict whitelist; inputs are sanitized and escaped before substitution.

---

## 23. Definition of Done

A task in this V2 pivot is done when:
1. All TypeScript code compiles strictly with 0 errors (`strict: true`, `noUncheckedIndexedAccess: true`).
2. Vitest unit and integration test suite passes 100%.
3. Tauri v2 desktop popup builds and runs natively on Linux/Wayland.
4. Discord RPC outputs accurate payloads according to active Scenes and Templates.
5. Pomodoro and Countdown features function and persist across daemon restarts.
6. Documentation and rules are updated in sync with implementation.
