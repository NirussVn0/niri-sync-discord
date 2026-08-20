# presenced (Niri Sync Discord)

A local-first Linux presence daemon + web control center written in TypeScript.

`presenced` observes local desktop and media context from **Niri + MPRIS**, resolves it into one stable activity through a deterministic presence engine, enriches music with synchronized lyrics from **LRCLIB**, exposes transparent state and rules via a dark-first local web dashboard, and publishes safe, rate-controlled activity to **Discord Rich Presence**.

---

## Key Features

- **Event-Driven Architecture**: Consumes Niri's event stream (`niri msg --json event-stream`) and MPRIS playback events via `playerctl` without CPU-heavy polling loops.
- **Deterministic Resolution**: Evaluates candidate activities based on user-configurable priority weights (`Manual (100) > Privacy (95) > Gaming (90) > Music (80) > Recording (75) > Coding (60) > Video (50) > Browser (30) > Terminal (25) > Generic (10) > Idle (0)`).
- **Synchronized Lyrics Engine**: Integrates with LRCLIB, parses LRC timestamp formats (`[mm:ss.xx]`, `[mm:ss.xxx]`, multi-tag lines), maintains monotonic playback clock anchoring, and provides $O(\log n)$ binary-search active lyric line matching.
- **Discord Local RPC**: Direct IPC socket connection (`$XDG_RUNTIME_DIR/discord-ipc-*`) using `SET_ACTIVITY` with duplicate suppression, rate coalescing, and auto-reconnect backoff.
- **Web Control Center**: Vite + React "Now" screen featuring live presence cards with "Why this won" resolver reasoning, Discord RPC output preview, monotonic playback progress bar, scrolling synchronized lyrics view, and per-app rules editor.
- **Privacy by Default**: Automatic secret/token redaction, length capping (128 chars), sensitive password manager masking, and instant Privacy Mode toggle.
- **Local Persistence**: Built-in SQLite persistence (`~/.config/presenced/presenced.db`) for priority weights, per-app mappings, manual overrides, and privacy state.

---

## Quick Start

### Prerequisites
- Linux OS with Niri compositor (`niri`)
- Node.js LTS (v20+ or v22+)
- `playerctl` for MPRIS media observation
- `pnpm` (v9+)

### Installation & Build

```bash
# Clone repository
git clone https://github.com/NirussVn0/niri-sync-discord.git
cd niri-sync-discord

# Install dependencies and build all packages
pnpm install
pnpm build
```

### Running the Daemon

```bash
# Start presenced daemon (listens on http://127.0.0.1:4242)
pnpm --filter @presenced/daemon start

# Or run the CLI diagnostic tool
node apps/daemon/dist/cli.js --diagnostics
```

### Running the Web Dashboard (Development)

```bash
pnpm --filter @presenced/web dev
```

Open `http://localhost:5173` (or `http://127.0.0.1:4242` when running the bundled production daemon).

---

## CLI Options & Environment Variables

### Command Line Options

```text
presenced [OPTIONS]

OPTIONS:
  -h, --help                  Print help information
  -v, --version               Print version information
  -d, --diagnostics           Run system diagnostic checks and print report
  -p, --port <PORT>           HTTP/WS API port (default: 4242 or $PORT)
      --host <HOST>           HTTP/WS host to bind (default: 127.0.0.1 or $HOST)
      --db-path <PATH>        Custom path to SQLite database
      --discord-client-id <ID> Custom Discord Application Client ID
```

### Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Local HTTP/WebSocket server port | `4242` |
| `HOST` | Loopback address to bind | `127.0.0.1` |
| `DB_PATH` | SQLite database file path | `~/.config/presenced/presenced.db` |
| `DISCORD_CLIENT_ID` | Discord Application Client ID | `1214041725514194954` |

---

## Systemd User Service Setup

To run `presenced` automatically with your desktop session:

1. Copy the systemd service file:
   ```bash
   mkdir -p ~/.config/systemd/user
   cp systemd/presenced.service ~/.config/systemd/user/
   ```

2. Reload systemd user daemon and enable the service:
   ```bash
   systemctl --user daemon-reload
   systemctl --user enable --now presenced.service
   ```

3. Check logs and status:
   ```bash
   systemctl --user status presenced.service
   journalctl --user -u presenced.service -f
   ```

---

## Monorepo Architecture

```text
presenced/
├── apps/
│   ├── daemon/          # Backend engine, sources (Niri, MPRIS), Discord RPC, LRCLIB, SQLite, Hono API
│   └── web/             # React + Tailwind + Vite Web Control Center
├── packages/
│   ├── contracts/       # Shared TypeScript types and Zod schemas (facts, presence, lyrics, rules)
│   └── core/            # Deterministic presence resolver, categories, sanitizer, and LRC parser
├── systemd/             # Systemd user service unit configuration
└── docs/                # Architectural, privacy, and UX specifications
```

---

## Verification & Testing

```bash
# Run unit & integration test suite (Vitest)
pnpm test

# Run strict TypeScript typecheck across monorepo
pnpm -r typecheck

# Full production build
pnpm -r build
```

---

## License

MIT © [NirussVn0](https://github.com/NirussVn0)
