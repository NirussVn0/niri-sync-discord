---
name: presence-engine
description: Designs, implements, or reviews presenced activity sources, candidate resolution, priorities, debounce, privacy sanitization, and Discord payload mapping. Use for presence logic or desktop/media activity behavior.
---

# Presence Engine Skill

## Read first

- `AGENTS.md`
- `docs/PRODUCT_SPEC.md`
- `docs/ARCHITECTURE.md`
- `.agents/rules/10-typescript.md`
- `.agents/rules/30-integrations.md`

## Procedure

1. Identify whether the change is a source fact, resolver rule, scheduler behavior, or output mapping.
2. Keep source-specific behavior out of the resolver.
3. Express the desired behavior as table-driven tests first.
4. Include competing-candidate tests, not only happy-path single-source tests.
5. Verify privacy classification before data becomes publishable.
6. Verify duplicate suppression/debounce around any new output behavior.
7. Run strict typecheck and relevant tests.

## Mandatory edge cases

- media playing vs coding focus
- media paused
- rapid focus switching
- source disconnect/reconnect
- manual override expiry
- privacy mode
- identical resolved payload
- missing optional metadata
