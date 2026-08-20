# Linux / External Integrations Rule

Apply when changing Niri, MPRIS, lyrics-provider, Discord RPC, or systemd integration.

## Niri

- Prefer JSON event stream.
- Parse unknown future fields defensively.
- Reconnect after compositor/session restart.
- Never parse human-readable output when JSON exists.

## MPRIS

- MVP may shell to `playerctl` through one adapter.
- Do not scatter shell commands across the codebase.
- Track player lifecycle and playback status explicitly.
- Do not poll position at animation frequency.

## Lyrics

- Fetch on track identity change, not playback tick.
- Cache provider results.
- Respect provider rate limits and client-identification requirements.
- Low-confidence matches never auto-publish as certain.

## Discord

- Use local RPC `SET_ACTIVITY` only.
- Suppress identical payloads and coalesce rapid updates.
- Reconnect if Discord restarts.
- Do not use user tokens or selfbot endpoints.

## Verification

For adapter changes, provide at least one of:

- deterministic fake-process/socket integration test
- recorded fixture test
- local smoke test with captured sanitized output

Do not claim support for an integration solely because TypeScript compiled.
