/**
 * Sanitizes text to be safe for display and Discord publication.
 */

const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F-\u009F]/g;
const MULTIPLE_WHITESPACE_REGEX = /\s+/g;
const POTENTIAL_SECRET_REGEX = /(?:bearer\s+[a-zA-Z0-9_\-\.]{16,}|ghp_[a-zA-Z0-9]{36}|xox[baprs]-[a-zA-Z0-9_\-]{10,}|(?:api[_\-\s]?key|secret|token|password)[\s:=]+[^\s]{8,})/i;
const FILE_PATH_REGEX = /(?:\/(?:home|etc|var|usr|root|tmp)\/[^\s:]+|[a-zA-Z]:\\[^\s:]+)/i;

export interface SanitizeOptions {
  maxLength?: number;
  allowPaths?: boolean;
}

export function sanitizeText(text: string | undefined | null, options: SanitizeOptions = {}): string {
  if (!text) {
    return "";
  }

  const maxLength = options.maxLength ?? 128;

  // Strip control characters
  let cleaned = text.replace(CONTROL_CHARS_REGEX, "");

  // Collapse whitespace
  cleaned = cleaned.replace(MULTIPLE_WHITESPACE_REGEX, " ").trim();

  // Check for secrets
  if (POTENTIAL_SECRET_REGEX.test(cleaned)) {
    return "[Redacted Secret]";
  }

  // Sanitize paths if not allowed
  if (!options.allowPaths && FILE_PATH_REGEX.test(cleaned)) {
    cleaned = cleaned.replace(FILE_PATH_REGEX, "[Path]");
  }

  // Cap length cleanly at character boundary
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength - 1).trimEnd() + "…";
  }

  return cleaned;
}

/**
 * Check if an app ID represents a sensitive application where titles must never be exposed.
 */
const SENSITIVE_APP_IDS = new Set([
  "1password",
  "bitwarden",
  "keepassxc",
  "org.keepassxc.keepassxc",
  "_bitwarden",
  "com.bitwarden.desktop",
  "tor-browser",
  "org.torproject.torbrowser",
]);

export function isSensitiveApp(appId: string): boolean {
  const normalized = appId.toLowerCase().trim();
  if (SENSITIVE_APP_IDS.has(normalized)) {
    return true;
  }
  if (
    normalized.includes("password") ||
    normalized.includes("vault") ||
    normalized.includes("keepass") ||
    normalized.includes("tor-browser")
  ) {
    return true;
  }
  return false;
}
