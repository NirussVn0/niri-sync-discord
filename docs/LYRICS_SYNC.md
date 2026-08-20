# Lyrics Synchronization Design

## 1. Requirement

When synchronized lyrics exist:

- web UI scrolls/highlights the active lyric line in real time
- Discord Rich Presence may show the current lyric line, but at a deliberately lower update cadence
- seek, pause, resume, track switch, and player switch resynchronize correctly

When only plain lyrics exist, the UI may show static lyrics but must not pretend they are synchronized.

## 2. Provider strategy

Primary provider: LRCLIB.

Track identity inputs:

- title
- artist
- album when available
- duration when available

Lookup strategy:

1. Build normalized `TrackIdentity`.
2. Check local cache.
3. Try exact provider lookup.
4. Fall back to provider search only if exact lookup fails.
5. Score candidates by normalized title/artist and duration proximity.
6. If confidence is below threshold, mark lyrics as uncertain and do not auto-publish them to Discord.
7. Cache positive and negative results with separate TTLs.

Provider requests must identify this application with the provider-required client header.

## 3. LRC parsing

Parse synchronized lines into:

```ts
type LyricLine = {
  atMs: number
  text: string
}
```

Requirements:

- support common `[mm:ss.xx]` / `[mm:ss.xxx]` timestamps
- allow multiple timestamps referring to one text line
- normalize CRLF/LF
- preserve Unicode
- sort lines by timestamp
- safely handle malformed lines
- never throw away the entire lyric because one line is malformed

Use binary search to resolve the active line at a position: `O(log n)`.

## 4. Playback clock

Do not ask MPRIS for position every animation frame.

Maintain an anchor:

```text
positionAnchorMs
anchorMonotonicMs
playbackStatus
```

While playing:

```text
estimatedPosition = positionAnchorMs + (monotonicNow - anchorMonotonicMs)
```

While paused/stopped:

```text
estimatedPosition = positionAnchorMs
```

Re-anchor when:

- playback starts/resumes
- a seek is detected
- track changes
- authoritative position metadata arrives
- drift exceeds a configured threshold

Use a monotonic clock for elapsed time, not wall-clock `Date.now()` alone.

## 5. Web synchronization

The daemon sends anchors and lyric timeline to the browser. The browser may animate/highlight locally between anchor events.

This avoids a WebSocket message every 100 ms.

UI behavior:

- active line centered or near center
- previous/next lines visible with reduced emphasis
- smooth scroll that respects reduced-motion preference
- click line to seek only if the active player adapter supports a safe seek action
- show clear states: loading / synced / plain-only / instrumental / not-found / provider-error / uncertain match

## 6. Discord lyric mode

Discord is not the lyric renderer. It is a compact presence surface.

Recommended payload concept:

```text
Details: track title — artist
State:   current lyric line
Time:    track start/end timestamps when reliable
```

Rules:

- trim/sanitize text to Discord field constraints
- collapse whitespace
- never publish empty/metadata-only LRC lines
- coalesce rapid line changes
- set a conservative minimum update interval in configuration
- publish immediately on track change; lyric updates use the scheduler
- if multiple lyric lines change inside the interval, publish only the current one at the next allowed tick
- if lyrics are uncertain, omit the lyric from Discord

The web remains fully synchronized even when Discord intentionally skips short lines.

## 7. Cache

Cache fields:

```text
provider
provider_id
track_key
match_confidence
instrumental
plain_lyrics
synced_lyrics
fetched_at
expires_at
```

Do not refetch a successful track on every daemon restart.

## 8. Test cases

Must test:

- fractional timestamp parsing
- duplicate timestamps
- malformed lines
- Unicode/Japanese/Vietnamese text
- pause/resume
- forward/backward seek
- track changes with same title but different duration
- player switch
- short consecutive lyric lines under Discord throttle
- stale cache and provider 429/error
- instrumental and no-lyrics tracks
