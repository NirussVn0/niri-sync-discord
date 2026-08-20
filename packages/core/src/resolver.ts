import {
  ActivityCandidate,
  ResolvedPresence,
  PresenceRules,
  ManualOverride,
  DesktopFact,
  MediaFact,
} from "@presenced/contracts";
import {
  buildDesktopCandidate,
  buildMediaCandidate,
  buildManualCandidate,
  buildPrivacyCandidate,
} from "./candidate-builder.js";

export interface ResolverInput {
  desktop: DesktopFact | null;
  media: MediaFact | null;
  manualOverride: ManualOverride | null;
  privacyMode: boolean;
  rules: PresenceRules;
  currentRevision: number;
  now?: number;
}

export interface ResolverResult {
  presence: ResolvedPresence | null;
  candidates: ActivityCandidate[];
}

/**
 * Pure function that resolves presence from raw inputs and rules.
 */
export function resolvePresence(input: ResolverInput): ResolverResult {
  const now = input.now ?? Date.now();
  const candidates: ActivityCandidate[] = [];

  // 1. Manual Override candidate
  if (input.manualOverride) {
    const manualCandidate = buildManualCandidate(input.manualOverride, input.rules, now);
    if (manualCandidate) {
      candidates.push(manualCandidate);
    }
  }

  // 2. Privacy Mode candidate
  if (input.privacyMode || input.rules.privacyMode) {
    candidates.push(buildPrivacyCandidate(input.rules));
  }

  // 3. Media candidate
  if (input.media) {
    const mediaCandidate = buildMediaCandidate(input.media, input.rules);
    if (mediaCandidate) {
      candidates.push(mediaCandidate);
    }
  }

  // 4. Desktop candidate
  if (input.desktop) {
    const desktopCandidate = buildDesktopCandidate(input.desktop, input.rules);
    if (desktopCandidate) {
      candidates.push(desktopCandidate);
    }
  }

  if (candidates.length === 0) {
    return {
      presence: null,
      candidates: [],
    };
  }

  // Sort candidates by priority descending, then by confidence descending, then by id ascending for determinism
  const sorted = [...candidates].sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    if (b.rawConfidence !== a.rawConfidence) {
      return b.rawConfidence - a.rawConfidence;
    }
    return a.id.localeCompare(b.id);
  });

  const winner = sorted[0];
  if (!winner) {
    return { presence: null, candidates };
  }

  // Build transparent reason
  const runnerUp = sorted[1];
  let reason: string;
  if (winner.category === "manual") {
    reason = `Manual override "${winner.title}" active (priority ${winner.priority})`;
  } else if (winner.category === "privacy") {
    reason = `Privacy mode active (priority ${winner.priority})`;
  } else if (runnerUp) {
    reason = `${winner.title} (${winner.category}, priority ${winner.priority}) won over ${runnerUp.title} (${runnerUp.category}, priority ${runnerUp.priority})`;
  } else {
    reason = `${winner.title} active (${winner.category}, priority ${winner.priority})`;
  }

  const resolved: ResolvedPresence = {
    revision: input.currentRevision + 1,
    candidateId: winner.id,
    category: winner.category,
    title: winner.title,
    ...(winner.details !== undefined ? { details: winner.details } : {}),
    ...(winner.state !== undefined ? { state: winner.state } : {}),
    ...(winner.timestamps !== undefined ? { timestamps: winner.timestamps } : {}),
    ...(winner.assets !== undefined ? { assets: winner.assets } : {}),
    source: winner.source,
    reason,
    resolvedAt: now,
  };

  return {
    presence: resolved,
    candidates: sorted,
  };
}
