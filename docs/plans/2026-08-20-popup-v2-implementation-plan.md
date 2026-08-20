# Niri Sync Discord — Popup-First V2 Implementation Plan

**Document Version:** 2.1.0  
**Date:** 2026-08-20  
**Status:** Approved Implementation Plan  
**Target Repository:** `NirussVn0/niri-sync-discord`

---

## Roadmap & Vertical Slices Overview

```text
Phase 0: Technical Spike, Monorepo Contracts & Tauri v2 Shell
Phase 1: NiriShellAdapter, Daemon State Stream & Header Widget
Phase 2: Niri Desktop Context & Window Card
Phase 3: MPRIS Music & Media Player Card
Phase 4: Discord RPC Preview & Synchronization
Phase 5: 3-Line Focused Synchronized Lyrics Experience
Phase 6: First-Class Scene System & Auto-Resolver
Phase 7: Safe Custom RPC Template Engine
Phase 8: Pomodoro Engine & Monotonic Focus Timer
Phase 9: Personal Milestone Countdown Engine
Phase 10: Lightweight Hardware & System Metrics Source
Phase 11: Settings Drawer, Secret Management & SQLite Migrations
Phase 12: Visual Polish, UI Review, and Production Packaging
```

---

## Phase 0: Technical Spike, Monorepo Contracts & Tauri v2 Shell

### Task 0.0: Native Niri / Wayland / Layer-Shell Technical Spike
- **Goal**: Experimentally verify Tauri v2 + native Wayland + WebKit2GTK 4.1 + `gtk-layer-shell` on the current Niri dual-monitor setup (`HDMI-A-3` + `DP-4`).
- **Files**:
  - `docs/research/tauri-niri-wayland-layer-shell.md`
- **Dependencies**: None.
- **Tests**: Verify `WAYLAND_DISPLAY=wayland-1`, `niri msg --json outputs`, `niri msg --json workspaces`, and `pkg-config --modversion gtk-layer-shell-0 webkit2gtk-4.1`.
- **Acceptance Criteria**: Documented actual runtime evidence proving layer-shell feasibility and normal window fallback rule.
- **Commit**: `docs: research tauri v2 niri wayland layer shell feasibility`

### Task 0.1: Extend Shared Contracts
- **Goal**: Define domain schemas for `Scene`, `Template`, `PomodoroFact`, `CountdownFact`, and `SystemFact` in `@presenced/contracts`.
- **Files**:
  - `packages/contracts/src/scenes.ts`
  - `packages/contracts/src/templates.ts`
  - `packages/contracts/src/pomodoro.ts`
  - `packages/contracts/src/countdowns.ts`
  - `packages/contracts/src/system.ts`
  - `packages/contracts/src/index.ts`
- **Dependencies**: Task 0.0.
- **Tests**: `packages/contracts/src/__tests__/contracts-v2.test.ts`
- **Acceptance Criteria**: All schemas parse valid payloads and reject invalid/malformed structures.
- **Commit**: `feat(contracts): add scene, template, pomodoro, countdown and system schemas`

### Task 0.2: Bootstrap Tauri v2 Desktop Popup Application
- **Goal**: Initialize `apps/popup/` workspace with Tauri v2, React 19, Vite, Tailwind CSS, and TypeScript.
- **Files**:
  - `apps/popup/package.json`
  - `apps/popup/vite.config.ts`
  - `apps/popup/tsconfig.json`
  - `apps/popup/src-tauri/tauri.conf.json`
  - `apps/popup/src-tauri/Cargo.toml`
  - `apps/popup/src-tauri/src/main.rs`
  - `apps/popup/src/index.html`
  - `apps/popup/src/main.tsx`
  - `apps/popup/src/App.tsx`
  - `pnpm-workspace.yaml`
- **Dependencies**: Task 0.1.
- **Tests**: `pnpm --filter @presenced/popup build`
- **Acceptance Criteria**: Tauri popup builds cleanly and opens a compact (380px), borderless, transparent desktop window.
- **Commit**: `feat(popup): bootstrap Tauri v2 desktop companion shell`

---

## Phase 1: NiriShellAdapter, Daemon State Stream & Header Widget

### Task 1.1: Live WebSocket Connection Hook
- **Goal**: Implement `usePresenceCompanion` hook in `apps/popup/src/hooks/usePresenceCompanion.ts` to stream full snapshot and delta events from `127.0.0.1:4242/api/events`.
- **Files**:
  - `apps/popup/src/hooks/usePresenceCompanion.ts`
  - `apps/popup/src/__tests__/companion-hook.test.ts`
- **Dependencies**: Task 0.2.
- **Tests**: Unit tests with mock WebSocket server verifying snapshot ingestion and reconnect backoff.
- **Acceptance Criteria**: Hook reports `connected: true`, receives live daemon updates, and recovers from daemon restart.
- **Commit**: `feat(popup): connect live daemon state via WebSocket companion hook`

### Task 1.2: NiriShellAdapter & Output Alignment
- **Goal**: Add `NiriShellAdapter` to daemon tracking `focused-output`, active workspace, and overview state (`niri msg --json event-stream`).
- **Files**:
  - `apps/daemon/src/sources/niri/niri-shell-adapter.ts`
  - `apps/daemon/src/__tests__/niri-shell-adapter.test.ts`
- **Dependencies**: Task 1.1.
- **Tests**: Verify output change events and workspace tracking.
- **Acceptance Criteria**: Accurately reports focused output (`HDMI-A-3` vs `DP-4`) and suppresses idle state when popup has focus.
- **Commit**: `feat(daemon): add NiriShellAdapter for focused output and workspace tracking`

### Task 1.3: Compact Header & Profile Greeting Widget
- **Goal**: Implement compact top header displaying avatar, localized time, day/date, and live connection status pill.
- **Files**:
  - `apps/popup/src/components/HeaderWidget.tsx`
  - `apps/popup/src/App.tsx`
- **Dependencies**: Task 1.2.
- **Tests**: `apps/popup/src/__tests__/header-widget.test.ts`
- **Acceptance Criteria**: Header renders greeting, current time ticking every second, and active Niri workspace badge.
- **Commit**: `feat(popup): add compact profile and greeting header widget`

---

## Phase 2: Niri Desktop Context & Window Card

### Task 2.1: Focused Window & App Context Card
- **Goal**: Build compact desktop card displaying focused application icon, sanitized title, and app ID.
- **Files**:
  - `apps/popup/src/components/DesktopCard.tsx`
- **Dependencies**: Task 1.3.
- **Tests**: Component test asserting proper truncation on long window titles.
- **Acceptance Criteria**: Displays current Niri focus clearly with app category badge and sanitization indicators.
- **Commit**: `feat(popup): add compact desktop focus context card`

---

## Phase 3: MPRIS Music & Media Player Card

### Task 3.1: Compact Music & Media Player Surface
- **Goal**: Build dedicated media card featuring album art, track title, artist, album, and real-time monotonic progress bar.
- **Files**:
  - `apps/popup/src/components/MusicCard.tsx`
  - `apps/popup/src/utils/time-format.ts`
- **Dependencies**: Task 1.1.
- **Tests**: Test monotonic progress math against seek and pause states.
- **Acceptance Criteria**: Displays track metadata with smooth progress bar without layout jitter.
- **Commit**: `feat(popup): add compact music and media playback card`

---

## Phase 4: Discord RPC Preview & Synchronization

### Task 4.1: Discord Output Preview Card
- **Goal**: Render exact Discord profile simulation showing current published rich presence state, elapsed time, and artwork.
- **Files**:
  - `apps/popup/src/components/DiscordPreview.tsx`
- **Dependencies**: Task 3.1.
- **Tests**: Verify elapsed/remaining ticker format and safe Unicode first-char fallback.
- **Acceptance Criteria**: Reflects actual `SET_ACTIVITY` payload dispatched by the daemon.
- **Commit**: `feat(popup): add live Discord Rich Presence preview card`

---

## Phase 5: 3-Line Focused Synchronized Lyrics Experience

### Task 5.1: 3-Line Focused Lyrics Component
- **Goal**: Implement high-legibility 3-line lyric view (previous, active with glow highlight, next) with zero layout shifting.
- **Files**:
  - `apps/popup/src/components/FocusedLyricsView.tsx`
- **Dependencies**: Task 3.1.
- **Tests**: `apps/popup/src/__tests__/focused-lyrics.test.ts`
- **Acceptance Criteria**: Active line is highlighted smoothly; transitions use CSS transforms without reflowing surrounding DOM.
- **Commit**: `feat(popup): add 3-line focused synchronized lyrics experience`

---

## Phase 6: First-Class Scene System & Auto-Resolver

### Task 6.1: Scene Definition & Resolver Engine
- **Goal**: Implement `SceneResolver` in `packages/core/src/scene-resolver.ts` supporting `Auto`, `Music`, `Focus`, `Pomodoro`, `Countdown`, `System`, `Custom`, and `Privacy` scenes.
- **Files**:
  - `packages/core/src/scene-resolver.ts`
  - `packages/core/src/index.ts`
  - `packages/core/src/__tests__/scene-resolver.test.ts`
- **Dependencies**: Task 0.1.
- **Tests**: Unit tests covering auto-resolution priority and manual scene override selection.
- **Acceptance Criteria**: Deterministically selects the active scene based on incoming facts or user override.
- **Commit**: `feat(core): implement deterministic scene resolution engine`

### Task 6.2: Daemon Scene Orchestration & API Endpoints
- **Goal**: Add scene state management to `PresenceStore` and HTTP endpoints `GET/POST /api/scene`.
- **Files**:
  - `apps/daemon/src/state/presence-store.ts`
  - `apps/daemon/src/api/server.ts`
  - `apps/daemon/src/__tests__/scene-api.test.ts`
- **Dependencies**: Task 6.1.
- **Tests**: API test verifying `/api/scene` switching and WebSocket event broadcast.
- **Acceptance Criteria**: Client can switch scenes and all connected outputs receive `scene.changed` event.
- **Commit**: `feat(daemon): add scene management and API endpoints`

### Task 6.3: Popup Scene Selector Pills
- **Goal**: Add horizontal scene selector pills (`Auto`, `Music`, `Focus`, `Pomo`, `Exam`, `System`) to popup UI.
- **Files**:
  - `apps/popup/src/components/SceneSelector.tsx`
  - `apps/popup/src/App.tsx`
- **Dependencies**: Task 6.2.
- **Tests**: Interactive test verifying active pill highlight and scene switch action.
- **Acceptance Criteria**: Clicking pill updates active scene instantly with visual transition.
- **Commit**: `feat(popup): add horizontal scene switcher pills`

---

## Phase 7: Safe Custom RPC Template Engine

### Task 7.1: Token Parser & String Interpolation Engine
- **Goal**: Implement `TemplateEngine` in `packages/core/src/template-engine.ts` supporting safe token replacement (`{track}`, `{artist}`, `{lyric}`, `{pomodoro.remaining}`, `{countdown.days}`, `{system.cpu}`, `{time}`).
- **Files**:
  - `packages/core/src/template-engine.ts`
  - `packages/core/src/default-templates.ts`
  - `packages/core/src/index.ts`
  - `packages/core/src/__tests__/template-engine.test.ts`
- **Dependencies**: Task 0.1.
- **Tests**: Unit tests for all supported tokens, missing token fallback, and malicious input escaping.
- **Acceptance Criteria**: Renders templates safely without code execution vulnerabilities.
- **Commit**: `feat(core): implement safe RPC template substitution engine`

### Task 7.2: Wire Template Engine into Discord Payload Mapper
- **Goal**: Update `PayloadMapper` in `apps/daemon/src/outputs/discord/payload-mapper.ts` to format Discord presence using the active Scene's template.
- **Files**:
  - `apps/daemon/src/outputs/discord/payload-mapper.ts`
  - `apps/daemon/src/__tests__/payload-mapper-templates.test.ts`
- **Dependencies**: Task 7.1.
- **Tests**: Integration test verifying custom template output strings for various scenes.
- **Acceptance Criteria**: Discord payload accurately matches rendered template strings.
- **Commit**: `feat(daemon): wire template engine into Discord RPC output`

---

## Phase 8: Pomodoro Engine & Monotonic Focus Timer

### Task 8.1: Pomodoro State Machine & Clock
- **Goal**: Implement `PomodoroEngine` in `apps/daemon/src/sources/pomodoro/pomodoro-engine.ts` with Focus, Short Break, Long Break, and session counter.
- **Files**:
  - `apps/daemon/src/sources/pomodoro/pomodoro-engine.ts`
  - `apps/daemon/src/__tests__/pomodoro-engine.test.ts`
- **Dependencies**: Task 0.1.
- **Tests**: Test tick intervals, pause/resume, session rollover, and monotonic anchor accuracy.
- **Acceptance Criteria**: Accurately counts down and transitions states without timer drift.
- **Commit**: `feat(daemon): implement authoritative Pomodoro state engine`

### Task 8.2: Pomodoro Popup Surface & Controls
- **Goal**: Build compact Pomodoro widget in popup with circular progress indicator, task title, session count, and start/pause/skip buttons.
- **Files**:
  - `apps/popup/src/components/PomodoroWidget.tsx`
  - `apps/popup/src/views/PomodoroSceneView.tsx`
- **Dependencies**: Task 8.1.
- **Tests**: Interactive test verifying start/pause/skip button dispatches.
- **Acceptance Criteria**: User can control Pomodoro directly from the popup.
- **Commit**: `feat(popup): add Pomodoro focus timer card and controls`

---

## Phase 9: Personal Milestone Countdown Engine

### Task 9.1: Countdown Calculation Engine & SQLite Table
- **Goal**: Implement `CountdownEngine` and SQLite table `countdowns` in `apps/daemon/src/state/countdowns.ts`.
- **Files**:
  - `apps/daemon/src/state/countdowns.ts`
  - `apps/daemon/src/state/database.ts`
  - `apps/daemon/src/api/server.ts`
  - `apps/daemon/src/__tests__/countdowns.test.ts`
- **Dependencies**: Task 0.1.
- **Tests**: Test days/hours remaining calculations and CRUD operations.
- **Acceptance Criteria**: Correctly persists and calculates milestone targets.
- **Commit**: `feat(daemon): add personal countdown engine and SQLite persistence`

### Task 9.2: Countdown Card & Scene Surface
- **Goal**: Build compact Countdown widget and dedicated Countdown scene surface.
- **Files**:
  - `apps/popup/src/components/CountdownWidget.tsx`
  - `apps/popup/src/views/CountdownSceneView.tsx`
- **Dependencies**: Task 9.1.
- **Tests**: Render test verifying formatted days remaining display.
- **Acceptance Criteria**: Shows milestone name, category icon, and remaining days/hours.
- **Commit**: `feat(popup): add milestone countdown widget and scene view`

---

## Phase 10: Lightweight Hardware & System Metrics Source

### Task 10.1: Linux /proc and /sys Telemetry Reader
- **Goal**: Implement `SystemSource` in `apps/daemon/src/sources/system/system-source.ts` reading CPU, RAM, battery, and temp.
- **Files**:
  - `apps/daemon/src/sources/system/system-source.ts`
  - `apps/daemon/src/__tests__/system-source.test.ts`
- **Dependencies**: Task 0.1.
- **Tests**: Test parsing `/proc/stat` and `/proc/meminfo` mocks.
- **Acceptance Criteria**: Returns valid system metrics without exceeding 1% CPU utilization.
- **Commit**: `feat(daemon): add lightweight Linux hardware telemetry source`

### Task 10.2: System Metrics Summary Chips & Scene View
- **Goal**: Build compact telemetry chips and dedicated System scene view in popup.
- **Files**:
  - `apps/popup/src/components/SystemMetricsChips.tsx`
  - `apps/popup/src/views/SystemSceneView.tsx`
- **Dependencies**: Task 10.1.
- **Tests**: Verify metric pill formatting and warning colors for high CPU/temp.
- **Acceptance Criteria**: Displays hardware telemetry cleanly in compact chips.
- **Commit**: `feat(popup): add system hardware telemetry chips and scene view`

---

## Phase 11: Settings Drawer, Secret Management & SQLite Migrations

### Task 11.1: Settings Slide-Over Drawer
- **Goal**: Build slide-over settings drawer inside popup for configuring presets, Pomodoro durations, countdowns, and privacy rules.
- **Files**:
  - `apps/popup/src/components/SettingsDrawer.tsx`
  - `apps/popup/src/components/CountdownEditor.tsx`
  - `apps/popup/src/components/TemplateEditor.tsx`
- **Dependencies**: Tasks 6.2, 8.1, 9.1.
- **Tests**: Test drawer open/close transitions and form submissions.
- **Acceptance Criteria**: Allows complete customization without leaving the popup desktop experience.
- **Commit**: `feat(popup): add slide-over settings drawer and configuration editors`

### Task 11.2: Local IPC Token Authentication & Secrets
- **Goal**: Implement `$XDG_RUNTIME_DIR/presenced.token` file-based handshake for daemon API authentication.
- **Files**:
  - `apps/daemon/src/api/server.ts`
  - `apps/popup/src/hooks/usePresenceCompanion.ts`
- **Dependencies**: Task 11.1.
- **Tests**: Test authenticated vs unauthenticated WebSocket connections.
- **Acceptance Criteria**: Rejects connections without valid local runtime token.
- **Commit**: `feat(daemon): enforce local runtime token authentication`

---

## Phase 12: Visual Polish, UI Review, and Production Packaging

### Task 12.1: Theme Tokens, Motion & Accessibility Polish
- **Goal**: Implement cohesive theme tokens (`Midnight`, `Sakura`, `OLED`, `Dynamic`), keyboard navigation, and reduced-motion compliance.
- **Files**:
  - `apps/popup/src/styles/theme.css`
  - `apps/popup/tailwind.config.js`
- **Dependencies**: All previous tasks.
- **Tests**: UI review checklist execution with `ui-reviewer` subagent.
- **Acceptance Criteria**: Passes all 8 checks in `.agents/rules/20-ui-ux.md`.
- **Commit**: `feat(popup): polish visual hierarchy, themes, motion and accessibility`

### Task 12.2: Systemd User Service & Desktop Entry Packaging
- **Goal**: Create `packaging/desktop/presenced-popup.desktop` and update `systemd/presenced.service` for production installation.
- **Files**:
  - `packaging/desktop/presenced-popup.desktop`
  - `systemd/presenced.service`
  - `README.md`
- **Dependencies**: Task 12.1.
- **Tests**: Verify `pnpm -r build && pnpm test` across entire monorepo.
- **Acceptance Criteria**: Single-command install and systemd startup works reliably.
- **Commit**: `chore(packaging): finalize systemd unit, desktop entry, and documentation`
