# TypeScript Engineering Rule

Apply to TypeScript/TSX changes.

## Compiler and types

- `strict: true`.
- Prefer `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- Avoid `any`; use `unknown` + validation/narrowing at boundaries.
- Use discriminated unions for source events and domain state.
- Validate external JSON with Zod before it enters domain logic.
- Do not export huge ambient types from implementation modules.

## Architecture

- Keep I/O behind adapters/interfaces.
- Pure functions for resolver, sanitization, LRC parsing, confidence scoring, and payload mapping where possible.
- Dependency direction points inward toward domain contracts.
- UI consumes API/domain contracts; it does not import daemon implementation.

## Error handling

- Model expected failure states explicitly.
- Do not swallow errors.
- Retry only retryable integration failures with bounded/exponential backoff.
- Abort stale async work on track/source changes when practical.

## Tests

Use Vitest for deterministic domain logic and integration harnesses. Every bug fix adds a regression test when the behavior can be reproduced deterministically.

## Style

Prefer small named functions, explicit domain names, and boring control flow. Do not turn a presence daemon into a functional-programming dissertation.
