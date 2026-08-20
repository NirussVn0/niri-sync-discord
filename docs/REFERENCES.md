# Reference Repositories & Documentation

These are references to study, not code to copy blindly.

## Core integrations

### Niri IPC

- Docs: https://niri-wm.github.io/niri/IPC.html
- Use for: JSON event stream, focused window, workspaces, forward-compatible event parsing.
- Design takeaway: consume complete initial state + updates; do not poll Niri.

### playerctl

- Repo: https://github.com/altdesktop/playerctl
- Use for: broad MPRIS compatibility across Spotify, browsers, VLC, mpv, etc.
- Design takeaway: use it as the MVP adapter boundary, not as domain logic.

### dbus-next

- Repo: https://github.com/dbusjs/node-dbus-next
- Use for: future native TypeScript/Node D-Bus implementation if `playerctl` becomes limiting.
- Do not start here unless an MVP requirement actually needs lower-level D-Bus.

## Lyrics

### LRCLIB

- API docs: https://lrclib.net/docs
- Repo: https://github.com/tranxuanthang/lrclib
- Use for: plain + synchronized lyrics; open API without application key.
- Important: identify the client as required by the API and respect `429` / `Retry-After`.

### SyncSong

- Repo: https://github.com/joshooaj/SyncSong
- Use for: synchronized-lyrics UX ideas, LRC editing concepts, waveform/scroll interaction references.
- Do not copy its product scope into v1; `presenced` is a presence tool, not a lyrics editor.

## Discord

### Official RPC docs

- https://docs.discord.com/developers/topics/rpc
- Use for: IPC path discovery, handshake, `SET_ACTIVITY`, allowed activity types.
- This is the protocol source of truth.

### Official Rich Presence docs

- https://docs.discord.com/developers/platform/rich-presence
- Use for: field semantics and current platform direction.

### @xhayper/discord-rpc

- Repo mirror/fork reference: https://github.com/Khaomi/discord-rpc
- Use for: TypeScript implementation ideas and Linux IPC handling.
- Treat it as a replaceable adapter dependency; protocol behavior should remain covered by tests.

## Web/API

### Hono Node server

- Repo: https://github.com/honojs/node-server
- Docs: https://hono.dev/docs/getting-started/nodejs
- Use for: small local typed HTTP/WebSocket control plane.

### shadcn/ui

- Repo: https://github.com/shadcn-ui/ui
- Docs: https://ui.shadcn.com
- Use for: accessible component source and primitives.
- Rule: do not ship a stock generated dashboard without product-specific composition.

### TanStack Query / Router

- Query: https://tanstack.com/query/latest/docs/framework/react
- Router: https://tanstack.com/router/latest/docs/framework/react
- Use for: typed client data synchronization and routing if routing complexity warrants it.

## Antigravity / AGY

### Skills

- https://antigravity.google/docs/skills
- Workspace skill path: `.agents/skills/<skill>/SKILL.md`

### Rules / workflows

- https://antigravity.google/docs/rules-workflows
- Workspace rules: `.agents/rules/`
- Keep each rule focused and below the documented size limit.

### Custom agents / subagents

- https://antigravity.google/docs/subagents
- Workspace agents: `.agents/agents/...`

### Optional multi-agent orchestration references

- https://github.com/markfulton/claude-antigravity-agents
- https://github.com/swjturay/codex-agy-delegator

Use these only if a second orchestrator is introduced. AGY alone is sufficient for the initial project.
