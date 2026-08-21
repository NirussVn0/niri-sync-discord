/**
 * useWidgetConfig — manages widget visibility + per-widget settings.
 * Persists to localStorage. Supports advanced config per widget.
 */
import { useState, useEffect, useCallback } from "react";
import { WidgetId, getDefaultWidgetConfig } from "../lib/widget-registry.js";

const STORAGE_KEY = "presenced-widget-config";
const SETTINGS_KEY = "presenced-widget-settings";

export interface WidgetSettings {
  [key: string]: any;
}

export interface WidgetConfigState {
  visibility: Record<WidgetId, boolean>;
  settings: Record<WidgetId, WidgetSettings>;
  isExpanded: boolean;
  editMode: boolean;
}

const DEFAULT_SETTINGS: Record<WidgetId, WidgetSettings> = {
  header: {},
  music: { showWaveform: true, showVinyl: true, compact: false },
  rpc: { showClientId: true },
  pomodoro: { defaultDuration: 25, showDots: true },
  countdown: { showHours: true },
  lyrics: { maxLines: 3 },
  system: { showBattery: true, showUptime: true },
  connection: {},
};

export function useWidgetConfig() {
  const [visibility, setVisibility] = useState<Record<WidgetId, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return getDefaultWidgetConfig();
  });

  const [settings, setSettings] = useState<Record<WidgetId, WidgetSettings>>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibility));
  }, [visibility]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const toggleWidget = useCallback((id: WidgetId) => {
    setVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const setWidgetVisible = useCallback((id: WidgetId, visible: boolean) => {
    setVisibility((prev) => ({ ...prev, [id]: visible }));
  }, []);

  const updateWidgetSetting = useCallback((id: WidgetId, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), [key]: value },
    }));
  }, []);

  const expandSettings = useCallback(() => setIsExpanded(true), []);
  const collapseSettings = useCallback(() => setIsExpanded(false), []);
  const toggleSettings = useCallback(() => setIsExpanded((prev) => !prev), []);
  const toggleEditMode = useCallback(() => setEditMode((prev) => !prev), []);

  return {
    visibility,
    settings,
    isExpanded,
    editMode,
    toggleWidget,
    setWidgetVisible,
    updateWidgetSetting,
    expandSettings,
    collapseSettings,
    toggleSettings,
    toggleEditMode,
  };
}
