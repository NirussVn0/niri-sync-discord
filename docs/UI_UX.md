# Web UI / UX Spec

## 1. UX goal

The UI should feel like a live desktop presence console, not a generic SaaS admin template.

The user should answer these questions in under five seconds:

1. What does the daemon think I am doing?
2. Why did this activity win?
3. What exactly is Discord showing?
4. Are Niri, media, lyrics, and Discord healthy?
5. How do I override or hide something immediately?

## 2. Information architecture

Keep v1 to five primary areas:

### Now

Main live screen.

- current resolved presence card
- source badge and winning-rule explanation
- media art/progress when playing
- synchronized lyric viewport
- exact Discord preview
- quick actions: pause presence, privacy mode, manual override
- compact integration health row

### Rules

- priority ordering
- per-app mappings by `app_id`
- include/exclude lists
- title sanitizer rules
- media-vs-game preference
- lyric-on-Discord mode

Avoid exposing raw regex complexity to casual use. Provide an advanced editor below the simple controls.

### Integrations

Cards for:

- Niri
- MPRIS/playerctl
- Discord RPC
- LRCLIB

Each card shows state, last successful event, actionable error, and retry/reconnect action when sensible.

### History

Optional bounded local history.

- recent resolved activities, not raw desktop surveillance
- clear history action
- history disabled by default is acceptable

### Settings

- startup/systemd
- update/debounce intervals
- privacy defaults
- lyrics provider/cache
- local API port/bind address
- diagnostics/log level

## 3. Visual direction

- Dark-first, desktop-native feel.
- Large “Now Playing / Now Doing” surface should dominate, not charts.
- Album art may influence a subtle accent/ambient background, but text contrast must remain stable.
- Use spacing and typography hierarchy before adding borders everywhere.
- Avoid excessive glassmorphism, neon gradients, animated blobs, and dashboard-card spam.
- Motion should communicate state transitions: track change, rule winner, connection health, lyric progression.
- Respect `prefers-reduced-motion`.

shadcn/ui is a source of accessible primitives. Do not ship the stock dashboard block with renamed labels and call it design.

## 4. Responsive behavior

Desktop is primary, but the local web UI should remain usable at tablet/mobile widths.

- desktop: two-column Now view (presence/media + Discord/health)
- narrow: single stream with current activity first
- lyrics remain readable and scrollable without horizontal overflow
- rule editing remains touch-friendly

## 5. State transparency

Never show a green “Connected” because the page loaded.

Expose real integration states:

```text
connected
reconnecting
unsupported
permission-required
disconnected
provider-rate-limited
```

For the active presence, show a compact explanation such as:

```text
Music won: Spotify is playing (priority 80) > Coding (priority 60)
```

This explanation comes from the resolver, not reimplemented UI logic.

## 6. Privacy UX

- Raw window title is hidden by default.
- A preview shows sanitized outgoing text before enabling a new rule.
- “Privacy mode” is a first-class quick action.
- Sensitive app mappings can be `hide`, `genericize`, or `allow sanitized`.
- Diagnostics must visibly distinguish raw/private values from safe/published values.

## 7. Required screens before visual polish

AGY should first produce functional wireframe-quality versions of:

1. Now
2. Rules
3. Integrations
4. Settings

Then run a UI review pass and polish. Do not spend the first implementation slice perfecting gradients while reconnect logic is imaginary.

## 8. UI acceptance checks

- keyboard navigation for interactive controls
- visible focus state
- no critical meaning carried by color alone
- no layout jump on lyric line change
- no content overflow with long song titles or CJK text
- loading/error/empty states for every remote/local integration panel
- Playwright smoke flow for changing an override and seeing the live preview update
