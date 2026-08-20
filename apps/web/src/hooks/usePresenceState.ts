import { useState, useEffect, useCallback, useRef } from "react";
import {
  PresenceSnapshot,
  DaemonEvent,
  ActivityCategory,
  ResolvedPresence,
  PresenceRules,
} from "@presenced/contracts";

export type NavTab = "now" | "rules" | "integrations" | "settings" | "history";

export interface HistoryEntry {
  id: string;
  presence: ResolvedPresence;
  timestamp: number;
}

const API_BASE = "http://127.0.0.1:4242";
const WS_URL = "ws://127.0.0.1:4242/api/events";
const HISTORY_STORAGE_KEY = "presenced_activity_history";

export function usePresenceState() {
  const [snapshot, setSnapshot] = useState<PresenceSnapshot | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>("now");
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Save history to localStorage
  const recordHistory = useCallback((presence: ResolvedPresence | null) => {
    if (!presence) return;
    setHistory((prev) => {
      // Don't add duplicate of most recent
      if (prev[0] && prev[0].presence.candidateId === presence.candidateId && prev[0].presence.title === presence.title) {
        return prev;
      }
      const newEntry: HistoryEntry = {
        id: `${presence.candidateId}-${Date.now()}`,
        presence,
        timestamp: Date.now(),
      };
      const updated = [newEntry, ...prev.slice(0, 49)];
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Fetch initial snapshot via HTTP
  const fetchSnapshot = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/state`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: PresenceSnapshot = await res.json();
      setSnapshot(data);
      if (data.presence) {
        recordHistory(data.presence);
      }
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Daemon unreachable (${msg})`);
    }
  }, [recordHistory]);

  // Connect WebSocket for live updates
  const connectWs = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const daemonEvent: DaemonEvent = JSON.parse(event.data);
          if (daemonEvent.type === "state.snapshot") {
            setSnapshot(daemonEvent.payload);
            if (daemonEvent.payload.presence) {
              recordHistory(daemonEvent.payload.presence);
            }
          } else if (daemonEvent.type === "presence.resolved") {
            setSnapshot((prev) =>
              prev ? { ...prev, presence: daemonEvent.payload, updatedAt: Date.now() } : null
            );
            if (daemonEvent.payload) {
              recordHistory(daemonEvent.payload);
            }
          } else if (daemonEvent.type === "source.health.changed") {
            setSnapshot((prev) =>
              prev
                ? {
                    ...prev,
                    health: { ...prev.health, [daemonEvent.payload.source]: daemonEvent.payload },
                    updatedAt: Date.now(),
                  }
                : null
            );
          } else if (daemonEvent.type === "desktop.changed") {
            setSnapshot((prev) =>
              prev ? { ...prev, desktop: daemonEvent.payload, updatedAt: Date.now() } : null
            );
          } else if (daemonEvent.type === "media.changed") {
            setSnapshot((prev) =>
              prev ? { ...prev, media: daemonEvent.payload, updatedAt: Date.now() } : null
            );
          } else if (daemonEvent.type === "lyrics.changed") {
            setSnapshot((prev) =>
              prev ? { ...prev, lyrics: daemonEvent.payload, updatedAt: Date.now() } : null
            );
          } else if (daemonEvent.type === "override.changed") {
            setSnapshot((prev) =>
              prev ? { ...prev, override: daemonEvent.payload, updatedAt: Date.now() } : null
            );
          } else if (daemonEvent.type === "privacy.changed") {
            setSnapshot((prev) =>
              prev ? { ...prev, privacyMode: daemonEvent.payload.enabled, updatedAt: Date.now() } : null
            );
          }
        } catch {
          // ignore malformed ws messages
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        wsRef.current = null;
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connectWs();
          }, 2000);
        }
      };

      ws.onerror = () => {
        setWsConnected(false);
      };
    } catch {
      setWsConnected(false);
    }
  }, [recordHistory]);

  // Keyboard shortcut listener for tab switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === "1") setActiveTab("now");
      else if (e.key === "2") setActiveTab("rules");
      else if (e.key === "3") setActiveTab("integrations");
      else if (e.key === "4") setActiveTab("settings");
      else if (e.key === "5") setActiveTab("history");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    fetchSnapshot();
    connectWs();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchSnapshot, connectWs]);

  // Actions
  const setPrivacyMode = async (enabled: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/api/privacy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (res.ok) {
        const data: PresenceSnapshot = await res.json();
        setSnapshot(data);
      }
    } catch (err: unknown) {
      console.error("Failed to toggle privacy mode:", err);
    }
  };

  const isPaused = Boolean(
    snapshot?.override?.id === "pause-presence" ||
    (snapshot?.presence?.source === "manual" && snapshot?.presence?.title === "Presence Paused")
  );

  const togglePausePresence = async () => {
    if (isPaused) {
      await clearOverride();
    } else {
      await setOverride({
        title: "Presence Paused",
        category: "manual",
        details: "Rich Presence publishing is temporarily paused",
      });
    }
  };

  const setOverride = async (payload: {
    title: string;
    category: ActivityCategory;
    details?: string;
    durationSeconds?: number;
  }) => {
    try {
      const isPause = payload.title === "Presence Paused";
      const res = await fetch(`${API_BASE}/api/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          id: isPause ? "pause-presence" : undefined,
        }),
      });
      if (res.ok) {
        const data: PresenceSnapshot = await res.json();
        setSnapshot(data);
      }
    } catch (err: unknown) {
      console.error("Failed to set override:", err);
    }
  };

  const clearOverride = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/override`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data: PresenceSnapshot = await res.json();
        setSnapshot(data);
      }
    } catch (err: unknown) {
      console.error("Failed to clear override:", err);
    }
  };

  const getRules = async (): Promise<PresenceRules | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/rules`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.error("Failed to get rules:", err);
    }
    return null;
  };

  const updateRules = async (rules: unknown): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/rules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rules),
      });
      if (res.ok) {
        const updatedRules = await res.json();
        setSnapshot((prev) => (prev ? { ...prev, rules: updatedRules } : null));
        return true;
      }
    } catch (err) {
      console.error("Failed to update rules:", err);
    }
    return false;
  };

  return {
    snapshot,
    wsConnected,
    error,
    activeTab,
    setActiveTab,
    history,
    clearHistory,
    isPaused,
    togglePausePresence,
    setPrivacyMode,
    setOverride,
    clearOverride,
    getRules,
    updateRules,
    refresh: fetchSnapshot,
  };
}
