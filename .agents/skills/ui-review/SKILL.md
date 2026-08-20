---
name: ui-review
description: Reviews presenced web screens for product-specific hierarchy, live-state clarity, accessibility, responsive behavior, privacy UX, and avoidance of generic shadcn dashboard styling. Use after non-trivial UI work.
---

# UI Review Skill

Read `docs/UI_UX.md` and `.agents/rules/20-ui-ux.md`.

Review the rendered UI, not only JSX.

## Checks

1. Can a user identify current activity, winning reason, outgoing Discord text, and health quickly?
2. Is the primary live state visually dominant?
3. Are loading/error/disconnected states real and understandable?
4. Does long text/CJK/Vietnamese content remain intact?
5. Is raw/sensitive metadata clearly separated from publish-safe data?
6. Are keyboard/focus/reduced-motion requirements respected?
7. Does the screen look intentionally designed for this product rather than a stock admin block?
8. Does it work at desktop and narrow viewport?

Return concrete issues by severity and verify fixes before approving.
