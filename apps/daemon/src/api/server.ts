import { Hono } from "hono";
import { cors } from "hono/cors";
import { WebSocketServer, WebSocket } from "ws";
import { Server as HttpServer } from "node:http";
import { serve } from "@hono/node-server";
import {
  PresenceSnapshot,
  ManualOverride,
  ManualOverrideSchema,
  PresenceRulesSchema,
  DaemonEvent,
} from "@presenced/contracts";
import { PresenceStore } from "../state/presence-store.js";

export interface ApiServerOptions {
  port?: number;
  host?: string;
  store: PresenceStore;
}

export class ApiServer {
  private server: HttpServer | null = null;
  private wss: WebSocketServer | null = null;
  private readonly store: PresenceStore;
  private readonly port: number;
  private readonly host: string;
  private readonly app: Hono;
  private unsubscribeStore: (() => void) | null = null;

  constructor(options: ApiServerOptions) {
    this.store = options.store;
    this.port = options.port ?? 4242;
    this.host = options.host ?? "127.0.0.1";
    this.app = new Hono();

    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Allow loopback web frontend
    this.app.use(
      "/*",
      cors({
        origin: (origin) => {
          if (!origin) return "*";
          if (
            origin.startsWith("http://localhost:") ||
            origin.startsWith("http://127.0.0.1:") ||
            origin.startsWith("http://[::1]:")
          ) {
            return origin;
          }
          return null;
        },
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type"],
      })
    );

    // Health endpoint
    this.app.get("/api/health", (c) => {
      return c.json({
        status: "ok",
        health: this.store.getHealth(),
        uptime: process.uptime(),
      });
    });

    // State snapshot endpoint
    this.app.get("/api/state", (c) => {
      return c.json<PresenceSnapshot>(this.store.getSnapshot());
    });

    // Manual override endpoints
    this.app.post("/api/override", async (c) => {
      try {
        const body = await c.req.json();
        const expiresAt = body.durationSeconds
          ? Date.now() + body.durationSeconds * 1000
          : body.expiresAt;

        const override: ManualOverride = {
          id: `override-${Date.now()}`,
          category: body.category ?? "manual",
          title: body.title,
          details: body.details,
          state: body.state,
          expiresAt,
          createdAt: Date.now(),
        };

        const parsed = ManualOverrideSchema.safeParse(override);
        if (!parsed.success) {
          return c.json({ error: "Invalid override payload", details: parsed.error }, 400);
        }

        this.store.setManualOverride(parsed.data);
        return c.json(this.store.getSnapshot());
      } catch {
        return c.json({ error: "Invalid JSON" }, 400);
      }
    });

    this.app.delete("/api/override", (c) => {
      this.store.setManualOverride(null);
      return c.json(this.store.getSnapshot());
    });

    // Privacy mode toggle
    this.app.post("/api/privacy", async (c) => {
      try {
        const body = await c.req.json();
        const enabled = Boolean(body.enabled);
        this.store.setPrivacyMode(enabled);
        return c.json(this.store.getSnapshot());
      } catch {
        return c.json({ error: "Invalid JSON" }, 400);
      }
    });

    // Rules endpoints
    this.app.get("/api/rules", (c) => {
      return c.json(this.store.getRules());
    });

    this.app.put("/api/rules", async (c) => {
      try {
        const body = await c.req.json();
        const parsed = PresenceRulesSchema.safeParse(body);
        if (!parsed.success) {
          return c.json({ error: "Invalid rules payload", details: parsed.error }, 400);
        }
        this.store.setRules(parsed.data);
        return c.json(this.store.getRules());
      } catch {
        return c.json({ error: "Invalid JSON" }, 400);
      }
    });
  }

  public async start(): Promise<void> {
    return new Promise((resolve) => {
      const server = serve(
        {
          fetch: this.app.fetch,
          port: this.port,
          hostname: this.host,
        },
        () => {
          resolve();
        }
      ) as HttpServer;

      this.server = server;
      this.initWebSocket(server);
      this.subscribeStore();
    });
  }

  private initWebSocket(server: HttpServer): void {
    this.wss = new WebSocketServer({
      server,
      path: "/api/events",
    });

    this.wss.on("connection", (ws: WebSocket) => {
      // Send initial snapshot
      const initialEvent: DaemonEvent = {
        type: "state.snapshot",
        payload: this.store.getSnapshot(),
      };
      ws.send(JSON.stringify(initialEvent));

      ws.on("message", (message) => {
        try {
          const parsed = JSON.parse(message.toString());
          if (parsed.type === "ping") {
            ws.send(JSON.stringify({ type: "pong", id: parsed.id }));
          }
        } catch {
          // ignore
        }
      });
    });
  }

  private subscribeStore(): void {
    const onStoreEvent = (event: DaemonEvent) => {
      if (!this.wss) return;
      const data = JSON.stringify(event);
      for (const client of this.wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
          try {
            client.send(data);
          } catch {
            // ignore
          }
        }
      }
    };

    this.store.on("event", onStoreEvent);
    this.unsubscribeStore = () => {
      this.store.off("event", onStoreEvent);
    };
  }

  public async stop(): Promise<void> {
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
    if (this.wss) {
      for (const client of this.wss.clients) {
        client.close();
      }
      this.wss.close();
      this.wss = null;
    }
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server?.close(() => resolve());
      });
      this.server = null;
    }
  }

  public getPort(): number {
    if (this.server) {
      const addr = this.server.address();
      if (addr && typeof addr === "object") {
        return addr.port;
      }
    }
    return this.port;
  }

  public getApp(): Hono {
    return this.app;
  }
}
