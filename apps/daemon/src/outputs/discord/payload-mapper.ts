import { ResolvedPresence, RpcTemplate, TemplateVariables } from "@presenced/contracts";
import { sanitizeText, TemplateEngine } from "@presenced/core";
import { DiscordActivity } from "./discord-types.js";

function ensureMinLength(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const trimmed = text.trim();
  if (trimmed.length === 0) return undefined;
  if (trimmed.length === 1) return trimmed + " ";
  return trimmed;
}

const templateEngine = new TemplateEngine();

/**
 * Maps a ResolvedPresence into a safe Discord Rich Presence Activity payload,
 * optionally applying an active RpcTemplate.
 */
export function mapPresenceToDiscordActivity(
  presence: ResolvedPresence | null,
  options: {
    template?: RpcTemplate | undefined;
    variables?: TemplateVariables | undefined;
  } = {}
): DiscordActivity | null {
  if (!presence) {
    return null;
  }

  let details: string | undefined;
  let state: string | undefined;

  if (options.template && options.variables) {
    const rendered = templateEngine.renderTemplate(options.template, options.variables);
    details = sanitizeText(rendered.details, { maxLength: 128 });
    if (rendered.state) {
      state = sanitizeText(rendered.state, { maxLength: 128 });
    }
  } else if (presence.category === "music") {
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
      ...(presence.assets.largeText
        ? { large_text: sanitizeText(presence.assets.largeText, { maxLength: 128 }) }
        : {}),
      ...(presence.assets.smallImage ? { small_image: presence.assets.smallImage } : {}),
      ...(presence.assets.smallText
        ? { small_text: sanitizeText(presence.assets.smallText, { maxLength: 128 }) }
        : {}),
    };
  }

  return activity;
}
