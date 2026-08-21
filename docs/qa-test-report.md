# QA Test Report — presenced-popup v0.4.1

## Test Date: 2026-08-21

### Build Status
- Typecheck: ✅ 0 errors
- Tests: ✅ 115/115 passing
- Build: ✅ presenced-popup (14MB binary)
- Daemon: ✅ Running, Discord connected

### Bugs Found

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | HIGH | Window not pinned to top of screen (alwaysOnTop) | FIXED in tauri.conf.json |
| 2 | HIGH | No first-run tutorial/credit popup | TO FIX |
| 3 | HIGH | Dashboard scrolls — widgets should fit 100% on screen | TO FIX |
| 4 | HIGH | Widgets not separate floating boxes | TO FIX |
| 5 | MEDIUM | Clock too small, not premium/sci-fi | TO FIX |
| 6 | MEDIUM | Settings only on/off — no advanced per-widget config | TO FIX |
| 7 | MEDIUM | No edit mode for widget resize/position | TO FIX |
| 8 | LOW | Install script had syntax error | FIXED |
| 9 | LOW | Discord RPC was reconnecting (old Client ID) | FIXED |

### UI/UX Requirements (from user feedback)
1. **No scroll** — all widgets must be visible on screen without scrolling
2. **Separate floating widgets** — clock, music, RPC as independent glass boxes
3. **Premium clock** — sci-fi style, beautiful, with date
4. **Advanced settings** — per-widget config (not just on/off)
5. **Edit mode** — button to resize/expand widgets, not drag
6. **Cinematic glassmorphism** — glass effect, ambient glow, smooth animations
7. **Pinned to top** — window always on top, centered
8. **First-run tutorial** — show on first launch with credit
