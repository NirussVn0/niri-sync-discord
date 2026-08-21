# Installation & Operating Guide

`presenced` is a local-first Linux desktop companion engineered specifically for Niri Wayland workflows, MPRIS media players, synchronized lyrics, Pomodoro sessions, personal countdowns, and Discord Rich Presence.

---

## 1. Prerequisites

### Arch Linux / CachyOS
```bash
sudo pacman -S nodejs npm pnpm base-devel webkit2gtk-4.1 libappindicator-gtk3
```

### Fedora
```bash
sudo dnf install nodejs pnpm webkit2gtk4.1-devel libappindicator-gtk3-devel
```

### Ubuntu / Debian (24.04+)
```bash
sudo apt install nodejs npm libwebkit2gtk-4.1-dev libayatana-appindicator3-dev
```

---

## 2. Build from Source

```bash
# Clone the repository
git clone https://github.com/NirussVn0/presenced-popup-niri.git
cd presenced-popup-niri

# Install all monorepo dependencies
pnpm install

# Run typechecks and build all packages
pnpm build
pnpm test
```

---

## 3. Running presenced

### Development Mode
In one terminal, start the daemon brain:
```bash
pnpm daemon:dev
```

In a second terminal, launch the desktop companion popup:
```bash
pnpm popup:dev
```

---

## 4. systemd User Service Setup

To run the background daemon automatically with your graphical session:

```bash
# Copy systemd unit
mkdir -p ~/.config/systemd/user
cp systemd/presenced.service ~/.config/systemd/user/

# Reload systemd user daemon and enable
systemctl --user daemon-reload
systemctl --user enable --now presenced.service

# Inspect live status & logs
systemctl --user status presenced.service
journalctl --user -u presenced.service -f
```

---

## 5. Niri Wayland Popup Integration

The installer writes and validates `~/.config/niri/config.d/85-presenced-popup-niri.kdl` and adds its include to `config.kdl`. This is required because Niri ignores Tauri's client-side `center` request for tiled windows. The rule forces the popup into the floating layer at 720×420; after mapping, Rust resolves the Niri window ID from its PID and invokes `center-window --id` for deterministic placement.

Add only the optional hotkey to your binds file:

```kdl
// Keybinding to toggle the companion popup
binds {
    Mod+P { spawn "presenced-popup-niri"; }
}
```

The installed rule is equivalent to:

```kdl
window-rule {
    match app-id="^presenced-popup-niri$"
    open-floating true
    open-focused true
    default-column-width { fixed 720; }
    default-window-height { fixed 420; }
}
```

---

## 6. Architecture Overview

```
  ┌─────────────────────────────────────────────────────────┐
  │                 presenced Daemon (Brain)                │
  │  Sources: Niri IPC · MPRIS · LRCLIB · Linux /proc       │
  │  Engines: Presence Resolver · Pomodoro · Countdowns     │
  └───────────────┬─────────────────────────┬───────────────┘
                  │ WebSocket/HTTP (4242)   │ Local IPC
                  ▼                         ▼
  ┌───────────────────────────────┐ ┌───────────────────────┐
  │  Desktop Companion (Popup)    │ │   Discord Rich        │
  │  Tauri v2 · React 19 · WebKit │ │   Presence (Output)   │
  └───────────────────────────────┘ └───────────────────────┘
```
