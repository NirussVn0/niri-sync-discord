/**
 * Widget Registry — defines all available dashboard widgets.
 * Each widget has a default visibility, sort order, and config schema.
 */
export type WidgetId =
  | "header"
  | "music"
  | "rpc"
  | "pomodoro"
  | "countdown"
  | "lyrics"
  | "system"
  | "connection";

export interface WidgetDef {
  id: WidgetId;
  label: string;
  icon: string;
  defaultVisible: boolean;
  sortOrder: number;
  /** Minimum height in px */
  minHeight: number;
  /** Whether this widget can be toggled off */
  toggleable: boolean;
}

export const WIDGET_REGISTRY: WidgetDef[] = [
  { id: "header", label: "Header", icon: "Clock", defaultVisible: true, sortOrder: 0, minHeight: 48, toggleable: false },
  { id: "music", label: "Music Player", icon: "Music", defaultVisible: true, sortOrder: 1, minHeight: 120, toggleable: true },
  { id: "rpc", label: "Discord RPC", icon: "MessageSquare", defaultVisible: true, sortOrder: 2, minHeight: 64, toggleable: true },
  { id: "pomodoro", label: "Pomodoro", icon: "Timer", defaultVisible: true, sortOrder: 3, minHeight: 72, toggleable: true },
  { id: "countdown", label: "Countdown", icon: "CalendarClock", defaultVisible: false, sortOrder: 4, minHeight: 56, toggleable: true },
  { id: "lyrics", label: "Lyrics Sync", icon: "Mic2", defaultVisible: true, sortOrder: 5, minHeight: 80, toggleable: true },
  { id: "system", label: "System Monitor", icon: "Cpu", defaultVisible: false, sortOrder: 6, minHeight: 56, toggleable: true },
  { id: "connection", label: "Connection Health", icon: "Wifi", defaultVisible: true, sortOrder: 7, minHeight: 40, toggleable: true },
];

export function getWidgetDef(id: WidgetId): WidgetDef {
  return WIDGET_REGISTRY.find((w) => w.id === id) ?? WIDGET_REGISTRY[0]!;
}

export function getVisibleWidgets(config: Record<WidgetId, boolean>): WidgetDef[] {
  return WIDGET_REGISTRY
    .filter((w) => config[w.id] ?? w.defaultVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getDefaultWidgetConfig(): Record<WidgetId, boolean> {
  const config: Record<string, boolean> = {};
  for (const w of WIDGET_REGISTRY) {
    config[w.id] = w.defaultVisible;
  }
  return config as Record<WidgetId, boolean>;
}
