# AGY Start Here

## Purpose

This file tells Antigravity (`agy`) how to begin working on the repository without hallucinating half the platform in one pass.

## First session

Run AGY from repository root in planning mode and ask it to read:

- `AGENTS.md`
- `.agents/rules/*`
- `docs/PRODUCT_SPEC.md`
- `docs/ARCHITECTURE.md`
- `docs/LYRICS_SYNC.md`
- `docs/UI_UX.md`
- `docs/SECURITY_PRIVACY.md`

Then have it report:

1. confirmed requirements
2. assumptions
3. environment dependencies on the current Linux machine
4. smallest end-to-end slice
5. test strategy

Do not let it start by generating the whole dashboard and all integrations at once.

## Recommended vertical-slice order

### Slice A — observable core

Niri event -> normalized fact -> pure resolver -> local `/api/state` -> minimal web Now screen.

No Discord and no lyrics yet. This validates the state architecture.

### Slice B — media

MPRIS/playerctl -> media fact -> priority resolver -> live web media card.

### Slice C — Discord

Resolved presence -> RPC adapter -> exact outgoing preview -> reconnect behavior.

### Slice D — synchronized lyrics

Track identity -> LRCLIB/cache -> LRC parser -> playback clock -> web lyric synchronization -> throttled Discord lyric line.

### Slice E — rule editor + privacy

Persistent rules, sanitizer preview, manual override, privacy mode.

### Slice F — hardening

systemd user service, restart/reconnect tests, diagnostics, packaging docs.

## AGY working style

- Use workspace skills when their description matches the task.
- Delegate UI review and integration review to the supplied subagents when useful.
- For each slice: plan -> tests -> implementation -> verification -> diff review.
- Keep changes reviewable. Prefer one coherent slice over broad file churn.
- Before finishing a task, show evidence: commands run and their results.

## Master build instruction

Use this after AGY has read and summarized the specs:

> Implement only the next incomplete vertical slice from `docs/AGY_START_HERE.md`. Follow `AGENTS.md` and all matching `.agents/rules`/skills. Before editing, state acceptance criteria and tests. Keep side effects behind adapters and domain logic pure. After implementation, run strict typecheck, relevant tests, build, and a privacy/security diff review. Do not implement selfbot/custom-status automation. Do not broaden scope unless an actual requirement blocks the slice.
