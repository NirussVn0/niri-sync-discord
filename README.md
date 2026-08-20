# presenced

A local-first Linux presence daemon + web control center written in TypeScript.

`presenced` observes local desktop/media context, resolves it into one stable activity, optionally synchronizes lyrics, and publishes only the selected activity to Discord Rich Presence. The web UI is the control plane; the daemon is the runtime.

## Product principles

1. **Local first**: desktop context never needs to leave the machine except explicit provider/RPC requests.
2. **Event driven**: consume Niri/MPRIS events; do not poll the desktop every second.
3. **Deterministic core**: activity resolution is rules + state machine, not an LLM.
4. **Preserve user state**: never overwrite Discord Custom Status. Persist our own settings, manual overrides, caches, and last published activity.
5. **Lyrics are progressive enhancement**: presence still works when lyrics are missing or a provider is offline.
6. **Web UI is a live control surface**: it must show what the daemon sees, why an activity won, and what Discord is receiving.
7. **Privacy by default**: raw window titles are private unless a rule explicitly exposes sanitized text.

## Chosen stack

- TypeScript everywhere
- Node.js LTS runtime for the daemon
- pnpm workspace
- Hono local HTTP/WebSocket API
- React + Vite for the web control center
- shadcn/ui as component source, not as a generic dashboard template
- TanStack Query for server state
- Zod for runtime contracts
- Vitest + Playwright
- SQLite for persistent state/cache
- Niri JSON event stream for desktop context
- MPRIS through `playerctl` for MVP; adapter boundary allows native D-Bus later
- LRCLIB as primary synced-lyrics provider
- Discord local RPC `SET_ACTIVITY`; no selfbot/user-token automation

## Target repository shape

```text
presenced/
├─ apps/
│  ├─ daemon/
│  │  └─ src/
│  │     ├─ sources/
│  │     │  ├─ niri/
│  │     │  └─ mpris/
│  │     ├─ outputs/discord/
│  │     ├─ lyrics/
│  │     ├─ state/
│  │     ├─ api/
│  │     └─ main.ts
│  └─ web/
│     └─ src/
├─ packages/
│  ├─ contracts/
│  └─ core/
├─ docs/
├─ .agents/
│  ├─ rules/
│  ├─ skills/
│  └─ agents/
├─ AGENTS.md
└─ pnpm-workspace.yaml
```

Do not split more packages until a boundary has at least two real consumers.

## Read first

1. `AGENTS.md`
2. `docs/PRODUCT_SPEC.md`
3. `docs/ARCHITECTURE.md`
4. `docs/LYRICS_SYNC.md`
5. `docs/UI_UX.md`
6. `docs/SECURITY_PRIVACY.md`
7. `docs/AGY_START_HERE.md`
