/**
 * useWidgetConfig — manages widget visibility and settings state.
 * Persists to localStorage.
 */
import { useState, useEffect, useCallback } from "react";
import { WidgetId, getDefaultWidgetConfig } from "../lib/widget-registry.js";

const STORAGE_KEY = "presenced-widget-config";

export interface WidgetConfigState {
  visibility: Record<WidgetId, boolean>;
  isExpanded: boolean;
}

export function useWidgetConfig() {
  const [visibility, setVisibility] = useState<Record<WidgetId, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return getDefaultWidgetConfig();
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibility));
  }, [visibility]);

  const toggleWidget = useCallback((id: WidgetId) => {
    setVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const setWidgetVisible = useCallback((id: WidgetId, visible: boolean) => {
    setVisibility((prev) => ({ ...prev, [id]: visible }));
  }, []);

  const expandSettings = useCallback(() => setIsExpanded(true), []);
  const collapseSettings = useCallback(() => setIsExpanded(false), []);
  const toggleSettings = useCallback(() => setIsExpanded((prev) => !prev), []);

  return {
    visibility,
    isExpanded,
    toggleWidget,
    setWidgetVisible,
    expandSettings,
    collapseSettings,
    toggleSettings,
  };
}
