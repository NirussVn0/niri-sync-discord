import { ResolvedPresence } from "@presenced/contracts";
import { sanitizeText } from "@presenced/core";
import { DiscordActivity } from "./discord-types.js";

function ensureMinLength(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const trimmed = text.trim();
  if (trimmed.length === 0) return undefined;
  if (trimmed.length === 1) return trimmed + " ";
  return trimmed;
}

/**
 * Maps a ResolvedPresence into a safe Discord Rich Presence Activity payload.
 */
export function mapPresenceToDiscordActivity(
  presence: ResolvedPresence | null
): DiscordActivity | null {
  if (!presence) {
    return null;
  }

  let details: string | undefined;
  let state: string | undefined;

  if (presence.category === "music") {
    // Music layout: Details = Song Title, State = Artist (or Album)
    details = sanitizeText(presence.title, { maxLength: 128 });
    if (presence.details) {
      state = sanitizeText(presence.details, { maxLength: 128 });
    } else if (presence.state) {
      state = sanitizeText(presence.state, { maxLength: 128 });
    }
  } else if (presence.category === "privacy") {
    details = "Privacy Mode";
    state = undefined;
  } else {
    // Desktop / other layout
    details = sanitizeText(presence.title, { maxLength: 128 });
    if (presence.details) {
      state = sanitizeText(presence.details, { maxLength: 128 });
    } else if (presence.state) {
      state = sanitizeText(presence.state, { maxLength: 128 });
    }
  }

  details = ensureMinLength(details);
  state = ensureMinLength(state);

  const activity: DiscordActivity = {
    details,
    state,
    instance: false,
  };

  if (presence.timestamps) {
    activity.timestamps = {
      ...(presence.timestamps.start !== undefined
        ? { start: Math.floor(presence.timestamps.start / 1000) }
        : {}),
      ...(presence.timestamps.end !== undefined
        ? { end: Math.floor(presence.timestamps.end / 1000) }
        : {}),
    };
  }

  if (presence.assets) {
    activity.assets = {
      ...(presence.assets.largeImage ? { large_image: presence.assets.largeImage } : {}),
      ...(presence.assets.largeText ? { large_text: sanitizeText(presence.assets.largeText, { maxLength: 128 }) } : {}),
      ...(presence.assets.smallImage ? { small_image: presence.assets.smallImage } : {}),
      ...(presence.assets.smallText ? { small_text: sanitizeText(presence.assets.smallText, { maxLength: 128 }) } : {}),
    };
  }

  return activity;
}
