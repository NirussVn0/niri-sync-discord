# Installation & Operating Guide

`presenced` is a local-first Linux desktop companion engineered specifically for Niri Wayland workflows, MPRIS media players, synchronized lyrics, Pomodoro sessions, personal countdowns, and Discord Rich Presence.

---

## 1. Prerequisites

### Arch Linux / CachyOS
```bash
sudo pacman -S nodejs npm pnpm base-devel webkit2gtk-4.1 gtk-layer-shell libappindicator-gtk3
```

### Fedora
```bash
sudo dnf install nodejs pnpm webkit2gtk4.1-devel gtk-layer-shell-devel libappindicator-gtk3-devel
```

### Ubuntu / Debian (24.04+)
```bash
sudo apt install nodejs npm libwebkit2gtk-4.1-dev libgtk-layer-shell-dev libayatana-appindicator3-dev
```

---

## 2. Build from Source

```bash
# Clone the repository
git clone https://github.com/NirussVn0/niri-sync-discord.git
cd niri-sync-discord

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

## 5. Niri Wayland Keybinding & Window Rules

Add a dedicated hotkey to toggle or spawn the companion popup in your `~/.config/niri/config.kdl`:

```kdl
// Keybinding to toggle the companion popup
binds {
    Mod+P { spawn "presenced-popup"; }
}

// Window rule to open the popup as a floating companion
window-rule {
    match app-id="^io\\.niruss\\.niri-sync-discord$"
    match app-id="^niri-sync-discord$"
    open-floating true
    default-floating-position top-right
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
