# AGENTS.md — presenced engineering contract

This file is the top-level contract for coding agents working on `presenced`.

## Mission

Build a reliable local-first Linux presence engine, not a Discord gimmick. The daemon must infer a stable activity from Niri + MPRIS, synchronize lyrics when available, expose transparent state to a web UI, and publish only a safe, rate-controlled Rich Presence.

## Non-negotiable constraints

- Use **TypeScript** for application code.
- The runtime must not require an LLM.
- Do not implement a Discord selfbot, user-token login, or automated Custom Status mutation.
- Do not scrape Discord internals when documented local RPC is sufficient.
- Never publish raw window titles by default.
- Never add a polling loop when an event stream exists, unless the event source cannot provide the required state.
- Do not query lyrics on every playback tick. Fetch once per track identity and cache it.
- Do not update Discord for every animation frame or every tiny position change.
- Do not redesign architecture and UI in the same unreviewed change.
- Do not add a dependency merely to save a few lines of straightforward code.

## Required workflow for agents

1. Read relevant docs and rules before touching code.
2. State the exact slice being changed and its acceptance criteria.
3. Inspect existing interfaces and tests.
4. Add/adjust tests for deterministic logic first.
5. Implement the smallest vertical slice.
6. Run typecheck, unit tests, integration tests relevant to the slice, then build.
7. Review the diff for privacy leaks, raw titles, tokens, noisy logging, and accidental API churn.
8. Update docs when contracts or behavior change.

## Source-of-truth hierarchy

1. Real runtime evidence/tests
2. This file and `.agents/rules/*`
3. Product/architecture docs
4. External documentation
5. Agent assumptions

If docs conflict with verified runtime behavior, record the mismatch and fix the docs or adapter. Do not silently code around it.

## Architecture boundaries

- `sources/*` produce normalized facts only.
- `core` resolves facts into an `ActivityCandidate` / `ResolvedPresence`.
- `lyrics` enriches media state; it does not decide global priority.
- `outputs/discord` translates resolved presence into Discord payloads.
- `state` persists settings/cache/history/overrides.
- `api` exposes typed local contracts to the web UI.
- `web` never executes shell commands directly.

## Definition of done

A change is not done because the UI looks plausible. It is done when:

- TypeScript passes strict typecheck.
- Tests cover the important decision logic.
- The app handles source disconnect/reconnect.
- The UI exposes degraded/error state instead of lying.
- No sensitive title/path/token is leaked.
- Runtime logs are useful and bounded.
- The current behavior is documented.
