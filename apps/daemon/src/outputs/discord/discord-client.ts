import { EventEmitter } from "node:events";
import * as net from "node:net";
import * as fs from "node:fs";
import * as path from "node:path";
import { IntegrationHealth } from "@presenced/contracts";
import { DiscordOpcode, DiscordActivity, DEFAULT_DISCORD_CLIENT_ID } from "./discord-types.js";
import { DiscordFraming } from "./discord-framing.js";

export interface DiscordRpcClientOptions {
  clientId?: string;
  autoReconnect?: boolean;
  initialBackoffMs?: number;
  maxBackoffMs?: number;
  connectFn?: (socketPath: string) => net.Socket;
}

export class DiscordRpcClient extends EventEmitter {
  private socket: net.Socket | null = null;
  private running = false;
  private isReady = false;
  private currentHealth: IntegrationHealth = {
    source: "discord",
    status: "disconnected",
  };
  private buffer = Buffer.alloc(0);
  private backoffMs: number;
  private readonly initialBackoffMs: number;
  private readonly maxBackoffMs: number;
  private readonly clientId: string;
  private readonly autoReconnect: boolean;
  private readonly connectFn: (socketPath: string) => net.Socket;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(options: DiscordRpcClientOptions = {}) {
    super();
    this.clientId = options.clientId ?? DEFAULT_DISCORD_CLIENT_ID;
    this.autoReconnect = options.autoReconnect ?? true;
    this.initialBackoffMs = options.initialBackoffMs ?? 2000;
    this.maxBackoffMs = options.maxBackoffMs ?? 30000;
    this.backoffMs = this.initialBackoffMs;
    this.connectFn = options.connectFn ?? ((sockPath) => net.createConnection(sockPath));
  }

  public getHealth(): IntegrationHealth {
    return this.currentHealth;
  }

  public isConnected(): boolean {
    return this.isReady && this.socket !== null;
  }

  private setHealth(status: IntegrationHealth["status"], details?: string, error?: string): void {
    this.currentHealth = {
      source: "discord",
      status,
      lastEventAt: status === "connected" ? Date.now() : this.currentHealth.lastEventAt,
      ...(details ? { details } : {}),
      ...(error ? { error } : {}),
    };
    this.emit("health", this.currentHealth);
  }

  public static findIpcSocketPath(): string | null {
    const runtimeDir = process.env.XDG_RUNTIME_DIR;
    const tempDir = process.env.TMPDIR || "/tmp";

    const searchDirs = [runtimeDir, tempDir, "/tmp"].filter((d): d is string => Boolean(d));

    for (const dir of searchDirs) {
      for (let i = 0; i < 10; i++) {
        const candidate = path.join(dir, `discord-ipc-${i}`);
        try {
          if (fs.existsSync(candidate)) {
            return candidate;
          }
        } catch {
          // ignore permission errors in inaccessible paths
        }
      }
    }

    return null;
  }

  public start(): void {
    if (this.running) return;
    this.running = true;
    this.connect();
  }

  public stop(): void {
    this.running = false;
    this.isReady = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    this.buffer = Buffer.alloc(0);
    this.setHealth("disconnected", "Discord RPC output stopped");
  }

  private connect(): void {
    if (!this.running) return;

    const socketPath = DiscordRpcClient.findIpcSocketPath();
    if (!socketPath) {
      this.setHealth("reconnecting", "Discord IPC socket not found (is Discord running?)");
      this.scheduleReconnect();
      return;
    }

    try {
      this.socket = this.connectFn(socketPath);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.setHealth("reconnecting", "Failed to connect to Discord IPC", errorMsg);
      this.scheduleReconnect();
      return;
    }

    this.socket.on("connect", () => {
      this.sendHandshake();
    });

    this.socket.on("data", (chunk: Buffer | string) => {
      const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      this.buffer = Buffer.concat([this.buffer, bufferChunk]);
      const { frames, remaining } = DiscordFraming.decodeFrames(this.buffer);
      this.buffer = Buffer.from(remaining);

      for (const frame of frames) {
        this.handleFrame(frame.opcode, frame.data);
      }
    });

    this.socket.on("error", (err) => {
      this.isReady = false;
      this.setHealth("reconnecting", "Discord socket error", err.message);
    });

    this.socket.on("close", () => {
      this.isReady = false;
      if (this.running) {
        this.setHealth("reconnecting", "Discord socket closed");
        this.scheduleReconnect();
      }
    });
  }

  private sendHandshake(): void {
    if (!this.socket) return;
    const handshakePayload = {
      v: 1,
      client_id: this.clientId,
    };
    const frame = DiscordFraming.encodeFrame(DiscordOpcode.HANDSHAKE, handshakePayload);
    this.socket.write(frame);
  }

  private handleFrame(opcode: number, data: unknown): void {
    if (opcode === DiscordOpcode.PING) {
      if (this.socket) {
        const pong = DiscordFraming.encodeFrame(DiscordOpcode.PONG, data);
        this.socket.write(pong);
      }
      return;
    }

    if (opcode === DiscordOpcode.CLOSE) {
      this.isReady = false;
      this.setHealth("reconnecting", "Discord closed RPC session");
      return;
    }

    if (opcode === DiscordOpcode.FRAME && typeof data === "object" && data !== null) {
      const msg = data as { evt?: string; cmd?: string };
      if (msg.evt === "READY") {
        this.isReady = true;
        this.backoffMs = this.initialBackoffMs;
        this.setHealth("connected", "Discord RPC active");
        this.emit("ready");
      }
    }
  }

  public async setActivity(activity: DiscordActivity | null): Promise<void> {
    if (!this.socket || !this.isReady) {
      return;
    }

    const payload = {
      cmd: "SET_ACTIVITY",
      args: {
        pid: process.pid,
        activity,
      },
      nonce: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };

    const frame = DiscordFraming.encodeFrame(DiscordOpcode.FRAME, payload);
    return new Promise<void>((resolve, reject) => {
      this.socket?.write(frame, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private scheduleReconnect(): void {
    if (!this.running || !this.autoReconnect) return;
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.backoffMs = Math.min(this.backoffMs * 1.5, this.maxBackoffMs);
      this.connect();
    }, this.backoffMs);
  }
}
