use tauri::Manager;

#[cfg(target_os = "linux")]
use std::{process::Command, thread, time::Duration};

#[cfg(target_os = "linux")]
fn find_niri_window_id(payload: &[u8], pid: u32) -> Option<u64> {
    let windows = serde_json::from_slice::<Vec<serde_json::Value>>(payload).ok()?;
    windows.into_iter().find_map(|window| {
        let window_pid = window.get("pid")?.as_u64()?;
        (window_pid == u64::from(pid))
            .then(|| window.get("id")?.as_u64())
            .flatten()
    })
}

#[cfg(target_os = "linux")]
fn center_window_on_niri(window: tauri::WebviewWindow) {
    let pid = std::process::id();
    thread::spawn(move || {
        for _ in 0..40 {
            if let Ok(output) = Command::new("niri")
                .args(["msg", "--json", "windows"])
                .output()
            {
                if output.status.success() {
                    if let Some(window_id) = find_niri_window_id(&output.stdout, pid) {
                        // Niri exposes the window before WebKit finishes its opening configure.
                        // Let that settle, enforce dashboard size, then re-center through the
                        // bounded opening-animation window so late configures cannot win.
                        thread::sleep(Duration::from_millis(1000));
                        let _ = window.set_size(tauri::LogicalSize::new(720.0, 420.0));
                        thread::sleep(Duration::from_millis(200));
                        let window_id = window_id.to_string();
                        let mut centered = false;
                        for _ in 0..8 {
                            centered |= Command::new("niri")
                                .args(["msg", "action", "center-window", "--id", &window_id])
                                .status()
                                .is_ok_and(|status| status.success());
                            thread::sleep(Duration::from_millis(500));
                        }
                        eprintln!(
                            "presenced-popup: Niri startup placement for window {window_id}: {centered}"
                        );
                        return;
                    }
                }
            }
            thread::sleep(Duration::from_millis(50));
        }
    });
}

#[cfg(not(target_os = "linux"))]
fn center_window_on_niri(_window: tauri::WebviewWindow) {}

#[tauri::command]
fn minimize_window(window: tauri::WebviewWindow) {
    let _ = window.minimize();
}

#[tauri::command]
fn toggle_maximize(window: tauri::WebviewWindow) {
    if window.is_maximized().unwrap_or(false) {
        let _ = window.unmaximize();
    } else {
        let _ = window.maximize();
    }
}

#[tauri::command]
fn close_window(window: tauri::WebviewWindow) {
    let _ = window.close();
}

#[tauri::command]
fn toggle_visibility(window: tauri::WebviewWindow) {
    if window.is_visible().unwrap_or(false) {
        let _ = window.hide();
    } else {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            minimize_window,
            toggle_maximize,
            close_window,
            toggle_visibility,
        ])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.set_decorations(false)?;
            center_window_on_niri(window.clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running presenced-popup application");
}

#[cfg(all(test, target_os = "linux"))]
mod tests {
    use super::find_niri_window_id;

    #[test]
    fn finds_window_id_for_current_process() {
        let payload = br#"[
            {"id": 97, "pid": 1234, "app_id": "other"},
            {"id": 98, "pid": 308745, "app_id": "presenced-popup-niri"}
        ]"#;

        assert_eq!(find_niri_window_id(payload, 308745), Some(98));
        assert_eq!(find_niri_window_id(payload, 999999), None);
    }

    #[test]
    fn ignores_invalid_niri_payloads() {
        assert_eq!(find_niri_window_id(b"not-json", 308745), None);
    }
}
