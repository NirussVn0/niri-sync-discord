import {
  ActivityCandidate,
  DesktopFact,
  MediaFact,
  ManualOverride,
  PresenceRules,
  ActivityCategory,
} from "@presenced/contracts";
import { inferAppCategory, formatAppDisplayName } from "./categories.js";
import { isSensitiveApp, sanitizeText } from "./sanitizer.js";

/**
 * Builds an ActivityCandidate from a DesktopFact based on configured rules.
 */
export function buildDesktopCandidate(
  fact: DesktopFact,
  rules: PresenceRules
): ActivityCandidate | null {
  const appId = fact.appId.trim();
  if (!appId) {
    return null;
  }

  const appRule = rules.appRules[appId];

  // If explicitly hidden by user rule
  if (appRule?.hide) {
    return null;
  }

  const category: ActivityCategory = appRule?.category ?? inferAppCategory(appId);
  const basePriority = rules.priorities[category] ?? 10;
  const boost = appRule?.priorityBoost ?? 0;
  const priority = basePriority + boost;

  let title = formatAppDisplayName(appId);
  if (appRule?.customTitle) {
    title = sanitizeText(appRule.customTitle);
  }

  let details: string | undefined;
  let state: string | undefined;
  let privacy: "safe" | "sanitized" | "private" = "safe";

  // Window title privacy: only include if explicitly allowed by user rule
  if (
    appRule?.allowSanitizedTitle &&
    fact.rawTitle &&
    !isSensitiveApp(appId)
  ) {
    const sanitizedTitle = sanitizeText(fact.rawTitle);
    if (sanitizedTitle) {
      details = sanitizedTitle;
      privacy = "sanitized";
    }
  }

  return {
    id: `desktop:${appId}`,
    category,
    priority,
    title,
    details,
    state,
    source: "niri",
    privacy,
    rawConfidence: 1,
  };
}

/**
 * Builds an ActivityCandidate from a MediaFact.
 */
export function buildMediaCandidate(
  fact: MediaFact,
  rules: PresenceRules
): ActivityCandidate | null {
  if (fact.playback === "stopped") {
    return null;
  }

  const isVideoPlayer =
    fact.player.toLowerCase().includes("vlc") ||
    fact.player.toLowerCase().includes("mpv") ||
    fact.player.toLowerCase().includes("kdenlive");

  const category: ActivityCategory = isVideoPlayer ? "video" : "music";
  const basePriority = rules.priorities[category] ?? 80;

  // Paused playback drops priority by 30 so active work wins over paused music
  const playbackPenalty = fact.playback === "playing" ? 0 : -30;
  const priority = Math.max(0, basePriority + playbackPenalty);

  const title = fact.title ? sanitizeText(fact.title) : "Unknown Media";
  const details = fact.artist ? sanitizeText(fact.artist) : undefined;
  const state = fact.playback === "playing"
    ? (fact.album ? sanitizeText(fact.album) : undefined)
    : "Paused";

  let timestamps: { start?: number; end?: number } | undefined;
  if (fact.playback === "playing" && fact.positionAnchorMs !== undefined && fact.durationMs) {
    const now = Date.now();
    const start = now - fact.positionAnchorMs;
    const end = start + fact.durationMs;
    timestamps = { start, end };
  }

  return {
    id: `media:${fact.player}`,
    category,
    priority,
    title,
    details,
    state,
    timestamps,
    assets: fact.artUrl ? { largeImage: fact.artUrl, largeText: fact.album } : undefined,
    source: `mpris:${fact.player}`,
    privacy: "safe",
    rawConfidence: 1,
  };
}

/**
 * Builds an ActivityCandidate from a ManualOverride.
 */
export function buildManualCandidate(
  override: ManualOverride,
  rules: PresenceRules,
  now: number
): ActivityCandidate | null {
  if (override.expiresAt && override.expiresAt <= now) {
    return null;
  }

  const priority = rules.priorities.manual ?? 100;

  return {
    id: `manual:${override.id}`,
    category: override.category,
    priority,
    title: sanitizeText(override.title),
    details: override.details ? sanitizeText(override.details) : undefined,
    state: override.state ? sanitizeText(override.state) : undefined,
    source: "manual",
    privacy: "safe",
    rawConfidence: 1,
  };
}

/**
 * Builds a Privacy Candidate when privacy mode is active.
 */
export function buildPrivacyCandidate(rules: PresenceRules): ActivityCandidate {
  const priority = rules.priorities.privacy ?? 95;

  return {
    id: "privacy:active",
    category: "privacy",
    priority,
    title: "Privacy Mode",
    details: undefined,
    state: undefined,
    source: "privacy",
    privacy: "private",
    rawConfidence: 1,
  };
}
