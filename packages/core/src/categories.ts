import { ActivityCategory } from "@presenced/contracts";

export interface KnownAppMetadata {
  displayName: string;
  category: ActivityCategory;
}

const KNOWN_APPS: Record<string, KnownAppMetadata> = {
  // Editors & IDEs
  "code": { displayName: "Visual Studio Code", category: "coding" },
  "code-oss": { displayName: "Code - OSS", category: "coding" },
  "vscodium": { displayName: "VSCodium", category: "coding" },
  "cursor": { displayName: "Cursor", category: "coding" },
  "zed": { displayName: "Zed", category: "coding" },
  "sublime_text": { displayName: "Sublime Text", category: "coding" },
  "neovim": { displayName: "Neovim", category: "coding" },
  "nvim": { displayName: "Neovim", category: "coding" },
  "emacs": { displayName: "Emacs", category: "coding" },
  "jetbrains-idea": { displayName: "IntelliJ IDEA", category: "coding" },
  "jetbrains-webstorm": { displayName: "WebStorm", category: "coding" },
  "jetbrains-pycharm": { displayName: "PyCharm", category: "coding" },
  "jetbrains-rustrover": { displayName: "RustRover", category: "coding" },
  "jetbrains-goland": { displayName: "GoLand", category: "coding" },
  "jetbrains-clion": { displayName: "CLion", category: "coding" },
  "dev.zed.Zed": { displayName: "Zed", category: "coding" },
  "com.visualstudio.code": { displayName: "Visual Studio Code", category: "coding" },

  // Terminals
  "alacritty": { displayName: "Alacritty", category: "terminal" },
  "kitty": { displayName: "Kitty", category: "terminal" },
  "foot": { displayName: "Foot", category: "terminal" },
  "footclient": { displayName: "Foot", category: "terminal" },
  "wezterm": { displayName: "WezTerm", category: "terminal" },
  "org.wezfurlong.wezterm": { displayName: "WezTerm", category: "terminal" },
  "ghostty": { displayName: "Ghostty", category: "terminal" },
  "com.mitchellh.ghostty": { displayName: "Ghostty", category: "terminal" },
  "gnome-terminal": { displayName: "GNOME Terminal", category: "terminal" },
  "org.gnome.Terminal": { displayName: "GNOME Terminal", category: "terminal" },
  "kitty-terminal": { displayName: "Kitty", category: "terminal" },

  // Browsers
  "firefox": { displayName: "Firefox", category: "browser" },
  "org.mozilla.firefox": { displayName: "Firefox", category: "browser" },
  "zen": { displayName: "Zen Browser", category: "browser" },
  "app.zen_browser.zen": { displayName: "Zen Browser", category: "browser" },
  "chromium": { displayName: "Chromium", category: "browser" },
  "org.chromium.Chromium": { displayName: "Chromium", category: "browser" },
  "google-chrome": { displayName: "Google Chrome", category: "browser" },
  "com.google.Chrome": { displayName: "Google Chrome", category: "browser" },
  "brave-browser": { displayName: "Brave", category: "browser" },
  "com.brave.Browser": { displayName: "Brave", category: "browser" },
  "vivaldi": { displayName: "Vivaldi", category: "browser" },
  "com.vivaldi.Vivaldi": { displayName: "Vivaldi", category: "browser" },

  // Recording & Streaming
  "obs": { displayName: "OBS Studio", category: "recording" },
  "com.obsproject.Studio": { displayName: "OBS Studio", category: "recording" },
  "kdenlive": { displayName: "Kdenlive", category: "video" },
  "org.kde.kdenlive": { displayName: "Kdenlive", category: "video" },

  // Gaming
  "steam": { displayName: "Steam", category: "gaming" },
  "com.valvesoftware.Steam": { displayName: "Steam", category: "gaming" },
  "lutris": { displayName: "Lutris", category: "gaming" },
  "net.lutris.Lutris": { displayName: "Lutris", category: "gaming" },
  "heroic": { displayName: "Heroic Games Launcher", category: "gaming" },
  "com.heroicgameslauncher.hgl": { displayName: "Heroic Games Launcher", category: "gaming" },
  "prism-launcher": { displayName: "Prism Launcher", category: "gaming" },
  "org.prismlauncher.PrismLauncher": { displayName: "Prism Launcher", category: "gaming" },
  "minecraft": { displayName: "Minecraft", category: "gaming" },

  // Media
  "spotify": { displayName: "Spotify", category: "music" },
  "com.spotify.Client": { displayName: "Spotify", category: "music" },
  "vlc": { displayName: "VLC media player", category: "video" },
  "org.videolan.vlc": { displayName: "VLC", category: "video" },
  "mpv": { displayName: "mpv", category: "video" },
  "io.mpv.Mpv": { displayName: "mpv", category: "video" },
};

/**
 * Infer the category of an application from its appId.
 */
export function inferAppCategory(appId: string): ActivityCategory {
  const normalized = appId.toLowerCase().trim();
  const known = KNOWN_APPS[normalized];
  if (known) {
    return known.category;
  }

  // Substring / pattern matching heuristics
  if (
    normalized.includes("terminal") ||
    normalized.includes("term") ||
    normalized.endsWith("term") ||
    normalized.includes("console")
  ) {
    return "terminal";
  }
  if (
    normalized.includes("code") ||
    normalized.includes("edit") ||
    normalized.includes("ide") ||
    normalized.includes("nvim") ||
    normalized.includes("vim")
  ) {
    return "coding";
  }
  if (
    normalized.includes("browser") ||
    normalized.includes("firefox") ||
    normalized.includes("chrome") ||
    normalized.includes("web")
  ) {
    return "browser";
  }
  if (
    normalized.includes("game") ||
    normalized.includes("steam") ||
    normalized.includes("launcher") ||
    normalized.includes("minecraft")
  ) {
    return "gaming";
  }
  if (
    normalized.includes("music") ||
    normalized.includes("spotify") ||
    normalized.includes("audio")
  ) {
    return "music";
  }
  if (
    normalized.includes("video") ||
    normalized.includes("player") ||
    normalized.includes("mpv") ||
    normalized.includes("vlc")
  ) {
    return "video";
  }
  if (normalized.includes("obs") || normalized.includes("record")) {
    return "recording";
  }

  return "generic";
}

/**
 * Format a human-readable display name from an appId.
 */
export function formatAppDisplayName(appId: string): string {
  const normalized = appId.toLowerCase().trim();
  const known = KNOWN_APPS[normalized];
  if (known) {
    return known.displayName;
  }

  // Handle reverse-DNS identifiers (e.g. "org.gnome.Nautilus" -> "Nautilus")
  const parts = appId.split(".");
  const lastPart = parts[parts.length - 1];
  if (lastPart && lastPart.length > 0) {
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
  }

  return appId.charAt(0).toUpperCase() + appId.slice(1);
}
