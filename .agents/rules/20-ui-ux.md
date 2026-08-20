# UI / UX Rule

Apply to `apps/web/**` and UI-facing work.

Read `docs/UI_UX.md` before visual changes.

## Product direction

- Design around the live “Now” experience.
- Avoid generic admin-dashboard composition.
- shadcn/ui is a primitive source, not the design itself.
- Show system truth: resolver reason, outgoing Discord preview, and integration health.
- Make failure/loading/empty states first-class.

## Interaction quality

- Keyboard accessible controls.
- Visible focus states.
- Respect reduced motion.
- Long titles and CJK/Vietnamese text must not break layout.
- No important meaning by color alone.
- Avoid noisy continuous animation.

## Data ownership

- Server state comes from typed daemon API/WebSocket contracts.
- Do not duplicate resolver or privacy logic in React.
- Optimistic updates are allowed only when rollback/error state is clear.

## Review requirement

Before calling a UI task complete, inspect it at desktop and narrow viewport, verify empty/error/loading states, and run the supplied `ui-review` skill or `ui-reviewer` agent for non-trivial screens.
