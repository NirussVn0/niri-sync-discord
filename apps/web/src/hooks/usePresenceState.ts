import { useState, useEffect, useCallback, useRef } from "react";
import {
  PresenceSnapshot,
  DaemonEvent,
  ActivityCategory,
} from "@presenced/contracts";

const API_BASE = "http://127.0.0.1:4242";
const WS_URL = "ws://127.0.0.1:4242/api/events";

export function usePresenceState() {
  const [snapshot, setSnapshot] = useState<PresenceSnapshot | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial snapshot via HTTP
  const fetchSnapshot = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/state`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: PresenceSnapshot = await res.json();
      setSnapshot(data);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Daemon unreachable (${msg})`);
    }
  }, []);

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
          } else if (daemonEvent.type === "presence.resolved") {
            setSnapshot((prev) =>
              prev ? { ...prev, presence: daemonEvent.payload, updatedAt: Date.now() } : null
            );
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
        // Reconnect after delay
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

  const setOverride = async (payload: {
    title: string;
    category: ActivityCategory;
    details?: string;
    durationSeconds?: number;
  }) => {
    try {
      const res = await fetch(`${API_BASE}/api/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  return {
    snapshot,
    wsConnected,
    error,
    setPrivacyMode,
    setOverride,
    clearOverride,
    refresh: fetchSnapshot,
  };
}
