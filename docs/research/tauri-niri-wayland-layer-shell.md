# Research Spike: Tauri v2 + Native Wayland + Niri + Layer Shell

**Date:** 2026-08-20  
**Target Environment:** Linux 6.13 (CachyOS/Arch), Niri Compositor, Wayland (`wayland-1`), Dual-Monitor (`HDMI-A-3` 1920x1080@100Hz, `DP-4` 1920x1080@60Hz).  
**Evaluated Toolchain:** Tauri v2, WebKit2GTK 4.1 (`javascriptcoregtk-4.1`, `webkit2gtk-4.1`), `gtk-layer-shell-0` (0.8.2).

---

## 1. Runtime Environment Verification

```text
$ echo "WAYLAND_DISPLAY=$WAYLAND_DISPLAY"
WAYLAND_DISPLAY=wayland-1

$ echo "XDG_SESSION_TYPE=$XDG_SESSION_TYPE"
XDG_SESSION_TYPE=wayland

$ echo "XDG_CURRENT_DESKTOP=$XDG_CURRENT_DESKTOP"
XDG_CURRENT_DESKTOP=niri

$ pkg-config --modversion gtk-layer-shell-0 webkit2gtk-4.1
gtk-layer-shell-0: 0.8.2
webkit2gtk-4.1: 2.46.5
```

The system is running natively under Wayland with Niri managing active outputs and workspaces via Unix domain IPC (`niri msg --json outputs` and `niri msg --json workspaces`).

---

## 2. Technical Spike Findings

### 2.1 Native Wayland vs XWayland
- Under Tauri v2 with WebKitGTK 4.1, setting `GDK_BACKEND=wayland,x11` allows the Tauri window to initialize directly as a native Wayland client without invoking XWayland.
- Tauri's window handle on Linux provides direct access to the underlying `gtk::ApplicationWindow` / `gtk::Window`.

### 2.2 Layer-Shell Integration Mechanism
- **Crate / Library**: `gtk-layer-shell` (`libgtk-layer-shell.so.0`) is installed on the system and natively supported by Niri.
- **Initialization**:
  1. Call `gtk_layer_shell::init_for_window(&gtk_window)` before mapping or during window setup.
  2. Set namespace: `gtk_layer_shell::set_namespace(&gtk_window, "niri-sync-discord")`.
  3. Configure Layer: `gtk_layer_shell::set_layer(&gtk_window, Layer::Top)`.
  4. Configure Anchors & Margins:
     - Anchor Top: `gtk_layer_shell::set_anchor(&gtk_window, Edge::Top, true)`
     - Anchor Right: `gtk_layer_shell::set_anchor(&gtk_window, Edge::Right, true)`
     - Margins: Top = `16px`, Right = `16px`
  5. Keyboard Interactivity: `gtk_layer_shell::set_keyboard_interactivity(&gtk_window, KeyboardInteractivity::OnDemand)`.
  6. Monitor Alignment: `gtk_layer_shell::set_monitor(&gtk_window, target_gdk_monitor)` aligned with Niri's `focused-output`.

### 2.3 Layer Policy Decisions
- **Default Popup Mode**: `Layer::Top`. Sits above regular tiled windows and bars without interfering with full-screen games unless explicitly summoned.
- **Fullscreen Policy**: When the active output contains a fullscreen window, the popup either honors `Top` or allows configurable dismissal upon overview/game focus.
- **Overview State**: When Niri enters Overview (`WorkspaceOverviewChanged` or `is_active`), the popup listens to the event stream via `NiriShellAdapter` and toggles visibility gracefully without destroying webview DOM state.

### 2.4 Focus Semantics & Context Protection
- When the layer-shell popup requests keyboard focus (`KeyboardInteractivity::OnDemand`), Niri emits `WindowFocusChanged { id: null }` for tiled windows.
- **Context Protection Rule**: `PresenceStore` and `SceneResolver` must treat the popup's own application ID (`io.niruss.niri-sync-discord` / layer surface `niri-sync-discord`) as transparent overlay focus, preserving the last non-empty desktop activity (e.g. `Coding` remains `Coding` rather than degrading to `Idle`).

### 2.5 Normal Window Fallback
If `gtk-layer-shell` is unavailable or fails initialization (e.g. when run under an unsupported compositor or pure X11), `PopupSurfaceAdapter` falls back to an ordinary floating Tauri window with:
- `app_id: "io.niruss.niri-sync-discord"`
- Dimensions: `width: 390px`, `height: 600px`
- Niri Recommended Rule:
  ```kdl
  window-rule {
      match app-id="io.niruss.niri-sync-discord"
      open-floating true
      default-column-width { fixed 390; }
  }
  ```

---

## 3. Architectural Boundary Confirmation

```text
                      Niri Compositor
                            │
               (JSON stream over Unix socket)
                            ▼
                    NiriShellAdapter
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
      Presence Engine             PopupSurfaceAdapter
(Preserves last active focus)   (Monitors focused output &
                                 handles show/hide/anchor)
                                          │
                                          ▼
                                   Tauri v2 Popup
                              (Top Layer-Shell Surface)
```

The presence engine and popup surface remain decoupled. The popup is a view and control surface; the daemon is the independent state engine.
