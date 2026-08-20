# Project Core Rule

Always apply this rule while working in this repository.

Read `AGENTS.md` and the relevant `docs/*` before making architectural decisions.

## Behavioral constraints

- Build `presenced` as a local-first event-driven system.
- Runtime behavior must be deterministic. No LLM dependency in presence selection.
- Preserve boundaries: sources -> normalized facts -> pure resolver -> outputs.
- Never implement Discord selfbot/user-token automation or automatic Custom Status editing.
- Never publish raw window titles by default.
- Prefer graceful degradation over process crashes.
- Use evidence from tests/runtime over assumptions.

## Scope discipline

For each task, identify one vertical slice and its acceptance criteria. Do not simultaneously refactor unrelated modules, replace the UI stack, and change external integrations.

If external behavior is uncertain, consult current official docs or create a small isolated probe before committing architecture to that behavior.
