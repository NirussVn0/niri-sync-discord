import { RpcTemplate } from "@presenced/contracts";

export const DEFAULT_TEMPLATES: Record<string, RpcTemplate> = {
  "tpl-default": {
    id: "tpl-default",
    name: "Default Dynamic",
    detailsTemplate: "{activity}",
    stateTemplate: "{details}",
    isBuiltin: true,
  },
  "tpl-music": {
    id: "tpl-music",
    name: "Music & Lyrics",
    detailsTemplate: "{track} — {artist}",
    stateTemplate: "{lyric}",
    isBuiltin: true,
  },
  "tpl-pomodoro": {
    id: "tpl-pomodoro",
    name: "Pomodoro Focus",
    detailsTemplate: "Pomodoro — {pomodoro.task}",
    stateTemplate: "{pomodoro.remaining} left • Session {pomodoro.session}",
    isBuiltin: true,
  },
  "tpl-countdown": {
    id: "tpl-countdown",
    name: "Milestone Countdown",
    detailsTemplate: "Counting down to {countdown.name}",
    stateTemplate: "{countdown.days} days remaining",
    isBuiltin: true,
  },
  "tpl-system": {
    id: "tpl-system",
    name: "System Telemetry",
    detailsTemplate: "CPU {system.cpu} • RAM {system.ram}",
    stateTemplate: "{time} • {date}",
    isBuiltin: true,
  },
  "tpl-privacy": {
    id: "tpl-privacy",
    name: "Privacy Mode",
    detailsTemplate: "Privacy Mode",
    stateTemplate: undefined,
    isBuiltin: true,
  },
  "tpl-focus": {
    id: "tpl-focus",
    name: "Focus Mode",
    detailsTemplate: "Focus — {activity}",
    stateTemplate: "{project}",
    isBuiltin: true,
  },
};
