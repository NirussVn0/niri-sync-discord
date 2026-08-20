# Architecture

## 1. System model

```text
Niri event stream ─────┐
                      │
MPRIS/playerctl ───────┼──> normalized facts ──> candidate builder ──> resolver
                      │                                      │
manual override ──────┘                                      │
                                                             v
LRCLIB/cache <── media identity <── media fact         ResolvedPresence
                                                             │
                                            ┌────────────────┼───────────────┐
                                            v                v               v
                                      Discord RPC      local WebSocket    persistence
```

The **resolver is pure**. I/O belongs in adapters.

## 2. Runtime processes

### Daemon

Node.js TypeScript process managed by a user systemd service.

Responsibilities:

- connect/reconnect Niri event stream
- subscribe to media metadata/playback
- maintain media playback clock
- resolve activity
- fetch/cache lyrics on track identity changes
- publish Discord Rich Presence
- persist durable state
- serve local HTTP/WebSocket API

### Web control center

React/Vite application served locally or as static assets from the daemon.

Responsibilities:

- display current state
- edit settings/rules
- preview Discord output
- show integration health
- show synchronized lyrics
- provide diagnostics without exposing raw sensitive fields unnecessarily

## 3. Core contracts

Use discriminated unions rather than unstructured objects.

Conceptual types:

```ts
type SourceHealth = 'connected' | 'degraded' | 'disconnected'

type DesktopFact = {
  kind: 'desktop'
  appId: string
  workspaceId?: number
  rawTitle?: string // private; never publish directly
  observedAt: number
}

type MediaFact = {
  kind: 'media'
  player: string
  playback: 'playing' | 'paused' | 'stopped'
  title?: string
  artist?: string
  album?: string
  artUrl?: string
  durationMs?: number
  positionAnchorMs?: number
  anchorMonotonicMs?: number
  observedAt: number
}

type ActivityCandidate = {
  id: string
  category: 'manual' | 'gaming' | 'music' | 'recording' | 'coding' | 'video' | 'browser' | 'terminal' | 'generic' | 'idle'
  priority: number
  details?: string
  state?: string
  startAt?: number
  endAt?: number
  source: string
  privacy: 'safe' | 'sanitized' | 'private'
}

type ResolvedPresence = {
  revision: number
  candidateId: string
  category: ActivityCandidate['category']
  details?: string
  state?: string
  timestamps?: { start?: number; end?: number }
  assets?: { largeImage?: string; largeText?: string }
  reason: string
}
```

Concrete contracts belong in `packages/contracts` and are validated with Zod at process/network boundaries.

## 4. Niri adapter

MVP implementation: spawn `niri msg --json event-stream` and parse newline-delimited JSON.

Why:

- supported JSON output
- complete initial state followed by updates
- avoids a custom socket protocol implementation in v1

Adapter rules:

- handle unknown/new JSON fields gracefully
- restart with backoff when Niri/session restarts
- never make human-readable `niri msg` output a parser dependency
- only emit normalized desktop facts

A future direct `$NIRI_SOCKET` adapter may replace the process wrapper without changing core contracts.

## 5. MPRIS adapter

MVP: `playerctl` because it already normalizes a broad range of MPRIS-compatible players.

Design behind a `MediaSource` interface so native `dbus-next` can replace it later.

The adapter should emit events on:

- player appearance/disappearance
- playback status
- track metadata change
- seek/position discontinuity

Do not run `playerctl position` at high frequency. See `LYRICS_SYNC.md`.

## 6. Resolver

The resolver is a pure function over:

- current normalized facts
- user rules/priorities
- privacy policy
- current manual override

It returns a candidate plus a reason string suitable for the UI.

The scheduler surrounding the resolver handles:

- debounce
- coalescing
- duplicate suppression
- minimum output update intervals

Keep these separate so the resolver remains trivial to test.

## 7. Discord output adapter

Use local Discord RPC `SET_ACTIVITY`.

Responsibilities:

- discover IPC socket
- handshake/reconnect
- translate `ResolvedPresence` into allowed activity fields
- suppress identical payloads
- clear only this app's Rich Presence on shutdown when appropriate

Do not:

- use user tokens
- automate Custom Status
- couple the resolver to Discord-specific payload structure

## 8. Local API

Hono HTTP + WebSocket.

Suggested routes:

```text
GET  /api/state
GET  /api/health
GET  /api/settings
PUT  /api/settings
GET  /api/rules
PUT  /api/rules
POST /api/override
DELETE /api/override
POST /api/presence/pause
POST /api/presence/resume
WS   /api/events
```

The browser receives domain events such as:

```text
state.snapshot
source.health.changed
media.changed
playback.position.anchor
lyrics.changed
lyrics.line.changed
presence.resolved
presence.published
```

## 9. Persistence

SQLite tables may include:

- `settings`
- `rules`
- `manual_override`
- `last_presence`
- `lyrics_cache`
- `activity_history` (optional + bounded)

Migrations are versioned. No silent schema mutation at runtime.

## 10. Failure policy

Each adapter owns reconnect/backoff and reports health. Core must not crash because one integration fails.

Use structured logs with fields such as integration, event, reason, retry count. Never log tokens or unsanitized titles at info level.
