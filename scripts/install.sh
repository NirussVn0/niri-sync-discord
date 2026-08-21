#!/usr/bin/env bash
set -euo pipefail

echo "======================================================"
echo " Installing presenced-popup-niri..."
echo "======================================================"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BIN_DIR="$HOME/.local/bin"
APP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/512x512/apps"
SYSTEMD_DIR="$HOME/.config/systemd/user"
DAEMON_DIR="$HOME/.local/share/presenced/daemon"

APP_NAME="presenced-popup-niri"
APP_ID="io.niruss.presenced-popup-niri"
OLD_APP_ID="io.niruss.niri-sync-discord"

# 1. Create directories
mkdir -p "$BIN_DIR" "$APP_DIR" "$ICON_DIR" "$SYSTEMD_DIR" "$DAEMON_DIR"

# 2. Build
echo "Building daemon and packages..."
(cd "$REPO_DIR" && pnpm build)

echo "Building Tauri popup..."
(cd "$REPO_DIR" && pnpm --filter @presenced/popup tauri build)

# 3. Install popup binary
echo "Installing $APP_NAME to $BIN_DIR/..."
cp -f "$REPO_DIR/apps/popup/src-tauri/target/release/presenced-popup" "$BIN_DIR/$APP_NAME"
chmod +x "$BIN_DIR/$APP_NAME"
ln -sf "$BIN_DIR/$APP_NAME" "$BIN_DIR/presenced-popup"

# 4. Install daemon
echo "Installing daemon to $DAEMON_DIR/..."
cp -rf "$REPO_DIR/apps/daemon/dist" "$DAEMON_DIR/"
cp -f "$REPO_DIR/apps/daemon/package.json" "$DAEMON_DIR/"

# 5. Create CLI wrapper
NODE_BIN="$(which node)"
cat > "$BIN_DIR/presenced" << CLIEOF
#!/usr/bin/env bash
exec "$NODE_BIN" "$DAEMON_DIR/dist/main.js" "\$@"
CLIEOF
chmod +x "$BIN_DIR/presenced"

# 6. Install desktop entry
echo "Installing desktop entry..."
sed "s|io\.niruss\.niri-sync-discord|$APP_ID|g; s|Niri Sync Discord|presenced-popup Niri Discord Sync|g" \
  "$REPO_DIR/systemd/io.niruss.niri-sync-discord.desktop" > "$APP_DIR/$APP_ID.desktop"

if [ -f "$REPO_DIR/apps/popup/src-tauri/icons/icon.png" ]; then
  cp -f "$REPO_DIR/apps/popup/src-tauri/icons/icon.png" "$ICON_DIR/$APP_ID.png"
fi

rm -f "$APP_DIR/$OLD_APP_ID.desktop" "$ICON_DIR/$OLD_APP_ID.png"

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$APP_DIR" || true
fi

# 7. Install systemd service
echo "Configuring systemd user service..."
cat > "$SYSTEMD_DIR/presenced.service" << SVCEOF
[Unit]
Description=presenced - Niri Wayland Discord Sync Companion
Documentation=https://github.com/NirussVn0/niri-sync-discord
PartOf=graphical-session.target
After=graphical-session.target

[Service]
Type=simple
ExecStart=$NODE_BIN $DAEMON_DIR/dist/main.js
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
SVCEOF

systemctl --user daemon-reload

echo ""
echo "======================================================"
echo " Installation Complete!"
echo "======================================================"
echo ""
echo " Installed:"
echo "   Binary:  $BIN_DIR/$APP_NAME"
echo "   CLI:     $BIN_DIR/presenced"
echo "   Desktop: $APP_DIR/$APP_ID.desktop"
echo ""
echo " Start daemon:"
echo "   systemctl --user enable --now presenced.service"
echo ""
echo " Run popup:"
echo "   $APP_NAME"
echo ""
echo " Add to ~/.config/niri/config.kdl:"
echo ""
echo '   binds {'
echo "       Mod+P { spawn \"$APP_NAME\"; }"
echo '   }'
echo ""
echo '   window-rule {'
echo '       match app-id="^io\.niruss\.presenced-popup-niri$"'
echo '       open-floating true'
echo '       default-floating-position center'
echo '   }'
echo "======================================================"
