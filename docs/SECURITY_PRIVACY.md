# Security & Privacy

## Threat model

This application reads local desktop/media context and exposes a local control API. That is enough to leak embarrassing or sensitive information if designed lazily.

## Required controls

### Discord

- Use documented local RPC for Rich Presence.
- No selfbot.
- No user token storage.
- No automated Discord Custom Status mutation.
- Use a dedicated Discord application/client ID for this project.

### Local web API

- Bind to loopback only by default (`127.0.0.1` / `::1`).
- Do not expose on LAN by default.
- Reject cross-origin write requests unless origin is explicitly trusted.
- If a future LAN mode exists, require authentication and explicit user enablement.

### Window metadata

Classify data:

```text
SAFE: app_id, normalized category, explicit user labels
SENSITIVE: raw window title, filesystem paths, document names, URLs
SECRET: tokens, cookies, authorization headers
```

Only SAFE or explicitly sanitized data may reach Discord.

### Logging

- Never log SECRET data.
- Avoid raw SENSITIVE values at info level.
- Diagnostics may reveal raw values only behind an explicit local debug view.
- Cap/rotate logs.

### Lyrics

- Cache only what is necessary for the local feature.
- Respect provider requirements and rate limits.
- Do not bundle copyrighted lyric corpora in the repository.
- Provider attribution/legal requirements should be documented before public distribution.

## Default sanitizer

- strip control characters
- collapse whitespace
- reject obviously secret-like tokens
- reject password-manager/private-browser app titles
- cap published length
- allow per-app generic labels such as `Coding` rather than document title

## Privacy mode

Privacy mode should immediately resolve to a generic/hidden activity and suppress all context-driven publishing until disabled. It must survive daemon restart if enabled.
