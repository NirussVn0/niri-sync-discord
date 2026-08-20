import { useState, useEffect, useCallback, useRef } from "react";
import {
  PresenceSnapshot,
  DaemonEvent,
  DaemonEventSchema,
  ActivityCategory,
  SceneType,
  CountdownCategory,
} from "@presenced/contracts";

const API_HTTP_URL = "http://127.0.0.1:4242/api";
const API_WS_URL = "ws://127.0.0.1:4242/api/events";

export interface UsePresenceCompanionReturn {
  snapshot: PresenceSnapshot | null;
  wsConnected: boolean;
  error: string | null;
  setPrivacyMode: (enabled: boolean) => Promise<void>;
  setOverride: (payload: {
    title: string;
    category: ActivityCategory;
    details?: string;
    durationSeconds?: number;
  }) => Promise<void>;
  clearOverride: () => Promise<void>;
  switchScene: (sceneType: SceneType) => Promise<void>;
  startPomodoro: (taskName?: string, durationMinutes?: number) => Promise<void>;
  pausePomodoro: () => Promise<void>;
  resumePomodoro: () => Promise<void>;
  stopPomodoro: () => Promise<void>;
  skipPomodoro: () => Promise<void>;
  playPauseMedia: () => Promise<void>;
  nextMedia: () => Promise<void>;
  previousMedia: () => Promise<void>;
  addCountdown: (item: {
    title: string;
    targetDate: string;
    category?: CountdownCategory;
    showOnDiscord?: boolean;
  }) => Promise<void>;
  deleteCountdown: (id: string) => Promise<void>;
  toggleCountdown: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePresenceCompanion(): UsePresenceCompanionReturn {
  const [snapshot, setSnapshot] = useState<PresenceSnapshot | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchInitialState = useCallback(async () => {
    try {
      const res = await fetch(`${API_HTTP_URL}/state`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = (await res.json()) as PresenceSnapshot;
      setSnapshot(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch state");
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    try {
      const ws = new WebSocket(API_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        setError(null);
        fetchInitialState();
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const validated = DaemonEventSchema.safeParse(parsed);
          if (!validated.success) return;

          const daemonEvent: DaemonEvent = validated.data;
          const now = Date.now();

          switch (daemonEvent.type) {
            case "state.snapshot":
              setSnapshot(daemonEvent.payload);
              break;
            case "presence.resolved":
              setSnapshot((prev) =>
                prev ? { ...prev, presence: daemonEvent.payload, updatedAt: now } : prev
              );
              break;
            case "desktop.changed":
              setSnapshot((prev) =>
                prev ? { ...prev, desktop: daemonEvent.payload, updatedAt: now } : prev
              );
              break;
            case "media.changed":
              setSnapshot((prev) =>
                prev ? { ...prev, media: daemonEvent.payload, updatedAt: now } : prev
              );
              break;
            case "lyrics.changed":
              setSnapshot((prev) =>
                prev ? { ...prev, lyrics: daemonEvent.payload, updatedAt: now } : prev
              );
              break;
            case "override.changed":
              setSnapshot((prev) =>
                prev ? { ...prev, override: daemonEvent.payload, updatedAt: now } : prev
              );
              break;
            case "privacy.changed":
              setSnapshot((prev) =>
                prev
                  ? {
                      ...prev,
                      privacyMode: daemonEvent.payload.enabled,
                      updatedAt: now,
                    }
                  : prev
              );
              break;
            case "source.health.changed":
              setSnapshot((prev) =>
                prev
                  ? {
                      ...prev,
                      health: {
                        ...prev.health,
                        [daemonEvent.payload.source]: daemonEvent.payload,
                      },
                      updatedAt: now,
                    }
                  : prev
              );
              break;
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        wsRef.current = null;
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 2000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      setWsConnected(false);
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 2000);
    }
  }, [fetchInitialState]);

  useEffect(() => {
    fetchInitialState();
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [fetchInitialState, connectWebSocket]);

  const setPrivacyMode = async (enabled: boolean) => {
    try {
      await fetch(`${API_HTTP_URL}/privacy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      setSnapshot((prev) => (prev ? { ...prev, privacyMode: enabled } : prev));
    } catch {
      // ignore
    }
  };

  const setOverride = async (payload: {
    title: string;
    category: ActivityCategory;
    details?: string;
    durationSeconds?: number;
  }) => {
    try {
      await fetch(`${API_HTTP_URL}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await fetchInitialState();
    } catch {
      // ignore
    }
  };

  const clearOverride = async () => {
    try {
      await fetch(`${API_HTTP_URL}/override`, { method: "DELETE" });
      await fetchInitialState();
    } catch {
      // ignore
    }
  };

  const switchScene = async (sceneType: SceneType) => {
    // Optimistically update local snapshot
    setSnapshot((prev) =>
      prev
        ? {
            ...prev,
            scene: {
              ...prev.scene,
              activeSceneType: sceneType,
              activeSceneId: sceneType,
              isAuto: sceneType === "auto",
              scenes: prev.scene?.scenes ?? [],
              updatedAt: Date.now(),
            },
          }
        : prev
    );

    try {
      const res = await fetch(`${API_HTTP_URL}/scene`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneType }),
      });
      if (res.ok) {
        const snap = (await res.json()) as PresenceSnapshot;
        setSnapshot(snap);
      }
    } catch {
      // ignore
    }
  };

  const startPomodoro = async (taskName?: string, durationMinutes?: number) => {
    try {
      await fetch(`${API_HTTP_URL}/pomodoro/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskName, durationMinutes }),
      });
    } catch {
      // ignore
    }
  };

  const pausePomodoro = async () => {
    try {
      await fetch(`${API_HTTP_URL}/pomodoro/pause`, { method: "POST" });
    } catch {
      // ignore
    }
  };

  const resumePomodoro = async () => {
    try {
      await fetch(`${API_HTTP_URL}/pomodoro/resume`, { method: "POST" });
    } catch {
      // ignore
    }
  };

  const stopPomodoro = async () => {
    try {
      await fetch(`${API_HTTP_URL}/pomodoro/stop`, { method: "POST" });
    } catch {
      // ignore
    }
  };

  const skipPomodoro = async () => {
    try {
      await fetch(`${API_HTTP_URL}/pomodoro/skip`, { method: "POST" });
    } catch {
      // ignore
    }
  };

  const playPauseMedia = async () => {
    try {
      await fetch(`${API_HTTP_URL}/media/play-pause`, { method: "POST" });
    } catch {
      // ignore
    }
  };

  const nextMedia = async () => {
    try {
      await fetch(`${API_HTTP_URL}/media/next`, { method: "POST" });
    } catch {
      // ignore
    }
  };

  const previousMedia = async () => {
    try {
      await fetch(`${API_HTTP_URL}/media/previous`, { method: "POST" });
    } catch {
      // ignore
    }
  };

  const addCountdown = async (item: {
    title: string;
    targetDate: string;
    category?: CountdownCategory;
    showOnDiscord?: boolean;
  }) => {
    try {
      await fetch(`${API_HTTP_URL}/countdowns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      await fetchInitialState();
    } catch {
      // ignore
    }
  };

  const deleteCountdown = async (id: string) => {
    try {
      await fetch(`${API_HTTP_URL}/countdowns/${id}`, { method: "DELETE" });
      await fetchInitialState();
    } catch {
      // ignore
    }
  };

  const toggleCountdown = async (id: string) => {
    try {
      await fetch(`${API_HTTP_URL}/countdowns/${id}/toggle`, { method: "POST" });
      await fetchInitialState();
    } catch {
      // ignore
    }
  };

  return {
    snapshot,
    wsConnected,
    error,
    setPrivacyMode,
    setOverride,
    clearOverride,
    switchScene,
    startPomodoro,
    pausePomodoro,
    resumePomodoro,
    stopPomodoro,
    skipPomodoro,
    playPauseMedia,
    nextMedia,
    previousMedia,
    addCountdown,
    deleteCountdown,
    toggleCountdown,
    refresh: fetchInitialState,
  };
}
