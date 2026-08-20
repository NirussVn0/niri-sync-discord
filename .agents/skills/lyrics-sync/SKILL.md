---
name: lyrics-sync
description: Implements or reviews synchronized lyrics lookup, LRCLIB matching/cache, LRC parsing, playback-clock anchoring, seek/pause/resume handling, web lyric timing, and throttled Discord lyric updates.
---

# Lyrics Sync Skill

## Read first

- `docs/LYRICS_SYNC.md`
- `docs/ARCHITECTURE.md`
- `.agents/rules/10-typescript.md`
- `.agents/rules/30-integrations.md`

## Procedure

1. Separate provider lookup, parser, playback clock, active-line resolver, and Discord scheduler.
2. Test parser/timeline logic without network or MPRIS.
3. Use monotonic anchor math between authoritative position updates.
4. Re-anchor on seek/pause/resume/track change.
5. Cache by stable normalized track identity.
6. Treat uncertain matches as uncertain; never silently force them.
7. Keep web synchronization high fidelity while coalescing Discord line updates.

## Review checklist

- no high-frequency provider or position polling
- no wall-clock-only elapsed-time calculation
- Unicode preserved
- malformed LRC does not crash the daemon
- 429 / retry-after handled
- stale request cannot overwrite a newer track
- short lines do not cause Discord update spam
