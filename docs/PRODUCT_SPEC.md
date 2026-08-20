# Product Spec — presenced

## 1. Goal

Create a Linux desktop presence system that automatically reflects what the user is doing while keeping control local and explicit.

Primary experiences:

- Listening to Spotify, YouTube Music, browser media, VLC/mpv, etc.
- Showing title/artist/album art when available.
- Showing the current synchronized lyric line when available.
- Falling back to focused desktop context from Niri when media is paused/stopped.
- Manual overrides such as Studying, Coding, Recording, Privacy Mode.
- A web control center that explains current inputs, the winning rule, the exact outgoing Discord preview, and health of each integration.

## 2. Explicit non-goals

For v1:

- No Discord selfbot or user-token automation.
- No automatic Discord Custom Status editing.
- No cloud account, cloud sync, telemetry, or public server.
- No LLM in the runtime decision loop.
- No Wayland-wide screen content inspection.
- No deep browser history scraping.
- No plugin marketplace.

## 3. Core user stories

### Media

When a compatible player is playing, the user sees:

- player source
- track title
- artist
- album
- playback progress
- album art if trustworthy metadata exposes it
- synchronized current lyric when available

The resolved activity should prefer active media over generic focused apps unless a higher-priority rule or manual override says otherwise.

### Desktop context

When media is not actively playing, Niri focused-window state may resolve to categories such as:

- Coding
- Terminal
- Browsing
- Recording
- Gaming
- Generic app

Application identity (`app_id`) is safe input. Window title is sensitive input and must be sanitized before it can affect published text.

### Manual override

A user can set a manual activity with optional expiry. Manual override has the highest default priority. It survives daemon restart until expiry or manual clear.

### Persistence

Persist:

- settings
- rules and priorities
- manual override
- last resolved/published presence
- lyrics cache metadata
- optional bounded activity history

Do **not** treat Discord Custom Status as state owned by this application. `presenced` must leave it untouched.

## 4. Priority model

Default priority:

```text
manual override  100
privacy mode      95
gaming            90
music playing     80
recording          75
coding             60
video              50
browser            30
terminal           25
generic app        10
idle                0
```

Priorities are configuration, not hard-coded branching. The resolver chooses the highest valid candidate, then applies stability/debounce rules.

## 5. Presence stability

A source event creates a candidate; it does not immediately guarantee an output update.

Rules:

- Track changes are high-signal and may publish quickly.
- Focus changes are debounced.
- Repeated equivalent presence payloads are ignored.
- Discord updates are coalesced through a single scheduler.
- Lyrics line changes are allowed to refresh RPC only at a conservative configured interval; intermediate short lines may be skipped on Discord while remaining fully synchronized in the web UI.

## 6. Degraded behavior

- Niri unavailable: media-only mode remains functional.
- MPRIS unavailable: desktop-only mode remains functional.
- Discord closed: show disconnected state and retain desired resolved presence locally.
- Lyrics provider unavailable: continue media presence without lyrics.
- Lyrics mismatch/low confidence: do not display guessed lyrics as certain.
- Web UI closed: daemon continues working.

## 7. Success criteria for v1

- Stable for a full desktop session without manual restart.
- Correct pause/resume/seek/track transitions.
- Discord reconnects after client restarts.
- Focus changes do not cause presence flicker.
- Lyrics line in web UI stays perceptually aligned after seek/resume.
- No raw sensitive window title is published in default configuration.
- All core resolver/timeline behavior is covered by deterministic tests.
