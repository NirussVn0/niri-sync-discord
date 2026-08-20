#!/usr/bin/env bash
set -euo pipefail

echo "======================================================"
echo " Installing presenced (Niri Sync Discord) to system..."
echo "======================================================"

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN_DIR="$HOME/.local/bin"
APP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/512x512/apps"
SYSTEMD_DIR="$HOME/.config/systemd/user"
DAEMON_INSTALL_DIR="$HOME/.local/share/presenced/daemon"

# 1. Create target directories
mkdir -p "$BIN_DIR" "$APP_DIR" "$ICON_DIR" "$SYSTEMD_DIR" "$DAEMON_INSTALL_DIR"

# 2. Build daemon, packages and embedded Tauri popup binary
echo "Building daemon and core packages..."
(cd "$REPO_DIR" && pnpm build)

echo "Building standalone desktop popup binary..."
(cd "$REPO_DIR" && pnpm --filter @presenced/popup tauri build)

# 3. Copy binaries to ~/.local/bin/
echo "Installing presenced-popup to $BIN_DIR/presenced-popup..."
cp -f "$REPO_DIR/apps/popup/src-tauri/target/release/presenced-popup" "$BIN_DIR/presenced-popup"
chmod +x "$BIN_DIR/presenced-popup"

# 4. Copy daemon bundle to ~/.local/share/presenced/daemon
echo "Installing daemon to $DAEMON_INSTALL_DIR..."
cp -rf "$REPO_DIR/apps/daemon/dist" "$DAEMON_INSTALL_DIR/"
cp -f "$REPO_DIR/apps/daemon/package.json" "$DAEMON_INSTALL_DIR/"

# 5. Create presenced CLI wrapper in ~/.local/bin/presenced
NODE_BIN="$(which node)"
cat <<EOF > "$BIN_DIR/presenced"
#!/usr/bin/env bash
exec "$NODE_BIN" "$DAEMON_INSTALL_DIR/dist/main.js" "\$@"
EOF
chmod +x "$BIN_DIR/presenced"

# 6. Install desktop entry and icon
echo "Installing desktop entry and application icon..."
cp -f "$REPO_DIR/systemd/io.niruss.niri-sync-discord.desktop" "$APP_DIR/"
if [[ -f "$REPO_DIR/apps/popup/src-tauri/icons/icon.png" ]]; then
  cp -f "$REPO_DIR/apps/popup/src-tauri/icons/icon.png" "$ICON_DIR/io.niruss.niri-sync-discord.png"
fi
if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$APP_DIR" || true
fi

# 7. Install systemd user service
echo "Configuring systemd user service..."
cat <<EOF > "$SYSTEMD_DIR/presenced.service"
[Unit]
Description=presenced - Linux Desktop Presence Engine for Niri + Discord
Documentation=https://github.com/NirussVn0/niri-sync-discord
PartOf=graphical-session.target
After=graphical-session.target

[Service]
Type=simple
ExecStart=$NODE_BIN $DAEMON_INSTALL_DIR/dist/main.js
Restart=on-failure
RestartSec=3s
TimeoutStopSec=5s
Environment=NODE_ENV=production
Environment=PORT=4242
Environment=HOST=127.0.0.1
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=graphical-session.target
EOF

systemctl --user daemon-reload

echo ""
echo "======================================================"
echo " ✅ Installation Complete!"
echo "======================================================"
echo ""
echo "To start the daemon now and enable on login:"
echo "  systemctl --user enable --now presenced.service"
echo ""
echo "To test the companion popup:"
echo "  presenced-popup"
echo ""
echo "Add this to your ~/.config/niri/config.kdl:"
echo ""
echo "  binds {"
echo "      Mod+P { spawn \"presenced-popup\"; }"
echo "  }"
echo ""
echo "  window-rule {"
echo "      match app-id=\"^io\\\\.niruss\\\\.niri-sync-discord$\""
echo "      open-floating true"
echo "      default-floating-position top-right"
echo "  }"
echo "======================================================"
