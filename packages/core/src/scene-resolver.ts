import {
  SceneType,
  DesktopFact,
  MediaFact,
  PomodoroFact,
  CountdownFact,
  SystemFact,
  ManualOverride,
} from "@presenced/contracts";

export interface SceneResolutionInput {
  manualSceneType?: SceneType;
  privacyMode?: boolean;
  override?: ManualOverride | null;
  desktop?: DesktopFact | null;
  media?: MediaFact | null;
  pomodoro?: PomodoroFact | null;
  countdown?: CountdownFact | null;
  system?: SystemFact | null;
}

export interface ResolvedScene {
  type: SceneType;
  id: string;
  name: string;
  templateId: string;
  reason: string;
  isAuto: boolean;
}

export class SceneResolver {
  public resolve(input: SceneResolutionInput): ResolvedScene {
    // 1. Privacy Mode has highest priority
    if (input.privacyMode) {
      return {
        type: "privacy",
        id: "scene-privacy",
        name: "Privacy Mode",
        templateId: "tpl-privacy",
        reason: "Privacy mode active",
        isAuto: false,
      };
    }

    // 2. Explicit manual scene override
    if (input.manualSceneType && input.manualSceneType !== "auto") {
      return {
        type: input.manualSceneType,
        id: `scene-${input.manualSceneType}`,
        name: `${input.manualSceneType.charAt(0).toUpperCase()}${input.manualSceneType.slice(1)} Scene`,
        templateId: `tpl-${input.manualSceneType}`,
        reason: `Manually locked to ${input.manualSceneType} scene`,
        isAuto: false,
      };
    }

    // 3. Auto Scene Resolution based on incoming domain facts

    // 3a. Manual override text
    if (input.override) {
      return {
        type: "focus",
        id: "scene-focus",
        name: "Manual Focus",
        templateId: "tpl-focus",
        reason: `Manual override: ${input.override.title}`,
        isAuto: true,
      };
    }

    // 3b. Pomodoro running
    if (input.pomodoro && input.pomodoro.status === "running") {
      return {
        type: "pomodoro",
        id: "scene-pomodoro",
        name: "Pomodoro Session",
        templateId: "tpl-pomodoro",
        reason: `Pomodoro ${input.pomodoro.mode} session active`,
        isAuto: true,
      };
    }

    // 3c. Active Media playback
    if (input.media && input.media.playback === "playing") {
      return {
        type: "music",
        id: "scene-music",
        name: "Music & Lyrics",
        templateId: "tpl-music",
        reason: `Playing on ${input.media.player}: ${input.media.title}`,
        isAuto: true,
      };
    }

    // 3d. Desktop Activity (coding / gaming / general)
    if (input.desktop && input.desktop.appId) {
      return {
        type: "focus",
        id: "scene-focus",
        name: "Desktop Activity",
        templateId: "tpl-focus",
        reason: `Focused on ${input.desktop.appId}`,
        isAuto: true,
      };
    }

    // 3e. Countdown active
    if (input.countdown && input.countdown.activeCountdown?.showOnDiscord) {
      return {
        type: "countdown",
        id: "scene-countdown",
        name: "Milestone Countdown",
        templateId: "tpl-countdown",
        reason: `Countdown: ${input.countdown.activeCountdown.title}`,
        isAuto: true,
      };
    }

    // Default fallback
    return {
      type: "auto",
      id: "scene-auto",
      name: "Auto Desktop",
      templateId: "tpl-default",
      reason: "Default auto desktop scene",
      isAuto: true,
    };
  }
}
